import { useState } from 'react';
import { clinicalRecordsService } from '../services/clinicalRecordsService';
import type { ClinicalRecord, CreateClinicalRecordDto, UpdateClinicalRecordDto } from '../types';

interface UseClinicalRecordsReturn {
  records: ClinicalRecord[];
  loading: boolean;
  error: string | null;
  loadPatientRecords: (patientId: string, filters?: { startDate?: string; endDate?: string; }) => Promise<void>;
  createRecord: (data: CreateClinicalRecordDto) => Promise<void>;
  updateRecord: (recordId: string, data: UpdateClinicalRecordDto) => Promise<void>;
  deleteRecord: (recordId: string) => Promise<void>;
  clearError: () => void;
}

export const useClinicalRecords = (): UseClinicalRecordsReturn => {
  const [records, setRecords] = useState<ClinicalRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const clearError = () => {
    setError(null);
  };

  const loadPatientRecords = async (
    patientId: string,
    filters?: { startDate?: string; endDate?: string; }
  ) => {
    setLoading(true);
    setError(null);
    
    try {
      const patientRecords = await clinicalRecordsService.getPatientRecords(patientId, filters);
      setRecords(patientRecords);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al cargar los expedientes clínicos';
      setError(errorMessage);
      console.error('Error loading patient records:', err);
    } finally {
      setLoading(false);
    }
  };

  const createRecord = async (data: CreateClinicalRecordDto) => {
    setLoading(true);
    setError(null);
    
    try {
      // Validar datos antes de enviar
      const validation = clinicalRecordsService.validateRecordData(data);
      if (!validation.isValid) {
        throw new Error(validation.errors.join(', '));
      }

      const newRecord = await clinicalRecordsService.createRecord(data);
      setRecords(prevRecords => [...prevRecords, newRecord]);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al crear el expediente clínico';
      setError(errorMessage);
      console.error('Error creating record:', err);
      throw err; // Re-throw para que el componente pueda manejar la navegación
    } finally {
      setLoading(false);
    }
  };

  const updateRecord = async (recordId: string, data: UpdateClinicalRecordDto) => {
    setLoading(true);
    setError(null);
    
    try {
      // Validar datos antes de enviar
      const validation = clinicalRecordsService.validateRecordData(data);
      if (!validation.isValid) {
        throw new Error(validation.errors.join(', '));
      }

      const updatedRecord = await clinicalRecordsService.updateRecord(recordId, data);
      setRecords(prevRecords =>
        prevRecords.map(record =>
          record.id === recordId ? updatedRecord : record
        )
      );
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al actualizar el expediente clínico';
      setError(errorMessage);
      console.error('Error updating record:', err);
      throw err; // Re-throw para que el componente pueda manejar la navegación
    } finally {
      setLoading(false);
    }
  };

  const deleteRecord = async (recordId: string) => {
    setLoading(true);
    setError(null);
    
    try {
      await clinicalRecordsService.deleteRecord(recordId);
      setRecords(prevRecords =>
        prevRecords.filter(record => record.id !== recordId)
      );
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al eliminar el expediente clínico';
      setError(errorMessage);
      console.error('Error deleting record:', err);
      throw err; // Re-throw para mostrar errores específicos
    } finally {
      setLoading(false);
    }
  };

  return {
    records,
    loading,
    error,
    loadPatientRecords,
    createRecord,
    updateRecord,
    deleteRecord,
    clearError};
}; 