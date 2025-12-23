// Auth types
export type {
  User,
  Role,
  LoginCredentials,
  AuthResponse,
  NutritionistProfile,
<<<<<<< HEAD
  AuthUser,
} from './auth';
=======
  AuthUser} from './auth';
>>>>>>> nutri/main

// Patient types
export type {
  PatientProfile,
  PatientNutritionistRelation,
  PatientProgressLog,
<<<<<<< HEAD
  Patient,
} from './patient';
=======
  Patient} from './patient';
>>>>>>> nutri/main

// Diet types
export type {
  Food,
  MealItem,
  Meal,
  DietPlan,
  DietPlanSummary,
  CreateDietPlanDto,
<<<<<<< HEAD
  GenerateAIDietDto,
} from './diet';
=======
  GenerateAIDietDto} from './diet';
>>>>>>> nutri/main

// Appointment types
export type {
  Appointment,
  NutritionistAvailability,
  CreateAppointmentDto,
  UpdateAppointmentDto,
<<<<<<< HEAD
  AppointmentSlot,
} from './appointment';
=======
  AppointmentSlot} from './appointment';
>>>>>>> nutri/main

// Clinical Records types
export type {
  ClinicalRecord,
  CreateClinicalRecordDto,
  UpdateClinicalRecordDto,
  ClinicalRecordStats,
  TransferResult,
  NutritionistChangeRequest,
  DeleteAccountRequest,
<<<<<<< HEAD
  DeleteAccountResult,
} from './clinical-record';
=======
  DeleteAccountResult} from './clinical-record';
>>>>>>> nutri/main

// API Response types
export interface ApiResponse<T> {
  status: 'success' | 'error';
  message: string;
  data?: T;
  results?: number;
}

export interface PaginatedResponse<T> {
  status: 'success' | 'error';
  results: number;
  data: T[];
  page?: number;
  limit?: number;
  total?: number;
  totalPages?: number;
}

// Dashboard types
export interface DashboardStats {
  totalPatients: number;
  activePatients: number;
  pendingAppointments: number;
  completedAppointments: number;
  activeDietPlans: number;
  monthlyRevenue?: number;
}

// Chart data types
export interface ChartDataPoint {
  label: string;
  value: number;
  color?: string;
}

export interface TimeSeriesData {
  date: string;
  value: number;
}

// Form types
export interface FormError {
  field: string;
  message: string;
}

export interface FormState {
  isLoading: boolean;
  errors: FormError[];
  success: boolean;
} 