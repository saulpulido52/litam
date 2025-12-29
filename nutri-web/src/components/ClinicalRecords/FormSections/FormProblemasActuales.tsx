import React from 'react';
import { Row, Col, Form } from 'react-bootstrap';
import { FaExclamationTriangle } from 'react-icons/fa';

interface FormProblemasActualesProps {
    formData: any;
    handleInputChange: (section: string, field: string, value: any) => void;
}

const FormProblemasActuales: React.FC<FormProblemasActualesProps> = ({ formData, handleInputChange }) => {
    return (
        <div className="animate-fade-in">
            <h6 className="section-title mb-4">
                <FaExclamationTriangle className="me-2 text-primary" />
                Problemas Gastrointestinales y Otros
            </h6>

            <div className="card-custom mb-4">
                <div className="card-header-custom">
                    <h6 className="mb-0 text-primary fw-bold">Síntomas Gastrointestinales</h6>
                </div>
                <div className="p-3">
                    <Row className="g-3">
                        <Col xs={12} sm={6} md={4} xl={3}>
                            <div className={`checkbox-card ${formData.currentProblems.diarrhea ? 'checked' : ''}`}
                                onClick={() => handleInputChange('currentProblems', 'diarrhea', !formData.currentProblems.diarrhea)}>
                                <Form.Check
                                    type="checkbox"
                                    id="diarrhea"
                                    checked={formData.currentProblems.diarrhea}
                                    onChange={() => { }}
                                    label="Diarrea"
                                    className="custom-checkbox"
                                />
                            </div>
                        </Col>
                        <Col xs={12} sm={6} md={4} xl={3}>
                            <div className={`checkbox-card ${formData.currentProblems.constipation ? 'checked' : ''}`}
                                onClick={() => handleInputChange('currentProblems', 'constipation', !formData.currentProblems.constipation)}>
                                <Form.Check
                                    type="checkbox"
                                    id="constipation"
                                    checked={formData.currentProblems.constipation}
                                    onChange={() => { }}
                                    label="Estreñimiento"
                                    className="custom-checkbox"
                                />
                            </div>
                        </Col>
                        <Col xs={12} sm={6} md={4} xl={3}>
                            <div className={`checkbox-card ${formData.currentProblems.gastritis ? 'checked' : ''}`}
                                onClick={() => handleInputChange('currentProblems', 'gastritis', !formData.currentProblems.gastritis)}>
                                <Form.Check
                                    type="checkbox"
                                    id="gastritis"
                                    checked={formData.currentProblems.gastritis}
                                    onChange={() => { }}
                                    label="Gastritis"
                                    className="custom-checkbox"
                                />
                            </div>
                        </Col>
                        <Col xs={12} sm={6} md={4} xl={3}>
                            <div className={`checkbox-card ${formData.currentProblems.ulcer ? 'checked' : ''}`}
                                onClick={() => handleInputChange('currentProblems', 'ulcer', !formData.currentProblems.ulcer)}>
                                <Form.Check
                                    type="checkbox"
                                    id="ulcer"
                                    checked={formData.currentProblems.ulcer}
                                    onChange={() => { }}
                                    label="Úlcera"
                                    className="custom-checkbox"
                                />
                            </div>
                        </Col>
                        <Col xs={12} sm={6} md={4} xl={3}>
                            <div className={`checkbox-card ${formData.currentProblems.nausea ? 'checked' : ''}`}
                                onClick={() => handleInputChange('currentProblems', 'nausea', !formData.currentProblems.nausea)}>
                                <Form.Check
                                    type="checkbox"
                                    id="nausea"
                                    checked={formData.currentProblems.nausea}
                                    onChange={() => { }}
                                    label="Náuseas"
                                    className="custom-checkbox"
                                />
                            </div>
                        </Col>
                        <Col xs={12} sm={6} md={4} xl={3}>
                            <div className={`checkbox-card ${formData.currentProblems.pyrosis ? 'checked' : ''}`}
                                onClick={() => handleInputChange('currentProblems', 'pyrosis', !formData.currentProblems.pyrosis)}>
                                <Form.Check
                                    type="checkbox"
                                    id="pyrosis"
                                    checked={formData.currentProblems.pyrosis}
                                    onChange={() => { }}
                                    label="Pirosis"
                                    className="custom-checkbox"
                                />
                            </div>
                        </Col>
                        <Col xs={12} sm={6} md={4} xl={3}>
                            <div className={`checkbox-card ${formData.currentProblems.vomiting ? 'checked' : ''}`}
                                onClick={() => handleInputChange('currentProblems', 'vomiting', !formData.currentProblems.vomiting)}>
                                <Form.Check
                                    type="checkbox"
                                    id="vomiting"
                                    checked={formData.currentProblems.vomiting}
                                    onChange={() => { }}
                                    label="Vómito"
                                    className="custom-checkbox"
                                />
                            </div>
                        </Col>
                        <Col xs={12} sm={6} md={4} xl={3}>
                            <div className={`checkbox-card ${formData.currentProblems.colitis ? 'checked' : ''}`}
                                onClick={() => handleInputChange('currentProblems', 'colitis', !formData.currentProblems.colitis)}>
                                <Form.Check
                                    type="checkbox"
                                    id="colitis"
                                    checked={formData.currentProblems.colitis}
                                    onChange={() => { }}
                                    label="Colitis"
                                    className="custom-checkbox"
                                />
                            </div>
                        </Col>
                    </Row>
                </div>
            </div>

            <Row className="g-3">
                <Col md={6}>
                    <Form.Group className="form-floating-custom">
                        <Form.Label className="form-label-styled">Problemas Mecánicos de la Boca</Form.Label>
                        <Form.Control
                            as="textarea"
                            rows={3}
                            className="form-control-styled"
                            value={formData.currentProblems.mouth_mechanics || ''}
                            onChange={(e) => handleInputChange('currentProblems', 'mouth_mechanics', e.target.value)}
                            placeholder="Dificultad para masticar, tragar, problemas dentales..."
                        />
                    </Form.Group>
                </Col>

                <Col md={6}>
                    <Form.Group className="form-floating-custom">
                        <Form.Label className="form-label-styled">Otros Problemas</Form.Label>
                        <Form.Control
                            as="textarea"
                            rows={3}
                            className="form-control-styled"
                            value={formData.currentProblems.other_problems || ''}
                            onChange={(e) => handleInputChange('currentProblems', 'other_problems', e.target.value)}
                            placeholder="Otros síntomas o problemas reportados..."
                        />
                    </Form.Group>
                </Col>

                <Col md={12}>
                    <Form.Group className="form-floating-custom">
                        <Form.Label className="form-label-styled">Observaciones Adicionales</Form.Label>
                        <Form.Control
                            as="textarea"
                            rows={2}
                            className="form-control-styled"
                            value={formData.currentProblems.observations || ''}
                            onChange={(e) => handleInputChange('currentProblems', 'observations', e.target.value)}
                            placeholder="Notas adicionales..."
                        />
                    </Form.Group>
                </Col>
            </Row>
        </div>
    );
};

export default FormProblemasActuales;
