// nutri-web/src/components/RecipeBook/CalorieCalculator.tsx
import React from 'react';
import { Modal } from 'react-bootstrap';

interface CalorieCalculatorProps {
  isOpen: boolean;
  onClose: () => void;
}

const CalorieCalculator: React.FC<CalorieCalculatorProps> = ({
  isOpen,
  onClose
}) => {
  return (
    <Modal show={isOpen} onHide={onClose} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>Calculadora Nutricional</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p>Componente en desarrollo - Calculadora de calorías</p>
      </Modal.Body>
    </Modal>
  );
};

export default CalorieCalculator; 