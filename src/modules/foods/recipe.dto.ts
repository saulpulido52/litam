// src/modules/foods/recipe.dto.ts
import { IsString, IsOptional, IsNumber, IsArray, IsBoolean, Min, Max, ValidateNested, IsNotEmpty, IsUrl, ArrayNotEmpty, IsIn } from 'class-validator';
import { Type, Transform } from 'class-transformer';

// DTO para ingredientes de receta
export class RecipeIngredientDto {
    @IsOptional()
    @IsString()
    foodId?: string; // ID del alimento en la base de datos (opcional)

    @IsNotEmpty()
    @IsString()
    ingredientName!: string; // Nombre del ingrediente

    @IsNumber()
    @Min(0.1)
    quantity!: number; // Cantidad

    @IsString()
    @IsNotEmpty()
    unit!: string; // Unidad (g, ml, tazas, etc.)

    @IsOptional()
    @IsNumber()
    @Min(0)
    caloriesPer100g?: number; // Calorías por 100g (si no está en la BD)

    @IsOptional()
    @IsNumber()
    @Min(0)
    proteinPer100g?: number; // Proteína por 100g

    @IsOptional()
    @IsNumber()
    @Min(0)
    carbsPer100g?: number; // Carbohidratos por 100g

    @IsOptional()
    @IsNumber()
    @Min(0)
    fatsPer100g?: number; // Grasas por 100g

    // Campos para nutrición personalizada (sobrescriben los valores del Food)
    @IsOptional()
    @IsNumber()
    @Min(0)
    customCaloriesPer100g?: number; // Kilocalorías personalizadas por 100g

    @IsOptional()
    @IsNumber()
    @Min(0)
    customProteinPer100g?: number; // Proteína personalizada por 100g

    @IsOptional()
    @IsNumber()
    @Min(0)
    customCarbohydratesPer100g?: number; // Carbohidratos personalizados por 100g

    @IsOptional()
    @IsNumber()
    @Min(0)
    customFatsPer100g?: number; // Grasas personalizadas por 100g

    @IsOptional()
    @IsNumber()
    @Min(0)
    customFiberPer100g?: number; // Fibra personalizada por 100g

    @IsOptional()
    @IsString()
    notes?: string; // Notas sobre el ajuste nutricional
}

// DTO para crear receta
export class CreateRecipeDto {
    @IsNotEmpty()
    @IsString()
    title!: string;

    @IsOptional()
    @IsString()
    description?: string;

    @IsNotEmpty()
    @IsString()
    instructions!: string; // Pasos de preparación (texto o JSON)

    @IsArray()
    @ArrayNotEmpty()
    @ValidateNested({ each: true })
    @Type(() => RecipeIngredientDto)
    ingredients!: RecipeIngredientDto[];

    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    tags?: string[]; // ['desayuno', 'vegano', 'rápido']

    @IsOptional()
    @IsUrl()
    imageUrl?: string;

    @IsOptional()
    @IsNumber()
    @Min(1)
    prepTimeMinutes?: number;

    @IsOptional()
    @IsNumber()
    @Min(1)
    cookTimeMinutes?: number;

    @IsNumber()
    @Min(1)
    @Max(20)
    servings!: number; // Número de porciones

    @IsOptional()
    @IsString()
    @IsIn(['breakfast', 'lunch', 'dinner', 'snack', 'dessert', 'any'])
    mealType?: string; // Tipo de comida

    @IsOptional()
    @IsString()
    @IsIn(['beginner', 'intermediate', 'advanced'])
    difficulty?: string; // Dificultad

    @IsOptional()
    @IsBoolean()
    isPublished?: boolean;

    // Campos calculados automáticamente (opcionales en creación)
    @IsOptional()
    @IsNumber()
    @Min(0)
    totalCalories?: number;

    @IsOptional()
    totalMacros?: {
        protein?: number;
        carbohydrates?: number;
        fats?: number;
    };
}

// DTO para actualizar receta
export class UpdateRecipeDto {
    @IsOptional()
    @IsString()
    title?: string;

    @IsOptional()
    @IsString()
    description?: string;

    @IsOptional()
    @IsString()
    instructions?: string;

    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => RecipeIngredientDto)
    ingredients?: RecipeIngredientDto[];

    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    tags?: string[];

    @IsOptional()
    @IsUrl()
    imageUrl?: string;

    @IsOptional()
    @IsNumber()
    @Min(1)
    prepTimeMinutes?: number;

    @IsOptional()
    @IsNumber()
    @Min(1)
    cookTimeMinutes?: number;

    @IsOptional()
    @IsNumber()
    @Min(1)
    @Max(20)
    servings?: number;

    @IsOptional()
    @IsString()
    @IsIn(['breakfast', 'lunch', 'dinner', 'snack', 'dessert', 'any'])
    mealType?: string;

    @IsOptional()
    @IsString()
    @IsIn(['beginner', 'intermediate', 'advanced'])
    difficulty?: string;

    @IsOptional()
    @IsBoolean()
    isPublished?: boolean;
}

// DTO para búsqueda y filtros de recetas
export class RecipeSearchDto {
    @IsOptional()
    @IsString()
    search?: string; // Búsqueda por título o ingredientes

    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    tags?: string[]; // Filtrar por tags

    @IsOptional()
    @IsString()
    @IsIn(['breakfast', 'lunch', 'dinner', 'snack', 'dessert', 'any'])
    mealType?: string;

    @IsOptional()
    @IsNumber()
    @Min(0)
    maxCaloriesPerServing?: number;

    @IsOptional()
    @IsNumber()
    @Min(0)
    minCaloriesPerServing?: number;

    @IsOptional()
    @IsNumber()
    @Min(1)
    maxPrepTime?: number; // Máximo tiempo de preparación

    @IsOptional()
    @IsString()
    @IsIn(['beginner', 'intermediate', 'advanced'])
    difficulty?: string;

    @IsOptional()
    @IsString()
    @IsIn(['calories_asc', 'calories_desc', 'time_asc', 'time_desc', 'name_asc', 'name_desc', 'created_desc'])
    sortBy?: string;

    @IsOptional()
    @IsNumber()
    @Min(1)
    page?: number;

    @IsOptional()
    @IsNumber()
    @Min(1)
    @Max(50)
    limit?: number;
}

// DTO para generar recetas automáticamente basadas en objetivos
export class GenerateRecipeDto {
    @IsNotEmpty()
    @IsString()
    patientId!: string;

    @IsNumber()
    @Min(500)
    @Max(5000)
    targetCalories!: number; // Calorías objetivo por receta

    @IsOptional()
    @IsString()
    @IsIn(['breakfast', 'lunch', 'dinner', 'snack'])
    mealType?: string;

    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    avoidIngredients?: string[]; // Ingredientes a evitar

    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    preferredIngredients?: string[]; // Ingredientes preferidos

    @IsOptional()
    @IsString()
    @IsIn(['vegetarian', 'vegan', 'keto', 'low_carb', 'high_protein', 'mediterranean', 'diabetic'])
    dietType?: string;

    @IsOptional()
    targetMacros?: {
        proteinPercent?: number;
        carbsPercent?: number;
        fatsPercent?: number;
    };
}

// DTO respuesta con cálculos nutricionales
export interface RecipeNutritionInfo {
    caloriesPerServing: number;
    totalCalories: number;
    macrosPerServing: {
        protein: number;
        carbohydrates: number;
        fats: number;
        fiber?: number;
    };
    totalMacros: {
        protein: number;
        carbohydrates: number;
        fats: number;
        fiber?: number;
    };
    ingredientBreakdown: {
        ingredientName: string;
        quantity: number;
        unit: string;
        calories: number;
        protein: number;
        carbs: number;
        fats: number;
    }[];
} 