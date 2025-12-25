// nutri-web/src/components/ClinicalRecords/DashboardSeguimiento.tsx
import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Table, Badge, ProgressBar, Alert, Spinner } from 'react-bootstrap';
import { FaChartBar, FaUsers, FaCalendarCheck, FaChartArea, FaBullseye } from 'react-icons/fa';
import apiService from '../../services/api';

interface EstadisticasSeguimiento {
    por_tipo: Array<{
        tipo: string;
        total: string | number; // Puede venir como string desde el backend
    }>;
    ultimos_30_dias: number;
    fecha_consulta: string;
}

const DashboardSeguimiento: React.FC = () => {
    const [estadisticas, setEstadisticas] = useState<EstadisticasSeguimiento | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    // Helper para convertir total a número de manera segura
    const toNumber = (value: string | number): number => {
        return typeof value === 'string' ? parseInt(value) || 0 : value;
    };

    useEffect(() => {
        const cargarEstadisticas = async () => {
            try {
                const response = await apiService.get('/clinical-records/stats/seguimiento');
                setEstadisticas(response.data);
            } catch (err: any) {
                console.error('Error cargando estadísticas:', err);
                const errorMessage = err.response?.data?.message || err.message || 'Error al cargar estadísticas';
                setError(errorMessage);
            } finally {
                setLoading(false);
            }
        };

        cargarEstadisticas();
    }, []);

    const getTipoDisplayName = (tipo: string) => {
        const nombres: { [key: string]: string } = {
            'inicial': 'Expedientes Iniciales',
            'seguimiento': 'Seguimientos',
            'urgencia': 'Consultas de Urgencia',
            'control': 'Controles',
            'anual': 'Revisiones Anuales',
            'pre_operatorio': 'Pre-operatorios',
            'post_operatorio': 'Post-operatorios',
            'consulta_especialidad': 'Consultas Especialidad',
            'telehealth': 'Telemedicina'
        };
        return nombres[tipo] || tipo;
    };

    const getTipoBadgeColor = (tipo: string) => {
        const colores: { [key: string]: string } = {
            'inicial': 'primary',
            'seguimiento': 'success',
            'urgencia': 'danger',
            'control': 'warning',
            'anual': 'info',
            'pre_operatorio': 'secondary',
            'post_operatorio': 'dark',
            'consulta_especialidad': 'light',
            'telehealth': 'secondary'
        };
        return colores[tipo] || 'light';
    };

    if (loading) {
        return (
            <Card>
                <Card.Body className="text-center py-5">
                    <Spinner animation="border" className="me-2" />
                    Cargando estadísticas de seguimiento...
                </Card.Body>
            </Card>
        );
    }

    if (error) {
        return (
            <Alert variant="danger">
                Error al cargar estadísticas: {error}
            </Alert>
        );
    }

    if (!estadisticas) {
        return (
            <Alert variant="info">
                No hay estadísticas disponibles.
            </Alert>
        );
    }

    const totalExpedientes = estadisticas.por_tipo.reduce((acc, item) => acc + toNumber(item.total), 0);
    const expedientesSeguimiento = toNumber(estadisticas.por_tipo.find(item => item.tipo === 'seguimiento')?.total || 0);
    const expedientesIniciales = toNumber(estadisticas.por_tipo.find(item => item.tipo === 'inicial')?.total || 0);
    const porcentajeSeguimiento = totalExpedientes > 0 ? Math.round((expedientesSeguimiento / totalExpedientes) * 100) : 0;

    return (
        <div>
            <Card className="mb-4">
                <Card.Header className="bg-primary text-white">
                    <FaChartBar className="me-2" />
                    Dashboard de Seguimiento - Sistema Evolutivo
                </Card.Header>
                <Card.Body>
                    <Row>
                        <Col md={3}>
                            <Card className="text-center border-primary h-100">
                                <Card.Body>
                                    <FaUsers className="text-primary mb-2" size={32} />
                                    <h4 className="text-primary mb-1">{totalExpedientes}</h4>
                                    <small className="text-muted">Total Expedientes</small>
                                </Card.Body>
                            </Card>
                        </Col>
                        <Col md={3}>
                            <Card className="text-center border-success h-100">
                                <Card.Body>
                                    <FaChartArea className="text-success mb-2" size={32} />
                                    <h4 className="text-success mb-1">{expedientesSeguimiento}</h4>
                                    <small className="text-muted">Seguimientos</small>
                                </Card.Body>
                            </Card>
                        </Col>
                        <Col md={3}>
                            <Card className="text-center border-warning h-100">
                                <Card.Body>
                                    <FaCalendarCheck className="text-warning mb-2" size={32} />
                                    <h4 className="text-warning mb-1">{estadisticas.ultimos_30_dias}</h4>
                                    <small className="text-muted">Últimos 30 días</small>
                                </Card.Body>
                            </Card>
                        </Col>
                        <Col md={3}>
                            <Card className="text-center border-info h-100">
                                <Card.Body>
                                    <FaBullseye className="text-info mb-2" size={32} />
                                    <h4 className="text-info mb-1">{porcentajeSeguimiento}%</h4>
                                    <small className="text-muted">% Seguimientos</small>
                                </Card.Body>
                            </Card>
                        </Col>
                    </Row>
                </Card.Body>
            </Card>

            <Row>
                <Col md={6}>
                    <Card className="mb-4">
                        <Card.Header>
                            <FaChartBar className="me-2" />
                            Distribución por Tipo de Expediente
                        </Card.Header>
                        <Card.Body>
                            {estadisticas.por_tipo.length === 0 ? (
                                <Alert variant="info">
                                    No hay expedientes registrados aún.
                                </Alert>
                            ) : (
                                <Table responsive striped hover>
                                    <thead>
                                        <tr>
                                            <th>Tipo de Expediente</th>
                                            <th>Cantidad</th>
                                            <th>Porcentaje</th>
                                            <th>Progreso</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {estadisticas.por_tipo
                                            .sort((a, b) => toNumber(b.total) - toNumber(a.total))
                                            .map((item, index) => {
                                                const porcentaje = totalExpedientes > 0 ?
                                                    Math.round((toNumber(item.total) / totalExpedientes) * 100) : 0;

                                                return (
                                                    <tr key={index}>
                                                        <td>
                                                            <Badge bg={getTipoBadgeColor(item.tipo)} className="me-2">
                                                                {getTipoDisplayName(item.tipo)}
                                                            </Badge>
                                                        </td>
                                                        <td>
                                                            <strong>{item.total}</strong>
                                                        </td>
                                                        <td>{porcentaje}%</td>
                                                        <td>
                                                            <ProgressBar
                                                                now={porcentaje}
                                                                variant={getTipoBadgeColor(item.tipo)}
                                                                style={{ height: '8px' }}
                                                            />
                                                        </td>
                                                    </tr>
                                                );
                                            })
                                        }
                                    </tbody>
                                </Table>
                            )}
                        </Card.Body>
                    </Card>
                </Col>

                <Col md={6}>
                    <Card className="mb-4">
                        <Card.Header>
                            <FaChartArea className="me-2" />
                            Análisis de Eficiencia
                        </Card.Header>
                        <Card.Body>
                            <div className="mb-4">
                                <h6 className="text-muted mb-2">Ratio de Seguimientos vs Iniciales</h6>
                                <div className="d-flex justify-content-between mb-2">
                                    <span>Iniciales: {expedientesIniciales}</span>
                                    <span>Seguimientos: {expedientesSeguimiento}</span>
                                </div>
                                <ProgressBar className="mb-2">
                                    <ProgressBar
                                        variant="primary"
                                        now={expedientesIniciales > 0 ? (expedientesIniciales / (expedientesIniciales + expedientesSeguimiento)) * 100 : 0}
                                        key={1}
                                    />
                                    <ProgressBar
                                        variant="success"
                                        now={expedientesSeguimiento > 0 ? (expedientesSeguimiento / (expedientesIniciales + expedientesSeguimiento)) * 100 : 0}
                                        key={2}
                                    />
                                </ProgressBar>
                                <small className="text-muted">
                                    Un alto ratio de seguimientos indica buena continuidad de atención
                                </small>
                            </div>

                            <div className="mb-4">
                                <h6 className="text-muted mb-2">Actividad Reciente</h6>
                                <div className="d-flex justify-content-between align-items-center mb-2">
                                    <span>Expedientes últimos 30 días:</span>
                                    <Badge bg={estadisticas.ultimos_30_dias > 10 ? 'success' :
                                        estadisticas.ultimos_30_dias > 5 ? 'warning' : 'danger'}
                                        pill>
                                        {estadisticas.ultimos_30_dias}
                                    </Badge>
                                </div>
                                <ProgressBar
                                    now={Math.min((estadisticas.ultimos_30_dias / 20) * 100, 100)}
                                    variant={estadisticas.ultimos_30_dias > 10 ? 'success' :
                                        estadisticas.ultimos_30_dias > 5 ? 'warning' : 'danger'}
                                />
                                <small className="text-muted">
                                    Meta: 20+ expedientes por mes
                                </small>
                            </div>

                            <div>
                                <h6 className="text-muted mb-2">Indicadores de Calidad</h6>
                                <div className="row text-center">
                                    <div className="col">
                                        <div className={`p-2 rounded ${porcentajeSeguimiento >= 60 ? 'bg-success' :
                                            porcentajeSeguimiento >= 40 ? 'bg-warning' : 'bg-danger'} text-white`}>
                                            <small>Continuidad</small>
                                            <div><strong>{porcentajeSeguimiento}%</strong></div>
                                        </div>
                                    </div>
                                    <div className="col">
                                        <div className={`p-2 rounded ${totalExpedientes >= 50 ? 'bg-success' :
                                            totalExpedientes >= 20 ? 'bg-warning' : 'bg-danger'} text-white`}>
                                            <small>Volumen</small>
                                            <div><strong>{totalExpedientes >= 50 ? 'Alto' :
                                                totalExpedientes >= 20 ? 'Medio' : 'Bajo'}</strong></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            <Card>
                <Card.Header>
                    <FaBullseye className="me-2" />
                    Recomendaciones del Sistema
                </Card.Header>
                <Card.Body>
                    <div className="row">
                        <div className="col-md-4">
                            <Alert variant={porcentajeSeguimiento >= 60 ? 'success' : 'warning'} className="mb-3">
                                <strong>Continuidad de Atención:</strong>
                                <br />
                                {porcentajeSeguimiento >= 60 ?
                                    '✅ Excelente seguimiento de pacientes' :
                                    '⚠️ Considera implementar más seguimientos regulares'
                                }
                            </Alert>
                        </div>
                        <div className="col-md-4">
                            <Alert variant={estadisticas.ultimos_30_dias >= 10 ? 'success' : 'info'} className="mb-3">
                                <strong>Actividad Mensual:</strong>
                                <br />
                                {estadisticas.ultimos_30_dias >= 10 ?
                                    '✅ Buena actividad de consultas' :
                                    '💡 Oportunidad de aumentar consultas'
                                }
                            </Alert>
                        </div>
                        <div className="col-md-4">
                            <Alert variant="info" className="mb-3">
                                <strong>Eficiencia del Sistema:</strong>
                                <br />
                                💡 Los seguimientos reducen tiempo de consulta en 70%
                            </Alert>
                        </div>
                    </div>
                </Card.Body>
            </Card>

            <div className="mt-3 text-center">
                <small className="text-muted">
                    Última actualización: {new Date(estadisticas.fecha_consulta).toLocaleString('es-ES')}
                </small>
            </div>
        </div>
    );
};

export default DashboardSeguimiento; 