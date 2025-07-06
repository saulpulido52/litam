import React, { useState, useEffect } from 'react';
import type { ClinicalRecord, CreateClinicalRecordDto, UpdateClinicalRecordDto } from '../../types/clinical-record';
import { clinicalRecordsService } from '../../services/clinicalRecordsService';
import { Card, Form } from 'react-bootstrap';
import { MdAdd, MdEdit } from 'react-icons/md';

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
  const [validationErrors, setValidationErrors] = useState<{[key: string]: string}>({});
  
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
      mouth_mechanics: record?.current_problems?.mouth_mechanics || '',
      other_problems: record?.current_problems?.other_problems || '',
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

    // Enfermedades diagnosticadas
    diagnosedDiseases: {
      hasDisease: record?.diagnosed_diseases?.has_disease || false,
      diseaseName: record?.diagnosed_diseases?.disease_name || '',
      sinceWhen: record?.diagnosed_diseases?.since_when || '',
      takesMedication: record?.diagnosed_diseases?.takes_medication || false,
      medicationsList: record?.diagnosed_diseases?.medications_list?.join(', ') || '',
      hasImportantDisease: record?.diagnosed_diseases?.has_important_disease || false,
      importantDiseaseName: record?.diagnosed_diseases?.important_disease_name || '',
      takesSpecialTreatment: record?.diagnosed_diseases?.takes_special_treatment || false,
      specialTreatmentDetails: record?.diagnosed_diseases?.special_treatment_details || '',
      hasSurgery: record?.diagnosed_diseases?.has_surgery || false,
      surgeryDetails: record?.diagnosed_diseases?.surgery_details || '',
    },

    // Antecedentes Familiares
    familyMedicalHistory: {
      obesity: record?.family_medical_history?.obesity || false,
      diabetes: record?.family_medical_history?.diabetes || false,
      hta: record?.family_medical_history?.hta || false,
      cancer: record?.family_medical_history?.cancer || false,
      hypoHyperthyroidism: record?.family_medical_history?.hypo_hyperthyroidism || false,
      dyslipidemia: record?.family_medical_history?.dyslipidemia || false,
      otherHistory: record?.family_medical_history?.other_history || '',
    },

    // Estilo de Vida
    activityLevelDescription: record?.activity_level_description || '',
    physicalExercise: {
      performsExercise: record?.physical_exercise?.performs_exercise || false,
      type: record?.physical_exercise?.type || '',
      frequency: record?.physical_exercise?.frequency || '',
      duration: record?.physical_exercise?.duration || '',
      sinceWhen: record?.physical_exercise?.since_when || '',
    },
    consumptionHabits: {
      alcohol: record?.consumption_habits?.alcohol || '',
      tobacco: record?.consumption_habits?.tobacco || '',
      coffee: record?.consumption_habits?.coffee || '',
      otherSubstances: record?.consumption_habits?.other_substances || '',
    },
    waterConsumptionLiters: record?.water_consumption_liters || '',

    // Diagnóstico y plan
    nutritionalDiagnosis: record?.nutritional_diagnosis || '',
    nutritionalPlanAndManagement: record?.nutritional_plan_and_management || '',
    evolutionAndFollowUpNotes: record?.evolution_and_follow_up_notes || '',
  });

  // Configuración de pasos
  const steps = [
    { id: 1, title: 'Datos Básicos', icon: 'fas fa-info-circle', required: true },
    { id: 2, title: 'Problemas Actuales', icon: 'fas fa-exclamation-triangle', required: false },
    { id: 3, title: 'Enfermedades y Medicamentos', icon: 'fas fa-pills', required: false },
    { id: 4, title: 'Antecedentes Familiares', icon: 'fas fa-users', required: false },
    { id: 5, title: 'Estilo de Vida', icon: 'fas fa-running', required: false },
    { id: 6, title: 'Mediciones', icon: 'fas fa-ruler', required: false },
    { id: 7, title: 'Historia Dietética', icon: 'fas fa-utensils', required: false },
    { id: 8, title: 'Diagnóstico y Plan', icon: 'fas fa-stethoscope', required: true },
  ];

  // Validación por pasos
  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1: // Datos Básicos
        return !!(formData.recordDate && formData.consultationReason);
      case 2: // Problemas Actuales
        return true; // Opcional
      case 3: // Enfermedades y Medicamentos
        return true; // Opcional
      case 4: // Antecedentes Familiares
        return true; // Opcional
      case 5: // Estilo de Vida
        return true; // Opcional
      case 6: // Mediciones
        return true; // Opcional
      case 7: // Historia Dietética
        return true; // Opcional
      case 8: // Diagnóstico y Plan
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

  const validateBloodPressure = (systolic: number, diastolic: number): string[] => {
    const errors: string[] = [];
    
    if (diastolic >= systolic) {
      errors.push(`La presión diastólica (${diastolic}) no puede ser mayor o igual que la sistólica (${systolic})`);
    }
    
    if (systolic > 200 || diastolic > 120) {
      errors.push(`Valores anormalmente altos (${systolic}/${diastolic}). Por favor verifica.`);
    }
    
    if (systolic < 60 || diastolic < 40) {
      errors.push(`Valores anormalmente bajos (${systolic}/${diastolic}). Por favor verifica.`);
    }
    
    return errors;
  };

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

    // Validar presión arterial en tiempo real
    if (section === 'bloodPressure' && (field === 'systolic' || field === 'diastolic')) {
      const currentBP = { ...formData.bloodPressure };
      currentBP[field] = value;
      
      const systolic = parseFloat(currentBP.systolic as string) || 0;
      const diastolic = parseFloat(currentBP.diastolic as string) || 0;
      
      if (systolic > 0 && diastolic > 0) {
        const bpErrors = validateBloodPressure(systolic, diastolic);
        setValidationErrors(prev => ({
          ...prev,
          bloodPressure: bpErrors.length > 0 ? bpErrors[0] : ''
        }));
      } else {
        setValidationErrors(prev => ({
          ...prev,
          bloodPressure: ''
        }));
      }
    }
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
        mouth_mechanics: formData.currentProblems.mouth_mechanics || undefined,
        other_problems: formData.currentProblems.other_problems || undefined,
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

      diagnosedDiseases: {
        hasDisease: Boolean(formData.diagnosedDiseases.hasDisease),
        diseaseName: formData.diagnosedDiseases.diseaseName || undefined,
        sinceWhen: formData.diagnosedDiseases.sinceWhen || undefined,
        takesMedication: Boolean(formData.diagnosedDiseases.takesMedication),
        medications_list: formData.diagnosedDiseases.medicationsList 
          ? formData.diagnosedDiseases.medicationsList.split(',').map((m: string) => m.trim()).filter(m => m.length > 0)
          : undefined,
        hasImportantDisease: Boolean(formData.diagnosedDiseases.hasImportantDisease),
        importantDiseaseName: formData.diagnosedDiseases.importantDiseaseName || undefined,
        takesSpecialTreatment: Boolean(formData.diagnosedDiseases.takesSpecialTreatment),
        specialTreatmentDetails: formData.diagnosedDiseases.specialTreatmentDetails || undefined,
        hasSurgery: Boolean(formData.diagnosedDiseases.hasSurgery),
        surgeryDetails: formData.diagnosedDiseases.surgeryDetails || undefined,
      },

      // Antecedentes Familiares
      familyMedicalHistory: {
        obesity: Boolean(formData.familyMedicalHistory.obesity),
        diabetes: Boolean(formData.familyMedicalHistory.diabetes),
        hta: Boolean(formData.familyMedicalHistory.hta),
        cancer: Boolean(formData.familyMedicalHistory.cancer),
        hypoHyperthyroidism: Boolean(formData.familyMedicalHistory.hypoHyperthyroidism),
        dyslipidemia: Boolean(formData.familyMedicalHistory.dyslipidemia),
        otherHistory: formData.familyMedicalHistory.otherHistory || undefined,
      },

      // Estilo de Vida
      activityLevelDescription: formData.activityLevelDescription || undefined,
      physicalExercise: {
        performsExercise: Boolean(formData.physicalExercise.performsExercise),
        type: formData.physicalExercise.type || undefined,
        frequency: formData.physicalExercise.frequency || undefined,
        duration: formData.physicalExercise.duration || undefined,
        sinceWhen: formData.physicalExercise.sinceWhen || undefined,
      },
      consumptionHabits: {
        alcohol: formData.consumptionHabits.alcohol || undefined,
        tobacco: formData.consumptionHabits.tobacco || undefined,
        coffee: formData.consumptionHabits.coffee || undefined,
        otherSubstances: formData.consumptionHabits.otherSubstances || undefined,
      },
      waterConsumptionLiters: parseFloat(formData.waterConsumptionLiters as string) || undefined,

      nutritionalDiagnosis: formData.nutritionalDiagnosis || undefined,
      nutritionalPlanAndManagement: formData.nutritionalPlanAndManagement || undefined,
      evolutionAndFollowUpNotes: formData.evolutionAndFollowUpNotes || undefined,
    };

    onSubmit(submitData);
  };

  return (
    <Card className="clinical-form-card">
      <Card.Header>
        <h5 className="mb-0 d-flex align-items-center">
          {isEditing ? (
            <MdEdit className="text-primary me-2" />
          ) : (
            <MdAdd className="text-primary me-2" />
          )}
          {isEditing ? 'Editar' : 'Nuevo'} Expediente Clínico
          <span className="text-muted ms-2"> - {patientName}</span>
        </h5>
      </Card.Header>
      <Card.Body>
        <div className="progress-indicator-modern mb-4">
          <div className="current-step-circle-modern">{currentStep}</div>
          <div className="current-step-info-modern">
            <div className="step-title-modern">{steps[currentStep - 1].title}</div>
            <div className="step-counter-modern">Paso {currentStep} de {steps.length}</div>
            {steps[currentStep - 1].required && <small className="step-required-modern">*Requerido</small>}
          </div>
        </div>

        <Form onSubmit={handleSubmit}>
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
                  value={formData.currentProblems.mouth_mechanics}
                  onChange={(e) => handleInputChange('currentProblems', 'mouth_mechanics', e.target.value)}
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
                  value={formData.currentProblems.other_problems}
                  onChange={(e) => handleInputChange('currentProblems', 'other_problems', e.target.value)}
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

          {currentStep === 3 && (
            <div className="step-content">
              <h6 className="mb-3">
                <i className="fas fa-pills me-2" aria-hidden="true"></i>
                Enfermedades Diagnosticadas y Medicamentos
              </h6>
              
              <div className="row">
                <div className="col-12 col-md-6">
                  <div className="form-check mb-3">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id="diagnosedDiseases-hasDisease"
                      name="hasDisease"
                      checked={Boolean(formData.diagnosedDiseases.hasDisease)}
                      onChange={(e) => handleInputChange('diagnosedDiseases', 'hasDisease', e.target.checked)}
                      title="Marcar si el paciente tiene alguna enfermedad diagnosticada"
                      aria-label="Tiene enfermedad diagnosticada"
                    />
                    <label 
                      className="form-check-label" 
                      htmlFor="diagnosedDiseases-hasDisease"
                    >
                      Tiene enfermedad diagnosticada
                    </label>
                  </div>
                </div>
                <div className="col-12 col-md-6">
                  <div className="mb-3">
                    <label className="form-label" htmlFor="diagnosedDiseases-diseaseName">Nombre de la Enfermedad</label>
                    <input
                      type="text"
                      className="form-control"
                      id="diagnosedDiseases-diseaseName"
                      name="diseaseName"
                      title="Nombre de la Enfermedad"
                      aria-label="Nombre de la Enfermedad"
                      value={formData.diagnosedDiseases.diseaseName}
                      onChange={(e) => handleInputChange('diagnosedDiseases', 'diseaseName', e.target.value)}
                      disabled={!formData.diagnosedDiseases.hasDisease}
                      placeholder="Ej: Diabetes, Hipertensión..."
                    />
                  </div>
                </div>
              </div>

              <div className="row">
                <div className="col-12 col-md-6">
                  <div className="mb-3">
                    <label className="form-label" htmlFor="diagnosedDiseases-sinceWhen">¿Desde cuándo?</label>
                    <input
                      type="text"
                      className="form-control"
                      id="diagnosedDiseases-sinceWhen"
                      name="sinceWhen"
                      title="¿Desde cuándo?"
                      aria-label="¿Desde cuándo tiene la enfermedad?"
                      value={formData.diagnosedDiseases.sinceWhen}
                      onChange={(e) => handleInputChange('diagnosedDiseases', 'sinceWhen', e.target.value)}
                      disabled={!formData.diagnosedDiseases.hasDisease}
                      placeholder="Ej: Hace 2 años, Desde 2020..."
                    />
                  </div>
                </div>
                <div className="col-12 col-md-6">
                  <div className="form-check mb-3 d-flex align-items-center" style={{ minHeight: '38px' }}>
                    <input
                      className="form-check-input me-2"
                      type="checkbox"
                      id="diagnosedDiseases-takesMedication"
                      name="takesMedication"
                      checked={Boolean(formData.diagnosedDiseases.takesMedication)}
                      onChange={(e) => handleInputChange('diagnosedDiseases', 'takesMedication', e.target.checked)}
                      disabled={!formData.diagnosedDiseases.hasDisease}
                      title="Marcar si el paciente toma medicamentos"
                      aria-label="Toma medicamentos"
                    />
                    <label 
                      className="form-check-label" 
                      htmlFor="diagnosedDiseases-takesMedication"
                    >
                      Toma medicamentos
                    </label>
                  </div>
                </div>
              </div>

              <div className="mb-3">
                <label className="form-label" htmlFor="diagnosedDiseases-medicationsList">
                  Lista de Medicamentos
                  <small className="text-muted ms-2">(Separar con comas)</small>
                </label>
                <textarea
                  className="form-control"
                  id="diagnosedDiseases-medicationsList"
                  name="medicationsList"
                  title="Lista de Medicamentos"
                  aria-label="Lista de Medicamentos que toma el paciente"
                  rows={3}
                  value={formData.diagnosedDiseases.medicationsList}
                  onChange={(e) => handleInputChange('diagnosedDiseases', 'medicationsList', e.target.value)}
                  disabled={!formData.diagnosedDiseases.takesMedication}
                  placeholder="Ej: Metformina 500mg, Losartán 50mg, Aspirina 100mg"
                />
                <div className="form-text">
                  Escriba cada medicamento separado por comas. Incluya la dosis si la conoce.
                </div>
              </div>

              <hr className="my-4" />

              <h6 className="mb-3">Enfermedades Importantes</h6>
              <div className="row">
                <div className="col-12 col-md-6">
                  <div className="form-check mb-3">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id="diagnosedDiseases-hasImportantDisease"
                      name="hasImportantDisease"
                      checked={Boolean(formData.diagnosedDiseases.hasImportantDisease)}
                      onChange={(e) => handleInputChange('diagnosedDiseases', 'hasImportantDisease', e.target.checked)}
                      title="Marcar si el paciente tiene alguna enfermedad importante"
                      aria-label="Tiene enfermedad importante"
                    />
                    <label 
                      className="form-check-label" 
                      htmlFor="diagnosedDiseases-hasImportantDisease"
                    >
                      Tiene enfermedad importante
                    </label>
                  </div>
                </div>
                <div className="col-12 col-md-6">
                  <div className="mb-3">
                    <label className="form-label" htmlFor="diagnosedDiseases-importantDiseaseName">Nombre de la Enfermedad Importante</label>
                    <input
                      type="text"
                      className="form-control"
                      id="diagnosedDiseases-importantDiseaseName"
                      name="importantDiseaseName"
                      title="Nombre de la Enfermedad Importante"
                      aria-label="Nombre de la Enfermedad Importante"
                      value={formData.diagnosedDiseases.importantDiseaseName}
                      onChange={(e) => handleInputChange('diagnosedDiseases', 'importantDiseaseName', e.target.value)}
                      disabled={!formData.diagnosedDiseases.hasImportantDisease}
                      placeholder="Ej: Cáncer, Insuficiencia renal..."
                    />
                  </div>
                </div>
              </div>

              <div className="row">
                <div className="col-12 col-md-6">
                  <div className="form-check mb-3">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id="diagnosedDiseases-takesSpecialTreatment"
                      name="takesSpecialTreatment"
                      checked={Boolean(formData.diagnosedDiseases.takesSpecialTreatment)}
                      onChange={(e) => handleInputChange('diagnosedDiseases', 'takesSpecialTreatment', e.target.checked)}
                      title="Marcar si el paciente lleva tratamiento especial"
                      aria-label="Lleva tratamiento especial"
                    />
                    <label 
                      className="form-check-label" 
                      htmlFor="diagnosedDiseases-takesSpecialTreatment"
                    >
                      Lleva tratamiento especial
                    </label>
                  </div>
                </div>
                <div className="col-12 col-md-6">
                  <div className="mb-3">
                    <label className="form-label" htmlFor="diagnosedDiseases-specialTreatmentDetails">Detalles del Tratamiento</label>
                    <input
                      type="text"
                      className="form-control"
                      id="diagnosedDiseases-specialTreatmentDetails"
                      name="specialTreatmentDetails"
                      title="Detalles del Tratamiento"
                      aria-label="Detalles del Tratamiento Especial"
                      value={formData.diagnosedDiseases.specialTreatmentDetails}
                      onChange={(e) => handleInputChange('diagnosedDiseases', 'specialTreatmentDetails', e.target.value)}
                      disabled={!formData.diagnosedDiseases.takesSpecialTreatment}
                      placeholder="Ej: Quimioterapia, Diálisis..."
                    />
                  </div>
                </div>
              </div>

              <div className="row">
                <div className="col-12 col-md-6">
                  <div className="form-check mb-3">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id="diagnosedDiseases-hasSurgery"
                      name="hasSurgery"
                      checked={Boolean(formData.diagnosedDiseases.hasSurgery)}
                      onChange={(e) => handleInputChange('diagnosedDiseases', 'hasSurgery', e.target.checked)}
                      title="Marcar si el paciente ha tenido cirugías"
                      aria-label="Ha tenido cirugías"
                    />
                    <label 
                      className="form-check-label" 
                      htmlFor="diagnosedDiseases-hasSurgery"
                    >
                      Ha tenido cirugías
                    </label>
                  </div>
                </div>
                <div className="col-12 col-md-6">
                  <div className="mb-3">
                    <label className="form-label" htmlFor="diagnosedDiseases-surgeryDetails">Detalles de Cirugías</label>
                    <textarea
                      className="form-control"
                      id="diagnosedDiseases-surgeryDetails"
                      name="surgeryDetails"
                      title="Detalles de Cirugías"
                      aria-label="Detalles de Cirugías"
                      rows={2}
                      value={formData.diagnosedDiseases.surgeryDetails}
                      onChange={(e) => handleInputChange('diagnosedDiseases', 'surgeryDetails', e.target.value)}
                      disabled={!formData.diagnosedDiseases.hasSurgery}
                      placeholder="Ej: Apendicectomía en 2019, Colecistectomía..."
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {currentStep === 4 && (
            <div className="step-content">
              <h6 className="mb-3">
                <i className="fas fa-users me-2" aria-hidden="true"></i>
                Antecedentes Familiares
              </h6>
              
              <div className="mb-4">
                <p className="text-muted">
                  Marque las condiciones médicas que hayan presentado familiares directos (padres, hermanos, abuelos).
                </p>
                
                <div className="row">
                  {[
                    { key: 'obesity', label: 'Obesidad', color: 'bg-warning' },
                    { key: 'diabetes', label: 'Diabetes', color: 'bg-danger' },
                    { key: 'hta', label: 'Hipertensión (HTA)', color: 'bg-info' },
                    { key: 'cancer', label: 'Cáncer', color: 'bg-dark' },
                    { key: 'hypoHyperthyroidism', label: 'Problemas de Tiroides', color: 'bg-primary' },
                    { key: 'dyslipidemia', label: 'Dislipidemia', color: 'bg-secondary' },
                  ].map(({ key, label, color }) => {
                    const checkboxId = `familyMedicalHistory-${key}`;
                    const isChecked = Boolean(formData.familyMedicalHistory[key as keyof typeof formData.familyMedicalHistory]);
                    return (
                      <div key={key} className="col-6 col-md-4 mb-3">
                        <div className="form-check">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            id={checkboxId}
                            name={key}
                            checked={isChecked}
                            onChange={(e) => {
                              console.log(`Family history ${key} changed:`, e.target.checked); // Debug
                              handleInputChange('familyMedicalHistory', key, e.target.checked);
                            }}
                            title={`Marcar si familiares han tenido ${label.toLowerCase()}`}
                            aria-label={`${label} - Antecedentes familiares`}
                          />
                          <label 
                            className="form-check-label" 
                            htmlFor={checkboxId}
                            style={{ cursor: 'pointer', userSelect: 'none' }}
                          >
                            <span className={`badge ${color} me-2`}></span>
                            {label}
                          </label>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="mb-3">
                <label className="form-label" htmlFor="familyMedicalHistory-otherHistory">
                  Otros Antecedentes Familiares
                </label>
                <textarea
                  className="form-control"
                  id="familyMedicalHistory-otherHistory"
                  name="familyMedicalHistory-otherHistory"
                  title="Otros Antecedentes Familiares"
                  aria-label="Otros antecedentes familiares no mencionados arriba"
                  rows={3}
                  value={formData.familyMedicalHistory.otherHistory}
                  onChange={(e) => handleInputChange('familyMedicalHistory', 'otherHistory', e.target.value)}
                  placeholder="Ej: Abuelo materno con enfermedad cardíaca, tía con artritis reumatoide, historial familiar de migrañas..."
                />
                <div className="form-text">
                  Mencione cualquier otra condición médica relevante en la familia que no esté listada arriba.
                </div>
              </div>

              <div className="alert alert-info">
                <i className="fas fa-info-circle me-2"></i>
                <strong>Nota:</strong> La información sobre antecedentes familiares ayuda a identificar factores de riesgo genéticos y elaborar un plan nutricional más personalizado.
              </div>
            </div>
          )}

          {currentStep === 5 && (
            <div className="step-content">
              <h6 className="mb-3">
                <i className="fas fa-running me-2" aria-hidden="true"></i>
                Estilo de Vida del Paciente
              </h6>
              
              <div className="mb-4">
                <h6 className="mb-3">Nivel de Actividad</h6>
                <div className="mb-3">
                  <label className="form-label" htmlFor="activityLevelDescription">Descripción del Nivel de Actividad</label>
                  <textarea
                    className="form-control"
                    id="activityLevelDescription"
                    name="activityLevelDescription"
                    title="Descripción del Nivel de Actividad"
                    aria-label="Descripción del nivel de actividad del paciente"
                    rows={3}
                    value={formData.activityLevelDescription}
                    onChange={(e) => handleBasicChange('activityLevelDescription', e.target.value)}
                    placeholder="Ej: Sedentario, trabajo de oficina, camina ocasionalmente..."
                  />
                </div>
              </div>

              <div className="mb-4">
                <h6 className="mb-3">Ejercicio Físico</h6>
                <div className="row">
                  <div className="col-12 col-md-6">
                    <div className="form-check mb-3">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id="physicalExercise-performsExercise"
                        name="performsExercise"
                        checked={Boolean(formData.physicalExercise.performsExercise)}
                        onChange={(e) => handleInputChange('physicalExercise', 'performsExercise', e.target.checked)}
                        title="Marcar si el paciente realiza ejercicio físico"
                        aria-label="Realiza ejercicio físico"
                      />
                      <label 
                        className="form-check-label" 
                        htmlFor="physicalExercise-performsExercise"
                      >
                        ¿Realiza ejercicio físico?
                      </label>
                    </div>
                  </div>
                  <div className="col-12 col-md-6">
                    <div className="mb-3">
                      <label className="form-label" htmlFor="physicalExercise-type">Tipo de Ejercicio</label>
                      <input
                        type="text"
                        className="form-control"
                        id="physicalExercise-type"
                        name="physicalExercise-type"
                        title="Tipo de Ejercicio"
                        aria-label="Tipo de ejercicio que realiza"
                        value={formData.physicalExercise.type}
                        onChange={(e) => handleInputChange('physicalExercise', 'type', e.target.value)}
                        disabled={!formData.physicalExercise.performsExercise}
                        placeholder="Ej: Caminar, correr, natación, gimnasio..."
                      />
                    </div>
                  </div>
                </div>
                
                <div className="row">
                  <div className="col-12 col-md-4">
                    <div className="mb-3">
                      <label className="form-label" htmlFor="physicalExercise-frequency">Frecuencia</label>
                      <input
                        type="text"
                        className="form-control"
                        id="physicalExercise-frequency"
                        name="physicalExercise-frequency"
                        title="Frecuencia del Ejercicio"
                        aria-label="Frecuencia con la que realiza ejercicio"
                        value={formData.physicalExercise.frequency}
                        onChange={(e) => handleInputChange('physicalExercise', 'frequency', e.target.value)}
                        disabled={!formData.physicalExercise.performsExercise}
                        placeholder="Ej: 3 veces por semana"
                      />
                    </div>
                  </div>
                  <div className="col-12 col-md-4">
                    <div className="mb-3">
                      <label className="form-label" htmlFor="physicalExercise-duration">Duración</label>
                      <input
                        type="text"
                        className="form-control"
                        id="physicalExercise-duration"
                        name="physicalExercise-duration"
                        title="Duración del Ejercicio"
                        aria-label="Duración de cada sesión de ejercicio"
                        value={formData.physicalExercise.duration}
                        onChange={(e) => handleInputChange('physicalExercise', 'duration', e.target.value)}
                        disabled={!formData.physicalExercise.performsExercise}
                        placeholder="Ej: 45 minutos"
                      />
                    </div>
                  </div>
                  <div className="col-12 col-md-4">
                    <div className="mb-3">
                      <label className="form-label" htmlFor="physicalExercise-sinceWhen">¿Desde cuándo?</label>
                      <input
                        type="text"
                        className="form-control"
                        id="physicalExercise-sinceWhen"
                        name="physicalExercise-sinceWhen"
                        title="¿Desde cuándo realiza ejercicio?"
                        aria-label="¿Desde cuándo realiza ejercicio?"
                        value={formData.physicalExercise.sinceWhen}
                        onChange={(e) => handleInputChange('physicalExercise', 'sinceWhen', e.target.value)}
                        disabled={!formData.physicalExercise.performsExercise}
                        placeholder="Ej: Hace 2 años"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="mb-4">
                <h6 className="mb-3">Hábitos de Consumo</h6>
                <div className="row">
                  <div className="col-12 col-md-6">
                    <div className="mb-3">
                      <label className="form-label" htmlFor="consumptionHabits-alcohol">Consumo de Alcohol</label>
                      <input
                        type="text"
                        className="form-control"
                        id="consumptionHabits-alcohol"
                        name="consumptionHabits-alcohol"
                        title="Consumo de Alcohol"
                        aria-label="Describe el consumo de alcohol"
                        value={formData.consumptionHabits.alcohol}
                        onChange={(e) => handleInputChange('consumptionHabits', 'alcohol', e.target.value)}
                        placeholder="Ej: Social, fin de semana, nunca, diario..."
                      />
                    </div>
                  </div>
                  <div className="col-12 col-md-6">
                    <div className="mb-3">
                      <label className="form-label" htmlFor="consumptionHabits-tobacco">Consumo de Tabaco</label>
                      <input
                        type="text"
                        className="form-control"
                        id="consumptionHabits-tobacco"
                        name="consumptionHabits-tobacco"
                        title="Consumo de Tabaco"
                        aria-label="Describe el consumo de tabaco"
                        value={formData.consumptionHabits.tobacco}
                        onChange={(e) => handleInputChange('consumptionHabits', 'tobacco', e.target.value)}
                        placeholder="Ej: No fuma, 5 cigarrillos/día, dejó hace 1 año..."
                      />
                    </div>
                  </div>
                </div>
                
                <div className="row">
                  <div className="col-12 col-md-6">
                    <div className="mb-3">
                      <label className="form-label" htmlFor="consumptionHabits-coffee">Consumo de Café</label>
                      <input
                        type="text"
                        className="form-control"
                        id="consumptionHabits-coffee"
                        name="consumptionHabits-coffee"
                        title="Consumo de Café"
                        aria-label="Describe el consumo de café"
                        value={formData.consumptionHabits.coffee}
                        onChange={(e) => handleInputChange('consumptionHabits', 'coffee', e.target.value)}
                        placeholder="Ej: 2 tazas al día, no toma café, solo por la mañana..."
                      />
                    </div>
                  </div>
                  <div className="col-12 col-md-6">
                    <div className="mb-3">
                      <label className="form-label" htmlFor="consumptionHabits-otherSubstances">Otras Sustancias</label>
                      <input
                        type="text"
                        className="form-control"
                        id="consumptionHabits-otherSubstances"
                        name="consumptionHabits-otherSubstances"
                        title="Otras Sustancias"
                        aria-label="Describe el consumo de otras sustancias"
                        value={formData.consumptionHabits.otherSubstances}
                        onChange={(e) => handleInputChange('consumptionHabits', 'otherSubstances', e.target.value)}
                        placeholder="Ej: Té, bebidas energéticas, ninguna..."
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="mb-4">
                <h6 className="mb-3">Hidratación</h6>
                <div className="row">
                  <div className="col-12 col-md-6">
                    <div className="mb-3">
                      <label className="form-label" htmlFor="waterConsumptionLiters">Consumo de Agua (litros/día)</label>
                      <input
                        type="number"
                        step="0.1"
                        min="0"
                        max="10"
                        className="form-control"
                        id="waterConsumptionLiters"
                        name="waterConsumptionLiters"
                        title="Consumo de Agua (litros/día)"
                        aria-label="Consumo diario de agua en litros"
                        value={formData.waterConsumptionLiters}
                        onChange={(e) => handleBasicChange('waterConsumptionLiters', e.target.value)}
                        placeholder="Ej: 1.5"
                      />
                      <div className="form-text">
                        Cantidad aproximada de agua pura que consume diariamente (no incluye otras bebidas)
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {currentStep === 6 && (
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
                      className={`form-control ${validationErrors.bloodPressure ? 'is-invalid' : ''}`}
                      id="bloodPressure-systolic"
                      name="bloodPressure-systolic"
                      title="Sistólica"
                      aria-label="Presión arterial sistólica"
                      min="50"
                      max="250"
                      placeholder="Ej: 120"
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
                      className={`form-control ${validationErrors.bloodPressure ? 'is-invalid' : ''}`}
                      id="bloodPressure-diastolic"
                      name="bloodPressure-diastolic"
                      title="Diastólica"
                      aria-label="Presión arterial diastólica"
                      min="30"
                      max="150"
                      placeholder="Ej: 80"
                      value={formData.bloodPressure.diastolic}
                      onChange={(e) => handleInputChange('bloodPressure', 'diastolic', e.target.value)}
                      disabled={!formData.bloodPressure.knowsBp}
                    />
                  </div>
                </div>
              </div>
              {validationErrors.bloodPressure && (
                <div className="alert alert-warning d-flex align-items-center mt-3" role="alert">
                  <i className="fas fa-exclamation-triangle me-2" aria-hidden="true"></i>
                  <div>
                    <strong>⚠️ Verificar Presión Arterial:</strong> {validationErrors.bloodPressure}
                  </div>
                </div>
              )}
            </div>
          )}

          {currentStep === 7 && (
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

          {currentStep === 8 && (
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

          <div className="d-flex flex-column flex-md-row justify-content-between align-items-center mt-4 clinical-form-actions">
            <div className="mb-2 mb-md-0">
              {currentStep > 1 && (
                <button
                  type="button"
                  className="btn btn-outline-secondary clinical-btn secondary-btn"
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
                  className="btn btn-primary clinical-btn primary-btn"
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
                  className="btn btn-success clinical-btn success-btn"
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
                className="btn btn-outline-danger clinical-btn danger-btn"
                onClick={onCancel}
                title="Cancelar y volver"
                aria-label="Cancelar y volver"
              >
                <i className="fas fa-times me-1" aria-hidden="true"></i>
                Cancelar
              </button>
            </div>
          </div>
        </Form>
      </Card.Body>
    </Card>
  );
};

export default ClinicalRecordForm; 