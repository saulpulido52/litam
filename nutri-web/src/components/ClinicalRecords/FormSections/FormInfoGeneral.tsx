import React from 'react';
import { Row, Col, Form } from 'react-bootstrap';
import { FaCalendar } from 'react-icons/fa';

interface FormInfoGeneralProps {
    formData: any;
    handleBasicChange: (field: string, value: any) => void;
}

const FormInfoGeneral: React.FC<FormInfoGeneralProps> = ({ formData, handleBasicChange }) => {
    return (
        <div className="animate-fade-in">
            <h6 className="section-title mb-4">
                <FaCalendar className="me-2 text-primary" />
                Información General
            </h6>

            <Row className="g-3">
                <Col md={6}>
                    <Form.Group className="form-floating-custom">
                        <Form.Label className="form-label-styled">Fecha del Registro</Form.Label>
                        <Form.Control
                            type="date"
                            className="form-control-styled"
                            value={formData.recordDate}
                            onChange={(e) => handleBasicChange('recordDate', e.target.value)}
                            required
                        />
                    </Form.Group>
                </Col>

                <Col md={6}>
                    <Form.Group className="form-floating-custom">
                        <Form.Label className="form-label-styled">Número de Expediente</Form.Label>
                        <Form.Control
                            type="text"
                            className="form-control-styled"
                            value={formData.expedientNumber}
                            onChange={(e) => handleBasicChange('expedientNumber', e.target.value)}
                            placeholder="Automático o manual"
                        />
                    </Form.Group>
                </Col>

                <Col md={12}>
                    <Form.Group className="form-floating-custom">
                        <Form.Label className="form-label-styled">Motivo de Consulta *</Form.Label>
                        <Form.Control
                            as="textarea"
                            rows={3}
                            className="form-control-styled"
                            value={formData.consultationReason}
                            onChange={(e) => handleBasicChange('consultationReason', e.target.value)}
                            placeholder="Describe el motivo principal de la consulta..."
                            required
                        />
                    </Form.Group>
                </Col>

                <Col md={12}>
                    <Form.Group className="form-floating-custom">
                        <Form.Label className="form-label-styled">Apariencia General</Form.Label>
                        <Form.Control
                            as="textarea"
                            rows={2}
                            className="form-control-styled"
                            value={formData.generalAppearance || ''}
                            onChange={(e) => handleBasicChange('generalAppearance', e.target.value)}
                            placeholder="Observaciones sobre la apariencia general del paciente..."
                        />
                    </Form.Group>
                </Col>

                <Col md={12}>
                    <Form.Group className="form-floating-custom">
                        <Form.Label className="form-label-styled">Aspectos Ginecológicos (si aplica)</Form.Label>
                        <Form.Control
                            as="textarea"
                            rows={2}
                            className="form-control-styled"
                            value={formData.gynecologicalAspects || ''}
                            onChange={(e) => handleBasicChange('gynecologicalAspects', e.target.value)}
                            placeholder="Ciclo menstrual, embarazos, etc..."
                        />
                    </Form.Group>
                </Col>
            </Row>
        </div>
    );
};

export default FormInfoGeneral;
