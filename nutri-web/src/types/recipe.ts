// nutri-web/src/types/recipe.ts

export interface RecipeIngredient {
  id: string;
  food_id: string;
  food_name: string;
  quantity: number;
  unit: string;
  calories_per_100g: number;
  protein_per_100g: number;
  carbohydrates_per_100g: number;
  fats_per_100g: number;
  fiber_per_100g?: number;
  // Campos personalizables para el nutriólogo
  customCaloriesPer100g?: number;
  customProteinPer100g?: number;
  customCarbohydratesPer100g?: number;
  customFatsPer100g?: number;
  customFiberPer100g?: number;
  notes?: string;
  // Campos específicos para lista de compras
  category: IngredientCategory;
  shopping_unit: ShoppingUnit;
  shopping_quantity: number;
  brand_preference?: string;
  substitutes?: string[];
}

export interface Recipe {
  id: string;
  title: string;
  description?: string;
  instructions: string;
  ingredients: RecipeIngredient[];
  tags?: string[];
  imageUrl?: string;
  prepTimeMinutes?: number;
  cookTimeMinutes?: number;
  servings: number;
  totalCalories?: number;
  totalMacros?: {
    protein: number;
    carbohydrates: number;
    fats: number;
    fiber?: number;
  };
  isPublished: boolean;
  createdByUser?: {
    id: string;
    first_name: string;
    last_name: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface CreateRecipeRequest {
  title: string;
  description?: string;
  instructions: string;
  ingredients: {
    ingredientName: string;
    quantity: number;
    unit: string;
    foodId?: string;
    caloriesPer100g?: number;
    proteinPer100g?: number;
    carbsPer100g?: number;
    fatsPer100g?: number;
  }[];
  tags?: string[];
  imageUrl?: string;
  prepTimeMinutes?: number;
  cookTimeMinutes?: number;
  servings: number;
  mealType?: 'breakfast' | 'lunch' | 'dinner' | 'snack' | 'dessert' | 'any';
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
  isPublished?: boolean;
}

export interface UpdateRecipeRequest extends Partial<CreateRecipeRequest> {}

export interface RecipeSearchParams {
  search?: string;
  tags?: string[];
  mealType?: 'breakfast' | 'lunch' | 'dinner' | 'snack' | 'dessert' | 'any';
  maxCaloriesPerServing?: number;
  minCaloriesPerServing?: number;
  maxPrepTime?: number;
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
  sortBy?: 'calories_asc' | 'calories_desc' | 'time_asc' | 'time_desc' | 'name_asc' | 'name_desc' | 'created_desc';
  page?: number;
  limit?: number;
}

export interface RecipeSearchResponse {
  recipes: Recipe[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface GenerateRecipeRequest {
  patientId: string;
  targetCalories: number;
  mealType?: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  avoidIngredients?: string[];
  preferredIngredients?: string[];
  dietType?: 'vegetarian' | 'vegan' | 'keto' | 'low_carb' | 'high_protein' | 'mediterranean' | 'diabetic';
  targetMacros?: {
    proteinPercent?: number;
    carbsPercent?: number;
    fatsPercent?: number;
  };
}

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

export interface RecipeStats {
  totalRecipes: number;
  avgCaloriesPerServing: number;
  popularTags: {
    tag: string;
    count: number;
  }[];
}

// Tipos para filtros y UI
export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack' | 'dessert' | 'any';
export type Difficulty = 'beginner' | 'intermediate' | 'advanced';
export type SortOption = 'calories_asc' | 'calories_desc' | 'time_asc' | 'time_desc' | 'name_asc' | 'name_desc' | 'created_desc';
export type DietType = 'vegetarian' | 'vegan' | 'keto' | 'low_carb' | 'high_protein' | 'mediterranean' | 'diabetic';

// Tipos para el UI de recetario
export interface RecipeBookSection {
  id: string;
  title: string;
  recipes: Recipe[];
  totalCalories: number;
  totalRecipes: number;
}

export interface PatientRecipeBook {
  patientId: string;
  patientName: string;
  sections: {
    breakfast: RecipeBookSection;
    lunch: RecipeBookSection;
    dinner: RecipeBookSection;
    snacks: RecipeBookSection;
  };
  totalRecipes: number;
  averageCaloriesPerDay: number;
  lastUpdated: string;
}

// Constantes para el UI
export const MEAL_TYPE_LABELS: Record<MealType, string> = {
  breakfast: 'Desayuno',
  lunch: 'Almuerzo',
  dinner: 'Cena',
  snack: 'Merienda',
  dessert: 'Postre',
  any: 'Cualquiera'
};

export const DIFFICULTY_LABELS: Record<Difficulty, string> = {
  beginner: 'Fácil',
  intermediate: 'Intermedio',
  advanced: 'Avanzado'
};

export const DIET_TYPE_LABELS: Record<DietType, string> = {
  vegetarian: 'Vegetariano',
  vegan: 'Vegano',
  keto: 'Keto',
  low_carb: 'Bajo en Carbohidratos',
  high_protein: 'Alto en Proteínas',
  mediterranean: 'Mediterráneo',
  diabetic: 'Para Diabéticos'
};

export const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: 'created_desc', label: 'Más Recientes' },
  { value: 'name_asc', label: 'Nombre A-Z' },
  { value: 'name_desc', label: 'Nombre Z-A' },
  { value: 'calories_asc', label: 'Menos Calorías' },
  { value: 'calories_desc', label: 'Más Calorías' },
  { value: 'time_asc', label: 'Preparación Rápida' },
  { value: 'time_desc', label: 'Preparación Lenta' }
];

export const DEFAULT_UNITS = [
  'g', 'kg', 'ml', 'l', 'taza', 'tazas', 'cucharada', 'cucharadas', 
  'cucharadita', 'cucharaditas', 'pizca', 'unidad', 'unidades', 'pieza', 'piezas'
];

export const POPULAR_TAGS = [
  'rápido', 'fácil', 'saludable', 'vegano', 'vegetariano', 'sin gluten', 
  'bajo en carbohidratos', 'alto en proteínas', 'para diabéticos', 'keto',
  'mediterráneo', 'desayuno', 'almuerzo', 'cena', 'merienda', 'postre'
]; 

// Nuevas interfaces para lista de compras
export interface IngredientCategory {
  id: string;
  name: string;
  display_name: string;
  icon: string;
  sort_order: number;
}

export interface ShoppingUnit {
  id: string;
  name: string;
  abbreviation: string;
  category: 'weight' | 'volume' | 'pieces' | 'packages';
  conversion_factor?: number; // Para convertir entre unidades
}

export interface ShoppingListItem {
  ingredient_name: string;
  category: IngredientCategory;
  total_quantity: number;
  unit: ShoppingUnit;
  recipes_using: string[]; // Nombres de recetas que usan este ingrediente
  brand_preference?: string;
  substitutes?: string[];
  notes?: string;
}

export interface WeeklyShoppingList {
  week_number: number;
  patient_name: string;
  generated_date: string;
  items: ShoppingListItem[];
  categories: IngredientCategory[];
  total_estimated_cost?: number;
  notes?: string;
}

// Constantes para categorías predefinidas
export const INGREDIENT_CATEGORIES: IngredientCategory[] = [
  { id: 'vegetables', name: 'vegetables', display_name: 'Verduras y Hortalizas', icon: '🥬', sort_order: 1 },
  { id: 'fruits', name: 'fruits', display_name: 'Frutas', icon: '🍎', sort_order: 2 },
  { id: 'proteins', name: 'proteins', display_name: 'Proteínas', icon: '🥩', sort_order: 3 },
  { id: 'dairy', name: 'dairy', display_name: 'Lácteos', icon: '🥛', sort_order: 4 },
  { id: 'grains', name: 'grains', display_name: 'Cereales y Granos', icon: '🌾', sort_order: 5 },
  { id: 'legumes', name: 'legumes', display_name: 'Legumbres', icon: '🫘', sort_order: 6 },
  { id: 'oils', name: 'oils', display_name: 'Aceites y Grasas', icon: '🫒', sort_order: 7 },
  { id: 'condiments', name: 'condiments', display_name: 'Condimentos y Especias', icon: '🧂', sort_order: 8 },
  { id: 'beverages', name: 'beverages', display_name: 'Bebidas', icon: '🥤', sort_order: 9 },
  { id: 'others', name: 'others', display_name: 'Otros', icon: '📦', sort_order: 10 }
];

// Constantes para unidades de compra
export const SHOPPING_UNITS: ShoppingUnit[] = [
  // Peso
  { id: 'kg', name: 'kilogramo', abbreviation: 'kg', category: 'weight', conversion_factor: 1000 },
  { id: 'g', name: 'gramo', abbreviation: 'g', category: 'weight', conversion_factor: 1 },
  { id: 'lb', name: 'libra', abbreviation: 'lb', category: 'weight', conversion_factor: 453.592 },
  
  // Volumen
  { id: 'l', name: 'litro', abbreviation: 'L', category: 'volume', conversion_factor: 1000 },
  { id: 'ml', name: 'mililitro', abbreviation: 'ml', category: 'volume', conversion_factor: 1 },
  { id: 'cup', name: 'taza', abbreviation: 'taza', category: 'volume', conversion_factor: 240 },
  
  // Piezas
  { id: 'piece', name: 'pieza', abbreviation: 'pz', category: 'pieces' },
  { id: 'dozen', name: 'docena', abbreviation: 'docena', category: 'pieces', conversion_factor: 12 },
  
  // Paquetes
  { id: 'package', name: 'paquete', abbreviation: 'paq', category: 'packages' },
  { id: 'bag', name: 'bolsa', abbreviation: 'bolsa', category: 'packages' },
  { id: 'can', name: 'lata', abbreviation: 'lata', category: 'packages' },
  { id: 'bottle', name: 'botella', abbreviation: 'botella', category: 'packages' }
]; 