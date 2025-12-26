// src/database/entities/notification.entity.ts
import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    ManyToOne,
    JoinColumn,
    Index,
} from 'typeorm';
import { User } from './user.entity';

export enum NotificationType {
    APPOINTMENT = 'appointment',
    PATIENT = 'patient',
    REMINDER = 'reminder',
    SYSTEM = 'system',
    SUCCESS = 'success',
    WARNING = 'warning',
    INFO = 'info',
}

export enum NotificationPriority {
    LOW = 'low',
    MEDIUM = 'medium',
    HIGH = 'high',
}

@Entity('notifications')
@Index(['user_id', 'created_at']) // For efficient querying
export class Notification {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column({ type: 'uuid', nullable: false })
    user_id!: string;

    @ManyToOne(() => User, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'user_id' })
    user!: User;

    @Column({
        type: 'enum',
        enum: NotificationType,
        nullable: false,
    })
    type!: NotificationType;

    @Column({ type: 'varchar', length: 255, nullable: false })
    title!: string;

    @Column({ type: 'text', nullable: false })
    message!: string;

    @Column({ type: 'boolean', default: false })
    read!: boolean;

    @Column({ type: 'boolean', default: false })
    pinned!: boolean;

    @Column({
        type: 'enum',
        enum: NotificationPriority,
        default: NotificationPriority.MEDIUM,
    })
    priority!: NotificationPriority;

    @Column({ type: 'varchar', length: 100, nullable: false })
    category!: string;

    @Column({ type: 'varchar', length: 500, nullable: true })
    action_url?: string;

    @Column({ type: 'jsonb', nullable: true })
    metadata?: {
        patientId?: string;
        patientName?: string;
        appointmentId?: string;
        recordId?: string;
        [key: string]: any;
    };

    @CreateDateColumn({ type: 'timestamp' })
    created_at!: Date;

    @UpdateDateColumn({ type: 'timestamp' })
    updated_at!: Date;
}
