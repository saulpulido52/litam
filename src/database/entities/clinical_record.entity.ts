// src/database/entities/clinical_record.entity.ts
import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    JoinColumn,
    CreateDateColumn,
    UpdateDateColumn,
} from 'typeorm';
import { User } from '../../database/entities/user.entity'; // Para referenciar al paciente y al nutriólogo

@Entity('clinical_records')
export class ClinicalRecord {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column({ type: 'date', nullable: false }) // Fecha en que se realizó/actualizó este registro clínico
    record_date!: Date;

    @ManyToOne(() => User, (user) => user.patient_clinical_records, { nullable: false, onDelete: 'CASCADE' })
    @JoinColumn({ name: 'patient_user_id' })
    patient!: User; // El paciente a quien pertenece el registro

    @ManyToOne(() => User, (user) => user.nutritionist_created_clinical_records, { nullable: false, onDelete: 'RESTRICT' })
    @JoinColumn({ name: 'nutritionist_user_id' })
    nutritionist!: User; // El nutriólogo que creó/actualizó este registro

    @Column({ type: 'varchar', length: 50, nullable: true })
    expedient_number: string | null; // Número de expediente (si aplica)

    // --- DATOS PERSONALES (algunos ya en User, pero aquí para el contexto del registro) ---
    // (Nombre, Edad, Sexo, FN, EC, Escolaridad, Ocupacion, Direccion, Telefono, Email: Se obtienen de la entidad User/PatientProfile)
    
    @Column({ type: 'text', nullable: true })
    consultation_reason: string | null; // Motivo de la consulta

    // --- INDICADORES CLÍNICOS / ANTECEDENTES PATOLÓGICOS ---
    @Column({ type: 'jsonb', nullable: true })
    current_problems: { // Problemas actuales
        diarrhea?: boolean;
        constipation?: boolean;
        gastritis?: boolean;
        ulcer?: boolean;
        nausea?: boolean;
        pyrosis?: boolean; // Pirosis
        vomiting?: boolean;
        colitis?: boolean;
        mouth_mechanics?: string; // Mecánicos de la boca
        other_problems?: string;
        observations?: string;
    } | null;

    @Column({ type: 'jsonb', nullable: true })
    diagnosed_diseases: { // Enfermedades diagnosticadas
        has_disease?: boolean;
        disease_name?: string;
        since_when?: string;
        takes_medication?: boolean;
        medications_list?: string[];
        has_important_disease?: boolean;
        important_disease_name?: string;
        takes_special_treatment?: boolean;
        special_treatment_details?: string;
        has_surgery?: boolean;
        surgery_details?: string;
    } | null;

    @Column({ type: 'jsonb', nullable: true })
    family_medical_history: { // Antecedentes familiares
        obesity?: boolean;
        diabetes?: boolean;
        hta?: boolean; // Hipertensión
        cancer?: boolean;
        hypo_hyperthyroidism?: boolean;
        dyslipidemia?: boolean;
        other_history?: string; // Otros antecedentes
    } | null;

    // --- ASPECTOS GINECOLÓGICOS ---
    @Column({ type: 'text', nullable: true })
    gynecological_aspects: string | null;

    // --- ESTILO DE VIDA ---
    @Column({ type: 'jsonb', nullable: true })
    daily_activities: { // Diario de Actividades (24 horas)
        wake_up?: string; // Hora y actividad
        breakfast?: string;
        lunch?: string;
        dinner?: string;
        sleep?: string; // Hora y actividad
        other_hours?: { hour: string; activity: string }[];
    } | null;

    @Column({ type: 'varchar', length: 50, nullable: true })
    activity_level_description: string | null; // Ej: 'Muy ligera', 'Ligera', 'Moderada', 'Pesada', 'Excepcional'

    @Column({ type: 'jsonb', nullable: true })
    physical_exercise: {
        performs_exercise?: boolean;
        type?: string;
        frequency?: string;
        duration?: string;
        since_when?: string;
    } | null;

    @Column({ type: 'jsonb', nullable: true })
    consumption_habits: { // Consumo (frecuencia y cantidad)
        alcohol?: string;
        tobacco?: string;
        coffee?: string;
        other_substances?: string;
    } | null;

    // --- SIGNOS ---
    @Column({ type: 'text', nullable: true })
    general_appearance: string | null; // Aspecto General (cabello, ojos, piel, uñas, labios, encías, etc.)

    @Column({ type: 'jsonb', nullable: true })
    blood_pressure: {
        knows_bp?: boolean;
        habitual_bp?: string;
        systolic?: number; // Presión Sistólica
        diastolic?: number; // Presión Diastólica
    } | null;

    // --- INDICADORES BIOQUÍMICOS ---
    @Column({ type: 'jsonb', nullable: true })
    biochemical_indicators: any | null; // JSON flexible para resultados de laboratorio

    // --- INDICADORES DIETÉTICOS ---
    @Column({ type: 'jsonb', nullable: true })
    dietary_history: {
        received_nutritional_guidance?: boolean;
        when_received?: string;
        adherence_level?: string; // Ej: 'Nada', 'Mínimo', 'Moderado apego', 'Buen apego', 'Excelente apego'
        adherence_reason?: string;
        food_preparer?: string;
        eats_at_home_or_out?: string;
        modified_alimentation_last_6_months?: boolean;
        modification_reason?: string;
        most_hungry_time?: string;
        preferred_foods?: string[];
        disliked_foods?: string[];
        malestar_alergia_foods?: string[]; // Alimentos que causan malestar o alergia
        takes_supplements?: boolean;
        supplement_details?: string; // Cuál, Dosis, Por qué
    } | null;

    @Column({ type: 'jsonb', nullable: true })
    food_group_consumption_frequency: { // Frecuencia de consumo por grupos de alimentos (SEMANAL)
        vegetables?: number;
        fruits?: number;
        cereals?: number;
        legumes?: number;
        animal_products?: number;
        milk_products?: number;
        fats?: number;
        sugars?: number;
        alcohol?: number;
        other_frequency?: { group: string; frequency: number }[];
    } | null;

    @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
    water_consumption_liters: number | null; // Vasos de agua al día (convertir a litros)

    @Column({ type: 'jsonb', nullable: true })
    daily_diet_record: { // Recordatorio de 24 hrs.
        time_intervals?: { time: string; foods: string; quantity: string }[];
        estimated_kcal?: number;
    } | null;

    // --- INDICADORES ANTROPOMÉTRICOS ---
    @Column({ type: 'jsonb', nullable: true })
    anthropometric_measurements: { // Mediciones y evaluaciones
        // Cada campo podría ser un objeto para guardar historial de mediciones si se desea
        // Ej: current_weight_kg?: number;
        //     weight_history_kg?: { date: Date; value: number; interpretation: string; }[]; // Podría vincularse a PatientProgressLog
        
        current_weight_kg?: number;
        habitual_weight_kg?: number;
        height_m?: number;
        arm_circ_cm?: number; // C. Brazo
        waist_circ_cm?: number; // C. Cintura
        abdominal_circ_cm?: number; // C. Abdominal
        hip_circ_cm?: number; // C. Cadera
        calf_circ_cm?: number; // C. Pantorrilla
        triceps_skinfold_mm?: number; // P.C. Tricipital
        bicipital_skinfold_mm?: number; // P.C. Bicipital
        subscapular_skinfold_mm?: number; // P.C. Subescapular
        suprailiac_skinfold_mm?: number; // P.C. Suprailíaco
    } | null;

    @Column({ type: 'jsonb', nullable: true })
    anthropometric_evaluations: { // Evaluación e interpretación
        complexion?: string;
        ideal_weight_kg?: number;
        imc_kg_t2?: number;
        weight_variation_percent?: number; // % variación de peso ideal
        habitual_weight_variation_percent?: number; // % variación de peso habitual
        min_max_imc_weight_kg?: { min: number; max: number };
        adjusted_ideal_weight_kg?: number;
        waist_hip_ratio_cm?: number; // Índice cintura-cadera
        arm_muscle_area_cm2?: number;
        total_muscle_mass_kg?: number;
        body_fat_percentage?: number; // % grasa corporal
        total_body_fat_kg?: number;
        fat_free_mass_kg?: number;
        fat_excess_deficiency_percent?: number; // % exceso o deficiencia de grasa corporal
        fat_excess_deficiency_kg?: number; // Exceso o deficiencia de grasa corporal (kg)
        triceps_skinfold_percentile?: number; // Pliegue cutáneo tricipital (percentil)
        subscapular_skinfold_percentile?: number; // Pliegue cutáneo subescapular (percentil)
        total_body_water_liters?: number; // Agua corporal total (lt)
        // Interpretación de Datos es un campo de texto libre
    } | null;

    @Column({ type: 'text', nullable: true })
    nutritional_diagnosis: string | null; // Dx Nutricional

    @Column({ type: 'jsonb', nullable: true })
    energy_nutrient_needs: { // Necesidades energéticas y nutrimentales
        get?: number; // GET= GEB
        geb?: number; // GEB
        eta?: number; // ETA
        fa?: number; // FA
        total_calories?: number;
    } | null;

    @Column({ type: 'text', nullable: true })
    nutritional_plan_and_management: string | null; // Plan y Manejo nutricional (Objetivo, Ajuste Calórico, Tipo de Dieta)

    @Column({ type: 'jsonb', nullable: true })
    macronutrient_distribution: { // DISTRIBUCIÓN DE MACRONUTRIENTES
        carbohydrates_g?: number;
        carbohydrates_kcal?: number;
        carbohydrates_percent?: number;
        proteins_g?: number;
        proteins_kcal?: number;
        proteins_percent?: number;
        lipids_g?: number;
        lipids_kcal?: number;
        lipids_percent?: number;
    } | null;

    @Column({ type: 'text', nullable: true })
    dietary_calculation_scheme: string | null; // ESQUEMA DE CALCULO DIETETICO

    @Column({ type: 'jsonb', nullable: true })
    menu_details: any | null; // MENÚ (JSON flexible para la estructura de un menú detallado)

    @Column({ type: 'text', nullable: true })
    evolution_and_follow_up_notes: string | null; // NOTA DE EVOLUCIÓN Y SEGUIMIENTO

    @Column({ type: 'varchar', length: 255, nullable: true })
    graph_url: string | null; // URL de la gráfica (si se genera una imagen)

    // 📄 NUEVOS CAMPOS PARA DOCUMENTOS
    @Column({ type: 'jsonb', nullable: true })
    laboratory_documents: {
        id: string;
        filename: string;
        original_name: string;
        file_path: string;
        file_url: string;
        file_size: number;
        upload_date: Date;
        uploaded_by: 'patient' | 'nutritionist';
        description?: string;
        lab_date?: Date;
    }[] | null;

    @Column({ type: 'jsonb', nullable: true })
    document_metadata: {
        last_pdf_generated?: Date;
        pdf_version?: number;
        total_attachments?: number;
    } | null;

    // 💊 INTERACCIONES FÁRMACO-NUTRIENTE
    @Column({ type: 'jsonb', nullable: true })
    drug_nutrient_interactions: {
        id: string;
        medication: {
            id: string;
            name: string;
            generic_name?: string;
            dosage?: string;
            frequency?: string;
        };
        nutrients_affected: string[];
        interaction_type: 'absorption' | 'metabolism' | 'excretion' | 'antagonism';
        severity: 'low' | 'moderate' | 'high' | 'critical';
        description: string;
        recommendations: string[];
        timing_considerations?: string;
        foods_to_avoid?: string[];
        foods_to_increase?: string[];
        monitoring_required?: boolean;
        created_date: Date;
        updated_date: Date;
    }[] | null;

    @CreateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
    created_at!: Date;

    @UpdateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
    updated_at!: Date;
}