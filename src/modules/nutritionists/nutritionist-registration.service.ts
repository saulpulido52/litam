// src/modules/nutritionists/nutritionist-registration.service.ts
import { Repository } from 'typeorm';
import { User, UserRegistrationType } from '../../database/entities/user.entity';
import { NutritionistProfile } from '../../database/entities/nutritionist_profile.entity';
import { Role, RoleName } from '../../database/entities/role.entity';
import { AppError } from '../../utils/app.error';
import { AppDataSource } from '../../database/data-source';
import { NutritionistRegistrationDto, NutritionistVerificationDto, DocumentUploadDto, NutritionistSearchDto } from './nutritionist-registration.dto';
import bcrypt from 'bcrypt';
import { emailService } from '../../services/email.service';

export class NutritionistRegistrationService {
    private userRepository: Repository<User>;
    private nutritionistProfileRepository: Repository<NutritionistProfile>;
    private roleRepository: Repository<Role>;

    constructor() {
        this.userRepository = AppDataSource.getRepository(User);
        this.nutritionistProfileRepository = AppDataSource.getRepository(NutritionistProfile);
        this.roleRepository = AppDataSource.getRepository(Role);
    }

    /**
     * Registra un nuevo nutriólogo con validación completa
     */
    async registerNutritionist(registrationData: NutritionistRegistrationDto): Promise<{
        user: User;
        profile: NutritionistProfile;
        message: string;
    }> {
        // 1. Verificar que el email no esté en uso
        const existingUser = await this.userRepository.findOne({ 
            where: { email: registrationData.email } 
        });
        
        if (existingUser) {
            throw new AppError('Ya existe un usuario registrado con este email', 409);
        }

        // 2. Verificar que la cédula profesional no esté en uso
        const existingProfessionalId = await this.nutritionistProfileRepository.findOne({
            where: { professional_id: registrationData.professional_id }
        });

        if (existingProfessionalId) {
            throw new AppError('Ya existe un nutriólogo registrado con esta cédula profesional', 409);
        }

        // 3. Verificar que el RFC no esté en uso
        const existingRfc = await this.nutritionistProfileRepository.findOne({
            where: { rfc: registrationData.rfc }
        });

        if (existingRfc) {
            throw new AppError('Ya existe un nutriólogo registrado con este RFC', 409);
        }

        // 4. Validar cédula profesional (simulación - en producción usar API oficial)
        const cedulaValidation = await this.validateProfessionalId(registrationData.professional_id);
        if (!cedulaValidation.isValid) {
            throw new AppError(`Cédula profesional inválida: ${cedulaValidation.reason}`, 400);
        }

        // 5. Obtener rol de nutriólogo
        const nutritionistRole = await this.roleRepository.findOne({ 
            where: { name: RoleName.NUTRITIONIST } 
        });
        
        if (!nutritionistRole) {
            throw new AppError('Rol de nutriólogo no encontrado en el sistema', 500);
        }

        // 6. Generar contraseña temporal
        const temporaryPassword = this.generateTemporaryPassword();
        const hashedPassword = await bcrypt.hash(temporaryPassword, 10);
        const expiresAt = new Date();
        expiresAt.setHours(expiresAt.getHours() + 48); // 48 horas para activar cuenta

        // 7. Crear usuario
        const newUser = this.userRepository.create({
            email: registrationData.email,
            password_hash: hashedPassword,
            first_name: registrationData.first_name,
            last_name: registrationData.last_name,
            phone: registrationData.phone,
            birth_date: new Date(registrationData.birth_date),
            gender: registrationData.gender,
            role: nutritionistRole,
            is_active: false, // Se activará después de la verificación
            registration_type: UserRegistrationType.ONLINE,
            has_temporary_password: true,
            temporary_password_expires_at: expiresAt,
            requires_initial_setup: true
        });

        const savedUser = await this.userRepository.save(newUser);

        // 8. Crear perfil de nutriólogo
        const newProfile = this.nutritionistProfileRepository.create({
            user: savedUser,
            // Validación profesional
            professional_id: registrationData.professional_id,
            professional_id_issuer: registrationData.professional_id_issuer,
            university: registrationData.university,
            degree_title: registrationData.degree_title,
            graduation_date: new Date(registrationData.graduation_date),
            rfc: registrationData.rfc,
            curp: registrationData.curp,
            verification_status: 'pending',
            // Información profesional
            license_number: registrationData.license_number,
            license_issuing_authority: registrationData.license_issuing_authority,
            specialties: registrationData.specialties,
            years_of_experience: registrationData.years_of_experience,
            education: registrationData.education,
            certifications: registrationData.certifications || [],
            areas_of_interest: registrationData.areas_of_interest || [],
            // Práctica
            bio: registrationData.bio,
            professional_summary: registrationData.professional_summary,
            treatment_approach: registrationData.treatment_approach,
            languages: registrationData.languages,
            consultation_fee: registrationData.consultation_fee,
            // Modalidades
            offers_in_person: registrationData.offers_in_person,
            offers_online: registrationData.offers_online,
            // Consultorio
            clinic_name: registrationData.clinic_name,
            clinic_address: registrationData.clinic_address,
            clinic_city: registrationData.clinic_city,
            clinic_state: registrationData.clinic_state,
            clinic_zip_code: registrationData.clinic_zip_code,
            clinic_country: registrationData.clinic_country || 'México',
            clinic_phone: registrationData.clinic_phone,
            // Estado inicial
            is_verified: false,
            is_available: false // Se activará después de la aprobación
        });

        const savedProfile = await this.nutritionistProfileRepository.save(newProfile);

        // 9. Enviar email de confirmación
        try {
            await this.sendRegistrationConfirmationEmail(savedUser, temporaryPassword);
        } catch (emailError) {
            console.error('Error enviando email de confirmación:', emailError);
            // No fallar el registro si el email falla
        }

        // 10. Notificar a administradores
        await this.notifyAdminsNewRegistration(savedUser, savedProfile);

        return {
            user: savedUser,
            profile: savedProfile,
            message: 'Registro exitoso. Su solicitud está pendiente de verificación por nuestros administradores. Recibirá un email cuando sea aprobada.'
        };
    }

    /**
     * Valida una cédula profesional (simulación)
     * En producción, esto se conectaría a la API del Registro Nacional de Profesionistas
     */
    private async validateProfessionalId(professionalId: string): Promise<{
        isValid: boolean;
        reason?: string;
        details?: any;
    }> {
        // Simulación de validación de cédula profesional
        // En producción, aquí se haría una consulta a la API oficial
        
        // Validaciones básicas
        if (professionalId.length < 7 || professionalId.length > 10) {
            return {
                isValid: false,
                reason: 'La cédula debe tener entre 7 y 10 dígitos'
            };
        }

        if (!/^[0-9]+$/.test(professionalId)) {
            return {
                isValid: false,
                reason: 'La cédula solo debe contener números'
            };
        }

        // Simulación de cédulas inválidas conocidas
        const invalidCedulas = ['1234567', '0000000', '9999999'];
        if (invalidCedulas.includes(professionalId)) {
            return {
                isValid: false,
                reason: 'Cédula profesional no válida'
            };
        }

        // TODO: Integrar con API oficial del Registro Nacional de Profesionistas
        // const apiResponse = await fetch(`https://api.rnp.gob.mx/validate/${professionalId}`);
        
        return {
            isValid: true,
            details: {
                validated_at: new Date(),
                source: 'Litam validation system',
                // En producción incluiría datos de la API oficial
            }
        };
    }

    /**
     * Verifica o rechaza un nutriólogo registrado
     */
    async verifyNutritionist(
        profileId: string, 
        verificationData: NutritionistVerificationDto,
        adminId: string
    ): Promise<NutritionistProfile> {
        const profile = await this.nutritionistProfileRepository.findOne({
            where: { id: profileId },
            relations: ['user']
        });

        if (!profile) {
            throw new AppError('Perfil de nutriólogo no encontrado', 404);
        }

        // Actualizar estado de verificación
        profile.verification_status = verificationData.verification_status;
        profile.verification_notes = verificationData.verification_notes || null;
        profile.verified_by_admin_id = adminId;
        profile.verified_at = new Date();

        // Si es aprobado, activar la cuenta
        if (verificationData.verification_status === 'approved') {
            profile.is_verified = true;
            profile.is_available = true;
            profile.user.is_active = true;
            
            await this.userRepository.save(profile.user);
            
            // Enviar email de aprobación
            await this.sendApprovalEmail(profile.user);
        } else if (verificationData.verification_status === 'rejected') {
            // Enviar email de rechazo
            await this.sendRejectionEmail(profile.user, verificationData.verification_notes);
        }

        return await this.nutritionistProfileRepository.save(profile);
    }

    /**
     * Subir documento de validación
     */
    async uploadDocument(
        profileId: string,
        documentData: DocumentUploadDto
    ): Promise<NutritionistProfile> {
        const profile = await this.nutritionistProfileRepository.findOne({
            where: { id: profileId }
        });

        if (!profile) {
            throw new AppError('Perfil de nutriólogo no encontrado', 404);
        }

        // Inicializar uploaded_documents si no existe
        if (!profile.uploaded_documents) {
            profile.uploaded_documents = {};
        }

        // Agregar el documento
        if (documentData.document_type === 'additional_certification') {
            if (!profile.uploaded_documents.additional_certifications) {
                profile.uploaded_documents.additional_certifications = [];
            }
            profile.uploaded_documents.additional_certifications.push(documentData.document_url);
        } else {
            profile.uploaded_documents[documentData.document_type] = documentData.document_url;
        }

        return await this.nutritionistProfileRepository.save(profile);
    }

    /**
     * Buscar nutriólogos para administración
     */
    async searchNutritionists(searchData: NutritionistSearchDto): Promise<{
        nutritionists: any[];
        total: number;
        page: number;
        totalPages: number;
    }> {
        const page = searchData.page || 1;
        const limit = searchData.limit || 10;
        const skip = (page - 1) * limit;

        const queryBuilder = this.nutritionistProfileRepository
            .createQueryBuilder('profile')
            .leftJoinAndSelect('profile.user', 'user')
            .leftJoinAndSelect('user.role', 'role');

        // Filtros
        if (searchData.search) {
            queryBuilder.where(
                '(user.first_name ILIKE :search OR user.last_name ILIKE :search OR user.email ILIKE :search OR profile.professional_id ILIKE :search)',
                { search: `%${searchData.search}%` }
            );
        }

        if (searchData.verification_status) {
            queryBuilder.andWhere('profile.verification_status = :status', { 
                status: searchData.verification_status 
            });
        }

        if (searchData.university) {
            queryBuilder.andWhere('profile.university ILIKE :university', { 
                university: `%${searchData.university}%` 
            });
        }

        // Contar total
        const total = await queryBuilder.getCount();

        // Obtener resultados paginados
        const nutritionists = await queryBuilder
            .orderBy('profile.created_at', 'DESC')
            .skip(skip)
            .take(limit)
            .getMany();

        const totalPages = Math.ceil(total / limit);

        return {
            nutritionists,
            total,
            page,
            totalPages
        };
    }

    /**
     * Generar contraseña temporal
     */
    private generateTemporaryPassword(): string {
        const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz123456789';
        let password = '';
        for (let i = 0; i < 10; i++) {
            password += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return password;
    }

    /**
     * Enviar email de confirmación de registro
     */
    private async sendRegistrationConfirmationEmail(user: User, temporaryPassword: string): Promise<void> {
        // TODO: Implementar template específico para nutriólogos
        console.log(`📧 Enviando confirmación de registro a nutriólogo: ${user.email}`);
        // Por ahora usar el servicio existente
    }

    /**
     * Enviar email de aprobación
     */
    private async sendApprovalEmail(user: User): Promise<void> {
        // TODO: Implementar template de aprobación
        console.log(`✅ Enviando email de aprobación a: ${user.email}`);
    }

    /**
     * Enviar email de rechazo
     */
    private async sendRejectionEmail(user: User, reason?: string): Promise<void> {
        // TODO: Implementar template de rechazo
        console.log(`❌ Enviando email de rechazo a: ${user.email}. Razón: ${reason}`);
    }

    /**
     * Notificar a administradores sobre nuevo registro
     */
    private async notifyAdminsNewRegistration(user: User, profile: NutritionistProfile): Promise<void> {
        // TODO: Implementar notificación a administradores
        console.log(`🔔 Nuevo nutriólogo registrado: ${user.first_name} ${user.last_name} (${profile.professional_id})`);
    }
}

export const nutritionistRegistrationService = new NutritionistRegistrationService();