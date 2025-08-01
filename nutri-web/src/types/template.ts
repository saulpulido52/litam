// nutri-web/src/types/template.ts

export enum TemplateCategory {
    WEIGHT_LOSS = 'weight_loss',
    WEIGHT_GAIN = 'weight_gain',
    MUSCLE_GAIN = 'muscle_gain',
    MAINTENANCE = 'maintenance',
    DIABETIC = 'diabetic',
    HYPERTENSION = 'hypertension',
    VEGETARIAN = 'vegetarian',
    VEGAN = 'vegan',
    KETO = 'keto',
    MEDITERRANEAN = 'mediterranean',
    LOW_SODIUM = 'low_sodium',
    LOW_CARB = 'low_carb',
    HIGH_PROTEIN = 'high_protein',
    CUSTOM = 'custom'
}

export enum MealType {
    BREAKFAST = 'breakfast',
    MORNING_SNACK = 'morning_snack',
    LUNCH = 'lunch',
    AFTERNOON_SNACK = 'afternoon_snack',
    DINNER = 'dinner',
    EVENING_SNACK = 'evening_snack'
}

export enum DayOfWeek {
    MONDAY = 'monday',
    TUESDAY = 'tuesday',
    WEDNESDAY = 'wednesday',
    THURSDAY = 'thursday',
    FRIDAY = 'friday',
    SATURDAY = 'saturday',
    SUNDAY = 'sunday'
}

export interface TemplateFood {
    id: string;
    foodId: string;
    foodName: string;
    quantity: number;
    unit: string;
    caloriesPerServing: number;
    proteinPerServing: number;
    carbohydratesPerServing: number;
    fatsPerServing: number;
    fiberPerServing?: number;
    notes?: string;
    preparation?: string;
    shoppingCategory?: string;
    estimatedCost?: number;
    isOptional: boolean;
    alternatives?: string[];
}

export interface TemplateRecipe {
    id: string;
    recipeId: string;
    recipeName: string;
    servings: number;
    caloriesPerServing: number;
    proteinPerServing: number;
    carbohydratesPerServing: number;
    fatsPerServing: number;
    fiberPerServing?: number;
    instructions?: string;
    prepTimeMinutes?: number;
    cookTimeMinutes?: number;
    difficulty: 'easy' | 'medium' | 'hard';
    templateNotes?: string;
    estimatedCost?: number;
    isOptional: boolean;
    alternatives?: string[];
    templateTags?: string[];
}

export interface TemplateMeal {
    id: string;
    dayOfWeek: DayOfWeek;
    mealType: MealType;
    name?: string;
    description?: string;
    suggestedTime?: string;
    foods: TemplateFood[];
    recipes: TemplateRecipe[];
    totalCalories: number;
    totalProtein: number;
    totalCarbohydrates: number;
    totalFats: number;
    totalFiber?: number;
    prepTimeMinutes?: number;
    difficulty: 'easy' | 'medium' | 'hard';
    notes?: string;
    order: number;
}

export interface WeeklyPlanTemplate {
    id: string;
    name: string;
    description?: string;
    category: TemplateCategory;
    tags: string[];
    isPublic: boolean;
    targetCalories?: number;
    targetMacros?: {
        protein: number;
        carbohydrates: number;
        fats: number;
        fiber?: number;
    };
    meals: TemplateMeal[];
    usageCount: number;
    rating?: number;
    ratingCount: number;
    notes?: string;
    mealTiming?: {
        breakfast?: string;
        morning_snack?: string;
        lunch?: string;
        afternoon_snack?: string;
        dinner?: string;
        evening_snack?: string;
    };
    dietaryRestrictions?: {
        allergies?: string[];
        intolerances?: string[];
        preferences?: string[];
        medicalConditions?: string[];
    };
    difficultyLevel: 'easy' | 'medium' | 'hard';
    avgPrepTimeMinutes?: number;
    estimatedWeeklyCost?: number;
    createdBy: {
        id: string;
        firstName: string;
        lastName: string;
        email: string;
    };
    createdAt: string;
    updatedAt: string;
}

// DTOs para crear/actualizar plantillas
export interface CreateTemplateDto {
    name: string;
    description?: string;
    category: TemplateCategory;
    tags?: string[];
    isPublic?: boolean;
    targetCalories?: number;
    targetMacros?: {
        protein: number;
        carbohydrates: number;
        fats: number;
        fiber?: number;
    };
    notes?: string;
    mealTiming?: {
        breakfast?: string;
        morning_snack?: string;
        lunch?: string;
        afternoon_snack?: string;
        dinner?: string;
        evening_snack?: string;
    };
    dietaryRestrictions?: {
        allergies?: string[];
        intolerances?: string[];
        preferences?: string[];
        medicalConditions?: string[];
    };
    difficultyLevel?: 'easy' | 'medium' | 'hard';
    avgPrepTimeMinutes?: number;
    estimatedWeeklyCost?: number;
}

export interface ApplyTemplateDto {
    templateId: string;
    patientId: string;
    dietPlanId: string;
    weekNumber?: number;
    adjustments?: {
        calorieMultiplier?: number;
        portionMultiplier?: number;
        excludeOptionalItems?: boolean;
        customMealTiming?: {
            [key in MealType]?: string;
        };
    };
}

export interface CreateFromWeekDto extends CreateTemplateDto {
    dietPlanId: string;
    weekNumber: number;
}

// Filtros para buscar plantillas
export interface TemplateFilters {
    category?: TemplateCategory;
    search?: string;
    tags?: string[];
    isPublic?: boolean;
    page?: number;
    limit?: number;
}

// Respuesta de la API para plantillas
export interface TemplatesResponse {
    success: boolean;
    message: string;
    data: WeeklyPlanTemplate[];
    pagination?: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}

export interface TemplateResponse {
    success: boolean;
    message: string;
    data: WeeklyPlanTemplate;
}

// Categorías con etiquetas en español
export const TEMPLATE_CATEGORIES = [
    { value: TemplateCategory.WEIGHT_LOSS, label: 'Pérdida de Peso', icon: '📉' },
    { value: TemplateCategory.WEIGHT_GAIN, label: 'Aumento de Peso', icon: '📈' },
    { value: TemplateCategory.MUSCLE_GAIN, label: 'Ganancia Muscular', icon: '💪' },
    { value: TemplateCategory.MAINTENANCE, label: 'Mantenimiento', icon: '⚖️' },
    { value: TemplateCategory.DIABETIC, label: 'Diabético', icon: '🩺' },
    { value: TemplateCategory.HYPERTENSION, label: 'Hipertensión', icon: '❤️' },
    { value: TemplateCategory.VEGETARIAN, label: 'Vegetariano', icon: '🥬' },
    { value: TemplateCategory.VEGAN, label: 'Vegano', icon: '🌱' },
    { value: TemplateCategory.KETO, label: 'Ketogénico', icon: '🥑' },
    { value: TemplateCategory.MEDITERRANEAN, label: 'Mediterráneo', icon: '🫒' },
    { value: TemplateCategory.LOW_SODIUM, label: 'Bajo en Sodio', icon: '🧂' },
    { value: TemplateCategory.LOW_CARB, label: 'Bajo en Carbohidratos', icon: '🥩' },
    { value: TemplateCategory.HIGH_PROTEIN, label: 'Alto en Proteínas', icon: '🍗' },
    { value: TemplateCategory.CUSTOM, label: 'Personalizado', icon: '✨' }
];

// Días de la semana con etiquetas en español
export const DAYS_OF_WEEK = [
    { value: DayOfWeek.MONDAY, label: 'Lunes' },
    { value: DayOfWeek.TUESDAY, label: 'Martes' },
    { value: DayOfWeek.WEDNESDAY, label: 'Miércoles' },
    { value: DayOfWeek.THURSDAY, label: 'Jueves' },
    { value: DayOfWeek.FRIDAY, label: 'Viernes' },
    { value: DayOfWeek.SATURDAY, label: 'Sábado' },
    { value: DayOfWeek.SUNDAY, label: 'Domingo' }
];

// Tipos de comida con etiquetas en español
export const MEAL_TYPES = [
    { value: MealType.BREAKFAST, label: 'Desayuno', icon: '🌅' },
    { value: MealType.MORNING_SNACK, label: 'Colación Matutina', icon: '☕' },
    { value: MealType.LUNCH, label: 'Almuerzo', icon: '☀️' },
    { value: MealType.AFTERNOON_SNACK, label: 'Colación Vespertina', icon: '🍎' },
    { value: MealType.DINNER, label: 'Cena', icon: '🌙' },
    { value: MealType.EVENING_SNACK, label: 'Colación Nocturna', icon: '🌃' }
];

// Niveles de dificultad
export const DIFFICULTY_LEVELS = [
    { value: 'easy', label: 'Fácil', color: 'success', icon: '😊' },
    { value: 'medium', label: 'Medio', color: 'warning', icon: '🤔' },
    { value: 'hard', label: 'Difícil', color: 'danger', icon: '😅' }
];

// Utilidades para conversión
export const getDayLabel = (day: DayOfWeek): string => {
    return DAYS_OF_WEEK.find(d => d.value === day)?.label || day;
};

export const getMealTypeLabel = (mealType: MealType): string => {
    return MEAL_TYPES.find(m => m.value === mealType)?.label || mealType;
};

export const getCategoryLabel = (category: TemplateCategory): string => {
    return TEMPLATE_CATEGORIES.find(c => c.value === category)?.label || category;
};

export const getDifficultyLabel = (difficulty: 'easy' | 'medium' | 'hard'): string => {
    return DIFFICULTY_LEVELS.find(d => d.value === difficulty)?.label || difficulty;
}; 