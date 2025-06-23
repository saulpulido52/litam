import { Repository, DataSource } from 'typeorm';
import { SubscriptionPlan, PlanType, PlanStatus } from '@/database/entities/subscription_plan.entity';
import { UserSubscription, SubscriptionStatus } from '@/database/entities/user_subscription.entity';
import { User } from '@/database/entities/user.entity';
import { AppError } from '@/utils/app.error';

export class SubscriptionService {
    private subscriptionPlanRepository: Repository<SubscriptionPlan>;
    private userSubscriptionRepository: Repository<UserSubscription>;
    private userRepository: Repository<User>;

    constructor(dataSource: DataSource) {
        this.subscriptionPlanRepository = dataSource.getRepository(SubscriptionPlan);
        this.userSubscriptionRepository = dataSource.getRepository(UserSubscription);
        this.userRepository = dataSource.getRepository(User);
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

    // ==================== GESTIÓN DE CONSULTAS ====================
    
    async useConsultation(userId: string): Promise<boolean> {
        const subscription = await this.getUserActiveSubscription(userId);
        
        if (!subscription) {
            throw new AppError('No tienes una suscripción activa', 403);
        }

        // Verificar si tiene consultas disponibles
        if (subscription.subscription_plan.max_consultations && 
            subscription.consultations_used >= subscription.subscription_plan.max_consultations) {
            throw new AppError('Has agotado tus consultas disponibles', 403);
        }

        // Incrementar el contador
        subscription.consultations_used += 1;
        await this.userSubscriptionRepository.save(subscription);

        return true;
    }

    async getConsultationsRemaining(userId: string): Promise<number | null> {
        const subscription = await this.getUserActiveSubscription(userId);
        
        if (!subscription) {
            return null;
        }

        if (!subscription.subscription_plan.max_consultations) {
            return -1; // Ilimitadas
        }

        return subscription.subscription_plan.max_consultations - subscription.consultations_used;
    }

    // ==================== CANCELACIÓN Y RENOVACIÓN ====================
    
    async cancelSubscription(userId: string, reason?: string): Promise<UserSubscription> {
        const subscription = await this.getUserActiveSubscription(userId);
        
        if (!subscription) {
            throw new AppError('No tienes una suscripción activa para cancelar', 404);
        }

        subscription.status = SubscriptionStatus.CANCELLED;
        subscription.cancelled_at = new Date();
        subscription.cancellation_reason = reason || null;

        return await this.userSubscriptionRepository.save(subscription);
    }

    async checkExpiredSubscriptions(): Promise<void> {
        const now = new Date();
        
        await this.userSubscriptionRepository
            .createQueryBuilder()
            .update(UserSubscription)
            .set({ status: SubscriptionStatus.EXPIRED })
            .where('status = :status', { status: SubscriptionStatus.ACTIVE })
            .andWhere('end_date < :now', { now })
            .execute();
    }

    // ==================== ESTADÍSTICAS ====================
    
    async getSubscriptionStats(): Promise<{
        total_active: number;
        total_monthly: number;
        total_annual: number;
        revenue_this_month: number;
    }> {
        const totalActive = await this.userSubscriptionRepository.count({
            where: { status: SubscriptionStatus.ACTIVE }
        });

        const monthlyActive = await this.userSubscriptionRepository
            .createQueryBuilder('subscription')
            .leftJoin('subscription.subscription_plan', 'plan')
            .where('subscription.status = :status', { status: SubscriptionStatus.ACTIVE })
            .andWhere('plan.type = :type', { type: PlanType.MONTHLY })
            .getCount();

        const annualActive = await this.userSubscriptionRepository
            .createQueryBuilder('subscription')
            .leftJoin('subscription.subscription_plan', 'plan')
            .where('subscription.status = :status', { status: SubscriptionStatus.ACTIVE })
            .andWhere('plan.type = :type', { type: PlanType.ANNUAL })
            .getCount();

        // Ingresos de este mes
        const startOfMonth = new Date();
        startOfMonth.setDate(1);
        startOfMonth.setHours(0, 0, 0, 0);

        const revenueResult = await this.userSubscriptionRepository
            .createQueryBuilder('subscription')
            .select('SUM(subscription.amount_paid)', 'total')
            .where('subscription.created_at >= :startOfMonth', { startOfMonth })
            .andWhere('subscription.status != :cancelled', { cancelled: SubscriptionStatus.CANCELLED })
            .getRawOne();

        return {
            total_active: totalActive,
            total_monthly: monthlyActive,
            total_annual: annualActive,
            revenue_this_month: parseFloat(revenueResult?.total || '0')
        };
    }
} 