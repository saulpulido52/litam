import apiService from './api';

export interface Patient {
  id: string;
  userId?: string; // 🎯 NUEVO: ID del usuario para operaciones que requieren user_id
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  birth_date?: string;
  age?: number; // 🎯 AGREGADO: Campo age del backend
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
  password?: string; // Solo para el formulario, no se envía al backend
  first_name: string;
  last_name: string;
  age?: number; // Opcional, se calcula automáticamente desde birth_date
  gender?: 'male' | 'female' | 'other';
  phone?: string;
  birth_date?: string; // 🎯 FECHA DE NACIMIENTO: Para cálculo automático de edad
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
  birth_date?: string; // 🎯 FECHA DE NACIMIENTO: Para cálculo automático de edad
  gender?: 'male' | 'female' | 'other';
  age?: number; // Opcional, se calcula automáticamente desde birth_date
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
  // Transformar datos del backend al formato esperado por el frontend
  private transformBackendPatient(backendPatient: any): Patient {
    console.log('🔄 Transformando paciente del backend:', backendPatient);
    
    // Si ya tiene la estructura correcta, devolverlo tal como está
    if (backendPatient.first_name && backendPatient.email && !backendPatient.user) {
      return backendPatient;
    }
    
    // Si tiene la estructura con objeto "user", transformarlo
    if (backendPatient.user) {
      const transformed: Patient = {
        id: backendPatient.user.id, // 🎯 CORREGIDO: Usar el ID del usuario, no el de la relación
        userId: backendPatient.user.id, // 🎯 ID del usuario para operaciones de eliminación
        first_name: backendPatient.user.first_name || '',
        last_name: backendPatient.user.last_name || '',
        email: backendPatient.user.email || '',
        phone: backendPatient.user.phone || backendPatient.phone,
        birth_date: backendPatient.user.birth_date || backendPatient.birth_date,
        age: backendPatient.user.age || backendPatient.age, // 🎯 INCLUIR age del backend
        gender: backendPatient.user.gender || backendPatient.gender,
        role: backendPatient.user.role || { id: '', name: 'patient' },
        is_active: backendPatient.user.is_active !== undefined ? backendPatient.user.is_active : true,
        created_at: backendPatient.created_at || backendPatient.user.created_at,
        updated_at: backendPatient.updated_at || backendPatient.user.updated_at,
        profile: {
          id: backendPatient.id, // 🎯 ID del perfil del paciente
          height: backendPatient.height,
          current_weight: backendPatient.current_weight,
          target_weight: backendPatient.target_weight,
          activity_level: backendPatient.activity_level,
          medical_conditions: backendPatient.medical_conditions,
          allergies: backendPatient.allergies,
          objectives: backendPatient.objectives,
          emergency_contact_name: backendPatient.emergency_contact_name,
          emergency_contact_phone: backendPatient.emergency_contact_phone
        }
      };
      
      console.log('✅ Paciente transformado:', transformed);
      return transformed;
    }
    
    // Fallback: devolver tal como está
    return backendPatient;
  }

  // Obtener todos los pacientes del nutriólogo actual
  async getMyPatients(): Promise<Patient[]> {
    console.log('🔍 [PatientsService] Iniciando getMyPatients...');
    
    try {
      const response = await apiService.get<any>('/patients/my-patients');
      console.log('🔍 [PatientsService] Respuesta del backend:', {
        status: response.status,
        data: response.data,
        patientsCount: response.data?.data?.patients?.length || 0
      });
      
      const responseData = response.data;
      
      // Manejar ambos formatos de respuesta
      let patients: any[] = [];
      if (responseData?.status === 'success' && responseData?.data?.patients) {
        // Formato: { status: 'success', data: { patients } }
        console.log('🔍 [PatientsService] Usando formato data.patients');
        patients = responseData.data.patients;
      } else if (responseData?.patients) {
        // Formato: { patients }
        console.log('🔍 [PatientsService] Usando formato directo patients');
        patients = responseData.patients;
      } else if (Array.isArray(responseData)) {
        // Formato: [patients] directamente
        console.log('🔍 [PatientsService] Usando formato array directo');
        patients = responseData;
      } else {
        console.error('🔍 [PatientsService] Formato de respuesta inesperado:', responseData);
        throw new Error('Formato de respuesta inesperado del servidor');
      }

      console.log('🔍 [PatientsService] Pacientes extraídos:', {
        count: patients.length,
        patients: patients.map(p => ({
          id: p.id,
          name: `${p.first_name || ''} ${p.last_name || ''}`.trim(),
          email: p.email,
          is_active: p.is_active
        }))
      });

      // Transformar cada paciente
      const transformedPatients = patients.map(patient => this.transformBackendPatient(patient));
      
      console.log('🔍 [PatientsService] Pacientes transformados:', {
        count: transformedPatients.length,
        patients: transformedPatients.map(p => ({
          id: p.id,
          name: `${p.first_name} ${p.last_name}`,
          email: p.email,
          is_active: p.is_active
        }))
      });

      return transformedPatients;
    } catch (error) {
      console.error('🔍 [PatientsService] Error en getMyPatients:', error);
      throw error;
    }
  }

  // Obtener un paciente específico por ID
  async getPatientById(patientId: string): Promise<Patient> {
    try {
      const response = await apiService.get<{ patient: any }>(`/patients/${patientId}`);
      if (!response.data?.patient) {
        throw new Error('Paciente no encontrado');
      }
      
      // Transformar el paciente al formato correcto
      const transformedPatient = this.transformBackendPatient(response.data.patient);
      return transformedPatient;
    } catch (error: any) {
      console.error('Error fetching patient:', error);
      
      // Preservar el código de estado del error para mejor manejo
      if (error.response?.status === 404) {
        const error404 = new Error('Paciente no encontrado - 404');
        (error404 as any).status = 404;
        throw error404;
      } else if (error.response?.status === 403) {
        const error403 = new Error('Sin permisos para acceder a este paciente - 403');
        (error403 as any).status = 403;
        throw error403;
      }
      
      throw new Error('Error al obtener la información del paciente');
    }
  }

  // Verificar si un email ya existe
  async checkEmailExists(email: string): Promise<boolean> {
    try {
      console.log('🔍 SERVICIO - Verificando email:', email);
      const response = await apiService.get<any>(`/patients/check-email?email=${encodeURIComponent(email)}`);
      
      console.log('📡 SERVICIO - Respuesta completa:', response);
      console.log('📊 SERVICIO - Response keys:', Object.keys(response));
      console.log('📊 SERVICIO - Status:', response.status);
      console.log('📊 SERVICIO - Data:', response.data);
      console.log('📊 SERVICIO - Data keys:', response.data ? Object.keys(response.data) : 'NO DATA');
      console.log('📊 SERVICIO - Data stringified:', JSON.stringify(response.data, null, 2));
      
      // Intentar diferentes estructuras de respuesta posibles
      let exists = false;
      
      if (response.data?.data?.exists !== undefined) {
        exists = response.data.data.exists;
        console.log('✅ SERVICIO - Usando response.data.data.exists:', exists);
      } else if (response.data?.exists !== undefined) {
        exists = response.data.exists;
        console.log('✅ SERVICIO - Usando response.data.exists:', exists);
      } else if (response?.data === true || response?.data === false) {
        exists = response.data;
        console.log('✅ SERVICIO - Usando response.data directamente:', exists);
      } else if (typeof response.data === 'object' && response.data !== null) {
        // Buscar cualquier campo que pueda indicar existencia
        const possibleFields = ['exists', 'found', 'available', 'taken'];
        for (const field of possibleFields) {
          if (response.data[field] !== undefined) {
            exists = Boolean(response.data[field]);
            console.log(`✅ SERVICIO - Usando response.data.${field}:`, exists);
            break;
          }
        }
        
        if (!exists && !possibleFields.some(field => response.data[field] !== undefined)) {
          console.log('❌ SERVICIO - No se encontró campo exists en ninguna estructura');
          // Si hay datos en la respuesta, asumimos que el email existe
          exists = Object.keys(response.data).length > 0;
          console.log('🤔 SERVICIO - Inferir existencia por contenido de respuesta:', exists);
        }
      } else {
        console.log('❌ SERVICIO - Estructura de respuesta no reconocida');
        exists = false;
      }
      
      console.log('🎯 SERVICIO - Resultado final:', exists, typeof exists);
      return Boolean(exists);
    } catch (error: any) {
      console.warn('❌ SERVICIO - Error en endpoint:', error);
      console.warn('❌ SERVICIO - Error response:', error.response);
      console.warn('❌ SERVICIO - Error response data:', error.response?.data);
      console.warn('❌ SERVICIO - Error status:', error.response?.status);
      
      // Si hay error 409 o similar, puede indicar que el email ya existe
      if (error.response?.status === 409) {
        console.log('✅ SERVICIO - Error 409 indica email duplicado, devolviendo true');
        return true;
      }
      
      return false;
    }
  }

  // Crear un nuevo paciente
  async createPatient(patientData: CreatePatientRequest): Promise<Patient & { temporaryCredentials?: any }> {
    try {
      // Remover el password ya que el backend genera uno automáticamente
      const { password, ...dataToSend } = patientData;
      
      console.log('🔄 Enviando datos al backend:', dataToSend);
      
      const response = await apiService.post<{ 
        success: boolean; 
        message: string; 
        data?: { 
          patient: Patient;
          temporary_credentials: {
            email: string;
            temporary_password: string;
            expires_at: string;
            instructions: string;
          };
        };
        // Estructura alternativa (respuesta directa)
        patient?: Patient;
        temporary_credentials?: {
          email: string;
          temporary_password: string;
          expires_at: string;
          instructions: string;
        };
      }>('/patients/register-by-nutritionist', dataToSend);
      
      console.log('✅ Respuesta del backend:', response);
      console.log('📄 Estructura de datos recibida:', response.data);
      
      // Manejar ambas estructuras posibles
      let responsePatient: Patient;
      let credentialsData: any;
      
      if (response.data?.data?.patient) {
        // Estructura: { data: { patient: {...}, temporary_credentials: {...} } }
        responsePatient = response.data.data.patient;
        credentialsData = response.data.data.temporary_credentials;
        console.log('📋 Usando estructura con "data" wrapper');
      } else if (response.data?.patient) {
        // Estructura: { patient: {...}, temporary_credentials: {...} }
        responsePatient = response.data.patient;
        credentialsData = response.data.temporary_credentials;
        console.log('📋 Usando estructura directa');
      } else {
        console.error('❌ Estructura de respuesta no reconocida:', {
          hasData: !!response.data,
          hasDataData: !!response.data?.data,
          hasDataPatient: !!response.data?.data?.patient,
          hasPatient: !!response.data?.patient,
          fullResponse: response.data
        });
        throw new Error(`Error en la respuesta del servidor. Estructura recibida: ${JSON.stringify(response.data)}`);
      }
      
      // Transformar el paciente al formato correcto del frontend
      const transformedPatient = this.transformBackendPatient(responsePatient);
      
      // Añadir las credenciales temporales al objeto patient para poder mostrarlas
      const patientWithCredentials = {
        ...transformedPatient,
        temporaryCredentials: credentialsData
      };
      
      console.log('✅ Paciente creado y transformado exitosamente:', patientWithCredentials);
      return patientWithCredentials;
    } catch (error: any) {
      console.error('❌ Error completo:', error);
      console.error('❌ Error response:', error.response);
      console.error('❌ Error response data:', error.response?.data);
      console.error('❌ Error status:', error.response?.status);
      
      // Si es un error de Axios pero no hay response, puede ser un error de red
      if (error.code === 'NETWORK_ERROR' || !error.response) {
        throw new Error('Error de conexión. Verifique que el servidor esté funcionando.');
      }
      
      // Manejo específico de errores comunes
      if (error.response?.status === 409) {
        throw new Error('Ya existe un paciente registrado con este email. Por favor, use un email diferente.');
      } else if (error.response?.status === 400) {
        const errors = error.response?.data?.errors;
        if (errors && Array.isArray(errors)) {
          throw new Error(`Error de validación: ${errors.join(', ')}`);
        }
        const message = error.response?.data?.message || 'Datos incorrectos. Verifique la información.';
        throw new Error(message);
      } else if (error.response?.status === 401) {
        throw new Error('No tiene permisos para realizar esta acción. Verifique su sesión.');
      } else if (error.response?.status === 403) {
        throw new Error('Acceso denegado. No tiene permisos para crear pacientes.');
      } else if (error.response?.status === 500) {
        throw new Error('Error interno del servidor. Intente nuevamente en unos momentos.');
      }
      
      // Error detallado para debugging
      const statusCode = error.response?.status || 'Sin código';
      const serverMessage = error.response?.data?.message || error.message || 'Error desconocido';
      const errorDetails = error.response?.data || error;
      
      throw new Error(
        `Error ${statusCode}: ${serverMessage}. ` +
        `Detalles: ${JSON.stringify(errorDetails, null, 2)}`
      );
    }
  }

  // Actualizar información de un paciente
  async updatePatient(patientId: string, patientData: UpdatePatientRequest): Promise<Patient> {
    try {
      console.log('🔄 FRONTEND - Iniciando actualización de paciente');
      console.log('🔄 FRONTEND - Patient ID:', patientId);
      console.log('🔄 FRONTEND - Datos de actualización:', JSON.stringify(patientData, null, 2));
      console.log('🔄 FRONTEND - Token disponible:', !!apiService.getToken());
      
      // 🎯 NUEVO: Usar email como identificador si está disponible (más robusto)
      let response;
      if (patientData.email) {
        console.log('📧 FRONTEND - Usando nuevo endpoint por EMAIL:', patientData.email);
        response = await apiService.put<{ patient: Patient }>(`/patients/by-email/${encodeURIComponent(patientData.email)}`, patientData);
      } else {
        console.log('🆔 FRONTEND - Usando endpoint por ID (fallback):', patientId);
        response = await apiService.put<{ patient: Patient }>(`/patients/${patientId}`, patientData);
      }
      
      console.log('✅ FRONTEND - Respuesta exitosa:', response);
      if (!response.data?.patient) {
        throw new Error('Error al actualizar el paciente');
      }
      return response.data.patient;
    } catch (error: any) {
      console.error('❌ FRONTEND - Error completo al actualizar:', error);
      console.error('❌ FRONTEND - Error response:', error.response);
      console.error('❌ FRONTEND - Error response data:', error.response?.data);
      console.error('❌ FRONTEND - Error status:', error.response?.status);
      console.error('❌ FRONTEND - Error message:', error.message);
      
      // Si es error 403 o 404, puede ser que el paciente no existe o no tenemos acceso
      if (error.response?.status === 403 || error.response?.status === 404) {
        console.warn('⚠️ Paciente no encontrado o sin acceso. Limpiando datos desactualizados...');
        // Limpiar localStorage para forzar recarga de datos
        localStorage.removeItem('patients_cache');
        localStorage.removeItem('patients_last_fetch');
        // TEMPORALMENTE DESHABILITADO: Recargar la página para obtener datos frescos
        // window.location.reload();
        console.error('🚨 ERROR SIN RECARGA AUTOMÁTICA - Status:', error.response?.status, 'Data:', error.response?.data);
        throw new Error(`Error ${error.response?.status}: ${error.response?.data?.message || 'Datos desactualizados detectados'}`);
      }
      
      const message = error.response?.data?.message || 'Error al actualizar el paciente';
      throw new Error(message);
    }
  }

  // Remover paciente de la lista del nutriólogo (terminar relación)
  async removePatientFromList(patientId: string, reason?: string): Promise<void> {
    try {
      console.log('🗑️ Removing patient from list:', patientId);
      console.log('🔍 patientId type:', typeof patientId, 'value:', patientId);
      
      const token = localStorage.getItem('access_token'); // 🔧 FIX: Use correct token key
      console.log('🔍 Token for removal:', token ? `${token.substring(0, 20)}...` : 'NO TOKEN');
      
      // 🔧 EXTENDED DEBUG: Log more token details
      if (token) {
        console.log('🔍 Full token length:', token.length);
        console.log('🔍 Token structure valid:', token.split('.').length === 3 ? 'YES' : 'NO');
        console.log('🔍 Token starts correctly:', token.startsWith('eyJ') ? 'YES' : 'NO');
        console.log('🔍 Token contains quotes:', token.includes('"') ? 'YES' : 'NO');
        console.log('🔍 Token contains newlines:', token.includes('\n') ? 'YES' : 'NO');
        console.log('🔍 Token full value:', token); // TEMPORARY: Log full token for debugging
      }
      
      const response = await fetch(`http://localhost:4000/api/patients/${patientId}/relationship`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: reason ? JSON.stringify({ reason }) : undefined
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Error desconocido' }));
        
        // 🎯 Handle specific cases for better user experience
        if (response.status === 404) {
          if (errorData.message?.includes('relación activa') || errorData.message?.includes('Paciente no encontrado')) {
            // Clear stale data from frontend
            console.warn('⚠️ Stale patient data detected. Clearing cache...');
            localStorage.removeItem('patients_cache');
            localStorage.removeItem('patients_last_fetch');
            throw new Error('Este paciente ya no está en tu lista. La página se actualizará automáticamente.');
          }
        }
        
        throw new Error(errorData.message || 'Error al remover el paciente de tu lista');
      }

      const data = await response.json();
      console.log('✅ Patient removed successfully:', data);
    } catch (error: any) {
      console.error('💥 Error removing patient from list:', error);
      throw error;
    }
  }

  // Eliminar un paciente (método legacy - ahora usa removePatientFromList)
  async deletePatient(patientId: string): Promise<void> {
    return this.removePatientFromList(patientId, 'Removido por el nutriólogo');
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

  // === NUEVAS FUNCIONALIDADES PARA EXPEDIENTES ===

  // Solicitar cambio de nutriólogo (solo para pacientes)
  async requestNutritionistChange(newNutritionistId: string, reason?: string): Promise<{
    message: string;
    new_relation: any;
    transfer_result?: any;
  }> {
    try {
      const response = await apiService.post<{
        message: string;
        new_relation: any;
        transfer_result?: any;
      }>('/patients/change-nutritionist', {
        newNutritionistId,
        reason,
      });
      
      if (response.status !== 'success' || !response.data) {
        throw new Error(response.message || 'Error al solicitar cambio de nutriólogo');
      }
      
      return response.data;
    } catch (error: any) {
      console.error('Error requesting nutritionist change:', error);
      const message = error.response?.data?.message || 'Error al solicitar cambio de nutriólogo';
      throw new Error(message);
    }
  }

  // Eliminar cuenta completa del paciente (solo el propio paciente o admin)
  async deletePatientAccount(patientId: string, confirmPassword: string): Promise<{
    message: string;
    deleted_data: {
      clinical_records: number;
      appointments: number;
      progress_logs: number;
      relations: number;
      patient_profile: boolean;
      user_account: boolean;
    };
  }> {
    try {
      const response = await apiService.patch<{
        message: string;
        deleted_data: {
          clinical_records: number;
          appointments: number;
          progress_logs: number;
          relations: number;
          patient_profile: boolean;
          user_account: boolean;
        };
      }>(`/patients/${patientId}/account`, {
        confirmPassword,
      });
      
      if (response.status !== 'success' || !response.data) {
        throw new Error(response.message || 'Error al eliminar la cuenta');
      }
      
      return response.data;
    } catch (error: any) {
      console.error('Error deleting patient account:', error);
      const message = error.response?.data?.message || 'Error al eliminar la cuenta del paciente';
      throw new Error(message);
    }
  }

  // Ver perfil propio (para pacientes autenticados)
  async getMyProfile(): Promise<{
    patient: Patient;
    current_nutritionist?: {
      id: string;
      name: string;
      email: string;
    };
  }> {
    try {
      const response = await apiService.get<{
        patient: Patient;
        current_nutritionist?: {
          id: string;
          name: string;
          email: string;
        };
      }>('/patients/my-profile');
      
      if (response.status !== 'success' || !response.data) {
        throw new Error(response.message || 'Error al obtener el perfil');
      }
      
      return response.data;
    } catch (error: any) {
      console.error('Error fetching my profile:', error);
      const message = error.response?.data?.message || 'Error al obtener el perfil del paciente';
      throw new Error(message);
    }
  }

  // Obtener lista de nutriólogos disponibles para cambio
  async getAvailableNutritionists(): Promise<{
    id: string;
    name: string;
    email: string;
    specialization?: string;
    experience_years?: number;
    rating?: number;
  }[]> {
    try {
      const response = await apiService.get<{
        nutritionists: {
          id: string;
          name: string;
          email: string;
          specialization?: string;
          experience_years?: number;
          rating?: number;
        }[];
      }>('/nutritionists');
      
      return response.data?.nutritionists || [];
    } catch (error: any) {
      console.error('Error fetching available nutritionists:', error);
      throw new Error('Error al obtener nutriólogos disponibles');
    }
  }

  // Validar contraseña antes de eliminar cuenta
  async validatePassword(password: string): Promise<boolean> {
    try {
      const response = await apiService.post<{ valid: boolean }>('/auth/validate-password', {
        password,
      });
      
      return response.data?.valid || false;
    } catch (error: any) {
      console.error('Error validating password:', error);
      return false;
    }
  }

  // Obtener historial de cambios de nutriólogo
  async getNutritionistHistory(patientId: string): Promise<{
    id: string;
    nutritionist_name: string;
    start_date: string;
    end_date?: string;
    status: string;
    reason?: string;
  }[]> {
    try {
      const response = await apiService.get<{
        history: {
          id: string;
          nutritionist_name: string;
          start_date: string;
          end_date?: string;
          status: string;
          reason?: string;
        }[];
      }>(`/patients/${patientId}/nutritionist-history`);
      
      return response.data?.history || [];
    } catch (error: any) {
      console.error('Error fetching nutritionist history:', error);
      return [];
    }
  }
}

export const patientsService = new PatientsService();
export default patientsService; 