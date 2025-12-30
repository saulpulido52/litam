import React from 'react';
import {
    Shield,
    AlertTriangle,
    AlertCircle,
    Activity,
    Info,
    Check,
    Pill,
    Users,
    XCircle
} from 'lucide-react';

interface SimpleRestrictionsTabProps {
    planData: any;
    updatePlanData: (field: string, value: any) => void;
    mode: 'create' | 'edit' | 'view';
    isLoading: boolean;
    clinicalRecord: any;
}

const SimpleRestrictionsTab: React.FC<SimpleRestrictionsTabProps> = ({
    planData,
    updatePlanData,
    mode,
    isLoading,
    clinicalRecord
}) => {
    return (
        <div className="restrictions-tab fade-in">
            {/* Header Section */}
            <div className="d-flex align-items-center mb-2">
                <div className="bg-danger bg-opacity-10 p-1 rounded-circle me-2">
                    <Shield size={16} className="text-danger" />
                </div>
                <h6 className="mb-0 fw-bold text-dark small">Restricciones y Seguridad</h6>
            </div>

            <div className="row g-2">
                {/* Left Col: Form */}
                <div className="col-lg-8">
                    {/* Restrictions Card */}
                    <div className="card border-0 shadow-sm rounded-3 mb-2">
                        <div className="card-header bg-white border-bottom-0 pt-2 px-3 pb-0">
                            <h6 className="fw-bold text-dark mb-0 small">🚫 Restricciones Alimentarias</h6>
                        </div>
                        <div className="card-body p-2">
                            <div className="row g-4">
                                <div className="col-md-6">
                                    <label className="form-label text-muted small fw-bold text-uppercase">Alergias Alimentarias</label>
                                    <div className="position-relative">
                                        <AlertCircle size={18} className="text-danger position-absolute top-0 end-0 mt-2 me-2" />
                                        <textarea
                                            className="form-control bg-light border-0 rounded-4 shadow-none p-3"
                                            rows={3}
                                            value={planData.foodAllergies || ''}
                                            onChange={(e) => updatePlanData('foodAllergies', e.target.value)}
                                            placeholder="Ej: Nueces, mariscos, gluten..."
                                            disabled={mode === 'view' || isLoading}
                                        />
                                    </div>
                                </div>
                                <div className="col-md-6">
                                    <label className="form-label text-muted small fw-bold text-uppercase">Intolerancias</label>
                                    <div className="position-relative">
                                        <XCircle size={18} className="text-warning position-absolute top-0 end-0 mt-2 me-2" />
                                        <textarea
                                            className="form-control bg-light border-0 rounded-4 shadow-none p-3"
                                            rows={3}
                                            value={planData.foodIntolerances || ''}
                                            onChange={(e) => updatePlanData('foodIntolerances', e.target.value)}
                                            placeholder="Ej: Lactosa, fructosa..."
                                            disabled={mode === 'view' || isLoading}
                                        />
                                    </div>
                                </div>
                                <div className="col-md-6">
                                    <label className="form-label text-muted small fw-bold text-uppercase">Condiciones Médicas</label>
                                    <div className="position-relative">
                                        <Activity size={18} className="text-primary position-absolute top-0 end-0 mt-2 me-2" />
                                        <textarea
                                            className="form-control bg-light border-0 rounded-4 shadow-none p-3"
                                            rows={3}
                                            value={planData.medicalConditions || ''}
                                            onChange={(e) => updatePlanData('medicalConditions', e.target.value)}
                                            placeholder="Ej: Diabetes, hipertensión..."
                                            disabled={mode === 'view' || isLoading}
                                        />
                                    </div>
                                </div>
                                <div className="col-md-6">
                                    <label className="form-label text-muted small fw-bold text-uppercase">Medicamentos</label>
                                    <div className="position-relative">
                                        <Pill size={18} className="text-info position-absolute top-0 end-0 mt-2 me-2" />
                                        <textarea
                                            className="form-control bg-light border-0 rounded-4 shadow-none p-3"
                                            rows={3}
                                            value={planData.medications || ''}
                                            onChange={(e) => updatePlanData('medications', e.target.value)}
                                            placeholder="Medicamentos actuales..."
                                            disabled={mode === 'view' || isLoading}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Preferences Card */}
                    <div className="card border-0 shadow-sm rounded-4">
                        <div className="card-header bg-white border-bottom-0 pt-4 px-4 pb-0">
                            <h6 className="fw-bold text-dark mb-0">🥗 Preferencias Dietéticas</h6>
                        </div>
                        <div className="card-body p-4">
                            <div className="row g-3">
                                {[
                                    { key: 'isVegetarian', label: '🥬 Vegetariano' },
                                    { key: 'isVegan', label: '🌱 Vegano' },
                                    { key: 'isGlutenFree', label: '🚫 Sin Gluten' },
                                    { key: 'isLactoseFree', label: '🥛 Sin Lactosa' },
                                    { key: 'isKeto', label: '🥑 Cetogénico' },
                                    { key: 'isLowSodium', label: '🧂 Bajo en Sodio' }
                                ].map((pref) => (
                                    <div key={pref.key} className="col-md-4">
                                        <div className="form-check form-switch p-3 bg-light rounded-4 d-flex justify-content-between align-items-center ps-4 m-0">
                                            <label className="form-check-label fw-medium small mb-0 flex-grow-1 cursor-pointer" htmlFor={pref.key}>
                                                {pref.label}
                                            </label>
                                            <input
                                                className="form-check-input ms-2"
                                                type="checkbox"
                                                id={pref.key}
                                                checked={planData[pref.key] || false}
                                                onChange={(e) => updatePlanData(pref.key, e.target.checked)}
                                                disabled={mode === 'view' || isLoading}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Col: Clinical Record Info */}
                <div className="col-lg-4">
                    <div className="card border-0 shadow-sm rounded-4 h-100 bg-warning bg-opacity-10">
                        <div className="card-header bg-transparent border-bottom-0 pt-4 px-4 pb-0">
                            <div className="d-flex align-items-center mb-2">
                                <AlertTriangle size={20} className="text-warning me-2" />
                                <h6 className="fw-bold text-dark mb-0">Alertas de Seguridad</h6>
                            </div>
                        </div>
                        <div className="card-body p-4">
                            <div className="bg-white rounded-4 p-3 shadow-sm mb-4">
                                <h6 className="text-warning small fw-bold mb-2">🚨 Importante</h6>
                                <ul className="mb-0 ps-3 small text-secondary">
                                    <li className="mb-1">Verificar alergias antes de confirmar</li>
                                    <li className="mb-1">Consultar condiciones serias</li>
                                    <li>Revisar interacciones fármaco-nutriente</li>
                                </ul>
                            </div>

                            {clinicalRecord ? (
                                <div className="d-flex flex-column gap-3">
                                    <div className="d-flex align-items-center justify-content-between">
                                        <span className="badge bg-white text-secondary shadow-sm rounded-pill px-3 py-2">
                                            📋 Expediente Clínico
                                        </span>
                                        <small className="text-muted fw-bold">
                                            {new Date(clinicalRecord.record_date || clinicalRecord.created_at).toLocaleDateString('es-ES')}
                                        </small>
                                    </div>

                                    {/* Diagnosis */}
                                    {clinicalRecord.nutritional_diagnosis && (
                                        <div className="bg-white p-3 rounded-4 shadow-sm border border-success border-opacity-25">
                                            <div className="d-flex align-items-center mb-2">
                                                <Activity size={16} className="text-success me-2" />
                                                <small className="fw-bold text-success text-uppercase">Diagnóstico</small>
                                            </div>
                                            <p className="mb-0 small text-dark opacity-75 lh-sm">
                                                {clinicalRecord.nutritional_diagnosis}
                                            </p>
                                        </div>
                                    )}

                                    {/* Allergies from Record */}
                                    {clinicalRecord.dietary_history?.malestar_alergia_foods?.length > 0 && (
                                        <div className="bg-white p-3 rounded-4 shadow-sm border border-danger border-opacity-25">
                                            <div className="d-flex align-items-center mb-2">
                                                <AlertCircle size={16} className="text-danger me-2" />
                                                <small className="fw-bold text-danger text-uppercase">Alergias Registradas</small>
                                            </div>
                                            <div className="d-flex flex-wrap gap-1">
                                                {clinicalRecord.dietary_history.malestar_alergia_foods.map((allergy: any, idx: number) => (
                                                    <span key={idx} className="badge bg-danger bg-opacity-10 text-danger rounded-pill">
                                                        {allergy}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Medications from Record */}
                                    {clinicalRecord.diagnosed_diseases?.medications_list?.length > 0 && (
                                        <div className="bg-white p-3 rounded-4 shadow-sm border border-info border-opacity-25">
                                            <div className="d-flex align-items-center mb-2">
                                                <Pill size={16} className="text-info me-2" />
                                                <small className="fw-bold text-info text-uppercase">Medicamentos</small>
                                            </div>
                                            <ul className="mb-0 ps-3 small text-secondary">
                                                {clinicalRecord.diagnosed_diseases.medications_list.map((med: any, idx: number) => (
                                                    <li key={idx}>{med}</li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}

                                    {/* Family History */}
                                    {clinicalRecord.family_medical_history && Object.values(clinicalRecord.family_medical_history).some((v: any) => v === true || v?.length > 0) && (
                                        <div className="bg-white p-3 rounded-4 shadow-sm border border-primary border-opacity-25">
                                            <div className="d-flex align-items-center mb-2">
                                                <Users size={16} className="text-primary me-2" />
                                                <small className="fw-bold text-primary text-uppercase">Antecedentes</small>
                                            </div>
                                            <div className="d-flex flex-wrap gap-1">
                                                {clinicalRecord.family_medical_history.diabetes && <span className="badge bg-primary bg-opacity-10 text-primary">Diabetes</span>}
                                                {clinicalRecord.family_medical_history.hta && <span className="badge bg-primary bg-opacity-10 text-primary">HTA</span>}
                                                {clinicalRecord.family_medical_history.obesity && <span className="badge bg-primary bg-opacity-10 text-primary">Obesidad</span>}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="text-center p-4 bg-white rounded-4 shadow-sm opacity-50">
                                    <Info size={32} className="text-secondary mb-2" />
                                    <p className="small text-muted mb-0">Sin expediente clínico vinculado para mostrar alertas automáticas.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SimpleRestrictionsTab;
