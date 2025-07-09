// src/database/entities/patient_tier.entity.ts
import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    OneToMany,
} from 'typeorm';
import { User } from './user.entity';

export enum PatientTierType {
    FREE = 'free',
    PRO = 'pro',
    PREMIUM = 'premium',
}

export enum PatientPaymentModel {
    FREE = 'free',
    ONE_TIME = 'one_time',
    SUBSCRIPTION = 'subscription',
}

@Entity('patient_tiers')
export class PatientTier {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column({ type: 'varchar', length: 100, nullable: false })
    name!: string;

    @Column({ type: 'text', nullable: true })
    description!: string | null;

    @Column({
        type: 'enum',
        enum: PatientTierType,
        nullable: false,
    })
    tier_type!: PatientTierType;

    @Column({
        type: 'enum',
        enum: PatientPaymentModel,
        nullable: false,
    })
    payment_model!: PatientPaymentModel;

    @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
    one_time_price!: number | null; // Precio único (ej: 40.00 MXN)

    @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
    monthly_price!: number | null; // Precio mensual

    @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
    annual_price!: number | null; // Precio anual

    @Column({ type: 'boolean', default: true })
    shows_ads!: boolean;

    @Column({ type: 'boolean', default: false })
    includes_ai_food_scanning!: boolean;

    @Column({ type: 'boolean', default: false })
    includes_barcode_scanning!: boolean;

    @Column({ type: 'boolean', default: false })
    includes_smart_shopping_list!: boolean;

    @Column({ type: 'boolean', default: false })
    includes_advanced_tracking!: boolean;

    @Column({ type: 'boolean', default: false })
    includes_device_integration!: boolean;

    @Column({ type: 'boolean', default: true })
    is_active!: boolean;

    @CreateDateColumn({ type: 'timestamptz' })
    created_at!: Date;

    @UpdateDateColumn({ type: 'timestamptz' })
    updated_at!: Date;

    // Relaciones
    @OneToMany(() => User, user => user.patient_tier)
    patients!: User[];
} 