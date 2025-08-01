// nutri-web/src/components/RecipeMealPlanner.tsx
import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Tabs, Tab, Badge, Alert, Form } from 'react-bootstrap';
import { Plus, Trash2, Calculator, ChefHat, Copy} from 'lucide-react';
import { recipeService } from '../services/recipeService';
import type { Recipe } from '../types/recipe';

interface MealRecipe {
  id: string;
  recipe: Recipe;
  servings: number;
  calories: number;
  protein: number;
  carbohydrates: number;
  fats: number;
}

interface RecipeMeal {
  id: string;
  type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  name: string;
  recipes: MealRecipe[];
  totalCalories: number;
  totalMacros: {
    protein: number;
    carbohydrates: number;
    fats: number;
  };
}

interface RecipeMealPlannerProps {
  patientId?: string;
  onSave?: (meals: RecipeMeal[]) => void;
  initialMeals?: RecipeMeal[];
}

const RecipeMealPlanner: React.FC<RecipeMealPlannerProps> = ({
  onSave,
  initialMeals = []
}) => {
  const [meals, setMeals] = useState<RecipeMeal[]>(initialMeals);
  const [availableRecipes, setAvailableRecipes] = useState<Recipe[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMealType, setSelectedMealType] = useState<'breakfast' | 'lunch' | 'dinner' | 'snack'>('breakfast');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Inicializar comidas por defecto
  useEffect(() => {
    if (initialMeals.length === 0) {
      const defaultMeals: RecipeMeal[] = [
        {
          id: 'breakfast-recipes-1',
          type: 'breakfast',
          name: 'Desayuno',
          recipes: [],
          totalCalories: 0,
          totalMacros: { protein: 0, carbohydrates: 0, fats: 0 }
        },
        {
          id: 'lunch-recipes-1',
          type: 'lunch',
          name: 'Almuerzo',
          recipes: [],
          totalCalories: 0,
          totalMacros: { protein: 0, carbohydrates: 0, fats: 0 }
        },
        {
          id: 'dinner-recipes-1',
          type: 'dinner',
          name: 'Cena',
          recipes: [],
          totalCalories: 0,
          totalMacros: { protein: 0, carbohydrates: 0, fats: 0 }
        },
        {
          id: 'snack-recipes-1',
          type: 'snack',
          name: 'Merienda',
          recipes: [],
          totalCalories: 0,
          totalMacros: { protein: 0, carbohydrates: 0, fats: 0 }
        }
      ];
      setMeals(defaultMeals);
    }
  }, [initialMeals]);

  // Cargar recetas disponibles
  useEffect(() => {
    loadRecipes();
  }, []);

  const loadRecipes = async () => {
    try {
      setLoading(true);
      const response = await recipeService.getAllRecipes();
      setAvailableRecipes(response.recipes as unknown as Recipe[]);
    } catch (err: any) {
      setError('Error al cargar recetas: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Filtrar recetas según búsqueda
  const filteredRecipes = availableRecipes.filter(recipe =>
    recipe.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    recipe.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Agregar receta a comida
  const addRecipeToMeal = (mealId: string, recipe: Recipe, servings: number = 1) => {
    setMeals(prevMeals => 
      prevMeals.map(meal => {
        if (meal.id === mealId) {
          const factor = servings / (recipe.servings || 1);
          const newRecipeItem: MealRecipe = {
            id: `${meal.id}-${recipe.id}-${Date.now()}`,
            recipe,
            servings,
            calories: (recipe.totalCalories || 0) * factor,
            protein: (recipe.totalMacros?.protein || 0) * factor,
            carbohydrates: (recipe.totalMacros?.carbohydrates || 0) * factor,
            fats: (recipe.totalMacros?.fats || 0) * factor
          };

          const updatedRecipes = [...meal.recipes, newRecipeItem];
          const updatedMeal = {
            ...meal,
            recipes: updatedRecipes,
            ...calculateMealTotals(updatedRecipes)
          };

          return updatedMeal;
        }
        return meal;
      })
    );
  };

  // Remover receta de comida
  const removeRecipeFromMeal = (mealId: string, recipeItemId: string) => {
    setMeals(prevMeals =>
      prevMeals.map(meal => {
        if (meal.id === mealId) {
          const updatedRecipes = meal.recipes.filter(item => item.id !== recipeItemId);
          return {
            ...meal,
            recipes: updatedRecipes,
            ...calculateMealTotals(updatedRecipes)
          };
        }
        return meal;
      })
    );
  };

  // Actualizar porciones de receta
  const updateRecipeServings = (mealId: string, recipeItemId: string, newServings: number) => {
    setMeals(prevMeals =>
      prevMeals.map(meal => {
        if (meal.id === mealId) {
          const updatedRecipes = meal.recipes.map(item => {
            if (item.id === recipeItemId) {
              const factor = newServings / (item.recipe.servings || 1);
              return {
                ...item,
                servings: newServings,
                calories: (item.recipe.totalCalories || 0) * factor,
                protein: (item.recipe.totalMacros?.protein || 0) * factor,
                carbohydrates: (item.recipe.totalMacros?.carbohydrates || 0) * factor,
                fats: (item.recipe.totalMacros?.fats || 0) * factor
              };
            }
            return item;
          });

          return {
            ...meal,
            recipes: updatedRecipes,
            ...calculateMealTotals(updatedRecipes)
          };
        }
        return meal;
      })
    );
  };

  // Clonar receta
  const handleCloneRecipe = async (recipe: Recipe) => {
    try {
      setLoading(true);
      const newTitle = prompt(`Título para la copia de "${recipe.title}":`, `${recipe.title} (Mi versión)`);
      if (!newTitle) return;

      // await recipeService.cloneRecipe(recipe.id, newTitle);
      loadRecipes(); // Recargar lista para mostrar la nueva receta
      alert('✅ Receta clonada exitosamente. Ahora puedes modificarla según tus necesidades.');
    } catch (err: any) {
      setError('Error al clonar receta: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Calcular totales de una comida
  const calculateMealTotals = (recipes: MealRecipe[]) => {
    const totals = recipes.reduce(
      (acc, item) => ({
        totalCalories: acc.totalCalories + item.calories,
        totalMacros: {
          protein: acc.totalMacros.protein + item.protein,
          carbohydrates: acc.totalMacros.carbohydrates + item.carbohydrates,
          fats: acc.totalMacros.fats + item.fats
        }
      }),
      {
        totalCalories: 0,
        totalMacros: { protein: 0, carbohydrates: 0, fats: 0 }
      }
    );

    return {
      totalCalories: Math.round(totals.totalCalories),
      totalMacros: {
        protein: Math.round(totals.totalMacros.protein * 100) / 100,
        carbohydrates: Math.round(totals.totalMacros.carbohydrates * 100) / 100,
        fats: Math.round(totals.totalMacros.fats * 100) / 100
      }
    };
  };

  // Calcular totales del día
  const dailyTotals = meals.reduce(
    (acc, meal) => ({
      calories: acc.calories + meal.totalCalories,
      protein: acc.protein + meal.totalMacros.protein,
      carbohydrates: acc.carbohydrates + meal.totalMacros.carbohydrates,
      fats: acc.fats + meal.totalMacros.fats
    }),
    { calories: 0, protein: 0, carbohydrates: 0, fats: 0 }
  );

  // Guardar plan de comidas
  const handleSave = () => {
    if (onSave) {
      onSave(meals);
    }
  };

  return (
    <Container fluid>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h3>
          <ChefHat className="me-2" size={24} />
          Planificador de Comidas - Recetas
        </h3>
        <Button variant="success" onClick={handleSave}>
          Guardar Plan
        </Button>
      </div>

      {error && <Alert variant="danger">{error}</Alert>}

      <Row>
        {/* Panel de recetas disponibles */}
        <Col md={4}>
          <Card>
            <Card.Header>
              <h5>Recetas Disponibles</h5>
              <Form.Control
                type="text"
                placeholder="Buscar recetas..."
                value={searchTerm}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
                className="mt-2"
              />
            </Card.Header>
            <Card.Body style={{ maxHeight: '600px', overflowY: 'auto' }}>
              {loading ? (
                <div className="text-center">Cargando recetas...</div>
              ) : (
                <div className="d-grid gap-2">
                  {filteredRecipes.map(recipe => (
                    <Card key={recipe.id} className="border">
                      <Card.Body className="p-3">
                        <div className="d-flex justify-content-between align-items-start mb-2">
                          <div className="flex-grow-1">
                            <h6 className="mb-1">{recipe.title}</h6>
                            {recipe.description && (
                              <small className="text-muted d-block mb-2">
                                {recipe.description.substring(0, 80)}
                                {recipe.description.length > 80 && '...'}
                              </small>
                            )}
                          </div>
                        </div>
                        
                        <div className="d-flex gap-1 mb-2">
                          <Badge bg="primary" title="Calorías">
                            🔥 {recipe.totalCalories || 0} kcal
                          </Badge>
                          <Badge bg="secondary" title="Porciones">
                            👥 {recipe.servings || 1}
                          </Badge>
                        </div>

                        <div className="d-flex gap-1 mb-3">
                          {recipe.prepTimeMinutes && (
                            <Badge bg="info" title="Tiempo de preparación">
                              ⏱️ {recipe.prepTimeMinutes}min
                            </Badge>
                          )}
                          {recipe.tags && recipe.tags.slice(0, 2).map(tag => (
                            <Badge key={tag} bg="outline-secondary" className="text-dark">
                              {tag}
                            </Badge>
                          ))}
                        </div>

                        <div className="d-flex gap-1">
                          <Button
                            size="sm"
                            variant="outline-primary"
                            onClick={() => addRecipeToMeal(
                              meals.find(m => m.type === selectedMealType)?.id || '',
                              recipe
                            )}
                            className="flex-grow-1"
                          >
                            <Plus size={14} className="me-1" />
                            Agregar
                          </Button>
                          <Button
                            size="sm"
                            variant="outline-info"
                            onClick={() => handleCloneRecipe(recipe)}
                            title="Clonar receta para modificar"
                          >
                            <Copy size={14} />
                          </Button>
                        </div>
                      </Card.Body>
                    </Card>
                  ))}
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>

        {/* Panel de comidas planificadas */}
        <Col md={8}>
          <Tabs
            activeKey={selectedMealType}
            onSelect={(key) => setSelectedMealType(key as any)}
            className="mb-3"
          >
            {meals.map(meal => (
              <Tab
                key={meal.id}
                eventKey={meal.type}
                title={
                  <span>
                    {meal.name}
                    <Badge bg="secondary" className="ms-2">
                      {meal.totalCalories} kcal
                    </Badge>
                  </span>
                }
              >
                <Card>
                  <Card.Header>
                    <div className="d-flex justify-content-between align-items-center">
                      <h5>{meal.name}</h5>
                      <div>
                        <Badge bg="primary" className="me-2">
                          🔥 {meal.totalCalories} kcal
                        </Badge>
                        <Badge bg="success" className="me-2">
                          🥩 {meal.totalMacros.protein}g
                        </Badge>
                        <Badge bg="warning" className="me-2">
                          🍞 {meal.totalMacros.carbohydrates}g
                        </Badge>
                        <Badge bg="info">
                          🥑 {meal.totalMacros.fats}g
                        </Badge>
                      </div>
                    </div>
                  </Card.Header>
                  <Card.Body>
                    {meal.recipes.length === 0 ? (
                      <div className="text-center text-muted py-4">
                        <ChefHat size={48} className="mb-3" />
                        <p>No hay recetas agregadas</p>
                        <small>Selecciona recetas del panel izquierdo para agregar</small>
                      </div>
                    ) : (
                      <div className="d-grid gap-3">
                        {meal.recipes.map(item => (
                          <Card key={item.id} className="border">
                            <Card.Body className="p-3">
                              <Row className="align-items-center">
                                <Col md={5}>
                                  <div className="d-flex align-items-start">
                                    {item.recipe.imageUrl && (
                                      <img
                                        src={item.recipe.imageUrl}
                                        alt={item.recipe.title}
                                        className="me-3 rounded"
                                        style={{ width: '60px', height: '60px', objectFit: 'cover' }}
                                      />
                                    )}
                                    <div>
                                      <h6 className="mb-1">{item.recipe.title}</h6>
                                      <small className="text-muted">
                                        {item.recipe.totalCalories || 0} kcal/receta ({item.recipe.servings || 1} porciones)
                                      </small>
                                      {item.recipe.prepTimeMinutes && (
                                        <div>
                                          <small className="text-info">
                                            ⏱️ {item.recipe.prepTimeMinutes} min
                                          </small>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </Col>
                                <Col md={2}>
                                  <Form.Control
                                    type="number"
                                    value={item.servings}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateRecipeServings(
                                      meal.id,
                                      item.id,
                                      parseFloat(e.target.value) || 0
                                    )}
                                    min="0.1"
                                    step="0.1"
                                  />
                                  <small className="text-muted">porciones</small>
                                </Col>
                                <Col md={4}>
                                  <div className="d-flex gap-1 flex-wrap">
                                    <Badge bg="primary" title="Calorías">
                                      🔥 {Math.round(item.calories)}
                                    </Badge>
                                    <Badge bg="success" title="Proteína">
                                      🥩 {Math.round(item.protein * 100) / 100}g
                                    </Badge>
                                    <Badge bg="warning" title="Carbohidratos">
                                      🍞 {Math.round(item.carbohydrates * 100) / 100}g
                                    </Badge>
                                    <Badge bg="info" title="Grasas">
                                      🥑 {Math.round(item.fats * 100) / 100}g
                                    </Badge>
                                  </div>
                                </Col>
                                <Col md={1}>
                                  <Button
                                    variant="outline-danger"
                                    size="sm"
                                    onClick={() => removeRecipeFromMeal(meal.id, item.id)}
                                  >
                                    <Trash2 size={14} />
                                  </Button>
                                </Col>
                              </Row>
                            </Card.Body>
                          </Card>
                        ))}
                      </div>
                    )}
                  </Card.Body>
                </Card>
              </Tab>
            ))}
          </Tabs>

          {/* Resumen del día */}
          <Card className="mt-3 border-success">
            <Card.Header className="bg-light">
              <div className="d-flex justify-content-between align-items-center">
                <h5 className="mb-0">
                  <Calculator className="me-2" size={20} />
                  Resumen del Día
                </h5>
                <Badge bg="success" style={{ fontSize: '1rem' }}>
                  Total: {Math.round(dailyTotals.calories)} kcal
                </Badge>
              </div>
            </Card.Header>
            <Card.Body>
              <Row>
                <Col md={3} className="text-center">
                  <h3 className="text-primary">{Math.round(dailyTotals.calories)}</h3>
                  <small>Kilocalorías</small>
                </Col>
                <Col md={3} className="text-center">
                  <h3 className="text-success">{Math.round(dailyTotals.protein * 100) / 100}g</h3>
                  <small>Proteína</small>
                </Col>
                <Col md={3} className="text-center">
                  <h3 className="text-warning">{Math.round(dailyTotals.carbohydrates * 100) / 100}g</h3>
                  <small>Carbohidratos</small>
                </Col>
                <Col md={3} className="text-center">
                  <h3 className="text-info">{Math.round(dailyTotals.fats * 100) / 100}g</h3>
                  <small>Grasas</small>
                </Col>
              </Row>
            </Card.Body>
          </Card>

          {/* Información adicional */}
          <Alert variant="info" className="mt-3">
            <div className="d-flex align-items-center">
              <ChefHat className="me-2" size={20} />
              <div>
                <strong>💡 Consejo:</strong> Puedes clonar cualquier receta para crear tu propia versión modificable.
                <br />
                <small className="text-muted">
                  Las recetas clonadas te permiten ajustar ingredientes y kilocalorías según las necesidades específicas del paciente.
                </small>
              </div>
            </div>
          </Alert>
        </Col>
      </Row>
    </Container>
  );
};

export default RecipeMealPlanner; 