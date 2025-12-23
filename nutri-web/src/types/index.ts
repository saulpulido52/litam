// Auth types
export type {
  User,
  Role,
  LoginCredentials,
  AuthResponse,
  NutritionistProfile,
  AuthUser} from './auth';

// Patient types
export type {
  PatientProfile,
  PatientNutritionistRelation,
  PatientProgressLog,
  Patient} from './patient';

// Diet types
export type {
  Food,
  MealItem,
  Meal,
  DietPlan,
  DietPlanSummary,
  CreateDietPlanDto,
  GenerateAIDietDto} from './diet';

// Appointment types
export type {
  Appointment,
  NutritionistAvailability,
  CreateAppointmentDto,
  UpdateAppointmentDto,
  AppointmentSlot} from './appointment';

// Clinical Records types
export type {
  ClinicalRecord,
  CreateClinicalRecordDto,
  UpdateClinicalRecordDto,
  ClinicalRecordStats,
  TransferResult,
  NutritionistChangeRequest,
  DeleteAccountRequest,
  DeleteAccountResult} from './clinical-record';

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