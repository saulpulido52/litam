import React, { useState } from 'react';
import { Modal, Button, Row, Col, Form, Badge, Alert} from 'react-bootstrap';
import { Download, Settings, CheckCircle} from 'lucide-react';
import TemplateLibrary from './TemplateLibrary';
import { templateService } from '../../services/templateService';
import type { WeeklyPlanTemplate, ApplyTemplateDto } from '../../types/template';

interface TemplateApplicatorProps {
    isOpen: boolean;
    onClose: () => void;
    dietPlanId: string;
    patientId: string;
    weekNumber?: number;
    onTemplateApplied?: (appliedMeals: any[]) => void;
}

export const TemplateApplicator: React.FC<TemplateApplicatorProps> = ({
    isOpen,
    onClose,
    dietPlanId,
    patientId,
    weekNumber = 1,
    onTemplateApplied
}) => {
    const [selectedTemplate, setSelectedTemplate] = useState<WeeklyPlanTemplate | null>(null);
    const [showAdjustments, setShowAdjustments] = useState(false);
    const [applying, setApplying] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    // Configuraciones de ajuste
    const [adjustments, setAdjustments] = useState({
        portionMultiplier: 1,
        excludeOptionalItems: false,
        customMealTiming: {} as { [key: string]: string }
    });

    const handleTemplateSelect = (template: WeeklyPlanTemplate) => {
        setSelectedTemplate(template);
        setError(null);
        
        // Inicializar horarios personalizados con los de la plantilla
        if (template.mealTiming) {
            setAdjustments(prev => ({
                ...prev,
                customMealTiming: { ...template.mealTiming }
            }));
        }
    };

    const handleApplyTemplate = async () => {
        if (!selectedTemplate) return;

        setApplying(true);
        setError(null);

        try {
            const applyData: ApplyTemplateDto = {
                templateId: selectedTemplate.id,
                patientId,
                dietPlanId,
                weekNumber,
                adjustments: {
                    portionMultiplier: adjustments.portionMultiplier,
                    excludeOptionalItems: adjustments.excludeOptionalItems,
                    customMealTiming: adjustments.customMealTiming
                }
            };

            const response = await templateService.applyTemplate(applyData);
            
            if (response.success) {
                setSuccess(true);
                setTimeout(() => {
                    if (onTemplateApplied) {
                        onTemplateApplied(response.data.meals);
                    }
                    handleClose();
                }, 2000);
            } else {
                setError('Error al aplicar la plantilla');
            }
        } catch (err: any) {
            setError(err.message || 'Error al aplicar la plantilla');
        } finally {
            setApplying(false);
        }
    };

    const handleClose = () => {
        setSelectedTemplate(null);
        setShowAdjustments(false);
        setError(null);
        setSuccess(false);
        setAdjustments({
            portionMultiplier: 1,
            excludeOptionalItems: false,
            customMealTiming: {}
        });
        onClose();
    };

    const renderAdjustmentSettings = () => (
        <div className="mt-4 p-3 bg-light rounded">
            <h6 className="mb-3">
                <Settings size={16} className="me-1" />
                Configuración de Aplicación
            </h6>
            
            <Row>
                <Col md={6}>
                    <Form.Group className="mb-3">
                        <Form.Label>Multiplicador de Porciones</Form.Label>
                        <Form.Range
                            min={0.5}
                            max={2}
                            step={0.1}
                            value={adjustments.portionMultiplier}
                            onChange={(e) => setAdjustments(prev => ({
                                ...prev,
                                portionMultiplier: parseFloat(e.target.value)
                            }))}
                        />
                        <div className="d-flex justify-content-between small text-muted">
                            <span>50%</span>
                            <span className="fw-bold">
                                {Math.round(adjustments.portionMultiplier * 100)}%
                            </span>
                            <span>200%</span>
                        </div>
                    </Form.Group>
                </Col>
                <Col md={6}>
                    <Form.Group className="mb-3">
                        <Form.Check
                            type="checkbox"
                            label="Excluir elementos opcionales"
                            checked={adjustments.excludeOptionalItems}
                            onChange={(e) => setAdjustments(prev => ({
                                ...prev,
                                excludeOptionalItems: e.target.checked
                            }))}
                        />
                        <Form.Text className="text-muted">
                            Los alimentos y recetas marcados como opcionales no se incluirán
                        </Form.Text>
                    </Form.Group>
                </Col>
            </Row>

            {selectedTemplate?.mealTiming && (
                <div>
                    <h6 className="mb-2">Horarios de Comidas</h6>
                    <Row>
                        {Object.entries(selectedTemplate.mealTiming).map(([mealType, defaultTime]) => (
                            <Col key={mealType} md={4} className="mb-2">
                                <Form.Group>
                                    <Form.Label className="small">
                                        {mealType.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                    </Form.Label>
                                    <Form.Control
                                        type="time"
                                        size="sm"
                                        value={adjustments.customMealTiming[mealType] || defaultTime || ''}
                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAdjustments(prev => ({
                                            ...prev,
                                            customMealTiming: {
                                                ...prev.customMealTiming,
                                                [mealType]: e.target.value
                                            }
                                        }))}
                                    />
                                </Form.Group>
                            </Col>
                        ))}
                    </Row>
                </div>
            )}
        </div>
    );

    const renderSelectedTemplate = () => {
        if (!selectedTemplate) return null;

        const nutrition = templateService.calculateTemplateNutrition(selectedTemplate);

        return (
            <div className="mt-4">
                <div className="d-flex justify-content-between align-items-center mb-3">
                    <h5>Plantilla Seleccionada</h5>
                    <Button
                        variant="outline-secondary"
                        size="sm"
                        onClick={() => setSelectedTemplate(null)}
                    >
                        Cambiar
                    </Button>
                </div>

                <div className="p-3 border rounded">
                    <div className="d-flex justify-content-between align-items-start mb-2">
                        <h6 className="mb-1">{selectedTemplate.name}</h6>
                        <Badge bg="primary">{selectedTemplate.meals.length} comidas</Badge>
                    </div>
                    
                    <p className="text-muted small mb-3">
                        {selectedTemplate.description || 'Sin descripción'}
                    </p>

                    <Row className="text-center">
                        <Col xs={3}>
                            <div className="small">
                                <strong>{nutrition.dailyAverages.calories}</strong>
                                <div className="text-muted">kcal/día</div>
                            </div>
                        </Col>
                        <Col xs={3}>
                            <div className="small">
                                <strong>{nutrition.dailyAverages.protein}g</strong>
                                <div className="text-muted">proteína</div>
                            </div>
                        </Col>
                        <Col xs={3}>
                            <div className="small">
                                <strong>{nutrition.dailyAverages.carbohydrates}g</strong>
                                <div className="text-muted">carbohidratos</div>
                            </div>
                        </Col>
                        <Col xs={3}>
                            <div className="small">
                                <strong>{nutrition.dailyAverages.fats}g</strong>
                                <div className="text-muted">grasas</div>
                            </div>
                        </Col>
                    </Row>

                    <div className="mt-3">
                        <Button
                            variant="outline-primary"
                            size="sm"
                            onClick={() => setShowAdjustments(!showAdjustments)}
                        >
                            <Settings size={14} className="me-1" />
                            {showAdjustments ? 'Ocultar' : 'Mostrar'} Configuración
                        </Button>
                    </div>

                    {showAdjustments && renderAdjustmentSettings()}
                </div>
            </div>
        );
    };

    return (
        <Modal show={isOpen} onHide={handleClose} size="xl" backdrop="static">
            <Modal.Header closeButton>
                <Modal.Title>
                    <Download size={20} className="me-2" />
                    Aplicar Plantilla de Plan Semanal
                </Modal.Title>
            </Modal.Header>

            <Modal.Body style={{ maxHeight: '70vh', overflowY: 'auto' }}>
                {success ? (
                    <div className="text-center py-5">
                        <CheckCircle size={64} className="text-success mb-3" />
                        <h4 className="text-success">¡Plantilla Aplicada Exitosamente!</h4>
                        <p className="text-muted">
                            El plan de comidas se ha actualizado con la plantilla seleccionada.
                        </p>
                    </div>
                ) : (
                    <>
                        {error && (
                            <Alert variant="danger" dismissible onClose={() => setError(null)}>
                                {error}
                            </Alert>
                        )}

                        {selectedTemplate ? (
                            renderSelectedTemplate()
                        ) : (
                            <TemplateLibrary
                                selectMode={true}
                                showActions={false}
                                onSelectTemplate={handleTemplateSelect}
                            />
                        )}
                    </>
                )}
            </Modal.Body>

            {!success && (
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleClose}>
                        Cancelar
                    </Button>
                    
                    {selectedTemplate && (
                        <Button
                            variant="primary"
                            onClick={handleApplyTemplate}
                            disabled={applying}
                        >
                            {applying ? (
                                <>
                                    <span className="spinner-border spinner-border-sm me-2" />
                                    Aplicando...
                                </>
                            ) : (
                                <>
                                    <Download size={16} className="me-1" />
                                    Aplicar Plantilla
                                </>
                            )}
                        </Button>
                    )}
                </Modal.Footer>
            )}
        </Modal>
    );
};

export default TemplateApplicator; 