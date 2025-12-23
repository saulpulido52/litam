import { useState, useEffect } from 'react';
import { 
  Calendar, 
  Clock, 
  Plus, 
  Sparkles,
  Copy,
  Save,
  X,
  AlertCircle,
  CheckCircle,
  Users,
  Target} from 'lucide-react';
import type { CreateDietPlanDto, GenerateAIDietDto, DietPlan } from '../types/diet';
import type { Patient } from '../types/patient';
import type { ClinicalRecord } from '../types/clinical-record';

interface DietPlanQuickCreateProps {
  patients: Patient[];
  onSubmit: (data: CreateDietPlanDto) => void;
  onCancel: () => void;
  onGenerateAI?: (data: GenerateAIDietDto) => void;
  onDuplicate?: (planId: string, data: CreateDietPlanDto) => void;
  loading?: boolean;
  initialData?: CreateDietPlanDto;
  duplicateFromPlan?: DietPlan;
  mode?: 'create' | 'duplicate' | 'quick' | 'edit';
  clinicalRecords?: ClinicalRecord[];
  editingPlan?: DietPlan;
}

export default function DietPlanQuickCreate({
  patients,
  onSubmit,
  onCancel,
  onGenerateAI,
  onDuplicate,
  loading = false,
  initialData,
  duplicateFromPlan,
  mode = 'create',
  clinicalRecords = [],
  editingPlan
}: DietPlanQuickCreateProps) {
  const [formData, setFormData] = useState<CreateDietPlanDto>({
    patientId: editingPlan?.patient_id || '',
    name: editingPlan?.name || '',
    description: editingPlan?.description || '',
    startDate: editingPlan?.start_date || '',
    endDate: editingPlan?.end_date || '',
    dailyCaloriesTarget: editingPlan?.target_calories || 2000,
    dailyMacrosTarget: {
      protein: editingPlan?.target_protein || 150,
      carbohydrates: editingPlan?.target_carbs || 200,
      fats: editingPlan?.target_fats || 67
    },
    notes: editingPlan?.notes || '',
    planType: 'weekly',
    planPeriod: 'weeks',
    totalPeriods: editingPlan?.total_weeks || 1,
    isWeeklyPlan: editingPlan?.is_weekly_plan !== false,
    totalWeeks: editingPlan?.total_weeks || 1,
    ...initialData
  });

  const [errors, setErrors] = useState<string[]>([]);
  const [selectedPatientRecord, setSelectedPatientRecord] = useState<ClinicalRecord | null>(null);
  const [showClinicalInfo, setShowClinicalInfo] = useState(false);


  // Si estamos duplicando, prellenar con datos del plan original
  useEffect(() => {
    if (mode === 'duplicate' && duplicateFromPlan) {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const nextWeek = new Date();
      nextWeek.setDate(nextWeek.getDate() + 7);

      setFormData({
        patientId: duplicateFromPlan.patient_id || '',
        name: `${duplicateFromPlan.name} - Copia`,
        description: duplicateFromPlan.description || '',
        startDate: tomorrow.toISOString().split('T')[0],
        endDate: nextWeek.toISOString().split('T')[0],
        dailyCaloriesTarget: duplicateFromPlan.target_calories || 2000,
        dailyMacrosTarget: {
          protein: duplicateFromPlan.target_protein || 150,
          carbohydrates: duplicateFromPlan.target_carbs || 200,
          fats: duplicateFromPlan.target_fats || 67
        },
        notes: `Basado en: ${duplicateFromPlan.name}`,
        planType: duplicateFromPlan.plan_type || 'weekly',
        planPeriod: 'weeks',
        totalPeriods: duplicateFromPlan.total_weeks || 1,
        isWeeklyPlan: duplicateFromPlan.is_weekly_plan !== false,
        totalWeeks: duplicateFromPlan.total_weeks || 1
      });
    }
  }, [mode, duplicateFromPlan]);

  // Aplicar recomendaciones basadas en el expediente clínico
  const applyRecommendationsFromClinicalRecord = (record: ClinicalRecord) => {
    if (!record) return;

    console.log('🟢 Aplicando recomendaciones del expediente:', record);

    // Extraer datos antropométricos
    const anthropometrics = record.anthropometric_measurements;
    const weight = anthropometrics?.current_weight_kg;
    const heightM = anthropometrics?.height_m;
    const height = heightM ? heightM * 100 : undefined; // Convertir metros a centímetros
    const bmi = weight && heightM ? weight / (heightM * heightM) : undefined;

    // Extraer datos bioquímicos y clínicos
    const bloodPressure = record.blood_pressure;
    const biochemical = record.biochemical_indicators;
    const diagnosis = record.nutritional_diagnosis;
    const currentProblems = record.current_problems;
    const activityLevel = record.physical_exercise?.frequency || record.activity_level_description;
    
    // Calcular calorías personalizadas
    let recommendedCalories = 2000; // Base default
    let activityMultiplier = 1.4; // Sedentario por defecto

    // Ajustar multiplicador según actividad física
    if (activityLevel) {
      const activityText = activityLevel.toLowerCase();
      if (activityText.includes('muy activ') || activityText.includes('intenso') || activityText.includes('diario')) {
        activityMultiplier = 1.7;
      } else if (activityText.includes('moderad') || activityText.includes('3-4') || activityText.includes('regular')) {
        activityMultiplier = 1.55;
      } else if (activityText.includes('ligero') || activityText.includes('1-2') || activityText.includes('poco')) {
        activityMultiplier = 1.375;
      }
    }

    if (weight) {
      // Usar ecuación más precisa basada en peso, altura y actividad
      if (height) {
        // Ecuación de Harris-Benedict modificada aproximada
        const basalRate = 655 + (9.6 * weight) + (1.8 * height) - (4.7 * 25); // Asumiendo edad promedio 25
        recommendedCalories = Math.round(basalRate * activityMultiplier);
      } else {
        recommendedCalories = Math.round(weight * 30 * activityMultiplier / 1.4);
      }

      // Ajustar según objetivos nutricionales
      if (diagnosis) {
        const diagnosisText = diagnosis.toLowerCase();
        if (diagnosisText.includes('sobrepeso') || diagnosisText.includes('obesidad') || diagnosisText.includes('reducir peso')) {
          recommendedCalories = Math.round(recommendedCalories * 0.85); // Déficit del 15%
        } else if (diagnosisText.includes('bajo peso') || diagnosisText.includes('aumentar peso') || diagnosisText.includes('ganancia')) {
          recommendedCalories = Math.round(recommendedCalories * 1.15); // Superávit del 15%
        }
      }
    }

    // Calcular macronutrientes personalizados
    let proteinPerKg = 1.2; // Base
    if (activityLevel?.toLowerCase().includes('ejercicio') || activityLevel?.toLowerCase().includes('entrenamiento')) {
      proteinPerKg = 1.6; // Más proteína para actividad física
    }
    if (diagnosis?.toLowerCase().includes('diabetes') || biochemical?.glucose_mg_dl) {
      proteinPerKg = 1.0; // Moderada en casos especiales
    }

    const recommendedProtein = weight ? Math.round(weight * proteinPerKg) : 150;
    const recommendedCarbs = Math.round(recommendedCalories * 0.45 / 4);
    const recommendedFats = Math.round(recommendedCalories * 0.30 / 9);

    // Generar descripción detallada basada en el expediente
    let description = 'Plan nutricional personalizado';
    
    if (diagnosis) {
      description += ` para ${diagnosis.toLowerCase()}`;
    }
    
    // Agregar información del IMC si está disponible
    if (bmi) {
      if (bmi < 18.5) description += ' (bajo peso)';
      else if (bmi >= 25 && bmi < 30) description += ' (sobrepeso)';
      else if (bmi >= 30) description += ' (obesidad)';
      else description += ' (peso normal)';
    }

    // Agregar consideraciones especiales
    const specialConsiderations: string[] = [];
    if (bloodPressure?.systolic && bloodPressure.systolic > 140) {
      specialConsiderations.push('hipertensión');
    }
    if (biochemical?.glucose_mg_dl && biochemical.glucose_mg_dl > 126) {
      specialConsiderations.push('diabetes');
    }
    if (biochemical?.cholesterol_total_mg_dl && biochemical.cholesterol_total_mg_dl > 200) {
      specialConsiderations.push('colesterol elevado');
    }
    
    if (specialConsiderations.length > 0) {
      description += ` con manejo de ${specialConsiderations.join(', ')}`;
    }

    // Generar notas detalladas
    const notes: string[] = [];
    
    if (weight && height) {
      notes.push(`Paciente: ${weight}kg, ${height.toFixed(0)}cm, IMC: ${bmi ? bmi.toFixed(1) : 'N/A'}`);
    }
    
    if (activityLevel) {
      notes.push(`Actividad física: ${activityLevel}`);
    }
    
    if (currentProblems?.observations) {
      notes.push(`Observaciones: ${currentProblems.observations}`);
    }
    
    if (record.consumption_habits?.alcohol || record.consumption_habits?.tobacco) {
      const habits: string[] = [];
      if (record.consumption_habits.alcohol) habits.push(`alcohol: ${record.consumption_habits.alcohol}`);
      if (record.consumption_habits.tobacco) habits.push(`tabaco: ${record.consumption_habits.tobacco}`);
      notes.push(`Hábitos: ${habits.join(', ')}`);
    }

    if (record.water_consumption_liters) {
      notes.push(`Consumo de agua: ${record.water_consumption_liters}L/día`);
    }

    // Agregar recomendaciones específicas según diagnóstico
    if (diagnosis) {
      const diagnosisText = diagnosis.toLowerCase();
      if (diagnosisText.includes('diabetes')) {
        notes.push('Control de carbohidratos, índice glucémico bajo');
      } else if (diagnosisText.includes('hipertensión')) {
        notes.push('Reducir sodio, aumentar potasio, DASH diet');
      } else if (diagnosisText.includes('colesterol')) {
        notes.push('Reducir grasas saturadas, aumentar fibra soluble');
      } else if (diagnosisText.includes('sobrepeso') || diagnosisText.includes('obesidad')) {
        notes.push('Déficit calórico controlado, ejercicio gradual');
      }
    }

    // Aplicar recomendaciones al formulario
    setFormData(prev => ({
      ...prev,
      dailyCaloriesTarget: recommendedCalories,
      dailyMacrosTarget: {
        protein: recommendedProtein,
        carbohydrates: recommendedCarbs,
        fats: recommendedFats
      },
      description: description,
      notes: notes.join('. ') + (record.evolution_and_follow_up_notes ? `. Seguimiento: ${record.evolution_and_follow_up_notes}` : '')
    }));

    console.log('🟢 Recomendaciones aplicadas:', {
      calories: recommendedCalories,
      protein: recommendedProtein,
      carbs: recommendedCarbs,
      fats: recommendedFats,
      description,
      notes: notes.join('. ')
    });

    setShowClinicalInfo(true);
  };

  // Cargar expediente clínico cuando se selecciona un paciente
  useEffect(() => {
    if (formData.patientId && clinicalRecords.length > 0) {
      const patientRecords = clinicalRecords.filter(record => 
        record.patient?.id === formData.patientId
      );
      
      if (patientRecords.length > 0) {
        // Obtener el expediente más reciente
        const latestRecord = patientRecords.sort((a, b) => 
          new Date(b.created_at || '').getTime() - new Date(a.created_at || '').getTime()
        )[0];
        
        setSelectedPatientRecord(latestRecord);
        
        // Aplicar recomendaciones del expediente si hay datos relevantes
        if (latestRecord && mode !== 'edit') {
          applyRecommendationsFromClinicalRecord(latestRecord);
        }
      }
    }
  }, [formData.patientId, clinicalRecords, mode]);

  // Limpiar errores cuando el usuario empiece a corregir los campos
  useEffect(() => {
    if (errors.length > 0) {
      // Verificar si los campos requeridos tienen valores
      if (formData.patientId && formData.name && formData.startDate) {
        setErrors([]);
      }
    }
  }, [formData.patientId, formData.name, formData.startDate, errors.length]);

  const getPatientDisplayName = (patient: any) => {
    if (patient.user && patient.user.first_name) {
      return `${patient.user.first_name} ${patient.user.last_name || ''}`;
    } else if (patient.first_name) {
      return `${patient.first_name} ${patient.last_name || ''}`;
    }
    return `Paciente ${patient.id}`;
  };

  const validateForm = (): { isValid: boolean; errors: string[] } => {
    const newErrors: string[] = [];

    // Validaciones básicas
    if (!formData.patientId || formData.patientId.trim() === '') {
      newErrors.push('Debe seleccionar un paciente');
    }
    if (!formData.name || formData.name.trim() === '') {
      newErrors.push('Debe ingresar un nombre para el plan');
    }
    if (!formData.startDate || formData.startDate.trim() === '') {
      newErrors.push('Debe seleccionar una fecha de inicio');
    }
    
    // Validación de calorías
    const calories = formData.dailyCaloriesTarget || 0;
    if (calories < 800 || calories > 5000) {
      newErrors.push('Las calorías deben estar entre 800 y 5000');
    }

    // Validación de fechas
    if (formData.startDate && formData.endDate) {
      const startDate = new Date(formData.startDate);
      const endDate = new Date(formData.endDate);
      if (endDate <= startDate) {
        newErrors.push('La fecha de fin debe ser posterior a la fecha de inicio');
      }
    }

    // Validación de macronutrientes
    const macros = formData.dailyMacrosTarget;
    if (macros) {
      if ((macros.protein || 0) < 50 || (macros.protein || 0) > 300) {
        newErrors.push('Las proteínas deben estar entre 50g y 300g');
      }
      if ((macros.carbohydrates || 0) < 100 || (macros.carbohydrates || 0) > 500) {
        newErrors.push('Los carbohidratos deben estar entre 100g y 500g');
      }
      if ((macros.fats || 0) < 30 || (macros.fats || 0) > 150) {
        newErrors.push('Las grasas deben estar entre 30g y 150g');
      }
    }

    return { isValid: newErrors.length === 0, errors: newErrors };
  };

  const calculateEndDate = (startDate: string, totalWeeks: number) => {
    const start = new Date(startDate);
    const end = new Date(start);
    end.setDate(start.getDate() + (totalWeeks * 7) - 1);
    return end.toISOString().split('T')[0];
  };

  const handleSubmit = () => {
    // Limpiar errores previos
    setErrors([]);
    
    const validation = validateForm();
    if (!validation.isValid) {
      setErrors(validation.errors);
      // Hacer scroll al primer error
      setTimeout(() => {
        const errorElement = document.querySelector('.alert-danger');
        if (errorElement) {
          errorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 100);
      return;
    }

    const finalData = {
      ...formData,
      endDate: formData.endDate || calculateEndDate(formData.startDate, formData.totalWeeks || 1)
    };

    if (mode === 'duplicate' && onDuplicate && duplicateFromPlan) {
      onDuplicate(duplicateFromPlan.id, finalData);
    } else if (mode === 'edit' && editingPlan) {
      // Para edición, usar el mismo callback pero el componente padre manejará la actualización
      onSubmit(finalData);
    } else {
      onSubmit(finalData);
    }
  };

  const handleGenerateAI = () => {
    if (!onGenerateAI) return;
    
    const validation = validateForm();
    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    const aiData: GenerateAIDietDto = {
      patientId: formData.patientId,
      name: formData.name,
      goal: 'maintenance',
      startDate: formData.startDate,
      endDate: formData.endDate || calculateEndDate(formData.startDate, formData.totalWeeks || 1),
      planType: formData.planType,
      planPeriod: formData.planPeriod,
      totalPeriods: formData.totalPeriods,
      dailyCaloriesTarget: formData.dailyCaloriesTarget,
      dietaryRestrictions: [],
      allergies: [],
      preferredFoods: [],
      dislikedFoods: [],
      notesForAI: formData.notes,
      customRequirements: []
    };

    onGenerateAI(aiData);
  };

  const getModeTitle = () => {
    switch (mode) {
      case 'duplicate': return 'Duplicar Plan Nutricional';
      case 'quick': return 'Plan Rápido';
      case 'edit': return 'Editar Plan Nutricional';
      default: return 'Crear Plan Nutricional';
    }
  };

  const getModeIcon = () => {
    switch (mode) {
      case 'duplicate': return <Copy size={20} />;
      case 'quick': return <Plus size={20} />;
      case 'edit': return <Calendar size={20} />;
      default: return <Calendar size={20} />;
    }
  };

  return (
    <div className="card">
      <div className="card-header bg-primary text-white">
        <div className="d-flex align-items-center justify-content-between">
          <h5 className="mb-0 d-flex align-items-center">
            {getModeIcon()}
            <span className="ms-2">{getModeTitle()}</span>
          </h5>
          <button
            type="button"
            className="btn-close btn-close-white"
            onClick={onCancel}
            aria-label="Cerrar"
          />
        </div>
      </div>

      <div className="card-body">
        {/* Mostrar errores */}
        {errors.length > 0 && (
          <div className="alert alert-danger">
            <AlertCircle size={16} className="me-2" />
            <strong>Errores de validación:</strong>
            <ul className="mb-0 mt-2">
              {errors.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </div>
        )}

                 {/* Información del plan original si estamos duplicando */}
         {mode === 'duplicate' && duplicateFromPlan && (
           <div className="alert alert-info">
             <Copy size={16} className="me-2" />
             <strong>Duplicando plan:</strong> {duplicateFromPlan.name}
             <br />
             <small>Los datos se han copiado automáticamente. Ajusta las fechas y detalles según necesites.</small>
           </div>
         )}

         {/* Información del expediente clínico */}
         {selectedPatientRecord && showClinicalInfo && (
           <div className="alert alert-success">
             <CheckCircle size={16} className="me-2" />
             <strong>Datos aplicados del expediente clínico:</strong>
             <br />
             <small>
               Se han aplicado recomendaciones basadas en el expediente más reciente del paciente.
               {selectedPatientRecord.anthropometric_measurements?.current_weight_kg && (
                 ` Peso actual: ${selectedPatientRecord.anthropometric_measurements.current_weight_kg} kg.`
               )}
               {selectedPatientRecord.nutritional_diagnosis && (
                 ` Diagnóstico: ${selectedPatientRecord.nutritional_diagnosis}.`
               )}
             </small>
             <button
               type="button"
               className="btn btn-sm btn-outline-success ms-2"
               onClick={() => setShowClinicalInfo(false)}
             >
               Ocultar
             </button>
           </div>
         )}

        <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
          <div className="row">
            {/* Información básica */}
            <div className="col-md-6 mb-3">
              <label className="form-label fw-semibold">
                <Users size={16} className="me-1" />
                Paciente *
              </label>
              <select 
                className="form-select"
                value={formData.patientId}
                onChange={(e) => setFormData({...formData, patientId: e.target.value})}
                required
              >
                <option value="">Seleccionar paciente</option>
                {patients.map((patient) => (
                  <option key={patient.id} value={patient.id}>
                    {getPatientDisplayName(patient)}
                  </option>
                ))}
              </select>
            </div>

            <div className="col-md-6 mb-3">
              <label className="form-label fw-semibold">Nombre del Plan *</label>
              <input 
                type="text" 
                className="form-control" 
                placeholder="Ej: Plan de Equilibrio y Energía"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                required
              />
            </div>
          </div>

          <div className="row">
            {/* Fechas */}
            <div className="col-md-4 mb-3">
              <label className="form-label fw-semibold">
                <Calendar size={16} className="me-1" />
                Fecha de Inicio *
              </label>
              <input 
                type="date" 
                className="form-control"
                value={formData.startDate}
                onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                required
              />
            </div>

            <div className="col-md-4 mb-3">
              <label className="form-label fw-semibold">
                <Clock size={16} className="me-1" />
                Duración (semanas)
              </label>
              <select
                className="form-select"
                value={formData.totalWeeks}
                onChange={(e) => setFormData({
                  ...formData, 
                  totalWeeks: parseInt(e.target.value),
                  totalPeriods: parseInt(e.target.value)
                })}
              >
                <option value={1}>1 semana</option>
                <option value={2}>2 semanas</option>
                <option value={3}>3 semanas</option>
                <option value={4}>4 semanas (1 mes)</option>
                <option value={8}>8 semanas (2 meses)</option>
                <option value={12}>12 semanas (3 meses)</option>
              </select>
            </div>

            <div className="col-md-4 mb-3">
              <label className="form-label fw-semibold">
                <Target size={16} className="me-1" />
                Calorías Diarias
              </label>
              <input 
                type="number" 
                className="form-control"
                placeholder="2000"
                min="800"
                max="5000"
                value={formData.dailyCaloriesTarget}
                onChange={(e) => setFormData({...formData, dailyCaloriesTarget: parseInt(e.target.value) || 2000})}
              />
            </div>
          </div>

          {/* Macronutrientes */}
          <div className="row">
            <div className="col-md-4 mb-3">
              <label className="form-label">Proteínas (g)</label>
              <input 
                type="number" 
                className="form-control"
                placeholder="150"
                value={formData.dailyMacrosTarget?.protein}
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
                value={formData.dailyMacrosTarget?.carbohydrates}
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
                value={formData.dailyMacrosTarget?.fats}
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

          {/* Descripción y notas */}
          <div className="mb-3">
            <label className="form-label">Descripción</label>
            <textarea 
              className="form-control" 
              rows={2} 
              placeholder="Describe el objetivo del plan..."
              value={formData.description || ''}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
            />
          </div>

          <div className="mb-4">
            <label className="form-label">Notas Adicionales</label>
            <textarea 
              className="form-control" 
              rows={2} 
              placeholder="Instrucciones especiales, restricciones, etc..."
              value={formData.notes || ''}
              onChange={(e) => setFormData({...formData, notes: e.target.value})}
            />
          </div>

          {/* Fecha calculada automáticamente */}
          {formData.startDate && formData.totalWeeks && (
            <div className="alert alert-success">
              <CheckCircle size={16} className="me-2" />
              <strong>Fecha de finalización:</strong> {calculateEndDate(formData.startDate, formData.totalWeeks)}
              {' '}({formData.totalWeeks} semana{formData.totalWeeks > 1 ? 's' : ''})
            </div>
          )}

          {/* Botones de acción */}
          <div className="d-flex flex-column flex-md-row gap-2 justify-content-end">
            <button
              type="button"
              className="btn btn-outline-secondary"
              onClick={onCancel}
              disabled={loading}
            >
              <X size={16} className="me-1" />
              Cancelar
            </button>

            {onGenerateAI && (
              <button
                type="button"
                className="btn btn-outline-success"
                onClick={handleGenerateAI}
                disabled={loading}
              >
                <Sparkles size={16} className="me-1" />
                Generar con IA
              </button>
            )}

                         <button
               type="submit"
               className="btn btn-primary"
               disabled={loading}
             >
               {loading ? (
                 <>
                   <span className="spinner-border spinner-border-sm me-2" />
                   {mode === 'edit' ? 'Guardando...' : mode === 'duplicate' ? 'Duplicando...' : 'Creando...'}
                 </>
               ) : (
                 <>
                   <Save size={16} className="me-1" />
                   {mode === 'edit' ? 'Guardar Cambios' : mode === 'duplicate' ? 'Duplicar Plan' : 'Crear Plan'}
                 </>
               )}
             </button>
          </div>
        </form>
      </div>
    </div>
  );
} 