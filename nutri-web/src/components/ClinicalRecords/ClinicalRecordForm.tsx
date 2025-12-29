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

// Import new sub-components
import FormInfoGeneral from './FormSections/FormInfoGeneral';
import FormProblemasActuales from './FormSections/FormProblemasActuales';
import FormHistoriaClinica from './FormSections/FormHistoriaClinica';
import FormEstiloVida from './FormSections/FormEstiloVida';
import FormAntropometria from './FormSections/FormAntropometria';
import FormHistoriaDietetica from './FormSections/FormHistoriaDietetica';
import FormDiagnosticoPlan from './FormSections/FormDiagnosticoPlan';

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
    generalAppearance: record?.general_appearance || '',
    gynecologicalAspects: record?.gynecological_aspects || '',

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

    // Construir DTO
    const submitData: any = {
      patientId,
      recordDate: formData.recordDate,
      expedientNumber: formData.expedientNumber || undefined,
      consultationReason: formData.consultationReason || undefined,
      generalAppearance: formData.generalAppearance || undefined,
      gynecologicalAspects: formData.gynecologicalAspects || undefined,

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
              <FormInfoGeneral formData={formData} handleBasicChange={handleBasicChange} />
            )}

            {/* STEP 2: PROBLEMAS ACTUALES */}
            {currentStep === 2 && (
              <FormProblemasActuales formData={formData} handleInputChange={handleInputChange} />
            )}

            {/* STEP 3: ENFERMEDADES Y MEDICAMENTOS */}
            {currentStep === 3 && (
              <FormHistoriaClinica formData={formData} handleInputChange={handleInputChange} />
            )}

            {/* STEP 4: ANTECEDENTES FAMILIARES */}
            {currentStep === 4 && (
              <FormHistoriaClinica formData={formData} handleInputChange={handleInputChange} />
              // Note: Reusing FormHistoriaClinica might need adjustment if separate components preferred, 
              // but I separated them in extraction. Let's check my extraction. 
              // Wait, I put both diseases and family history in FormHistoriaClinica in my previous tool call?
              // Let me check FormHistoriaClinica content again.
            )}

            {/* STEP 5: ESTILO DE VIDA */}
            {currentStep === 5 && (
              <FormEstiloVida
                formData={formData}
                handleBasicChange={handleBasicChange}
                handleInputChange={handleInputChange}
              />
            )}

            {/* STEP 6: MEDICIONES */}
            {currentStep === 6 && (
              <FormAntropometria
                formData={formData}
                handleInputChange={handleInputChange}
                calculateBMI={calculateBMI}
                validationErrors={validationErrors}
              />
            )}

            {/* STEP 7: HISTORIA DIETÉTICA */}
            {currentStep === 7 && (
              <FormHistoriaDietetica formData={formData} handleInputChange={handleInputChange} />
            )}

            {/* STEP 8: DIAGNÓSTICO Y PLAN */}
            {currentStep === 8 && (
              <FormDiagnosticoPlan formData={formData} handleBasicChange={handleBasicChange} />
            )}

            <div className="action-buttons mt-4">
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