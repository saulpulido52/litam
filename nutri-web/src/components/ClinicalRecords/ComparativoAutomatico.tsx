// nutri-web/src/components/ClinicalRecords/ComparativoAutomatico.tsx
import React, { useState, useEffect } from 'react';
import { Card, Table, Button, Row, Col, Spinner, Alert, Badge } from 'react-bootstrap';
import { FaChartLine, FaArrowUp, FaArrowDown, FaMinus, FaRedo } from 'react-icons/fa';

interface CambioMedicion {
    anterior: number;
    actual: number;
    diferencia: number;
    porcentaje_cambio: number;
    tendencia: 'aumento' | 'disminución' | 'sin_cambio';
    unidad: string;
}

interface ComparativoData {
    fecha_anterior: string;
    fecha_actual: string;
    cambios: {
        peso?: CambioMedicion;
        imc?: CambioMedicion;
        cintura?: CambioMedicion;
        presion_sistolica?: CambioMedicion;
        presion_diastolica?: CambioMedicion;
    };
}

interface ComparativoAutomaticoProps {
    expedienteActualId: string;
    expedienteBaseId: string;
    onError?: (error: string) => void;
}

const ComparativoAutomatico: React.FC<ComparativoAutomaticoProps> = ({
    expedienteActualId,
    expedienteBaseId,
    onError
}) => {
    const [comparativo, setComparativo] = useState<ComparativoData | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
const generarComparativo = async () => {
        if (!expedienteActualId || !expedienteBaseId) return;

        setLoading(true);
        setError(null);

        try {
            const token = localStorage.getItem('access_token');
            if (!token) {
                throw new Error('No hay sesión activa. Por favor inicia sesión nuevamente.');
            }

            const response = await fetch(`/api/clinical-records/compare/${expedienteActualId}/${expedienteBaseId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.status === 401) {
                localStorage.removeItem('access_token');
                throw new Error('Sesión expirada. Por favor inicia sesión nuevamente.');
            }

            if (response.status === 403) {
                throw new Error('No tienes permisos para generar comparativos.');
            }

            if (!response.ok) {
                const errorData = await response.json().catch(() => null);
                const errorMessage = errorData?.message || `Error del servidor: ${response.status}`;
                throw new Error(errorMessage);
            }

            const data = await response.json();
            setComparativo(data.data);

        } catch (err) {
            console.error('Error generando comparativo:', err);
            const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
            setError(errorMessage);
            onError?.(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        generarComparativo();
    }, [expedienteActualId, expedienteBaseId]);

    const getTendenciaIcon = (tendencia: string) => {
        switch (tendencia) {
            case 'aumento': return <FaArrowUp className="text-danger" />;
            case 'disminución': return <FaArrowDown className="text-success" />;
            case 'sin_cambio': return <FaMinus className="text-muted" />;
            default: return null;
        }
    };

    const getTendenciaColor = (tendencia: string, campo: string) => {
        // Para peso y cintura, la disminución es positiva
        if (campo === 'peso' || campo === 'cintura') {
            switch (tendencia) {
                case 'disminución': return 'success';
                case 'aumento': return 'warning';
                case 'sin_cambio': return 'secondary';
                default: return 'light';
            }
        }
        // Para presión, la disminución también es positiva
        if (campo.includes('presion')) {
            switch (tendencia) {
                case 'disminución': return 'success';
                case 'aumento': return 'warning';
                case 'sin_cambio': return 'secondary';
                default: return 'light';
            }
        }
        // Por defecto
        switch (tendencia) {
            case 'aumento': return 'info';
            case 'disminución': return 'info';
            case 'sin_cambio': return 'secondary';
            default: return 'light';
        }
    };

    const formatearFecha = (fecha: string) => {
        return new Date(fecha).toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const getCampoDisplayName = (campo: string) => {
        const nombres: { [key: string]: string } = {
            'peso': 'Peso',
            'imc': 'IMC',
            'cintura': 'Cintura',
            'presion_sistolica': 'Presión Sistólica',
            'presion_diastolica': 'Presión Diastólica'
        };
        return nombres[campo] || campo;
    };

    if (loading) {
        return (
            <Card className="mb-3">
                <Card.Body className="text-center py-4">
                    <Spinner animation="border" size="sm" className="me-2" />
                    <FaChartLine className="me-2" />
                    Generando comparativo automático...
                </Card.Body>
            </Card>
        );
    }

    if (error) {
        return (
            <Alert variant="danger" className="mb-3">
                Error al generar comparativo: {error}
                <div className="mt-2">
                    <Button variant="outline-danger" size="sm" onClick={generarComparativo}>
                        <FaRedo className="me-1" />
                        Reintentar
                    </Button>
                </div>
            </Alert>
        );
    }

    if (!comparativo) {
        return null;
    }

    const cambiosDisponibles = Object.entries(comparativo.cambios).filter(([_, cambio]) => cambio !== null);

    return (
        <Card className="mb-3 border-info">
            <Card.Header className="bg-info text-white">
                <FaChartLine className="me-2" />
                Comparativo Automático de Mediciones
            </Card.Header>
            <Card.Body>
                <Row className="mb-3">
                    <Col md={6}>
                        <div className="d-flex align-items-center">
                            <strong className="me-2">Fecha Anterior:</strong>
                            <span className="text-muted">{formatearFecha(comparativo.fecha_anterior)}</span>
                        </div>
                    </Col>
                    <Col md={6}>
                        <div className="d-flex align-items-center">
                            <strong className="me-2">Fecha Actual:</strong>
                            <span className="text-primary">{formatearFecha(comparativo.fecha_actual)}</span>
                        </div>
                    </Col>
                </Row>

                {cambiosDisponibles.length === 0 ? (
                    <Alert variant="info">
                        No hay mediciones disponibles para comparar entre estos expedientes.
                    </Alert>
                ) : (
                    <Table responsive striped hover>
                        <thead>
                            <tr>
                                <th>Medición</th>
                                <th>Valor Anterior</th>
                                <th>Valor Actual</th>
                                <th>Diferencia</th>
                                <th>% Cambio</th>
                                <th>Tendencia</th>
                            </tr>
                        </thead>
                        <tbody>
                            {cambiosDisponibles.map(([campo, cambio]) => (
                                <tr key={campo}>
                                    <td>
                                        <strong>{getCampoDisplayName(campo)}</strong>
                                    </td>
                                    <td>
                                        {cambio.anterior} {cambio.unidad}
                                    </td>
                                    <td>
                                        <strong>{cambio.actual} {cambio.unidad}</strong>
                                    </td>
                                    <td>
                                        <span className={cambio.diferencia > 0 ? 'text-danger' : cambio.diferencia < 0 ? 'text-success' : 'text-muted'}>
                                            {cambio.diferencia > 0 ? '+' : ''}{cambio.diferencia} {cambio.unidad}
                                        </span>
                                    </td>
                                    <td>
                                        <span className={Math.abs(cambio.porcentaje_cambio) > 5 ? 'fw-bold' : ''}>
                                            {cambio.porcentaje_cambio > 0 ? '+' : ''}{cambio.porcentaje_cambio}%
                                        </span>
                                    </td>
                                    <td>
                                        <Badge bg={getTendenciaColor(cambio.tendencia, campo)}>
                                            {getTendenciaIcon(cambio.tendencia)}
                                            <span className="ms-1">
                                                {cambio.tendencia === 'sin_cambio' ? 'Sin cambio' : 
                                                 cambio.tendencia === 'aumento' ? 'Aumento' : 'Disminución'}
                                            </span>
                                        </Badge>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                )}

                <div className="mt-3 d-flex justify-content-between align-items-center">
                    <div className="small text-muted">
                        Comparativo generado automáticamente
                    </div>
                    <Button variant="outline-info" size="sm" onClick={generarComparativo}>
                        <FaRedo className="me-1" />
                        Actualizar
                    </Button>
                </div>
            </Card.Body>
        </Card>
    );
};

export default ComparativoAutomatico; 