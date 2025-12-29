import React from 'react';
import { Row, Col, Form } from 'react-bootstrap';
import { FaRunning, FaGlassWhiskey } from 'react-icons/fa';

interface FormEstiloVidaProps {
    formData: any;
    handleBasicChange: (field: string, value: any) => void;
    handleInputChange: (section: string, field: string, value: any) => void;
}

const FormEstiloVida: React.FC<FormEstiloVidaProps> = ({ formData, handleBasicChange, handleInputChange }) => {
    return (
        <div className="animate-fade-in">
            <h6 className="section-title mb-4">
                <FaRunning className="me-2 text-primary" />
                Estilo de Vida y Hábitos
            </h6>

            <div className="mb-4">
                <Form.Group className="form-floating-custom">
                    <Form.Label className="form-label-styled">Nivel de Actividad</Form.Label>
                    <Form.Control
                        as="textarea"
                        rows={2}
                        className="form-control-styled"
                        placeholder="Ej: Sedentario (oficina), Activo (construcción), Deportista..."
                        value={formData.activityLevelDescription}
                        onChange={(e) => handleBasicChange('activityLevelDescription', e.target.value)}
                    />
                </Form.Group>
            </div>

            <div className="card-custom mb-4">
                <div className="card-header-custom">
                    <h6 className="mb-0 text-primary fw-bold">Ejercicio Físico</h6>
                </div>
                <div className="p-3">
                    <Row className="g-3">
                        <Col md={12}>
                            <Form.Group>
                                <Form.Check
                                    type="switch"
                                    id="performsExercise"
                                    label="¿Realiza ejercicio regularmente?"
                                    checked={formData.physicalExercise.performsExercise}
                                    onChange={(e) => handleInputChange('physicalExercise', 'performsExercise', e.target.checked)}
                                    className="custom-switch mb-3"
                                />
                            </Form.Group>
                        </Col>

                        {formData.physicalExercise.performsExercise && (
                            <>
                                <Col md={6}>
                                    <Form.Group className="form-floating-custom">
                                        <Form.Label className="form-label-styled">Tipo de ejercicio</Form.Label>
                                        <Form.Control
                                            type="text"
                                            className="form-control-styled"
                                            placeholder="Ej: Correr, Nadar, Gimnasio..."
                                            value={formData.physicalExercise.type}
                                            onChange={(e) => handleInputChange('physicalExercise', 'type', e.target.value)}
                                        />
                                    </Form.Group>
                                </Col>
                                <Col md={6}>
                                    <Form.Group className="form-floating-custom">
                                        <Form.Label className="form-label-styled">Frecuencia</Form.Label>
                                        <Form.Control
                                            type="text"
                                            className="form-control-styled"
                                            placeholder="Ej: 3 veces por semana..."
                                            value={formData.physicalExercise.frequency}
                                            onChange={(e) => handleInputChange('physicalExercise', 'frequency', e.target.value)}
                                        />
                                    </Form.Group>
                                </Col>
                                <Col md={6}>
                                    <Form.Group className="form-floating-custom">
                                        <Form.Label className="form-label-styled">Duración</Form.Label>
                                        <Form.Control
                                            type="text"
                                            className="form-control-styled"
                                            placeholder="Ej: 30 minutos, 1 hora..."
                                            value={formData.physicalExercise.duration}
                                            onChange={(e) => handleInputChange('physicalExercise', 'duration', e.target.value)}
                                        />
                                    </Form.Group>
                                </Col>
                                <Col md={6}>
                                    <Form.Group className="form-floating-custom">
                                        <Form.Label className="form-label-styled">¿Desde cuándo?</Form.Label>
                                        <Form.Control
                                            type="text"
                                            className="form-control-styled"
                                            placeholder="Ej: Hace 6 meses..."
                                            value={formData.physicalExercise.sinceWhen}
                                            onChange={(e) => handleInputChange('physicalExercise', 'sinceWhen', e.target.value)}
                                        />
                                    </Form.Group>
                                </Col>
                            </>
                        )}
                    </Row>
                </div>
            </div>

            <div className="card-custom">
                <div className="card-header-custom">
                    <div className="d-flex align-items-center">
                        <FaGlassWhiskey className="me-2" />
                        <h6 className="mb-0 text-primary fw-bold">Hábitos de Consumo</h6>
                    </div>
                </div>
                <div className="p-3">
                    <Row className="g-3">
                        <Col md={6}>
                            <Form.Group className="form-floating-custom">
                                <Form.Label className="form-label-styled">Alcohol</Form.Label>
                                <Form.Control
                                    type="text"
                                    className="form-control-styled"
                                    placeholder="Frecuencia y cantidad..."
                                    value={formData.consumptionHabits.alcohol}
                                    onChange={(e) => handleInputChange('consumptionHabits', 'alcohol', e.target.value)}
                                />
                            </Form.Group>
                        </Col>
                        <Col md={6}>
                            <Form.Group className="form-floating-custom">
                                <Form.Label className="form-label-styled">Tabaco</Form.Label>
                                <Form.Control
                                    type="text"
                                    className="form-control-styled"
                                    placeholder="Cigarrillos por día/semana..."
                                    value={formData.consumptionHabits.tobacco}
                                    onChange={(e) => handleInputChange('consumptionHabits', 'tobacco', e.target.value)}
                                />
                            </Form.Group>
                        </Col>
                        <Col md={6}>
                            <Form.Group className="form-floating-custom">
                                <Form.Label className="form-label-styled">Café</Form.Label>
                                <Form.Control
                                    type="text"
                                    className="form-control-styled"
                                    placeholder="Tazas por día..."
                                    value={formData.consumptionHabits.coffee}
                                    onChange={(e) => handleInputChange('consumptionHabits', 'coffee', e.target.value)}
                                />
                            </Form.Group>
                        </Col>
                        <Col md={6}>
                            <Form.Group className="form-floating-custom">
                                <Form.Label className="form-label-styled">Otras Sustancias</Form.Label>
                                <Form.Control
                                    type="text"
                                    className="form-control-styled"
                                    placeholder="Especificar..."
                                    value={formData.consumptionHabits.otherSubstances}
                                    onChange={(e) => handleInputChange('consumptionHabits', 'otherSubstances', e.target.value)}
                                />
                            </Form.Group>
                        </Col>

                        <Col md={12}>
                            <Form.Group className="form-floating-custom mt-2">
                                <Form.Label className="form-label-styled">Consumo de Agua (Litros/día)</Form.Label>
                                <Form.Control
                                    type="number"
                                    step="0.1"
                                    className="form-control-styled"
                                    value={formData.waterConsumptionLiters}
                                    onChange={(e) => handleBasicChange('waterConsumptionLiters', e.target.value)}
                                />
                            </Form.Group>
                        </Col>
                    </Row>
                </div>
            </div>
        </div>
    );
};

export default FormEstiloVida;
