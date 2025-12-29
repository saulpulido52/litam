import React, { useState, useEffect } from 'react';
import {
  FileText,
  Utensils,
  Target,
  Clock,
  Shield,
  Save,
  X,
  Edit,
  Download
} from 'lucide-react';
import SimpleSummaryTab from '../NutritionalCard/SimpleSections/SimpleSummaryTab';
import SimpleMealsTab from '../NutritionalCard/SimpleSections/SimpleMealsTab';
import SimpleNutritionTab from '../NutritionalCard/SimpleSections/SimpleNutritionTab';
import SimpleScheduleTab from '../NutritionalCard/SimpleSections/SimpleScheduleTab';
import SimpleRestrictionsTab from '../NutritionalCard/SimpleSections/SimpleRestrictionsTab';
import { useNutritionalPlan } from '../../hooks/useNutritionalPlan';

interface NutritionalCardSimpleProps {
  dietPlan?: any;
  patient: any;
  patients?: any[];
  clinicalRecords?: any[];
  mode: 'create' | 'edit' | 'view';
  onSave?: (planData: any) => void;
  onEdit?: () => void;
  onDownload?: () => void;
  onClose?: () => void;
  isLoading?: boolean;
}

const NutritionalCardSimple: React.FC<NutritionalCardSimpleProps> = ({
  dietPlan,
  patient,
  patients = [],
  clinicalRecords = [],
  mode,
  onSave,
  onEdit,
  onDownload,
  onClose,
  isLoading = false
}) => {
  const [activeTab, setActiveTab] = useState<string>('summary');

  const {
    planData,
    updatePlanData,
    handleSave,
    selectedPatient,
    relevantClinicalRecord,
    recommendationsApplied,
    applyRecommendationsFromClinicalRecord
  } = useNutritionalPlan({
    dietPlan,
    patient,
    patients,
    clinicalRecords,
    mode,
    onSave
  });

  // Auto-apply recommendations if available and not yet applied
  useEffect(() => {
    if (relevantClinicalRecord && !recommendationsApplied && mode === 'create') {
      applyRecommendationsFromClinicalRecord();
    }
  }, [relevantClinicalRecord, mode, applyRecommendationsFromClinicalRecord, recommendationsApplied]);

  const tabs = [
    { id: 'summary', label: 'Resumen', icon: FileText },
    { id: 'meals', label: 'Comidas', icon: Utensils },
    { id: 'nutrition', label: 'Nutrición', icon: Target },
    { id: 'schedule', label: 'Horarios', icon: Clock },
    { id: 'restrictions', label: 'Restricciones', icon: Shield }
  ];

  return (
    <div className="card h-100 border-0 bg-white rounded-4 shadow-sm overflow-hidden d-flex flex-column animate-fade-in">

      {/* HEADER PREMIUM */}
      <div className="d-flex justify-content-between align-items-center p-4 bg-white border-bottom">
        <div>
          <div className="d-flex align-items-center gap-2 mb-1">
            <span className={`badge rounded-pill px-3 py-1 ${mode === 'view' ? 'bg-secondary bg-opacity-10 text-secondary' : 'bg-primary bg-opacity-10 text-primary'}`}>
              {mode === 'create' ? 'Nuevo Plan' : mode === 'edit' ? 'Editando Plan' : 'Vista de Plan'}
            </span>
            {dietPlan?.status === 'active' && <span className="badge bg-success bg-opacity-10 text-success rounded-pill px-3 py-1">Activo</span>}
          </div>
          <h4 className="fw-bold text-dark mb-0 ls-tight">
            {mode === 'create' ? 'Crear Plan Nutricional' : planData.name || 'Plan Nutricional'}
          </h4>
        </div>
        <div className="d-flex gap-2">
          {mode === 'view' && (
            <>
              {onEdit && (
                <button
                  className="btn btn-outline-primary rounded-pill px-3 d-flex align-items-center gap-2"
                  onClick={onEdit}
                >
                  <Edit size={16} />
                  <span className="d-none d-sm-inline">Editar</span>
                </button>
              )}
              {onDownload && (
                <button
                  className="btn btn-outline-secondary rounded-pill px-3 d-flex align-items-center gap-2"
                  onClick={onDownload}
                >
                  <Download size={16} />
                  <span className="d-none d-sm-inline">Descargar</span>
                </button>
              )}
            </>
          )}

          <button
            className="btn btn-light rounded-circle p-2 d-flex align-items-center justify-content-center transition-hover shadow-sm ms-2"
            onClick={onClose}
            style={{ width: '40px', height: '40px' }}
          >
            <X size={20} className="text-muted" />
          </button>
        </div>
      </div>

      {/* TABS NAVIGATION */}
      <div className="px-4 pt-3 bg-light bg-opacity-50 border-bottom overflow-x-auto d-flex flex-nowrap gap-3 scrollbar-hide">
        {tabs.map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                  d-flex align-items-center gap-2 px-4 py-3 border-0 bg-transparent position-relative
                  transition-all fw-medium text-nowrap
                  ${isActive ? 'text-primary' : 'text-secondary'}
                `}
              style={{ marginBottom: '-1px' }}
            >
              <Icon size={18} className={isActive ? 'text-primary' : 'text-muted'} />
              {tab.label}
              {isActive && (
                <div className="position-absolute bottom-0 start-0 w-100 bg-primary rounded-top" style={{ height: '3px' }}></div>
              )}
            </button>
          );
        })}
      </div>

      {/* CONTENIDO PRINCIPAL SCROLLEABLE */}
      <div className="flex-grow-1 overflow-y-auto bg-light bg-opacity-10">
        <div className="p-4 container-fluid" style={{ maxWidth: '1200px' }}>

          {activeTab === 'summary' && (
            <SimpleSummaryTab
              planData={planData}
              updatePlanData={updatePlanData}
              patients={patients}
              patient={patient}
              mode={mode}
              selectedPatient={selectedPatient}
              clinicalRecord={relevantClinicalRecord}
              recommendationsApplied={recommendationsApplied}
              isLoading={isLoading}
            />
          )}

          {activeTab === 'meals' && (
            <SimpleMealsTab
              planData={planData}
              updatePlanData={updatePlanData}
              mode={mode}
              isLoading={isLoading}
            />
          )}

          {activeTab === 'nutrition' && (
            <SimpleNutritionTab
              planData={planData}
              updatePlanData={updatePlanData}
              mode={mode}
              isLoading={isLoading}
            />
          )}

          {activeTab === 'schedule' && (
            <SimpleScheduleTab
              planData={planData}
              updatePlanData={updatePlanData}
              mode={mode}
              isLoading={isLoading}
            />
          )}

          {activeTab === 'restrictions' && (
            <SimpleRestrictionsTab
              planData={planData}
              updatePlanData={updatePlanData}
              mode={mode}
              isLoading={isLoading}
              clinicalRecord={relevantClinicalRecord}
            />
          )}
        </div>
      </div>

      {/* FOOTER DE ACCIONES */}
      <div className="p-4 bg-white border-top shadow-lg d-flex justify-content-between align-items-center z-2">
        <div className="d-flex flex-column">
          <small className="text-muted fw-bold text-uppercase" style={{ fontSize: '0.7rem' }}>Estado del formulario</small>
          <div className="d-flex align-items-center gap-2">
            <div className={`rounded-circle ${planData.name && planData.patientId && planData.startDate ? 'bg-success' : 'bg-warning'}`} style={{ width: '8px', height: '8px' }}></div>
            <span className="small text-dark fw-medium">
              {planData.name && planData.patientId && planData.startDate ? 'Listo para guardar' : 'Faltan campos requeridos'}
            </span>
          </div>
        </div>
        <div className="d-flex gap-3">
          <button
            className="btn btn-light border-0 px-4 py-2 rounded-pill fw-medium text-secondary shadow-sm hover-scale"
            onClick={onClose}
          >
            Cancelar
          </button>
          {mode !== 'view' && (
            <button
              className="btn btn-primary border-0 px-4 py-2 rounded-pill fw-medium shadow-sm d-flex align-items-center gap-2 hover-scale"
              onClick={handleSave}
              disabled={isLoading}
            >
              <Save size={18} />
              {mode === 'edit' ? 'Guardar Cambios' : 'Crear Plan'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default NutritionalCardSimple;