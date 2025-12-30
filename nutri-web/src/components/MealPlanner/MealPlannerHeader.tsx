import React from 'react';
import { Utensils, X, Layout, Shield, Target, FileText } from 'lucide-react';
import { Modal } from 'react-bootstrap';

interface MealPlannerHeaderProps {
    planName: string;
    activeTab: 'planner' | 'restrictions' | 'objectives' | 'shopping';
    setActiveTab: (tab: 'planner' | 'restrictions' | 'objectives' | 'shopping') => void;
    onClose: () => void;
}

const MealPlannerHeader: React.FC<MealPlannerHeaderProps> = ({
    planName,
    activeTab,
    setActiveTab,
    onClose
}) => {
    return (
        <div className="border-bottom bg-white sticky-top rounded-top-4">
            <div className="d-flex justify-content-between align-items-center px-3 py-2">
                <div>
                    <div className="d-flex align-items-center gap-2 mb-0">
                        <span className="badge bg-primary bg-opacity-10 text-primary rounded-pill px-2 py-0 small">
                            Planificador
                        </span>
                    </div>
                    <div className="d-flex align-items-center">
                        <Utensils size={18} className="text-dark me-2" />
                        <h5 className="fw-bold text-dark mb-0">{planName}</h5>
                    </div>
                </div>
                <button
                    onClick={onClose}
                    className="btn btn-light rounded-circle p-2 d-flex align-items-center justify-content-center transition-hover shadow-sm"
                    style={{ width: '40px', height: '40px' }}
                >
                    <X size={20} className="text-muted" />
                </button>
            </div>

            <div className="px-3">
                <div className="d-flex gap-3">
                    <button
                        onClick={() => setActiveTab('planner')}
                        className={`btn btn-link text-decoration-none px-0 pb-2 border-bottom border-2 rounded-0 small ${activeTab === 'planner' ? 'border-primary text-primary fw-bold' : 'border-transparent text-muted'}`}
                    >
                        <Layout size={16} className="me-2 mb-1" />
                        Planificador
                    </button>
                    <button
                        onClick={() => setActiveTab('restrictions')}
                        className={`btn btn-link text-decoration-none px-0 pb-2 border-bottom border-2 rounded-0 small ${activeTab === 'restrictions' ? 'border-primary text-primary fw-bold' : 'border-transparent text-muted'}`}
                    >
                        <Shield size={16} className="me-2 mb-1" />
                        Restricciones
                    </button>
                    <button
                        onClick={() => setActiveTab('objectives')}
                        className={`btn btn-link text-decoration-none px-0 pb-2 border-bottom border-2 rounded-0 small ${activeTab === 'objectives' ? 'border-primary text-primary fw-bold' : 'border-transparent text-muted'}`}
                    >
                        <Target size={18} className="me-2 mb-1" />
                        Objetivos
                    </button>
                    <button
                        onClick={() => setActiveTab('shopping')}
                        className={`btn btn-link text-decoration-none px-0 pb-3 border-bottom border-3 rounded-0 ${activeTab === 'shopping' ? 'border-primary text-primary fw-bold' : 'border-transparent text-muted'}`}
                    >
                        <FileText size={18} className="me-2 mb-1" />
                        Lista de Compras
                    </button>
                </div>
            </div>
        </div>
    );
};

export default MealPlannerHeader;
