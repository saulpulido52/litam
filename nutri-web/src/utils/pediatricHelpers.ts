/**
 * Funciones de utilidad para identificar y manejar pacientes pediátricos
 */

export interface PediatricInfo {
  isPediatric: boolean;
  ageInMonths: number | null;
  ageInYears: number | null;
  growthChartsAvailable: {
    WHO: boolean;
    CDC: boolean;
  };
  category: 'infant' | 'toddler' | 'preschool' | 'school-age' | 'adolescent' | 'adult' | null;
}

/**
 * Calcula la edad en meses desde la fecha de nacimiento
 */
export function calculateAgeInMonths(birthDate: string | Date): number | null {
  if (!birthDate) return null;
  
  const birth = new Date(birthDate);
  const today = new Date();
  
  if (isNaN(birth.getTime())) return null;
  
  const yearsDiff = today.getFullYear() - birth.getFullYear();
  const monthsDiff = today.getMonth() - birth.getMonth();
  const daysDiff = today.getDate() - birth.getDate();
  
  let ageInMonths = yearsDiff * 12 + monthsDiff;
  
  // Ajustar si el día actual es antes del día de nacimiento
  if (daysDiff < 0) {
    ageInMonths--;
  }
  
  return ageInMonths >= 0 ? ageInMonths : null;
}

/**
 * Calcula la edad en años desde la fecha de nacimiento
 */
export function calculateAgeInYears(birthDate: string | Date): number | null {
  const months = calculateAgeInMonths(birthDate);
  if (months === null) return null;
  return Math.floor(months / 12);
}

/**
 * Determina si un paciente es pediátrico y qué gráficos están disponibles
 */
export function getPediatricInfo(birthDate: string | Date | null): PediatricInfo {
  const ageInMonths = birthDate ? calculateAgeInMonths(birthDate) : null;
  const ageInYears = ageInMonths !== null ? Math.floor(ageInMonths / 12) : null;
  
  // Determinar si es pediátrico (menor de 18 años - hasta 17 años inclusive)
  const isPediatric = ageInYears !== null && ageInYears < 18;
  
  // Determinar disponibilidad de gráficos de crecimiento
  const growthChartsAvailable = {
    WHO: ageInMonths !== null && ageInMonths >= 0 && ageInMonths <= 60, // 0-5 años
    CDC: ageInMonths !== null && ageInMonths >= 24 && ageInMonths <= 240 // 2-20 años (datos disponibles)
  };
  
  // Determinar categoría de edad
  let category: PediatricInfo['category'] = null;
  if (ageInMonths !== null) {
    if (ageInMonths < 12) {
      category = 'infant'; // 0-11 meses
    } else if (ageInMonths < 36) {
      category = 'toddler'; // 1-2 años
    } else if (ageInMonths < 72) {
      category = 'preschool'; // 3-5 años
    } else if (ageInMonths < 144) {
      category = 'school-age'; // 6-11 años
    } else if (ageInMonths < 216) {
      category = 'adolescent'; // 12-17 años
    } else {
      category = 'adult'; // 18+ años
    }
  }
  
  return {
    isPediatric,
    ageInMonths,
    ageInYears,
    growthChartsAvailable,
    category
  };
}

/**
 * Obtiene una descripción amigable de la edad
 */
export function getAgeDescription(ageInMonths: number | null): string {
  if (ageInMonths === null) return 'Edad desconocida';
  
  if (ageInMonths < 1) {
    return 'Recién nacido';
  } else if (ageInMonths < 12) {
    return `${ageInMonths} ${ageInMonths === 1 ? 'mes' : 'meses'}`;
  } else if (ageInMonths < 24) {
    const years = Math.floor(ageInMonths / 12);
    const months = ageInMonths % 12;
    if (months === 0) {
      return `${years} año`;
    }
    return `${years} año${months > 0 ? ` y ${months} ${months === 1 ? 'mes' : 'meses'}` : ''}`;
  } else {
    const years = Math.floor(ageInMonths / 12);
    return `${years} años`;
  }
}

/**
 * Obtiene el color del badge según la categoría
 */
export function getCategoryBadgeColor(category: PediatricInfo['category']): string {
  switch (category) {
    case 'infant':
      return 'info';
    case 'toddler':
      return 'primary';
    case 'preschool':
      return 'warning';
    case 'school-age':
      return 'success';
    case 'adolescent':
      return 'secondary';
    case 'adult':
      return 'dark';
    default:
      return 'light';
  }
}

/**
 * Obtiene el nombre de la categoría en español
 */
export function getCategoryName(category: PediatricInfo['category']): string {
  switch (category) {
    case 'infant':
      return 'Lactante';
    case 'toddler':
      return 'Niño pequeño';
    case 'preschool':
      return 'Preescolar';
    case 'school-age':
      return 'Escolar';
    case 'adolescent':
      return 'Adolescente';
    case 'adult':
      return 'Adulto';
    default:
      return 'Sin categoría';
  }
} 