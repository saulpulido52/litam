// src/modules/educational_content/educational_content.dto.ts
import {
    IsString,
    IsNotEmpty,
    Length,
    IsOptional,
    IsArray,
    IsBoolean,
    IsEnum,
    IsUrl,
    IsUUID,
    ValidateNested,
    Min,
    Max,
    IsNumber,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ContentType } from '@/database/entities/educational_content.entity';
import { Food } from '@/database/entities/food.entity'; // Para referenciar alimentos en ingredientes de receta

// DTO para un ingrediente de receta (para ser usado en RecipeDto)
export class RecipeIngredientDto {
    @IsOptional()
    @IsUUID('4', { message: 'El ID del alimento (foodId) debe ser un UUID válido si se proporciona.' })
    foodId?: string; // ID de un Food existente si el ingrediente es un alimento específico de la BD

    @IsString({ message: 'El nombre del ingrediente es obligatorio.' })
    @IsNotEmpty({ message: 'El nombre del ingrediente no puede estar vacío.' })
    @Length(2, 255, { message: 'El nombre del ingrediente debe tener entre 2 y 255 caracteres.' })
    ingredientName!: string; // Ej: "Harina de avena"

    @IsNumber({}, { message: 'La cantidad del ingrediente debe ser un número.' })
    @Min(0.01, { message: 'La cantidad debe ser mayor que 0.' })
    quantity!: number;

    @IsString({ message: 'La unidad del ingrediente es obligatoria.' })
    @IsNotEmpty({ message: 'La unidad no puede estar vacía.' })
    @Length(1, 50, { message: 'La unidad debe tener entre 1 y 50 caracteres.' })
    unit!: string; // Ej: "g", "ml", "tazas"
}

// DTO para crear/actualizar una Receta
export class CreateUpdateRecipeDto {
    @IsString({ message: 'El título de la receta es obligatorio.' })
    @IsNotEmpty({ message: 'El título de la receta no puede estar vacío.' })
    @Length(2, 255, { message: 'El título de la receta debe tener entre 2 y 255 caracteres.' })
    title!: string;

    @IsOptional()
    @IsString({ message: 'La descripción de la receta debe ser una cadena de texto.' })
    @Length(0, 1000, { message: 'La descripción de la receta no puede exceder 1000 caracteres.' })
    description?: string;

    @IsString({ message: 'Las instrucciones de la receta son obligatorias.' })
    @IsNotEmpty({ message: 'Las instrucciones de la receta no pueden estar vacías.' })
    instructions!: string;

    @IsArray({ message: 'Los ingredientes deben ser un array.' })
    @ValidateNested({ each: true })
    @Type(() => RecipeIngredientDto)
    ingredients!: RecipeIngredientDto[];

    @IsOptional()
    @IsArray({ message: 'Las etiquetas (tags) deben ser un array de cadenas de texto.' })
    @IsString({ each: true, message: 'Cada etiqueta debe ser una cadena de texto.' })
    tags?: string[];

    @IsOptional()
    @IsUrl({}, { message: 'La URL de la imagen de la receta debe ser una URL válida.' })
    imageUrl?: string;

    @IsOptional()
    @IsNumber({}, { message: 'El tiempo de preparación debe ser un número entero.' })
    @Min(0, { message: 'El tiempo de preparación no puede ser negativo.' })
    prepTimeMinutes?: number;

    @IsOptional()
    @IsNumber({}, { message: 'El tiempo de cocción debe ser un número entero.' })
    @Min(0, { message: 'El tiempo de cocción no puede ser negativo.' })
    cookTimeMinutes?: number;

    @IsOptional()
    @IsNumber({}, { message: 'El número de porciones debe ser un número entero.' })
    @Min(1, { message: 'El número de porciones debe ser al menos 1.' })
    servings?: number;

    @IsOptional()
    @IsNumber({}, { message: 'El total de calorías debe ser un número.' })
    @Min(0, { message: 'El total de calorías no puede ser negativo.' })
    totalCalories?: number;

    @IsOptional()
    totalMacros?: { protein?: number; carbohydrates?: number; fats?: number };

    @IsOptional()
    @IsBoolean({ message: 'is_published debe ser un booleano.' })
    isPublished?: boolean;
}

// DTO para crear/actualizar Contenido Educativo (artículos, guías, videos)
export class CreateUpdateEducationalContentDto {
    @IsString({ message: 'El título del contenido es obligatorio.' })
    @IsNotEmpty({ message: 'El título del contenido no puede estar vacío.' })
    @Length(2, 255, { message: 'El título del contenido debe tener entre 2 y 255 caracteres.' })
    title!: string;

    @IsOptional()
    @IsString({ message: 'El resumen debe ser una cadena de texto.' })
    @Length(0, 500, { message: 'El resumen no puede exceder 500 caracteres.' })
    summary?: string;

    @IsString({ message: 'El cuerpo del contenido es obligatorio.' })
    @IsNotEmpty({ message: 'El cuerpo del contenido no puede estar vacío.' })
    contentBody!: string;

    @IsEnum(ContentType, { message: 'El tipo de contenido no es válido.' })
    type!: ContentType;

    @IsOptional()
    @IsArray({ message: 'Las etiquetas (tags) deben ser un array de cadenas de texto.' })
    @IsString({ each: true, message: 'Cada etiqueta debe ser una cadena de texto.' })
    tags?: string[];

    @IsOptional()
    @IsUrl({}, { message: 'La URL de la imagen de portada debe ser una URL válida.' })
    coverImageUrl?: string;

    @IsOptional()
    @IsBoolean({ message: 'is_published debe ser un booleano.' })
    isPublished?: boolean;

    // Si el tipo es RECIPE, podemos vincularlo a una entidad Recipe existente
    @IsOptional()
    @IsUUID('4', { message: 'El ID de la receta debe ser un UUID válido si se proporciona.' })
    recipeId?: string; // Opcional, si el contenido es un artículo que enlaza a una receta
}