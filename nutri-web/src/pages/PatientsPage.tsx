import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const PatientsPage: React.FC = () => {
  const [showMedicalRecordModal, setShowMedicalRecordModal] = useState(false);

  // Datos de ejemplo con expediente clínico completo según el formato solicitado
  const selectedPatient = {
    id: 'exp-001',
    user: {
      id: 'user-001',
      email: 'maria.gonzalez@demo.com',
      first_name: 'María',
      last_name: 'González Pérez',
      age: 35,
      gender: 'Femenino',
      created_at: new Date()
    },
    consultation_reason: 'Desea perder peso de manera saludable y mejorar sus hábitos alimentarios para controlar la hipertensión',
    current_weight: 70.5,
    height: 165,
    activity_level: 'moderada',
    diagnosed_diseases: 'Hipertensión arterial',
    diagnosed_since: 'Hace 2 años',
    medications: ['Lisinopril 10mg'],
    important_diseases_history: 'No presenta antecedentes importantes',
    current_treatments: 'Tratamiento antihipertensivo',
    surgeries_history: 'Apendicectomía a los 25 años',
    current_symptoms: {
      diarrhea: 'No',
      constipation: 'Ocasional',
      gastritis: 'No',
      ulcer: 'No',
      nausea: 'No',
      heartburn: 'Ocasional después de comidas pesadas',
      vomiting: 'No',
      colitis: 'No',
      mouth_mechanics: 'Sin problemas',
      others: 'Sensación de hinchazón abdominal',
      observations: 'Síntomas digestivos leves relacionados con alimentación'
    },
    family_history: {
      obesity: true,
      diabetes: true,
      hypertension: true,
      cancer: false,
      thyroid_issues: false,
      dyslipidemia: true,
      other: 'Madre con diabetes tipo 2, padre con hipertensión'
    },
    does_exercise: true,
    exercise_type: 'Caminata y yoga',
    exercise_frequency: '3 veces por semana',
    exercise_duration: '45 minutos',
    exercise_since: 'Hace 6 meses',
    alcohol_consumption: 'Copa de vino ocasional los fines de semana',
    tobacco_consumption: 'No fuma',
    coffee_consumption: '2 tazas por día',
    general_appearance: 'Buena apariencia general, piel hidratada, cabello brillante',
    knows_blood_pressure: true,
    usual_blood_pressure: '135/85',
    biochemical_indicators: {
      glucose: 105,
      cholesterol: 220,
      triglycerides: 150,
      hdl: 45,
      ldl: 140,
      hemoglobin: 12.5,
      hematocrit: 38,
      other_labs: 'TSH: 2.1 mIU/L (normal)',
      last_update: new Date('2024-06-01')
    },
    previous_nutritional_guidance: true,
    previous_guidance_when: 'Hace 1 año',
    guidance_adherence_level: 'moderado',
    guidance_adherence_reason: 'Le costó mantener la constancia por el trabajo',
    who_prepares_food: 'Ella misma y esposo',
    eats_home_or_out: 'Principalmente en casa',
    diet_modified_last_6_months: true,
    diet_modification_reason: 'Reducción de porciones y eliminación de harinas',
    hungriest_time: '6:00 PM',
    preferred_foods: ['Ensaladas', 'Frutas', 'Pescado', 'Vegetales'],
    disliked_foods: ['Vísceras', 'Mariscos'],
    food_intolerances: ['Lactosa'],
    takes_supplements: true,
    supplements_details: 'Omega 3 (1000mg) - 1 cápsula diaria para colesterol',
    daily_water_glasses: 6,
    daily_schedule: {
      wake_up_time: '6:30 AM',
      breakfast_time: '7:00 AM',
      lunch_time: '1:00 PM',
      dinner_time: '7:00 PM',
      sleep_time: '10:30 PM',
      main_activities: [
        { time: '8:00 AM', activity: 'Trabajo de oficina' },
        { time: '12:00 PM', activity: 'Pausa para almorzar' },
        { time: '6:00 PM', activity: 'Ejercicio o tareas domésticas' },
        { time: '8:00 PM', activity: 'Tiempo en familia' }
      ]
    },
    food_frequency: {
      vegetables: 'Diario (2-3 porciones)',
      fruits: 'Diario (2 porciones)',
      cereals: '2-3 veces por semana',
      legumes: '1 vez por semana',
      animal_products: '4-5 veces por semana',
      dairy: '2-3 veces por semana (sin lactosa)',
      fats: 'Diario (aceite de oliva)',
      sugars: '2-3 veces por semana',
      alcohol: '1 vez por semana'
    },
    bmi: 25.9,
    bmi_category: 'Sobrepeso'
  };

  return (
    <div className="container-fluid py-4">
      <div className="row">
        <div className="col-12">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <div>
              <h1 className="h3 mb-0">
                <i className="bi bi-people-fill me-2 text-primary"></i>
                Gestión de Pacientes
              </h1>
              <p className="text-muted mb-0">Sistema completo de expedientes clínicos</p>
            </div>
            <Link to="/dashboard" className="btn btn-outline-secondary">
              <i className="bi bi-arrow-left me-1"></i>
              Volver al Dashboard
            </Link>
          </div>

          {/* Demostración del Expediente Clínico */}
          <div className="row">
            <div className="col-md-6">
              <div className="card">
                <div className="card-header bg-primary text-white">
                  <h5 className="card-title mb-0">
                    <i className="bi bi-person-fill me-2"></i>
                    Paciente de Ejemplo
                  </h5>
                </div>
                <div className="card-body">
                  <div className="d-flex align-items-center mb-3">
                    <div className="bg-primary rounded-circle d-flex align-items-center justify-content-center me-3" 
                         style={{ width: '60px', height: '60px' }}>
                      <i className="bi bi-person-fill text-white fs-4"></i>
                    </div>
                    <div>
                      <h5 className="mb-0">{selectedPatient.user.first_name} {selectedPatient.user.last_name}</h5>
                      <p className="text-muted mb-0">{selectedPatient.user.email}</p>
                      <small className="text-muted">
                        {selectedPatient.user.age} años • {selectedPatient.user.gender}
                      </small>
                    </div>
                  </div>

                  <div className="row mb-3">
                    <div className="col-6">
                      <div className="text-center p-3 bg-light rounded">
                        <div className="h4 mb-0 text-primary">{selectedPatient.current_weight} kg</div>
                        <small className="text-muted">Peso Actual</small>
                      </div>
                    </div>
                    <div className="col-6">
                      <div className="text-center p-3 bg-light rounded">
                        <div className="h4 mb-0 text-info">{selectedPatient.bmi}</div>
                        <small className="text-muted">IMC ({selectedPatient.bmi_category})</small>
                      </div>
                    </div>
                  </div>

                  <div className="mb-3">
                    <strong>Motivo de consulta:</strong>
                    <p className="text-muted mb-0">{selectedPatient.consultation_reason}</p>
                  </div>

                  <div className="mb-3">
                    <strong>Antecedentes:</strong>
                    <span className="badge bg-warning ms-2">Hipertensión</span>
                    <span className="badge bg-info ms-1">Antec. Familiares</span>
                  </div>

                  <div className="d-grid">
                    <button 
                      className="btn btn-primary btn-lg"
                      onClick={() => setShowMedicalRecordModal(true)}
                    >
                      <i className="bi bi-file-medical me-2"></i>
                      Ver Expediente Clínico Completo
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-md-6">
              <div className="card">
                <div className="card-header">
                  <h5 className="card-title mb-0">
                    <i className="bi bi-info-circle me-2"></i>
                    Sobre el Expediente Clínico
                  </h5>
                </div>
                <div className="card-body">
                  <p>El expediente clínico completo incluye todas las secciones requeridas para una evaluación nutricional profesional:</p>
                  
                  <ul className="list-unstyled">
                    <li className="mb-2">
                      <i className="bi bi-check-circle-fill text-success me-2"></i>
                      <strong>Datos Personales</strong> - Información completa del paciente
                    </li>
                    <li className="mb-2">
                      <i className="bi bi-check-circle-fill text-success me-2"></i>
                      <strong>Indicadores Clínicos</strong> - Peso, altura, IMC
                    </li>
                    <li className="mb-2">
                      <i className="bi bi-check-circle-fill text-success me-2"></i>
                      <strong>Antecedentes Patológicos</strong> - Historia médica
                    </li>
                    <li className="mb-2">
                      <i className="bi bi-check-circle-fill text-success me-2"></i>
                      <strong>Problemas Actuales</strong> - Síntomas digestivos
                    </li>
                    <li className="mb-2">
                      <i className="bi bi-check-circle-fill text-success me-2"></i>
                      <strong>Antecedentes Familiares</strong> - Historia familiar
                    </li>
                    <li className="mb-2">
                      <i className="bi bi-check-circle-fill text-success me-2"></i>
                      <strong>Actividad Física</strong> - Rutinas y ejercicios
                    </li>
                    <li className="mb-2">
                      <i className="bi bi-check-circle-fill text-success me-2"></i>
                      <strong>Indicadores Bioquímicos</strong> - Laboratorios
                    </li>
                    <li className="mb-2">
                      <i className="bi bi-check-circle-fill text-success me-2"></i>
                      <strong>Indicadores Dietéticos</strong> - Hábitos alimentarios
                    </li>
                    <li className="mb-2">
                      <i className="bi bi-check-circle-fill text-success me-2"></i>
                      <strong>Estilo de Vida</strong> - Rutina diaria
                    </li>
                    <li className="mb-2">
                      <i className="bi bi-check-circle-fill text-success me-2"></i>
                      <strong>Frecuencia de Consumo</strong> - Por grupos alimentarios
                    </li>
                  </ul>

                  <div className="alert alert-info">
                    <i className="bi bi-lightbulb me-2"></i>
                    El expediente está optimizado para impresión y descarga en PDF para su uso profesional.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de Expediente Clínico Completo */}
      <div className={`modal fade ${showMedicalRecordModal ? 'show' : ''}`} 
           style={{ display: showMedicalRecordModal ? 'block' : 'none' }}
           tabIndex={-1}>
        <div className="modal-dialog modal-xl">
          <div className="modal-content">
            <div className="modal-header bg-primary text-white">
              <h5 className="modal-title">
                <i className="bi bi-file-medical me-2"></i>
                Expediente Clínico Completo
              </h5>
              <button type="button" className="btn-close btn-close-white" 
                      onClick={() => setShowMedicalRecordModal(false)}></button>
            </div>
            <div className="modal-body" style={{ maxHeight: '80vh', overflowY: 'auto' }}>
              <div className="clinical-record">
                {/* Datos Personales */}
                <div className="section mb-4">
                  <h6 className="bg-light p-2 mb-3 border-start border-primary border-4">
                    DATOS PERSONALES
                  </h6>
                  <div className="row">
                    <div className="col-md-6">
                      <p><strong>Expediente:</strong> #{selectedPatient.id.slice(-8).toUpperCase()}</p>
                      <p><strong>Nombre:</strong> {selectedPatient.user.first_name} {selectedPatient.user.last_name}</p>
                      <p><strong>Edad:</strong> {selectedPatient.user.age || 'No especificado'}</p>
                      <p><strong>Fecha:</strong> {new Date().toLocaleDateString()}</p>
                    </div>
                    <div className="col-md-6">
                      <p><strong>Sexo:</strong> {selectedPatient.user.gender || 'No especificado'}</p>
                      <p><strong>Estado Civil:</strong> _________________</p>
                      <p><strong>Escolaridad:</strong> __________________________________</p>
                      <p><strong>Ocupación:</strong> __________________</p>
                    </div>
                  </div>
                  <div className="row">
                    <div className="col-12">
                      <p><strong>Dirección:</strong></p>
                      <p>________________________________________________________________________________</p>
                      <p><strong>Teléfono:</strong> ______________________________ <strong>E-mail:</strong> {selectedPatient.user.email}</p>
                    </div>
                  </div>
                </div>

                {/* Motivo de la Consulta */}
                <div className="section mb-4">
                  <h6 className="bg-light p-2 mb-3 border-start border-primary border-4">
                    Motivo de la consulta
                  </h6>
                  <div className="border p-3 bg-light">
                    <p>{selectedPatient.consultation_reason}</p>
                  </div>
                </div>

                {/* Actividad Física */}
                <div className="section mb-4">
                  <h6 className="bg-light p-2 mb-3 border-start border-primary border-4">
                    Actividad:
                  </h6>
                  <div className="row mb-3">
                    <div className="col-12">
                      <div className="d-flex gap-4">
                        <span className={`badge ${selectedPatient.activity_level === 'muy_ligera' ? 'bg-primary' : 'bg-light text-dark'} p-2`}>
                          Muy ligera
                        </span>
                        <span className={`badge ${selectedPatient.activity_level === 'ligera' ? 'bg-primary' : 'bg-light text-dark'} p-2`}>
                          Ligera
                        </span>
                        <span className={`badge ${selectedPatient.activity_level === 'moderada' ? 'bg-primary' : 'bg-light text-dark'} p-2`}>
                          Moderada ✓
                        </span>
                        <span className={`badge ${selectedPatient.activity_level === 'pesada' ? 'bg-primary' : 'bg-light text-dark'} p-2`}>
                          Pesada
                        </span>
                        <span className={`badge ${selectedPatient.activity_level === 'excepcional' ? 'bg-primary' : 'bg-light text-dark'} p-2`}>
                          Excepcional
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="row">
                    <div className="col-md-4">
                      <p><strong>¿Realiza algún tipo de ejercicio físico?:</strong> 
                        <span className={`ms-2 badge ${selectedPatient.does_exercise ? 'bg-success' : 'bg-danger'}`}>
                          {selectedPatient.does_exercise ? 'SÍ' : 'NO'}
                        </span>
                      </p>
                    </div>
                    <div className="col-md-8">
                      <p><strong>¿Cuál?:</strong> {selectedPatient.exercise_type || '_______________________'}</p>
                    </div>
                  </div>
                  <div className="row">
                    <div className="col-md-4">
                      <p><strong>Frecuencia:</strong> {selectedPatient.exercise_frequency}</p>
                    </div>
                    <div className="col-md-4">
                      <p><strong>Duración:</strong> {selectedPatient.exercise_duration}</p>
                    </div>
                    <div className="col-md-4">
                      <p><strong>¿Desde cuándo?:</strong> {selectedPatient.exercise_since}</p>
                    </div>
                  </div>
                </div>

                {/* Consumo */}
                <div className="section mb-4">
                  <h6 className="bg-light p-2 mb-3 border-start border-primary border-4">
                    Consumo (frecuencia y cantidad)
                  </h6>
                  <div className="row">
                    <div className="col-md-4">
                      <p><strong>Alcohol:</strong> {selectedPatient.alcohol_consumption}</p>
                    </div>
                    <div className="col-md-4">
                      <p><strong>Tabaco:</strong> {selectedPatient.tobacco_consumption}</p>
                    </div>
                    <div className="col-md-4">
                      <p><strong>Café:</strong> {selectedPatient.coffee_consumption}</p>
                    </div>
                  </div>
                </div>

                {/* Signos */}
                <div className="section mb-4">
                  <h6 className="bg-light p-2 mb-3 border-start border-primary border-4">
                    SIGNOS
                  </h6>
                  <div className="mb-3">
                    <p><strong>Aspecto General (cabello, ojos, piel, uñas, labios, encías, etc.):</strong></p>
                    <div className="border p-3 bg-light">
                      <p>{selectedPatient.general_appearance}</p>
                    </div>
                  </div>
                  <div className="row">
                    <div className="col-md-6">
                      <p><strong>Presión Arterial</strong></p>
                      <p><strong>¿Conoce su presión Arterial?:</strong> 
                        <span className={`ms-2 badge ${selectedPatient.knows_blood_pressure ? 'bg-success' : 'bg-danger'}`}>
                          {selectedPatient.knows_blood_pressure ? 'SÍ' : 'NO'}
                        </span>
                      </p>
                    </div>
                    <div className="col-md-6">
                      <p><strong>¿Cuál es? (habitual):</strong> {selectedPatient.usual_blood_pressure}</p>
                    </div>
                  </div>
                </div>

                {/* Indicadores Clínicos */}
                <div className="section mb-4">
                  <h6 className="bg-light p-2 mb-3 border-start border-primary border-4">
                    INDICADORES CLÍNICOS
                  </h6>
                  <div className="row">
                    <div className="col-md-4">
                      <p><strong>Peso actual:</strong> {selectedPatient.current_weight} kg</p>
                    </div>
                    <div className="col-md-4">
                      <p><strong>Altura:</strong> {selectedPatient.height} cm</p>
                    </div>
                    <div className="col-md-4">
                      <p><strong>IMC:</strong> {selectedPatient.bmi} ({selectedPatient.bmi_category})</p>
                    </div>
                  </div>
                </div>

                {/* Indicadores Bioquímicos */}
                <div className="section mb-4">
                  <h6 className="bg-light p-2 mb-3 border-start border-primary border-4">
                    INDICADORES BIOQUÍMICOS
                  </h6>
                  <div className="row">
                    <div className="col-md-3">
                      <p><strong>Glucosa:</strong> {selectedPatient.biochemical_indicators.glucose} mg/dL</p>
                    </div>
                    <div className="col-md-3">
                      <p><strong>Colesterol:</strong> {selectedPatient.biochemical_indicators.cholesterol} mg/dL</p>
                    </div>
                    <div className="col-md-3">
                      <p><strong>Triglicéridos:</strong> {selectedPatient.biochemical_indicators.triglycerides} mg/dL</p>
                    </div>
                    <div className="col-md-3">
                      <p><strong>HDL:</strong> {selectedPatient.biochemical_indicators.hdl} mg/dL</p>
                    </div>
                  </div>
                  <div className="row">
                    <div className="col-md-3">
                      <p><strong>LDL:</strong> {selectedPatient.biochemical_indicators.ldl} mg/dL</p>
                    </div>
                    <div className="col-md-3">
                      <p><strong>Hemoglobina:</strong> {selectedPatient.biochemical_indicators.hemoglobin} g/dL</p>
                    </div>
                    <div className="col-md-3">
                      <p><strong>Hematocrito:</strong> {selectedPatient.biochemical_indicators.hematocrit}%</p>
                    </div>
                    <div className="col-md-3">
                      <p><strong>Otros:</strong> {selectedPatient.biochemical_indicators.other_labs}</p>
                    </div>
                  </div>
                </div>

                {/* Antecedentes Patológicos */}
                <div className="section mb-4">
                  <h6 className="bg-light p-2 mb-3 border-start border-primary border-4">
                    ANTECEDENTES PATOLÓGICOS
                  </h6>
                  <div className="mb-3">
                    <p><strong>¿Padece alguna enfermedad diagnosticada?:</strong> {selectedPatient.diagnosed_diseases}</p>
                  </div>
                  <div className="mb-3">
                    <p><strong>¿Desde cuándo?:</strong> {selectedPatient.diagnosed_since}</p>
                  </div>
                  <div className="mb-3">
                    <p><strong>¿Toma algún medicamento?:</strong> 
                      <span className="ms-2">
                        {selectedPatient.medications && selectedPatient.medications.length > 0 ? 'SÍ' : 'NO'}
                      </span>
                    </p>
                    <p><strong>¿Cuáles?:</strong> {selectedPatient.medications?.join(', ')}</p>
                  </div>
                  <div className="mb-3">
                    <p><strong>¿Ha padecido alguna enfermedad importante?:</strong> {selectedPatient.important_diseases_history}</p>
                  </div>
                  <div className="mb-3">
                    <p><strong>¿Actualmente toma algún tratamiento especial?:</strong> {selectedPatient.current_treatments}</p>
                  </div>
                  <div className="mb-3">
                    <p><strong>¿Le han practicado alguna cirugía?:</strong> {selectedPatient.surgeries_history}</p>
                  </div>
                </div>

                {/* Problemas Actuales */}
                <div className="section mb-4">
                  <h6 className="bg-light p-2 mb-3 border-start border-primary border-4">
                    PROBLEMAS ACTUALES
                  </h6>
                  <div className="row mb-3">
                    <div className="col-md-3">
                      <p><strong>Diarrea:</strong> {selectedPatient.current_symptoms.diarrhea}</p>
                    </div>
                    <div className="col-md-3">
                      <p><strong>Estreñimiento:</strong> {selectedPatient.current_symptoms.constipation}</p>
                    </div>
                    <div className="col-md-3">
                      <p><strong>Gastritis:</strong> {selectedPatient.current_symptoms.gastritis}</p>
                    </div>
                    <div className="col-md-3">
                      <p><strong>Úlcera:</strong> {selectedPatient.current_symptoms.ulcer}</p>
                    </div>
                  </div>
                  <div className="row mb-3">
                    <div className="col-md-3">
                      <p><strong>Náusea:</strong> {selectedPatient.current_symptoms.nausea}</p>
                    </div>
                    <div className="col-md-3">
                      <p><strong>Pirosis:</strong> {selectedPatient.current_symptoms.heartburn}</p>
                    </div>
                    <div className="col-md-3">
                      <p><strong>Vómito:</strong> {selectedPatient.current_symptoms.vomiting}</p>
                    </div>
                    <div className="col-md-3">
                      <p><strong>Colitis:</strong> {selectedPatient.current_symptoms.colitis}</p>
                    </div>
                  </div>
                  <div className="mb-3">
                    <p><strong>Mecánicos de la boca:</strong> {selectedPatient.current_symptoms.mouth_mechanics}</p>
                    <p><strong>Otros:</strong> {selectedPatient.current_symptoms.others}</p>
                  </div>
                  <div className="mb-3">
                    <p><strong>Observaciones:</strong></p>
                    <div className="border p-3 bg-light">
                      <p>{selectedPatient.current_symptoms.observations}</p>
                    </div>
                  </div>
                </div>

                {/* Antecedentes Familiares */}
                <div className="section mb-4">
                  <h6 className="bg-light p-2 mb-3 border-start border-primary border-4">
                    ¿PRESENTA ALGUNO DE ESTOS ANTECEDENTES FAMILIARES?
                  </h6>
                  <div className="row">
                    <div className="col-md-2">
                      <p><strong>Obesidad:</strong> 
                        <span className={`ms-2 badge ${selectedPatient.family_history.obesity ? 'bg-warning' : 'bg-light text-dark'}`}>
                          {selectedPatient.family_history.obesity ? '✓' : '____'}
                        </span>
                      </p>
                    </div>
                    <div className="col-md-2">
                      <p><strong>Diabetes:</strong> 
                        <span className={`ms-2 badge ${selectedPatient.family_history.diabetes ? 'bg-warning' : 'bg-light text-dark'}`}>
                          {selectedPatient.family_history.diabetes ? '✓' : '____'}
                        </span>
                      </p>
                    </div>
                    <div className="col-md-2">
                      <p><strong>HTA:</strong> 
                        <span className={`ms-2 badge ${selectedPatient.family_history.hypertension ? 'bg-warning' : 'bg-light text-dark'}`}>
                          {selectedPatient.family_history.hypertension ? '✓' : '____'}
                        </span>
                      </p>
                    </div>
                    <div className="col-md-2">
                      <p><strong>Cáncer:</strong> 
                        <span className={`ms-2 badge ${selectedPatient.family_history.cancer ? 'bg-warning' : 'bg-light text-dark'}`}>
                          {selectedPatient.family_history.cancer ? '✓' : '____'}
                        </span>
                      </p>
                    </div>
                    <div className="col-md-2">
                      <p><strong>Hipo/Hipertiroidismo:</strong> 
                        <span className={`ms-2 badge ${selectedPatient.family_history.thyroid_issues ? 'bg-warning' : 'bg-light text-dark'}`}>
                          {selectedPatient.family_history.thyroid_issues ? '✓' : '____'}
                        </span>
                      </p>
                    </div>
                    <div className="col-md-2">
                      <p><strong>Dislipidemias:</strong> 
                        <span className={`ms-2 badge ${selectedPatient.family_history.dyslipidemia ? 'bg-warning' : 'bg-light text-dark'}`}>
                          {selectedPatient.family_history.dyslipidemia ? '✓' : '____'}
                        </span>
                      </p>
                    </div>
                  </div>
                  {selectedPatient.family_history.other && (
                    <div className="mt-3">
                      <p><strong>Otros antecedentes:</strong> {selectedPatient.family_history.other}</p>
                    </div>
                  )}
                </div>

                {/* Indicadores Dietéticos */}
                <div className="section mb-4">
                  <h6 className="bg-light p-2 mb-3 border-start border-primary border-4">
                    INDICADORES DIETÉTICOS
                  </h6>
                  <div className="mb-3">
                    <p><strong>¿Ha recibido orientación nutricional anteriormente?:</strong> 
                      <span className={`ms-2 badge ${selectedPatient.previous_nutritional_guidance ? 'bg-success' : 'bg-danger'}`}>
                        {selectedPatient.previous_nutritional_guidance ? 'SÍ' : 'NO'}
                      </span>
                    </p>
                    <p><strong>¿Cuándo?:</strong> {selectedPatient.previous_guidance_when}</p>
                  </div>
                  <div className="mb-3">
                    <p><strong>¿Cuál fue el apego que tuvo a las recomendaciones nutricionales?</strong></p>
                    <div className="d-flex gap-3 mb-2">
                      <span className={`badge ${selectedPatient.guidance_adherence_level === 'nada' ? 'bg-primary' : 'bg-light text-dark'} p-2`}>
                        Nada
                      </span>
                      <span className={`badge ${selectedPatient.guidance_adherence_level === 'minimo' ? 'bg-primary' : 'bg-light text-dark'} p-2`}>
                        Mínimo
                      </span>
                      <span className={`badge ${selectedPatient.guidance_adherence_level === 'moderado' ? 'bg-primary' : 'bg-light text-dark'} p-2`}>
                        Moderado apego ✓
                      </span>
                      <span className={`badge ${selectedPatient.guidance_adherence_level === 'bueno' ? 'bg-primary' : 'bg-light text-dark'} p-2`}>
                        Buen apego
                      </span>
                      <span className={`badge ${selectedPatient.guidance_adherence_level === 'excelente' ? 'bg-primary' : 'bg-light text-dark'} p-2`}>
                        Excelente apego
                      </span>
                    </div>
                    <p><strong>¿Por qué?:</strong> {selectedPatient.guidance_adherence_reason}</p>
                  </div>
                  <div className="row mb-3">
                    <div className="col-md-6">
                      <p><strong>¿Quién prepara sus alimentos en casa?:</strong> {selectedPatient.who_prepares_food}</p>
                    </div>
                    <div className="col-md-6">
                      <p><strong>¿Acostumbra más a comer en casa o fuera de casa?:</strong> {selectedPatient.eats_home_or_out}</p>
                    </div>
                  </div>
                  <div className="mb-3">
                    <p><strong>¿Ha modificado su alimentación en los últimos 6 meses? (trabajo, estudio o actividad):</strong></p>
                    <p>
                      <span className={`badge ${selectedPatient.diet_modified_last_6_months ? 'bg-success' : 'bg-danger'}`}>
                        {selectedPatient.diet_modified_last_6_months ? 'SÍ' : 'NO'}
                      </span>
                      <span className="ms-3"><strong>¿Por qué?:</strong> {selectedPatient.diet_modification_reason}</span>
                    </p>
                  </div>
                  <div className="mb-3">
                    <p><strong>¿A qué hora tiene más hambre?:</strong> {selectedPatient.hungriest_time}</p>
                  </div>
                  <div className="row mb-3">
                    <div className="col-md-6">
                      <p><strong>Cuáles son sus alimentos preferidos:</strong> {selectedPatient.preferred_foods?.join(', ')}</p>
                    </div>
                    <div className="col-md-6">
                      <p><strong>Cuáles son los que no le agradan/acostumbra:</strong> {selectedPatient.disliked_foods?.join(', ')}</p>
                    </div>
                  </div>
                  <div className="mb-3">
                    <p><strong>Qué alimentos le causan malestar ó alergia:</strong> {selectedPatient.food_intolerances?.join(', ')}</p>
                  </div>
                  <div className="mb-3">
                    <p><strong>¿Toma algún suplemento/complemento alimenticio?:</strong></p>
                    <p>
                      <span className={`badge ${selectedPatient.takes_supplements ? 'bg-success' : 'bg-danger'}`}>
                        {selectedPatient.takes_supplements ? 'SÍ' : 'NO'}
                      </span>
                    </p>
                    <p><strong>¿Cuál? Dosis ¿Por qué?:</strong> {selectedPatient.supplements_details}</p>
                  </div>
                  <div className="mb-3">
                    <p><strong>¿Cuántos vasos de agua consume en el día?:</strong> {selectedPatient.daily_water_glasses}</p>
                  </div>
                </div>

                {/* Estilo de Vida */}
                <div className="section mb-4">
                  <h6 className="bg-light p-2 mb-3 border-start border-primary border-4">
                    ESTILO DE VIDA - Diario de Actividades (24 horas):
                  </h6>
                  <table className="table table-bordered">
                    <thead>
                      <tr>
                        <th>HORA</th>
                        <th>PRINCIPAL ACTIVIDAD REALIZADA</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td><strong>DESPERTARSE</strong></td>
                        <td>{selectedPatient.daily_schedule.wake_up_time}</td>
                      </tr>
                      <tr>
                        <td><strong>DESAYUNO</strong></td>
                        <td>{selectedPatient.daily_schedule.breakfast_time}</td>
                      </tr>
                      <tr>
                        <td><strong>COMIDA</strong></td>
                        <td>{selectedPatient.daily_schedule.lunch_time}</td>
                      </tr>
                      <tr>
                        <td><strong>CENA</strong></td>
                        <td>{selectedPatient.daily_schedule.dinner_time}</td>
                      </tr>
                      <tr>
                        <td><strong>DORMIR</strong></td>
                        <td>{selectedPatient.daily_schedule.sleep_time}</td>
                      </tr>
                      {selectedPatient.daily_schedule.main_activities?.map((activity, index) => (
                        <tr key={index}>
                          <td>{activity.time}</td>
                          <td>{activity.activity}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Frecuencia de Consumo */}
                <div className="section mb-4">
                  <h6 className="bg-light p-2 mb-3 border-start border-primary border-4">
                    FRECUENCIA DE CONSUMO POR GRUPOS DE ALIMENTOS (SEMANAL)
                  </h6>
                  <table className="table table-bordered">
                    <thead>
                      <tr>
                        <th>verduras</th>
                        <th>frutas</th>
                        <th>cereales</th>
                        <th>leguminosas</th>
                        <th>animal</th>
                        <th>leche</th>
                        <th>grasas</th>
                        <th>azúcares</th>
                        <th>alcohol</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>{selectedPatient.food_frequency.vegetables}</td>
                        <td>{selectedPatient.food_frequency.fruits}</td>
                        <td>{selectedPatient.food_frequency.cereals}</td>
                        <td>{selectedPatient.food_frequency.legumes}</td>
                        <td>{selectedPatient.food_frequency.animal_products}</td>
                        <td>{selectedPatient.food_frequency.dairy}</td>
                        <td>{selectedPatient.food_frequency.fats}</td>
                        <td>{selectedPatient.food_frequency.sugars}</td>
                        <td>{selectedPatient.food_frequency.alcohol}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div className="text-end mt-4">
                  <p><strong>Fecha:</strong> {new Date().toLocaleDateString()}</p>
                  <p><strong>Expediente:</strong> #{selectedPatient.id.slice(-8).toUpperCase()}</p>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-success me-2">
                <i className="bi bi-printer me-1"></i>
                Imprimir Expediente
              </button>
              <button type="button" className="btn btn-primary me-2">
                <i className="bi bi-download me-1"></i>
                Descargar PDF
              </button>
              <button type="button" className="btn btn-secondary" 
                      onClick={() => setShowMedicalRecordModal(false)}>
                Cerrar
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* CSS para el expediente clínico */}
      <style>
        {`
          .clinical-record .section {
            margin-bottom: 2rem;
          }
          
          .clinical-record h6 {
            font-weight: bold;
            font-size: 1.1rem;
            margin-bottom: 1rem;
          }
          
          .clinical-record p {
            margin-bottom: 0.5rem;
            line-height: 1.4;
          }
          
          .clinical-record .table td, 
          .clinical-record .table th {
            padding: 0.5rem;
            font-size: 0.9rem;
          }
          
          @media print {
            .modal-header, .modal-footer {
              display: none !important;
            }
            
            .modal-body {
              padding: 0 !important;
            }
            
            .clinical-record {
              font-size: 12px;
            }
            
            .clinical-record h6 {
              font-size: 14px;
              page-break-after: avoid;
            }
            
            .section {
              page-break-inside: avoid;
              margin-bottom: 1rem;
            }
          }
        `}
      </style>
    </div>
  );
};

export default PatientsPage; 