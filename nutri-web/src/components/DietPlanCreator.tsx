import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Users, Plus, Settings, AlertTriangle, Shield, Database } from 'lucide-react';
import type { 
  CreateDietPlanDto, 
  GenerateAIDietDto,
  PlanType, 
  PlanPeriod,
  PathologicalRestrictionsDto
} from '../types/diet';
import type { Patient } from '../types/patient';
import type { ClinicalRecord } from '../types/clinical-record';

interface DietPlanCreatorProps {
  patients: Patient[];
  onSubmit: (data: CreateDietPlanDto) => void;
  onCancel: () => void;
  onGenerateAI?: (data: GenerateAIDietDto) => void;
  loading?: boolean;
  initialData?: CreateDietPlanDto;
}

const DietPlanCreator: React.FC<DietPlanCreatorProps> = ({
  patients,
  onSubmit,
  onCancel,
  onGenerateAI,
  loading = false,
  initialData
}) => {
  const [planType, setPlanType] = useState<PlanType>('weekly');
  const [planPeriod, setPlanPeriod] = useState<PlanPeriod>('weeks');
  const [timeValue, setTimeValue] = useState(1);
  const [currentStep, setCurrentStep] = useState(1);
  
  // Estados para restricciones patológicas
  const [showPathologicalRestrictions, setShowPathologicalRestrictions] = useState(false);
  const [pathologicalRestrictions, setPathologicalRestrictions] = useState<PathologicalRestrictionsDto>({
    medicalConditions: [],
    allergies: [],
    intolerances: [],
    medications: [],
    specialConsiderations: [],
    emergencyContacts: []
  });
  
  // Estados para datos del paciente
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [patientClinicalRecords, setPatientClinicalRecords] = useState<ClinicalRecord[]>([]);
  const [loadingPatientData, setLoadingPatientData] = useState(false);
  const [autoExtractedRestrictions, setAutoExtractedRestrictions] = useState<PathologicalRestrictionsDto>({
    medicalConditions: [],
    allergies: [],
    intolerances: [],
    medications: [],
    specialConsiderations: [],
    emergencyContacts: []
  });

  const [formData, setFormData] = useState<CreateDietPlanDto>({
    patientId: '',
    name: '',
    description: '',
    startDate: '',
    endDate: '',
    dailyCaloriesTarget: 2000,
    dailyMacrosTarget: {
      protein: 150,
      carbohydrates: 200,
      fats: 67
    },
    notes: '',
    planType: 'weekly',
    planPeriod: 'weeks',
    totalPeriods: 1,
    pathologicalRestrictions: pathologicalRestrictions,
    ...initialData
  });

  const steps = [
    { id: 1, title: 'Información Básica', icon: 'users' },
    { id: 2, title: 'Configuración de Tiempo', icon: 'clock' },
    { id: 3, title: 'Restricciones Patológicas', icon: 'shield' },
    { id: 4, title: 'Configuración de Comidas', icon: 'settings' },
    { id: 5, title: 'Objetivos Nutricionales', icon: 'target' },
    { id: 6, title: 'Revisión y Creación', icon: 'check' }
  ];

  // Función para extraer restricciones del perfil del paciente
  const extractRestrictionsFromPatient = (patient: Patient): PathologicalRestrictionsDto => {
    const restrictions: PathologicalRestrictionsDto = {
      medicalConditions: [],
      allergies: [],
      intolerances: [],
      medications: [],
      specialConsiderations: [],
      emergencyContacts: []
    };

    // Extraer condiciones médicas del perfil
    if (patient.profile.medical_conditions && patient.profile.medical_conditions.length > 0) {
      restrictions.medicalConditions = patient.profile.medical_conditions.map(condition => ({
        name: condition,
        category: 'condition' as const,
        severity: 'moderate' as const,
        dietaryImplications: [],
        restrictedFoods: [],
        recommendedFoods: [],
        monitoringRequirements: [],
        emergencyInstructions: ''
      }));
    }

    // Extraer alergias del perfil
    if (patient.profile.allergies && patient.profile.allergies.length > 0) {
      restrictions.allergies = patient.profile.allergies.map(allergy => ({
        allergen: allergy,
        type: 'food' as const,
        severity: 'moderate' as const,
        symptoms: ['Reacción alérgica'],
        crossReactions: [],
        emergencyMedication: '',
        avoidanceInstructions: `Evitar completamente ${allergy}`
      }));
    }

    // Extraer medicamentos del perfil
    if (patient.profile.medications && patient.profile.medications.length > 0) {
      restrictions.medications = patient.profile.medications.map(medication => ({
        name: medication,
        dosage: '',
        frequency: '',
        foodInteractions: [],
        timingRequirements: ''
      }));
    }

    return restrictions;
  };

  // Función para extraer restricciones del expediente clínico
  const extractRestrictionsFromClinicalRecord = (record: ClinicalRecord): PathologicalRestrictionsDto => {
    const restrictions: PathologicalRestrictionsDto = {
      medicalConditions: [],
      allergies: [],
      intolerances: [],
      medications: [],
      specialConsiderations: [],
      emergencyContacts: []
    };

    // Extraer enfermedades diagnosticadas
    if (record.diagnosed_diseases?.has_disease && record.diagnosed_diseases.disease_name) {
      restrictions.medicalConditions.push({
        name: record.diagnosed_diseases.disease_name,
        category: 'disease' as const,
        severity: 'moderate' as const,
        dietaryImplications: [],
        restrictedFoods: [],
        recommendedFoods: [],
        monitoringRequirements: [],
        emergencyInstructions: ''
      });
    }

    if (record.diagnosed_diseases?.has_important_disease && record.diagnosed_diseases.important_disease_name) {
      restrictions.medicalConditions.push({
        name: record.diagnosed_diseases.important_disease_name,
        category: 'disease' as const,
        severity: 'severe' as const,
        dietaryImplications: [],
        restrictedFoods: [],
        recommendedFoods: [],
        monitoringRequirements: [],
        emergencyInstructions: ''
      });
    }

    // Extraer medicamentos del expediente
    if (record.diagnosed_diseases?.medications_list && record.diagnosed_diseases.medications_list.length > 0) {
      restrictions.medications = record.diagnosed_diseases.medications_list.map(medication => ({
        name: typeof medication === 'string' ? medication : (medication as any)?.name || '',
        dosage: typeof medication === 'string' ? '' : (medication as any)?.dosage || '',
        frequency: typeof medication === 'string' ? '' : (medication as any)?.frequency || '',
        foodInteractions: [],
        timingRequirements: ''
      }));
    }

    // Extraer alergias e intolerancias del expediente
    if (record.dietary_history?.malestar_alergia_foods && record.dietary_history.malestar_alergia_foods.length > 0) {
      restrictions.allergies = record.dietary_history.malestar_alergia_foods.map(food => ({
        allergen: food,
        type: 'food' as const,
        severity: 'moderate' as const,
        symptoms: ['Reacción alérgica'],
        crossReactions: [],
        emergencyMedication: '',
        avoidanceInstructions: `Evitar completamente ${food}`
      }));
    }

    // Extraer consideraciones especiales
    const specialConsiderations: string[] = [];
    
    if (record.current_problems) {
      const problems = [];
      if (record.current_problems.diarrhea) problems.push('Diarrea');
      if (record.current_problems.constipation) problems.push('Estreñimiento');
      if (record.current_problems.gastritis) problems.push('Gastritis');
      if (record.current_problems.ulcer) problems.push('Úlcera');
      if (record.current_problems.nausea) problems.push('Náuseas');
      if (record.current_problems.pyrosis) problems.push('Pirosis');
      if (record.current_problems.vomiting) problems.push('Vómitos');
      if (record.current_problems.colitis) problems.push('Colitis');
      
      if (problems.length > 0) {
        specialConsiderations.push(`Problemas digestivos: ${problems.join(', ')}`);
      }
    }

    if (record.blood_pressure?.systolic && record.blood_pressure.diastolic) {
      specialConsiderations.push(`Presión arterial: ${record.blood_pressure.systolic}/${record.blood_pressure.diastolic} mmHg`);
    }

    if (record.consumption_habits?.alcohol) {
      specialConsiderations.push(`Consumo de alcohol: ${record.consumption_habits.alcohol}`);
    }

    if (record.consumption_habits?.tobacco) {
      specialConsiderations.push(`Consumo de tabaco: ${record.consumption_habits.tobacco}`);
    }

    restrictions.specialConsiderations = specialConsiderations;

    return restrictions;
  };

  // Función para cargar datos del paciente cuando se selecciona
  const loadPatientData = async (patientId: string) => {
    const patient = patients.find(p => p.id === patientId);
    if (!patient) return;

    setSelectedPatient(patient);
    setLoadingPatientData(true);

    try {
      // Extraer restricciones del perfil del paciente
      const profileRestrictions = extractRestrictionsFromPatient(patient);
      
      // TODO: Cargar expedientes clínicos del paciente desde la API
      // Por ahora, simulamos que no hay expedientes
      const clinicalRecords: ClinicalRecord[] = [];
      
      let clinicalRestrictions: PathologicalRestrictionsDto = {
        medicalConditions: [],
        allergies: [],
        intolerances: [],
        medications: [],
        specialConsiderations: [],
        emergencyContacts: []
      };

      // Si hay expedientes, extraer restricciones del más reciente
      if (clinicalRecords.length > 0) {
        const latestRecord = clinicalRecords.sort((a, b) => 
          new Date(b.record_date).getTime() - new Date(a.record_date).getTime()
        )[0];
        clinicalRestrictions = extractRestrictionsFromClinicalRecord(latestRecord);
      }

      // Combinar restricciones del perfil y expediente
      const combinedRestrictions: PathologicalRestrictionsDto = {
        medicalConditions: [
          ...profileRestrictions.medicalConditions,
          ...clinicalRestrictions.medicalConditions
        ],
        allergies: [
          ...profileRestrictions.allergies,
          ...clinicalRestrictions.allergies
        ],
        intolerances: [
          ...profileRestrictions.intolerances,
          ...clinicalRestrictions.intolerances
        ],
        medications: [
          ...profileRestrictions.medications,
          ...clinicalRestrictions.medications
        ],
        specialConsiderations: [
          ...profileRestrictions.specialConsiderations,
          ...clinicalRestrictions.specialConsiderations
        ],
        emergencyContacts: [
          ...profileRestrictions.emergencyContacts,
          ...clinicalRestrictions.emergencyContacts
        ]
      };

      setAutoExtractedRestrictions(combinedRestrictions);
      setPathologicalRestrictions(combinedRestrictions);
      setPatientClinicalRecords(clinicalRecords);

    } catch (error) {
      console.error('Error cargando datos del paciente:', error);
    } finally {
      setLoadingPatientData(false);
    }
  };

  // Cargar datos del paciente cuando cambia la selección
  useEffect(() => {
    if (formData.patientId) {
      loadPatientData(formData.patientId);
    }
  }, [formData.patientId]);

  const getPeriodLabel = () => {
    switch (planPeriod) {
      case 'days': return 'días';
      case 'weeks': return 'semanas';
      case 'months': return 'meses';
      case 'quarters': return 'trimestres';
      case 'years': return 'años';
      default: return 'períodos';
    }
  };

  const getTimeUnitLabel = () => {
    switch (planPeriod) {
      case 'days': return 'días';
      case 'weeks': return 'semanas';
      case 'months': return 'meses';
      case 'quarters': return 'trimestres';
      case 'years': return 'años';
      default: return 'unidades';
    }
  };

  const getPlanTypeLabel = () => {
    switch (planType) {
      case 'daily': return 'Diario';
      case 'weekly': return 'Semanales';
      case 'monthly': return 'Mensual';
      case 'custom': return 'Personalizado';
      case 'flexible': return 'Flexible';
      default: return 'Nutricional';
    }
  };

  const validateForm = (): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];

    if (!formData.patientId) errors.push('Debe seleccionar un paciente');
    if (!formData.name) errors.push('Debe ingresar un nombre para el plan');
    if (!formData.startDate) errors.push('Debe seleccionar una fecha de inicio');

    return { isValid: errors.length === 0, errors };
  };

  const handleSubmit = () => {
    const validation = validateForm();
    if (!validation.isValid) {
      alert('Errores de validación:\n' + validation.errors.join('\n'));
      return;
    }

    const finalData = {
      ...formData,
      pathologicalRestrictions: pathologicalRestrictions
    };

    onSubmit(finalData);
  };

  const handleGenerateAI = () => {
    if (!onGenerateAI) return;
    
    const aiData: GenerateAIDietDto = {
      patientId: formData.patientId,
      name: formData.name,
      goal: 'weight_loss',
      startDate: formData.startDate,
      endDate: formData.endDate,
      planType: formData.planType,
      planPeriod: formData.planPeriod,
      totalPeriods: formData.totalPeriods,
      dailyCaloriesTarget: formData.dailyCaloriesTarget,
      dietaryRestrictions: pathologicalRestrictions.medicalConditions.map(c => c.name),
      allergies: pathologicalRestrictions.allergies.map(a => a.allergen),
      preferredFoods: [],
      dislikedFoods: [],
      notesForAI: formData.notes,
      customRequirements: []
    };

    onGenerateAI(aiData);
  };

  return (
    <div className="diet-plan-creator">
      <div className="card">
        <div className="card-header">
          <h5 className="mb-0">
            <i className="fas fa-utensils me-2"></i>
            {initialData ? 'Editar' : 'Crear'} Plan Nutricional
          </h5>
        </div>

        <div className="card-body">
          {/* Indicador de progreso minimalista - solo muestra el paso actual */}
          <div className="progress-indicator mb-4">
            <div className="current-step-circle">{currentStep}</div>
            <div className="current-step-info">
              <div className="step-title">{steps[currentStep - 1].title}</div>
              <div className="step-counter">Paso {currentStep} de {steps.length}</div>
            </div>
          </div>

          {/* Paso 1: Información Básica */}
          {currentStep === 1 && (
            <div className="step-content">
              <h6 className="mb-3">
                <Users size={16} className="me-2" />
                Información Básica del Plan
              </h6>
              
              <div className="row">
                <div className="col-md-6 mb-3">
                  <label className="form-label" htmlFor="patient-select">Paciente *</label>
                  <select 
                    className="form-select"
                    id="patient-select"
                    name="patient-select"
                    value={formData.patientId}
                    onChange={(e) => setFormData({...formData, patientId: e.target.value})}
                    required
                  >
                    <option value="">Seleccionar paciente</option>
                    {patients.map((patient) => (
                      <option key={patient.id} value={patient.id}>
                        {patient.user.first_name} {patient.user.last_name} - {patient.user.email}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="col-md-6 mb-3">
                  <label className="form-label" htmlFor="plan-name">Nombre del Plan *</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    id="plan-name"
                    name="plan-name"
                    placeholder={`Ej: ${getPlanTypeLabel()} de Equilibrio y Energía`}
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    required
                  />
                </div>
              </div>

              <div className="row">
                <div className="col-md-12 mb-3">
                  <label className="form-label" htmlFor="plan-description">Descripción</label>
                  <textarea
                    className="form-control"
                    id="plan-description"
                    name="plan-description"
                    rows={3}
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    placeholder="Describe el objetivo y enfoque del plan nutricional..."
                  />
                </div>
              </div>

              <div className="row">
                <div className="col-md-6 mb-3">
                  <label className="form-label" htmlFor="start-date">Fecha de Inicio *</label>
                  <input
                    type="date"
                    className="form-control"
                    id="start-date"
                    name="start-date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                    required
                  />
                </div>
                <div className="col-md-6 mb-3">
                  <label className="form-label" htmlFor="end-date">Fecha de Fin</label>
                  <input
                    type="date"
                    className="form-control"
                    id="end-date"
                    name="end-date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({...formData, endDate: e.target.value})}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Paso 2: Configuración de Tiempo */}
          {currentStep === 2 && (
            <div className="step-content">
              <h6 className="mb-3">
                <Clock size={16} className="me-2" />
                Configuración de Tiempo
              </h6>
              
              <div className="row">
                <div className="col-md-4 mb-3">
                  <label className="form-label">Tipo de Plan</label>
                  <select 
                    className="form-select"
                    value={planType}
                    onChange={(e) => {
                      setPlanType(e.target.value as PlanType);
                      setFormData({...formData, planType: e.target.value as PlanType});
                    }}
                  >
                    <option value="daily">Plan Diario</option>
                    <option value="weekly">Plan Semanal</option>
                    <option value="monthly">Plan Mensual</option>
                    <option value="custom">Plan Personalizado</option>
                    <option value="flexible">Plan Flexible</option>
                  </select>
                </div>
                <div className="col-md-4 mb-3">
                  <label className="form-label">Período</label>
                  <select 
                    className="form-select"
                    value={planPeriod}
                    onChange={(e) => {
                      setPlanPeriod(e.target.value as PlanPeriod);
                      setFormData({...formData, planPeriod: e.target.value as PlanPeriod});
                    }}
                    disabled={planType === 'flexible'}
                  >
                    <option value="days">Días</option>
                    <option value="weeks">Semanas</option>
                    <option value="months">Meses</option>
                    <option value="quarters">Trimestres</option>
                    <option value="years">Años</option>
                  </select>
                </div>
                <div className="col-md-4 mb-3">
                  <label className="form-label">
                    {planType === 'flexible' ? 'Duración Personalizada' : `Número de ${getPeriodLabel()}`}
                  </label>
                  {planType === 'flexible' ? (
                    <div className="d-flex gap-2">
                      <input 
                        type="number" 
                        className="form-control" 
                        placeholder="1"
                        min="1"
                        value={timeValue}
                        onChange={(e) => setTimeValue(parseInt(e.target.value) || 1)}
                      />
                      <select 
                        className="form-select"
                        value={timeValue}
                        onChange={(e) => setTimeValue(parseInt(e.target.value) || 1)}
                      >
                        <option value="hours">Horas</option>
                        <option value="days">Días</option>
                        <option value="weeks">Semanas</option>
                        <option value="months">Meses</option>
                        <option value="quarters">Trimestres</option>
                        <option value="years">Años</option>
                      </select>
                    </div>
                  ) : (
                    <input 
                      type="number" 
                      className="form-control" 
                      placeholder="1"
                      min="1"
                      value={formData.totalPeriods}
                      onChange={(e) => {
                        const value = parseInt(e.target.value) || 1;
                        setFormData({...formData, totalPeriods: value});
                      }}
                    />
                  )}
                </div>
              </div>

              {planType === 'flexible' && (
                <div className="alert alert-info">
                  <div className="d-flex align-items-center">
                    <Settings className="me-2" size={20} />
                    <div>
                      <strong>Plan Flexible:</strong> Este tipo de plan permite configuraciones avanzadas de tiempo.
                      <br />
                      <small>Duración: {timeValue} {getTimeUnitLabel()}</small>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Paso 3: Restricciones Patológicas */}
          {currentStep === 3 && (
            <div className="step-content">
              <div className="step-header">
                <div className="step-icon">
                  <Shield className="text-warning" size={24} />
                </div>
                <div>
                  <h4>Restricciones Patológicas</h4>
                  <p className="text-muted mb-0">
                    Información extraída automáticamente del perfil del paciente y expediente clínico
                  </p>
                </div>
              </div>

              {loadingPatientData ? (
                <div className="text-center py-4">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Cargando...</span>
                  </div>
                  <p className="mt-2">Cargando datos del paciente...</p>
                </div>
              ) : (
                <>
                  {/* Resumen de datos extraídos */}
                  {selectedPatient && (
                    <div className="alert alert-info">
                      <div className="d-flex align-items-center">
                        <Database className="me-2" size={20} />
                        <div>
                          <strong>Datos extraídos de:</strong>
                          <ul className="mb-0 mt-1">
                            <li><strong>Paciente:</strong> {selectedPatient.user.first_name} {selectedPatient.user.last_name}</li>
                            <li><strong>Perfil:</strong> {autoExtractedRestrictions.medicalConditions.length} condiciones médicas, {autoExtractedRestrictions.allergies.length} alergias, {autoExtractedRestrictions.medications.length} medicamentos</li>
                            <li><strong>Expedientes clínicos:</strong> {patientClinicalRecords.length} expedientes encontrados</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Opción para mostrar/ocultar restricciones */}
                  <div className="form-check mb-3">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id="showPathologicalRestrictions"
                      checked={showPathologicalRestrictions}
                      onChange={(e) => {
                        console.log('Show pathological restrictions changed:', e.target.checked); // Debug
                        setShowPathologicalRestrictions(e.target.checked);
                      }}
                    />
                    <label className="form-check-label" htmlFor="showPathologicalRestrictions">
                      <strong>Mostrar y editar restricciones patológicas</strong>
                      <small className="d-block text-muted">
                        Marca esta opción si necesitas agregar, modificar o eliminar restricciones
                      </small>
                    </label>
                  </div>

                  {showPathologicalRestrictions && (
                    <>
                      <div className="alert alert-warning">
                        <AlertTriangle className="me-2" size={16} />
                        <strong>Modo de edición activado:</strong> Puedes agregar, modificar o eliminar restricciones según sea necesario.
                      </div>

                      {/* Condiciones Médicas */}
                      <div className="card mb-4">
                        <div className="card-header">
                          <h6 className="mb-0">
                            <i className="fas fa-heartbeat me-2"></i>
                            Condiciones Médicas
                          </h6>
                        </div>
                        <div className="card-body">
                          {pathologicalRestrictions.medicalConditions.map((condition, index) => (
                            <div key={index} className="row mb-3 p-3 border rounded">
                              <div className="col-md-4">
                                <label className="form-label">Condición</label>
                                <input
                                  type="text"
                                  className="form-control"
                                  value={condition.name}
                                  onChange={(e) => {
                                    const updated = [...pathologicalRestrictions.medicalConditions];
                                    updated[index].name = e.target.value;
                                    setPathologicalRestrictions({...pathologicalRestrictions, medicalConditions: updated});
                                  }}
                                  placeholder="Ej: Diabetes, Hipertensión"
                                />
                              </div>
                              <div className="col-md-3">
                                <label className="form-label">Categoría</label>
                                <select
                                  className="form-select"
                                  value={condition.category}
                                  onChange={(e) => {
                                    const updated = [...pathologicalRestrictions.medicalConditions];
                                    updated[index].category = e.target.value as any;
                                    setPathologicalRestrictions({...pathologicalRestrictions, medicalConditions: updated});
                                  }}
                                >
                                  <option value="condition">Condición</option>
                                  <option value="disease">Enfermedad</option>
                                  <option value="syndrome">Síndrome</option>
                                </select>
                              </div>
                              <div className="col-md-3">
                                <label className="form-label">Severidad</label>
                                <select
                                  className="form-select"
                                  value={condition.severity}
                                  onChange={(e) => {
                                    const updated = [...pathologicalRestrictions.medicalConditions];
                                    updated[index].severity = e.target.value as any;
                                    setPathologicalRestrictions({...pathologicalRestrictions, medicalConditions: updated});
                                  }}
                                >
                                  <option value="mild">Leve</option>
                                  <option value="moderate">Moderada</option>
                                  <option value="severe">Severa</option>
                                </select>
                              </div>
                              <div className="col-md-2 d-flex align-items-end">
                                <button
                                  type="button"
                                  className="btn btn-outline-danger btn-sm"
                                  onClick={() => {
                                    const updated = pathologicalRestrictions.medicalConditions.filter((_, i) => i !== index);
                                    setPathologicalRestrictions({...pathologicalRestrictions, medicalConditions: updated});
                                  }}
                                >
                                  <i className="fas fa-trash"></i>
                                </button>
                              </div>
                            </div>
                          ))}
                          <button
                            type="button"
                            className="btn btn-outline-primary btn-sm"
                            onClick={() => {
                              const newCondition = {
                                name: '',
                                category: 'condition' as const,
                                severity: 'moderate' as const,
                                dietaryImplications: [],
                                restrictedFoods: [],
                                recommendedFoods: [],
                                monitoringRequirements: [],
                                emergencyInstructions: ''
                              };
                              setPathologicalRestrictions({
                                ...pathologicalRestrictions,
                                medicalConditions: [...pathologicalRestrictions.medicalConditions, newCondition]
                              });
                            }}
                          >
                            <i className="fas fa-plus me-1"></i>
                            Agregar Condición
                          </button>
                        </div>
                      </div>

                      {/* Alergias */}
                      <div className="card mb-4">
                        <div className="card-header">
                          <h6 className="mb-0">
                            <i className="fas fa-exclamation-triangle me-2"></i>
                            Alergias
                          </h6>
                        </div>
                        <div className="card-body">
                          {pathologicalRestrictions.allergies.map((allergy, index) => (
                            <div key={index} className="row mb-3 p-3 border rounded">
                              <div className="col-md-3">
                                <label className="form-label">Alergeno</label>
                                <input
                                  type="text"
                                  className="form-control"
                                  value={allergy.allergen}
                                  onChange={(e) => {
                                    const updated = [...pathologicalRestrictions.allergies];
                                    updated[index].allergen = e.target.value;
                                    setPathologicalRestrictions({...pathologicalRestrictions, allergies: updated});
                                  }}
                                  placeholder="Ej: Gluten, Lactosa"
                                />
                              </div>
                              <div className="col-md-2">
                                <label className="form-label">Tipo</label>
                                <select
                                  className="form-select"
                                  value={allergy.type}
                                  onChange={(e) => {
                                    const updated = [...pathologicalRestrictions.allergies];
                                    updated[index].type = e.target.value as any;
                                    setPathologicalRestrictions({...pathologicalRestrictions, allergies: updated});
                                  }}
                                >
                                  <option value="food">Alimento</option>
                                  <option value="medication">Medicamento</option>
                                  <option value="environmental">Ambiental</option>
                                </select>
                              </div>
                              <div className="col-md-2">
                                <label className="form-label">Severidad</label>
                                <select
                                  className="form-select"
                                  value={allergy.severity}
                                  onChange={(e) => {
                                    const updated = [...pathologicalRestrictions.allergies];
                                    updated[index].severity = e.target.value as any;
                                    setPathologicalRestrictions({...pathologicalRestrictions, allergies: updated});
                                  }}
                                >
                                  <option value="mild">Leve</option>
                                  <option value="moderate">Moderada</option>
                                  <option value="severe">Severa</option>
                                </select>
                              </div>
                              <div className="col-md-3">
                                <label className="form-label">Síntomas</label>
                                <input
                                  type="text"
                                  className="form-control"
                                  value={allergy.symptoms.join(', ')}
                                  onChange={(e) => {
                                    const updated = [...pathologicalRestrictions.allergies];
                                    updated[index].symptoms = e.target.value.split(',').map(s => s.trim()).filter(s => s);
                                    setPathologicalRestrictions({...pathologicalRestrictions, allergies: updated});
                                  }}
                                  placeholder="Ej: Urticaria, Dificultad respiratoria"
                                />
                              </div>
                              <div className="col-md-2 d-flex align-items-end">
                                <button
                                  type="button"
                                  className="btn btn-outline-danger btn-sm"
                                  onClick={() => {
                                    const updated = pathologicalRestrictions.allergies.filter((_, i) => i !== index);
                                    setPathologicalRestrictions({...pathologicalRestrictions, allergies: updated});
                                  }}
                                >
                                  <i className="fas fa-trash"></i>
                                </button>
                              </div>
                            </div>
                          ))}
                          <button
                            type="button"
                            className="btn btn-outline-primary btn-sm"
                            onClick={() => {
                              const newAllergy = {
                                allergen: '',
                                type: 'food' as const,
                                severity: 'moderate' as const,
                                symptoms: [],
                                crossReactions: [],
                                emergencyMedication: '',
                                avoidanceInstructions: ''
                              };
                              setPathologicalRestrictions({
                                ...pathologicalRestrictions,
                                allergies: [...pathologicalRestrictions.allergies, newAllergy]
                              });
                            }}
                          >
                            <i className="fas fa-plus me-1"></i>
                            Agregar Alergia
                          </button>
                        </div>
                      </div>

                      {/* Medicamentos */}
                      <div className="card mb-4">
                        <div className="card-header">
                          <h6 className="mb-0">
                            <i className="fas fa-pills me-2"></i>
                            Medicamentos
                          </h6>
                        </div>
                        <div className="card-body">
                          {pathologicalRestrictions.medications.map((medication, index) => (
                            <div key={index} className="row mb-3 p-3 border rounded">
                              <div className="col-md-3">
                                <label className="form-label">Medicamento</label>
                                <input
                                  type="text"
                                  className="form-control"
                                  value={medication.name}
                                  onChange={(e) => {
                                    const updated = [...pathologicalRestrictions.medications];
                                    updated[index].name = e.target.value;
                                    setPathologicalRestrictions({...pathologicalRestrictions, medications: updated});
                                  }}
                                  placeholder="Ej: Metformina, Enalapril"
                                />
                              </div>
                              <div className="col-md-3">
                                <label className="form-label">Dosis</label>
                                <input
                                  type="text"
                                  className="form-control"
                                  value={medication.dosage}
                                  onChange={(e) => {
                                    const updated = [...pathologicalRestrictions.medications];
                                    updated[index].dosage = e.target.value;
                                    setPathologicalRestrictions({...pathologicalRestrictions, medications: updated});
                                  }}
                                  placeholder="Ej: 500mg"
                                />
                              </div>
                              <div className="col-md-3">
                                <label className="form-label">Frecuencia</label>
                                <input
                                  type="text"
                                  className="form-control"
                                  value={medication.frequency}
                                  onChange={(e) => {
                                    const updated = [...pathologicalRestrictions.medications];
                                    updated[index].frequency = e.target.value;
                                    setPathologicalRestrictions({...pathologicalRestrictions, medications: updated});
                                  }}
                                  placeholder="Ej: 2 veces al día"
                                />
                              </div>
                              <div className="col-md-3 d-flex align-items-end">
                                <button
                                  type="button"
                                  className="btn btn-outline-danger btn-sm"
                                  onClick={() => {
                                    const updated = pathologicalRestrictions.medications.filter((_, i) => i !== index);
                                    setPathologicalRestrictions({...pathologicalRestrictions, medications: updated});
                                  }}
                                >
                                  <i className="fas fa-trash"></i>
                                </button>
                              </div>
                            </div>
                          ))}
                          <button
                            type="button"
                            className="btn btn-outline-primary btn-sm"
                            onClick={() => {
                              const newMedication = {
                                name: '',
                                dosage: '',
                                frequency: '',
                                foodInteractions: [],
                                timingRequirements: ''
                              };
                              setPathologicalRestrictions({
                                ...pathologicalRestrictions,
                                medications: [...pathologicalRestrictions.medications, newMedication]
                              });
                            }}
                          >
                            <i className="fas fa-plus me-1"></i>
                            Agregar Medicamento
                          </button>
                        </div>
                      </div>

                      {/* Consideraciones Especiales */}
                      <div className="card mb-4">
                        <div className="card-header">
                          <h6 className="mb-0">
                            <i className="fas fa-clipboard-list me-2"></i>
                            Consideraciones Especiales
                          </h6>
                        </div>
                        <div className="card-body">
                          <div className="mb-3">
                            <label className="form-label">Notas adicionales</label>
                            <textarea
                              className="form-control"
                              rows={4}
                              value={pathologicalRestrictions.specialConsiderations.join('\n')}
                              onChange={(e) => {
                                const considerations = e.target.value.split('\n').filter(line => line.trim());
                                setPathologicalRestrictions({
                                  ...pathologicalRestrictions,
                                  specialConsiderations: considerations
                                });
                              }}
                              placeholder="Agrega cualquier consideración especial que deba tenerse en cuenta al crear el plan nutricional..."
                            ></textarea>
                            <small className="text-muted">
                              Cada línea será tratada como una consideración separada
                            </small>
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </>
              )}
            </div>
          )}

          {/* Paso 4: Configuración de Comidas */}
          {currentStep === 4 && (
            <div className="step-content">
              <h6 className="mb-3">
                <Settings size={16} className="me-2" />
                Configuración de Comidas
              </h6>
              
              <div className="row">
                <div className="col-md-6 mb-3">
                  <label className="form-label">Número de Comidas por Día</label>
                  <select 
                    className="form-select"
                    value={formData.mealConfiguration?.mealsPerDay || 3}
                    onChange={(e) => setFormData({
                      ...formData, 
                      mealConfiguration: {
                        ...formData.mealConfiguration,
                        mealsPerDay: parseInt(e.target.value)
                      }
                    })}
                  >
                    <option value={3}>3 comidas (Desayuno, Almuerzo, Cena)</option>
                    <option value={4}>4 comidas (Desayuno, Almuerzo, Merienda, Cena)</option>
                    <option value={5}>5 comidas (Desayuno, Colación, Almuerzo, Merienda, Cena)</option>
                    <option value={6}>6 comidas (Desayuno, Colación, Almuerzo, Merienda, Cena, Snack)</option>
                  </select>
                </div>
                <div className="col-md-6 mb-3">
                  <label className="form-label">Tipo de Plan</label>
                  <select 
                    className="form-select"
                    value={formData.mealConfiguration?.planType || 'balanced'}
                    onChange={(e) => setFormData({
                      ...formData, 
                      mealConfiguration: {
                        ...formData.mealConfiguration,
                        planType: e.target.value
                      }
                    })}
                  >
                    <option value="balanced">Equilibrado</option>
                    <option value="low-carb">Bajo en Carbohidratos</option>
                    <option value="high-protein">Alto en Proteínas</option>
                    <option value="mediterranean">Mediterráneo</option>
                    <option value="vegetarian">Vegetariano</option>
                    <option value="vegan">Vegano</option>
                    <option value="keto">Cetogénico</option>
                  </select>
                </div>
              </div>

              <div className="row">
                <div className="col-md-6 mb-3">
                  <label className="form-label">Horario de Comidas</label>
                  <select 
                    className="form-select"
                    value={formData.mealConfiguration?.mealTiming || 'flexible'}
                    onChange={(e) => setFormData({
                      ...formData, 
                      mealConfiguration: {
                        ...formData.mealConfiguration,
                        mealTiming: e.target.value
                      }
                    })}
                  >
                    <option value="flexible">Flexible</option>
                    <option value="fixed">Horarios Fijos</option>
                    <option value="intermittent">Ayuno Intermitente</option>
                  </select>
                </div>
                <div className="col-md-6 mb-3">
                  <label className="form-label">Tamaño de Porciones</label>
                  <select 
                    className="form-select"
                    value={formData.mealConfiguration?.portionSize || 'standard'}
                    onChange={(e) => setFormData({
                      ...formData, 
                      mealConfiguration: {
                        ...formData.mealConfiguration,
                        portionSize: e.target.value
                      }
                    })}
                  >
                    <option value="standard">Estándar</option>
                    <option value="small">Porciones Pequeñas</option>
                    <option value="large">Porciones Grandes</option>
                    <option value="custom">Personalizado</option>
                  </select>
                </div>
              </div>

              <div className="alert alert-info">
                <i className="fas fa-info-circle me-2"></i>
                <strong>Configuración automática:</strong> El sistema generará automáticamente las comidas basándose en estas preferencias y las restricciones del paciente.
              </div>
            </div>
          )}

          {/* Paso 5: Objetivos Nutricionales */}
          {currentStep === 5 && (
            <div className="step-content">
              <h6 className="mb-3">
                <i className="fas fa-bullseye me-2"></i>
                Objetivos Nutricionales
              </h6>
              
              <div className="row">
                <div className="col-md-6 mb-3">
                  <label className="form-label">Calorías Diarias Objetivo</label>
                  <div className="input-group">
                    <input 
                      type="number" 
                      className="form-control" 
                      placeholder="2000"
                      min="800"
                      max="5000"
                      value={formData.dailyCaloriesTarget}
                      onChange={(e) => setFormData({...formData, dailyCaloriesTarget: parseInt(e.target.value) || 2000})}
                    />
                    <span className="input-group-text">kcal</span>
                  </div>
                  <small className="text-muted">Rango recomendado: 800-5000 kcal</small>
                </div>
                <div className="col-md-6 mb-3">
                  <label className="form-label">Objetivo Principal</label>
                  <select 
                    className="form-select"
                    value={formData.nutritionalGoals?.primaryGoal || 'weight_loss'}
                    onChange={(e) => setFormData({
                      ...formData, 
                      nutritionalGoals: {
                        ...formData.nutritionalGoals,
                        primaryGoal: e.target.value
                      }
                    })}
                  >
                    <option value="weight_loss">Pérdida de Peso</option>
                    <option value="weight_gain">Ganancia de Peso</option>
                    <option value="maintenance">Mantenimiento</option>
                    <option value="muscle_gain">Ganancia de Masa Muscular</option>
                    <option value="health_improvement">Mejora de Salud</option>
                    <option value="sports_performance">Rendimiento Deportivo</option>
                  </select>
                </div>
              </div>

              <div className="row">
                <div className="col-md-4 mb-3">
                  <label className="form-label">Proteínas (g)</label>
                  <input 
                    type="number" 
                    className="form-control" 
                    placeholder="150"
                    min="20"
                    max="400"
                    value={formData.dailyMacrosTarget?.protein || 150}
                    onChange={(e) => setFormData({
                      ...formData, 
                      dailyMacrosTarget: {
                        ...formData.dailyMacrosTarget,
                        protein: parseInt(e.target.value) || 150
                      }
                    })}
                  />
                </div>
                <div className="col-md-4 mb-3">
                  <label className="form-label">Carbohidratos (g)</label>
                  <input 
                    type="number" 
                    className="form-control" 
                    placeholder="200"
                    min="20"
                    max="600"
                    value={formData.dailyMacrosTarget?.carbohydrates || 200}
                    onChange={(e) => setFormData({
                      ...formData, 
                      dailyMacrosTarget: {
                        ...formData.dailyMacrosTarget,
                        carbohydrates: parseInt(e.target.value) || 200
                      }
                    })}
                  />
                </div>
                <div className="col-md-4 mb-3">
                  <label className="form-label">Grasas (g)</label>
                  <input 
                    type="number" 
                    className="form-control" 
                    placeholder="67"
                    min="20"
                    max="200"
                    value={formData.dailyMacrosTarget?.fats || 67}
                    onChange={(e) => setFormData({
                      ...formData, 
                      dailyMacrosTarget: {
                        ...formData.dailyMacrosTarget,
                        fats: parseInt(e.target.value) || 67
                      }
                    })}
                  />
                </div>
              </div>

              <div className="mb-3">
                <label className="form-label">Objetivos Secundarios</label>
                <div className="row">
                  {['control_blood_sugar', 'reduce_cholesterol', 'improve_digestion', 'increase_energy', 'better_sleep'].map((goal) => (
                    <div key={goal} className="col-md-6 mb-2">
                      <div className="form-check">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          id={goal}
                          checked={formData.nutritionalGoals?.secondaryGoals?.includes(goal) || false}
                          onChange={(e) => {
                            console.log(`Goal ${goal} changed:`, e.target.checked); // Debug
                            const currentGoals = formData.nutritionalGoals?.secondaryGoals || [];
                            const updatedGoals = e.target.checked
                              ? [...currentGoals, goal]
                              : currentGoals.filter(g => g !== goal);
                            setFormData({
                              ...formData,
                              nutritionalGoals: {
                                ...formData.nutritionalGoals,
                                secondaryGoals: updatedGoals
                              }
                            });
                          }}
                        />
                        <label className="form-check-label" htmlFor={goal}>
                          {goal === 'control_blood_sugar' && 'Control de Azúcar en Sangre'}
                          {goal === 'reduce_cholesterol' && 'Reducir Colesterol'}
                          {goal === 'improve_digestion' && 'Mejorar Digestión'}
                          {goal === 'increase_energy' && 'Aumentar Energía'}
                          {goal === 'better_sleep' && 'Mejorar Sueño'}
                        </label>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Paso 6: Revisión y Creación */}
          {currentStep === 6 && (
            <div className="step-content">
              <h6 className="mb-3">
                <i className="fas fa-check-circle me-2"></i>
                Revisión y Creación
              </h6>
              
              <div className="row">
                <div className="col-md-6">
                  <div className="card mb-3">
                    <div className="card-header">
                      <h6 className="mb-0">Información Básica</h6>
                    </div>
                    <div className="card-body">
                      <p><strong>Paciente:</strong> {selectedPatient ? `${selectedPatient.user.first_name} ${selectedPatient.user.last_name}` : 'No seleccionado'}</p>
                      <p><strong>Nombre del Plan:</strong> {formData.name || 'No especificado'}</p>
                      <p><strong>Descripción:</strong> {formData.description || 'No especificada'}</p>
                      <p><strong>Fecha de Inicio:</strong> {formData.startDate || 'No especificada'}</p>
                      <p><strong>Fecha de Fin:</strong> {formData.endDate || 'Calculada automáticamente'}</p>
                    </div>
                  </div>
                </div>
                
                <div className="col-md-6">
                  <div className="card mb-3">
                    <div className="card-header">
                      <h6 className="mb-0">Configuración</h6>
                    </div>
                    <div className="card-body">
                      <p><strong>Tipo de Plan:</strong> {getPlanTypeLabel()}</p>
                      <p><strong>Duración:</strong> {formData.totalPeriods} {getPeriodLabel()}</p>
                      <p><strong>Calorías Objetivo:</strong> {formData.dailyCaloriesTarget} kcal</p>
                      <p><strong>Macronutrientes:</strong> P: {formData.dailyMacrosTarget?.protein || 150}g, C: {formData.dailyMacrosTarget?.carbohydrates || 200}g, G: {formData.dailyMacrosTarget?.fats || 67}g</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="row">
                <div className="col-md-6">
                  <div className="card mb-3">
                    <div className="card-header">
                      <h6 className="mb-0">Restricciones Patológicas</h6>
                    </div>
                    <div className="card-body">
                      <p><strong>Condiciones Médicas:</strong> {pathologicalRestrictions.medicalConditions.length}</p>
                      <p><strong>Alergias:</strong> {pathologicalRestrictions.allergies.length}</p>
                      <p><strong>Medicamentos:</strong> {pathologicalRestrictions.medications.length}</p>
                      <p><strong>Consideraciones:</strong> {pathologicalRestrictions.specialConsiderations.length}</p>
                    </div>
                  </div>
                </div>
                
                <div className="col-md-6">
                  <div className="card mb-3">
                    <div className="card-header">
                      <h6 className="mb-0">Notas Adicionales</h6>
                    </div>
                    <div className="card-body">
                      <p>{formData.notes || 'No hay notas adicionales'}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="alert alert-success">
                <i className="fas fa-check-circle me-2"></i>
                <strong>¡Todo listo!</strong> Revisa la información anterior y procede a crear el plan nutricional.
              </div>
            </div>
          )}

          {/* Navegación entre pasos */}
          <div className="d-flex justify-content-between mt-4">
            <div>
              {currentStep > 1 && (
                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  onClick={() => setCurrentStep(currentStep - 1)}
                >
                  ← Anterior
                </button>
              )}
            </div>
            
            <div>
              {currentStep < steps.length && (
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => setCurrentStep(currentStep + 1)}
                >
                  Siguiente →
                </button>
              )}
            </div>
          </div>

          {/* Botones de acción finales */}
          <div className="d-flex justify-content-center gap-3 mt-4">
            {currentStep === steps.length && (
              <>
                {onGenerateAI && (
                  <button
                    type="button"
                    className="btn btn-outline-success"
                    onClick={handleGenerateAI}
                    disabled={loading}
                  >
                    <Plus size={16} className="me-1" />
                    Generar con IA
                  </button>
                )}
                <button
                  type="button"
                  className="btn btn-success"
                  onClick={handleSubmit}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                      Creando...
                    </>
                  ) : (
                    <>
                      <Calendar size={16} className="me-1" />
                      Crear Plan
                    </>
                  )}
                </button>
              </>
            )}
            
            <button
              type="button"
              className="btn btn-outline-danger"
              onClick={onCancel}
              disabled={loading}
            >
              Cancelar
            </button>
          </div>
        </div>
      </div>

      <style>{`
        body {
            font-family: 'Inter', sans-serif;
            background-color: #f8f9fa;
        }
        .progress-indicator {
            padding: 20px;
            background-color: #ffffff;
            border-radius: 12px;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
            margin: 20px auto;
            max-width: 400px;
            text-align: center;
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
            background-color: #0d6efd;
            color: #ffffff;
            border: 3px solid #0d6efd;
            box-shadow: 0 5px 15px rgba(13, 109, 253, 0.5);
            margin: 0 auto 15px auto;
            transition: all 0.3s ease-in-out;
            flex-shrink: 0;
        }
        .current-step-info .step-title {
            font-size: 1.4em;
            font-weight: 600;
            color: #343a40;
            margin-bottom: 5px;
        }
        .current-step-info .step-counter {
            font-size: 0.9em;
            color: #6c757d;
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
      `}</style>
    </div>
  );
};

export default DietPlanCreator; 