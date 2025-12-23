import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link, useSearchParams } from 'react-router-dom';
import { Container, Row, Col, Card, Button, Nav, Tab, Alert, Badge } from 'react-bootstrap';
import ClinicalRecordsList from '../components/ClinicalRecords/ClinicalRecordsList';
import ClinicalRecordForm from '../components/ClinicalRecords/ClinicalRecordForm';
import ClinicalRecordDetail from '../components/ClinicalRecords/ClinicalRecordDetail';
import FormularioSeguimiento from '../components/ClinicalRecords/FormularioSeguimiento';

import AnalisisPaciente from '../components/ClinicalRecords/AnalisisPaciente';
import { patientsService } from '../services/patientsService';
import { clinicalRecordsService } from '../services/clinicalRecordsService';
import type { ClinicalRecord, CreateClinicalRecordDto, UpdateClinicalRecordDto } from '../types';

// React Icons
import { 
  MdArrowBack,
  MdAdd,
  MdClose,
  MdWarning} from 'react-icons/md';
import { FaUsers, FaUserCircle, FaChartLine, FaRobot, FaStethoscope, FaTachometerAlt } from 'react-icons/fa';

import { HiOutlineDocumentText } from 'react-icons/hi';

type ViewMode = 'list' | 'create' | 'edit' | 'view' | 'seguimiento-form' | 'dashboard';

const ClinicalRecordsPage: React.FC = () => {
  const { patientId } = useParams<{ patientId: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  // Estados locales
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [selectedRecord, setSelectedRecord] = useState<ClinicalRecord | null>(null);
  const [patientData, setPatientData] = useState<any>(null);
  const [patientError, setPatientError] = useState<string | null>(null);
  const [records, setRecords] = useState<ClinicalRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [redirectCountdown, setRedirectCountdown] = useState<number>(0);
  const [hasRedirected, setHasRedirected] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<string>('expedientes');

  // Leer parámetros de query para abrir pestaña específica
  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab && ['expedientes', 'seguimiento', 'dashboard'].includes(tab)) {
      setActiveTab(tab);
    }
  }, [searchParams]);

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
      <Container fluid className="py-4">
        <Row className="justify-content-center">
          <Col md={8} lg={6}>
            <Card className="border-danger">
              <Card.Header className="bg-danger text-white">
                <h4 className="mb-0 d-flex align-items-center">
                  <MdWarning className="me-2" />
                  Paciente No Encontrado
                </h4>
              </Card.Header>
              <Card.Body className="text-center">
                <div className="mb-4">
                  <FaUserCircle className="text-danger" size={48} />
                </div>
                
                <h5 className="text-danger mb-3">Error: {patientError}</h5>
                
                <p className="text-muted mb-4">
                  El paciente con ID <code>{patientId}</code>
                  no existe en el sistema o ya no está disponible.
                </p>

                <Alert variant="info">
                  <strong>Redirigiendo automáticamente en {redirectCountdown} segundos...</strong>
                </Alert>

                <div className="d-grid gap-2 d-md-flex justify-content-md-center">
                  <Button 
                    variant="primary" 
                    className="me-md-2" 
                    onClick={handleManualRedirect}
                  >
                    <FaUsers className="me-2" />
                    Ir a Lista de Pacientes
                  </Button>
                  
                  <Button 
                    variant="secondary" 
                    onClick={handleClearCacheAndReload}
                  >
                    <MdClose className="me-2" />
                    Limpiar Cache y Recargar
                  </Button>
                </div>

                <div className="mt-4">
                  <small className="text-muted">
                    Si el problema persiste, contacta al administrador del sistema.
                  </small>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    );
  }

  // Mostrar loading mientras se valida el paciente
  if (!patientData && !patientError) {
    return (
      <div className="author-layout">
        <div className="author-dashboard">
          <div className="author-dashboard-content">
            <div className="row justify-content-center">
              <div className="col-12 col-md-8 col-lg-6">
                <div className="author-activity-card">
                  <div className="author-activity-content text-center">
                    <div className="spinner-border text-primary mb-3" role="status">
                      <span className="visually-hidden">Cargando...</span>
                    </div>
                    <h5 className="d-none d-sm-block">Validando paciente...</h5>
                    <h5 className="d-block d-sm-none">Validando...</h5>
                    <p className="text-muted">Verificando que el paciente existe en el sistema</p>
                  </div>
                </div>
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

  const handleCreateSeguimiento = async () => {
    // Función comentada temporalmente
  };

  const handleVerExpedienteBase = (expedienteId: string) => {
    // Buscar el expediente en la lista y mostrarlo
    const expedienteBase = records.find(record => record.id === expedienteId);
    if (expedienteBase) {
      setSelectedRecord(expedienteBase);
      setViewMode('view');
    } else {
      console.warn('Expediente base no encontrado:', expedienteId);
    }
  };

  return (
    <Container fluid className="py-4">
      {/* Header */}
      <Row className="mb-4">
        <Col>
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h1 className="h3 mb-1">Expedientes Clínicos Inteligentes</h1>
              <p className="text-muted mb-0">
                {patientData && (
                  <span>
                    Paciente: <strong>{patientData.first_name} {patientData.last_name}</strong>
                  </span>
                )}
                {viewMode === 'list' 
                  ? ` - ${records.length} expediente${records.length !== 1 ? 's' : ''} registrado${records.length !== 1 ? 's' : ''}`
                  : viewMode === 'create' 
                    ? ' - Registrar Nuevo Expediente'
                    : viewMode === 'seguimiento-form'
                      ? ' - Seguimiento Automático'
                    : viewMode === 'dashboard'
                      ? ' - Dashboard de Seguimiento'
                    : viewMode === 'edit'
                      ? ' - Editar Expediente'
                      : ' - Ver Expediente'
                }
              </p>
            </div>
            <div className="d-flex gap-2">
              <Link to="/patients" className="btn btn-outline-secondary">
                <MdArrowBack className="me-2" />
                Volver a Pacientes
              </Link>
            </div>
          </div>
        </Col>
      </Row>

      {/* Navigation Tabs */}
      {viewMode === 'list' && (
        <Row className="mb-4">
          <Col>
            <Nav variant="tabs" activeKey={activeTab} onSelect={(key) => setActiveTab(key || 'expedientes')}>
              <Nav.Item>
                <Nav.Link eventKey="expedientes">
                  <HiOutlineDocumentText className="me-2" />
                  Expedientes
                </Nav.Link>
              </Nav.Item>
              {records.length > 0 && (
                <Nav.Item>
                  <Nav.Link eventKey="seguimiento">
                    <FaRobot className="me-2" />
                    Seguimiento
                    <Badge bg="success" className="ms-2">IA</Badge>
                  </Nav.Link>
                </Nav.Item>
              )}
              <Nav.Item>
                <Nav.Link 
                  as={Link} 
                  to={`/patients/${patientId}/seguimientos`}
                  className="d-flex align-items-center"
                >
                  <FaStethoscope className="me-2" />
                  Solo Seguimientos
                  <Badge bg="info" className="ms-2">
                    {records.filter(r => r.tipo_expediente === 'seguimiento').length}
                  </Badge>
                </Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link eventKey="dashboard">
                  <FaTachometerAlt className="me-2" />
                  Análisis
                </Nav.Link>
              </Nav.Item>
            </Nav>
          </Col>
        </Row>
      )}

      {/* Content */}
      {viewMode === 'list' ? (
        <Tab.Container activeKey={activeTab}>
          <Tab.Content>
            {/* Pestaña de Expedientes */}
            <Tab.Pane eventKey="expedientes">
              <Card>
                <Card.Header>
                  <div className="d-flex justify-content-between align-items-center">
                    <h5 className="mb-0">Expedientes del Paciente</h5>
                    <div className="d-flex gap-2">
                      <Badge bg="primary" className="fs-6">
                        {records.length}
                      </Badge>
                      <Button variant="primary" onClick={() => setViewMode('create')} disabled={loading}>
                        <MdAdd className="me-2" />
                        Nuevo Expediente
                      </Button>
                    </div>
                  </div>
                </Card.Header>
                <Card.Body>
                  {loading ? (
                    <div className="text-center py-5">
                      <div className="spinner-border text-primary mb-3" role="status">
                        <span className="visually-hidden">Cargando...</span>
                      </div>
                      <p className="text-muted">Cargando expedientes...</p>
                    </div>
                  ) : records.length === 0 ? (
                    <div className="text-center py-5">
                      <HiOutlineDocumentText className="text-muted mb-3" size={48} />
                      <h4 className="text-muted mb-3">No hay expedientes registrados</h4>
                      <p className="text-muted mb-4">
                        Comienza registrando el primer expediente clínico para este paciente
                      </p>
                      <Button variant="primary" onClick={() => setViewMode('create')}>
                        <MdAdd className="me-2" />
                        Registrar Primer Expediente
                      </Button>
                    </div>
                  ) : (
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
                </Card.Body>
              </Card>
            </Tab.Pane>

            {/* Pestaña de Análisis del Paciente */}
            <Tab.Pane eventKey="dashboard">
              <AnalisisPaciente 
                patientId={patientId || ''}
                patientName={patientData ? `${patientData.first_name} ${patientData.last_name}` : 'Paciente'}
                records={records}
              />
            </Tab.Pane>

            {/* Pestaña de Seguimiento */}
            <Tab.Pane eventKey="seguimiento">
              <Alert variant="success" className="mb-4">
                <FaRobot className="me-2" />
                <strong>Seguimiento Activado</strong> - Ya tienes {records.length} expediente{records.length !== 1 ? 's' : ''} 
                para este paciente. Ahora puedes usar el seguimiento inteligente.
              </Alert>

              <Card>
                <Card.Header className="bg-success text-white">
                  <FaStethoscope className="me-2" />
                  Seguimiento para {patientData?.first_name} {patientData?.last_name}
                </Card.Header>
                <Card.Body>
                  <Row className="mb-4">
                    <Col md={9}>
                      <h5>Crear Seguimiento Inteligente</h5>
                      <p className="text-muted mb-2">
                        Sistema automatizado que reduce el tiempo de consulta de 20 a 5 minutos.
                        Detecta automáticamente el tipo y compara con expedientes anteriores.
                      </p>
                      <div className="d-flex gap-2">
                        <Badge bg="primary">🤖 IA Automática</Badge>
                        <Badge bg="info">📊 Comparativo</Badge>
                        <Badge bg="success">⚡ 5 minutos</Badge>
                      </div>
                    </Col>
                    <Col md={3} className="text-end">
                      <div className="d-grid gap-2">
                        <Button 
                          variant="success" 
                          size="lg"
                          onClick={() => setViewMode('seguimiento-form')}
                        >
                          <FaStethoscope className="me-2" />
                          Iniciar Seguimiento
                        </Button>
                        <small className="text-muted">Tiempo estimado: 5 min</small>
                      </div>
                    </Col>
                  </Row>

                  <Row>
                    <Col md={4}>
                      <Card className="border-success h-100">
                        <Card.Body className="text-center">
                          <FaRobot className="text-success mb-3" size={40} />
                          <h6>1. Detección Automática</h6>
                          <p className="small text-muted">
                            Analiza el historial y sugiere el tipo de expediente automáticamente.
                          </p>
                        </Card.Body>
                      </Card>
                    </Col>
                    <Col md={4}>
                      <Card className="border-info h-100">
                        <Card.Body className="text-center">
                          <FaChartLine className="text-info mb-3" size={40} />
                          <h6>2. Datos Previos</h6>
                          <p className="small text-muted">
                            Pre-llena información desde el último expediente y muestra evolución.
                          </p>
                        </Card.Body>
                      </Card>
                    </Col>
                    <Col md={4}>
                      <Card className="border-warning h-100">
                        <Card.Body className="text-center">
                          <FaTachometerAlt className="text-warning mb-3" size={40} />
                          <h6>3. Formulario Rápido</h6>
                          <p className="small text-muted">
                            Solo los campos esenciales - Adherencia, peso, presión y notas.
                          </p>
                        </Card.Body>
                      </Card>
                    </Col>
                  </Row>

                  <Alert variant="info" className="mt-4">
                    <h6 className="alert-heading">💡 ¿Cómo funciona?</h6>
                    <ol className="mb-0">
                      <li>El sistema detecta automáticamente que es un seguimiento</li>
                      <li>Muestra los datos de la última consulta para referencia</li>
                      <li>Pre-llena campos que no suelen cambiar (altura, alergias, etc.)</li>
                      <li>Genera comparativo automático al finalizar</li>
                    </ol>
                  </Alert>
                </Card.Body>
              </Card>
            </Tab.Pane>
          </Tab.Content>
        </Tab.Container>
      ) : viewMode === 'seguimiento-form' ? (
        // Formulario de Seguimiento
        <Row className="justify-content-center">
          <Col md={10} lg={8}>
            <FormularioSeguimiento
              patientId={patientId!}
              onSubmit={handleCreateSeguimiento}
              onCancel={() => {
                setViewMode('list');
                setActiveTab('expedientes');
              }}
              onVerExpedienteBase={handleVerExpedienteBase}
            />
          </Col>
        </Row>
      ) : (
        // Form or Detail View (existing code)
        <Row className="justify-content-center">
          <Col md={10} lg={8}>
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
          </Col>
        </Row>
      )}
    </Container>
  );
};

export default ClinicalRecordsPage; 