import { Repository, DataSource } from 'typeorm';
import { SubscriptionPlan, PlanType, PlanStatus } from '@/database/entities/subscription_plan.entity';
import { UserSubscription, SubscriptionStatus } from '@/database/entities/user_subscription.entity';
import { User } from '@/database/entities/user.entity';
import { AppError } from '@/utils/app.error';
import { AppDataSource } from '@/database/data-source';
import {
    CreateSubscriptionPlanDto,
    UpdateSubscriptionPlanDto,
    SubscribeToPlanDto,
    UpdateUserSubscriptionStatusDto,
} from '@/modules/subscriptions/subscription.dto';
import { RoleName } from '@/database/entities/role.entity';

export class SubscriptionService {
    private subscriptionPlanRepository: Repository<SubscriptionPlan>;
    private userSubscriptionRepository: Repository<UserSubscription>;
    private userRepository: Repository<User>;

    constructor() {
        this.subscriptionPlanRepository = AppDataSource.getRepository(SubscriptionPlan);
        this.userSubscriptionRepository = AppDataSource.getRepository(UserSubscription);
        this.userRepository = AppDataSource.getRepository(User);
    }

    // ==================== GESTIÓN DE PLANES ====================
    
    async getAvailablePlans(): Promise<SubscriptionPlan[]> {
        return await this.subscriptionPlanRepository.find({
            where: { status: PlanStatus.ACTIVE },
            order: { price: 'ASC' }
        });
    }

    async getPlanById(planId: string): Promise<SubscriptionPlan> {
        const plan = await this.subscriptionPlanRepository.findOne({
            where: { id: planId, status: PlanStatus.ACTIVE }
        });

        if (!plan) {
            throw new AppError('Plan de suscripción no encontrado', 404);
        }

        return plan;
    }

    // ==================== CREAR SUSCRIPCIÓN ====================
    
    async createUserSubscription(
        userId: string, 
        planId: string, 
        paymentData?: {
            amount_paid: number;
            payment_method?: string;
            payment_reference?: string;
        }
    ): Promise<UserSubscription> {
        // Verificar que el usuario existe
        const user = await this.userRepository.findOne({ where: { id: userId } });
        if (!user) {
            throw new AppError('Usuario no encontrado', 404);
        }

        // Verificar que el plan existe
        const plan = await this.getPlanById(planId);

        // Verificar si ya tiene una suscripción activa
        const existingSubscription = await this.userSubscriptionRepository.findOne({
            where: { 
                user: { id: userId }, 
                status: SubscriptionStatus.ACTIVE 
            }
        });

        if (existingSubscription) {
            throw new AppError('El usuario ya tiene una suscripción activa', 409);
        }

        // Calcular fechas
        const startDate = new Date();
        const endDate = new Date();
        endDate.setDate(startDate.getDate() + plan.duration_days);

        // Crear la suscripción
        const subscription = this.userSubscriptionRepository.create({
            user: user,
            subscription_plan: plan,
            status: paymentData ? SubscriptionStatus.ACTIVE : SubscriptionStatus.PENDING,
            start_date: startDate,
            end_date: endDate,
            amount_paid: paymentData?.amount_paid || plan.price,
            currency: 'MXN',
            payment_method: paymentData?.payment_method || null,
            payment_reference: paymentData?.payment_reference || null,
            consultations_used: 0,
            auto_renew: false
        });

        return await this.userSubscriptionRepository.save(subscription);
    }

    // ==================== CONSULTAR SUSCRIPCIONES ====================
    
    async getUserActiveSubscription(userId: string): Promise<UserSubscription | null> {
        return await this.userSubscriptionRepository.findOne({
            where: { 
                user: { id: userId }, 
                status: SubscriptionStatus.ACTIVE 
            },
            relations: ['subscription_plan']
        });
    }

    async getUserSubscriptionHistory(userId: string): Promise<UserSubscription[]> {
        return await this.userSubscriptionRepository.find({
            where: { user: { id: userId } },
            relations: ['subscription_plan'],
            order: { created_at: 'DESC' }
        });
    }

    // ==================== MÉTODOS DE COMPATIBILIDAD ====================
    
    // Métodos de compatibilidad para el controlador existente
    async getAllSubscriptionPlans(isActive?: boolean): Promise<SubscriptionPlan[]> {
        const whereClause: any = {};
        if (isActive !== undefined) {
            whereClause.status = isActive ? PlanStatus.ACTIVE : PlanStatus.INACTIVE;
        }
        return await this.subscriptionPlanRepository.find({ 
            where: whereClause, 
            order: { price: 'ASC' } 
        });
    }

    async getSubscriptionPlanById(planId: string): Promise<SubscriptionPlan> {
        return await this.getPlanById(planId);
    }

    async getMySubscription(userId: string): Promise<UserSubscription | null> {
        return await this.getUserActiveSubscription(userId);
    }

    // ==================== MÉTODOS IMPLEMENTADOS PARA EL CONTROLADOR ====================

    async createSubscriptionPlan(planData: CreateSubscriptionPlanDto, adminId: string): Promise<SubscriptionPlan> {
        // Verificar que el admin existe
        const admin = await this.userRepository.findOne({ 
            where: { id: adminId },
            relations: ['role']
        });
        
        if (!admin || admin.role.name !== RoleName.ADMIN) {
            throw new AppError('Solo los administradores pueden crear planes', 403);
        }

        // Calcular duration_days basado en durationType
        let durationDays = 30; // Por defecto mensual
        if (planData.durationType === 'annual') {
            durationDays = 365;
        }

        const plan = this.subscriptionPlanRepository.create({
            name: planData.name,
            description: planData.description || null,
            price: planData.price,
            duration_days: durationDays,
            max_consultations: null, // Por defecto ilimitadas
            includes_nutrition_plan: true, // Por defecto incluido
            includes_progress_tracking: false,
            includes_messaging: false,
            type: planData.durationType === 'annual' ? PlanType.ANNUAL : PlanType.MONTHLY,
            status: planData.isActive !== false ? PlanStatus.ACTIVE : PlanStatus.INACTIVE
        });

        return await this.subscriptionPlanRepository.save(plan);
    }

    async updateSubscriptionPlan(planId: string, planData: UpdateSubscriptionPlanDto, adminId: string): Promise<SubscriptionPlan> {
        // Verificar que el admin existe
        const admin = await this.userRepository.findOne({ 
            where: { id: adminId },
            relations: ['role']
        });
        
        if (!admin || admin.role.name !== RoleName.ADMIN) {
            throw new AppError('Solo los administradores pueden actualizar planes', 403);
        }

        const plan = await this.subscriptionPlanRepository.findOne({ where: { id: planId } });
        if (!plan) {
            throw new AppError('Plan no encontrado', 404);
        }

        // Actualizar campos según DTO
        if (planData.name !== undefined) plan.name = planData.name;
        if (planData.description !== undefined) plan.description = planData.description;
        if (planData.price !== undefined) plan.price = planData.price;
        if (planData.durationType !== undefined) {
            plan.type = planData.durationType === 'annual' ? PlanType.ANNUAL : PlanType.MONTHLY;
            plan.duration_days = planData.durationType === 'annual' ? 365 : 30;
        }
        if (planData.isActive !== undefined) {
            plan.status = planData.isActive ? PlanStatus.ACTIVE : PlanStatus.INACTIVE;
        }

        return await this.subscriptionPlanRepository.save(plan);
    }

    async deleteSubscriptionPlan(planId: string, adminId: string): Promise<void> {
        // Verificar que el admin existe
        const admin = await this.userRepository.findOne({ 
            where: { id: adminId },
            relations: ['role']
        });
        
        if (!admin || admin.role.name !== RoleName.ADMIN) {
            throw new AppError('Solo los administradores pueden eliminar planes', 403);
        }

        const plan = await this.subscriptionPlanRepository.findOne({ where: { id: planId } });
        if (!plan) {
            throw new AppError('Plan no encontrado', 404);
        }

        // En lugar de eliminar, marcamos como inactivo
        plan.status = PlanStatus.INACTIVE;
        await this.subscriptionPlanRepository.save(plan);
    }

    async subscribeToPlan(userId: string, subscriptionData: SubscribeToPlanDto): Promise<UserSubscription> {
        return await this.createUserSubscription(
            userId, 
            subscriptionData.planId, // Correcto: usando planId del DTO
            {
                amount_paid: 0, // Se calculará según el plan
                payment_method: 'stripe', // Por defecto
                payment_reference: subscriptionData.paymentToken
            }
        );
    }

    async updateUserSubscriptionStatus(
        subscriptionId: string, 
        statusData: { status: SubscriptionStatus; cancelReason?: string }, 
        userId: string, 
        userRole: RoleName
    ): Promise<UserSubscription> {
        const subscription = await this.userSubscriptionRepository.findOne({
            where: { id: subscriptionId },
            relations: ['user']
        });

        if (!subscription) {
            throw new AppError('Suscripción no encontrada', 404);
        }

        // Verificar permisos: solo el owner o admin pueden actualizar
        if (userRole !== RoleName.ADMIN && subscription.user.id !== userId) {
            throw new AppError('No tienes permisos para actualizar esta suscripción', 403);
        }

        subscription.status = statusData.status;
        if (statusData.cancelReason) {
            subscription.cancellation_reason = statusData.cancelReason;
        }

        return await this.userSubscriptionRepository.save(subscription);
    }

    async handleWebhookEvent(eventType: string, eventData: any): Promise<{ received: boolean; message?: string }> {
        try {
            console.log('Webhook recibido:', eventType, eventData);
            
            // Simular procesamiento de webhook
            switch (eventType) {
                case 'payment.succeeded':
                    // Actualizar suscripción a activa
                    if (eventData.subscription_id) {
                        const subscription = await this.userSubscriptionRepository.findOne({
                            where: { id: eventData.subscription_id }
                        });
                        if (subscription) {
                            subscription.status = SubscriptionStatus.ACTIVE;
                            subscription.payment_reference = eventData.payment_id;
                            await this.userSubscriptionRepository.save(subscription);
                        }
                    }
                    break;
                case 'payment.failed':
                    // Marcar suscripción como fallida
                    if (eventData.subscription_id) {
                        const subscription = await this.userSubscriptionRepository.findOne({
                            where: { id: eventData.subscription_id }
                        });
                        if (subscription) {
                            subscription.status = SubscriptionStatus.EXPIRED;
                            await this.userSubscriptionRepository.save(subscription);
                        }
                    }
                    break;
                default:
                    console.log('Tipo de evento no manejado:', eventType);
            }

            return { received: true, message: 'Webhook procesado correctamente' };
        } catch (error) {
            console.error('Error procesando webhook:', error);
            return { received: true, message: 'Error procesando webhook' };
        }
    }
}

export default new SubscriptionService();
