import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Container, Row, Col, Card, Button, Alert, Badge, Spinner, ProgressBar } from 'react-bootstrap';
import {
  Users,
  Calendar,
  BarChart3,
  Clock,
  Plus,
  RefreshCw,
  Settings,
  Bell,
  Award,
  Target,
  Zap,
  ArrowUp,
  ArrowDown,
  PieChart,
  BarChart,
  LineChart,
  Brain,
  FileText,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useDashboard } from '../hooks/useDashboard';
import { usePatients } from '../hooks/usePatients';
import { useNavigate } from 'react-router-dom';
import RecentActivitiesCard from '../components/RecentActivitiesCard';
import GrowthAlertPanel from '../components/GrowthCharts/GrowthAlertPanel';
import '../styles/dashboard-modern.css';
import apiService from '../services/api';

const DashboardPage: React.FC = () => {
  // console.log('🔍 [DashboardPage] Componente renderizado');

  // HOOKS AL INICIO, SIEMPRE
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();
  const { stats: dashboardData, loading: dashboardLoading, error: dashboardError, refreshStats: refreshDashboard } = useDashboard();
  const { patients, loading: patientsLoading } = usePatients();
  const [showDetailedStats, setShowDetailedStats] = useState(false);
  const [lastRefresh, setLastRefresh] = useState(new Date());

  // **DEBUGGING TEMPORAL DE AUTENTICACIÓN - REDUCIDO**
  useEffect(() => {
    const debugAuth = () => {
      const token = apiService.getToken();
      const storageToken = localStorage.getItem('access_token');

      // Solo debug si hay problemas de autenticación
      if (storageToken && !token) {
        console.log('🔄 Detected token mismatch, forcing reload...');
        apiService.forceTokenReload();
      }
    };

    debugAuth();
    const interval = setInterval(debugAuth, 30000); // Debug cada 30 segundos
    return () => clearInterval(interval);
  }, [user, isLoading]);

  // Memoizados y callbacks
  const alerts = useMemo(() => {
    const alertsList: Array<{
      type: 'info' | 'warning' | 'success' | 'danger';
      title: string;
      message: string;
      action?: string;
      onAction?: () => void;
    }> = [];
    if (patients.length === 0 && !patientsLoading) {
      alertsList.push({
        type: 'info',
        title: 'Sin pacientes',
        message: 'Aún no tienes pacientes registrados. Comienza agregando tu primer paciente.',
        action: 'Agregar Paciente',
        onAction: () => navigate('/patients')
      });
    }
    if ((dashboardData?.total_appointments || 0) === 0) {
      alertsList.push({
        type: 'warning',
        title: 'Sin citas programadas',
        message: 'No tienes citas programadas para esta semana. Revisa tu calendario.',
        action: 'Ver Calendario',
        onAction: () => navigate('/calendar')
      });
    }
    if ((dashboardData?.total_diet_plans || 0) === 0) {
      alertsList.push({
        type: 'info',
        title: 'Sin planes nutricionales',
        message: 'Crea tu primer plan nutricional para comenzar a trabajar con tus pacientes.',
        action: 'Crear Plan',
        onAction: () => navigate('/diet-plans')
      });
    }
    return alertsList;
  }, [patients.length, patientsLoading, dashboardData, navigate]);

  const mainMetrics = useMemo(() => [
    {
      title: 'Pacientes',
      value: patients.length,
      change: 12,
      color: 'primary',
      icon: Users,
      loading: patientsLoading,
      description: 'Pacientes registrados'
    },
    {
      title: 'Citas Hoy',
      value: dashboardData?.total_appointments || 0,
      change: -5,
      color: 'success',
      icon: Calendar,
      loading: dashboardLoading,
      description: 'Citas programadas'
    },
    {
      title: 'Planes Activos',
      value: dashboardData?.total_diet_plans || 0,
      change: 8,
      color: 'warning',
      icon: FileText,
      loading: dashboardLoading,
      description: 'Planes nutricionales'
    },
    {
      title: 'Expedientes',
      value: dashboardData?.total_clinical_records || 0,
      change: 15,
      color: 'info',
      icon: Award,
      loading: dashboardLoading,
      description: 'Expedientes clínicos'
    }
  ], [patients.length, patientsLoading, dashboardData, dashboardLoading]);

  const progressStats = useMemo(() => [
    {
      title: 'Pacientes Registrados',
      current: patients.length,
      target: 10,
      unit: ' pacientes',
      color: 'primary'
    },
    {
      title: 'Citas Totales',
      current: dashboardData?.total_appointments || 0,
      target: 20,
      unit: ' citas',
      color: 'success'
    },
    {
      title: 'Planes Nutricionales',
      current: dashboardData?.total_diet_plans || 0,
      target: 5,
      unit: ' planes',
      color: 'info'
    }
  ], [patients.length, dashboardData]);

  const recentActivities = useMemo(() => {
    const activities = [];
    if (patients.length > 0) {
      activities.push({
        type: 'patient',
        description: `Nuevo paciente registrado: ${patients[0]?.first_name} ${patients[0]?.last_name}`,
        time: 'Hace 2 horas'
      });
    }
    if ((dashboardData?.total_appointments || 0) > 0) {
      activities.push({
        type: 'appointment',
        description: 'Cita programada para mañana',
        time: 'Hace 1 hora'
      });
    }
    if ((dashboardData?.total_diet_plans || 0) > 0) {
      activities.push({
        type: 'clinical_record',
        description: 'Plan nutricional actualizado',
        time: 'Hace 3 horas'
      });
    }
    activities.push({
      type: 'progress',
      description: 'Progreso de paciente registrado',
      time: 'Hace 4 horas'
    });
    return activities;
  }, [patients, dashboardData]);

  const toggleDetailedStats = useCallback(() => {
    setShowDetailedStats(prev => !prev);
  }, []);

  const handleRefresh = useCallback(async () => {
    await refreshDashboard();
    setLastRefresh(new Date());
  }, [refreshDashboard]);

  const handleViewAllActivities = useCallback(() => {
    navigate('/notifications');
  }, [navigate]);

  // REDIRECCIÓN INMEDIATA PARA ADMIN
  useEffect(() => {
    if (!isLoading && user?.role?.name === 'admin') {
      console.log('🔍 [DashboardPage] Usuario es admin, redirigiendo a /admin');
      navigate('/admin', { replace: true });
      return;
    }
  }, [isLoading, user, navigate]);

  // NO RENDERIZAR NADA SI ESTÁ CARGANDO
  if (isLoading) {
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-100">
        <div className="text-center">
          <Spinner animation="border" variant="primary" />
          <p className="mt-3">Cargando dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-100">
        <div className="text-center">
          <Alert variant="warning">
            No hay usuario autenticado. Redirigiendo al login...
          </Alert>
        </div>
      </div>
    );
  }

  // SI ES ADMIN, NO RENDERIZAR NADA (ya debería haber sido redirigido)
  if (user.role?.name === 'admin') {
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-100">
        <div className="text-center">
          <Spinner animation="border" variant="primary" />
          <p className="mt-3">Redirigiendo al panel de administración...</p>
        </div>
      </div>
    );
  }

  if (dashboardLoading) {
    return (
      <Container className="py-4">
        <div className="text-center py-5">
          <Spinner animation="border" variant="primary" aria-label="Cargando dashboard" />
          <p className="mt-3 text-muted">Cargando dashboard...</p>
        </div>
      </Container>
    );
  }

  if (dashboardError) {
    return (
      <Container className="py-4">
        <Alert variant="danger">
          <Alert.Heading>Error al cargar el dashboard</Alert.Heading>
          <p>{dashboardError}</p>
          <Button
            variant="outline-danger"
            onClick={handleRefresh}
            aria-label="Reintentar cargar dashboard"
          >
            Reintentar
          </Button>
        </Alert>
      </Container>
    );
  }

  return (
    <Container className="py-4">
      {/* Header del dashboard - Más espacioso y moderno */}
      <Row className="mb-5">
        <Col>
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h1 className="mb-2 fw-bold">
                ¡Hola, {user?.first_name || 'Nutriólogo'}! 👋
              </h1>
              <p className="text-muted mb-0 fs-5">
                Bienvenido a tu dashboard. Aquí tienes un resumen de tu actividad diaria.
              </p>
            </div>
            <div className="d-flex gap-3">
              <Button
                id="refresh-dashboard-btn"
                variant="outline-secondary"
                size="lg"
                onClick={handleRefresh}
                disabled={dashboardLoading}
                className="px-4"
                aria-label="Actualizar dashboard"
                title="Actualizar datos del dashboard"
              >
                <RefreshCw size={18} className={`me-2 ${dashboardLoading ? 'spin' : ''}`} aria-hidden="true" />
                Actualizar
              </Button>
              <Button
                id="new-patient-btn"
                variant="primary"
                size="lg"
                onClick={() => navigate('/patients')}
                className="px-4"
                aria-label="Agregar nuevo paciente"
                title="Ir a la página de pacientes para agregar uno nuevo"
              >
                <Plus size={18} className="me-2" aria-hidden="true" />
                Nuevo Paciente
              </Button>
            </div>
          </div>
        </Col>
      </Row>

      {/* Card Promocional - Expedientes Inteligentes */}
      <Row className="mb-4">
        <Col>
          <Card className="border-primary shadow-sm">
            <Card.Body className="py-4">
              <Row className="align-items-center">
                <Col md={8}>
                  <div className="d-flex align-items-center mb-2">
                    <div className="bg-primary bg-opacity-10 rounded-circle p-2 me-3">
                      <Brain className="text-primary" size={24} />
                    </div>
                    <div>
                      <h5 className="mb-1 fw-bold text-primary">Expedientes Inteligentes ✨</h5>
                      <p className="text-muted mb-0">Sistema automatizado con IA - Reduce el tiempo de consulta en 75%</p>
                    </div>
                  </div>
                  <div className="d-flex flex-wrap gap-2">
                    <Badge bg="success" className="px-2 py-1">🤖 Detección Automática</Badge>
                    <Badge bg="info" className="px-2 py-1">📊 Comparativos Automáticos</Badge>
                    <Badge bg="warning" className="px-2 py-1">⚡ Seguimientos de 5 min</Badge>
                  </div>
                </Col>
                <Col md={4} className="text-end">
                  <Button
                    variant="primary"
                    size="lg"
                    onClick={() => navigate('/expedientes-inteligentes')}
                    className="px-4"
                  >
                    <Zap size={18} className="me-2" />
                    Explorar Ahora
                  </Button>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Alertas - Mejor espaciado */}
      {alerts.length > 0 && (
        <Row className="mb-5">
          <Col>
            {alerts.map((alert, index) => {
              const getAlertIcon = () => {
                switch (alert.type) {
                  case 'info': return <Bell size={18} aria-hidden="true" />;
                  case 'warning': return <AlertTriangle size={18} aria-hidden="true" />;
                  case 'success': return <CheckCircle size={18} aria-hidden="true" />;
                  case 'danger': return <AlertTriangle size={18} aria-hidden="true" />;
                  default: return <Bell size={18} aria-hidden="true" />;
                }
              };

              return (
                <Alert key={index} variant={alert.type} className="mb-3 border-0 shadow-sm" role="alert">
                  <div className="d-flex align-items-center">
                    <div className="me-4" aria-hidden="true">
                      {getAlertIcon()}
                    </div>
                    <div className="flex-grow-1">
                      <h6 className="mb-2 fw-bold">{alert.title}</h6>
                      <p className="mb-0">{alert.message}</p>
                    </div>
                    {alert.action && alert.onAction && (
                      <Button
                        size="lg"
                        variant="outline-primary"
                        onClick={alert.onAction}
                        className="ms-3"
                        aria-label={alert.action}
                        title={alert.action}
                      >
                        {alert.action}
                      </Button>
                    )}
                  </div>
                </Alert>
              );
            })}
          </Col>
        </Row>
      )}

      {/* Métricas principales - Distribución orgánica */}
      <Row className="mb-5 g-4">
        {mainMetrics.map((metric, index) => (
          <Col key={index} lg={3} md={6} className="mb-4">
            <Card className="h-100 border-0 shadow-sm hover-lift">
              <Card.Body className="p-4">
                <div className="d-flex justify-content-between align-items-start mb-3">
                  <div className="flex-grow-1">
                    <h6 className="text-muted mb-2 fw-semibold">{metric.title}</h6>
                    {metric.loading ? (
                      <Spinner animation="border" size="sm" aria-label={`Cargando ${metric.title}`} />
                    ) : (
                      <h2 className="mb-2 fw-bold">{metric.value}</h2>
                    )}
                    <p className="text-muted small mb-0">{metric.description}</p>
                  </div>
                  <div className={`bg-${metric.color} bg-opacity-10 text-${metric.color} p-3 rounded-3`} aria-hidden="true">
                    <metric.icon size={28} />
                  </div>
                </div>
                {metric.change !== undefined && !metric.loading && (
                  <div className="d-flex align-items-center">
                    <span className={`d-flex align-items-center ${metric.change >= 0 ? 'text-success' : 'text-danger'} fw-semibold`}>
                      {metric.change >= 0 ? <ArrowUp size={14} className="me-1" aria-hidden="true" /> : <ArrowDown size={14} className="me-1" aria-hidden="true" />}
                      {Math.abs(metric.change)}%
                    </span>
                    <span className="text-muted ms-2 small">vs mes anterior</span>
                  </div>
                )}
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      {/* Panel de Alertas de Crecimiento */}
      <Row className="mb-5">
        <Col>
          <GrowthAlertPanel />
        </Col>
      </Row>

      {/* Contenido principal - Distribución orgánica y aireada */}
      <Row className="g-4">
        {/* Columna izquierda - Gráficos y estadísticas */}
        <Col lg={8} className="mb-4">
          {/* Gráficos principales */}
          <Card className="mb-4 border-0 shadow-sm">
            <Card.Header className="bg-transparent border-0 pb-0">
              <div className="d-flex justify-content-between align-items-center">
                <h5 className="mb-0 fw-bold">
                  <BarChart3 size={20} className="me-2" aria-hidden="true" />
                  Análisis de Rendimiento
                </h5>
                <Button
                  id="toggle-stats-view-btn"
                  variant="outline-secondary"
                  size="sm"
                  onClick={toggleDetailedStats}
                  className="rounded-pill"
                  aria-label={showDetailedStats ? 'Cambiar a vista simple' : 'Cambiar a vista detallada'}
                  title={showDetailedStats ? 'Vista Simple' : 'Vista Detallada'}
                >
                  {showDetailedStats ? 'Vista Simple' : 'Vista Detallada'}
                </Button>
              </div>
            </Card.Header>
            <Card.Body className="p-4">
              <div className="text-center py-5">
                <div className="mb-4">
                  <BarChart3 size={64} className="text-muted mb-3" aria-hidden="true" />
                  <h4 className="text-muted mb-2">Gráficos en Desarrollo</h4>
                  <p className="text-muted mb-0">Los gráficos y estadísticas detalladas estarán disponibles próximamente.</p>
                </div>
                <div className="row g-3">
                  <div className="col-md-4">
                    <div className="p-3 bg-light rounded-3">
                      <PieChart size={24} className="text-primary mb-2" aria-hidden="true" />
                      <h6 className="mb-1">Distribución</h6>
                      <small className="text-muted">Próximamente</small>
                    </div>
                  </div>
                  <div className="col-md-4">
                    <div className="p-3 bg-light rounded-3">
                      <BarChart size={24} className="text-success mb-2" aria-hidden="true" />
                      <h6 className="mb-1">Tendencias</h6>
                      <small className="text-muted">Próximamente</small>
                    </div>
                  </div>
                  <div className="col-md-4">
                    <div className="p-3 bg-light rounded-3">
                      <LineChart size={24} className="text-warning mb-2" aria-hidden="true" />
                      <h6 className="mb-1">Progreso</h6>
                      <small className="text-muted">Próximamente</small>
                    </div>
                  </div>
                </div>
              </div>
            </Card.Body>
          </Card>

          {/* Progreso del Mes - Mejor diseño */}
          <Card className="border-0 shadow-sm">
            <Card.Header className="bg-transparent border-0 pb-0">
              <h6 className="mb-0 fw-bold">
                <Target size={18} className="me-2" aria-hidden="true" />
                Progreso del Mes
              </h6>
            </Card.Header>
            <Card.Body className="p-4">
              {progressStats.map((stat, index) => (
                <div key={index} className="mb-4">
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <h6 className="text-muted mb-0 fw-semibold">{stat.title}</h6>
                    <span className="text-muted small">
                      {stat.current}{stat.unit} / {stat.target}{stat.unit}
                    </span>
                  </div>
                  <div className="d-flex align-items-center mb-2">
                    <ProgressBar
                      now={Math.min((stat.current / stat.target) * 100, 100)}
                      variant={stat.color}
                      className="flex-grow-1 me-3"
                      style={{ height: '8px' }}
                      aria-label={`Progreso de ${stat.title}: ${((stat.current / stat.target) * 100 || 0).toFixed(1)}%`}
                    />
                    <span className="fw-bold text-nowrap">
                      {((stat.current / stat.target) * 100 || 0).toFixed(1)}%
                    </span>
                  </div>
                  <small className="text-muted">
                    {stat.current} de {stat.target} {stat.unit.toLowerCase()} completados
                  </small>
                </div>
              ))}
            </Card.Body>
          </Card>
        </Col>

        {/* Columna derecha - Actividades y resumen */}
        <Col lg={4} className="mb-4">
          {/* Actividades recientes */}
          <RecentActivitiesCard
            activities={recentActivities}
            title="Actividades Recientes"
            onViewAll={handleViewAllActivities}
          />

          {/* Resumen Rápido - Mejor diseño */}
          <Card className="mb-4 border-0 shadow-sm">
            <Card.Header className="bg-transparent border-0 pb-0">
              <h6 className="mb-0 fw-bold">
                <Clock size={18} className="me-2" aria-hidden="true" />
                Resumen Rápido
              </h6>
            </Card.Header>
            <Card.Body className="p-4">
              <div className="row g-3 text-center">
                <div className="col-4">
                  <div className="p-3 bg-success bg-opacity-10 rounded-3">
                    <h4 className="text-success mb-1 fw-bold">85%</h4>
                    <small className="text-muted">Cumplimiento</small>
                  </div>
                </div>
                <div className="col-4">
                  <div className="p-3 bg-warning bg-opacity-10 rounded-3">
                    <h4 className="text-warning mb-1 fw-bold">12</h4>
                    <small className="text-muted">Nuevos Pacientes</small>
                  </div>
                </div>
                <div className="col-4">
                  <div className="p-3 bg-info bg-opacity-10 rounded-3">
                    <h4 className="text-info mb-1 fw-bold">92%</h4>
                    <small className="text-muted">Satisfacción</small>
                  </div>
                </div>
              </div>
            </Card.Body>
          </Card>

          {/* Acciones Rápidas - Diseño compacto */}
          <Card className="border-0 shadow-sm">
            <Card.Header className="bg-transparent border-0 pb-0">
              <h6 className="mb-0 fw-bold">
                <Zap size={18} className="me-2" aria-hidden="true" />
                Acciones Rápidas
              </h6>
            </Card.Header>
            <Card.Body className="p-4">
              <div className="row g-2">
                <div className="col-6 mb-2">
                  <Button
                    id="quick-new-patient-btn"
                    variant="outline-primary"
                    className="w-100 h-100 d-flex flex-column align-items-center justify-content-center py-3 rounded-3"
                    onClick={() => navigate('/patients')}
                    aria-label="Agregar nuevo paciente"
                    title="Ir a la página de pacientes"
                  >
                    <Users size={20} className="mb-2" aria-hidden="true" />
                    <span className="small">Nuevo Paciente</span>
                  </Button>
                </div>
                <div className="col-6 mb-2">
                  <Button
                    id="quick-create-plan-btn"
                    variant="outline-success"
                    className="w-100 h-100 d-flex flex-column align-items-center justify-content-center py-3 rounded-3"
                    onClick={() => navigate('/diet-plans')}
                    aria-label="Crear plan nutricional"
                    title="Ir a la página de planes nutricionales"
                  >
                    <FileText size={20} className="mb-2" aria-hidden="true" />
                    <span className="small">Crear Plan</span>
                  </Button>
                </div>
                <div className="col-6 mb-2">
                  <Button
                    id="quick-schedule-appointment-btn"
                    variant="outline-warning"
                    className="w-100 h-100 d-flex flex-column align-items-center justify-content-center py-3 rounded-3"
                    onClick={() => navigate('/calendar')}
                    aria-label="Programar cita"
                    title="Ir al calendario para programar citas"
                  >
                    <Calendar size={20} className="mb-2" aria-hidden="true" />
                    <span className="small">Programar Cita</span>
                  </Button>
                </div>
                <div className="col-6 mb-2">
                  <Button
                    id="quick-clinical-records-btn"
                    variant="outline-info"
                    className="w-100 h-100 d-flex flex-column align-items-center justify-content-center py-3 rounded-3"
                    onClick={() => navigate('/clinical-records')}
                    aria-label="Ver expedientes clínicos"
                    title="Ir a la página de expedientes clínicos"
                  >
                    <Award size={20} className="mb-2" aria-hidden="true" />
                    <span className="small">Expediente</span>
                  </Button>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Estadísticas detalladas (condicional) - Mejor espaciado */}
      {showDetailedStats && dashboardData && (
        <Row className="mt-5">
          <Col>
            <Card className="border-0 shadow-sm">
              <Card.Header className="bg-transparent border-0 pb-0">
                <h5 className="mb-0 fw-bold">
                  <Settings size={20} className="me-2" aria-hidden="true" />
                  Estadísticas Detalladas
                </h5>
              </Card.Header>
              <Card.Body className="p-4">
                <Row className="g-4">
                  <Col md={6} lg={3} className="mb-3">
                    <div className="text-center p-3 bg-primary bg-opacity-10 rounded-3">
                      <h3 className="text-primary mb-1 fw-bold">
                        {dashboardData.performance_metrics?.completion_rate || 0}%
                      </h3>
                      <small className="text-muted">Tasa de Completitud</small>
                    </div>
                  </Col>
                  <Col md={6} lg={3} className="mb-3">
                    <div className="text-center p-3 bg-success bg-opacity-10 rounded-3">
                      <h3 className="text-success mb-1 fw-bold">
                        {dashboardData.total_appointments || 0}
                      </h3>
                      <small className="text-muted">Citas Totales</small>
                    </div>
                  </Col>
                  <Col md={6} lg={3} className="mb-3">
                    <div className="text-center p-3 bg-warning bg-opacity-10 rounded-3">
                      <h3 className="text-warning mb-1 fw-bold">
                        {dashboardData.total_diet_plans || 0}
                      </h3>
                      <small className="text-muted">Planes Nutricionales</small>
                    </div>
                  </Col>
                  <Col md={6} lg={3} className="mb-3">
                    <div className="text-center p-3 bg-info bg-opacity-10 rounded-3">
                      <h3 className="text-info mb-1 fw-bold">
                        {dashboardData.total_clinical_records || 0}
                      </h3>
                      <small className="text-muted">Expedientes Clínicos</small>
                    </div>
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}

      {/* Información de última actualización - Mejor espaciado */}
      <Row className="mt-5">
        <Col>
          <div className="text-center">
            <small className="text-muted">
              Última actualización: {lastRefresh.toLocaleTimeString()}
            </small>
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default DashboardPage; 