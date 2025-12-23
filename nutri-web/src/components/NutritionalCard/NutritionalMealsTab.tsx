import React, { useState, useEffect } from 'react';

interface MealItem {
  foodId: string;
  foodName: string;
  quantity: number; // en gramos
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
}

interface Meal {
  id: string;
  day: string;
  mealType: 'breakfast' | 'morning_snack' | 'lunch' | 'afternoon_snack' | 'dinner' | 'evening_snack';
  name: string;
  time?: string;
  items: MealItem[];
  notes?: string;
}

interface NutritionalMealsTabProps {
  dietPlan: any;
  onPlanDataChange: (data: any) => void;
}

const NutritionalMealsTab: React.FC<NutritionalMealsTabProps> = ({
  dietPlan,
  onPlanDataChange
}) => {
  const [selectedWeek, setSelectedWeek] = useState(1);
  const [selectedDay, setSelectedDay] = useState('monday');
  const [meals, setMeals] = useState<Meal[]>([]);
  const [showAddMealModal, setShowAddMealModal] = useState(false);
  const [editingMeal, setEditingMeal] = useState<Meal | null>(null);

  const daysOfWeek = [
    { key: 'monday', label: 'Lunes' },
    { key: 'tuesday', label: 'Martes' },
    { key: 'wednesday', label: 'Miércoles' },
    { key: 'thursday', label: 'Jueves' },
    { key: 'friday', label: 'Viernes' },
    { key: 'saturday', label: 'Sábado' },
    { key: 'sunday', label: 'Domingo' }
  ];

  const mealTypes = [
    { key: 'breakfast', label: 'Desayuno', icon: '🌅', defaultTime: '07:00' },
    { key: 'morning_snack', label: 'Colación Matutina', icon: '☕', defaultTime: '10:00' },
    { key: 'lunch', label: 'Comida', icon: '🍽️', defaultTime: '14:00' },
    { key: 'afternoon_snack', label: 'Colación Vespertina', icon: '🥪', defaultTime: '17:00' },
    { key: 'dinner', label: 'Cena', icon: '🌙', defaultTime: '20:00' },
    { key: 'evening_snack', label: 'Colación Nocturna', icon: '🌃', defaultTime: '22:00' }
  ];

  // Cargar comidas existentes
  useEffect(() => {
    if (dietPlan.meals) {
      setMeals(dietPlan.meals);
    }
  }, [dietPlan.meals]);

  // Filtrar comidas por día seleccionado
  const dayMeals = meals.filter(meal => meal.day === selectedDay);

  // Función para agregar una nueva comida
  const addNewMeal = (mealType: string) => {
    const mealTypeData = mealTypes.find(mt => mt.key === mealType);
    const newMeal: Meal = {
      id: `meal_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      day: selectedDay,
      mealType: mealType as any,
      name: mealTypeData?.label || 'Nueva Comida',
      time: mealTypeData?.defaultTime,
      items: [],
      notes: ''
    };
    
    setEditingMeal(newMeal);
    setShowAddMealModal(true);
  };

  // Función para editar una comida existente
  const editMeal = (meal: Meal) => {
    setEditingMeal(meal);
    setShowAddMealModal(true);
  };

  // Función para guardar una comida
  const saveMeal = (meal: Meal) => {
    const updatedMeals = editingMeal?.id && meals.find(m => m.id === editingMeal.id)
      ? meals.map(m => m.id === meal.id ? meal : m)
      : [...meals, meal];
    
    setMeals(updatedMeals);
    onPlanDataChange({ ...dietPlan, meals: updatedMeals });
    setShowAddMealModal(false);
    setEditingMeal(null);
  };

  // Función para eliminar una comida
  const deleteMeal = (mealId: string) => {
    const updatedMeals = meals.filter(m => m.id !== mealId);
    setMeals(updatedMeals);
    onPlanDataChange({ ...dietPlan, meals: updatedMeals });
  };

  // Calcular totales del día
  const calculateDayTotals = (day: string) => {
    const dayMealsData = meals.filter(meal => meal.day === day);
    return dayMealsData.reduce((totals, meal) => {
      const mealTotals = meal.items.reduce((mealSum, item) => ({
        calories: mealSum.calories + item.calories,
        protein: mealSum.protein + item.protein,
        carbs: mealSum.carbs + item.carbs,
        fats: mealSum.fats + item.fats
      }), { calories: 0, protein: 0, carbs: 0, fats: 0 });

      return {
        calories: totals.calories + mealTotals.calories,
        protein: totals.protein + mealTotals.protein,
        carbs: totals.carbs + mealTotals.carbs,
        fats: totals.fats + mealTotals.fats
      };
    }, { calories: 0, protein: 0, carbs: 0, fats: 0 });
  };

  // Duplicar comidas de un día a otro
  const duplicateDay = (fromDay: string, toDay: string) => {
    const sourceMeals = meals.filter(meal => meal.day === fromDay);
    const duplicatedMeals = sourceMeals.map(meal => ({
      ...meal,
      id: `meal_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      day: toDay
    }));

    // Eliminar comidas existentes del día destino
    const filteredMeals = meals.filter(meal => meal.day !== toDay);
    const updatedMeals = [...filteredMeals, ...duplicatedMeals];
    
    setMeals(updatedMeals);
    onPlanDataChange({ ...dietPlan, meals: updatedMeals });
  };

  const dayTotals = calculateDayTotals(selectedDay);

  return (
    <div className="nutritional-meals-tab">
      {/* Header con controles de navegación */}
      <div className="row mb-4">
        <div className="col-md-6">
          <div className="card">
            <div className="card-body p-3">
              <h6 className="mb-3">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-calendar me-2">
                  <path d="M8 2v4"></path>
                  <path d="M16 2v4"></path>
                  <rect width="18" height="18" x="3" y="4" rx="2"></rect>
                  <path d="M3 10h18"></path>
                </svg>
                Seleccionar Semana y Día
              </h6>
              
              <div className="row">
                <div className="col-6">
                  <label className="form-label small">Semana</label>
                  <select
                    className="form-select form-select-sm"
                    value={selectedWeek}
                    onChange={(e) => setSelectedWeek(parseInt(e.target.value))}
                  >
                    {Array.from({ length: dietPlan.totalWeeks || 4 }, (_, i) => (
                      <option key={i + 1} value={i + 1}>Semana {i + 1}</option>
                    ))}
                  </select>
                </div>
                <div className="col-6">
                  <label className="form-label small">Día</label>
                  <select
                    className="form-select form-select-sm"
                    value={selectedDay}
                    onChange={(e) => setSelectedDay(e.target.value)}
                  >
                    {daysOfWeek.map(day => (
                      <option key={day.key} value={day.key}>{day.label}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-6">
          <div className="card">
            <div className="card-body p-3">
              <h6 className="mb-3">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-activity me-2">
                  <path d="M22 12h-2.48a2 2 0 0 0-1.93 1.46l-2.35 8.36a.25.25 0 0 1-.48 0L9.24 2.18a.25.25 0 0 0-.48 0l-2.35 8.36A2 2 0 0 1 4.49 12H2"></path>
                </svg>
                Resumen del Día
              </h6>
              
              <div className="row text-center">
                <div className="col-6">
                  <div className="small text-muted">Calorías</div>
                  <div className="h6 mb-0 text-primary">{Math.round(dayTotals.calories)}</div>
                </div>
                <div className="col-6">
                  <div className="small text-muted">Comidas</div>
                  <div className="h6 mb-0 text-success">{dayMeals.length}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Pestañas de días de la semana */}
      <div className="mb-4">
        <ul className="nav nav-pills nav-fill">
          {daysOfWeek.map(day => {
            const dayTotalsForTab = calculateDayTotals(day.key);
            const mealCount = meals.filter(meal => meal.day === day.key).length;
            
            return (
              <li key={day.key} className="nav-item">
                <button 
                  className={`nav-link ${selectedDay === day.key ? 'active' : ''} ${mealCount > 0 ? 'text-success' : ''}`}
                  onClick={() => setSelectedDay(day.key)}
                >
                  <div className="small">{day.label}</div>
                  <div className="text-xs">
                    {mealCount > 0 ? (
                      <>
                        <span className="badge bg-light text-dark">{mealCount}</span>
                        <div className="text-xs">{Math.round(dayTotalsForTab.calories)} kcal</div>
                      </>
                    ) : (
                      <span className="text-muted">Sin comidas</span>
                    )}
                  </div>
                </button>
              </li>
            );
          })}
        </ul>
      </div>

      {/* Contenido del día seleccionado */}
      <div className="row">
        <div className="col-md-8">
          <div className="card">
            <div className="card-header d-flex justify-content-between align-items-center">
              <h6 className="mb-0">
                Comidas del {daysOfWeek.find(d => d.key === selectedDay)?.label}
              </h6>
              <div className="dropdown">
                <button className="btn btn-primary btn-sm dropdown-toggle" type="button" data-bs-toggle="dropdown">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-plus me-1">
                    <path d="M5 12h14"></path>
                    <path d="M12 5v14"></path>
                  </svg>
                  Agregar Comida
                </button>
                <ul className="dropdown-menu">
                  {mealTypes.map(mealType => (
                    <li key={mealType.key}>
                      <button 
                        className="dropdown-item"
                        onClick={() => addNewMeal(mealType.key)}
                      >
                        {mealType.icon} {mealType.label}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <div className="card-body">
              {dayMeals.length === 0 ? (
                <div className="text-center py-4">
                  <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-utensils text-muted mb-3">
                    <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"></path>
                    <path d="M7 2v20"></path>
                    <path d="M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Z"></path>
                  </svg>
                  <p className="text-muted mb-3">No hay comidas programadas para este día</p>
                  <button 
                    className="btn btn-outline-primary"
                    onClick={() => addNewMeal('breakfast')}
                  >
                    Agregar Primera Comida
                  </button>
                </div>
              ) : (
                <div className="timeline">
                  {dayMeals
                    .sort((a, b) => {
                      const orderMap = { breakfast: 1, morning_snack: 2, lunch: 3, afternoon_snack: 4, dinner: 5, evening_snack: 6 };
                      return (orderMap[a.mealType] || 999) - (orderMap[b.mealType] || 999);
                    })
                    .map((meal, _) => {
                      const mealTypeData = mealTypes.find(mt => mt.key === meal.mealType);
                      const mealTotals = meal.items.reduce((sum, item) => ({
                        calories: sum.calories + item.calories,
                        protein: sum.protein + item.protein,
                        carbs: sum.carbs + item.carbs,
                        fats: sum.fats + item.fats
                      }), { calories: 0, protein: 0, carbs: 0, fats: 0 });

                      return (
                        <div key={meal.id} className="timeline-item border rounded p-3 mb-3">
                          <div className="d-flex justify-content-between align-items-start">
                            <div className="flex-grow-1">
                              <div className="d-flex align-items-center mb-2">
                                <span className="me-2" style={{ fontSize: '20px' }}>{mealTypeData?.icon}</span>
                                <h6 className="mb-0">{meal.name}</h6>
                                {meal.time && (
                                  <span className="badge bg-light text-dark ms-2">{meal.time}</span>
                                )}
                              </div>
                              
                              {meal.items.length > 0 ? (
                                <>
                                  <div className="small text-muted mb-2">
                                    {meal.items.map((item, idx) => (
                                      <span key={idx}>
                                        {item.foodName} ({item.quantity}g)
                                        {idx < meal.items.length - 1 ? ', ' : ''}
                                      </span>
                                    ))}
                                  </div>
                                  <div className="row text-center small">
                                    <div className="col-3">
                                      <div className="text-primary fw-bold">{Math.round(mealTotals.calories)}</div>
                                      <div className="text-muted">kcal</div>
                                    </div>
                                    <div className="col-3">
                                      <div className="text-danger fw-bold">{Math.round(mealTotals.protein)}</div>
                                      <div className="text-muted">g prot</div>
                                    </div>
                                    <div className="col-3">
                                      <div className="text-warning fw-bold">{Math.round(mealTotals.carbs)}</div>
                                      <div className="text-muted">g carb</div>
                                    </div>
                                    <div className="col-3">
                                      <div className="text-success fw-bold">{Math.round(mealTotals.fats)}</div>
                                      <div className="text-muted">g gras</div>
                                    </div>
                                  </div>
                                </>
                              ) : (
                                <div className="text-muted small">Sin alimentos agregados</div>
                              )}
                              
                              {meal.notes && (
                                <div className="mt-2 small text-muted">
                                  <em>"{meal.notes}"</em>
                                </div>
                              )}
                            </div>
                            
                            <div className="dropdown">
                              <button className="btn btn-sm btn-outline-secondary" data-bs-toggle="dropdown">
                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-more-vertical">
                                  <circle cx="12" cy="12" r="1"></circle>
                                  <circle cx="12" cy="5" r="1"></circle>
                                  <circle cx="12" cy="19" r="1"></circle>
                                </svg>
                              </button>
                              <ul className="dropdown-menu">
                                <li><button className="dropdown-item" onClick={() => editMeal(meal)}>Editar</button></li>
                                <li><hr className="dropdown-divider" /></li>
                                <li><button className="dropdown-item text-danger" onClick={() => deleteMeal(meal.id)}>Eliminar</button></li>
                              </ul>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Panel lateral con acciones rápidas */}
        <div className="col-md-4">
          <div className="card">
            <div className="card-header">
              <h6 className="mb-0">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-zap me-2">
                  <path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14H4Z"></path>
                </svg>
                Acciones Rápidas
              </h6>
            </div>
            <div className="card-body">
              <div className="mb-3">
                <label className="form-label small">Duplicar comidas desde:</label>
                <select 
                  className="form-select form-select-sm"
                  onChange={(e) => {
                    if (e.target.value && e.target.value !== selectedDay) {
                      if (confirm(`¿Duplicar todas las comidas de ${daysOfWeek.find(d => d.key === e.target.value)?.label} a ${daysOfWeek.find(d => d.key === selectedDay)?.label}?`)) {
                        duplicateDay(e.target.value, selectedDay);
                      }
                    }
                    e.target.value = '';
                  }}
                  defaultValue=""
                >
                  <option value="">Seleccionar día...</option>
                  {daysOfWeek
                    .filter(day => day.key !== selectedDay && meals.some(meal => meal.day === day.key))
                    .map(day => (
                      <option key={day.key} value={day.key}>{day.label}</option>
                    ))}
                </select>
              </div>
              
              <div className="d-grid gap-2">
                <button 
                  className="btn btn-outline-primary btn-sm"
                  onClick={() => addNewMeal('breakfast')}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-sunrise me-1">
                    <path d="M12 2v8"></path>
                    <path d="M4.93 10.93l1.41 1.41"></path>
                    <path d="M2 18h2"></path>
                    <path d="M20 18h2"></path>
                    <path d="M19.07 10.93l-1.41 1.41"></path>
                    <path d="M22 22H2"></path>
                    <path d="M8 6l4-4 4 4"></path>
                    <path d="M16 18a4 4 0 0 0-8 0"></path>
                  </svg>
                  Agregar Desayuno
                </button>
                <button 
                  className="btn btn-outline-primary btn-sm"
                  onClick={() => addNewMeal('lunch')}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-sun me-1">
                    <circle cx="12" cy="12" r="5"></circle>
                    <path d="M12 1v2"></path>
                    <path d="M12 21v2"></path>
                    <path d="M4.22 4.22l1.42 1.42"></path>
                    <path d="M18.36 18.36l1.42 1.42"></path>
                    <path d="M1 12h2"></path>
                    <path d="M21 12h2"></path>
                    <path d="M4.22 19.78l1.42-1.42"></path>
                    <path d="M18.36 5.64l1.42-1.42"></path>
                  </svg>
                  Agregar Comida
                </button>
                <button 
                  className="btn btn-outline-primary btn-sm"
                  onClick={() => addNewMeal('dinner')}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-moon me-1">
                    <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"></path>
                  </svg>
                  Agregar Cena
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal para agregar/editar comida */}
      {showAddMealModal && editingMeal && (
        <MealEditorModal
          meal={editingMeal}
          onSave={saveMeal}
          onClose={() => {
            setShowAddMealModal(false);
            setEditingMeal(null);
          }}
        />
      )}
    </div>
  );
};

// Modal para editar comidas (componente simplificado)
const MealEditorModal: React.FC<{
  meal: Meal;
  onSave: (meal: Meal) => void;
  onClose: () => void;
}> = ({ meal, onSave, onClose }) => {
  const [editedMeal, setEditedMeal] = useState(meal);

  const handleSave = () => {
    onSave(editedMeal);
  };

  return (
    <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog modal-lg">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Editar Comida</h5>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>
          <div className="modal-body">
            <div className="mb-3">
              <label className="form-label">Nombre de la comida</label>
              <input
                type="text"
                className="form-control"
                value={editedMeal.name}
                onChange={(e) => setEditedMeal(prev => ({ ...prev, name: e.target.value }))}
              />
            </div>
            
            <div className="row">
              <div className="col-md-6">
                <label className="form-label">Hora</label>
                <input
                  type="time"
                  className="form-control"
                  value={editedMeal.time || ''}
                  onChange={(e) => setEditedMeal(prev => ({ ...prev, time: e.target.value }))}
                />
              </div>
            </div>

            <div className="mt-3">
              <label className="form-label">Notas</label>
              <textarea
                className="form-control"
                rows={2}
                value={editedMeal.notes || ''}
                onChange={(e) => setEditedMeal(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Instrucciones especiales, preparación, etc."
              />
            </div>
            
            {/* Aquí iría el editor de alimentos - simplificado por ahora */}
            <div className="mt-3">
              <h6>Alimentos</h6>
              <div className="alert alert-info">
                <small>El editor completo de alimentos se implementará en la siguiente iteración. Por ahora, las comidas se pueden crear con información básica.</small>
              </div>
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancelar
            </button>
            <button type="button" className="btn btn-primary" onClick={handleSave}>
              Guardar Comida
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NutritionalMealsTab; 