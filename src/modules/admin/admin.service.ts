// src/modules/admin/admin.service.ts
import { Repository } from 'typeorm';
import { AppDataSource } from '@/database/data-source';
import { User } from '@/database/entities/user.entity';
import { Role, RoleName } from '@/database/entities/role.entity';
import { UserSubscription, SubscriptionStatus } from '@/database/entities/user_subscription.entity';
import { SubscriptionPlan, SubscriptionDurationType } from '@/database/entities/subscription_plan.entity'; // <-- AÑADIDO
import { NutritionistProfile } from '@/database/entities/nutritionist_profile.entity';
import {
    AdminUpdateUserDto,
    AdminVerifyNutritionistDto,
    AdminUpdateUserSubscriptionDto,
} from '@/modules/admin/admin.dto';
import { AppError } from '@/utils/app.error';
import bcrypt from 'bcrypt';

class AdminService {
    private userRepository: Repository<User>;
    private roleRepository: Repository<Role>;
    private userSubscriptionRepository: Repository<UserSubscription>;
    private subscriptionPlanRepository: Repository<SubscriptionPlan>;
    private nutritionistProfileRepository: Repository<NutritionistProfile>;

    constructor() {
        this.userRepository = AppDataSource.getRepository(User);
        this.roleRepository = AppDataSource.getRepository(Role);
        this.userSubscriptionRepository = AppDataSource.getRepository(UserSubscription);
        this.subscriptionPlanRepository = AppDataSource.getRepository(SubscriptionPlan);
        this.nutritionistProfileRepository = AppDataSource.getRepository(NutritionistProfile);
    }

    // --- Gestión de Usuarios ---

    public async getAllUsers(role?: RoleName, isActive?: boolean, page: number = 1, limit: number = 20) {
        const skip = (page - 1) * limit;
        const whereClause: any = {};
        if (role) whereClause.role = { name: role };
        if (isActive !== undefined) whereClause.is_active = isActive;

        const [users, total] = await this.userRepository.findAndCount({
            where: whereClause,
            relations: ['role'],
            order: { created_at: 'DESC' },
            skip: skip,
            take: limit,
        });

        // Ocultar hashes de contraseña
        const usersWithoutHashes = users.map(user => {
            const { password_hash, ...userWithoutHash } = user;
            return userWithoutHash;
        });

        return {
            users: usersWithoutHashes,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        };
    }

    public async getUserById(userId: string) {
        const user = await this.userRepository.findOne({ where: { id: userId }, relations: ['role', 'patient_profile', 'nutritionist_profile'] });
        if (!user) {
            throw new AppError('Usuario no encontrado.', 404);
        }
        const { password_hash, ...userWithoutHash } = user;
        return userWithoutHash;
    }

    public async adminUpdateUser(userId: string, updateDto: AdminUpdateUserDto) {
        const user = await this.userRepository.findOne({ where: { id: userId }, relations: ['role'] });
        if (!user) {
            throw new AppError('Usuario no encontrado.', 404);
        }

        // Actualizar campos básicos
        if (updateDto.firstName !== undefined) user.first_name = updateDto.firstName;
        if (updateDto.lastName !== undefined) user.last_name = updateDto.lastName;
        if (updateDto.email !== undefined) {
            const existingEmail = await this.userRepository.findOneBy({ email: updateDto.email });
            if (existingEmail && existingEmail.id !== user.id) {
                throw new AppError('El email ya está en uso por otro usuario.', 409);
            }
            user.email = updateDto.email;
        }
        if (updateDto.isActive !== undefined) user.is_active = updateDto.isActive;

        // Cambiar rol (requiere cuidado, asegurarse de que el nuevo rol exista)
        if (updateDto.roleName !== undefined && updateDto.roleName !== user.role.name) {
            const newRole = await this.roleRepository.findOneBy({ name: updateDto.roleName });
            if (!newRole) {
                throw new AppError('Rol especificado no encontrado.', 400);
            }
            user.role = newRole;
        }

        // Resetear contraseña (requiere hasheo)
        if (updateDto.newPassword) {
            user.password_hash = await bcrypt.hash(updateDto.newPassword, 10);
            user.passwordChangedAt = new Date(); // Marcar que la contraseña fue cambiada
        }

        await this.userRepository.save(user);
        const { password_hash, ...userWithoutHash } = user;
        return userWithoutHash;
    }

    public async adminDeleteUser(userId: string) {
        const user = await this.userRepository.findOneBy({ id: userId });
        if (!user) {
            throw new AppError('Usuario no encontrado.', 404);
        }
        // No permitir eliminar administradores a menos que sea el único admin (lógica más compleja)
        if (user.role.name === RoleName.ADMIN) {
            throw new AppError('No se puede eliminar un usuario administrador directamente.', 403);
        }

        await this.userRepository.remove(user);
        return { message: 'Usuario eliminado con éxito.' };
    }

    public async adminVerifyNutritionist(nutritionistId: string, verifyDto: AdminVerifyNutritionistDto) {
        const nutritionist = await this.userRepository.findOne({
            where: { id: nutritionistId, role: { name: RoleName.NUTRITIONIST } },
            relations: ['nutritionist_profile'],
        });
        if (!nutritionist) {
            throw new AppError('Nutriólogo no encontrado o no tiene el rol de nutriólogo.', 404);
        }
        if (!nutritionist.nutritionist_profile) {
            throw new AppError('Perfil de nutriólogo no encontrado. El nutriólogo debe completar su perfil primero.', 400);
        }

        nutritionist.nutritionist_profile.is_verified = verifyDto.isVerified;
        await this.nutritionistProfileRepository.save(nutritionist.nutritionist_profile);
        return { message: `Estado de verificación de nutriólogo actualizado a ${verifyDto.isVerified}.` };
    }

    // --- Gestión de Suscripciones de Usuario (por Admin) ---

    public async getAllUserSubscriptions(status?: SubscriptionStatus, page: number = 1, limit: number = 20) {
        const skip = (page - 1) * limit;
        const whereClause: any = {};
        if (status) whereClause.status = status;

        const [subscriptions, total] = await this.userSubscriptionRepository.findAndCount({
            where: whereClause,
            relations: ['user', 'user.role', 'subscription_plan'],
            order: { created_at: 'DESC' },
            skip: skip,
            take: limit,
        });

        // Ocultar hash de contraseña de los usuarios
        const subscriptionsWithCleanUsers = subscriptions.map(sub => {
            const { password_hash, ...userWithoutHash } = sub.user;
            return { ...sub, user: userWithoutHash };
        });

        return {
            subscriptions: subscriptionsWithCleanUsers,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        };
    }

    public async adminUpdateUserSubscription(userSubscriptionId: string, updateDto: AdminUpdateUserSubscriptionDto) {
        const subscription = await this.userSubscriptionRepository.findOne({
            where: { id: userSubscriptionId },
            relations: ['user', 'subscription_plan'],
        });
        if (!subscription) {
            throw new AppError('Suscripción de usuario no encontrada.', 404);
        }

        // Cambiar plan de suscripción
        if (updateDto.planId !== undefined && updateDto.planId !== subscription.subscription_plan.id) {
            const newPlan = await this.subscriptionPlanRepository.findOneBy({ id: updateDto.planId });
            if (!newPlan) {
                throw new AppError('Nuevo plan de suscripción no encontrado.', 400);
            }
            subscription.subscription_plan = newPlan;
        }

        // Actualizar fechas
        if (updateDto.startDate !== undefined) subscription.start_date = new Date(updateDto.startDate);
        if (updateDto.endDate !== undefined) subscription.end_date = new Date(updateDto.endDate);

        // Actualizar estado
        if (updateDto.status !== undefined) {
            if (updateDto.status === SubscriptionStatus.CANCELLED) {
                subscription.cancelled_at = new Date();
                subscription.cancellation_reason = updateDto.cancelReason || 'Cancelado por administrador.';
            } else if (updateDto.status === SubscriptionStatus.ACTIVE) {
                 subscription.cancelled_at = null;
                 subscription.cancellation_reason = null;
            }
            subscription.status = updateDto.status;
        }

        // Forzar renovación (ej: para reintentar un pago fallido)
        if (updateDto.forceRenewal) {
            // Note: next_renewal_date no existe en la entidad actual
            // Esta funcionalidad requiere agregar campos adicionales a la entidad
        }

        await this.userSubscriptionRepository.save(subscription);
        return subscription;
    }

    public async adminDeleteUserSubscription(userSubscriptionId: string) {
        const subscription = await this.userSubscriptionRepository.findOneBy({ id: userSubscriptionId });
        if (!subscription) {
            throw new AppError('Suscripción de usuario no encontrada.', 404);
        }
        await this.userSubscriptionRepository.remove(subscription);
        return { message: 'Suscripción de usuario eliminada con éxito.' };
    }
}

export default new AdminService();