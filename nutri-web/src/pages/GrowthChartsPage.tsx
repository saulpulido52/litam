import React, { useState } from 'react';
import { Container, Row, Col, Alert, Card, Toast, ToastContainer } from 'react-bootstrap';
import GrowthChartForm, { type FormData } from '../components/GrowthCharts/GrowthChartForm';
import InteractiveChart from '../components/GrowthCharts/InteractiveChart';
import ResultsPanel from '../components/GrowthCharts/ResultsPanel';
import { calculateWeightForAgePercentile } from '../utils/growthCalculations';
import { detectPercentileAlert, saveAlert } from '../utils/alertDetection';

const GrowthChartsPage: React.FC = () => {
    const [formData, setFormData] = useState<FormData | null>(null);
    const [results, setResults] = useState<{
        percentile: number;
        zScore: number;
        interpretation: string;
    } | null>(null);
    const [showAlertToast, setShowAlertToast] = useState(false);
    const [alertMessage, setAlertMessage] = useState('');

    const handleCalculate = (data: FormData) => {
        const totalMonths = data.ageYears * 12 + data.ageMonths;

        if (totalMonths > 60) {
            alert('Esta herramienta está diseñada para niños de 0-5 años (0-60 meses)');
            return;
        }

        if (data.weight <= 0) {
            alert('Por favor ingresa un peso válido');
            return;
        }

        const calculatedResults = calculateWeightForAgePercentile(
            totalMonths,
            data.weight,
            data.gender
        );

        setFormData(data);
        setResults(calculatedResults);

        // Detectar y guardar alerta si es necesario
        // Nota: En una implementación real, esto se haría con datos del paciente real
        // Por ahora usamos un ID y nombre de ejemplo
        const patientId = 'demo-patient';
        const patientName = 'Paciente de Demostración';

        const growthAlert = detectPercentileAlert(
            calculatedResults.percentile,
            patientId,
            patientName,
            data.weight,
            totalMonths
        );

        if (growthAlert) {
            saveAlert(growthAlert);
            setAlertMessage(growthAlert.message);
            setShowAlertToast(true);
        }
    };

    return (
        <Container fluid className="py-4">
            {/* Header */}
            <div className="mb-4">
                <h1 className="display-5 fw-bold text-primary">
                    <i className="bi bi-graph-up-arrow me-3"></i>
                    Curvas de Crecimiento Pediátrico
                </h1>
                <p className="lead text-muted">
                    Herramienta profesional para nutriólogos - Análisis de crecimiento basado en estándares WHO
                </p>
            </div>

            {/* Info Banner */}
            <Alert variant="info" className="mb-4">
                <div className="d-flex align-items-center">
                    <i className="bi bi-info-circle-fill fs-4 me-3"></i>
                    <div>
                        <strong>Estándares WHO (0-5 años)</strong>
                        <p className="mb-0 small">
                            Esta herramienta utiliza los estándares de crecimiento de la Organización Mundial de la Salud (WHO)
                            para evaluar el peso-para-edad en niños de 0 a 5 años. Los percentiles se calculan usando el método LMS.
                        </p>
                    </div>
                </div>
            </Alert>

            <Row>
                {/* Formulario */}
                <Col lg={4} className="mb-4">
                    <GrowthChartForm onCalculate={handleCalculate} />
                </Col>

                {/* Resultados */}
                <Col lg={8} className="mb-4">
                    <ResultsPanel results={results} formData={formData} />
                </Col>
            </Row>

            {/* Gráfica */}
            <Row>
                <Col>
                    <InteractiveChart
                        gender={formData?.gender || 'male'}
                        patientData={
                            results && formData
                                ? {
                                    age: formData.ageYears * 12 + formData.ageMonths,
                                    weight: formData.weight,
                                    percentile: results.percentile
                                }
                                : undefined
                        }
                    />
                </Col>
            </Row>

            {/* Footer Info */}
            <Row className="mt-4">
                <Col>
                    <Card className="bg-light">
                        <Card.Body>
                            <h6 className="mb-3">
                                <i className="bi bi-book me-2"></i>
                                Información Adicional
                            </h6>
                            <Row>
                                <Col md={4}>
                                    <h6 className="text-primary">Método LMS</h6>
                                    <p className="small">
                                        Los percentiles se calculan usando el método Lambda-Mu-Sigma (LMS),
                                        que modela la distribución de mediciones antropométricas.
                                    </p>
                                </Col>
                                <Col md={4}>
                                    <h6 className="text-primary">Interpretación Clínica</h6>
                                    <p className="small">
                                        Los percentiles indican la posición del niño en relación con la población de referencia.
                                        Valores extremos (&lt;P3 o &gt;P97) requieren evaluación clínica.
                                    </p>
                                </Col>
                                <Col md={4}>
                                    <h6 className="text-primary">Seguimiento</h6>
                                    <p className="small">
                                        El seguimiento longitudinal del crecimiento es más importante que una medición aislada.
                                        Registra las mediciones regularmente para evaluar tendencias.
                                    </p>
                                </Col>
                            </Row>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            {/* Toast de Alerta */}
            <ToastContainer position="top-end" className="p-3" style={{ zIndex: 9999 }}>
                <Toast
                    show={showAlertToast}
                    onClose={() => setShowAlertToast(false)}
                    delay={5000}
                    autohide
                    bg="warning"
                >
                    <Toast.Header>
                        <i className="bi bi-exclamation-triangle-fill me-2 text-warning"></i>
                        <strong className="me-auto">Alerta de Crecimiento</strong>
                    </Toast.Header>
                    <Toast.Body>
                        {alertMessage}
                        <br />
                        <small className="text-muted">
                            La alerta ha sido registrada en el sistema.
                        </small>
                    </Toast.Body>
                </Toast>
            </ToastContainer>
        </Container>
    );
};

export default GrowthChartsPage;
