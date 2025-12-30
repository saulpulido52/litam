import React from 'react';
import {
    Clock,
    Utensils,
    Calendar,
    PieChart,
    Layout,
    Coffee,
    Sun,
    Moon,
    Sunrise
} from 'lucide-react';

interface SimpleMealsTabProps {
    planData: any;
    updatePlanData: (field: string, value: any) => void;
    mode: 'create' | 'edit' | 'view';
    isLoading: boolean;
}

const SimpleMealsTab: React.FC<SimpleMealsTabProps> = ({
    planData,
    updatePlanData,
    mode,
    isLoading
}) => {
    return (
        <div className="meals-tab fade-in">
            {/* Header Section */}
            <div className="d-flex align-items-center mb-2">
                <div className="bg-warning bg-opacity-10 p-1 rounded-circle me-2">
                    <Utensils size={16} className="text-warning" />
                </div>
                <h6 className="mb-0 fw-bold text-dark small">Planificación de Comidas</h6>
            </div>

            <div className="row g-2">
                {/* Left Column: Configuration */}
                <div className="col-lg-8">
                    {/* Structure Card */}
                    <div className="card border-0 shadow-sm rounded-3 mb-2">
                        <div className="card-header bg-white border-bottom-0 pt-2 px-3 pb-0">
                            <h6 className="fw-bold text-dark mb-0 small">📅 Estructura del Plan</h6>
                        </div>
                        <div className="card-body p-2">
                            <div className="row g-4">
                                <div className="col-md-6">
                                    <label className="form-label text-muted small fw-bold text-uppercase">Tipo de Plan</label>
                                    <div className="input-group">
                                        <span className="input-group-text bg-light border-end-0 rounded-start-pill ps-3">
                                            <Layout size={18} className="text-muted" />
                                        </span>
                                        <select
                                            className="form-select bg-light border-start-0 rounded-end-pill shadow-none"
                                            value={planData.planType || 'weekly'}
                                            onChange={(e) => updatePlanData('planType', e.target.value)}
                                            disabled={mode === 'view' || isLoading}
                                        >
                                            <option value="daily">Plan Diario</option>
                                            <option value="weekly">Plan Semanal</option>
                                            <option value="monthly">Plan Mensual</option>
                                            <option value="custom">Personalizado</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="col-md-6">
                                    <label className="form-label text-muted small fw-bold text-uppercase">Duración (semanas)</label>
                                    <div className="input-group">
                                        <span className="input-group-text bg-light border-end-0 rounded-start-pill ps-3">
                                            <Calendar size={18} className="text-muted" />
                                        </span>
                                        <input
                                            type="number"
                                            className="form-control bg-light border-start-0 rounded-end-pill shadow-none"
                                            value={planData.totalWeeks}
                                            onChange={(e) => updatePlanData('totalWeeks', parseInt(e.target.value) || 1)}
                                            min="1"
                                            max="52"
                                            disabled={mode === 'view' || isLoading}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Meals Config Card */}
                    <div className="card border-0 shadow-sm rounded-3">
                        <div className="card-header bg-white border-bottom-0 pt-2 px-3 pb-0">
                            <h6 className="fw-bold text-dark mb-0 small">🍽️ Configuración de Comidas</h6>
                        </div>
                        <div className="card-body p-2">
                            <div className="row g-4 mb-4">
                                <div className="col-md-6">
                                    <label className="form-label text-muted small fw-bold text-uppercase">Frecuencia</label>
                                    <div className="input-group">
                                        <span className="input-group-text bg-light border-end-0 rounded-start-pill ps-3">
                                            <Clock size={18} className="text-muted" />
                                        </span>
                                        <select
                                            className="form-select bg-light border-start-0 rounded-end-pill shadow-none"
                                            value={planData.mealsPerDay || 5}
                                            onChange={(e) => updatePlanData('mealsPerDay', parseInt(e.target.value))}
                                            disabled={mode === 'view' || isLoading}
                                        >
                                            <option value="3">3 comidas principales</option>
                                            <option value="4">4 comidas al día</option>
                                            <option value="5">5 comidas (recomendado)</option>
                                            <option value="6">6 comidas pequeñas</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="col-md-6">
                                    <label className="form-label text-muted small fw-bold text-uppercase">Distribución</label>
                                    <div className="input-group">
                                        <span className="input-group-text bg-light border-end-0 rounded-start-pill ps-3">
                                            <PieChart size={18} className="text-muted" />
                                        </span>
                                        <select
                                            className="form-select bg-light border-start-0 rounded-end-pill shadow-none"
                                            value={planData.calorieDistribution || 'balanced'}
                                            onChange={(e) => updatePlanData('calorieDistribution', e.target.value)}
                                            disabled={mode === 'view' || isLoading}
                                        >
                                            <option value="balanced">Balanceada</option>
                                            <option value="breakfast_heavy">Desayuno abundante</option>
                                            <option value="lunch_heavy">Almuerzo abundante</option>
                                            <option value="evening_light">Cenas ligeras</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-light bg-opacity-50 rounded-4 p-4 border border-light">
                                <h6 className="text-secondary small fw-bold mb-3 text-uppercase">Estructura Calórica Sugerida</h6>
                                <div className="row g-3">
                                    <div className="col-md-6">
                                        <div className="d-flex align-items-center mb-2">
                                            <div className="rounded-circle bg-warning bg-opacity-25 p-1 me-2"><Sunrise size={14} className="text-warning" /></div>
                                            <span className="small text-muted flex-grow-1">Desayuno (25%)</span>
                                            <span className="small fw-bold">{Math.round(planData.dailyCaloriesTarget * 0.25)} kcal</span>
                                        </div>
                                        <div className="d-flex align-items-center mb-2">
                                            <div className="rounded-circle bg-info bg-opacity-25 p-1 me-2"><Coffee size={14} className="text-info" /></div>
                                            <span className="small text-muted flex-grow-1">Media Mañana (10%)</span>
                                            <span className="small fw-bold">{Math.round(planData.dailyCaloriesTarget * 0.10)} kcal</span>
                                        </div>
                                        <div className="d-flex align-items-center">
                                            <div className="rounded-circle bg-primary bg-opacity-25 p-1 me-2"><Sun size={14} className="text-primary" /></div>
                                            <span className="small text-muted flex-grow-1">Almuerzo (35%)</span>
                                            <span className="small fw-bold">{Math.round(planData.dailyCaloriesTarget * 0.35)} kcal</span>
                                        </div>
                                    </div>
                                    <div className="col-md-6">
                                        <div className="d-flex align-items-center mb-2">
                                            <div className="rounded-circle bg-success bg-opacity-25 p-1 me-2"><Coffee size={14} className="text-success" /></div>
                                            <span className="small text-muted flex-grow-1">Merienda (10%)</span>
                                            <span className="small fw-bold">{Math.round(planData.dailyCaloriesTarget * 0.10)} kcal</span>
                                        </div>
                                        <div className="d-flex align-items-center">
                                            <div className="rounded-circle bg-dark bg-opacity-10 p-1 me-2"><Moon size={14} className="text-dark" /></div>
                                            <span className="small text-muted flex-grow-1">Cena (20%)</span>
                                            <span className="small fw-bold">{Math.round(planData.dailyCaloriesTarget * 0.20)} kcal</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column: Schedule */}
                <div className="col-lg-4">
                    <div className="card border-0 shadow-sm rounded-3 h-100">
                        <div className="card-header bg-white border-bottom-0 pt-2 px-3 pb-0">
                            <h6 className="fw-bold text-dark mb-0 small">⏰ Horarios Sugeridos</h6>
                        </div>
                        <div className="card-body p-2">
                            <div className="d-flex flex-column gap-3">
                                {[
                                    { label: 'Desayuno', key: 'breakfast', icon: Sunrise, color: 'warning', default: '07:00' },
                                    { label: 'Media Mañana', key: 'midMorning', icon: Coffee, color: 'info', default: '10:00' },
                                    { label: 'Almuerzo', key: 'lunch', icon: Sun, color: 'primary', default: '13:00' },
                                    { label: 'Merienda', key: 'snack', icon: Coffee, color: 'success', default: '16:00' },
                                    { label: 'Cena', key: 'dinner', icon: Moon, color: 'dark', default: '19:00' }
                                ].filter(meal => {
                                    const meals = planData.mealsPerDay || 5;
                                    if (meals === 3) return ['breakfast', 'lunch', 'dinner'].includes(meal.key);
                                    if (meals === 4) return ['breakfast', 'midMorning', 'lunch', 'dinner'].includes(meal.key);
                                    return true; // 5 or more
                                }).map((meal) => (
                                    <div key={meal.key} className="d-flex align-items-center justify-content-between p-3 bg-light rounded-4 border border-light transition-hover">
                                        <div className="d-flex align-items-center">
                                            <div className={`p-2 rounded-circle bg-${meal.color} bg-opacity-10 me-3`}>
                                                <meal.icon size={16} className={`text-${meal.color}`} />
                                            </div>
                                            <span className="fw-medium small">{meal.label}</span>
                                        </div>
                                        <input
                                            type="time"
                                            className="form-control form-control-sm border-0 bg-transparent text-end fw-bold shadow-none p-0"
                                            style={{ width: '70px' }}
                                            value={planData.mealTimes?.[meal.key] || meal.default}
                                            onChange={(e) => updatePlanData('mealTimes', {
                                                ...planData.mealTimes,
                                                [meal.key]: e.target.value
                                            })}
                                            disabled={mode === 'view' || isLoading}
                                        />
                                    </div>
                                ))}
                            </div>

                            <div className="mt-4 p-3 bg-secondary bg-opacity-10 rounded-4 d-flex align-items-start">
                                <Clock size={16} className="text-secondary mt-1 me-2 flex-shrink-0" />
                                <small className="text-secondary" style={{ fontSize: '0.8rem' }}>
                                    Estos horarios se utilizarán como referencia para enviar recordatorios al paciente si tiene la app móvil instalada.
                                </small>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SimpleMealsTab;
