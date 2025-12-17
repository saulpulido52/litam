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
import { User } from '../../database/entities/user.entity'; // Ruta corregida

@Entity('patient_profiles')
export class PatientProfile {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @OneToOne(() => User, (user) => user.patient_profile, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'user_id' })
    user!: User;

    // ==================== DATOS BÁSICOS BIOMÉTRICOS ====================
    @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
    current_weight: number | null; // En kg (snake_case)

    @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
    height: number | null; // En cm (snake_case)

    @Column({ type: 'varchar', length: 50, nullable: true })
    activity_level: string | null; // Ej: 'sedentario', 'ligero', 'moderado', 'activo' (snake_case)

    // ==================== MOTIVO DE CONSULTA ====================
    @Column({ type: 'text', nullable: true })
    consultation_reason: string | null; // Motivo de la consulta

    // ==================== ANTECEDENTES PATOLÓGICOS ====================
    @Column('text', { array: true, nullable: true })
    medical_conditions: string[] | null; // (snake_case)

    @Column('text', { array: true, nullable: true })
    allergies: string[] | null; // (snake_case)

    @Column('text', { array: true, nullable: true })
    medications: string[] | null; // (snake_case)

    @Column({ type: 'text', nullable: true })
    diagnosed_diseases: string | null; // ¿Padece alguna enfermedad diagnosticada?

    @Column({ type: 'varchar', length: 100, nullable: true })
    diagnosed_since: string | null; // ¿Desde cuándo?

    @Column({ type: 'text', nullable: true })
    important_diseases_history: string | null; // ¿Ha padecido alguna enfermedad importante?

    @Column({ type: 'text', nullable: true })
    current_treatments: string | null; // ¿Actualmente toma algún tratamiento especial?

    @Column({ type: 'text', nullable: true })
    surgeries_history: string | null; // ¿Le han practicado alguna cirugía?

    // ==================== PROBLEMAS ACTUALES ====================
    @Column({ type: 'jsonb', nullable: true })
    current_symptoms: {
        diarrhea?: string;
        constipation?: string;
        gastritis?: string;
        ulcer?: string;
        nausea?: string;
        heartburn?: string; // pirosis
        vomiting?: string;
        colitis?: string;
        mouth_mechanics?: string;
        others?: string;
        observations?: string;
    } | null;

    // ==================== ANTECEDENTES FAMILIARES ====================
    @Column({ type: 'jsonb', nullable: true })
    family_history: {
        obesity?: boolean;
        diabetes?: boolean;
        hypertension?: boolean; // HTA
        cancer?: boolean;
        thyroid_issues?: boolean; // hipo/hipertiroidismo
        dyslipidemia?: boolean;
        other?: string;
    } | null;

    // ==================== ACTIVIDAD FÍSICA ====================
    @Column({ type: 'boolean', nullable: true })
    does_exercise: boolean | null;

    @Column({ type: 'varchar', length: 100, nullable: true })
    exercise_type: string | null;

    @Column({ type: 'varchar', length: 50, nullable: true })
    exercise_frequency: string | null;

    @Column({ type: 'varchar', length: 50, nullable: true })
    exercise_duration: string | null;

    @Column({ type: 'varchar', length: 50, nullable: true })
    exercise_since: string | null; // ¿Desde cuándo?

    // ==================== CONSUMO DE SUSTANCIAS ====================
    @Column({ type: 'varchar', length: 100, nullable: true })
    alcohol_consumption: string | null; // frecuencia y cantidad

    @Column({ type: 'varchar', length: 100, nullable: true })
    tobacco_consumption: string | null;

    @Column({ type: 'varchar', length: 100, nullable: true })
    coffee_consumption: string | null;

    // ==================== SIGNOS VITALES Y FÍSICOS ====================
    @Column({ type: 'text', nullable: true })
    general_appearance: string | null; // cabello, ojos, piel, uñas, labios, encías

    @Column({ type: 'boolean', nullable: true })
    knows_blood_pressure: boolean | null;

    @Column({ type: 'varchar', length: 20, nullable: true })
    usual_blood_pressure: string | null;

    // ==================== INDICADORES BIOQUÍMICOS ====================
    @Column({ type: 'jsonb', nullable: true })
    biochemical_indicators: {
        glucose?: number;
        cholesterol?: number;
        triglycerides?: number;
        hdl?: number;
        ldl?: number;
        hemoglobin?: number;
        hematocrit?: number;
        other_labs?: string;
        last_update?: Date;
    } | null;

    // ==================== INDICADORES DIETÉTICOS ====================
    @Column({ type: 'boolean', nullable: true })
    previous_nutritional_guidance: boolean | null;

    @Column({ type: 'varchar', length: 100, nullable: true })
    previous_guidance_when: string | null;

    @Column({ type: 'varchar', length: 50, nullable: true })
    guidance_adherence_level: string | null; // nada, mínimo, moderado, bueno, excelente

    @Column({ type: 'text', nullable: true })
    guidance_adherence_reason: string | null;

    @Column({ type: 'varchar', length: 100, nullable: true })
    who_prepares_food: string | null;

    @Column({ type: 'varchar', length: 50, nullable: true })
    eats_home_or_out: string | null; // casa o fuera

    @Column({ type: 'boolean', nullable: true })
    diet_modified_last_6_months: boolean | null;

    @Column({ type: 'text', nullable: true })
    diet_modification_reason: string | null;

    @Column({ type: 'varchar', length: 50, nullable: true })
    hungriest_time: string | null; // ¿A qué hora tiene más hambre?

    @Column('text', { array: true, nullable: true })
    preferred_foods: string[] | null;

    @Column('text', { array: true, nullable: true })
    disliked_foods: string[] | null;

    @Column('text', { array: true, nullable: true })
    food_intolerances: string[] | null; // alimentos que causan malestar

    @Column({ type: 'boolean', nullable: true })
    takes_supplements: boolean | null;

    @Column({ type: 'text', nullable: true })
    supplements_details: string | null; // cuál, dosis, por qué

    @Column({ type: 'integer', nullable: true })
    daily_water_glasses: number | null;

    // ==================== ESTILO DE VIDA ====================
    @Column({ type: 'jsonb', nullable: true })
    daily_schedule: {
        wake_up_time?: string;
        breakfast_time?: string;
        lunch_time?: string;
        dinner_time?: string;
        sleep_time?: string;
        main_activities?: {
            time: string;
            activity: string;
        }[];
    } | null;

    // ==================== FRECUENCIA DE CONSUMO POR GRUPOS ====================
    @Column({ type: 'jsonb', nullable: true })
    food_frequency: {
        vegetables?: string; // semanal
        fruits?: string;
        cereals?: string;
        legumes?: string;
        animal_products?: string;
        dairy?: string;
        fats?: string;
        sugars?: string;
        alcohol?: string;
    } | null;

    // ==================== CAMPOS EXISTENTES MANTENIDOS ====================
    @Column('text', { array: true, nullable: true })
    goals: string[] | null;

    @Column('text', { array: true, nullable: true })
    intolerances: string[] | null;

    @Column({ type: 'text', nullable: true })
    clinical_notes: string | null;

    @Column({ type: 'varchar', length: 50, nullable: true })
    pregnancy_status: string | null;

    @Column('text', { array: true, nullable: true })
    dietary_preferences: string[] | null;

    @Column('text', { array: true, nullable: true })
    food_preferences: string[] | null;

    @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
    monthly_budget: number | null;

    @Column({ type: 'text', nullable: true })
    meal_schedule: string | null;

    // ==================== CAMPOS JSONB PARA FLEXIBILIDAD ====================
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

    // ==================== CAMPOS DE AUDITORÍA ====================
    @CreateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
    created_at!: Date;

    @UpdateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
    updated_at!: Date;
}