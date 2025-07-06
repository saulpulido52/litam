export interface User {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  phone?: string | null;
  birth_date?: Date | null;
  age?: number | null;
  gender?: string | null;
  role: Role;
  is_active: boolean;
  registration_type?: 'online' | 'in_person';
  has_temporary_password?: boolean;
  temporary_password_expires_at?: Date | null;
  requires_initial_setup?: boolean;
  created_by_nutritionist_id?: string | null;
  created_at: string;
  updated_at: string;
  passwordChangedAt?: Date | null;
}

export interface Role {
  id: string;
  name: 'patient' | 'nutritionist' | 'admin';
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthResponse {
  status: string;
  message: string;
  data: {
    user: User;
    token: string;
  };
}

export interface NutritionistProfile {
  user_id: string;
  license_number?: string;
  specialties?: string[];
  experience_years?: number;
  education?: string;
  certifications?: string[];
  languages?: string[];
  consultation_fee?: number;
  bio?: string;
  is_verified: boolean;
  is_available: boolean;
  user?: User;
  
  // --- NUEVOS CAMPOS PARA APP MÓVIL ---
  professional_summary?: string; // Descripción breve para pacientes
  offers_in_person?: boolean; // Consultas presenciales
  offers_online?: boolean; // Consultas online
  
  // Ubicación del consultorio
  clinic_name?: string;
  clinic_address?: string;
  clinic_city?: string;
  clinic_state?: string;
  clinic_zip_code?: string;
  clinic_country?: string;
  
  // Coordenadas para Google Maps
  latitude?: number;
  longitude?: number;
  
  // Información adicional del consultorio
  clinic_notes?: string;
  clinic_phone?: string;
  
  // Horarios de consulta
  office_hours?: any;
}

export interface AuthUser {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone?: string;
  role: string;
} 