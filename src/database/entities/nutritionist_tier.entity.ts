// src/database/entities/nutritionist_tier.entity.ts
import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    OneToMany,
} from 'typeorm';
import { User } from './user.entity';

export enum NutritionistTierType {
    BASIC = 'basic',
    PREMIUM = 'premium',
}

export enum PaymentModel {
    COMMISSION = 'commission',
    SUBSCRIPTION = 'subscription',
}

@Entity('nutritionist_tiers')
export class NutritionistTier {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column({ type: 'varchar', length: 100, nullable: false })
    name!: string;

    @Column({ type: 'text', nullable: true })
    description!: string | null;

    @Column({
        type: 'enum',
        enum: NutritionistTierType,
        nullable: false,
    })
    tier_type!: NutritionistTierType;

    @Column({
        type: 'enum',
        enum: PaymentModel,
        nullable: false,
    })
    payment_model!: PaymentModel;

    @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
    commission_rate!: number | null; // Porcentaje de comisión (ej: 20.00)

    @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
    subscription_price!: number | null; // Precio de suscripción mensual

    @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
    annual_price!: number | null; // Precio de suscripción anual

    @Column({ type: 'int', nullable: false, default: 1 })
    max_active_patients!: number; // -1 para ilimitado

    @Column({ type: 'boolean', default: false })
    includes_ai_meal_planning!: boolean;

    @Column({ type: 'boolean', default: false })
    includes_advanced_management!: boolean;

    @Column({ type: 'boolean', default: false })
    includes_priority_support!: boolean;

    @Column({ type: 'boolean', default: true })
    is_active!: boolean;

    @CreateDateColumn({ type: 'timestamptz' })
    created_at!: Date;

    @UpdateDateColumn({ type: 'timestamptz' })
    updated_at!: Date;

    // Relaciones
    @OneToMany(() => User, user => user.nutritionist_tier)
    nutritionists!: User[];
} 