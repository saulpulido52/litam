import React from 'react';
import { Container, Row, Col, Card, Button, Alert, Badge } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useDashboard } from '../hooks/useDashboard';
import LoadingSpinner from '../components/LoadingSpinner';

const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { stats, profile, user, loading, error, refreshStats } = useDashboard();

  const handleRefresh = async () => {
    await refreshStats();
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="dashboard-page">
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

        {/* Header Section */}
        <Row className="mb-4">
          <Col>
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
              <div>
                <Button variant="outline-primary" size="sm" onClick={handleRefresh}>
                  <i className="fas fa-sync-alt me-1"></i>
                  Actualizar
                </Button>
              </div>
            </div>
          </Col>
        </Row>

        {/* Stats Cards */}
        <Row className="mb-4">
          <Col md={3} className="mb-3">
            <Card className="h-100 shadow-sm">
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
            <Card className="h-100 shadow-sm">
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
            <Card className="h-100 shadow-sm">
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
            <Card className="h-100 shadow-sm">
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

        {/* Quick Actions */}
        <Row className="mb-4">
          <Col>
            <Card className="shadow-sm">
              <Card.Header>
                <h5 className="mb-0">Acciones Rápidas</h5>
              </Card.Header>
              <Card.Body>
                <Row>
                  <Col md={3} className="mb-2">
                    <Button variant="primary" className="w-100" onClick={() => navigate('/patients')}>
                      <i className="fas fa-user-plus me-2"></i>
                      Nuevo Paciente
                    </Button>
                  </Col>
                  <Col md={3} className="mb-2">
                    <Button variant="success" className="w-100" onClick={() => navigate('/diet-plans')}>
                      <i className="fas fa-utensils me-2"></i>
                      Crear Plan
                    </Button>
                  </Col>
                  <Col md={3} className="mb-2">
                    <Button variant="info" className="w-100" onClick={() => navigate('/appointments')}>
                      <i className="fas fa-calendar-plus me-2"></i>
                      Nueva Cita
                    </Button>
                  </Col>
                  <Col md={3} className="mb-2">
                    <Button variant="warning" className="w-100" onClick={() => navigate('/clinical-records')}>
                      <i className="fas fa-file-medical me-2"></i>
                      Expediente
                    </Button>
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Recent Activities */}
        {stats?.recent_activities && stats.recent_activities.length > 0 && (
          <Row className="mb-4">
            <Col>
              <Card className="shadow-sm">
                <Card.Header>
                  <h5 className="mb-0">Actividades Recientes</h5>
                </Card.Header>
                <Card.Body>
                  <div className="list-group list-group-flush">
                    {stats.recent_activities.slice(0, 5).map((activity: any) => (
                      <div key={activity.id} className="list-group-item border-0 px-0">
                        <div className="d-flex align-items-center">
                          <div className="flex-shrink-0">
                            <div className="bg-light rounded-circle d-flex align-items-center justify-content-center" style={{ width: '40px', height: '40px' }}>
                              <i className={`fas ${activity.icon} text-primary`}></i>
                            </div>
                          </div>
                          <div className="flex-grow-1 ms-3">
                            <h6 className="mb-1">{activity.title}</h6>
                            <p className="text-muted mb-0 small">{activity.description}</p>
                            <small className="text-muted">{activity.timestamp}</small>
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
      </Container>
    </div>
  );
};

export default DashboardPage; 