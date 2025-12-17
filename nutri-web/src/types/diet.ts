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

// Nuevas interfaces para restricciones patológicas
export interface MedicalCondition {
  id: string;
  name: string;
  category: 'disease' | 'syndrome' | 'disorder' | 'condition';
  severity: 'mild' | 'moderate' | 'severe' | 'critical';
  description?: string;
  dietary_implications: string[];
  restricted_foods?: string[];
  recommended_foods?: string[];
  monitoring_requirements?: string[];
  emergency_instructions?: string;
}

export interface Allergy {
  id: string;
  allergen: string;
  type: 'food' | 'environmental' | 'medication';
  severity: 'mild' | 'moderate' | 'severe' | 'anaphylactic';
  symptoms: string[];
  cross_reactions?: string[];
  emergency_medication?: string;
  avoidance_instructions: string;
}

export interface Intolerance {
  id: string;
  substance: string;
  type: 'lactose' | 'gluten' | 'fructose' | 'histamine' | 'other';
  severity: 'mild' | 'moderate' | 'severe';
  symptoms: string[];
  threshold_amount?: string;
  alternatives: string[];
  preparation_notes?: string;
}

export interface PathologicalRestrictions {
  medical_conditions: MedicalCondition[];
  allergies: Allergy[];
  intolerances: Intolerance[];
  medications: {
    name: string;
    dosage: string;
    frequency: string;
    food_interactions?: string[];
    timing_requirements?: string;
  }[];
  special_considerations: string[];
  emergency_contacts: {
    name: string;
    relationship: string;
    phone: string;
    is_primary: boolean;
  }[];
}

export interface MealAdaptation {
  adaptation_type: 'substitution' | 'portion_control' | 'preparation_method' | 'timing' | 'combination';
  reason: string;
  original_food?: string;
  adapted_food?: string;
  instructions: string;
  nutritional_impact?: {
    calories_change?: number;
    protein_change?: number;
    carbs_change?: number;
    fats_change?: number;
  };
  safety_notes?: string;
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

// Tipos de plan más flexibles
export type PlanType = 'daily' | 'weekly' | 'monthly' | 'custom' | 'flexible';
export type PlanPeriod = 'days' | 'weeks' | 'months' | 'quarters' | 'years';
export type TimeUnit = 'hours' | 'days' | 'weeks' | 'months' | 'quarters' | 'years';

// Configuración flexible de tiempo
export interface FlexibleTimeConfig {
  startDate: string;
  endDate?: string; // Opcional para planes abiertos
  duration: {
    value: number;
    unit: TimeUnit;
  };
  isOpenEnded?: boolean; // Para planes sin fecha de fin definida
  recurringPattern?: RecurringPattern;
  customSchedule?: CustomSchedule;
}

// Patrón recurrente para planes que se repiten
export interface RecurringPattern {
  type: 'daily' | 'weekly' | 'monthly' | 'yearly';
  interval: number; // Cada cuántos días/semanas/meses/años
  daysOfWeek?: number[]; // Para patrones semanales: [1,3,5] = lunes, miércoles, viernes
  dayOfMonth?: number; // Para patrones mensuales
  monthOfYear?: number; // Para patrones anuales
  endAfterOccurrences?: number; // Número de repeticiones
  endDate?: string; // Fecha de fin del patrón
}

// Horario personalizado
export interface CustomSchedule {
  name: string;
  description?: string;
  timeSlots: TimeSlot[];
  exceptions?: ScheduleException[];
}

export interface TimeSlot {
  id: string;
  name: string;
  startTime: string; // HH:MM
  endTime: string; // HH:MM
  mealTypes: ('breakfast' | 'lunch' | 'dinner' | 'snack')[];
  daysOfWeek?: number[]; // 0-6 (domingo-sábado), undefined = todos los días
  isActive: boolean;
}

export interface ScheduleException {
  date: string; // YYYY-MM-DD
  type: 'skip' | 'modify' | 'special';
  modifications?: {
    timeSlotId: string;
    changes: {
      startTime?: string;
      endTime?: string;
      mealTypes?: ('breakfast' | 'lunch' | 'dinner' | 'snack')[];
    };
  }[];
  notes?: string;
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
  
  // Restricciones patológicas - NUEVO
  pathological_restrictions?: PathologicalRestrictions;
  safety_guidelines?: {
    emergency_protocols?: string[];
    monitoring_requirements?: string[];
    warning_signs?: string[];
    action_plan?: string;
  };
  
  // Campos flexibles para diferentes tipos de plan
  plan_type?: PlanType;
  plan_period?: PlanPeriod;
  total_periods?: number; // Número de días, semanas o meses
  is_weekly_plan?: boolean; // Mantener para compatibilidad
  total_weeks?: number; // Mantener para compatibilidad
  weekly_plans?: WeeklyPlan[];
  
  // Nuevos campos para planes flexibles
  period_plans?: PeriodPlan[];
  custom_structure?: CustomPlanStructure;
  
  // Configuración flexible de tiempo
  flexible_time_config?: FlexibleTimeConfig;
  time_units?: TimeUnit;
  custom_duration?: {
    value: number;
    unit: TimeUnit;
  };
  
  // Configuración avanzada
  meal_frequency?: {
    breakfast?: boolean;
    morning_snack?: boolean;
    lunch?: boolean;
    afternoon_snack?: boolean;
    dinner?: boolean;
    evening_snack?: boolean;
  };
  meal_timing?: {
    breakfast_time?: string;
    lunch_time?: string;
    dinner_time?: string;
    snack_times?: string[];
  };
  flexibility_settings?: {
    allow_meal_swapping?: boolean;
    allow_portion_adjustment?: boolean;
    allow_food_substitution?: boolean;
    cheat_days_per_week?: number;
    free_meals_per_week?: number;
  };
}

// Plan de período genérico (días, semanas, meses)
export interface PeriodPlan {
  period_number: number;
  start_date: string;
  end_date: string;
  daily_calories_target: number;
  daily_macros_target: {
    protein: number;
    carbohydrates: number;
    fats: number;
  };
  meals: PeriodMeal[];
  notes?: string;
  period_name?: string; // "Día 1", "Semana 1", "Mes 1", etc.
}

// Comida de período genérico
export interface PeriodMeal {
  day?: string; // Para planes semanales: 'monday', 'tuesday', etc.
  day_number?: number; // Para planes diarios: 1, 2, 3, etc.
  meal_type: 'breakfast' | 'lunch' | 'dinner' | 'snack' | 'morning_snack' | 'afternoon_snack';
  foods: PeriodFood[];
  notes?: string;
  target_time?: string;
  meal_name?: string; // Nombre personalizado de la comida
}

// Alimento de período genérico
export interface PeriodFood {
  food_id: string;
  food_name: string;
  quantity_grams: number;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  preparation_notes?: string; // Notas de preparación específicas
  alternatives?: string[]; // Alimentos alternativos
  adaptations?: MealAdaptation[]; // Adaptaciones para restricciones patológicas
  safety_warnings?: string[]; // Advertencias de seguridad
  glycemic_index?: number; // Índice glucémico para diabéticos
  sodium_content?: number; // Contenido de sodio para hipertensos
  potassium_content?: number; // Contenido de potasio para problemas renales
  phosphorus_content?: number; // Contenido de fósforo para problemas renales
}

// Estructura personalizada para planes complejos
export interface CustomPlanStructure {
  name: string;
  description?: string;
  phases?: PlanPhase[];
  rotation_pattern?: RotationPattern;
  special_days?: SpecialDay[];
}

export interface PlanPhase {
  phase_number: number;
  phase_name: string;
  duration_days: number;
  objectives: string[];
  meal_templates: MealTemplate[];
  notes?: string;
}

export interface MealTemplate {
  template_name: string;
  meal_type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  base_foods: TemplateFood[];
  variations?: MealVariation[];
  notes?: string;
}

export interface TemplateFood {
  food_category: string; // "proteína", "carbohidrato", "vegetal", etc.
  quantity_range: {
    min: number;
    max: number;
    unit: 'grams' | 'pieces' | 'cups' | 'tablespoons';
  };
  alternatives?: string[];
  notes?: string;
}

export interface MealVariation {
  variation_name: string;
  food_substitutions: {
    original_category: string;
    substitute_foods: string[];
  }[];
  notes?: string;
}

export interface RotationPattern {
  pattern_type: 'weekly' | 'biweekly' | 'monthly';
  rotation_days: number;
  meal_rotations: MealRotation[];
}

export interface MealRotation {
  rotation_day: number;
  meal_changes: {
    meal_type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
    food_changes: {
      add?: string[];
      remove?: string[];
      modify?: { food: string; new_quantity: number };
    };
  }[];
}

export interface SpecialDay {
  day_name: string;
  day_type: 'cheat_day' | 'fasting_day' | 'high_protein_day' | 'low_carb_day' | 'custom';
  meal_modifications: {
    meal_type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
    modifications: string[];
  }[];
  notes?: string;
}

// Mantener interfaces existentes para compatibilidad
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
  adaptations?: MealAdaptation[]; // Adaptaciones para restricciones patológicas
  safety_warnings?: string[]; // Advertencias de seguridad
  glycemic_index?: number; // Índice glucémico para diabéticos
  sodium_content?: number; // Contenido de sodio para hipertensos
  potassium_content?: number; // Contenido de potasio para problemas renales
  phosphorus_content?: number; // Contenido de fósforo para problemas renales
}

export interface DietPlanSummary {
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFats: number;
  totalFiber: number;
  mealsCount: number;
}

// DTOs actualizados para API calls
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
  
  // Restricciones patológicas - NUEVO
  pathologicalRestrictions?: PathologicalRestrictionsDto;
  safetyGuidelines?: {
    emergencyProtocols?: string[];
    monitoringRequirements?: string[];
    warningSigns?: string[];
    actionPlan?: string;
  };
  
  // Campos flexibles
  planType?: PlanType;
  planPeriod?: PlanPeriod;
  totalPeriods?: number;
  
  // Mantener para compatibilidad
  isWeeklyPlan?: boolean;
  totalWeeks?: number;
  weeklyPlans?: WeeklyPlanDto[];
  
  // Nuevos campos
  periodPlans?: PeriodPlanDto[];
  customStructure?: CustomPlanStructureDto;
  
  // Configuración flexible de tiempo
  flexibleTimeConfig?: FlexibleTimeConfigDto;
  timeUnits?: TimeUnit;
  customDuration?: {
    value: number;
    unit: TimeUnit;
  };
  
  // Configuración avanzada
  mealFrequency?: {
    breakfast?: boolean;
    morningSnack?: boolean;
    lunch?: boolean;
    afternoonSnack?: boolean;
    dinner?: boolean;
    eveningSnack?: boolean;
  };
  mealTiming?: {
    breakfastTime?: string;
    lunchTime?: string;
    dinnerTime?: string;
    snackTimes?: string[];
  };
  flexibilitySettings?: {
    allowMealSwapping?: boolean;
    allowPortionAdjustment?: boolean;
    allowFoodSubstitution?: boolean;
    cheatDaysPerWeek?: number;
    freeMealsPerWeek?: number;
  };
}

// Nuevas interfaces DTO para restricciones patológicas
export interface MedicalConditionDto {
  id?: string;
  name: string;
  category: 'disease' | 'syndrome' | 'disorder' | 'condition';
  severity: 'mild' | 'moderate' | 'severe' | 'critical';
  description?: string;
  dietaryImplications: string[];
  restrictedFoods?: string[];
  recommendedFoods?: string[];
  monitoringRequirements?: string[];
  emergencyInstructions?: string;
}

export interface AllergyDto {
  id?: string;
  allergen: string;
  type: 'food' | 'environmental' | 'medication';
  severity: 'mild' | 'moderate' | 'severe' | 'anaphylactic';
  symptoms: string[];
  crossReactions?: string[];
  emergencyMedication?: string;
  avoidanceInstructions: string;
}

export interface IntoleranceDto {
  id?: string;
  substance: string;
  type: 'lactose' | 'gluten' | 'fructose' | 'histamine' | 'other';
  severity: 'mild' | 'moderate' | 'severe';
  symptoms: string[];
  thresholdAmount?: string;
  alternatives: string[];
  preparationNotes?: string;
}

export interface PathologicalRestrictionsDto {
  medicalConditions: MedicalConditionDto[];
  allergies: AllergyDto[];
  intolerances: IntoleranceDto[];
  medications: {
    name: string;
    dosage: string;
    frequency: string;
    foodInteractions?: string[];
    timingRequirements?: string;
  }[];
  specialConsiderations: string[];
  emergencyContacts: {
    name: string;
    relationship: string;
    phone: string;
    isPrimary: boolean;
  }[];
}

export interface MealAdaptationDto {
  adaptationType: 'substitution' | 'portion_control' | 'preparation_method' | 'timing' | 'combination';
  reason: string;
  originalFood?: string;
  adaptedFood?: string;
  instructions: string;
  nutritionalImpact?: {
    caloriesChange?: number;
    proteinChange?: number;
    carbsChange?: number;
    fatsChange?: number;
  };
  safetyNotes?: string;
}

export interface PeriodPlanDto {
  periodNumber: number;
  startDate: string;
  endDate: string;
  dailyCaloriesTarget: number;
  dailyMacrosTarget: {
    protein: number;
    carbohydrates: number;
    fats: number;
  };
  meals: PeriodMealDto[];
  notes?: string;
  periodName?: string;
}

export interface PeriodMealDto {
  day?: string;
  dayNumber?: number;
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack' | 'morning_snack' | 'afternoon_snack';
  foods: PeriodFoodDto[];
  notes?: string;
  targetTime?: string;
  mealName?: string;
}

export interface PeriodFoodDto {
  foodId: string;
  foodName: string;
  quantityGrams: number;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  preparationNotes?: string;
  alternatives?: string[];
  adaptations?: MealAdaptationDto[]; // Adaptaciones para restricciones patológicas
  safetyWarnings?: string[]; // Advertencias de seguridad
  glycemicIndex?: number; // Índice glucémico para diabéticos
  sodiumContent?: number; // Contenido de sodio para hipertensos
  potassiumContent?: number; // Contenido de potasio para problemas renales
  phosphorusContent?: number; // Contenido de fósforo para problemas renales
}

export interface CustomPlanStructureDto {
  name: string;
  description?: string;
  phases?: PlanPhaseDto[];
  rotationPattern?: RotationPatternDto;
  specialDays?: SpecialDayDto[];
}

export interface PlanPhaseDto {
  phaseNumber: number;
  phaseName: string;
  durationDays: number;
  objectives: string[];
  mealTemplates: MealTemplateDto[];
  notes?: string;
}

export interface MealTemplateDto {
  templateName: string;
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  baseFoods: TemplateFoodDto[];
  variations?: MealVariationDto[];
  notes?: string;
}

export interface TemplateFoodDto {
  foodCategory: string;
  quantityRange: {
    min: number;
    max: number;
    unit: 'grams' | 'pieces' | 'cups' | 'tablespoons';
  };
  alternatives?: string[];
  notes?: string;
}

export interface MealVariationDto {
  variationName: string;
  foodSubstitutions: {
    originalCategory: string;
    substituteFoods: string[];
  }[];
  notes?: string;
}

export interface RotationPatternDto {
  patternType: 'weekly' | 'biweekly' | 'monthly';
  rotationDays: number;
  mealRotations: MealRotationDto[];
}

export interface MealRotationDto {
  rotationDay: number;
  mealChanges: {
    mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
    foodChanges: {
      add?: string[];
      remove?: string[];
      modify?: { food: string; newQuantity: number };
    };
  }[];
}

export interface SpecialDayDto {
  dayName: string;
  dayType: 'cheat_day' | 'fasting_day' | 'high_protein_day' | 'low_carb_day' | 'custom';
  mealModifications: {
    mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
    modifications: string[];
  }[];
  notes?: string;
}

// Mantener DTOs existentes para compatibilidad
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
  adaptations?: MealAdaptationDto[]; // Adaptaciones para restricciones patológicas
  safetyWarnings?: string[]; // Advertencias de seguridad
  glycemicIndex?: number; // Índice glucémico para diabéticos
  sodiumContent?: number; // Contenido de sodio para hipertensos
  potassiumContent?: number; // Contenido de potasio para problemas renales
  phosphorusContent?: number; // Contenido de fósforo para problemas renales
}

export interface GenerateAIDietDto {
  patientId: string;
  name: string;
  goal: 'weight_loss' | 'weight_gain' | 'maintenance' | 'muscle_gain';
  startDate: string;
  endDate: string;
  planType?: PlanType;
  planPeriod?: PlanPeriod;
  totalPeriods?: number;
  totalWeeks?: number; // Mantener para compatibilidad
  dailyCaloriesTarget?: number;
  dietaryRestrictions?: string[];
  allergies?: string[];
  preferredFoods?: string[];
  dislikedFoods?: string[];
  notesForAI?: string;
  customRequirements?: string[]; // Requisitos específicos para IA
}

// DTOs para configuración flexible de tiempo
export interface FlexibleTimeConfigDto {
  startDate: string;
  endDate?: string;
  duration: {
    value: number;
    unit: TimeUnit;
  };
  isOpenEnded?: boolean;
  recurringPattern?: RecurringPatternDto;
  customSchedule?: CustomScheduleDto;
}

export interface RecurringPatternDto {
  type: 'daily' | 'weekly' | 'monthly' | 'yearly';
  interval: number;
  daysOfWeek?: number[];
  dayOfMonth?: number;
  monthOfYear?: number;
  endAfterOccurrences?: number;
  endDate?: string;
}

export interface CustomScheduleDto {
  name: string;
  description?: string;
  timeSlots: TimeSlotDto[];
  exceptions?: ScheduleExceptionDto[];
}

export interface TimeSlotDto {
  id: string;
  name: string;
  startTime: string;
  endTime: string;
  mealTypes: ('breakfast' | 'lunch' | 'dinner' | 'snack')[];
  daysOfWeek?: number[];
  isActive: boolean;
}

export interface ScheduleExceptionDto {
  date: string;
  type: 'skip' | 'modify' | 'special';
  modifications?: {
    timeSlotId: string;
    changes: {
      startTime?: string;
      endTime?: string;
      mealTypes?: ('breakfast' | 'lunch' | 'dinner' | 'snack')[];
    };
  }[];
  notes?: string;
} 