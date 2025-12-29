import React from 'react';
import {
    Clock,
    Calendar,
    Sunrise,
    Sun,
    Coffee,
    Moon,
    AlertCircle,
    CheckCircle
} from 'lucide-react';

interface SimpleScheduleTabProps {
    planData: any;
    updatePlanData: (field: string, value: any) => void;
    mode: 'create' | 'edit' | 'view';
    isLoading: boolean;
}

const SimpleScheduleTab: React.FC<SimpleScheduleTabProps> = ({
    planData,
    updatePlanData,
    mode,
    isLoading
}) => {

    // Configuración de comidas basada en mealsPerDay
    const mealsConfig = [
        { key: 'breakfast', label: 'Desayuno', icon: Sunrise, color: 'warning', default: '07:00' },
        { key: 'midMorning', label: 'Media Mañana', icon: Coffee, color: 'info', default: '10:00' },
        { key: 'lunch', label: 'Almuerzo', icon: Sun, color: 'primary', default: '13:00' },
        { key: 'snack', label: 'Merienda', icon: Coffee, color: 'success', default: '16:00' },
        { key: 'dinner', label: 'Cena', icon: Moon, color: 'dark', default: '19:00' }
    ].filter(meal => {
        const meals = planData.mealsPerDay || 5;
        if (meals === 3) return ['breakfast', 'lunch', 'dinner'].includes(meal.key);
        if (meals === 4) return ['breakfast', 'midMorning', 'lunch', 'dinner'].includes(meal.key);
        // meals === 5 or 6 returns all
        return true;
    });

    const getCaloriesForMeal = (mealKey: string) => {
        const total = planData.dailyCaloriesTarget || 2000;
        switch (mealKey) {
            case 'breakfast': return Math.round(total * 0.25);
            case 'midMorning': return Math.round(total * 0.10);
            case 'lunch': return Math.round(total * 0.35);
            case 'snack': return Math.round(total * 0.10);
            case 'dinner': return Math.round(total * 0.20);
            default: return 0;
        }
    };

    return (
        <div className="schedule-tab fade-in">
            {/* Header Section */}
            <div className="d-flex align-items-center mb-4">
                <div className="bg-info bg-opacity-10 p-2 rounded-circle me-3">
                    <Clock size={20} className="text-info" />
                </div>
                <h6 className="mb-0 fw-bold text-dark">Horarios de Comidas</h6>
            </div>

            <div className="row g-4">
                <div className="col-lg-8">
                    <div className="card border-0 shadow-sm rounded-4 mb-4">
                        <div className="card-header bg-white border-bottom-0 pt-4 px-4 pb-0">
                            <h6 className="fw-bold text-dark mb-0">📅 Horarios Detallados</h6>
                        </div>
                        <div className="card-body p-4">
                            <div className="row g-4">
                                {mealsConfig.map((meal) => (
                                    <div key={meal.key} className="col-md-6">
                                        <div className="d-flex align-items-center mb-2">
                                            <meal.icon size={16} className={`text-${meal.color} me-2`} />
                                            <h6 className="mb-0 fw-bold text-dark small text-uppercase">{meal.label}</h6>
                                        </div>
                                        <div className="input-group mb-1 shadow-sm rounded-4 overflow-hidden">
                                            <input
                                                type="time"
                                                className="form-control border-0 bg-light py-2"
                                                style={{ fontSize: '1.1rem', fontWeight: 500 }}
                                                value={planData.mealTimes?.[meal.key] || meal.default}
                                                onChange={(e) => updatePlanData('mealTimes', {
                                                    ...planData.mealTimes,
                                                    [meal.key]: e.target.value
                                                })}
                                                disabled={mode === 'view' || isLoading}
                                            />
                                            <span className="input-group-text border-0 bg-white text-muted small fw-medium px-3">
                                                {getCaloriesForMeal(meal.key)} kcal
                                            </span>
                                        </div>
                                        <small className="text-muted" style={{ fontSize: '0.75rem' }}>
                                            {meal.key === 'breakfast' && 'Ayuno nocturno: 8-10 horas'}
                                            {meal.key === 'lunch' && 'Comida principal del día'}
                                            {meal.key === 'dinner' && '3 horas antes de dormir'}
                                            {(meal.key === 'midMorning' || meal.key === 'snack') && 'Intervalo: 3 horas'}
                                        </small>
                                    </div>
                                ))}

                                <div className="col-md-6">
                                    <div className="d-flex align-items-center mb-2">
                                        <Moon size={16} className="text-secondary me-2" />
                                        <h6 className="mb-0 fw-bold text-dark small text-uppercase">Hora de Dormir</h6>
                                    </div>
                                    <div className="input-group mb-1 shadow-sm rounded-4 overflow-hidden">
                                        <input
                                            type="time"
                                            className="form-control border-0 bg-light py-2"
                                            style={{ fontSize: '1.1rem', fontWeight: 500 }}
                                            value={planData.bedTime || '22:00'}
                                            onChange={(e) => updatePlanData('bedTime', e.target.value)}
                                            disabled={mode === 'view' || isLoading}
                                        />
                                        <span className="input-group-text border-0 bg-white text-muted">
                                            <Clock size={16} />
                                        </span>
                                    </div>
                                    <small className="text-muted" style={{ fontSize: '0.75rem' }}>Para calcular ayuno nocturno</small>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="col-lg-4">
                    <div className="card border-0 shadow-sm rounded-4 h-100">
                        <div className="card-header bg-white border-bottom-0 pt-4 px-4 pb-0">
                            <h6 className="fw-bold text-dark mb-0">📊 Análisis de Intervalos</h6>
                        </div>
                        <div className="card-body p-4">
                            <div className="mb-4">
                                <h6 className="text-primary small fw-bold mb-3 text-uppercase">⏰ Timeline del día</h6>
                                <div className="d-flex flex-column gap-2">
                                    {mealsConfig.map((meal, index) => (
                                        <div key={index} className="d-flex justify-content-between align-items-center p-2 rounded hover-bg-light transition-all">
                                            <div className="d-flex align-items-center">
                                                <meal.icon size={14} className={`text-${meal.color} me-2`} />
                                                <span className="small text-secondary">{meal.label}</span>
                                            </div>
                                            <span className="fw-bold small">{planData.mealTimes?.[meal.key] || meal.default}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="bg-success bg-opacity-10 p-3 rounded-4 border border-success border-opacity-10">
                                <div className="d-flex align-items-center mb-2">
                                    <CheckCircle size={16} className="text-success me-2" />
                                    <h6 className="text-success fw-bold mb-0 small">Recomendaciones</h6>
                                </div>
                                <ul className="mb-0 ps-3 small text-secondary">
                                    <li>Intervalos de 3-4 horas entre comidas</li>
                                    <li>Última comida 3h antes de dormir</li>
                                    <li>Desayuno dentro de 1h de despertar</li>
                                    <li>Hidratación constante entre comidas</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SimpleScheduleTab;
