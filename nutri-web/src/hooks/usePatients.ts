import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import patientsService from '../services/patientsService';
import authService from '../services/authService';
import type { 
  Patient, 
  CreatePatientRequest, 
  UpdatePatientRequest,
  PatientAppointment,
  PatientProgress
} from '../services/patientsService';

// Tipos optimizados
interface PatientsStats {
  total: number;
  active: number;
  new: number;
  withConditions: number;
}

interface PatientsState {
  patients: Patient[];
  selectedPatient: Patient | null;
  loading: boolean;
  error: string | null;
  stats: PatientsStats;
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

// Hook optimizado para pacientes
export const usePatients = (): UsePatientsReturn => {
  // Estados consolidados
  const [state, setState] = useState<PatientsState>({
    patients: [],
    selectedPatient: null,
    loading: false,
    error: null,
    stats: {
    total: 0,
    active: 0,
    new: 0,
    withConditions: 0
    }
  });

  // Refs para control de montaje y timeouts
  const isMountedRef = useRef(true);
  const searchTimeoutRef = useRef<number | null>(null);
  const lastFetchTimeRef = useRef(0);

  // Log de depuración para cambios de estado - REDUCIDO
  useEffect(() => {
    // Solo loggear cuando hay errores o cambios importantes
    if (state.error || state.loading) {
      console.log('🔍 [usePatients] Estado actualizado:', {
        patientsCount: state.patients.length,
        loading: state.loading,
        error: state.error,
        stats: state.stats,
        timestamp: new Date().toISOString()
      });
    }
  }, [state]);

  // Log de depuración para montaje/desmontaje - REDUCIDO
  useEffect(() => {
    // console.log('🔍 [usePatients] Componente montado');
    isMountedRef.current = true;
    
    return () => {
      // console.log('🔍 [usePatients] Componente desmontado');
      isMountedRef.current = false;
      if (searchTimeoutRef.current) {
        // console.log('🔍 [usePatients] Limpiando timeout de búsqueda');
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  // Actualizar estado de forma optimizada
  const updateState = useCallback((updates: Partial<PatientsState>) => {
    if (isMountedRef.current) {
      setState(prev => ({ ...prev, ...updates }));
    }
  }, []);

  // Limpiar error
  const clearError = useCallback(() => {
    console.log('🔍 [usePatients] Limpiando error');
    updateState({ error: null });
  }, [updateState]);

  // Establecer error
  const setError = useCallback((error: string) => {
    console.log('🔍 [usePatients] Estableciendo error:', error);
    updateState({ error });
  }, [updateState]);

  // Cargar pacientes con optimizaciones
  const refreshPatients = useCallback(async () => {
    // console.log('🔍 [usePatients] Iniciando refreshPatients...');
    
    if (!isMountedRef.current) {
      // console.log('🔍 [usePatients] Componente desmontado, cancelando refresh');
      return;
    }

    // Evitar múltiples llamadas simultáneas
    const now = Date.now();
    if (now - lastFetchTimeRef.current < 1000) {
      // console.log('⏭️ Skipping fetch - too soon since last call');
      return;
    }
    lastFetchTimeRef.current = now;

    try {
      updateState({ loading: true, error: null });
      
      // Verificar autenticación antes de hacer llamadas
      const isAuth = authService.isAuthenticated();
      if (!isAuth) {
        console.warn('⚠️ Usuario no autenticado. Redirigiendo...');
        throw new Error('Sesión expirada. Por favor, inicia sesión nuevamente.');
      }
      
      // Solo una llamada - getMyPatients ya incluye getPatientsStats internamente
      const patientsData = await patientsService.getMyPatients();
      
      if (isMountedRef.current) {
        // Verificar integridad de los datos
        const validPatients = patientsData.filter(patient => {
          if (!patient.id || !patient.first_name) {
            console.warn('⚠️ Paciente con datos incompletos detectado:', patient);
            return false;
          }
          return true;
        });
        
        console.log(`✅ Cargados ${validPatients.length} pacientes válidos de ${patientsData.length} totales`);
        
        // Calcular estadísticas de forma optimizada
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

        updateState({
          patients: validPatients,
          stats,
          loading: false
        });
      }
    } catch (err: any) {
      if (isMountedRef.current) {
        // Si es un error de autenticación o acceso, limpiar datos
        // Manejo específico de errores
        if (err.message.includes('autenticado') || err.message.includes('Sesión expirada')) {
          console.warn('🔐 Problema de autenticación detectado. Limpiando sesión...');
          authService.logout();
          localStorage.clear();
          window.location.href = '/login';
          return;
        }
        
        // Manejo específico de errores 500 (problemas del servidor)
        if (err.response?.status === 500) {
          const errorMessage = 'Error del servidor. Por favor, inténtalo más tarde.';
          updateState({ error: errorMessage, loading: false });
          console.warn('🚨 Server error (500) loading patients:', err.message);
          return;
        }
        
        const errorMessage = err.message || 'Error al cargar los pacientes';
        updateState({ error: errorMessage, loading: false });
        console.error('❌ Error loading patients:', err);
      }
    }
  }, [updateState]);

  // Crear paciente optimizado
  const createPatient = useCallback(async (patientData: CreatePatientRequest): Promise<Patient> => {
    console.log('🔍 [usePatients] Iniciando createPatient con datos:', patientData);
    
    if (!isMountedRef.current) {
      throw new Error('Componente desmontado');
    }

    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const newPatient = await patientsService.createPatient(patientData);
      console.log('🔍 [usePatients] Paciente creado exitosamente:', newPatient);

      if (!isMountedRef.current) {
        console.log('🔍 [usePatients] Componente desmontado después de crear paciente');
        return newPatient;
      }

      setState(prev => {
        console.log('🔍 [usePatients] Agregando nuevo paciente al estado');
        return {
          ...prev,
          patients: [newPatient, ...prev.patients],
          loading: false
        };
      });

      return newPatient;
    } catch (err: any) {
      const errorMessage = err.message || 'Error al crear el paciente';
      updateState({ error: errorMessage, loading: false });
      throw new Error(errorMessage);
    }
  }, [updateState]);

  // Actualizar paciente optimizado
  const updatePatient = useCallback(async (patientId: string, patientData: UpdatePatientRequest): Promise<Patient> => {
    console.log('🔍 [usePatients] Iniciando updatePatient:', { patientId, patientData });
    
    if (!isMountedRef.current) {
      throw new Error('Componente desmontado');
    }

    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const updatedPatient = await patientsService.updatePatient(patientId, patientData);
      console.log('🔍 [usePatients] Paciente actualizado exitosamente:', updatedPatient);

      if (!isMountedRef.current) {
        console.log('🔍 [usePatients] Componente desmontado después de actualizar paciente');
        return updatedPatient;
      }

      setState(prev => {
        console.log('🔍 [usePatients] Actualizando paciente en el estado');
        return {
          ...prev,
          patients: prev.patients.map(p => p.id === patientId ? updatedPatient : p),
          selectedPatient: prev.selectedPatient?.id === patientId ? updatedPatient : prev.selectedPatient,
          loading: false
        };
      });
      
      return updatedPatient;
    } catch (err: any) {
      const errorMessage = err.message || 'Error al actualizar el paciente';
      updateState({ error: errorMessage, loading: false });
      throw new Error(errorMessage);
    }
  }, [updateState]);

  // Eliminar paciente optimizado
  const deletePatient = useCallback(async (patientId: string): Promise<void> => {
    console.log('🔍 [usePatients] Iniciando deletePatient:', patientId);
    
    if (!isMountedRef.current) {
      throw new Error('Componente desmontado');
    }

    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      await patientsService.deletePatient(patientId);
      console.log('🔍 [usePatients] Paciente eliminado exitosamente');

      if (!isMountedRef.current) {
        console.log('🔍 [usePatients] Componente desmontado después de eliminar paciente');
        return;
      }
      
      setState(prev => {
        console.log('🔍 [usePatients] Eliminando paciente del estado');
        return {
          ...prev,
          patients: prev.patients.filter(p => p.id !== patientId),
          selectedPatient: prev.selectedPatient?.id === patientId ? null : prev.selectedPatient,
          loading: false
        };
      });
    } catch (err: any) {
      const errorMessage = err.message || 'Error al eliminar el paciente';
      updateState({ error: errorMessage, loading: false });
      throw new Error(errorMessage);
    }
  }, [updateState]);

  // Seleccionar paciente
  const selectPatient = useCallback((patient: Patient | null) => {
    console.log('🔍 [usePatients] Seleccionando paciente:', patient ? { id: patient.id, name: `${patient.first_name} ${patient.last_name}` } : null);
    updateState({ selectedPatient: patient });
  }, [updateState]);

  // Buscar pacientes con debouncing
  const searchPatients = useCallback(async (searchTerm: string): Promise<Patient[]> => {
    console.log('🔍 [usePatients] Iniciando búsqueda:', searchTerm);
      
    if (searchTimeoutRef.current) {
      console.log('🔍 [usePatients] Cancelando búsqueda anterior');
      clearTimeout(searchTimeoutRef.current);
      }
      
    return new Promise((resolve) => {
      searchTimeoutRef.current = window.setTimeout(async () => {
        try {
          console.log('🔍 [usePatients] Ejecutando búsqueda...');
      const results = await patientsService.searchPatients(searchTerm);
          console.log('🔍 [usePatients] Resultados de búsqueda:', {
            searchTerm,
            count: results.length,
            results: results.map(p => ({ id: p.id, name: `${p.first_name} ${p.last_name}` }))
          });
          resolve(results);
    } catch (err: any) {
      const errorMessage = err.message || 'Error al buscar pacientes';
          updateState({ error: errorMessage });
          resolve([]);
    }
      }, 300);
    });
  }, [updateState]);

  // Cargar pacientes al montar el componente (solo si está autenticado)
  useEffect(() => {
    console.log('🔍 [usePatients] Efecto de carga inicial ejecutándose');
    const loadPatientsOnMount = async () => {
      console.log('🔍 [usePatients] Iniciando carga inicial de pacientes');
      const isAuth = authService.isAuthenticated();
      console.log('👥 usePatients: isAuthenticated =', isAuth);
      
      if (isAuth && isMountedRef.current) {
        console.log('👥 usePatients: User authenticated, loading patients...');
        await refreshPatients();
      } else {
        console.log('👥 usePatients: User not authenticated, skipping patient load');
      }
    };
    
    loadPatientsOnMount();
  }, [refreshPatients]);

  // Memoizar valores de retorno para evitar re-renders innecesarios
  const returnValue = useMemo(() => ({
    // State
    patients: state.patients,
    selectedPatient: state.selectedPatient,
    loading: state.loading,
    error: state.error,
    stats: state.stats,
    
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
  }), [
    state.patients,
    state.selectedPatient,
    state.loading,
    state.error,
    state.stats,
    refreshPatients,
    createPatient,
    updatePatient,
    deletePatient,
    selectPatient,
    searchPatients,
    clearError,
    setError
  ]);

  return returnValue;
};

// Hook optimizado para citas de pacientes
export const usePatientAppointments = (patientId: string | null) => {
  const [appointments, setAppointments] = useState<PatientAppointment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const loadAppointments = useCallback(async () => {
    if (!patientId) return;

    try {
      setLoading(true);
      setError(null);
      const appointmentsData = await patientsService.getPatientAppointments(patientId);
      setAppointments(appointmentsData);
    } catch (err: any) {
      setError(err.message || 'Error al cargar las citas');
    } finally {
      setLoading(false);
    }
  }, [patientId]);

  useEffect(() => {
    loadAppointments();
  }, [loadAppointments]);

  return { appointments, loading, error, refreshAppointments: loadAppointments };
};

// Hook optimizado para progreso de pacientes
export const usePatientProgress = (patientId: string | null) => {
  const [progress, setProgress] = useState<PatientProgress[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const loadProgress = useCallback(async () => {
    if (!patientId) return;

    try {
      setLoading(true);
      setError(null);
      const progressData = await patientsService.getPatientProgress(patientId);
      setProgress(progressData);
    } catch (err: any) {
      setError(err.message || 'Error al cargar el progreso');
    } finally {
      setLoading(false);
    }
  }, [patientId]);

  useEffect(() => {
    loadProgress();
  }, [loadProgress]);

  return { progress, loading, error, refreshProgress: loadProgress };
};

export default usePatients; 