// src/modules/nutritionists/nutritionist-registration.controller.ts
import { Request, Response, NextFunction } from 'express';
import { nutritionistRegistrationService } from './nutritionist-registration.service';
import { AppError } from '../../utils/app.error';
import { NutritionistRegistrationDto, NutritionistVerificationDto, DocumentUploadDto, NutritionistSearchDto } from './nutritionist-registration.dto';

class NutritionistRegistrationController {
    
    /**
     * Registro público de nuevos nutriólogos
     * POST /api/nutritionists/register
     */
    public async registerNutritionist(req: Request, res: Response, next: NextFunction) {
        try {
            console.log('🏥 Iniciando registro de nutriólogo:', req.body.email);
            
            const registrationData = req.body as NutritionistRegistrationDto;
            
            const result = await nutritionistRegistrationService.registerNutritionist(registrationData);
            
            console.log(`✅ Nutriólogo registrado exitosamente: ${result.user.email}`);
            
            res.status(201).json({
                success: true,
                message: result.message,
                data: {
                    user: {
                        id: result.user.id,
                        email: result.user.email,
                        first_name: result.user.first_name,
                        last_name: result.user.last_name,
                        is_active: result.user.is_active
                    },
                    profile: {
                        id: result.profile.id,
                        professional_id: result.profile.professional_id,
                        verification_status: result.profile.verification_status,
                        university: result.profile.university,
                        degree_title: result.profile.degree_title
                    },
                    next_steps: [
                        'Subir documentos de validación (cédula profesional, título)',
                        'Esperar verificación por parte de nuestros administradores',
                        'Recibirá un email cuando su cuenta sea aprobada'
                    ]
                }
            });
            
        } catch (error) {
            console.error('💥 Error en registro de nutriólogo:', error);
            if (error instanceof AppError) {
                return next(error);
            }
            next(new AppError('Error interno al registrar nutriólogo', 500));
        }
    }

    /**
     * Subir documentos de validación
     * POST /api/nutritionists/:profileId/documents
     */
    public async uploadDocument(req: Request, res: Response, next: NextFunction) {
        try {
            const { profileId } = req.params;
            const documentData = req.body as DocumentUploadDto;
            
            console.log(`📄 Subiendo documento para perfil ${profileId}: ${documentData.document_type}`);
            
            const profile = await nutritionistRegistrationService.uploadDocument(profileId, documentData);
            
            res.status(200).json({
                success: true,
                message: 'Documento subido exitosamente',
                data: {
                    profile_id: profile.id,
                    document_type: documentData.document_type,
                    uploaded_documents: profile.uploaded_documents
                }
            });
            
        } catch (error) {
            console.error('💥 Error subiendo documento:', error);
            if (error instanceof AppError) {
                return next(error);
            }
            next(new AppError('Error al subir documento', 500));
        }
    }

    // ==================== ENDPOINTS PARA ADMINISTRADORES ====================

    /**
     * Buscar nutriólogos para administración
     * GET /api/admin/nutritionists
     */
    public async searchNutritionists(req: Request, res: Response, next: NextFunction) {
        try {
            if (!req.user || req.user.role.name !== 'admin') {
                return next(new AppError('Acceso denegado. Solo administradores pueden acceder.', 403));
            }
            
            const searchData = req.query as any;
            console.log('🔍 Búsqueda de nutriólogos por admin:', req.user.email);
            
            const result = await nutritionistRegistrationService.searchNutritionists(searchData);
            
            res.status(200).json({
                success: true,
                data: result,
                filters_applied: {
                    search: searchData.search || null,
                    verification_status: searchData.verification_status || null,
                    university: searchData.university || null
                }
            });
            
        } catch (error) {
            console.error('💥 Error en búsqueda de nutriólogos:', error);
            if (error instanceof AppError) {
                return next(error);
            }
            next(new AppError('Error al buscar nutriólogos', 500));
        }
    }

    /**
     * Obtener detalles completos de un nutriólogo para revisión
     * GET /api/admin/nutritionists/:profileId
     */
    public async getNutritionistDetails(req: Request, res: Response, next: NextFunction) {
        try {
            if (!req.user || req.user.role.name !== 'admin') {
                return next(new AppError('Acceso denegado. Solo administradores pueden acceder.', 403));
            }
            
            const { profileId } = req.params;
            
            // Usar el repositorio directamente para obtener todos los detalles
            const { AppDataSource } = await import('../../database/data-source');
            const profileRepository = AppDataSource.getRepository((await import('../../database/entities/nutritionist_profile.entity')).NutritionistProfile);
            
            const profile = await profileRepository.findOne({
                where: { id: profileId },
                relations: ['user', 'user.role']
            });
            
            if (!profile) {
                return next(new AppError('Perfil de nutriólogo no encontrado', 404));
            }
            
            console.log(`👁️ Admin ${req.user.email} revisando perfil: ${profile.professional_id}`);
            
            res.status(200).json({
                success: true,
                data: {
                    user: {
                        id: profile.user.id,
                        email: profile.user.email,
                        first_name: profile.user.first_name,
                        last_name: profile.user.last_name,
                        phone: profile.user.phone,
                        birth_date: profile.user.birth_date,
                        gender: profile.user.gender,
                        is_active: profile.user.is_active,
                        created_at: profile.user.created_at
                    },
                    profile: {
                        id: profile.id,
                        // Validación profesional
                        professional_id: profile.professional_id,
                        professional_id_issuer: profile.professional_id_issuer,
                        university: profile.university,
                        degree_title: profile.degree_title,
                        graduation_date: profile.graduation_date,
                        rfc: profile.rfc,
                        curp: profile.curp,
                        verification_status: profile.verification_status,
                        verification_notes: profile.verification_notes,
                        verified_at: profile.verified_at,
                        uploaded_documents: profile.uploaded_documents,
                        // Información profesional
                        license_number: profile.license_number,
                        specialties: profile.specialties,
                        years_of_experience: profile.years_of_experience,
                        education: profile.education,
                        certifications: profile.certifications,
                        bio: profile.bio,
                        consultation_fee: profile.consultation_fee,
                        // Consultorio
                        clinic_name: profile.clinic_name,
                        clinic_address: profile.clinic_address,
                        clinic_city: profile.clinic_city,
                        clinic_state: profile.clinic_state,
                        offers_in_person: profile.offers_in_person,
                        offers_online: profile.offers_online,
                        created_at: profile.created_at
                    }
                }
            });
            
        } catch (error) {
            console.error('💥 Error obteniendo detalles de nutriólogo:', error);
            if (error instanceof AppError) {
                return next(error);
            }
            next(new AppError('Error al obtener detalles del nutriólogo', 500));
        }
    }

    /**
     * Verificar (aprobar/rechazar) un nutriólogo
     * PUT /api/admin/nutritionists/:profileId/verify
     */
    public async verifyNutritionist(req: Request, res: Response, next: NextFunction) {
        try {
            if (!req.user || req.user.role.name !== 'admin') {
                return next(new AppError('Acceso denegado. Solo administradores pueden verificar nutriólogos.', 403));
            }
            
            const { profileId } = req.params;
            const verificationData = req.body as NutritionistVerificationDto;
            
            console.log(`⚖️ Admin ${req.user.email} verificando perfil ${profileId}: ${verificationData.verification_status}`);
            
            const profile = await nutritionistRegistrationService.verifyNutritionist(
                profileId, 
                verificationData, 
                req.user.id
            );
            
            const actionText = verificationData.verification_status === 'approved' ? 'aprobado' : 
                              verificationData.verification_status === 'rejected' ? 'rechazado' : 'marcado para revisión';
            
            res.status(200).json({
                success: true,
                message: `Nutriólogo ${actionText} exitosamente`,
                data: {
                    profile_id: profile.id,
                    verification_status: profile.verification_status,
                    verification_notes: profile.verification_notes,
                    verified_by: req.user.email,
                    verified_at: profile.verified_at,
                    user_activated: profile.user?.is_active || false
                }
            });
            
        } catch (error) {
            console.error('💥 Error verificando nutriólogo:', error);
            if (error instanceof AppError) {
                return next(error);
            }
            next(new AppError('Error al verificar nutriólogo', 500));
        }
    }

    /**
     * Obtener estadísticas de registros de nutriólogos
     * GET /api/admin/nutritionists/stats
     */
    public async getNutritionistsStats(req: Request, res: Response, next: NextFunction) {
        try {
            if (!req.user || req.user.role.name !== 'admin') {
                return next(new AppError('Acceso denegado. Solo administradores pueden acceder.', 403));
            }
            
            const { AppDataSource } = await import('../../database/data-source');
            const profileRepository = AppDataSource.getRepository((await import('../../database/entities/nutritionist_profile.entity')).NutritionistProfile);
            
            // Obtener estadísticas
            const stats = await profileRepository
                .createQueryBuilder('profile')
                .select([
                    'COUNT(*) as total',
                    'COUNT(CASE WHEN verification_status = \'pending\' THEN 1 END) as pending',
                    'COUNT(CASE WHEN verification_status = \'approved\' THEN 1 END) as approved',
                    'COUNT(CASE WHEN verification_status = \'rejected\' THEN 1 END) as rejected',
                    'COUNT(CASE WHEN verification_status = \'under_review\' THEN 1 END) as under_review',
                    'COUNT(CASE WHEN created_at >= NOW() - INTERVAL \'7 days\' THEN 1 END) as last_week',
                    'COUNT(CASE WHEN created_at >= NOW() - INTERVAL \'30 days\' THEN 1 END) as last_month'
                ])
                .getRawOne();
            
            console.log(`📊 Admin ${req.user.email} consultando estadísticas de nutriólogos`);
            
            res.status(200).json({
                success: true,
                data: {
                    total_registrations: parseInt(stats.total),
                    by_status: {
                        pending: parseInt(stats.pending),
                        approved: parseInt(stats.approved),
                        rejected: parseInt(stats.rejected),
                        under_review: parseInt(stats.under_review)
                    },
                    recent_activity: {
                        last_week: parseInt(stats.last_week),
                        last_month: parseInt(stats.last_month)
                    },
                    generated_at: new Date().toISOString()
                }
            });
            
        } catch (error) {
            console.error('💥 Error obteniendo estadísticas:', error);
            if (error instanceof AppError) {
                return next(error);
            }
            next(new AppError('Error al obtener estadísticas', 500));
        }
    }
}

export const nutritionistRegistrationController = new NutritionistRegistrationController();