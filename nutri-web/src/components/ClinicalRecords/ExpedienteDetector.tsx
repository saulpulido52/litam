// nutri-web/src/components/ClinicalRecords/ExpedienteDetector.tsx
import React, { useState, useEffect } from 'react';
import { Card, Button, Spinner, Badge, Alert } from 'react-bootstrap';
import { FaRobot, FaInfoCircle, FaExclamationTriangle, FaCheckCircle } from 'react-icons/fa';
import ErrorAutenticacion from './ErrorAutenticacion';

interface DeteccionExpediente {
    tipoSugerido: string;
    razon: string;
    expedienteBaseId?: string;
    datosHeredables?: any;
    requiereConfirmacion: boolean;
    alertas?: string[];
}

interface ExpedienteDetectorProps {
    patientId: string;
    motivoConsulta?: string;
    esProgramada?: boolean;
    tipoConsultaSolicitada?: string;
    onDeteccionCompleta: (deteccion: DeteccionExpediente) => void;
    onError?: (error: string) => void;
    onVerExpedienteBase?: (expedienteId: string) => void;
}

const ExpedienteDetector: React.FC<ExpedienteDetectorProps> = ({
    patientId,
    motivoConsulta,
    esProgramada = true,
    tipoConsultaSolicitada,
    onDeteccionCompleta,
    onError,
    onVerExpedienteBase
}) => {
    const [deteccion, setDeteccion] = useState<DeteccionExpediente | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const detectarTipo = async () => {
        if (!patientId) return;

        setLoading(true);
        setError(null);

        try {
            const token = localStorage.getItem('access_token');
            if (!token) {
                throw new Error('No hay sesión activa. Por favor inicia sesión nuevamente.');
            }

            const response = await fetch('/api/clinical-records/detect-type', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    patientId,
                    motivoConsulta,
                    esProgramada,
                    tipoConsultaSolicitada
                })
            });

            if (response.status === 401) {
                // Token expirado o inválido
                localStorage.removeItem('access_token');
                throw new Error('Sesión expirada. Por favor inicia sesión nuevamente.');
            }

            if (response.status === 403) {
                throw new Error('No tienes permisos para usar esta función.');
            }

            if (!response.ok) {
                const errorData = await response.json().catch(() => null);
                const errorMessage = errorData?.message || `Error del servidor: ${response.status}`;
                throw new Error(errorMessage);
            }

            const data = await response.json();
            const deteccionResult = data.data;

            setDeteccion(deteccionResult);
            onDeteccionCompleta(deteccionResult);

        } catch (err) {
            console.error('Error en detección automática:', err);
            const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
            setError(errorMessage);
            onError?.(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    // Debounce para evitar peticiones en cada tecla
    useEffect(() => {
        // Solo ejecutar si hay patientId
        if (!patientId) return;

        // Debounce de 1 segundo
        const timeoutId = setTimeout(() => {
            detectarTipo();
        }, 1000);

        // Limpiar timeout si las dependencias cambian antes de 1 segundo
        return () => clearTimeout(timeoutId);
    }, [patientId, motivoConsulta, esProgramada, tipoConsultaSolicitada]);

    const getTipoBadgeColor = (tipo: string) => {
        switch (tipo) {
            case 'inicial': return 'primary';
            case 'seguimiento': return 'success';
            case 'urgencia': return 'danger';
            case 'control': return 'warning';
            case 'anual': return 'info';
            case 'telehealth': return 'secondary';
            default: return 'light';
        }
    };

    const getTipoDisplayName = (tipo: string) => {
        const nombres: { [key: string]: string } = {
            'inicial': 'Expediente Inicial',
            'seguimiento': 'Seguimiento',
            'urgencia': 'Consulta de Urgencia',
            'control': 'Control',
            'anual': 'Revisión Anual',
            'pre_operatorio': 'Pre-operatorio',
            'post_operatorio': 'Post-operatorio',
            'consulta_especialidad': 'Consulta Especialidad',
            'telehealth': 'Telemedicina'
        };
        return nombres[tipo] || tipo;
    };

    if (loading) {
        return (
            <Card className="mb-3">
                <Card.Body className="text-center py-4">
                    <Spinner animation="border" size="sm" className="me-2" />
                    <FaRobot className="me-2" />
                    Detectando tipo de expediente automáticamente...
                </Card.Body>
            </Card>
        );
    }

    if (error) {
        return (
            <ErrorAutenticacion
                error={error}
                onRetry={detectarTipo}
            />
        );
    }

    if (!deteccion) {
        return null;
    }

    return (
        <Card className="mb-3 border-primary">
            <Card.Header className="bg-primary text-white">
                <FaRobot className="me-2" />
                Detección Automática de Expediente
            </Card.Header>
            <Card.Body>
                <div className="d-flex justify-content-between align-items-start mb-3">
                    <div>
                        <h6 className="mb-2">
                            Tipo Sugerido:
                            <Badge
                                bg={getTipoBadgeColor(deteccion.tipoSugerido)}
                                className="ms-2"
                            >
                                {getTipoDisplayName(deteccion.tipoSugerido)}
                            </Badge>
                        </h6>
                        <p className="text-muted mb-0">
                            <FaInfoCircle className="me-1" />
                            {deteccion.razon}
                        </p>
                    </div>

                    {deteccion.requiereConfirmacion && (
                        <Badge bg="warning" text="dark">
                            <FaExclamationTriangle className="me-1" />
                            Requiere Confirmación
                        </Badge>
                    )}
                </div>

                {deteccion.alertas && deteccion.alertas.length > 0 && (
                    <Alert variant="warning" className="mb-3">
                        <FaExclamationTriangle className="me-2" />
                        <strong>Alertas importantes:</strong>
                        <ul className="mb-0 mt-2">
                            {deteccion.alertas.map((alerta, index) => (
                                <li key={index}>{alerta}</li>
                            ))}
                        </ul>
                    </Alert>
                )}

                {deteccion.expedienteBaseId && (
                    <div className="mt-3 p-3 bg-light rounded">
                        <h6 className="text-success mb-2">
                            <FaCheckCircle className="me-2" />
                            Expediente Base Encontrado
                        </h6>
                        <p className="mb-1 small">
                            ID: <code>{deteccion.expedienteBaseId}</code>
                        </p>
                        <p className="mb-0 small text-muted">
                            Se heredarán datos estáticos del expediente anterior
                        </p>
                    </div>
                )}

                <div className="mt-3 d-flex gap-2">
                    <Button variant="outline-primary" size="sm" onClick={detectarTipo}>
                        Detectar Nuevamente
                    </Button>
                    {deteccion.expedienteBaseId && (
                        <Button
                            variant="outline-success"
                            size="sm"
                            onClick={() => onVerExpedienteBase?.(deteccion.expedienteBaseId!)}
                        >
                            Ver Expediente Base
                        </Button>
                    )}
                </div>
            </Card.Body>
        </Card>
    );
};

export default ExpedienteDetector; 