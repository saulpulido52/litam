import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Container, Row, Col, Card, Button, Alert, Breadcrumb } from 'react-bootstrap';
import ClinicalRecordDetail from '../components/ClinicalRecords/ClinicalRecordDetail';
import FormularioSeguimiento from '../components/ClinicalRecords/FormularioSeguimiento';
import DashboardSeguimiento from '../components/ClinicalRecords/DashboardSeguimiento';
import TimelineItem from '../components/ClinicalRecords/TimelineItem';
import { patientsService } from '../services/patientsService';
import { clinicalRecordsService } from '../services/clinicalRecordsService';
import type { ClinicalRecord } from '../types';

// React Icons
import {
  MdArrowBack,
  MdAdd,
  MdEdit,
  MdWarning,
  MdPerson,
  MdPhone
} from 'react-icons/md';
import { FaStethoscope, FaChartLine, FaUserCircle, FaClock } from 'react-icons/fa';

type ViewMode = 'list' | 'view' | 'create' | 'edit';

const SeguimientosPage: React.FC = () => {
  const { patientId } = useParams<{ patientId: string }>();
  const navigate = useNavigate();

  // Estados locales
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [selectedRecord, setSelectedRecord] = useState<ClinicalRecord | null>(null);
  const [patientData, setPatientData] = useState<any>(null);
  const [patientError, setPatientError] = useState<string | null>(null);

  // Data State
  const [records, setRecords] = useState<ClinicalRecord[]>([]);
  const [seguimientos, setSeguimientos] = useState<ClinicalRecord[]>([]);
  const [initialRecord, setInitialRecord] = useState<ClinicalRecord | null>(null);
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
        // Verificar si el paciente existe
        const patient = await patientsService.getPatientById(patientId);

        if (!patient) {
          setPatientError('Paciente no encontrado');
          return;
        }

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
      setRecords(recordsData);

      // 1. Identificar Expediente Inicial (Base)
      // Buscamos explícitamente 'inicial', o si no hay, el más antiguo
      const inicial = recordsData.find(r => r.tipo_expediente === 'inicial')
        || recordsData.sort((a, b) => new Date(a.record_date).getTime() - new Date(b.record_date).getTime())[0];

      setInitialRecord(inicial || null);

      // 2. Filtrar Seguimientos
      const seguimientosData = recordsData
        .filter(record => record.tipo_expediente === 'seguimiento')
        .sort((a, b) => new Date(b.record_date).getTime() - new Date(a.record_date).getTime()); // Más recientes primero

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
    // La lógica de creación se maneja dentro del componente FormularioSeguimiento
    // Aquí solo recargamos y volvemos a la lista
    await loadPatientRecords(patientId!);
    setViewMode('list');
  };

  const handleVerExpedienteBase = (expedienteId: string) => {
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
              <Breadcrumb>
                <Breadcrumb.Item linkAs={Link} linkProps={{ to: '/patients' }}>
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
                    <span className="small">
                      Historia Clínica Evolutiva
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
                    Historial Completo
                  </Button>
                  <Button
                    variant="success"
                    onClick={() => setViewMode('create')}
                    disabled={loading}
                    className="shadow-sm"
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
            <Card className="border-0 shadow-sm">
              <Card.Body>
                <Row className="align-items-center">
                  <Col md={6}>
                    <div className="d-flex align-items-center">
                      <div className="me-3 position-relative">
                        {patientData.profile_image ? (
                          <img
                            src={patientData.profile_image}
                            alt="Perfil"
                            className="rounded-circle shadow-sm"
                            style={{ width: '70px', height: '70px', objectFit: 'cover' }}
                          />
                        ) : (
                          <div className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center shadow-sm"
                            style={{ width: '70px', height: '70px' }}>
                            <FaUserCircle size={35} />
                          </div>
                        )}
                      </div>
                      <div>
                        <h4 className="mb-1 fw-bold text-dark">
                          {patientData.first_name} {patientData.last_name}
                        </h4>
                        <div className="d-flex align-items-center text-muted small">
                          <MdPerson className="me-1" />
                          <span className="me-3">ID: {patientData.id.slice(0, 8)}...</span>
                          {patientData.phone && (
                            <>
                              <MdPhone className="me-1" />
                              <span>{patientData.phone}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </Col>

                  {/* Dashboard rápido */}
                  <Col md={6}>
                    <DashboardSeguimiento />
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}

      {/* Content */}
      {viewMode === 'list' ? (
        <Row>
          <Col lg={10} className="mx-auto">
            {/* Timeline Section */}
            <div className="mt-4">
              <h5 className="mb-4 border-bottom pb-2 d-flex align-items-center">
                <FaClock className="me-2 text-primary" />
                Línea de Tiempo Clínica
              </h5>

              <div className="timeline-container px-3">
                {/* Seguimientos (Más recientes primero) */}
                {seguimientos.map((record, index) => (
                  <TimelineItem
                    key={record.id}
                    record={record}
                    onView={handleViewRecord}
                    onEdit={handleEditRecord}
                    // Pasamos el siguiente en la lista (que es el anterior cronológicamente) para comparar
                    previousRecord={seguimientos[index + 1] || initialRecord}
                  />
                ))}

                {/* Expediente Inicial (Siempre al final de la línea visual) */}
                {initialRecord ? (
                  <TimelineItem
                    record={initialRecord}
                    isInitial={true}
                    onView={handleViewRecord}
                    onEdit={handleEditRecord}
                  />
                ) : (
                  <Alert variant="warning" className="mt-3">
                    No se ha encontrado un Expediente Inicial. Se recomienda crear uno completo primero.
                  </Alert>
                )}

                {/* Estado: Listo para monitorear (si solo hay inicial) */}
                {initialRecord && seguimientos.length === 0 && (
                  <div className="text-center py-4 bg-light rounded mt-4 border border-dashed">
                    <FaChartLine size={30} className="text-success mb-2" />
                    <h5 className="text-muted">Listo para iniciar seguimiento</h5>
                    <p className="small text-muted mb-3">
                      Ya tienes la base. Registra el primer seguimiento para ver la evolución.
                    </p>
                    <Button variant="success" size="sm" onClick={() => setViewMode('create')}>
                      <MdAdd /> Registrar Evolución
                    </Button>
                  </div>
                )}
              </div>
            </div>
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
                Editar Expediente
              </Card.Header>
              <Card.Body>
                <div className="text-center py-5">
                  {/* Aquí podemos integrar el form de edición más adelante */}
                  <p className="text-muted mb-4">Para editar, por favor usa la vista de detalle completa.</p>
                  <Button variant="primary" onClick={() => {
                    // Navegar a la página de edición completa si es necesario, 
                    // o implementar el form de edición aquí.
                    // Por ahora, volvemos a la vista.
                    setViewMode('view');
                  }}>
                    Ir a Detalle para Editar
                  </Button>
                  <Button variant="outline-secondary" className="ms-2" onClick={() => setViewMode('list')}>
                    Cancelar
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