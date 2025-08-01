// users.service.ts 
import { Repository } from 'typeorm';
import { AppDataSource } from '../../database/data-source'; // Ruta corregida
import { User } from '../../database/entities/user.entity'; // Ruta corregida
import { NutritionistProfile } from '../../database/entities/nutritionist_profile.entity'; // Agregar entidad
import { UpdateUserDto } from '../../modules/auth/auth.dto'; // Ruta corregida
import { AppError } from '../../utils/app.error'; // Importar AppError
import * as bcrypt from 'bcryptjs';
import { DashboardService } from '../dashboard/dashboard.service';

class UserService {
    private userRepository: Repository<User>;
    private nutritionistProfileRepository: Repository<NutritionistProfile>;

    constructor() {
        this.userRepository = AppDataSource.getRepository(User);
        this.nutritionistProfileRepository = AppDataSource.getRepository(NutritionistProfile);
    }

    public async getUserProfile(userId: string) {
        const user = await this.userRepository
            .createQueryBuilder('user')
            .leftJoinAndSelect('user.role', 'role')
            .leftJoinAndSelect('user.nutritionist_profile', 'nutritionist_profile')
            .where('user.id = :userId', { userId })
            .getOne();

        if (!user) {
            throw new AppError('Usuario no encontrado.', 404); // Usar AppError
        }

        const { password_hash, ...userWithoutHash } = user;
        return userWithoutHash;
    }

    public async updateProfile(userId: string, updateDto: any) {
        const user = await this.userRepository
            .createQueryBuilder('user')
            .leftJoinAndSelect('user.role', 'role')
            .leftJoinAndSelect('user.nutritionist_profile', 'nutritionist_profile')
            .where('user.id = :userId', { userId })
            .getOne();

        if (!user) {
            throw new AppError('Usuario no encontrado.', 404);
        }

        // Actualizar campos básicos del usuario
        if (updateDto.first_name !== undefined) user.first_name = updateDto.first_name;
        if (updateDto.last_name !== undefined) user.last_name = updateDto.last_name;
        if (updateDto.phone !== undefined) user.phone = updateDto.phone;
        if (updateDto.birth_date !== undefined) user.birth_date = updateDto.birth_date;
        if (updateDto.age !== undefined) user.age = updateDto.age;
        if (updateDto.gender !== undefined) user.gender = updateDto.gender;

        // Guardar cambios del usuario
        await this.userRepository.save(user);

        // Actualizar perfil profesional si es nutriólogo
        if (user.role?.name === 'nutritionist') {
            let nutritionistProfile = user.nutritionist_profile;

            // Si no existe el perfil, crearlo
            if (!nutritionistProfile) {
                nutritionistProfile = new NutritionistProfile();
                nutritionistProfile.user = user;
                nutritionistProfile = await this.nutritionistProfileRepository.save(nutritionistProfile);
            }

            // Actualizar campos de credenciales profesionales
            if (updateDto.license_number !== undefined) nutritionistProfile.license_number = updateDto.license_number;
            if (updateDto.license_issuing_authority !== undefined) nutritionistProfile.license_issuing_authority = updateDto.license_issuing_authority;
            if (updateDto.specialties !== undefined) {
                if (typeof updateDto.specialties === 'string') {
                    nutritionistProfile.specialties = [updateDto.specialties];
                } else if (Array.isArray(updateDto.specialties)) {
                    nutritionistProfile.specialties = updateDto.specialties;
                } else {
                    nutritionistProfile.specialties = null;
                }
            }
            if (updateDto.years_of_experience !== undefined) nutritionistProfile.years_of_experience = updateDto.years_of_experience;

            // Actualizar campos de formación (manejar arrays correctamente)
            if (updateDto.education !== undefined) {
                // Si es un string, convertirlo a array
                if (typeof updateDto.education === 'string') {
                    nutritionistProfile.education = [updateDto.education];
                } else if (Array.isArray(updateDto.education)) {
                    nutritionistProfile.education = updateDto.education;
                } else {
                    nutritionistProfile.education = null;
                }
            }
            if (updateDto.certifications !== undefined) {
                if (typeof updateDto.certifications === 'string') {
                    nutritionistProfile.certifications = [updateDto.certifications];
                } else if (Array.isArray(updateDto.certifications)) {
                    nutritionistProfile.certifications = updateDto.certifications;
                } else {
                    nutritionistProfile.certifications = null;
                }
            }
            if (updateDto.areas_of_interest !== undefined) {
                if (typeof updateDto.areas_of_interest === 'string') {
                    nutritionistProfile.areas_of_interest = [updateDto.areas_of_interest];
                } else if (Array.isArray(updateDto.areas_of_interest)) {
                    nutritionistProfile.areas_of_interest = updateDto.areas_of_interest;
                } else {
                    nutritionistProfile.areas_of_interest = null;
                }
            }

            // Actualizar campos de práctica profesional
            if (updateDto.treatment_approach !== undefined) nutritionistProfile.treatment_approach = updateDto.treatment_approach;
            if (updateDto.languages !== undefined) {
                if (typeof updateDto.languages === 'string') {
                    nutritionistProfile.languages = [updateDto.languages];
                } else if (Array.isArray(updateDto.languages)) {
                    nutritionistProfile.languages = updateDto.languages;
                } else {
                    nutritionistProfile.languages = null;
                }
            }
            if (updateDto.consultation_fee !== undefined) nutritionistProfile.consultation_fee = updateDto.consultation_fee;

            // Actualizar campos existentes
            if (updateDto.bio !== undefined) nutritionistProfile.bio = updateDto.bio;
            if (updateDto.professional_summary !== undefined) nutritionistProfile.professional_summary = updateDto.professional_summary;

            // Actualizar modalidades de consulta
            if (updateDto.offers_in_person !== undefined) nutritionistProfile.offers_in_person = updateDto.offers_in_person;
            if (updateDto.offers_online !== undefined) nutritionistProfile.offers_online = updateDto.offers_online;

            // Actualizar información del consultorio
            if (updateDto.clinic_name !== undefined) nutritionistProfile.clinic_name = updateDto.clinic_name;
            if (updateDto.clinic_address !== undefined) nutritionistProfile.clinic_address = updateDto.clinic_address;
            if (updateDto.clinic_city !== undefined) nutritionistProfile.clinic_city = updateDto.clinic_city;
            if (updateDto.clinic_state !== undefined) nutritionistProfile.clinic_state = updateDto.clinic_state;
            if (updateDto.clinic_zip_code !== undefined) nutritionistProfile.clinic_zip_code = updateDto.clinic_zip_code;
            if (updateDto.clinic_country !== undefined) nutritionistProfile.clinic_country = updateDto.clinic_country;
            if (updateDto.clinic_phone !== undefined) nutritionistProfile.clinic_phone = updateDto.clinic_phone;
            if (updateDto.clinic_notes !== undefined) nutritionistProfile.clinic_notes = updateDto.clinic_notes;

            // Actualizar coordenadas GPS
            if (updateDto.latitude !== undefined) nutritionistProfile.latitude = updateDto.latitude;
            if (updateDto.longitude !== undefined) nutritionistProfile.longitude = updateDto.longitude;

            // Actualizar horarios de oficina
            if (updateDto.office_hours !== undefined) nutritionistProfile.office_hours = updateDto.office_hours;

            // Actualizar disponibilidad
            if (updateDto.is_available !== undefined) nutritionistProfile.is_available = updateDto.is_available;

            // Guardar el perfil profesional actualizado
            await this.nutritionistProfileRepository.save(nutritionistProfile);

            // Recargar el usuario con el perfil actualizado
            const updatedUser = await this.userRepository
                .createQueryBuilder('user')
                .leftJoinAndSelect('user.role', 'role')
                .leftJoinAndSelect('user.nutritionist_profile', 'nutritionist_profile')
                .where('user.id = :userId', { userId })
                .getOne();

            if (updatedUser) {
                const { password_hash, ...userWithoutHash } = updatedUser;
                return userWithoutHash;
            }
        }

        // Para usuarios que no son nutriólogos, devolver solo la información básica
        const { password_hash, ...userWithoutHash } = user;
        return userWithoutHash;
    }

    public async updatePassword(userId: string, currentPassword: string, newPassword: string) {
        const user = await this.userRepository.findOneBy({ id: userId });

        if (!user) {
            throw new AppError('Usuario no encontrado.', 404);
        }

        // Verificar contraseña actual
        const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password_hash);
        if (!isCurrentPasswordValid) {
            throw new AppError('La contraseña actual es incorrecta.', 400);
        }

        // Validar nueva contraseña
        if (newPassword.length < 6) {
            throw new AppError('La nueva contraseña debe tener al menos 6 caracteres.', 400);
        }

        // Encriptar nueva contraseña
        const saltRounds = 12;
        const newPasswordHash = await bcrypt.hash(newPassword, saltRounds);

        // Actualizar contraseña
        user.password_hash = newPasswordHash;
        user.passwordChangedAt = new Date();

        await this.userRepository.save(user);

        return { message: 'Contraseña actualizada exitosamente.' };
    }

    public async getProfileStats(userId: string) {
        // Obtener estadísticas reales usando el dashboard
        const dashboardService = new DashboardService();
        const stats = await dashboardService.getSimpleDashboardStats(userId);
        return stats;
    }

    public async updateNotificationSettings(userId: string, settings: any) {
        const user = await this.userRepository.findOneBy({ id: userId });

        if (!user) {
            throw new AppError('Usuario no encontrado.', 404);
        }

        // Aquí podrías actualizar configuraciones de notificaciones
        console.log('Actualizando configuraciones de notificación:', settings);

        return { message: 'Configuraciones de notificación actualizadas.' };
    }

    public async updateProfileImage(userId: string, imageUrl: string) {
        const user = await this.userRepository
            .createQueryBuilder('user')
            .leftJoinAndSelect('user.role', 'role')
            .leftJoinAndSelect('user.nutritionist_profile', 'nutritionist_profile')
            .where('user.id = :userId', { userId })
            .getOne();

        if (!user) {
            throw new AppError('Usuario no encontrado.', 404);
        }

        // Actualizar la imagen de perfil en el usuario
        user.profile_image = imageUrl;
        await this.userRepository.save(user);

        // Recargar el usuario con todos los datos
        const updatedUser = await this.userRepository
            .createQueryBuilder('user')
            .leftJoinAndSelect('user.role', 'role')
            .leftJoinAndSelect('user.nutritionist_profile', 'nutritionist_profile')
            .where('user.id = :userId', { userId })
            .getOne();

        if (updatedUser) {
            const { password_hash, ...userWithoutHash } = updatedUser;
            return userWithoutHash;
        }

        throw new AppError('Error al actualizar la imagen de perfil.', 500);
    }

    public async deleteAccount(userId: string, confirmPassword: string) {
        const user = await this.userRepository.findOneBy({ id: userId });

        if (!user) {
            throw new AppError('Usuario no encontrado.', 404);
        }

        // Verificar contraseña
        const isPasswordValid = await bcrypt.compare(confirmPassword, user.password_hash);
        if (!isPasswordValid) {
            throw new AppError('La contraseña es incorrecta.', 400);
        }

        // Aquí podrías implementar la lógica de eliminación de cuenta
        // Por ahora solo desactivamos el usuario
        user.is_active = false;
        await this.userRepository.save(user);

        return { message: 'Cuenta eliminada exitosamente.' };
    }
}

export default new UserService();