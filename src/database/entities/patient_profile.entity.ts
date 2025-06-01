import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    OneToOne,
    JoinColumn,
    CreateDateColumn,
    UpdateDateColumn,
} from 'typeorm';
import { User } from '@/database/entities/user.entity'; // Ruta corregida

@Entity('patient_profiles')
export class PatientProfile {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @OneToOne(() => User, (user) => user.patient_profile, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'user_id' })
    user!: User;

    @Column({ type: 'jsonb', nullable: true })
    goals: any | null; // Ej: { type: 'weight_loss', target_weight: 70, target_date: '2025-12-31' }

    @Column({ type: 'jsonb', nullable: true })
    preferences: any | null; // Ej: { dietary_restrictions: ['vegetarian'], disliked_foods: ['celery'], cooking_time_minutes: 30 }

    @Column('text', { array: true, nullable: true })
    allergies: string[] | null;

    @Column({ type: 'varchar', length: 50, nullable: true })
    activity_level: string | null; // Ej: 'sedentary', 'moderate', 'active'

    @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
    monthly_budget: number | null;

    @Column({ type: 'text', nullable: true })
    basic_history: string | null; // Notas generales del paciente

    @Column('jsonb', { array: true, nullable: true })
    weight_history: { date: Date; weight: number }[] | null; // Ej: [{ date: '2024-01-01', weight: 80 }]

    @Column('jsonb', { array: true, nullable: true })
    measurements: { date: Date; type: string; value: number }[] | null; // Ej: [{ date: '2024-01-01', type: 'waist', value: 85 }]

    @Column('jsonb', { array: true, nullable: true })
    photos: { date: Date; url: string; description: string }[] | null; // Metadata de fotos

    @Column('jsonb', { array: true, nullable: true })
    clinical_studies_docs: { id: string; filename: string; url: string; upload_date: Date; description: string }[] | null; // Metadata de documentos clínicos

    @CreateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
    created_at!: Date;

    @UpdateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
    updated_at!: Date;
}