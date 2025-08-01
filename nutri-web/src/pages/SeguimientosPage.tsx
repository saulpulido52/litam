import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Container, Row, Col, Card, Button, Alert, Badge, Breadcrumb } from 'react-bootstrap';
import ClinicalRecordsList from '../components/ClinicalRecords/ClinicalRecordsList';
import ClinicalRecordDetail from '../components/ClinicalRecords/ClinicalRecordDetail';
import FormularioSeguimiento from '../components/ClinicalRecords/FormularioSeguimiento';
import { patientsService } from '../services/patientsService';
import { clinicalRecordsService } from '../services/clinicalRecordsService';
import type { ClinicalRecord } from '../types';

// React Icons
import { 
  MdArrowBack,
  MdAdd,
  MdEdit,
  MdWarning,
  MdPhone,
  MdPerson} from 'react-icons/md';
import { FaStethoscope, FaChartLine, FaUserCircle } from 'react-icons/fa';

type ViewMode = 'list' | 'view' | 'create' | 'edit';

const SeguimientosPage: React.FC = () => {
  const { patientId } = useParams<{ patientId: string }>();
  const navigate = useNavigate();
  
  // Estados locales
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [selectedRecord, setSelectedRecord] = useState<ClinicalRecord | null>(null);
  const [patientData, setPatientData] = useState<any>(null);
  const [patientError, setPatientError] = useState<string | null>(null);
  const [records, setRecords] = useState<ClinicalRecord[]>([]);
  const [seguimientos, setSeguimientos] = useState<ClinicalRecord[]>([]);
  const [loading, setLoading] = useState(false);
// Cargar datos del paciente
  useEffect(() => {
    const loadPatientData = async () => {
      if (!patientId) {
        setPatientError('ID de paciente no válido');
        return;
      }

      try {
        setLoading(true);
        console.log('🔍 Validando paciente ID:', patientId);

        // Verificar si el paciente existe
        console.log('🔍 Verificando existencia del paciente:', patientId);
        const patient = await patientsService.getPatientById(patientId);
        
        if (!patient) {
          setPatientError('Paciente no encontrado');
          return;
        }

        console.log('✅ Paciente encontrado:', patient.first_name, patient.last_name);
        setPatientData(patient);
        setPatientError(null);

        // Cargar expedientes del paciente
        await loadPatientRecords(patientId);

      } catch (error: any) {
        console.error('❌ Error cargando datos del paciente:', error);
        if (error.message?.includes('404') || error.message?.includes('not found')) {
          setPatientError('Paciente no encontrado');
        } else if (error.message?.includes('403') || error.message?.includes('unauthorized')) {
          setPatientError('No tienes permisos para ver este paciente');
        } else {
          setPatientError('Error al cargar los datos del paciente');
        }
      } finally {
        setLoading(false);
      }
    };

    loadPatientData();
  }, [patientId]);

  // Cargar expedientes del paciente
  const loadPatientRecords = async (patientId: string) => {
    try {
      setLoading(true);
      const recordsData = await clinicalRecordsService.getPatientRecords(patientId);
      console.log('✅ Expedientes cargados:', recordsData.length);
      setRecords(recordsData);
      
      // Filtrar solo seguimientos
      const seguimientosData = recordsData.filter(record => 
        record.tipo_expediente === 'seguimiento'
      );
      setSeguimientos(seguimientosData);
      
    } catch (error) {
      console.error('❌ Error cargando expedientes:', error);
    } finally {
      setLoading(false);
    }
  };

  // Handlers para acciones
  const handleViewRecord = (record: ClinicalRecord) => {
    setSelectedRecord(record);
    setViewMode('view');
  };

  const handleEditRecord = (record: ClinicalRecord) => {
    setSelectedRecord(record);
    setViewMode('edit');
  };

  const handleDeleteRecord = async (record: ClinicalRecord) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este seguimiento?')) {
      try {
        await clinicalRecordsService.deleteRecord(record.id);
        await loadPatientRecords(patientId!);
        alert('Seguimiento eliminado exitosamente');
      } catch (error) {
        console.error('Error eliminando seguimiento:', error);
        alert('Error al eliminar el seguimiento');
      }
    }
  };

  const handleCreateSeguimiento = async (_data: any) => {
    // Función comentada temporalmente
  };

  // const handleUpdateRecord = async (_recordId: string, _data: UpdateClinicalRecordDto) => {
  //   // Función comentada temporalmente
  // };

  const handleVerExpedienteBase = (expedienteId: string) => {
    // Buscar el expediente en la lista completa y mostrarlo
    const expedienteBase = records.find(record => record.id === expedienteId);
    if (expedienteBase) {
      setSelectedRecord(expedienteBase);
      setViewMode('view');
    } else {
      console.warn('Expediente base no encontrado:', expedienteId);
    }
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
              <Card.Body>
                <Alert variant="danger">
                  <strong>Error:</strong> {patientError}
                </Alert>
                <div className="d-flex gap-2">
                  <Button variant="outline-primary" onClick={() => navigate('/patients')}>
                    <MdArrowBack className="me-2" />
                    Volver a Pacientes
                  </Button>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    );
  }

  return (
    <Container fluid className="py-4">
      {/* Header */}
      <Row className="mb-4">
        <Col>
          <div className="d-flex justify-content-between align-items-center">
            <div>
              {/* Breadcrumb */}
              <Breadcrumb>
                <Breadcrumb.Item linkAs={Link} linkProps={{ to: '/patients' }}>
                  {/* <MdHome className="me-1" /> */}
                  Pacientes
                </Breadcrumb.Item>
                <Breadcrumb.Item 
                  linkAs={Link} 
                  linkProps={{ to: `/patients/${patientId}/clinical-records` }}
                >
                  Expedientes
                </Breadcrumb.Item>
                <Breadcrumb.Item active>
                  <FaStethoscope className="me-1" />
                  Seguimientos
                </Breadcrumb.Item>
              </Breadcrumb>

              <div className="d-flex align-items-center">
                <FaStethoscope className="text-success me-3" size={32} />
                <div>
                  <h1 className="h3 mb-1">
                    Seguimientos de {patientData?.first_name} {patientData?.last_name}
                  </h1>
                  <div className="d-flex align-items-center text-muted">
                    <Badge bg="success" className="me-2">
                      <FaStethoscope className="me-1" />
                      {seguimientos.length} Seguimiento{seguimientos.length !== 1 ? 's' : ''}
                    </Badge>
                    <span className="small">
                      Vista especializada para expedientes de seguimiento
                    </span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="d-flex gap-2">
              {viewMode === 'list' && (
                <>
                  <Button 
                    variant="outline-primary" 
                    onClick={() => navigate(`/patients/${patientId}/clinical-records`)}
                  >
                    <FaChartLine className="me-2" />
                    Ver Todos los Expedientes
                  </Button>
                  <Button 
                    variant="success" 
                    onClick={() => setViewMode('create')}
                    disabled={loading}
                  >
                    <MdAdd className="me-2" />
                    Nuevo Seguimiento
                  </Button>
                </>
              )}
              
              {viewMode !== 'list' && (
                <Button variant="outline-secondary" onClick={() => setViewMode('list')}>
                  <MdArrowBack className="me-2" />
                  Volver a Lista
                </Button>
              )}
            </div>
          </div>
        </Col>
      </Row>

      {/* Información del paciente */}
      {patientData && viewMode === 'list' && (
        <Row className="mb-4">
          <Col>
            <Card className="border-info">
              <Card.Body>
                <Row className="align-items-center">
                  <Col md={8}>
                    <div className="d-flex align-items-center">
                      <div className="me-3">
                        {patientData.profile_image ? (
                          <img 
                            src={patientData.profile_image} 
                            alt="Perfil"
                            className="rounded-circle"
                            style={{ width: '60px', height: '60px', objectFit: 'cover' }}
                          />
                        ) : (
                          <div className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center" 
                               style={{ width: '60px', height: '60px' }}>
                            <FaUserCircle size={30} />
                          </div>
                        )}
                      </div>
                      <div>
                        <h5 className="mb-1">
                          {patientData.first_name} {patientData.last_name}
                        </h5>
                        <div className="d-flex align-items-center text-muted">
                          <MdPerson className="me-1" />
                          <span className="me-3">ID: {patientData.id}</span>
                          {patientData.phone && (
                            <>
                              <MdPhone className="me-1" />
                              <span className="me-3">{patientData.phone}</span>
                            </>
                          )}
                          {patientData.gender && (
                            <>
                              {patientData.gender === 'male' && <span className="me-1">♂</span>}
                              {patientData.gender === 'female' && <span className="me-1">♀</span>}
                              {patientData.gender === 'other' && <span className="me-1">⚧</span>}
                              <span>{patientData.gender === 'male' ? 'Masculino' : patientData.gender === 'female' ? 'Femenino' : 'Otro'}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </Col>
                  <Col md={4} className="text-end">
                    <div className="text-muted small">
                      <div>Total de Expedientes: <strong>{records.length}</strong></div>
                      <div>Seguimientos: <strong>{seguimientos.length}</strong></div>
                      <div>Otros tipos: <strong>{records.length - seguimientos.length}</strong></div>
                    </div>
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}

      {/* Content */}
      {viewMode === 'list' ? (
        // Lista de seguimientos
        <Row>
          <Col>
            <Card>
              <Card.Header>
                <div className="d-flex justify-content-between align-items-center">
                  <h5 className="mb-0">
                    <FaStethoscope className="me-2" />
                    Seguimientos del Paciente
                  </h5>
                  <Badge bg="success" className="fs-6">
                    {seguimientos.length}
                  </Badge>
                </div>
              </Card.Header>
              <Card.Body>
                {seguimientos.length === 0 ? (
                  <div className="text-center py-5">
                    <FaStethoscope className="text-muted mb-3" size={48} />
                    <h4 className="text-muted mb-3">No hay seguimientos registrados</h4>
                    <p className="text-muted mb-4">
                      Este paciente aún no tiene expedientes de seguimiento. 
                      Los seguimientos permiten hacer un registro rápido y comparativo de la evolución del paciente.
                    </p>
                    <div className="d-flex gap-2 justify-content-center">
                      <Button variant="success" onClick={() => setViewMode('create')}>
                        <MdAdd className="me-2" />
                        Crear Primer Seguimiento
                      </Button>
                      <Button 
                        variant="outline-primary" 
                        onClick={() => navigate(`/patients/${patientId}/clinical-records`)}
                      >
                        Ver Todos los Expedientes
                      </Button>
                    </div>
                  </div>
                ) : (
                  <ClinicalRecordsList
                    records={seguimientos}
                    loading={loading}
                    onViewRecord={handleViewRecord}
                    onEditRecord={handleEditRecord}
                    onDeleteRecord={handleDeleteRecord}
                  />
                )}
              </Card.Body>
            </Card>
          </Col>
        </Row>
      ) : viewMode === 'create' ? (
        // Crear nuevo seguimiento
        <Row className="justify-content-center">
          <Col md={10} lg={8}>
            <FormularioSeguimiento
              patientId={patientId!}
              onSubmit={handleCreateSeguimiento}
              onCancel={() => setViewMode('list')}
              onVerExpedienteBase={handleVerExpedienteBase}
            />
          </Col>
        </Row>
      ) : viewMode === 'view' && selectedRecord ? (
        // Ver detalle del seguimiento
        <Row className="justify-content-center">
          <Col md={10} lg={8}>
            <ClinicalRecordDetail
              record={selectedRecord}
              onEdit={() => setViewMode('edit')}
              onDelete={() => handleDeleteRecord(selectedRecord)}
              canEdit={true}
              canDelete={true}
            />
          </Col>
        </Row>
      ) : viewMode === 'edit' && selectedRecord ? (
        // Editar seguimiento
        <Row className="justify-content-center">
          <Col md={10} lg={8}>
            <Card>
              <Card.Header className="bg-warning text-dark">
                <MdEdit className="me-2" />
                Editar Seguimiento
              </Card.Header>
              <Card.Body>
                <Alert variant="info">
                  <strong>Editando seguimiento del {new Date(selectedRecord.record_date).toLocaleDateString()}</strong>
                  <br />
                  Los cambios se guardarán inmediatamente al confirmar.
                </Alert>
                {/* Aquí iría un formulario de edición específico para seguimientos */}
                <div className="text-center py-4">
                  <p className="text-muted">Funcionalidad de edición en desarrollo</p>
                  <Button variant="outline-secondary" onClick={() => setViewMode('list')}>
                    Volver a Lista
                  </Button>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      ) : null}
    </Container>
  );
};

export default SeguimientosPage; 