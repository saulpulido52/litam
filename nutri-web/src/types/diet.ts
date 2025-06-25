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
  // Weekly plan fields
  is_weekly_plan?: boolean;
  total_weeks?: number;
  weekly_plans?: WeeklyPlan[];
}

export interface WeeklyPlan {
  week_number: number;
  start_date: string;
  end_date: string;
  daily_calories_target: number;
  daily_macros_target: {
    protein: number;
    carbohydrates: number;
    fats: number;
  };
  meals: WeeklyMeal[];
  notes?: string;
}

export interface WeeklyMeal {
  day: 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';
  meal_type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  foods: WeeklyFood[];
  notes?: string;
}

export interface WeeklyFood {
  food_id: string;
  food_name: string;
  quantity_grams: number;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
}

export interface DietPlanSummary {
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFats: number;
  totalFiber: number;
  mealsCount: number;
}

// DTOs for API calls - matching backend expectations
export interface CreateDietPlanDto {
  patientId: string;
  name: string;
  description?: string;
  startDate: string; // YYYY-MM-DD
  endDate: string;   // YYYY-MM-DD
  dailyCaloriesTarget?: number;
  dailyMacrosTarget?: {
    protein?: number;
    carbohydrates?: number;
    fats?: number;
  };
  notes?: string;
  isWeeklyPlan?: boolean;
  totalWeeks?: number;
  weeklyPlans?: WeeklyPlanDto[];
}

export interface WeeklyPlanDto {
  weekNumber: number;
  startDate: string;
  endDate: string;
  dailyCaloriesTarget: number;
  dailyMacrosTarget: {
    protein: number;
    carbohydrates: number;
    fats: number;
  };
  meals: WeeklyMealDto[];
  notes?: string;
}

export interface WeeklyMealDto {
  day: 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  foods: WeeklyFoodDto[];
  notes?: string;
}

export interface WeeklyFoodDto {
  foodId: string;
  foodName: string;
  quantityGrams: number;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
}

export interface GenerateAIDietDto {
  patientId: string;
  name: string;
  goal: 'weight_loss' | 'weight_gain' | 'maintenance' | 'muscle_gain';
  startDate: string;
  endDate: string;
  totalWeeks: number;
  dailyCaloriesTarget?: number;
  dietaryRestrictions?: string[];
  allergies?: string[];
  preferredFoods?: string[];
  dislikedFoods?: string[];
  notesForAI?: string;
} 