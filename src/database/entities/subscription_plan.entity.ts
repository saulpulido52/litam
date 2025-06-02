// src/database/entities/subscription_plan.entity.ts
import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    OneToMany,
    Unique,
} from 'typeorm';
import { UserSubscription } from './user_subscription.entity'; // Para la relación inversa

// Tipo de duración del plan (mensual, anual, etc.)
export enum SubscriptionDurationType {
    MONTHLY = 'monthly',
    YEARLY = 'yearly',
    LIFETIME = 'lifetime', // Plan de pago único
}

@Entity('subscription_plans')
@Unique(['name', 'duration_type']) // Un plan con el mismo nombre y duración debe ser único
export class SubscriptionPlan {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column({ type: 'varchar', length: 100, nullable: false })
    name!: string; // Ej: 'Básico Mensual', 'Premium Anual'

    @Column({ type: 'text', nullable: true })
    description: string | null;

    @Column({ type: 'decimal', precision: 10, scale: 2, nullable: false })
    price!: number; // Precio del plan

    @Column({
        type: 'enum',
        enum: SubscriptionDurationType,
        nullable: false,
    })
    duration_type!: SubscriptionDurationType; // Ej: 'monthly', 'yearly', 'lifetime'

    @Column('text', { array: true, nullable: true })
    features: string[] | null; // Ej: ['acceso_chat', 'planes_ia_ilimitados']

    @Column({ type: 'boolean', default: true })
    is_active!: boolean; // Si el plan está disponible para nuevas suscripciones

    @OneToMany(() => UserSubscription, (userSubscription) => userSubscription.subscription_plan)
    user_subscriptions!: UserSubscription[]; // Relación inversa a UserSubscription

    @CreateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
    created_at!: Date;

    @UpdateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
    updated_at!: Date;
}