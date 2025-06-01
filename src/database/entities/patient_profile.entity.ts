// src/database/entities/patient_profile.entity.ts
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

    // --- Nuevos/Actualizados campos de datos biométricos ---
    @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
    current_weight: number | null; // En kg (snake_case)

    @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
    height: number | null; // En cm (snake_case)

    @Column({ type: 'varchar', length: 50, nullable: true })
    activity_level: string | null; // Ej: 'sedentario', 'ligero', 'moderado', 'activo' (snake_case)

    // --- Nuevos/Actualizados campos de salud y objetivos ---
    @Column('text', { array: true, nullable: true })
    goals: string[] | null; // (snake_case)

    @Column('text', { array: true, nullable: true })
    medical_conditions: string[] | null; // (snake_case)

    @Column('text', { array: true, nullable: true })
    allergies: string[] | null; // (snake_case)

    @Column('text', { array: true, nullable: true })
    intolerances: string[] | null; // (snake_case)

    @Column('text', { array: true, nullable: true })
    medications: string[] | null; // (snake_case)

    @Column({ type: 'text', nullable: true })
    clinical_notes: string | null; // (snake_case)

    @Column({ type: 'varchar', length: 50, nullable: true })
    pregnancy_status: string | null; // (snake_case)

    // --- Nuevos/Actualizados campos de preferencias y estilo de vida ---
    @Column('text', { array: true, nullable: true })
    dietary_preferences: string[] | null; // (snake_case)

    @Column('text', { array: true, nullable: true })
    food_preferences: string[] | null; // (snake_case)

    @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
    monthly_budget: number | null; // (snake_case)

    @Column({ type: 'text', nullable: true })
    meal_schedule: string | null; // (snake_case)

    // --- Campos JSONB existentes (para datos más estructurados o complejos) ---
    @Column({ type: 'jsonb', nullable: true })
    preferences: any | null;

    @Column('jsonb', { array: true, nullable: true })
    weight_history: { date: Date; weight: number }[] | null;

    @Column('jsonb', { array: true, nullable: true })
    measurements: { date: Date; type: string; value: number }[] | null;

    @Column('jsonb', { array: true, nullable: true })
    photos: { date: Date; url: string; description: string }[] | null;

    @Column('jsonb', { array: true, nullable: true })
    clinical_studies_docs: { id: string; filename: string; url: string; upload_date: Date; description: string }[] | null;

    // --- Campos de auditoría ---
    @CreateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
    created_at!: Date;

    @UpdateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
    updated_at!: Date;
}