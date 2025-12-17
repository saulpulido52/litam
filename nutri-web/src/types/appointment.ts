export interface Appointment {
  id: string;
  patient_id: string;
  nutritionist_id: string;
  date_time: string;
  duration_minutes: number;
  status: 'scheduled' | 'completed' | 'cancelled' | 'no_show';
  notes?: string;
  consultation_type: 'initial' | 'follow_up' | 'emergency';
  meeting_link?: string;
  created_at: string;
  updated_at: string;
  patient?: any; // PatientProfile
  nutritionist?: any; // NutritionistProfile
}

export interface NutritionistAvailability {
  id: string;
  nutritionist_id: string;
  day_of_week: number; // 0-6 (Sunday = 0)
  start_time: string; // HH:MM format
  end_time: string; // HH:MM format
  is_available: boolean;
}

export interface CreateAppointmentDto {
  patient_id: string;
  date_time: string;
  duration_minutes?: number;
  notes?: string;
  consultation_type: 'initial' | 'follow_up' | 'emergency';
}

export interface UpdateAppointmentDto {
  date_time?: string;
  duration_minutes?: number;
  status?: 'scheduled' | 'completed' | 'cancelled' | 'no_show';
  notes?: string;
  meeting_link?: string;
}

export interface AppointmentSlot {
  date: string;
  time: string;
  available: boolean;
  reason?: string;
} 