// src/database/entities/nutritionist_availability.entity.ts
import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    JoinColumn,
    CreateDateColumn,
    UpdateDateColumn,
    Unique,
} from 'typeorm';
import { User } from '../../database/entities/user.entity';

// Enum para los días de la semana
export enum DayOfWeek {
    SUNDAY = 'sunday',
    MONDAY = 'monday',
    TUESDAY = 'tuesday',
    WEDNESDAY = 'wednesday',
    THURSDAY = 'thursday',
    FRIDAY = 'friday',
    SATURDAY = 'saturday',
}

@Entity('nutritionist_availabilities')
@Unique(['nutritionist', 'day_of_week', 'start_time_minutes', 'end_time_minutes']) // Prevenir duplicados de franjas horarias
export class NutritionistAvailability {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @ManyToOne(() => User, (user) => user.nutritionist_availabilities, { nullable: false, onDelete: 'CASCADE' })
    @JoinColumn({ name: 'nutritionist_user_id' })
    nutritionist!: User;

    @Column({
        type: 'enum',
        enum: DayOfWeek,
        nullable: false,
    })
    day_of_week!: DayOfWeek;

    @Column({ type: 'integer', nullable: false })
    @Column({ type: 'integer', nullable: false })
    start_time_minutes!: number; // Minutos desde la medianoche (ej: 540 para 09:00, 1020 para 17:00)

    @Column({ type: 'integer', nullable: false })
    end_time_minutes!: number; // Minutos desde la medianoche (ej: 540 para 09:00, 1020 para 17:00)

    @Column({ type: 'boolean', default: true })
    is_active!: boolean; // Permite deshabilitar una franja sin borrarla

    @CreateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
    created_at!: Date;

    @UpdateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
    updated_at!: Date;
}