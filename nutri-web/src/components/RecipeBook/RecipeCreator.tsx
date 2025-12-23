// nutri-web/src/components/RecipeBook/RecipeCreator.tsx
import React from 'react';
import { Modal } from 'react-bootstrap';
import type { Recipe } from '../../types/recipe';

interface RecipeCreatorProps {
  isOpen: boolean;
  onClose: () => void;
  editRecipe?: Recipe | null;
}

const RecipeCreator: React.FC<RecipeCreatorProps> = ({
  isOpen,
  onClose,
  editRecipe
}) => {
  return (
    <Modal show={isOpen} onHide={onClose} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>
          {editRecipe ? 'Editar Receta' : 'Nueva Receta'}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p>Componente en desarrollo - Formulario de creación de recetas</p>
      </Modal.Body>
    </Modal>
  );
};

export default RecipeCreator; 