import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Spinner, Alert, ProgressBar} from 'react-bootstrap';
import adminService from '../../services/adminService';

// React Icons
import { 
  MdPeople,
  MdEvent,
  MdPayment,
  MdMenuBook,
  MdChat,
  MdAssessment,
  MdDashboard,
  MdAnalytics,
  MdTrendingUp
} from 'react-icons/md';
import { 
  FaUsers, 
  FaUserFriends,
  FaChartLine,
  FaMoneyBillWave,
  FaBookOpen,
  FaComments,
  FaCalendarCheck,
  FaUserMd
} from 'react-icons/fa';

interface MetricCardProps {
  title: string;
  value: number | string;
  subtitle?: string;
  icon: React.ReactNode;
  color: string;
  percentage?: number;
  trend?: 'up' | 'down' | 'neutral';
}

const MetricCard: React.FC<MetricCardProps> = ({ 
  title, 
  value, 
  subtitle, 
  icon, 
  color, 
  percentage,
    // trend
}) => (
  <Card className={`border-start border-${color} border-4`}>
    <Card.Body>
      <div className="d-flex align-items-center">
        <div className={`text-${color} me-3`} style={{ fontSize: '2rem' }}>
          {icon}
        </div>
        <div className="flex-grow-1">
          <h3 className="mb-0">{value}</h3>
          <p className="text-muted mb-0">{title}</p>
          {subtitle && (
            <small className="text-muted">{subtitle}</small>
          )}
          {percentage !== undefined && (
            <div className="mt-2">
              <ProgressBar 
                now={percentage} 
                variant={color} 
                style={{ height: '6px' }}
              />
              <small className="text-muted">{percentage}%</small>
            </div>
          )}
        </div>
      </div>
    </Card.Body>
  </Card>
);

const AdminAdvancedMetricsTab: React.FC = () => {
  const [metrics, setMetrics] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  useEffect(() => {
    loadMetrics();
    // Actualizar métricas cada 5 minutos
    const interval = setInterval(loadMetrics, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const loadMetrics = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await adminService.getAdvancedSystemMetrics();
      setMetrics(data);
      setLastUpdated(new Date());
    } catch (err: any) {
      setError('Error al cargar las métricas: ' + (err.message || 'Error desconocido'));
    } finally {
      setLoading(false);
    }
  };

  if (loading && !metrics) {
    return (
      <div className="text-center">
        <Spinner animation="border" />
        <p>Cargando métricas del sistema...</p>
      </div>
    );
  }

  if (error && !metrics) {
    return (
      <Alert variant="danger">
        {error}
      </Alert>
    );
  }

  if (!metrics) {
    return (
      <Alert variant="warning">
        No se pudieron cargar las métricas del sistema.
      </Alert>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h4><MdAnalytics /> Métricas Avanzadas del Sistema</h4>
          {lastUpdated && (
            <small className="text-muted">
              Última actualización: {lastUpdated.toLocaleString('es-ES')}
            </small>
          )}
        </div>
        {loading && <Spinner animation="border" size="sm" />}
      </div>

      {error && (
        <Alert variant="warning" dismissible onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Métricas de Usuarios */}
      <Card className="mb-4">
        <Card.Header>
          <h5><FaUsers /> Estadísticas de Usuarios</h5>
        </Card.Header>
        <Card.Body>
          <Row>
            <Col md={3}>
              <MetricCard
                title="Total de Usuarios"
                value={metrics.users.total.toLocaleString()}
                subtitle={`${metrics.users.newLastMonth} nuevos este mes`}
                icon={<MdPeople />}
                color="primary"
                percentage={metrics.users.activePercentage}
              />
            </Col>
            <Col md={3}>
              <MetricCard
                title="Usuarios Activos"
                value={metrics.users.active.toLocaleString()}
                subtitle={`${metrics.users.activePercentage}% del total`}
                icon={<FaUserFriends />}
                color="success"
              />
            </Col>
            <Col md={3}>
              <MetricCard
                title="Nutriólogos"
                value={metrics.users.nutritionists.toLocaleString()}
                icon={<FaUserMd />}
                color="info"
              />
            </Col>
            <Col md={3}>
              <MetricCard
                title="Pacientes"
                value={metrics.users.patients.toLocaleString()}
                icon={<MdPeople />}
                color="warning"
              />
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Métricas de Citas */}
      <Card className="mb-4">
        <Card.Header>
          <h5><MdEvent /> Estadísticas de Citas</h5>
        </Card.Header>
        <Card.Body>
          <Row>
            <Col md={3}>
              <MetricCard
                title="Total de Citas"
                value={metrics.appointments.total.toLocaleString()}
                icon={<MdEvent />}
                color="primary"
              />
            </Col>
            <Col md={3}>
              <MetricCard
                title="Citas Completadas"
                value={metrics.appointments.completed.toLocaleString()}
                subtitle={`${metrics.appointments.completionRate}% de éxito`}
                icon={<FaCalendarCheck />}
                color="success"
                percentage={metrics.appointments.completionRate}
              />
            </Col>
            <Col md={3}>
              <MetricCard
                title="Citas Programadas"
                value={metrics.appointments.scheduled.toLocaleString()}
                icon={<MdEvent />}
                color="info"
              />
            </Col>
            <Col md={3}>
              <MetricCard
                title="Citas de Hoy"
                value={metrics.appointments.today.toLocaleString()}
                icon={<MdEvent />}
                color="warning"
              />
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Métricas Financieras */}
      <Card className="mb-4">
        <Card.Header>
          <h5><MdPayment /> Estadísticas Financieras</h5>
        </Card.Header>
        <Card.Body>
          <Row>
            <Col md={3}>
              <MetricCard
                title="Total Transacciones"
                value={metrics.financial.totalTransactions.toLocaleString()}
                icon={<MdPayment />}
                color="primary"
              />
            </Col>
            <Col md={3}>
              <MetricCard
                title="Transacciones Exitosas"
                value={metrics.financial.successfulTransactions.toLocaleString()}
                subtitle={`${metrics.financial.successRate}% de éxito`}
                icon={<FaMoneyBillWave />}
                color="success"
                percentage={metrics.financial.successRate}
              />
            </Col>
            <Col md={3}>
              <MetricCard
                title="Ingresos Totales"
                value={`$${metrics.financial.totalRevenue.toLocaleString()}`}
                icon={<FaChartLine />}
                color="success"
              />
            </Col>
            <Col md={3}>
              <MetricCard
                title="Tasa de Éxito"
                value={`${metrics.financial.successRate}%`}
                icon={<MdTrendingUp />}
                color="info"
                percentage={metrics.financial.successRate}
              />
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Métricas de Contenido */}
      <Card className="mb-4">
        <Card.Header>
          <h5><MdMenuBook /> Estadísticas de Contenido</h5>
        </Card.Header>
        <Card.Body>
          <Row>
            <Col md={3}>
              <MetricCard
                title="Alimentos"
                value={metrics.content.foods.toLocaleString()}
                icon={<MdMenuBook />}
                color="primary"
              />
            </Col>
            <Col md={3}>
              <MetricCard
                title="Recetas"
                value={metrics.content.recipes.toLocaleString()}
                icon={<FaBookOpen />}
                color="info"
              />
            </Col>
            <Col md={3}>
              <MetricCard
                title="Contenido Educativo"
                value={metrics.content.educationalContent.toLocaleString()}
                subtitle={`${metrics.content.publishedContent} publicados`}
                icon={<MdMenuBook />}
                color="success"
                percentage={metrics.content.contentPublishRate}
              />
            </Col>
            <Col md={3}>
              <MetricCard
                title="Plantillas"
                value={metrics.content.templates.toLocaleString()}
                subtitle={`${metrics.content.publicTemplates} públicas`}
                icon={<MdAssessment />}
                color="warning"
              />
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Métricas de Actividad */}
      <Card className="mb-4">
        <Card.Header>
          <h5><MdChat /> Estadísticas de Actividad</h5>
        </Card.Header>
        <Card.Body>
          <Row>
            <Col md={3}>
              <MetricCard
                title="Expedientes Clínicos"
                value={metrics.activity.clinicalRecords.toLocaleString()}
                icon={<MdAssessment />}
                color="primary"
              />
            </Col>
            <Col md={3}>
              <MetricCard
                title="Conversaciones"
                value={metrics.activity.conversations.toLocaleString()}
                icon={<FaComments />}
                color="info"
              />
            </Col>
            <Col md={3}>
              <MetricCard
                title="Mensajes Totales"
                value={metrics.activity.messages.toLocaleString()}
                subtitle={`${metrics.activity.avgMessagesPerConversation} promedio por conversación`}
                icon={<MdChat />}
                color="success"
              />
            </Col>
            <Col md={3}>
              <MetricCard
                title="Planes de Dieta"
                value={metrics.activity.dietPlans.toLocaleString()}
                icon={<MdMenuBook />}
                color="warning"
              />
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Resumen General */}
      <Card>
        <Card.Header>
          <h5><MdDashboard /> Resumen General del Sistema</h5>
        </Card.Header>
        <Card.Body>
          <Row>
            <Col md={6}>
              <h6>Indicadores Clave de Rendimiento</h6>
              <ul className="list-unstyled">
                <li className="d-flex justify-content-between">
                  <span>Usuarios Activos:</span>
                  <strong className="text-success">{metrics.users.activePercentage}%</strong>
                </li>
                <li className="d-flex justify-content-between">
                  <span>Tasa de Finalización de Citas:</span>
                  <strong className="text-success">{metrics.appointments.completionRate}%</strong>
                </li>
                <li className="d-flex justify-content-between">
                  <span>Tasa de Éxito en Pagos:</span>
                  <strong className="text-success">{metrics.financial.successRate}%</strong>
                </li>
                <li className="d-flex justify-content-between">
                  <span>Contenido Publicado:</span>
                  <strong className="text-info">{metrics.content.contentPublishRate}%</strong>
                </li>
              </ul>
            </Col>
            <Col md={6}>
              <h6>Actividad Reciente</h6>
              <ul className="list-unstyled">
                <li className="d-flex justify-content-between">
                  <span>Nuevos Usuarios (último mes):</span>
                  <strong className="text-primary">{metrics.users.newLastMonth}</strong>
                </li>
                <li className="d-flex justify-content-between">
                  <span>Citas Programadas para Hoy:</span>
                  <strong className="text-warning">{metrics.appointments.today}</strong>
                </li>
                <li className="d-flex justify-content-between">
                  <span>Promedio Mensajes/Conversación:</span>
                  <strong className="text-info">{metrics.activity.avgMessagesPerConversation}</strong>
                </li>
                <li className="d-flex justify-content-between">
                  <span>Total Expedientes Clínicos:</span>
                  <strong className="text-success">{metrics.activity.clinicalRecords}</strong>
                </li>
              </ul>
            </Col>
          </Row>
        </Card.Body>
      </Card>
    </div>
  );
};

export default AdminAdvancedMetricsTab;