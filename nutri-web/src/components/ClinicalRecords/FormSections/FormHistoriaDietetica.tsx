import React from 'react';
import { Row, Col, Form } from 'react-bootstrap';
import { FaUtensils } from 'react-icons/fa';

interface FormHistoriaDieteticaProps {
    formData: any;
    handleInputChange: (section: string, field: string, value: any) => void;
}

const FormHistoriaDietetica: React.FC<FormHistoriaDieteticaProps> = ({ formData, handleInputChange }) => {
    return (
        <div className="animate-fade-in">
            <h6 className="section-title mb-4">
                <FaUtensils className="me-2 text-primary" />
                Historia Dietética
            </h6>

            <div className="card-custom mb-4">
                <div className="card-header-custom">
                    <h6 className="mb-0 text-primary fw-bold">Orientación y Suplementos</h6>
                </div>
                <div className="p-3">
                    <Row className="g-3">
                        <Col md={6}>
                            <div className="form-sub-card h-100">
                                <div className="form-check form-switch mb-3">
                                    <input className="form-check-input" type="checkbox" id="receivedNutritionalGuidance"
                                        checked={formData.dietaryHistory.receivedNutritionalGuidance}
                                        onChange={(e) => handleInputChange('dietaryHistory', 'receivedNutritionalGuidance', e.target.checked)}
                                    />
                                    <label htmlFor="receivedNutritionalGuidance">¿Ha recibido orientación nutricional antes?</label>
                                </div>
                                {formData.dietaryHistory.receivedNutritionalGuidance && (
                                    <div className="fade-in">
                                        <Form.Group className="form-floating-custom mb-2">
                                            <Form.Label className="form-label-styled">¿Cuándo?</Form.Label>
                                            <Form.Control
                                                type="text"
                                                className="form-control-styled"
                                                value={formData.dietaryHistory.whenReceived}
                                                onChange={(e) => handleInputChange('dietaryHistory', 'whenReceived', e.target.value)}
                                            />
                                        </Form.Group>
                                        <Form.Group className="form-floating-custom">
                                            <Form.Label className="form-label-styled">Nivel de Adherencia</Form.Label>
                                            <Form.Control
                                                type="text"
                                                className="form-control-styled"
                                                placeholder="Ej: Alta, baja, lo dejó..."
                                                value={formData.dietaryHistory.adherenceLevel}
                                                onChange={(e) => handleInputChange('dietaryHistory', 'adherenceLevel', e.target.value)}
                                            />
                                        </Form.Group>
                                    </div>
                                )}
                            </div>
                        </Col>

                        <Col md={6}>
                            <div className="form-sub-card h-100">
                                <div className="form-check form-switch mb-3">
                                    <input className="form-check-input" type="checkbox" id="takesSupplements"
                                        checked={formData.dietaryHistory.takesSupplements}
                                        onChange={(e) => handleInputChange('dietaryHistory', 'takesSupplements', e.target.checked)}
                                    />
                                    <label htmlFor="takesSupplements">¿Toma suplementos?</label>
                                </div>
                                {formData.dietaryHistory.takesSupplements && (
                                    <div className="fade-in">
                                        <Form.Group className="form-floating-custom">
                                            <Form.Label className="form-label-styled">Detalles</Form.Label>
                                            <Form.Control
                                                as="textarea"
                                                rows={3}
                                                className="form-control-styled"
                                                placeholder="Nombre, dosis, frecuencia..."
                                                value={formData.dietaryHistory.supplementDetails}
                                                onChange={(e) => handleInputChange('dietaryHistory', 'supplementDetails', e.target.value)}
                                            />
                                        </Form.Group>
                                    </div>
                                )}
                            </div>
                        </Col>
                    </Row>
                </div>
            </div>

            <div className="card-custom">
                <div className="card-header-custom">
                    <h6 className="mb-0 text-primary fw-bold">Preferencias Alimentarias</h6>
                </div>
                <div className="p-3">
                    <Row className="g-3">
                        <Col md={4}>
                            <Form.Group className="form-floating-custom">
                                <Form.Label className="form-label-styled">Alimentos Preferidos</Form.Label>
                                <Form.Control
                                    as="textarea"
                                    rows={3}
                                    className="form-control-styled"
                                    placeholder="Lo que más le gusta..."
                                    value={formData.dietaryHistory.preferredFoods}
                                    onChange={(e) => handleInputChange('dietaryHistory', 'preferredFoods', e.target.value)}
                                />
                            </Form.Group>
                        </Col>
                        <Col md={4}>
                            <Form.Group className="form-floating-custom">
                                <Form.Label className="form-label-styled">Alimentos que NO le gustan</Form.Label>
                                <Form.Control
                                    as="textarea"
                                    rows={3}
                                    className="form-control-styled"
                                    placeholder="Lo que evita..."
                                    value={formData.dietaryHistory.dislikedFoods}
                                    onChange={(e) => handleInputChange('dietaryHistory', 'dislikedFoods', e.target.value)}
                                />
                            </Form.Group>
                        </Col>
                        <Col md={4}>
                            <Form.Group className="form-floating-custom">
                                <Form.Label className="form-label-styled">Alergias / Malestar</Form.Label>
                                <Form.Control
                                    as="textarea"
                                    rows={3}
                                    className="form-control-styled"
                                    placeholder="Alimentos que le caen mal..."
                                    value={formData.dietaryHistory.malestarAlergiaFoods}
                                    onChange={(e) => handleInputChange('dietaryHistory', 'malestarAlergiaFoods', e.target.value)}
                                />
                            </Form.Group>
                        </Col>
                    </Row>
                </div>
            </div>

        </div>
    );
};

export default FormHistoriaDietetica;
