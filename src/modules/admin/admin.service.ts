// src/modules/admin/admin.service.ts
import { Repository, MoreThanOrEqual } from 'typeorm';
import { AppDataSource } from '../../database/data-source';
import { User } from '../../database/entities/user.entity';
import { Role, RoleName } from '../../database/entities/role.entity';
import { UserSubscription, SubscriptionStatus } from '../../database/entities/user_subscription.entity';
import { SubscriptionPlan, SubscriptionDurationType } from '../../database/entities/subscription_plan.entity'; // <-- AÑADIDO
import { NutritionistProfile } from '../../database/entities/nutritionist_profile.entity';
import { PatientNutritionistRelation, RelationshipStatus } from '../../database/entities/patient_nutritionist_relation.entity';
import { DietPlan } from '../../database/entities/diet_plan.entity';
import { Appointment, AppointmentStatus } from '../../database/entities/appointment.entity';
import { ClinicalRecord } from '../../database/entities/clinical_record.entity';
import { EducationalContent, ContentType } from '../../database/entities/educational_content.entity';
import { Food } from '../../database/entities/food.entity';
import { Recipe } from '../../database/entities/recipe.entity';
import { PaymentTransaction, PaymentStatus } from '../../database/entities/payment_transaction.entity';
import { PatientProfile } from '../../database/entities/patient_profile.entity';
import { Conversation } from '../../database/entities/conversation.entity';
import { Message } from '../../database/entities/message.entity';
import { WeeklyPlanTemplate } from '../../database/entities/weekly-plan-template.entity';
import { NutritionistReview } from '../../database/entities/nutritionist_review.entity';
import { PatientProgressLog } from '../../database/entities/patient_progress_log.entity';
import {
    AdminUpdateUserDto,
    AdminVerifyNutritionistDto,
    AdminUpdateUserSubscriptionDto,
    AdminCreateUserDto,
    AdminCreateAppointmentDto,
    AdminCreateFoodDto,
    AdminCreateRecipeDto,
    AdminCreateEducationalContentDto,
} from '../../modules/admin/admin.dto';
import { AppError } from '../../utils/app.error';
import bcrypt from 'bcrypt';

class AdminService {
    private userRepository: Repository<User>;
    private roleRepository: Repository<Role>;
    private userSubscriptionRepository: Repository<UserSubscription>;
    private subscriptionPlanRepository: Repository<SubscriptionPlan>;
    private nutritionistProfileRepository: Repository<NutritionistProfile>;
    private relationRepository: Repository<PatientNutritionistRelation>;
    private dietPlanRepository: Repository<DietPlan>;
    private appointmentRepository: Repository<Appointment>;
    private clinicalRecordRepository: Repository<ClinicalRecord>;
    private educationalContentRepository: Repository<EducationalContent>;
    private foodRepository: Repository<Food>;
    private recipeRepository: Repository<Recipe>;
    private paymentTransactionRepository: Repository<PaymentTransaction>;
    private patientProfileRepository: Repository<PatientProfile>;
    private conversationRepository: Repository<Conversation>;
    private messageRepository: Repository<Message>;
    private weeklyPlanTemplateRepository: Repository<WeeklyPlanTemplate>;
    private nutritionistReviewRepository: Repository<NutritionistReview>;
    private patientProgressLogRepository: Repository<PatientProgressLog>;

    constructor() {
        this.userRepository = AppDataSource.getRepository(User);
        this.roleRepository = AppDataSource.getRepository(Role);
        this.userSubscriptionRepository = AppDataSource.getRepository(UserSubscription);
        this.subscriptionPlanRepository = AppDataSource.getRepository(SubscriptionPlan);
        this.nutritionistProfileRepository = AppDataSource.getRepository(NutritionistProfile);
        this.relationRepository = AppDataSource.getRepository(PatientNutritionistRelation);
        this.dietPlanRepository = AppDataSource.getRepository(DietPlan);
        this.appointmentRepository = AppDataSource.getRepository(Appointment);
        this.clinicalRecordRepository = AppDataSource.getRepository(ClinicalRecord);
        this.educationalContentRepository = AppDataSource.getRepository(EducationalContent);
        this.foodRepository = AppDataSource.getRepository(Food);
        this.recipeRepository = AppDataSource.getRepository(Recipe);
        this.paymentTransactionRepository = AppDataSource.getRepository(PaymentTransaction);
        this.patientProfileRepository = AppDataSource.getRepository(PatientProfile);
        this.conversationRepository = AppDataSource.getRepository(Conversation);
        this.messageRepository = AppDataSource.getRepository(Message);
        this.weeklyPlanTemplateRepository = AppDataSource.getRepository(WeeklyPlanTemplate);
        this.nutritionistReviewRepository = AppDataSource.getRepository(NutritionistReview);
        this.patientProgressLogRepository = AppDataSource.getRepository(PatientProgressLog);
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

    // --- GESTIÓN COMPLETA DE USUARIOS ---

    public async adminCreateUser(createDto: AdminCreateUserDto) {
        try {
            // Verificar que el email no exista
            const existingUser = await this.userRepository.findOneBy({ email: createDto.email });
            if (existingUser) {
                throw new AppError('El email ya está en uso.', 409);
            }

            // Obtener el rol
            const role = await this.roleRepository.findOneBy({ name: createDto.roleName });
            if (!role) {
                throw new AppError('Rol especificado no encontrado.', 400);
            }

            // Crear el usuario
            const user = new User();
            user.first_name = createDto.firstName;
            user.last_name = createDto.lastName;
            user.email = createDto.email;
            user.password_hash = await bcrypt.hash(createDto.password, 10);
            user.role = role;
            user.is_active = createDto.isActive ?? true;
            user.phone = createDto.phone || null;
            user.birth_date = createDto.birthDate ? new Date(createDto.birthDate) : null;

            const savedUser = await this.userRepository.save(user);
            const { password_hash, ...userWithoutHash } = savedUser;
            return userWithoutHash;
        } catch (error: any) {
            console.error('Error creando usuario:', error);
            throw error instanceof AppError ? error : new AppError('Error al crear usuario.', 500);
        }
    }

    // --- GESTIÓN DE CITAS ---

    public async getAllAppointments(page: number = 1, limit: number = 20) {
        const skip = (page - 1) * limit;
        const [appointments, total] = await this.appointmentRepository.findAndCount({
            relations: ['patient', 'nutritionist'],
            order: { start_time: 'DESC' },
            skip,
            take: limit,
        });

        return {
            appointments,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        };
    }

    public async adminCreateAppointment(createDto: AdminCreateAppointmentDto) {
        const patient = await this.userRepository.findOne({
            where: { id: createDto.patientId, role: { name: RoleName.PATIENT } },
        });
        if (!patient) {
            throw new AppError('Paciente no encontrado.', 404);
        }

        const nutritionist = await this.userRepository.findOne({
            where: { id: createDto.nutritionistId, role: { name: RoleName.NUTRITIONIST } },
        });
        if (!nutritionist) {
            throw new AppError('Nutriólogo no encontrado.', 404);
        }

        const appointment = new Appointment();
        appointment.patient = patient;
        appointment.nutritionist = nutritionist;
        appointment.start_time = new Date(createDto.appointmentDate);
        appointment.end_time = new Date(new Date(createDto.appointmentDate).getTime() + 60 * 60 * 1000); // +1 hour
        appointment.status = createDto.status ? createDto.status as AppointmentStatus : AppointmentStatus.SCHEDULED;
        appointment.notes = createDto.notes || null;

        return await this.appointmentRepository.save(appointment);
    }

    public async adminUpdateAppointment(id: string, updateData: Partial<AdminCreateAppointmentDto>) {
        const appointment = await this.appointmentRepository.findOne({
            where: { id },
            relations: ['patient', 'nutritionist'],
        });
        if (!appointment) {
            throw new AppError('Cita no encontrada.', 404);
        }

        if (updateData.appointmentDate) {
            appointment.start_time = new Date(updateData.appointmentDate);
            appointment.end_time = new Date(new Date(updateData.appointmentDate).getTime() + 60 * 60 * 1000); // +1 hour
        }
        if (updateData.status) {
            appointment.status = updateData.status as AppointmentStatus;
        }
        if (updateData.notes !== undefined) {
            appointment.notes = updateData.notes;
        }

        return await this.appointmentRepository.save(appointment);
    }

    public async adminDeleteAppointment(id: string) {
        const appointment = await this.appointmentRepository.findOneBy({ id });
        if (!appointment) {
            throw new AppError('Cita no encontrada.', 404);
        }
        await this.appointmentRepository.remove(appointment);
        return { message: 'Cita eliminada con éxito.' };
    }

    // --- GESTIÓN DE EXPEDIENTES CLÍNICOS ---

    public async getAllClinicalRecords(page: number = 1, limit: number = 20) {
        const skip = (page - 1) * limit;
        const [records, total] = await this.clinicalRecordRepository.findAndCount({
            relations: ['patient', 'nutritionist'],
            order: { created_at: 'DESC' },
            skip,
            take: limit,
        });

        return {
            records,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        };
    }

    public async adminDeleteClinicalRecord(id: string) {
        const record = await this.clinicalRecordRepository.findOneBy({ id });
        if (!record) {
            throw new AppError('Expediente clínico no encontrado.', 404);
        }
        await this.clinicalRecordRepository.remove(record);
        return { message: 'Expediente clínico eliminado con éxito.' };
    }

    // --- GESTIÓN DE ALIMENTOS ---

    public async getAllFoods(page: number = 1, limit: number = 20) {
        const skip = (page - 1) * limit;
        const [foods, total] = await this.foodRepository.findAndCount({
            order: { created_at: 'DESC' },
            skip,
            take: limit,
        });

        return {
            foods,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        };
    }

    public async adminCreateFood(createDto: AdminCreateFoodDto) {
        const food = new Food();
        food.name = createDto.name;
        food.description = createDto.description || null;
        food.category = createDto.category || null;
        food.calories = createDto.caloriesPer100g || 0;
        food.protein = createDto.proteinPer100g || 0;
        food.carbohydrates = createDto.carbsPer100g || 0;
        food.fats = createDto.fatPer100g || 0;
        food.fiber = createDto.fiberPer100g || null;

        return await this.foodRepository.save(food);
    }

    public async adminUpdateFood(id: string, updateDto: Partial<AdminCreateFoodDto>) {
        const food = await this.foodRepository.findOneBy({ id });
        if (!food) {
            throw new AppError('Alimento no encontrado.', 404);
        }

        Object.assign(food, updateDto);
        return await this.foodRepository.save(food);
    }

    public async adminDeleteFood(id: string) {
        const food = await this.foodRepository.findOneBy({ id });
        if (!food) {
            throw new AppError('Alimento no encontrado.', 404);
        }
        await this.foodRepository.remove(food);
        return { message: 'Alimento eliminado con éxito.' };
    }

    // --- GESTIÓN DE RECETAS ---

    public async getAllRecipes(page: number = 1, limit: number = 20) {
        const skip = (page - 1) * limit;
        const [recipes, total] = await this.recipeRepository.findAndCount({
            relations: ['created_by'],
            order: { created_at: 'DESC' },
            skip,
            take: limit,
        });

        return {
            recipes,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        };
    }

    public async adminCreateRecipe(createDto: AdminCreateRecipeDto) {
        const recipe = new Recipe();
        recipe.title = createDto.name;
        recipe.description = createDto.description || null;
        recipe.instructions = createDto.instructions || '';
        recipe.prep_time_minutes = createDto.prepTimeMinutes || null;
        recipe.servings = createDto.servings || null;
        // Campo difficulty_level no existe en la entidad Recipe
        // Campo category no existe en la entidad Recipe

        return await this.recipeRepository.save(recipe);
    }

    public async adminDeleteRecipe(id: string) {
        const recipe = await this.recipeRepository.findOneBy({ id });
        if (!recipe) {
            throw new AppError('Receta no encontrada.', 404);
        }
        await this.recipeRepository.remove(recipe);
        return { message: 'Receta eliminada con éxito.' };
    }

    // --- GESTIÓN DE CONTENIDO EDUCATIVO ---

    public async getAllEducationalContent(page: number = 1, limit: number = 20) {
        const skip = (page - 1) * limit;
        const [content, total] = await this.educationalContentRepository.findAndCount({
            relations: ['created_by'],
            order: { created_at: 'DESC' },
            skip,
            take: limit,
        });

        return {
            content,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        };
    }

    public async adminCreateEducationalContent(createDto: AdminCreateEducationalContentDto) {
        const content = new EducationalContent();
        content.title = createDto.title;
        content.content_body = createDto.content;
        content.type = createDto.type as ContentType;
        content.tags = createDto.targetAudience ? [createDto.targetAudience] : null;
        content.tags = createDto.tags || [];
        content.is_published = createDto.isPublished ?? false;

        return await this.educationalContentRepository.save(content);
    }

    public async adminDeleteEducationalContent(id: string) {
        const content = await this.educationalContentRepository.findOneBy({ id });
        if (!content) {
            throw new AppError('Contenido educativo no encontrado.', 404);
        }
        await this.educationalContentRepository.remove(content);
        return { message: 'Contenido educativo eliminado con éxito.' };
    }

    // --- GESTIÓN DE TRANSACCIONES ---

    public async getAllPaymentTransactions(page: number = 1, limit: number = 20) {
        const skip = (page - 1) * limit;
        const [transactions, total] = await this.paymentTransactionRepository.findAndCount({
            relations: ['user', 'subscription'],
            order: { created_at: 'DESC' },
            skip,
            take: limit,
        });

        return {
            transactions,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        };
    }

    // --- GESTIÓN DE RESEÑAS ---

    public async getAllReviews(page: number = 1, limit: number = 20) {
        const skip = (page - 1) * limit;
        const [reviews, total] = await this.nutritionistReviewRepository.findAndCount({
            relations: ['patient', 'nutritionist'],
            order: { created_at: 'DESC' },
            skip,
            take: limit,
        });

        return {
            reviews,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        };
    }

    public async adminDeleteReview(id: string) {
        const review = await this.nutritionistReviewRepository.findOneBy({ id });
        if (!review) {
            throw new AppError('Reseña no encontrada.', 404);
        }
        await this.nutritionistReviewRepository.remove(review);
        return { message: 'Reseña eliminada con éxito.' };
    }

    // --- GESTIÓN DE PLANTILLAS ---

    public async getAllTemplates(page: number = 1, limit: number = 20) {
        const skip = (page - 1) * limit;
        const [templates, total] = await this.weeklyPlanTemplateRepository.findAndCount({
            relations: ['createdBy', 'meals'],
            order: { createdAt: 'DESC' },
            skip,
            take: limit,
        });

        return {
            templates,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        };
    }

    public async adminDeleteTemplate(id: string) {
        const template = await this.weeklyPlanTemplateRepository.findOneBy({ id });
        if (!template) {
            throw new AppError('Plantilla no encontrada.', 404);
        }
        await this.weeklyPlanTemplateRepository.remove(template);
        return { message: 'Plantilla eliminada con éxito.' };
    }

    // --- GESTIÓN DE CONVERSACIONES Y MENSAJES ---

    public async getAllConversations(page: number = 1, limit: number = 20) {
        const skip = (page - 1) * limit;
        const [conversations, total] = await this.conversationRepository.findAndCount({
            relations: ['patient', 'nutritionist'],
            order: { updated_at: 'DESC' },
            skip,
            take: limit,
        });

        return {
            conversations,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        };
    }

    public async getAllMessages(conversationId?: string, page: number = 1, limit: number = 50) {
        const skip = (page - 1) * limit;
        const whereClause = conversationId ? { conversation: { id: conversationId } } : {};
        
        const [messages, total] = await this.messageRepository.findAndCount({
            where: whereClause,
            relations: ['sender', 'conversation'],
            order: { timestamp: 'DESC' },
            skip,
            take: limit,
        });

        return {
            messages,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        };
    }

    // --- MÉTRICAS AVANZADAS DEL SISTEMA ---

    public async getAdvancedSystemMetrics() {
        try {
            const [
                userStats,
                appointmentStats,
                financialStats,
                contentStats,
                activityStats
            ] = await Promise.all([
                this.getUserStats(),
                this.getAppointmentStats(),
                this.getFinancialStats(),
                this.getContentStats(),
                this.getActivityStats()
            ]);

            return {
                timestamp: new Date().toISOString(),
                users: userStats,
                appointments: appointmentStats,
                financial: financialStats,
                content: contentStats,
                activity: activityStats,
            };
        } catch (error) {
            console.error('❌ Error obteniendo métricas avanzadas:', error);
            throw new AppError('Error al obtener métricas del sistema', 500);
        }
    }

    private async getUserStats() {
        const totalUsers = await this.userRepository.count();
        const activeUsers = await this.userRepository.count({ where: { is_active: true } });
        const nutritionists = await this.userRepository.count({ where: { role: { name: RoleName.NUTRITIONIST } } });
        const patients = await this.userRepository.count({ where: { role: { name: RoleName.PATIENT } } });
        const admins = await this.userRepository.count({ where: { role: { name: RoleName.ADMIN } } });
        
        // Usuarios registrados en los últimos 30 días
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const newUsersLastMonth = await this.userRepository.count({
            where: { created_at: { $gte: thirtyDaysAgo } as any }
        });

        return {
            total: totalUsers,
            active: activeUsers,
            nutritionists,
            patients,
            admins,
            newLastMonth: newUsersLastMonth,
            activePercentage: Math.round((activeUsers / totalUsers) * 100)
        };
    }

    private async getAppointmentStats() {
        const totalAppointments = await this.appointmentRepository.count();
        const completedAppointments = await this.appointmentRepository.count({ 
            where: { status: AppointmentStatus.COMPLETED } 
        });
        const scheduledAppointments = await this.appointmentRepository.count({ 
            where: { status: AppointmentStatus.SCHEDULED } 
        });
        const canceledAppointments = await this.appointmentRepository.count({ 
            where: { status: AppointmentStatus.CANCELLED_BY_PATIENT } 
        });

        // Citas de hoy
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        
        const appointmentsToday = await this.appointmentRepository.count({
            where: {
                start_time: MoreThanOrEqual(today)
            }
        });

        return {
            total: totalAppointments,
            completed: completedAppointments,
            scheduled: scheduledAppointments,
            canceled: canceledAppointments,
            today: appointmentsToday,
            completionRate: totalAppointments > 0 ? Math.round((completedAppointments / totalAppointments) * 100) : 0
        };
    }

    private async getFinancialStats() {
        const totalTransactions = await this.paymentTransactionRepository.count();
        const successfulTransactions = await this.paymentTransactionRepository.count({
            where: { status: PaymentStatus.SUCCESS }
        });
        
        // Ingresos totales (necesitaría sumar amounts, pero es un ejemplo)
        const totalRevenue = successfulTransactions * 100; // Placeholder

        return {
            totalTransactions,
            successfulTransactions,
            totalRevenue,
            successRate: totalTransactions > 0 ? Math.round((successfulTransactions / totalTransactions) * 100) : 0
        };
    }

    private async getContentStats() {
        const totalFoods = await this.foodRepository.count();
        const totalRecipes = await this.recipeRepository.count();
        const totalEducationalContent = await this.educationalContentRepository.count();
        const publishedContent = await this.educationalContentRepository.count({
            where: { is_published: true }
        });
        const totalTemplates = await this.weeklyPlanTemplateRepository.count();
        const publicTemplates = await this.weeklyPlanTemplateRepository.count({
            where: { isPublic: true }
        });

        return {
            foods: totalFoods,
            recipes: totalRecipes,
            educationalContent: totalEducationalContent,
            publishedContent,
            templates: totalTemplates,
            publicTemplates,
            contentPublishRate: totalEducationalContent > 0 ? Math.round((publishedContent / totalEducationalContent) * 100) : 0
        };
    }

    private async getActivityStats() {
        const totalClinicalRecords = await this.clinicalRecordRepository.count();
        const totalConversations = await this.conversationRepository.count();
        const totalMessages = await this.messageRepository.count();
        const totalReviews = await this.nutritionistReviewRepository.count();
        const totalDietPlans = await this.dietPlanRepository.count();

        return {
            clinicalRecords: totalClinicalRecords,
            conversations: totalConversations,
            messages: totalMessages,
            reviews: totalReviews,
            dietPlans: totalDietPlans,
            avgMessagesPerConversation: totalConversations > 0 ? Math.round(totalMessages / totalConversations) : 0
        };
    }

    // --- HERRAMIENTAS DE INTEGRIDAD DE DATOS ---

    public async diagnosisDataIntegrity() {
        try {
            console.log('🩺 Ejecutando diagnóstico de integridad de datos...');

            // 1. Análisis de usuarios
            const users = await this.userRepository.find({
                relations: ['role'],
                order: { created_at: 'DESC' }
            });

            const nutritionists = users.filter(u => u.role.name === RoleName.NUTRITIONIST);
            const patients = users.filter(u => u.role.name === RoleName.PATIENT);
            const activeUsers = users.filter(u => u.is_active);

            // 2. Análisis de relaciones
            const relations = await this.relationRepository.find({
                relations: ['patient', 'nutritionist', 'patient.role', 'nutritionist.role'],
                order: { requested_at: 'DESC' }
            });

            const activeRelations = relations.filter(r => r.status === RelationshipStatus.ACTIVE);
            const inactiveRelations = relations.filter(r => r.status !== RelationshipStatus.ACTIVE);

            // 3. Análisis de planes de dieta
            const dietPlans = await this.dietPlanRepository.find({
                relations: ['patient', 'nutritionist'],
                order: { created_at: 'DESC' }
            });

            // 4. Detectar planes huérfanos
            const orphanPlans = [];
            for (const plan of dietPlans) {
                const hasActiveRelation = await this.relationRepository.findOne({
                    where: {
                        nutritionist: { id: plan.nutritionist.id },
                        patient: { id: plan.patient.id },
                        status: RelationshipStatus.ACTIVE
                    }
                });

                if (!hasActiveRelation) {
                    orphanPlans.push({
                        planId: plan.id,
                        planName: plan.name,
                        nutritionistEmail: plan.nutritionist?.email,
                        patientEmail: plan.patient?.email,
                        createdAt: plan.created_at,
                        status: plan.status,
                        reason: 'Sin relación activa'
                    });
                }
            }

            // 5. Estadísticas finales
            const diagnosis = {
                timestamp: new Date().toISOString(),
                users: {
                    total: users.length,
                    nutritionists: nutritionists.length,
                    patients: patients.length,
                    active: activeUsers.length,
                    inactive: users.length - activeUsers.length
                },
                relations: {
                    total: relations.length,
                    active: activeRelations.length,
                    inactive: inactiveRelations.length,
                    pending: relations.filter(r => r.status === RelationshipStatus.PENDING).length,
                    rejected: relations.filter(r => r.status === RelationshipStatus.REJECTED).length
                },
                dietPlans: {
                    total: dietPlans.length,
                    orphan: orphanPlans.length,
                    valid: dietPlans.length - orphanPlans.length
                },
                integrity: {
                    status: orphanPlans.length === 0 ? 'EXCELENTE' : 'PROBLEMAS_DETECTADOS',
                    hasProblems: orphanPlans.length > 0,
                    problemsCount: orphanPlans.length
                },
                orphanPlans: orphanPlans.slice(0, 20), // Limitar a 20 para el API
                recommendations: orphanPlans.length > 0 ? [
                    'Se detectaron planes huérfanos (sin relación activa)',
                    'Ejecutar reparación automática para crear relaciones necesarias',
                    'Verificar que no se hayan eliminado relaciones accidentalmente'
                ] : [
                    'No se detectaron problemas de integridad',
                    'Sistema funcionando correctamente'
                ]
            };

            console.log(`✅ Diagnóstico completado: ${diagnosis.integrity.status}`);
            return diagnosis;

        } catch (error) {
            console.error('❌ Error en diagnóstico de integridad:', error);
            throw new AppError('Error al ejecutar diagnóstico de integridad', 500);
        }
    }

    public async repairDataIntegrity(dryRun: boolean = true) {
        try {
            console.log(`🔧 Ejecutando reparación de integridad (${dryRun ? 'SIMULACIÓN' : 'REAL'})...`);

            // Obtener planes huérfanos
            const dietPlans = await this.dietPlanRepository.find({
                relations: ['patient', 'nutritionist']
            });

            const repairActions = [];
            const relationsToCreate = new Map();

            // Identificar relaciones que necesitan crearse
            for (const plan of dietPlans) {
                const hasActiveRelation = await this.relationRepository.findOne({
                    where: {
                        nutritionist: { id: plan.nutritionist.id },
                        patient: { id: plan.patient.id },
                        status: RelationshipStatus.ACTIVE
                    }
                });

                if (!hasActiveRelation) {
                    const relationKey = `${plan.nutritionist.id}_${plan.patient.id}`;
                    if (!relationsToCreate.has(relationKey)) {
                        relationsToCreate.set(relationKey, {
                            nutritionist_id: plan.nutritionist.id,
                            patient_id: plan.patient.id,
                            nutritionistEmail: plan.nutritionist?.email,
                            patientEmail: plan.patient?.email,
                            plansCount: 0,
                            planNames: []
                        });
                    }
                    
                    const relationData = relationsToCreate.get(relationKey);
                    relationData.plansCount++;
                    relationData.planNames.push(plan.name);
                }
            }

            // Ejecutar reparaciones si no es simulación
            let successCount = 0;
            let errorCount = 0;

            if (!dryRun && relationsToCreate.size > 0) {
                for (const [key, relationData] of relationsToCreate) {
                    try {
                        // Verificar que ambos usuarios existan y tengan roles correctos
                        const nutritionist = await this.userRepository.findOne({
                            where: { id: relationData.nutritionist_id },
                            relations: ['role']
                        });
                        
                        const patient = await this.userRepository.findOne({
                            where: { id: relationData.patient_id },
                            relations: ['role']
                        });

                        if (!nutritionist || !patient) {
                            errorCount++;
                            repairActions.push({
                                action: 'ERROR',
                                nutritionistEmail: relationData.nutritionistEmail,
                                patientEmail: relationData.patientEmail,
                                error: 'Usuario no encontrado'
                            });
                            continue;
                        }

                        if (nutritionist.role.name !== RoleName.NUTRITIONIST || patient.role.name !== RoleName.PATIENT) {
                            errorCount++;
                            repairActions.push({
                                action: 'ERROR',
                                nutritionistEmail: relationData.nutritionistEmail,
                                patientEmail: relationData.patientEmail,
                                error: 'Roles incorrectos'
                            });
                            continue;
                        }

                        // Crear la relación
                        const newRelation = new PatientNutritionistRelation();
                        newRelation.nutritionist = nutritionist;
                        newRelation.patient = patient;
                        newRelation.status = RelationshipStatus.ACTIVE;
                        newRelation.notes = 'Relación creada automáticamente para reparar integridad de datos';
                        newRelation.requested_at = new Date();
                        newRelation.accepted_at = new Date();

                        await this.relationRepository.save(newRelation);
                        successCount++;

                        repairActions.push({
                            action: 'CREATED',
                            nutritionistEmail: relationData.nutritionistEmail,
                            patientEmail: relationData.patientEmail,
                            plansCount: relationData.plansCount,
                            planNames: relationData.planNames.slice(0, 3) // Máximo 3 nombres
                        });

                    } catch (error: any) {
                        errorCount++;
                        repairActions.push({
                            action: 'ERROR',
                            nutritionistEmail: relationData.nutritionistEmail,
                            patientEmail: relationData.patientEmail,
                            error: error.message || 'Error desconocido'
                        });
                    }
                }
            } else {
                // Modo simulación - solo preparar acciones
                for (const [key, relationData] of relationsToCreate) {
                    repairActions.push({
                        action: 'SIMULATED',
                        nutritionistEmail: relationData.nutritionistEmail,
                        patientEmail: relationData.patientEmail,
                        plansCount: relationData.plansCount,
                        planNames: relationData.planNames.slice(0, 3)
                    });
                }
            }

            const result = {
                timestamp: new Date().toISOString(),
                mode: dryRun ? 'SIMULACIÓN' : 'EJECUCIÓN REAL',
                summary: {
                    relationsToCreate: relationsToCreate.size,
                    successfulCreations: successCount,
                    errors: errorCount,
                    totalActions: repairActions.length
                },
                actions: repairActions,
                message: dryRun 
                    ? `Simulación completada: ${relationsToCreate.size} relaciones serían creadas`
                    : `Reparación completada: ${successCount} relaciones creadas, ${errorCount} errores`
            };

            console.log(`✅ Reparación completada: ${result.message}`);
            return result;

        } catch (error) {
            console.error('❌ Error en reparación de integridad:', error);
            throw new AppError('Error al ejecutar reparación de integridad', 500);
        }
    }

    /**
     * Obtiene el query builder para las eliminaciones con filtros
     */
    public getEliminaciones(
        fechaDesde?: string,
        fechaHasta?: string,
        nutriologoId?: string,
        pacienteId?: string,
        page: number = 1,
        limit: number = 50
    ) {
        const queryBuilder = this.relationRepository
            .createQueryBuilder('relation')
            .leftJoinAndSelect('relation.patient', 'patient')
            .leftJoinAndSelect('relation.nutritionist', 'nutritionist')
            .where('relation.status = :status', { status: RelationshipStatus.INACTIVE })
            .orderBy('relation.ended_at', 'DESC');

        // Filtros opcionales
        if (fechaDesde) {
            queryBuilder.andWhere('relation.ended_at >= :fechaDesde', { fechaDesde });
        }
        if (fechaHasta) {
            queryBuilder.andWhere('relation.ended_at <= :fechaHasta', { fechaHasta });
        }
        if (nutriologoId) {
            queryBuilder.andWhere('nutritionist.id = :nutriologoId', { nutriologoId });
        }
        if (pacienteId) {
            queryBuilder.andWhere('patient.id = :pacienteId', { pacienteId });
        }

        // Paginación
        const skip = (page - 1) * limit;
        queryBuilder.skip(skip).take(limit);

        return queryBuilder;
    }

    /**
     * Obtiene estadísticas de eliminaciones
     */
    public async getEliminacionesStats() {
        const stats = await this.relationRepository
            .createQueryBuilder('relation')
            .where('relation.status = :status', { status: RelationshipStatus.INACTIVE })
            .select([
                'COUNT(DISTINCT relation.patient) as pacientesUnicos',
                'COUNT(DISTINCT relation.nutritionist) as nutriologosInvolucrados',
                'COUNT(*) as totalEliminaciones',
                'COUNT(CASE WHEN relation.elimination_reason IS NOT NULL AND relation.elimination_reason != \'\' THEN 1 END) as conMotivo',
                'COUNT(CASE WHEN relation.elimination_reason IS NULL OR relation.elimination_reason = \'\' THEN 1 END) as sinMotivo'
            ])
            .getRawOne();

        return {
            pacientesUnicos: stats.pacientesUnicos || 0,
            nutriologosInvolucrados: stats.nutriologosInvolucrados || 0,
            totalEliminaciones: stats.totalEliminaciones || 0,
            conMotivo: stats.conMotivo || 0,
            sinMotivo: stats.sinMotivo || 0
        };
    }

    public async getSystemHealth() {
        try {
            // Métricas básicas del sistema
            const userCount = await this.userRepository.count();
            const activeUserCount = await this.userRepository.count({ where: { is_active: true } });
            const relationCount = await this.relationRepository.count();
            const activeRelationCount = await this.relationRepository.count({ where: { status: RelationshipStatus.ACTIVE } });
            const dietPlanCount = await this.dietPlanRepository.count();

            // Ejecutar diagnóstico rápido
            const diagnosis = await this.diagnosisDataIntegrity();

            return {
                timestamp: new Date().toISOString(),
                metrics: {
                    users: {
                        total: userCount,
                        active: activeUserCount,
                        activePercentage: Math.round((activeUserCount / userCount) * 100)
                    },
                    relations: {
                        total: relationCount,
                        active: activeRelationCount,
                        activePercentage: relationCount > 0 ? Math.round((activeRelationCount / relationCount) * 100) : 0
                    },
                    dietPlans: {
                        total: dietPlanCount
                    }
                },
                integrity: diagnosis.integrity,
                status: diagnosis.integrity.hasProblems ? 'WARNING' : 'HEALTHY',
                lastCheck: diagnosis.timestamp
            };

        } catch (error) {
            console.error('❌ Error obteniendo salud del sistema:', error);
            throw new AppError('Error al obtener métricas de salud del sistema', 500);
        }
    }
}

export default new AdminService();