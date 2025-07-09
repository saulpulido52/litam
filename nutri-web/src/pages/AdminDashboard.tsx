import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Alert, Badge, Spinner, Nav, Tab } from 'react-bootstrap';
import { useAdmin } from '../hooks/useAdmin';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';

// React Icons
import { 
  MdAdminPanelSettings,
  MdPeople,
  MdSubscriptions,
  MdHealthAndSafety,
  MdBuild,
  MdSettings,
  MdRefresh,
  MdAdd,
  MdEdit,
  MdDelete,
  MdVisibility,
  MdWarning,
  MdCheckCircle,
  MdError,
  MdInfo,
  MdDashboard,
  MdSecurity,
  MdStorage,
  MdSpeed,
  MdMemory,
  MdComputer,
  MdNetworkCheck,
  MdDataUsage,
  MdAnalytics,
  MdReport,
  MdBugReport,
  MdAutoFixHigh,
  MdBackup,
  MdRestore,
  MdTune,
  MdNotifications,
  MdEmail,
  MdSms,
  MdPushPin
} from 'react-icons/md';
import { 
  FaUsers, 
  FaUserShield, 
  FaUserCheck, 
  FaUserTimes,
  FaChartLine,
  FaExclamationTriangle,
  FaExclamationCircle,
  FaInfoCircle,
  FaCheckCircle,
  FaDatabase,
  FaServer,
  FaNetworkWired,
  FaHdd,
  FaMemory,
  FaMicrochip,
  FaShieldAlt,
  FaCogs,
  FaBell,
  FaEnvelope,
  FaSms
} from 'react-icons/fa';
import { 
  BsGearFill, 
  BsExclamationTriangleFill,
  BsCheckCircleFill,
  BsInfoCircleFill,
  BsXCircleFill,
  BsArrowUp,
  BsArrowDown,
  BsDash
} from 'react-icons/bs';

// Componentes de Admin
import AdminUsersTab from '../components/Admin/AdminUsersTab';
import AdminSubscriptionsTab from '../components/Admin/AdminSubscriptionsTab';
import AdminSystemHealthTab from '../components/Admin/AdminSystemHealthTab';
import AdminDataIntegrityTab from '../components/Admin/AdminDataIntegrityTab';
import AdminSettingsTab from '../components/Admin/AdminSettingsTab';

const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const {
    users,
    subscriptions,
    systemHealth,
    dataIntegrity,
    loading,
    error,
    stats,
    loadAllData,
    clearError
  } = useAdmin();

  const [activeTab, setActiveTab] = useState('overview');

  // Verificar si el usuario es admin
  useEffect(() => {
    if (user && user.role?.name !== 'ADMIN') {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  // Cargar datos al montar el componente
  useEffect(() => {
    if (user?.role?.name === 'ADMIN') {
      loadAllData();
    }
  }, [user, loadAllData]);

  // Si no es admin, mostrar loading
  if (!user || user.role?.name !== 'ADMIN') {
    return (
      <Container className="py-5">
        <div className="text-center">
          <Spinner animation="border" variant="primary" />
          <p className="mt-3">Verificando permisos de administrador...</p>
        </div>
      </Container>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'success';
      case 'inactive': return 'danger';
      case 'pending': return 'warning';
      case 'expired': return 'secondary';
      default: return 'info';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'danger';
      case 'high': return 'warning';
      case 'medium': return 'info';
      case 'low': return 'secondary';
      default: return 'info';
    }
  };

  return (
    <Container fluid className="py-4">
      {/* Header */}
      <Row className="mb-4">
        <Col>
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h1 className="h3 mb-0">
                <MdAdminPanelSettings className="me-2 text-primary" />
                Panel de Administración
              </h1>
              <p className="text-muted mb-0">
                Gestión completa del sistema NutriWeb
              </p>
            </div>
            <div className="d-flex gap-2">
              <Button 
                variant="outline-primary" 
                size="sm"
                onClick={loadAllData}
                disabled={loading}
              >
                <MdRefresh className="me-1" />
                {loading ? 'Actualizando...' : 'Actualizar'}
              </Button>
              <Button 
                variant="outline-secondary" 
                size="sm"
                onClick={() => navigate('/dashboard')}
              >
                <MdDashboard className="me-1" />
                Dashboard
              </Button>
            </div>
          </div>
        </Col>
      </Row>

      {/* Alertas de Error */}
      {error && (
        <Row className="mb-4">
          <Col>
            <Alert variant="danger" dismissible onClose={clearError}>
              <MdError className="me-2" />
              <strong>Error:</strong> {error}
            </Alert>
          </Col>
        </Row>
      )}

      {/* Estadísticas Rápidas */}
      <Row className="mb-4">
        <Col md={3} className="mb-3">
          <Card className="border-0 shadow-sm h-100">
            <Card.Body>
              <div className="d-flex align-items-center">
                <div className="bg-primary bg-opacity-10 rounded-3 p-3 me-3">
                  <FaUsers className="text-primary" size={24} />
                </div>
                <div>
                  <h4 className="mb-0">{stats.totalUsers}</h4>
                  <small className="text-muted">Total Usuarios</small>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3} className="mb-3">
          <Card className="border-0 shadow-sm h-100">
            <Card.Body>
              <div className="d-flex align-items-center">
                <div className="bg-success bg-opacity-10 rounded-3 p-3 me-3">
                  <FaUserCheck className="text-success" size={24} />
                </div>
                <div>
                  <h4 className="mb-0">{stats.activeUsers}</h4>
                  <small className="text-muted">Usuarios Activos</small>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3} className="mb-3">
          <Card className="border-0 shadow-sm h-100">
            <Card.Body>
              <div className="d-flex align-items-center">
                <div className="bg-info bg-opacity-10 rounded-3 p-3 me-3">
                  <MdSubscriptions className="text-info" size={24} />
                </div>
                <div>
                  <h4 className="mb-0">{stats.totalSubscriptions}</h4>
                  <small className="text-muted">Suscripciones</small>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3} className="mb-3">
          <Card className="border-0 shadow-sm h-100">
            <Card.Body>
              <div className="d-flex align-items-center">
                <div className="bg-warning bg-opacity-10 rounded-3 p-3 me-3">
                  <MdHealthAndSafety className="text-warning" size={24} />
                </div>
                <div>
                  <h4 className="mb-0">
                    {dataIntegrity?.summary.total_issues || 0}
                  </h4>
                  <small className="text-muted">Problemas Detectados</small>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Navegación por Tabs */}
      <Row>
        <Col>
          <Card className="border-0 shadow-sm">
            <Card.Header className="bg-white border-0 pb-0">
              <Nav variant="tabs" activeKey={activeTab} onSelect={(k) => setActiveTab(k || 'overview')}>
                <Nav.Item>
                  <Nav.Link eventKey="overview" className="d-flex align-items-center">
                    <MdDashboard className="me-2" />
                    Resumen
                  </Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link eventKey="users" className="d-flex align-items-center">
                    <FaUsers className="me-2" />
                    Usuarios
                    {users.length > 0 && (
                      <Badge bg="secondary" className="ms-2">{users.length}</Badge>
                    )}
                  </Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link eventKey="subscriptions" className="d-flex align-items-center">
                    <MdSubscriptions className="me-2" />
                    Suscripciones
                    {subscriptions.length > 0 && (
                      <Badge bg="secondary" className="ms-2">{subscriptions.length}</Badge>
                    )}
                  </Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link eventKey="health" className="d-flex align-items-center">
                    <MdHealthAndSafety className="me-2" />
                    Salud del Sistema
                  </Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link eventKey="integrity" className="d-flex align-items-center">
                    <MdBuild className="me-2" />
                    Integridad de Datos
                    {dataIntegrity?.summary.total_issues > 0 && (
                      <Badge bg="danger" className="ms-2">{dataIntegrity.summary.total_issues}</Badge>
                    )}
                  </Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link eventKey="settings" className="d-flex align-items-center">
                    <MdSettings className="me-2" />
                    Configuraciones
                  </Nav.Link>
                </Nav.Item>
              </Nav>
            </Card.Header>
            <Card.Body className="pt-4">
              {loading && (
                <div className="text-center py-5">
                  <Spinner animation="border" variant="primary" />
                  <p className="mt-3">Cargando datos del sistema...</p>
                </div>
              )}

              {!loading && (
                <Tab.Content>
                  {/* Tab: Resumen */}
                  <Tab.Pane eventKey="overview" active={activeTab === 'overview'}>
                    <Row>
                      <Col lg={8}>
                        <h5 className="mb-3">📊 Resumen del Sistema</h5>
                        
                        {/* Salud del Sistema */}
                        {systemHealth && (
                          <Card className="mb-4">
                            <Card.Header>
                              <h6 className="mb-0">
                                <MdHealthAndSafety className="me-2 text-success" />
                                Estado del Sistema
                              </h6>
                            </Card.Header>
                            <Card.Body>
                              <Row>
                                <Col md={6}>
                                  <div className="mb-3">
                                    <strong>Base de Datos:</strong>
                                    <Badge 
                                      bg={systemHealth.database.status === 'connected' ? 'success' : 'danger'}
                                      className="ms-2"
                                    >
                                      {systemHealth.database.status}
                                    </Badge>
                                  </div>
                                  <div className="mb-3">
                                    <strong>API:</strong>
                                    <Badge 
                                      bg={systemHealth.api.status === 'healthy' ? 'success' : 'danger'}
                                      className="ms-2"
                                    >
                                      {systemHealth.api.status}
                                    </Badge>
                                  </div>
                                </Col>
                                <Col md={6}>
                                  <div className="mb-3">
                                    <strong>Memoria:</strong>
                                    <Badge bg="info" className="ms-2">
                                      {systemHealth.system.memory_usage.toFixed(1)}%
                                    </Badge>
                                  </div>
                                  <div className="mb-3">
                                    <strong>CPU:</strong>
                                    <Badge bg="info" className="ms-2">
                                      {systemHealth.system.cpu_usage.toFixed(1)}%
                                    </Badge>
                                  </div>
                                </Col>
                              </Row>
                            </Card.Body>
                          </Card>
                        )}

                        {/* Problemas de Integridad */}
                        {dataIntegrity && dataIntegrity.summary.total_issues > 0 && (
                          <Card className="mb-4 border-warning">
                            <Card.Header className="bg-warning bg-opacity-10">
                              <h6 className="mb-0 text-warning">
                                <MdWarning className="me-2" />
                                Problemas de Integridad Detectados
                              </h6>
                            </Card.Header>
                            <Card.Body>
                              <div className="mb-3">
                                <strong>Total de problemas:</strong> {dataIntegrity.summary.total_issues}
                              </div>
                              <div className="d-flex gap-2 mb-3">
                                {dataIntegrity.summary.critical_issues > 0 && (
                                  <Badge bg="danger">
                                    {dataIntegrity.summary.critical_issues} Críticos
                                  </Badge>
                                )}
                                {dataIntegrity.summary.high_issues > 0 && (
                                  <Badge bg="warning">
                                    {dataIntegrity.summary.high_issues} Altos
                                  </Badge>
                                )}
                                {dataIntegrity.summary.medium_issues > 0 && (
                                  <Badge bg="info">
                                    {dataIntegrity.summary.medium_issues} Medios
                                  </Badge>
                                )}
                                {dataIntegrity.summary.low_issues > 0 && (
                                  <Badge bg="secondary">
                                    {dataIntegrity.summary.low_issues} Bajos
                                  </Badge>
                                )}
                              </div>
                              <Button 
                                variant="outline-warning" 
                                size="sm"
                                onClick={() => setActiveTab('integrity')}
                              >
                                <MdBuild className="me-1" />
                                Ver Detalles
                              </Button>
                            </Card.Body>
                          </Card>
                        )}
                      </Col>
                      <Col lg={4}>
                        <h5 className="mb-3">⚡ Acciones Rápidas</h5>
                        
                        <div className="d-grid gap-2">
                          <Button 
                            variant="outline-primary"
                            onClick={() => setActiveTab('users')}
                          >
                            <FaUsers className="me-2" />
                            Gestionar Usuarios
                          </Button>
                          <Button 
                            variant="outline-info"
                            onClick={() => setActiveTab('subscriptions')}
                          >
                            <MdSubscriptions className="me-2" />
                            Ver Suscripciones
                          </Button>
                          <Button 
                            variant="outline-success"
                            onClick={() => setActiveTab('health')}
                          >
                            <MdHealthAndSafety className="me-2" />
                            Salud del Sistema
                          </Button>
                          <Button 
                            variant="outline-warning"
                            onClick={() => setActiveTab('integrity')}
                          >
                            <MdBuild className="me-2" />
                            Integridad de Datos
                          </Button>
                          <Button 
                            variant="outline-secondary"
                            onClick={() => setActiveTab('settings')}
                          >
                            <MdSettings className="me-2" />
                            Configuraciones
                          </Button>
                        </div>
                      </Col>
                    </Row>
                  </Tab.Pane>

                  {/* Tab: Usuarios */}
                  <Tab.Pane eventKey="users" active={activeTab === 'users'}>
                    <AdminUsersTab />
                  </Tab.Pane>

                  {/* Tab: Suscripciones */}
                  <Tab.Pane eventKey="subscriptions" active={activeTab === 'subscriptions'}>
                    <AdminSubscriptionsTab />
                  </Tab.Pane>

                  {/* Tab: Salud del Sistema */}
                  <Tab.Pane eventKey="health" active={activeTab === 'health'}>
                    <AdminSystemHealthTab />
                  </Tab.Pane>

                  {/* Tab: Integridad de Datos */}
                  <Tab.Pane eventKey="integrity" active={activeTab === 'integrity'}>
                    <AdminDataIntegrityTab />
                  </Tab.Pane>

                  {/* Tab: Configuraciones */}
                  <Tab.Pane eventKey="settings" active={activeTab === 'settings'}>
                    <AdminSettingsTab />
                  </Tab.Pane>
                </Tab.Content>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default AdminDashboard; 