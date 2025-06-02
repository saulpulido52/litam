// src/database/entities/user_subscription.entity.ts
import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    OneToOne,
    ManyToOne,
    JoinColumn,
    CreateDateColumn,
    UpdateDateColumn,
    Unique,
} from 'typeorm';
import { User } from '@/database/entities/user.entity';
import { SubscriptionPlan } from '@/database/entities/subscription_plan.entity';

// Estado de la suscripción de un usuario
export enum UserSubscriptionStatus {
    ACTIVE = 'active', // Suscripción activa y pagada
    PENDING_PAYMENT = 'pending_payment', // Período de gracia, pago pendiente
    CANCELLED = 'cancelled', // Cancelada por el usuario o admin, no se renovará
    EXPIRED = 'expired', // Expirada y no renovada
    TRIAL = 'trial', // Período de prueba
}

@Entity('user_subscriptions')
@Unique(['patient']) // Un paciente solo puede tener una suscripción activa a la vez
export class UserSubscription {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @OneToOne(() => User, (user) => user.user_subscription, { nullable: false, onDelete: 'CASCADE' })
    @JoinColumn({ name: 'patient_user_id' })
    patient!: User;

    @ManyToOne(() => SubscriptionPlan, (plan) => plan.user_subscriptions, { nullable: false, onDelete: 'RESTRICT' }) // Restrict para no borrar plan si hay suscriptores
    @JoinColumn({ name: 'subscription_plan_id' })
    subscription_plan!: SubscriptionPlan;

    @Column({ type: 'timestamptz', nullable: false })
    start_date!: Date;

    @Column({ type: 'timestamptz', nullable: true })
    end_date: Date | null; // Fecha de fin del período actual

    @Column({
        type: 'enum',
        enum: UserSubscriptionStatus,
        default: UserSubscriptionStatus.ACTIVE,
        nullable: false,
    })
    status!: UserSubscriptionStatus;

    @Column({ type: 'timestamptz', nullable: true })
    last_payment_date: Date | null;

    @Column({ type: 'timestamptz', nullable: true })
    next_renewal_date: Date | null;

    @Column({ type: 'varchar', length: 255, nullable: true })
    stripe_customer_id: string | null; // ID del cliente en Stripe

    @Column({ type: 'varchar', length: 255, nullable: true })
    stripe_subscription_id: string | null; // ID de la suscripción recurrente en Stripe

    @Column({ type: 'timestamptz', nullable: true })
    cancel_date: Date | null; // Fecha de cancelación si aplica

    @Column({ type: 'text', nullable: true })
    cancel_reason: string | null; // Razón de la cancelación

    @CreateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
    created_at!: Date;

    @UpdateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
    updated_at!: Date;
}