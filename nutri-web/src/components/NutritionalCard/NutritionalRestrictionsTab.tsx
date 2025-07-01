import React, { useState, useEffect } from 'react';
import { Patient } from '../../types/patient';
import { ClinicalRecord } from '../../types/clinical-record';

interface Allergy {
  id: string;
  name: string;
  severity: 'mild' | 'moderate' | 'severe';
  symptoms: string[];
  avoidFoods: string[];
  notes?: string;
}

interface Intolerance {
  id: string;
  name: string;
  type: 'lactose' | 'gluten' | 'fructose' | 'histamine' | 'other';
  severity: 'mild' | 'moderate' | 'severe';
  symptoms: string[];
  avoidFoods: string[];
  alternatives: string[];
  notes?: string;
}

interface MedicalCondition {
  id: string;
  condition: string;
  dietaryRestrictions: string[];
  recommendedFoods: string[];
  avoidFoods: string[];
  specialConsiderations: string[];
  medications?: {
    name: string;
    interactions: string[];
  }[];
  notes?: string;
}

interface DietaryRestriction {
  id: string;
  type: 'vegetarian' | 'vegan' | 'kosher' | 'halal' | 'keto' | 'paleo' | 'other';
  name: string;
  avoidFoods: string[];
  preferredFoods: string[];
  strictness: 'flexible' | 'moderate' | 'strict';
  notes?: string;
}

interface PathologicalRestrictions {
  allergies: Allergy[];
  intolerances: Intolerance[];
  medicalConditions: MedicalCondition[];
  dietaryRestrictions: DietaryRestriction[];
  emergencyContacts: {
    name: string;
    relationship: string;
    phone: string;
    isPrimary: boolean;
  }[];
  generalNotes?: string;
}

interface NutritionalRestrictionsTabProps {
  planData: any;
  patient: Patient;
  clinicalRecord?: ClinicalRecord;
  mode: 'create' | 'edit' | 'view';
  onUpdateData: (section: string, data: any) => void;
  isLoading?: boolean;
}

const NutritionalRestrictionsTab: React.FC<NutritionalRestrictionsTabProps> = ({
  planData,
  patient,
  clinicalRecord,
  mode,
  onUpdateData,
  isLoading = false
}) => {
  const [restrictions, setRestrictions] = useState<PathologicalRestrictions>({
    allergies: [],
    intolerances: [],
    medicalConditions: [],
    dietaryRestrictions: [],
    emergencyContacts: [],
    generalNotes: ''
  });

  const [activeSection, setActiveSection] = useState<'allergies' | 'intolerances' | 'medical' | 'dietary' | 'emergency'>('allergies');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);

  // Cargar restricciones existentes
  useEffect(() => {
    if (planData.restrictions) {
      setRestrictions(planData.restrictions);
    }
  }, [planData.restrictions]);

  // Aplicar datos del expediente clínico
  const loadFromClinicalRecord = () => {
    if (!clinicalRecord) return;

    const updatedRestrictions: PathologicalRestrictions = { ...restrictions };

    // Extraer condiciones médicas del expediente
    if (clinicalRecord.diagnosed_diseases) {
      const diseases = clinicalRecord.diagnosed_diseases.split(',').map(d => d.trim());
      diseases.forEach(disease => {
        if (disease && !updatedRestrictions.medicalConditions.find(mc => mc.condition.toLowerCase() === disease.toLowerCase())) {
          const medicalCondition = createMedicalConditionFromDisease(disease);
          updatedRestrictions.medicalConditions.push(medicalCondition);
        }
      });
    }

    // Extraer información de consumo si está disponible
    if (clinicalRecord.consumption_habits) {
      const habits = JSON.parse(clinicalRecord.consumption_habits);
      if (habits.alcohol === 'No') {
        const noDrinkingRestriction: DietaryRestriction = {
          id: `dietary_${Date.now()}`,
          type: 'other',
          name: 'Sin Alcohol',
          avoidFoods: ['Cerveza', 'Vino', 'Licores', 'Cocteles'],
          preferredFoods: ['Agua', 'Jugos naturales', 'Té', 'Café'],
          strictness: 'strict',
          notes: 'Restricción de alcohol por indicación médica o personal'
        };
        updatedRestrictions.dietaryRestrictions.push(noDrinkingRestriction);
      }
    }

    setRestrictions(updatedRestrictions);
    onUpdateData('restrictions', updatedRestrictions);
  };

  // Crear condición médica basada en enfermedad
  const createMedicalConditionFromDisease = (disease: string): MedicalCondition => {
    const diseaseConditions: { [key: string]: Partial<MedicalCondition> } = {
      'diabetes': {
        dietaryRestrictions: ['Azúcar refinado', 'Carbohidratos simples', 'Alimentos procesados'],
        recommendedFoods: ['Vegetales de hoja verde', 'Proteínas magras', 'Granos integrales', 'Legumbres'],
        avoidFoods: ['Dulces', 'Refrescos', 'Pan blanco', 'Arroz blanco', 'Pasteles'],
        specialConsiderations: ['Control de porciones', 'Horarios regulares de comida', 'Monitoreo de glucosa']
      },
      'hipertensión': {
        dietaryRestrictions: ['Sodio excesivo', 'Alimentos procesados', 'Grasas saturadas'],
        recommendedFoods: ['Frutas', 'Vegetales', 'Pescado', 'Nueces', 'Aceite de oliva'],
        avoidFoods: ['Sal de mesa', 'Embutidos', 'Snacks salados', 'Enlatados con sal'],
        specialConsiderations: ['Dieta DASH', 'Reducir sodio a <2300mg/día', 'Aumentar potasio']
      },
      'obesidad': {
        dietaryRestrictions: ['Calorías excesivas', 'Azúcares añadidos', 'Grasas trans'],
        recommendedFoods: ['Vegetales', 'Frutas', 'Proteínas magras', 'Granos integrales'],
        avoidFoods: ['Comida rápida', 'Bebidas azucaradas', 'Frituras', 'Snacks procesados'],
        specialConsiderations: ['Control de porciones', 'Déficit calórico moderado', 'Ejercicio regular']
      }
    };

    const baseCondition = diseaseConditions[disease.toLowerCase()] || {
      dietaryRestrictions: ['Por definir'],
      recommendedFoods: ['Por definir'],
      avoidFoods: ['Por definir'],
      specialConsiderations: ['Consultar con médico especialista']
    };

    return {
      id: `medical_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      condition: disease,
      ...baseCondition,
      notes: `Condición médica extraída del expediente clínico del ${new Date(clinicalRecord?.record_date || Date.now()).toLocaleDateString()}`
    } as MedicalCondition;
  };

  // Agregar nueva restricción
  const addNewRestriction = (type: typeof activeSection) => {
    let newItem: any;
    
    switch (type) {
      case 'allergies':
        newItem = {
          id: `allergy_${Date.now()}`,
          name: '',
          severity: 'mild',
          symptoms: [],
          avoidFoods: [],
          notes: ''
        };
        break;
      case 'intolerances':
        newItem = {
          id: `intolerance_${Date.now()}`,
          name: '',
          type: 'other',
          severity: 'mild',
          symptoms: [],
          avoidFoods: [],
          alternatives: [],
          notes: ''
        };
        break;
      case 'medical':
        newItem = {
          id: `medical_${Date.now()}`,
          condition: '',
          dietaryRestrictions: [],
          recommendedFoods: [],
          avoidFoods: [],
          specialConsiderations: [],
          medications: [],
          notes: ''
        };
        break;
      case 'dietary':
        newItem = {
          id: `dietary_${Date.now()}`,
          type: 'other',
          name: '',
          avoidFoods: [],
          preferredFoods: [],
          strictness: 'moderate',
          notes: ''
        };
        break;
      case 'emergency':
        newItem = {
          name: '',
          relationship: '',
          phone: '',
          isPrimary: false
        };
        break;
    }
    
    setEditingItem(newItem);
    setShowAddModal(true);
  };

  // Guardar restricción
  const saveRestriction = (item: any, type: typeof activeSection) => {
    const updatedRestrictions = { ...restrictions };
    
    if (editingItem && restrictions[type as keyof PathologicalRestrictions].find((r: any) => r.id === editingItem.id)) {
      // Editar existente
      (updatedRestrictions[type as keyof PathologicalRestrictions] as any[]) = 
        (restrictions[type as keyof PathologicalRestrictions] as any[]).map((r: any) => 
          r.id === item.id ? item : r
        );
    } else {
      // Agregar nuevo
      (updatedRestrictions[type as keyof PathologicalRestrictions] as any[]).push(item);
    }
    
    setRestrictions(updatedRestrictions);
    onUpdateData('restrictions', updatedRestrictions);
    setShowAddModal(false);
    setEditingItem(null);
  };

  // Eliminar restricción
  const deleteRestriction = (id: string, type: typeof activeSection) => {
    const updatedRestrictions = {
      ...restrictions,
      [type]: (restrictions[type as keyof PathologicalRestrictions] as any[]).filter((r: any) => r.id !== id)
    };
    
    setRestrictions(updatedRestrictions);
    onUpdateData('restrictions', updatedRestrictions);
  };

  // Calcular estadísticas
  const calculateStats = () => {
    return {
      totalRestrictions: restrictions.allergies.length + restrictions.intolerances.length + 
                        restrictions.medicalConditions.length + restrictions.dietaryRestrictions.length,
      severeConditions: [
        ...restrictions.allergies.filter(a => a.severity === 'severe'),
        ...restrictions.intolerances.filter(i => i.severity === 'severe')
      ].length,
      avoidFoodsCount: [
        ...restrictions.allergies.flatMap(a => a.avoidFoods),
        ...restrictions.intolerances.flatMap(i => i.avoidFoods),
        ...restrictions.medicalConditions.flatMap(m => m.avoidFoods),
        ...restrictions.dietaryRestrictions.flatMap(d => d.avoidFoods)
      ].filter((food, index, array) => array.indexOf(food) === index).length
    };
  };

  const isReadOnly = mode === 'view';
  const stats = calculateStats();

  const sections = [
    { key: 'allergies', label: 'Alergias', icon: '🚨', count: restrictions.allergies.length },
    { key: 'intolerances', label: 'Intolerancias', icon: '⚠️', count: restrictions.intolerances.length },
    { key: 'medical', label: 'Condiciones Médicas', icon: '🏥', count: restrictions.medicalConditions.length },
    { key: 'dietary', label: 'Restricciones Dietéticas', icon: '🥗', count: restrictions.dietaryRestrictions.length },
    { key: 'emergency', label: 'Contactos de Emergencia', icon: '📞', count: restrictions.emergencyContacts.length }
  ];

  return (
    <div className="nutritional-restrictions-tab">
      <div className="row">
        {/* Panel principal */}
        <div className="col-md-8">
          {/* Navegación por secciones */}
          <div className="card mb-4">
            <div className="card-header">
              <ul className="nav nav-pills card-header-pills">
                {sections.map(section => (
                  <li key={section.key} className="nav-item">
                    <button 
                      className={`nav-link ${activeSection === section.key ? 'active' : ''}`}
                      onClick={() => setActiveSection(section.key as any)}
                    >
                      {section.icon} {section.label}
                      {section.count > 0 && (
                        <span className="badge bg-light text-dark ms-2">{section.count}</span>
                      )}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
            <div className="card-body">
              {/* Header de sección activa */}
              <div className="d-flex justify-content-between align-items-center mb-4">
                <h6 className="mb-0">
                  {sections.find(s => s.key === activeSection)?.icon} {sections.find(s => s.key === activeSection)?.label}
                </h6>
                <div>
                  {!isReadOnly && (
                    <>
                      {clinicalRecord && activeSection === 'medical' && (
                        <button
                          type="button"
                          className="btn btn-outline-info btn-sm me-2"
                          onClick={loadFromClinicalRecord}
                          disabled={isLoading}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-file-medical me-1">
                            <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"></path>
                            <path d="M14 2v4a2 2 0 0 0 2 2h4"></path>
                            <path d="M10 13h4"></path>
                            <path d="M12 11v4"></path>
                          </svg>
                          Cargar del Expediente
                        </button>
                      )}
                      <button
                        type="button"
                        className="btn btn-primary btn-sm"
                        onClick={() => addNewRestriction(activeSection)}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-plus me-1">
                          <path d="M5 12h14"></path>
                          <path d="M12 5v14"></path>
                        </svg>
                        Agregar
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Contenido de la sección activa */}
              {activeSection === 'allergies' && (
                <div className="allergies-section">
                  {restrictions.allergies.length === 0 ? (
                    <div className="text-center py-4">
                      <div className="text-muted mb-3" style={{ fontSize: '48px' }}>🚨</div>
                      <p className="text-muted">No hay alergias registradas</p>
                    </div>
                  ) : (
                    <div className="row">
                      {restrictions.allergies.map(allergy => (
                        <div key={allergy.id} className="col-md-6 mb-3">
                          <div className="card">
                            <div className="card-body">
                              <div className="d-flex justify-content-between align-items-start mb-2">
                                <h6 className="card-title mb-0">{allergy.name}</h6>
                                <span className={`badge ${
                                  allergy.severity === 'severe' ? 'bg-danger' : 
                                  allergy.severity === 'moderate' ? 'bg-warning' : 'bg-info'
                                }`}>
                                  {allergy.severity === 'severe' ? 'Severa' : 
                                   allergy.severity === 'moderate' ? 'Moderada' : 'Leve'}
                                </span>
                              </div>
                              
                              {allergy.symptoms.length > 0 && (
                                <div className="mb-2">
                                  <strong className="small">Síntomas:</strong>
                                  <div className="small text-muted">{allergy.symptoms.join(', ')}</div>
                                </div>
                              )}
                              
                              {allergy.avoidFoods.length > 0 && (
                                <div className="mb-2">
                                  <strong className="small">Evitar:</strong>
                                  <div className="small text-muted">{allergy.avoidFoods.join(', ')}</div>
                                </div>
                              )}
                              
                              {allergy.notes && (
                                <div className="small text-muted">
                                  <em>"{allergy.notes}"</em>
                                </div>
                              )}
                              
                              {!isReadOnly && (
                                <div className="mt-2">
                                  <button 
                                    className="btn btn-sm btn-outline-primary me-1"
                                    onClick={() => {
                                      setEditingItem(allergy);
                                      setShowAddModal(true);
                                    }}
                                  >
                                    Editar
                                  </button>
                                  <button 
                                    className="btn btn-sm btn-outline-danger"
                                    onClick={() => deleteRestriction(allergy.id, 'allergies')}
                                  >
                                    Eliminar
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {activeSection === 'medical' && (
                <div className="medical-section">
                  {restrictions.medicalConditions.length === 0 ? (
                    <div className="text-center py-4">
                      <div className="text-muted mb-3" style={{ fontSize: '48px' }}>🏥</div>
                      <p className="text-muted">No hay condiciones médicas registradas</p>
                    </div>
                  ) : (
                    <div className="accordion" id="medicalConditionsAccordion">
                      {restrictions.medicalConditions.map((condition, index) => (
                        <div key={condition.id} className="accordion-item">
                          <h2 className="accordion-header">
                            <button 
                              className="accordion-button collapsed" 
                              type="button" 
                              data-bs-toggle="collapse" 
                              data-bs-target={`#collapse${index}`}
                            >
                              <strong>{condition.condition}</strong>
                            </button>
                          </h2>
                          <div 
                            id={`collapse${index}`} 
                            className="accordion-collapse collapse" 
                            data-bs-parent="#medicalConditionsAccordion"
                          >
                            <div className="accordion-body">
                              <div className="row">
                                <div className="col-md-6">
                                  <h6 className="text-success">Alimentos Recomendados</h6>
                                  <ul className="list-unstyled small">
                                    {condition.recommendedFoods.map((food, idx) => (
                                      <li key={idx}>✓ {food}</li>
                                    ))}
                                  </ul>
                                </div>
                                <div className="col-md-6">
                                  <h6 className="text-danger">Alimentos a Evitar</h6>
                                  <ul className="list-unstyled small">
                                    {condition.avoidFoods.map((food, idx) => (
                                      <li key={idx}>✗ {food}</li>
                                    ))}
                                  </ul>
                                </div>
                              </div>
                              
                              {condition.specialConsiderations.length > 0 && (
                                <div className="mt-3">
                                  <h6 className="text-info">Consideraciones Especiales</h6>
                                  <ul className="list-unstyled small">
                                    {condition.specialConsiderations.map((consideration, idx) => (
                                      <li key={idx}>• {consideration}</li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                              
                              {condition.notes && (
                                <div className="mt-3">
                                  <h6>Notas</h6>
                                  <p className="small text-muted">{condition.notes}</p>
                                </div>
                              )}
                              
                              {!isReadOnly && (
                                <div className="mt-3">
                                  <button 
                                    className="btn btn-sm btn-outline-primary me-1"
                                    onClick={() => {
                                      setEditingItem(condition);
                                      setShowAddModal(true);
                                    }}
                                  >
                                    Editar
                                  </button>
                                  <button 
                                    className="btn btn-sm btn-outline-danger"
                                    onClick={() => deleteRestriction(condition.id, 'medical')}
                                  >
                                    Eliminar
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Contenido para otras secciones... */}
              {(activeSection === 'intolerances' || activeSection === 'dietary' || activeSection === 'emergency') && (
                <div className="text-center py-5">
                  <div className="text-muted mb-3" style={{ fontSize: '48px' }}>
                    {sections.find(s => s.key === activeSection)?.icon}
                  </div>
                  <p className="text-muted">
                    Sección de {sections.find(s => s.key === activeSection)?.label} en desarrollo
                  </p>
                  <p className="small text-muted">
                    Esta funcionalidad estará disponible en la próxima iteración
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Notas generales */}
          <div className="card">
            <div className="card-header">
              <h6 className="mb-0">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-sticky-note me-2">
                  <path d="M16 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V8Z"></path>
                  <path d="M15 3v5l5-5"></path>
                </svg>
                Notas Generales sobre Restricciones
              </h6>
            </div>
            <div className="card-body">
              <textarea
                className="form-control"
                rows={4}
                value={restrictions.generalNotes || ''}
                onChange={(e) => {
                  const updatedRestrictions = { ...restrictions, generalNotes: e.target.value };
                  setRestrictions(updatedRestrictions);
                  onUpdateData('restrictions', updatedRestrictions);
                }}
                placeholder="Notas adicionales sobre las restricciones del paciente, consideraciones especiales, protocolos de emergencia, etc..."
                disabled={isReadOnly || isLoading}
              />
            </div>
          </div>
        </div>

        {/* Panel lateral */}
        <div className="col-md-4">
          {/* Estadísticas */}
          <div className="card mb-3">
            <div className="card-header">
              <h6 className="mb-0">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-shield-alert me-2">
                  <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"></path>
                  <path d="M12 8v4"></path>
                  <path d="M12 16h.01"></path>
                </svg>
                Resumen de Restricciones
              </h6>
            </div>
            <div className="card-body">
              <div className="row text-center">
                <div className="col-6 mb-3">
                  <div className="h4 text-primary mb-0">{stats.totalRestrictions}</div>
                  <div className="small text-muted">Total</div>
                </div>
                <div className="col-6 mb-3">
                  <div className={`h4 mb-0 ${stats.severeConditions > 0 ? 'text-danger' : 'text-success'}`}>
                    {stats.severeConditions}
                  </div>
                  <div className="small text-muted">Severas</div>
                </div>
                <div className="col-12">
                  <div className="h5 text-warning mb-0">{stats.avoidFoodsCount}</div>
                  <div className="small text-muted">Alimentos a Evitar</div>
                </div>
              </div>

              {stats.severeConditions > 0 && (
                <div className="alert alert-warning mt-3 py-2">
                  <small>
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-alert-triangle me-1">
                      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                      <path d="M12 9v4"></path>
                      <path d="M12 17h.01"></path>
                    </svg>
                    <strong>Alerta:</strong> Hay condiciones severas que requieren atención especial.
                  </small>
                </div>
              )}
            </div>
          </div>

          {/* Información del expediente clínico */}
          {clinicalRecord && (
            <div className="card mb-3">
              <div className="card-header">
                <h6 className="mb-0">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-file-medical me-2">
                    <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"></path>
                    <path d="M14 2v4a2 2 0 0 0 2 2h4"></path>
                    <path d="M10 13h4"></path>
                    <path d="M12 11v4"></path>
                  </svg>
                  Datos del Expediente
                </h6>
              </div>
              <div className="card-body">
                {clinicalRecord.diagnosed_diseases && (
                  <div className="mb-3">
                    <strong className="small">Enfermedades Diagnosticadas:</strong>
                    <div className="small text-muted">{clinicalRecord.diagnosed_diseases}</div>
                  </div>
                )}

                {clinicalRecord.consumption_habits && (
                  <div className="mb-3">
                    <strong className="small">Hábitos de Consumo:</strong>
                    <div className="small text-muted">
                      {(() => {
                        try {
                          const habits = JSON.parse(clinicalRecord.consumption_habits);
                          return Object.entries(habits).map(([key, value]) => 
                            `${key}: ${value}`
                          ).join(', ');
                        } catch {
                          return clinicalRecord.consumption_habits;
                        }
                      })()}
                    </div>
                  </div>
                )}

                {!isReadOnly && (
                  <button
                    type="button"
                    className="btn btn-outline-primary btn-sm w-100"
                    onClick={loadFromClinicalRecord}
                    disabled={isLoading}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-download me-1">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                      <polyline points="7 10 12 15 17 10"></polyline>
                      <line x1="12" x2="12" y1="15" y2="3"></line>
                    </svg>
                    Importar Restricciones
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Consejos de seguridad */}
          <div className="card">
            <div className="card-header">
              <h6 className="mb-0">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-heart-pulse me-2">
                  <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.29 1.51 4.04 3 5.5l7 7Z"></path>
                  <path d="M3.22 12H9.5l.5-1 2 4.5 2-7 1.5 3.5h5.27"></path>
                </svg>
                Consejos de Seguridad
              </h6>
            </div>
            <div className="card-body">
              <div className="small">
                <ul className="list-unstyled mb-0">
                  <li className="mb-2">
                    🚨 <strong>Alergias severas:</strong> Siempre lleva medicación de emergencia.
                  </li>
                  <li className="mb-2">
                    📖 <strong>Etiquetas:</strong> Lee siempre los ingredientes de productos procesados.
                  </li>
                  <li className="mb-2">
                    🍽️ <strong>Restaurantes:</strong> Informa sobre tus restricciones al ordenar.
                  </li>
                  <li className="mb-2">
                    👨‍⚕️ <strong>Médico:</strong> Consulta cambios en medicamentos con tu doctor.
                  </li>
                  <li>
                    📞 <strong>Emergencia:</strong> Ten contactos de emergencia siempre disponibles.
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal para agregar/editar restricciones */}
      {showAddModal && (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  {editingItem?.id ? 'Editar' : 'Agregar'} {sections.find(s => s.key === activeSection)?.label}
                </h5>
                <button 
                  type="button" 
                  className="btn-close" 
                  onClick={() => {
                    setShowAddModal(false);
                    setEditingItem(null);
                  }}
                ></button>
              </div>
              <div className="modal-body">
                <div className="alert alert-info">
                  <small>
                    Editor simplificado. La funcionalidad completa estará disponible en la próxima iteración.
                  </small>
                </div>
                
                {activeSection === 'allergies' && editingItem && (
                  <div>
                    <div className="mb-3">
                      <label className="form-label">Nombre de la alergia</label>
                      <input
                        type="text"
                        className="form-control"
                        value={editingItem.name || ''}
                        onChange={(e) => setEditingItem({...editingItem, name: e.target.value})}
                        placeholder="Ej: Cacahuates, Mariscos, Lácteos"
                      />
                    </div>
                    
                    <div className="mb-3">
                      <label className="form-label">Severidad</label>
                      <select
                        className="form-select"
                        value={editingItem.severity || 'mild'}
                        onChange={(e) => setEditingItem({...editingItem, severity: e.target.value})}
                      >
                        <option value="mild">Leve</option>
                        <option value="moderate">Moderada</option>
                        <option value="severe">Severa</option>
                      </select>
                    </div>
                    
                    <div className="mb-3">
                      <label className="form-label">Notas</label>
                      <textarea
                        className="form-control"
                        rows={2}
                        value={editingItem.notes || ''}
                        onChange={(e) => setEditingItem({...editingItem, notes: e.target.value})}
                        placeholder="Síntomas, tratamiento, consideraciones especiales..."
                      />
                    </div>
                  </div>
                )}
              </div>
              <div className="modal-footer">
                <button 
                  type="button" 
                  className="btn btn-secondary"
                  onClick={() => {
                    setShowAddModal(false);
                    setEditingItem(null);
                  }}
                >
                  Cancelar
                </button>
                <button 
                  type="button" 
                  className="btn btn-primary"
                  onClick={() => saveRestriction(editingItem, activeSection)}
                  disabled={!editingItem?.name?.trim()}
                >
                  Guardar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NutritionalRestrictionsTab; 