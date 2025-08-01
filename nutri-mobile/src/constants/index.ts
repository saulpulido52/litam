// Constantes principales para la aplicación NutriPaciente

// Configuración de la API
export const API_CONFIG = {
  BASE_URL: 'http://192.168.100.14:4000/api',
  TIMEOUT: 10000,
  RETRY_ATTEMPTS: 3,
};

// Colores del tema
export const COLORS = {
  primary: '#4A90E2',
  primaryDark: '#357ABD',
  secondary: '#50C878',
  secondaryDark: '#45B566',
  accent: '#FF6B6B',
  background: '#F8F9FA',
  surface: '#FFFFFF',
  text: '#2C3E50',
  textSecondary: '#7F8C8D',
  textLight: '#BDC3C7',
  border: '#E1E8ED',
  error: '#E74C3C',
  warning: '#F39C12',
  success: '#27AE60',
  info: '#3498DB',
  
  // Colores para gráficos
  chart: {
    primary: '#4A90E2',
    secondary: '#50C878',
    tertiary: '#FF6B6B',
    quaternary: '#F39C12',
    quinary: '#9B59B6',
  },
};

// Espaciado
export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

// Tamaños de fuente
export const FONT_SIZES = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 18,
  xl: 20,
  xxl: 24,
  xxxl: 32,
};

// Pesos de fuente
export const FONT_WEIGHTS = {
  light: '300' as const,
  regular: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
};

// Radios de borde
export const BORDER_RADIUS = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  full: 9999,
};

// Sombras
export const SHADOWS = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
};

// Traducciones
export const TRANSLATIONS = {
  es: {
    // Autenticación
    login: 'Iniciar Sesión',
    register: 'Registrarse',
    logout: 'Cerrar Sesión',
    email: 'Correo electrónico',
    password: 'Contraseña',
    firstName: 'Nombre',
    lastName: 'Apellido',
    phone: 'Teléfono',
    forgotPassword: '¿Olvidaste tu contraseña?',
    
    // Navegación
    dashboard: 'Inicio',
    appointments: 'Citas',
    dietPlans: 'Planes',
    progress: 'Progreso',
    profile: 'Perfil',
    
    // Dashboard
    welcome: 'Bienvenido',
    nextAppointment: 'Próxima Cita',
    todaysMeals: 'Comidas de Hoy',
    weeklyProgress: 'Progreso Semanal',
    
    // Citas
    scheduleAppointment: 'Agendar Cita',
    upcomingAppointments: 'Citas Próximas',
    pastAppointments: 'Citas Pasadas',
    appointmentDetails: 'Detalles de la Cita',
    
    // Planes de dieta
    activePlan: 'Plan Activo',
    mealPlan: 'Plan de Comidas',
    breakfast: 'Desayuno',
    lunch: 'Almuerzo',
    dinner: 'Cena',
    snack: 'Snack',
    
    // Progreso
    weight: 'Peso',
    bodyFat: 'Grasa Corporal',
    muscleMass: 'Masa Muscular',
    addProgress: 'Agregar Progreso',
    
    // Perfil
    personalInfo: 'Información Personal',
    medicalInfo: 'Información Médica',
    preferences: 'Preferencias',
    settings: 'Configuración',
    
    // Común
    save: 'Guardar',
    cancel: 'Cancelar',
    edit: 'Editar',
    delete: 'Eliminar',
    loading: 'Cargando...',
    error: 'Error',
    success: 'Éxito',
    confirm: 'Confirmar',
    back: 'Atrás',
    next: 'Siguiente',
    done: 'Hecho',
    
    // Errores
    networkError: 'Error de conexión',
    serverError: 'Error del servidor',
    invalidCredentials: 'Credenciales inválidas',
    loginFail: 'Correo o contraseña incorrectos',
    requiredField: 'Campo requerido',
    invalidEmail: 'Email inválido',
    passwordTooShort: 'La contraseña debe tener al menos 6 caracteres',
  },
  en: {
    // Autenticación
    login: 'Sign In',
    register: 'Sign Up',
    logout: 'Sign Out',
    email: 'Email',
    password: 'Password',
    firstName: 'First Name',
    lastName: 'Last Name',
    phone: 'Phone',
    forgotPassword: 'Forgot your password?',
    
    // Navegación
    dashboard: 'Dashboard',
    appointments: 'Appointments',
    dietPlans: 'Diet Plans',
    progress: 'Progress',
    profile: 'Profile',
    
    // Dashboard
    welcome: 'Welcome',
    nextAppointment: 'Next Appointment',
    todaysMeals: 'Today\'s Meals',
    weeklyProgress: 'Weekly Progress',
    
    // Citas
    scheduleAppointment: 'Schedule Appointment',
    upcomingAppointments: 'Upcoming Appointments',
    pastAppointments: 'Past Appointments',
    appointmentDetails: 'Appointment Details',
    
    // Planes de dieta
    activePlan: 'Active Plan',
    mealPlan: 'Meal Plan',
    breakfast: 'Breakfast',
    lunch: 'Lunch',
    dinner: 'Dinner',
    snack: 'Snack',
    
    // Progreso
    weight: 'Weight',
    bodyFat: 'Body Fat',
    muscleMass: 'Muscle Mass',
    addProgress: 'Add Progress',
    
    // Perfil
    personalInfo: 'Personal Information',
    medicalInfo: 'Medical Information',
    preferences: 'Preferences',
    settings: 'Settings',
    
    // Común
    save: 'Save',
    cancel: 'Cancel',
    edit: 'Edit',
    delete: 'Delete',
    loading: 'Loading...',
    error: 'Error',
    success: 'Success',
    confirm: 'Confirm',
    back: 'Back',
    next: 'Next',
    done: 'Done',
    
    // Errores
    networkError: 'Network error',
    serverError: 'Server error',
    invalidCredentials: 'Invalid credentials',
    loginFail: 'Incorrect email or password',
    requiredField: 'Required field',
    invalidEmail: 'Invalid email',
    passwordTooShort: 'Password must be at least 6 characters',
  },
};

// Configuración de AsyncStorage
export const STORAGE_KEYS = {
  AUTH_TOKEN: '@nutri_auth_token',
  USER_DATA: '@nutri_user_data',
  LANGUAGE: '@nutri_language',
  THEME: '@nutri_theme',
  ONBOARDING_COMPLETE: '@nutri_onboarding_complete',
};

// Configuración de Query Keys para TanStack Query
export const QUERY_KEYS = {
  USER: 'user',
  APPOINTMENTS: 'appointments',
  DIET_PLANS: 'dietPlans',
  PROGRESS: 'progress',
  MESSAGES: 'messages',
  FOODS: 'foods',
} as const;

// Configuración de mutación
export const MUTATION_KEYS = {
  LOGIN: 'login',
  REGISTER: 'register',
  LOGOUT: 'logout',
  UPDATE_PROFILE: 'updateProfile',
  CREATE_APPOINTMENT: 'createAppointment',
  UPDATE_APPOINTMENT: 'updateAppointment',
  DELETE_APPOINTMENT: 'deleteAppointment',
  ADD_PROGRESS: 'addProgress',
  SEND_MESSAGE: 'sendMessage',
} as const; 