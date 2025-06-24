// src/database/entities/patient_progress_log.entity.ts
import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    JoinColumn,
    CreateDateColumn,
    UpdateDateColumn,
} from 'typeorm';
import { User } from '../../database/entities/user.entity'; // Para referenciar al paciente
import { Min, Max } from 'class-validator';

@Entity('patient_progress_logs')
export class PatientProgressLog {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @ManyToOne(() => User, (user) => user.patient_progress_logs, { nullable: false, onDelete: 'CASCADE' })
    @JoinColumn({ name: 'patient_user_id' })
    patient!: User;

    @Column({ type: 'date', nullable: false }) // Fecha del registro del progreso (solo fecha)
    date!: Date;

    @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
    weight: number | null; // Peso en kg

    @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
    body_fat_percentage: number | null; // Porcentaje de grasa corporal

    @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
    muscle_mass_percentage: number | null; // Porcentaje de masa muscular

    @Column({ type: 'jsonb', nullable: true })
    measurements: any | null; // Medidas corporales (ej: { waist: 80, hip: 95, arm: 30 })

    @Column({ type: 'text', nullable: true })
    notes: string | null; // Notas del paciente sobre su progreso, sensaciones, desafíos

    @Column('jsonb', { array: true, nullable: true })
    photos: { date?: Date; url: string; description?: string }[] | null; // Metadata de fotos de progreso

    @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
    adherence_to_plan: number | null; // Adherencia al plan (ej: 0-100%)

    @Column({ type: 'integer', nullable: true })
    @Min(1, { message: 'El nivel de cómo se siente debe ser al menos 1.' })
    @Max(5, { message: 'El nivel de cómo se siente no puede exceder 5.' })
    feeling_level: number | null; // Nivel de energía o bienestar (ej: 1=mal, 5=excelente)

    @CreateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
    created_at!: Date;

    @UpdateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
    updated_at!: Date;
}