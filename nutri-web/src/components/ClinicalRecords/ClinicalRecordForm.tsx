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
  const nextStep = () => {
    if (currentStep < steps.length) {
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
    setFormData(prev => {
      const sectionData = prev[section as keyof typeof prev] as any;
      return {
        ...prev,
        [section]: {
          ...sectionData,
          [field]: value,
        },
      };
    });
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
        diarrhea: Boolean(formData.currentProblems.diarrhea),
        constipation: Boolean(formData.currentProblems.constipation),
        gastritis: Boolean(formData.currentProblems.gastritis),
        ulcer: Boolean(formData.currentProblems.ulcer),
        nausea: Boolean(formData.currentProblems.nausea),
        pyrosis: Boolean(formData.currentProblems.pyrosis),
        vomiting: Boolean(formData.currentProblems.vomiting),
        colitis: Boolean(formData.currentProblems.colitis),
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
        knowsBp: Boolean(formData.bloodPressure.knowsBp),
        systolic: parseFloat(formData.bloodPressure.systolic as string) || undefined,
        diastolic: parseFloat(formData.bloodPressure.diastolic as string) || undefined,
        habitualBp: formData.bloodPressure.habitualBp || undefined,
      },

      dietaryHistory: {
        receivedNutritionalGuidance: Boolean(formData.dietaryHistory.receivedNutritionalGuidance),
        whenReceived: formData.dietaryHistory.whenReceived || undefined,
        adherenceLevel: formData.dietaryHistory.adherenceLevel || undefined,
        preferredFoods: formData.dietaryHistory.preferredFoods ? formData.dietaryHistory.preferredFoods.split(',').map((f: string) => f.trim()) : undefined,
        dislikedFoods: formData.dietaryHistory.dislikedFoods ? formData.dietaryHistory.dislikedFoods.split(',').map((f: string) => f.trim()) : undefined,
        malestarAlergiaFoods: formData.dietaryHistory.malestarAlergiaFoods ? formData.dietaryHistory.malestarAlergiaFoods.split(',').map((f: string) => f.trim()) : undefined,
        takesSupplements: Boolean(formData.dietaryHistory.takesSupplements),
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
            <i className="fas fa-clipboard-list me-2" aria-hidden="true"></i>
            {isEditing ? 'Editar' : 'Nuevo'} Expediente Clínico
            <span className="text-muted"> - {patientName}</span>
          </h5>
        </div>

        <div className="card-body">
          {/* Indicador de progreso minimalista con colores del sistema de expedientes */}
          <div className="progress-indicator mb-4">
            <div className="current-step-circle">{currentStep}</div>
            <div className="current-step-info">
              <div className="step-title">{steps[currentStep - 1].title}</div>
              <div className="step-counter">Paso {currentStep} de {steps.length}</div>
              {steps[currentStep - 1].required && <small className="step-required">*Requerido</small>}
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            {/* Paso 1: Datos Básicos */}
            {currentStep === 1 && (
              <div className="step-content">
                <h6 className="mb-3">
                  <i className="fas fa-info-circle me-2" aria-hidden="true"></i>
                  Datos Básicos del Expediente
                </h6>
                
                <div className="row">
                  <div className="col-12 col-md-6">
                    <div className="mb-3">
                      <label className="form-label" htmlFor="recordDate">
                        Fecha del Registro <span className="text-danger">*</span>
                      </label>
                      <input
                        type="date"
                        className="form-control"
                        id="recordDate"
                        name="recordDate"
                        title="Fecha del Registro"
                        aria-label="Fecha del Registro"
                        value={formData.recordDate}
                        onChange={(e) => handleBasicChange('recordDate', e.target.value)}
                        required
                      />
                    </div>
                  </div>
                  <div className="col-12 col-md-6">
                    <div className="mb-3">
                      <label className="form-label" htmlFor="expedientNumber">Número de Expediente</label>
                      <input
                        type="text"
                        className="form-control"
                        id="expedientNumber"
                        name="expedientNumber"
                        title="Número de Expediente"
                        aria-label="Número de Expediente"
                        value={formData.expedientNumber}
                        onChange={(e) => handleBasicChange('expedientNumber', e.target.value)}
                        placeholder="Ej: EXP-001"
                      />
                    </div>
                  </div>
                </div>

                <div className="mb-3">
                  <label className="form-label" htmlFor="consultationReason">
                    Motivo de Consulta <span className="text-danger">*</span>
                  </label>
                  <textarea
                    className="form-control"
                    id="consultationReason"
                    name="consultationReason"
                    title="Motivo de Consulta"
                    aria-label="Motivo de Consulta"
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
                  <i className="fas fa-exclamation-triangle me-2" aria-hidden="true"></i>
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
                    ].map(({ key, label }) => {
                      const checkboxId = `currentProblems-${key}`;
                      const isChecked = Boolean(formData.currentProblems[key as keyof typeof formData.currentProblems]);
                      return (
                        <div key={key} className="col-6 col-md-3 mb-2">
                          <div className="form-check">
                            <input
                              className="form-check-input"
                              type="checkbox"
                              id={checkboxId}
                              name={key}
                              checked={isChecked}
                              onChange={(e) => {
                                console.log(`Checkbox ${key} changed:`, e.target.checked); // Debug
                                handleInputChange('currentProblems', key, e.target.checked);
                              }}
                              title={`Marcar si el paciente tiene ${label.toLowerCase()}`}
                              aria-label={`${label} - Marcar si el paciente tiene este problema`}
                            />
                            <label 
                              className="form-check-label" 
                              htmlFor={checkboxId}
                              style={{ cursor: 'pointer', userSelect: 'none' }}
                            >
                              {label}
                            </label>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="mb-3">
                  <label className="form-label" htmlFor="currentProblems-mouthMechanics">Mecánicos de la Boca</label>
                  <input
                    type="text"
                    className="form-control"
                    id="currentProblems-mouthMechanics"
                    name="currentProblems-mouthMechanics"
                    title="Mecánicos de la Boca"
                    aria-label="Mecánicos de la Boca"
                    value={formData.currentProblems.mouthMechanics}
                    onChange={(e) => handleInputChange('currentProblems', 'mouthMechanics', e.target.value)}
                    placeholder="Ej: Dificultad para masticar, problemas dentales..."
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label" htmlFor="currentProblems-otherProblems">Otros Problemas</label>
                  <textarea
                    className="form-control"
                    id="currentProblems-otherProblems"
                    name="currentProblems-otherProblems"
                    title="Otros Problemas"
                    aria-label="Otros Problemas"
                    rows={2}
                    value={formData.currentProblems.otherProblems}
                    onChange={(e) => handleInputChange('currentProblems', 'otherProblems', e.target.value)}
                    placeholder="Describe otros problemas..."
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label" htmlFor="currentProblems-observations">Observaciones</label>
                  <textarea
                    className="form-control"
                    id="currentProblems-observations"
                    name="currentProblems-observations"
                    title="Observaciones"
                    aria-label="Observaciones"
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
                  <i className="fas fa-ruler me-2" aria-hidden="true"></i>
                  Mediciones Antropométricas
                </h6>
                
                <div className="row">
                  <div className="col-12 col-md-6">
                    <div className="mb-3">
                      <label className="form-label" htmlFor="anthropometricMeasurements-currentWeightKg">Peso Actual (kg)</label>
                      <input
                        type="number"
                        step="0.1"
                        className="form-control"
                        id="anthropometricMeasurements-currentWeightKg"
                        name="anthropometricMeasurements-currentWeightKg"
                        title="Peso Actual (kg)"
                        aria-label="Peso Actual en kilogramos"
                        value={formData.anthropometricMeasurements.currentWeightKg}
                        onChange={(e) => handleInputChange('anthropometricMeasurements', 'currentWeightKg', e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="col-12 col-md-6">
                    <div className="mb-3">
                      <label className="form-label" htmlFor="anthropometricMeasurements-habitualWeightKg">Peso Habitual (kg)</label>
                      <input
                        type="number"
                        step="0.1"
                        className="form-control"
                        id="anthropometricMeasurements-habitualWeightKg"
                        name="anthropometricMeasurements-habitualWeightKg"
                        title="Peso Habitual (kg)"
                        aria-label="Peso Habitual en kilogramos"
                        value={formData.anthropometricMeasurements.habitualWeightKg}
                        onChange={(e) => handleInputChange('anthropometricMeasurements', 'habitualWeightKg', e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                <div className="row">
                  <div className="col-12 col-md-6">
                    <div className="mb-3">
                      <label className="form-label" htmlFor="anthropometricMeasurements-heightM">Estatura (m)</label>
                      <input
                        type="number"
                        step="0.01"
                        className="form-control"
                        id="anthropometricMeasurements-heightM"
                        name="anthropometricMeasurements-heightM"
                        title="Estatura (m)"
                        aria-label="Estatura en metros"
                        value={formData.anthropometricMeasurements.heightM}
                        onChange={(e) => handleInputChange('anthropometricMeasurements', 'heightM', e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="col-12 col-md-6">
                    <div className="mb-3">
                      <label className="form-label" htmlFor="anthropometricMeasurements-bmi">IMC Calculado</label>
                      <input
                        type="text"
                        className="form-control"
                        id="anthropometricMeasurements-bmi"
                        name="anthropometricMeasurements-bmi"
                        title="IMC Calculado"
                        aria-label="Índice de Masa Corporal calculado automáticamente"
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
                      <label className="form-label" htmlFor="anthropometricMeasurements-waistCircCm">Circunferencia de Cintura (cm)</label>
                      <input
                        type="number"
                        step="0.1"
                        className="form-control"
                        id="anthropometricMeasurements-waistCircCm"
                        name="anthropometricMeasurements-waistCircCm"
                        title="Circunferencia de Cintura (cm)"
                        aria-label="Circunferencia de Cintura en centímetros"
                        value={formData.anthropometricMeasurements.waistCircCm}
                        onChange={(e) => handleInputChange('anthropometricMeasurements', 'waistCircCm', e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="col-12 col-md-6">
                    <div className="mb-3">
                      <label className="form-label" htmlFor="anthropometricMeasurements-hipCircCm">Circunferencia de Cadera (cm)</label>
                      <input
                        type="number"
                        step="0.1"
                        className="form-control"
                        id="anthropometricMeasurements-hipCircCm"
                        name="anthropometricMeasurements-hipCircCm"
                        title="Circunferencia de Cadera (cm)"
                        aria-label="Circunferencia de Cadera en centímetros"
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
                        id="bloodPressure-knowsBp"
                        name="knowsBp"
                        checked={Boolean(formData.bloodPressure.knowsBp)}
                        onChange={(e) => handleInputChange('bloodPressure', 'knowsBp', e.target.checked)}
                        title="Marcar si el paciente conoce su presión arterial"
                        aria-label="Conoce su presión arterial - Marcar si el paciente conoce sus valores"
                      />
                      <label 
                        className="form-check-label" 
                        htmlFor="bloodPressure-knowsBp"
                      >
                        Conoce su presión arterial
                      </label>
                    </div>
                  </div>
                  <div className="col-12 col-md-4">
                    <div className="mb-3">
                      <label className="form-label" htmlFor="bloodPressure-systolic">Sistólica</label>
                      <input
                        type="number"
                        className="form-control"
                        id="bloodPressure-systolic"
                        name="bloodPressure-systolic"
                        title="Sistólica"
                        aria-label="Presión arterial sistólica"
                        value={formData.bloodPressure.systolic}
                        onChange={(e) => handleInputChange('bloodPressure', 'systolic', e.target.value)}
                        disabled={!formData.bloodPressure.knowsBp}
                      />
                    </div>
                  </div>
                  <div className="col-12 col-md-4">
                    <div className="mb-3">
                      <label className="form-label" htmlFor="bloodPressure-diastolic">Diastólica</label>
                      <input
                        type="number"
                        className="form-control"
                        id="bloodPressure-diastolic"
                        name="bloodPressure-diastolic"
                        title="Diastólica"
                        aria-label="Presión arterial diastólica"
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
                  <i className="fas fa-utensils me-2" aria-hidden="true"></i>
                  Historia Dietética
                </h6>
                
                <div className="row">
                  <div className="col-12 col-md-6">
                    <div className="form-check mb-3">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id="dietaryHistory-receivedNutritionalGuidance"
                        name="receivedNutritionalGuidance"
                        checked={Boolean(formData.dietaryHistory.receivedNutritionalGuidance)}
                        onChange={(e) => handleInputChange('dietaryHistory', 'receivedNutritionalGuidance', e.target.checked)}
                        title="Marcar si el paciente ha recibido orientación nutricional previa"
                        aria-label="Ha recibido orientación nutricional - Marcar si el paciente ha tenido orientación previa"
                      />
                      <label 
                        className="form-check-label" 
                        htmlFor="dietaryHistory-receivedNutritionalGuidance"
                      >
                        Ha recibido orientación nutricional
                      </label>
                    </div>
                  </div>
                  <div className="col-12 col-md-6">
                    <div className="mb-3">
                      <label className="form-label" htmlFor="dietaryHistory-whenReceived">¿Cuándo?</label>
                      <input
                        type="text"
                        className="form-control"
                        id="dietaryHistory-whenReceived"
                        name="dietaryHistory-whenReceived"
                        title="¿Cuándo?"
                        aria-label="¿Cuándo recibió orientación nutricional?"
                        value={formData.dietaryHistory.whenReceived}
                        onChange={(e) => handleInputChange('dietaryHistory', 'whenReceived', e.target.value)}
                        disabled={!formData.dietaryHistory.receivedNutritionalGuidance}
                        placeholder="Ej: Hace 6 meses"
                      />
                    </div>
                  </div>
                </div>

                <div className="mb-3">
                  <label className="form-label" htmlFor="dietaryHistory-adherenceLevel">Nivel de Adherencia</label>
                  <select
                    className="form-select"
                    id="dietaryHistory-adherenceLevel"
                    name="dietaryHistory-adherenceLevel"
                    title="Nivel de Adherencia"
                    aria-label="Seleccionar nivel de adherencia"
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
                      <label className="form-label" htmlFor="dietaryHistory-preferredFoods">Alimentos Preferidos</label>
                      <input
                        type="text"
                        className="form-control"
                        id="dietaryHistory-preferredFoods"
                        name="dietaryHistory-preferredFoods"
                        title="Alimentos Preferidos"
                        aria-label="Alimentos Preferidos"
                        value={formData.dietaryHistory.preferredFoods}
                        onChange={(e) => handleInputChange('dietaryHistory', 'preferredFoods', e.target.value)}
                        placeholder="Ej: Frutas, verduras, pescado..."
                      />
                    </div>
                  </div>
                  <div className="col-12 col-md-6">
                    <div className="mb-3">
                      <label className="form-label" htmlFor="dietaryHistory-dislikedFoods">Alimentos que No Le Gustan</label>
                      <input
                        type="text"
                        className="form-control"
                        id="dietaryHistory-dislikedFoods"
                        name="dietaryHistory-dislikedFoods"
                        title="Alimentos que No Le Gustan"
                        aria-label="Alimentos que No Le Gustan"
                        value={formData.dietaryHistory.dislikedFoods}
                        onChange={(e) => handleInputChange('dietaryHistory', 'dislikedFoods', e.target.value)}
                        placeholder="Ej: Brócoli, pescado..."
                      />
                    </div>
                  </div>
                </div>

                <div className="mb-3">
                  <label className="form-label" htmlFor="dietaryHistory-malestarAlergiaFoods">Alimentos que Causan Malestar o Alergia</label>
                  <input
                    type="text"
                    className="form-control"
                    id="dietaryHistory-malestarAlergiaFoods"
                    name="dietaryHistory-malestarAlergiaFoods"
                    title="Alimentos que Causan Malestar o Alergia"
                    aria-label="Alimentos que Causan Malestar o Alergia"
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
                        id="dietaryHistory-takesSupplements"
                        name="takesSupplements"
                        checked={Boolean(formData.dietaryHistory.takesSupplements)}
                        onChange={(e) => handleInputChange('dietaryHistory', 'takesSupplements', e.target.checked)}
                        title="Marcar si el paciente toma suplementos"
                        aria-label="Toma suplementos - Marcar si el paciente consume suplementos nutricionales"
                      />
                      <label 
                        className="form-check-label" 
                        htmlFor="dietaryHistory-takesSupplements"
                      >
                        Toma suplementos
                      </label>
                    </div>
                  </div>
                  <div className="col-12 col-md-6">
                    <div className="mb-3">
                      <label className="form-label" htmlFor="dietaryHistory-supplementDetails">Detalles de Suplementos</label>
                      <input
                        type="text"
                        className="form-control"
                        id="dietaryHistory-supplementDetails"
                        name="dietaryHistory-supplementDetails"
                        title="Detalles de Suplementos"
                        aria-label="Detalles de Suplementos"
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
                  <i className="fas fa-stethoscope me-2" aria-hidden="true"></i>
                  Diagnóstico y Plan Nutricional
                </h6>
                
                <div className="mb-3">
                  <label className="form-label" htmlFor="nutritionalDiagnosis">
                    Diagnóstico Nutricional <span className="text-danger">*</span>
                  </label>
                  <textarea
                    className="form-control"
                    id="nutritionalDiagnosis"
                    name="nutritionalDiagnosis"
                    title="Diagnóstico Nutricional"
                    aria-label="Diagnóstico Nutricional"
                    rows={4}
                    value={formData.nutritionalDiagnosis}
                    onChange={(e) => handleBasicChange('nutritionalDiagnosis', e.target.value)}
                    placeholder="Describe el diagnóstico nutricional..."
                    required
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label" htmlFor="nutritionalPlanAndManagement">
                    Plan y Manejo Nutricional <span className="text-danger">*</span>
                  </label>
                  <textarea
                    className="form-control"
                    id="nutritionalPlanAndManagement"
                    name="nutritionalPlanAndManagement"
                    title="Plan y Manejo Nutricional"
                    aria-label="Plan y Manejo Nutricional"
                    rows={4}
                    value={formData.nutritionalPlanAndManagement}
                    onChange={(e) => handleBasicChange('nutritionalPlanAndManagement', e.target.value)}
                    placeholder="Describe el plan nutricional y manejo..."
                    required
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label" htmlFor="evolutionAndFollowUpNotes">Notas de Evolución y Seguimiento</label>
                  <textarea
                    className="form-control"
                    id="evolutionAndFollowUpNotes"
                    name="evolutionAndFollowUpNotes"
                    title="Notas de Evolución y Seguimiento"
                    aria-label="Notas de Evolución y Seguimiento"
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
                    title="Ir al paso anterior"
                    aria-label="Ir al paso anterior"
                  >
                    <i className="fas fa-arrow-left me-1" aria-hidden="true"></i>
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
                    title="Ir al siguiente paso"
                    aria-label="Ir al siguiente paso"
                  >
                    Siguiente
                    <i className="fas fa-arrow-right ms-1" aria-hidden="true"></i>
                  </button>
                )}
                
                {currentStep === steps.length && (
                  <button
                    type="submit"
                    className="btn btn-success"
                    disabled={loading}
                    title={isEditing ? "Actualizar expediente clínico" : "Crear expediente clínico"}
                    aria-label={isEditing ? "Actualizar expediente clínico" : "Crear expediente clínico"}
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        Guardando...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-save me-1" aria-hidden="true"></i>
                        {isEditing ? 'Actualizar' : 'Crear'} Expediente
                      </>
                    )}
                  </button>
                )}
                
                <button
                  type="button"
                  className="btn btn-outline-danger"
                  onClick={onCancel}
                  title="Cancelar y volver"
                  aria-label="Cancelar y volver"
                >
                  <i className="fas fa-times me-1" aria-hidden="true"></i>
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
        
        /* Indicador de progreso minimalista con colores del sistema de expedientes */
        .progress-indicator {
          padding: 20px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border-radius: 12px;
          box-shadow: 0 4px 20px rgba(102, 126, 234, 0.3);
          margin: 20px auto;
          max-width: 400px;
          text-align: center;
          position: relative;
          overflow: hidden;
        }
        
        .progress-indicator::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(45deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%);
          pointer-events: none;
        }
        
        @media (min-width: 768px) {
          .progress-indicator {
            padding: 30px;
            max-width: 500px;
          }
        }
        
        .current-step-circle {
          width: 60px;
          height: 60px;
          border-radius: 50%;
          display: flex;
          justify-content: center;
          align-items: center;
          font-weight: 700;
          font-size: 1.8em;
          background: linear-gradient(135deg, #ff6b6b, #ee5a24);
          color: #ffffff;
          border: 3px solid #ffffff;
          box-shadow: 0 5px 15px rgba(255, 107, 107, 0.5);
          margin: 0 auto 15px auto;
          transition: all 0.3s ease-in-out;
          flex-shrink: 0;
          position: relative;
          z-index: 1;
          -webkit-backdrop-filter: blur(10px);
          backdrop-filter: blur(10px);
        }
        
        .current-step-info {
          position: relative;
          z-index: 1;
        }
        
        .current-step-info .step-title {
          font-size: 1.4em;
          font-weight: 600;
          color: #ffffff;
          margin-bottom: 5px;
          text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }
        
        .current-step-info .step-counter {
          font-size: 0.9em;
          color: rgba(255, 255, 255, 0.9);
          margin-bottom: 5px;
        }
        
        .current-step-info .step-required {
          color: #ff7675;
          font-weight: 500;
          text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
        }
        
        @media (max-width: 767.98px) {
          .current-step-circle {
            width: 50px;
            height: 50px;
            font-size: 1.5em;
            margin-bottom: 10px;
          }
          .current-step-info .step-title {
            font-size: 1.2em;
          }
          .current-step-info .step-counter {
            font-size: 0.8em;
          }
        }
        
        .step-content {
          min-height: 300px;
          background: #ffffff;
          border-radius: 15px;
          padding: 2rem;
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
          margin-top: 1.5rem;
        }
        
        /* Responsive adjustments */
        @media (max-width: 768px) {
          .progress-indicator {
            padding: 1.5rem 1rem;
            border-radius: 15px;
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
            padding: 1.5rem;
          }
        }
        
        @media (max-width: 576px) {
          .progress-indicator {
            padding: 1rem 0.75rem;
            border-radius: 12px;
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
            padding: 1rem;
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
        
        /* Ensure checkboxes are clickable and accessible */
        .form-check-input {
          cursor: pointer;
          width: 1.2em;
          height: 1.2em;
          border: 2px solid #6c757d;
          border-radius: 0.25em;
          background-color: #fff;
          transition: all 0.15s ease-in-out;
          margin: 0;
          flex-shrink: 0;
        }
        
        .form-check-input:checked {
          background-color: #007bff;
          border-color: #007bff;
        }
        
        .form-check-input:focus {
          outline: 0;
          box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
          border-color: #80bdff;
        }
        
        .form-check-input:hover {
          border-color: #007bff;
          transform: scale(1.05);
        }
        
        .form-check-input:active {
          transform: scale(0.95);
        }
        
        .form-check-label {
          cursor: pointer;
          -webkit-user-select: none;
          -moz-user-select: none;
          -ms-user-select: none;
          user-select: none;
          margin-left: 0.5rem;
          line-height: 1.4;
          font-size: 0.9rem;
          flex: 1;
          margin-bottom: 0;
          padding-top: 0.1rem;
        }
        
        /* Improve checkbox spacing and layout */
        .form-check {
          display: flex;
          align-items: flex-start;
          margin-bottom: 0.75rem;
          padding: 0.5rem;
          border-radius: 0.375rem;
          transition: background-color 0.15s ease-in-out;
        }
        
        .form-check:hover {
          background-color: rgba(0, 123, 255, 0.05);
        }
        
        .form-check-input {
          margin-right: 0.5rem;
          margin-top: 0.1rem;
        }
        
        /* Ensure proper touch targets on mobile */
        @media (max-width: 768px) {
          .form-check-input {
            width: 1.4em;
            height: 1.4em;
            min-width: 1.4em;
            min-height: 1.4em;
          }
          
          .form-check-label {
            font-size: 0.9rem;
            line-height: 1.3;
            padding-top: 0.05rem;
          }
          
          .form-check {
            margin-bottom: 1rem;
            padding: 0.75rem;
            min-height: 44px;
          }
        }
        
        /* Ensure checkboxes work on all browsers */
        .form-check-input::-ms-check {
          display: none;
        }
        
        /* High contrast mode support */
        @media (prefers-contrast: high) {
          .form-check-input {
            border-width: 3px;
          }
          
          .form-check-input:checked {
            background-color: #000;
            border-color: #000;
          }
        }
        
        /* Reduced motion support */
        @media (prefers-reduced-motion: reduce) {
          .form-check-input,
          .form-check {
            transition: none;
          }
          
          .form-check-input:hover {
            transform: none;
          }
        }
        
        /* Improve textarea on mobile */
        @media (max-width: 768px) {
          textarea.form-control {
            min-height: 80px;
          }
        }
        
        /* Fix text-size-adjust compatibility - Remove problematic properties */
        .form-control, .form-select, .btn, .form-label {
          /* Remove problematic text-size-adjust properties */
        }
        
        /* Fix text-align compatibility - Use standard properties */
        .text-center {
          text-align: center !important;
        }
        
        /* Remove problematic color-adjust properties */
        @media print {
          .btn, .form-control, .form-select {
            /* Remove problematic print-color-adjust properties */
          }
        }
        
        /* Ensure proper focus indicators for accessibility */
        .form-control:focus,
        .form-select:focus,
        .btn:focus {
          outline: 2px solid #007bff;
          outline-offset: 2px;
        }
        
        /* Improve button accessibility */
        .btn {
          position: relative;
          overflow: hidden;
        }
        
        .btn:focus {
          box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
        }
        
        /* Ensure proper contrast for accessibility */
        .form-label {
          color: #495057;
          font-weight: 500;
        }
        
        .text-danger {
          color: #dc3545 !important;
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
        
        /* Ensure all form fields have proper accessibility */
        .form-control:not([id]),
        .form-select:not([id]),
        .form-check-input:not([id]) {
          border: 2px solid #dc3545;
        }
        
        /* Improve button text accessibility */
        .btn:not([title]):not([aria-label]) {
          border: 2px solid #dc3545;
        }
        
        /* Ensure proper text alignment */
        .text-center {
          text-align: center !important;
        }
        
        .text-left {
          text-align: left !important;
        }
        
        .text-right {
          text-align: right !important;
        }
        
        /* Improve mobile compatibility */
        @media (max-width: 768px) {
          .btn {
            min-height: 44px;
            min-width: 44px;
          }
          
          .form-control, .form-select {
            min-height: 44px;
          }
          
          .form-check-input {
            min-width: 44px;
            min-height: 44px;
          }
        }
      `}</style>
    </div>
  );
};

export default ClinicalRecordForm; 