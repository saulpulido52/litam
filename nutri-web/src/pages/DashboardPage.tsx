import React, { useState } from 'react';
import { Container, Row, Col, Card, Button, Alert, Badge, ProgressBar, ListGroup } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useDashboard } from '../hooks/useDashboard';
import LoadingSpinner from '../components/LoadingSpinner';

const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { 
    stats, 
    loading, 
    refreshing, 
    error, 
    refreshStats
  } = useDashboard();
  const [showCharts, setShowCharts] = useState(false);

  const handleRefresh = async () => {
    await refreshStats();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-MX', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getActivityIcon = (type: string) => {
    const icons: { [key: string]: string } = {
      appointment: 'fa-calendar-check',
      patient: 'fa-user-plus',
      diet_plan: 'fa-utensils',
      clinical_record: 'fa-file-medical',
      progress: 'fa-chart-line',
      message: 'fa-comment'
    };
    return icons[type] || 'fa-info-circle';
  };

  const getActivityColor = (type: string) => {
    const colors: { [key: string]: string } = {
      appointment: 'primary',
      patient: 'success',
      diet_plan: 'warning',
      clinical_record: 'info',
      progress: 'secondary',
      message: 'dark'
    };
    return colors[type] || 'secondary';
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
                  ¡Bienvenido, Nutriólogo! 👋
                </h2>
                <p className="text-muted mb-0">
                  Panel de control simplificado
                </p>
                <div className="mt-2">
                  <Badge bg="info" className="me-2">
                    Versión Beta
                  </Badge>
                  <Badge bg="warning" text="dark">
                    Funcionalidades limitadas
                  </Badge>
                </div>
              </div>
              <div className="d-flex gap-2">
                <Button 
                  variant="outline-primary" 
                  size="sm" 
                  onClick={() => setShowCharts(!showCharts)}
                  disabled
                >
                  <i className="fas fa-chart-line me-1"></i>
                  Gráficos (Próximamente)
                </Button>
                <Button variant="outline-primary" size="sm" onClick={handleRefresh} disabled={refreshing}>
                  <i className={`fas fa-sync-alt me-1 ${refreshing ? 'fa-spin' : ''}`}></i>
                  {refreshing ? 'Actualizando...' : 'Actualizar'}
                </Button>
              </div>
            </div>
          </Col>
        </Row>

        {/* Main Stats Cards */}
        <Row className="mb-4">
          <Col md={3} className="mb-3">
            <Card className="h-100 shadow-sm border-0">
              <Card.Body className="text-center p-4">
                <div className="fs-1 nutri-primary mb-3">👥</div>
                <h3 className="nutri-primary mb-2">{stats?.total_patients || 0}</h3>
                <p className="text-muted mb-2">Total Pacientes</p>
                <div className="d-flex justify-content-between align-items-center">
                  {stats?.weekly_summary?.new_patients && (
                    <small className="text-success">
                      +{stats.weekly_summary.new_patients} esta semana
                    </small>
                  )}
                </div>
              </Card.Body>
            </Card>
          </Col>

          <Col md={3} className="mb-3">
            <Card className="h-100 shadow-sm border-0">
              <Card.Body className="text-center p-4">
                <div className="fs-1 text-primary mb-3">📅</div>
                <h3 className="text-primary mb-2">{stats?.total_appointments || 0}</h3>
                <p className="text-muted mb-2">Total Citas</p>
                <div className="d-flex justify-content-between align-items-center">
                  {stats?.weekly_summary?.new_appointments && (
                    <small className="text-success">
                      +{stats.weekly_summary.new_appointments} esta semana
                    </small>
                  )}
                </div>
                {stats?.performance_metrics?.completion_rate && (
                  <ProgressBar 
                    now={stats.performance_metrics.completion_rate} 
                    className="mt-2" 
                    variant="primary"
                    style={{ height: '4px' }}
                  />
                )}
                <small className="text-muted">
                  {stats?.performance_metrics?.completion_rate || 0}% completadas
                </small>
              </Card.Body>
            </Card>
          </Col>

          <Col md={3} className="mb-3">
            <Card className="h-100 shadow-sm border-0">
              <Card.Body className="text-center p-4">
                <div className="fs-1 text-warning mb-3">🍽️</div>
                <h3 className="text-warning mb-2">{stats?.total_diet_plans || 0}</h3>
                <p className="text-muted mb-2">Planes Nutricionales</p>
                <small className="text-muted">Total creados</small>
              </Card.Body>
            </Card>
          </Col>

          <Col md={3} className="mb-3">
            <Card className="h-100 shadow-sm border-0">
              <Card.Body className="text-center p-4">
                <div className="fs-1 text-info mb-3">📋</div>
                <h3 className="text-info mb-2">{stats?.total_clinical_records || 0}</h3>
                <p className="text-muted mb-2">Expedientes Clínicos</p>
                <small className="text-muted">Total registrados</small>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Recent Activities */}
        {stats?.recent_activities && stats.recent_activities.length > 0 && (
          <Row className="mb-4">
            <Col>
              <Card className="shadow-sm border-0">
                <Card.Header className="bg-light border-0">
                  <h5 className="mb-0">
                    <i className="fas fa-clock me-2"></i>
                    Actividades Recientes
                  </h5>
                </Card.Header>
                <Card.Body className="p-0">
                  <ListGroup variant="flush">
                    {stats.recent_activities.slice(0, 5).map((activity, index) => (
                      <ListGroup.Item key={index} className="d-flex align-items-center py-3">
                        <div className={`bg-${getActivityColor(activity.type)} rounded-circle d-flex align-items-center justify-content-center me-3`} style={{ width: '40px', height: '40px' }}>
                          <i className={`fas ${getActivityIcon(activity.type)} text-white`}></i>
                        </div>
                        <div className="flex-grow-1">
                          <p className="mb-1">{activity.description}</p>
                          <small className="text-muted">{formatDate(activity.date)}</small>
                        </div>
                      </ListGroup.Item>
                    ))}
                  </ListGroup>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        )}

        {/* System Performance */}
        {stats?.system_performance && (
          <Row className="mb-4">
            <Col>
              <Card className="shadow-sm border-0">
                <Card.Header className="bg-light border-0">
                  <h5 className="mb-0">
                    <i className="fas fa-server me-2"></i>
                    Estado del Sistema
                  </h5>
                </Card.Header>
                <Card.Body>
                  <Row>
                    <Col md={3} className="text-center mb-3">
                      <div className="text-muted mb-1">Último Paciente</div>
                      <div className="fw-bold">
                        {stats.system_performance.last_patient || 'N/A'}
                      </div>
                    </Col>
                    <Col md={3} className="text-center mb-3">
                      <div className="text-muted mb-1">Última Cita</div>
                      <div className="fw-bold">
                        {stats.system_performance.last_appointment || 'N/A'}
                      </div>
                    </Col>
                    <Col md={3} className="text-center mb-3">
                      <div className="text-muted mb-1">Último Plan</div>
                      <div className="fw-bold">
                        {stats.system_performance.last_diet_plan || 'N/A'}
                      </div>
                    </Col>
                    <Col md={3} className="text-center mb-3">
                      <div className="text-muted mb-1">Último Expediente</div>
                      <div className="fw-bold">
                        {stats.system_performance.last_clinical_record || 'N/A'}
                      </div>
                    </Col>
                  </Row>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        )}

        {/* Quick Actions */}
        <Row className="mb-4">
          <Col>
            <Card className="shadow-sm border-0">
              <Card.Header className="bg-light border-0">
                <h5 className="mb-0">
                  <i className="fas fa-bolt me-2"></i>
                  Acciones Rápidas
                </h5>
              </Card.Header>
              <Card.Body>
                <Row>
                  <Col md={3} className="mb-3">
                    <Button 
                      variant="outline-primary" 
                      className="w-100" 
                      onClick={() => navigate('/patients')}
                    >
                      <i className="fas fa-user-plus me-2"></i>
                      Nuevo Paciente
                    </Button>
                  </Col>
                  <Col md={3} className="mb-3">
                    <Button 
                      variant="outline-success" 
                      className="w-100" 
                      onClick={() => navigate('/appointments')}
                    >
                      <i className="fas fa-calendar-plus me-2"></i>
                      Nueva Cita
                    </Button>
                  </Col>
                  <Col md={3} className="mb-3">
                    <Button 
                      variant="outline-warning" 
                      className="w-100" 
                      onClick={() => navigate('/diet-plans')}
                    >
                      <i className="fas fa-utensils me-2"></i>
                      Crear Plan
                    </Button>
                  </Col>
                  <Col md={3} className="mb-3">
                    <Button 
                      variant="outline-info" 
                      className="w-100" 
                      onClick={() => navigate('/clinical-records')}
                    >
                      <i className="fas fa-clipboard-list me-2"></i>
                      Expediente
                    </Button>
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Coming Soon Features */}
        <Row>
          <Col>
            <Alert variant="info">
              <Alert.Heading>
                <i className="fas fa-info-circle me-2"></i>
                Funcionalidades en Desarrollo
              </Alert.Heading>
              <p>
                Estamos trabajando para agregar más funcionalidades al dashboard:
              </p>
              <ul className="mb-0">
                <li>Gráficos y análisis detallados</li>
                <li>Alertas y notificaciones</li>
                <li>Análisis de ingresos</li>
                <li>Métricas de rendimiento avanzadas</li>
                <li>Próximas citas</li>
                <li>Pacientes recientes</li>
              </ul>
            </Alert>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default DashboardPage; 