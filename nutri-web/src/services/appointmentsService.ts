import apiService from './api';

// Interfaces para el sistema de citas
export interface AppointmentType {
  id: string;
  patient_id: string;
  nutritionist_id: string;
  start_time: string;
  end_time: string;
  status: 'scheduled' | 'completed' | 'cancelled_by_patient' | 'cancelled_by_nutritionist' | 'rescheduled' | 'no_show';
  notes?: string;
  meeting_link?: string;
  patient?: {
    id: string;
    email: string;
    first_name: string;
    last_name: string;
    phone?: string;
  };
  nutritionist?: {
    id: string;
    email: string;
    first_name: string;
    last_name: string;
  };
  created_at: string;
  updated_at: string;
}

export interface AvailabilitySlot {
  day_of_week: 'MONDAY' | 'TUESDAY' | 'WEDNESDAY' | 'THURSDAY' | 'FRIDAY' | 'SATURDAY' | 'SUNDAY';
  start_time_minutes: number;
  end_time_minutes: number;
  is_active: boolean;
}

export interface AvailabilitySlotFromBackend extends AvailabilitySlot {
  id?: string;
  created_at?: string;
  updated_at?: string;
  nutritionist?: any;
}

export interface CreateAppointmentDto {
  nutritionistId: string;
  startTime: string; // ISO 8601 format
  endTime: string;   // ISO 8601 format
  notes?: string;
  meetingLink?: string;
}

export interface CreateAppointmentForPatientDto {
  patientId: string;
  startTime: string; // ISO 8601 format
  endTime: string;   // ISO 8601 format
  notes?: string;
  meetingLink?: string;
}

export interface UpdateAppointmentStatusDto {
  status: 'scheduled' | 'completed' | 'cancelled_by_patient' | 'cancelled_by_nutritionist' | 'rescheduled' | 'no_show';
  notes?: string;
}

export interface ManageAvailabilityDto {
  slots: AvailabilitySlot[];
}

export interface SearchAvailabilityDto {
  date?: string; // YYYY-MM-DD format
  dayOfWeek?: 'MONDAY' | 'TUESDAY' | 'WEDNESDAY' | 'THURSDAY' | 'FRIDAY' | 'SATURDAY' | 'SUNDAY';
}

export interface AvailableSlot {
  time: string; // HH:MM format
  start_time: string; // ISO string
  end_time: string; // ISO string
  duration_minutes: number;
}

class AppointmentsService {
  
  // ==================== GESTIÓN DE DISPONIBILIDAD ====================
  
  /**
   * Gestionar disponibilidad del nutriólogo (Solo nutriólogos)
   */
  async manageAvailability(availabilityData: ManageAvailabilityDto): Promise<AvailabilitySlot[]> {
    try {
      const response = await apiService.post<{ availability: AvailabilitySlot[] }>('/appointments/availability', availabilityData);
      
      if (response.status !== 'success' || !response.data) {
        throw new Error(response.message || 'Error al gestionar disponibilidad');
      }
      
      return response.data.availability;
    } catch (error: any) {
      console.error('Error managing availability:', error);
      const message = error.response?.data?.message || 'Error al gestionar disponibilidad';
      throw new Error(message);
    }
  }

  /**
   * Obtener mi disponibilidad (Solo nutriólogos)
   */
  async getMyAvailability(): Promise<AvailabilitySlot[]> {
    try {
      const response = await apiService.get<{ availability: AvailabilitySlotFromBackend[] }>('/appointments/availability');
      
      if (response.status !== 'success' || !response.data) {
        throw new Error(response.message || 'Error al obtener disponibilidad');
      }
      
      // Limpiar los datos del backend - solo devolver los campos que necesita el frontend
      return response.data.availability.map(slot => ({
        day_of_week: slot.day_of_week,
        start_time_minutes: slot.start_time_minutes,
        end_time_minutes: slot.end_time_minutes,
        is_active: slot.is_active
      }));
    } catch (error: any) {
      console.error('Error fetching my availability:', error);
      const message = error.response?.data?.message || 'Error al obtener disponibilidad';
      throw new Error(message);
    }
  }

  /**
   * Buscar disponibilidad de un nutriólogo específico
   */
  async searchNutritionistAvailability(nutritionistId: string, searchParams?: SearchAvailabilityDto): Promise<AvailabilitySlot[]> {
    try {
      const queryParams = new URLSearchParams();
      if (searchParams?.date) queryParams.append('date', searchParams.date);
      if (searchParams?.dayOfWeek) queryParams.append('dayOfWeek', searchParams.dayOfWeek);

      const url = `/appointments/availability/${nutritionistId}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      const response = await apiService.get<{ availability: AvailabilitySlot[] }>(url);
      
      if (response.status !== 'success' || !response.data) {
        throw new Error(response.message || 'Error al buscar disponibilidad');
      }
      
      return response.data.availability;
    } catch (error: any) {
      console.error('Error searching nutritionist availability:', error);
      const message = error.response?.data?.message || 'Error al buscar disponibilidad del nutriólogo';
      throw new Error(message);
    }
  }

  /**
   * Obtener citas existentes de un nutriólogo por rango de fechas
   */
  async getNutritionistAppointmentsByDateRange(nutritionistId: string, startDate: string, endDate: string): Promise<AppointmentType[]> {
    try {
      const queryParams = new URLSearchParams();
      queryParams.append('startDate', startDate);
      queryParams.append('endDate', endDate);

      const url = `/appointments/nutritionist/${nutritionistId}/appointments?${queryParams.toString()}`;
      const response = await apiService.get<{ appointments: AppointmentType[] }>(url);
      
      if (response.status !== 'success' || !response.data) {
        throw new Error(response.message || 'Error al obtener citas');
      }
      
      return response.data.appointments;
    } catch (error: any) {
      console.error('Error getting nutritionist appointments by date range:', error);
      const message = error.response?.data?.message || 'Error al obtener citas del nutriólogo';
      throw new Error(message);
    }
  }

  /**
   * Obtener slots disponibles para una fecha específica
   */
  async getAvailableSlots(nutritionistId: string, date: string): Promise<AvailableSlot[]> {
    try {
      const queryParams = new URLSearchParams();
      queryParams.append('date', date);

      const url = `/appointments/nutritionist/${nutritionistId}/available-slots?${queryParams.toString()}`;
      const response = await apiService.get<{ availableSlots: AvailableSlot[] }>(url);
      
      if (response.status !== 'success' || !response.data) {
        throw new Error(response.message || 'Error al obtener slots disponibles');
      }
      
      return response.data.availableSlots;
    } catch (error: any) {
      console.error('Error getting available slots:', error);
      const message = error.response?.data?.message || 'Error al obtener horarios disponibles';
      throw new Error(message);
    }
  }

  // ==================== GESTIÓN DE CITAS ====================

  /**
   * Agendar una nueva cita (Solo pacientes)
   */
  async scheduleAppointment(appointmentData: CreateAppointmentDto): Promise<AppointmentType> {
    try {
      const response = await apiService.post<{ appointment: AppointmentType }>('/appointments/schedule', appointmentData);
      
      if (response.status !== 'success' || !response.data) {
        throw new Error(response.message || 'Error al agendar cita');
      }
      
      return response.data.appointment;
    } catch (error: any) {
      console.error('Error scheduling appointment:', error);
      const message = error.response?.data?.message || 'Error al agendar cita';
      throw new Error(message);
    }
  }

  /**
   * Agendar una cita para un paciente (Solo nutriólogos)
   */
  async scheduleAppointmentForPatient(appointmentData: CreateAppointmentForPatientDto): Promise<AppointmentType> {
    try {
      const response = await apiService.post<{ appointment: AppointmentType }>('/appointments/schedule-for-patient', appointmentData);
      
      if (response.status !== 'success' || !response.data) {
        throw new Error(response.message || 'Error al agendar cita');
      }
      
      return response.data.appointment;
    } catch (error: any) {
      console.error('Error scheduling appointment for patient:', error);
      const message = error.response?.data?.message || 'Error al agendar cita para el paciente';
      throw new Error(message);
    }
  }

  /**
   * Obtener mis citas (Pacientes y nutriólogos)
   */
  async getMyAppointments(): Promise<AppointmentType[]> {
    try {
      const response = await apiService.get<{ appointments: AppointmentType[] }>('/appointments/my-appointments');
      
      if (response.status !== 'success' || !response.data) {
        throw new Error(response.message || 'Error al obtener citas');
      }
      
      return response.data.appointments;
    } catch (error: any) {
      console.error('Error fetching my appointments:', error);
      const message = error.response?.data?.message || 'Error al obtener mis citas';
      throw new Error(message);
    }
  }

  /**
   * Actualizar estado de una cita
   */
  async updateAppointmentStatus(appointmentId: string, statusData: UpdateAppointmentStatusDto): Promise<AppointmentType> {
    try {
      const response = await apiService.patch<{ appointment: AppointmentType }>(`/appointments/${appointmentId}/status`, statusData);
      
      if (response.status !== 'success' || !response.data) {
        throw new Error(response.message || 'Error al actualizar estado de la cita');
      }
      
      return response.data.appointment;
    } catch (error: any) {
      console.error('Error updating appointment status:', error);
      const message = error.response?.data?.message || 'Error al actualizar estado de la cita';
      throw new Error(message);
    }
  }

  /**
   * Eliminar una cita completamente
   */
  async deleteAppointment(appointmentId: string): Promise<void> {
    try {
      const response = await apiService.delete(`/appointments/${appointmentId}`);
      
      if (response.status !== 'success') {
        throw new Error(response.message || 'Error al eliminar la cita');
      }
    } catch (error: any) {
      console.error('Error deleting appointment:', error);
      const message = error.response?.data?.message || 'Error al eliminar la cita';
      throw new Error(message);
    }
  }

  /**
   * Actualizar una cita completa (fecha, hora, notas)
   */
  async updateAppointment(appointmentId: string, updateData: {
    start_time?: string;
    end_time?: string;
    notes?: string;
    status?: string;
  }): Promise<AppointmentType> {
    try {
      const response = await apiService.patch<{ appointment: AppointmentType }>(`/appointments/${appointmentId}`, updateData);
      
      if (response.status !== 'success' || !response.data) {
        throw new Error(response.message || 'Error al actualizar la cita');
      }
      
      return response.data.appointment;
    } catch (error: any) {
      console.error('Error updating appointment:', error);
      const message = error.response?.data?.message || 'Error al actualizar la cita';
      throw new Error(message);
    }
  }

  // ==================== UTILIDADES ====================

  /**
   * Convertir minutos a formato HH:MM
   */
  minutesToTime(minutes: number): string {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
  }

  /**
   * Convertir formato HH:MM a minutos
   */
  timeToMinutes(time: string): number {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  }

  /**
   * Obtener el nombre del día en español
   */
  getDayName(day: string): string {
    const dayNames: Record<string, string> = {
      'MONDAY': 'Lunes',
      'TUESDAY': 'Martes',
      'WEDNESDAY': 'Miércoles',
      'THURSDAY': 'Jueves',
      'FRIDAY': 'Viernes',
      'SATURDAY': 'Sábado',
      'SUNDAY': 'Domingo'
    };
    return dayNames[day] || day;
  }

  /**
   * Formatear fecha para mostrar
   */
  formatAppointmentDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  /**
   * Verificar si una cita puede ser editada
   */
  canEditAppointment(appointment: AppointmentType): boolean {
    const appointmentDate = new Date(appointment.start_time);
    const now = new Date();
    const hoursDifference = (appointmentDate.getTime() - now.getTime()) / (1000 * 60 * 60);
    
    // Permitir edición si la cita está programada y es al menos 2 horas en el futuro
    return appointment.status === 'scheduled' && hoursDifference >= 2;
  }

  /**
   * Obtener color del estado
   */
  getStatusColor(status: string): string {
    const statusColors: Record<string, string> = {
      'scheduled': 'primary',
      'completed': 'success',
      'cancelled_by_patient': 'danger',
      'cancelled_by_nutritionist': 'danger',
      'rescheduled': 'warning',
      'no_show': 'warning'
    };
    return statusColors[status] || 'secondary';
  }

  /**
   * Obtener texto del estado en español
   */
  getStatusText(status: string): string {
    const statusTexts: Record<string, string> = {
      'scheduled': 'Programada',
      'completed': 'Completada',
      'cancelled_by_patient': 'Cancelada por paciente',
      'cancelled_by_nutritionist': 'Cancelada por nutriólogo',
      'rescheduled': 'Re-agendada',
      'no_show': 'No asistió'
    };
    return statusTexts[status] || status;
  }
}

export default new AppointmentsService();
