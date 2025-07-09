import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Button, Badge, Alert, Spinner, ProgressBar } from 'react-bootstrap';
import { useAdmin } from '../../hooks/useAdmin';
import type { SystemHealth } from '../../services/adminService';

// React Icons
import { 
  MdHealthAndSafety,
  MdRefresh,
  MdCheckCircle,
  MdError,
  MdWarning,
  MdInfo,
  MdSpeed,
  MdMemory,
  MdStorage,
  MdComputer,
  MdNetworkCheck,
  MdDataUsage,
  MdAnalytics,
  MdTrendingUp,
  MdTrendingDown,
  MdAccessTime,
  MdHd,
  MdWifi,
  MdWifiOff,
  MdSignalCellular4Bar,
  MdSignalCellular0Bar,
  MdSubscriptions
} from 'react-icons/md';
import { 
  FaDatabase,
  FaServer,
  FaNetworkWired,
  FaHdd,
  FaMemory,
  FaMicrochip,
  FaShieldAlt,
  FaExclamationTriangle,
  FaExclamationCircle,
  FaInfoCircle,
  FaCheckCircle,
  FaClock,
  FaTachometerAlt,
  FaThermometerHalf,
  FaUsers
} from 'react-icons/fa';

const AdminSystemHealthTab: React.FC = () => {
  const {
    systemHealth,
    loading,
    error,
    loadSystemHealth,
    clearError
  } = useAdmin();

  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  // Cargar salud del sistema al montar el componente
  useEffect(() => {
    loadSystemHealth();
  }, [loadSystemHealth]);

  // Actualizar timestamp cuando se carga la salud del sistema
  useEffect(() => {
    if (systemHealth) {
      setLastUpdate(new Date());
    }
  }, [systemHealth]);

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'healthy':
      case 'connected':
        return 'success';
      case 'warning':
        return 'warning';
      case 'error':
      case 'disconnected':
        return 'danger';
      default:
        return 'info';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'healthy':
      case 'connected':
        return <MdCheckCircle className="text-success" />;
      case 'warning':
        return <MdWarning className="text-warning" />;
      case 'error':
      case 'disconnected':
        return <MdError className="text-danger" />;
      default:
        return <MdInfo className="text-info" />;
    }
  };

  const formatUptime = (seconds: number) => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (days > 0) {
      return `${days}d ${hours}h ${minutes}m`;
    } else if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else {
      return `${minutes}m`;
    }
  };

  const formatResponseTime = (ms: number) => {
    if (ms < 100) return `${ms}ms`;
    if (ms < 1000) return `${(ms / 1000).toFixed(1)}s`;
    return `${(ms / 1000).toFixed(2)}s`;
  };

  const getUsageColor = (percentage: number) => {
    if (percentage < 50) return 'success';
    if (percentage < 80) return 'warning';
    return 'danger';
  };

  const getUsageIcon = (percentage: number) => {
    if (percentage < 50) return <MdTrendingUp className="text-success" />;
    if (percentage < 80) return <MdWarning className="text-warning" />;
    return <MdTrendingDown className="text-danger" />;
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" variant="primary" />
        <p className="mt-3">Analizando salud del sistema...</p>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="danger" dismissible onClose={clearError}>
        <MdError className="me-2" />
        <strong>Error:</strong> {error}
      </Alert>
    );
  }

  if (!systemHealth) {
    return (
      <Alert variant="warning">
        <MdWarning className="me-2" />
        No se pudo obtener información de salud del sistema.
      </Alert>
    );
  }

  return (
    <div>
      {/* Header */}
      <Row className="mb-4">
        <Col>
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h5 className="mb-0">
                <MdHealthAndSafety className="me-2 text-primary" />
                Salud del Sistema
              </h5>
              <p className="text-muted mb-0">
                Monitoreo en tiempo real del estado del sistema
              </p>
            </div>
            <div className="d-flex align-items-center gap-2">
              {lastUpdate && (
                <small className="text-muted">
                  <MdAccessTime className="me-1" />
                  Última actualización: {lastUpdate.toLocaleTimeString()}
                </small>
              )}
              <Button 
                variant="outline-primary" 
                size="sm"
                onClick={loadSystemHealth}
                disabled={loading}
              >
                <MdRefresh className="me-1" />
                {loading ? 'Actualizando...' : 'Actualizar'}
              </Button>
            </div>
          </div>
        </Col>
      </Row>

      {/* Estado General */}
      <Row className="mb-4">
        <Col>
          <Card className="border-0 shadow-sm">
            <Card.Header className="bg-primary text-white">
              <h6 className="mb-0">
                <MdHealthAndSafety className="me-2" />
                Estado General del Sistema
              </h6>
            </Card.Header>
            <Card.Body>
              <Row>
                <Col md={3} className="mb-3">
                  <div className="text-center">
                    <div className="mb-2">
                      <FaDatabase size={32} className="text-primary" />
                    </div>
                    <h6>Base de Datos</h6>
                    <Badge bg={getStatusColor(systemHealth.database.status)}>
                      {getStatusIcon(systemHealth.database.status)}
                      {systemHealth.database.status}
                    </Badge>
                    <div className="mt-2">
                      <small className="text-muted">
                        Tiempo de respuesta: {formatResponseTime(systemHealth.database.connection_time)}
                      </small>
                    </div>
                  </div>
                </Col>
                <Col md={3} className="mb-3">
                  <div className="text-center">
                    <div className="mb-2">
                      <FaServer size={32} className="text-info" />
                    </div>
                    <h6>API</h6>
                    <Badge bg={getStatusColor(systemHealth.api.status)}>
                      {getStatusIcon(systemHealth.api.status)}
                      {systemHealth.api.status}
                    </Badge>
                    <div className="mt-2">
                      <small className="text-muted">
                        Tiempo de respuesta: {formatResponseTime(systemHealth.api.response_time)}
                      </small>
                    </div>
                  </div>
                </Col>
                <Col md={3} className="mb-3">
                  <div className="text-center">
                    <div className="mb-2">
                      <FaUsers size={32} className="text-success" />
                    </div>
                    <h6>Usuarios</h6>
                    <div className="h4 mb-0 text-success">{systemHealth.users.total}</div>
                    <small className="text-muted">
                      {systemHealth.users.active} activos
                    </small>
                  </div>
                </Col>
                <Col md={3} className="mb-3">
                  <div className="text-center">
                    <div className="mb-2">
                      <MdSubscriptions size={32} className="text-warning" />
                    </div>
                    <h6>Suscripciones</h6>
                    <div className="h4 mb-0 text-warning">{systemHealth.subscriptions.total}</div>
                    <small className="text-muted">
                      {systemHealth.subscriptions.active} activas
                    </small>
                  </div>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Métricas del Sistema */}
      <Row className="mb-4">
        <Col lg={6} className="mb-3">
          <Card className="border-0 shadow-sm h-100">
            <Card.Header>
              <h6 className="mb-0">
                <MdMemory className="me-2 text-info" />
                Uso de Recursos
              </h6>
            </Card.Header>
            <Card.Body>
              <div className="mb-3">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <span>
                    <FaMemory className="me-2 text-info" />
                    Memoria RAM
                  </span>
                  <span className="fw-bold">
                    {systemHealth.system.memory_usage.toFixed(1)}%
                  </span>
                </div>
                <ProgressBar 
                  variant={getUsageColor(systemHealth.system.memory_usage)}
                  now={systemHealth.system.memory_usage}
                  className="mb-3"
                />
              </div>
              
              <div className="mb-3">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <span>
                    <FaMicrochip className="me-2 text-warning" />
                    CPU
                  </span>
                  <span className="fw-bold">
                    {systemHealth.system.cpu_usage.toFixed(1)}%
                  </span>
                </div>
                <ProgressBar 
                  variant={getUsageColor(systemHealth.system.cpu_usage)}
                  now={systemHealth.system.cpu_usage}
                  className="mb-3"
                />
              </div>
              
              <div className="mb-3">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <span>
                    <FaHdd className="me-2 text-danger" />
                    Almacenamiento
                  </span>
                  <span className="fw-bold">
                    {systemHealth.system.disk_usage.toFixed(1)}%
                  </span>
                </div>
                <ProgressBar 
                  variant={getUsageColor(systemHealth.system.disk_usage)}
                  now={systemHealth.system.disk_usage}
                />
              </div>
            </Card.Body>
          </Card>
        </Col>
        
        <Col lg={6} className="mb-3">
          <Card className="border-0 shadow-sm h-100">
            <Card.Header>
              <h6 className="mb-0">
                <MdAnalytics className="me-2 text-success" />
                Estadísticas de Usuarios
              </h6>
            </Card.Header>
            <Card.Body>
              <div className="mb-3">
                <h6>Distribución por Roles</h6>
                {Object.entries(systemHealth.users.by_role).map(([role, count]) => (
                  <div key={role} className="d-flex justify-content-between align-items-center mb-2">
                    <span className="text-capitalize">{role.toLowerCase()}</span>
                    <Badge bg="primary">{count}</Badge>
                  </div>
                ))}
              </div>
              
              <div className="mb-3">
                <h6>Estado de Suscripciones</h6>
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <span>Activas</span>
                  <Badge bg="success">{systemHealth.subscriptions.active}</Badge>
                </div>
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <span>Expiradas</span>
                  <Badge bg="danger">{systemHealth.subscriptions.expired}</Badge>
                </div>
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <span>Canceladas</span>
                  <Badge bg="secondary">{systemHealth.subscriptions.cancelled}</Badge>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Información Detallada */}
      <Row>
        <Col lg={6} className="mb-3">
          <Card className="border-0 shadow-sm">
            <Card.Header>
              <h6 className="mb-0">
                <FaDatabase className="me-2 text-primary" />
                Información de Base de Datos
              </h6>
            </Card.Header>
            <Card.Body>
              <div className="mb-3">
                <strong>Estado:</strong>
                <Badge bg={getStatusColor(systemHealth.database.status)} className="ms-2">
                  {systemHealth.database.status}
                </Badge>
              </div>
              <div className="mb-3">
                <strong>Tiempo de Conexión:</strong>
                <span className="ms-2">{formatResponseTime(systemHealth.database.connection_time)}</span>
              </div>
              <div className="mb-3">
                <strong>Conexiones Activas:</strong>
                <span className="ms-2">{systemHealth.database.active_connections}</span>
              </div>
            </Card.Body>
          </Card>
        </Col>
        
        <Col lg={6} className="mb-3">
          <Card className="border-0 shadow-sm">
            <Card.Header>
              <h6 className="mb-0">
                <FaServer className="me-2 text-info" />
                Información de API
              </h6>
            </Card.Header>
            <Card.Body>
              <div className="mb-3">
                <strong>Estado:</strong>
                <Badge bg={getStatusColor(systemHealth.api.status)} className="ms-2">
                  {systemHealth.api.status}
                </Badge>
              </div>
              <div className="mb-3">
                <strong>Tiempo de Respuesta:</strong>
                <span className="ms-2">{formatResponseTime(systemHealth.api.response_time)}</span>
              </div>
              <div className="mb-3">
                <strong>Tiempo Activo:</strong>
                <span className="ms-2">{formatUptime(systemHealth.api.uptime)}</span>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Alertas del Sistema */}
      <Row>
        <Col>
          <Card className="border-0 shadow-sm">
            <Card.Header>
              <h6 className="mb-0">
                <MdWarning className="me-2 text-warning" />
                Alertas del Sistema
              </h6>
            </Card.Header>
            <Card.Body>
              {systemHealth.system.memory_usage > 80 && (
                <Alert variant="warning" className="mb-2">
                  <FaMemory className="me-2" />
                  <strong>Alto uso de memoria:</strong> {systemHealth.system.memory_usage.toFixed(1)}%
                </Alert>
              )}
              
              {systemHealth.system.cpu_usage > 80 && (
                <Alert variant="warning" className="mb-2">
                  <FaMicrochip className="me-2" />
                  <strong>Alto uso de CPU:</strong> {systemHealth.system.cpu_usage.toFixed(1)}%
                </Alert>
              )}
              
              {systemHealth.system.disk_usage > 90 && (
                <Alert variant="danger" className="mb-2">
                  <FaHdd className="me-2" />
                  <strong>Almacenamiento crítico:</strong> {systemHealth.system.disk_usage.toFixed(1)}%
                </Alert>
              )}
              
              {systemHealth.database.status !== 'connected' && (
                <Alert variant="danger" className="mb-2">
                  <FaDatabase className="me-2" />
                  <strong>Problema de base de datos:</strong> {systemHealth.database.status}
                </Alert>
              )}
              
              {systemHealth.api.status !== 'healthy' && (
                <Alert variant="danger" className="mb-2">
                  <FaServer className="me-2" />
                  <strong>Problema de API:</strong> {systemHealth.api.status}
                </Alert>
              )}
              
              {systemHealth.system.memory_usage <= 80 && 
               systemHealth.system.cpu_usage <= 80 && 
               systemHealth.system.disk_usage <= 90 &&
               systemHealth.database.status === 'connected' &&
               systemHealth.api.status === 'healthy' && (
                <Alert variant="success">
                  <MdCheckCircle className="me-2" />
                  <strong>Sistema funcionando correctamente</strong>
                </Alert>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default AdminSystemHealthTab; 