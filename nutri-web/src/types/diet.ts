export interface Food {
  id: string;
  name: string;
  category: string;
  calories_per_100g: number;
  protein_per_100g: number;
  carbs_per_100g: number;
  fats_per_100g: number;
  fiber_per_100g?: number;
  sugar_per_100g?: number;
  sodium_per_100g?: number;
  description?: string;
  is_active: boolean;
}

export interface MealItem {
  id: string;
  meal_id: string;
  food_id: string;
  quantity_grams: number;
  food?: Food;
}

export interface Meal {
  id: string;
  diet_plan_id: string;
  type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  name?: string;
  target_time?: string;
  calories?: number;
  protein?: number;
  carbs?: number;
  fats?: number;
  fiber?: number;
  meal_items?: MealItem[];
}

export interface DietPlan {
  id: string;
  patient_id: string;
  nutritionist_id: string;
  name: string;
  description?: string;
  status: 'draft' | 'active' | 'completed' | 'cancelled';
  start_date?: string;
  end_date?: string;
  target_calories?: number;
  target_protein?: number;
  target_carbs?: number;
  target_fats?: number;
  notes?: string;
  created_at: string;
  updated_at: string;
  meals?: Meal[];
  patient?: any; // PatientProfile
  nutritionist?: any; // NutritionistProfile
}

export interface DietPlanSummary {
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFats: number;
  totalFiber: number;
  mealsCount: number;
}

export interface CreateDietPlanDto {
  patient_id: string;
  name: string;
  description?: string;
  target_calories?: number;
  target_protein?: number;
  target_carbs?: number;
  target_fats?: number;
  notes?: string;
}

export interface GenerateAIDietDto {
  patient_id: string;
  goal: 'weight_loss' | 'weight_gain' | 'maintenance' | 'muscle_gain';
  dietary_restrictions?: string[];
  allergies?: string[];
  preferred_foods?: string[];
  disliked_foods?: string[];
  meals_per_day?: number;
  target_calories?: number;
} 