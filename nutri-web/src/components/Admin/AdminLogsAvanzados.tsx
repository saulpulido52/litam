import React, { useState, useEffect } from 'react';
import { 
    Table, 
    Card, 
    Button, 
    Form, 
    Row, 
    Col, 
    Badge, 
    Alert,
    Spinner,
    Pagination,
    Modal,
    Accordion
} from 'react-bootstrap';

interface LogEntry {
    id: string;
    timestamp: string;
    level: 'info' | 'warn' | 'error' | 'debug';
    message: string;
    userId?: string;
    userEmail?: string;
    userRole?: string;
    ip?: string;
    userAgent?: string;
    endpoint?: string;
    method?: string;
    statusCode?: number;
    duration?: number;
    metadata?: any;
}

interface LogsResponse {
    logs: LogEntry[];
    stats: {
        total: number;
        info: number;
        warn: number;
        error: number;
        debug: number;
    };
    pagination: {
        page: number;
        limit: number;
        totalPages: number;
        totalItems: number;
    };
}

const AdminLogsAvanzados: React.FC = () => {
    const [logs, setLogs] = useState<LogEntry[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [stats, setStats] = useState<any>(null);
    const [pagination, setPagination] = useState<any>(null);
    const [filters, setFilters] = useState({
        level: '',
        userId: '',
        endpoint: '',
        fechaDesde: '',
        fechaHasta: '',
        search: ''
    });
    const [selectedLog, setSelectedLog] = useState<LogEntry | null>(null);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [showFilters, setShowFilters] = useState(false);

    // Simular carga de logs (en producción esto vendría del backend)
    useEffect(() => {
        loadLogs();
    }, []);

    const loadLogs = async () => {
        setLoading(true);
        try {
            // Simulación de datos - en producción esto sería una llamada al API
            const mockLogs: LogEntry[] = [
                {
                    id: '1',
                    timestamp: new Date().toISOString(),
                    level: 'info',
                    message: 'Usuario inició sesión exitosamente',
                    userId: 'user123',
                    userEmail: 'nutri@example.com',
                    userRole: 'nutritionist',
                    ip: '192.168.1.1',
                    userAgent: 'Mozilla/5.0...',
                    endpoint: '/api/auth/login',
                    method: 'POST',
                    statusCode: 200,
                    duration: 150
                },
                {
                    id: '2',
                    timestamp: new Date(Date.now() - 60000).toISOString(),
                    level: 'warn',
                    message: 'Intento de acceso fallido',
                    userId: 'user456',
                    userEmail: 'unknown@example.com',
                    userRole: 'unknown',
                    ip: '192.168.1.2',
                    userAgent: 'Mozilla/5.0...',
                    endpoint: '/api/auth/login',
                    method: 'POST',
                    statusCode: 401,
                    duration: 50
                },
                {
                    id: '3',
                    timestamp: new Date(Date.now() - 120000).toISOString(),
                    level: 'error',
                    message: 'Error en la base de datos',
                    userId: 'user789',
                    userEmail: 'admin@example.com',
                    userRole: 'admin',
                    ip: '192.168.1.3',
                    userAgent: 'Mozilla/5.0...',
                    endpoint: '/api/admin/users',
                    method: 'GET',
                    statusCode: 500,
                    duration: 2000
                }
            ];

            setLogs(mockLogs);
            setStats({
                total: mockLogs.length,
                info: mockLogs.filter(l => l.level === 'info').length,
                warn: mockLogs.filter(l => l.level === 'warn').length,
                error: mockLogs.filter(l => l.level === 'error').length,
                debug: mockLogs.filter(l => l.level === 'debug').length
            });
        } catch (err: any) {
            setError(err.message || 'Error al cargar logs');
        } finally {
            setLoading(false);
        }
    };

    const getLevelBadge = (level: string) => {
        switch (level) {
            case 'info':
                return <Badge bg="info">Info</Badge>;
            case 'warn':
                return <Badge bg="warning" text="dark">Warning</Badge>;
            case 'error':
                return <Badge bg="danger">Error</Badge>;
            case 'debug':
                return <Badge bg="secondary">Debug</Badge>;
            default:
                return <Badge bg="secondary">{level}</Badge>;
        }
    };

    const formatDate = (dateString: string) => {
        try {
            return new Date(dateString).toLocaleString('es-ES');
        } catch {
            return dateString;
        }
    };

    const handleShowDetail = (log: LogEntry) => {
        setSelectedLog(log);
        setShowDetailModal(true);
    };

    const handleFilterChange = (field: string, value: string) => {
        setFilters(prev => ({ ...prev, [field]: value }));
    };

    const handleApplyFilters = () => {
        loadLogs(); // En producción, aplicar filtros al API
    };

    const handleClearFilters = () => {
        setFilters({
            level: '',
            userId: '',
            endpoint: '',
            fechaDesde: '',
            fechaHasta: '',
            search: ''
        });
        loadLogs();
    };

    return (
        <div className="admin-logs-avanzados">
            <Card>
                <Card.Header className="d-flex justify-content-between align-items-center">
                    <h5 className="mb-0">
                        <i className="fas fa-file-alt me-2"></i>
                        Logs del Sistema
                    </h5>
                    <div>
                        <Button
                            variant="outline-secondary"
                            size="sm"
                            onClick={() => setShowFilters(!showFilters)}
                            className="me-2"
                        >
                            <i className="fas fa-filter me-1"></i>
                            Filtros
                        </Button>
                        <Button
                            variant="outline-success"
                            size="sm"
                            onClick={loadLogs}
                            disabled={loading}
                        >
                            {loading ? (
                                <Spinner animation="border" size="sm" />
                            ) : (
                                <i className="fas fa-sync me-1"></i>
                            )}
                            Actualizar
                        </Button>
                    </div>
                </Card.Header>

                <Card.Body>
                    {/* Filtros */}
                    {showFilters && (
                        <Card className="mb-3">
                            <Card.Body>
                                <Row>
                                    <Col md={2}>
                                        <Form.Group>
                                            <Form.Label>Nivel</Form.Label>
                                            <Form.Select
                                                value={filters.level}
                                                onChange={(e) => handleFilterChange('level', e.target.value)}
                                            >
                                                <option value="">Todos</option>
                                                <option value="info">Info</option>
                                                <option value="warn">Warning</option>
                                                <option value="error">Error</option>
                                                <option value="debug">Debug</option>
                                            </Form.Select>
                                        </Form.Group>
                                    </Col>
                                    <Col md={2}>
                                        <Form.Group>
                                            <Form.Label>ID Usuario</Form.Label>
                                            <Form.Control
                                                type="text"
                                                placeholder="ID del usuario"
                                                value={filters.userId}
                                                onChange={(e) => handleFilterChange('userId', e.target.value)}
                                            />
                                        </Form.Group>
                                    </Col>
                                    <Col md={2}>
                                        <Form.Group>
                                            <Form.Label>Endpoint</Form.Label>
                                            <Form.Control
                                                type="text"
                                                placeholder="Endpoint"
                                                value={filters.endpoint}
                                                onChange={(e) => handleFilterChange('endpoint', e.target.value)}
                                            />
                                        </Form.Group>
                                    </Col>
                                    <Col md={2}>
                                        <Form.Group>
                                            <Form.Label>Fecha Desde</Form.Label>
                                            <Form.Control
                                                type="date"
                                                value={filters.fechaDesde}
                                                onChange={(e) => handleFilterChange('fechaDesde', e.target.value)}
                                            />
                                        </Form.Group>
                                    </Col>
                                    <Col md={2}>
                                        <Form.Group>
                                            <Form.Label>Fecha Hasta</Form.Label>
                                            <Form.Control
                                                type="date"
                                                value={filters.fechaHasta}
                                                onChange={(e) => handleFilterChange('fechaHasta', e.target.value)}
                                            />
                                        </Form.Group>
                                    </Col>
                                    <Col md={2}>
                                        <Form.Group>
                                            <Form.Label>Búsqueda</Form.Label>
                                            <Form.Control
                                                type="text"
                                                placeholder="Buscar en mensajes"
                                                value={filters.search}
                                                onChange={(e) => handleFilterChange('search', e.target.value)}
                                            />
                                        </Form.Group>
                                    </Col>
                                </Row>
                                <div className="mt-3">
                                    <Button
                                        variant="primary"
                                        size="sm"
                                        onClick={handleApplyFilters}
                                        className="me-2"
                                    >
                                        Aplicar Filtros
                                    </Button>
                                    <Button
                                        variant="outline-secondary"
                                        size="sm"
                                        onClick={handleClearFilters}
                                    >
                                        Limpiar Filtros
                                    </Button>
                                </div>
                            </Card.Body>
                        </Card>
                    )}

                    {/* Estadísticas */}
                    {stats && (
                        <Row className="mb-3">
                            <Col md={2}>
                                <Card className="text-center">
                                    <Card.Body>
                                        <h6>Total</h6>
                                        <h4>{stats.total}</h4>
                                    </Card.Body>
                                </Card>
                            </Col>
                            <Col md={2}>
                                <Card className="text-center">
                                    <Card.Body>
                                        <h6>Info</h6>
                                        <h4 className="text-info">{stats.info}</h4>
                                    </Card.Body>
                                </Card>
                            </Col>
                            <Col md={2}>
                                <Card className="text-center">
                                    <Card.Body>
                                        <h6>Warning</h6>
                                        <h4 className="text-warning">{stats.warn}</h4>
                                    </Card.Body>
                                </Card>
                            </Col>
                            <Col md={2}>
                                <Card className="text-center">
                                    <Card.Body>
                                        <h6>Error</h6>
                                        <h4 className="text-danger">{stats.error}</h4>
                                    </Card.Body>
                                </Card>
                            </Col>
                            <Col md={2}>
                                <Card className="text-center">
                                    <Card.Body>
                                        <h6>Debug</h6>
                                        <h4 className="text-secondary">{stats.debug}</h4>
                                    </Card.Body>
                                </Card>
                            </Col>
                        </Row>
                    )}

                    {/* Error */}
                    {error && (
                        <Alert variant="danger">
                            <i className="fas fa-exclamation-triangle me-2"></i>
                            {error}
                        </Alert>
                    )}

                    {/* Tabla */}
                    {loading ? (
                        <div className="text-center py-4">
                            <Spinner animation="border" />
                            <p className="mt-2">Cargando logs...</p>
                        </div>
                    ) : (
                        <Table responsive striped hover>
                            <thead>
                                <tr>
                                    <th>Timestamp</th>
                                    <th>Nivel</th>
                                    <th>Mensaje</th>
                                    <th>Usuario</th>
                                    <th>Endpoint</th>
                                    <th>Status</th>
                                    <th>Duración</th>
                                    <th>Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {logs.map((log) => (
                                    <tr key={log.id}>
                                        <td>
                                            <small>{formatDate(log.timestamp)}</small>
                                        </td>
                                        <td>
                                            {getLevelBadge(log.level)}
                                        </td>
                                        <td>
                                            <span className="text-truncate d-inline-block" style={{ maxWidth: '200px' }}>
                                                {log.message}
                                            </span>
                                        </td>
                                        <td>
                                            {log.userEmail ? (
                                                <div>
                                                    <small>{log.userEmail}</small>
                                                    <br />
                                                    <Badge bg="secondary" size="sm">{log.userRole}</Badge>
                                                </div>
                                            ) : (
                                                <span className="text-muted">-</span>
                                            )}
                                        </td>
                                        <td>
                                            <small>
                                                {log.method} {log.endpoint}
                                            </small>
                                        </td>
                                        <td>
                                            {log.statusCode ? (
                                                <Badge 
                                                    bg={log.statusCode >= 400 ? 'danger' : log.statusCode >= 300 ? 'warning' : 'success'}
                                                >
                                                    {log.statusCode}
                                                </Badge>
                                            ) : (
                                                <span className="text-muted">-</span>
                                            )}
                                        </td>
                                        <td>
                                            {log.duration ? (
                                                <small>{log.duration}ms</small>
                                            ) : (
                                                <span className="text-muted">-</span>
                                            )}
                                        </td>
                                        <td>
                                            <Button
                                                variant="outline-info"
                                                size="sm"
                                                onClick={() => handleShowDetail(log)}
                                            >
                                                <i className="fas fa-eye"></i>
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
                    )}
                </Card.Body>
            </Card>

            {/* Modal de Detalle */}
            <Modal
                show={showDetailModal}
                onHide={() => setShowDetailModal(false)}
                size="lg"
            >
                <Modal.Header closeButton>
                    <Modal.Title>
                        <i className="fas fa-info-circle me-2"></i>
                        Detalle del Log
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {selectedLog && (
                        <Accordion>
                            <Accordion.Item eventKey="0">
                                <Accordion.Header>Información Básica</Accordion.Header>
                                <Accordion.Body>
                                    <Row>
                                        <Col md={6}>
                                            <p><strong>ID:</strong> {selectedLog.id}</p>
                                            <p><strong>Timestamp:</strong> {formatDate(selectedLog.timestamp)}</p>
                                            <p><strong>Nivel:</strong> {getLevelBadge(selectedLog.level)}</p>
                                            <p><strong>Mensaje:</strong> {selectedLog.message}</p>
                                        </Col>
                                        <Col md={6}>
                                            <p><strong>Usuario:</strong> {selectedLog.userEmail || 'N/A'}</p>
                                            <p><strong>Rol:</strong> {selectedLog.userRole || 'N/A'}</p>
                                            <p><strong>IP:</strong> {selectedLog.ip || 'N/A'}</p>
                                        </Col>
                                    </Row>
                                </Accordion.Body>
                            </Accordion.Item>
                            
                            <Accordion.Item eventKey="1">
                                <Accordion.Header>Información de la Petición</Accordion.Header>
                                <Accordion.Body>
                                    <Row>
                                        <Col md={6}>
                                            <p><strong>Método:</strong> {selectedLog.method || 'N/A'}</p>
                                            <p><strong>Endpoint:</strong> {selectedLog.endpoint || 'N/A'}</p>
                                            <p><strong>Status Code:</strong> {selectedLog.statusCode || 'N/A'}</p>
                                        </Col>
                                        <Col md={6}>
                                            <p><strong>Duración:</strong> {selectedLog.duration ? `${selectedLog.duration}ms` : 'N/A'}</p>
                                            <p><strong>User Agent:</strong></p>
                                            <small className="text-break">{selectedLog.userAgent || 'N/A'}</small>
                                        </Col>
                                    </Row>
                                </Accordion.Body>
                            </Accordion.Item>
                            
                            {selectedLog.metadata && (
                                <Accordion.Item eventKey="2">
                                    <Accordion.Header>Metadatos</Accordion.Header>
                                    <Accordion.Body>
                                        <pre className="bg-light p-3 rounded">
                                            {JSON.stringify(selectedLog.metadata, null, 2)}
                                        </pre>
                                    </Accordion.Body>
                                </Accordion.Item>
                            )}
                        </Accordion>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowDetailModal(false)}>
                        Cerrar
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default AdminLogsAvanzados; 