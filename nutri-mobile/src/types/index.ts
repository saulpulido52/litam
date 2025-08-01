// Tipos principales para la aplicación NutriPaciente

export interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: 'patient' | 'nutritionist' | 'admin';
  profile_image?: string;
  phone?: string;
  created_at: string;
  updated_at: string;
}

export interface PatientProfile {
  id: string;
  user_id: string;
  date_of_birth: string;
  gender: 'male' | 'female' | 'other';
  height: number;
  weight: number;
  activity_level: 'sedentary' | 'lightly_active' | 'moderately_active' | 'very_active' | 'extra_active';
  medical_conditions?: string[];
  allergies?: string[];
  dietary_preferences?: string[];
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
}

export interface Appointment {
  id: string;
  patient_id: string;
  nutritionist_id: string;
  start_time: string;
  end_time: string;
  status: 'scheduled' | 'completed' | 'cancelled_by_patient' | 'cancelled_by_nutritionist' | 'rescheduled' | 'no_show';
  notes?: string;
  meeting_link?: string;
  created_at: string;
  updated_at: string;
  patient?: User;
  nutritionist?: User;
}

export interface DietPlan {
  id: string;
  patient_id: string;
  nutritionist_id: string;
  name: string;
  description: string;
  start_date: string;
  end_date: string;
  status: 'active' | 'inactive' | 'completed';
  daily_calories: number;
  macronutrients: {
    proteins: number;
    carbohydrates: number;
    fats: number;
  };
  meals: Meal[];
  created_at: string;
  updated_at: string;
}

export interface Meal {
  id: string;
  diet_plan_id: string;
  name: string;
  type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  time: string;
  calories: number;
  items: MealItem[];
}

export interface MealItem {
  id: string;
  meal_id: string;
  food_id: string;
  quantity: number;
  unit: string;
  food?: Food;
}

export interface Food {
  id: string;
  name: string;
  category: string;
  calories_per_100g: number;
  proteins_per_100g: number;
  carbohydrates_per_100g: number;
  fats_per_100g: number;
  fiber_per_100g?: number;
}

export interface ProgressLog {
  id: string;
  patient_id: string;
  date: string;
  weight: number;
  body_fat_percentage?: number;
  muscle_mass?: number;
  notes?: string;
  created_at: string;
}

export interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  is_read: boolean;
  created_at: string;
  sender?: User;
  receiver?: User;
}

export interface ApiResponse<T> {
  status: 'success' | 'error';
  data?: T;
  message?: string;
  errors?: string[];
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: User;
  token: string;
  expires_in: number;
}

export interface RegisterRequest {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  phone?: string;
}

// Tipos para navegación
export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
};

export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
};

export type MainTabParamList = {
  Dashboard: undefined;
  Appointments: undefined;
  DietPlans: undefined;
  Progress: undefined;
  Profile: undefined;
};

// Tipos para el store
export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface AppState {
  theme: 'light' | 'dark';
  language: 'es' | 'en';
} 