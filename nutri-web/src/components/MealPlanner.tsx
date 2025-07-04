import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Trash2, 
  Calendar, 
  Edit
} from 'lucide-react';
import { Button, Modal, Form, Badge } from 'react-bootstrap';

interface Meal {
  id?: string;
  day: string;
  meal_type: 'breakfast' | 'morning_snack' | 'lunch' | 'afternoon_snack' | 'dinner' | 'evening_snack';
  meal_time: string;
  meal_description: string; // Descripción manual de la comida
  notes?: string;
  total_calories: number;
  total_protein: number;
  total_carbs: number;
  total_fats: number;
}

interface WeeklyPlan {
  week_number: number;
  start_date: string;
  end_date: string;
  daily_calories_target: number;
  daily_macros_target: {
    protein: number;
    carbohydrates: number;
    fats: number;
  };
  meals: Meal[];
  notes?: string;
}

interface MealPlannerProps {
  weeklyPlans: WeeklyPlan[];
  onSave: (weeklyPlans: WeeklyPlan[]) => void;
  onClose: () => void;
  isOpen: boolean;
  // Nuevas props para configuración dinámica
  mealsPerDay?: number;
  mealTimes?: {
    breakfast?: string;
    midMorning?: string;
    lunch?: string;
    snack?: string;
    dinner?: string;
    evening?: string;
  };
}

const MealPlanner: React.FC<MealPlannerProps> = ({
  weeklyPlans,
  onSave,
  onClose,
  isOpen,
  mealsPerDay = 5,
  mealTimes = {}
}) => {
  const [plans, setPlans] = useState<WeeklyPlan[]>(weeklyPlans);
  const [selectedWeek, setSelectedWeek] = useState<number>(1);
  // const [selectedDay, setSelectedDay] = useState<string>('Lunes');
  // const [selectedMealType, setSelectedMealType] = useState<string>('breakfast');
  const [showMealModal, setShowMealModal] = useState(false);
  const [editingMeal, setEditingMeal] = useState<Meal | null>(null);
  const [loading, setLoading] = useState(false);

  // Días de la semana
  const daysOfWeek = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
  
  // Configuración dinámica de comidas basada en mealsPerDay
  const getMealTypes = () => {
    const baseMealTypes = [
      { key: 'breakfast', label: 'Desayuno', icon: '🌅' },
      { key: 'morning_snack', label: 'Merienda Mañana', icon: '☕' },
      { key: 'lunch', label: 'Almuerzo', icon: '🍽️' },
      { key: 'afternoon_snack', label: 'Merienda Tarde', icon: '🍎' },
      { key: 'dinner', label: 'Cena', icon: '🌙' },
      { key: 'evening_snack', label: 'Merienda Noche', icon: '🥛' }
    ];

    // Filtrar comidas según mealsPerDay
    switch (mealsPerDay) {
      case 3:
        return baseMealTypes.filter(meal => 
          ['breakfast', 'lunch', 'dinner'].includes(meal.key)
        );
      case 4:
        return baseMealTypes.filter(meal => 
          ['breakfast', 'lunch', 'afternoon_snack', 'dinner'].includes(meal.key)
        );
      case 5:
        return baseMealTypes.filter(meal => 
          ['breakfast', 'morning_snack', 'lunch', 'afternoon_snack', 'dinner'].includes(meal.key)
        );
      case 6:
        return baseMealTypes; // Todas las comidas
      default:
        return baseMealTypes.filter(meal => 
          ['breakfast', 'lunch', 'dinner'].includes(meal.key)
        );
    }
  };

  // Horarios por defecto con configuración dinámica
  const getDefaultMealTimes = () => {
    const defaultTimes = {
      breakfast: '08:00',
      morning_snack: '10:30',
      lunch: '13:00',
      afternoon_snack: '16:00',
      dinner: '19:00',
      evening_snack: '21:00'
    };

    // Usar horarios del plan si están disponibles
    return {
      ...defaultTimes,
      ...mealTimes,
      // Mapear nombres de mealTimes a keys del planificador
      breakfast: mealTimes.breakfast || defaultTimes.breakfast,
      morning_snack: mealTimes.midMorning || defaultTimes.morning_snack,
      lunch: mealTimes.lunch || defaultTimes.lunch,
      afternoon_snack: mealTimes.snack || defaultTimes.afternoon_snack,
      dinner: mealTimes.dinner || defaultTimes.dinner,
      evening_snack: mealTimes.evening || defaultTimes.evening_snack
    };
  };

  const mealTypes = getMealTypes();
  const defaultMealTimes = getDefaultMealTimes();

  useEffect(() => {
    if (weeklyPlans.length === 0) {
      // Crear plan semanal por defecto si no existe
      const defaultPlan: WeeklyPlan = {
        week_number: 1,
        start_date: new Date().toISOString().split('T')[0],
        end_date: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        daily_calories_target: 2000,
        daily_macros_target: {
          protein: 150,
          carbohydrates: 225,
          fats: 56
        },
        meals: [],
        notes: ''
      };
      setPlans([defaultPlan]);
    } else {
      setPlans(weeklyPlans);
    }
  }, [weeklyPlans]);

  const getMealForDayAndType = (day: string, mealType: string): Meal | null => {
    const currentPlan = plans.find(p => p.week_number === selectedWeek);
    if (!currentPlan) return null;
    
    return currentPlan.meals.find(meal => 
      meal.day === day && meal.meal_type === mealType
    ) || null;
  };

  const createEmptyMeal = (day: string, mealType: string): Meal => {
    return {
      id: `meal_${Date.now()}`,
      day,
      meal_type: mealType as any,
      meal_time: defaultMealTimes[mealType as keyof typeof defaultMealTimes] || '12:00',
      meal_description: '',
      notes: '',
      total_calories: 0,
      total_protein: 0,
      total_carbs: 0,
      total_fats: 0
    };
  };

  const addOrEditMeal = (meal: Meal) => {
    const updatedPlans = plans.map(plan => {
      if (plan.week_number === selectedWeek) {
        const existingMealIndex = plan.meals.findIndex(m => 
          m.day === meal.day && m.meal_type === meal.meal_type
        );
        
        if (existingMealIndex >= 0) {
          // Actualizar comida existente
          const updatedMeals = [...plan.meals];
          updatedMeals[existingMealIndex] = meal;
          return { ...plan, meals: updatedMeals };
        } else {
          // Agregar nueva comida
          return { ...plan, meals: [...plan.meals, meal] };
        }
      }
      return plan;
    });
    
    setPlans(updatedPlans);
  };

  const removeMeal = (day: string, mealType: string) => {
    const updatedPlans = plans.map(plan => {
      if (plan.week_number === selectedWeek) {
        const filteredMeals = plan.meals.filter(meal => 
          !(meal.day === day && meal.meal_type === mealType)
        );
        return { ...plan, meals: filteredMeals };
      }
      return plan;
    });
    
    setPlans(updatedPlans);
  };

  const getDailyTotals = (day: string) => {
    const currentPlan = plans.find(p => p.week_number === selectedWeek);
    if (!currentPlan) return { calories: 0, protein: 0, carbs: 0, fats: 0 };
    
    const dayMeals = currentPlan.meals.filter(meal => meal.day === day);
    
    return dayMeals.reduce((totals, meal) => ({
      calories: totals.calories + meal.total_calories,
      protein: totals.protein + meal.total_protein,
      carbs: totals.carbs + meal.total_carbs,
      fats: totals.fats + meal.total_fats
    }), { calories: 0, protein: 0, carbs: 0, fats: 0 });
  };

  const getWeeklyTotals = () => {
    const currentPlan = plans.find(p => p.week_number === selectedWeek);
    if (!currentPlan) return { calories: 0, protein: 0, carbs: 0, fats: 0 };
    
    return currentPlan.meals.reduce((totals, meal) => ({
      calories: totals.calories + meal.total_calories,
      protein: totals.protein + meal.total_protein,
      carbs: totals.carbs + meal.total_carbs,
      fats: totals.fats + meal.total_fats
    }), { calories: 0, protein: 0, carbs: 0, fats: 0 });
  };

  const handleSave = () => {
    try {
      setLoading(true);
      onSave(plans);
      console.log('✅ Plan de comidas guardado exitosamente');
    } catch (error) {
      console.error('❌ Error guardando plan de comidas:', error);
    } finally {
      setLoading(false);
    }
  };

  const openMealModal = (day: string, mealType: string) => {
    const existingMeal = getMealForDayAndType(day, mealType);
    if (existingMeal) {
      setEditingMeal(existingMeal);
    } else {
      setEditingMeal(createEmptyMeal(day, mealType));
    }
    setShowMealModal(true);
  };

  return (
    <Modal show={isOpen} onHide={onClose} size="xl" centered>
      <Modal.Header closeButton>
        <Modal.Title className="d-flex align-items-center">
          <Calendar size={20} className="me-2 text-primary" />
          Planificador de Comidas - Semana {selectedWeek}
          <Badge bg="info" className="ms-2">
            {mealsPerDay} comidas/día
          </Badge>
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div className="row">
          {/* Selector de semana */}
          <div className="col-12 mb-3">
            <div className="d-flex justify-content-between align-items-center">
              <div className="d-flex align-items-center">
                <label className="me-2 fw-medium">Semana:</label>
                <select 
                  className="form-select w-auto"
                  value={selectedWeek}
                  onChange={(e) => setSelectedWeek(Number(e.target.value))}
                >
                  {plans.map(plan => (
                    <option key={plan.week_number} value={plan.week_number}>
                      Semana {plan.week_number}
                    </option>
                  ))}
                </select>
              </div>
              <div className="d-flex gap-2">
                <Button 
                  variant="outline-info" 
                  size="sm"
                  onClick={() => {
                    // Cargar comidas de ejemplo para demostración
                    const exampleMeals: Meal[] = [
                      {
                        id: 'meal_1',
                        day: 'Lunes',
                        meal_type: 'breakfast',
                        meal_time: '08:00',
                        meal_description: 'Avena con frutas y nueces, jugo de naranja natural',
                        total_calories: 450,
                        total_protein: 15,
                        total_carbs: 65,
                        total_fats: 12,
                        notes: 'Incluir 1 taza de avena, 1/2 taza de frutas mixtas, 2 cucharadas de nueces'
                      },
                      {
                        id: 'meal_2',
                        day: 'Lunes',
                        meal_type: 'lunch',
                        meal_time: '13:00',
                        meal_description: 'Pechuga de pollo a la plancha con arroz integral y ensalada',
                        total_calories: 650,
                        total_protein: 45,
                        total_carbs: 55,
                        total_fats: 18,
                        notes: '150g de pollo, 1/2 taza de arroz integral, ensalada verde con tomate'
                      },
                      {
                        id: 'meal_3',
                        day: 'Martes',
                        meal_type: 'breakfast',
                        meal_time: '08:00',
                        meal_description: 'Huevos revueltos con pan integral y aguacate',
                        total_calories: 520,
                        total_protein: 22,
                        total_carbs: 35,
                        total_fats: 28,
                        notes: '2 huevos, 2 rebanadas de pan integral, 1/4 aguacate'
                      },
                      {
                        id: 'meal_4',
                        day: 'Miércoles',
                        meal_type: 'dinner',
                        meal_time: '19:00',
                        meal_description: 'Salmón al horno con quinoa y brócoli',
                        total_calories: 580,
                        total_protein: 38,
                        total_carbs: 40,
                        total_fats: 25,
                        notes: '120g de salmón, 1/3 taza de quinoa, 1 taza de brócoli'
                      }
                    ];
                    
                    const updatedPlans = plans.map(plan => {
                      if (plan.week_number === selectedWeek) {
                        return {
                          ...plan,
                          meals: [...plan.meals, ...exampleMeals]
                        };
                      }
                      return plan;
                    });
                    
                    setPlans(updatedPlans);
                  }}
                >
                  📋 Cargar Ejemplo
                </Button>
                <Button 
                  variant="outline-primary" 
                  size="sm"
                  onClick={() => {
                    const newWeekNumber = Math.max(...plans.map(p => p.week_number)) + 1;
                    const newPlan: WeeklyPlan = {
                      week_number: newWeekNumber,
                      start_date: new Date().toISOString().split('T')[0],
                      end_date: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                      daily_calories_target: 2000,
                      daily_macros_target: { protein: 150, carbohydrates: 225, fats: 56 },
                      meals: [],
                      notes: ''
                    };
                    setPlans([...plans, newPlan]);
                    setSelectedWeek(newWeekNumber);
                  }}
                >
                  <Plus size={16} className="me-1" />
                  Nueva Semana
                </Button>
              </div>
            </div>
          </div>

          {/* Tabla de comidas */}
          <div className="col-12">
            <div className="table-responsive">
              <table className="table table-bordered">
                <thead className="table-light">
                  <tr>
                    <th style={{ width: '120px' }}>Comida</th>
                    {daysOfWeek.map(day => (
                      <th key={day} className="text-center" style={{ width: '140px' }}>
                        {day}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {mealTypes.map(mealType => (
                    <tr key={mealType.key}>
                      <td className="align-middle">
                        <div className="d-flex align-items-center">
                          <span className="me-2">{mealType.icon}</span>
                          <span className="fw-medium">{mealType.label}</span>
                        </div>
                      </td>
                      {daysOfWeek.map(day => {
                        const meal = getMealForDayAndType(day, mealType.key);
                        return (
                          <td key={`${day}-${mealType.key}`} className="text-center align-middle">
                            {meal ? (
                              <div className="meal-cell">
                                <div className="fw-medium small">{meal.meal_description}</div>
                                <div className="text-muted small">
                                  {meal.total_calories} kcal
                                </div>
                                <div className="btn-group btn-group-sm mt-1">
                                  <Button 
                                    variant="outline-primary" 
                                    size="sm"
                                    onClick={() => openMealModal(day, mealType.key)}
                                  >
                                    <Edit size={12} />
                                  </Button>
                                  <Button 
                                    variant="outline-danger" 
                                    size="sm"
                                    onClick={() => removeMeal(day, mealType.key)}
                                  >
                                    <Trash2 size={12} />
                                  </Button>
                                </div>
                              </div>
                            ) : (
                              <Button 
                                variant="outline-secondary" 
                                size="sm"
                                onClick={() => openMealModal(day, mealType.key)}
                                className="w-100"
                              >
                                <Plus size={14} />
                                Agregar
                              </Button>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                  
                  {/* Totales diarios */}
                  <tr className="table-info">
                    <td className="fw-bold">TOTALES DEL DÍA</td>
                    {daysOfWeek.map(day => {
                      const totals = getDailyTotals(day);
                      return (
                        <td key={`total-${day}`} className="text-center">
                          <div className="fw-bold small">
                            {totals.calories} kcal
                          </div>
                          <div className="text-muted small">
                            P: {totals.protein}g | C: {totals.carbs}g | G: {totals.fats}g
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Totales semanales */}
          <div className="col-12 mt-3">
            <div className="card bg-light">
              <div className="card-body">
                <h6 className="card-title">Totales de la Semana</h6>
                <div className="row text-center">
                  {(() => {
                    const weeklyTotals = getWeeklyTotals();
                    return (
                      <>
                        <div className="col-3">
                          <div className="fw-bold text-primary">{weeklyTotals.calories} kcal</div>
                          <small className="text-muted">Calorías</small>
                        </div>
                        <div className="col-3">
                          <div className="fw-bold text-success">{weeklyTotals.protein}g</div>
                          <small className="text-muted">Proteínas</small>
                        </div>
                        <div className="col-3">
                          <div className="fw-bold text-warning">{weeklyTotals.carbs}g</div>
                          <small className="text-muted">Carbohidratos</small>
                        </div>
                        <div className="col-3">
                          <div className="fw-bold text-danger">{weeklyTotals.fats}g</div>
                          <small className="text-muted">Grasas</small>
                        </div>
                      </>
                    );
                  })()}
                </div>
              </div>
            </div>
          </div>
        </div>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onClose}>
          Cancelar
        </Button>
        <Button variant="primary" onClick={handleSave} disabled={loading}>
          {loading ? 'Guardando...' : 'Guardar Plan'}
        </Button>
      </Modal.Footer>

      {/* Modal para agregar/editar comida */}
      <Modal 
        show={showMealModal} 
        onHide={() => {
          setShowMealModal(false);
          setEditingMeal(null);
        }}
        size="lg"
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>
            {editingMeal ? 'Editar Comida' : 'Agregar Comida'}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <MealForm 
            meal={editingMeal}
            mealTypes={mealTypes}
            onSave={(meal) => {
              addOrEditMeal(meal);
              setShowMealModal(false);
              setEditingMeal(null);
            }}
            onCancel={() => {
              setShowMealModal(false);
              setEditingMeal(null);
            }}
          />
        </Modal.Body>
      </Modal>
    </Modal>
  );
};

// Componente para el formulario de comida
interface MealFormProps {
  meal: Meal | null;
  mealTypes: Array<{ key: string; label: string; icon: string }>;
  onSave: (meal: Meal) => void;
  onCancel: () => void;
}

const MealForm: React.FC<MealFormProps> = ({ meal, mealTypes, onSave, onCancel }) => {
  const [formData, setFormData] = useState<Meal>({
    id: meal?.id || `meal_${Date.now()}`,
    day: meal?.day || 'Lunes',
    meal_type: meal?.meal_type || 'breakfast',
    meal_time: meal?.meal_time || '08:00',
    meal_description: meal?.meal_description || '',
    notes: meal?.notes || '',
    total_calories: meal?.total_calories || 0,
    total_protein: meal?.total_protein || 0,
    total_carbs: meal?.total_carbs || 0,
    total_fats: meal?.total_fats || 0
  });

  const daysOfWeek = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <Form onSubmit={handleSubmit}>
      <div className="row">
        <div className="col-md-6">
          <Form.Group className="mb-3">
            <Form.Label>Día</Form.Label>
            <Form.Select
              value={formData.day}
              onChange={(e) => setFormData({ ...formData, day: e.target.value })}
            >
              {daysOfWeek.map(day => (
                <option key={day} value={day}>{day}</option>
              ))}
            </Form.Select>
          </Form.Group>
        </div>
        <div className="col-md-6">
          <Form.Group className="mb-3">
            <Form.Label>Tipo de Comida</Form.Label>
            <Form.Select
              value={formData.meal_type}
              onChange={(e) => setFormData({ ...formData, meal_type: e.target.value as any })}
            >
              {mealTypes.map(type => (
                <option key={type.key} value={type.key}>
                  {type.icon} {type.label}
                </option>
              ))}
            </Form.Select>
          </Form.Group>
        </div>
      </div>

      <div className="row">
        <div className="col-md-6">
          <Form.Group className="mb-3">
            <Form.Label>Horario</Form.Label>
            <Form.Control
              type="time"
              value={formData.meal_time}
              onChange={(e) => setFormData({ ...formData, meal_time: e.target.value })}
            />
          </Form.Group>
        </div>
      </div>

      <Form.Group className="mb-3">
        <Form.Label>Descripción de la Comida *</Form.Label>
        <Form.Control
          as="textarea"
          rows={3}
          placeholder="Describe qué comerá el paciente (ej: Avena con frutas, yogurt griego, 1 manzana)"
          value={formData.meal_description}
          onChange={(e) => setFormData({ ...formData, meal_description: e.target.value })}
          required
        />
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Label>Notas Adicionales</Form.Label>
        <Form.Control
          as="textarea"
          rows={2}
          placeholder="Notas especiales, preparación, etc."
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
        />
      </Form.Group>

      <div className="alert alert-info">
        <strong>Totales Nutricionales de esta Comida:</strong>
        <div className="row mt-2">
          <div className="col-md-3">
            <Form.Group>
              <Form.Label>Calorías (kcal)</Form.Label>
              <Form.Control
                type="number"
                min="0"
                value={formData.total_calories}
                onChange={(e) => setFormData({ ...formData, total_calories: Number(e.target.value) })}
              />
            </Form.Group>
          </div>
          <div className="col-md-3">
            <Form.Group>
              <Form.Label>Proteínas (g)</Form.Label>
              <Form.Control
                type="number"
                min="0"
                step="0.1"
                value={formData.total_protein}
                onChange={(e) => setFormData({ ...formData, total_protein: Number(e.target.value) })}
              />
            </Form.Group>
          </div>
          <div className="col-md-3">
            <Form.Group>
              <Form.Label>Carbohidratos (g)</Form.Label>
              <Form.Control
                type="number"
                min="0"
                step="0.1"
                value={formData.total_carbs}
                onChange={(e) => setFormData({ ...formData, total_carbs: Number(e.target.value) })}
              />
            </Form.Group>
          </div>
          <div className="col-md-3">
            <Form.Group>
              <Form.Label>Grasas (g)</Form.Label>
              <Form.Control
                type="number"
                min="0"
                step="0.1"
                value={formData.total_fats}
                onChange={(e) => setFormData({ ...formData, total_fats: Number(e.target.value) })}
              />
            </Form.Group>
          </div>
        </div>
      </div>

      <div className="d-flex justify-content-end gap-2">
        <Button variant="secondary" onClick={onCancel}>
          Cancelar
        </Button>
        <Button variant="primary" type="submit">
          Guardar Comida
        </Button>
      </div>
    </Form>
  );
};

export default MealPlanner; 