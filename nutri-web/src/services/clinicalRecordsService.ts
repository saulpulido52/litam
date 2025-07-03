import apiService from './api';
import type {
  ClinicalRecord,
  CreateClinicalRecordDto,
  UpdateClinicalRecordDto,
  ClinicalRecordStats,
  TransferResult,
} from '../types';

class ClinicalRecordsService {
  private baseUrl = '/clinical-records';

  // === CRUD Básico de Expedientes ===

  // Crear nuevo expediente clínico
  async createRecord(data: CreateClinicalRecordDto): Promise<ClinicalRecord> {
    const response = await apiService.post<{ record: ClinicalRecord }>(
      this.baseUrl,
      data
    );
    
    if (response.status !== 'success' || !response.data?.record) {
      throw new Error(response.message || 'Error al crear el expediente clínico');
    }
    
    return response.data.record;
  }

  // Obtener expedientes de un paciente específico
  async getPatientRecords(
    patientId: string,
    filters?: {
      startDate?: string;
      endDate?: string;
    }
  ): Promise<ClinicalRecord[]> {
    const params = new URLSearchParams();
    if (filters?.startDate) params.append('startDate', filters.startDate);
    if (filters?.endDate) params.append('endDate', filters.endDate);

    const response = await apiService.get<{ records: ClinicalRecord[] }>(
      `${this.baseUrl}/patient/${patientId}?${params.toString()}`
    );
    
    if (response.status !== 'success' || !response.data?.records) {
      throw new Error(response.message || 'Error al obtener los expedientes');
    }
    
    return response.data.records;
  }

  // Obtener un expediente específico por ID
  async getRecordById(recordId: string): Promise<ClinicalRecord> {
    const response = await apiService.get<{ record: ClinicalRecord }>(
      `${this.baseUrl}/${recordId}`
    );
    
    if (response.status !== 'success' || !response.data?.record) {
      throw new Error(response.message || 'Error al obtener el expediente');
    }
    
    return response.data.record;
  }

  // Actualizar expediente clínico
  async updateRecord(
    recordId: string,
    data: UpdateClinicalRecordDto
  ): Promise<ClinicalRecord> {
    const response = await apiService.patch<{ record: ClinicalRecord }>(
      `${this.baseUrl}/${recordId}`,
      data
    );
    
    if (response.status !== 'success' || !response.data?.record) {
      throw new Error(response.message || 'Error al actualizar el expediente');
    }
    
    return response.data.record;
  }

  // Eliminar expediente individual
  async deleteRecord(recordId: string): Promise<void> {
    const response = await apiService.delete(
      `${this.baseUrl}/${recordId}`
    );
    
    if (response.status !== 'success') {
      throw new Error(response.message || 'Error al eliminar el expediente');
    }
  }

  // === Funcionalidades Especializadas ===

  // Obtener estadísticas de expedientes de un paciente
  async getPatientStats(patientId: string): Promise<ClinicalRecordStats> {
    const response = await apiService.get<{ stats: ClinicalRecordStats }>(
      `${this.baseUrl}/patient/${patientId}/stats`
    );
    
    if (response.status !== 'success' || !response.data?.stats) {
      throw new Error(response.message || 'Error al obtener estadísticas');
    }
    
    return response.data.stats;
  }

  // Obtener conteo de expedientes de un paciente
  async getPatientRecordsCount(patientId: string): Promise<number> {
    const response = await apiService.get<{ count: number }>(
      `${this.baseUrl}/patient/${patientId}/count`
    );
    
    if (response.status !== 'success' || response.data?.count === undefined) {
      throw new Error(response.message || 'Error al obtener el conteo de expedientes');
    }
    
    return response.data.count;
  }

  // Transferir expedientes entre nutriólogos (solo admin)
  async transferRecords(
    patientId: string,
    fromNutritionistId: string,
    toNutritionistId: string
  ): Promise<TransferResult> {
    const response = await apiService.post<TransferResult>(
      `${this.baseUrl}/transfer`,
      {
        patientId,
        fromNutritionistId,
        toNutritionistId,
      }
    );
    
    if (response.status !== 'success' || !response.data) {
      throw new Error(response.message || 'Error al transferir expedientes');
    }
    
    return response.data;
  }

  // Eliminar todos los expedientes de un paciente (solo cuando elimina cuenta)
  async deleteAllPatientRecords(patientId: string): Promise<{
    message: string;
    deleted_count: number;
  }> {
    const response = await apiService.delete<{
      message: string;
      deleted_count: number;
    }>(`${this.baseUrl}/patient/${patientId}/all`);
    
    if (response.status !== 'success' || !response.data) {
      throw new Error(response.message || 'Error al eliminar expedientes');
    }
    
    return response.data;
  }

  // === Utilidades y Validaciones ===

  // Validar datos antes de enviar
  validateRecordData(data: CreateClinicalRecordDto | UpdateClinicalRecordDto): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    // Validaciones básicas
    if ('patientId' in data && !data.patientId) {
      errors.push('El ID del paciente es requerido');
    }

    if ('recordDate' in data && !data.recordDate) {
      errors.push('La fecha del registro es requerida');
    }

    // Validar rangos de valores
    if (data.anthropometricMeasurements?.currentWeightKg) {
      const weight = data.anthropometricMeasurements.currentWeightKg;
      if (weight < 1 || weight > 1000) {
        errors.push('El peso debe estar entre 1 y 1000 kg');
      }
    }

    if (data.anthropometricMeasurements?.heightM) {
      const height = data.anthropometricMeasurements.heightM;
      if (height < 0.5 || height > 3) {
        errors.push('La altura debe estar entre 0.5 y 3 metros (ejemplo: 1.70 para 170cm)');
      }
      
      // Additional validation: warn if height seems to be in centimeters
      if (height > 50 && height < 300) {
        errors.push('La altura parece estar en centímetros. Por favor ingresa la altura en metros (ejemplo: 1.70 en lugar de 170)');
      }
    }

    if (data.bloodPressure?.systolic && data.bloodPressure?.diastolic) {
      const { systolic, diastolic } = data.bloodPressure;
      if (systolic <= diastolic) {
        errors.push('La presión sistólica debe ser mayor que la diastólica');
      }
      
      // Additional blood pressure validations
      if (systolic < 50 || systolic > 300) {
        errors.push('La presión sistólica debe estar entre 50 y 300 mmHg');
      }
      
      if (diastolic < 30 || diastolic > 200) {
        errors.push('La presión diastólica debe estar entre 30 y 200 mmHg');
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  // Calcular IMC si tenemos peso y altura
  calculateBMI(
    weight?: number,
    height?: number
  ): { bmi?: number; category?: string } {
    if (!weight || !height || height === 0) {
      return {};
    }

    const bmi = weight / (height * height);
    let category: string;

    if (bmi < 18.5) {
      category = 'Bajo peso';
    } else if (bmi < 25) {
      category = 'Normal';
    } else if (bmi < 30) {
      category = 'Sobrepeso';
    } else {
      category = 'Obesidad';
    }

    return {
      bmi: Math.round(bmi * 10) / 10,
      category,
    };
  }

  // Formatear fecha para mostrar
  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }

  // Formatear fecha y hora
  formatDateTime(dateString: string): string {
    return new Date(dateString).toLocaleString('es-MX', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  // === DOCUMENTOS DE LABORATORIO ===

  // Generar PDF del expediente
  public async generateExpedientePDF(recordId: string): Promise<Blob> {
    try {
      const response = await fetch(`/api/clinical-records/${recordId}/generate-pdf`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${apiService.getToken()}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Error al generar el PDF' }));
        throw new Error(errorData.message || 'Error al generar el PDF');
      }

      return await response.blob();
    } catch (error: any) {
      console.error('Error in generateExpedientePDF:', error);
      throw new Error(error.message || 'Error al generar el PDF del expediente');
    }
  }

  // Upload documento de laboratorio
  public async uploadLaboratoryDocument(
    recordId: string, 
    file: File, 
    description?: string, 
    labDate?: string
  ): Promise<any> {
    try {
      const formData = new FormData();
      formData.append('laboratory_pdf', file);
      if (description) {
        formData.append('description', description);
      }
      if (labDate) {
        formData.append('labDate', new Date(labDate).toISOString());
      }

      const response = await fetch(`/api/clinical-records/${recordId}/laboratory-documents`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiService.getToken()}`
        },
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al subir el documento');
      }

      return await response.json();
    } catch (error: any) {
      console.error('Error in uploadLaboratoryDocument:', error);
      throw new Error(error.message || 'Error al subir el documento de laboratorio');
    }
  }

  // Eliminar documento de laboratorio
  public async deleteLaboratoryDocument(recordId: string, documentId: string): Promise<any> {
    try {
      const response = await fetch(`/api/clinical-records/${recordId}/laboratory-documents/${documentId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${apiService.getToken()}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al eliminar el documento');
      }

      return await response.json();
    } catch (error: any) {
      console.error('Error in deleteLaboratoryDocument:', error);
      throw new Error(error.message || 'Error al eliminar el documento de laboratorio');
    }
  }

  // Obtener documentos de laboratorio
  async getLaboratoryDocuments(recordId: string): Promise<any[]> {
    const response = await apiService.get<{ documents: any[] }>(
      `${this.baseUrl}/${recordId}/laboratory-documents`
    );

    if (response.status !== 'success' || !response.data?.documents) {
      throw new Error(response.message || 'Error al obtener documentos de laboratorio');
    }

    return response.data.documents;
  }

  // === INTERACCIONES FÁRMACO-NUTRIENTE ===

  // Agregar interacción fármaco-nutriente
  async addDrugNutrientInteraction(
    recordId: string,
    interaction: {
      medicationId: string;
      nutrientsAffected: string[];
      interactionType: 'absorption' | 'metabolism' | 'excretion' | 'antagonism';
      severity: 'low' | 'moderate' | 'high' | 'critical';
      description: string;
      recommendations: string[];
      timingConsiderations?: string;
      foodsToAvoid?: string[];
      foodsToIncrease?: string[];
      monitoringRequired?: boolean;
    }
  ): Promise<{ message: string; interaction: any }> {
    const response = await apiService.post<{ message: string; interaction: any }>(
      `${this.baseUrl}/${recordId}/drug-nutrient-interactions`,
      interaction
    );

    if (response.status !== 'success' || !response.data) {
      throw new Error(response.message || 'Error al agregar la interacción fármaco-nutriente');
    }

    return response.data;
  }

  // Actualizar interacción fármaco-nutriente
  async updateDrugNutrientInteraction(
    recordId: string,
    interactionId: string,
    updates: {
      nutrientsAffected?: string[];
      interactionType?: 'absorption' | 'metabolism' | 'excretion' | 'antagonism';
      severity?: 'low' | 'moderate' | 'high' | 'critical';
      description?: string;
      recommendations?: string[];
      timingConsiderations?: string;
      foodsToAvoid?: string[];
      foodsToIncrease?: string[];
      monitoringRequired?: boolean;
    }
  ): Promise<{ message: string; interaction: any }> {
    const response = await apiService.patch<{ message: string; interaction: any }>(
      `${this.baseUrl}/${recordId}/drug-nutrient-interactions/${interactionId}`,
      updates
    );

    if (response.status !== 'success' || !response.data) {
      throw new Error(response.message || 'Error al actualizar la interacción fármaco-nutriente');
    }

    return response.data;
  }

  // Eliminar interacción fármaco-nutriente
  async deleteDrugNutrientInteraction(
    recordId: string,
    interactionId: string
  ): Promise<{ message: string }> {
    const response = await apiService.delete<{ message: string }>(
      `${this.baseUrl}/${recordId}/drug-nutrient-interactions/${interactionId}`
    );

    if (response.status !== 'success' || !response.data) {
      throw new Error(response.message || 'Error al eliminar la interacción fármaco-nutriente');
    }

    return response.data;
  }

  // Obtener interacciones fármaco-nutriente
  async getDrugNutrientInteractions(recordId: string): Promise<any[]> {
    const response = await apiService.get<{ interactions: any[] }>(
      `${this.baseUrl}/${recordId}/drug-nutrient-interactions`
    );

    if (response.status !== 'success' || !response.data?.interactions) {
      throw new Error(response.message || 'Error al obtener interacciones fármaco-nutriente');
    }

    return response.data.interactions;
  }

  // Obtener expedientes más recientes
  async getRecentRecords(): Promise<ClinicalRecord[]> {
    try {
      // Implementar cuando tengamos el endpoint
      // Por ahora devolvemos array vacío
      return [];
    } catch (error) {
      console.error('Error al obtener expedientes recientes:', error);
      return [];
    }
  }

  // Buscar expedientes por criterios
  async searchRecords(): Promise<ClinicalRecord[]> {
    try {
      // Implementar cuando tengamos el endpoint de búsqueda
      // Por ahora devolvemos array vacío
      return [];
    } catch (error) {
      console.error('Error al buscar expedientes:', error);
      return [];
    }
  }
}

export const clinicalRecordsService = new ClinicalRecordsService();
export default clinicalRecordsService; 