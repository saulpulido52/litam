import React from 'react';
import {
    User, Calendar, Activity, Info,
    CheckCircle, Scale, FileText,
    Flame, Droplet, Utensils, Clock
} from 'lucide-react';

interface SimpleSummaryTabProps {
    planData: any;
    updatePlanData: (field: string, value: any) => void;
    mode: 'create' | 'edit' | 'view';
    isLoading: boolean;
    patients: any[];
    patient: any;
    selectedPatient: any;
    clinicalRecord: any;
    recommendationsApplied: boolean;
}

const SimpleSummaryTab: React.FC<SimpleSummaryTabProps> = ({
    planData,
    updatePlanData,
    mode,
    isLoading,
    patients,
    patient,
    selectedPatient,
    clinicalRecord,
    recommendationsApplied
}) => {

    // Helper para porcentaje de macros
    const getMacroPercent = (grams: number, caloriesPerGram: number) => {
        if (!planData.dailyCaloriesTarget) return 0;
        return Math.round((grams * caloriesPerGram / planData.dailyCaloriesTarget) * 100);
    };

    const proteinPercent = getMacroPercent(planData.dailyMacrosTarget?.protein || 0, 4);
    const carbsPercent = getMacroPercent(planData.dailyMacrosTarget?.carbohydrates || 0, 4);
    const fatsPercent = getMacroPercent(planData.dailyMacrosTarget?.fats || 0, 9);

    const totalCalculatedCalories =
        ((planData.dailyMacrosTarget?.protein || 0) * 4) +
        ((planData.dailyMacrosTarget?.carbohydrates || 0) * 4) +
        ((planData.dailyMacrosTarget?.fats || 0) * 9);

    const calorieDiff = Math.abs(totalCalculatedCalories - planData.dailyCaloriesTarget);
    const isCalorieMatch = calorieDiff <= 50;

    return (
        <div className="summary-tab fade-in">
            {/* Header Section */}
            <div className="d-flex align-items-center mb-2">
                <div className="bg-primary bg-opacity-10 p-1 rounded-circle me-2">
                    <FileText size={16} className="text-primary" />
                </div>
                <h6 className="mb-0 fw-bold text-dark small">Información General del Plan</h6>
            </div>

            {/* Smart Alerts */}
            {clinicalRecord && selectedPatient && mode === 'create' && (
                <div className={`card border - 0 shadow - sm mb - 4 overflow - hidden ${recommendationsApplied ? 'bg-success bg-opacity-10' : 'bg-info bg-opacity-10'} `}>
                    <div className="card-body position-relative">
                        <div className="d-flex">
                            <div className={`rounded - circle p - 3 me - 3 d - flex align - items - center justify - content - center ${recommendationsApplied ? 'bg-white text-success' : 'bg-white text-info'} `} style={{ width: '50px', height: '50px' }}>
                                {recommendationsApplied ? <CheckCircle size={24} /> : <Info size={24} />}
                            </div>
                            <div className="flex-grow-1">
                                <h6 className={`fw - bold mb - 1 ${recommendationsApplied ? 'text-success' : 'text-info'} `}>
                                    {recommendationsApplied ? 'Recomendaciones Aplicadas' : 'Expediente Clínico Disponible'}
                                </h6>
                                <p className="mb-3 text-secondary small" style={{ maxWidth: '90%' }}>
                                    {recommendationsApplied ?
                                        `Se han optimizado las calorías y restricciones nutriocionales basándose en el expediente clínico de ${selectedPatient.first_name}.` :
                                        `Existe un expediente clínico reciente.Los datos se sincronizarán automáticamente.`
                                    }
                                </p>

                                <div className="d-flex gap-3 flex-wrap">
                                    <span className="badge bg-white text-secondary border border-light shadow-sm d-flex align-items-center px-3 py-2 rounded-pill">
                                        <Calendar size={14} className="me-2" />
                                        {new Date(clinicalRecord.record_date || clinicalRecord.created_at).toLocaleDateString('es-ES')}
                                    </span>
                                    {clinicalRecord.anthropometric_measurements?.current_weight_kg && (
                                        <span className="badge bg-white text-secondary border border-light shadow-sm d-flex align-items-center px-3 py-2 rounded-pill">
                                            <Scale size={14} className="me-2" />
                                            {clinicalRecord.anthropometric_measurements.current_weight_kg} kg
                                        </span>
                                    )}
                                    {clinicalRecord.nutritional_diagnosis && (
                                        <span className="badge bg-white text-secondary border border-light shadow-sm d-flex align-items-center px-3 py-2 rounded-pill">
                                            <Activity size={14} className="me-2" />
                                            {clinicalRecord.nutritional_diagnosis}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {!clinicalRecord && selectedPatient && mode === 'create' && (
                <div className="alert alert-light border-0 shadow-sm mb-4 d-flex align-items-center">
                    <Info className="text-muted me-3" size={20} />
                    <small className="text-muted">
                        Ayuda: Considere crear un expediente clínico previo para obtener cálculos automáticos personalizados.
                    </small>
                </div>
            )}

            <div className="row g-2">
                {/* Left Column: Form Inputs */}
                <div className="col-lg-8">

                    {/* Basic Data Card */}
                    <div className="card border-0 shadow-sm rounded-3 mb-2">
                        <div className="card-header bg-white border-bottom-0 pt-2 px-3 pb-0">
                            <h6 className="fw-bold text-dark mb-0 small">📝 Datos Básicos</h6>
                        </div>
                        <div className="card-body p-2">
                            <div className="mb-2">
                                <label className="form-label text-muted small fw-bold text-uppercase" style={{ fontSize: '0.7rem' }}>Paciente Asignado</label>
                                <div className="input-group">
                                    <span className="input-group-text bg-light border-end-0 rounded-start-pill ps-3">
                                        <User size={18} className="text-muted" />
                                    </span>
                                    <select
                                        className="form-select form-select-lg border-start-0 bg-light rounded-end-pill shadow-none"
                                        style={{ fontSize: '0.95rem' }}
                                        value={planData.patientId || patient?.id || patient?.user?.id || ''}
                                        onChange={(e) => updatePlanData('patientId', e.target.value)}
                                        disabled={mode === 'view' || isLoading}
                                        required
                                    >
                                        <option value="">Seleccionar paciente...</option>
                                        {patients.map((p) => (
                                            <option key={p.id} value={p.id}>
                                                {p.first_name} {p.last_name} ({p.email})
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="row g-2 mb-2">
                                <div className="col-md-12">
                                    <div className="form-floating">
                                        <input
                                            type="text"
                                            className="form-control bg-light border-0 rounded-4"
                                            id="planName"
                                            placeholder="Nombre del Plan"
                                            value={planData.name}
                                            onChange={(e) => updatePlanData('name', e.target.value)}
                                            disabled={mode === 'view' || isLoading}
                                        />
                                        <label htmlFor="planName">Nombre del Plan (Ej. Definición 2024)</label>
                                    </div>
                                </div>
                                <div className="col-md-12">
                                    <div className="form-floating">
                                        <textarea
                                            className="form-control bg-light border-0 rounded-4"
                                            id="planDesc"
                                            placeholder="Descripción"
                                            style={{ height: '100px' }}
                                            value={planData.description}
                                            onChange={(e) => updatePlanData('description', e.target.value)}
                                            disabled={mode === 'view' || isLoading}
                                        ></textarea>
                                        <label htmlFor="planDesc">Descripción Detallada</label>
                                    </div>
                                </div>
                            </div>

                            <div className="row g-2">
                                <div className="col-md-6">
                                    <label className="form-label text-muted small fw-bold text-uppercase">Fecha Inicio</label>
                                    <div className="input-group">
                                        <span className="input-group-text bg-light border-end-0 rounded-start-pill ps-3">
                                            <Calendar size={18} className="text-muted" />
                                        </span>
                                        <input
                                            type="date"
                                            className="form-control bg-light border-start-0 rounded-end-pill shadow-none"
                                            value={planData.startDate}
                                            onChange={(e) => updatePlanData('startDate', e.target.value)}
                                            disabled={mode === 'view' || isLoading}
                                        />
                                    </div>
                                </div>
                                <div className="col-md-6">
                                    <label className="form-label text-muted small fw-bold text-uppercase">Duración</label>
                                    <div className="input-group">
                                        <span className="input-group-text bg-light border-end-0 rounded-start-pill ps-3">
                                            <Clock size={18} className="text-muted" />
                                        </span>
                                        <select
                                            className="form-select bg-light border-start-0 rounded-end-pill shadow-none"
                                            value={planData.totalWeeks}
                                            onChange={(e) => updatePlanData('totalWeeks', parseInt(e.target.value))}
                                            disabled={mode === 'view' || isLoading}
                                        >
                                            {[1, 2, 3, 4, 6, 8, 12, 16, 24].map(w => (
                                                <option key={w} value={w}>{w} Semanas ({w * 7} días)</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Macronutrients Card */}
                    <div className="card border-0 shadow-sm rounded-3">
                        <div className="card-header bg-white border-bottom-0 pt-2 px-3 pb-0 d-flex justify-content-between align-items-center">
                            <h6 className="fw-bold text-dark mb-0 small">🎯 Objetivos Nutricionales</h6>
                            <div className={`badge rounded - pill px - 3 py - 2 ${isCalorieMatch ? 'bg-success bg-opacity-10 text-success' : 'bg-warning bg-opacity-10 text-warning'} `}>
                                {isCalorieMatch ? 'Balanceado' : 'Revisar Balance'}
                            </div>
                        </div>
                        <div className="card-body p-2">
                            <div className="mb-2 text-center">
                                <label className="form-label text-muted small fw-bold text-uppercase">Calorías Diarias</label>
                                <div className="d-flex justify-content-center align-items-center">
                                    <button
                                        type="button"
                                        className="btn btn-sm btn-light rounded-circle shadow-none me-2"
                                        onClick={() => updatePlanData('dailyCaloriesTarget', Math.max(1000, planData.dailyCaloriesTarget - 50))}
                                        disabled={mode === 'view'}
                                    >−</button>
                                    <div className="position-relative" style={{ width: '180px' }}>
                                        <input
                                            type="number"
                                            className="form-control form-control-lg text-center fs-2 fw-bold border-0 bg-transparent shadow-none p-0"
                                            value={planData.dailyCaloriesTarget}
                                            onChange={(e) => updatePlanData('dailyCaloriesTarget', parseInt(e.target.value) || 0)}
                                            step="50"
                                            disabled={mode === 'view'}
                                        />
                                        <span className="text-muted small d-block">kcal / día</span>
                                    </div>
                                    <button
                                        type="button"
                                        className="btn btn-sm btn-light rounded-circle shadow-none ms-2"
                                        onClick={() => updatePlanData('dailyCaloriesTarget', planData.dailyCaloriesTarget + 50)}
                                        disabled={mode === 'view'}
                                    >+</button>
                                </div>
                            </div>

                            <div className="row g-2">
                                {/* Protein */}
                                <div className="col-md-4">
                                    <div className="p-3 bg-danger bg-opacity-10 rounded-4 text-center h-100 border border-danger border-opacity-10 transition-hover">
                                        <div className="d-flex justify-content-center mb-2">
                                            <div className="bg-white p-2 rounded-circle shadow-sm">
                                                <Utensils size={18} className="text-danger" />
                                            </div>
                                        </div>
                                        <h6 className="text-danger fw-bold mb-1">Proteínas</h6>
                                        <input
                                            type="number"
                                            className="form-control form-control-sm text-center border-0 bg-transparent fw-bold fs-5 shadow-none p-0 mb-1"
                                            value={planData.dailyMacrosTarget.protein}
                                            onChange={(e) => updatePlanData('dailyMacrosTarget', {
                                                ...planData.dailyMacrosTarget,
                                                protein: parseInt(e.target.value) || 0
                                            })}
                                        />
                                        <small className="text-dark opacity-50 d-block mb-1">gramos</small>
                                        <span className="badge bg-white text-danger shadow-sm rounded-pill">{proteinPercent}%</span>
                                    </div>
                                </div>

                                {/* Carbs */}
                                <div className="col-md-4">
                                    <div className="p-3 bg-warning bg-opacity-10 rounded-4 text-center h-100 border border-warning border-opacity-10 transition-hover">
                                        <div className="d-flex justify-content-center mb-2">
                                            <div className="bg-white p-2 rounded-circle shadow-sm">
                                                <Flame size={18} className="text-warning" />
                                            </div>
                                        </div>
                                        <h6 className="text-warning fw-bold mb-1">Carbohidratos</h6>
                                        <input
                                            type="number"
                                            className="form-control form-control-sm text-center border-0 bg-transparent fw-bold fs-5 shadow-none p-0 mb-1"
                                            value={planData.dailyMacrosTarget.carbohydrates}
                                            onChange={(e) => updatePlanData('dailyMacrosTarget', {
                                                ...planData.dailyMacrosTarget,
                                                carbohydrates: parseInt(e.target.value) || 0
                                            })}
                                        />
                                        <small className="text-dark opacity-50 d-block mb-1">gramos</small>
                                        <span className="badge bg-white text-warning shadow-sm rounded-pill">{carbsPercent}%</span>
                                    </div>
                                </div>

                                {/* Fats */}
                                <div className="col-md-4">
                                    <div className="p-3 bg-success bg-opacity-10 rounded-4 text-center h-100 border border-success border-opacity-10 transition-hover">
                                        <div className="d-flex justify-content-center mb-2">
                                            <div className="bg-white p-2 rounded-circle shadow-sm">
                                                <Droplet size={18} className="text-success" />
                                            </div>
                                        </div>
                                        <h6 className="text-success fw-bold mb-1">Grasas</h6>
                                        <input
                                            type="number"
                                            className="form-control form-control-sm text-center border-0 bg-transparent fw-bold fs-5 shadow-none p-0 mb-1"
                                            value={planData.dailyMacrosTarget.fats}
                                            onChange={(e) => updatePlanData('dailyMacrosTarget', {
                                                ...planData.dailyMacrosTarget,
                                                fats: parseInt(e.target.value) || 0
                                            })}
                                        />
                                        <small className="text-dark opacity-50 d-block mb-1">gramos</small>
                                        <span className="badge bg-white text-success shadow-sm rounded-pill">{fatsPercent}%</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column: Visual Summary */}
                <div className="col-lg-4">
                    {/* Visual Distribution */}
                    <div className="card border-0 shadow-sm rounded-3 mb-2 bg-primary text-white overflow-hidden position-relative">
                        <div className="position-absolute top-0 end-0 p-3 opacity-10">
                            <Activity size={100} />
                        </div>
                        <div className="card-body p-2 position-relative z-1">
                            <h6 className="text-white opacity-75 mb-2 small">Distribución Calórica</h6>
                            <div className="mb-2">
                                <div className="display-4 fw-bold">{planData.dailyCaloriesTarget}</div>
                                <div className="opacity-75">kcal totales</div>
                            </div>

                            <div className="progress rounded-pill bg-white bg-opacity-25 mb-3" style={{ height: '10px' }}>
                                <div className="progress-bar bg-white" style={{ width: `${proteinPercent}% `, opacity: 0.9 }}></div>
                                <div className="progress-bar bg-white" style={{ width: `${carbsPercent}% `, opacity: 0.6 }}></div>
                                <div className="progress-bar bg-white" style={{ width: `${fatsPercent}% `, opacity: 0.3 }}></div>
                            </div>

                            <div className="d-flex justify-content-between text-white small">
                                <div className="d-flex align-items-center">
                                    <div className="rounded-circle bg-white me-1" style={{ width: '8px', height: '8px', opacity: 0.9 }}></div>
                                    Proteína
                                </div>
                                <div className="d-flex align-items-center">
                                    <div className="rounded-circle bg-white me-1" style={{ width: '8px', height: '8px', opacity: 0.6 }}></div>
                                    Carbos
                                </div>
                                <div className="d-flex align-items-center">
                                    <div className="rounded-circle bg-white me-1" style={{ width: '8px', height: '8px', opacity: 0.3 }}></div>
                                    Grasas
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Patient Summary Card */}
                    {selectedPatient && (
                        <div className="card border-0 shadow-sm rounded-3">
                            <div className="card-header bg-white border-bottom-0 pt-2 px-3 pb-0">
                                <h6 className="fw-bold text-dark mb-0 small">👤 Contexto del Paciente</h6>
                            </div>
                            <div className="card-body p-2">
                                <div className="d-flex flex-column gap-2">
                                    <div className="d-flex align-items-center justify-content-between border-bottom pb-2">
                                        <span className="text-muted small">Nombre</span>
                                        <span className="fw-medium text-end text-truncate" style={{ maxWidth: '150px' }}>
                                            {selectedPatient.first_name} {selectedPatient.last_name}
                                        </span>
                                    </div>
                                    <div className="d-flex align-items-center justify-content-between border-bottom pb-2">
                                        <span className="text-muted small">Email</span>
                                        <span className="fw-medium text-end text-truncate" style={{ maxWidth: '150px' }}>
                                            {selectedPatient.email}
                                        </span>
                                    </div>
                                    <div className="d-flex align-items-center justify-content-between border-bottom pb-2">
                                        <span className="text-muted small">Edad</span>
                                        <span className="fw-medium">{selectedPatient.age || 'N/A'} años</span>
                                    </div>

                                    {clinicalRecord ? (
                                        <>
                                            <div className="d-flex align-items-center justify-content-between border-bottom pb-2">
                                                <span className="text-muted small">Diagnóstico</span>
                                                <span className="badge bg-primary bg-opacity-10 text-primary rounded-pill">
                                                    {clinicalRecord.nutritional_diagnosis || 'Sin diagnóstico'}
                                                </span>
                                            </div>
                                            <div className="d-flex align-items-center justify-content-between">
                                                <span className="text-muted small">Objetivo</span>
                                                <span className="fw-medium">{clinicalRecord.goals || 'Sin objetivo definido'}</span>
                                            </div>
                                        </>
                                    ) : (
                                        <div className="text-center bg-light rounded-3 p-3 mt-2">
                                            <small className="text-muted d-block">Sin expediente clínico vinculado</small>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SimpleSummaryTab;
