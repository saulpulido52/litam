// src/modules/admin/admin.controller.ts
import { Request, Response, NextFunction } from 'express';
import adminService from '../../modules/admin/admin.service';
import { AppError } from '../../utils/app.error';
import {
    AdminUpdateUserDto,
    AdminVerifyNutritionistDto,
    AdminUpdateUserSubscriptionDto,
    AdminUpdateSettingsDto, // Si se añade
} from '../../modules/admin/admin.dto';
import { RoleName } from '../../database/entities/role.entity';
import { SubscriptionStatus } from '../../database/entities/user_subscription.entity'; // Para tipo en query param
import { PatientNutritionistRelation } from '../../database/entities/patient_nutritionist_relation.entity';
import { RelationshipStatus } from '../../database/entities/patient_nutritionist_relation.entity';

class AdminController {
    // --- Gestión de Usuarios ---

    public async getAllUsers(req: Request, res: Response, next: NextFunction) {
        try {
            // Los query params llegan como string, AdminUpdateUserDto los validará si se usa.
            const role = req.query.role as RoleName | undefined;
            const isActive = req.query.isActive === 'true' ? true : req.query.isActive === 'false' ? false : undefined;
            const page = parseInt(req.query.page as string || '1', 10);
            const limit = parseInt(req.query.limit as string || '20', 10);

            const result = await adminService.getAllUsers(role, isActive, page, limit);
            res.status(200).json({
                status: 'success',
                ...result, // users, total, page, limit, totalPages
            });
        } catch (error: any) {
            console.error('Error en AdminController.getAllUsers:', error);
            if (error instanceof AppError) {
                return next(error);
            }
            next(new AppError('Error al obtener todos los usuarios.', 500));
        }
    }

    public async getUserById(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            const user = await adminService.getUserById(id);
            res.status(200).json({
                status: 'success',
                data: { user },
            });
        } catch (error: any) {
            console.error('Error en AdminController.getUserById:', error);
            if (error instanceof AppError) {
                return next(error);
            }
            next(new AppError('Error al obtener el usuario.', 500));
        }
    }

    public async adminUpdateUser(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            const updatedUser = await adminService.adminUpdateUser(id, req.body as AdminUpdateUserDto);
            res.status(200).json({
                status: 'success',
                message: 'Usuario actualizado exitosamente.',
                data: { user: updatedUser },
            });
        } catch (error: any) {
            console.error('Error en AdminController.adminUpdateUser:', error);
            if (error instanceof AppError) {
                return next(error);
            }
            next(new AppError('Error al actualizar el usuario.', 500));
        }
    }

    public async adminDeleteUser(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            await adminService.adminDeleteUser(id);
            res.status(204).json({
                status: 'success',
                data: null,
            });
        } catch (error: any) {
            console.error('Error en AdminController.adminDeleteUser:', error);
            if (error instanceof AppError) {
                return next(error);
            }
            next(new AppError('Error al eliminar el usuario.', 500));
        }
    }

    public async adminVerifyNutritionist(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params; // ID del nutriólogo a verificar
            const result = await adminService.adminVerifyNutritionist(id, req.body as AdminVerifyNutritionistDto);
            res.status(200).json({
                status: 'success',
                message: result.message,
            });
        } catch (error: any) {
            console.error('Error en AdminController.adminVerifyNutritionist:', error);
            if (error instanceof AppError) {
                return next(error);
            }
            next(new AppError('Error al verificar el nutriólogo.', 500));
        }
    }

    // --- Gestión de Suscripciones de Usuario (por Admin) ---

    public async getAllUserSubscriptions(req: Request, res: Response, next: NextFunction) {
        try {
            const status = req.query.status as SubscriptionStatus | undefined;
            const page = parseInt(req.query.page as string || '1', 10);
            const limit = parseInt(req.query.limit as string || '20', 10);

            const result = await adminService.getAllUserSubscriptions(status, page, limit);
            res.status(200).json({
                status: 'success',
                ...result, // subscriptions, total, page, limit, totalPages
            });
        } catch (error: any) {
            console.error('Error en AdminController.getAllUserSubscriptions:', error);
            if (error instanceof AppError) {
                return next(error);
            }
            next(new AppError('Error al obtener todas las suscripciones de usuarios.', 500));
        }
    }

    public async adminUpdateUserSubscription(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params; // ID de la UserSubscription
            const updatedSubscription = await adminService.adminUpdateUserSubscription(id, req.body as AdminUpdateUserSubscriptionDto);
            res.status(200).json({
                status: 'success',
                message: 'Suscripción de usuario actualizada exitosamente por admin.',
                data: { subscription: updatedSubscription },
            });
        } catch (error: any) {
            console.error('Error en AdminController.adminUpdateUserSubscription:', error);
            if (error instanceof AppError) {
                return next(error);
            }
            next(new AppError('Error al actualizar la suscripción de usuario por admin.', 500));
        }
    }

    public async adminDeleteUserSubscription(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params; // ID de la UserSubscription
            await adminService.adminDeleteUserSubscription(id);
            res.status(204).json({
                status: 'success',
                data: null,
            });
        } catch (error: any) {
            console.error('Error en AdminController.adminDeleteUserSubscription:', error);
            if (error instanceof AppError) {
                return next(error);
            }
            next(new AppError('Error al eliminar la suscripción de usuario por admin.', 500));
        }
    }

    // --- Gestión de Configuraciones (ej. para la IA, general) ---
    // Esto es un placeholder; la implementación real dependería del tipo de configuración.
    public async updateGeneralSettings(req: Request, res: Response, next: NextFunction) {
        try {
            // const settings = await adminService.updateSettings(req.body as AdminUpdateSettingsDto);
            res.status(200).json({
                status: 'success',
                message: 'Configuración general actualizada (simulado).',
                data: req.body,
            });
        } catch (error: any) {
            console.error('Error en AdminController.updateGeneralSettings:', error);
            if (error instanceof AppError) {
                return next(error);
            }
            next(new AppError('Error al actualizar la configuración general.', 500));
        }
    }

    // --- HERRAMIENTAS DE INTEGRIDAD DE DATOS ---
    
    public async getSystemHealth(req: Request, res: Response, next: NextFunction) {
        try {
            const healthData = await adminService.getSystemHealth();
            res.status(200).json({
                status: 'success',
                data: healthData,
            });
        } catch (error: any) {
            console.error('Error en AdminController.getSystemHealth:', error);
            if (error instanceof AppError) {
                return next(error);
            }
            next(new AppError('Error al obtener métricas de salud del sistema.', 500));
        }
    }

    public async diagnosisDataIntegrity(req: Request, res: Response, next: NextFunction) {
        try {
            const diagnosis = await adminService.diagnosisDataIntegrity();
            res.status(200).json({
                status: 'success',
                message: 'Diagnóstico de integridad de datos completado.',
                data: diagnosis,
            });
        } catch (error: any) {
            console.error('Error en AdminController.diagnosisDataIntegrity:', error);
            if (error instanceof AppError) {
                return next(error);
            }
            next(new AppError('Error al ejecutar diagnóstico de integridad de datos.', 500));
        }
    }

    public async repairDataIntegrity(req: Request, res: Response, next: NextFunction) {
        try {
            // Obtener el parámetro dryRun de la query (por defecto true para seguridad)
            const dryRun = req.query.dryRun !== 'false'; // Solo se ejecuta si explícitamente se pasa dryRun=false
            
            const repairResult = await adminService.repairDataIntegrity(dryRun);
            res.status(200).json({
                status: 'success',
                message: repairResult.message,
                data: repairResult,
            });
        } catch (error: any) {
            console.error('Error en AdminController.repairDataIntegrity:', error);
            if (error instanceof AppError) {
                return next(error);
            }
            next(new AppError('Error al ejecutar reparación de integridad de datos.', 500));
        }
    }

    /**
     * Obtiene el registro de eliminaciones de pacientes y relaciones para auditoría
     * Solo accesible por administradores
     */
    public async getEliminaciones(req: Request, res: Response, next: NextFunction) {
        try {
            const fechaDesde = req.query.fechaDesde as string | undefined;
            const fechaHasta = req.query.fechaHasta as string | undefined;
            const nutriologoId = req.query.nutriologoId as string | undefined;
            const pacienteId = req.query.pacienteId as string | undefined;
            const page = parseInt(req.query.page as string || '1', 10);
            const limit = parseInt(req.query.limit as string || '50', 10);

            const queryBuilder = adminService.getEliminaciones(fechaDesde, fechaHasta, nutriologoId, pacienteId, page, limit);

            const eliminaciones = await queryBuilder.getManyAndCount();

            // Estadísticas adicionales
            const stats = await adminService.getEliminacionesStats();

            res.status(200).json({
                status: 'success',
                data: {
                    eliminaciones: eliminaciones[0].map(rel => ({
                        id: rel.id,
                        patient: {
                            id: rel.patient.id,
                            name: `${rel.patient.first_name} ${rel.patient.last_name}`,
                            email: rel.patient.email
                        },
                        nutritionist: {
                            id: rel.nutritionist.id,
                            name: `${rel.nutritionist.first_name} ${rel.nutritionist.last_name}`,
                            email: rel.nutritionist.email
                        },
                        status: rel.status,
                        elimination_reason: rel.elimination_reason,
                        notes: rel.notes,
                        requested_at: rel.requested_at,
                        updated_at: rel.updated_at,
                        created_at: rel.requested_at // Usamos requested_at como created_at
                    })),
                    paginacion: {
                        total: eliminaciones[1],
                        pagina: page,
                        limite: limit,
                        paginas: Math.ceil(eliminaciones[1] / limit)
                    },
                    stats: {
                        total: parseInt(stats.totalEliminaciones) || 0,
                        pacientesUnicos: parseInt(stats.pacientesUnicos) || 0,
                        nutriologosInvolucrados: parseInt(stats.nutriologosInvolucrados) || 0,
                        conMotivo: parseInt(stats.conMotivo) || 0,
                        sinMotivo: parseInt(stats.sinMotivo) || 0
                    }
                }
            });
        } catch (error: any) {
            console.error('Error al obtener eliminaciones:', error);
            if (error instanceof AppError) {
                return next(error);
            }
            next(new AppError('Error al obtener el registro de eliminaciones.', 500));
        }
    }

    /**
     * Exporta el registro de eliminaciones en formato CSV o PDF
     * Solo accesible por administradores
     */
    public async exportEliminaciones(req: Request, res: Response, next: NextFunction) {
        try {
            const fechaDesde = req.query.fechaDesde as string | undefined;
            const fechaHasta = req.query.fechaHasta as string | undefined;
            const nutriologoId = req.query.nutriologoId as string | undefined;
            const pacienteId = req.query.pacienteId as string | undefined;
            const format = req.query.format as 'csv' | 'pdf' | undefined;

            if (!format || !['csv', 'pdf'].includes(format)) {
                return next(new AppError('Formato no soportado. Use "csv" o "pdf"', 400));
            }

            const queryBuilder = adminService.getEliminaciones(
                fechaDesde,
                fechaHasta,
                nutriologoId,
                pacienteId,
                1,
                10000 // Exportar todas las eliminaciones
            );

            const eliminaciones = await queryBuilder.getMany();

            if (format === 'csv') {
                res.setHeader('Content-Type', 'text/csv');
                res.setHeader('Content-Disposition', `attachment; filename=eliminaciones_${new Date().toISOString().split('T')[0]}.csv`);
                
                const csvContent = this.generateCSV(eliminaciones);
                res.send(csvContent);
            } else if (format === 'pdf') {
                res.setHeader('Content-Type', 'application/pdf');
                res.setHeader('Content-Disposition', `attachment; filename=eliminaciones_${new Date().toISOString().split('T')[0]}.pdf`);
                
                const pdfBuffer = await this.generatePDF(eliminaciones);
                res.send(pdfBuffer);
            }
        } catch (error: any) {
            console.error('Error exportando eliminaciones:', error);
            if (error instanceof AppError) {
                return next(error);
            }
            next(new AppError('Error al exportar eliminaciones', 500));
        }
    }

    /**
     * Genera contenido CSV para las eliminaciones
     */
    private generateCSV(eliminaciones: any[]): string {
        const headers = [
            'ID Relación',
            'Paciente ID',
            'Paciente Nombre',
            'Paciente Email',
            'Nutriólogo ID',
            'Nutriólogo Nombre',
            'Nutriólogo Email',
            'Estado',
            'Motivo Eliminación',
            'Notas',
            'Fecha Creación',
            'Fecha Actualización'
        ];

        const rows = eliminaciones.map(elim => [
            elim.id,
            elim.patient.id,
            elim.patient.name,
            elim.patient.email,
            elim.nutritionist.id,
            elim.nutritionist.name,
            elim.nutritionist.email,
            elim.status,
            elim.elimination_reason || '',
            elim.notes || '',
            elim.created_at,
            elim.updated_at
        ]);

        const csvContent = [headers, ...rows]
            .map(row => row.map(cell => `"${cell}"`).join(','))
            .join('\n');

        return csvContent;
    }

    /**
     * Genera PDF para las eliminaciones
     */
    private async generatePDF(eliminaciones: any[]): Promise<Buffer> {
        // Implementación básica - en producción usar una librería como PDFKit
        const content = eliminaciones.map(elim => 
            `${elim.patient.name} (${elim.patient.email}) - ${elim.nutritionist.name} (${elim.nutritionist.email}) - ${elim.status}`
        ).join('\n');
        
        // Por ahora retornamos un buffer simple
        return Buffer.from(content, 'utf-8');
    }
}

export default new AdminController();