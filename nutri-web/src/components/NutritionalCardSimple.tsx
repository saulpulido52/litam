import React, { useState } from 'react';

interface NutritionalCardSimpleProps {
  dietPlan?: any;
  patient: any;
  clinicalRecord?: any;
  mode: 'create' | 'edit' | 'view';
  onSave?: (planData: any) => void;
  onClose?: () => void;
  isLoading?: boolean;
}

const NutritionalCardSimple: React.FC<NutritionalCardSimpleProps> = ({
  dietPlan,
  patient,
  clinicalRecord,
  mode,
  onSave,
  onClose,
  isLoading = false
}) => {
  const [activeTab, setActiveTab] = useState<string>('summary');
  const [planData, setPlanData] = useState<any>({
    name: dietPlan?.name || '',
    description: dietPlan?.description || '',
    notes: dietPlan?.notes || '',
    startDate: dietPlan?.start_date ? new Date(dietPlan.start_date).toISOString().split('T')[0] : '',
    endDate: dietPlan?.end_date ? new Date(dietPlan.end_date).toISOString().split('T')[0] : '',
    dailyCaloriesTarget: dietPlan?.daily_calories_target || dietPlan?.target_calories || 2000,
    dailyMacrosTarget: dietPlan?.daily_macros_target || {
      protein: 150,
      carbohydrates: 200,
      fats: 67
    },
    isWeeklyPlan: dietPlan?.is_weekly_plan ?? true,
    totalWeeks: dietPlan?.total_weeks || 4,
    weeklyPlans: dietPlan?.weekly_plans || []
  });

  const tabs = [
    { key: 'summary', label: 'Resumen', icon: '📋' },
    { key: 'meals', label: 'Comidas', icon: '🍽️' },
    { key: 'nutrition', label: 'Nutrición', icon: '🎯' },
    { key: 'schedule', label: 'Horarios', icon: '⏰' },
    { key: 'restrictions', label: 'Restricciones', icon: '🛡️' }
  ];

  const handleSave = () => {
    if (onSave) {
      const transformedData = {
        ...planData,
        patientId: patient?.id || patient?.user?.id
      };
      onSave(transformedData);
    }
  };

  const updatePlanData = (field: string, value: any) => {
    setPlanData((prev: any) => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog modal-xl">
        <div className="modal-content">
          {/* Header */}
          <div className="card-header bg-primary text-white">
            <div className="d-flex align-items-center justify-content-between">
              <h5 className="mb-0 d-flex align-items-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="me-2">
                  <path d="M8 2v4"></path>
                  <path d="M16 2v4"></path>
                  <rect width="18" height="18" x="3" y="4" rx="2"></rect>
                  <path d="M3 10h18"></path>
                </svg>
                <span>
                  {mode === 'create' ? 'Crear Plan Nutricional' : 
                   mode === 'edit' ? 'Editar Plan Nutricional' : 
                   'Ver Plan Nutricional'}
                </span>
              </h5>
              <button 
                type="button" 
                className="btn-close btn-close-white" 
                onClick={onClose}
              ></button>
            </div>
          </div>

          {/* Información del paciente */}
          <div className="modal-body p-0">
            <div className="bg-light border-bottom p-3">
              <div className="row align-items-center">
                <div className="col-md-8">
                  <h6 className="mb-1 text-primary">
                    👤 {patient?.user?.first_name || patient?.first_name} {patient?.user?.last_name || patient?.last_name}
                  </h6>
                  <div className="text-muted small">
                    <span className="me-3">📧 {patient?.user?.email || patient?.email}</span>
                    <span className="me-3">📞 {patient?.user?.phone || patient?.phone}</span>
                    <span>🎂 {patient?.user?.age || patient?.age || 'N/A'} años</span>
                  </div>
                </div>
                <div className="col-md-4 text-md-end">
                  {clinicalRecord && (
                    <span className="badge bg-success">
                      📋 Expediente clínico disponible
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Pestañas de navegación */}
            <ul className="nav nav-tabs mb-0" style={{ backgroundColor: '#f8f9fa' }}>
              {tabs.map(tab => (
                <li key={tab.key} className="nav-item">
                  <button 
                    className={`nav-link ${activeTab === tab.key ? 'active' : ''}`}
                    onClick={() => setActiveTab(tab.key)}
                    disabled={isLoading}
                  >
                    <span className="me-1">{tab.icon}</span>
                    {tab.label}
                  </button>
                </li>
              ))}
            </ul>

            {/* Contenido de la pestaña activa */}
            <div className="p-4" style={{ minHeight: '500px', maxHeight: '70vh', overflowY: 'auto' }}>
              {activeTab === 'summary' && (
                <div className="summary-tab">
                  <h6 className="mb-3">📋 Información General del Plan</h6>
                  
                  <div className="row">
                    <div className="col-md-8">
                      <div className="card">
                        <div className="card-body">
                          <div className="mb-3">
                            <label className="form-label">Nombre del Plan *</label>
                            <input
                              type="text"
                              className="form-control"
                              value={planData.name}
                              onChange={(e) => updatePlanData('name', e.target.value)}
                              placeholder="Ej: Plan de Control de Peso - Enero 2025"
                              disabled={mode === 'view' || isLoading}
                              required
                            />
                          </div>

                          <div className="mb-3">
                            <label className="form-label">Descripción</label>
                            <textarea
                              className="form-control"
                              rows={3}
                              value={planData.description}
                              onChange={(e) => updatePlanData('description', e.target.value)}
                              placeholder="Descripción detallada del plan nutricional..."
                              disabled={mode === 'view' || isLoading}
                            />
                          </div>

                          <div className="row">
                            <div className="col-md-6">
                              <label className="form-label">Fecha de Inicio *</label>
                              <input
                                type="date"
                                className="form-control"
                                value={planData.startDate}
                                onChange={(e) => updatePlanData('startDate', e.target.value)}
                                disabled={mode === 'view' || isLoading}
                                required
                              />
                            </div>
                            <div className="col-md-6">
                              <label className="form-label">Fecha de Fin</label>
                              <input
                                type="date"
                                className="form-control"
                                value={planData.endDate}
                                onChange={(e) => updatePlanData('endDate', e.target.value)}
                                disabled={mode === 'view' || isLoading}
                              />
                            </div>
                          </div>

                          <div className="mt-3">
                            <label className="form-label">Calorías Diarias Objetivo</label>
                            <div className="input-group">
                              <input
                                type="number"
                                className="form-control"
                                value={planData.dailyCaloriesTarget}
                                onChange={(e) => updatePlanData('dailyCaloriesTarget', parseInt(e.target.value) || 0)}
                                min="1000"
                                max="5000"
                                step="50"
                                disabled={mode === 'view' || isLoading}
                              />
                              <span className="input-group-text">kcal</span>
                            </div>
                          </div>

                          <div className="mt-3">
                            <label className="form-label">Notas Adicionales</label>
                            <textarea
                              className="form-control"
                              rows={2}
                              value={planData.notes}
                              onChange={(e) => updatePlanData('notes', e.target.value)}
                              placeholder="Notas para el seguimiento..."
                              disabled={mode === 'view' || isLoading}
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="col-md-4">
                      <div className="card">
                        <div className="card-header">
                          <h6 className="mb-0">📊 Distribución Calórica</h6>
                        </div>
                        <div className="card-body">
                          <div className="text-center mb-3">
                            <h4 className="text-primary mb-0">{planData.dailyCaloriesTarget.toLocaleString()}</h4>
                            <small className="text-muted">kcal/día</small>
                          </div>
                          
                          <div className="small">
                            <div className="d-flex justify-content-between align-items-center mb-2">
                              <span className="d-flex align-items-center">
                                <span className="badge bg-danger me-2" style={{ width: '12px', height: '12px' }}></span>
                                Proteínas (30%)
                              </span>
                              <span>{Math.round(planData.dailyCaloriesTarget * 0.3 / 4)}g</span>
                            </div>
                            <div className="d-flex justify-content-between align-items-center mb-2">
                              <span className="d-flex align-items-center">
                                <span className="badge bg-warning me-2" style={{ width: '12px', height: '12px' }}></span>
                                Carbohidratos (45%)
                              </span>
                              <span>{Math.round(planData.dailyCaloriesTarget * 0.45 / 4)}g</span>
                            </div>
                            <div className="d-flex justify-content-between align-items-center">
                              <span className="d-flex align-items-center">
                                <span className="badge bg-success me-2" style={{ width: '12px', height: '12px' }}></span>
                                Grasas (25%)
                              </span>
                              <span>{Math.round(planData.dailyCaloriesTarget * 0.25 / 9)}g</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {clinicalRecord && (
                        <div className="card mt-3">
                          <div className="card-header">
                            <h6 className="mb-0">🏥 Datos Clínicos</h6>
                          </div>
                          <div className="card-body">
                            <div className="small">
                              <div className="d-flex justify-content-between mb-1">
                                <span>Peso:</span>
                                <strong>{clinicalRecord.anthropometric_measurements?.current_weight_kg || 'N/A'} kg</strong>
                              </div>
                              <div className="d-flex justify-content-between mb-1">
                                <span>Altura:</span>
                                <strong>{clinicalRecord.anthropometric_measurements?.height_m ? (clinicalRecord.anthropometric_measurements.height_m * 100).toFixed(0) + ' cm' : 'N/A'}</strong>
                              </div>
                              <div className="d-flex justify-content-between">
                                <span>Diagnóstico:</span>
                                <strong>{clinicalRecord.nutritional_diagnosis || 'N/A'}</strong>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'meals' && (
                <div className="meals-tab">
                  <h6 className="mb-3">🍽️ Planificación de Comidas</h6>
                  <div className="alert alert-info">
                    <div className="d-flex align-items-center">
                      <span className="me-2">🚧</span>
                      <div>
                        <strong>En desarrollo:</strong> El sistema completo de planificación de comidas estará disponible próximamente.
                        <br />
                        <small>Funcionalidades incluidas: Timeline semanal, gestión de comidas, cálculos nutricionales automáticos.</small>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'nutrition' && (
                <div className="nutrition-tab">
                  <h6 className="mb-3">🎯 Objetivos Nutricionales</h6>
                  <div className="alert alert-info">
                    <div className="d-flex align-items-center">
                      <span className="me-2">🚧</span>
                      <div>
                        <strong>En desarrollo:</strong> El sistema completo de objetivos nutricionales estará disponible próximamente.
                        <br />
                        <small>Funcionalidades incluidas: Distribución de macronutrientes, micronutrientes, hidratación.</small>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'schedule' && (
                <div className="schedule-tab">
                  <h6 className="mb-3">⏰ Horarios de Comidas</h6>
                  <div className="alert alert-info">
                    <div className="d-flex align-items-center">
                      <span className="me-2">🚧</span>
                      <div>
                        <strong>En desarrollo:</strong> El sistema completo de horarios estará disponible próximamente.
                        <br />
                        <small>Funcionalidades incluidas: Timeline diario, análisis de intervalos, recordatorios.</small>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'restrictions' && (
                <div className="restrictions-tab">
                  <h6 className="mb-3">🛡️ Restricciones y Alergias</h6>
                  <div className="alert alert-info">
                    <div className="d-flex align-items-center">
                      <span className="me-2">🚧</span>
                      <div>
                        <strong>En desarrollo:</strong> El sistema completo de restricciones estará disponible próximamente.
                        <br />
                        <small>Funcionalidades incluidas: Gestión de alergias, condiciones médicas, contactos de emergencia.</small>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Footer con botones de acción */}
          <div className="modal-footer">
            <div className="d-flex justify-content-between w-100">
              <div>
                {mode !== 'view' && (
                  <span className="text-muted small">
                    ℹ️ Los cambios se guardan al hacer clic en el botón correspondiente
                  </span>
                )}
              </div>
              <div>
                <button 
                  type="button" 
                  className="btn btn-secondary me-2" 
                  onClick={onClose}
                  disabled={isLoading}
                >
                  {mode === 'view' ? 'Cerrar' : 'Cancelar'}
                </button>
                {mode !== 'view' && (
                  <button 
                    type="button" 
                    className="btn btn-primary" 
                    onClick={handleSave}
                    disabled={isLoading || !planData.name.trim()}
                  >
                    {isLoading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                        Guardando...
                      </>
                    ) : (
                      <>
                        💾 {mode === 'create' ? 'Crear Plan' : 'Guardar Cambios'}
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NutritionalCardSimple; 