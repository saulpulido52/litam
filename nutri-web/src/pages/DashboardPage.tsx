import React, { useState } from 'react';
import { Container, Row, Col, Card, Button, Spinner, Navbar, Nav, Alert, Badge } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useDashboard } from '../hooks/useDashboard';

const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { stats, profile, user, loading, error, refreshStats } = useDashboard();
  const [refreshing, setRefreshing] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    navigate('/');
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await refreshStats();
    setRefreshing(false);
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

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'appointment': return '📅';
      case 'patient': return '👥';
      case 'diet_plan': return '🍎';
      case 'clinical_record': return '📋';
      default: return '📝';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
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
              <Nav.Link onClick={() => navigate('/patients')}>👥 Mis Pacientes</Nav.Link>
              <Nav.Link onClick={() => navigate('/appointments')}>📅 Citas</Nav.Link>
              <Nav.Link onClick={() => navigate('/diet-plans')}>🍎 Planes Nutricionales</Nav.Link>
              <Nav.Link onClick={() => navigate('/reports')}>📈 Reportes</Nav.Link>
            </Nav>
            <Nav>
              <Nav.Link onClick={handleRefresh} disabled={refreshing}>
                {refreshing ? '🔄' : '🔄'} Actualizar
              </Nav.Link>
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
        {/* Error Alert */}
        {error && (
          <Alert variant="danger" dismissible onClose={() => window.location.reload()}>
            <Alert.Heading>Error en el Dashboard</Alert.Heading>
            <p>{error}</p>
            <Button variant="outline-danger" size="sm" onClick={() => window.location.reload()}>
              Reintentar
            </Button>
          </Alert>
        )}

        {/* Bienvenida */}
        <Row className="mb-4">
          <Col>
            <Card className="nutri-card">
              <Card.Body>
                <div className="d-flex justify-content-between align-items-start">
                  <div>
                    <h2 className="nutri-primary mb-1">
                      ¡Bienvenido, {user?.first_name || profile?.first_name ? `${user?.first_name || profile?.first_name} ${user?.last_name || profile?.last_name}` : 'Nutriólogo'}! 👋
                    </h2>
                    <p className="text-muted mb-0">
                      {profile?.specialties?.join(' • ') || 'Nutriólogo'} • {user?.email || 'Cargando...'}
                    </p>
                    {profile && (
                      <div className="mt-2">
                        <Badge bg="success" className="me-2">
                          {profile.years_of_experience} años de experiencia
                        </Badge>
                        <Badge bg="info" className="me-2">
                          ${profile.consultation_fee} por consulta
                        </Badge>
                        {profile.is_verified && (
                          <Badge bg="warning" text="dark">
                            ✅ Verificado
                          </Badge>
                        )}
                      </div>
                    )}
                  </div>
                  <Button 
                    variant="outline-primary" 
                    size="sm"
                    onClick={() => navigate('/profile')}
                  >
                    👤 Ver Perfil
                  </Button>
                </div>
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
              <Col md={3} className="mb-3">
                <Card className="nutri-card h-100 border-primary">
                  <Card.Body className="text-center">
                    <div className="fs-1 nutri-primary mb-2">👥</div>
                    <h3 className="nutri-primary">{stats?.total_patients || 0}</h3>
                    <p className="text-muted mb-0">Total Pacientes</p>
                    {stats?.new_patients_last_month && (
                      <small className="text-success">
                        +{stats.new_patients_last_month} este mes
                      </small>
                    )}
                  </Card.Body>
                </Card>
              </Col>
              <Col md={3} className="mb-3">
                <Card className="nutri-card h-100 border-info">
                  <Card.Body className="text-center">
                    <div className="fs-1 text-info mb-2">📅</div>
                    <h3 className="text-info">{stats?.appointments_today || 0}</h3>
                    <p className="text-muted mb-0">Citas Hoy</p>
                    {stats?.appointments_this_week && (
                      <small className="text-info">
                        {stats.appointments_this_week} esta semana
                      </small>
                    )}
                  </Card.Body>
                </Card>
              </Col>
              <Col md={3} className="mb-3">
                <Card className="nutri-card h-100 border-success">
                  <Card.Body className="text-center">
                    <div className="fs-1 text-success mb-2">🍎</div>
                    <h3 className="text-success">{stats?.active_diet_plans || 0}</h3>
                    <p className="text-muted mb-0">Planes Activos</p>
                    {stats?.total_diet_plans && (
                      <small className="text-success">
                        {stats.total_diet_plans} total
                      </small>
                    )}
                  </Card.Body>
                </Card>
              </Col>
              <Col md={3} className="mb-3">
                <Card className="nutri-card h-100 border-warning">
                  <Card.Body className="text-center">
                    <div className="fs-1 text-warning mb-2">📋</div>
                    <h3 className="text-warning">{stats?.pending_appointments || 0}</h3>
                    <p className="text-muted mb-0">Pendientes</p>
                    {stats?.completed_appointments && (
                      <small className="text-warning">
                        {stats.completed_appointments} completadas
                      </small>
                    )}
                  </Card.Body>
                </Card>
              </Col>
            </Row>

            {/* Actividades Recientes */}
            {stats?.recent_activities && stats.recent_activities.length > 0 && (
              <Row className="mb-4">
                <Col>
                  <Card className="nutri-card">
                    <Card.Header className="bg-light d-flex justify-content-between align-items-center">
                      <h5 className="mb-0">📝 Actividades Recientes</h5>
                      <Button variant="outline-primary" size="sm" onClick={() => navigate('/reports')}>
                        Ver Todas
                      </Button>
                    </Card.Header>
                    <Card.Body>
                      <div className="list-group list-group-flush">
                        {stats.recent_activities.slice(0, 5).map((activity) => (
                          <div key={activity.id} className="list-group-item border-0 px-0">
                            <div className="d-flex align-items-center">
                              <div className="me-3 fs-4">
                                {getActivityIcon(activity.type)}
                              </div>
                              <div className="flex-grow-1">
                                <h6 className="mb-1">{activity.title}</h6>
                                <p className="text-muted mb-1 small">{activity.description}</p>
                                {activity.patient_name && (
                                  <small className="text-primary">Paciente: {activity.patient_name}</small>
                                )}
                              </div>
                              <div className="text-muted small">
                                {formatDate(activity.date)}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
              </Row>
            )}

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
                          👥 Gestionar Pacientes
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
                          onClick={() => navigate('/clinical-records')}
                        >
                          📋 Expedientes Clínicos
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