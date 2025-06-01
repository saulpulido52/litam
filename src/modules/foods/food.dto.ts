// src/modules/foods/food.dto.ts
import {
    IsString,
    IsNotEmpty,
    Length,
    IsNumber,
    Min,
    Max,
    IsOptional,
    IsBoolean,
    IsArray,
    IsUUID,
} from 'class-validator';

export class CreateFoodDto {
    @IsString({ message: 'El nombre del alimento debe ser una cadena de texto.' })
    @IsNotEmpty({ message: 'El nombre del alimento es obligatorio.' })
    @Length(2, 255, { message: 'El nombre del alimento debe tener entre 2 y 255 caracteres.' })
    name!: string;

    @IsOptional()
    @IsString({ message: 'La descripción debe ser una cadena de texto.' })
    @Length(0, 1000, { message: 'La descripción no puede exceder 1000 caracteres.' })
    description?: string;

    @IsNumber({}, { message: 'Las calorías deben ser un número.' })
    @Min(0, { message: 'Las calorías no pueden ser negativas.' })
    @Max(10000, { message: 'Las calorías no pueden exceder 10000.' })
    calories!: number;

    @IsNumber({}, { message: 'La proteína debe ser un número.' })
    @Min(0, { message: 'La proteína no puede ser negativa.' })
    @Max(1000, { message: 'La proteína no puede exceder 1000 gramos.' })
    protein!: number;

    @IsNumber({}, { message: 'Los carbohidratos deben ser un número.' })
    @Min(0, { message: 'Los carbohidratos no pueden ser negativos.' })
    @Max(1000, { message: 'Los carbohidratos no pueden exceder 1000 gramos.' })
    carbohydrates!: number;

    @IsNumber({}, { message: 'Las grasas deben ser un número.' })
    @Min(0, { message: 'Las grasas no pueden ser negativas.' })
    @Max(1000, { message: 'Las grasas no pueden exceder 1000 gramos.' })
    fats!: number;

    @IsOptional()
    @IsNumber({}, { message: 'La fibra debe ser un número.' })
    @Min(0, { message: 'La fibra no puede ser negativa.' })
    fiber?: number;

    @IsOptional()
    @IsNumber({}, { message: 'El azúcar debe ser un número.' })
    @Min(0, { message: 'El azúcar no puede ser negativa.' })
    sugar?: number;

    @IsString({ message: 'La unidad debe ser una cadena de texto.' })
    @IsNotEmpty({ message: 'La unidad es obligatoria.' })
    @Length(1, 50, { message: 'La unidad debe tener entre 1 y 50 caracteres.' })
    unit!: string; // Ej: 'g', 'ml', 'unidad'

    @IsNumber({}, { message: 'El tamaño de la porción debe ser un número.' })
    @Min(0.01, { message: 'El tamaño de la porción debe ser mayor que 0.' })
    servingSize!: number;

    @IsOptional()
    @IsString({ message: 'La categoría debe ser una cadena de texto.' })
    @Length(2, 100, { message: 'La categoría debe tener entre 2 y 100 caracteres.' })
    category?: string;

    // isCustom y createdByUserId serán gestionados por el servicio, no por el cliente directamente
}

export class UpdateFoodDto {
    @IsOptional()
    @IsString({ message: 'El nombre del alimento debe ser una cadena de texto.' })
    @Length(2, 255, { message: 'El nombre del alimento debe tener entre 2 y 255 caracteres.' })
    name?: string;

    @IsOptional()
    @IsString({ message: 'La descripción debe ser una cadena de texto.' })
    @Length(0, 1000, { message: 'La descripción no puede exceder 1000 caracteres.' })
    description?: string;

    @IsOptional()
    @IsNumber({}, { message: 'Las calorías deben ser un número.' })
    @Min(0, { message: 'Las calorías no pueden ser negativas.' })
    @Max(10000, { message: 'Las calorías no pueden exceder 10000.' })
    calories?: number;

    @IsOptional()
    @IsNumber({}, { message: 'La proteína debe ser un número.' })
    @Min(0, { message: 'La proteína no puede ser negativa.' })
    @Max(1000, { message: 'La proteína no puede exceder 1000 gramos.' })
    protein?: number;

    @IsOptional()
    @IsNumber({}, { message: 'Los carbohidratos deben ser un número.' })
    @Min(0, { message: 'Los carbohidratos no pueden ser negativos.' })
    @Max(1000, { message: 'Los carbohidratos no pueden exceder 1000 gramos.' })
    carbohydrates?: number;

    @IsOptional()
    @IsNumber({}, { message: 'Las grasas deben ser un número.' })
    @Min(0, { message: 'Las grasas no pueden ser negativas.' })
    @Max(1000, { message: 'Las grasas no pueden exceder 1000 gramos.' })
    fats?: number;

    @IsOptional()
    @IsNumber({}, { message: 'La fibra debe ser un número.' })
    @Min(0, { message: 'La fibra no puede ser negativa.' })
    fiber?: number;

    @IsOptional()
    @IsNumber({}, { message: 'El azúcar debe ser un número.' })
    @Min(0, { message: 'El azúcar no puede ser negativa.' })
    sugar?: number;

    @IsOptional()
    @IsString({ message: 'La unidad debe ser una cadena de texto.' })
    @Length(1, 50, { message: 'La unidad debe tener entre 1 y 50 caracteres.' })
    unit?: string;

    @IsOptional()
    @IsNumber({}, { message: 'El tamaño de la porción debe ser un número.' })
    @Min(0.01, { message: 'El tamaño de la porción debe ser mayor que 0.' })
    servingSize?: number;

    @IsOptional()
    @IsString({ message: 'La categoría debe ser una cadena de texto.' })
    @Length(2, 100, { message: 'La categoría debe tener entre 2 y 100 caracteres.' })
    category?: string;
}