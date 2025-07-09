// src/database/entities/nutritionist_commission.entity.ts
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

export enum CommissionStatus {
    PENDING = 'pending',
    PAID = 'paid',
    CANCELLED = 'cancelled',
}

export enum CommissionType {
    PER_PATIENT = 'per_patient',
    PER_CONSULTATION = 'per_consultation',
    PERCENTAGE = 'percentage',
    FIXED = 'fixed',
}

@Entity('nutritionist_commissions')
export class NutritionistCommission {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @ManyToOne(() => User, { nullable: false, onDelete: 'CASCADE' })
    @JoinColumn({ name: 'nutritionist_id' })
    nutritionist!: User;

    @Column({ type: 'decimal', precision: 5, scale: 2, nullable: false })
    commission_percentage!: number; // Porcentaje que paga el nutriólogo (ej: 15.00 = 15%)

    @Column({ type: 'decimal', precision: 10, scale: 2, nullable: false, default: 0 })
    total_revenue!: number; // Ingresos totales del nutriólogo en el período

    @Column({ type: 'decimal', precision: 10, scale: 2, nullable: false, default: 0 })
    commission_amount!: number; // Monto de la comisión calculada

    @Column({ type: 'int', nullable: false, default: 0 })
    total_patients!: number; // Número total de pacientes activos

    @Column({ type: 'int', nullable: false, default: 0 })
    total_consultations!: number; // Número total de consultas realizadas

    @Column({
        type: 'enum',
        enum: CommissionType,
        default: CommissionType.PERCENTAGE,
    })
    commission_type!: CommissionType;

    @Column({
        type: 'enum',
        enum: CommissionStatus,
        default: CommissionStatus.PENDING,
    })
    status!: CommissionStatus;

    @Column({ type: 'date', nullable: false })
    period_start!: Date; // Inicio del período de facturación

    @Column({ type: 'date', nullable: false })
    period_end!: Date; // Fin del período de facturación

    @Column({ type: 'date', nullable: true })
    payment_date!: Date | null; // Fecha de pago

    @Column({ type: 'varchar', length: 255, nullable: true })
    payment_reference!: string | null; // Referencia del pago

    @Column({ type: 'text', nullable: true })
    notes!: string | null; // Notas adicionales

    @CreateDateColumn({ type: 'timestamptz' })
    created_at!: Date;

    @UpdateDateColumn({ type: 'timestamptz' })
    updated_at!: Date;
} 