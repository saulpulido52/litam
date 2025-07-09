import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Badge, Button, Alert, Table, Form } from 'react-bootstrap';
import { 
  FileText, 
  Search, 
  Filter, 
  Download, 
  RefreshCw,
  AlertTriangle,
  Info,
  Clock
} from 'lucide-react';

interface LogEntry {
  id: string;
  timestamp: string;
  level: 'info' | 'warning' | 'error' | 'debug';
  message: string;
  userId?: string;
  userName?: string;
  action: string;
  ipAddress: string;
  userAgent: string;
}

interface LogFilter {
  level: string;
  dateFrom: string;
  dateTo: string;
  userId: string;
  action: string;
}

const AdminLogs: React.FC = () => {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [filter, setFilter] = useState<LogFilter>({
    level: '',
    dateFrom: '',
    dateTo: '',
    userId: '',
    action: ''
  });
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

  // Simulación de datos de logs
  const fetchLogsData = async () => {
    setLoading(true);
    
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const mockLogs: LogEntry[] = [
      {
        id: '1',
        timestamp: '2024-01-15T10:30:00Z',
        level: 'info',
        message: 'Usuario inició sesión exitosamente',
        userId: 'user1',
        userName: 'María González',
        action: 'LOGIN',
        ipAddress: '192.168.1.100',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
      {
        id: '2',
        timestamp: '2024-01-15T10:25:00Z',
        level: 'warning',
        message: 'Intento de acceso fallido',
        userId: 'user2',
        userName: 'Carlos Rodríguez',
        action: 'LOGIN_FAILED',
        ipAddress: '192.168.1.101',
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)'
      },
      {
        id: '3',
        timestamp: '2024-01-15T10:20:00Z',
        level: 'error',
        message: 'Error al procesar pago',
        userId: 'user3',
        userName: 'Ana Martínez',
        action: 'PAYMENT_ERROR',
        ipAddress: '192.168.1.102',
        userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_7_1)'
      },
      {
        id: '4',
        timestamp: '2024-01-15T10:15:00Z',
        level: 'info',
        message: 'Cita creada exitosamente',
        userId: 'user4',
        userName: 'Luis Pérez',
        action: 'APPOINTMENT_CREATED',
        ipAddress: '192.168.1.103',
        userAgent: 'Mozilla/5.0 (Android 11; Mobile)'
      },
      {
        id: '5',
        timestamp: '2024-01-15T10:10:00Z',
        level: 'debug',
        message: 'Sincronización de calendario completada',
        userId: 'user1',
        userName: 'María González',
        action: 'CALENDAR_SYNC',
        ipAddress: '192.168.1.100',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    ];

    setLogs(mockLogs);
    setLoading(false);
  };

  useEffect(() => {
    fetchLogsData();
  }, []);

  const applyFilter = () => {
    // Simular filtrado
    console.log('Aplicando filtros:', filter);
  };

  const exportLogs = async () => {
    setExporting(true);
    
    // Simular exportación
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setExporting(false);
    alert('Logs exportados exitosamente');
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'info':
        return 'info';
      case 'warning':
        return 'warning';
      case 'error':
        return 'danger';
      case 'debug':
        return 'secondary';
      default:
        return 'secondary';
    }
  };

  const getLevelText = (level: string) => {
    switch (level) {
      case 'info':
        return 'Información';
      case 'warning':
        return 'Advertencia';
      case 'error':
        return 'Error';
      case 'debug':
        return 'Debug';
      default:
        return 'Desconocido';
    }
  };

  const getActionText = (action: string) => {
    switch (action) {
      case 'LOGIN':
        return 'Inicio de Sesión';
      case 'LOGIN_FAILED':
        return 'Inicio Fallido';
      case 'PAYMENT_ERROR':
        return 'Error de Pago';
      case 'APPOINTMENT_CREATED':
        return 'Cita Creada';
      case 'CALENDAR_SYNC':
        return 'Sincronización';
      default:
        return action;
    }
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

  const errorLogs = logs.filter(log => log.level === 'error').length;
  const warningLogs = logs.filter(log => log.level === 'warning').length;
  const infoLogs = logs.filter(log => log.level === 'info').length;

  return (
    <div>
      <div className="mb-4">
        <h3 className="mb-1">Logs del Sistema</h3>
        <p className="text-muted mb-0">
          Monitoreo y análisis de logs del sistema
        </p>
      </div>

      {/* Estadísticas de Logs */}
      <Row className="mb-4">
        <Col md={3}>
          <Card className="h-100">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="card-title mb-1">Total Logs</h6>
                  <h4 className="mb-0">{logs.length}</h4>
                </div>
                <FileText className="text-muted" style={{ width: '24px', height: '24px' }} />
              </div>
              <small className="text-muted">
                Últimas 24 horas
              </small>
            </Card.Body>
          </Card>
        </Col>

        <Col md={3}>
          <Card className="h-100">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="card-title mb-1">Errores</h6>
                  <h4 className="mb-0 text-danger">{errorLogs}</h4>
                </div>
                <AlertTriangle className="text-danger" style={{ width: '24px', height: '24px' }} />
              </div>
              <small className="text-muted">
                Requieren atención
              </small>
            </Card.Body>
          </Card>
        </Col>

        <Col md={3}>
          <Card className="h-100">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="card-title mb-1">Advertencias</h6>
                  <h4 className="mb-0 text-warning">{warningLogs}</h4>
                </div>
                <AlertTriangle className="text-warning" style={{ width: '24px', height: '24px' }} />
              </div>
              <small className="text-muted">
                Monitorear
              </small>
            </Card.Body>
          </Card>
        </Col>

        <Col md={3}>
          <Card className="h-100">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="card-title mb-1">Información</h6>
                  <h4 className="mb-0 text-info">{infoLogs}</h4>
                </div>
                <Info className="text-info" style={{ width: '24px', height: '24px' }} />
              </div>
              <small className="text-muted">
                Actividad normal
              </small>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Filtros */}
      <Card className="mb-4">
        <Card.Header>
          <h5 className="mb-0">Filtros de Búsqueda</h5>
        </Card.Header>
        <Card.Body>
          <Row>
            <Col md={2}>
              <Form.Group>
                <Form.Label>Nivel</Form.Label>
                <Form.Select 
                  value={filter.level}
                  onChange={(e) => setFilter({...filter, level: e.target.value})}
                >
                  <option value="">Todos</option>
                  <option value="info">Información</option>
                  <option value="warning">Advertencia</option>
                  <option value="error">Error</option>
                  <option value="debug">Debug</option>
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={2}>
              <Form.Group>
                <Form.Label>Desde</Form.Label>
                <Form.Control 
                  type="date" 
                  value={filter.dateFrom}
                  onChange={(e) => setFilter({...filter, dateFrom: e.target.value})}
                />
              </Form.Group>
            </Col>
            <Col md={2}>
              <Form.Group>
                <Form.Label>Hasta</Form.Label>
                <Form.Control 
                  type="date" 
                  value={filter.dateTo}
                  onChange={(e) => setFilter({...filter, dateTo: e.target.value})}
                />
              </Form.Group>
            </Col>
            <Col md={2}>
              <Form.Group>
                <Form.Label>Usuario</Form.Label>
                <Form.Control 
                  type="text" 
                  placeholder="ID de usuario"
                  value={filter.userId}
                  onChange={(e) => setFilter({...filter, userId: e.target.value})}
                />
              </Form.Group>
            </Col>
            <Col md={2}>
              <Form.Group>
                <Form.Label>Acción</Form.Label>
                <Form.Control 
                  type="text" 
                  placeholder="Tipo de acción"
                  value={filter.action}
                  onChange={(e) => setFilter({...filter, action: e.target.value})}
                />
              </Form.Group>
            </Col>
            <Col md={2}>
              <div className="d-flex flex-column justify-content-end h-100">
                <Button 
                  variant="outline-primary" 
                  onClick={applyFilter}
                  className="mb-2"
                >
                  <Search className="me-1" style={{ width: '14px', height: '14px' }} />
                  Filtrar
                </Button>
                <Button 
                  variant="outline-secondary" 
                  onClick={() => setFilter({level: '', dateFrom: '', dateTo: '', userId: '', action: ''})}
                  size="sm"
                >
                  Limpiar
                </Button>
              </div>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Lista de Logs */}
      <Card className="mb-4">
        <Card.Header>
          <div className="d-flex justify-content-between align-items-center">
            <h5 className="mb-0">Logs del Sistema</h5>
            <div>
              <Button 
                variant="outline-primary" 
                size="sm" 
                className="me-2"
                onClick={fetchLogsData}
              >
                <RefreshCw className="me-1" style={{ width: '14px', height: '14px' }} />
                Actualizar
              </Button>
              <Button 
                variant="outline-success" 
                size="sm"
                onClick={exportLogs}
                disabled={exporting}
              >
                <Download className="me-1" style={{ width: '14px', height: '14px' }} />
                {exporting ? 'Exportando...' : 'Exportar'}
              </Button>
            </div>
          </div>
        </Card.Header>
        <Card.Body>
          <Table responsive>
            <thead>
              <tr>
                <th>Timestamp</th>
                <th>Nivel</th>
                <th>Mensaje</th>
                <th>Usuario</th>
                <th>Acción</th>
                <th>IP</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log.id}>
                  <td>
                    <small className="text-muted">
                      {new Date(log.timestamp).toLocaleString()}
                    </small>
                  </td>
                  <td>
                    <Badge bg={getLevelColor(log.level)}>
                      {getLevelText(log.level)}
                    </Badge>
                  </td>
                  <td>
                    <div>
                      <div className="fw-bold">{log.message}</div>
                      <small className="text-muted">
                        {log.userAgent}
                      </small>
                    </div>
                  </td>
                  <td>
                    {log.userName ? (
                      <div>
                        <div className="fw-bold">{log.userName}</div>
                        <small className="text-muted">{log.userId}</small>
                      </div>
                    ) : (
                      <span className="text-muted">Sistema</span>
                    )}
                  </td>
                  <td>
                    <Badge bg="secondary">
                      {getActionText(log.action)}
                    </Badge>
                  </td>
                  <td>
                    <small className="text-muted">
                      {log.ipAddress}
                    </small>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Card.Body>
      </Card>

      {/* Alertas de Logs */}
      <Card className="mb-4">
        <Card.Header>
          <h5 className="mb-0">Alertas de Logs</h5>
        </Card.Header>
        <Card.Body>
          <div>
            {errorLogs > 0 && (
              <Alert variant="danger">
                <AlertTriangle className="me-2" style={{ width: '16px', height: '16px' }} />
                Se detectaron {errorLogs} errores en los logs. Se recomienda revisar inmediatamente.
              </Alert>
            )}

            {warningLogs > 0 && (
              <Alert variant="warning">
                <AlertTriangle className="me-2" style={{ width: '16px', height: '16px' }} />
                Se detectaron {warningLogs} advertencias en los logs. Monitorear actividad.
              </Alert>
            )}

            {errorLogs === 0 && warningLogs === 0 && (
              <Alert variant="success">
                <Info className="me-2" style={{ width: '16px', height: '16px' }} />
                No se detectaron errores o advertencias críticas en los logs.
              </Alert>
            )}

            {logs.length > 100 && (
              <Alert variant="info">
                <Clock className="me-2" style={{ width: '16px', height: '16px' }} />
                Alto volumen de logs ({logs.length}). Considerar optimizar el nivel de logging.
              </Alert>
            )}
          </div>
        </Card.Body>
      </Card>

      {/* Configuración de Logs */}
      <Card>
        <Card.Header>
          <h5 className="mb-0">Configuración de Logs</h5>
        </Card.Header>
        <Card.Body>
          <Row>
            <Col md={4}>
              <Form.Group>
                <Form.Label>Nivel de Logging</Form.Label>
                <Form.Select defaultValue="info">
                  <option value="debug">Debug</option>
                  <option value="info">Información</option>
                  <option value="warning">Advertencia</option>
                  <option value="error">Error</option>
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group>
                <Form.Label>Retención de Logs</Form.Label>
                <Form.Select defaultValue="30">
                  <option value="7">7 días</option>
                  <option value="30">30 días</option>
                  <option value="90">90 días</option>
                  <option value="365">1 año</option>
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group>
                <Form.Label>Notificaciones</Form.Label>
                <Form.Check 
                  type="switch" 
                  id="log-notifications" 
                  label="Alertas por email" 
                  defaultChecked 
                />
              </Form.Group>
            </Col>
          </Row>
        </Card.Body>
      </Card>
    </div>
  );
};

export default AdminLogs; 