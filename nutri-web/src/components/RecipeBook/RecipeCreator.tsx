// nutri-web/src/components/RecipeBook/RecipeCreator.tsx
import React, { useState } from 'react';
import { Modal, Form, Button, Row, Col, InputGroup, Table, Badge, Card, Spinner, ProgressBar } from 'react-bootstrap';
import { Trash, Plus, Activity, AlertTriangle, CheckCircle, Info } from 'lucide-react';
import { recipeService } from '../../services/recipeService';
import type { CreateRecipeDto } from '../../services/recipeService';
import { toast } from 'react-hot-toast';

interface RecipeCreatorProps {
  isOpen: boolean;
  onClose: () => void;
  editRecipe?: any | null;
  onSave?: () => void;
}

const UNITS = [
  { label: 'Gramos (g)', value: 'g', factor: 1 },
  { label: 'Mililitros (ml)', value: 'ml', factor: 1 },
  { label: 'Taza (cup)', value: 'cup', factor: 240 },
  { label: 'Pieza/Unidad', value: 'unit', factor: 0 },
  { label: 'Cucharada (tbsp)', value: 'tbsp', factor: 15 },
  { label: 'Cucharadita (tsp)', value: 'tsp', factor: 5 },
];

const RecipeCreator: React.FC<RecipeCreatorProps> = ({
  isOpen,
  onClose,
  editRecipe,
  onSave
}) => {
  const [formData, setFormData] = useState<CreateRecipeDto>({
    title: '',
    description: '',
    instructions: '',
    prep_time_minutes: 15,
    cook_time_minutes: 15,
    servings: 1,
    tags: [],
    ingredients: []
  });

  const [newIngredient, setNewIngredient] = useState({
    name: '',
    quantity: '',
    unit: 'g'
  });

  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisData, setAnalysisData] = useState<any>(null);
  const [isSaving, setIsSaving] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: parseInt(value) || 0 }));
  };

  const addIngredient = () => {
    if (!newIngredient.name || !newIngredient.quantity) return;

    setFormData(prev => ({
      ...prev,
      ingredients: [
        ...prev.ingredients,
        {
          ingredient_name: newIngredient.name,
          quantity: parseFloat(newIngredient.quantity),
          unit: newIngredient.unit
        }
      ]
    }));

    setNewIngredient({ name: '', quantity: '', unit: 'g' });
    setAnalysisData(null);
  };

  const removeIngredient = (index: number) => {
    setFormData(prev => ({
      ...prev,
      ingredients: prev.ingredients.filter((_, i) => i !== index)
    }));
    setAnalysisData(null);
  };

  const handleAnalyze = async () => {
    if (formData.ingredients.length === 0) {
      toast.error('Agrega ingredientes primero');
      return;
    }

    setIsAnalyzing(true);
    try {
      const ingredientsPayload = formData.ingredients.map(ing => {
        let quantity_g = ing.quantity;
        const unitData = UNITS.find(u => u.value === ing.unit);
        if (unitData && unitData.factor > 0) {
          quantity_g = ing.quantity * unitData.factor;
        }

        let nameToSend = ing.ingredient_name;
        if (ing.unit === 'unit') {
          nameToSend = `${ing.quantity} ${ing.ingredient_name}`;
          quantity_g = 0;
        } else if (ing.unit !== 'g') {
          nameToSend = `${ing.quantity} ${ing.unit} ${ing.ingredient_name}`;
          quantity_g = 0;
        }

        return {
          name: nameToSend,
          quantity_g: quantity_g
        };
      });

      const result = await recipeService.analyzeRecipe(ingredientsPayload);
      setAnalysisData(result.data);
      toast.success('¡Análisis completado!');
    } catch (error) {
      console.error(error);
      toast.error('Error al analizar la receta');
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <Modal show={isOpen} onHide={onClose} size="xl" backdrop="static">
      <Modal.Header closeButton className="bg-light py-2">
        <Modal.Title className="d-flex align-items-center gap-2 h5 mb-0">
          <span role="img" aria-label="chef">👨‍🍳</span>
          {editRecipe ? 'Editar Receta' : 'Nueva Receta Inteligente'}
        </Modal.Title>
      </Modal.Header>

      <Modal.Body className="p-0">
        <div className="d-flex flex-column flex-lg-row" style={{ minHeight: '500px' }}>
          {/* COLUMNA IZQUIERDA: EDITOR */}
          <div className="flex-grow-1 p-3 border-end">
            <h6 className="mb-3 text-muted border-bottom pb-2">📝 Datos Básicos</h6>

            <Form.Group className="mb-2">
              <Form.Label className="small fw-bold">Título</Form.Label>
              <Form.Control
                size="sm"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="Ej: Ensalada César con Pollo"
                autoFocus
                className="mb-2"
              />
            </Form.Group>

            <Row className="mb-3 g-2">
              <Col xs={4}>
                <Form.Label className="small">Prep (min)</Form.Label>
                <Form.Control size="sm" type="number" name="prep_time_minutes" value={formData.prep_time_minutes} onChange={handleNumberChange} />
              </Col>
              <Col xs={4}>
                <Form.Label className="small">Cocción</Form.Label>
                <Form.Control size="sm" type="number" name="cook_time_minutes" value={formData.cook_time_minutes} onChange={handleNumberChange} />
              </Col>
              <Col xs={4}>
                <Form.Label className="small">Porciones</Form.Label>
                <Form.Control size="sm" type="number" name="servings" value={formData.servings} onChange={handleNumberChange} />
              </Col>
            </Row>

            <h6 className="mt-4 mb-2 text-muted d-flex justify-content-between align-items-center border-bottom pb-2">
              <span>🥕 Ingredientes</span>
              <Badge bg="secondary" style={{ fontSize: '0.7rem' }}>{formData.ingredients.length} items</Badge>
            </h6>

            <Card className="mb-2 border-0 bg-light">
              <Card.Body className="p-2">
                <InputGroup size="sm">
                  <Form.Control
                    placeholder="Manzana..."
                    value={newIngredient.name}
                    onChange={(e) => setNewIngredient({ ...newIngredient, name: e.target.value })}
                  />
                  <Form.Control
                    type="number"
                    placeholder="Cant."
                    style={{ maxWidth: '70px' }}
                    value={newIngredient.quantity}
                    onChange={(e) => setNewIngredient({ ...newIngredient, quantity: e.target.value })}
                  />
                  <Form.Select
                    style={{ maxWidth: '100px' }}
                    value={newIngredient.unit}
                    onChange={(e) => setNewIngredient({ ...newIngredient, unit: e.target.value })}
                  >
                    {UNITS.map(u => <option key={u.value} value={u.value}>{u.label}</option>)}
                  </Form.Select>
                  <Button variant="primary" onClick={addIngredient}>
                    <Plus size={16} />
                  </Button>
                </InputGroup>
              </Card.Body>
            </Card>

            <div className="table-responsive border rounded" style={{ height: '200px', overflowY: 'auto' }}>
              <Table hover size="sm" className="mb-0 small">
                <thead className="table-light sticky-top">
                  <tr>
                    <th>Cant.</th>
                    <th>Ingrediente</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {formData.ingredients.length === 0 && (
                    <tr>
                      <td colSpan={3} className="text-center text-muted py-4">No hay ingredientes</td>
                    </tr>
                  )}
                  {formData.ingredients.map((ing, idx) => (
                    <tr key={idx}>
                      <td style={{ width: '30%' }}>{ing.quantity} {UNITS.find(u => u.value === ing.unit)?.label || ing.unit}</td>
                      <td className="fw-500">{ing.ingredient_name}</td>
                      <td className="text-end" style={{ width: '30px' }}>
                        <Trash size={14} className="text-danger cursor-pointer" onClick={() => removeIngredient(idx)} style={{ cursor: 'pointer' }} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>

            <div className="d-grid mt-3">
              <Button
                variant={analysisData ? "outline-primary" : "primary"}
                size="sm"
                className="py-2 fw-bold"
                onClick={handleAnalyze}
                disabled={isAnalyzing || formData.ingredients.length === 0}
              >
                {isAnalyzing ? <Spinner size="sm" className="me-2" /> : <Activity size={16} className="me-2" />}
                {analysisData ? '⚡ Re-Analizar' : '⚡ Analizar Nutrición'}
              </Button>
            </div>
          </div>

          {/* COLUMNA DERECHA: RESULTADOS (COMPACTA) */}
          <div className="bg-light-subtle p-3" style={{ width: '380px', minWidth: '320px', borderLeft: '1px solid #dee2e6' }}>
            <h6 className="mb-3 text-muted text-center border-bottom pb-2">📊 Reporte Nutricional</h6>

            {!analysisData ? (
              <div className="text-center py-5 text-muted opacity-50 d-flex flex-column align-items-center justify-content-center h-75">
                <Activity size={40} className="mb-3 text-primary opacity-50" />
                <p className="small mb-0 px-4">Los resultados aparecerán aquí tras analizar.</p>
              </div>
            ) : (
              <div className="animate__animated animate__fadeIn">
                {/* CALORIAS */}
                <div className="text-center mb-3">
                  <h1 className="mb-0 fw-bold text-primary display-4" style={{ fontSize: '2.5rem' }}>
                    {Math.round(analysisData.totals.total_calories / formData.servings)}
                  </h1>
                  <div className="text-uppercase fw-bold text-muted" style={{ fontSize: '0.65rem', letterSpacing: '1px' }}>Kcal / Porción</div>
                </div>

                {/* MACROS COMPACTOS */}
                <Card className="border-0 shadow-sm mb-3 overflow-hidden">
                  <Card.Body className="p-0">
                    <div className="d-flex">
                      <div className="flex-fill p-2 text-center border-end bg-info-subtle">
                        <div className="small fw-bold text-info-emphasis">Prot</div>
                        <h6 className="mb-0 fw-bold">{Math.round(analysisData.totals.total_protein_g)}g</h6>
                      </div>
                      <div className="flex-fill p-2 text-center border-end bg-warning-subtle">
                        <div className="small fw-bold text-warning-emphasis">Carbs</div>
                        <h6 className="mb-0 fw-bold">{Math.round(analysisData.totals.total_carbs_g)}g</h6>
                      </div>
                      <div className="flex-fill p-2 text-center bg-danger-subtle">
                        <div className="small fw-bold text-danger-emphasis">Grasas</div>
                        <h6 className="mb-0 fw-bold">{Math.round(analysisData.totals.total_fats_g)}g</h6>
                      </div>
                    </div>
                  </Card.Body>
                </Card>

                {/* OMS BADGE */}
                <div className={`p-2 rounded mb-3 d-flex align-items-center gap-3 border ${analysisData.who_compliance.status === 'GREEN' ? 'bg-success-subtle border-success-subtle' :
                    analysisData.who_compliance.status === 'RED' ? 'bg-danger-subtle border-danger-subtle' : 'bg-warning-subtle border-warning-subtle'
                  }`}>
                  {analysisData.who_compliance.status === 'GREEN' ? (
                    <CheckCircle size={28} className="text-success" />
                  ) : (
                    <AlertTriangle size={28} className={`text-${analysisData.who_compliance.status === 'RED' ? 'danger' : 'warning'}`} />
                  )}
                  <div>
                    <div className="fw-bold small">Estado OMS</div>
                    <div className="fw-bold" style={{ lineHeight: 1 }}>
                      {analysisData.who_compliance.status === 'GREEN' ? 'Saludable ✅' :
                        analysisData.who_compliance.status === 'RED' ? 'Crítico 🚨' : 'Moderado ⚠️'}
                    </div>
                  </div>
                </div>

                {/* LISTA DE ADVERTENCIAS */}
                {analysisData.who_compliance.warnings && analysisData.who_compliance.warnings.length > 0 ? (
                  <div className="d-flex flex-column gap-1">
                    {analysisData.who_compliance.warnings.map((warn: any, i: number) => (
                      <div key={i} className="small text-danger d-flex align-items-center gap-2 bg-white border border-danger-subtle rounded p-1 px-2">
                        <AlertTriangle size={12} className="flex-shrink-0" />
                        <span style={{ fontSize: '0.8rem' }}>{warn.message}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-success small text-center p-2 bg-success-subtle rounded border border-success-subtle">
                    ✨ Cumple todos los estándares OMS
                  </div>
                )}

              </div>
            )}
          </div>
        </div>
      </Modal.Body>

      <Modal.Footer className="py-2 bg-light">
        <Button variant="link" onClick={onClose} className="text-decoration-none text-muted">Cancelar</Button>
        <Button variant="success" size="sm" className="px-4" onClick={() => { }} disabled={isSaving || !analysisData}>
          Guardar Receta
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default RecipeCreator;