import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ClinicalRecordsList from '../components/ClinicalRecords/ClinicalRecordsList';
import ClinicalRecordForm from '../components/ClinicalRecords/ClinicalRecordForm';
import ClinicalRecordDetail from '../components/ClinicalRecords/ClinicalRecordDetail';
import { patientsService } from '../services/patientsService';
import { clinicalRecordsService } from '../services/clinicalRecordsService';
import type { ClinicalRecord, CreateClinicalRecordDto, UpdateClinicalRecordDto } from '../types';

type ViewMode = 'list' | 'create' | 'edit' | 'view';

const ClinicalRecordsPage: React.FC = () => {
  const { patientId } = useParams<{ patientId: string }>();
  const navigate = useNavigate();
  
  // Estados locales
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [selectedRecord, setSelectedRecord] = useState<ClinicalRecord | null>(null);
  const [patientData, setPatientData] = useState<any>(null);
  const [patientError, setPatientError] = useState<string | null>(null);
  const [records, setRecords] = useState<ClinicalRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [redirectCountdown, setRedirectCountdown] = useState<number>(0);
  const [hasRedirected, setHasRedirected] = useState<boolean>(false);

  // Validar que el patientId sea válido
  useEffect(() => {
    if (!patientId) {
      console.error('❌ No se proporcionó patientId en la URL');
      handleInvalidPatient('No se proporcionó ID de paciente');
      return;
    }

    // Validar formato UUID
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(patientId)) {
      console.error('❌ Formato de patientId inválido:', patientId);
      handleInvalidPatient('Formato de ID de paciente inválido');
      return;
    }

    console.log('🔍 Validando paciente ID:', patientId);
    validateAndLoadPatient();
  }, [patientId]);

  // Función para validar y cargar datos del paciente
  const validateAndLoadPatient = async () => {
    if (!patientId) return;

    try {
      console.log('🔍 Verificando existencia del paciente:', patientId);
      const patient = await patientsService.getPatientById(patientId);
      
      if (patient) {
        console.log('✅ Paciente encontrado:', patient.first_name, patient.last_name);
        setPatientData(patient);
        setPatientError(null);
        
        // Cargar expedientes clínicos
        await loadPatientRecords(patientId);
      } else {
        console.error('❌ Paciente no encontrado:', patientId);
        handleInvalidPatient('Paciente no encontrado');
      }
    } catch (error: any) {
      console.error('❌ Error al validar paciente:', error);
      
      if (error.response?.status === 404) {
        handleInvalidPatient('Paciente no encontrado en el sistema');
      } else {
        handleInvalidPatient('Error al cargar datos del paciente');
      }
    }
  };

  // Función para cargar expedientes clínicos
  const loadPatientRecords = async (patientId: string) => {
    setLoading(true);
    
    try {
      const patientRecords = await clinicalRecordsService.getPatientRecords(patientId);
      setRecords(patientRecords);
      console.log('✅ Expedientes cargados:', patientRecords.length);
    } catch (err) {
      console.error('Error loading patient records:', err);
    } finally {
      setLoading(false);
    }
  };

  // Función para manejar pacientes inválidos
  const handleInvalidPatient = (errorMessage: string) => {
    console.log('🚨 Paciente inválido detectado:', errorMessage);
    setPatientError(errorMessage);
    
    // Evitar redirecciones múltiples
    if (hasRedirected) {
      console.log('⚠️ Ya se realizó una redirección, evitando ciclo infinito');
      return;
    }

    setHasRedirected(true);
    setRedirectCountdown(3);
  };

  // Efecto separado para manejar la redirección
  useEffect(() => {
    if (hasRedirected && redirectCountdown > 0) {
      const countdownInterval = setInterval(() => {
        setRedirectCountdown(prev => {
          if (prev <= 1) {
            clearInterval(countdownInterval);
            console.log('🔄 Ejecutando redirección a /patients');
            navigate('/patients', { replace: true });
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(countdownInterval);
    }
  }, [hasRedirected, redirectCountdown, navigate]);

  // Función para redirección manual
  const handleManualRedirect = () => {
    console.log('🔄 Redirección manual a /patients');
    navigate('/patients', { replace: true });
  };

  // Función para limpiar caché y recargar
  const handleClearCacheAndReload = () => {
    console.log('🧹 Limpiando caché y recargando...');
    
    // Limpiar localStorage
    const keysToRemove = [
      'patients_cache',
      'patients_last_fetch',
      'current_patient',
      'last_visited_patient'
    ];
    
    keysToRemove.forEach(key => {
      if (localStorage.getItem(key)) {
        console.log(`🗑️ Removing localStorage key: ${key}`);
        localStorage.removeItem(key);
      }
    });
    
    // Recargar página
    window.location.reload();
  };

  // Mostrar pantalla de error si el paciente es inválido
  if (patientError) {
    return (
      <div className="container mt-5">
        <div className="row justify-content-center">
          <div className="col-md-8">
            <div className="card border-danger">
              <div className="card-header bg-danger text-white">
                <h4 className="mb-0">
                  <i className="fas fa-exclamation-triangle me-2"></i>
                  Paciente No Encontrado
                </h4>
              </div>
              <div className="card-body text-center">
                <div className="mb-4">
                  <i className="fas fa-user-times text-danger" style={{ fontSize: '4rem' }}></i>
                </div>
                
                <h5 className="text-danger mb-3">Error: {patientError}</h5>
                
                <p className="text-muted mb-4">
                  El paciente con ID <code>{patientId}</code> no existe en el sistema o ya no está disponible.
                </p>

                <div className="alert alert-info">
                  <strong>Redirigiendo automáticamente en {redirectCountdown} segundos...</strong>
                </div>

                <div className="d-grid gap-2 d-md-flex justify-content-md-center">
                  <button 
                    className="btn btn-primary me-md-2" 
                    onClick={handleManualRedirect}
                  >
                    <i className="fas fa-users me-2"></i>
                    Ir a Lista de Pacientes
                  </button>
                  
                  <button 
                    className="btn btn-outline-secondary" 
                    onClick={handleClearCacheAndReload}
                  >
                    <i className="fas fa-sync-alt me-2"></i>
                    Limpiar Cache y Recargar
                  </button>
                </div>

                <div className="mt-4">
                  <small className="text-muted">
                    Si el problema persiste, contacta al administrador del sistema.
                  </small>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Mostrar loading mientras se valida el paciente
  if (!patientData && !patientError) {
    return (
      <div className="container mt-5">
        <div className="row justify-content-center">
          <div className="col-md-8">
            <div className="card">
              <div className="card-body text-center">
                <div className="spinner-border text-primary mb-3" role="status">
                  <span className="visually-hidden">Cargando...</span>
                </div>
                <h5>Validando paciente...</h5>
                <p className="text-muted">Verificando que el paciente existe en el sistema</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Funciones para manejar expedientes clínicos
  const handleCreateRecord = async (recordData: CreateClinicalRecordDto | Partial<CreateClinicalRecordDto>) => {
    try {
      const newRecord = await clinicalRecordsService.createRecord(recordData as CreateClinicalRecordDto);
      setRecords(prevRecords => [...prevRecords, newRecord]);
      setViewMode('list');
    } catch (error) {
      console.error('Error creating record:', error);
    }
  };

  const handleUpdateRecord = async (recordId: string, recordData: UpdateClinicalRecordDto) => {
    try {
      const updatedRecord = await clinicalRecordsService.updateRecord(recordId, recordData);
      setRecords(prevRecords =>
        prevRecords.map(record =>
          record.id === recordId ? updatedRecord : record
        )
      );
      setViewMode('list');
      setSelectedRecord(null);
    } catch (error) {
      console.error('Error updating record:', error);
    }
  };

  const handleDeleteRecord = async (recordId: string) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este expediente clínico?')) {
      try {
        await clinicalRecordsService.deleteRecord(recordId);
        setRecords(prevRecords =>
          prevRecords.filter(record => record.id !== recordId)
        );
      } catch (error) {
        console.error('Error deleting record:', error);
      }
    }
  };

  const handleViewRecord = (record: ClinicalRecord) => {
    setSelectedRecord(record);
    setViewMode('view');
  };

  const handleEditRecord = (record: ClinicalRecord) => {
    setSelectedRecord(record);
    setViewMode('edit');
  };

  return (
    <div className="container-fluid">
      <div className="row">
        <div className="col-12">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <div>
              <h2 className="mb-1">Expedientes Clínicos</h2>
              {patientData && (
                <p className="text-muted mb-0">
                  Paciente: <strong>{patientData.first_name} {patientData.last_name}</strong>
                </p>
              )}
            </div>
            
            <div className="d-flex gap-2">
              {viewMode === 'list' && (
                <button
                  className="btn btn-primary"
                  onClick={() => setViewMode('create')}
                >
                  <i className="fas fa-plus me-2"></i>
                  Nuevo Expediente
                </button>
              )}
              
              {viewMode !== 'list' && (
                <button
                  className="btn btn-secondary"
                  onClick={() => {
                    setViewMode('list');
                    setSelectedRecord(null);
                  }}
                >
                  <i className="fas fa-arrow-left me-2"></i>
                  Volver
                </button>
              )}
            </div>
          </div>

          {viewMode === 'list' && (
            <ClinicalRecordsList
              records={records}
              loading={loading}
              onViewRecord={handleViewRecord}
              onEditRecord={handleEditRecord}
              onDeleteRecord={(record) => handleDeleteRecord(record.id)}
              canEdit={true}
              canDelete={true}
            />
          )}

          {viewMode === 'create' && (
            <ClinicalRecordForm
              patientId={patientId!}
              patientName={`${patientData?.first_name || ''} ${patientData?.last_name || ''}`}
              onSubmit={handleCreateRecord}
              onCancel={() => setViewMode('list')}
            />
          )}

          {viewMode === 'edit' && selectedRecord && (
            <ClinicalRecordForm
              record={selectedRecord}
              patientId={patientId!}
              patientName={`${patientData?.first_name || ''} ${patientData?.last_name || ''}`}
              onSubmit={(data) => handleUpdateRecord(selectedRecord.id, data)}
              onCancel={() => {
                setViewMode('list');
                setSelectedRecord(null);
              }}
            />
          )}

          {viewMode === 'view' && selectedRecord && (
            <ClinicalRecordDetail
              record={selectedRecord}
              onEdit={() => handleEditRecord(selectedRecord)}
              onDelete={() => handleDeleteRecord(selectedRecord.id)}
              onClose={() => {
                setViewMode('list');
                setSelectedRecord(null);
              }}
              canEdit={true}
              canDelete={true}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default ClinicalRecordsPage; 