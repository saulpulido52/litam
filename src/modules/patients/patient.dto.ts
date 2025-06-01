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
} from 'class-validator';

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