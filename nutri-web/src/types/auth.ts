export interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone?: string;
  role: Role;
  created_at: string;
  updated_at: string;
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