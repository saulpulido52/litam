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
    important_diseases_history: string | null;

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
    alcohol_consumption: string | null;

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

    // ==================== CAMPOS ESPECÍFICOS PARA PACIENTES PEDIÁTRICOS ====================
    
    // Identificador de tipo de paciente
    @Column({ type: 'boolean', default: false })
    is_pediatric_patient: boolean; // Indica si es paciente pediátrico (< 18 años)

    // Datos del cuidador/tutor responsable
    @Column({ type: 'jsonb', nullable: true })
    caregiver_info: {
        primary_caregiver_name?: string;
        primary_caregiver_relationship?: string; // madre, padre, abuela, tutor legal, etc.
        primary_caregiver_phone?: string;
        primary_caregiver_email?: string;
        secondary_caregiver_name?: string;
        secondary_caregiver_relationship?: string;
        secondary_caregiver_phone?: string;
        emergency_contact_name?: string;
        emergency_contact_phone?: string;
        emergency_contact_relationship?: string;
    } | null;

    // Datos del embarazo y nacimiento
    @Column({ type: 'jsonb', nullable: true })
    birth_history: {
        gestational_age_weeks?: number; // Semanas de gestación al nacer
        birth_weight_kg?: number; // Peso al nacer en kg
        birth_length_cm?: number; // Talla al nacer en cm
        birth_head_circumference_cm?: number; // Perímetro cefálico al nacer
        delivery_type?: string; // natural, cesárea, fórceps, etc.
        delivery_complications?: string; // Complicaciones durante el parto
        apgar_score?: {
            one_minute?: number;
            five_minutes?: number;
        };
        pregnancy_complications?: string; // Complicaciones durante el embarazo
        medications_during_pregnancy?: string; // Medicamentos durante el embarazo
    } | null;

    // Historial de lactancia y alimentación temprana
    @Column({ type: 'jsonb', nullable: true })
    feeding_history: {
        breastfeeding_duration_months?: number; // Duración de lactancia materna en meses
        exclusive_breastfeeding_months?: number; // Lactancia materna exclusiva
        formula_feeding?: boolean; // Si recibió fórmula
        formula_type?: string; // Tipo de fórmula utilizada
        complementary_feeding_start_months?: number; // Inicio de alimentación complementaria
        first_solid_foods?: string; // Primeros alimentos sólidos
        feeding_difficulties?: string; // Dificultades de alimentación
        food_allergies_onset?: string; // Aparición de alergias alimentarias
    } | null;

    // Desarrollo psicomotor
    @Column({ type: 'jsonb', nullable: true })
    developmental_milestones: {
        head_control_months?: number; // Control cefálico
        sitting_unsupported_months?: number; // Sentarse sin apoyo
        crawling_months?: number; // Gateo
        walking_months?: number; // Caminata independiente
        first_words_months?: number; // Primeras palabras
        toilet_training_months?: number; // Control de esfínteres
        current_developmental_concerns?: string; // Preocupaciones actuales de desarrollo
        developmental_delays?: string; // Retrasos del desarrollo identificados
    } | null;

    // Historial de crecimiento específico
    @Column({ type: 'jsonb', nullable: true })
    pediatric_growth_history: {
        growth_chart_source?: string; // OMS, CDC, etc.
        historical_percentiles?: {
            date: Date;
            age_months: number;
            weight_percentile?: number;
            height_percentile?: number;
            bmi_percentile?: number;
            head_circumference_percentile?: number;
        }[];
        growth_concerns?: string; // Preocupaciones de crecimiento
        growth_velocity_issues?: boolean; // Problemas de velocidad de crecimiento
        previous_growth_interventions?: string; // Intervenciones previas
    } | null;

    // Datos escolares y sociales
    @Column({ type: 'jsonb', nullable: true })
    school_social_info: {
        school_name?: string;
        school_grade?: string;
        school_lunch_program?: boolean; // Participa en programa de almuerzo escolar
        school_feeding_accommodations?: string; // Acomodaciones especiales en la escuela
        physical_activity_at_school?: string; // Actividad física en la escuela
        academic_performance?: string; // Rendimiento académico
        social_interactions?: string; // Interacciones sociales
        behavioral_concerns?: string; // Preocupaciones conductuales
    } | null;

    // Historial de vacunación (básico)
    @Column({ type: 'jsonb', nullable: true })
    vaccination_status: {
        up_to_date?: boolean; // Vacunas al día
        missed_vaccines?: string[]; // Vacunas faltantes
        vaccine_reactions?: string; // Reacciones a vacunas
        last_vaccine_date?: Date; // Última fecha de vacunación
        vaccination_concerns?: string; // Preocupaciones sobre vacunación
    } | null;

    // Hábitos específicos pediátricos
    @Column({ type: 'jsonb', nullable: true })
    pediatric_habits: {
        sleep_hours_per_night?: number; // Horas de sueño por noche
        sleep_difficulties?: string; // Dificultades del sueño
        nap_schedule?: string; // Horario de siestas
        screen_time_hours_daily?: number; // Tiempo de pantalla diario
        favorite_foods?: string[]; // Alimentos favoritos específicos
        food_refusal_behaviors?: string; // Comportamientos de rechazo a alimentos
        eating_independence_level?: string; // Nivel de independencia al comer
        utensil_skills?: string; // Habilidades con utensilios
        mealtime_behaviors?: string; // Comportamientos durante las comidas
    } | null;

    // Mediciones antropométricas pediátricas específicas
    @Column({ type: 'jsonb', nullable: true })
    pediatric_measurements: {
        head_circumference_current_cm?: number; // Perímetro cefálico actual
        arm_circumference_cm?: number; // Circunferencia del brazo
        growth_velocity_data?: {
            period_start: Date;
            period_end: Date;
            weight_gain_kg?: number;
            height_gain_cm?: number;
            head_circumference_gain_cm?: number;
        }[];
        body_composition?: {
            muscle_mass_percentage?: number;
            fat_percentage?: number;
            hydration_level?: string;
        };
    } | null;

    // Historial médico pediátrico específico
    @Column({ type: 'jsonb', nullable: true })
    pediatric_medical_history: {
        frequent_illnesses?: string[]; // Enfermedades frecuentes
        hospitalizations?: {
            date: Date;
            reason: string;
            duration_days: number;
        }[];
        chronic_conditions?: string[]; // Condiciones crónicas específicas
        medications_current?: {
            name: string;
            dose: string;
            frequency: string;
            prescribing_doctor: string;
        }[];
        supplements_pediatric?: {
            name: string;
            dose: string;
            reason: string;
            duration: string;
        }[];
        growth_hormone_therapy?: boolean; // Terapia con hormona de crecimiento
        nutritional_therapy_history?: string; // Historial de terapia nutricional
    } | null;

    // Evaluación nutricional pediátrica específica
    @Column({ type: 'jsonb', nullable: true })
    pediatric_nutrition_assessment: {
        nutritional_risk_factors?: string[]; // Factores de riesgo nutricional
        feeding_skills_assessment?: string; // Evaluación de habilidades de alimentación
        texture_progression?: string; // Progresión de texturas
        cultural_dietary_factors?: string; // Factores dietéticos culturales
        family_meal_patterns?: string; // Patrones familiares de comidas
        food_security_status?: string; // Seguridad alimentaria del hogar
        special_dietary_needs?: string; // Necesidades dietéticas especiales
        growth_chart_interpretation?: string; // Interpretación de curvas de crecimiento
    } | null;

    // ==================== CAMPOS DE AUDITORÍA ====================
    @CreateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
    created_at!: Date;

    @UpdateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
    updated_at!: Date;
}