import React, { useState } from 'react';
import { Container, Row, Col, Card, Button, Alert, Badge, ProgressBar, ListGroup } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useDashboard } from '../hooks/useDashboard';
import LoadingSpinner from '../components/LoadingSpinner';
import RecentActivitiesCard from '../components/RecentActivitiesCard';
import { 
  Users, 
  Calendar, 
  FileText, 
  TrendingUp, 
  Activity, 
  Server, 
  Bolt,
  Info,
  RefreshCw,
  Plus,
  Clock,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

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
    const icons: { [key: string]: any } = {
      appointment: Calendar,
      patient: Users,
      diet_plan: FileText,
      clinical_record: FileText,
      progress: TrendingUp,
      message: Activity
    };
    return icons[type] || Activity;
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
    <div className="author-dashboard">
      <Container className="py-4">
        {/* Error Alert */}
        {error && (
          <Alert variant="danger" dismissible onClose={() => window.location.reload()} className="author-alert">
            <div className="d-flex align-items-center">
              <AlertCircle size={20} className="me-2" />
              <div>
                <Alert.Heading>Error en el Dashboard</Alert.Heading>
                <p className="mb-0">{error}</p>
              </div>
            </div>
            <Button variant="outline-danger" size="sm" onClick={() => window.location.reload()} className="mt-2">
              Reintentar
            </Button>
          </Alert>
        )}

        {/* Header Section - Apple Style */}
        <Row className="mb-4">
          <Col>
            <div className="author-dashboard-header">
              <div className="author-dashboard-title">
                <h2 className="author-welcome-title">
                  ¡Bienvenido, Nutriólogo! 👋
                </h2>
                <p className="author-welcome-subtitle">
                  Panel de control simplificado
                </p>
                <div className="author-badges">
                  <Badge bg="info" className="author-badge">
                    Versión Beta
                  </Badge>
                  <Badge bg="warning" text="dark" className="author-badge">
                    Funcionalidades limitadas
                  </Badge>
                </div>
              </div>
              <div className="author-dashboard-actions">
                <Button 
                  variant="outline-primary" 
                  size="sm" 
                  onClick={() => setShowCharts(!showCharts)}
                  disabled
                  className="author-btn author-btn-secondary"
                >
                  <TrendingUp size={16} className="me-1" />
                  Gráficos (Próximamente)
                </Button>
                <Button 
                  variant="outline-primary" 
                  size="sm" 
                  onClick={handleRefresh} 
                  disabled={refreshing}
                  className="author-btn author-btn-primary"
                >
                  <RefreshCw size={16} className={`me-1 ${refreshing ? 'spin' : ''}`} />
                  {refreshing ? 'Actualizando...' : 'Actualizar'}
                </Button>
              </div>
            </div>
          </Col>
        </Row>

        {/* Main Stats Cards - Apple Style */}
        <Row className="mb-4">
          <Col md={3} className="mb-3">
            <Card className="author-stats-card">
              <Card.Body className="author-stats-content">
                <div className="author-stats-icon author-stats-patients">
                  <Users size={32} />
                </div>
                <h3 className="author-stats-number">{stats?.total_patients || 0}</h3>
                <p className="author-stats-label">Total Pacientes</p>
                {stats?.weekly_summary?.new_patients && (
                  <div className="author-stats-trend">
                    <small className="author-trend-positive">
                      +{stats.weekly_summary.new_patients} esta semana
                    </small>
                  </div>
                )}
              </Card.Body>
            </Card>
          </Col>

          <Col md={3} className="mb-3">
            <Card className="author-stats-card">
              <Card.Body className="author-stats-content">
                <div className="author-stats-icon author-stats-appointments">
                  <Calendar size={32} />
                </div>
                <h3 className="author-stats-number">{stats?.total_appointments || 0}</h3>
                <p className="author-stats-label">Total Citas</p>
                {stats?.weekly_summary?.new_appointments && (
                  <div className="author-stats-trend">
                    <small className="author-trend-positive">
                      +{stats.weekly_summary.new_appointments} esta semana
                    </small>
                  </div>
                )}
                {stats?.performance_metrics?.completion_rate && (
                  <div className="author-progress-container">
                    <ProgressBar 
                      now={stats.performance_metrics.completion_rate} 
                      className="author-progress-bar" 
                      variant="primary"
                    />
                    <small className="author-progress-text">
                      {stats.performance_metrics.completion_rate || 0}% completadas
                    </small>
                  </div>
                )}
              </Card.Body>
            </Card>
          </Col>

          <Col md={3} className="mb-3">
            <Card className="author-stats-card">
              <Card.Body className="author-stats-content">
                <div className="author-stats-icon author-stats-plans">
                  <FileText size={32} />
                </div>
                <h3 className="author-stats-number">{stats?.total_diet_plans || 0}</h3>
                <p className="author-stats-label">Planes Nutricionales</p>
                <small className="author-stats-subtitle">Total creados</small>
              </Card.Body>
            </Card>
          </Col>

          <Col md={3} className="mb-3">
            <Card className="author-stats-card">
              <Card.Body className="author-stats-content">
                <div className="author-stats-icon author-stats-records">
                  <FileText size={32} />
                </div>
                <h3 className="author-stats-number">{stats?.total_clinical_records || 0}</h3>
                <p className="author-stats-label">Expedientes Clínicos</p>
                <small className="author-stats-subtitle">Total registrados</small>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Recent Activities - Modern Timeline Style */}
        {stats?.recent_activities && stats.recent_activities.length > 0 && (
          <Row className="mb-4">
            <Col>
              <RecentActivitiesCard 
                activities={stats.recent_activities.map(activity => {
                  let description = activity.description;
                  if (activity.type === 'clinical_record') {
                    const paciente = (activity as any).patient_name ? `Paciente: ${(activity as any).patient_name}` : '';
                    const motivo = (activity as any).consultation_reason ? `Motivo: ${(activity as any).consultation_reason}` : '';
                    description = [
                      'Expediente clínico',
                      paciente,
                      motivo
                    ].filter(Boolean).join(' · ');
                  }
                  return {
                    type: activity.type,
                    description: description,
                    time: formatDate(activity.date),
                    patient_name: (activity as any).patient_name,
                    consultation_reason: (activity as any).consultation_reason
                  };
                })}
                title="Actividades Recientes"
                onViewAll={() => navigate('/notifications')}
              />
            </Col>
          </Row>
        )}

        {/* System Performance - Apple Style */}
        {stats?.system_performance && (
          <Row className="mb-4">
            <Col>
              <Card className="author-system-card">
                <Card.Header className="author-card-header">
                  <div className="d-flex align-items-center">
                    <Server size={20} className="me-2" />
                    <h5 className="mb-0">Estado del Sistema</h5>
                  </div>
                </Card.Header>
                <Card.Body className="author-system-content">
                  <Row>
                    <Col md={3} className="author-system-item">
                      <div className="author-system-label">Último Paciente</div>
                      <div className="author-system-value">
                        {stats.system_performance.last_patient || 'N/A'}
                      </div>
                    </Col>
                    <Col md={3} className="author-system-item">
                      <div className="author-system-label">Última Cita</div>
                      <div className="author-system-value">
                        {stats.system_performance.last_appointment || 'N/A'}
                      </div>
                    </Col>
                    <Col md={3} className="author-system-item">
                      <div className="author-system-label">Último Plan</div>
                      <div className="author-system-value">
                        {stats.system_performance.last_diet_plan || 'N/A'}
                      </div>
                    </Col>
                    <Col md={3} className="author-system-item">
                      <div className="author-system-label">Último Expediente</div>
                      <div className="author-system-value">
                        {stats.system_performance.last_clinical_record || 'N/A'}
                      </div>
                    </Col>
                  </Row>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        )}

        {/* Quick Actions - Apple Style */}
        <Row className="mb-4">
          <Col>
            <Card className="author-actions-card">
              <Card.Header className="author-card-header">
                <div className="d-flex align-items-center">
                  <Bolt size={20} className="me-2" />
                  <h5 className="mb-0">Acciones Rápidas</h5>
                </div>
              </Card.Header>
              <Card.Body className="author-actions-content">
                <Row>
                  <Col md={3} className="mb-3">
                    <Button 
                      variant="outline-primary" 
                      className="w-100 author-action-btn author-action-patients" 
                      onClick={() => navigate('/patients')}
                    >
                      <Plus size={16} className="me-2" />
                      Nuevo Paciente
                    </Button>
                  </Col>
                  <Col md={3} className="mb-3">
                    <Button 
                      variant="outline-success" 
                      className="w-100 author-action-btn author-action-appointments" 
                      onClick={() => navigate('/appointments')}
                    >
                      <Calendar size={16} className="me-2" />
                      Nueva Cita
                    </Button>
                  </Col>
                  <Col md={3} className="mb-3">
                    <Button 
                      variant="outline-warning" 
                      className="w-100 author-action-btn author-action-plans" 
                      onClick={() => navigate('/diet-plans')}
                    >
                      <FileText size={16} className="me-2" />
                      Crear Plan
                    </Button>
                  </Col>
                  <Col md={3} className="mb-3">
                    <Button 
                      variant="outline-info" 
                      className="w-100 author-action-btn author-action-records" 
                      onClick={() => navigate('/clinical-records')}
                    >
                      <FileText size={16} className="me-2" />
                      Expediente
                    </Button>
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Coming Soon Features - Apple Style */}
        <Row>
          <Col>
            <Alert variant="info" className="author-coming-soon-alert">
              <div className="d-flex align-items-start">
                <Info size={20} className="me-3 mt-1" />
                <div>
                  <Alert.Heading>Funcionalidades en Desarrollo</Alert.Heading>
                  <p className="mb-2">
                    Estamos trabajando para agregar más funcionalidades al dashboard:
                  </p>
                  <ul className="author-features-list mb-0">
                    <li>Gráficos y análisis detallados</li>
                    <li>Alertas y notificaciones</li>
                    <li>Análisis de ingresos</li>
                    <li>Métricas de rendimiento avanzadas</li>
                    <li>Próximas citas</li>
                    <li>Pacientes recientes</li>
                  </ul>
                </div>
              </div>
            </Alert>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default DashboardPage; 