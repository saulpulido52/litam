import React, { useState, useEffect } from 'react';
import { Card, ListGroup, Badge, Button, ButtonGroup } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import {
    getActiveAlerts,
    acknowledgeAlert,
    type GrowthAlert,
    getAlertColor,
    getAlertIcon,
    getAlertStats
} from '../../utils/alertDetection';

const GrowthAlertPanel: React.FC = () => {
    const [alerts, setAlerts] = useState<GrowthAlert[]>([]);
    const [filter, setFilter] = useState<'all' | 'critical' | 'warning'>('all');
    const navigate = useNavigate();

    useEffect(() => {
        loadAlerts();

        // Recargar alertas cada 30 segundos
        const interval = setInterval(loadAlerts, 30000);
        return () => clearInterval(interval);
    }, []);

    const loadAlerts = () => {
        const activeAlerts = getActiveAlerts();
        setAlerts(activeAlerts);
    };

    const handleAcknowledge = (alertId: string) => {
        acknowledgeAlert(alertId);
        loadAlerts();
    };

    const handleViewPatient = (patientId: string) => {
        navigate(`/patients/${patientId}/clinical-records`);
    };

    const filteredAlerts = alerts.filter(growthAlert => {
        if (filter === 'all') return true;
        return growthAlert.severity === filter;
    });

    const stats = getAlertStats();

    if (alerts.length === 0) {
        return (
            <Card className="shadow-sm">
                <Card.Header className="bg-success text-white">
                    <h6 className="mb-0">
                        <i className="bi bi-check-circle me-2"></i>
                        Alertas de Crecimiento
                    </h6>
                </Card.Header>
                <Card.Body className="text-center py-4">
                    <i className="bi bi-check-circle text-success" style={{ fontSize: '3rem' }}></i>
                    <p className="mt-3 mb-0 text-muted">
                        No hay alertas activas. Todos los pacientes están dentro de rangos normales.
                    </p>
                </Card.Body>
            </Card>
        );
    }

    return (
        <Card className="shadow-sm">
            <Card.Header className="bg-danger text-white">
                <div className="d-flex justify-content-between align-items-center">
                    <h6 className="mb-0">
                        <i className="bi bi-exclamation-triangle-fill me-2"></i>
                        Alertas de Crecimiento ({stats.unacknowledged})
                    </h6>
                    <div className="d-flex gap-2">
                        <Badge bg="light" text="dark">
                            {stats.critical} Críticas
                        </Badge>
                        <Badge bg="light" text="dark">
                            {stats.warning} Advertencias
                        </Badge>
                    </div>
                </div>
            </Card.Header>

            <Card.Body className="p-0">
                {/* Filtros */}
                <div className="p-3 border-bottom bg-light">
                    <ButtonGroup size="sm" className="w-100">
                        <Button
                            variant={filter === 'all' ? 'primary' : 'outline-primary'}
                            onClick={() => setFilter('all')}
                        >
                            Todas ({alerts.length})
                        </Button>
                        <Button
                            variant={filter === 'critical' ? 'danger' : 'outline-danger'}
                            onClick={() => setFilter('critical')}
                        >
                            Críticas ({stats.critical})
                        </Button>
                        <Button
                            variant={filter === 'warning' ? 'warning' : 'outline-warning'}
                            onClick={() => setFilter('warning')}
                        >
                            Advertencias ({stats.warning})
                        </Button>
                    </ButtonGroup>
                </div>

                {/* Lista de alertas */}
                <ListGroup variant="flush" style={{ maxHeight: '400px', overflowY: 'auto' }}>
                    {filteredAlerts.length === 0 ? (
                        <ListGroup.Item className="text-center text-muted py-4">
                            No hay alertas de este tipo
                        </ListGroup.Item>
                    ) : (
                        filteredAlerts
                            .sort((a, b) => {
                                // Ordenar por severidad (crítico primero) y luego por fecha
                                if (a.severity === 'critical' && b.severity !== 'critical') return -1;
                                if (a.severity !== 'critical' && b.severity === 'critical') return 1;
                                return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
                            })
                            .map(growthAlert => {
                                const color = getAlertColor(growthAlert.severity);
                                const icon = getAlertIcon(growthAlert.severity);

                                return (
                                    <ListGroup.Item key={growthAlert.id} className="py-3">
                                        <div className="d-flex justify-content-between align-items-start">
                                            <div className="flex-grow-1">
                                                <div className="d-flex align-items-center gap-2 mb-2">
                                                    <Badge bg={color} className="d-flex align-items-center gap-1">
                                                        <i className={`bi bi-${icon}`}></i>
                                                        {growthAlert.severity === 'critical' ? 'Crítico' : 'Atención'}
                                                    </Badge>
                                                    <strong>{growthAlert.patientName}</strong>
                                                </div>
                                                <p className="mb-1">{growthAlert.message}</p>
                                                <small className="text-muted">
                                                    <i className="bi bi-calendar me-1"></i>
                                                    {new Date(growthAlert.createdAt).toLocaleDateString()} •
                                                    Peso: {growthAlert.measurement.weight} kg •
                                                    Edad: {Math.floor(growthAlert.measurement.age / 12)}a {growthAlert.measurement.age % 12}m
                                                </small>
                                            </div>
                                            <div className="d-flex flex-column gap-2">
                                                <Button
                                                    size="sm"
                                                    variant="outline-primary"
                                                    onClick={() => handleViewPatient(growthAlert.patientId)}
                                                >
                                                    <i className="bi bi-eye me-1"></i>
                                                    Ver
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="outline-secondary"
                                                    onClick={() => handleAcknowledge(growthAlert.id)}
                                                >
                                                    <i className="bi bi-check me-1"></i>
                                                    Revisar
                                                </Button>
                                            </div>
                                        </div>
                                    </ListGroup.Item>
                                );
                            })
                    )}
                </ListGroup>
            </Card.Body>
        </Card>
    );
};

export default GrowthAlertPanel;
