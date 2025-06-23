import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Spinner, Navbar, Nav } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simular carga de datos
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    navigate('/');
  };

  const testBackendConnection = async () => {
    try {
      const response = await fetch('http://localhost:4000/api/health');
      if (response.ok) {
        alert('✅ Conexión con backend exitosa');
      } else {
        alert('❌ Error en la conexión');
      }
    } catch (error) {
      alert('❌ No se pudo conectar al backend');
    }
  };

  return (
    <div className="bg-light min-vh-100">
      {/* Navbar */}
      <Navbar bg="primary" variant="dark" expand="lg" className="nutri-bg-primary">
        <Container>
          <Navbar.Brand className="fw-bold">
            🥗 Nutri Dashboard
          </Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="me-auto">
              <Nav.Link active>📊 Dashboard</Nav.Link>
              <Nav.Link>👥 Mis Pacientes</Nav.Link>
              <Nav.Link>📅 Citas</Nav.Link>
              <Nav.Link>🍎 Planes Nutricionales</Nav.Link>
              <Nav.Link>📈 Reportes</Nav.Link>
            </Nav>
            <Nav>
              <Nav.Link onClick={testBackendConnection}>
                🔧 Test API
              </Nav.Link>
              <Nav.Link onClick={handleLogout}>
                🚪 Salir
              </Nav.Link>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      <Container className="py-4">
        {/* Bienvenida */}
        <Row className="mb-4">
          <Col>
            <Card className="nutri-card">
              <Card.Body>
                <h2 className="nutri-primary mb-1">
                  ¡Bienvenido, Dr. Usuario! 👋
                </h2>
                <p className="text-muted mb-0">
                  Nutriólogo • nutritionist@demo.com
                </p>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {loading ? (
          <div className="text-center py-5">
            <Spinner animation="border" variant="primary" />
            <p className="mt-2 text-muted">Cargando dashboard...</p>
          </div>
        ) : (
          <>
            {/* Estadísticas */}
            <Row className="mb-4">
              <Col md={4} className="mb-3">
                <Card className="nutri-card h-100 border-primary">
                  <Card.Body className="text-center">
                    <div className="fs-1 nutri-primary mb-2">👥</div>
                    <h3 className="nutri-primary">45</h3>
                    <p className="text-muted mb-0">Total Pacientes</p>
                  </Card.Body>
                </Card>
              </Col>
              <Col md={4} className="mb-3">
                <Card className="nutri-card h-100 border-info">
                  <Card.Body className="text-center">
                    <div className="fs-1 text-info mb-2">📅</div>
                    <h3 className="text-info">128</h3>
                    <p className="text-muted mb-0">Citas Realizadas</p>
                  </Card.Body>
                </Card>
              </Col>
              <Col md={4} className="mb-3">
                <Card className="nutri-card h-100 border-warning">
                  <Card.Body className="text-center">
                    <div className="fs-1 text-warning mb-2">⏰</div>
                    <h3 className="text-warning">3</h3>
                    <p className="text-muted mb-0">Citas Hoy</p>
                  </Card.Body>
                </Card>
              </Col>
            </Row>

            {/* Acciones Rápidas */}
            <Row className="mb-4">
              <Col>
                <Card className="nutri-card">
                  <Card.Header className="bg-light">
                    <h5 className="mb-0">🚀 Acciones Rápidas</h5>
                  </Card.Header>
                  <Card.Body>
                    <Row>
                      <Col md={3} className="mb-2">
                        <Button 
                          variant="primary" 
                          className="w-100 nutri-btn"
                          onClick={() => navigate('/patients')}
                        >
                          👥 Registrar Paciente
                        </Button>
                      </Col>
                      <Col md={3} className="mb-2">
                        <Button 
                          variant="info" 
                          className="w-100 nutri-btn"
                          onClick={() => navigate('/appointments')}
                        >
                          📅 Agendar Cita
                        </Button>
                      </Col>
                      <Col md={3} className="mb-2">
                        <Button 
                          variant="success" 
                          className="w-100 nutri-btn"
                          onClick={() => navigate('/diet-plans')}
                        >
                          🍎 Crear Plan Nutricional
                        </Button>
                      </Col>
                      <Col md={3} className="mb-2">
                        <Button 
                          variant="warning" 
                          className="w-100 nutri-btn"
                          onClick={() => navigate('/reports')}
                        >
                          📈 Ver Reportes
                        </Button>
                      </Col>
                    </Row>
                    <Row>
                      <Col md={4} className="mb-2">
                        <Button 
                          variant="outline-primary" 
                          className="w-100 nutri-btn"
                          onClick={() => navigate('/patients')}
                        >
                          📋 Historia Clínica
                        </Button>
                      </Col>
                      <Col md={4} className="mb-2">
                        <Button 
                          variant="outline-success" 
                          className="w-100 nutri-btn"
                          onClick={() => navigate('/progress')}
                        >
                          🔄 Seguimiento Progreso
                        </Button>
                      </Col>
                      <Col md={4} className="mb-2">
                        <Button 
                          variant="outline-info" 
                          className="w-100 nutri-btn"
                          onClick={() => navigate('/messages')}
                        >
                          💬 Mensajes Pacientes
                        </Button>
                      </Col>
                    </Row>
                  </Card.Body>
                </Card>
              </Col>
            </Row>
          </>
        )}
      </Container>
    </div>
  );
};

export default DashboardPage; 