<<<<<<< HEAD
import { useState, useEffect, useCallback } from 'react';
=======
import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
>>>>>>> nutri/main
import patientsService from '../services/patientsService';
import authService from '../services/authService';
import type { 
  Patient, 
  CreatePatientRequest, 
  UpdatePatientRequest,
  PatientAppointment,
  PatientProgress
} from '../services/patientsService';

<<<<<<< HEAD
=======
// Tipos optimizados
>>>>>>> nutri/main
interface PatientsStats {
  total: number;
  active: number;
  new: number;
  withConditions: number;
}

<<<<<<< HEAD
=======
interface PatientsState {
  patients: Patient[];
  selectedPatient: Patient | null;
  loading: boolean;
  error: string | null;
  stats: PatientsStats;
}

>>>>>>> nutri/main
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

<<<<<<< HEAD
export const usePatients = (): UsePatientsReturn => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setErrorState] = useState<string | null>(null);
  const [stats, setStats] = useState<PatientsStats>({
=======
// Hook optimizado para pacientes
export const usePatients = (): UsePatientsReturn => {
  // Estados consolidados
  const [state, setState] = useState<PatientsState>({
    patients: [],
    selectedPatient: null,
    loading: false,
    error: null,
    stats: {
>>>>>>> nutri/main
    total: 0,
    active: 0,
    new: 0,
    withConditions: 0
<<<<<<< HEAD
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
=======
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
>>>>>>> nutri/main
      
      // Verificar autenticación antes de hacer llamadas
      const isAuth = authService.isAuthenticated();
      if (!isAuth) {
        console.warn('⚠️ Usuario no autenticado. Redirigiendo...');
        throw new Error('Sesión expirada. Por favor, inicia sesión nuevamente.');
      }
      
<<<<<<< HEAD
      // Solo una llamada - getPatientsStats ya incluye getMyPatients internamente
      const patientsData = await patientsService.getMyPatients();
      
      if (isMounted) {
=======
      // Solo una llamada - getMyPatients ya incluye getPatientsStats internamente
      const patientsData = await patientsService.getMyPatients();
      
      if (isMountedRef.current) {
>>>>>>> nutri/main
        // Verificar integridad de los datos
        const validPatients = patientsData.filter(patient => {
          if (!patient.id || !patient.first_name) {
            console.warn('⚠️ Paciente con datos incompletos detectado:', patient);
            return false;
          }
          return true;
        });
        
        console.log(`✅ Cargados ${validPatients.length} pacientes válidos de ${patientsData.length} totales`);
<<<<<<< HEAD
        setPatients(validPatients);
        
        // Calcular estadísticas localmente
=======
        
        // Calcular estadísticas de forma optimizada
>>>>>>> nutri/main
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
<<<<<<< HEAD
        setStats(stats);
      }
    } catch (err: any) {
      if (isMounted) {
        // Si es un error de autenticación o acceso, limpiar datos
=======

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
>>>>>>> nutri/main
        if (err.message.includes('autenticado') || err.message.includes('Sesión expirada')) {
          console.warn('🔐 Problema de autenticación detectado. Limpiando sesión...');
          authService.logout();
          localStorage.clear();
          window.location.href = '/login';
          return;
        }
        
<<<<<<< HEAD
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
=======
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
>>>>>>> nutri/main
      
      return updatedPatient;
    } catch (err: any) {
      const errorMessage = err.message || 'Error al actualizar el paciente';
<<<<<<< HEAD
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
=======
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
>>>>>>> nutri/main
        console.log('👥 usePatients: User authenticated, loading patients...');
        await refreshPatients();
      } else {
        console.log('👥 usePatients: User not authenticated, skipping patient load');
      }
    };
    
    loadPatientsOnMount();
<<<<<<< HEAD
    
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
=======
  }, [refreshPatients]);

  // Memoizar valores de retorno para evitar re-renders innecesarios
  const returnValue = useMemo(() => ({
    // State
    patients: state.patients,
    selectedPatient: state.selectedPatient,
    loading: state.loading,
    error: state.error,
    stats: state.stats,
>>>>>>> nutri/main
    
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
<<<<<<< HEAD
  };
};

// Hook específico para obtener citas de un paciente
=======
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
>>>>>>> nutri/main
export const usePatientAppointments = (patientId: string | null) => {
  const [appointments, setAppointments] = useState<PatientAppointment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
<<<<<<< HEAD

  const fetchAppointments = useCallback(async () => {
    if (!patientId) {
      setAppointments([]);
      return;
    }
=======
  
  const loadAppointments = useCallback(async () => {
    if (!patientId) return;
>>>>>>> nutri/main

    try {
      setLoading(true);
      setError(null);
<<<<<<< HEAD
      const data = await patientsService.getPatientAppointments(patientId);
      setAppointments(data);
=======
      const appointmentsData = await patientsService.getPatientAppointments(patientId);
      setAppointments(appointmentsData);
>>>>>>> nutri/main
    } catch (err: any) {
      setError(err.message || 'Error al cargar las citas');
    } finally {
      setLoading(false);
    }
  }, [patientId]);

  useEffect(() => {
<<<<<<< HEAD
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
=======
    loadAppointments();
  }, [loadAppointments]);

  return { appointments, loading, error, refreshAppointments: loadAppointments };
};

// Hook optimizado para progreso de pacientes
>>>>>>> nutri/main
export const usePatientProgress = (patientId: string | null) => {
  const [progress, setProgress] = useState<PatientProgress[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
<<<<<<< HEAD

  const fetchProgress = useCallback(async () => {
    if (!patientId) {
      setProgress([]);
      return;
    }
=======
  
  const loadProgress = useCallback(async () => {
    if (!patientId) return;
>>>>>>> nutri/main

    try {
      setLoading(true);
      setError(null);
<<<<<<< HEAD
      const data = await patientsService.getPatientProgress(patientId);
      setProgress(data);
=======
      const progressData = await patientsService.getPatientProgress(patientId);
      setProgress(progressData);
>>>>>>> nutri/main
    } catch (err: any) {
      setError(err.message || 'Error al cargar el progreso');
    } finally {
      setLoading(false);
    }
  }, [patientId]);

<<<<<<< HEAD
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
=======
  useEffect(() => {
    loadProgress();
  }, [loadProgress]);

  return { progress, loading, error, refreshProgress: loadProgress };
>>>>>>> nutri/main
};

export default usePatients; 