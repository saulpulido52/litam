// Clinical Record Types
export interface ClinicalRecord {
  id: string;
  record_date: string;
  patient: {
    id: string;
    email: string;
    first_name: string;
    last_name: string;
    age?: number;
    gender?: string;
  };
  nutritionist: {
    id: string;
    email: string;
    first_name: string;
    last_name: string;
  };
  expedient_number?: string;
  consultation_reason?: string;
  
  // Problemas actuales
  current_problems?: {
    diarrhea?: boolean;
    constipation?: boolean;
    gastritis?: boolean;
    ulcer?: boolean;
    nausea?: boolean;
    pyrosis?: boolean;
    vomiting?: boolean;
    colitis?: boolean;
    mouthMechanics?: string;
    otherProblems?: string;
    observations?: string;
  };

  // Enfermedades diagnosticadas
  diagnosed_diseases?: {
    has_disease?: boolean;
    disease_name?: string;
    since_when?: string;
    takes_medication?: boolean;
    medications_list?: string[];
    has_important_disease?: boolean;
    important_disease_name?: string;
    takes_special_treatment?: boolean;
    special_treatment_details?: string;
    has_surgery?: boolean;
    surgery_details?: string;
  };

  // Antecedentes familiares
  family_medical_history?: {
    obesity?: boolean;
    diabetes?: boolean;
    hta?: boolean;
    cancer?: boolean;
    hypo_hyperthyroidism?: boolean;
    dyslipidemia?: boolean;
    other_history?: string;
  };

  // Aspectos ginecológicos
  gynecological_aspects?: string;

  // Actividades diarias
  daily_activities?: {
    wake_up?: string;
    breakfast?: string;
    lunch?: string;
    dinner?: string;
    sleep?: string;
    other_hours?: { hour: string; activity: string }[];
  };

  activity_level_description?: string;

  // Ejercicio físico
  physical_exercise?: {
    performs_exercise?: boolean;
    type?: string;
    frequency?: string;
    duration?: string;
    since_when?: string;
  };

  // Hábitos de consumo
  consumption_habits?: {
    alcohol?: string;
    tobacco?: string;
    coffee?: string;
    other_substances?: string;
  };

  // Apariencia general
  general_appearance?: string;

  // Presión arterial
  blood_pressure?: {
    knows_bp?: boolean;
    habitual_bp?: string;
    systolic?: number;
    diastolic?: number;
  };

  // Indicadores bioquímicos
  biochemical_indicators?: Record<string, any>;

  // Historia dietética
  dietary_history?: {
    received_nutritional_guidance?: boolean;
    when_received?: string;
    adherence_level?: string;
    adherence_reason?: string;
    food_preparer?: string;
    eats_at_home_or_out?: string;
    modified_alimentation_last_6_months?: boolean;
    modification_reason?: string;
    most_hungry_time?: string;
    preferred_foods?: string[];
    disliked_foods?: string[];
    malestar_alergia_foods?: string[];
    takes_supplements?: boolean;
    supplement_details?: string;
  };

  // Frecuencia de consumo por grupos
  food_group_consumption_frequency?: {
    vegetables?: number;
    fruits?: number;
    cereals?: number;
    legumes?: number;
    animal_products?: number;
    milk_products?: number;
    fats?: number;
    sugars?: number;
    alcohol?: number;
    other_frequency?: { group: string; frequency: number }[];
  };

  water_consumption_liters?: number;

  // Registro dietético diario
  daily_diet_record?: {
    time_intervals?: { time: string; foods: string; quantity: string }[];
    estimated_kcal?: number;
  };

  // Mediciones antropométricas
  anthropometric_measurements?: {
    current_weight_kg?: number;
    habitual_weight_kg?: number;
    height_m?: number;
    arm_circ_cm?: number;
    waist_circ_cm?: number;
    abdominal_circ_cm?: number;
    hip_circ_cm?: number;
    calf_circ_cm?: number;
    triceps_skinfold_mm?: number;
    bicipital_skinfold_mm?: number;
    subscapular_skinfold_mm?: number;
    suprailiac_skinfold_mm?: number;
  };

  // Evaluaciones antropométricas
  anthropometric_evaluations?: {
    complexion?: string;
    ideal_weight_kg?: number;
    imc_kg_t2?: number;
    weight_variation_percent?: number;
    habitual_weight_variation_percent?: number;
    min_max_imc_weight_kg?: { min: number; max: number };
    adjusted_ideal_weight_kg?: number;
    waist_hip_ratio_cm?: number;
    arm_muscle_area_cm2?: number;
    total_muscle_mass_kg?: number;
    body_fat_percentage?: number;
    total_body_fat_kg?: number;
    fat_free_mass_kg?: number;
    fat_excess_deficiency_percent?: number;
    fat_excess_deficiency_kg?: number;
    triceps_skinfold_percentile?: number;
    subscapular_skinfold_percentile?: number;
    total_body_water_liters?: number;
  };

  nutritional_diagnosis?: string;

  // Necesidades energéticas y nutrimentales
  energy_nutrient_needs?: {
    get?: number;
    geb?: number;
    eta?: number;
    fa?: number;
    total_calories?: number;
  };

  nutritional_plan_and_management?: string;

  // Distribución de macronutrientes
  macronutrient_distribution?: {
    carbohydrates_g?: number;
    carbohydrates_kcal?: number;
    carbohydrates_percent?: number;
    proteins_g?: number;
    proteins_kcal?: number;
    proteins_percent?: number;
    lipids_g?: number;
    lipids_kcal?: number;
    lipids_percent?: number;
  };

  dietary_calculation_scheme?: string;
  menu_details?: Record<string, any>;
  evolution_and_follow_up_notes?: string;
  graph_url?: string;

  created_at: string;
  updated_at: string;
}

// DTOs para crear/actualizar expedientes
export interface CreateClinicalRecordDto {
  patientId: string;
  recordDate: string;
  expedientNumber?: string;
  consultationReason?: string;
  currentProblems?: {
    diarrhea?: boolean;
    constipation?: boolean;
    gastritis?: boolean;
    ulcer?: boolean;
    nausea?: boolean;
    pyrosis?: boolean;
    vomiting?: boolean;
    colitis?: boolean;
    mouthMechanics?: string;
    otherProblems?: string;
    observations?: string;
  };
  diagnosedDiseases?: {
    hasDisease?: boolean;
    diseaseName?: string;
    sinceWhen?: string;
    takesMedication?: boolean;
    medicationsList?: string[];
    hasImportantDisease?: boolean;
    importantDiseaseName?: string;
    takesSpecialTreatment?: boolean;
    specialTreatmentDetails?: string;
    hasSurgery?: boolean;
    surgeryDetails?: string;
  };
  familyMedicalHistory?: {
    obesity?: boolean;
    diabetes?: boolean;
    hta?: boolean;
    cancer?: boolean;
    hypoHyperthyroidism?: boolean;
    dyslipidemia?: boolean;
    otherHistory?: string;
  };
  gynecologicalAspects?: string;
  dailyActivities?: {
    wakeUp?: string;
    breakfast?: string;
    lunch?: string;
    dinner?: string;
    sleep?: string;
    otherHours?: { hour: string; activity: string }[];
  };
  activityLevelDescription?: string;
  physicalExercise?: {
    performsExercise?: boolean;
    type?: string;
    frequency?: string;
    duration?: string;
    sinceWhen?: string;
  };
  consumptionHabits?: {
    alcohol?: string;
    tobacco?: string;
    coffee?: string;
    otherSubstances?: string;
  };
  generalAppearance?: string;
  bloodPressure?: {
    knowsBp?: boolean;
    habitualBp?: string;
    systolic?: number;
    diastolic?: number;
  };
  biochemicalIndicators?: Record<string, any>;
  dietaryHistory?: {
    receivedNutritionalGuidance?: boolean;
    whenReceived?: string;
    adherenceLevel?: string;
    adherenceReason?: string;
    foodPreparer?: string;
    eatsAtHomeOrOut?: string;
    modifiedAlimentationLast6Months?: boolean;
    modificationReason?: string;
    mostHungryTime?: string;
    preferredFoods?: string[];
    dislikedFoods?: string[];
    malestarAlergiaFoods?: string[];
    takesSupplements?: boolean;
    supplementDetails?: string;
  };
  foodGroupConsumptionFrequency?: {
    vegetables?: number;
    fruits?: number;
    cereals?: number;
    legumes?: number;
    animalProducts?: number;
    milkProducts?: number;
    fats?: number;
    sugars?: number;
    alcohol?: number;
    otherFrequency?: { group: string; frequency: number }[];
  };
  waterConsumptionLiters?: number;
  dailyDietRecord?: {
    timeIntervals?: { time: string; foods: string; quantity: string }[];
    estimatedKcal?: number;
  };
  anthropometricMeasurements?: {
    currentWeightKg?: number;
    habitualWeightKg?: number;
    heightM?: number;
    armCircCm?: number;
    waistCircCm?: number;
    abdominalCircCm?: number;
    hipCircCm?: number;
    calfCircCm?: number;
    tricepsSkinfoldMm?: number;
    bicipitalSkinfoldMm?: number;
    subscapularSkinfoldMm?: number;
    suprailiacSkinfoldMm?: number;
  };
  anthropometricEvaluations?: {
    complexion?: string;
    idealWeightKg?: number;
    imcKgT2?: number;
    weightVariationPercent?: number;
    habitualWeightVariationPercent?: number;
    minMaxImcWeightKg?: { min: number; max: number };
    adjustedIdealWeightKg?: number;
    waistHipRatioCm?: number;
    armMuscleAreaCm2?: number;
    totalMuscleMassKg?: number;
    bodyFatPercentage?: number;
    totalBodyFatKg?: number;
    fatFreeMassKg?: number;
    fatExcessDeficiencyPercent?: number;
    fatExcessDeficiencyKg?: number;
    tricepsSkinfoldPercentile?: number;
    subscapularSkinfoldPercentile?: number;
    totalBodyWaterLiters?: number;
  };
  nutritionalDiagnosis?: string;
  energyNutrientNeeds?: {
    get?: number;
    geb?: number;
    eta?: number;
    fa?: number;
    totalCalories?: number;
  };
  nutritionalPlanAndManagement?: string;
  macronutrientDistribution?: {
    carbohydratesG?: number;
    carbohydratesKcal?: number;
    carbohydratesPercent?: number;
    proteinsG?: number;
    proteinsKcal?: number;
    proteinsPercent?: number;
    lipidsG?: number;
    lipidsKcal?: number;
    lipidsPercent?: number;
  };
  dietaryCalculationScheme?: string;
  menuDetails?: Record<string, any>;
  evolutionAndFollowUpNotes?: string;
  graphUrl?: string;
}

export type UpdateClinicalRecordDto = Partial<CreateClinicalRecordDto>;

// Estadísticas de expedientes
export interface ClinicalRecordStats {
  total_records: number;
  records_by_nutritionist: {
    nutritionist: {
      id: string;
      name: string;
    };
    record_count: number;
  }[];
  latest_record?: {
    id: string;
    date: string;
    nutritionist: {
      id: string;
      name: string;
    };
  };
}

// Resultado de transferencia
export interface TransferResult {
  message: string;
  transferred_count: number;
  new_nutritionist?: {
    id: string;
    name: string;
  };
}

// Datos para cambio de nutriólogo
export interface NutritionistChangeRequest {
  newNutritionistId: string;
  reason?: string;
}

// Datos para eliminación de cuenta
export interface DeleteAccountRequest {
  confirmPassword: string;
}

export interface DeleteAccountResult {
  message: string;
  deleted_data: {
    clinical_records: number;
    appointments: number;
    progress_logs: number;
    relations: number;
    patient_profile: boolean;
    user_account: boolean;
  };
} 