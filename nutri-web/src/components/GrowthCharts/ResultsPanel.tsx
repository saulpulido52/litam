import React from 'react';
import { Card, Row, Col, Alert } from 'react-bootstrap';

interface ResultsPanelProps {
    results: {
        percentile: number;
        zScore: number;
        interpretation: string;
    } | null;
    formData: {
        ageYears: number;
        ageMonths: number;
        weight: number;
        gender: 'male' | 'female';
    } | null;
}

const ResultsPanel: React.FC<ResultsPanelProps> = ({ results, formData }) => {
    if (!results || !formData) {
        return (
            <Alert variant="info">
                <i className="bi bi-info-circle me-2"></i>
                Ingresa los datos del paciente y haz click en "Calcular Percentiles" para ver los resultados.
            </Alert>
        );
    }

    const getAlertVariant = () => {
        if (results.percentile < 3 || results.percentile > 97) return 'danger';
        if (results.percentile < 10 || results.percentile > 90) return 'warning';
        return 'success';
    };

    const getStatusIcon = () => {
        if (results.percentile < 3 || results.percentile > 97) return 'exclamation-triangle-fill';
        if (results.percentile < 10 || results.percentile > 90) return 'exclamation-circle-fill';
        return 'check-circle-fill';
    };

    return (
        <Card className="shadow-sm">
            <Card.Header className="bg-primary text-white">
                <h5 className="mb-0">
                    <i className="bi bi-clipboard-data me-2"></i>
                    Resultados del Análisis
                </h5>
            </Card.Header>
            <Card.Body>
                <Alert variant={getAlertVariant()} className="mb-4">
                    <div className="d-flex align-items-center">
                        <i className={`bi bi-${getStatusIcon()} fs-3 me-3`}></i>
                        <div>
                            <h6 className="mb-1">{results.interpretation}</h6>
                            <small>Percentil {results.percentile.toFixed(1)} • Z-score: {results.zScore.toFixed(2)}</small>
                        </div>
                    </div>
                </Alert>

                <Row>
                    <Col md={6}>
                        <Card className="mb-3 border-primary">
                            <Card.Body>
                                <h6 className="text-muted mb-2">Datos del Paciente</h6>
                                <p className="mb-1">
                                    <strong>Edad:</strong> {formData.ageYears} años {formData.ageMonths} meses
                                    <span className="text-muted"> ({formData.ageYears * 12 + formData.ageMonths} meses)</span>
                                </p>
                                <p className="mb-1">
                                    <strong>Género:</strong> {formData.gender === 'male' ? 'Masculino' : 'Femenino'}
                                </p>
                                <p className="mb-0">
                                    <strong>Peso:</strong> {formData.weight} kg
                                </p>
                            </Card.Body>
                        </Card>
                    </Col>

                    <Col md={6}>
                        <Card className="mb-3 border-success">
                            <Card.Body>
                                <h6 className="text-muted mb-2">Métricas Calculadas</h6>
                                <p className="mb-1">
                                    <strong>Percentil:</strong> <span className="fs-5 text-primary">P{results.percentile.toFixed(1)}</span>
                                </p>
                                <p className="mb-1">
                                    <strong>Z-Score:</strong> <span className="fs-5 text-info">{results.zScore.toFixed(2)}</span>
                                </p>
                                <p className="mb-0">
                                    <strong>Estándar:</strong> WHO (0-5 años)
                                </p>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>

                <Card className="bg-light">
                    <Card.Body>
                        <h6 className="mb-2">
                            <i className="bi bi-lightbulb me-2"></i>
                            Recomendaciones Clínicas
                        </h6>
                        <ul className="mb-0 small">
                            {results.percentile < 3 && (
                                <>
                                    <li>Evaluación nutricional completa requerida</li>
                                    <li>Considerar causas de bajo peso (malnutrición, enfermedad)</li>
                                    <li>Plan de intervención nutricional urgente</li>
                                </>
                            )}
                            {results.percentile >= 3 && results.percentile < 10 && (
                                <>
                                    <li>Monitoreo cercano del crecimiento</li>
                                    <li>Evaluación de ingesta alimentaria</li>
                                    <li>Seguimiento mensual recomendado</li>
                                </>
                            )}
                            {results.percentile >= 10 && results.percentile <= 90 && (
                                <>
                                    <li>Crecimiento dentro de rangos normales</li>
                                    <li>Continuar con alimentación saludable</li>
                                    <li>Seguimiento rutinario cada 3-6 meses</li>
                                </>
                            )}
                            {results.percentile > 90 && results.percentile <= 97 && (
                                <>
                                    <li>Evaluar hábitos alimentarios y actividad física</li>
                                    <li>Prevención de sobrepeso</li>
                                    <li>Seguimiento cada 2-3 meses</li>
                                </>
                            )}
                            {results.percentile > 97 && (
                                <>
                                    <li>Evaluación nutricional completa requerida</li>
                                    <li>Plan de manejo de peso pediátrico</li>
                                    <li>Evaluación de comorbilidades</li>
                                    <li>Seguimiento mensual recomendado</li>
                                </>
                            )}
                        </ul>
                    </Card.Body>
                </Card>
            </Card.Body>
        </Card>
    );
};

export default ResultsPanel;
