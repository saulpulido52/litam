// src/database/entities/subscription_plan.entity.ts
import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
} from 'typeorm';

export enum PlanType {
    MONTHLY = 'monthly',
    ANNUAL = 'annual',
}

export enum PlanStatus {
    ACTIVE = 'active',
    INACTIVE = 'inactive',
    SUSPENDED = 'suspended',
}

// For DTO compatibility
export enum SubscriptionDurationType {
    MONTHLY = 'monthly',
    ANNUAL = 'annual',
}

@Entity('subscription_plans')
export class SubscriptionPlan {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column({ type: 'varchar', length: 100, nullable: false })
    name!: string;

    @Column({ type: 'text', nullable: true })
    description!: string | null;

    @Column({
        type: 'enum',
        enum: PlanType,
        nullable: false,
    })
    type!: PlanType;

    @Column({ type: 'decimal', precision: 10, scale: 2, nullable: false })
    price!: number;

    @Column({ type: 'int', nullable: false })
    duration_days!: number; // 30 para mensual, 365 para anual

    @Column({ type: 'int', nullable: true })
    max_consultations!: number | null; // null = ilimitadas

    @Column({ type: 'boolean', default: true })
    includes_nutrition_plan!: boolean;

    @Column({ type: 'boolean', default: false })
    includes_progress_tracking!: boolean;

    @Column({ type: 'boolean', default: false })
    includes_messaging!: boolean;

    @Column({
        type: 'enum',
        enum: PlanStatus,
        default: PlanStatus.ACTIVE,
    })
    status!: PlanStatus;

    @CreateDateColumn({ type: 'timestamptz' })
    created_at!: Date;

    @UpdateDateColumn({ type: 'timestamptz' })
    updated_at!: Date;
}