import React, { useState } from 'react';
import { Modal } from 'react-bootstrap';
import { useMealPlanner } from '../hooks/useMealPlanner';
import type { Meal } from '../hooks/useMealPlanner';
import MealPlannerHeader from './MealPlanner/MealPlannerHeader';
import MealPlannerToolbar from './MealPlanner/MealPlannerToolbar';
import WeeklyMealGrid from './MealPlanner/WeeklyMealGrid';
import { ShoppingListModal } from './ShoppingList/ShoppingListModal';
import MealEditorModal from './MealEditorModal';

interface MealPlannerProps {
  weeklyPlans: any[];
  dietPlan: any;
  onSave: (weeklyPlans: any[]) => void;
  onClose: () => void;
  isOpen: boolean;
}

const MealPlanner: React.FC<MealPlannerProps> = ({
  weeklyPlans,
  dietPlan,
  onSave,
  onClose,
  isOpen
}) => {
  // 1. Hook Integration
  const {
    plans,
    setPlans, // Exposed if needed for direct manipulation like clearing
    selectedWeek,
    setSelectedWeek,
    currentPlan,
    foods,
    recipes,
    isLoadingData,
    dataError,
    updateMealInPlan,
    handleSave,
  } = useMealPlanner({
    initialPlans: weeklyPlans,
    dietPlan,
    isOpen,
    onSave
  });

  // 2. UI State
  const [activeTab, setActiveTab] = useState<'planner' | 'restrictions' | 'objectives' | 'shopping'>('planner');
  const [editingMeal, setEditingMeal] = useState<Meal | null>(null);
  const [showMealEditor, setShowMealEditor] = useState(false);

  // Auxiliar states for modals that were in the monolith
  const [showShoppingList, setShowShoppingList] = useState(false);

  // 3. Handlers
  const handleEditMeal = (meal: Meal) => {
    setEditingMeal(meal);
    setShowMealEditor(true);
  };

  const handleAddMeal = (day: string, mealType: string) => {
    // Determine time based on type
    const timings = dietPlan?.meal_timing || {};
    const defaultTimes: Record<string, string> = {
      breakfast: '08:00',
      morning_snack: '11:00',
      lunch: '14:00',
      afternoon_snack: '17:00',
      dinner: '20:00',
      evening_snack: '22:00'
    };

    const key = mealType as keyof typeof defaultTimes;
    // Map mealType like 'morning_snack' to 'morning_snack_time' property if it exists in snake_case keys in backend
    // Assuming backend returns keys like "breakfast_time"
    const timeKey = `${key}_time`;
    const time = timings[timeKey] || defaultTimes[key] || '08:00';

    // Create a new empty meal object
    const newMeal: Meal = {
      id: `${day}-${mealType}-${Date.now()}`,
      day: day as Meal['day'],
      meal_type: mealType as any,
      meal_time: time,
      foods: [],
      recipes: [],
      total_calories: 0,
      total_protein: 0,
      total_carbs: 0,
      total_fats: 0
    };
    setEditingMeal(newMeal);
    setShowMealEditor(true);
  };

  const handleCloseEditor = () => {
    setShowMealEditor(false);
    setEditingMeal(null);
  };

  const handleCopyWeek = (targetWeek: number) => {
    // Logic to copy week
    // Ideally move this to hook
    // Simple implementation:
    if (window.confirm(`¿Copiar Semana ${selectedWeek} a Semana ${targetWeek}? Esto sobrescribirá la semana destino.`)) {
      const sourceMeals = currentPlan?.meals || [];
      const targetPlanIndex = plans.findIndex(p => p.week_number === targetWeek);
      if (targetPlanIndex >= 0) {
        const newPlans = [...plans];
        newPlans[targetPlanIndex] = {
          ...newPlans[targetPlanIndex],
          meals: sourceMeals.map(m => ({ ...m, id: `${m.day}-${m.meal_type}-${Date.now()}` })) // Clone logic basic
        };
        setPlans(newPlans);
      }
    }
  };

  const handleClearWeek = () => {
    if (window.confirm(`¿Limpiar toda la Semana ${selectedWeek}?`)) {
      const newPlans = plans.map(p => {
        if (p.week_number === selectedWeek) {
          return { ...p, meals: [] };
        }
        return p;
      });
      setPlans(newPlans);
    }
  };

  // Constants
  const daysOfWeek = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
  const allMealTypes = [
    { key: 'breakfast', label: 'Desayuno', icon: '🌅' },
    { key: 'morning_snack', label: 'Media Mañana', icon: '☕' },
    { key: 'lunch', label: 'Almuerzo', icon: '🍽️' },
    { key: 'afternoon_snack', label: 'Merienda', icon: '🍎' },
    { key: 'dinner', label: 'Cena', icon: '🌙' },
    { key: 'evening_snack', label: 'Recena', icon: '🥛' }
  ];

  const mealTypes = React.useMemo(() => {
    if (!dietPlan?.meal_frequency) return allMealTypes;

    // Intentar deducir la configuración
    const freq = dietPlan.meal_frequency;
    let count = 6;

    // Si tiene propiedad explícita
    if (freq.meals_count) {
      count = Number(freq.meals_count);
    }
    // Si viene como string en description o similar
    else if (typeof freq === 'string' && freq.includes('5')) {
      count = 5;
    }
    // Si es objeto con distribution
    else if (freq.distribution) {
      // Lógica específica si existiera
    }

    // Filtrar basado en el conteo (conteo estándar)
    if (count === 5) return allMealTypes.filter(m => m.key !== 'evening_snack');
    if (count === 4) return allMealTypes.filter(m => m.key !== 'morning_snack' && m.key !== 'evening_snack');
    if (count === 3) return allMealTypes.filter(m => ['breakfast', 'lunch', 'dinner'].includes(m.key));

    return allMealTypes;
  }, [dietPlan]);

  if (!isOpen) return null;

  return (
    <Modal show={isOpen} onHide={onClose} fullscreen className="meal-planner-modal">
      <Modal.Body className="p-0 bg-light">
        {/* 4. Header Component */}
        <MealPlannerHeader
          planName={dietPlan.name || 'Nuevo Plan'}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onClose={onClose}
        />

        <div className="container-fluid py-4 px-4 h-100 overflow-auto">
          {activeTab === 'planner' && (
            <>
              {/* 5. Toolbar Component */}
              <MealPlannerToolbar
                selectedWeek={selectedWeek}
                totalWeeks={4} // TODO: dynamic from props
                onSelectWeek={setSelectedWeek}
                onSave={handleSave}
                onClearWeek={handleClearWeek}
                onGenerateShoppingList={() => setShowShoppingList(true)}
                onApplyTemplate={() => { }} // TODO
                onCopyWeek={handleCopyWeek}
              />

              {/* Error Alert */}
              {dataError && (
                <div className="alert alert-warning border-0 shadow-sm rounded-4 mb-4">
                  <i className="fas fa-exclamation-triangle me-2"></i>
                  {dataError}
                </div>
              )}

              {isLoadingData ? (
                <div className="text-center py-5">
                  <div className="spinner-border text-primary" role="status"></div>
                  <p className="mt-3 text-muted">Cargando alimentos y recetas...</p>
                </div>
              ) : (
                /* 6. Grid Component */
                <WeeklyMealGrid
                  currentPlan={currentPlan}
                  selectedWeek={selectedWeek}
                  daysOfWeek={daysOfWeek}
                  mealTypes={mealTypes}
                  onEditMeal={handleEditMeal}
                  onAddMeal={handleAddMeal}
                />
              )}
            </>
          )}

          {activeTab === 'shopping' && (
            <div className="d-flex justify-content-center align-items-center h-50">
              <button className="btn btn-primary" onClick={() => setShowShoppingList(true)}>
                Ver Lista de Compras
              </button>
            </div>
          )}

          {activeTab === 'restrictions' && (
            <div className="card border-0 shadow-sm rounded-4">
              <div className="card-header bg-white border-bottom pt-4 px-4">
                <h5 className="fw-bold text-dark mb-0">🚫 Restricciones y Consideraciones</h5>
              </div>
              <div className="card-body p-4">
                <div className="row g-4">
                  <div className="col-md-6">
                    <label className="form-label fw-bold text-muted small text-uppercase">Alergias Alimentarias</label>
                    <div className="bg-light p-3 rounded-3">
                      {dietPlan?.pathological_restrictions?.allergies?.length > 0 ? (
                        <ul className="mb-0 ps-3">
                          {dietPlan.pathological_restrictions.allergies.map((allergy: string, idx: number) => (
                            <li key={idx} className="text-danger">{allergy}</li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-muted mb-0 fst-italic">Sin alergias registradas</p>
                      )}
                    </div>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label fw-bold text-muted small text-uppercase">Intolerancias</label>
                    <div className="bg-light p-3 rounded-3">
                      {dietPlan?.pathological_restrictions?.intolerances?.length > 0 ? (
                        <ul className="mb-0 ps-3">
                          {dietPlan.pathological_restrictions.intolerances.map((intolerance: string, idx: number) => (
                            <li key={idx} className="text-warning">{intolerance}</li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-muted mb-0 fst-italic">Sin intolerancias registradas</p>
                      )}
                    </div>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label fw-bold text-muted small text-uppercase">Condiciones Médicas</label>
                    <div className="bg-light p-3 rounded-3">
                      {dietPlan?.pathological_restrictions?.medical_conditions?.length > 0 ? (
                        <ul className="mb-0 ps-3">
                          {dietPlan.pathological_restrictions.medical_conditions.map((condition: string, idx: number) => (
                            <li key={idx} className="text-primary">{condition}</li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-muted mb-0 fst-italic">Sin condiciones médicas registradas</p>
                      )}
                    </div>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label fw-bold text-muted small text-uppercase">Medicamentos</label>
                    <div className="bg-light p-3 rounded-3">
                      {dietPlan?.pathological_restrictions?.medications?.length > 0 ? (
                        <ul className="mb-0 ps-3">
                          {dietPlan.pathological_restrictions.medications.map((medication: string, idx: number) => (
                            <li key={idx} className="text-info">{medication}</li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-muted mb-0 fst-italic">Sin medicamentos registrados</p>
                      )}
                    </div>
                  </div>
                  {dietPlan?.pathological_restrictions?.special_considerations?.length > 0 && (
                    <div className="col-12">
                      <label className="form-label fw-bold text-muted small text-uppercase">Consideraciones Especiales</label>
                      <div className="bg-light p-3 rounded-3">
                        <div className="d-flex flex-wrap gap-2">
                          {dietPlan.pathological_restrictions.special_considerations.map((consideration: string, idx: number) => (
                            <span key={idx} className="badge bg-success bg-opacity-10 text-success px-3 py-2">
                              {consideration}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'objectives' && (
            <div className="card border-0 shadow-sm rounded-4">
              <div className="card-header bg-white border-bottom pt-4 px-4">
                <h5 className="fw-bold text-dark mb-0">🎯 Objetivos Nutricionales</h5>
              </div>
              <div className="card-body p-4">
                <div className="row g-4">
                  <div className="col-md-4">
                    <div className="text-center p-4 bg-primary bg-opacity-10 rounded-4">
                      <div className="display-6 fw-bold text-primary mb-2">
                        {dietPlan?.daily_calories_target || 2000}
                      </div>
                      <div className="text-muted small fw-bold text-uppercase">Calorías Diarias</div>
                    </div>
                  </div>
                  <div className="col-md-4">
                    <div className="text-center p-4 bg-success bg-opacity-10 rounded-4">
                      <div className="display-6 fw-bold text-success mb-2">
                        {dietPlan?.nutritional_goals?.water_intake_liters || 2.5}L
                      </div>
                      <div className="text-muted small fw-bold text-uppercase">Agua Diaria</div>
                    </div>
                  </div>
                  <div className="col-md-4">
                    <div className="text-center p-4 bg-warning bg-opacity-10 rounded-4">
                      <div className="display-6 fw-bold text-warning mb-2">
                        {dietPlan?.nutritional_goals?.fiber_target_grams || 25}g
                      </div>
                      <div className="text-muted small fw-bold text-uppercase">Fibra Diaria</div>
                    </div>
                  </div>
                  <div className="col-12">
                    <label className="form-label fw-bold text-muted small text-uppercase mb-3">Distribución de Macronutrientes</label>
                    <div className="row g-3">
                      <div className="col-md-4">
                        <div className="bg-light p-3 rounded-3 text-center">
                          <div className="fw-bold text-dark mb-1">Proteínas</div>
                          <div className="h4 text-primary mb-0">{dietPlan?.daily_macros_target?.protein || 150}g</div>
                        </div>
                      </div>
                      <div className="col-md-4">
                        <div className="bg-light p-3 rounded-3 text-center">
                          <div className="fw-bold text-dark mb-1">Carbohidratos</div>
                          <div className="h4 text-success mb-0">{dietPlan?.daily_macros_target?.carbohydrates || 225}g</div>
                        </div>
                      </div>
                      <div className="col-md-4">
                        <div className="bg-light p-3 rounded-3 text-center">
                          <div className="fw-bold text-dark mb-1">Grasas</div>
                          <div className="h4 text-warning mb-0">{dietPlan?.daily_macros_target?.fats || 56}g</div>
                        </div>
                      </div>
                    </div>
                  </div>
                  {dietPlan?.meal_timing && (
                    <div className="col-12">
                      <label className="form-label fw-bold text-muted small text-uppercase mb-3">Horarios de Comidas</label>
                      <div className="row g-3">
                        <div className="col-md-3">
                          <div className="bg-light p-3 rounded-3">
                            <div className="small text-muted mb-1">🌅 Desayuno</div>
                            <div className="fw-bold text-dark">{dietPlan.meal_timing.breakfast_time || '08:00'}</div>
                          </div>
                        </div>
                        <div className="col-md-3">
                          <div className="bg-light p-3 rounded-3">
                            <div className="small text-muted mb-1">🍽️ Almuerzo</div>
                            <div className="fw-bold text-dark">{dietPlan.meal_timing.lunch_time || '13:00'}</div>
                          </div>
                        </div>
                        <div className="col-md-3">
                          <div className="bg-light p-3 rounded-3">
                            <div className="small text-muted mb-1">🌙 Cena</div>
                            <div className="fw-bold text-dark">{dietPlan.meal_timing.dinner_time || '19:00'}</div>
                          </div>
                        </div>
                        <div className="col-md-3">
                          <div className="bg-light p-3 rounded-3">
                            <div className="small text-muted mb-1">😴 Dormir</div>
                            <div className="fw-bold text-dark">{dietPlan.meal_timing.bed_time || '22:00'}</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modals */}
        <ShoppingListModal
          show={showShoppingList}
          onHide={() => setShowShoppingList(false)}
          weeklyPlan={currentPlan}
          patientName={dietPlan?.patient_name || 'Paciente'}
        />

        {/* Meal Editor Modal (New simplified internal component or imported) */}
        {/* We need to implement MealEditorModal to connect the Grid with the Hook Logic */}
        {/* For now, creating a temporary placeholder for verifying the main structure or we can reuse logic */}
        {showMealEditor && editingMeal && (
          <MealEditorModal
            show={showMealEditor}
            onHide={handleCloseEditor}
            meal={editingMeal}
            foods={foods}
            recipes={recipes}
            onSave={(updatedMeal: Meal) => {
              updateMealInPlan(updatedMeal);
              handleCloseEditor();
            }}
          />
        )}

      </Modal.Body>
    </Modal>
  );
};

export default MealPlanner;