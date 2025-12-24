import React, { useState } from 'react';
import { Form, Row, Col, Button, Card } from 'react-bootstrap';

interface GrowthChartFormProps {
    onCalculate: (data: FormData) => void;
}

export interface FormData {
    ageYears: number;
    ageMonths: number;
    gender: 'male' | 'female';
    weight: number;
}

const GrowthChartForm: React.FC<GrowthChartFormProps> = ({ onCalculate }) => {
    const [formData, setFormData] = useState<FormData>({
        ageYears: 0,
        ageMonths: 0,
        gender: 'male',
        weight: 0
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onCalculate(formData);
    };

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
                    <Row>
                        <Col md={6}>
                            <Form.Group className="mb-3">
                                <Form.Label>Edad (Años)</Form.Label>
                                <Form.Control
                                    type="number"
                                    min="0"
                                    max="5"
                                    value={formData.ageYears}
                                    onChange={(e) => setFormData({ ...formData, ageYears: parseInt(e.target.value) || 0 })}
                                    placeholder="0-5 años"
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

                    <Form.Group className="mb-3">
                        <Form.Label>Peso (kg)</Form.Label>
                        <Form.Control
                            type="number"
                            step="0.1"
                            min="0"
                            max="30"
                            value={formData.weight || ''}
                            onChange={(e) => setFormData({ ...formData, weight: parseFloat(e.target.value) || 0 })}
                            placeholder="Ej: 12.5"
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
