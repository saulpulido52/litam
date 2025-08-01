import React, { useState } from 'react';
import NutritionalCard from './NutritionalCard';
import type { Patient } from '../types/patient';
import type { DietPlan } from '../types/diet';
import type { ClinicalRecord } from '../types/clinical-record';

// Ejemplo de paciente con datos realistas
const examplePatient: Patient = {
  id: 'patient-123',
  user: {
    id: 'user-123',
    email: 'lucia.hernandez@example.com',
    first_name: 'Lucía',
    last_name: 'Hernández',
    phone: '+52 55 1234 5678',
    birth_date: new Date('1985-03-15'),
    age: 39,
    gender: 'female',
    role: {
      id: 'role-patient',
      name: 'patient'},
    is_active: true,
    created_at: '2024-01-15T10:30:00Z',
    updated_at: '2024-01-15T10:30:00Z'},
  profile: {
    user_id: 'user-123',
    birth_date: '1985-03-15',
    gender: 'female',
    height: 165,
    current_weight: 75.5,
    target_weight: 65,
    activity_level: 'moderately_active',
    health_goals: ['Control de peso', 'Mejorar hábitos alimentarios'],
    dietary_restrictions: ['Bajo en sodio'],
    allergies: [],
    medical_conditions: ['Prediabetes', 'Hipertensión leve'],
    medications: ['Metformina 500mg', 'Losartán 50mg']}
};

// Ejemplo de historia clínica con datos realistas
const exampleClinicalRecord: ClinicalRecord = {
  id: 'record-456',
  record_date: '2024-01-20',
  patient: {
    id: 'user-123',
    email: 'lucia.hernandez@example.com',
    first_name: 'Lucía',
    last_name: 'Hernández',
    age: 39,
    gender: 'female'},
  nutritionist: {
    id: 'nutritionist-789',
    email: 'dra.martinez@example.com',
    first_name: 'Ana',
    last_name: 'Martínez'},
  expedient_number: 'EXP-2024-001',
  consultation_reason: 'Control de peso y mejora de hábitos alimentarios',
  current_problems: {
    gastritis: true,
    constipation: false,
    nausea: false,
    observations: 'Molestias ocasionales después de comidas pesadas'
  },
  diagnosed_diseases: {
    has_disease: true,
    disease_name: 'Prediabetes, Hipertensión leve',
    since_when: '2 años',
    takes_medication: true,
    medications_list: ['Metformina 500mg', 'Losartán 50mg'],
    has_important_disease: false,
    has_surgery: false
  },
  family_medical_history: {
    diabetes: true,
    hta: true,
    obesity: true,
    cancer: false,
    hypo_hyperthyroidism: false,
    dyslipidemia: false,
    other_history: 'Padre con diabetes tipo 2, madre con hipertensión'
  },
  daily_activities: {
    wake_up: '06:00',
    breakfast: '07:00',
    lunch: '14:00',
    dinner: '20:00',
    sleep: '22:30',
    other_hours: [
      { hour: '10:00', activity: 'Trabajo de oficina' },
      { hour: '16:00', activity: 'Snack y café' }
    ]
  },
  physical_exercise: {
    performs_exercise: true,
    type: 'Caminata y yoga',
    frequency: '3 veces por semana',
    duration: '45 minutos',
    since_when: '6 meses'
  },
  consumption_habits: {
    alcohol: 'Ocasional (1-2 copas vino/semana)',
    tobacco: 'No',
    coffee: '2 tazas al día',
    other_substances: 'Ninguna'
  },
  blood_pressure: {
    knows_bp: true,
    habitual_bp: '135/85',
    systolic: 135,
    diastolic: 85
  },
  anthropometric_measurements: {
    current_weight_kg: 75.5,
    habitual_weight_kg: 68.0,
    height_m: 1.65,
    waist_circ_cm: 88,
    hip_circ_cm: 102,
    arm_circ_cm: 28
  },
  energy_nutrient_needs: {
    get: 1650,
    geb: 1420,
    eta: 1650,
    fa: 1.2,
    total_calories: 1650
  },
  water_consumption_liters: 2.0,
  created_at: '2024-01-20T09:15:00Z',
  updated_at: '2024-01-20T09:15:00Z'};

// Ejemplo de plan de dieta
const exampleDietPlan: DietPlan = {
  id: 'diet-plan-789',
  name: 'Plan de Control de Peso - Semana 1',
  description: 'Plan nutricional personalizado para control de peso y manejo de prediabetes',
  patient_id: 'patient-123',
  nutritionist_id: 'nutritionist-789',
  status: 'active',
  start_date: '2024-01-22',
  end_date: '2024-01-29',
  target_calories: 1650,
  notes: 'Enfoque en alimentos de bajo índice glicémico y control de porciones',
  created_at: '2024-01-20T10:00:00Z',
  updated_at: '2024-01-20T10:00:00Z',
  meals: [
    {
      id: 'meal-1',
      diet_plan_id: 'diet-plan-789',
      type: 'breakfast',
      name: 'Desayuno',
      target_time: '07:00',
      calories: 400,
      protein: 25,
      carbs: 45,
      fats: 15,
      meal_items: [
        {
          id: 'item-1',
          meal_id: 'meal-1',
          food_id: 'food-1',
          quantity_grams: 100,
          food: {
            id: 'food-1',
            name: 'Avena con frutos rojos',
            category: 'cereales',
            calories_per_100g: 250,
            protein_per_100g: 8,
            carbs_per_100g: 45,
            fats_per_100g: 5,
            is_active: true}
        }
      ]
    }
  ]};

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
                  Tarjetas Nutricionales Avanzadas - Sistema Litam
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
                          <strong>IMC:</strong> {exampleClinicalRecord.anthropometric_measurements?.current_weight_kg} kg
                        </div>
                        <div className="mb-2">
                          <strong>Diagnóstico:</strong> {exampleClinicalRecord.diagnosed_diseases?.disease_name}
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
                            <strong>{exampleClinicalRecord.anthropometric_measurements?.current_weight_kg} kg</strong>
                          </div>
                          <div className="d-flex justify-content-between">
                            <span>Altura:</span>
                            <strong>{(((exampleClinicalRecord.anthropometric_measurements?.height_m || 0) as number) * 100).toFixed(0)} cm</strong>
                          </div>
                          <div className="d-flex justify-content-between">
                            <span>Presión:</span>
                            <strong>{exampleClinicalRecord.blood_pressure?.habitual_bp}</strong>
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