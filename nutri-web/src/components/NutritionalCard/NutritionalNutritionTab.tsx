import React, { useState, useEffect } from 'react';
import { Patient } from '../../types/patient';
import { ClinicalRecord } from '../../types/clinical-record';

interface MacroTarget {
  protein: number;
  carbohydrates: number;
  fats: number;
}

interface NutritionalGoals {
  dailyCalories: number;
  macroTargets: MacroTarget;
  micronutrients: {
    fiber: number;
    sodium: number;
    sugar: number;
    calcium: number;
    iron: number;
    vitaminC: number;
    vitaminD: number;
  };
  hydration: {
    waterGlasses: number;
    otherFluids: string[];
  };
  supplements: {
    name: string;
    dosage: string;
    frequency: string;
    notes?: string;
  }[];
}

interface NutritionalNutritionTabProps {
  planData: any;
  patient: Patient;
  clinicalRecord?: ClinicalRecord;
  mode: 'create' | 'edit' | 'view';
  onUpdateData: (section: string, data: any) => void;
  isLoading?: boolean;
}

const NutritionalNutritionTab: React.FC<NutritionalNutritionTabProps> = ({
  planData,
  patient,
  clinicalRecord,
  mode,
  onUpdateData,
  isLoading = false
}) => {
  const [nutritionalGoals, setNutritionalGoals] = useState<NutritionalGoals>({
    dailyCalories: planData.dailyCaloriesTarget || 2000,
    macroTargets: planData.dailyMacrosTarget || {
      protein: 150,
      carbohydrates: 200,
      fats: 67
    },
    micronutrients: {
      fiber: 25,
      sodium: 2300,
      sugar: 50,
      calcium: 1000,
      iron: 18,
      vitaminC: 90,
      vitaminD: 20
    },
    hydration: {
      waterGlasses: 8,
      otherFluids: ['Té verde', 'Agua de limón']
    },
    supplements: []
  });

  const [macroDistribution, setMacroDistribution] = useState({
    protein: 30, // porcentaje
    carbohydrates: 45,
    fats: 25
  });

  // Cargar datos existentes
  useEffect(() => {
    if (planData.nutritionalGoals) {
      setNutritionalGoals(planData.nutritionalGoals);
    }
  }, [planData.nutritionalGoals]);

  // Calcular macronutrientes basados en calorías y distribución
  const calculateMacros = (calories: number, distribution: typeof macroDistribution) => {
    return {
      protein: Math.round((calories * distribution.protein / 100) / 4), // 4 kcal/g
      carbohydrates: Math.round((calories * distribution.carbohydrates / 100) / 4), // 4 kcal/g
      fats: Math.round((calories * distribution.fats / 100) / 9) // 9 kcal/g
    };
  };

  // Actualizar macronutrientes cuando cambie la distribución o calorías
  const updateMacroTargets = (newCalories?: number, newDistribution?: typeof macroDistribution) => {
    const calories = newCalories || nutritionalGoals.dailyCalories;
    const distribution = newDistribution || macroDistribution;
    
    const newMacros = calculateMacros(calories, distribution);
    
    const updatedGoals = {
      ...nutritionalGoals,
      dailyCalories: calories,
      macroTargets: newMacros
    };
    
    setNutritionalGoals(updatedGoals);
    onUpdateData('nutritionalGoals', updatedGoals);
  };

  // Aplicar recomendaciones basadas en el expediente clínico
  const applyMedicalRecommendations = () => {
    if (!clinicalRecord) return;

    let adjustedGoals = { ...nutritionalGoals };
    let adjustedDistribution = { ...macroDistribution };

    // Ajustes basados en condiciones médicas
    const diagnosis = clinicalRecord.nutritional_diagnosis?.toLowerCase() || '';
    const diseases = clinicalRecord.diagnosed_diseases?.toLowerCase() || '';

    // Diabetes - reducir carbohidratos, aumentar fibra
    if (diseases.includes('diabetes')) {
      adjustedDistribution = { protein: 25, carbohydrates: 40, fats: 35 };
      adjustedGoals.micronutrients.fiber = 35;
      adjustedGoals.micronutrients.sugar = 25;
    }

    // Hipertensión - reducir sodio
    if (diseases.includes('hipertensión') || diseases.includes('hipertension')) {
      adjustedGoals.micronutrients.sodium = 1500;
    }

    // Enfermedad renal - ajustar proteínas y sodio
    if (diseases.includes('renal') || diseases.includes('riñón')) {
      adjustedDistribution = { protein: 15, carbohydrates: 55, fats: 30 };
      adjustedGoals.micronutrients.sodium = 1200;
    }

    // Sobrepeso/obesidad - aumentar proteínas, reducir carbohidratos
    if (diagnosis.includes('sobrepeso') || diagnosis.includes('obesidad')) {
      adjustedDistribution = { protein: 35, carbohydrates: 35, fats: 30 };
      adjustedGoals.micronutrients.fiber = 30;
    }

    // Bajo peso - aumentar calorías y grasas saludables
    if (diagnosis.includes('bajo peso')) {
      adjustedGoals.dailyCalories = Math.round(adjustedGoals.dailyCalories * 1.2);
      adjustedDistribution = { protein: 25, carbohydrates: 45, fats: 30 };
    }

    // Aplicar cambios
    setMacroDistribution(adjustedDistribution);
    updateMacroTargets(adjustedGoals.dailyCalories, adjustedDistribution);
  };

  // Preset de distribuciones comunes
  const macroPresets = [
    { name: 'Equilibrada', protein: 30, carbohydrates: 45, fats: 25 },
    { name: 'Pérdida de Peso', protein: 35, carbohydrates: 35, fats: 30 },
    { name: 'Ganancia Muscular', protein: 40, carbohydrates: 35, fats: 25 },
    { name: 'Cetogénica', protein: 25, carbohydrates: 5, fats: 70 },
    { name: 'Mediterránea', protein: 20, carbohydrates: 50, fats: 30 },
    { name: 'Para Diabetes', protein: 25, carbohydrates: 40, fats: 35 }
  ];

  const isReadOnly = mode === 'view';

  return (
    <div className="nutritional-nutrition-tab">
      <div className="row">
        {/* Panel principal - Objetivos nutricionales */}
        <div className="col-md-8">
          {/* Calorías y Macronutrientes */}
          <div className="card mb-4">
            <div className="card-header">
              <h6 className="mb-0">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-target me-2">
                  <circle cx="12" cy="12" r="10"></circle>
                  <circle cx="12" cy="12" r="6"></circle>
                  <circle cx="12" cy="12" r="2"></circle>
                </svg>
                Objetivos Calóricos y Macronutrientes
              </h6>
            </div>
            <div className="card-body">
              {/* Calorías objetivo */}
              <div className="row mb-4">
                <div className="col-md-6">
                  <label className="form-label">Calorías Diarias Objetivo</label>
                  <div className="input-group">
                    <input
                      type="number"
                      className="form-control"
                      value={nutritionalGoals.dailyCalories}
                      onChange={(e) => updateMacroTargets(parseInt(e.target.value) || 0)}
                      min="1000"
                      max="5000"
                      step="50"
                      disabled={isReadOnly || isLoading}
                    />
                    <span className="input-group-text">kcal</span>
                  </div>
                </div>
                <div className="col-md-6">
                  <label className="form-label">Presets de Distribución</label>
                  <select
                    className="form-select"
                    onChange={(e) => {
                      const preset = macroPresets.find(p => p.name === e.target.value);
                      if (preset) {
                        const newDistribution = {
                          protein: preset.protein,
                          carbohydrates: preset.carbohydrates,
                          fats: preset.fats
                        };
                        setMacroDistribution(newDistribution);
                        updateMacroTargets(undefined, newDistribution);
                      }
                    }}
                    disabled={isReadOnly || isLoading}
                    defaultValue=""
                  >
                    <option value="">Seleccionar preset...</option>
                    {macroPresets.map(preset => (
                      <option key={preset.name} value={preset.name}>
                        {preset.name} ({preset.protein}% P | {preset.carbohydrates}% C | {preset.fats}% G)
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Distribución de macronutrientes */}
              <h6 className="mb-3">Distribución de Macronutrientes</h6>
              <div className="row">
                <div className="col-md-4">
                  <label className="form-label text-danger">
                    <strong>Proteínas</strong>
                  </label>
                  <div className="input-group mb-2">
                    <input
                      type="range"
                      className="form-range"
                      min="10"
                      max="50"
                      value={macroDistribution.protein}
                      onChange={(e) => {
                        const protein = parseInt(e.target.value);
                        const remaining = 100 - protein;
                        const newDist = {
                          protein,
                          carbohydrates: Math.round(remaining * 0.6),
                          fats: Math.round(remaining * 0.4)
                        };
                        setMacroDistribution(newDist);
                        updateMacroTargets(undefined, newDist);
                      }}
                      disabled={isReadOnly || isLoading}
                    />
                  </div>
                  <div className="text-center">
                    <span className="badge bg-danger fs-6">{macroDistribution.protein}%</span>
                    <div className="small text-muted">{nutritionalGoals.macroTargets.protein}g/día</div>
                  </div>
                </div>

                <div className="col-md-4">
                  <label className="form-label text-warning">
                    <strong>Carbohidratos</strong>
                  </label>
                  <div className="input-group mb-2">
                    <input
                      type="range"
                      className="form-range"
                      min="5"
                      max="70"
                      value={macroDistribution.carbohydrates}
                      onChange={(e) => {
                        const carbs = parseInt(e.target.value);
                        const remaining = 100 - carbs;
                        const newDist = {
                          protein: Math.round(remaining * 0.5),
                          carbohydrates: carbs,
                          fats: Math.round(remaining * 0.5)
                        };
                        setMacroDistribution(newDist);
                        updateMacroTargets(undefined, newDist);
                      }}
                      disabled={isReadOnly || isLoading}
                    />
                  </div>
                  <div className="text-center">
                    <span className="badge bg-warning fs-6">{macroDistribution.carbohydrates}%</span>
                    <div className="small text-muted">{nutritionalGoals.macroTargets.carbohydrates}g/día</div>
                  </div>
                </div>

                <div className="col-md-4">
                  <label className="form-label text-success">
                    <strong>Grasas</strong>
                  </label>
                  <div className="input-group mb-2">
                    <input
                      type="range"
                      className="form-range"
                      min="15"
                      max="80"
                      value={macroDistribution.fats}
                      onChange={(e) => {
                        const fats = parseInt(e.target.value);
                        const remaining = 100 - fats;
                        const newDist = {
                          protein: Math.round(remaining * 0.6),
                          carbohydrates: Math.round(remaining * 0.4),
                          fats
                        };
                        setMacroDistribution(newDist);
                        updateMacroTargets(undefined, newDist);
                      }}
                      disabled={isReadOnly || isLoading}
                    />
                  </div>
                  <div className="text-center">
                    <span className="badge bg-success fs-6">{macroDistribution.fats}%</span>
                    <div className="small text-muted">{nutritionalGoals.macroTargets.fats}g/día</div>
                  </div>
                </div>
              </div>

              {/* Gráfico de distribución visual */}
              <div className="mt-3">
                <div className="progress" style={{ height: '30px' }}>
                  <div 
                    className="progress-bar bg-danger" 
                    style={{ width: `${macroDistribution.protein}%` }}
                    title={`Proteínas: ${macroDistribution.protein}%`}
                  >
                    {macroDistribution.protein}%
                  </div>
                  <div 
                    className="progress-bar bg-warning" 
                    style={{ width: `${macroDistribution.carbohydrates}%` }}
                    title={`Carbohidratos: ${macroDistribution.carbohydrates}%`}
                  >
                    {macroDistribution.carbohydrates}%
                  </div>
                  <div 
                    className="progress-bar bg-success" 
                    style={{ width: `${macroDistribution.fats}%` }}
                    title={`Grasas: ${macroDistribution.fats}%`}
                  >
                    {macroDistribution.fats}%
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Micronutrientes */}
          <div className="card mb-4">
            <div className="card-header">
              <h6 className="mb-0">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-flask me-2">
                  <path d="M9 2v6l-3 7h12l-3-7V2"></path>
                  <path d="M6 2h12"></path>
                </svg>
                Objetivos de Micronutrientes
              </h6>
            </div>
            <div className="card-body">
              <div className="row">
                <div className="col-md-6 mb-3">
                  <label className="form-label">Fibra (g/día)</label>
                  <input
                    type="number"
                    className="form-control"
                    value={nutritionalGoals.micronutrients.fiber}
                    onChange={(e) => {
                      const updated = {
                        ...nutritionalGoals,
                        micronutrients: {
                          ...nutritionalGoals.micronutrients,
                          fiber: parseInt(e.target.value) || 0
                        }
                      };
                      setNutritionalGoals(updated);
                      onUpdateData('nutritionalGoals', updated);
                    }}
                    min="10"
                    max="50"
                    disabled={isReadOnly || isLoading}
                  />
                </div>

                <div className="col-md-6 mb-3">
                  <label className="form-label">Sodio (mg/día)</label>
                  <input
                    type="number"
                    className="form-control"
                    value={nutritionalGoals.micronutrients.sodium}
                    onChange={(e) => {
                      const updated = {
                        ...nutritionalGoals,
                        micronutrients: {
                          ...nutritionalGoals.micronutrients,
                          sodium: parseInt(e.target.value) || 0
                        }
                      };
                      setNutritionalGoals(updated);
                      onUpdateData('nutritionalGoals', updated);
                    }}
                    min="500"
                    max="3000"
                    disabled={isReadOnly || isLoading}
                  />
                </div>

                <div className="col-md-6 mb-3">
                  <label className="form-label">Azúcar añadido (g/día)</label>
                  <input
                    type="number"
                    className="form-control"
                    value={nutritionalGoals.micronutrients.sugar}
                    onChange={(e) => {
                      const updated = {
                        ...nutritionalGoals,
                        micronutrients: {
                          ...nutritionalGoals.micronutrients,
                          sugar: parseInt(e.target.value) || 0
                        }
                      };
                      setNutritionalGoals(updated);
                      onUpdateData('nutritionalGoals', updated);
                    }}
                    min="0"
                    max="100"
                    disabled={isReadOnly || isLoading}
                  />
                </div>

                <div className="col-md-6 mb-3">
                  <label className="form-label">Calcio (mg/día)</label>
                  <input
                    type="number"
                    className="form-control"
                    value={nutritionalGoals.micronutrients.calcium}
                    onChange={(e) => {
                      const updated = {
                        ...nutritionalGoals,
                        micronutrients: {
                          ...nutritionalGoals.micronutrients,
                          calcium: parseInt(e.target.value) || 0
                        }
                      };
                      setNutritionalGoals(updated);
                      onUpdateData('nutritionalGoals', updated);
                    }}
                    min="500"
                    max="2000"
                    disabled={isReadOnly || isLoading}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Hidratación */}
          <div className="card">
            <div className="card-header">
              <h6 className="mb-0">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-droplets me-2">
                  <path d="M7 16.3c2.2 0 4-1.83 4-4.05 0-1.16-.57-2.26-1.71-3.19S7.29 6.75 7 5.3c-.29 1.45-1.14 2.84-2.29 3.76S3 11.1 3 12.25c0 2.22 1.8 4.05 4 4.05z"></path>
                  <path d="M12.56 6.6A10.97 10.97 0 0 0 14 3.02c.5 2.5 2.04 4.64 4.24 6.09 1.12.73 1.76 1.97 1.76 3.28 0 2.22-1.78 4.02-4 4.02-2.2 0-4-1.8-4-4.02 0-1.25.61-2.4 1.56-3.12z"></path>
                </svg>
                Objetivos de Hidratación
              </h6>
            </div>
            <div className="card-body">
              <div className="row">
                <div className="col-md-6">
                  <label className="form-label">Vasos de agua al día</label>
                  <div className="input-group">
                    <input
                      type="number"
                      className="form-control"
                      value={nutritionalGoals.hydration.waterGlasses}
                      onChange={(e) => {
                        const updated = {
                          ...nutritionalGoals,
                          hydration: {
                            ...nutritionalGoals.hydration,
                            waterGlasses: parseInt(e.target.value) || 0
                          }
                        };
                        setNutritionalGoals(updated);
                        onUpdateData('nutritionalGoals', updated);
                      }}
                      min="4"
                      max="15"
                      disabled={isReadOnly || isLoading}
                    />
                    <span className="input-group-text">vasos</span>
                  </div>
                  <small className="text-muted">1 vaso = 250ml aprox.</small>
                </div>
                <div className="col-md-6">
                  <label className="form-label">Equivalente en litros</label>
                  <div className="form-control-plaintext">
                    <strong>{(nutritionalGoals.hydration.waterGlasses * 0.25).toFixed(1)} litros</strong>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Panel lateral */}
        <div className="col-md-4">
          {/* Aplicar recomendaciones médicas */}
          {clinicalRecord && !isReadOnly && (
            <div className="card mb-3">
              <div className="card-header">
                <h6 className="mb-0">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-stethoscope me-2">
                    <path d="M4.8 2.3A.3.3 0 1 0 5 2H4a2 2 0 0 0-2 2v5a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6V4a2 2 0 0 0-2-2h-1a.2.2 0 1 0 .3.3"></path>
                    <path d="M8 15v1a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6v-4"></path>
                    <circle cx="20" cy="10" r="2"></circle>
                  </svg>
                  Recomendaciones Médicas
                </h6>
              </div>
              <div className="card-body">
                <p className="small text-muted mb-3">
                  Aplicar ajustes nutricionales basados en el expediente clínico del paciente.
                </p>
                
                {clinicalRecord.diagnosed_diseases && (
                  <div className="mb-2">
                    <strong className="small">Condiciones:</strong>
                    <div className="small text-muted">{clinicalRecord.diagnosed_diseases}</div>
                  </div>
                )}

                {clinicalRecord.nutritional_diagnosis && (
                  <div className="mb-3">
                    <strong className="small">Diagnóstico:</strong>
                    <div className="small text-muted">{clinicalRecord.nutritional_diagnosis}</div>
                  </div>
                )}

                <button
                  type="button"
                  className="btn btn-outline-primary btn-sm w-100"
                  onClick={applyMedicalRecommendations}
                  disabled={isLoading}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-wand-2 me-1">
                    <path d="m21.64 3.64-8.9 8.9"></path>
                    <path d="m21.64 3.64-8.9 8.9"></path>
                    <path d="M9 11h4"></path>
                    <path d="M9 15h1"></path>
                  </svg>
                  Aplicar Recomendaciones
                </button>
              </div>
            </div>
          )}

          {/* Resumen nutricional */}
          <div className="card mb-3">
            <div className="card-header">
              <h6 className="mb-0">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-bar-chart me-2">
                  <line x1="4" x2="4" y1="21" y2="14"></line>
                  <line x1="8" x2="8" y1="21" y2="10"></line>
                  <line x1="12" x2="12" y1="21" y2="12"></line>
                  <line x1="16" x2="16" y1="21" y2="6"></line>
                  <line x1="20" x2="20" y1="21" y2="10"></line>
                </svg>
                Resumen Nutricional
              </h6>
            </div>
            <div className="card-body">
              <div className="text-center mb-3">
                <h4 className="text-primary mb-0">{nutritionalGoals.dailyCalories.toLocaleString()}</h4>
                <small className="text-muted">kcal/día</small>
              </div>

              <div className="small">
                <div className="d-flex justify-content-between mb-2">
                  <span className="d-flex align-items-center">
                    <span className="badge bg-danger me-2" style={{ width: '10px', height: '10px' }}></span>
                    Proteínas
                  </span>
                  <span><strong>{nutritionalGoals.macroTargets.protein}g</strong></span>
                </div>
                <div className="d-flex justify-content-between mb-2">
                  <span className="d-flex align-items-center">
                    <span className="badge bg-warning me-2" style={{ width: '10px', height: '10px' }}></span>
                    Carbohidratos
                  </span>
                  <span><strong>{nutritionalGoals.macroTargets.carbohydrates}g</strong></span>
                </div>
                <div className="d-flex justify-content-between mb-3">
                  <span className="d-flex align-items-center">
                    <span className="badge bg-success me-2" style={{ width: '10px', height: '10px' }}></span>
                    Grasas
                  </span>
                  <span><strong>{nutritionalGoals.macroTargets.fats}g</strong></span>
                </div>

                <hr />

                <div className="d-flex justify-content-between mb-1">
                  <span>Fibra:</span>
                  <span>{nutritionalGoals.micronutrients.fiber}g</span>
                </div>
                <div className="d-flex justify-content-between mb-1">
                  <span>Sodio:</span>
                  <span>{nutritionalGoals.micronutrients.sodium}mg</span>
                </div>
                <div className="d-flex justify-content-between mb-1">
                  <span>Agua:</span>
                  <span>{nutritionalGoals.hydration.waterGlasses} vasos</span>
                </div>
              </div>
            </div>
          </div>

          {/* Consejos nutricionales */}
          <div className="card">
            <div className="card-header">
              <h6 className="mb-0">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-lightbulb me-2">
                  <path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 12 2c-3.3 0-6 2.7-6 6 0 1.3.5 2.6 1.5 3.5.8.8 1.3 1.5 1.5 2.5"></path>
                  <path d="M9 18h6"></path>
                  <path d="M10 22h4"></path>
                </svg>
                Consejos Nutricionales
              </h6>
            </div>
            <div className="card-body">
              <div className="small">
                <ul className="list-unstyled mb-0">
                  <li className="mb-2">
                    💪 <strong>Proteínas:</strong> Incluye una fuente de proteína en cada comida.
                  </li>
                  <li className="mb-2">
                    🥗 <strong>Fibra:</strong> Consume al menos 5 porciones de frutas y verduras al día.
                  </li>
                  <li className="mb-2">
                    💧 <strong>Hidratación:</strong> Bebe agua antes, durante y después de las comidas.
                  </li>
                  <li className="mb-2">
                    🕐 <strong>Timing:</strong> Distribuye las comidas cada 3-4 horas.
                  </li>
                  <li>
                    ⚖️ <strong>Balance:</strong> Varía los alimentos para obtener todos los nutrientes.
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NutritionalNutritionTab; 