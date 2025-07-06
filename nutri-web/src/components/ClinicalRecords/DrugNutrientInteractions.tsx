import React, { useState } from 'react';
import { 
  Card, 
  Form, 
  Button, 
  Modal, 
  Badge,
  Container, 
  Row, 
  Col,
  Alert,
  ListGroup
} from 'react-bootstrap';
import { Plus, Edit2, Trash2, AlertTriangle, Pill, Clock } from 'lucide-react';
import { clinicalRecordsService } from '../../services/clinicalRecordsService';

// Interfaces para medicamentos
interface Medication {
  id: string;
  name: string;
  generic_name?: string;
  dosage?: string;
  frequency?: string;
}

// Interfaces para interacciones fármaco-nutriente
interface DrugNutrientInteraction {
  id: string;
  medication: Medication;
  nutrients_affected: string[];
  interaction_type: 'absorption' | 'metabolism' | 'excretion' | 'antagonism';
  severity: 'low' | 'moderate' | 'high' | 'critical';
  description: string;
  recommendations: string[];
  timing_considerations?: string;
  foods_to_avoid?: string[];
  foods_to_increase?: string[];
  monitoring_required?: boolean;
  created_date: Date;
  updated_date: Date;
}

interface DrugNutrientInteractionsProps {
  recordId: string;
  interactions: DrugNutrientInteraction[];
  medications: Medication[];
  onInteractionsChange: () => void;
  canEdit?: boolean;
}

const DrugNutrientInteractions: React.FC<DrugNutrientInteractionsProps> = ({
  recordId,
  interactions,
  medications,
  onInteractionsChange,
  canEdit = true
}) => {
  const [showModal, setShowModal] = useState(false);
  const [editingInteraction, setEditingInteraction] = useState<DrugNutrientInteraction | null>(null);
  const [loading, setLoading] = useState(false);
  
  // Estados del formulario
  const [selectedMedication, setSelectedMedication] = useState<Medication | null>(null);
  const [nutrientsAffected, setNutrientsAffected] = useState<string[]>([]);
  const [interactionType, setInteractionType] = useState<string>('');
  const [severity, setSeverity] = useState<string>('');
  const [description, setDescription] = useState('');
  const [recommendations, setRecommendations] = useState<string[]>(['']);
  const [timingConsiderations, setTimingConsiderations] = useState('');
  const [foodsToAvoidText, setFoodsToAvoidText] = useState<string>('');
  const [foodsToIncreaseText, setFoodsToIncreaseText] = useState<string>('');
  const [monitoringRequired, setMonitoringRequired] = useState(false);

  // Opciones para los campos select
  const interactionTypes = [
    { value: 'absorption', label: 'Absorción' },
    { value: 'metabolism', label: 'Metabolismo' },
    { value: 'excretion', label: 'Excreción' },
    { value: 'antagonism', label: 'Antagonismo' }
  ];

  const severityLevels = [
    { value: 'low', label: 'Baja' },
    { value: 'moderate', label: 'Moderada' },
    { value: 'high', label: 'Alta' },
    { value: 'critical', label: 'Crítica' }
  ];

  const commonNutrients = [
    'Vitamina D', 'Vitamina B12', 'Hierro', 'Calcio', 'Magnesio', 
    'Zinc', 'Folato', 'Vitamina K', 'Proteínas', 'Carbohidratos'
  ];

  const resetForm = () => {
    setSelectedMedication(null);
    setNutrientsAffected([]);
    setInteractionType('');
    setSeverity('');
    setDescription('');
    setRecommendations(['']);
    setTimingConsiderations('');
    setFoodsToAvoidText('');
    setFoodsToIncreaseText('');
    setMonitoringRequired(false);
  };

  const handleSave = async () => {
    // Si no hay medicamentos disponibles, permitir crear interacción sin medicamento específico
    if (medications.length === 0) {
      // Permitir continuar sin medicamento específico
      console.log('No hay medicamentos previos, creando interacción genérica');
    } else if (!selectedMedication) {
      alert('Por favor selecciona un medicamento');
      return;
    }
    
    // Validar campos obligatorios según el contexto
    const requiredFields = [];
    if (medications.length > 0 && !selectedMedication) {
      requiredFields.push('medicamento');
    }
    if (medications.length > 0 && !interactionType) {
      requiredFields.push('tipo de interacción');
    }
    if (!severity) {
      requiredFields.push('severidad');
    }
    if (!description) {
      requiredFields.push('descripción');
    }
    
    if (requiredFields.length > 0) {
      alert(`Por favor completa los siguientes campos: ${requiredFields.join(', ')}`);
      return;
    }

    setLoading(true);
    try {
      // Convertir texto a arrays para enviar al backend
      const foodsToAvoidArray = foodsToAvoidText
        ? foodsToAvoidText.split(',').map(s => s.trim()).filter(Boolean)
        : [];
      const foodsToIncreaseArray = foodsToIncreaseText
        ? foodsToIncreaseText.split(',').map(s => s.trim()).filter(Boolean)
        : [];

      const interactionData = {
        medicationId: selectedMedication?.id || (medications.length === 0 ? 'generic' : ''),
        nutrientsAffected: nutrientsAffected,
        interactionType: (medications.length > 0 ? interactionType : 'absorption') as 'absorption' | 'metabolism' | 'excretion' | 'antagonism',
        severity: severity as 'low' | 'moderate' | 'high' | 'critical',
        description: description,
        recommendations: recommendations.filter(r => r.trim() !== ''),
        timingConsiderations: timingConsiderations || undefined,
        foodsToAvoid: foodsToAvoidArray.length > 0 ? foodsToAvoidArray : undefined,
        foodsToIncrease: foodsToIncreaseArray.length > 0 ? foodsToIncreaseArray : undefined,
        monitoringRequired: monitoringRequired
      };

      if (editingInteraction) {
        // Actualizar interacción existente
        await clinicalRecordsService.updateDrugNutrientInteraction(
          recordId,
          editingInteraction.id,
          interactionData
        );
        console.log('✅ Interacción actualizada exitosamente');
      } else {
        // Crear nueva interacción
        await clinicalRecordsService.addDrugNutrientInteraction(recordId, interactionData);
        console.log('✅ Nueva interacción creada exitosamente');
      }

      setShowModal(false);
      resetForm();
      setEditingInteraction(null);
      onInteractionsChange();
    } catch (error: any) {
      console.error('❌ Error al guardar interacción:', error);
      alert(error.message || 'Error al guardar la interacción');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (interactionId: string) => {
    if (!window.confirm('¿Estás seguro de que quieres eliminar esta interacción?')) {
      return;
    }

    setLoading(true);
    try {
      await clinicalRecordsService.deleteDrugNutrientInteraction(recordId, interactionId);
      console.log('✅ Interacción eliminada exitosamente');
      onInteractionsChange();
    } catch (error: any) {
      console.error('❌ Error al eliminar interacción:', error);
      alert(error.message || 'Error al eliminar la interacción');
    } finally {
      setLoading(false);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'low': return 'success';
      case 'moderate': return 'warning';
      case 'high': return 'danger';
      case 'critical': return 'dark';
      default: return 'secondary';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'low': return '🟢';
      case 'moderate': return '🟡';
      case 'high': return '🟠';
      case 'critical': return '🔴';
      default: return '⚪';
    }
  };

  const addRecommendation = () => {
    setRecommendations([...recommendations, '']);
  };

  const updateRecommendation = (index: number, value: string) => {
    const updated = [...recommendations];
    updated[index] = value;
    setRecommendations(updated);
  };

  const removeRecommendation = (index: number) => {
    setRecommendations(recommendations.filter((_, i) => i !== index));
  };

  const handleEdit = (interaction: DrugNutrientInteraction) => {
    setEditingInteraction(interaction);
    setSelectedMedication(interaction.medication);
    setNutrientsAffected(interaction.nutrients_affected);
    setInteractionType(interaction.interaction_type);
    setSeverity(interaction.severity);
    setDescription(interaction.description);
    setRecommendations(interaction.recommendations);
    setTimingConsiderations(interaction.timing_considerations || '');
    setFoodsToAvoidText((interaction.foods_to_avoid || []).join(', '));
    setFoodsToIncreaseText((interaction.foods_to_increase || []).join(', '));
    setMonitoringRequired(interaction.monitoring_required || false);
    setShowModal(true);
  };

  return (
    <Container>
      <Row className="mb-4">
        <Col>
          <div className="d-flex justify-content-between align-items-center">
            <h4>
              <Pill className="me-2" size={24} />
              Interacciones Fármaco-Nutriente
            </h4>
            {canEdit && (
              <Button 
                variant="primary" 
                onClick={() => setShowModal(true)}
                disabled={loading}
              >
                <Plus size={16} className="me-1" />
                Agregar Interacción
              </Button>
            )}
          </div>
        </Col>
      </Row>

      {/* Lista de interacciones */}
      <Row>
        <Col>
          {interactions.length === 0 ? (
            <Alert variant="info">
              <AlertTriangle size={16} className="me-2" />
              No se han registrado interacciones fármaco-nutriente.
            </Alert>
          ) : (
            <div className="interactions-list">
              {interactions.map((interaction) => (
                <Card key={interaction.id} className="mb-3 shadow-sm">
                  <Card.Header className="d-flex justify-content-between align-items-center">
                    <div>
                      <strong>{interaction.medication.name}</strong>
                      {interaction.medication.generic_name && (
                        <small className="text-muted ms-2">({interaction.medication.generic_name})</small>
                      )}
                    </div>
                    <div className="d-flex align-items-center gap-2">
                      <Badge bg={getSeverityColor(interaction.severity)}>
                        {getSeverityIcon(interaction.severity)} {interaction.severity.toUpperCase()}
                      </Badge>
                      {canEdit && (
                        <div>
                          <Button 
                            variant="outline-primary" 
                            size="sm" 
                            className="me-1"
                            onClick={() => handleEdit(interaction)}
                          >
                            <Edit2 size={14} />
                          </Button>
                          <Button 
                            variant="outline-danger" 
                            size="sm"
                            onClick={() => handleDelete(interaction.id)}
                          >
                            <Trash2 size={14} />
                          </Button>
                        </div>
                      )}
                    </div>
                  </Card.Header>
                  <Card.Body>
                    <Row>
                      <Col md={6}>
                        <h6>Nutrientes Afectados:</h6>
                        <div className="mb-2">
                          {interaction.nutrients_affected.map((nutrient, index) => (
                            <Badge key={index} bg="light" text="dark" className="me-1">
                              {nutrient}
                            </Badge>
                          ))}
                        </div>
                        
                        <h6>Tipo de Interacción:</h6>
                        <p className="text-capitalize">{interaction.interaction_type}</p>
                        
                        <h6>Descripción:</h6>
                        <p>{interaction.description}</p>
                      </Col>
                      <Col md={6}>
                        <h6>Recomendaciones:</h6>
                        <ListGroup variant="flush">
                          {interaction.recommendations.map((rec, index) => (
                            <ListGroup.Item key={index} className="px-0">
                              • {rec}
                            </ListGroup.Item>
                          ))}
                        </ListGroup>
                        
                        {interaction.timing_considerations && (
                          <>
                            <h6 className="mt-3">
                              <Clock size={16} className="me-1" />
                              Consideraciones de Tiempo:
                            </h6>
                            <p>{interaction.timing_considerations}</p>
                          </>
                        )}
                      </Col>
                    </Row>
                    
                    {(interaction.foods_to_avoid && interaction.foods_to_avoid.length > 0) && (
                      <Row className="mt-2">
                        <Col>
                          <h6>Alimentos a Evitar:</h6>
                          <div>
                            {interaction.foods_to_avoid.map((food, index) => (
                              <Badge key={index} bg="danger" className="me-1">
                                {food}
                              </Badge>
                            ))}
                          </div>
                        </Col>
                      </Row>
                    )}
                    
                    {(interaction.foods_to_increase && interaction.foods_to_increase.length > 0) && (
                      <Row className="mt-2">
                        <Col>
                          <h6>Alimentos a Aumentar:</h6>
                          <div>
                            {interaction.foods_to_increase.map((food, index) => (
                              <Badge key={index} bg="success" className="me-1">
                                {food}
                              </Badge>
                            ))}
                          </div>
                        </Col>
                      </Row>
                    )}
                  </Card.Body>
                </Card>
              ))}
            </div>
          )}
        </Col>
      </Row>

      {/* Modal para agregar/editar interacción */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            {editingInteraction ? 'Editar Interacción' : 'Nueva Interacción Fármaco-Nutriente'}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {medications.length === 0 && (
            <Alert variant="info" className="mb-3">
              <AlertTriangle size={16} className="me-2" />
              <strong>Información:</strong> No hay medicamentos previos registrados en este expediente. 
              Puedes crear interacciones fármaco-nutriente genéricas que se aplicarán cuando se agreguen 
              medicamentos específicos al expediente.
            </Alert>
          )}
          <Form>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>
                    Medicamento {medications.length > 0 ? '*' : '(Opcional)'}
                  </Form.Label>
                  <Form.Select 
                    value={selectedMedication?.id || ''}
                    onChange={(e) => {
                      const med = medications.find(m => m.id === e.target.value);
                      setSelectedMedication(med || null);
                    }}
                    disabled={medications.length === 0}
                  >
                    <option value="">
                      {medications.length > 0 ? 'Seleccionar medicamento...' : 'Interacción genérica (sin medicamento específico)'}
                    </option>
                    {medications.map(med => (
                      <option key={med.id} value={med.id}>
                        {med.name} {med.generic_name ? `(${med.generic_name})` : ''}
                      </option>
                    ))}
                  </Form.Select>
                  {medications.length === 0 && (
                    <Form.Text className="text-info">
                      Se creará una interacción genérica que se aplicará cuando se agreguen medicamentos específicos.
                    </Form.Text>
                  )}
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>
                    Tipo de Interacción {medications.length > 0 ? '*' : '(Opcional)'}
                  </Form.Label>
                  <Form.Select 
                    value={interactionType}
                    onChange={(e) => setInteractionType(e.target.value)}
                    disabled={medications.length === 0}
                  >
                    <option value="">
                      {medications.length > 0 ? 'Seleccionar tipo...' : 'Tipo de interacción genérica'}
                    </option>
                    {interactionTypes.map(type => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </Form.Select>
                  {medications.length === 0 && (
                    <Form.Text className="text-info">
                      Para interacciones genéricas, el tipo se determinará cuando se agreguen medicamentos específicos.
                    </Form.Text>
                  )}
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Nutrientes Afectados</Form.Label>
                  <div>
                    {commonNutrients.map(nutrient => (
                      <Form.Check
                        key={nutrient}
                        inline
                        type="checkbox"
                        id={`nutrient-${nutrient}`}
                        label={nutrient}
                        checked={nutrientsAffected.includes(nutrient)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setNutrientsAffected([...nutrientsAffected, nutrient]);
                          } else {
                            setNutrientsAffected(nutrientsAffected.filter(n => n !== nutrient));
                          }
                        }}
                      />
                    ))}
                  </div>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Severidad *</Form.Label>
                  <Form.Select 
                    value={severity}
                    onChange={(e) => setSeverity(e.target.value)}
                  >
                    <option value="">Seleccionar severidad...</option>
                    {severityLevels.map(level => (
                      <option key={level.value} value={level.value}>
                        {level.label}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label>Descripción *</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe la interacción fármaco-nutriente..."
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Recomendaciones</Form.Label>
              {recommendations.map((recommendation, index) => (
                <div key={index} className="d-flex mb-2">
                  <Form.Control
                    value={recommendation}
                    onChange={(e) => updateRecommendation(index, e.target.value)}
                    placeholder={`Recomendación ${index + 1}`}
                  />
                  <Button
                    variant="outline-danger"
                    size="sm"
                    className="ms-2"
                    onClick={() => removeRecommendation(index)}
                    disabled={recommendations.length <= 1}
                  >
                    <Trash2 size={14} />
                  </Button>
                </div>
              ))}
              <Button variant="outline-primary" size="sm" onClick={addRecommendation}>
                <Plus size={14} className="me-1" />
                Agregar Recomendación
              </Button>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Consideraciones de Tiempo</Form.Label>
              <Form.Control
                as="textarea"
                rows={2}
                value={timingConsiderations}
                onChange={(e) => setTimingConsiderations(e.target.value)}
                placeholder="Horarios o consideraciones especiales..."
              />
            </Form.Group>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Alimentos a Evitar</Form.Label>
                  <Form.Control
                    value={foodsToAvoidText}
                    onChange={(e) => setFoodsToAvoidText(e.target.value)}
                    placeholder="Separar con comas..."
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Alimentos a Aumentar</Form.Label>
                  <Form.Control
                    value={foodsToIncreaseText}
                    onChange={(e) => setFoodsToIncreaseText(e.target.value)}
                    placeholder="Separar con comas..."
                  />
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Check
                type="checkbox"
                id="monitoring-required"
                label="Requiere monitoreo especial"
                checked={monitoringRequired}
                onChange={(e) => setMonitoringRequired(e.target.checked)}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Cancelar
          </Button>
          <Button 
            variant="primary" 
            onClick={handleSave} 
            disabled={loading}
          >
            {loading ? 'Guardando...' : (editingInteraction ? 'Actualizar' : 'Guardar')}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default DrugNutrientInteractions; 