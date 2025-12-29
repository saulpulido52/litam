import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Button, Nav, Tab, Form, Alert, Badge } from 'react-bootstrap';
import DashboardSeguimiento from '../components/ClinicalRecords/DashboardSeguimiento';
import { patientsService } from '../services/patientsService';
import { FaRobot, FaStethoscope, FaChartLine, FaBrain, FaMagic, FaArrowRight, FaTachometerAlt, FaStar, FaUserCircle } from 'react-icons/fa';

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
    <div className="bg-light min-vh-100">
      {/* Hero Section */}
      <div className="bg-white pb-5 pt-4 shadow-sm mb-5 position-relative overflow-hidden">
        <Container>
          <Row className="align-items-center">
            <Col lg={7}>
              <div className="d-flex align-items-center mb-3">
                <div className="bg-primary bg-opacity-10 p-2 rounded-circle me-3">
                  <FaBrain className="text-primary" size={32} />
                </div>
                <span className="text-primary fw-bold letter-spacing-1 text-uppercase small">Sistema Inteligente</span>
              </div>
              <h1 className="display-4 fw-bold mb-3 text-dark">
                Expedientes <span className="text-primary">Evolutivos</span>
              </h1>
              <p className="lead text-secondary mb-4" style={{ maxWidth: '600px' }}>
                Potenciado por IA para detectar automáticamente el contexto, comparar evoluciones y reducir tu tiempo de consulta administrativa en un <span className="fw-bold text-dark">75%</span>.
              </p>
              <div className="d-flex gap-3">
                <Button variant="primary" size="lg" className="px-4 shadow-sm rounded-pill" onClick={() => setActiveTab('seguimiento')}>
                  <FaMagic className="me-2" />
                  Probar Ahora
                </Button>
                <Button variant="outline-dark" size="lg" className="px-4 rounded-pill" onClick={() => setActiveTab('dashboard')}>
                  Ver Analytics
                </Button>
              </div>
            </Col>
            <Col lg={5} className="d-none d-lg-block">
              <div className="position-relative">
                <div className="position-absolute top-0 start-50 translate-middle rounded-circle bg-primary opacity-10 blur-3xl" style={{ width: '300px', height: '300px', filter: 'blur(80px)' }}></div>
                <Card className="border-0 shadow-lg position-relative bg-white/80 backdrop-blur">
                  <Card.Body className="p-4">
                    <div className="d-flex align-items-center mb-4">
                      <div className="bg-success text-white rounded-circle p-3 me-3">
                        <FaRobot size={24} />
                      </div>
                      <div>
                        <h5 className="mb-0 fw-bold">Análisis en Tiempo Real</h5>
                        <small className="text-muted">Procesando historial clínico...</small>
                      </div>
                    </div>
                    <div className="border-start border-3 border-success ps-3 mb-3">
                      <small className="text-uppercase fw-bold text-success display-6 d-block mb-1">98%</small>
                      <span className="text-muted small">Precisión en detección de tipo de expediente</span>
                    </div>
                    <div className="border-start border-3 border-primary ps-3">
                      <small className="text-uppercase fw-bold text-primary display-6 d-block mb-1">-15 min</small>
                      <span className="text-muted small">Ahorro promedio por consulta</span>
                    </div>
                  </Card.Body>
                </Card>
              </div>
            </Col>
          </Row>
        </Container>
      </div>

      <Container className="pb-5">

        {/* Features Cards */}
        <Row className="mb-5 g-4">
          {[
            { icon: FaRobot, color: 'success', title: 'Detección Automática', desc: 'IA identifica el tipo de encuentro basado en el historial.' },
            { icon: FaChartLine, color: 'info', title: 'Comparativas', desc: 'Gráficos de evolución instantáneos entre consultas.' },
            { icon: FaStethoscope, color: 'warning', title: 'Seguimiento Rápido', desc: 'Formularios adaptativos que aprenden de tus hábitos.' },
            { icon: FaTachometerAlt, color: 'primary', title: 'Analytics', desc: 'Métricas de rendimiento de tu práctica profesional.' }
          ].map((feature, idx) => (
            <Col md={3} key={idx}>
              <Card className="h-100 border-0 shadow-sm hover-shadow transition-all bg-white">
                <Card.Body className="text-center p-4">
                  <div className={`bg-${feature.color} bg-opacity-10 text-${feature.color} rounded-circle d-inline-flex p-3 mb-3`}>
                    <feature.icon size={28} />
                  </div>
                  <h6 className="fw-bold mb-2">{feature.title}</h6>
                  <p className="small text-muted mb-0">{feature.desc}</p>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>

        {/* Navigation Tabs */}
        <div className="bg-white rounded-4 shadow-sm p-2 mb-4 d-inline-block w-100">
          <Nav
            variant="pills"
            activeKey={activeTab}
            onSelect={(key) => setActiveTab(key || 'dashboard')}
            className="justify-content-center nav-pills-custom"
          >
            <Nav.Item>
              <Nav.Link eventKey="dashboard" className="px-4 py-2 fw-medium rounded-pill">
                <FaTachometerAlt className="me-2" />
                Dashboard General
              </Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link eventKey="expedientes" className="px-4 py-2 fw-medium rounded-pill">
                <FaStethoscope className="me-2" />
                Gestión de Expedientes
              </Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link eventKey="seguimiento" className="px-4 py-2 fw-medium rounded-pill">
                <FaMagic className="me-2" />
                Seguimiento Inteligente
              </Nav.Link>
            </Nav.Item>
          </Nav>
        </div>

        {/* Tab Content */}
        <Tab.Container activeKey={activeTab}>
          <Tab.Content>
            {/* Dashboard Tab */}
            <Tab.Pane eventKey="dashboard">
              <DashboardSeguimiento />
            </Tab.Pane>

            {/* Gestión de Expedientes Tab */}
            <Tab.Pane eventKey="expedientes">
              <Card className="border-0 shadow-sm">
                <Card.Body className="p-4">
                  <div className="d-flex align-items-center mb-4 border-bottom pb-4">
                    <div className="bg-primary text-white rounded p-3 me-3 shadow-sm">
                      <FaStethoscope size={24} />
                    </div>
                    <div>
                      <h4 className="mb-0 fw-bold">Gestión Centralizada</h4>
                      <p className="text-muted mb-0">Administra los expedientes de tus pacientes desde un solo lugar</p>
                    </div>
                  </div>

                  <Row className="mb-4 justify-content-center">
                    <Col md={8}>
                      <Card className="bg-light border-0">
                        <Card.Body>
                          <Form.Group>
                            <Form.Label className="fw-bold text-muted small text-uppercase">Seleccionar Paciente</Form.Label>
                            <div className="d-flex gap-2">
                              <Form.Select
                                value={selectedPatient}
                                onChange={(e) => setSelectedPatient(e.target.value)}
                                disabled={loading}
                                className="form-control-lg border-0 shadow-sm"
                              >
                                <option value="">Buscar paciente por nombre...</option>
                                {patients.map(patient => (
                                  <option key={patient.id} value={patient.id}>
                                    {getPatientName(patient)} {patient.phone && `- ${patient.phone}`}
                                  </option>
                                ))}
                              </Form.Select>
                              <Button
                                variant="primary"
                                onClick={handleViewPatientRecords}
                                disabled={!selectedPatient}
                                className="px-4 shadow-sm"
                              >
                                <FaArrowRight />
                              </Button>
                            </div>
                          </Form.Group>
                        </Card.Body>
                      </Card>
                    </Col>
                  </Row>

                  {selectedPatient && (
                    <Alert variant="info" className="border-0 bg-info bg-opacity-10 text-info shadow-sm mb-4">
                      <FaUserCircle className="me-2" />
                      <strong>Paciente seleccionado:</strong> {getPatientName(patients.find(p => p.id === selectedPatient) || {} as Patient)}
                    </Alert>
                  )}

                  <Row className="g-4">
                    <Col md={6}>
                      <Card className="border-0 shadow-sm h-100 bg-success bg-opacity-10 cursor-pointer hover-lift" onClick={handleViewPatientRecords}>
                        <Card.Body className="p-4 text-center">
                          <div className="bg-white p-3 rounded-circle d-inline-block shadow-sm mb-3">
                            <FaStethoscope className="text-success" size={32} />
                          </div>
                          <h5 className="fw-bold text-success">Expedientes Tradicionales</h5>
                          <p className="text-muted small mb-0">
                            Gestión completa y detallada. Ideal para primeras consultas exhaustivas.
                          </p>
                        </Card.Body>
                      </Card>
                    </Col>
                    <Col md={6}>
                      <Card
                        className="border-0 shadow-sm h-100 bg-warning bg-opacity-10 cursor-pointer hover-lift"
                        onClick={() => {
                          if (selectedPatient) setActiveTab('seguimiento');
                        }}
                        style={{ opacity: selectedPatient ? 1 : 0.6 }}
                      >
                        <Card.Body className="p-4 text-center">
                          <div className="bg-white p-3 rounded-circle d-inline-block shadow-sm mb-3">
                            <FaMagic className="text-warning" size={32} />
                          </div>
                          <h5 className="fw-bold text-warning">Modo Inteligente</h5>
                          <p className="text-muted small mb-0">
                            Flujos automatizados y asistidos por IA. Recomendado para seguimientos.
                          </p>
                        </Card.Body>
                      </Card>
                    </Col>
                  </Row>
                </Card.Body>
              </Card>
            </Tab.Pane>

            {/* Seguimiento Inteligente Tab */}
            <Tab.Pane eventKey="seguimiento">
              <Card className="border-0 shadow-lg overflow-hidden">
                <div className="bg-gradient-primary p-1"></div> {/** Top color accent */}
                <Card.Body className="p-5">
                  <Row className="align-items-center mb-5">
                    <Col md={7}>
                      <Badge bg="success" className="mb-2 px-3 py-2 rounded-pill fw-normal">
                        <FaMagic className="me-1" /> IA Activada
                      </Badge>
                      <h2 className="fw-bold mb-3">Seguimiento Inteligente</h2>
                      <p className="lead text-muted mb-4">
                        Nuestro algoritmo detecta automáticamente el contexto del paciente, pre-llena la información redundante y se enfoca en las variaciones críticas.
                      </p>
                      <div className="d-flex gap-3 text-secondary small">
                        <span className="d-flex align-items-center"><FaStar className="text-warning me-1" /> Sin fricción</span>
                        <span className="d-flex align-items-center"><FaStar className="text-warning me-1" /> Rapidez</span>
                        <span className="d-flex align-items-center"><FaStar className="text-warning me-1" /> Precisión</span>
                      </div>
                    </Col>
                    <Col md={5}>
                      <Card className="bg-light border-0 shadow-inner">
                        <Card.Body>
                          <Form.Group className="mb-3">
                            <Form.Label className="fw-bold">Seleccionar Paciente para Análisis</Form.Label>
                            <Form.Select
                              value={selectedPatient}
                              onChange={(e) => setSelectedPatient(e.target.value)}
                              disabled={loading}
                              className="form-control-lg shadow-sm border-0"
                            >
                              <option value="">Elegir paciente...</option>
                              {patients.map(patient => (
                                <option key={patient.id} value={patient.id}>
                                  {getPatientName(patient)}
                                </option>
                              ))}
                            </Form.Select>
                          </Form.Group>
                          <Button
                            variant="success"
                            size="lg"
                            className="w-100 shadow rounded-pill text-uppercase fw-bold letter-spacing-1"
                            onClick={handleCreateSeguimiento}
                            disabled={!selectedPatient}
                          >
                            Iniciar Análisis <FaArrowRight className="ms-2" />
                          </Button>
                        </Card.Body>
                      </Card>
                    </Col>
                  </Row>

                  <Row className="g-4">
                    <Col md={4}>
                      <div className="p-4 rounded-4 bg-white border border-light shadow-sm text-center h-100 hover-scale">
                        <div className="mb-3 text-success">
                          <FaRobot size={40} />
                        </div>
                        <h6 className="fw-bold">1. Detección Contextual</h6>
                        <p className="text-muted small">
                          Identificamos si es una urgencia, control o seguimiento rutinario automáticamente.
                        </p>
                      </div>
                    </Col>
                    <Col md={4}>
                      <div className="p-4 rounded-4 bg-white border border-light shadow-sm text-center h-100 hover-scale">
                        <div className="mb-3 text-info">
                          <FaChartLine size={40} />
                        </div>
                        <h6 className="fw-bold">2. Pre-llenado Adaptativo</h6>
                        <p className="text-muted small">
                          Traemos los datos relevantes de la última sesión para que no tengas que reescribirlos.
                        </p>
                      </div>
                    </Col>
                    <Col md={4}>
                      <div className="p-4 rounded-4 bg-white border border-light shadow-sm text-center h-100 hover-scale">
                        <div className="mb-3 text-warning">
                          <FaTachometerAlt size={40} />
                        </div>
                        <h6 className="fw-bold">3. Comparativo Instantáneo</h6>
                        <p className="text-muted small">
                          Generamos gráficos de evolución en tiempo real sobre peso, IMC y adherencia.
                        </p>
                      </div>
                    </Col>
                  </Row>
                </Card.Body>
              </Card>
            </Tab.Pane>
          </Tab.Content>
        </Tab.Container>
      </Container>

      <style>
        {`
        .bg-gradient-primary {
            background: linear-gradient(90deg, #4e54c8 0%, #8f94fb 100%);
        }
        .text-primary { color: #4e54c8 !important; }
        .btn-primary { background-color: #4e54c8; border-color: #4e54c8; }
        .btn-outline-primary { color: #4e54c8; border-color: #4e54c8; }
        .btn-outline-primary:hover { background-color: #4e54c8; color: white; }
        
        .nav-pills-custom .nav-link {
            color: #6c757d;
            background: transparent;
            transition: all 0.3s ease;
        }
        .nav-pills-custom .nav-link.active {
            color: #fff;
            background-color: #4e54c8;
            box-shadow: 0 4px 6px rgba(78, 84, 200, 0.25);
        }
        .hover-lift { transition: transform 0.2s; }
        .hover-lift:hover { transform: translateY(-5px); }
        .letter-spacing-1 { letter-spacing: 1px; }
        .hover-shadow:hover { box-shadow: 0 .5rem 1rem rgba(0,0,0,.15)!important; }
        `}
      </style>
    </div>
  );
};

export default ExpedientesInteligentesPage; 