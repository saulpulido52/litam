import React, { useState } from 'react';
import { Calendar, Clock, Target, FileText, Download, Edit, X, Settings, RotateCcw, Shield, AlertTriangle, Heart } from 'lucide-react';
import type { DietPlan } from '../types/diet';

interface DietPlanViewerProps {
  plan: DietPlan;
  onEdit?: () => void;
  onDownload?: () => void;
  onClose?: () => void;
}

const DietPlanViewer: React.FC<DietPlanViewerProps> = ({
  plan,
  onEdit,
  onDownload,
  onClose
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'meals' | 'nutrition' | 'schedule' | 'restrictions'>('overview');

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('es-ES');
    } catch (error) {
      return 'N/A';
    }
  };

  const formatCalories = (calories?: number) => {
    if (!calories || calories === 0) return 'N/A';
    return `${calories} kcal`;
  };

  const getPlanTypeLabel = (planType?: string) => {
    switch (planType) {
      case 'daily': return 'Plan Diario';
      case 'weekly': return 'Plan Semanal';
      case 'monthly': return 'Plan Mensual';
      case 'custom': return 'Plan Personalizado';
      case 'flexible': return 'Plan Flexible';
      default: return 'Plan';
    }
  };

  const getStatusLabel = (status: string) => {
    const statusConfig = {
      draft: { text: 'Borrador', class: 'bg-secondary' },
      active: { text: 'Activo', class: 'bg-success' },
      completed: { text: 'Completado', class: 'bg-primary' },
      cancelled: { text: 'Cancelado', class: 'bg-danger' }
    };
    return statusConfig[status as keyof typeof statusConfig] || statusConfig.draft;
  };

  const calculatePlanDuration = (startDate?: string, endDate?: string) => {
    if (!startDate || !endDate) return 'N/A';
    try {
      const start = new Date(startDate);
      const end = new Date(endDate);
      const diffTime = Math.abs(end.getTime() - start.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays === 1) return '1 día';
      if (diffDays < 7) return `${diffDays} días`;
      if (diffDays < 30) return `${Math.ceil(diffDays / 7)} semanas`;
      if (diffDays < 365) return `${Math.ceil(diffDays / 30)} meses`;
      return `${Math.ceil(diffDays / 365)} años`;
    } catch (error) {
      return 'N/A';
    }
  };

  const renderOverview = () => (
    <div className="row">
      <div className="col-md-6">
        <h6 className="mb-3">
          <FileText size={16} className="me-2" />
          Información General
        </h6>
        <div className="mb-3">
          <strong>Nombre:</strong> {plan.name}
        </div>
        <div className="mb-3">
          <strong>Descripción:</strong> {plan.description || 'Sin descripción'}
        </div>
        <div className="mb-3">
          <strong>Tipo de Plan:</strong> {getPlanTypeLabel(plan.plan_type)}
        </div>
        <div className="mb-3">
          <strong>Estado:</strong> 
          <span className={`badge ${getStatusLabel(plan.status).class} ms-2`}>
            {getStatusLabel(plan.status).text}
          </span>
        </div>
        <div className="mb-3">
          <strong>Duración:</strong> {calculatePlanDuration(plan.start_date, plan.end_date)}
        </div>
        <div className="mb-3">
          <strong>Fecha de inicio:</strong> {formatDate(plan.start_date)}
        </div>
        <div className="mb-3">
          <strong>Fecha de fin:</strong> {formatDate(plan.end_date)}
        </div>
      </div>
      
      <div className="col-md-6">
        <h6 className="mb-3">
          <Target size={16} className="me-2" />
          Objetivos Nutricionales
        </h6>
        <div className="mb-3">
          <strong>Calorías diarias:</strong> {formatCalories(plan.target_calories)}
        </div>
        <div className="mb-3">
          <strong>Proteínas:</strong> {plan.target_protein ? `${plan.target_protein}g` : 'N/A'}
        </div>
        <div className="mb-3">
          <strong>Carbohidratos:</strong> {plan.target_carbs ? `${plan.target_carbs}g` : 'N/A'}
        </div>
        <div className="mb-3">
          <strong>Grasas:</strong> {plan.target_fats ? `${plan.target_fats}g` : 'N/A'}
        </div>
        
        {plan.notes && (
          <div className="mt-4">
            <h6 className="mb-2">Notas:</h6>
            <p className="text-muted">{plan.notes}</p>
          </div>
        )}
      </div>
    </div>
  );

  const renderMealConfiguration = () => (
    <div className="row">
      <div className="col-md-6">
        <h6 className="mb-3">
          <Settings size={16} className="me-2" />
          Frecuencia de Comidas
        </h6>
        {plan.meal_frequency && (
          <div className="d-flex flex-column gap-2">
            <div className="d-flex justify-content-between">
              <span>Desayuno</span>
              <span className={plan.meal_frequency.breakfast ? 'text-success' : 'text-muted'}>
                {plan.meal_frequency.breakfast ? '✓' : '✗'}
              </span>
            </div>
            <div className="d-flex justify-content-between">
              <span>Merienda Mañana</span>
              <span className={plan.meal_frequency.morning_snack ? 'text-success' : 'text-muted'}>
                {plan.meal_frequency.morning_snack ? '✓' : '✗'}
              </span>
            </div>
            <div className="d-flex justify-content-between">
              <span>Almuerzo</span>
              <span className={plan.meal_frequency.lunch ? 'text-success' : 'text-muted'}>
                {plan.meal_frequency.lunch ? '✓' : '✗'}
              </span>
            </div>
            <div className="d-flex justify-content-between">
              <span>Merienda Tarde</span>
              <span className={plan.meal_frequency.afternoon_snack ? 'text-success' : 'text-muted'}>
                {plan.meal_frequency.afternoon_snack ? '✓' : '✗'}
              </span>
            </div>
            <div className="d-flex justify-content-between">
              <span>Cena</span>
              <span className={plan.meal_frequency.dinner ? 'text-success' : 'text-muted'}>
                {plan.meal_frequency.dinner ? '✓' : '✗'}
              </span>
            </div>
            <div className="d-flex justify-content-between">
              <span>Merienda Noche</span>
              <span className={plan.meal_frequency.evening_snack ? 'text-success' : 'text-muted'}>
                {plan.meal_frequency.evening_snack ? '✓' : '✗'}
              </span>
            </div>
          </div>
        )}
      </div>
      
      <div className="col-md-6">
        <h6 className="mb-3">
          <Clock size={16} className="me-2" />
          Horarios de Comidas
        </h6>
        {plan.meal_timing && (
          <div className="d-flex flex-column gap-2">
            <div className="d-flex justify-content-between">
              <span>Desayuno</span>
              <span className="fw-medium">{plan.meal_timing.breakfast_time || 'N/A'}</span>
            </div>
            <div className="d-flex justify-content-between">
              <span>Almuerzo</span>
              <span className="fw-medium">{plan.meal_timing.lunch_time || 'N/A'}</span>
            </div>
            <div className="d-flex justify-content-between">
              <span>Cena</span>
              <span className="fw-medium">{plan.meal_timing.dinner_time || 'N/A'}</span>
            </div>
            {plan.meal_timing.snack_times && plan.meal_timing.snack_times.length > 0 && (
              <div className="d-flex justify-content-between">
                <span>Meriendas</span>
                <span className="fw-medium">{plan.meal_timing.snack_times.join(', ')}</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );

  const renderFlexibilitySettings = () => (
    <div className="row">
      <div className="col-md-12">
        <h6 className="mb-3">
          <RotateCcw size={16} className="me-2" />
          Configuración de Flexibilidad
        </h6>
        {plan.flexibility_settings && (
          <div className="row">
            <div className="col-md-4">
              <div className="card">
                <div className="card-body text-center">
                  <h6>Permitir Intercambio</h6>
                  <span className={plan.flexibility_settings.allow_meal_swapping ? 'text-success' : 'text-muted'}>
                    {plan.flexibility_settings.allow_meal_swapping ? '✓ Permitido' : '✗ No permitido'}
                  </span>
                </div>
              </div>
            </div>
            <div className="col-md-4">
              <div className="card">
                <div className="card-body text-center">
                  <h6>Ajuste de Porciones</h6>
                  <span className={plan.flexibility_settings.allow_portion_adjustment ? 'text-success' : 'text-muted'}>
                    {plan.flexibility_settings.allow_portion_adjustment ? '✓ Permitido' : '✗ No permitido'}
                  </span>
                </div>
              </div>
            </div>
            <div className="col-md-4">
              <div className="card">
                <div className="card-body text-center">
                  <h6>Sustitución de Alimentos</h6>
                  <span className={plan.flexibility_settings.allow_food_substitution ? 'text-success' : 'text-muted'}>
                    {plan.flexibility_settings.allow_food_substitution ? '✓ Permitido' : '✗ No permitido'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
        
        <div className="row mt-3">
          <div className="col-md-6">
            <div className="card">
              <div className="card-body text-center">
                <h6>Días de Trampa por Semana</h6>
                <span className="fw-bold text-warning">
                  {plan.flexibility_settings?.cheat_days_per_week || 0}
                </span>
              </div>
            </div>
          </div>
          <div className="col-md-6">
            <div className="card">
              <div className="card-body text-center">
                <h6>Comidas Libres por Semana</h6>
                <span className="fw-bold text-info">
                  {plan.flexibility_settings?.free_meals_per_week || 0}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderWeeklyMeals = () => {
    if (!plan.weekly_plans || plan.weekly_plans.length === 0) {
      return (
        <div className="text-center py-4">
          <p className="text-muted">No hay planes semanales configurados para este plan</p>
        </div>
      );
    }

    return plan.weekly_plans.map((weekPlan, weekIndex) => (
      <div key={weekIndex} className="card mb-3">
        <div className="card-header">
          <h6 className="mb-0">
            <Calendar size={16} className="me-2" />
            Semana {weekPlan.week_number}
            <small className="text-muted ms-2">
              ({formatDate(weekPlan.start_date)} - {formatDate(weekPlan.end_date)})
            </small>
          </h6>
        </div>
        <div className="card-body">
          <div className="row mb-3">
            <div className="col-md-3">
              <strong>Calorías diarias:</strong> {formatCalories(weekPlan.daily_calories_target)}
            </div>
            <div className="col-md-3">
              <strong>Proteínas:</strong> {weekPlan.daily_macros_target.protein}g
            </div>
            <div className="col-md-3">
              <strong>Carbohidratos:</strong> {weekPlan.daily_macros_target.carbohydrates}g
            </div>
            <div className="col-md-3">
              <strong>Grasas:</strong> {weekPlan.daily_macros_target.fats}g
            </div>
          </div>
          
          {weekPlan.meals && weekPlan.meals.length > 0 ? (
            <div className="table-responsive">
              <table className="table table-sm">
                <thead>
                  <tr>
                    <th>Día</th>
                    <th>Tipo</th>
                    <th>Alimentos</th>
                    <th>Calorías</th>
                    <th>Notas</th>
                  </tr>
                </thead>
                <tbody>
                  {weekPlan.meals.map((meal, mealIndex) => (
                    <tr key={mealIndex}>
                      <td>
                        <span className="badge bg-light text-dark">
                          {meal.day}
                        </span>
                      </td>
                      <td>
                        <span className="badge bg-primary">
                          {meal.meal_type}
                        </span>
                      </td>
                      <td>
                        {meal.foods.map((food, foodIndex) => (
                          <div key={foodIndex} className="small">
                            {food.food_name} ({food.quantity_grams}g)
                          </div>
                        ))}
                      </td>
                      <td>
                        {meal.foods.reduce((total, food) => total + food.calories, 0)} kcal
                      </td>
                      <td>
                        <small className="text-muted">{meal.notes || '-'}</small>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-muted">No hay comidas planificadas para esta semana</p>
          )}
          
          {weekPlan.notes && (
            <div className="mt-3">
              <strong>Notas de la semana:</strong>
              <p className="text-muted mb-0">{weekPlan.notes}</p>
            </div>
          )}
        </div>
      </div>
    ));
  };

  const renderPeriodMeals = () => {
    if (!plan.period_plans || plan.period_plans.length === 0) {
      return (
        <div className="text-center py-4">
          <p className="text-muted">No hay períodos planificados para este plan</p>
        </div>
      );
    }

    return plan.period_plans.map((periodPlan, periodIndex) => (
      <div key={periodIndex} className="card mb-3">
        <div className="card-header">
          <h6 className="mb-0">
            <Calendar size={16} className="me-2" />
            {periodPlan.period_name || `Período ${periodPlan.period_number}`}
            <small className="text-muted ms-2">
              ({formatDate(periodPlan.start_date)} - {formatDate(periodPlan.end_date)})
            </small>
          </h6>
        </div>
        <div className="card-body">
          <div className="row mb-3">
            <div className="col-md-3">
              <strong>Calorías diarias:</strong> {formatCalories(periodPlan.daily_calories_target)}
            </div>
            <div className="col-md-3">
              <strong>Proteínas:</strong> {periodPlan.daily_macros_target.protein}g
            </div>
            <div className="col-md-3">
              <strong>Carbohidratos:</strong> {periodPlan.daily_macros_target.carbohydrates}g
            </div>
            <div className="col-md-3">
              <strong>Grasas:</strong> {periodPlan.daily_macros_target.fats}g
            </div>
          </div>
          
          {periodPlan.meals && periodPlan.meals.length > 0 ? (
            <div className="table-responsive">
              <table className="table table-sm">
                <thead>
                  <tr>
                    <th>Día</th>
                    <th>Tipo</th>
                    <th>Alimentos</th>
                    <th>Calorías</th>
                    <th>Notas</th>
                  </tr>
                </thead>
                <tbody>
                  {periodPlan.meals.map((meal, mealIndex) => (
                    <tr key={mealIndex}>
                      <td>
                        <span className="badge bg-light text-dark">
                          {meal.day || `Día ${meal.day_number}`}
                        </span>
                      </td>
                      <td>
                        <span className="badge bg-primary">
                          {meal.meal_type}
                        </span>
                      </td>
                      <td>
                        {meal.foods.map((food, foodIndex) => (
                          <div key={foodIndex} className="small">
                            {food.food_name} ({food.quantity_grams}g)
                          </div>
                        ))}
                      </td>
                      <td>
                        {meal.foods.reduce((total, food) => total + food.calories, 0)} kcal
                      </td>
                      <td>
                        <small className="text-muted">{meal.notes || '-'}</small>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-muted">No hay comidas planificadas para este período</p>
          )}
          
          {periodPlan.notes && (
            <div className="mt-3">
              <strong>Notas del período:</strong>
              <p className="text-muted mb-0">{periodPlan.notes}</p>
            </div>
          )}
        </div>
      </div>
    ));
  };

  const renderPathologicalRestrictions = () => {
    if (!plan.pathological_restrictions) {
      return (
        <div className="text-center py-4">
          <Shield size={48} className="text-muted mb-3" />
          <p className="text-muted">No se han configurado restricciones patológicas para este plan</p>
        </div>
      );
    }

    const { medical_conditions, allergies, intolerances, medications, special_considerations, emergency_contacts } = plan.pathological_restrictions;

    return (
      <div className="row">
        {/* Condiciones Médicas */}
        <div className="col-md-6 mb-4">
          <div className="card">
            <div className="card-header">
              <h6 className="mb-0">
                <Heart size={16} className="me-2" />
                Condiciones Médicas
              </h6>
            </div>
            <div className="card-body">
              {medical_conditions.length === 0 ? (
                <p className="text-muted">No se han registrado condiciones médicas</p>
              ) : (
                medical_conditions.map((condition: any, index: number) => (
                  <div key={index} className="border rounded p-3 mb-3">
                    <div className="d-flex justify-content-between align-items-start mb-2">
                      <h6 className="mb-1">{condition.name}</h6>
                      <span className={`badge ${
                        condition.severity === 'critical' ? 'bg-danger' :
                        condition.severity === 'severe' ? 'bg-warning' :
                        condition.severity === 'moderate' ? 'bg-info' : 'bg-secondary'
                      }`}>
                        {condition.severity === 'critical' ? 'Crítica' :
                         condition.severity === 'severe' ? 'Severa' :
                         condition.severity === 'moderate' ? 'Moderada' : 'Leve'}
                      </span>
                    </div>
                    <p className="text-muted small mb-2">{condition.description}</p>
                    
                    {condition.restricted_foods && condition.restricted_foods.length > 0 && (
                      <div className="mb-2">
                        <strong className="text-danger">Restringidos:</strong>
                        <div className="d-flex flex-wrap gap-1 mt-1">
                          {condition.restricted_foods.map((food: string, i: number) => (
                            <span key={i} className="badge bg-danger text-white">{food}</span>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {condition.recommended_foods && condition.recommended_foods.length > 0 && (
                      <div className="mb-2">
                        <strong className="text-success">Recomendados:</strong>
                        <div className="d-flex flex-wrap gap-1 mt-1">
                          {condition.recommended_foods.map((food: string, i: number) => (
                            <span key={i} className="badge bg-success text-white">{food}</span>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {condition.monitoring_requirements && condition.monitoring_requirements.length > 0 && (
                      <div className="mb-2">
                        <strong>Monitoreo:</strong>
                        <ul className="list-unstyled mt-1">
                          {condition.monitoring_requirements.map((req: string, i: number) => (
                            <li key={i} className="small text-muted">• {req}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    {condition.emergency_instructions && (
                      <div className="alert alert-warning py-2">
                        <strong>Emergencia:</strong> {condition.emergency_instructions}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Alergias */}
        <div className="col-md-6 mb-4">
          <div className="card">
            <div className="card-header">
              <h6 className="mb-0">
                <AlertTriangle size={16} className="me-2" />
                Alergias
              </h6>
            </div>
            <div className="card-body">
              {allergies.length === 0 ? (
                <p className="text-muted">No se han registrado alergias</p>
              ) : (
                allergies.map((allergy: any, index: number) => (
                  <div key={index} className="border rounded p-3 mb-3">
                    <div className="d-flex justify-content-between align-items-start mb-2">
                      <h6 className="mb-1">{allergy.allergen}</h6>
                      <span className={`badge ${
                        allergy.severity === 'anaphylactic' ? 'bg-danger' :
                        allergy.severity === 'severe' ? 'bg-warning' :
                        allergy.severity === 'moderate' ? 'bg-info' : 'bg-secondary'
                      }`}>
                        {allergy.severity === 'anaphylactic' ? 'Anafiláctica' :
                         allergy.severity === 'severe' ? 'Severa' :
                         allergy.severity === 'moderate' ? 'Moderada' : 'Leve'}
                      </span>
                    </div>
                    
                    <div className="mb-2">
                      <strong>Síntomas:</strong>
                      <div className="d-flex flex-wrap gap-1 mt-1">
                        {allergy.symptoms.map((symptom: string, i: number) => (
                          <span key={i} className="badge bg-warning text-dark">{symptom}</span>
                        ))}
                      </div>
                    </div>
                    
                    {allergy.cross_reactions && allergy.cross_reactions.length > 0 && (
                      <div className="mb-2">
                        <strong>Reacciones Cruzadas:</strong>
                        <div className="d-flex flex-wrap gap-1 mt-1">
                          {allergy.cross_reactions.map((reaction: string, i: number) => (
                            <span key={i} className="badge bg-info text-white">{reaction}</span>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {allergy.emergency_medication && (
                      <div className="alert alert-danger py-2">
                        <strong>Medicación de Emergencia:</strong> {allergy.emergency_medication}
                      </div>
                    )}
                    
                    <div className="small text-muted">
                      <strong>Evitar:</strong> {allergy.avoidance_instructions}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Intolerancias */}
        <div className="col-md-6 mb-4">
          <div className="card">
            <div className="card-header">
              <h6 className="mb-0">
                <AlertTriangle size={16} className="me-2" />
                Intolerancias
              </h6>
            </div>
            <div className="card-body">
              {intolerances.length === 0 ? (
                <p className="text-muted">No se han registrado intolerancias</p>
              ) : (
                intolerances.map((intolerance: any, index: number) => (
                  <div key={index} className="border rounded p-3 mb-3">
                    <div className="d-flex justify-content-between align-items-start mb-2">
                      <h6 className="mb-1">{intolerance.substance}</h6>
                      <span className={`badge ${
                        intolerance.severity === 'severe' ? 'bg-warning' :
                        intolerance.severity === 'moderate' ? 'bg-info' : 'bg-secondary'
                      }`}>
                        {intolerance.severity === 'severe' ? 'Severa' :
                         intolerance.severity === 'moderate' ? 'Moderada' : 'Leve'}
                      </span>
                    </div>
                    
                    <div className="mb-2">
                      <strong>Síntomas:</strong>
                      <div className="d-flex flex-wrap gap-1 mt-1">
                        {intolerance.symptoms.map((symptom: string, i: number) => (
                          <span key={i} className="badge bg-warning text-dark">{symptom}</span>
                        ))}
                      </div>
                    </div>
                    
                    {intolerance.threshold_amount && (
                      <div className="mb-2">
                        <strong>Umbral:</strong> {intolerance.threshold_amount}
                      </div>
                    )}
                    
                    {intolerance.alternatives && intolerance.alternatives.length > 0 && (
                      <div className="mb-2">
                        <strong>Alternativas:</strong>
                        <div className="d-flex flex-wrap gap-1 mt-1">
                          {intolerance.alternatives.map((alt: string, i: number) => (
                            <span key={i} className="badge bg-success text-white">{alt}</span>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {intolerance.preparation_notes && (
                      <div className="small text-muted">
                        <strong>Preparación:</strong> {intolerance.preparation_notes}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Medicamentos */}
        <div className="col-md-6 mb-4">
          <div className="card">
            <div className="card-header">
              <h6 className="mb-0">
                <Settings size={16} className="me-2" />
                Medicamentos
              </h6>
            </div>
            <div className="card-body">
              {medications.length === 0 ? (
                <p className="text-muted">No se han registrado medicamentos</p>
              ) : (
                medications.map((medication: any, index: number) => (
                  <div key={index} className="border rounded p-3 mb-3">
                    <h6 className="mb-2">{medication.name}</h6>
                    <div className="row">
                      <div className="col-6">
                        <strong>Dosis:</strong> {medication.dosage}
                      </div>
                      <div className="col-6">
                        <strong>Frecuencia:</strong> {medication.frequency}
                      </div>
                    </div>
                    
                    {medication.food_interactions && medication.food_interactions.length > 0 && (
                      <div className="mt-2">
                        <strong>Interacciones:</strong>
                        <ul className="list-unstyled mt-1">
                          {medication.food_interactions.map((interaction: string, i: number) => (
                            <li key={i} className="small text-muted">• {interaction}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    {medication.timing_requirements && (
                      <div className="mt-2 small text-muted">
                        <strong>Timing:</strong> {medication.timing_requirements}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Consideraciones Especiales */}
        {special_considerations.length > 0 && (
          <div className="col-12 mb-4">
            <div className="card">
              <div className="card-header">
                <h6 className="mb-0">
                  <Settings size={16} className="me-2" />
                  Consideraciones Especiales
                </h6>
              </div>
              <div className="card-body">
                <ul className="list-unstyled">
                  {special_considerations.map((consideration: string, index: number) => (
                    <li key={index} className="mb-2">
                      <i className="fas fa-check-circle text-success me-2"></i>
                      {consideration}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Contactos de Emergencia */}
        {emergency_contacts.length > 0 && (
          <div className="col-12 mb-4">
            <div className="card">
              <div className="card-header">
                <h6 className="mb-0">
                  <AlertTriangle size={16} className="me-2" />
                  Contactos de Emergencia
                </h6>
              </div>
              <div className="card-body">
                <div className="row">
                  {emergency_contacts.map((contact: any, index: number) => (
                    <div key={index} className="col-md-6 mb-3">
                      <div className="border rounded p-3">
                        <div className="d-flex justify-content-between align-items-start">
                          <div>
                            <h6 className="mb-1">{contact.name}</h6>
                            <p className="text-muted mb-1">{contact.relationship}</p>
                            <p className="mb-0">
                              <i className="fas fa-phone me-1"></i>
                              {contact.phone}
                            </p>
                          </div>
                          {contact.is_primary && (
                            <span className="badge bg-danger">Principal</span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Guías de Seguridad */}
        {plan.safety_guidelines && (
          <div className="col-12">
            <div className="card">
              <div className="card-header">
                <h6 className="mb-0">
                  <Shield size={16} className="me-2" />
                  Guías de Seguridad
                </h6>
              </div>
              <div className="card-body">
                {plan.safety_guidelines.emergency_protocols && plan.safety_guidelines.emergency_protocols.length > 0 && (
                  <div className="mb-3">
                    <h6>Protocolos de Emergencia:</h6>
                    <ul className="list-unstyled">
                      {plan.safety_guidelines.emergency_protocols.map((protocol: string, index: number) => (
                        <li key={index} className="mb-1">
                          <i className="fas fa-exclamation-triangle text-warning me-2"></i>
                          {protocol}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {plan.safety_guidelines.monitoring_requirements && plan.safety_guidelines.monitoring_requirements.length > 0 && (
                  <div className="mb-3">
                    <h6>Requerimientos de Monitoreo:</h6>
                    <ul className="list-unstyled">
                      {plan.safety_guidelines.monitoring_requirements.map((req: string, index: number) => (
                        <li key={index} className="mb-1">
                          <i className="fas fa-clipboard-check text-info me-2"></i>
                          {req}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {plan.safety_guidelines.warning_signs && plan.safety_guidelines.warning_signs.length > 0 && (
                  <div className="mb-3">
                    <h6>Signos de Advertencia:</h6>
                    <ul className="list-unstyled">
                      {plan.safety_guidelines.warning_signs.map((sign: string, index: number) => (
                        <li key={index} className="mb-1">
                          <i className="fas fa-exclamation-circle text-danger me-2"></i>
                          {sign}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {plan.safety_guidelines.action_plan && (
                  <div>
                    <h6>Plan de Acción:</h6>
                    <div className="alert alert-info">
                      {plan.safety_guidelines.action_plan}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="diet-plan-viewer">
      <div className="card">
        <div className="card-header d-flex justify-content-between align-items-center">
          <h5 className="mb-0">
            <FileText size={20} className="me-2" />
            {plan.name}
          </h5>
          <div className="btn-group">
            {onEdit && (
              <button className="btn btn-outline-primary btn-sm" onClick={onEdit}>
                <Edit size={14} className="me-1" />
                Editar
              </button>
            )}
            {onDownload && (
              <button className="btn btn-outline-success btn-sm" onClick={onDownload}>
                <Download size={14} className="me-1" />
                Descargar
              </button>
            )}
            {onClose && (
              <button className="btn btn-outline-secondary btn-sm" onClick={onClose}>
                <X size={14} />
              </button>
            )}
          </div>
        </div>

        <div className="card-body">
          {/* Tabs */}
          <ul className="nav nav-tabs mb-4">
            <li className="nav-item">
              <button 
                className={`nav-link ${activeTab === 'overview' ? 'active' : ''}`}
                onClick={() => setActiveTab('overview')}
              >
                <FileText size={16} className="me-1" />
                Resumen
              </button>
            </li>
            <li className="nav-item">
              <button 
                className={`nav-link ${activeTab === 'meals' ? 'active' : ''}`}
                onClick={() => setActiveTab('meals')}
              >
                <Calendar size={16} className="me-1" />
                Comidas
              </button>
            </li>
            <li className="nav-item">
              <button 
                className={`nav-link ${activeTab === 'nutrition' ? 'active' : ''}`}
                onClick={() => setActiveTab('nutrition')}
              >
                <Target size={16} className="me-1" />
                Nutrición
              </button>
            </li>
            <li className="nav-item">
              <button 
                className={`nav-link ${activeTab === 'schedule' ? 'active' : ''}`}
                onClick={() => setActiveTab('schedule')}
              >
                <Clock size={16} className="me-1" />
                Horarios
              </button>
            </li>
            <li className="nav-item">
              <button 
                className={`nav-link ${activeTab === 'restrictions' ? 'active' : ''}`}
                onClick={() => setActiveTab('restrictions')}
              >
                <Shield size={16} className="me-1" />
                Restricciones
              </button>
            </li>
          </ul>

          {/* Tab Content */}
          {activeTab === 'overview' && renderOverview()}
          {activeTab === 'meals' && (
            <div>
              {plan.plan_type === 'flexible' || plan.plan_type === 'custom' ? renderPeriodMeals() : renderWeeklyMeals()}
            </div>
          )}
          {activeTab === 'nutrition' && (
            <div>
              {renderMealConfiguration()}
              {renderFlexibilitySettings()}
            </div>
          )}
          {activeTab === 'schedule' && (
            <div>
              {renderMealConfiguration()}
            </div>
          )}
          {activeTab === 'restrictions' && renderPathologicalRestrictions()}
        </div>
      </div>
    </div>
  );
};

export default DietPlanViewer; 