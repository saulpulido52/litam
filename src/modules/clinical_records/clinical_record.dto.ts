// src/modules/clinical_records/clinical_record.dto.ts
import {
    IsString,
    IsNotEmpty,
    Length,
    IsUUID,
    IsOptional,
    IsBoolean,
    IsNumber,
    Min,
    Max,
    IsArray,
    ValidateNested,
    IsDateString,
    IsObject,
    IsUrl,
    IsIn,
} from 'class-validator';
import { Type } from 'class-transformer';
import { TipoExpediente } from '../../database/entities/clinical_record.entity';

// ============== NUEVOS DTOs PARA EL SISTEMA EVOLUTIVO DE EXPEDIENTES ==============

export class SeguimientoMetadataDto {
    @IsOptional() @IsNumber() @Min(0) @Max(100) adherencia_plan?: number;
    @IsOptional() @IsString() @Length(0, 1000) dificultades?: string;
    @IsOptional() @IsNumber() @Min(1) @Max(5) satisfaccion?: number;
    @IsOptional() @IsBoolean() cambios_medicamentos?: boolean;
    @IsOptional() @IsString() @Length(0, 1000) nuevos_sintomas?: string;
    @IsOptional() @IsString() @Length(0, 1000) mejoras_notadas?: string;
    @IsOptional() @IsString() @Length(0, 1000) proximos_objetivos?: string;
}

export class AnalisisRiesgoBeneficioDto {
    @IsOptional() @IsString() @Length(0, 500) decision?: string;
    @IsOptional() @IsArray() @IsString({ each: true }) riesgos?: string[];
    @IsOptional() @IsArray() @IsString({ each: true }) beneficios?: string[];
    @IsOptional() @IsArray() @IsString({ each: true }) alternativas?: string[];
    @IsOptional() @IsString() @Length(0, 1000) razonamiento?: string;
}

export class JuicioClinicoDto {
    @IsOptional() @IsString() @Length(0, 1000) evaluacion_situacion?: string;
    @IsOptional() @IsString() @Length(0, 1000) respuesta_congruente?: string;
    @IsOptional() @IsArray() @IsString({ each: true }) factores_objetivos?: string[];
    @IsOptional() @IsArray() @IsString({ each: true }) factores_subjetivos?: string[];
    @IsOptional() @IsString() @Length(0, 1000) justificacion?: string;
}

export class CapacidadPacienteDto {
    @IsOptional() @IsBoolean() comprende_medicamentos?: boolean;
    @IsOptional() @IsBoolean() conoce_sintomas_alarma?: boolean;
    @IsOptional() @IsBoolean() sabe_contacto_emergencia?: boolean;
    @IsOptional() @IsBoolean() puede_auto_monitoreo?: boolean;
    @IsOptional() @IsBoolean() requiere_apoyo_familiar?: boolean;
    @IsOptional() @IsIn(['alto', 'medio', 'bajo']) nivel_independencia?: 'alto' | 'medio' | 'bajo';
    @IsOptional() @IsString() @Length(0, 500) observaciones?: string;
}

export class DeteccionExpedienteDto {
    @IsUUID('4', { message: 'El ID del paciente debe ser un UUID válido.' })
    patientId!: string;

    @IsOptional() @IsString() @Length(0, 2000) 
    motivoConsulta?: string;

    @IsOptional() @IsBoolean() 
    esProgramada?: boolean;

    @IsOptional() @IsString() @Length(0, 100)
    tipoConsultaSolicitada?: string;
}

export class RespuestaDeteccionExpedienteDto {
    tipoSugerido: TipoExpediente;
    razon: string;
    expedienteBaseId?: string;
    datosHeredables?: any;
    requiereConfirmacion: boolean;
    alertas?: string[];
}

export class DatosPreviosPacienteDto {
    ultimoExpediente?: any;
    datosEstaticos?: {
        antecedentes_familiares?: any;
        alergias?: any;
        enfermedades_cronicas?: any;
        cirugias_previas?: any;
    };
    ultimasMediciones?: {
        peso?: number;
        altura?: number;
        imc?: number;
        presion_sistolica?: number;
        presion_diastolica?: number;
        fecha?: string;
    };
    tendencias?: {
        peso?: 'subiendo' | 'bajando' | 'estable';
        presion?: 'mejorando' | 'empeorando' | 'estable';
    };
}

// --- DTOs para campos JSONB anidados ---

export class CurrentProblemsDto {
    @IsOptional() @IsBoolean() diarrhea?: boolean;
    @IsOptional() @IsBoolean() constipation?: boolean;
    @IsOptional() @IsBoolean() gastritis?: boolean;
    @IsOptional() @IsBoolean() ulcer?: boolean;
    @IsOptional() @IsBoolean() nausea?: boolean;
    @IsOptional() @IsBoolean() pyrosis?: boolean;
    @IsOptional() @IsBoolean() vomiting?: boolean;
    @IsOptional() @IsBoolean() colitis?: boolean;
    @IsOptional() @IsString() @Length(0, 255) mouth_mechanics?: string;
    @IsOptional() @IsString() @Length(0, 500) other_problems?: string;
    @IsOptional() @IsString() @Length(0, 1000) observations?: string;
}

export class DiagnosedDiseasesDto {
    @IsOptional() @IsBoolean() hasDisease?: boolean;
    @IsOptional() @IsString() @Length(0, 255) diseaseName?: string;
    @IsOptional() @IsString() @Length(0, 100) sinceWhen?: string;
    @IsOptional() @IsBoolean() takesMedication?: boolean;
    @IsOptional() @IsArray() @IsString({ each: true }) medications_list?: string[];
    @IsOptional() @IsBoolean() hasImportantDisease?: boolean;
    @IsOptional() @IsString() @Length(0, 255) importantDiseaseName?: string;
    @IsOptional() @IsBoolean() takesSpecialTreatment?: boolean;
    @IsOptional() @IsString() @Length(0, 500) specialTreatmentDetails?: string;
    @IsOptional() @IsBoolean() hasSurgery?: boolean;
    @IsOptional() @IsString() @Length(0, 500) surgeryDetails?: string;
}

export class FamilyMedicalHistoryDto {
    @IsOptional() @IsBoolean() obesity?: boolean;
    @IsOptional() @IsBoolean() diabetes?: boolean;
    @IsOptional() @IsBoolean() hta?: boolean;
    @IsOptional() @IsBoolean() cancer?: boolean;
    @IsOptional() @IsBoolean() hypoHyperthyroidism?: boolean;
    @IsOptional() @IsBoolean() dyslipidemia?: boolean;
    @IsOptional() @IsString() @Length(0, 500) otherHistory?: string;
}

export class DailyActivityEntryDto {
    @IsString() @IsNotEmpty() @Length(1, 50) hour!: string;
    @IsString() @IsNotEmpty() @Length(1, 255) activity!: string;
}

export class DailyActivitiesDto {
    @IsOptional() @IsString() @Length(0, 50) wakeUp?: string;
    @IsOptional() @IsString() @Length(0, 50) breakfast?: string;
    @IsOptional() @IsString() @Length(0, 50) lunch?: string;
    @IsOptional() @IsString() @Length(0, 50) dinner?: string;
    @IsOptional() @IsString() @Length(0, 0) sleep?: string; // Longitud 0 si es solo hora
    @IsOptional() @IsArray() @ValidateNested({ each: true }) @Type(() => DailyActivityEntryDto) otherHours?: DailyActivityEntryDto[];
}

export class PhysicalExerciseDto {
    @IsOptional() @IsBoolean() performsExercise?: boolean;
    @IsOptional() @IsString() @Length(0, 255) type?: string;
    @IsOptional() @IsString() @Length(0, 100) frequency?: string;
    @IsOptional() @IsString() @Length(0, 100) duration?: string;
    @IsOptional() @IsString() @Length(0, 100) sinceWhen?: string;
}

export class ConsumptionHabitsDto {
    @IsOptional() @IsString() @Length(0, 100) alcohol?: string;
    @IsOptional() @IsString() @Length(0, 100) tobacco?: string;
    @IsOptional() @IsString() @Length(0, 100) coffee?: string;
    @IsOptional() @IsString() @Length(0, 500) otherSubstances?: string;
}

export class BloodPressureDto {
    @IsOptional() @IsBoolean() knowsBp?: boolean;
    @IsOptional() @IsString() @Length(0, 50) habitualBp?: string;
    @IsOptional() @IsNumber() @Min(50, { message: 'La presión sistólica debe ser al menos 50 mmHg.' }) @Max(250, { message: 'La presión sistólica no puede exceder 250 mmHg.' }) systolic?: number;
    @IsOptional() @IsNumber() @Min(30, { message: 'La presión diastólica debe ser al menos 30 mmHg.' }) @Max(150, { message: 'La presión diastólica no puede exceder 150 mmHg.' }) diastolic?: number;
}

export class DietaryHistoryDto {
    @IsOptional() @IsBoolean() receivedNutritionalGuidance?: boolean;
    @IsOptional() @IsString() @Length(0, 100) whenReceived?: string;
    @IsOptional() @IsString() @Length(0, 100) adherenceLevel?: string;
    @IsOptional() @IsString() @Length(0, 1000) adherenceReason?: string;
    @IsOptional() @IsString() @Length(0, 255) foodPreparer?: string;
    @IsOptional() @IsString() @Length(0, 255) eatsAtHomeOrOut?: string;
    @IsOptional() @IsBoolean() modifiedAlimentationLast6Months?: boolean;
    @IsOptional() @IsString() @Length(0, 1000) modificationReason?: string;
    @IsOptional() @IsString() @Length(0, 100) mostHungryTime?: string;
    @IsOptional() @IsArray() @IsString({ each: true }) preferredFoods?: string[];
    @IsOptional() @IsArray() @IsString({ each: true }) dislikedFoods?: string[];
    @IsOptional() @IsArray() @IsString({ each: true }) malestarAlergiaFoods?: string[];
    @IsOptional() @IsBoolean() takesSupplements?: boolean;
    @IsOptional() @IsString() @Length(0, 1000) supplementDetails?: string;
}

export class FoodGroupFrequencyEntryDto {
    @IsString() @IsNotEmpty() group!: string;
    @IsNumber() @Min(0) frequency!: number;
}

export class FoodGroupConsumptionFrequencyDto {
    @IsOptional() @IsNumber() @Min(0) vegetables?: number;
    @IsOptional() @IsNumber() @Min(0) fruits?: number;
    @IsOptional() @IsNumber() @Min(0) cereals?: number;
    @IsOptional() @IsNumber() @Min(0) legumes?: number;
    @IsOptional() @IsNumber() @Min(0) animalProducts?: number;
    @IsOptional() @IsNumber() @Min(0) milkProducts?: number;
    @IsOptional() @IsNumber() @Min(0) fats?: number;
    @IsOptional() @IsNumber() @Min(0) sugars?: number;
    @IsOptional() @IsNumber() @Min(0) alcohol?: number;
    @IsOptional() @IsArray() @ValidateNested({ each: true }) @Type(() => FoodGroupFrequencyEntryDto) otherFrequency?: FoodGroupFrequencyEntryDto[];
}

export class DailyDietRecordEntryDto {
    @IsString() @IsNotEmpty() @Length(1, 50) time!: string;
    @IsString() @IsNotEmpty() @Length(1, 500) foods!: string;
    @IsString() @IsOptional() @Length(0, 100) quantity?: string;
}

export class DailyDietRecordDto {
    @IsOptional() @IsArray() @ValidateNested({ each: true }) @Type(() => DailyDietRecordEntryDto) timeIntervals?: DailyDietRecordEntryDto[];
    @IsOptional() @IsNumber() @Min(0) estimatedKcal?: number;
}

export class AnthropometricMeasurementsDto {
    @IsOptional() @IsNumber() @Min(0) currentWeightKg?: number;
    @IsOptional() @IsNumber() @Min(0) habitualWeightKg?: number;
    @IsOptional() @IsNumber() @Min(0) heightM?: number;
    @IsOptional() @IsNumber() @Min(0) armCircCm?: number;
    @IsOptional() @IsNumber() @Min(0) waistCircCm?: number;
    @IsOptional() @IsNumber() @Min(0) abdominalCircCm?: number;
    @IsOptional() @IsNumber() @Min(0) hipCircCm?: number;
    @IsOptional() @IsNumber() @Min(0) calfCircCm?: number;
    @IsOptional() @IsNumber() @Min(0) tricepsSkinfoldMm?: number;
    @IsOptional() @IsNumber() @Min(0) bicipitalSkinfoldMm?: number;
    @IsOptional() @IsNumber() @Min(0) subscapularSkinfoldMm?: number;
    @IsOptional() @IsNumber() @Min(0) suprailiacSkinfoldMm?: number;
}

export class AnthropometricEvaluationsDto {
    @IsOptional() @IsString() @Length(0, 100) complexion?: string;
    @IsOptional() @IsNumber() @Min(0) idealWeightKg?: number;
    @IsOptional() @IsNumber() @Min(0) imcKgT2?: number;
    @IsOptional() @IsNumber() @Min(-100) @Max(100) weightVariationPercent?: number;
    @IsOptional() @IsNumber() @Min(-100) @Max(100) habitualWeightVariationPercent?: number;
    @IsOptional() @IsObject() minMaxImcWeightKg?: { min?: number; max?: number }; // Puede ser un objeto con min/max
    @IsOptional() @IsNumber() @Min(0) adjustedIdealWeightKg?: number;
    @IsOptional() @IsNumber() @Min(0) waistHipRatioCm?: number;
    @IsOptional() @IsNumber() @Min(0) armMuscleAreaCm2?: number;
    @IsOptional() @IsNumber() @Min(0) totalMuscleMassKg?: number;
    @IsOptional() @IsNumber() @Min(0) @Max(100) bodyFatPercentage?: number;
    @IsOptional() @IsNumber() @Min(0) totalBodyFatKg?: number;
    @IsOptional() @IsNumber() @Min(0) fatFreeMassKg?: number;
    @IsOptional() @IsNumber() @Min(-100) @Max(100) fatExcessDeficiencyPercent?: number;
    @IsOptional() @IsNumber() @Min(-100) @Max(100) fatExcessDeficiencyKg?: number;
    @IsOptional() @IsNumber() @Min(0) @Max(100) tricepsSkinfoldPercentile?: number;
    @IsOptional() @IsNumber() @Min(0) @Max(100) subscapularSkinfoldPercentile?: number;
    @IsOptional() @IsNumber() @Min(0) totalBodyWaterLiters?: number;
}

export class EnergyNutrientNeedsDto {
    @IsOptional() @IsNumber() @Min(0) get?: number;
    @IsOptional() @IsNumber() @Min(0) geb?: number;
    @IsOptional() @IsNumber() @Min(0) eta?: number;
    @IsOptional() @IsNumber() @Min(0) fa?: number;
    @IsOptional() @IsNumber() @Min(0) totalCalories?: number;
}

export class MacronutrientDistributionDto {
    @IsOptional() @IsNumber() @Min(0) carbohydratesG?: number;
    @IsOptional() @IsNumber() @Min(0) carbohydratesKcal?: number;
    @IsOptional() @IsNumber() @Min(0) carbohydratesPercent?: number;
    @IsOptional() @IsNumber() @Min(0) proteinsG?: number;
    @IsOptional() @IsNumber() @Min(0) proteinsKcal?: number;
    @IsOptional() @IsNumber() @Min(0) proteinsPercent?: number;
    @IsOptional() @IsNumber() @Min(0) lipidsG?: number;
    @IsOptional() @IsNumber() @Min(0) lipidsKcal?: number;
    @IsOptional() @IsNumber() @Min(0) lipidsPercent?: number;
}

// DTO principal para crear o actualizar un ClinicalRecord
export class CreateUpdateClinicalRecordDto {
    @IsDateString({}, { message: 'La fecha del registro debe ser una fecha válida (YYYY-MM-DD).' })
    recordDate!: string;

    @IsUUID('4', { message: 'El ID del paciente debe ser un UUID válido.' })
    patientId!: string; // A quien pertenece este registro clínico

    @IsOptional() @IsString() @Length(0, 50) expedientNumber?: string;

    @IsOptional() @IsString() @Length(0, 2000) consultationReason?: string;

    @IsOptional() @IsObject() @ValidateNested() @Type(() => CurrentProblemsDto)
    currentProblems?: CurrentProblemsDto;

    @IsOptional() @IsObject() @ValidateNested() @Type(() => DiagnosedDiseasesDto)
    diagnosedDiseases?: DiagnosedDiseasesDto;

    @IsOptional() @IsObject() @ValidateNested() @Type(() => FamilyMedicalHistoryDto)
    familyMedicalHistory?: FamilyMedicalHistoryDto;

    @IsOptional() @IsString() @Length(0, 1000) gynecologicalAspects?: string;

    @IsOptional() @IsObject() @ValidateNested() @Type(() => DailyActivitiesDto)
    dailyActivities?: DailyActivitiesDto;

    @IsOptional() @IsString() @Length(0, 50) activityLevelDescription?: string;

    @IsOptional() @IsObject() @ValidateNested() @Type(() => PhysicalExerciseDto)
    physicalExercise?: PhysicalExerciseDto;

    @IsOptional() @IsObject() @ValidateNested() @Type(() => ConsumptionHabitsDto)
    consumptionHabits?: ConsumptionHabitsDto;

    @IsOptional() @IsString() @Length(0, 1000) generalAppearance?: string;

    @IsOptional() @IsObject() @ValidateNested() @Type(() => BloodPressureDto)
    bloodPressure?: BloodPressureDto;

    @IsOptional() @IsObject() biochemicalIndicators?: any; // JSON flexible

    @IsOptional() @IsObject() @ValidateNested() @Type(() => DietaryHistoryDto)
    dietaryHistory?: DietaryHistoryDto;

    @IsOptional() @IsObject() @ValidateNested() @Type(() => FoodGroupConsumptionFrequencyDto)
    foodGroupConsumptionFrequency?: FoodGroupConsumptionFrequencyDto;

    @IsOptional() @IsNumber() @Min(0) waterConsumptionLiters?: number;

    @IsOptional() @IsObject() @ValidateNested() @Type(() => DailyDietRecordDto)
    dailyDietRecord?: DailyDietRecordDto;

    @IsOptional() @IsObject() @ValidateNested() @Type(() => AnthropometricMeasurementsDto)
    anthropometricMeasurements?: AnthropometricMeasurementsDto;

    @IsOptional() @IsObject() @ValidateNested() @Type(() => AnthropometricEvaluationsDto)
    anthropometricEvaluations?: AnthropometricEvaluationsDto;

    @IsOptional() @IsString() @Length(0, 2000) nutritionalDiagnosis?: string;

    @IsOptional() @IsObject() @ValidateNested() @Type(() => EnergyNutrientNeedsDto)
    energyNutrientNeeds?: EnergyNutrientNeedsDto;

    @IsOptional() @IsString() @Length(0, 2000) nutritionalPlanAndManagement?: string;

    @IsOptional() @IsObject() @ValidateNested() @Type(() => MacronutrientDistributionDto)
    macronutrientDistribution?: MacronutrientDistributionDto;

    @IsOptional() @IsString() @Length(0, 2000) dietaryCalculationScheme?: string;

    @IsOptional() @IsObject() menuDetails?: any; // JSON flexible para menú

    @IsOptional() @IsString() @Length(0, 4000) evolutionAndFollowUpNotes?: string;

    @IsOptional() @IsString() @IsUrl() graphUrl?: string;

    // NUEVOS CAMPOS PARA SISTEMA EVOLUTIVO DE EXPEDIENTES

    @IsOptional() @IsIn(Object.values(TipoExpediente)) 
    tipoExpediente?: TipoExpediente;

    @IsOptional() @IsUUID('4') 
    expedienteBaseId?: string;

    @IsOptional() @IsObject() @ValidateNested() @Type(() => SeguimientoMetadataDto)
    seguimientoMetadata?: SeguimientoMetadataDto;

    @IsOptional() @IsObject() @ValidateNested() @Type(() => AnalisisRiesgoBeneficioDto)
    analisisRiesgoBeneficio?: AnalisisRiesgoBeneficioDto;

    @IsOptional() @IsObject() @ValidateNested() @Type(() => JuicioClinicoDto)
    juicioClinico?: JuicioClinicoDto;

    @IsOptional() @IsObject() @ValidateNested() @Type(() => CapacidadPacienteDto)
    capacidadPaciente?: CapacidadPacienteDto;
}

export type UpdateClinicalRecordDto = CreateUpdateClinicalRecordDto;
