// users.service.ts 
import { Repository } from 'typeorm';
import { AppDataSource } from '../../database/data-source'; // Ruta corregida
import { User } from '../../database/entities/user.entity'; // Ruta corregida
import { UpdateUserDto } from '../../modules/auth/auth.dto'; // Ruta corregida
import { AppError } from '../../utils/app.error'; // Importar AppError
import * as bcrypt from 'bcryptjs';

class UserService {
    private userRepository: Repository<User>;

    constructor() {
        this.userRepository = AppDataSource.getRepository(User);
    }

    public async getUserProfile(userId: string) {
        const user = await this.userRepository
            .createQueryBuilder('user')
            .leftJoinAndSelect('user.role', 'role')
            .where('user.id = :userId', { userId })
            .getOne();

        if (!user) {
            throw new AppError('Usuario no encontrado.', 404); // Usar AppError
        }

        const { password_hash, ...userWithoutHash } = user;
        return userWithoutHash;
    }

    public async updateProfile(userId: string, updateDto: any) {
        const user = await this.userRepository.findOneBy({ id: userId });

        if (!user) {
            throw new AppError('Usuario no encontrado.', 404); // Usar AppError
        }

        // Actualizar campos básicos
        if (updateDto.first_name !== undefined) user.first_name = updateDto.first_name;
        if (updateDto.last_name !== undefined) user.last_name = updateDto.last_name;
        if (updateDto.phone !== undefined) user.phone = updateDto.phone;
        if (updateDto.birth_date !== undefined) user.birth_date = updateDto.birth_date;
        if (updateDto.age !== undefined) user.age = updateDto.age;
        if (updateDto.gender !== undefined) user.gender = updateDto.gender;

        // Actualizar información profesional si es nutriólogo
        if (user.role?.name === 'nutritionist') {
            if (updateDto.license_number !== undefined) {
                // Aquí podrías actualizar en una tabla de perfil profesional
                console.log('Actualizando número de licencia:', updateDto.license_number);
            }
            if (updateDto.specialties !== undefined) {
                console.log('Actualizando especialidades:', updateDto.specialties);
            }
            if (updateDto.experience_years !== undefined) {
                console.log('Actualizando años de experiencia:', updateDto.experience_years);
            }
            if (updateDto.education !== undefined) {
                console.log('Actualizando educación:', updateDto.education);
            }
            if (updateDto.bio !== undefined) {
                console.log('Actualizando biografía:', updateDto.bio);
            }
        }

        await this.userRepository.save(user);

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
        // Aquí podrías obtener estadísticas del usuario desde otras tablas
        // Por ahora retornamos datos mock
        return {
            total_patients: 45,
            total_appointments: 128,
            experience_years: 5,
            completion_rate: 92,
            average_rating: 4.8,
            total_reviews: 67
        };
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