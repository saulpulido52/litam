import React, { useState } from 'react';
import NutritionalCard from './NutritionalCard';
import { Patient } from '../types/patient';
import { DietPlan } from '../types/diet';
import { ClinicalRecord } from '../types/clinical-record';

// Datos de ejemplo para demostrar las tarjetas nutricionales
const examplePatient: Patient = {
  id: 'patient-example-1',
  user: {
    id: 'user-example-1',
    email: 'juan.perez@email.com',
    first_name: 'Juan Carlos',
    last_name: 'Pérez González',
    phone: '555-0123',
    birth_date: '1985-03-15',
    age: 39,
    gender: 'male',
    is_active: true,
    registration_type: 'nutritionist_created',
    has_temporary_password: false,
    requires_initial_setup: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    role: { id: 'role-1', name: 'patient' }
  },
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  bmi_category: 'Sobrepeso',
  age_calculated: 39
};

const exampleClinicalRecord: ClinicalRecord = {
  id: 'clinical-example-1',
  record_date: new Date().toISOString(),
  expedient_number: 'EXP-2025-001',
  consultation_reason: 'Control de peso y mejora de hábitos alimentarios',
  current_problems: 'Sobrepeso, fatiga, digestión lenta',
  diagnosed_diseases: 'Prediabetes, Hipertensión leve',
  family_medical_history: {
    diabetes: ['Padre'],
    hypertension: ['Madre', 'Abuelo paterno'],
    obesity: ['Hermana'],
    cardiovascular: ['Abuelo materno']
  },
  daily_activities: 'Trabajo de oficina, sedentario la mayor parte del día',
  activity_level_description: 'Ejercicio 2-3 veces por semana',
  physical_exercise: 'moderado',
  consumption_habits: JSON.stringify({
    alcohol: 'Ocasional',
    tobacco: 'No',
    caffeine: 'Sí, 2-3 tazas de café al día',
    supplements: 'Vitamina D'
  }),
  anthropometric_measurements: {
    weight: '85',
    height_m: '1.75',
    bmi: '27.8',
    waist_circumference: '95',
    body_fat_percentage: '22'
  },
  blood_pressure: {
    systolic: '135',
    diastolic: '85'
  },
  biochemical_indicators: {
    glucose: '105',
    cholesterol_total: '220',
    hdl: '45',
    ldl: '160',
    triglycerides: '180'
  },
  nutritional_diagnosis: 'Sobrepeso grado I con riesgo cardiometabólico',
  energy_nutrient_needs: 'Reducción calórica moderada (15%), aumento de proteínas',
  water_consumption_liters: '2.0',
  patient: examplePatient,
  nutritionist: {
    id: 'nutritionist-1',
    email: 'nutricionista@ejemplo.com',
    first_name: 'Dra. María',
    last_name: 'García López',
    phone: '555-0456',
    role: { id: 'role-2', name: 'nutritionist' }
  } as any,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString()
};

const exampleDietPlan: DietPlan = {
  id: 'diet-plan-example-1',
  name: 'Plan de Control de Peso - Enero 2025',
  description: 'Plan nutricional diseñado para pérdida gradual de peso con enfoque en sostenibilidad',
  patient: examplePatient,
  nutritionist: {
    id: 'nutritionist-1',
    email: 'nutricionista@ejemplo.com',
    first_name: 'Dra. María',
    last_name: 'García López'
  } as any,
  meals: [],
  generated_by_ia: false,
  ia_version: null,
  status: 'draft' as any,
  notes: 'Paciente motivado. Horario de oficina requiere comidas portátiles.',
  start_date: '2025-01-15',
  end_date: '2025-02-12',
  daily_calories_target: 2100,
  daily_macros_target: {
    protein: 150,
    carbohydrates: 200,
    fats: 70
  },
  is_weekly_plan: true,
  total_weeks: 4,
  weekly_plans: [],
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString()
};

const NutritionalCardExample: React.FC = () => {
  const [showCard, setShowCard] = useState(false);
  const [mode, setMode] = useState<'create' | 'edit' | 'view'>('create');
  const [currentPlan, setCurrentPlan] = useState<DietPlan | undefined>(undefined);

  const handleOpenCard = (cardMode: 'create' | 'edit' | 'view') => {
    setMode(cardMode);
    setCurrentPlan(cardMode === 'create' ? undefined : exampleDietPlan);
    setShowCard(true);
  };

  const handleSavePlan = (planData: any) => {
    console.log('💾 Guardando plan nutricional:', planData);
    
    // Simular guardado exitoso
    setTimeout(() => {
      alert('✅ Plan nutricional guardado exitosamente');
      setShowCard(false);
    }, 1000);
  };

  const handleCloseCard = () => {
    setShowCard(false);
    setCurrentPlan(undefined);
  };

  return (
    <div className="nutritional-card-example">
      {/* Header */}
      <div className="container-fluid py-4">
        <div className="row">
          <div className="col-12">
            <div className="card">
              <div className="card-header bg-primary text-white">
                <h4 className="mb-0">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-sparkles me-2">
                    <path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .962 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.582a.5.5 0 0 1 0 .962L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.962 0L9.937 15.5Z"></path>
                    <path d="M20 3v4"></path>
                    <path d="M22 5h-4"></path>
                    <path d="M4 17v2"></path>
                    <path d="M5 18H3"></path>
                  </svg>
                  Tarjetas Nutricionales Avanzadas - Sistema NutriWeb
                </h4>
                <p className="mb-0 mt-2">
                  Sistema completo de creación y gestión de planes nutricionales con 5 pestañas especializadas
                </p>
              </div>
              <div className="card-body">
                {/* Información del paciente */}
                <div className="row mb-4">
                  <div className="col-md-8">
                    <h5 className="text-primary mb-3">
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-user me-2">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                        <circle cx="12" cy="7" r="4"></circle>
                      </svg>
                      Paciente de Ejemplo
                    </h5>
                    <div className="row">
                      <div className="col-md-6">
                        <div className="mb-2">
                          <strong>Nombre:</strong> {examplePatient.user?.first_name} {examplePatient.user?.last_name}
                        </div>
                        <div className="mb-2">
                          <strong>Edad:</strong> {examplePatient.user?.age} años
                        </div>
                        <div className="mb-2">
                          <strong>Email:</strong> {examplePatient.user?.email}
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="mb-2">
                          <strong>Teléfono:</strong> {examplePatient.user?.phone}
                        </div>
                        <div className="mb-2">
                          <strong>IMC:</strong> {exampleClinicalRecord.anthropometric_measurements?.bmi} - {examplePatient.bmi_category}
                        </div>
                        <div className="mb-2">
                          <strong>Diagnóstico:</strong> {exampleClinicalRecord.nutritional_diagnosis}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-4">
                    <div className="card bg-light">
                      <div className="card-body">
                        <h6 className="card-title">
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-activity me-1">
                            <path d="M22 12h-2.48a2 2 0 0 0-1.93 1.46l-2.35 8.36a.25.25 0 0 1-.48 0L9.24 2.18a.25.25 0 0 0-.48 0l-2.35 8.36A2 2 0 0 1 4.49 12H2"></path>
                          </svg>
                          Datos Clínicos
                        </h6>
                        <div className="small">
                          <div className="d-flex justify-content-between">
                            <span>Peso:</span>
                            <strong>{exampleClinicalRecord.anthropometric_measurements?.weight} kg</strong>
                          </div>
                          <div className="d-flex justify-content-between">
                            <span>Altura:</span>
                            <strong>{(parseFloat(exampleClinicalRecord.anthropometric_measurements?.height_m || '0') * 100).toFixed(0)} cm</strong>
                          </div>
                          <div className="d-flex justify-content-between">
                            <span>Presión:</span>
                            <strong>{exampleClinicalRecord.blood_pressure?.systolic}/{exampleClinicalRecord.blood_pressure?.diastolic}</strong>
                          </div>
                          <div className="d-flex justify-content-between">
                            <span>Glucosa:</span>
                            <strong>{exampleClinicalRecord.biochemical_indicators?.glucose} mg/dL</strong>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Botones de demostración */}
                <div className="row">
                  <div className="col-12">
                    <h5 className="text-primary mb-3">
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-play-circle me-2">
                        <circle cx="12" cy="12" r="10"></circle>
                        <polygon points="10 8 16 12 10 16 10 8"></polygon>
                      </svg>
                      Demostración de Tarjetas Nutricionales
                    </h5>
                    <p className="text-muted mb-4">
                      Haz clic en cualquiera de los botones para abrir las tarjetas nutricionales en diferentes modos:
                    </p>
                    
                    <div className="row">
                      <div className="col-md-4 mb-3">
                        <div className="card">
                          <div className="card-body text-center">
                            <div className="mb-3" style={{ fontSize: '48px' }}>🆕</div>
                            <h6 className="card-title">Crear Nuevo Plan</h6>
                            <p className="card-text small text-muted">
                              Crear un plan nutricional completamente nuevo con todas las pestañas disponibles.
                            </p>
                            <button 
                              className="btn btn-success"
                              onClick={() => handleOpenCard('create')}
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-plus me-1">
                                <path d="M5 12h14"></path>
                                <path d="M12 5v14"></path>
                              </svg>
                              Crear Plan
                            </button>
                          </div>
                        </div>
                      </div>

                      <div className="col-md-4 mb-3">
                        <div className="card">
                          <div className="card-body text-center">
                            <div className="mb-3" style={{ fontSize: '48px' }}>✏️</div>
                            <h6 className="card-title">Editar Plan Existente</h6>
                            <p className="card-text small text-muted">
                              Editar un plan nutricional con datos prellenados del ejemplo.
                            </p>
                            <button 
                              className="btn btn-primary"
                              onClick={() => handleOpenCard('edit')}
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-edit me-1">
                                <path d="M12 20h9"></path>
                                <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
                              </svg>
                              Editar Plan
                            </button>
                          </div>
                        </div>
                      </div>

                      <div className="col-md-4 mb-3">
                        <div className="card">
                          <div className="card-body text-center">
                            <div className="mb-3" style={{ fontSize: '48px' }}>👁️</div>
                            <h6 className="card-title">Ver Plan (Solo Lectura)</h6>
                            <p className="card-text small text-muted">
                              Visualizar un plan nutricional en modo de solo lectura.
                            </p>
                            <button 
                              className="btn btn-info"
                              onClick={() => handleOpenCard('view')}
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-eye me-1">
                                <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"></path>
                                <circle cx="12" cy="12" r="3"></circle>
                              </svg>
                              Ver Plan
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Características del sistema */}
                <div className="row mt-4">
                  <div className="col-12">
                    <h5 className="text-primary mb-3">
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-star me-2">
                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                      </svg>
                      Características del Sistema de Tarjetas Nutricionales
                    </h5>
                    
                    <div className="row">
                      <div className="col-md-6">
                        <div className="card">
                          <div className="card-header bg-success text-white">
                            <h6 className="mb-0">
                              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-check-circle me-1">
                                <path d="M9 12l2 2 4-4"></path>
                                <circle cx="12" cy="12" r="10"></circle>
                              </svg>
                              5 Pestañas Especializadas
                            </h6>
                          </div>
                          <div className="card-body">
                            <ul className="list-unstyled mb-0">
                              <li className="mb-2">📋 <strong>Resumen:</strong> Información general y objetivos</li>
                              <li className="mb-2">🍽️ <strong>Comidas:</strong> Planificación semanal de alimentos</li>
                              <li className="mb-2">🎯 <strong>Nutrición:</strong> Macros y micronutrientes</li>
                              <li className="mb-2">⏰ <strong>Horarios:</strong> Timing y rutinas diarias</li>
                              <li>🛡️ <strong>Restricciones:</strong> Alergias y condiciones médicas</li>
                            </ul>
                          </div>
                        </div>
                      </div>

                      <div className="col-md-6">
                        <div className="card">
                          <div className="card-header bg-info text-white">
                            <h6 className="mb-0">
                              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-zap me-1">
                                <path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14H4Z"></path>
                              </svg>
                              Funcionalidades Avanzadas
                            </h6>
                          </div>
                          <div className="card-body">
                            <ul className="list-unstyled mb-0">
                              <li className="mb-2">🧬 <strong>Integración:</strong> Datos del expediente clínico</li>
                              <li className="mb-2">🤖 <strong>IA Nutricional:</strong> Cálculos automáticos</li>
                              <li className="mb-2">📊 <strong>Análisis:</strong> Estadísticas y gráficos</li>
                              <li className="mb-2">🔄 <strong>Sincronización:</strong> Datos en tiempo real</li>
                              <li>🎨 <strong>UI/UX:</strong> Interfaz moderna y responsiva</li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tarjeta nutricional modal */}
      {showCard && (
        <NutritionalCard
          dietPlan={currentPlan}
          patient={examplePatient}
          clinicalRecord={exampleClinicalRecord}
          mode={mode}
          onSave={handleSavePlan}
          onClose={handleCloseCard}
          isLoading={false}
        />
      )}
    </div>
  );
};

export default NutritionalCardExample; 