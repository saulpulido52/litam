import React, { useState, useEffect } from 'react';
import { Modal, Button, Row, Col, Tab, Tabs, Form, Alert, Badge } from 'react-bootstrap';
import { Save, X, Calculator, Plus, Trash2, ShoppingCart } from 'lucide-react';
import type { Recipe, RecipeIngredient } from '../../types/recipe';
import { INGREDIENT_CATEGORIES, SHOPPING_UNITS } from '../../types/recipe';
import type { Food } from '../../services/foodService';

interface RecipeEditorModalProps {
  show: boolean;
  onHide: () => void;
  recipe: Recipe | null;
  onSave: (modifiedRecipe: Recipe, isModified: boolean) => void;
  availableFoods: Food[];
}

export const RecipeEditorModal: React.FC<RecipeEditorModalProps> = ({
  show,
  onHide,
  recipe,
  onSave,
  availableFoods
}) => {
  const [editedRecipe, setEditedRecipe] = useState<Recipe | null>(null);
  const [activeTab, setActiveTab] = useState<string>('general');
  const [errors, setErrors] = useState<string[]>([]);
  const [isModified, setIsModified] = useState(false);

  // Inicializar receta editada
  useEffect(() => {
    if (recipe) {
      console.log('🔄 Initializing recipe:', recipe);
      const initialRecipe = {
        ...recipe,
        ingredients: recipe.ingredients || []
      };
      
      // Si no hay ingredientes, agregar uno por defecto
      if (!recipe.ingredients || recipe.ingredients.length === 0) {
        const defaultIngredient: RecipeIngredient = {
          id: `default-${Date.now()}`,
          food_id: '',
          food_name: '',
          quantity: 100,
          unit: 'g',
          calories_per_100g: 0,
          protein_per_100g: 0,
          carbohydrates_per_100g: 0,
          fats_per_100g: 0,
          category: INGREDIENT_CATEGORIES[0],
          shopping_unit: SHOPPING_UNITS.find(u => u.id === 'g') || SHOPPING_UNITS[0],
          shopping_quantity: 100,
          customCaloriesPer100g: undefined,
          customProteinPer100g: undefined,
          customCarbohydratesPer100g: undefined,
          customFatsPer100g: undefined,
          brand_preference: ''
        };
        initialRecipe.ingredients = [defaultIngredient];
      }
      
      setEditedRecipe(initialRecipe);
      setIsModified(false);
      setErrors([]);
    }
  }, [recipe]);

  const handleRecipeChange = (field: keyof Recipe, value: any) => {
    if (!editedRecipe) return;
    
    setEditedRecipe(prev => ({
      ...prev!,
      [field]: value
    }));
    setIsModified(true);
  };

  const handleIngredientChange = (index: number, field: keyof RecipeIngredient, value: any) => {
    if (!editedRecipe) return;

    console.log(`🔧 Updating ingredient ${index}, field: ${field}, value:`, value);

    const updatedIngredients = [...editedRecipe.ingredients];
    updatedIngredients[index] = {
      ...updatedIngredients[index],
      [field]: value
    };

    setEditedRecipe(prev => ({
      ...prev!,
      ingredients: updatedIngredients
    }));
    setIsModified(true);
  };

  const addIngredient = () => {
    if (!editedRecipe) return;

    const newIngredient: RecipeIngredient = {
      id: `new-${Date.now()}`,
      food_id: '',
      food_name: '',
      quantity: 100,
      unit: 'g',
      calories_per_100g: 0,
      protein_per_100g: 0,
      carbohydrates_per_100g: 0,
      fats_per_100g: 0,
      category: INGREDIENT_CATEGORIES[0],
      shopping_unit: SHOPPING_UNITS.find(u => u.id === 'g') || SHOPPING_UNITS[0],
      shopping_quantity: 100,
      // Campos adicionales para valores nutricionales personalizados
      customCaloriesPer100g: undefined,
      customProteinPer100g: undefined,
      customCarbohydratesPer100g: undefined,
      customFatsPer100g: undefined,
      brand_preference: ''
    };

    setEditedRecipe(prev => ({
      ...prev!,
      ingredients: [...prev!.ingredients, newIngredient]
    }));
    setIsModified(true);
  };

  const removeIngredient = (index: number) => {
    if (!editedRecipe) return;

    const updatedIngredients = editedRecipe.ingredients.filter((_, i) => i !== index);
    setEditedRecipe(prev => ({
      ...prev!,
      ingredients: updatedIngredients
    }));
    setIsModified(true);
  };

  const selectFood = (ingredientIndex: number, food: Food) => {
    if (!editedRecipe) {
      console.log('❌ No editedRecipe available');
      return;
    }

    console.log('🍎 Selecting food for ingredient', ingredientIndex, ':', food);

    const category = INGREDIENT_CATEGORIES.find(cat => 
      cat.name === food.category?.toLowerCase() || cat.id === 'others'
    ) || INGREDIENT_CATEGORIES[0];

    const shoppingUnit = SHOPPING_UNITS.find(unit => 
      unit.category === 'weight' && unit.id === 'g'
    ) || SHOPPING_UNITS[0];

    // Actualizar todo el ingrediente de una vez para evitar conflictos de estado
    const updatedIngredients = [...editedRecipe.ingredients];
    const currentIngredient = updatedIngredients[ingredientIndex];
    
    if (!currentIngredient) {
      console.log('❌ Ingredient not found at index', ingredientIndex);
      return;
    }

    updatedIngredients[ingredientIndex] = {
      ...currentIngredient,
      food_id: food.id,
      food_name: food.name,
      calories_per_100g: food.calories || 0,
      protein_per_100g: food.protein || 0,
      carbohydrates_per_100g: food.carbohydrates || 0,
      fats_per_100g: food.fats || 0,
      category: category,
      shopping_unit: shoppingUnit,
      shopping_quantity: 100
    };

    console.log('✅ Updated ingredient:', updatedIngredients[ingredientIndex]);

    setEditedRecipe(prev => {
      const newRecipe = {
        ...prev!,
        ingredients: updatedIngredients
      };
      console.log('📝 New recipe state:', newRecipe);
      return newRecipe;
    });
    setIsModified(true);
  };

  const calculateTotalNutrition = () => {
    if (!editedRecipe) return { calories: 0, protein: 0, carbs: 0, fats: 0 };

    return editedRecipe.ingredients.reduce((totals, ingredient) => {
      const quantity = ingredient.quantity || 0;
      const calories = (ingredient.customCaloriesPer100g || ingredient.calories_per_100g) || 0;
      const protein = (ingredient.customProteinPer100g || ingredient.protein_per_100g) || 0;
      const carbs = (ingredient.customCarbohydratesPer100g || ingredient.carbohydrates_per_100g) || 0;
      const fats = (ingredient.customFatsPer100g || ingredient.fats_per_100g) || 0;

      return {
        calories: totals.calories + (calories * quantity / 100),
        protein: totals.protein + (protein * quantity / 100),
        carbs: totals.carbs + (carbs * quantity / 100),
        fats: totals.fats + (fats * quantity / 100)
      };
    }, { calories: 0, protein: 0, carbs: 0, fats: 0 });
  };

  const validateRecipe = (): boolean => {
    const newErrors: string[] = [];

    if (!editedRecipe?.title?.trim()) {
      newErrors.push('El título es obligatorio');
    }

    if (!editedRecipe?.servings || editedRecipe.servings <= 0) {
      newErrors.push('El número de porciones debe ser mayor a 0');
    }

    if (editedRecipe?.ingredients?.length === 0) {
      newErrors.push('La receta debe tener al menos un ingrediente');
    }

    editedRecipe?.ingredients?.forEach((ingredient, index) => {
      if (!ingredient.food_name?.trim()) {
        newErrors.push(`Ingrediente ${index + 1}: Debe seleccionar un alimento`);
      }
      if (!ingredient.quantity || ingredient.quantity <= 0) {
        newErrors.push(`Ingrediente ${index + 1}: La cantidad debe ser mayor a 0`);
      }
    });

    setErrors(newErrors);
    return newErrors.length === 0;
  };

  const handleSave = () => {
    if (!editedRecipe || !validateRecipe()) return;

    // Calcular valores nutricionales basados en ingredientes
    const nutrition = calculateTotalNutrition();
    const finalRecipe: Recipe = {
      ...editedRecipe,
      totalCalories: Math.round(nutrition.calories),
      totalMacros: {
        protein: Math.round(nutrition.protein * 10) / 10,
        carbohydrates: Math.round(nutrition.carbs * 10) / 10,
        fats: Math.round(nutrition.fats * 10) / 10
      }
    };

    onSave(finalRecipe, isModified);
    onHide();
  };

  const nutrition = calculateTotalNutrition();

  if (!editedRecipe) return null;

  return (
    <Modal show={show} onHide={onHide} size="xl" centered>
      <Modal.Header closeButton>
        <Modal.Title className="d-flex align-items-center">
          <Calculator className="me-2" size={24} />
          Editor de Receta
          {isModified && <Badge bg="warning" className="ms-2">Modificada</Badge>}
        </Modal.Title>
      </Modal.Header>

      <Modal.Body style={{ maxHeight: '70vh', overflowY: 'auto' }}>
        {errors.length > 0 && (
          <Alert variant="danger">
            <strong>Errores encontrados:</strong>
            <ul className="mb-0 mt-1">
              {errors.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </Alert>
        )}

        <Tabs activeKey={activeTab} onSelect={(k) => setActiveTab(k || 'general')}>
          {/* Tab 1: Información General */}
          <Tab eventKey="general" title={
            <span>
              📝 General
            </span>
          }>
            <div className="mt-3">
              <Row>
                <Col md={8}>
                  <Form.Group className="mb-3">
                    <Form.Label>Título de la receta *</Form.Label>
                    <Form.Control
                      type="text"
                      value={editedRecipe.title}
                      onChange={(e) => handleRecipeChange('title', e.target.value)}
                      placeholder="Ej: Ensalada César con pollo"
                    />
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group className="mb-3">
                    <Form.Label>Porciones *</Form.Label>
                    <Form.Control
                      type="number"
                      min="0.1"
                      step="0.1"
                      value={editedRecipe.servings}
                      onChange={(e) => handleRecipeChange('servings', parseFloat(e.target.value))}
                    />
                  </Form.Group>
                </Col>
              </Row>

              <Form.Group className="mb-3">
                <Form.Label>Descripción</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  value={editedRecipe.description || ''}
                  onChange={(e) => handleRecipeChange('description', e.target.value)}
                  placeholder="Describe la receta, su preparación o beneficios..."
                />
              </Form.Group>

              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Tiempo de preparación (min)</Form.Label>
                    <Form.Control
                      type="number"
                      min="1"
                      value={editedRecipe.prepTimeMinutes || 0}
                      onChange={(e) => handleRecipeChange('prepTimeMinutes', parseInt(e.target.value))}
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Tiempo de cocción (min)</Form.Label>
                    <Form.Control
                      type="number"
                      min="0"
                      value={editedRecipe.cookTimeMinutes || 0}
                      onChange={(e) => handleRecipeChange('cookTimeMinutes', parseInt(e.target.value))}
                    />
                  </Form.Group>
                </Col>
              </Row>

              {/* Resumen nutricional calculado automáticamente */}
              <div className="bg-light p-3 rounded">
                <h6>📊 Información Nutricional Calculada</h6>
                <Row>
                  <Col md={3}>
                    <div className="text-center">
                      <div className="h5 text-primary">{Math.round(nutrition.calories)}</div>
                      <small className="text-muted">Calorías totales</small>
                    </div>
                  </Col>
                  <Col md={3}>
                    <div className="text-center">
                      <div className="h6 text-success">{Math.round(nutrition.protein * 10) / 10}g</div>
                      <small className="text-muted">Proteínas</small>
                    </div>
                  </Col>
                  <Col md={3}>
                    <div className="text-center">
                      <div className="h6 text-warning">{Math.round(nutrition.carbs * 10) / 10}g</div>
                      <small className="text-muted">Carbohidratos</small>
                    </div>
                  </Col>
                  <Col md={3}>
                    <div className="text-center">
                      <div className="h6 text-info">{Math.round(nutrition.fats * 10) / 10}g</div>
                      <small className="text-muted">Grasas</small>
                    </div>
                  </Col>
                </Row>
                <div className="mt-2 text-center">
                  <small className="text-muted">
                    Por porción: ~{Math.round(nutrition.calories / (editedRecipe.servings || 1))} kcal
                  </small>
                </div>
              </div>
            </div>
          </Tab>

          {/* Tab 2: Ingredientes y Lista de Compras */}
          <Tab eventKey="ingredients" title={
            <span>
              <ShoppingCart className="me-1" size={16} />
              Ingredientes ({editedRecipe.ingredients.length})
            </span>
          }>
            <div className="mt-3">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h6>🛒 Lista de Ingredientes para Lista de Compras</h6>
                <Button variant="outline-primary" size="sm" onClick={addIngredient}>
                  <Plus size={16} className="me-1" />
                  Agregar Ingrediente
                </Button>
              </div>

              {editedRecipe.ingredients.map((ingredient, index) => (
                <div key={`${ingredient.id}-${index}`} className="border rounded p-3 mb-3">
                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-2">
                        <Form.Label>Alimento *</Form.Label>
                        <Form.Select
                          value={ingredient.food_id}
                          onChange={(e) => {
                            console.log('🍎 Selecting food:', e.target.value);
                            const selectedFood = availableFoods.find(f => f.id === e.target.value);
                            if (selectedFood) {
                              console.log('✅ Found food:', selectedFood);
                              selectFood(index, selectedFood);
                            } else {
                              console.log('❌ Food not found');
                            }
                          }}
                        >
                          <option value="">Seleccionar alimento...</option>
                          {availableFoods.map(food => (
                            <option key={food.id} value={food.id}>
                              {food.name} ({food.calories} kcal/{food.serving_size}g)
                            </option>
                          ))}
                        </Form.Select>
                      </Form.Group>
                    </Col>
                    <Col md={3}>
                      <Form.Group className="mb-2">
                        <Form.Label>Cantidad *</Form.Label>
                        <Form.Control
                          type="number"
                          min="0.1"
                          step="0.1"
                          value={ingredient.quantity}
                          onChange={(e) => handleIngredientChange(index, 'quantity', parseFloat(e.target.value))}
                        />
                      </Form.Group>
                    </Col>
                    <Col md={2}>
                      <Form.Group className="mb-2">
                        <Form.Label>Unidad</Form.Label>
                        <Form.Control
                          type="text"
                          value={ingredient.unit}
                          onChange={(e) => handleIngredientChange(index, 'unit', e.target.value)}
                        />
                      </Form.Group>
                    </Col>
                    <Col md={1}>
                      <Form.Label>&nbsp;</Form.Label>
                      <Button
                        variant="outline-danger"
                        size="sm"
                        className="d-block"
                        onClick={() => removeIngredient(index)}
                      >
                        <Trash2 size={16} />
                      </Button>
                    </Col>
                  </Row>

                  {/* Información para lista de compras */}
                  <Row className="mt-2">
                    <Col md={4}>
                      <Form.Group className="mb-2">
                        <Form.Label>Categoría (Lista de compras)</Form.Label>
                        <Form.Select
                          value={ingredient.category.id}
                          onChange={(e) => {
                            const category = INGREDIENT_CATEGORIES.find(c => c.id === e.target.value);
                            if (category) {
                              handleIngredientChange(index, 'category', category);
                            }
                          }}
                        >
                          {INGREDIENT_CATEGORIES.map(category => (
                            <option key={category.id} value={category.id}>
                              {category.icon} {category.display_name}
                            </option>
                          ))}
                        </Form.Select>
                      </Form.Group>
                    </Col>
                    <Col md={3}>
                      <Form.Group className="mb-2">
                        <Form.Label>Cantidad compra</Form.Label>
                        <Form.Control
                          type="number"
                          min="0.1"
                          step="0.1"
                          value={ingredient.shopping_quantity}
                          onChange={(e) => handleIngredientChange(index, 'shopping_quantity', parseFloat(e.target.value))}
                        />
                      </Form.Group>
                    </Col>
                    <Col md={3}>
                      <Form.Group className="mb-2">
                        <Form.Label>Unidad compra</Form.Label>
                        <Form.Select
                          value={ingredient.shopping_unit.id}
                          onChange={(e) => {
                            const unit = SHOPPING_UNITS.find(u => u.id === e.target.value);
                            if (unit) {
                              handleIngredientChange(index, 'shopping_unit', unit);
                            }
                          }}
                        >
                          {SHOPPING_UNITS.map(unit => (
                            <option key={unit.id} value={unit.id}>
                              {unit.abbreviation} ({unit.name})
                            </option>
                          ))}
                        </Form.Select>
                      </Form.Group>
                    </Col>
                    <Col md={2}>
                      <Form.Group className="mb-2">
                        <Form.Label>Marca pref.</Form.Label>
                        <Form.Control
                          type="text"
                          value={ingredient.brand_preference || ''}
                          onChange={(e) => handleIngredientChange(index, 'brand_preference', e.target.value)}
                          placeholder="Opcional"
                        />
                      </Form.Group>
                    </Col>
                  </Row>

                  {/* Valores nutricionales personalizables */}
                  <div className="mt-2">
                    <small className="text-muted">Valores nutricionales por 100g (dejar vacío para usar valores por defecto):</small>
                    <Row className="mt-1">
                      <Col md={3}>
                        <Form.Control
                          type="number"
                          size="sm"
                          placeholder={`Calorías (${ingredient.calories_per_100g})`}
                          value={ingredient.customCaloriesPer100g || ''}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleIngredientChange(index, 'customCaloriesPer100g', 
                            e.target.value ? parseFloat(e.target.value) : undefined)}
                        />
                      </Col>
                      <Col md={3}>
                        <Form.Control
                          type="number"
                          size="sm"
                          placeholder={`Proteína (${ingredient.protein_per_100g}g)`}
                          value={ingredient.customProteinPer100g || ''}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleIngredientChange(index, 'customProteinPer100g', 
                            e.target.value ? parseFloat(e.target.value) : undefined)}
                        />
                      </Col>
                      <Col md={3}>
                        <Form.Control
                          type="number"
                          size="sm"
                          placeholder={`Carbohidratos (${ingredient.carbohydrates_per_100g}g)`}
                          value={ingredient.customCarbohydratesPer100g || ''}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleIngredientChange(index, 'customCarbohydratesPer100g', 
                            e.target.value ? parseFloat(e.target.value) : undefined)}
                        />
                      </Col>
                      <Col md={3}>
                        <Form.Control
                          type="number"
                          size="sm"
                          placeholder={`Grasas (${ingredient.fats_per_100g}g)`}
                          value={ingredient.customFatsPer100g || ''}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleIngredientChange(index, 'customFatsPer100g', 
                            e.target.value ? parseFloat(e.target.value) : undefined)}
                        />
                      </Col>
                    </Row>
                  </div>
                </div>
              ))}

              {editedRecipe.ingredients.length === 0 && (
                <Alert variant="info">
                  <ShoppingCart className="me-2" />
                  <strong>Agrega ingredientes</strong> para generar automáticamente la lista de compras del plan semanal.
                  Los ingredientes se categorizarán por secciones del supermercado.
                </Alert>
              )}
            </div>
          </Tab>

          {/* Tab 3: Instrucciones */}
          <Tab eventKey="instructions" title="📝 Preparación">
            <div className="mt-3">
              <Form.Group className="mb-3">
                <Form.Label>Instrucciones de preparación</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={8}
                  value={editedRecipe.instructions || ''}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => handleRecipeChange('instructions', e.target.value)}
                  placeholder="Escribe paso a paso las instrucciones para preparar esta receta..."
                />
              </Form.Group>

              <Alert variant="success" className="small">
                <strong>✨ Lista de Compras Automática:</strong> Los ingredientes que agregues se compilarán automáticamente 
                en la lista de compras semanal del paciente, organizados por categorías del supermercado.
              </Alert>
            </div>
          </Tab>
        </Tabs>
      </Modal.Body>

      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          <X size={16} className="me-1" />
          Cancelar
        </Button>
        <Button variant="primary" onClick={handleSave} disabled={errors.length > 0}>
          <Save size={16} className="me-1" />
          Guardar Receta
          {isModified && ' (Modificada)'}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}; 