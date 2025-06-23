// src/modules/patients/patient.dto.ts
import {
    IsNumber,
    Min,
    Max,
    IsString,
    IsOptional,
    IsArray,
    ArrayMinSize,
    ArrayMaxSize,
    Length,
    IsNotEmpty,
    IsEmail,
    IsDateString,
    IsIn,
    ValidateNested,
    IsBoolean,
    IsObject,
    IsInt,
} from 'class-validator';
import { Type, Transform } from 'class-transformer';

// ⭐ PRIMERO definir PatientProfileDto para evitar hoisting errors
export class PatientProfileDto {
    @IsOptional()
    @IsNumber({}, { message: 'La altura debe ser un número.' })
    @Min(50, { message: 'La altura debe ser mayor que 50 cm.' })
    @Max(250, { message: 'La altura no puede exceder 250 cm.' })
    height?: number;

    @IsOptional()
    @IsNumber({}, { message: 'El peso debe ser un número.' })
    @Min(20, { message: 'El peso debe ser mayor que 20 kg.' })
    @Max(300, { message: 'El peso no puede exceder 300 kg.' })
    current_weight?: number;

    @IsOptional()
    @IsString({ message: 'El nivel de actividad debe ser una cadena de texto.' })
    @Length(3, 50, { message: 'El nivel de actividad debe tener entre 3 y 50 caracteres.' })
    activity_level?: string;

    @IsOptional()
    @IsArray({ message: 'Las condiciones médicas deben ser un array de cadenas de texto.' })
    @IsString({ each: true, message: 'Cada condición médica debe ser una cadena de texto.' })
    medical_conditions?: string[];

    @IsOptional()
    @IsArray({ message: 'Las alergias deben ser un array de cadenas de texto.' })
    @IsString({ each: true, message: 'Cada alergia debe ser una cadena de texto.' })
    allergies?: string[];

    @IsOptional()
    @IsArray({ message: 'Los objetivos deben ser un array de cadenas de texto.' })
    @IsString({ each: true, message: 'Cada objetivo debe ser una cadena de texto.' })
    objectives?: string[];
}

// ⭐ AHORA definir CreatePatientByNutritionistDto
export class CreatePatientByNutritionistDto {
    // --- Campos obligatorios del usuario ---
    @IsNotEmpty({ message: 'El email es obligatorio.' })
    @IsEmail({}, { message: 'El email debe tener un formato válido.' })
    email!: string;

    @IsNotEmpty({ message: 'La contraseña temporal es obligatoria.' })
    @IsString({ message: 'La contraseña debe ser una cadena de texto.' })
    @Length(6, 50, { message: 'La contraseña debe tener entre 6 y 50 caracteres.' })
    password!: string;

    @IsNotEmpty({ message: 'El nombre es obligatorio.' })
    @IsString({ message: 'El nombre debe ser una cadena de texto.' })
    @Length(2, 100, { message: 'El nombre debe tener entre 2 y 100 caracteres.' })
    first_name!: string;

    @IsNotEmpty({ message: 'Los apellidos son obligatorios.' })
    @IsString({ message: 'Los apellidos deben ser una cadena de texto.' })
    @Length(2, 100, { message: 'Los apellidos deben tener entre 2 y 100 caracteres.' })
    last_name!: string;

    // --- Campos opcionales del usuario ---
    @IsOptional()
    @IsString({ message: 'El teléfono debe ser una cadena de texto.' })
    @Length(10, 20, { message: 'El teléfono debe tener entre 10 y 20 caracteres.' })
    phone?: string;

    @IsOptional()
    @IsDateString({}, { message: 'La fecha de nacimiento debe ser una fecha válida (YYYY-MM-DD).' })
    birth_date?: string;

    @IsOptional()
    @IsNumber({}, { message: 'La edad debe ser un número.' })
    @Min(1, { message: 'La edad debe ser mayor que 0.' })
    @Max(120, { message: 'La edad no puede exceder 120 años.' })
    age?: number;

    @IsOptional()
    @IsString({ message: 'El género debe ser una cadena de texto.' })
    @IsIn(['male', 'female', 'other'], { message: 'El género debe ser: male, female o other.' })
    gender?: 'male' | 'female' | 'other';

    // --- Perfil del paciente (opcional) ---
    @IsOptional()
    @ValidateNested({ message: 'Los datos del perfil no son válidos.' })
    @Type(() => PatientProfileDto)
    profile?: PatientProfileDto;
}

// DTO para la creación inicial del perfil del paciente o para actualizarlo
export class CreateUpdatePatientProfileDto {
    // --- Datos biométricos (actualizados/nuevos) ---
    @IsOptional()
    @IsNumber({}, { message: 'El peso actual debe ser un número.' })
    @Min(1, { message: 'El peso actual debe ser mayor que 0.' })
    @Max(500, { message: 'El peso actual no puede exceder 500 kg.' })
    currentWeight?: number; // Peso actual en kg

    @IsOptional()
    @IsNumber({}, { message: 'La altura debe ser un número.' })
    @Min(1, { message: 'La altura debe ser mayor que 0.' })
    @Max(300, { message: 'La altura no puede exceder 300 cm.' })
    height?: number; // Altura en cm

    @IsOptional()
    @IsString({ message: 'El nivel de actividad física debe ser una cadena de texto.' })
    @Length(3, 50, { message: 'El nivel de actividad física debe tener entre 3 y 50 caracteres.' })
    activityLevel?: string; // Ej: 'sedentario', 'ligero', 'moderado', 'activo'

    // --- Salud y objetivos ---
    @IsOptional()
    @IsArray({ message: 'Los objetivos deben ser un array de cadenas de texto.' })
    @IsString({ each: true, message: 'Cada objetivo debe ser una cadena de texto.' })
    @ArrayMinSize(0, { message: 'Los objetivos no pueden ser un array vacío.' })
    goals?: string[]; // Ej: ['bajar peso', 'ganar masa muscular', 'controlar diabetes']

    @IsOptional()
    @IsArray({ message: 'Las condiciones médicas deben ser un array de cadenas de texto.' })
    @IsString({ each: true, message: 'Cada condición médica debe ser una cadena de texto.' })
    medicalConditions?: string[];

    @IsOptional()
    @IsArray({ message: 'Las alergias alimentarias deben ser un array de cadenas de texto.' })
    @IsString({ each: true, message: 'Cada alergia debe ser una cadena de texto.' })
    allergies?: string[];

    @IsOptional()
    @IsArray({ message: 'Las intolerancias deben ser un array de cadenas de texto.' })
    @IsString({ each: true, message: 'Cada intolerancia debe ser una cadena de texto.' })
    intolerances?: string[];

    @IsOptional()
    @IsArray({ message: 'Los medicamentos deben ser un array de cadenas de texto.' })
    @IsString({ each: true, message: 'Cada medicamento debe ser una cadena de texto.' })
    medications?: string[];

    @IsOptional()
    @IsString({ message: 'Las notas clínicas deben ser una cadena de texto.' })
    @Length(0, 1000, { message: 'Las notas clínicas no pueden exceder los 1000 caracteres.' })
    clinicalNotes?: string;

    @IsOptional()
    @IsString({ message: 'El estado de embarazo/lactancia debe ser una cadena de texto.' })
    pregnancyStatus?: string; // Ej: 'embarazada', 'lactancia', 'no_aplica'

    // --- Preferencias y estilo de vida ---
    @IsOptional()
    @IsArray({ message: 'Las preferencias dietéticas deben ser un array de cadenas de texto.' })
    @IsString({ each: true, message: 'Cada preferencia dietética debe ser una cadena de texto.' })
    dietaryPreferences?: string[];

    @IsOptional()
    @IsArray({ message: 'Las preferencias de alimentos deben ser un array de cadenas de texto.' })
    @IsString({ each: true, message: 'Cada preferencia de alimento debe ser una cadena de texto.' })
    foodPreferences?: string[];

    @IsOptional()
    @IsNumber({}, { message: 'El presupuesto mensual debe ser un número.' })
    @Min(0, { message: 'El presupuesto mensual no puede ser negativo.' })
    monthlyBudget?: number;

    @IsOptional()
    @IsString({ message: 'El horario de comidas debe ser una cadena de texto.' })
    mealSchedule?: string;

    // --- Otros campos existentes en PatientProfile si el paciente pudiera actualizarlos directamente ---
    // @IsOptional()
    // @IsArray()
    // @ValidateNested({ each: true })
    // @Type(() => WeightHistoryEntry) // Si defines un DTO para las entradas de historial
    // weightHistory?: { date: Date; weight: number }[];

    // @IsOptional()
    // @IsArray()
    // @ValidateNested({ each: true })
    // @Type(() => MeasurementEntry)
    // measurements?: { date: Date; type: string; value: number }[];

    // @IsOptional()
    // @IsArray()
    // @ValidateNested({ each: true })
    // @Type(() => PhotoEntry)
    // photos?: { date: Date; url: string; description: string }[];

    // @IsOptional()
    // @IsArray()
    // @ValidateNested({ each: true })
    // @Type(() => ClinicalDocEntry)
    // clinicalStudiesDocs?: { id: string; filename: string; url: string; upload_date: Date; description: string }[];
}

// ==================== TIPOS PARA ESTRUCTURAS COMPLEJAS ====================
export interface CurrentSymptomsDTO {
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
}

export interface FamilyHistoryDTO {
    obesity?: boolean;
    diabetes?: boolean;
    hypertension?: boolean; // HTA
    cancer?: boolean;
    thyroid_issues?: boolean; // hipo/hipertiroidismo
    dyslipidemia?: boolean;
    other?: string;
}

export interface BiochemicalIndicatorsDTO {
    glucose?: number;
    cholesterol?: number;
    triglycerides?: number;
    hdl?: number;
    ldl?: number;
    hemoglobin?: number;
    hematocrit?: number;
    other_labs?: string;
    last_update?: Date;
}

export interface DailyScheduleDTO {
    wake_up_time?: string;
    breakfast_time?: string;
    lunch_time?: string;
    dinner_time?: string;
    sleep_time?: string;
    main_activities?: {
        time: string;
        activity: string;
    }[];
}

export interface FoodFrequencyDTO {
    vegetables?: string; // semanal
    fruits?: string;
    cereals?: string;
    legumes?: string;
    animal_products?: string;
    dairy?: string;
    fats?: string;
    sugars?: string;
    alcohol?: string;
}

// ==================== DTO PARA CREAR PACIENTE COMPLETO ====================
export class CreatePatientDTO {
    // DATOS PERSONALES
    @IsString()
    first_name!: string;

    @IsString()
    last_name!: string;

    @IsEmail()
    email!: string;

    @IsOptional()
    @IsInt()
    @Min(1)
    @Max(120)
    age?: number;

    @IsOptional()
    @IsString()
    gender?: string;

    // MOTIVO DE CONSULTA
    @IsOptional()
    @IsString()
    consultation_reason?: string;

    // DATOS BIOMÉTRICOS
    @IsOptional()
    @IsNumber()
    @Transform(({ value }) => value ? parseFloat(value) : undefined)
    current_weight?: number;

    @IsOptional()
    @IsNumber()
    @Transform(({ value }) => value ? parseFloat(value) : undefined)
    height?: number;

    @IsOptional()
    @IsString()
    activity_level?: string;

    // ANTECEDENTES PATOLÓGICOS
    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    medical_conditions?: string[];

    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    allergies?: string[];

    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    medications?: string[];

    @IsOptional()
    @IsString()
    diagnosed_diseases?: string;

    @IsOptional()
    @IsString()
    diagnosed_since?: string;

    @IsOptional()
    @IsString()
    important_diseases_history?: string;

    @IsOptional()
    @IsString()
    current_treatments?: string;

    @IsOptional()
    @IsString()
    surgeries_history?: string;

    // PROBLEMAS ACTUALES
    @IsOptional()
    @IsObject()
    current_symptoms?: CurrentSymptomsDTO;

    // ANTECEDENTES FAMILIARES
    @IsOptional()
    @IsObject()
    family_history?: FamilyHistoryDTO;

    // ACTIVIDAD FÍSICA
    @IsOptional()
    @IsBoolean()
    does_exercise?: boolean;

    @IsOptional()
    @IsString()
    exercise_type?: string;

    @IsOptional()
    @IsString()
    exercise_frequency?: string;

    @IsOptional()
    @IsString()
    exercise_duration?: string;

    @IsOptional()
    @IsString()
    exercise_since?: string;

    // CONSUMO DE SUSTANCIAS
    @IsOptional()
    @IsString()
    alcohol_consumption?: string;

    @IsOptional()
    @IsString()
    tobacco_consumption?: string;

    @IsOptional()
    @IsString()
    coffee_consumption?: string;

    // SIGNOS VITALES Y FÍSICOS
    @IsOptional()
    @IsString()
    general_appearance?: string;

    @IsOptional()
    @IsBoolean()
    knows_blood_pressure?: boolean;

    @IsOptional()
    @IsString()
    usual_blood_pressure?: string;

    // INDICADORES BIOQUÍMICOS
    @IsOptional()
    @IsObject()
    biochemical_indicators?: BiochemicalIndicatorsDTO;

    // INDICADORES DIETÉTICOS
    @IsOptional()
    @IsBoolean()
    previous_nutritional_guidance?: boolean;

    @IsOptional()
    @IsString()
    previous_guidance_when?: string;

    @IsOptional()
    @IsString()
    guidance_adherence_level?: string; // nada, mínimo, moderado, bueno, excelente

    @IsOptional()
    @IsString()
    guidance_adherence_reason?: string;

    @IsOptional()
    @IsString()
    who_prepares_food?: string;

    @IsOptional()
    @IsString()
    eats_home_or_out?: string;

    @IsOptional()
    @IsBoolean()
    diet_modified_last_6_months?: boolean;

    @IsOptional()
    @IsString()
    diet_modification_reason?: string;

    @IsOptional()
    @IsString()
    hungriest_time?: string;

    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    preferred_foods?: string[];

    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    disliked_foods?: string[];

    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    food_intolerances?: string[];

    @IsOptional()
    @IsBoolean()
    takes_supplements?: boolean;

    @IsOptional()
    @IsString()
    supplements_details?: string;

    @IsOptional()
    @IsInt()
    @Min(0)
    @Max(20)
    daily_water_glasses?: number;

    // ESTILO DE VIDA
    @IsOptional()
    @IsObject()
    daily_schedule?: DailyScheduleDTO;

    // FRECUENCIA DE CONSUMO POR GRUPOS
    @IsOptional()
    @IsObject()
    food_frequency?: FoodFrequencyDTO;

    // CAMPOS EXISTENTES MANTENIDOS
    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    goals?: string[];

    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    intolerances?: string[];

    @IsOptional()
    @IsString()
    clinical_notes?: string;

    @IsOptional()
    @IsString()
    pregnancy_status?: string;

    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    dietary_preferences?: string[];

    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    food_preferences?: string[];

    @IsOptional()
    @IsNumber()
    @Transform(({ value }) => value ? parseFloat(value) : undefined)
    monthly_budget?: number;

    @IsOptional()
    @IsString()
    meal_schedule?: string;
}

// ==================== DTO PARA ACTUALIZAR PACIENTE ====================
export class UpdatePatientDTO {
    @IsOptional()
    @IsString()
    first_name?: string;

    @IsOptional()
    @IsString()
    last_name?: string;

    @IsOptional()
    @IsInt()
    @Min(1)
    @Max(120)
    age?: number;

    @IsOptional()
    @IsString()
    gender?: string;

    // Todos los campos opcionales del expediente clínico
    @IsOptional()
    @IsString()
    consultation_reason?: string;

    @IsOptional()
    @IsNumber()
    @Transform(({ value }) => value ? parseFloat(value) : undefined)
    current_weight?: number;

    @IsOptional()
    @IsNumber()
    @Transform(({ value }) => value ? parseFloat(value) : undefined)
    height?: number;

    @IsOptional()
    @IsString()
    activity_level?: string;

    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    medical_conditions?: string[];

    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    allergies?: string[];

    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    medications?: string[];

    @IsOptional()
    @IsString()
    diagnosed_diseases?: string;

    @IsOptional()
    @IsString()
    diagnosed_since?: string;

    @IsOptional()
    @IsString()
    important_diseases_history?: string;

    @IsOptional()
    @IsString()
    current_treatments?: string;

    @IsOptional()
    @IsString()
    surgeries_history?: string;

    @IsOptional()
    @IsObject()
    current_symptoms?: CurrentSymptomsDTO;

    @IsOptional()
    @IsObject()
    family_history?: FamilyHistoryDTO;

    @IsOptional()
    @IsBoolean()
    does_exercise?: boolean;

    @IsOptional()
    @IsString()
    exercise_type?: string;

    @IsOptional()
    @IsString()
    exercise_frequency?: string;

    @IsOptional()
    @IsString()
    exercise_duration?: string;

    @IsOptional()
    @IsString()
    exercise_since?: string;

    @IsOptional()
    @IsString()
    alcohol_consumption?: string;

    @IsOptional()
    @IsString()
    tobacco_consumption?: string;

    @IsOptional()
    @IsString()
    coffee_consumption?: string;

    @IsOptional()
    @IsString()
    general_appearance?: string;

    @IsOptional()
    @IsBoolean()
    knows_blood_pressure?: boolean;

    @IsOptional()
    @IsString()
    usual_blood_pressure?: string;

    @IsOptional()
    @IsObject()
    biochemical_indicators?: BiochemicalIndicatorsDTO;

    @IsOptional()
    @IsBoolean()
    previous_nutritional_guidance?: boolean;

    @IsOptional()
    @IsString()
    previous_guidance_when?: string;

    @IsOptional()
    @IsString()
    guidance_adherence_level?: string;

    @IsOptional()
    @IsString()
    guidance_adherence_reason?: string;

    @IsOptional()
    @IsString()
    who_prepares_food?: string;

    @IsOptional()
    @IsString()
    eats_home_or_out?: string;

    @IsOptional()
    @IsBoolean()
    diet_modified_last_6_months?: boolean;

    @IsOptional()
    @IsString()
    diet_modification_reason?: string;

    @IsOptional()
    @IsString()
    hungriest_time?: string;

    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    preferred_foods?: string[];

    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    disliked_foods?: string[];

    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    food_intolerances?: string[];

    @IsOptional()
    @IsBoolean()
    takes_supplements?: boolean;

    @IsOptional()
    @IsString()
    supplements_details?: string;

    @IsOptional()
    @IsInt()
    @Min(0)
    @Max(20)
    daily_water_glasses?: number;

    @IsOptional()
    @IsObject()
    daily_schedule?: DailyScheduleDTO;

    @IsOptional()
    @IsObject()
    food_frequency?: FoodFrequencyDTO;

    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    goals?: string[];

    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    intolerances?: string[];

    @IsOptional()
    @IsString()
    clinical_notes?: string;

    @IsOptional()
    @IsString()
    pregnancy_status?: string;

    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    dietary_preferences?: string[];

    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    food_preferences?: string[];

    @IsOptional()
    @IsNumber()
    @Transform(({ value }) => value ? parseFloat(value) : undefined)
    monthly_budget?: number;

    @IsOptional()
    @IsString()
    meal_schedule?: string;
}

// ==================== DTO PARA RESPUESTAS ====================
export class PatientResponseDTO {
    id!: string;
    user!: {
        id: string;
        email: string;
        first_name: string;
        last_name: string;
        age?: number;
        gender?: string;
        created_at: Date;
    };
    
    // Expediente clínico completo
    consultation_reason?: string;
    current_weight?: number;
    height?: number;
    activity_level?: string;
    
    // Antecedentes
    medical_conditions?: string[];
    allergies?: string[];
    medications?: string[];
    diagnosed_diseases?: string;
    diagnosed_since?: string;
    important_diseases_history?: string;
    current_treatments?: string;
    surgeries_history?: string;
    
    // Problemas actuales y antecedentes familiares
    current_symptoms?: CurrentSymptomsDTO;
    family_history?: FamilyHistoryDTO;
    
    // Actividad física y consumo
    does_exercise?: boolean;
    exercise_type?: string;
    exercise_frequency?: string;
    exercise_duration?: string;
    exercise_since?: string;
    alcohol_consumption?: string;
    tobacco_consumption?: string;
    coffee_consumption?: string;
    
    // Signos vitales
    general_appearance?: string;
    knows_blood_pressure?: boolean;
    usual_blood_pressure?: string;
    biochemical_indicators?: BiochemicalIndicatorsDTO;
    
    // Indicadores dietéticos
    previous_nutritional_guidance?: boolean;
    previous_guidance_when?: string;
    guidance_adherence_level?: string;
    guidance_adherence_reason?: string;
    who_prepares_food?: string;
    eats_home_or_out?: string;
    diet_modified_last_6_months?: boolean;
    diet_modification_reason?: string;
    hungriest_time?: string;
    preferred_foods?: string[];
    disliked_foods?: string[];
    food_intolerances?: string[];
    takes_supplements?: boolean;
    supplements_details?: string;
    daily_water_glasses?: number;
    
    // Estilo de vida
    daily_schedule?: DailyScheduleDTO;
    food_frequency?: FoodFrequencyDTO;
    
    // Campos existentes
    goals?: string[];
    intolerances?: string[];
    clinical_notes?: string;
    pregnancy_status?: string;
    dietary_preferences?: string[];
    food_preferences?: string[];
    monthly_budget?: number;
    meal_schedule?: string;
    
    // Metadatos
    created_at!: Date;
    updated_at!: Date;
    
    // Campos calculados
    bmi?: number;
    bmi_category?: string;
    age_calculated?: number;
}

// ==================== DTO PARA BÚSQUEDA Y FILTROS ====================
export class PatientsSearchDTO {
    @IsOptional()
    @IsString()
    search?: string; // Búsqueda en nombre, email

    @IsOptional()
    @IsString()
    gender?: string;

    @IsOptional()
    @IsInt()
    @Min(1)
    age_min?: number;

    @IsOptional()
    @IsInt()
    @Max(120)
    age_max?: number;

    @IsOptional()
    @IsString()
    activity_level?: string;

    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    medical_conditions?: string[];

    @IsOptional()
    @IsString()
    bmi_category?: string; // underweight, normal, overweight, obese

    @IsOptional()
    @IsInt()
    @Min(1)
    page?: number;

    @IsOptional()
    @IsInt()
    @Min(1)
    @Max(100)
    limit?: number;

    @IsOptional()
    @IsString()
    sort_by?: string; // name, created_at, weight, bmi

    @IsOptional()
    @IsString()
    sort_order?: 'ASC' | 'DESC';
}

// ==================== ESCENARIO 1: REGISTRO POR NUTRIÓLOGO ====================
export class CreatePatientByNutritionistDTO {
    // Datos básicos del paciente
    @IsString()
    @IsEmail()
    email!: string;

    @IsString()
    first_name!: string;

    @IsString()
    last_name!: string;

    @IsOptional()
    @IsNumber()
    @Min(1)
    @Max(120)
    age?: number;

    @IsOptional()
    @IsString()
    gender?: string;

    @IsOptional()
    @IsString()
    phone?: string;

    // Expediente clínico completo (todos los campos existentes)
    @IsOptional()
    @IsString()
    consultation_reason?: string;

    @IsOptional()
    @IsNumber()
    @Min(1)
    current_weight?: number;

    @IsOptional()
    @IsNumber()
    @Min(50)
    @Max(250)
    height?: number;

    @IsOptional()
    @IsString()
    activity_level?: string;

    // Antecedentes patológicos
    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    medical_conditions?: string[];

    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    allergies?: string[];

    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    medications?: string[];

    @IsOptional()
    @IsString()
    diagnosed_diseases?: string;

    @IsOptional()
    @IsString()
    diagnosed_since?: string;

    @IsOptional()
    @IsString()
    important_diseases_history?: string;

    @IsOptional()
    @IsString()
    current_treatments?: string;

    @IsOptional()
    @IsString()
    surgeries_history?: string;

    // Problemas actuales y antecedentes familiares
    @IsOptional()
    @IsObject()
    current_symptoms?: CurrentSymptomsDTO;

    @IsOptional()
    @IsObject()
    family_history?: FamilyHistoryDTO;

    // Actividad física y consumo
    @IsOptional()
    @IsBoolean()
    does_exercise?: boolean;

    @IsOptional()
    @IsString()
    exercise_type?: string;

    @IsOptional()
    @IsString()
    exercise_frequency?: string;

    @IsOptional()
    @IsString()
    exercise_duration?: string;

    @IsOptional()
    @IsString()
    exercise_since?: string;

    @IsOptional()
    @IsString()
    alcohol_consumption?: string;

    @IsOptional()
    @IsString()
    tobacco_consumption?: string;

    @IsOptional()
    @IsString()
    coffee_consumption?: string;

    // Signos vitales
    @IsOptional()
    @IsString()
    general_appearance?: string;

    @IsOptional()
    @IsBoolean()
    knows_blood_pressure?: boolean;

    @IsOptional()
    @IsString()
    usual_blood_pressure?: string;

    @IsOptional()
    @IsObject()
    biochemical_indicators?: BiochemicalIndicatorsDTO;

    // Indicadores dietéticos
    @IsOptional()
    @IsBoolean()
    previous_nutritional_guidance?: boolean;

    @IsOptional()
    @IsString()
    previous_guidance_when?: string;

    @IsOptional()
    @IsString()
    guidance_adherence_level?: string;

    @IsOptional()
    @IsString()
    guidance_adherence_reason?: string;

    @IsOptional()
    @IsString()
    who_prepares_food?: string;

    @IsOptional()
    @IsString()
    eats_home_or_out?: string;

    @IsOptional()
    @IsBoolean()
    diet_modified_last_6_months?: boolean;

    @IsOptional()
    @IsString()
    diet_modification_reason?: string;

    @IsOptional()
    @IsString()
    hungriest_time?: string;

    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    preferred_foods?: string[];

    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    disliked_foods?: string[];

    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    food_intolerances?: string[];

    @IsOptional()
    @IsBoolean()
    takes_supplements?: boolean;

    @IsOptional()
    @IsString()
    supplements_details?: string;

    @IsOptional()
    @IsNumber()
    @Min(0)
    @Max(20)
    daily_water_glasses?: number;

    // Estilo de vida
    @IsOptional()
    @IsObject()
    daily_schedule?: DailyScheduleDTO;

    @IsOptional()
    @IsObject()
    food_frequency?: FoodFrequencyDTO;

    // Campos existentes mantenidos
    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    goals?: string[];

    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    intolerances?: string[];

    @IsOptional()
    @IsString()
    clinical_notes?: string;

    @IsOptional()
    @IsString()
    pregnancy_status?: string;

    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    dietary_preferences?: string[];

    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    food_preferences?: string[];

    @IsOptional()
    @IsNumber()
    @Min(0)
    monthly_budget?: number;

    @IsOptional()
    @IsString()
    meal_schedule?: string;
}

// ==================== ESCENARIO 2: REGISTRO BÁSICO DEL PACIENTE ====================
export class BasicPatientRegistrationDTO {
    // Datos personales básicos
    @IsString()
    @IsEmail()
    email!: string;

    @IsString()
    first_name!: string;

    @IsString()
    last_name!: string;

    @IsString()
    password!: string;

    @IsOptional()
    @IsNumber()
    @Min(1)
    @Max(120)
    age?: number;

    @IsOptional()
    @IsString()
    gender?: string;

    @IsString()
    phone!: string; // Requerido para pacientes online

    // Datos biométricos básicos
    @IsOptional()
    @IsNumber()
    @Min(1)
    current_weight?: number;

    @IsOptional()
    @IsNumber()
    @Min(50)
    @Max(250)
    height?: number;

    @IsOptional()
    @IsString()
    activity_level?: string;

    // Motivo básico de consulta
    @IsOptional()
    @IsString()
    consultation_reason?: string;

    // Objetivos básicos
    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    goals?: string[];

    // Alergias conocidas (por seguridad)
    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    allergies?: string[];

    // Plan seleccionado
    @IsString()
    selected_plan_id!: string;

    // Preferencias básicas
    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    dietary_preferences?: string[];
}

// ==================== RESPUESTA DE REGISTRO TEMPORAL ====================
export class TemporaryPatientResponseDTO {
    user_id!: string;
    email!: string;
    temporary_password!: string;
    expires_at!: Date;
    message!: string;
}

// ==================== RESPUESTA DE REGISTRO CON PLAN ====================
export class PatientWithSubscriptionResponseDTO {
    user_id!: string;
    email!: string;
    subscription_id!: string;
    plan_name!: string;
    start_date!: Date;
    end_date!: Date;
    requires_payment!: boolean;
    payment_amount?: number;
    message!: string;
}