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
}

export interface AuthUser {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone?: string;
  role: string;
} 