import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Button, Badge, Alert, ProgressBar } from 'react-bootstrap';
import { 
  RefreshCw, 
  Server, 
  Database, 
  Globe,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';

interface SystemMetrics {
  cpu: number;
  memory: number;
  disk: number;
  uptime: number;
  activeConnections: number;
  databaseStatus: 'healthy' | 'warning' | 'error';
  apiStatus: 'healthy' | 'warning' | 'error';
  lastBackup: string;
}

interface ServiceStatus {
  name: string;
  status: 'online' | 'offline' | 'warning';
  responseTime: number;
  lastCheck: string;
}

const AdminSystemHealth: React.FC = () => {
  const [metrics, setMetrics] = useState<SystemMetrics | null>(null);
  const [services, setServices] = useState<ServiceStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  // Simulación de datos del sistema
  const fetchSystemHealth = async () => {
    setLoading(true);
    
    // Simular llamada a API
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const mockMetrics: SystemMetrics = {
      cpu: Math.floor(Math.random() * 30) + 20, // 20-50%
      memory: Math.floor(Math.random() * 40) + 30, // 30-70%
      disk: Math.floor(Math.random() * 20) + 10, // 10-30%
      uptime: Math.floor(Math.random() * 24) + 168, // 168-192 horas (7-8 días)
      activeConnections: Math.floor(Math.random() * 50) + 10,
      databaseStatus: Math.random() > 0.1 ? 'healthy' : 'warning',
      apiStatus: Math.random() > 0.05 ? 'healthy' : 'error',
      lastBackup: new Date(Date.now() - Math.random() * 86400000).toISOString()
    };

    const mockServices: ServiceStatus[] = [
      {
        name: 'API Principal',
        status: 'online',
        responseTime: Math.floor(Math.random() * 100) + 50,
        lastCheck: new Date().toISOString()
      },
      {
        name: 'Base de Datos',
        status: 'online',
        responseTime: Math.floor(Math.random() * 50) + 20,
        lastCheck: new Date().toISOString()
      },
      {
        name: 'Servicio de Email',
        status: Math.random() > 0.8 ? 'warning' : 'online',
        responseTime: Math.floor(Math.random() * 200) + 100,
        lastCheck: new Date().toISOString()
      },
      {
        name: 'Almacenamiento',
        status: 'online',
        responseTime: Math.floor(Math.random() * 80) + 30,
        lastCheck: new Date().toISOString()
      }
    ];

    setMetrics(mockMetrics);
    setServices(mockServices);
    setLastUpdate(new Date());
    setLoading(false);
  };

  useEffect(() => {
    fetchSystemHealth();
    const interval = setInterval(fetchSystemHealth, 30000); // Actualizar cada 30 segundos
    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
      case 'online':
        return 'success';
      case 'warning':
        return 'warning';
      case 'error':
      case 'offline':
        return 'danger';
      default:
        return 'secondary';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'healthy':
      case 'online':
        return 'Operativo';
      case 'warning':
        return 'Advertencia';
      case 'error':
      case 'offline':
        return 'Error';
      default:
        return 'Desconocido';
    }
  };

  const formatUptime = (hours: number) => {
    const days = Math.floor(hours / 24);
    const remainingHours = hours % 24;
    return `${days}d ${remainingHours}h`;
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '400px' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Cargando...</span>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h3 className="mb-1">Salud del Sistema</h3>
          <p className="text-muted mb-0">
            Monitoreo en tiempo real del rendimiento y estado de servicios
          </p>
        </div>
        <Button onClick={fetchSystemHealth} disabled={loading} variant="outline-primary">
          <RefreshCw className="me-2" style={{ width: '16px', height: '16px' }} />
          Actualizar
        </Button>
      </div>

      <div className="text-muted small mb-4">
        Última actualización: {lastUpdate.toLocaleTimeString()}
      </div>

      {/* Métricas del Sistema */}
      <Row className="mb-4">
        <Col md={3}>
          <Card className="h-100">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="card-title mb-1">CPU</h6>
                  <h4 className="mb-0">{metrics?.cpu}%</h4>
                </div>
                <Server className="text-muted" style={{ width: '24px', height: '24px' }} />
              </div>
              <ProgressBar 
                now={metrics?.cpu || 0} 
                className="mt-2"
                variant={metrics && metrics.cpu > 80 ? 'danger' : 'primary'}
              />
            </Card.Body>
          </Card>
        </Col>

        <Col md={3}>
          <Card className="h-100">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="card-title mb-1">Memoria</h6>
                  <h4 className="mb-0">{metrics?.memory}%</h4>
                </div>
                <Database className="text-muted" style={{ width: '24px', height: '24px' }} />
              </div>
              <ProgressBar 
                now={metrics?.memory || 0} 
                className="mt-2"
                variant={metrics && metrics.memory > 85 ? 'danger' : 'primary'}
              />
            </Card.Body>
          </Card>
        </Col>

        <Col md={3}>
          <Card className="h-100">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="card-title mb-1">Disco</h6>
                  <h4 className="mb-0">{metrics?.disk}%</h4>
                </div>
                <Globe className="text-muted" style={{ width: '24px', height: '24px' }} />
              </div>
              <ProgressBar 
                now={metrics?.disk || 0} 
                className="mt-2"
                variant={metrics && metrics.disk > 90 ? 'danger' : 'primary'}
              />
            </Card.Body>
          </Card>
        </Col>

        <Col md={3}>
          <Card className="h-100">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="card-title mb-1">Tiempo Activo</h6>
                  <h4 className="mb-0">{formatUptime(metrics?.uptime || 0)}</h4>
                </div>
                <CheckCircle className="text-muted" style={{ width: '24px', height: '24px' }} />
              </div>
              <small className="text-muted">
                {metrics?.activeConnections} conexiones activas
              </small>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Estado de Servicios */}
      <Card className="mb-4">
        <Card.Header>
          <h5 className="mb-0">Estado de Servicios</h5>
        </Card.Header>
        <Card.Body>
          <div className="row">
            {services.map((service, index) => (
              <div key={index} className="col-12 mb-3">
                <div className="d-flex justify-content-between align-items-center p-3 border rounded">
                  <div className="d-flex align-items-center">
                    <div 
                      className={`rounded-circle me-3`} 
                      style={{ 
                        width: '12px', 
                        height: '12px',
                        backgroundColor: service.status === 'online' ? '#28a745' : 
                                       service.status === 'warning' ? '#ffc107' : '#dc3545'
                      }}
                    />
                    <div>
                      <div className="fw-bold">{service.name}</div>
                      <small className="text-muted">
                        Última verificación: {new Date(service.lastCheck).toLocaleTimeString()}
                      </small>
                    </div>
                  </div>
                  <div className="text-end">
                    <Badge bg={getStatusColor(service.status)}>
                      {getStatusText(service.status)}
                    </Badge>
                    <div className="text-muted small mt-1">
                      {service.responseTime}ms
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card.Body>
      </Card>

      {/* Alertas del Sistema */}
      <Card className="mb-4">
        <Card.Header>
          <h5 className="mb-0">Alertas del Sistema</h5>
        </Card.Header>
        <Card.Body>
          <div>
            {metrics?.cpu && metrics.cpu > 80 && (
              <Alert variant="warning">
                <AlertTriangle className="me-2" style={{ width: '16px', height: '16px' }} />
                Uso de CPU elevado ({metrics.cpu}%). Considere optimizar recursos.
              </Alert>
            )}
            
            {metrics?.memory && metrics.memory > 85 && (
              <Alert variant="warning">
                <AlertTriangle className="me-2" style={{ width: '16px', height: '16px' }} />
                Uso de memoria crítico ({metrics.memory}%). Se recomienda reiniciar servicios.
              </Alert>
            )}

            {services.some(s => s.status === 'offline') && (
              <Alert variant="danger">
                <AlertTriangle className="me-2" style={{ width: '16px', height: '16px' }} />
                Algunos servicios están offline. Verifique la conectividad.
              </Alert>
            )}

            {(!metrics?.cpu || metrics.cpu < 80) && 
             (!metrics?.memory || metrics.memory < 85) && 
             services.every(s => s.status === 'online') && (
              <Alert variant="success">
                <CheckCircle className="me-2" style={{ width: '16px', height: '16px' }} />
                Todos los sistemas funcionando correctamente.
              </Alert>
            )}
          </div>
        </Card.Body>
      </Card>

      {/* Información de Backup */}
      <Card>
        <Card.Header>
          <h5 className="mb-0">Información de Backup</h5>
        </Card.Header>
        <Card.Body>
          <div className="row">
            <div className="col-md-6">
              <strong>Último backup:</strong>
              <span className="ms-2">
                {metrics?.lastBackup ? new Date(metrics.lastBackup).toLocaleString() : 'N/A'}
              </span>
            </div>
            <div className="col-md-6">
              <strong>Estado del backup:</strong>
              <Badge bg="success" className="ms-2">Completado</Badge>
            </div>
          </div>
        </Card.Body>
      </Card>
    </div>
  );
};

export default AdminSystemHealth; 