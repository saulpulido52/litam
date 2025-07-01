import React, { useState, useEffect } from 'react';
import { Patient } from '../../types/patient';
import { ClinicalRecord } from '../../types/clinical-record';

interface NutritionalSummaryTabProps {
  planData: any;
  patient: Patient;
  clinicalRecord?: ClinicalRecord;
  mode: 'create' | 'edit' | 'view';
  onUpdateData: (section: string, data: any) => void;
  isLoading?: boolean;
}

const NutritionalSummaryTab: React.FC<NutritionalSummaryTabProps> = ({
  planData,
  patient,
  clinicalRecord,
  mode,
  onUpdateData,
  isLoading = false
}) => {
  const [formData, setFormData] = useState({
    name: planData.name || '',
    description: planData.description || '',
    notes: planData.notes || '',
    startDate: planData.startDate || '',
    endDate: planData.endDate || '',
    dailyCaloriesTarget: planData.dailyCaloriesTarget || 2000,
    totalWeeks: planData.totalWeeks || 4,
    isWeeklyPlan: planData.isWeeklyPlan ?? true
  });

  // Actualizar datos cuando cambien los props
  useEffect(() => {
    setFormData({
      name: planData.name || '',
      description: planData.description || '',
      notes: planData.notes || '',
      startDate: planData.startDate || '',
      endDate: planData.endDate || '',
      dailyCaloriesTarget: planData.dailyCaloriesTarget || 2000,
      totalWeeks: planData.totalWeeks || 4,
      isWeeklyPlan: planData.isWeeklyPlan ?? true
    });
  }, [planData]);

  // Manejar cambios en el formulario
  const handleChange = (field: string, value: any) => {
    const newFormData = {
      ...formData,
      [field]: value
    };
    setFormData(newFormData);
    onUpdateData('summary', newFormData);
  };

  // Calcular fechas automáticamente
  const calculateEndDate = (startDate: string, weeks: number) => {
    if (!startDate) return '';
    const start = new Date(startDate);
    const end = new Date(start);
    end.setDate(start.getDate() + (weeks * 7) - 1);
    return end.toISOString().split('T')[0];
  };

  // Aplicar recomendaciones del expediente clínico
  const applyFromClinicalRecord = () => {
    if (!clinicalRecord) return;

    // Calcular calorías basadas en el expediente
    const anthropometric = clinicalRecord.anthropometric_measurements;
    let recommendedCalories = 2000;

    if (anthropometric?.weight && anthropometric?.height_m) {
      const weight = parseFloat(anthropometric.weight);
      const heightM = parseFloat(anthropometric.height_m);
      const age = patient.user?.age || 30;
      
      // Fórmula Harris-Benedict para hombres/mujeres
      let bmr;
      if (patient.user?.gender === 'male') {
        bmr = 88.362 + (13.397 * weight) + (4.799 * heightM * 100) - (5.677 * age);
      } else {
        bmr = 447.593 + (9.247 * weight) + (3.098 * heightM * 100) - (4.330 * age);
      }

      // Ajustar por nivel de actividad
      const activityLevel = clinicalRecord.physical_exercise || 'sedentario';
      const multipliers = {
        'sedentario': 1.2,
        'ligero': 1.375,
        'moderado': 1.55,
        'activo': 1.725,
        'muy_activo': 1.9
      };
      
      const multiplier = multipliers[activityLevel as keyof typeof multipliers] || 1.2;
      recommendedCalories = Math.round(bmr * multiplier);

      // Ajustar según diagnóstico nutricional
      const diagnosis = clinicalRecord.nutritional_diagnosis?.toLowerCase() || '';
      if (diagnosis.includes('sobrepeso') || diagnosis.includes('obesidad')) {
        recommendedCalories = Math.round(recommendedCalories * 0.85); // 15% déficit
      } else if (diagnosis.includes('bajo peso')) {
        recommendedCalories = Math.round(recommendedCalories * 1.15); // 15% superávit
      }
    }

    // Generar descripción personalizada
    const diagnosis = clinicalRecord.nutritional_diagnosis || 'No especificado';
    const conditions = clinicalRecord.diagnosed_diseases || 'Ninguna';
    const generatedDescription = `Plan nutricional personalizado para ${diagnosis.toLowerCase()}. Condiciones médicas: ${conditions}. Basado en expediente clínico del ${new Date(clinicalRecord.record_date).toLocaleDateString()}.`;

    const updatedData = {
      ...formData,
      description: generatedDescription,
      dailyCaloriesTarget: recommendedCalories,
      name: `Plan Nutricional - ${patient.user?.first_name} ${patient.user?.last_name} (${new Date().toLocaleDateString()})`
    };

    setFormData(updatedData);
    onUpdateData('summary', updatedData);
  };

  // Calcular IMC si hay datos antropométricos
  const calculateBMI = () => {
    if (!clinicalRecord?.anthropometric_measurements) return null;
    const { weight, height_m } = clinicalRecord.anthropometric_measurements;
    if (weight && height_m) {
      const bmi = parseFloat(weight) / (parseFloat(height_m) ** 2);
      return bmi.toFixed(1);
    }
    return null;
  };

  const bmi = calculateBMI();
  const isReadOnly = mode === 'view';

  return (
    <div className="nutritional-summary-tab">
      {/* Información básica del plan */}
      <div className="row">
        <div className="col-md-8">
          <div className="card">
            <div className="card-header">
              <h6 className="mb-0">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-edit-3 me-2">
                  <path d="M12 20h9"></path>
                  <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
                </svg>
                Información General del Plan
              </h6>
            </div>
            <div className="card-body">
              <div className="mb-3">
                <label className="form-label">Nombre del Plan *</label>
                <input
                  type="text"
                  className="form-control"
                  value={formData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  placeholder="Ej: Plan de Control de Peso - Enero 2025"
                  disabled={isReadOnly || isLoading}
                  required
                />
              </div>

              <div className="mb-3">
                <label className="form-label">Descripción</label>
                <textarea
                  className="form-control"
                  rows={3}
                  value={formData.description}
                  onChange={(e) => handleChange('description', e.target.value)}
                  placeholder="Descripción detallada del plan nutricional, objetivos y consideraciones especiales..."
                  disabled={isReadOnly || isLoading}
                />
              </div>

              <div className="row">
                <div className="col-md-6">
                  <label className="form-label">Fecha de Inicio *</label>
                  <input
                    type="date"
                    className="form-control"
                    value={formData.startDate}
                    onChange={(e) => {
                      handleChange('startDate', e.target.value);
                      if (e.target.value && formData.totalWeeks) {
                        const endDate = calculateEndDate(e.target.value, formData.totalWeeks);
                        handleChange('endDate', endDate);
                      }
                    }}
                    disabled={isReadOnly || isLoading}
                    required
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label">Fecha de Fin *</label>
                  <input
                    type="date"
                    className="form-control"
                    value={formData.endDate}
                    onChange={(e) => handleChange('endDate', e.target.value)}
                    disabled={isReadOnly || isLoading}
                    required
                  />
                </div>
              </div>

              <div className="row mt-3">
                <div className="col-md-6">
                  <label className="form-label">Duración (Semanas)</label>
                  <select
                    className="form-select"
                    value={formData.totalWeeks}
                    onChange={(e) => {
                      const weeks = parseInt(e.target.value);
                      handleChange('totalWeeks', weeks);
                      if (formData.startDate) {
                        const endDate = calculateEndDate(formData.startDate, weeks);
                        handleChange('endDate', endDate);
                      }
                    }}
                    disabled={isReadOnly || isLoading}
                  >
                    {[1, 2, 3, 4, 6, 8, 12, 16, 24].map(weeks => (
                      <option key={weeks} value={weeks}>
                        {weeks} semana{weeks !== 1 ? 's' : ''}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="col-md-6">
                  <label className="form-label">Calorías Diarias Objetivo</label>
                  <div className="input-group">
                    <input
                      type="number"
                      className="form-control"
                      value={formData.dailyCaloriesTarget}
                      onChange={(e) => handleChange('dailyCaloriesTarget', parseInt(e.target.value) || 0)}
                      min="1000"
                      max="5000"
                      step="50"
                      disabled={isReadOnly || isLoading}
                    />
                    <span className="input-group-text">kcal</span>
                  </div>
                </div>
              </div>

              <div className="mt-3">
                <label className="form-label">Notas Adicionales</label>
                <textarea
                  className="form-control"
                  rows={2}
                  value={formData.notes}
                  onChange={(e) => handleChange('notes', e.target.value)}
                  placeholder="Notas para el seguimiento, consideraciones especiales, preferencias del paciente..."
                  disabled={isReadOnly || isLoading}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Panel lateral con información del paciente */}
        <div className="col-md-4">
          {/* Información del expediente clínico */}
          {clinicalRecord && (
            <div className="card mb-3">
              <div className="card-header">
                <h6 className="mb-0">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-activity me-2">
                    <path d="M22 12h-2.48a2 2 0 0 0-1.93 1.46l-2.35 8.36a.25.25 0 0 1-.48 0L9.24 2.18a.25.25 0 0 0-.48 0l-2.35 8.36A2 2 0 0 1 4.49 12H2"></path>
                  </svg>
                  Datos Clínicos
                </h6>
              </div>
              <div className="card-body">
                {clinicalRecord.anthropometric_measurements && (
                  <div className="mb-3">
                    <h6 className="text-primary mb-2">Antropometría</h6>
                    <div className="small">
                      <div className="d-flex justify-content-between">
                        <span>Peso:</span>
                        <strong>{clinicalRecord.anthropometric_measurements.weight} kg</strong>
                      </div>
                      <div className="d-flex justify-content-between">
                        <span>Altura:</span>
                        <strong>{(parseFloat(clinicalRecord.anthropometric_measurements.height_m || '0') * 100).toFixed(0)} cm</strong>
                      </div>
                      {bmi && (
                        <div className="d-flex justify-content-between">
                          <span>IMC:</span>
                          <strong className={`${parseFloat(bmi) < 18.5 ? 'text-warning' : parseFloat(bmi) > 25 ? 'text-danger' : 'text-success'}`}>
                            {bmi}
                          </strong>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {clinicalRecord.nutritional_diagnosis && (
                  <div className="mb-3">
                    <h6 className="text-primary mb-2">Diagnóstico</h6>
                    <div className="small">
                      <span className="badge bg-info">{clinicalRecord.nutritional_diagnosis}</span>
                    </div>
                  </div>
                )}

                {clinicalRecord.physical_exercise && (
                  <div className="mb-3">
                    <h6 className="text-primary mb-2">Actividad Física</h6>
                    <div className="small">
                      <span className="badge bg-secondary">{clinicalRecord.physical_exercise}</span>
                    </div>
                  </div>
                )}

                {!isReadOnly && (
                  <button
                    type="button"
                    className="btn btn-outline-primary btn-sm w-100"
                    onClick={applyFromClinicalRecord}
                    disabled={isLoading}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-wand-2 me-1">
                      <path d="M21.64 3.64a3 3 0 0 0-4.24 0L4.87 16.17a1 1 0 0 0-.29.71V20a1 1 0 0 0 1 1h3.12a1 1 0 0 0 .71-.29L22.94 7.88a3 3 0 0 0 0-4.24Z"></path>
                      <path d="M14 7l3 3"></path>
                      <path d="M5 20l-3 3"></path>
                      <path d="M15 2l3 3"></path>
                    </svg>
                    Aplicar Expediente
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Resumen de macronutrientes */}
          <div className="card">
            <div className="card-header">
              <h6 className="mb-0">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-pie-chart me-2">
                  <path d="M21.21 15.89A10 10 0 1 1 8 2.83"></path>
                  <path d="M22 12A10 10 0 0 0 12 2v10z"></path>
                </svg>
                Distribución Calórica
              </h6>
            </div>
            <div className="card-body">
              <div className="text-center mb-3">
                <h4 className="text-primary mb-0">{formData.dailyCaloriesTarget.toLocaleString()}</h4>
                <small className="text-muted">kcal/día</small>
              </div>
              
              <div className="small">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <span className="d-flex align-items-center">
                    <span className="badge bg-danger me-2" style={{ width: '12px', height: '12px' }}></span>
                    Proteínas (30%)
                  </span>
                  <span>{Math.round(formData.dailyCaloriesTarget * 0.3 / 4)}g</span>
                </div>
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <span className="d-flex align-items-center">
                    <span className="badge bg-warning me-2" style={{ width: '12px', height: '12px' }}></span>
                    Carbohidratos (45%)
                  </span>
                  <span>{Math.round(formData.dailyCaloriesTarget * 0.45 / 4)}g</span>
                </div>
                <div className="d-flex justify-content-between align-items-center">
                  <span className="d-flex align-items-center">
                    <span className="badge bg-success me-2" style={{ width: '12px', height: '12px' }}></span>
                    Grasas (25%)
                  </span>
                  <span>{Math.round(formData.dailyCaloriesTarget * 0.25 / 9)}g</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NutritionalSummaryTab; 