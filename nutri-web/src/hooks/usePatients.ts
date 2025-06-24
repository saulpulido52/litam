import { useState, useEffect, useCallback } from 'react';
import patientsService from '../services/patientsService';
import authService from '../services/authService';
import type { 
  Patient, 
  CreatePatientRequest, 
  UpdatePatientRequest,
  PatientAppointment,
  PatientProgress
} from '../services/patientsService';

interface PatientsStats {
  total: number;
  active: number;
  new: number;
  withConditions: number;
}

interface UsePatientsReturn {
  // State
  patients: Patient[];
  selectedPatient: Patient | null;
  loading: boolean;
  error: string | null;
  stats: PatientsStats;
  
  // Actions
  refreshPatients: () => Promise<void>;
  createPatient: (patientData: CreatePatientRequest) => Promise<Patient>;
  updatePatient: (patientId: string, patientData: UpdatePatientRequest) => Promise<Patient>;
  deletePatient: (patientId: string) => Promise<void>;
  selectPatient: (patient: Patient | null) => void;
  searchPatients: (searchTerm: string) => Promise<Patient[]>;
  
  // Utilities
  clearError: () => void;
  setError: (error: string) => void;
}

export const usePatients = (): UsePatientsReturn => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setErrorState] = useState<string | null>(null);
  const [stats, setStats] = useState<PatientsStats>({
    total: 0,
    active: 0,
    new: 0,
    withConditions: 0
  });

  // Limpiar error
  const clearError = useCallback(() => {
    setErrorState(null);
  }, []);

  // Establecer error
  const setError = useCallback((error: string) => {
    setErrorState(error);
  }, []);

  // Cargar pacientes
  const refreshPatients = useCallback(async () => {
    let isMounted = true;
    
    try {
      setLoading(true);
      setErrorState(null);
      
      // Verificar autenticación antes de hacer llamadas
      const isAuth = authService.isAuthenticated();
      if (!isAuth) {
        console.warn('⚠️ Usuario no autenticado. Redirigiendo...');
        throw new Error('Sesión expirada. Por favor, inicia sesión nuevamente.');
      }
      
      // Solo una llamada - getPatientsStats ya incluye getMyPatients internamente
      const patientsData = await patientsService.getMyPatients();
      
      if (isMounted) {
        // Verificar integridad de los datos
        const validPatients = patientsData.filter(patient => {
          if (!patient.id || !patient.first_name) {
            console.warn('⚠️ Paciente con datos incompletos detectado:', patient);
            return false;
          }
          return true;
        });
        
        console.log(`✅ Cargados ${validPatients.length} pacientes válidos de ${patientsData.length} totales`);
        setPatients(validPatients);
        
        // Calcular estadísticas localmente
        const stats: PatientsStats = {
          total: validPatients.length,
          active: validPatients.filter(p => p.is_active).length,
          new: validPatients.filter(p => {
            const created = new Date(p.created_at);
            const now = new Date();
            return created.getMonth() === now.getMonth() && created.getFullYear() === now.getFullYear();
          }).length,
          withConditions: validPatients.filter(p => 
            p.profile?.medical_conditions && p.profile.medical_conditions.length > 0
          ).length
        };
        setStats(stats);
      }
    } catch (err: any) {
      if (isMounted) {
        // Si es un error de autenticación o acceso, limpiar datos
        if (err.message.includes('autenticado') || err.message.includes('Sesión expirada')) {
          console.warn('🔐 Problema de autenticación detectado. Limpiando sesión...');
          authService.logout();
          localStorage.clear();
          window.location.href = '/login';
          return;
        }
        
        const errorMessage = err.message || 'Error al cargar los pacientes';
        setErrorState(errorMessage);
        console.error('❌ Error loading patients:', err);
      }
    } finally {
      if (isMounted) {
        setLoading(false);
      }
    }
  }, []);

  // Crear paciente
  const createPatient = useCallback(async (patientData: CreatePatientRequest): Promise<Patient> => {
    try {
      setLoading(true);
      setErrorState(null);
      
      console.log('👥 usePatients: Creando nuevo paciente...');
      const newPatient = await patientsService.createPatient(patientData);
      console.log('✅ usePatients: Paciente creado:', newPatient);
      
      // Refresco completo desde el servidor para asegurar consistencia
      console.log('🔄 usePatients: Refrescando lista completa desde el servidor...');
      await refreshPatients();
      
      console.log('✅ usePatients: Lista actualizada exitosamente');
      return newPatient;
    } catch (err: any) {
      const errorMessage = err.message || 'Error al crear el paciente';
      setErrorState(errorMessage);
      console.error('❌ usePatients: Error creando paciente:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [refreshPatients]);

  // Actualizar paciente
  const updatePatient = useCallback(async (patientId: string, patientData: UpdatePatientRequest): Promise<Patient> => {
    try {
      setLoading(true);
      setErrorState(null);
      
      const updatedPatient = await patientsService.updatePatient(patientId, patientData);
      
      // Actualizar la lista local
      setPatients(prev => 
        prev.map(patient => 
          patient.id === patientId ? updatedPatient : patient
        )
      );
      
      // Si es el paciente seleccionado, actualizar también
      if (selectedPatient && selectedPatient.id === patientId) {
        setSelectedPatient(updatedPatient);
      }
      
      return updatedPatient;
    } catch (err: any) {
      const errorMessage = err.message || 'Error al actualizar el paciente';
      setErrorState(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [selectedPatient]);

  // Eliminar paciente
  const deletePatient = useCallback(async (patientId: string): Promise<void> => {
    try {
      setLoading(true);
      setErrorState(null);
      
      await patientsService.deletePatient(patientId);
      
      // Remover de la lista local
      setPatients(prev => prev.filter(patient => patient.id !== patientId));
      
      // Actualizar estadísticas
      setStats(prev => ({
        ...prev,
        total: Math.max(0, prev.total - 1)
      }));
      
      // Si era el paciente seleccionado, limpiar selección
      if (selectedPatient && selectedPatient.id === patientId) {
        setSelectedPatient(null);
      }
    } catch (err: any) {
      console.error('❌ Error in deletePatient:', err);
      
      // Handle stale data scenario
      if (err.message?.includes('ya no está en tu lista') || err.message?.includes('actualizará automáticamente')) {
        console.warn('⚠️ Stale data detected. Refreshing patient list...');
        // Force refresh the patient list
        await refreshPatients();
        // Remove from local list anyway since it's not there anymore
        setPatients(prev => prev.filter(patient => patient.id !== patientId));
        if (selectedPatient && selectedPatient.id === patientId) {
          setSelectedPatient(null);
        }
        // Don't throw error since the patient was effectively "removed"
        return;
      }
      
      const errorMessage = err.message || 'Error al eliminar el paciente';
      setErrorState(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [selectedPatient, refreshPatients]);

  // Seleccionar paciente
  const selectPatient = useCallback((patient: Patient | null) => {
    setSelectedPatient(patient);
  }, []);

  // Buscar pacientes
  const searchPatients = useCallback(async (searchTerm: string): Promise<Patient[]> => {
    try {
      setErrorState(null);
      
      if (!searchTerm.trim()) {
        return patients;
      }
      
      const results = await patientsService.searchPatients(searchTerm);
      return results;
    } catch (err: any) {
      const errorMessage = err.message || 'Error al buscar pacientes';
      setErrorState(errorMessage);
      return [];
    }
  }, [patients]);

  // Cargar pacientes al montar el componente (solo si está autenticado)
  useEffect(() => {
    let isMounted = true;
    
    const loadPatientsOnMount = async () => {
      console.log('👥 usePatients: Component mounted, checking auth...');
      const isAuth = authService.isAuthenticated();
      console.log('👥 usePatients: isAuthenticated =', isAuth);
      
      if (isAuth && isMounted) {
        console.log('👥 usePatients: User authenticated, loading patients...');
        await refreshPatients();
      } else {
        console.log('👥 usePatients: User not authenticated, skipping patient load');
      }
    };
    
    loadPatientsOnMount();
    
    return () => {
      isMounted = false;
    };
  }, []); // Solo ejecutar una vez al montar

  return {
    // State
    patients,
    selectedPatient,
    loading,
    error,
    stats,
    
    // Actions
    refreshPatients,
    createPatient,
    updatePatient,
    deletePatient,
    selectPatient,
    searchPatients,
    
    // Utilities
    clearError,
    setError
  };
};

// Hook específico para obtener citas de un paciente
export const usePatientAppointments = (patientId: string | null) => {
  const [appointments, setAppointments] = useState<PatientAppointment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAppointments = useCallback(async () => {
    if (!patientId) {
      setAppointments([]);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data = await patientsService.getPatientAppointments(patientId);
      setAppointments(data);
    } catch (err: any) {
      setError(err.message || 'Error al cargar las citas');
    } finally {
      setLoading(false);
    }
  }, [patientId]);

  useEffect(() => {
    let isMounted = true;
    
    const loadAppointments = async () => {
      console.log('📅 usePatientAppointments: Effect triggered, patientId =', patientId);
      const isAuth = authService.isAuthenticated();
      console.log('📅 usePatientAppointments: isAuthenticated =', isAuth);
      
      if (isAuth && patientId && isMounted) {
        console.log('📅 usePatientAppointments: Fetching appointments for patient:', patientId);
        await fetchAppointments();
      } else {
        console.log('📅 usePatientAppointments: Skipping fetch - auth:', isAuth, 'patientId:', patientId);
      }
    };
    
    loadAppointments();
    
    return () => {
      isMounted = false;
    };
  }, [patientId]); // Solo depender de patientId

  return { appointments, loading, error, refreshAppointments: fetchAppointments };
};

// Hook específico para obtener progreso de un paciente
export const usePatientProgress = (patientId: string | null) => {
  const [progress, setProgress] = useState<PatientProgress[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProgress = useCallback(async () => {
    if (!patientId) {
      setProgress([]);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data = await patientsService.getPatientProgress(patientId);
      setProgress(data);
    } catch (err: any) {
      setError(err.message || 'Error al cargar el progreso');
    } finally {
      setLoading(false);
    }
  }, [patientId]);

  const addProgress = useCallback(async (progressData: Omit<PatientProgress, 'id'>) => {
    if (!patientId) return null;

    try {
      setError(null);
      const newProgress = await patientsService.addPatientProgress(patientId, progressData);
      setProgress(prev => [newProgress, ...prev]);
      return newProgress;
    } catch (err: any) {
      setError(err.message || 'Error al agregar progreso');
      throw err;
    }
  }, [patientId]);

  useEffect(() => {
    let isMounted = true;
    
    const loadProgress = async () => {
      console.log('📈 usePatientProgress: Effect triggered, patientId =', patientId);
      const isAuth = authService.isAuthenticated();
      console.log('📈 usePatientProgress: isAuthenticated =', isAuth);
      
      if (isAuth && patientId && isMounted) {
        console.log('📈 usePatientProgress: Fetching progress for patient:', patientId);
        await fetchProgress();
      } else {
        console.log('📈 usePatientProgress: Skipping fetch - auth:', isAuth, 'patientId:', patientId);
      }
    };
    
    loadProgress();
    
    return () => {
      isMounted = false;
    };
  }, [patientId]); // Solo depender de patientId

  return { 
    progress, 
    loading, 
    error, 
    refreshProgress: fetchProgress, 
    addProgress 
  };
};

export default usePatients; 