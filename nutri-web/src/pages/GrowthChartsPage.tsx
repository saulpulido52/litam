import React, { useState } from 'react';
import { Container, Row, Col, Alert, Card, Toast, ToastContainer } from 'react-bootstrap';
import GrowthChartForm, { type FormData } from '../components/GrowthCharts/GrowthChartForm';
import InteractiveChart from '../components/GrowthCharts/InteractiveChart';
import ResultsPanel from '../components/GrowthCharts/ResultsPanel';
import { calculatePercentile } from '../utils/growthCalculations';
import { detectPercentileAlert, saveAlert } from '../utils/alertDetection';

const GrowthChartsPage: React.FC = () => {
    const [formData, setFormData] = useState<FormData | null>(null);
    const [results, setResults] = useState<{
        percentile: number;
        zScore: number;
        interpretation: string;
        standard: 'WHO' | 'CDC';
    } | null>(null);
    const [showAlertToast, setShowAlertToast] = useState(false);
    const [alertMessage, setAlertMessage] = useState('');

    const handleCalculate = (data: FormData) => {
        const totalMonths = data.ageYears * 12 + data.ageMonths;

        // Validar edad máxima
        if (totalMonths > 216) {
            alert('Esta herramienta está diseñada para niños de 0-18 años (0-216 meses)');
            return;
        }

        // Validar que se haya ingresado el valor correcto según la métrica
        const value = data.metric === 'weight' ? data.weight : data.height;
        if (value <= 0) {
            alert(`Por favor ingresa un ${data.metric === 'weight' ? 'peso' : 'talla'} válido`);
            return;
        }

        // Calcular percentiles
        const calculatedResults = calculatePercentile(
            totalMonths,
            value,
            data.gender,
            data.metric
        );

        setFormData(data);
        setResults(calculatedResults);

        // Detectar y guardar alerta si es necesario (solo para peso)
        if (data.metric === 'weight') {
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
                    Herramienta profesional para nutriólogos - Análisis de crecimiento basado en estándares WHO y CDC
                </p>
            </div>

            {/* Info Banner */}
            <Alert variant="info" className="mb-4">
                <div className="d-flex align-items-center">
                    <i className="bi bi-info-circle-fill fs-4 me-3"></i>
                    <div>
                        <strong>Estándares WHO (0-5 años) + CDC (5-18 años)</strong>
                        <p className="mb-0 small">
                            Esta herramienta utiliza los estándares de la Organización Mundial de la Salud (WHO) para niños de 0-5 años
                            y los estándares de los Centros para el Control de Enfermedades (CDC) para niños de 5-18 años.
                            Los percentiles se calculan usando el método LMS.
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
                        metric={formData?.metric || 'weight'}
                        patientData={
                            results && formData
                                ? {
                                    age: formData.ageYears * 12 + formData.ageMonths,
                                    value: formData.metric === 'weight' ? formData.weight : formData.height,
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
                                <Col md={3}>
                                    <h6 className="text-primary">Método LMS</h6>
                                    <p className="small">
                                        Los percentiles se calculan usando el método Lambda-Mu-Sigma (LMS),
                                        que modela la distribución de mediciones antropométricas.
                                    </p>
                                </Col>
                                <Col md={3}>
                                    <h6 className="text-primary">Estándares WHO</h6>
                                    <p className="small">
                                        Para niños de 0-5 años se utilizan los estándares de la OMS,
                                        basados en niños sanos de diferentes países con lactancia materna.
                                    </p>
                                </Col>
                                <Col md={3}>
                                    <h6 className="text-primary">Estándares CDC</h6>
                                    <p className="small">
                                        Para niños de 5-18 años se utilizan los estándares del CDC,
                                        basados en la población estadounidense.
                                    </p>
                                </Col>
                                <Col md={3}>
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
