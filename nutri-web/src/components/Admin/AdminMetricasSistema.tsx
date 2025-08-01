import React, { useState, useEffect } from 'react';
import { 
    Card, 
    Row, 
    Col,
    Table,
    Button,
    ProgressBar,
    Badge,
    Alert,
    Spinner
} from 'react-bootstrap';

interface SystemMetrics {
    cpu: {
        usage: number;
        cores: number;
        temperature: number;
    };
    memory: {
        total: number;
        used: number;
        available: number;
        usage: number;
    };
    disk: {
        total: number;
        used: number;
        available: number;
        usage: number;
    };
    network: {
        bytesIn: number;
        bytesOut: number;
        connections: number;
    };
    database: {
        connections: number;
        queries: number;
        slowQueries: number;
        uptime: number;
    };
    application: {
        uptime: number;
        requests: number;
        errors: number;
        responseTime: number;
    };
}

const AdminMetricasSistema: React.FC = () => {
    const [metrics, setMetrics] = useState<SystemMetrics | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [autoRefresh, setAutoRefresh] = useState(true);

    useEffect(() => {
        loadMetrics();
        
        if (autoRefresh) {
            const interval = setInterval(loadMetrics, 30000); // Actualizar cada 30 segundos
            return () => clearInterval(interval);
        }
    }, [autoRefresh]);

    const loadMetrics = async () => {
        setLoading(true);
        try {
            // Simulación de métricas - en producción esto vendría del backend
            const mockMetrics: SystemMetrics = {
                cpu: {
                    usage: Math.random() * 100,
                    cores: 8,
                    temperature: 45 + Math.random() * 20
                },
                memory: {
                    total: 16384,
                    used: 8192 + Math.random() * 4096,
                    available: 4096,
                    usage: 60 + Math.random() * 20
                },
                disk: {
                    total: 1000000,
                    used: 400000 + Math.random() * 200000,
                    available: 400000,
                    usage: 50 + Math.random() * 30
                },
                network: {
                    bytesIn: 1024 * 1024 * 100 + Math.random() * 1024 * 1024 * 50,
                    bytesOut: 1024 * 1024 * 50 + Math.random() * 1024 * 1024 * 25,
                    connections: 150 + Math.random() * 50
                },
                database: {
                    connections: 20 + Math.random() * 10,
                    queries: 1000 + Math.random() * 500,
                    slowQueries: Math.random() * 10,
                    uptime: 86400 + Math.random() * 3600
                },
                application: {
                    uptime: 86400 + Math.random() * 3600,
                    requests: 5000 + Math.random() * 2000,
                    errors: Math.random() * 50,
                    responseTime: 100 + Math.random() * 200
                }
            };

            setMetrics(mockMetrics);
        } catch (err: any) {
            setError(err.message || 'Error al cargar métricas');
        } finally {
            setLoading(false);
        }
    };

    const formatBytes = (bytes: number) => {
        const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
        if (bytes === 0) return '0 B';
        const i = Math.floor(Math.log(bytes) / Math.log(1024));
        return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
    };

    const formatUptime = (seconds: number) => {
        const days = Math.floor(seconds / 86400);
        const hours = Math.floor((seconds % 86400) / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        return `${days}d ${hours}h ${minutes}m`;
    };

    const getUsageColor = (usage: number) => {
        if (usage < 50) return 'success';
        if (usage < 80) return 'warning';
        return 'danger';
    };

    const getTemperatureColor = (temp: number) => {
        if (temp < 50) return 'success';
        if (temp < 70) return 'warning';
        return 'danger';
    };

    if (loading && !metrics) {
        return (
            <div className="text-center py-4">
                <Spinner animation="border" />
                <p className="mt-2">Cargando métricas del sistema...</p>
            </div>
        );
    }

    if (error) {
        return (
            <Alert variant="danger">
                <i className="fas fa-exclamation-triangle me-2"></i>
                {error}
            </Alert>
        );
    }

    if (!metrics) return null;

    return (
        <div className="admin-metricas-sistema">
            <div className="d-flex justify-content-between align-items-center mb-3">
                <h5>
                    <i className="fas fa-chart-line me-2"></i>
                    Métricas del Sistema
                </h5>
                <div>
                    <Button
                        variant={autoRefresh ? 'success' : 'outline-success'}
                        size="sm"
                        onClick={() => setAutoRefresh(!autoRefresh)}
                        className="me-2"
                    >
                        <i className={`fas fa-${autoRefresh ? 'pause' : 'play'} me-1`}></i>
                        {autoRefresh ? 'Auto-refresh ON' : 'Auto-refresh OFF'}
                    </Button>
                    <Button
                        variant="outline-primary"
                        size="sm"
                        onClick={loadMetrics}
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
            </div>

            <Row>
                {/* CPU */}
                <Col md={6} lg={4} className="mb-3">
                    <Card>
                        <Card.Header>
                            <h6 className="mb-0">
                                <i className="fas fa-microchip me-2"></i>
                                CPU
                            </h6>
                        </Card.Header>
                        <Card.Body>
                            <div className="d-flex justify-content-between mb-2">
                                <span>Uso</span>
                                <span>{metrics.cpu.usage.toFixed(1)}%</span>
                            </div>
                            <ProgressBar 
                                variant={getUsageColor(metrics.cpu.usage)}
                                now={metrics.cpu.usage} 
                                className="mb-2"
                            />
                            <div className="d-flex justify-content-between">
                                <small>Cores: {metrics.cpu.cores}</small>
                                <small>
                                    Temp: 
                                    <Badge 
                                        bg={getTemperatureColor(metrics.cpu.temperature)}
                                        className="ms-1"
                                    >
                                        {metrics.cpu.temperature.toFixed(1)}°C
                                    </Badge>
                                </small>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>

                {/* Memoria */}
                <Col md={6} lg={4} className="mb-3">
                    <Card>
                        <Card.Header>
                            <h6 className="mb-0">
                                <i className="fas fa-memory me-2"></i>
                                Memoria
                            </h6>
                        </Card.Header>
                        <Card.Body>
                            <div className="d-flex justify-content-between mb-2">
                                <span>Uso</span>
                                <span>{metrics.memory.usage.toFixed(1)}%</span>
                            </div>
                            <ProgressBar 
                                variant={getUsageColor(metrics.memory.usage)}
                                now={metrics.memory.usage} 
                                className="mb-2"
                            />
                            <div className="d-flex justify-content-between">
                                <small>Usado: {formatBytes(metrics.memory.used)}</small>
                                <small>Total: {formatBytes(metrics.memory.total)}</small>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>

                {/* Disco */}
                <Col md={6} lg={4} className="mb-3">
                    <Card>
                        <Card.Header>
                            <h6 className="mb-0">
                                <i className="fas fa-hdd me-2"></i>
                                Disco
                            </h6>
                        </Card.Header>
                        <Card.Body>
                            <div className="d-flex justify-content-between mb-2">
                                <span>Uso</span>
                                <span>{metrics.disk.usage.toFixed(1)}%</span>
                            </div>
                            <ProgressBar 
                                variant={getUsageColor(metrics.disk.usage)}
                                now={metrics.disk.usage} 
                                className="mb-2"
                            />
                            <div className="d-flex justify-content-between">
                                <small>Usado: {formatBytes(metrics.disk.used)}</small>
                                <small>Total: {formatBytes(metrics.disk.total)}</small>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>

                {/* Red */}
                <Col md={6} lg={4} className="mb-3">
                    <Card>
                        <Card.Header>
                            <h6 className="mb-0">
                                <i className="fas fa-network-wired me-2"></i>
                                Red
                            </h6>
                        </Card.Header>
                        <Card.Body>
                            <div className="mb-2">
                                <small>Entrada: {formatBytes(metrics.network.bytesIn)}</small>
                            </div>
                            <div className="mb-2">
                                <small>Salida: {formatBytes(metrics.network.bytesOut)}</small>
                            </div>
                            <div>
                                <small>Conexiones: {metrics.network.connections}</small>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>

                {/* Base de Datos */}
                <Col md={6} lg={4} className="mb-3">
                    <Card>
                        <Card.Header>
                            <h6 className="mb-0">
                                <i className="fas fa-database me-2"></i>
                                Base de Datos
                            </h6>
                        </Card.Header>
                        <Card.Body>
                            <div className="mb-2">
                                <small>Conexiones: {metrics.database.connections}</small>
                            </div>
                            <div className="mb-2">
                                <small>Consultas: {metrics.database.queries}</small>
                            </div>
                            <div className="mb-2">
                                <small>Consultas Lentas: {metrics.database.slowQueries}</small>
                            </div>
                            <div>
                                <small>Uptime: {formatUptime(metrics.database.uptime)}</small>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>

                {/* Aplicación */}
                <Col md={6} lg={4} className="mb-3">
                    <Card>
                        <Card.Header>
                            <h6 className="mb-0">
                                <i className="fas fa-server me-2"></i>
                                Aplicación
                            </h6>
                        </Card.Header>
                        <Card.Body>
                            <div className="mb-2">
                                <small>Uptime: {formatUptime(metrics.application.uptime)}</small>
                            </div>
                            <div className="mb-2">
                                <small>Peticiones: {metrics.application.requests}</small>
                            </div>
                            <div className="mb-2">
                                <small>Errores: {metrics.application.errors}</small>
                            </div>
                            <div>
                                <small>Tiempo Respuesta: {metrics.application.responseTime.toFixed(0)}ms</small>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            {/* Tabla de Alertas */}
            <Card className="mt-3">
                <Card.Header>
                    <h6 className="mb-0">
                        <i className="fas fa-exclamation-triangle me-2"></i>
                        Alertas del Sistema
                    </h6>
                </Card.Header>
                <Card.Body>
                    <Table responsive>
                        <thead>
                            <tr>
                                <th>Componente</th>
                                <th>Métrica</th>
                                <th>Valor</th>
                                <th>Estado</th>
                                <th>Acción</th>
                            </tr>
                        </thead>
                        <tbody>
                            {metrics.cpu.usage > 80 && (
                                <tr>
                                    <td>CPU</td>
                                    <td>Uso</td>
                                    <td>{metrics.cpu.usage.toFixed(1)}%</td>
                                    <td><Badge bg="danger">Crítico</Badge></td>
                                    <td>
                                        <Button size="sm" variant="outline-warning">
                                            Investigar
                                        </Button>
                                    </td>
                                </tr>
                            )}
                            {metrics.memory.usage > 85 && (
                                <tr>
                                    <td>Memoria</td>
                                    <td>Uso</td>
                                    <td>{metrics.memory.usage.toFixed(1)}%</td>
                                    <td><Badge bg="warning">Alto</Badge></td>
                                    <td>
                                        <Button size="sm" variant="outline-warning">
                                            Optimizar
                                        </Button>
                                    </td>
                                </tr>
                            )}
                            {metrics.disk.usage > 90 && (
                                <tr>
                                    <td>Disco</td>
                                    <td>Uso</td>
                                    <td>{metrics.disk.usage.toFixed(1)}%</td>
                                    <td><Badge bg="danger">Crítico</Badge></td>
                                    <td>
                                        <Button size="sm" variant="outline-warning">
                                            Limpiar
                                        </Button>
                                    </td>
                                </tr>
                            )}
                            {metrics.database.slowQueries > 5 && (
                                <tr>
                                    <td>Base de Datos</td>
                                    <td>Consultas Lentas</td>
                                    <td>{metrics.database.slowQueries}</td>
                                    <td><Badge bg="warning">Alto</Badge></td>
                                    <td>
                                        <Button size="sm" variant="outline-warning">
                                            Optimizar
                                        </Button>
                                    </td>
                                </tr>
                            )}
                            {metrics.application.errors > 10 && (
                                <tr>
                                    <td>Aplicación</td>
                                    <td>Errores</td>
                                    <td>{metrics.application.errors}</td>
                                    <td><Badge bg="danger">Crítico</Badge></td>
                                    <td>
                                        <Button size="sm" variant="outline-warning">
                                            Revisar
                                        </Button>
                                    </td>
                                </tr>
                            )}
                            {(!metrics.cpu.usage || metrics.cpu.usage <= 80) && 
                             (!metrics.memory.usage || metrics.memory.usage <= 85) && 
                             (!metrics.disk.usage || metrics.disk.usage <= 90) && 
                             (!metrics.database.slowQueries || metrics.database.slowQueries <= 5) && 
                             (!metrics.application.errors || metrics.application.errors <= 10) && (
                                <tr>
                                    <td colSpan={5} className="text-center text-success">
                                        <i className="fas fa-check-circle me-2"></i>
                                        No hay alertas activas - Sistema funcionando correctamente
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </Table>
                </Card.Body>
            </Card>
        </div>
    );
};

export default AdminMetricasSistema; 