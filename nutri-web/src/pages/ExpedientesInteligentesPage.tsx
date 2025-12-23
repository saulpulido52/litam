import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Button, Nav, Tab, Form, Alert, Badge } from 'react-bootstrap';
import DashboardSeguimiento from '../components/ClinicalRecords/DashboardSeguimiento';
import { patientsService } from '../services/patientsService';
import { FaRobot, FaStethoscope, FaChartLine, FaBrain, FaMagic, FaArrowRight, FaTachometerAlt } from 'react-icons/fa';

interface Patient {
  id: string;
  first_name: string;
  last_name: string;
  phone?: string;
  expedientes_count?: number;
}

const ExpedientesInteligentesPage: React.FC = () => {
  const navigate = useNavigate();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<string>('dashboard');

  useEffect(() => {
    const loadPatients = async () => {
      try {
        const patientsData = await patientsService.getMyPatients();
        setPatients(patientsData);
      } catch (error) {
        console.error('Error loading patients:', error);
      } finally {
        setLoading(false);
      }
    };

    loadPatients();
  }, []);

  const handleCreateSeguimiento = () => {
    if (!selectedPatient) {
      alert('Por favor selecciona un paciente primero');
      return;
    }
    navigate(`/patients/${selectedPatient}/clinical-records?tab=seguimiento`);
  };

  const handleViewPatientRecords = () => {
    if (!selectedPatient) {
      alert('Por favor selecciona un paciente primero');
      return;
    }
    navigate(`/patients/${selectedPatient}/clinical-records`);
  };

  const getPatientName = (patient: Patient) => {
    return `${patient.first_name} ${patient.last_name}`;
  };

  return (
    <Container fluid className="py-4">
      {/* Header */}
      <Row className="mb-4">
        <Col>
          <div className="text-center">
            <div className="d-flex justify-content-center align-items-center mb-3">
              <FaBrain className="text-primary me-3" size={40} />
              <h1 className="h2 mb-0">Expedientes Inteligentes</h1>
              <FaMagic className="text-warning ms-3" size={32} />
            </div>
            <p className="text-muted lead">
              Sistema automatizado e inteligente para expedientes clínicos - Reduciendo el tiempo de consulta en 75%
            </p>
          </div>
        </Col>
      </Row>

      {/* Features Overview */}
      <Row className="mb-4">
        <Col md={3}>
          <Card className="border-success h-100 text-center">
            <Card.Body>
              <FaRobot className="text-success mb-3" size={48} />
              <h5>Detección Automática</h5>
              <p className="small text-muted">
                IA detecta automáticamente el tipo de expediente basado en historial
              </p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="border-info h-100 text-center">
            <Card.Body>
              <FaChartLine className="text-info mb-3" size={48} />
              <h5>Comparativos Automáticos</h5>
              <p className="small text-muted">
                Compara automáticamente mediciones entre consultas
              </p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="border-warning h-100 text-center">
            <Card.Body>
              <FaStethoscope className="text-warning mb-3" size={48} />
              <h5>Seguimientos Rápidos</h5>
              <p className="small text-muted">
                Formularios simplificados de 5 minutos vs 20 minutos tradicionales
              </p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="border-primary h-100 text-center">
            <Card.Body>
              <FaTachometerAlt className="text-primary mb-3" size={48} />
              <h5>Analytics Inteligentes</h5>
              <p className="small text-muted">
                Dashboard con métricas y estadísticas automáticas
              </p>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Navigation Tabs */}
      <Row className="mb-4">
        <Col>
          <Nav variant="tabs" activeKey={activeTab} onSelect={(key) => setActiveTab(key || 'dashboard')}>
            <Nav.Item>
              <Nav.Link eventKey="dashboard">
                <FaTachometerAlt className="me-2" />
                Dashboard General
              </Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link eventKey="expedientes">
                <FaStethoscope className="me-2" />
                Gestión de Expedientes
              </Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link eventKey="seguimiento">
                <FaRobot className="me-2" />
                Seguimiento Inteligente
              </Nav.Link>
            </Nav.Item>
          </Nav>
        </Col>
      </Row>

      {/* Tab Content */}
      <Tab.Container activeKey={activeTab}>
        <Tab.Content>
          {/* Dashboard Tab */}
          <Tab.Pane eventKey="dashboard">
            <DashboardSeguimiento />
          </Tab.Pane>

          {/* Gestión de Expedientes Tab */}
          <Tab.Pane eventKey="expedientes">
            <Card>
              <Card.Header className="bg-primary text-white">
                <FaStethoscope className="me-2" />
                Gestión de Expedientes por Paciente
              </Card.Header>
              <Card.Body>
                <Row className="mb-4">
                  <Col md={8}>
                    <Form.Group>
                      <Form.Label>Seleccionar Paciente</Form.Label>
                      <Form.Select 
                        value={selectedPatient} 
                        onChange={(e) => setSelectedPatient(e.target.value)}
                        disabled={loading}
                      >
                        <option value="">Selecciona un paciente...</option>
                        {patients.map(patient => (
                          <option key={patient.id} value={patient.id}>
                            {getPatientName(patient)} {patient.phone && `- ${patient.phone}`}
                          </option>
                        ))}
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  <Col md={4} className="d-flex align-items-end">
                    <Button 
                      variant="primary" 
                      onClick={handleViewPatientRecords}
                      disabled={!selectedPatient}
                      className="w-100"
                    >
                      Ver Expedientes
                      <FaArrowRight className="ms-2" />
                    </Button>
                  </Col>
                </Row>

                {selectedPatient && (
                  <Alert variant="info">
                    <strong>Paciente seleccionado:</strong> {getPatientName(patients.find(p => p.id === selectedPatient) || {} as Patient)}
                    <br />
                    Podrás acceder a todas las funcionalidades automáticas para este paciente.
                  </Alert>
                )}

                <Row>
                  <Col md={6}>
                    <Card className="border-success">
                      <Card.Body>
                        <h6 className="text-success">Expedientes Tradicionales</h6>
                        <p className="small text-muted mb-3">
                          Crear expedientes completos con todos los campos y evaluaciones detalladas.
                        </p>
                        <div className="d-grid">
                          <Button 
                            variant="outline-success" 
                            disabled={!selectedPatient}
                            onClick={handleViewPatientRecords}
                          >
                            Gestionar Expedientes Completos
                          </Button>
                        </div>
                      </Card.Body>
                    </Card>
                  </Col>
                  <Col md={6}>
                    <Card className="border-warning">
                      <Card.Body>
                        <h6 className="text-warning">Expedientes Inteligentes</h6>
                        <p className="small text-muted mb-3">
                          Acceder a funcionalidades automáticas: detección, comparativos y seguimientos rápidos.
                        </p>
                        <div className="d-grid">
                          <Button 
                            variant="outline-warning" 
                            disabled={!selectedPatient}
                            onClick={() => setActiveTab('seguimiento')}
                          >
                            Usar Funciones Inteligentes
                          </Button>
                        </div>
                      </Card.Body>
                    </Card>
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          </Tab.Pane>

          {/* Seguimiento Inteligente Tab */}
          <Tab.Pane eventKey="seguimiento">
            <Card>
              <Card.Header className="bg-success text-white">
                <FaRobot className="me-2" />
                Seguimiento Automático e Inteligente
              </Card.Header>
              <Card.Body>
                <Row className="mb-4">
                  <Col md={8}>
                    <h5>Crear Seguimiento Optimizado con IA</h5>
                    <p className="text-muted">
                      El sistema detecta automáticamente el tipo de expediente, pre-llena información 
                      basada en consultas anteriores y genera comparativos automáticos. Reduce el tiempo 
                      de consulta de 20 a 5 minutos.
                    </p>
                  </Col>
                  <Col md={4}>
                    <Form.Group className="mb-3">
                      <Form.Label>Seleccionar Paciente</Form.Label>
                      <Form.Select 
                        value={selectedPatient} 
                        onChange={(e) => setSelectedPatient(e.target.value)}
                        disabled={loading}
                      >
                        <option value="">Selecciona un paciente...</option>
                        {patients.map(patient => (
                          <option key={patient.id} value={patient.id}>
                            {getPatientName(patient)}
                          </option>
                        ))}
                      </Form.Select>
                    </Form.Group>
                  </Col>
                </Row>

                <Row className="mb-4">
                  <Col>
                    <div className="d-grid">
                      <Button 
                        variant="success" 
                        size="lg"
                        onClick={handleCreateSeguimiento}
                        disabled={!selectedPatient}
                      >
                        <FaMagic className="me-2" />
                        Iniciar Seguimiento Inteligente
                        <FaArrowRight className="ms-2" />
                      </Button>
                    </div>
                  </Col>
                </Row>

                {!selectedPatient && (
                  <Alert variant="warning">
                    <strong>Nota:</strong> Selecciona un paciente para activar las funcionalidades inteligentes.
                  </Alert>
                )}

                <Row>
                  <Col md={4}>
                    <Card className="border-success h-100">
                      <Card.Body className="text-center">
                        <FaRobot className="text-success mb-3" size={40} />
                        <h6>1. Detección Automática</h6>
                        <p className="small text-muted">
                          La IA analiza el historial y determina si es seguimiento, control, urgencia, etc.
                        </p>
                        <Badge bg="success">Automático</Badge>
                      </Card.Body>
                    </Card>
                  </Col>
                  <Col md={4}>
                    <Card className="border-info h-100">
                      <Card.Body className="text-center">
                        <FaChartLine className="text-info mb-3" size={40} />
                        <h6>2. Pre-llenado Inteligente</h6>
                        <p className="small text-muted">
                          Recupera automáticamente datos previos y sugiere campos basado en el historial.
                        </p>
                        <Badge bg="info">Inteligente</Badge>
                      </Card.Body>
                    </Card>
                  </Col>
                  <Col md={4}>
                    <Card className="border-warning h-100">
                      <Card.Body className="text-center">
                        <FaTachometerAlt className="text-warning mb-3" size={40} />
                        <h6>3. Comparativo Automático</h6>
                        <p className="small text-muted">
                          Genera automáticamente comparaciones con consultas anteriores y tendencias.
                        </p>
                        <Badge bg="warning">Comparativo</Badge>
                      </Card.Body>
                    </Card>
                  </Col>
                </Row>

                <Row className="mt-4">
                  <Col>
                    <Alert variant="success">
                      <h6 className="alert-heading">Beneficios del Sistema Inteligente:</h6>
                      <ul className="mb-0">
                        <li><strong>75% menos tiempo</strong> en consultas de seguimiento</li>
                        <li><strong>Detección automática</strong> del tipo de expediente</li>
                        <li><strong>Comparativos automáticos</strong> de evolución</li>
                        <li><strong>Pre-llenado inteligente</strong> de formularios</li>
                        <li><strong>Dashboard analytics</strong> con métricas automáticas</li>
                      </ul>
                    </Alert>
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          </Tab.Pane>
        </Tab.Content>
      </Tab.Container>
    </Container>
  );
};

export default ExpedientesInteligentesPage; 