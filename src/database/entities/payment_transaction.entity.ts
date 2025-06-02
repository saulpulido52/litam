// src/database/entities/payment_transaction.entity.ts
import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    JoinColumn,
    CreateDateColumn,
    UpdateDateColumn,
} from 'typeorm';
import { User } from '@/database/entities/user.entity';
import { SubscriptionPlan } from '@/database/entities/subscription_plan.entity';

// Estado de la transacción de pago
export enum PaymentStatus {
    SUCCESS = 'success',
    PENDING = 'pending',
    FAILED = 'failed',
    REFUNDED = 'refunded',
}

@Entity('payment_transactions')
export class PaymentTransaction {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @ManyToOne(() => User, { nullable: false, onDelete: 'RESTRICT' }) // RESTRICT para no borrar usuario si tiene transacciones
    @JoinColumn({ name: 'user_id' })
    user!: User;

    @ManyToOne(() => SubscriptionPlan, { nullable: true, onDelete: 'RESTRICT' }) // Puede ser nulo si es un pago por algo no directamente un plan
    @JoinColumn({ name: 'subscription_plan_id' })
    subscription_plan: SubscriptionPlan | null;

    @Column({ type: 'decimal', precision: 10, scale: 2, nullable: false })
    amount!: number;

    @Column({ type: 'varchar', length: 10, nullable: false })
    currency!: string; // Ej: 'MXN', 'USD'

    @Column({
        type: 'enum',
        enum: PaymentStatus,
        default: PaymentStatus.PENDING,
        nullable: false,
    })
    status!: PaymentStatus;

    @Column({ type: 'varchar', length: 255, nullable: true })
    gateway_transaction_id: string | null; // ID de la transacción en la pasarela de pagos

    @Column({ type: 'varchar', length: 50, nullable: true })
    payment_method_type: string | null; // Ej: 'card', 'paypal', 'bank_transfer'

    @Column({ type: 'varchar', length: 255, nullable: true })
    gateway_response_code: string | null; // Código de error/respuesta detallado de la pasarela

    @CreateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
    created_at!: Date;

    @UpdateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
    updated_at!: Date;
}