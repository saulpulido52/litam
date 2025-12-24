import React, { useState } from 'react';
import { Form, Row, Col, Button, Card } from 'react-bootstrap';
import { type MetricType } from '../../utils/growthCalculations';

interface GrowthChartFormProps {
    onCalculate: (data: FormData) => void;
}

export interface FormData {
    ageYears: number;
    ageMonths: number;
    gender: 'male' | 'female';
    metric: MetricType;
    weight: number;
    height: number;
}

const GrowthChartForm: React.FC<GrowthChartFormProps> = ({ onCalculate }) => {
    const [formData, setFormData] = useState<FormData>({
        ageYears: 0,
        ageMonths: 0,
        gender: 'male',
        metric: 'weight',
        weight: 0,
        height: 0
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onCalculate(formData);
    };

    const totalMonths = formData.ageYears * 12 + formData.ageMonths;
    const standard = totalMonths <= 60 ? 'WHO' : 'CDC';

    return (
        <Card className="shadow-sm">
            <Card.Header className="bg-primary text-white">
                <h5 className="mb-0">
                    <i className="bi bi-calculator me-2"></i>
                    Datos del Paciente
                </h5>
            </Card.Header>
            <Card.Body>
                <Form onSubmit={handleSubmit}>
                    {/* Edad */}
                    <Row>
                        <Col md={6}>
                            <Form.Group className="mb-3">
                                <Form.Label>Edad (Años)</Form.Label>
                                <Form.Control
                                    type="number"
                                    min="0"
                                    max="18"
                                    value={formData.ageYears}
                                    onChange={(e) => setFormData({ ...formData, ageYears: parseInt(e.target.value) || 0 })}
                                    placeholder="0-18 años"
                                />
                            </Form.Group>
                        </Col>
                        <Col md={6}>
                            <Form.Group className="mb-3">
                                <Form.Label>Edad (Meses adicionales)</Form.Label>
                                <Form.Control
                                    type="number"
                                    min="0"
                                    max="11"
                                    value={formData.ageMonths}
                                    onChange={(e) => setFormData({ ...formData, ageMonths: parseInt(e.target.value) || 0 })}
                                    placeholder="0-11 meses"
                                />
                            </Form.Group>
                        </Col>
                    </Row>

                    {/* Indicador de Estándar */}
                    {totalMonths > 0 && (
                        <div className="alert alert-info py-2 mb-3">
                            <small>
                                <i className="bi bi-info-circle me-2"></i>
                                Estándar: <strong>{standard}</strong> ({standard === 'WHO' ? '0-5 años' : '5-18 años'})
                            </small>
                        </div>
                    )}

                    {/* Género */}
                    <Form.Group className="mb-3">
                        <Form.Label>Género</Form.Label>
                        <div>
                            <Form.Check
                                inline
                                type="radio"
                                label="Masculino"
                                name="gender"
                                id="gender-male"
                                checked={formData.gender === 'male'}
                                onChange={() => setFormData({ ...formData, gender: 'male' })}
                            />
                            <Form.Check
                                inline
                                type="radio"
                                label="Femenino"
                                name="gender"
                                id="gender-female"
                                checked={formData.gender === 'female'}
                                onChange={() => setFormData({ ...formData, gender: 'female' })}
                            />
                        </div>
                    </Form.Group>

                    {/* Métrica */}
                    <Form.Group className="mb-3">
                        <Form.Label>Métrica a Analizar</Form.Label>
                        <Form.Select
                            value={formData.metric}
                            onChange={(e) => setFormData({ ...formData, metric: e.target.value as MetricType })}
                        >
                            <option value="weight">Peso para Edad</option>
                            <option value="height">Talla para Edad</option>
                        </Form.Select>
                    </Form.Group>

                    {/* Peso */}
                    <Form.Group className="mb-3">
                        <Form.Label>
                            Peso (kg)
                            {formData.metric === 'weight' && <span className="text-danger">*</span>}
                        </Form.Label>
                        <Form.Control
                            type="number"
                            step="0.1"
                            min="0"
                            max="150"
                            value={formData.weight || ''}
                            onChange={(e) => setFormData({ ...formData, weight: parseFloat(e.target.value) || 0 })}
                            placeholder="Ej: 12.5"
                            required={formData.metric === 'weight'}
                        />
                    </Form.Group>

                    {/* Talla */}
                    <Form.Group className="mb-3">
                        <Form.Label>
                            Talla (cm)
                            {formData.metric === 'height' && <span className="text-danger">*</span>}
                        </Form.Label>
                        <Form.Control
                            type="number"
                            step="0.1"
                            min="0"
                            max="220"
                            value={formData.height || ''}
                            onChange={(e) => setFormData({ ...formData, height: parseFloat(e.target.value) || 0 })}
                            placeholder="Ej: 95.5"
                            required={formData.metric === 'height'}
                        />
                    </Form.Group>

                    <Button variant="primary" type="submit" size="lg" className="w-100">
                        <i className="bi bi-graph-up me-2"></i>
                        Calcular Percentiles
                    </Button>
                </Form>
            </Card.Body>
        </Card>
    );
};

export default GrowthChartForm;
