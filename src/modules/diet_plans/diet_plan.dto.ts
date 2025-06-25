// src/modules/diet_plans/diet_plan.dto.ts
import {
    IsString,
    IsNotEmpty,
    Length,
    IsUUID,
    IsNumber,
    Min,
    Max,
    IsOptional,
    IsArray,
    ValidateNested,
    IsDateString,
    IsEnum,
    IsBoolean,
    Validate,
    ValidateIf,
} from 'class-validator';
import { Type } from 'class-transformer';
import { DietPlanStatus } from '../../database/entities/diet_plan.entity'; // Asegúrate de importar el enum

// DTO para un alimento semanal
export class WeeklyFoodDto {
    @IsUUID('4', { message: 'El ID del alimento debe ser un UUID válido.' })
    foodId!: string;

    @IsString({ message: 'El nombre del alimento debe ser una cadena de texto.' })
    @IsNotEmpty({ message: 'El nombre del alimento es obligatorio.' })
    foodName!: string;

    @IsNumber({}, { message: 'La cantidad debe ser un número.' })
    @Min(0.01, { message: 'La cantidad debe ser mayor que 0.' })
    quantityGrams!: number;

    @IsNumber({}, { message: 'Las calorías deben ser un número.' })
    @Min(0, { message: 'Las calorías no pueden ser negativas.' })
    calories!: number;

    @IsNumber({}, { message: 'Las proteínas deben ser un número.' })
    @Min(0, { message: 'Las proteínas no pueden ser negativas.' })
    protein!: number;

    @IsNumber({}, { message: 'Los carbohidratos deben ser un número.' })
    @Min(0, { message: 'Los carbohidratos no pueden ser negativos.' })
    carbs!: number;

    @IsNumber({}, { message: 'Las grasas deben ser un número.' })
    @Min(0, { message: 'Las grasas no pueden ser negativas.' })
    fats!: number;
}

// DTO para una comida semanal
export class WeeklyMealDto {
    @IsEnum(['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'], 
        { message: 'El día debe ser un día válido de la semana.' })
    day!: 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';

    @IsEnum(['breakfast', 'lunch', 'dinner', 'snack'], 
        { message: 'El tipo de comida debe ser válido.' })
    mealType!: 'breakfast' | 'lunch' | 'dinner' | 'snack';

    @IsArray({ message: 'Los alimentos deben ser un array.' })
    @ValidateNested({ each: true })
    @Type(() => WeeklyFoodDto)
    foods!: WeeklyFoodDto[];

    @IsOptional()
    @IsString({ message: 'Las notas deben ser una cadena de texto.' })
    notes?: string;
}

// DTO para un plan semanal
export class WeeklyPlanDto {
    @IsNumber({}, { message: 'El número de semana debe ser un número.' })
    @Min(1, { message: 'El número de semana debe ser mayor que 0.' })
    weekNumber!: number;

    @IsDateString({}, { message: 'La fecha de inicio debe ser una fecha válida (YYYY-MM-DD).' })
    startDate!: string;

    @IsDateString({}, { message: 'La fecha de fin debe ser una fecha válida (YYYY-MM-DD).' })
    endDate!: string;

    @IsNumber({}, { message: 'El objetivo de calorías diario debe ser un número.' })
    @Min(0, { message: 'El objetivo de calorías diario no puede ser negativo.' })
    dailyCaloriesTarget!: number;

    @ValidateNested()
    @Type(() => Object)
    dailyMacrosTarget!: {
        protein: number;
        carbohydrates: number;
        fats: number;
    };

    @IsArray({ message: 'Las comidas deben ser un array.' })
    @ValidateNested({ each: true })
    @Type(() => WeeklyMealDto)
    meals!: WeeklyMealDto[];

    @IsOptional()
    @IsString({ message: 'Las notas deben ser una cadena de texto.' })
    notes?: string;
}

// DTO para un elemento de comida (alimento + cantidad)
export class MealItemDto {
    @IsUUID('4', { message: 'El ID del alimento debe ser un UUID válido.' })
    foodId!: string;

    @IsNumber({}, { message: 'La cantidad debe ser un número.' })
    @Min(0.01, { message: 'La cantidad debe ser mayor que 0.' })
    quantity!: number;
}

// DTO para una comida individual (Desayuno, Almuerzo, etc.)
export class MealDto {
    @IsString({ message: 'El nombre de la comida debe ser una cadena de texto.' })
    @IsNotEmpty({ message: 'El nombre de la comida es obligatorio.' })
    @Length(2, 100, { message: 'El nombre de la comida debe tener entre 2 y 100 caracteres.' })
    name!: string;

    @IsNumber({}, { message: 'El orden de la comida debe ser un número entero.' })
    @Min(0, { message: 'El orden de la comida no puede ser negativo.' })
    order!: number; // Ej: 1 para Desayuno, 2 para Colación, 3 para Almuerzo

    @IsArray({ message: 'Los ítems de la comida deben ser un array.' })
    @ValidateNested({ each: true })
    @Type(() => MealItemDto) // Usar @Type para que class-transformer sepa transformar a MealItemDto
    mealItems!: MealItemDto[];
}

// DTO para crear un Plan de Dieta Semanal
export class CreateDietPlanDto {
    @IsString({ message: 'El nombre del plan de dieta debe ser una cadena de texto.' })
    @IsNotEmpty({ message: 'El nombre del plan de dieta es obligatorio.' })
    @Length(2, 255, { message: 'El nombre del plan de dieta debe tener entre 2 y 255 caracteres.' })
    name!: string;

    @IsUUID('4', { message: 'El ID del paciente debe ser un UUID válido.' })
    patientId!: string;

    @IsOptional()
    @IsString({ message: 'La descripción debe ser una cadena de texto.' })
    @Length(0, 500, { message: 'La descripción no puede exceder 500 caracteres.' })
    description?: string;

    @IsDateString({}, { message: 'La fecha de inicio debe ser una fecha válida (YYYY-MM-DD).' })
    startDate!: string;

    @IsDateString({}, { message: 'La fecha de fin debe ser una fecha válida (YYYY-MM-DD).' })
    endDate!: string;

    @IsOptional()
    @IsNumber({}, { message: 'El objetivo de calorías diario debe ser un número.' })
    @Min(0, { message: 'El objetivo de calorías diario no puede ser negativo.' })
    dailyCaloriesTarget?: number;

    @IsOptional()
    dailyMacrosTarget?: {
        protein?: number;
        carbohydrates?: number;
        fats?: number;
    };

    @IsOptional()
    @IsString({ message: 'Las notas deben ser una cadena de texto.' })
    @Length(0, 1000, { message: 'Las notas no pueden exceder 1000 caracteres.' })
    notes?: string;

    @IsOptional()
    @IsBoolean({ message: 'isWeeklyPlan debe ser un booleano.' })
    isWeeklyPlan?: boolean;

    @IsOptional()
    @IsNumber({}, { message: 'El número total de semanas debe ser un número.' })
    @Min(1, { message: 'El número total de semanas debe ser mayor que 0.' })
    @Max(52, { message: 'El número total de semanas no puede exceder 52.' })
    totalWeeks?: number;

    @IsOptional()
    @IsArray({ message: 'Los planes semanales deben ser un array.' })
    @ValidateNested({ each: true })
    @Type(() => WeeklyPlanDto)
    weeklyPlans?: WeeklyPlanDto[];

    @IsOptional()
    @IsBoolean({ message: 'generatedByIA debe ser un booleano.' })
    generatedByIA?: boolean;

    @IsOptional()
    @IsString({ message: 'La versión de IA debe ser una cadena de texto.' })
    iaVersion?: string;

    @IsOptional()
    @IsArray({ message: 'Las comidas deben ser un array.' })
    @ValidateNested({ each: true })
    @Type(() => MealDto)
    meals?: MealDto[]; // Mantener para compatibilidad
}

// DTO para actualizar un Plan de Dieta
export class UpdateDietPlanDto {
    @IsOptional()
    @IsString({ message: 'El nombre del plan de dieta debe ser una cadena de texto.' })
    @Length(2, 255, { message: 'El nombre del plan de dieta debe tener entre 2 y 255 caracteres.' })
    name?: string;

    @IsOptional()
    @IsString({ message: 'La descripción debe ser una cadena de texto.' })
    @Length(0, 500, { message: 'La descripción no puede exceder 500 caracteres.' })
    description?: string;

    @IsOptional()
    @IsString({ message: 'Las notas deben ser una cadena de texto.' })
    @Length(0, 1000, { message: 'Las notas no pueden exceder 1000 caracteres.' })
    notes?: string;

    @IsOptional()
    @IsDateString({}, { message: 'La fecha de inicio debe ser una fecha válida (YYYY-MM-DD).' })
    startDate?: string;

    @IsOptional()
    @IsDateString({}, { message: 'La fecha de fin debe ser una fecha válida (YYYY-MM-DD).' })
    endDate?: string;

    @IsOptional()
    @IsNumber({}, { message: 'El objetivo de calorías diario debe ser un número.' })
    @Min(0, { message: 'El objetivo de calorías diario no puede ser negativo.' })
    dailyCaloriesTarget?: number;

    @IsOptional()
    dailyMacrosTarget?: { protein?: number; carbohydrates?: number; fats?: number };

    @IsOptional()
    @IsNumber({}, { message: 'El número total de semanas debe ser un número.' })
    @Min(1, { message: 'El número total de semanas debe ser mayor que 0.' })
    @Max(52, { message: 'El número total de semanas no puede exceder 52.' })
    totalWeeks?: number;

    @IsOptional()
    @IsArray({ message: 'Los planes semanales deben ser un array.' })
    @ValidateNested({ each: true })
    @Type(() => WeeklyPlanDto)
    weeklyPlans?: WeeklyPlanDto[];

    @IsOptional()
    @IsEnum(DietPlanStatus, { message: 'El estado del plan de dieta no es válido.' })
    status?: DietPlanStatus;

    @IsOptional()
    @IsArray({ message: 'Las comidas deben ser un array.' })
    @ValidateNested({ each: true })
    @Type(() => MealDto)
    meals?: MealDto[];
}

// DTO para solicitar generación de dieta por IA
export class GenerateDietPlanAiDto {
    @IsUUID('4', { message: 'El ID del paciente debe ser un UUID válido.' })
    patientId!: string;

    @IsString({ message: 'El nombre del plan debe ser una cadena de texto.' })
    @IsNotEmpty({ message: 'El nombre del plan es obligatorio.' })
    @Length(2, 255, { message: 'El nombre del plan debe tener entre 2 y 255 caracteres.' })
    name!: string;

    @IsEnum(['weight_loss', 'weight_gain', 'maintenance', 'muscle_gain'], 
        { message: 'El objetivo debe ser válido.' })
    goal!: 'weight_loss' | 'weight_gain' | 'maintenance' | 'muscle_gain';

    @IsDateString({}, { message: 'La fecha de inicio debe ser una fecha válida (YYYY-MM-DD).' })
    startDate!: string;

    @IsDateString({}, { message: 'La fecha de fin debe ser una fecha válida (YYYY-MM-DD).' })
    endDate!: string;

    @IsNumber({}, { message: 'El número total de semanas debe ser un número.' })
    @Min(1, { message: 'El número total de semanas debe ser mayor que 0.' })
    @Max(12, { message: 'El número total de semanas no puede exceder 12.' })
    totalWeeks!: number;

    @IsOptional()
    @IsNumber({}, { message: 'El objetivo de calorías diario debe ser un número.' })
    @Min(0, { message: 'El objetivo de calorías diario no puede ser negativo.' })
    dailyCaloriesTarget?: number;

    @IsOptional()
    @IsArray({ message: 'Las restricciones dietéticas deben ser un array.' })
    @IsString({ each: true, message: 'Cada restricción debe ser una cadena de texto.' })
    dietaryRestrictions?: string[];

    @IsOptional()
    @IsArray({ message: 'Las alergias deben ser un array.' })
    @IsString({ each: true, message: 'Cada alergia debe ser una cadena de texto.' })
    allergies?: string[];

    @IsOptional()
    @IsArray({ message: 'Los alimentos preferidos deben ser un array.' })
    @IsString({ each: true, message: 'Cada alimento preferido debe ser una cadena de texto.' })
    preferredFoods?: string[];

    @IsOptional()
    @IsArray({ message: 'Los alimentos no deseados deben ser un array.' })
    @IsString({ each: true, message: 'Cada alimento no deseado debe ser una cadena de texto.' })
    dislikedFoods?: string[];

    @IsOptional()
    @IsString({ message: 'Las notas para la IA deben ser una cadena de texto.' })
    notesForAI?: string;
}

// DTO para actualizar solo el estado de un plan de dieta
export class UpdateDietPlanStatusDto {
    @IsEnum(DietPlanStatus, { message: 'El estado del plan de dieta no es válido.' })
    status!: DietPlanStatus;
}

// DTO para agregar una semana a un plan existente
export class AddWeekToPlanDto {
    @ValidateNested()
    @Type(() => WeeklyPlanDto)
    weeklyPlan!: WeeklyPlanDto;
}