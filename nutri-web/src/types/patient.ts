import type { User } from './auth';

export interface PatientProfile {
  user_id: string;
  birth_date?: string;
  gender?: 'male' | 'female' | 'other';
  height?: number; // cm
  current_weight?: number; // kg
  target_weight?: number; // kg
  activity_level?: 'sedentary' | 'lightly_active' | 'moderately_active' | 'very_active' | 'extremely_active';
  health_goals?: string[];
  dietary_restrictions?: string[];
  allergies?: string[];
  medical_conditions?: string[];
  medications?: string[];
  user?: User;
}

export interface PatientNutritionistRelation {
  id: string;
  patient_id: string;
  nutritionist_id: string;
  status: 'pending' | 'active' | 'inactive' | 'completed';
  start_date: string;
  end_date?: string;
  notes?: string;
  patient?: PatientProfile;
  nutritionist?: any; // NutritionistProfile
}

export interface PatientProgressLog {
  id: string;
  patient_id: string;
  weight?: number;
  body_fat_percentage?: number;
  muscle_mass?: number;
  waist_circumference?: number;
  hip_circumference?: number;
  chest_circumference?: number;
  arm_circumference?: number;
  thigh_circumference?: number;
  notes?: string;
  photos?: string[];
  logged_at: string;
  patient?: PatientProfile;
}

export interface Patient {
  id: string;
  user: User;
  profile: PatientProfile;
  relation?: PatientNutritionistRelation;
  latestProgress?: PatientProgressLog;
} 