import React, { useState } from 'react';
import type { DietPlan } from '../types/diet';
import type { Patient } from '../types/patient';
import type { ClinicalRecord } from '../types/clinical-record';
import NutritionalSummaryTab from './NutritionalCard/NutritionalSummaryTab';
import NutritionalMealsTab from './NutritionalCard/NutritionalMealsTab';
import NutritionalNutritionTab from './NutritionalCard/NutritionalNutritionTab';
import NutritionalScheduleTab from './NutritionalCard/NutritionalScheduleTab';
import NutritionalRestrictionsTab from './NutritionalCard/NutritionalRestrictionsTab';

interface NutritionalCardProps {
  dietPlan?: DietPlan;
  patient: Patient;
  clinicalRecord?: ClinicalRecord;
  mode: 'create' | 'edit' | 'view';
  onSave?: (planData: any) => void;
  onClose?: () => void;
  isLoading?: boolean;
}

type TabKey = 'summary' | 'meals' | 'nutrition' | 'schedule' | 'restrictions';

interface TabConfig {
  key: TabKey;
  label: string;
  icon: React.ReactNode;
  component: React.ComponentType<any>;
}

const NutritionalCard: React.FC<NutritionalCardProps> = ({
  dietPlan,
  patient,
  clinicalRecord,
  mode,
  onSave,
  onClose,
  isLoading = false
}) => {
  const [activeTab, setActiveTab] = useState<TabKey>('summary');
  const [planData, setPlanData] = useState<any>({
    // Datos básicos del plan
    name: dietPlan?.name || '',
    description: dietPlan?.description || '',
    notes: dietPlan?.notes || '',
    startDate: dietPlan?.start_date ? new Date(dietPlan.start_date).toISOString().split('T')[0] : '',
    endDate: dietPlan?.end_date ? new Date(dietPlan.end_date).toISOString().split('T')[0] : '',
    dailyCaloriesTarget: dietPlan?.daily_calories_target || 2000,
    
    // Datos de macronutrientes
    dailyMacrosTarget: dietPlan?.daily_macros_target || {
      protein: 150,
      carbohydrates: 200,
      fats: 67
    },
    
    // Configuración del plan
    isWeeklyPlan: dietPlan?.is_weekly_plan ?? true,
    totalWeeks: dietPlan?.total_weeks || 4,
    weeklyPlans: dietPlan?.weekly_plans || [],
    
    // Datos específicos de cada pestaña
    meals: [],
    mealSchedules: {},
    nutritionalGoals: {},
    restrictions: {
      allergies: [],
      intolerances: [],
      medicalConditions: [],
      medications: [],
      specialConsiderations: []
    }
  });

  // Configuración de las pestañas
  const tabs: TabConfig[] = [
    {
      key: 'summary',
      label: 'Resumen',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-file-text me-1">
          <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"></path>
          <path d="M14 2v4a2 2 0 0 0 2 2h4"></path>
          <path d="M10 9H8"></path>
          <path d="M16 13H8"></path>
          <path d="M16 17H8"></path>
        </svg>
      ),
      component: NutritionalSummaryTab
    },
    {
      key: 'meals',
      label: 'Comidas',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-utensils me-1">
          <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"></path>
          <path d="M7 2v20"></path>
          <path d="M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Z"></path>
        </svg>
      ),
      component: NutritionalMealsTab
    },
    {
      key: 'nutrition',
      label: 'Nutrición',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-target me-1">
          <circle cx="12" cy="12" r="10"></circle>
          <circle cx="12" cy="12" r="6"></circle>
          <circle cx="12" cy="12" r="2"></circle>
        </svg>
      ),
      component: NutritionalNutritionTab
    },
    {
      key: 'schedule',
      label: 'Horarios',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-clock me-1">
          <circle cx="12" cy="12" r="10"></circle>
          <polyline points="12 6 12 12 16 14"></polyline>
        </svg>
      ),
      component: NutritionalScheduleTab
    },
    {
      key: 'restrictions',
      label: 'Restricciones',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-shield me-1">
          <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"></path>
        </svg>
      ),
      component: NutritionalRestrictionsTab
    }
  ];

  // Función para actualizar datos del plan
  const updatePlanData = (section: string, data: any) => {
    setPlanData(prev => ({
      ...prev,
      [section]: data
    }));
  };

  // Función para manejar el guardado
  const handleSave = () => {
    if (onSave) {
      // Transformar los datos al formato esperado por el backend
      const transformedData = {
        name: planData.name,
        description: planData.description,
        notes: planData.notes,
        startDate: planData.startDate,
        endDate: planData.endDate,
        dailyCaloriesTarget: planData.dailyCaloriesTarget,
        dailyMacrosTarget: planData.dailyMacrosTarget,
        isWeeklyPlan: planData.isWeeklyPlan,
        totalWeeks: planData.totalWeeks,
        weeklyPlans: planData.weeklyPlans,
        
        // Datos específicos de las pestañas
        meals: planData.meals,
        mealSchedules: planData.mealSchedules,
        nutritionalGoals: planData.nutritionalGoals,
        pathologicalRestrictions: planData.restrictions
      };
      
      onSave(transformedData);
    }
  };

  // Componente activo
  const ActiveTabComponent = tabs.find(tab => tab.key === activeTab)?.component || NutritionalSummaryTab;

  return (
    <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog modal-xl">
        <div className="modal-content">
          {/* Header */}
          <div className="card-header bg-primary text-white">
            <div className="d-flex align-items-center justify-content-between">
              <h5 className="mb-0 d-flex align-items-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-calendar" aria-hidden="true">
                  <path d="M8 2v4"></path>
                  <path d="M16 2v4"></path>
                  <rect width="18" height="18" x="3" y="4" rx="2"></rect>
                  <path d="M3 10h18"></path>
                </svg>
                <span className="ms-2">
                  {mode === 'create' ? 'Crear Plan Nutricional' : 
                   mode === 'edit' ? 'Editar Plan Nutricional' : 
                   'Ver Plan Nutricional'}
                </span>
              </h5>
              <button 
                type="button" 
                className="btn-close btn-close-white" 
                aria-label="Cerrar"
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
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-user me-1">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                      <circle cx="12" cy="7" r="4"></circle>
                    </svg>
                    {patient.user?.first_name} {patient.user?.last_name}
                  </h6>
                  <div className="text-muted small">
                    <span className="me-3">📧 {patient.user?.email}</span>
                    <span className="me-3">📞 {patient.user?.phone}</span>
                    <span>🎂 {patient.user?.age} años</span>
                  </div>
                </div>
                <div className="col-md-4 text-md-end">
                  {clinicalRecord && (
                    <span className="badge bg-success">
                      <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-file-text me-1">
                        <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"></path>
                        <path d="M14 2v4a2 2 0 0 0 2 2h4"></path>
                      </svg>
                      Expediente clínico disponible
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
                    {tab.icon}
                    {tab.label}
                  </button>
                </li>
              ))}
            </ul>

            {/* Contenido de la pestaña activa */}
            <div className="p-4" style={{ minHeight: '500px', maxHeight: '70vh', overflowY: 'auto' }}>
              <ActiveTabComponent
                planData={planData}
                patient={patient}
                clinicalRecord={clinicalRecord}
                mode={mode}
                onUpdateData={updatePlanData}
                isLoading={isLoading}
              />
            </div>
          </div>

          {/* Footer con botones de acción */}
          <div className="modal-footer">
            <div className="d-flex justify-content-between w-100">
              <div>
                {mode !== 'view' && (
                  <span className="text-muted small">
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-info me-1">
                      <circle cx="12" cy="12" r="10"></circle>
                      <path d="M12 16v-4"></path>
                      <path d="M12 8h.01"></path>
                    </svg>
                    Los cambios se guardan automáticamente al navegar entre pestañas
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
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        Guardando...
                      </>
                    ) : (
                      <>
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-save me-1">
                          <path d="M15.2 3a2 2 0 0 1 1.4.6l3.8 3.8a2 2 0 0 1 .6 1.4V19a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z"></path>
                          <path d="M17 21v-7a1 1 0 0 0-1-1H8a1 1 0 0 0-1 1v7"></path>
                          <path d="M7 3v4a1 1 0 0 0 1 1h8"></path>
                        </svg>
                        {mode === 'create' ? 'Crear Plan' : 'Guardar Cambios'}
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

export default NutritionalCard; 