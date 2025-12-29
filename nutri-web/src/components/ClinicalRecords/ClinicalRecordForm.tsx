import React, { useState, useEffect } from 'react';
import type { ClinicalRecord, CreateClinicalRecordDto, UpdateClinicalRecordDto } from '../../types/clinical-record';
import { clinicalRecordsService } from '../../services/clinicalRecordsService';
import { Form } from 'react-bootstrap';
import { MdAdd, MdEdit, MdCheck, MdArrowForward, MdArrowBack, MdSave, MdCancel } from 'react-icons/md';
import {
  FaInfoCircle, FaExclamationTriangle, FaPills, FaUsers,
  FaRunning, FaRuler, FaUtensils, FaStethoscope
} from 'react-icons/fa';
import '../../styles/clinical-form-modern.css';

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
  loading = false
}) => {
  const isEditing = !!record;

  // Estados para el flujo paso a paso
  const [currentStep, setCurrentStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [validationErrors, setValidationErrors] = useState<{ [key: string]: string }>({});

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
      observations: record?.current_problems?.observations || ''
    },

    // Mediciones antropométricas
    anthropometricMeasurements: {
      currentWeightKg: record?.anthropometric_measurements?.current_weight_kg || '',
      habitualWeightKg: record?.anthropometric_measurements?.habitual_weight_kg || '',
      heightM: record?.anthropometric_measurements?.height_m || '',
      waistCircCm: record?.anthropometric_measurements?.waist_circ_cm || '',
      hipCircCm: record?.anthropometric_measurements?.hip_circ_cm || ''
    },

    // Presión arterial
    bloodPressure: {
      knowsBp: record?.blood_pressure?.knows_bp || false,
      habitualBp: record?.blood_pressure?.habitual_bp || '',
      systolic: record?.blood_pressure?.systolic || '',
      diastolic: record?.blood_pressure?.diastolic || ''
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
      supplementDetails: record?.dietary_history?.supplement_details || ''
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
      surgeryDetails: record?.diagnosed_diseases?.surgery_details || ''
    },

    // Antecedentes Familiares
    familyMedicalHistory: {
      obesity: record?.family_medical_history?.obesity || false,
      diabetes: record?.family_medical_history?.diabetes || false,
      hta: record?.family_medical_history?.hta || false,
      cancer: record?.family_medical_history?.cancer || false,
      hypoHyperthyroidism: record?.family_medical_history?.hypo_hyperthyroidism || false,
      dyslipidemia: record?.family_medical_history?.dyslipidemia || false,
      otherHistory: record?.family_medical_history?.other_history || ''
    },

    // Estilo de Vida
    activityLevelDescription: record?.activity_level_description || '',
    physicalExercise: {
      performsExercise: record?.physical_exercise?.performs_exercise || false,
      type: record?.physical_exercise?.type || '',
      frequency: record?.physical_exercise?.frequency || '',
      duration: record?.physical_exercise?.duration || '',
      sinceWhen: record?.physical_exercise?.since_when || ''
    },
    consumptionHabits: {
      alcohol: record?.consumption_habits?.alcohol || '',
      tobacco: record?.consumption_habits?.tobacco || '',
      coffee: record?.consumption_habits?.coffee || '',
      otherSubstances: record?.consumption_habits?.other_substances || ''
    },
    waterConsumptionLiters: record?.water_consumption_liters || '',

    // Diagnóstico y plan
    nutritionalDiagnosis: record?.nutritional_diagnosis || '',
    nutritionalPlanAndManagement: record?.nutritional_plan_and_management || '',
    evolutionAndFollowUpNotes: record?.evolution_and_follow_up_notes || ''
  });

  // Configuración de pasos
  const steps = [
    { id: 1, title: 'Datos Básicos', icon: <FaInfoCircle />, required: true },
    { id: 2, title: 'Problemas Actuales', icon: <FaExclamationTriangle />, required: false },
    { id: 3, title: 'Salud y Medicamentos', icon: <FaPills />, required: false },
    { id: 4, title: 'Antecedentes Familiares', icon: <FaUsers />, required: false },
    { id: 5, title: 'Estilo de Vida', icon: <FaRunning />, required: false },
    { id: 6, title: 'Mediciones', icon: <FaRuler />, required: false },
    { id: 7, title: 'Historia Dietética', icon: <FaUtensils />, required: false },
    { id: 8, title: 'Diagnóstico y Plan', icon: <FaStethoscope />, required: true },
  ];

  // Validación por pasos
  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1: // Datos Básicos
        return !!(formData.recordDate && formData.consultationReason);
      case 8: // Diagnóstico y Plan
        return !!(formData.nutritionalDiagnosis && formData.nutritionalPlanAndManagement);
      default:
        return true;
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

  // Obtener número de expediente
  useEffect(() => {
    if (!isEditing && patientId) {
      clinicalRecordsService.getPatientRecordsCount(patientId)
        .then(count => {
          setFormData(prev => ({
            ...prev,
            expedientNumber: (count + 1).toString()
          }));
        })
        .catch(error => {
          console.error('Error al obtener el conteo de expedientes:', error);
          setFormData(prev => ({ ...prev, expedientNumber: '1' }));
        });
    }
    // Fecha automática si es nuevo
    if (!isEditing) {
      setFormData(prev => ({
        ...prev,
        recordDate: new Date().toISOString().split('T')[0]
      }));
    }
  }, [patientId, isEditing]);

  const validateBloodPressure = (systolic: number, diastolic: number): string[] => {
    const errors: string[] = [];
    if (diastolic >= systolic) {
      errors.push(`La diastólica (${diastolic}) no puede ser mayor o igual que la sistólica (${systolic})`);
    }
    if (systolic > 200 || diastolic > 120) {
      errors.push(`Valores inusualmente altos (${systolic}/${diastolic}). Verificar.`);
    }
    if (systolic < 60 || diastolic < 40) {
      errors.push(`Valores inusualmente bajos (${systolic}/${diastolic}). Verificar.`);
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
          [field]: value
        }
      };
    });

    if (section === 'bloodPressure' && (field === 'systolic' || field === 'diastolic')) {
      const currentBP = { ...formData.bloodPressure, [field]: value };
      const systolic = parseFloat(currentBP.systolic as string) || 0;
      const diastolic = parseFloat(currentBP.diastolic as string) || 0;

      if (systolic > 0 && diastolic > 0) {
        const bpErrors = validateBloodPressure(systolic, diastolic);
        setValidationErrors(prev => ({
          ...prev,
          bloodPressure: bpErrors.length > 0 ? bpErrors[0] : ''
        }));
      } else {
        setValidationErrors(prev => ({ ...prev, bloodPressure: '' }));
      }
    }
  };

  const handleBasicChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const calculateBMI = () => {
    const weight = parseFloat(formData.anthropometricMeasurements.currentWeightKg as string);
    const height = parseFloat(formData.anthropometricMeasurements.heightM as string);
    if (weight && height && height > 0) {
      return (weight / (height * height)).toFixed(1);
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep(currentStep)) return;

    // Construir DTO (simplificado para brevedad, mapeando campos como en el original)
    const submitData: any = {
      patientId,
      recordDate: formData.recordDate,
      expedientNumber: formData.expedientNumber || undefined,
      consultationReason: formData.consultationReason || undefined,
      currentProblems: {
        diarrhea: !!formData.currentProblems.diarrhea,
        constipation: !!formData.currentProblems.constipation,
        gastritis: !!formData.currentProblems.gastritis,
        ulcer: !!formData.currentProblems.ulcer,
        nausea: !!formData.currentProblems.nausea,
        pyrosis: !!formData.currentProblems.pyrosis,
        vomiting: !!formData.currentProblems.vomiting,
        colitis: !!formData.currentProblems.colitis,
        mouth_mechanics: formData.currentProblems.mouth_mechanics || undefined,
        other_problems: formData.currentProblems.other_problems || undefined,
        observations: formData.currentProblems.observations || undefined
      },
      anthropometricMeasurements: {
        currentWeightKg: parseFloat(formData.anthropometricMeasurements.currentWeightKg as string) || undefined,
        habitualWeightKg: parseFloat(formData.anthropometricMeasurements.habitualWeightKg as string) || undefined,
        heightM: parseFloat(formData.anthropometricMeasurements.heightM as string) || undefined,
        waistCircCm: parseFloat(formData.anthropometricMeasurements.waistCircCm as string) || undefined,
        hipCircCm: parseFloat(formData.anthropometricMeasurements.hipCircCm as string) || undefined
      },
      bloodPressure: {
        knowsBp: !!formData.bloodPressure.knowsBp,
        systolic: parseFloat(formData.bloodPressure.systolic as string) || undefined,
        diastolic: parseFloat(formData.bloodPressure.diastolic as string) || undefined,
        habitualBp: formData.bloodPressure.habitualBp || undefined
      },
      dietaryHistory: {
        receivedNutritionalGuidance: !!formData.dietaryHistory.receivedNutritionalGuidance,
        whenReceived: formData.dietaryHistory.whenReceived || undefined,
        adherenceLevel: formData.dietaryHistory.adherenceLevel || undefined,
        preferredFoods: formData.dietaryHistory.preferredFoods ? formData.dietaryHistory.preferredFoods.split(',').map((f: string) => f.trim()) : undefined,
        dislikedFoods: formData.dietaryHistory.dislikedFoods ? formData.dietaryHistory.dislikedFoods.split(',').map((f: string) => f.trim()) : undefined,
        malestarAlergiaFoods: formData.dietaryHistory.malestarAlergiaFoods ? formData.dietaryHistory.malestarAlergiaFoods.split(',').map((f: string) => f.trim()) : undefined,
        takesSupplements: !!formData.dietaryHistory.takesSupplements,
        supplementDetails: formData.dietaryHistory.supplementDetails || undefined
      },
      diagnosedDiseases: {
        hasDisease: !!formData.diagnosedDiseases.hasDisease,
        diseaseName: formData.diagnosedDiseases.diseaseName || undefined,
        sinceWhen: formData.diagnosedDiseases.sinceWhen || undefined,
        takesMedication: !!formData.diagnosedDiseases.takesMedication,
        medications_list: formData.diagnosedDiseases.medicationsList ? formData.diagnosedDiseases.medicationsList.split(',').map((m: string) => m.trim()) : undefined,
        hasImportantDisease: !!formData.diagnosedDiseases.hasImportantDisease,
        importantDiseaseName: formData.diagnosedDiseases.importantDiseaseName || undefined,
        takesSpecialTreatment: !!formData.diagnosedDiseases.takesSpecialTreatment,
        specialTreatmentDetails: formData.diagnosedDiseases.specialTreatmentDetails || undefined,
        hasSurgery: !!formData.diagnosedDiseases.hasSurgery,
        surgeryDetails: formData.diagnosedDiseases.surgeryDetails || undefined
      },
      familyMedicalHistory: {
        obesity: !!formData.familyMedicalHistory.obesity,
        diabetes: !!formData.familyMedicalHistory.diabetes,
        hta: !!formData.familyMedicalHistory.hta,
        cancer: !!formData.familyMedicalHistory.cancer,
        hypoHyperthyroidism: !!formData.familyMedicalHistory.hypoHyperthyroidism,
        dyslipidemia: !!formData.familyMedicalHistory.dyslipidemia,
        otherHistory: formData.familyMedicalHistory.otherHistory || undefined
      },
      activityLevelDescription: formData.activityLevelDescription || undefined,
      physicalExercise: {
        performsExercise: !!formData.physicalExercise.performsExercise,
        type: formData.physicalExercise.type || undefined,
        frequency: formData.physicalExercise.frequency || undefined,
        duration: formData.physicalExercise.duration || undefined,
        sinceWhen: formData.physicalExercise.sinceWhen || undefined
      },
      consumptionHabits: {
        alcohol: formData.consumptionHabits.alcohol || undefined,
        tobacco: formData.consumptionHabits.tobacco || undefined,
        coffee: formData.consumptionHabits.coffee || undefined,
        otherSubstances: formData.consumptionHabits.otherSubstances || undefined
      },
      waterConsumptionLiters: parseFloat(formData.waterConsumptionLiters as string) || undefined,
      nutritionalDiagnosis: formData.nutritionalDiagnosis || undefined,
      nutritionalPlanAndManagement: formData.nutritionalPlanAndManagement || undefined,
      evolutionAndFollowUpNotes: formData.evolutionAndFollowUpNotes || undefined
    };

    onSubmit(submitData);
  };

  return (
    <div className="clinical-form-container">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4 className="mb-0 text-primary fw-bold">
          {isEditing ? <MdEdit className="me-2" /> : <MdAdd className="me-2" />}
          {isEditing ? 'Editar' : 'Nuevo'} Expediente Clínico
          <span className="text-muted fs-5 ms-2 fw-normal">| {patientName}</span>
        </h4>
        <button className="btn btn-outline-secondary btn-sm" onClick={onCancel}>
          <MdCancel className="me-1" /> Cancelar
        </button>
      </div>

      <div className="clinical-form-wrapper">
        {/* Sidebar Stepper */}
        <div className="form-sidebar">
          {steps.map((step) => (
            <div
              key={step.id}
              className={`step-item ${currentStep === step.id ? 'active' : ''} ${completedSteps.includes(step.id) ? 'completed' : ''}`}
              onClick={() => setCurrentStep(step.id)}
            >
              <div className="step-icon-box">
                {completedSteps.includes(step.id) && currentStep !== step.id ? <MdCheck /> : step.id}
              </div>
              <div className="step-info">
                <div className="step-label">{step.title}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Content Area */}
        <div className="form-content-area">
          <div className="section-header">
            <span className="section-icon">{steps[currentStep - 1].icon}</span>
            <h4>{steps[currentStep - 1].title}</h4>
          </div>

          <Form onSubmit={handleSubmit} className="fade-in">
            {/* STEP 1: DATOS BÁSICOS */}
            {currentStep === 1 && (
              <>
                <div className="row g-3 mb-4">
                  <div className="col-md-6">
                    <div className="form-floating-custom">
                      <label className="form-label-styled">Fecha del Registro *</label>
                      <input
                        type="date"
                        className="form-control"
                        value={formData.recordDate}
                        onChange={(e) => handleBasicChange('recordDate', e.target.value)}
                        required
                      />
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="form-floating-custom">
                      <label className="form-label-styled">Número de Expediente</label>
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
                  <label className="form-label-styled">Motivo de Consulta *</label>
                  <textarea
                    className="form-control"
                    rows={4}
                    value={formData.consultationReason}
                    onChange={(e) => handleBasicChange('consultationReason', e.target.value)}
                    placeholder="Describe el motivo principal..."
                    required
                  />
                </div>
              </>
            )}

            {/* STEP 2: PROBLEMAS ACTUALES */}
            {currentStep === 2 && (
              <>
                <h6 className="text-secondary mb-3">Problemas Gastrointestinales</h6>
                <div className="row g-3 mb-4">
                  {[
                    { k: 'diarrhea', l: 'Diarrea' }, { k: 'constipation', l: 'Estreñimiento' },
                    { k: 'gastritis', l: 'Gastritis' }, { k: 'ulcer', l: 'Úlcera' },
                    { k: 'nausea', l: 'Náuseas' }, { k: 'pyrosis', l: 'Pirosis' },
                    { k: 'vomiting', l: 'Vómito' }, { k: 'colitis', l: 'Colitis' }
                  ].map(({ k, l }) => (
                    <div key={k} className="col-12 col-sm-6">
                      <div className={`checkbox-card ${formData.currentProblems[k as keyof typeof formData.currentProblems] ? 'checked' : ''}`}>
                        <input
                          type="checkbox"
                          className="form-check-input"
                          id={`cp-${k}`}
                          checked={!!formData.currentProblems[k as keyof typeof formData.currentProblems]}
                          onChange={(e) => handleInputChange('currentProblems', k, e.target.checked)}
                        />
                        <label htmlFor={`cp-${k}`}>{l}</label>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mb-3">
                  <label className="form-label-styled">Mecánicos de la Boca</label>
                  <input type="text" className="form-control"
                    value={formData.currentProblems.mouth_mechanics}
                    onChange={(e) => handleInputChange('currentProblems', 'mouth_mechanics', e.target.value)}
                    placeholder="Dificultad al masticar..."
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label-styled">Otras Observaciones</label>
                  <textarea className="form-control" rows={3}
                    value={formData.currentProblems.observations}
                    onChange={(e) => handleInputChange('currentProblems', 'observations', e.target.value)}
                    placeholder="Detalles adicionales..."
                  />
                </div>
              </>
            )}

            {/* STEP 3: ENFERMEDADES Y MEDICAMENTOS */}
            {currentStep === 3 && (
              <>
                <div className="form-sub-card">
                  <h6>Enfermedad Diagnosticada</h6>
                  <div className="form-check form-switch mb-3">
                    <input className="form-check-input" type="checkbox" id="hasDisease"
                      checked={formData.diagnosedDiseases.hasDisease}
                      onChange={(e) => handleInputChange('diagnosedDiseases', 'hasDisease', e.target.checked)}
                    />
                    <label className="form-check-label" htmlFor="hasDisease">El paciente tiene una enfermedad diagnosticada</label>
                  </div>
                  {formData.diagnosedDiseases.hasDisease && (
                    <div className="row g-3 fade-in">
                      <div className="col-md-8">
                        <label className="form-label-styled">Nombre</label>
                        <input type="text" className="form-control"
                          value={formData.diagnosedDiseases.diseaseName}
                          onChange={(e) => handleInputChange('diagnosedDiseases', 'diseaseName', e.target.value)}
                        />
                      </div>
                      <div className="col-md-4">
                        <label className="form-label-styled">¿Desde cuándo?</label>
                        <input type="text" className="form-control"
                          value={formData.diagnosedDiseases.sinceWhen}
                          onChange={(e) => handleInputChange('diagnosedDiseases', 'sinceWhen', e.target.value)}
                        />
                      </div>
                      <div className="col-12">
                        <div className="form-check mb-2">
                          <input className="form-check-input" type="checkbox" id="takesMed"
                            checked={formData.diagnosedDiseases.takesMedication}
                            onChange={(e) => handleInputChange('diagnosedDiseases', 'takesMedication', e.target.checked)}
                          />
                          <label htmlFor="takesMed">Toma medicamentos</label>
                        </div>
                        {formData.diagnosedDiseases.takesMedication && (
                          <input type="text" className="form-control mt-2"
                            placeholder="Lista de medicamentos (separados por coma)"
                            value={formData.diagnosedDiseases.medicationsList}
                            onChange={(e) => handleInputChange('diagnosedDiseases', 'medicationsList', e.target.value)}
                          />
                        )}
                      </div>
                    </div>
                  )}
                </div>

                <div className="form-sub-card">
                  <h6>Cirugías Previas</h6>
                  <div className="form-check form-switch mb-2">
                    <input className="form-check-input" type="checkbox" id="hasSurgery"
                      checked={formData.diagnosedDiseases.hasSurgery}
                      onChange={(e) => handleInputChange('diagnosedDiseases', 'hasSurgery', e.target.checked)}
                    />
                    <label htmlFor="hasSurgery">Ha tenido cirugías</label>
                  </div>
                  {formData.diagnosedDiseases.hasSurgery && (
                    <textarea className="form-control mt-2 fade-in" rows={2}
                      placeholder="Detalles de cirugías..."
                      value={formData.diagnosedDiseases.surgeryDetails}
                      onChange={(e) => handleInputChange('diagnosedDiseases', 'surgeryDetails', e.target.value)}
                    />
                  )}
                </div>
              </>
            )}

            {/* STEP 4: ANTECEDENTES FAMILIARES */}
            {currentStep === 4 && (
              <>
                <p className="text-muted mb-4">Marque las condiciones presentes en familiares directos.</p>
                <div className="row g-3">
                  {[
                    { k: 'obesity', l: 'Obesidad' }, { k: 'diabetes', l: 'Diabetes' },
                    { k: 'hta', l: 'Hipertensión' }, { k: 'cancer', l: 'Cáncer' },
                    { k: 'dyslipidemia', l: 'Dislipidemia' }, { k: 'hypoHyperthyroidism', l: 'Tiroides' }
                  ].map(({ k, l }) => (
                    <div key={k} className="col-12 col-sm-6">
                      <div className={`checkbox-card ${formData.familyMedicalHistory[k as keyof typeof formData.familyMedicalHistory] ? 'checked' : ''}`}>
                        <input type="checkbox" className="form-check-input" id={`fmh-${k}`}
                          checked={!!formData.familyMedicalHistory[k as keyof typeof formData.familyMedicalHistory]}
                          onChange={(e) => handleInputChange('familyMedicalHistory', k, e.target.checked)}
                        />
                        <label htmlFor={`fmh-${k}`}>{l}</label>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-4">
                  <label className="form-label-styled">Otros antecedentes</label>
                  <textarea className="form-control" rows={3}
                    value={formData.familyMedicalHistory.otherHistory}
                    onChange={(e) => handleInputChange('familyMedicalHistory', 'otherHistory', e.target.value)}
                    placeholder="Especifique..."
                  />
                </div>
              </>
            )}

            {/* STEP 5: ESTILO DE VIDA */}
            {currentStep === 5 && (
              <>
                <div className="mb-4">
                  <label className="form-label-styled">Nivel de Actividad</label>
                  <textarea className="form-control" rows={2}
                    placeholder="Ej: Sedentario (oficina), Activo (construcción)..."
                    value={formData.activityLevelDescription}
                    onChange={(e) => handleBasicChange('activityLevelDescription', e.target.value)}
                  />
                </div>

                <div className="form-sub-card">
                  <h6>Ejercicio Físico</h6>
                  <div className="form-check form-switch mb-3">
                    <input className="form-check-input" type="checkbox" id="performsExercise"
                      checked={formData.physicalExercise.performsExercise}
                      onChange={(e) => handleInputChange('physicalExercise', 'performsExercise', e.target.checked)}
                    />
                    <label htmlFor="performsExercise">Realiza ejercicio regularmente</label>
                  </div>
                  {formData.physicalExercise.performsExercise && (
                    <div className="row g-3 fade-in">
                      <div className="col-md-6">
                        <input type="text" className="form-control" placeholder="Tipo (Caminar, Gym...)"
                          value={formData.physicalExercise.type}
                          onChange={(e) => handleInputChange('physicalExercise', 'type', e.target.value)}
                        />
                      </div>
                      <div className="col-md-6">
                        <input type="text" className="form-control" placeholder="Frecuencia (ej: 3 veces/sem)"
                          value={formData.physicalExercise.frequency}
                          onChange={(e) => handleInputChange('physicalExercise', 'frequency', e.target.value)}
                        />
                      </div>
                    </div>
                  )}
                </div>

                <div className="row g-3">
                  <div className="col-md-4">
                    <label className="form-label-styled">Consumo de Alcohol</label>
                    <input type="text" className="form-control" placeholder="Frecuencia..."
                      value={formData.consumptionHabits.alcohol}
                      onChange={(e) => handleInputChange('consumptionHabits', 'alcohol', e.target.value)}
                    />
                  </div>
                  <div className="col-md-4">
                    <label className="form-label-styled">Tabaco</label>
                    <input type="text" className="form-control" placeholder="Cantidad..."
                      value={formData.consumptionHabits.tobacco}
                      onChange={(e) => handleInputChange('consumptionHabits', 'tobacco', e.target.value)}
                    />
                  </div>
                  <div className="col-md-4">
                    <label className="form-label-styled">Café</label>
                    <input type="text" className="form-control" placeholder="Tazas/día..."
                      value={formData.consumptionHabits.coffee}
                      onChange={(e) => handleInputChange('consumptionHabits', 'coffee', e.target.value)}
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label-styled">Agua (Litros/día)</label>
                    <input type="number" step="0.5" className="form-control"
                      value={formData.waterConsumptionLiters}
                      onChange={(e) => handleBasicChange('waterConsumptionLiters', e.target.value)}
                    />
                  </div>
                </div>
              </>
            )}

            {/* STEP 6: MEDICIONES */}
            {currentStep === 6 && (
              <>
                <div className="row g-4">
                  <div className="col-md-6">
                    <div className="form-sub-card h-100">
                      <h6>Antropometría</h6>
                      <div className="mb-3">
                        <label className="form-label-styled">Peso Actual (kg)</label>
                        <input type="number" className="form-control"
                          value={formData.anthropometricMeasurements.currentWeightKg}
                          onChange={(e) => handleInputChange('anthropometricMeasurements', 'currentWeightKg', e.target.value)}
                        />
                      </div>
                      <div className="mb-3">
                        <label className="form-label-styled">Estatura (m)</label>
                        <input type="number" step="0.01" className="form-control"
                          value={formData.anthropometricMeasurements.heightM}
                          onChange={(e) => handleInputChange('anthropometricMeasurements', 'heightM', e.target.value)}
                        />
                      </div>
                      <div className="alert alert-light border">
                        <strong>IMC:</strong> {calculateBMI() || '--'}
                      </div>
                    </div>
                  </div>

                  <div className="col-md-6">
                    <div className="form-sub-card h-100">
                      <h6>Presión Arterial</h6>
                      <div className="form-check mb-3">
                        <input className="form-check-input" type="checkbox" id="knowsBp"
                          checked={formData.bloodPressure.knowsBp}
                          onChange={(e) => handleInputChange('bloodPressure', 'knowsBp', e.target.checked)}
                        />
                        <label htmlFor="knowsBp">Conoce su presión arterial</label>
                      </div>
                      {formData.bloodPressure.knowsBp && (
                        <div className="row g-2 fade-in">
                          <div className="col-6">
                            <label className="small text-muted">Sistólica</label>
                            <input type="number" className={`form-control ${validationErrors.bloodPressure ? 'is-invalid' : ''}`}
                              value={formData.bloodPressure.systolic}
                              onChange={(e) => handleInputChange('bloodPressure', 'systolic', e.target.value)}
                            />
                          </div>
                          <div className="col-6">
                            <label className="small text-muted">Diastólica</label>
                            <input type="number" className={`form-control ${validationErrors.bloodPressure ? 'is-invalid' : ''}`}
                              value={formData.bloodPressure.diastolic}
                              onChange={(e) => handleInputChange('bloodPressure', 'diastolic', e.target.value)}
                            />
                          </div>
                          {validationErrors.bloodPressure && (
                            <div className="col-12 text-danger small mt-1">{validationErrors.bloodPressure}</div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* STEP 7: HISTORIA DIETÉTICA */}
            {currentStep === 7 && (
              <>
                <div className="form-sub-card">
                  <div className="form-check mb-3">
                    <input className="form-check-input" type="checkbox" id="receivedGuidance"
                      checked={formData.dietaryHistory.receivedNutritionalGuidance}
                      onChange={(e) => handleInputChange('dietaryHistory', 'receivedNutritionalGuidance', e.target.checked)}
                    />
                    <label htmlFor="receivedGuidance">Ha recibido orientación nutricional antes</label>
                  </div>
                  {formData.dietaryHistory.receivedNutritionalGuidance && (
                    <div className="row g-3 fade-in">
                      <div className="col-md-6">
                        <input type="text" className="form-control" placeholder="¿Cuándo?"
                          value={formData.dietaryHistory.whenReceived}
                          onChange={(e) => handleInputChange('dietaryHistory', 'whenReceived', e.target.value)}
                        />
                      </div>
                      <div className="col-md-6">
                        <select className="form-select"
                          value={formData.dietaryHistory.adherenceLevel}
                          onChange={(e) => handleInputChange('dietaryHistory', 'adherenceLevel', e.target.value)}
                        >
                          <option value="">Nivel de apego...</option>
                          <option value="Excelente">Excelente</option>
                          <option value="Bueno">Bueno</option>
                          <option value="Regular">Regular</option>
                          <option value="Malo">Malo</option>
                        </select>
                      </div>
                    </div>
                  )}
                </div>

                <div className="mb-3">
                  <label className="form-label-styled">Alimentos Preferidos</label>
                  <input type="text" className="form-control"
                    value={formData.dietaryHistory.preferredFoods}
                    onChange={(e) => handleInputChange('dietaryHistory', 'preferredFoods', e.target.value)}
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label-styled">Alimentos que NO le gustan</label>
                  <input type="text" className="form-control"
                    value={formData.dietaryHistory.dislikedFoods}
                    onChange={(e) => handleInputChange('dietaryHistory', 'dislikedFoods', e.target.value)}
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label-styled">Alergias / Malestar</label>
                  <input type="text" className="form-control"
                    value={formData.dietaryHistory.malestarAlergiaFoods}
                    onChange={(e) => handleInputChange('dietaryHistory', 'malestarAlergiaFoods', e.target.value)}
                  />
                </div>
              </>
            )}

            {/* STEP 8: DIAGNÓSTICO Y PLAN */}
            {currentStep === 8 && (
              <>
                <div className="mb-4">
                  <label className="form-label-styled text-primary">Diagnóstico Nutricional *</label>
                  <textarea className="form-control" rows={5}
                    value={formData.nutritionalDiagnosis}
                    onChange={(e) => handleBasicChange('nutritionalDiagnosis', e.target.value)}
                    placeholder="Redacte el diagnóstico completo..."
                    required
                  />
                </div>

                <div className="mb-4">
                  <label className="form-label-styled text-success">Plan y Manejo Nutricional *</label>
                  <textarea className="form-control" rows={5}
                    value={formData.nutritionalPlanAndManagement}
                    onChange={(e) => handleBasicChange('nutritionalPlanAndManagement', e.target.value)}
                    placeholder="Detalle el plan a seguir..."
                    required
                  />
                </div>
              </>
            )}

            <div className="action-buttons">
              <div>
                {currentStep > 1 && (
                  <button type="button" className="btn btn-light btn-prev" onClick={prevStep}>
                    <MdArrowBack className="me-2" /> Anterior
                  </button>
                )}
              </div>
              <div className="d-flex gap-2">
                {currentStep < steps.length ? (
                  <button type="button" className="btn btn-primary btn-next" onClick={nextStep}>
                    Siguiente <MdArrowForward className="ms-2" />
                  </button>
                ) : (
                  <button type="submit" className="btn btn-success btn-save" disabled={loading}>
                    {loading ? 'Guardando...' : <><MdSave className="me-2" /> Guardar Expediente</>}
                  </button>
                )}
              </div>
            </div>

          </Form>
        </div>
      </div>
    </div>
  );
};

export default ClinicalRecordForm;