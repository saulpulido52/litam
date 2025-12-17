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
        name: medication,
        dosage: '',
        frequency: '',
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
          {/* Indicador de progreso simplificado - Solo muestra el paso actual */}
          <div className="progress-indicator mb-4">
            <div className="d-flex justify-content-center align-items-center">
              <div className="current-step-display">
                <div className="step-number">{currentStep}</div>
                <div className="step-title">{steps[currentStep - 1].title}</div>
                <div className="step-subtitle">de {steps.length} pasos</div>
              </div>
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
                  <label className="form-label">Paciente *</label>
                  <select 
                    className="form-select"
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
                  <label className="form-label">Nombre del Plan *</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    placeholder={`Ej: ${getPlanTypeLabel()} de Equilibrio y Energía`}
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    required
                  />
                </div>
              </div>

              <div className="mb-3">
                <label className="form-label">Descripción</label>
                <textarea 
                  className="form-control" 
                  rows={3} 
                  placeholder="Describe el objetivo y características del plan..."
                  value={formData.description || ''}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                ></textarea>
              </div>

              <div className="row">
                <div className="col-md-6 mb-3">
                  <label className="form-label">Fecha de Inicio *</label>
                  <input 
                    type="date" 
                    className="form-control"
                    value={formData.startDate}
                    onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                    required
                  />
                </div>
                <div className="col-md-6 mb-3">
                  <label className="form-label">Fecha de Fin</label>
                  <input 
                    type="date" 
                    className="form-control"
                    value={formData.endDate}
                    onChange={(e) => setFormData({...formData, endDate: e.target.value})}
                    readOnly
                  />
                  <small className="text-muted">Calculada automáticamente</small>
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
                      onChange={(e) => setShowPathologicalRestrictions(e.target.checked)}
                    />
                    <label className="form-check-label" htmlFor="showPathologicalRestrictions">
                      <strong>Mostrar y editar restricciones patológicas</strong>
                      <small className="d-block text-muted">
                        Marca esta opción si necesitas agregar, modificar o eliminar restricciones
                      </small>
                    </label>
                  </div>

                  {showPathologicalRestrictions && (
                    <div className="alert alert-warning">
                      <AlertTriangle className="me-2" size={16} />
                      <strong>Modo de edición activado:</strong> Puedes agregar, modificar o eliminar restricciones según sea necesario.
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {/* Navegación */}
          <div className="d-flex justify-content-between mt-4">
            <div>
              {currentStep > 1 && (
                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  onClick={() => setCurrentStep(currentStep - 1)}
                >
                  Anterior
                </button>
              )}
            </div>
            
            <div className="d-flex gap-2">
              {currentStep < steps.length && (
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => setCurrentStep(currentStep + 1)}
                >
                  Siguiente
                </button>
              )}
              
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
      </div>

      <style>{`
        .diet-plan-creator {
          max-width: 100%;
        }
        
        .progress-indicator {
          background: #f8f9fa;
          padding: 1.5rem;
          border-radius: 0.75rem;
          border: 1px solid #e9ecef;
          text-align: center;
        }
        
        .current-step-display {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.5rem;
        }
        
        .step-number {
          width: 60px;
          height: 60px;
          border-radius: 50%;
          background: #007bff;
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.5rem;
          font-weight: bold;
          box-shadow: 0 4px 12px rgba(0, 123, 255, 0.3);
        }
        
        .step-title {
          font-size: 1.25rem;
          font-weight: 600;
          color: #495057;
          margin: 0;
        }
        
        .step-subtitle {
          font-size: 0.9rem;
          color: #6c757d;
          margin: 0;
        }
        
        .step-content {
          min-height: 300px;
        }
        
        /* Responsive adjustments */
        @media (max-width: 768px) {
          .progress-indicator {
            padding: 1rem;
          }
          
          .step-number {
            width: 50px;
            height: 50px;
            font-size: 1.25rem;
          }
          
          .step-title {
            font-size: 1.1rem;
          }
          
          .step-subtitle {
            font-size: 0.85rem;
          }
          
          .step-content {
            min-height: 250px;
          }
        }
        
        @media (max-width: 576px) {
          .progress-indicator {
            padding: 0.75rem;
          }
          
          .step-number {
            width: 45px;
            height: 45px;
            font-size: 1.1rem;
          }
          
          .step-title {
            font-size: 1rem;
          }
          
          .step-subtitle {
            font-size: 0.8rem;
          }
          
          .step-content {
            min-height: 200px;
          }
        }
        
        /* Form field improvements */
        .form-label {
          font-weight: 500;
          color: #495057;
        }
        
        .form-control:focus,
        .form-select:focus {
          border-color: #007bff;
          box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
        }
        
        .btn-primary {
          background-color: #007bff;
          border-color: #007bff;
        }
        
        .btn-primary:hover {
          background-color: #0056b3;
          border-color: #0056b3;
        }
        
        .btn-outline-secondary:hover {
          background-color: #6c757d;
          border-color: #6c757d;
        }
        
        /* Card improvements */
        .card {
          border: 1px solid #e9ecef;
          border-radius: 0.75rem;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }
        
        .card-header {
          background-color: #f8f9fa;
          border-bottom: 1px solid #e9ecef;
          border-radius: 0.75rem 0.75rem 0 0 !important;
        }
        
        /* Animation for step transitions */
        .step-content {
          animation: fadeIn 0.3s ease-in;
        }
        
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        /* Focus styles for accessibility */
        .step-number:focus,
        .btn:focus,
        .form-control:focus,
        .form-select:focus {
          outline: 2px solid #212529;
          outline-offset: 2px;
        }
      `}</style>
    </div>
  );
};

export default DietPlanCreator; 