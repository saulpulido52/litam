// src/modules/subscriptions/subscription.service.ts
import { Repository } from 'typeorm';
import { AppDataSource } from '@/database/data-source';
import { User } from '@/database/entities/user.entity';
import {
    SubscriptionPlan,
    SubscriptionDurationType,
} from '@/database/entities/subscription_plan.entity';
import {
    UserSubscription,
    UserSubscriptionStatus,
} from '@/database/entities/user_subscription.entity';
import {
    PaymentTransaction,
    PaymentStatus,
} from '@/database/entities/payment_transaction.entity';
import {
    CreateSubscriptionPlanDto,
    UpdateSubscriptionPlanDto,
    SubscribeToPlanDto,
    UpdateUserSubscriptionStatusDto,
    CreatePaymentTransactionDto,
} from '@/modules/subscriptions/subscription.dto';
import { AppError } from '@/utils/app.error';
import { RoleName } from '@/database/entities/role.entity';

// Interfaz para el resultado del procesamiento de pago (incluye datos de transacción y de Stripe)
interface PaymentProcessingResult extends CreatePaymentTransactionDto {
    stripe_customer_id?: string;
    stripe_subscription_id?: string;
}

class SubscriptionService {
    private userRepository: Repository<User>;
    private subscriptionPlanRepository: Repository<SubscriptionPlan>;
    private userSubscriptionRepository: Repository<UserSubscription>;
    private paymentTransactionRepository: Repository<PaymentTransaction>;

    constructor() {
        this.userRepository = AppDataSource.getRepository(User);
        this.subscriptionPlanRepository = AppDataSource.getRepository(SubscriptionPlan);
        this.userSubscriptionRepository = AppDataSource.getRepository(UserSubscription);
        this.paymentTransactionRepository = AppDataSource.getRepository(PaymentTransaction);
    }

    // --- Gestión de Planes de Suscripción (Solo Administradores) ---

    public async createSubscriptionPlan(planDto: CreateSubscriptionPlanDto, createdById: string) {
        const creator = await this.userRepository.findOne({ where: { id: createdById, role: { name: RoleName.ADMIN } } });
        if (!creator) {
            throw new AppError('Acceso denegado. Solo los administradores pueden crear planes de suscripción.', 403);
        }

        const existingPlan = await this.subscriptionPlanRepository.findOneBy({
            name: planDto.name,
            duration_type: planDto.durationType,
        });
        if (existingPlan) {
            throw new AppError('Ya existe un plan de suscripción con este nombre y tipo de duración.', 409);
        }

        const newPlan = this.subscriptionPlanRepository.create({
            name: planDto.name,
            description: planDto.description,
            price: planDto.price,
            duration_type: planDto.durationType,
            features: planDto.features,
            is_active: planDto.isActive !== undefined ? planDto.isActive : true,
        });

        await this.subscriptionPlanRepository.save(newPlan);
        return newPlan;
    }

    public async getAllSubscriptionPlans(isActive?: boolean) {
        const whereClause: any = {};
        if (isActive !== undefined) {
            whereClause.is_active = isActive;
        }
        const plans = await this.subscriptionPlanRepository.find({ where: whereClause, order: { price: 'ASC' } });
        return plans;
    }

    public async getSubscriptionPlanById(planId: string) {
        const plan = await this.subscriptionPlanRepository.findOneBy({ id: planId });
        if (!plan) {
            throw new AppError('Plan de suscripción no encontrado.', 404);
        }
        return plan;
    }

    public async updateSubscriptionPlan(planId: string, updateDto: UpdateSubscriptionPlanDto, updaterId: string) {
        const updater = await this.userRepository.findOne({ where: { id: updaterId, role: { name: RoleName.ADMIN } } });
        if (!updater) {
            throw new AppError('Acceso denegado. Solo los administradores pueden actualizar planes de suscripción.', 403);
        }

        const plan = await this.subscriptionPlanRepository.findOneBy({ id: planId });
        if (!plan) {
            throw new AppError('Plan de suscripción no encontrado.', 404);
        }

        if (updateDto.name !== undefined || updateDto.durationType !== undefined) {
            const newName = updateDto.name || plan.name;
            const newDurationType = updateDto.durationType || plan.duration_type;
            const existingPlan = await this.subscriptionPlanRepository.findOneBy({
                name: newName,
                duration_type: newDurationType,
            });
            if (existingPlan && existingPlan.id !== plan.id) {
                throw new AppError('Ya existe otro plan con este nombre y tipo de duración.', 409);
            }
        }

        Object.assign(plan, updateDto);
        await this.subscriptionPlanRepository.save(plan);
        return plan;
    }

    public async deleteSubscriptionPlan(planId: string, deleterId: string) {
        const deleter = await this.userRepository.findOne({ where: { id: deleterId, role: { name: RoleName.ADMIN } } });
        if (!deleter) {
            throw new AppError('Acceso denegado. Solo los administradores pueden eliminar planes de suscripción.', 403);
        }

        const plan = await this.subscriptionPlanRepository.findOneBy({ id: planId });
        if (!plan) {
            throw new AppError('Plan de suscripción no encontrado.', 404);
        }

        const activeSubscriptions = await this.userSubscriptionRepository.count({ where: { subscription_plan: { id: planId }, status: UserSubscriptionStatus.ACTIVE } });
        if (activeSubscriptions > 0) {
            throw new AppError('No se puede eliminar un plan con suscriptores activos. Desactívelo primero.', 400);
        }

        await this.subscriptionPlanRepository.remove(plan);
        return { message: 'Plan de suscripción eliminado con éxito.' };
    }

    // --- Gestión de Suscripciones de Usuario (Pacientes) ---

    public async subscribeToPlan(patientId: string, subscribeDto: SubscribeToPlanDto) {
        const patient = await this.userRepository.findOne({
            where: { id: patientId, role: { name: RoleName.PATIENT } },
            relations: ['user_subscription'], // Cargar la suscripción existente del paciente
        });
        if (!patient) {
            throw new AppError('Paciente no encontrado o no autorizado.', 403);
        }

        const plan = await this.subscriptionPlanRepository.findOneBy({ id: subscribeDto.planId });
        if (!plan || !plan.is_active) {
            throw new AppError('Plan de suscripción no encontrado o no activo.', 404);
        }

        // Verificar si el paciente ya tiene una suscripción activa
        if (patient.user_subscription && patient.user_subscription.status === UserSubscriptionStatus.ACTIVE) {
            throw new AppError(`El paciente ya tiene una suscripción activa al plan '${patient.user_subscription.subscription_plan.name}'.`, 409);
        }

        // Simulación de procesamiento de pago
        const paymentResult = await this.processPayment(patient, plan, subscribeDto.paymentToken);

        if (paymentResult.status !== PaymentStatus.SUCCESS) {
            throw new AppError(`El pago falló: ${paymentResult.gatewayResponseCode || 'Error desconocido'}.`, 400);
        }

        // Calcular fechas de inicio y fin
        const startDate = new Date();
        let endDate: Date | null = null;
        let nextRenewalDate: Date | null = null;

        if (plan.duration_type === SubscriptionDurationType.MONTHLY) {
            endDate = new Date(startDate.getFullYear(), startDate.getMonth() + 1, startDate.getDate());
            nextRenewalDate = endDate;
        } else if (plan.duration_type === SubscriptionDurationType.YEARLY) {
            endDate = new Date(startDate.getFullYear() + 1, startDate.getMonth(), startDate.getDate());
            nextRenewalDate = endDate;
        } else if (plan.duration_type === SubscriptionDurationType.LIFETIME) {
            endDate = null;
            nextRenewalDate = null;
        }
        
        // Crear o actualizar la suscripción del usuario
        let userSubscription: UserSubscription;

        if (patient.user_subscription) {
            // Actualizar suscripción existente (ej: de cancelada/expirada a activa, o cambiar de plan)
            userSubscription = patient.user_subscription; // Usar la instancia cargada
            userSubscription.subscription_plan = plan;
            userSubscription.start_date = startDate;
            userSubscription.end_date = endDate;
            userSubscription.status = UserSubscriptionStatus.ACTIVE;
            userSubscription.last_payment_date = new Date();
            userSubscription.next_renewal_date = nextRenewalDate;
            userSubscription.stripe_customer_id = paymentResult.stripe_customer_id || null; // Asignar IDs de Stripe
            userSubscription.stripe_subscription_id = paymentResult.stripe_subscription_id || null;
            userSubscription.cancel_date = null;
            userSubscription.cancel_reason = null;
        } else {
            // Crear nueva suscripción
            userSubscription = this.userSubscriptionRepository.create({
                patient: patient,
                subscription_plan: plan,
                start_date: startDate,
                end_date: endDate,
                status: UserSubscriptionStatus.ACTIVE,
                last_payment_date: new Date(),
                next_renewal_date: nextRenewalDate,
                stripe_customer_id: paymentResult.stripe_customer_id || null, // Asignar IDs de Stripe
                stripe_subscription_id: paymentResult.stripe_subscription_id || null,
            });
        }

        await this.userSubscriptionRepository.save(userSubscription);

        // Registrar la transacción de pago
        await this.recordPaymentTransaction(patient, plan, paymentResult); // Pasa paymentResult que ya es CreatePaymentTransactionDto

        return userSubscription;
    }

    public async getMySubscription(patientId: string) {
        const subscription = await this.userSubscriptionRepository.findOne({
            where: { patient: { id: patientId } },
            relations: ['subscription_plan'], // Cargar detalles del plan
        });
        if (!subscription) {
            return null; // El paciente no tiene una suscripción
        }
        return subscription;
    }

    public async updateUserSubscriptionStatus(userSubscriptionId: string, updateDto: UpdateUserSubscriptionStatusDto, updaterId: string, updaterRole: RoleName) {
        const subscription = await this.userSubscriptionRepository.findOne({
            where: { id: userSubscriptionId },
            relations: ['patient', 'subscription_plan'],
        });
        if (!subscription) {
            throw new AppError('Suscripción no encontrada.', 404);
        }

        // Permisos: solo el paciente dueño, un admin, o un webhook (que sería un tipo especial de 'admin')
        if (updaterRole === RoleName.PATIENT && subscription.patient.id !== updaterId) {
            throw new AppError('No tienes permiso para actualizar esta suscripción.', 403);
        } else if (updaterRole !== RoleName.ADMIN && updaterRole !== RoleName.PATIENT) { // Si no es paciente ni admin
            throw new AppError('Acceso denegado. Rol no autorizado para actualizar suscripciones.', 403);
        }

        // Validaciones de transición de estado
        if (updateDto.status === UserSubscriptionStatus.ACTIVE && subscription.status === UserSubscriptionStatus.EXPIRED) {
            // Permitir reactivación si el pago se procesa
            // En un sistema real, esto iría de la mano con un proceso de pago
        } else if (updateDto.status === UserSubscriptionStatus.CANCELLED) {
            // Lógica de cancelación de suscripción recurrente en pasarela de pagos (simulado)
            // if (subscription.stripe_subscription_id) { await stripe.cancelSubscription(subscription.stripe_subscription_id); }
            subscription.cancel_date = new Date();
            subscription.cancel_reason = updateDto.cancelReason || 'Cancelado por usuario/admin.';
        } else if (updateDto.status === UserSubscriptionStatus.EXPIRED && subscription.status !== UserSubscriptionStatus.PENDING_PAYMENT) {
            throw new AppError('Una suscripción solo puede expirar si el pago está pendiente.', 400);
        }

        subscription.status = updateDto.status;
        await this.userSubscriptionRepository.save(subscription);
        return subscription;
    }


    // --- Métodos de Pagos (Internos o por Webhook) ---

    // Simulación de procesamiento de pago con pasarela
    private async processPayment(user: User, plan: SubscriptionPlan, paymentToken: string): Promise<PaymentProcessingResult> {
        console.log(`[SIMULACIÓN PAGO] Procesando pago para usuario ${user.email}, plan ${plan.name} con token ${paymentToken}`);

        // Simular éxito o fallo
        if (paymentToken === 'fail-token') {
            return {
                userId: user.id,
                amount: plan.price,
                currency: 'USD',
                status: PaymentStatus.FAILED,
                gatewayTransactionId: 'TXN_FAIL_' + Date.now(),
                paymentMethodType: 'card',
                gatewayResponseCode: 'card_declined',
            };
        }

        // Simular ID de cliente y suscripción recurrente (para Stripe)
        const stripeCustomerId = user.user_subscription?.stripe_customer_id || `cus_${Math.random().toString(36).substring(2, 15)}`;
        const stripeSubscriptionId = plan.duration_type !== SubscriptionDurationType.LIFETIME ? `sub_${Math.random().toString(36).substring(2, 15)}` : null;

        return {
            userId: user.id,
            planId: plan.id, // También para la transacción
            amount: plan.price,
            currency: 'USD',
            status: PaymentStatus.SUCCESS,
            gatewayTransactionId: `TXN_SUCCESS_${Date.now()}`,
            paymentMethodType: 'card',
            gatewayResponseCode: 'approved',
            stripe_customer_id: stripeCustomerId,
            stripe_subscription_id: stripeSubscriptionId || undefined,
        };
    }

    // Registrar una transacción de pago en la BD
    public async recordPaymentTransaction(user: User, plan: SubscriptionPlan, transactionData: CreatePaymentTransactionDto) {
        const transaction = this.paymentTransactionRepository.create({
            user: user,
            subscription_plan: plan,
            amount: transactionData.amount,
            currency: transactionData.currency,
            status: transactionData.status,
            gateway_transaction_id: transactionData.gatewayTransactionId,
            payment_method_type: transactionData.paymentMethodType,
            gateway_response_code: transactionData.gatewayResponseCode, // Usar el campo correcto aquí
        });
        await this.paymentTransactionRepository.save(transaction);
        return transaction;
    }

    // Método para manejar webhooks (ej: de Stripe) - Requiere un controlador y ruta específicos
    public async handleWebhookEvent(eventType: string, eventData: any) {
        console.log(`[WEBHOOK] Evento recibido: ${eventType}`, eventData);
        return { message: 'Webhook procesado (simulado).' };
    }
}

export default new SubscriptionService();