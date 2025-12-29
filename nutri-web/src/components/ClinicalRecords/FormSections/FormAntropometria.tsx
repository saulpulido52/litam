import React from 'react';
import { Row, Col, Form } from 'react-bootstrap';
import { FaRuler } from 'react-icons/fa';

interface FormAntropometriaProps {
    formData: any;
    handleInputChange: (section: string, field: string, value: any) => void;
    calculateBMI: () => string | null;
    validationErrors: { relationship?: string;[key: string]: any };
}

const FormAntropometria: React.FC<FormAntropometriaProps> = ({ formData, handleInputChange, calculateBMI, validationErrors }) => {
    const bmi = calculateBMI();

    return (
        <div className="animate-fade-in">
            <h6 className="section-title mb-4">
                <FaRuler className="me-2 text-primary" />
                Mediciones Antropométricas
            </h6>

            <div className="card-custom mb-4">
                <div className="card-header-custom">
                    <h6 className="mb-0 text-primary fw-bold">Peso y Talla</h6>
                </div>
                <div className="p-3">
                    <Row className="g-3">
                        <Col md={4} >
                            <Form.Group className="form-floating-custom">
                                <Form.Label className="form-label-styled">Peso Actual (kg)</Form.Label>
                                <Form.Control
                                    type="number"
                                    step="0.01"
                                    className="form-control-styled"
                                    value={formData.anthropometricMeasurements.currentWeightKg}
                                    onChange={(e) => handleInputChange('anthropometricMeasurements', 'currentWeightKg', e.target.value)}
                                />
                            </Form.Group>
                        </Col>
                        <Col md={4} >
                            <Form.Group className="form-floating-custom">
                                <Form.Label className="form-label-styled">Peso Habitual (kg)</Form.Label>
                                <Form.Control
                                    type="number"
                                    step="0.01"
                                    className="form-control-styled"
                                    value={formData.anthropometricMeasurements.habitualWeightKg}
                                    onChange={(e) => handleInputChange('anthropometricMeasurements', 'habitualWeightKg', e.target.value)}
                                />
                            </Form.Group>
                        </Col>
                        <Col md={4} >
                            <Form.Group className="form-floating-custom">
                                <Form.Label className="form-label-styled">Estatura (m)</Form.Label>
                                <Form.Control
                                    type="number"
                                    step="0.01"
                                    className="form-control-styled"
                                    value={formData.anthropometricMeasurements.heightM}
                                    onChange={(e) => handleInputChange('anthropometricMeasurements', 'heightM', e.target.value)}
                                />
                            </Form.Group>
                        </Col>

                        {bmi && (
                            <Col md={12}>
                                <div className="alert alert-info d-flex align-items-center mb-0 p-2">
                                    <i className="fas fa-calculator me-2"></i>
                                    <strong>IMC Calculado: {bmi}</strong>
                                </div>
                            </Col>
                        )}
                    </Row>
                </div>
            </div>

            <div className="card-custom mb-4">
                <div className="card-header-custom">
                    <h6 className="mb-0 text-primary fw-bold">Circunferencias (cm)</h6>
                </div>
                <div className="p-3">
                    <Row className="g-3">
                        <Col md={6} >
                            <Form.Group className="form-floating-custom">
                                <Form.Label className="form-label-styled">Cintura</Form.Label>
                                <Form.Control
                                    type="number"
                                    step="0.1"
                                    className="form-control-styled"
                                    value={formData.anthropometricMeasurements.waistCircCm}
                                    onChange={(e) => handleInputChange('anthropometricMeasurements', 'waistCircCm', e.target.value)}
                                />
                            </Form.Group>
                        </Col>
                        <Col md={6} >
                            <Form.Group className="form-floating-custom">
                                <Form.Label className="form-label-styled">Cadera</Form.Label>
                                <Form.Control
                                    type="number"
                                    step="0.1"
                                    className="form-control-styled"
                                    value={formData.anthropometricMeasurements.hipCircCm}
                                    onChange={(e) => handleInputChange('anthropometricMeasurements', 'hipCircCm', e.target.value)}
                                />
                            </Form.Group>
                        </Col>
                    </Row>
                </div>
            </div>

            <div className="card-custom">
                <div className="card-header-custom">
                    <h6 className="mb-0 text-primary fw-bold">Presión Arterial</h6>
                </div>
                <div className="p-3">
                    <Row className="g-3">
                        <Col md={12}>
                            <Form.Group>
                                <Form.Check
                                    type="switch"
                                    id="knowsBp"
                                    label="¿Conoce su presión arterial?"
                                    checked={formData.bloodPressure.knowsBp}
                                    onChange={(e) => handleInputChange('bloodPressure', 'knowsBp', e.target.checked)}
                                    className="custom-switch mb-3"
                                />
                            </Form.Group>
                        </Col>

                        {formData.bloodPressure.knowsBp && (
                            <>
                                <Col md={6}>
                                    <Form.Group className="form-floating-custom">
                                        <Form.Label className="form-label-styled">Sistólica (mmHg)</Form.Label>
                                        <Form.Control
                                            type="number"
                                            className={`form-control-styled ${validationErrors.bloodPressure ? 'is-invalid' : ''}`}
                                            value={formData.bloodPressure.systolic}
                                            onChange={(e) => handleInputChange('bloodPressure', 'systolic', e.target.value)}
                                        />
                                    </Form.Group>
                                </Col>
                                <Col md={6}>
                                    <Form.Group className="form-floating-custom">
                                        <Form.Label className="form-label-styled">Diastólica (mmHg)</Form.Label>
                                        <Form.Control
                                            type="number"
                                            className={`form-control-styled ${validationErrors.bloodPressure ? 'is-invalid' : ''}`}
                                            value={formData.bloodPressure.diastolic}
                                            onChange={(e) => handleInputChange('bloodPressure', 'diastolic', e.target.value)}
                                        />
                                    </Form.Group>
                                </Col>
                                {validationErrors.bloodPressure && (
                                    <Col md={12}>
                                        <div className="text-danger small mt-1">
                                            {validationErrors.bloodPressure}
                                        </div>
                                    </Col>
                                )}
                                <Col md={12}>
                                    <Form.Group className="form-floating-custom">
                                        <Form.Label className="form-label-styled">Presión Habitual / Comentarios</Form.Label>
                                        <Form.Control
                                            type="text"
                                            className="form-control-styled"
                                            placeholder="Ej: Suele manejar presión baja..."
                                            value={formData.bloodPressure.habitualBp}
                                            onChange={(e) => handleInputChange('bloodPressure', 'habitualBp', e.target.value)}
                                        />
                                    </Form.Group>
                                </Col>
                            </>
                        )}
                    </Row>
                </div>
            </div>

        </div>
    );
};

export default FormAntropometria;
