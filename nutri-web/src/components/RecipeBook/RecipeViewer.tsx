// nutri-web/src/components/RecipeBook/RecipeViewer.tsx
import React from 'react';
import { Modal, Button, Row, Col, Card, Badge } from 'react-bootstrap';
import { Edit, Clock, Utensils, ShoppingCart, Users } from 'lucide-react';
import type { Recipe } from '../../types/recipe';

interface RecipeViewerProps {
  recipe: Recipe;
  isOpen: boolean;
  onClose: () => void;
  onEdit: () => void;
}

const RecipeViewer: React.FC<RecipeViewerProps> = ({
  recipe,
  isOpen,
  onClose,
  onEdit
}) => {
  // Calcular información nutricional total
  const calculateTotalNutrition = () => {
    if (!recipe.ingredients || recipe.ingredients.length === 0) {
      return { calories: 0, protein: 0, carbs: 0, fats: 0 };
    }

    return recipe.ingredients.reduce((totals, ingredient) => {
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

  const nutrition = calculateTotalNutrition();
  const caloriesPerServing = recipe.servings > 0 ? Math.round(nutrition.calories / recipe.servings) : 0;

  return (
    <Modal show={isOpen} onHide={onClose} size="xl">
      <Modal.Header closeButton>
        <Modal.Title className="d-flex align-items-center">
          <Utensils className="me-2" size={24} />
          {recipe.title}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {/* Información básica */}
        <Row className="mb-4">
          <Col md={8}>
            <h5>📝 Descripción</h5>
            <p className="text-muted">{recipe.description || 'Sin descripción'}</p>
          </Col>
          <Col md={4}>
            <Card className="bg-light">
              <Card.Body className="text-center">
                <div className="mb-2">
                  <Users className="me-1" size={16} />
                  <strong>{recipe.servings} porcion{recipe.servings !== 1 ? 'es' : ''}</strong>
                </div>
                <div className="mb-2">
                  <Clock className="me-1" size={16} />
                  <small>
                    Prep: {recipe.prepTimeMinutes || 0}min | 
                    Cocción: {recipe.cookTimeMinutes || 0}min
                  </small>
                </div>
                <div>
                  <Badge bg="primary">{caloriesPerServing} kcal/porción</Badge>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Información nutricional */}
        <div className="bg-light p-3 rounded mb-4">
          <h6>📊 Información Nutricional Total</h6>
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
              Por porción: ~{caloriesPerServing} kcal | 
              Proteína: {Math.round(nutrition.protein / recipe.servings * 10) / 10}g | 
              Carbohidratos: {Math.round(nutrition.carbs / recipe.servings * 10) / 10}g | 
              Grasas: {Math.round(nutrition.fats / recipe.servings * 10) / 10}g
            </small>
          </div>
        </div>

        {/* Lista de ingredientes */}
        <div className="mb-4">
          <h6 className="d-flex align-items-center">
            <ShoppingCart className="me-2" size={18} />
            🛒 Ingredientes ({recipe.ingredients?.length || 0})
          </h6>
          {recipe.ingredients && recipe.ingredients.length > 0 ? (
            <div className="row">
              {recipe.ingredients.map((ingredient, index) => (
                <div key={index} className="col-md-6 mb-2">
                  <div className="d-flex justify-content-between align-items-center p-2 border rounded">
                    <div>
                      <strong>{ingredient.food_name || 'Alimento sin nombre'}</strong>
                      <div className="small text-muted">
                        {ingredient.category?.icon} {ingredient.category?.display_name}
                      </div>
                    </div>
                    <div className="text-end">
                      <div className="fw-bold">{ingredient.quantity}{ingredient.unit}</div>
                      <div className="small text-muted">
                        {Math.round((ingredient.calories_per_100g || 0) * (ingredient.quantity || 0) / 100)} kcal
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted">Sin ingredientes definidos</p>
          )}
        </div>

        {/* Instrucciones */}
        <div className="mb-3">
          <h6>👨‍🍳 Instrucciones de preparación</h6>
          <div className="bg-light p-3 rounded">
            {recipe.instructions ? (
              <div style={{ whiteSpace: 'pre-line' }}>{recipe.instructions}</div>
            ) : (
              <p className="text-muted mb-0">Sin instrucciones definidas</p>
            )}
          </div>
        </div>

        {/* Tags si existen */}
        {recipe.tags && recipe.tags.length > 0 && (
          <div className="mb-3">
            <h6>🏷️ Etiquetas</h6>
            <div>
              {recipe.tags.map((tag, index) => (
                <Badge key={index} bg="secondary" className="me-1 mb-1">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onClose}>
          Cerrar
        </Button>
        <Button variant="primary" onClick={onEdit}>
          <Edit size={16} className="me-1" />
          Editar Receta
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default RecipeViewer; 