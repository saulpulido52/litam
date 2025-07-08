// Utilidades para sincronización entre el sistema de disponibilidad y el perfil de horarios

export const timeToMinutes = (time: string): number => {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
};

export const minutesToTime = (minutes: number): string => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
};

// Mapeo entre los nombres de días del perfil y el sistema de disponibilidad
const DAY_MAPPING = {
  'monday': 'MONDAY',
  'tuesday': 'TUESDAY', 
  'wednesday': 'WEDNESDAY',
  'thursday': 'THURSDAY',
  'friday': 'FRIDAY',
  'saturday': 'SATURDAY',
  'sunday': 'SUNDAY'
} as const;

const REVERSE_DAY_MAPPING = {
  'MONDAY': 'monday',
  'TUESDAY': 'tuesday',
  'WEDNESDAY': 'wednesday', 
  'THURSDAY': 'thursday',
  'FRIDAY': 'friday',
  'SATURDAY': 'saturday',
  'SUNDAY': 'sunday'
} as const;

export interface ProfileSchedule {
  [key: string]: any; // Para los campos dinámicos como monday_active, monday_start, etc.
}

export interface AvailabilitySlot {
  day_of_week: string;
  start_time_minutes: number;
  end_time_minutes: number;
  is_active: boolean;
}

/**
 * Convierte los horarios del perfil al formato de disponibilidad
 */
export const profileToAvailability = (profileSchedule: ProfileSchedule): AvailabilitySlot[] => {
  const availability: AvailabilitySlot[] = [];
  
  Object.keys(DAY_MAPPING).forEach(profileDay => {
    const availabilityDay = DAY_MAPPING[profileDay as keyof typeof DAY_MAPPING];
    const isActive = profileSchedule[`${profileDay}_active`];
    
    if (isActive) {
      const startTime = profileSchedule[`${profileDay}_start`] || '09:00';
      const endTime = profileSchedule[`${profileDay}_end`] || '18:00';
      
      availability.push({
        day_of_week: availabilityDay,
        start_time_minutes: timeToMinutes(startTime),
        end_time_minutes: timeToMinutes(endTime),
        is_active: true
      });
    }
  });
  
  return availability;
};

/**
 * Convierte la disponibilidad al formato de horarios del perfil
 */
export const availabilityToProfile = (availability: AvailabilitySlot[]): ProfileSchedule => {
  const profileSchedule: ProfileSchedule = {};
  
  // Inicializar todos los días como inactivos
  Object.keys(DAY_MAPPING).forEach(profileDay => {
    profileSchedule[`${profileDay}_active`] = false;
    profileSchedule[`${profileDay}_start`] = '09:00';
    profileSchedule[`${profileDay}_end`] = '18:00';
    profileSchedule[`${profileDay}_type`] = 'presencial';
  });
  
  // Actualizar con los datos de disponibilidad
  availability.forEach(slot => {
    if (slot.is_active) {
      const profileDay = REVERSE_DAY_MAPPING[slot.day_of_week as keyof typeof REVERSE_DAY_MAPPING];
      if (profileDay) {
        profileSchedule[`${profileDay}_active`] = true;
        profileSchedule[`${profileDay}_start`] = minutesToTime(slot.start_time_minutes);
        profileSchedule[`${profileDay}_end`] = minutesToTime(slot.end_time_minutes);
      }
    }
  });
  
  return profileSchedule;
};

/**
 * Valida que los horarios sean consistentes
 */
export const validateSchedule = (schedule: AvailabilitySlot[]): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  schedule.forEach(slot => {
    if (slot.start_time_minutes >= slot.end_time_minutes) {
      const dayName = REVERSE_DAY_MAPPING[slot.day_of_week as keyof typeof REVERSE_DAY_MAPPING];
      errors.push(`El horario de ${dayName} debe tener una hora de inicio menor que la de fin`);
    }
    
    if (slot.start_time_minutes < 0 || slot.start_time_minutes > 1439) {
      errors.push(`Hora de inicio inválida para ${slot.day_of_week}`);
    }
    
    if (slot.end_time_minutes < 0 || slot.end_time_minutes > 1440) {
      errors.push(`Hora de fin inválida para ${slot.day_of_week}`);
    }
  });
  
  return {
    isValid: errors.length === 0,
    errors
  };
};
