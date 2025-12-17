// src/database/entities/user_subscription.entity.ts
import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    JoinColumn,
    CreateDateColumn,
    UpdateDateColumn,
} from 'typeorm';
import { User } from './user.entity';
import { SubscriptionPlan } from './subscription_plan.entity';

export enum SubscriptionStatus {
    ACTIVE = 'active',
    EXPIRED = 'expired',
    CANCELLED = 'cancelled',
    PENDING = 'pending',
}

@Entity('user_subscriptions')
export class UserSubscription {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @ManyToOne(() => User, { nullable: false, onDelete: 'CASCADE' })
    @JoinColumn({ name: 'user_id' })
    user!: User;

    @ManyToOne(() => SubscriptionPlan, { nullable: false })
    @JoinColumn({ name: 'subscription_plan_id' })
    subscription_plan!: SubscriptionPlan;

    @Column({
        type: 'enum',
        enum: SubscriptionStatus,
        default: SubscriptionStatus.PENDING,
    })
    status!: SubscriptionStatus;

    @Column({ type: 'timestamptz', nullable: false })
    start_date!: Date;

    @Column({ type: 'timestamptz', nullable: false })
    end_date!: Date;

    @Column({ type: 'decimal', precision: 10, scale: 2, nullable: false })
    amount_paid!: number;

    @Column({ type: 'varchar', length: 10, nullable: false, default: 'MXN' })
    currency!: string;

    @Column({ type: 'varchar', length: 200, nullable: true })
    payment_method!: string | null;

    @Column({ type: 'varchar', length: 100, nullable: true })
    payment_reference!: string | null;

    @Column({ type: 'int', default: 0 })
    consultations_used!: number;

    @Column({ type: 'boolean', default: false })
    auto_renew!: boolean;

    @Column({ type: 'timestamptz', nullable: true })
    cancelled_at!: Date | null;

    @Column({ type: 'text', nullable: true })
    cancellation_reason!: string | null;

    @CreateDateColumn({ type: 'timestamptz' })
    created_at!: Date;

    @UpdateDateColumn({ type: 'timestamptz' })
    updated_at!: Date;
}