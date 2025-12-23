// nutri-web/src/components/RecipeBook/RecipeCard.tsx
import React from 'react';
import { Card, Button, Badge} from 'react-bootstrap';
import { Clock, Copy, Users, Eye } from 'lucide-react';
import type { Recipe } from '../../types/recipe';

interface RecipeCardProps {
  recipe: Recipe;
  onAction: (action: 'view' | 'edit' | 'delete' | 'clone', recipe: Recipe) => void;
  onSelect?: (recipe: Recipe) => void;
  showPatientTools?: boolean;
}

const RecipeCard: React.FC<RecipeCardProps> = ({
  recipe,
  onAction,
  onSelect,
  showPatientTools = false
}) => {
  const caloriesPerServing = recipe.totalCalories && recipe.servings 
    ? Math.round(recipe.totalCalories / recipe.servings)
    : 0;

  return (
    <Card className="h-100 recipe-card">
      {recipe.imageUrl && (
        <Card.Img 
          variant="top" 
          src={recipe.imageUrl} 
          style={{ height: '200px', objectFit: 'cover' }}
        />
      )}
      
      <Card.Body className="d-flex flex-column">
        <div className="mb-2">
          <h6 className="card-title mb-1">{recipe.title}</h6>
          {recipe.description && (
            <p className="card-text text-muted small mb-2">
              {recipe.description.substring(0, 100)}
              {recipe.description.length > 100 && '...'}
            </p>
          )}
        </div>

        {/* Info nutricional */}
        <div className="mb-2">
          <Badge bg="primary" className="me-1">
            🔥 {caloriesPerServing} kcal
          </Badge>
          {recipe.servings && (
            <Badge bg="secondary" className="me-1">
              <Users size={12} className="me-1" />
              {recipe.servings}
            </Badge>
          )}
          {recipe.prepTimeMinutes && (
            <Badge bg="info">
              <Clock size={12} className="me-1" />
              {recipe.prepTimeMinutes}min
            </Badge>
          )}
        </div>

        {/* Tags */}
        {recipe.tags && recipe.tags.length > 0 && (
          <div className="mb-2">
            {recipe.tags.slice(0, 3).map((tag, index) => (
              <Badge key={index} bg="light" text="dark" className="me-1 small">
                {tag}
              </Badge>
            ))}
            {recipe.tags.length > 3 && (
              <Badge bg="light" text="dark" className="small">
                +{recipe.tags.length - 3}
              </Badge>
            )}
          </div>
        )}

        {/* Acciones */}
        <div className="mt-auto d-flex gap-1">
          <Button
            variant="outline-primary"
            size="sm"
            onClick={() => onAction('view', recipe)}
          >
            <Eye size={14} />
          </Button>
          <Button
            variant="outline-info"
            size="sm"
            onClick={() => onAction('clone', recipe)}
            title="Clonar receta"
          >
            <Copy size={14} />
          </Button>
          <Button
            variant="outline-secondary"
            size="sm"
            onClick={() => onAction('edit', recipe)}
          >
            {/* <Edit size={14} /> */}
          </Button>
          <Button
            variant="outline-danger"
            size="sm"
            onClick={() => onAction('delete', recipe)}
          >
            {/* <Trash2 size={14} /> */}
          </Button>
          {onSelect && (
            <Button
              variant="success"
              size="sm"
              className="ms-auto"
              onClick={() => onSelect(recipe)}
            >
              {showPatientTools ? 'Usar' : 'Seleccionar'}
            </Button>
          )}
        </div>
      </Card.Body>
    </Card>
  );
};

export default RecipeCard; 