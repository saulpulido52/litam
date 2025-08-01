// nutri-web/src/components/ClinicalRecords/OptimizedClinicalForm.tsx
import React, { useState, useMemo, useCallback } from 'react';
import { Card, Button, Row, Col, ProgressBar, Form} from 'react-bootstrap';
import { MdAdd, MdEdit, MdNavigateNext, MdNavigateBefore, MdSave } from 'react-icons/md';
import type { ClinicalRecord, CreateClinicalRecordDto, UpdateClinicalRecordDto } from '../../types/clinical-record';
import { useLoadingState } from '../../utils/optimizationUtils';

interface OptimizedClinicalFormProps {
  record?: ClinicalRecord;
  patientId: string;
  patientName: string;
  onSubmit: (data: CreateClinicalRecordDto | UpdateClinicalRecordDto) => void;
  onCancel: () => void;
  loading?: boolean;
}

// **OPTIMIZACIÓN**: Componente separado para información básica
const BasicInfoStep = React.memo(({
  formData,
  onChange,
  errors}: {
  formData: any;
  onChange: (field: string, value: any) => void;
  errors: Record<string, string>;
}) => (
  <Card className="mb-4">
    <Card.Header>
      <h5 className="mb-0">Información Básica</h5>
    </Card.Header>
    <Card.Body>
      <Row className="g-3">
        <Col md={6}>
          <Form.Group>
            <Form.Label>Fecha del Registro</Form.Label>
            <Form.Control
              type="date"
              value={formData.recordDate}
              onChange={(e) => onChange('recordDate', e.target.value)}
              isInvalid={!!errors.recordDate}
            />
            <Form.Control.Feedback type="invalid">
              {errors.recordDate}
            </Form.Control.Feedback>
          </Form.Group>
        </Col>
        
        <Col md={6}>
          <Form.Group>
            <Form.Label>Número de Expediente</Form.Label>
            <Form.Control
              type="text"
              value={formData.expedientNumber}
              onChange={(e) => onChange('expedientNumber', e.target.value)}
              placeholder="Ej: EXP-2024-001"
              isInvalid={!!errors.expedientNumber}
            />
            <Form.Control.Feedback type="invalid">
              {errors.expedientNumber}
            </Form.Control.Feedback>
          </Form.Group>
        </Col>
        
        <Col md={12}>
          <Form.Group>
            <Form.Label>Motivo de Consulta</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              value={formData.consultationReason}
              onChange={(e) => onChange('consultationReason', e.target.value)}
              placeholder="Describa el motivo de la consulta..."
              isInvalid={!!errors.consultationReason}
            />
            <Form.Control.Feedback type="invalid">
              {errors.consultationReason}
            </Form.Control.Feedback>
          </Form.Group>
        </Col>
      </Row>
    </Card.Body>
  </Card>
));

// **OPTIMIZACIÓN**: Componente separado para problemas actuales
const CurrentProblemsStep = React.memo(({
  formData,
  onChange}: {
  formData: any;
  onChange: (field: string, value: any) => void;
}) => {
  const problems = useMemo(() => [
    { key: 'diarrhea', label: 'Diarrea' },
    { key: 'constipation', label: 'Estreñimiento' },
    { key: 'gastritis', label: 'Gastritis' },
    { key: 'ulcer', label: 'Úlcera' },
    { key: 'nausea', label: 'Náuseas' },
    { key: 'pyrosis', label: 'Pirosis' },
    { key: 'vomiting', label: 'Vómito' },
    { key: 'colitis', label: 'Colitis' },
  ], []);

  const handleProblemChange = useCallback((problemKey: string, checked: boolean) => {
    onChange(`currentProblems.${problemKey}`, checked);
  }, [onChange]);

  return (
    <Card className="mb-4">
      <Card.Header>
        <h5 className="mb-0">Problemas Actuales</h5>
      </Card.Header>
      <Card.Body>
        <Row className="g-3">
          {problems.map(({ key, label }) => (
            <Col md={3} key={key}>
              <Form.Check
                type="checkbox"
                id={`problem-${key}`}
                label={label}
                checked={formData.currentProblems[key]}
                onChange={(e) => handleProblemChange(key, e.target.checked)}
              />
            </Col>
          ))}
          
          <Col md={6}>
            <Form.Group>
              <Form.Label>Mecánica de la Boca</Form.Label>
              <Form.Control
                type="text"
                value={formData.currentProblems.mouth_mechanics}
                onChange={(e) => onChange('currentProblems.mouth_mechanics', e.target.value)}
                placeholder="Descripción..."
              />
            </Form.Group>
          </Col>
          
          <Col md={6}>
            <Form.Group>
              <Form.Label>Otros Problemas</Form.Label>
              <Form.Control
                type="text"
                value={formData.currentProblems.other_problems}
                onChange={(e) => onChange('currentProblems.other_problems', e.target.value)}
                placeholder="Otros problemas..."
              />
            </Form.Group>
          </Col>
          
          <Col md={12}>
            <Form.Group>
              <Form.Label>Observaciones</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={formData.currentProblems.observations}
                onChange={(e) => onChange('currentProblems.observations', e.target.value)}
                placeholder="Observaciones adicionales..."
              />
            </Form.Group>
          </Col>
        </Row>
      </Card.Body>
    </Card>
  );
});

// **OPTIMIZACIÓN**: Componente separado para mediciones antropométricas
const AnthropometricStep = React.memo(({
  formData,
  onChange,
  errors}: {
  formData: any;
  onChange: (field: string, value: any) => void;
  errors: Record<string, string>;
}) => (
  <Card className="mb-4">
    <Card.Header>
      <h5 className="mb-0">Mediciones Antropométricas</h5>
    </Card.Header>
    <Card.Body>
      <Row className="g-3">
        <Col md={4}>
          <Form.Group>
            <Form.Label>Peso Actual (kg)</Form.Label>
            <Form.Control
              type="number"
              step="0.1"
              value={formData.anthropometricMeasurements.currentWeightKg}
              onChange={(e) => onChange('anthropometricMeasurements.currentWeightKg', e.target.value)}
              isInvalid={!!errors['anthropometricMeasurements.currentWeightKg']}
            />
            <Form.Control.Feedback type="invalid">
              {errors['anthropometricMeasurements.currentWeightKg']}
            </Form.Control.Feedback>
          </Form.Group>
        </Col>
        
        <Col md={4}>
          <Form.Group>
            <Form.Label>Peso Habitual (kg)</Form.Label>
            <Form.Control
              type="number"
              step="0.1"
              value={formData.anthropometricMeasurements.habitualWeightKg}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChange('anthropometricMeasurements.habitualWeightKg', e.target.value)}
            />
          </Form.Group>
        </Col>
        
        <Col md={4}>
          <Form.Group>
            <Form.Label>Altura (m)</Form.Label>
            <Form.Control
              type="number"
              step="0.01"
              value={formData.anthropometricMeasurements.heightM}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChange('anthropometricMeasurements.heightM', e.target.value)}
              isInvalid={!!errors['anthropometricMeasurements.heightM']}
            />
            <Form.Control.Feedback type="invalid">
              {errors['anthropometricMeasurements.heightM']}
            </Form.Control.Feedback>
          </Form.Group>
        </Col>
        
        <Col md={6}>
          <Form.Group>
            <Form.Label>Circunferencia de Cintura (cm)</Form.Label>
            <Form.Control
              type="number"
              step="0.1"
              value={formData.anthropometricMeasurements.waistCircCm}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChange('anthropometricMeasurements.waistCircCm', e.target.value)}
            />
          </Form.Group>
        </Col>
        
        <Col md={6}>
          <Form.Group>
            <Form.Label>Circunferencia de Cadera (cm)</Form.Label>
            <Form.Control
              type="number"
              step="0.1"
              value={formData.anthropometricMeasurements.hipCircCm}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChange('anthropometricMeasurements.hipCircCm', e.target.value)}
            />
          </Form.Group>
        </Col>
      </Row>
    </Card.Body>
  </Card>
));

// **OPTIMIZACIÓN**: Navegación de pasos optimizada
const StepNavigation = React.memo(({
  currentStep,
  totalSteps,
  onNext,
  onPrev,
  onSubmit,
  canGoNext,
  loading}: {
  currentStep: number;
  totalSteps: number;
  onNext: () => void;
  onPrev: () => void;
  onSubmit: () => void;
  canGoNext: boolean;
  loading: boolean;
}) => {
  const isLastStep = currentStep === totalSteps;
  const isFirstStep = currentStep === 1;

  return (
    <div className="d-flex justify-content-between align-items-center">
      <Button
        variant="outline-secondary"
        onClick={onPrev}
        disabled={isFirstStep || loading}
        className="d-flex align-items-center"
      >
        <MdNavigateBefore className="me-1" />
        Anterior
      </Button>
      
      <div className="text-center">
        <small className="text-muted">
          Paso {currentStep} de {totalSteps}
        </small>
      </div>
      
      {isLastStep ? (
        <Button
          variant="success"
          onClick={onSubmit}
          disabled={!canGoNext || loading}
          className="d-flex align-items-center"
        >
          <MdSave className="me-1" />
          {loading ? 'Guardando...' : 'Guardar'}
        </Button>
      ) : (
        <Button
          variant="primary"
          onClick={onNext}
          disabled={!canGoNext || loading}
          className="d-flex align-items-center"
        >
          Siguiente
          <MdNavigateNext className="ms-1" />
        </Button>
      )}
    </div>
  );
});

// **OPTIMIZACIÓN**: Componente principal optimizado
const OptimizedClinicalForm: React.FC<OptimizedClinicalFormProps> = ({
  record,
  patientId,
  patientName,
  onSubmit,
  onCancel,
  loading = false}) => {
  const isEditing = !!record;
  const [currentStep, setCurrentStep] = useState(1);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const { setLoading, isLoading } = useLoadingState();

  // **OPTIMIZACIÓN**: Estado inicial memoizado
  const [formData, setFormData] = useState(() => ({
    recordDate: record?.record_date?.split('T')[0] || new Date().toISOString().split('T')[0],
    expedientNumber: record?.expedient_number || '',
    consultationReason: record?.consultation_reason || '',
    
    currentProblems: {
      diarrhea: record?.current_problems?.diarrhea || false,
      constipation: record?.current_problems?.constipation || false,
      gastritis: record?.current_problems?.gastritis || false,
      ulcer: record?.current_problems?.ulcer || false,
      nausea: record?.current_problems?.nausea || false,
      pyrosis: record?.current_problems?.pyrosis || false,
      vomiting: record?.current_problems?.vomiting || false,
      colitis: record?.current_problems?.colitis || false,
      mouth_mechanics: record?.current_problems?.mouth_mechanics || '',
      other_problems: record?.current_problems?.other_problems || '',
      observations: record?.current_problems?.observations || ''},

    anthropometricMeasurements: {
      currentWeightKg: record?.anthropometric_measurements?.current_weight_kg || '',
      habitualWeightKg: record?.anthropometric_measurements?.habitual_weight_kg || '',
      heightM: record?.anthropometric_measurements?.height_m || '',
      waistCircCm: record?.anthropometric_measurements?.waist_circ_cm || '',
      hipCircCm: record?.anthropometric_measurements?.hip_circ_cm || ''}}));

  // **OPTIMIZACIÓN**: Handler de cambios optimizado
  const handleFieldChange = useCallback((field: string, value: any) => {
    setFormData(prev => {
      const keys = field.split('.');
      if (keys.length === 1) {
        return { ...prev, [field]: value };
      }
      
      // Nested object update
      const newData = { ...prev };
      let current: any = newData;
      for (let i = 0; i < keys.length - 1; i++) {
        current[keys[i]] = { ...current[keys[i]] };
        current = current[keys[i]];
      }
      current[keys[keys.length - 1]] = value;
      return newData;
    });

    // Limpiar error de validación si existe
    if (validationErrors[field]) {
      setValidationErrors(prev => ({ ...prev, [field]: '' }));
    }
  }, [validationErrors]);

  // **OPTIMIZACIÓN**: Validación por pasos
  const validateCurrentStep = useCallback(() => {
    const errors: Record<string, string> = {};

    switch (currentStep) {
      case 1: // Información básica
        if (!formData.recordDate) {
          errors.recordDate = 'La fecha es requerida';
        }
        if (!formData.consultationReason.trim()) {
          errors.consultationReason = 'El motivo de consulta es requerido';
        }
        break;
      
      case 3: // Mediciones antropométricas
        if (!formData.anthropometricMeasurements.currentWeightKg) {
          errors['anthropometricMeasurements.currentWeightKg'] = 'El peso actual es requerido';
        }
        if (!formData.anthropometricMeasurements.heightM) {
          errors['anthropometricMeasurements.heightM'] = 'La altura es requerida';
        }
        break;
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  }, [currentStep, formData]);

  // **OPTIMIZACIÓN**: Navegación optimizada
  const handleNext = useCallback(() => {
    if (validateCurrentStep()) {
      setCurrentStep(prev => prev + 1);
    }
  }, [validateCurrentStep]);

  const handlePrev = useCallback(() => {
    setCurrentStep(prev => prev - 1);
  }, []);

  const handleSubmit = useCallback(async () => {
    if (!validateCurrentStep()) return;

    try {
      setLoading('submit', true);
      
      // Transform form data to API format
      const submitData = {
        record_date: formData.recordDate,
        expedient_number: formData.expedientNumber,
        consultation_reason: formData.consultationReason,
        current_problems: formData.currentProblems,
        anthropometric_measurements: {
          current_weight_kg: Number(formData.anthropometricMeasurements.currentWeightKg),
          habitual_weight_kg: Number(formData.anthropometricMeasurements.habitualWeightKg) || null,
          height_m: Number(formData.anthropometricMeasurements.heightM),
          waist_circ_cm: Number(formData.anthropometricMeasurements.waistCircCm) || null,
          hip_circ_cm: Number(formData.anthropometricMeasurements.hipCircCm) || null},
        patient_user_id: patientId};

      await onSubmit(submitData as any);
    } catch (error) {
      console.error('Error submitting form:', error);
    } finally {
      setLoading('submit', false);
    }
  }, [validateCurrentStep, formData, patientId, onSubmit, setLoading]);

  // **OPTIMIZACIÓN**: Progreso memoizado
  const progress = useMemo(() => (currentStep / 4) * 100, [currentStep]);

  // **OPTIMIZACIÓN**: Renderizado condicional de pasos
  const renderCurrentStep = useMemo(() => {
    switch (currentStep) {
      case 1:
        return (
          <BasicInfoStep
            formData={formData}
            onChange={handleFieldChange}
            errors={validationErrors}
          />
        );
      case 2:
        return (
          <CurrentProblemsStep
            formData={formData}
            onChange={handleFieldChange}
          />
        );
      case 3:
        return (
          <AnthropometricStep
            formData={formData}
            onChange={handleFieldChange}
            errors={validationErrors}
          />
        );
      default:
        return null;
    }
  }, [currentStep, formData, handleFieldChange, validationErrors]);

  return (
    <div className="clinical-form">
      {/* Header */}
      <div className="mb-4">
        <h3 className="mb-2">
          {isEditing ? <MdEdit className="me-2" /> : <MdAdd className="me-2" />}
          {isEditing ? 'Editar' : 'Nuevo'} Expediente Clínico
        </h3>
        <p className="text-muted mb-3">
          Paciente: <strong>{patientName}</strong>
        </p>
        
        {/* Progress Bar */}
        <div className="mb-3">
          <div className="d-flex justify-content-between align-items-center mb-2">
            <small className="text-muted">Progreso del formulario</small>
            <small className="text-muted">{Math.round(progress)}%</small>
          </div>
          <ProgressBar now={progress} variant="primary" />
        </div>
      </div>

      {/* Form Steps */}
      {renderCurrentStep}

      {/* Navigation */}
      <Card>
        <Card.Body>
          <StepNavigation
            currentStep={currentStep}
            totalSteps={3}
            onNext={handleNext}
            onPrev={handlePrev}
            onSubmit={handleSubmit}
            canGoNext={true}
            loading={isLoading('submit') || loading}
          />
        </Card.Body>
      </Card>

      {/* Actions */}
      <div className="d-flex justify-content-end gap-2 mt-3">
        <Button variant="outline-secondary" onClick={onCancel}>
          Cancelar
        </Button>
      </div>
    </div>
  );
};

export default OptimizedClinicalForm; 