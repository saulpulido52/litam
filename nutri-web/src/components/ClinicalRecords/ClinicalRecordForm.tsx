import React, { useState, useEffect } from 'react';
import type { ClinicalRecord, CreateClinicalRecordDto, UpdateClinicalRecordDto } from '../../types/clinical-record';
import { clinicalRecordsService } from '../../services/clinicalRecordsService';

interface ClinicalRecordFormProps {
  record?: ClinicalRecord;
  patientId: string;
  patientName: string;
  onSubmit: (data: CreateClinicalRecordDto | UpdateClinicalRecordDto) => void;
  onCancel: () => void;
  loading?: boolean;
}

const ClinicalRecordForm: React.FC<ClinicalRecordFormProps> = ({
  record,
  patientId,
  patientName,
  onSubmit,
  onCancel,
  loading = false,
}) => {
  const isEditing = !!record;
  
  // Estados para el flujo paso a paso
  const [currentStep, setCurrentStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  
  const [formData, setFormData] = useState({
    recordDate: record?.record_date?.split('T')[0] || new Date().toISOString().split('T')[0],
    expedientNumber: record?.expedient_number || '',
    consultationReason: record?.consultation_reason || '',
    
    // Problemas actuales
    currentProblems: {
      diarrhea: record?.current_problems?.diarrhea || false,
      constipation: record?.current_problems?.constipation || false,
      gastritis: record?.current_problems?.gastritis || false,
      ulcer: record?.current_problems?.ulcer || false,
      nausea: record?.current_problems?.nausea || false,
      pyrosis: record?.current_problems?.pyrosis || false,
      vomiting: record?.current_problems?.vomiting || false,
      colitis: record?.current_problems?.colitis || false,
      mouthMechanics: record?.current_problems?.mouthMechanics || '',
      otherProblems: record?.current_problems?.otherProblems || '',
      observations: record?.current_problems?.observations || '',
    },

    // Mediciones antropométricas
    anthropometricMeasurements: {
      currentWeightKg: record?.anthropometric_measurements?.current_weight_kg || '',
      habitualWeightKg: record?.anthropometric_measurements?.habitual_weight_kg || '',
      heightM: record?.anthropometric_measurements?.height_m || '',
      waistCircCm: record?.anthropometric_measurements?.waist_circ_cm || '',
      hipCircCm: record?.anthropometric_measurements?.hip_circ_cm || '',
    },

    // Presión arterial
    bloodPressure: {
      knowsBp: record?.blood_pressure?.knows_bp || false,
      habitualBp: record?.blood_pressure?.habitual_bp || '',
      systolic: record?.blood_pressure?.systolic || '',
      diastolic: record?.blood_pressure?.diastolic || '',
    },

    // Historia dietética
    dietaryHistory: {
      receivedNutritionalGuidance: record?.dietary_history?.received_nutritional_guidance || false,
      whenReceived: record?.dietary_history?.when_received || '',
      adherenceLevel: record?.dietary_history?.adherence_level || '',
      preferredFoods: record?.dietary_history?.preferred_foods?.join(', ') || '',
      dislikedFoods: record?.dietary_history?.disliked_foods?.join(', ') || '',
      malestarAlergiaFoods: record?.dietary_history?.malestar_alergia_foods?.join(', ') || '',
      takesSupplements: record?.dietary_history?.takes_supplements || false,
      supplementDetails: record?.dietary_history?.supplement_details || '',
    },

    // Diagnóstico y plan
    nutritionalDiagnosis: record?.nutritional_diagnosis || '',
    nutritionalPlanAndManagement: record?.nutritional_plan_and_management || '',
    evolutionAndFollowUpNotes: record?.evolution_and_follow_up_notes || '',
  });

  // Configuración de pasos
  const steps = [
    { id: 1, title: 'Datos Básicos', icon: 'fas fa-info-circle', required: true },
    { id: 2, title: 'Problemas Actuales', icon: 'fas fa-exclamation-triangle', required: false },
    { id: 3, title: 'Mediciones', icon: 'fas fa-ruler', required: false },
    { id: 4, title: 'Historia Dietética', icon: 'fas fa-utensils', required: false },
    { id: 5, title: 'Diagnóstico y Plan', icon: 'fas fa-stethoscope', required: true },
  ];

  // Validación por pasos
  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1: // Datos Básicos
        return !!(formData.recordDate && formData.consultationReason);
      case 2: // Problemas Actuales
        return true; // Opcional
      case 3: // Mediciones
        return true; // Opcional
      case 4: // Historia Dietética
        return true; // Opcional
      case 5: // Diagnóstico y Plan
        return !!(formData.nutritionalDiagnosis && formData.nutritionalPlanAndManagement);
      default:
        return false;
    }
  };

  // Marcar paso como completado
  const markStepAsCompleted = (step: number) => {
    if (validateStep(step) && !completedSteps.includes(step)) {
      setCompletedSteps(prev => [...prev, step]);
    }
  };

  // Navegación entre pasos
  const goToStep = (step: number) => {
    if (step >= 1 && step <= steps.length) {
      setCurrentStep(step);
    }
  };

  const nextStep = () => {
    if (currentStep < steps.length) {
      markStepAsCompleted(currentStep);
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  // Actualizar pasos completados cuando cambian los datos
  useEffect(() => {
    markStepAsCompleted(currentStep);
  }, [formData]);

  // Quitar campos editables para número de expediente y fecha
  // Calcular número de expediente automáticamente
  useEffect(() => {
    if (!isEditing && patientId) {
      // Lógica para obtener el número de expediente consecutivo
      clinicalRecordsService.getPatientRecordsCount(patientId)
        .then(count => {
          setFormData(prev => ({
            ...prev,
            expedientNumber: (count + 1).toString(),
          }));
        })
        .catch(error => {
          console.error('Error al obtener el conteo de expedientes:', error);
          // Si falla, usar 1 como número por defecto
          setFormData(prev => ({
            ...prev,
            expedientNumber: '1',
          }));
        });
    }
    // Fecha de creación automática
    setFormData(prev => ({
      ...prev,
      recordDate: new Date().toISOString().split('T')[0],
    }));
  }, [patientId, isEditing]);

  const handleInputChange = (section: string, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...(prev[section as keyof typeof prev] as object),
        [field]: value,
      },
    }));
  };

  const handleBasicChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const calculateBMI = () => {
    const weight = parseFloat(formData.anthropometricMeasurements.currentWeightKg as string);
    const height = parseFloat(formData.anthropometricMeasurements.heightM as string);
    
    if (weight && height && height > 0) {
      const bmi = weight / (height * height);
      return bmi.toFixed(1);
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateStep(currentStep)) {
      return;
    }

    const submitData: CreateClinicalRecordDto | UpdateClinicalRecordDto = {
      patientId,
      recordDate: formData.recordDate,
      expedientNumber: formData.expedientNumber || undefined,
      consultationReason: formData.consultationReason || undefined,

      currentProblems: {
        diarrhea: formData.currentProblems.diarrhea,
        constipation: formData.currentProblems.constipation,
        gastritis: formData.currentProblems.gastritis,
        ulcer: formData.currentProblems.ulcer,
        nausea: formData.currentProblems.nausea,
        pyrosis: formData.currentProblems.pyrosis,
        vomiting: formData.currentProblems.vomiting,
        colitis: formData.currentProblems.colitis,
        mouthMechanics: formData.currentProblems.mouthMechanics || undefined,
        otherProblems: formData.currentProblems.otherProblems || undefined,
        observations: formData.currentProblems.observations || undefined,
      },

      anthropometricMeasurements: {
        currentWeightKg: parseFloat(formData.anthropometricMeasurements.currentWeightKg as string) || undefined,
        habitualWeightKg: parseFloat(formData.anthropometricMeasurements.habitualWeightKg as string) || undefined,
        heightM: parseFloat(formData.anthropometricMeasurements.heightM as string) || undefined,
        waistCircCm: parseFloat(formData.anthropometricMeasurements.waistCircCm as string) || undefined,
        hipCircCm: parseFloat(formData.anthropometricMeasurements.hipCircCm as string) || undefined,
      },

      bloodPressure: {
        knowsBp: formData.bloodPressure.knowsBp,
        systolic: parseFloat(formData.bloodPressure.systolic as string) || undefined,
        diastolic: parseFloat(formData.bloodPressure.diastolic as string) || undefined,
        habitualBp: formData.bloodPressure.habitualBp || undefined,
      },

      dietaryHistory: {
        receivedNutritionalGuidance: formData.dietaryHistory.receivedNutritionalGuidance,
        whenReceived: formData.dietaryHistory.whenReceived || undefined,
        adherenceLevel: formData.dietaryHistory.adherenceLevel || undefined,
        preferredFoods: formData.dietaryHistory.preferredFoods ? formData.dietaryHistory.preferredFoods.split(',').map((f: string) => f.trim()) : undefined,
        dislikedFoods: formData.dietaryHistory.dislikedFoods ? formData.dietaryHistory.dislikedFoods.split(',').map((f: string) => f.trim()) : undefined,
        malestarAlergiaFoods: formData.dietaryHistory.malestarAlergiaFoods ? formData.dietaryHistory.malestarAlergiaFoods.split(',').map((f: string) => f.trim()) : undefined,
        takesSupplements: formData.dietaryHistory.takesSupplements,
        supplementDetails: formData.dietaryHistory.supplementDetails || undefined,
      },

      nutritionalDiagnosis: formData.nutritionalDiagnosis || undefined,
      nutritionalPlanAndManagement: formData.nutritionalPlanAndManagement || undefined,
      evolutionAndFollowUpNotes: formData.evolutionAndFollowUpNotes || undefined,
    };

    onSubmit(submitData);
  };

  return (
    <div className="clinical-record-form">
      <div className="card">
        <div className="card-header">
          <h5 className="mb-0">
            <i className="fas fa-clipboard-list me-2"></i>
            {isEditing ? 'Editar' : 'Nuevo'} Expediente Clínico
            <span className="text-muted"> - {patientName}</span>
          </h5>
        </div>

        <div className="card-body">
          {/* Indicador de progreso */}
          <div className="progress-indicator mb-4">
            <div className="d-flex flex-column flex-md-row justify-content-between align-items-center">
              {steps.map((step, index) => (
                <div key={step.id} className="d-flex align-items-center mb-2 mb-md-0">
                  <div 
                    className={`step-circle ${currentStep === step.id ? 'active' : ''} ${
                      completedSteps.includes(step.id) ? 'completed' : ''
                    } ${step.required ? 'required' : ''}`}
                    onClick={() => goToStep(step.id)}
                    style={{ cursor: 'pointer' }}
                  >
                    {completedSteps.includes(step.id) ? (
                      <i className="fas fa-check"></i>
                    ) : (
                      <span>{step.id}</span>
                    )}
                  </div>
                  <div className="step-info ms-2">
                    <div className="step-title d-none d-md-block">{step.title}</div>
                    <div className="step-title d-md-none">{step.title.length > 15 ? step.title.substring(0, 15) + '...' : step.title}</div>
                    {step.required && <small className="text-danger">*Requerido</small>}
                  </div>
                  {index < steps.length - 1 && (
                    <div className={`step-line d-none d-md-block ${completedSteps.includes(step.id) ? 'completed' : ''}`}></div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            {/* Paso 1: Datos Básicos */}
            {currentStep === 1 && (
              <div className="step-content">
                <h6 className="mb-3">
                  <i className="fas fa-info-circle me-2"></i>
                  Datos Básicos del Expediente
                </h6>
                
                <div className="row">
                  <div className="col-12 col-md-6">
                    <div className="mb-3">
                      <label className="form-label">
                        Fecha del Registro <span className="text-danger">*</span>
                      </label>
                      <input
                        type="date"
                        className="form-control"
                        value={formData.recordDate}
                        onChange={(e) => handleBasicChange('recordDate', e.target.value)}
                        required
                      />
                    </div>
                  </div>
                  <div className="col-12 col-md-6">
                    <div className="mb-3">
                      <label className="form-label">Número de Expediente</label>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.expedientNumber}
                        onChange={(e) => handleBasicChange('expedientNumber', e.target.value)}
                        placeholder="Ej: EXP-001"
                      />
                    </div>
                  </div>
                </div>

                <div className="mb-3">
                  <label className="form-label">
                    Motivo de Consulta <span className="text-danger">*</span>
                  </label>
                  <textarea
                    className="form-control"
                    rows={3}
                    value={formData.consultationReason}
                    onChange={(e) => handleBasicChange('consultationReason', e.target.value)}
                    placeholder="Describe el motivo de la consulta..."
                    required
                  />
                </div>
              </div>
            )}

            {/* Paso 2: Problemas Actuales */}
            {currentStep === 2 && (
              <div className="step-content">
                <h6 className="mb-3">
                  <i className="fas fa-exclamation-triangle me-2"></i>
                  Problemas Actuales del Paciente
                </h6>
                
                <div className="mb-4">
                  <h6 className="mb-3">Problemas Gastrointestinales</h6>
                  <div className="row">
                    {[
                      { key: 'diarrhea', label: 'Diarrea' },
                      { key: 'constipation', label: 'Estreñimiento' },
                      { key: 'gastritis', label: 'Gastritis' },
                      { key: 'ulcer', label: 'Úlcera' },
                      { key: 'nausea', label: 'Náuseas' },
                      { key: 'pyrosis', label: 'Pirosis' },
                      { key: 'vomiting', label: 'Vómito' },
                      { key: 'colitis', label: 'Colitis' },
                    ].map(({ key, label }) => (
                      <div key={key} className="col-6 col-md-3 mb-2">
                        <div className="form-check">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            checked={formData.currentProblems[key as keyof typeof formData.currentProblems] as boolean}
                            onChange={(e) => handleInputChange('currentProblems', key, e.target.checked)}
                          />
                          <label className="form-check-label">{label}</label>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mb-3">
                  <label className="form-label">Mecánicos de la Boca</label>
                  <input
                    type="text"
                    className="form-control"
                    value={formData.currentProblems.mouthMechanics}
                    onChange={(e) => handleInputChange('currentProblems', 'mouthMechanics', e.target.value)}
                    placeholder="Ej: Dificultad para masticar, problemas dentales..."
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label">Otros Problemas</label>
                  <textarea
                    className="form-control"
                    rows={2}
                    value={formData.currentProblems.otherProblems}
                    onChange={(e) => handleInputChange('currentProblems', 'otherProblems', e.target.value)}
                    placeholder="Describe otros problemas..."
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label">Observaciones</label>
                  <textarea
                    className="form-control"
                    rows={2}
                    value={formData.currentProblems.observations}
                    onChange={(e) => handleInputChange('currentProblems', 'observations', e.target.value)}
                    placeholder="Observaciones adicionales..."
                  />
                </div>
              </div>
            )}

            {/* Paso 3: Mediciones */}
            {currentStep === 3 && (
              <div className="step-content">
                <h6 className="mb-3">
                  <i className="fas fa-ruler me-2"></i>
                  Mediciones Antropométricas
                </h6>
                
                <div className="row">
                  <div className="col-12 col-md-6">
                    <div className="mb-3">
                      <label className="form-label">Peso Actual (kg)</label>
                      <input
                        type="number"
                        step="0.1"
                        className="form-control"
                        value={formData.anthropometricMeasurements.currentWeightKg}
                        onChange={(e) => handleInputChange('anthropometricMeasurements', 'currentWeightKg', e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="col-12 col-md-6">
                    <div className="mb-3">
                      <label className="form-label">Peso Habitual (kg)</label>
                      <input
                        type="number"
                        step="0.1"
                        className="form-control"
                        value={formData.anthropometricMeasurements.habitualWeightKg}
                        onChange={(e) => handleInputChange('anthropometricMeasurements', 'habitualWeightKg', e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                <div className="row">
                  <div className="col-12 col-md-6">
                    <div className="mb-3">
                      <label className="form-label">Estatura (m)</label>
                      <input
                        type="number"
                        step="0.01"
                        className="form-control"
                        value={formData.anthropometricMeasurements.heightM}
                        onChange={(e) => handleInputChange('anthropometricMeasurements', 'heightM', e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="col-12 col-md-6">
                    <div className="mb-3">
                      <label className="form-label">IMC Calculado</label>
                      <input
                        type="text"
                        className="form-control"
                        value={calculateBMI() || ''}
                        readOnly
                        placeholder="Se calcula automáticamente"
                      />
                    </div>
                  </div>
                </div>

                <div className="row">
                  <div className="col-12 col-md-6">
                    <div className="mb-3">
                      <label className="form-label">Circunferencia de Cintura (cm)</label>
                      <input
                        type="number"
                        step="0.1"
                        className="form-control"
                        value={formData.anthropometricMeasurements.waistCircCm}
                        onChange={(e) => handleInputChange('anthropometricMeasurements', 'waistCircCm', e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="col-12 col-md-6">
                    <div className="mb-3">
                      <label className="form-label">Circunferencia de Cadera (cm)</label>
                      <input
                        type="number"
                        step="0.1"
                        className="form-control"
                        value={formData.anthropometricMeasurements.hipCircCm}
                        onChange={(e) => handleInputChange('anthropometricMeasurements', 'hipCircCm', e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                <h6 className="mt-4 mb-3">Presión Arterial</h6>
                <div className="row">
                  <div className="col-12 col-md-4">
                    <div className="form-check mb-3">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        checked={formData.bloodPressure.knowsBp}
                        onChange={(e) => handleInputChange('bloodPressure', 'knowsBp', e.target.checked)}
                      />
                      <label className="form-check-label">Conoce su presión arterial</label>
                    </div>
                  </div>
                  <div className="col-12 col-md-4">
                    <div className="mb-3">
                      <label className="form-label">Sistólica</label>
                      <input
                        type="number"
                        className="form-control"
                        value={formData.bloodPressure.systolic}
                        onChange={(e) => handleInputChange('bloodPressure', 'systolic', e.target.value)}
                        disabled={!formData.bloodPressure.knowsBp}
                      />
                    </div>
                  </div>
                  <div className="col-12 col-md-4">
                    <div className="mb-3">
                      <label className="form-label">Diastólica</label>
                      <input
                        type="number"
                        className="form-control"
                        value={formData.bloodPressure.diastolic}
                        onChange={(e) => handleInputChange('bloodPressure', 'diastolic', e.target.value)}
                        disabled={!formData.bloodPressure.knowsBp}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Paso 4: Historia Dietética */}
            {currentStep === 4 && (
              <div className="step-content">
                <h6 className="mb-3">
                  <i className="fas fa-utensils me-2"></i>
                  Historia Dietética
                </h6>
                
                <div className="row">
                  <div className="col-12 col-md-6">
                    <div className="form-check mb-3">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        checked={formData.dietaryHistory.receivedNutritionalGuidance}
                        onChange={(e) => handleInputChange('dietaryHistory', 'receivedNutritionalGuidance', e.target.checked)}
                      />
                      <label className="form-check-label">Ha recibido orientación nutricional</label>
                    </div>
                  </div>
                  <div className="col-12 col-md-6">
                    <div className="mb-3">
                      <label className="form-label">¿Cuándo?</label>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.dietaryHistory.whenReceived}
                        onChange={(e) => handleInputChange('dietaryHistory', 'whenReceived', e.target.value)}
                        disabled={!formData.dietaryHistory.receivedNutritionalGuidance}
                        placeholder="Ej: Hace 6 meses"
                      />
                    </div>
                  </div>
                </div>

                <div className="mb-3">
                  <label className="form-label">Nivel de Adherencia</label>
                  <select
                    className="form-select"
                    value={formData.dietaryHistory.adherenceLevel}
                    onChange={(e) => handleInputChange('dietaryHistory', 'adherenceLevel', e.target.value)}
                  >
                    <option value="">Selecciona un nivel</option>
                    <option value="Excelente apego">Excelente apego</option>
                    <option value="Buena adherencia">Buena adherencia</option>
                    <option value="Moderado apego">Moderado apego</option>
                    <option value="Baja adherencia">Baja adherencia</option>
                    <option value="Sin apego">Sin apego</option>
                  </select>
                </div>

                <div className="row">
                  <div className="col-12 col-md-6">
                    <div className="mb-3">
                      <label className="form-label">Alimentos Preferidos</label>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.dietaryHistory.preferredFoods}
                        onChange={(e) => handleInputChange('dietaryHistory', 'preferredFoods', e.target.value)}
                        placeholder="Ej: Frutas, verduras, pescado..."
                      />
                    </div>
                  </div>
                  <div className="col-12 col-md-6">
                    <div className="mb-3">
                      <label className="form-label">Alimentos que No Le Gustan</label>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.dietaryHistory.dislikedFoods}
                        onChange={(e) => handleInputChange('dietaryHistory', 'dislikedFoods', e.target.value)}
                        placeholder="Ej: Brócoli, pescado..."
                      />
                    </div>
                  </div>
                </div>

                <div className="mb-3">
                  <label className="form-label">Alimentos que Causan Malestar o Alergia</label>
                  <input
                    type="text"
                    className="form-control"
                    value={formData.dietaryHistory.malestarAlergiaFoods}
                    onChange={(e) => handleInputChange('dietaryHistory', 'malestarAlergiaFoods', e.target.value)}
                    placeholder="Ej: Lácteos, gluten, mariscos..."
                  />
                </div>

                <div className="row">
                  <div className="col-12 col-md-6">
                    <div className="form-check mb-3">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        checked={formData.dietaryHistory.takesSupplements}
                        onChange={(e) => handleInputChange('dietaryHistory', 'takesSupplements', e.target.checked)}
                      />
                      <label className="form-check-label">Toma suplementos</label>
                    </div>
                  </div>
                  <div className="col-12 col-md-6">
                    <div className="mb-3">
                      <label className="form-label">Detalles de Suplementos</label>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.dietaryHistory.supplementDetails}
                        onChange={(e) => handleInputChange('dietaryHistory', 'supplementDetails', e.target.value)}
                        disabled={!formData.dietaryHistory.takesSupplements}
                        placeholder="Ej: Vitamina D, Omega 3..."
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Paso 5: Diagnóstico y Plan */}
            {currentStep === 5 && (
              <div className="step-content">
                <h6 className="mb-3">
                  <i className="fas fa-stethoscope me-2"></i>
                  Diagnóstico y Plan Nutricional
                </h6>
                
                <div className="mb-3">
                  <label className="form-label">
                    Diagnóstico Nutricional <span className="text-danger">*</span>
                  </label>
                  <textarea
                    className="form-control"
                    rows={4}
                    value={formData.nutritionalDiagnosis}
                    onChange={(e) => handleBasicChange('nutritionalDiagnosis', e.target.value)}
                    placeholder="Describe el diagnóstico nutricional..."
                    required
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label">
                    Plan y Manejo Nutricional <span className="text-danger">*</span>
                  </label>
                  <textarea
                    className="form-control"
                    rows={4}
                    value={formData.nutritionalPlanAndManagement}
                    onChange={(e) => handleBasicChange('nutritionalPlanAndManagement', e.target.value)}
                    placeholder="Describe el plan nutricional y manejo..."
                    required
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label">Notas de Evolución y Seguimiento</label>
                  <textarea
                    className="form-control"
                    rows={3}
                    value={formData.evolutionAndFollowUpNotes}
                    onChange={(e) => handleBasicChange('evolutionAndFollowUpNotes', e.target.value)}
                    placeholder="Notas adicionales para seguimiento..."
                  />
                </div>
              </div>
            )}

            {/* Navegación entre pasos */}
            <div className="d-flex flex-column flex-md-row justify-content-between align-items-center mt-4">
              <div className="mb-2 mb-md-0">
                {currentStep > 1 && (
                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={prevStep}
                  >
                    <i className="fas fa-arrow-left me-1"></i>
                    Anterior
                  </button>
                )}
              </div>
              
              <div className="d-flex flex-column flex-md-row gap-2">
                {currentStep < steps.length && (
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={nextStep}
                  >
                    Siguiente
                    <i className="fas fa-arrow-right ms-1"></i>
                  </button>
                )}
                
                {currentStep === steps.length && (
                  <button
                    type="submit"
                    className="btn btn-success"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        Guardando...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-save me-1"></i>
                        {isEditing ? 'Actualizar' : 'Crear'} Expediente
                      </>
                    )}
                  </button>
                )}
                
                <button
                  type="button"
                  className="btn btn-outline-danger"
                  onClick={onCancel}
                >
                  <i className="fas fa-times me-1"></i>
                  Cancelar
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>

      <style>{`
        .clinical-record-form {
          max-width: 100%;
        }
        
        .progress-indicator {
          background: #f8f9fa;
          padding: 1rem;
          border-radius: 0.5rem;
          border: 1px solid #dee2e6;
        }
        
        .step-circle {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #e9ecef;
          border: 2px solid #dee2e6;
          font-weight: bold;
          color: #6c757d;
          transition: all 0.3s ease;
        }
        
        .step-circle.active {
          background: #007bff;
          border-color: #007bff;
          color: white;
        }
        
        .step-circle.completed {
          background: #28a745;
          border-color: #28a745;
          color: white;
        }
        
        .step-circle.required {
          border-color: #dc3545;
        }
        
        .step-info {
          min-width: 120px;
        }
        
        .step-title {
          font-weight: 600;
          font-size: 0.9rem;
          color: #495057;
        }
        
        .step-line {
          width: 60px;
          height: 2px;
          background: #dee2e6;
          margin: 0 1rem;
          transition: background 0.3s ease;
        }
        
        .step-line.completed {
          background: #28a745;
        }
        
        .step-content {
          min-height: 300px;
        }
        
        /* Responsive adjustments */
        @media (max-width: 768px) {
          .progress-indicator {
            padding: 0.75rem;
          }
          
          .step-circle {
            width: 35px;
            height: 35px;
            font-size: 0.9rem;
          }
          
          .step-info {
            min-width: 100px;
          }
          
          .step-title {
            font-size: 0.8rem;
          }
          
          .step-line {
            width: 30px;
            margin: 0 0.5rem;
          }
          
          .form-label {
            font-size: 0.9rem;
          }
          
          .form-control, .form-select {
            font-size: 0.9rem;
          }
          
          .btn {
            font-size: 0.9rem;
            padding: 0.5rem 1rem;
          }
          
          .card-body {
            padding: 1rem;
          }
          
          .step-content {
            min-height: 250px;
          }
        }
        
        @media (max-width: 576px) {
          .progress-indicator {
            padding: 0.5rem;
          }
          
          .step-circle {
            width: 30px;
            height: 30px;
            font-size: 0.8rem;
          }
          
          .step-info {
            min-width: 80px;
          }
          
          .step-title {
            font-size: 0.75rem;
          }
          
          .step-line {
            width: 20px;
            margin: 0 0.25rem;
          }
          
          .form-label {
            font-size: 0.85rem;
          }
          
          .form-control, .form-select {
            font-size: 0.85rem;
          }
          
          .btn {
            font-size: 0.85rem;
            padding: 0.4rem 0.8rem;
          }
          
          .card-body {
            padding: 0.75rem;
          }
          
          .step-content {
            min-height: 200px;
          }
          
          /* Stack buttons vertically on very small screens */
          .d-flex.flex-column.flex-md-row.gap-2 {
            width: 100%;
          }
          
          .d-flex.flex-column.flex-md-row.gap-2 .btn {
            width: 100%;
            margin-bottom: 0.5rem;
          }
        }
        
        /* Improve form field spacing on mobile */
        @media (max-width: 768px) {
          .mb-3 {
            margin-bottom: 1rem !important;
          }
          
          .row {
            margin-left: -0.5rem;
            margin-right: -0.5rem;
          }
          
          .col-12, .col-6, .col-md-6, .col-md-4 {
            padding-left: 0.5rem;
            padding-right: 0.5rem;
          }
        }
        
        /* Better checkbox layout on mobile */
        @media (max-width: 768px) {
          .form-check {
            margin-bottom: 0.75rem;
          }
          
          .form-check-label {
            font-size: 0.9rem;
            line-height: 1.3;
          }
        }
        
        /* Improve textarea on mobile */
        @media (max-width: 768px) {
          textarea.form-control {
            min-height: 80px;
          }
        }
      `}</style>
    </div>
  );
};

export default ClinicalRecordForm; 