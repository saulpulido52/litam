import React from 'react';
import { Row, Col, Form } from 'react-bootstrap';
import { FaStethoscope } from 'react-icons/fa';

interface FormDiagnosticoPlanProps {
    formData: any;
    handleBasicChange: (field: string, value: any) => void;
}

const FormDiagnosticoPlan: React.FC<FormDiagnosticoPlanProps> = ({ formData, handleBasicChange }) => {
    return (
        <div className="animate-fade-in">
            <h6 className="section-title mb-4">
                <FaStethoscope className="me-2 text-primary" />
                Diagnóstico y Plan Nutricional
            </h6>

            <Row className="g-3">
                <Col md={12}>
                    <Form.Group className="form-floating-custom">
                        <Form.Label className="form-label-styled">Diagnóstico Nutricional *</Form.Label>
                        <Form.Control
                            as="textarea"
                            rows={3}
                            className="form-control-styled"
                            value={formData.nutritionalDiagnosis}
                            onChange={(e) => handleBasicChange('nutritionalDiagnosis', e.target.value)}
                            placeholder="Escribe el diagnóstico nutricional (PES, etc)..."
                            required
                        />
                    </Form.Group>
                </Col>

                <Col md={12}>
                    <Form.Group className="form-floating-custom">
                        <Form.Label className="form-label-styled">Plan y Manejo Nutricional *</Form.Label>
                        <Form.Control
                            as="textarea"
                            rows={4}
                            className="form-control-styled"
                            value={formData.nutritionalPlanAndManagement}
                            onChange={(e) => handleBasicChange('nutritionalPlanAndManagement', e.target.value)}
                            placeholder="Detalla el plan de alimentación, metas, recomendaciones..."
                            required
                        />
                    </Form.Group>
                </Col>

                <Col md={12}>
                    <Form.Group className="form-floating-custom">
                        <Form.Label className="form-label-styled">Notas de Evolución y Seguimiento</Form.Label>
                        <Form.Control
                            as="textarea"
                            rows={3}
                            className="form-control-styled"
                            value={formData.evolutionAndFollowUpNotes}
                            onChange={(e) => handleBasicChange('evolutionAndFollowUpNotes', e.target.value)}
                            placeholder="Notas para futuras consultas..."
                        />
                    </Form.Group>
                </Col>
            </Row>
        </div>
    );
};

export default FormDiagnosticoPlan;
