import React from 'react';
import {
    Target,
    Droplet,
    Activity,
    PieChart,
    ArrowUpRight,
    Leaf
} from 'lucide-react';

interface SimpleNutritionTabProps {
    planData: any;
    updatePlanData: (field: string, value: any) => void;
    mode: 'create' | 'edit' | 'view';
    isLoading: boolean;
}

const SimpleNutritionTab: React.FC<SimpleNutritionTabProps> = ({
    planData,
    updatePlanData,
    mode,
    isLoading
}) => {

    // Calculate totals
    const totalCalc = (planData.dailyMacrosTarget.protein * 4) +
        (planData.dailyMacrosTarget.carbohydrates * 4) +
        (planData.dailyMacrosTarget.fats * 9);

    const proteinPct = Math.round((planData.dailyMacrosTarget.protein * 4 / planData.dailyCaloriesTarget) * 100) || 0;
    const carbsPct = Math.round((planData.dailyMacrosTarget.carbohydrates * 4 / planData.dailyCaloriesTarget) * 100) || 0;
    const fatsPct = Math.round((planData.dailyMacrosTarget.fats * 9 / planData.dailyCaloriesTarget) * 100) || 0;

    return (
        <div className="nutrition-tab fade-in">
            {/* Header Section */}
            <div className="d-flex align-items-center mb-4">
                <div className="bg-success bg-opacity-10 p-2 rounded-circle me-3">
                    <Target size={20} className="text-success" />
                </div>
                <h6 className="mb-0 fw-bold text-dark">Objetivos Nutricionales</h6>
            </div>

            <div className="row g-4">
                {/* Left Column: Macros Inputs */}
                <div className="col-lg-8">
                    <div className="card border-0 shadow-sm rounded-4 mb-4">
                        <div className="card-header bg-white border-bottom-0 pt-4 px-4 pb-0">
                            <h6 className="fw-bold text-dark mb-0">📊 Distribución de Macronutrientes</h6>
                        </div>
                        <div className="card-body p-4">
                            <div className="row g-4">
                                {/* Protein */}
                                <div className="col-md-4">
                                    <div className="d-flex align-items-center mb-2">
                                        <Activity size={16} className="text-danger me-2" />
                                        <label className="form-label mb-0 small fw-bold text-uppercase text-muted">Proteínas</label>
                                    </div>
                                    <div className="input-group mb-2 shadow-sm rounded-4 overflow-hidden">
                                        <input
                                            type="number"
                                            className="form-control border-0 bg-light py-2 fw-bold"
                                            value={planData.dailyMacrosTarget.protein}
                                            onChange={(e) => updatePlanData('dailyMacrosTarget', {
                                                ...planData.dailyMacrosTarget,
                                                protein: parseInt(e.target.value) || 0
                                            })}
                                            min="0"
                                            disabled={mode === 'view' || isLoading}
                                        />
                                        <span className="input-group-text border-0 bg-white text-muted small px-3">g</span>
                                    </div>
                                    <div className="progress" style={{ height: '6px' }}>
                                        <div className="progress-bar bg-danger" style={{ width: `${proteinPct}%` }}></div>
                                    </div>
                                    <small className="text-muted" style={{ fontSize: '0.75rem' }}>{proteinPct}% del total</small>
                                </div>

                                {/* Carbs */}
                                <div className="col-md-4">
                                    <div className="d-flex align-items-center mb-2">
                                        <Activity size={16} className="text-warning me-2" />
                                        <label className="form-label mb-0 small fw-bold text-uppercase text-muted">Carbohidratos</label>
                                    </div>
                                    <div className="input-group mb-2 shadow-sm rounded-4 overflow-hidden">
                                        <input
                                            type="number"
                                            className="form-control border-0 bg-light py-2 fw-bold"
                                            value={planData.dailyMacrosTarget.carbohydrates}
                                            onChange={(e) => updatePlanData('dailyMacrosTarget', {
                                                ...planData.dailyMacrosTarget,
                                                carbohydrates: parseInt(e.target.value) || 0
                                            })}
                                            min="0"
                                            disabled={mode === 'view' || isLoading}
                                        />
                                        <span className="input-group-text border-0 bg-white text-muted small px-3">g</span>
                                    </div>
                                    <div className="progress" style={{ height: '6px' }}>
                                        <div className="progress-bar bg-warning" style={{ width: `${carbsPct}%` }}></div>
                                    </div>
                                    <small className="text-muted" style={{ fontSize: '0.75rem' }}>{carbsPct}% del total</small>
                                </div>

                                {/* Fats */}
                                <div className="col-md-4">
                                    <div className="d-flex align-items-center mb-2">
                                        <Activity size={16} className="text-success me-2" />
                                        <label className="form-label mb-0 small fw-bold text-uppercase text-muted">Grasas</label>
                                    </div>
                                    <div className="input-group mb-2 shadow-sm rounded-4 overflow-hidden">
                                        <input
                                            type="number"
                                            className="form-control border-0 bg-light py-2 fw-bold"
                                            value={planData.dailyMacrosTarget.fats}
                                            onChange={(e) => updatePlanData('dailyMacrosTarget', {
                                                ...planData.dailyMacrosTarget,
                                                fats: parseInt(e.target.value) || 0
                                            })}
                                            min="0"
                                            disabled={mode === 'view' || isLoading}
                                        />
                                        <span className="input-group-text border-0 bg-white text-muted small px-3">g</span>
                                    </div>
                                    <div className="progress" style={{ height: '6px' }}>
                                        <div className="progress-bar bg-success" style={{ width: `${fatsPct}%` }}></div>
                                    </div>
                                    <small className="text-muted" style={{ fontSize: '0.75rem' }}>{fatsPct}% del total</small>
                                </div>
                            </div>

                            <div className="mt-4 p-3 bg-light rounded-4 border border-light">
                                <div className="d-flex justify-content-between align-items-center mb-2">
                                    <span className="small text-muted fw-medium">Total Calculado</span>
                                    <span className={`fw-bold ${totalCalc > planData.dailyCaloriesTarget ? 'text-danger' : 'text-dark'}`}>
                                        {totalCalc} kcal
                                    </span>
                                </div>
                                <div className="d-flex justify-content-between align-items-center">
                                    <span className="small text-muted fw-medium">Objetivo Diario</span>
                                    <span className="fw-bold text-primary">{planData.dailyCaloriesTarget} kcal</span>
                                </div>
                                <div className="progress mt-2" style={{ height: '8px' }}>
                                    <div
                                        className={`progress-bar ${totalCalc > planData.dailyCaloriesTarget ? 'bg-danger' : 'bg-primary'}`}
                                        style={{ width: `${Math.min((totalCalc / planData.dailyCaloriesTarget) * 100, 100)}%` }}
                                    ></div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="card border-0 shadow-sm rounded-4">
                        <div className="card-header bg-white border-bottom-0 pt-4 px-4 pb-0">
                            <div className="d-flex align-items-center">
                                <Droplet size={18} className="text-info me-2" />
                                <h6 className="fw-bold text-dark mb-0">Hidratación y Fibra</h6>
                            </div>
                        </div>
                        <div className="card-body p-4">
                            <div className="row g-4">
                                <div className="col-md-6">
                                    <label className="form-label text-muted small fw-bold">Agua Diaria (Litros)</label>
                                    <div className="input-group shadow-sm rounded-4 overflow-hidden">
                                        <input
                                            type="number"
                                            className="form-control border-0 bg-light py-2"
                                            value={planData.waterIntake || 2.5}
                                            onChange={(e) => updatePlanData('waterIntake', parseFloat(e.target.value) || 0)}
                                            step="0.1"
                                            disabled={mode === 'view' || isLoading}
                                        />
                                        <span className="input-group-text border-0 bg-white text-info"><Droplet size={16} /></span>
                                    </div>
                                </div>
                                <div className="col-md-6">
                                    <label className="form-label text-muted small fw-bold">Fibra (g)</label>
                                    <div className="input-group shadow-sm rounded-4 overflow-hidden">
                                        <input
                                            type="number"
                                            className="form-control border-0 bg-light py-2"
                                            value={planData.fiberTarget || 25}
                                            onChange={(e) => updatePlanData('fiberTarget', parseInt(e.target.value) || 0)}
                                            disabled={mode === 'view' || isLoading}
                                        />
                                        <span className="input-group-text border-0 bg-white text-success"><Leaf size={16} /></span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column: Visual Chart/Summary */}
                <div className="col-lg-4">
                    <div className="card border-0 shadow-sm rounded-4 h-100 bg-primary bg-opacity-10">
                        <div className="card-header bg-transparent border-bottom-0 pt-4 px-4 pb-0">
                            <h6 className="fw-bold text-primary mb-0">📈 Resumen Visual</h6>
                        </div>
                        <div className="card-body p-4 d-flex flex-column justify-content-center">
                            <div className="text-center mb-4 position-relative">
                                {/* Simple Pizza Chart representation using CSS conic-gradient */}
                                <div
                                    className="rounded-circle mx-auto shadow-sm border border-4 border-white"
                                    style={{
                                        width: '180px',
                                        height: '180px',
                                        background: `conic-gradient(
                                            #dc3545 0% ${proteinPct}%, 
                                            #ffc107 ${proteinPct}% ${proteinPct + carbsPct}%, 
                                            #198754 ${proteinPct + carbsPct}% 100%
                                        )`
                                    }}
                                >
                                    <div className="d-flex align-items-center justify-content-center h-100 w-100 bg-white rounded-circle position-absolute top-50 start-50 translate-middle" style={{ width: '120px', height: '120px', opacity: 0.9 }}>
                                        <div className="text-center">
                                            <span className="d-block text-secondary small">Total</span>
                                            <span className="d-block fw-bold display-6 mb-0 text-dark">{planData.dailyCaloriesTarget}</span>
                                            <span className="d-block text-muted small">kcal</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white rounded-4 p-3 shadow-sm">
                                <div className="d-flex justify-content-between align-items-center mb-2 pb-2 border-bottom border-light">
                                    <div className="d-flex align-items-center">
                                        <span className="badge bg-danger rounded-circle p-1 me-2"> </span>
                                        <span className="small fw-bold">Proteínas</span>
                                    </div>
                                    <span className="small fw-bold">{planData.dailyMacrosTarget.protein}g</span>
                                </div>
                                <div className="d-flex justify-content-between align-items-center mb-2 pb-2 border-bottom border-light">
                                    <div className="d-flex align-items-center">
                                        <span className="badge bg-warning rounded-circle p-1 me-2"> </span>
                                        <span className="small fw-bold">Carbohidratos</span>
                                    </div>
                                    <span className="small fw-bold">{planData.dailyMacrosTarget.carbohydrates}g</span>
                                </div>
                                <div className="d-flex justify-content-between align-items-center">
                                    <div className="d-flex align-items-center">
                                        <span className="badge bg-success rounded-circle p-1 me-2"> </span>
                                        <span className="small fw-bold">Grasas</span>
                                    </div>
                                    <span className="small fw-bold">{planData.dailyMacrosTarget.fats}g</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SimpleNutritionTab;
