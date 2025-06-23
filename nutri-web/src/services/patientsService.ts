import apiService from './api';

export interface Patient {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  birth_date?: string;
  gender?: 'male' | 'female' | 'other';
  role: {
    id: string;
    name: string;
  };
  is_active: boolean;
  created_at: string;
  updated_at: string;
  profile?: PatientProfile;
}

export interface PatientProfile {
  id: string;
  height?: number;
  current_weight?: number;
  target_weight?: number;
  activity_level?: string;
  medical_conditions?: string[];
  allergies?: string[];
  objectives?: string[];
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
}

export interface CreatePatientRequest {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  age?: number;
  gender?: 'male' | 'female' | 'other';
  phone?: string;
  birth_date?: string;
  profile?: {
    height?: number;
    current_weight?: number;
    activity_level?: string;
    medical_conditions?: string[];
    allergies?: string[];
    objectives?: string[];
    emergency_contact_name?: string;
    emergency_contact_phone?: string;
  };
}

export interface UpdatePatientRequest {
  first_name?: string;
  last_name?: string;
  email?: string;
  phone?: string;
  birth_date?: string;
  gender?: 'male' | 'female' | 'other';
  age?: number;
  profile?: {
    height?: number;
    current_weight?: number;
    target_weight?: number;
    activity_level?: string;
    medical_conditions?: string[];
    allergies?: string[];
    objectives?: string[];
    emergency_contact_name?: string;
    emergency_contact_phone?: string;
  };
}

export interface PatientAppointment {
  id: string;
  date: string;
  start_time: string;
  end_time: string;
  type: string;
  status: string;
  notes?: string;
}

export interface PatientProgress {
  id: string;
  date: string;
  weight: number;
  body_fat_percentage?: number;
  muscle_mass?: number;
  waist_circumference?: number;
  notes?: string;
}

class PatientsService {
  // Obtener todos los pacientes del nutriólogo actual
  async getMyPatients(): Promise<Patient[]> {
    try {
      const response = await apiService.get<{ patients: Patient[] }>('/patients/my-patients');
      return response.data?.patients || [];
    } catch (error) {
      console.error('Error fetching patients:', error);
      throw new Error('Error al obtener la lista de pacientes');
    }
  }

  // Obtener un paciente específico por ID
  async getPatientById(patientId: string): Promise<Patient> {
    try {
      const response = await apiService.get<{ patient: Patient }>(`/patients/${patientId}`);
      if (!response.data?.patient) {
        throw new Error('Paciente no encontrado');
      }
      return response.data.patient;
    } catch (error) {
      console.error('Error fetching patient:', error);
      throw new Error('Error al obtener la información del paciente');
    }
  }

  // Crear un nuevo paciente
  async createPatient(patientData: CreatePatientRequest): Promise<Patient> {
    try {
      const response = await apiService.post<{ patient: Patient }>('/patients', patientData);
      if (!response.data?.patient) {
        throw new Error('Error al crear el paciente');
      }
      return response.data.patient;
    } catch (error: any) {
      console.error('Error creating patient:', error);
      const message = error.response?.data?.message || 'Error al registrar el paciente';
      throw new Error(message);
    }
  }

  // Actualizar información de un paciente
  async updatePatient(patientId: string, patientData: UpdatePatientRequest): Promise<Patient> {
    try {
      const response = await apiService.put<{ patient: Patient }>(`/patients/${patientId}`, patientData);
      if (!response.data?.patient) {
        throw new Error('Error al actualizar el paciente');
      }
      return response.data.patient;
    } catch (error: any) {
      console.error('Error updating patient:', error);
      const message = error.response?.data?.message || 'Error al actualizar el paciente';
      throw new Error(message);
    }
  }

  // Eliminar un paciente
  async deletePatient(patientId: string): Promise<void> {
    try {
      await apiService.delete(`/patients/${patientId}`);
    } catch (error: any) {
      console.error('Error deleting patient:', error);
      const message = error.response?.data?.message || 'Error al eliminar el paciente';
      throw new Error(message);
    }
  }

  // Obtener citas de un paciente
  async getPatientAppointments(patientId: string): Promise<PatientAppointment[]> {
    try {
      const response = await apiService.get<{ appointments: PatientAppointment[] }>(`/patients/${patientId}/appointments`);
      return response.data?.appointments || [];
    } catch (error) {
      console.error('Error fetching patient appointments:', error);
      throw new Error('Error al obtener las citas del paciente');
    }
  }

  // Obtener progreso de un paciente
  async getPatientProgress(patientId: string): Promise<PatientProgress[]> {
    try {
      const response = await apiService.get<{ progress: PatientProgress[] }>(`/patients/${patientId}/progress`);
      return response.data?.progress || [];
    } catch (error) {
      console.error('Error fetching patient progress:', error);
      throw new Error('Error al obtener el progreso del paciente');
    }
  }

  // Agregar progreso a un paciente
  async addPatientProgress(patientId: string, progressData: Omit<PatientProgress, 'id'>): Promise<PatientProgress> {
    try {
      const response = await apiService.post<{ progress: PatientProgress }>(`/patients/${patientId}/progress`, progressData);
      if (!response.data?.progress) {
        throw new Error('Error al registrar el progreso');
      }
      return response.data.progress;
    } catch (error: any) {
      console.error('Error adding patient progress:', error);
      const message = error.response?.data?.message || 'Error al registrar el progreso';
      throw new Error(message);
    }
  }

  // Buscar pacientes por término
  async searchPatients(searchTerm: string): Promise<Patient[]> {
    try {
      const response = await apiService.get<{ patients: Patient[] }>(`/patients/search?q=${encodeURIComponent(searchTerm)}`);
      return response.data?.patients || [];
    } catch (error) {
      console.error('Error searching patients:', error);
      throw new Error('Error al buscar pacientes');
    }
  }

  // Obtener estadísticas de pacientes
  async getPatientsStats(): Promise<{
    total: number;
    active: number;
    new: number;
    withConditions: number;
  }> {
    try {
      const patients = await this.getMyPatients();
      return {
        total: patients.length,
        active: patients.filter(p => p.is_active).length,
        new: patients.filter(p => {
          const createdDate = new Date(p.created_at);
          const thirtyDaysAgo = new Date();
          thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
          return createdDate > thirtyDaysAgo;
        }).length,
        withConditions: patients.filter(p => 
          p.profile?.medical_conditions && p.profile.medical_conditions.length > 0
        ).length
      };
    } catch (error) {
      console.error('Error fetching patients stats:', error);
      throw new Error('Error al obtener estadísticas de pacientes');
    }
  }

  // Calcular IMC
  calculateBMI(weight: number, height: number): number {
    if (!weight || !height) return 0;
    return weight / Math.pow(height / 100, 2);
  }

  // Obtener categoría de IMC
  getBMICategory(bmi: number): { text: string; class: string } {
    if (bmi < 18.5) return { text: 'Bajo peso', class: 'text-info' };
    if (bmi < 25) return { text: 'Normal', class: 'text-success' };
    if (bmi < 30) return { text: 'Sobrepeso', class: 'text-warning' };
    return { text: 'Obesidad', class: 'text-danger' };
  }

  // Calcular edad
  calculateAge(birthDate: string): number {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  }

  // Formatear género
  formatGender(gender?: string): string {
    switch (gender) {
      case 'male': return 'Masculino';
      case 'female': return 'Femenino';
      case 'other': return 'Otro';
      default: return 'No especificado';
    }
  }
}

export const patientsService = new PatientsService();
export default patientsService; 