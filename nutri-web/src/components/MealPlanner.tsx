import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Trash2, 
  Clock, 
  Calendar, 
  Target, 
  Search,
  Edit,
  Save,
  X,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';
import { Button, Modal, Alert, Form, Badge } from 'react-bootstrap';

interface Food {
  id: string;
  name: string;
  calories_per_100g: number;
  protein_per_100g: number;
  carbs_per_100g: number;
  fats_per_100g: number;
  category: string;
}

interface MealFood {
  food_id: string;
  food_name: string;
  quantity_grams: number;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
}

interface Meal {
  id?: string;
  day: string;
  meal_type: 'breakfast' | 'morning_snack' | 'lunch' | 'afternoon_snack' | 'dinner' | 'evening_snack';
  meal_time: string;
  foods: MealFood[];
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
}

const MealPlanner: React.FC<MealPlannerProps> = ({
  weeklyPlans,
  onSave,
  onClose,
  isOpen
}) => {
  const [plans, setPlans] = useState<WeeklyPlan[]>(weeklyPlans);
  const [selectedWeek, setSelectedWeek] = useState<number>(1);
  const [selectedDay, setSelectedDay] = useState<string>('Lunes');
  const [selectedMealType, setSelectedMealType] = useState<string>('breakfast');
  const [showFoodModal, setShowFoodModal] = useState(false);
  const [editingMeal, setEditingMeal] = useState<Meal | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [foods, setFoods] = useState<Food[]>([]);
  const [loading, setLoading] = useState(false);

  // Días de la semana
  const daysOfWeek = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
  
  // Tipos de comidas
  const mealTypes = [
    { key: 'breakfast', label: 'Desayuno', icon: '🌅' },
    { key: 'morning_snack', label: 'Merienda Mañana', icon: '☕' },
    { key: 'lunch', label: 'Almuerzo', icon: '🍽️' },
    { key: 'afternoon_snack', label: 'Merienda Tarde', icon: '🍎' },
    { key: 'dinner', label: 'Cena', icon: '🌙' },
    { key: 'evening_snack', label: 'Merienda Noche', icon: '🥛' }
  ];

  // Horarios por defecto
  const defaultMealTimes = {
    breakfast: '08:00',
    morning_snack: '10:30',
    lunch: '13:00',
    afternoon_snack: '16:00',
    dinner: '19:00',
    evening_snack: '21:00'
  };

  useEffect(() => {
    loadFoods();
  }, []);

  const loadFoods = async () => {
    try {
      setLoading(true);
      // Aquí cargarías los alimentos desde tu API
      // Por ahora usamos datos de ejemplo
      const mockFoods: Food[] = [
        {
          id: '1',
          name: 'Pollo (pechuga)',
          calories_per_100g: 165,
          protein_per_100g: 31,
          carbs_per_100g: 0,
          fats_per_100g: 3.6,
          category: 'Proteínas'
        },
        {
          id: '2',
          name: 'Arroz integral',
          calories_per_100g: 111,
          protein_per_100g: 2.6,
          carbs_per_100g: 23,
          fats_per_100g: 0.9,
          category: 'Carbohidratos'
        },
        {
          id: '3',
          name: 'Brócoli',
          calories_per_100g: 34,
          protein_per_100g: 2.8,
          carbs_per_100g: 7,
          fats_per_100g: 0.4,
          category: 'Verduras'
        },
        {
          id: '4',
          name: 'Aguacate',
          calories_per_100g: 160,
          protein_per_100g: 2,
          carbs_per_100g: 9,
          fats_per_100g: 15,
          category: 'Grasas saludables'
        },
        {
          id: '5',
          name: 'Huevo',
          calories_per_100g: 155,
          protein_per_100g: 13,
          carbs_per_100g: 1.1,
          fats_per_100g: 11,
          category: 'Proteínas'
        },
        {
          id: '6',
          name: 'Avena',
          calories_per_100g: 389,
          protein_per_100g: 17,
          carbs_per_100g: 66,
          fats_per_100g: 7,
          category: 'Carbohidratos'
        },
        {
          id: '7',
          name: 'Leche descremada',
          calories_per_100g: 42,
          protein_per_100g: 3.4,
          carbs_per_100g: 5,
          fats_per_100g: 0.1,
          category: 'Lácteos'
        },
        {
          id: '8',
          name: 'Plátano',
          calories_per_100g: 89,
          protein_per_100g: 1.1,
          carbs_per_100g: 23,
          fats_per_100g: 0.3,
          category: 'Frutas'
        }
      ];
      setFoods(mockFoods);
    } catch (error) {
      console.error('Error loading foods:', error);
    } finally {
      setLoading(false);
    }
  };

  const getCurrentPlan = () => {
    return plans.find(plan => plan.week_number === selectedWeek) || plans[0];
  };

  const getMealForDayAndType = (day: string, mealType: string): Meal | null => {
    const plan = getCurrentPlan();
    if (!plan) return null;
    
    return plan.meals.find(meal => 
      meal.day === day && meal.meal_type === mealType
    ) || null;
  };

  const createEmptyMeal = (day: string, mealType: string): Meal => {
    return {
      day,
      meal_type: mealType as any,
      meal_time: defaultMealTimes[mealType as keyof typeof defaultMealTimes] || '12:00',
      foods: [],
      notes: '',
      total_calories: 0,
      total_protein: 0,
      total_carbs: 0,
      total_fats: 0
    };
  };

  const addFoodToMeal = (food: Food, quantity: number) => {
    const mealFood: MealFood = {
      food_id: food.id,
      food_name: food.name,
      quantity_grams: quantity,
      calories: Math.round((food.calories_per_100g * quantity) / 100),
      protein: Math.round((food.protein_per_100g * quantity) / 100 * 10) / 10,
      carbs: Math.round((food.carbs_per_100g * quantity) / 100 * 10) / 10,
      fats: Math.round((food.fats_per_100g * quantity) / 100 * 10) / 10
    };

    const currentMeal = getMealForDayAndType(selectedDay, selectedMealType);
    let updatedMeal: Meal;

    if (currentMeal) {
      updatedMeal = {
        ...currentMeal,
        foods: [...currentMeal.foods, mealFood]
      };
    } else {
      updatedMeal = createEmptyMeal(selectedDay, selectedMealType);
      updatedMeal.foods = [mealFood];
    }

    // Calcular totales
    updatedMeal.total_calories = updatedMeal.foods.reduce((sum, f) => sum + f.calories, 0);
    updatedMeal.total_protein = updatedMeal.foods.reduce((sum, f) => sum + f.protein, 0);
    updatedMeal.total_carbs = updatedMeal.foods.reduce((sum, f) => sum + f.carbs, 0);
    updatedMeal.total_fats = updatedMeal.foods.reduce((sum, f) => sum + f.fats, 0);

    updateMealInPlan(updatedMeal);
    setShowFoodModal(false);
  };

  const removeFoodFromMeal = (foodIndex: number) => {
    const currentMeal = getMealForDayAndType(selectedDay, selectedMealType);
    if (!currentMeal) return;

    const updatedMeal = {
      ...currentMeal,
      foods: currentMeal.foods.filter((_, index) => index !== foodIndex)
    };

    // Recalcular totales
    updatedMeal.total_calories = updatedMeal.foods.reduce((sum, f) => sum + f.calories, 0);
    updatedMeal.total_protein = updatedMeal.foods.reduce((sum, f) => sum + f.protein, 0);
    updatedMeal.total_carbs = updatedMeal.foods.reduce((sum, f) => sum + f.carbs, 0);
    updatedMeal.total_fats = updatedMeal.foods.reduce((sum, f) => sum + f.fats, 0);

    updateMealInPlan(updatedMeal);
  };

  const updateMealInPlan = (updatedMeal: Meal) => {
    const plan = getCurrentPlan();
    if (!plan) return;

    const updatedPlan = {
      ...plan,
      meals: plan.meals.filter(meal => 
        !(meal.day === updatedMeal.day && meal.meal_type === updatedMeal.meal_type)
      )
    };

    if (updatedMeal.foods.length > 0) {
      updatedPlan.meals.push(updatedMeal);
    }

    const updatedPlans = plans.map(p => 
      p.week_number === selectedWeek ? updatedPlan : p
    );

    setPlans(updatedPlans);
  };

  const getDailyTotals = (day: string) => {
    const plan = getCurrentPlan();
    if (!plan) return { calories: 0, protein: 0, carbs: 0, fats: 0 };

    const dayMeals = plan.meals.filter(meal => meal.day === day);
    
    return {
      calories: dayMeals.reduce((sum, meal) => sum + meal.total_calories, 0),
      protein: dayMeals.reduce((sum, meal) => sum + meal.total_protein, 0),
      carbs: dayMeals.reduce((sum, meal) => sum + meal.total_carbs, 0),
      fats: dayMeals.reduce((sum, meal) => sum + meal.total_fats, 0)
    };
  };

  const getWeeklyTotals = () => {
    const plan = getCurrentPlan();
    if (!plan) return { calories: 0, protein: 0, carbs: 0, fats: 0 };

    return {
      calories: plan.meals.reduce((sum, meal) => sum + meal.total_calories, 0),
      protein: plan.meals.reduce((sum, meal) => sum + meal.total_protein, 0),
      carbs: plan.meals.reduce((sum, meal) => sum + meal.total_carbs, 0),
      fats: plan.meals.reduce((sum, meal) => sum + meal.total_fats, 0)
    };
  };

  const handleSave = () => {
    onSave(plans);
  };

  const filteredFoods = foods.filter(food =>
    food.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    food.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Modal show={isOpen} onHide={onClose} size="xl" centered>
      <Modal.Header closeButton>
        <Modal.Title>
          <Calendar size={20} className="me-2" />
          Planificador de Comidas - Semana {selectedWeek}
        </Modal.Title>
      </Modal.Header>
      
      <Modal.Body>
        {/* Selector de semana */}
        <div className="mb-4">
          <div className="d-flex justify-content-between align-items-center">
            <div className="d-flex gap-2">
              {plans.map(plan => (
                <Button
                  key={plan.week_number}
                  variant={selectedWeek === plan.week_number ? 'primary' : 'outline-primary'}
                  size="sm"
                  onClick={() => setSelectedWeek(plan.week_number)}
                >
                  Semana {plan.week_number}
                </Button>
              ))}
            </div>
            
            <div className="d-flex gap-2">
              <Button variant="success" onClick={handleSave}>
                <Save size={16} className="me-1" />
                Guardar Plan
              </Button>
            </div>
          </div>
        </div>

        {/* Resumen semanal */}
        <div className="row mb-4">
          <div className="col-md-3">
            <div className="card border-0 bg-light">
              <div className="card-body text-center">
                <h6 className="text-muted">Calorías Totales</h6>
                <h4 className="text-primary">{getWeeklyTotals().calories} kcal</h4>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card border-0 bg-light">
              <div className="card-body text-center">
                <h6 className="text-muted">Proteínas</h6>
                <h4 className="text-success">{getWeeklyTotals().protein}g</h4>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card border-0 bg-light">
              <div className="card-body text-center">
                <h6 className="text-muted">Carbohidratos</h6>
                <h4 className="text-warning">{getWeeklyTotals().carbs}g</h4>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card border-0 bg-light">
              <div className="card-body text-center">
                <h6 className="text-muted">Grasas</h6>
                <h4 className="text-info">{getWeeklyTotals().fats}g</h4>
              </div>
            </div>
          </div>
        </div>

        {/* Planificador principal */}
        <div className="row">
          {/* Selector de días */}
          <div className="col-md-2">
            <div className="d-flex flex-column gap-2">
              {daysOfWeek.map(day => (
                <Button
                  key={day}
                  variant={selectedDay === day ? 'primary' : 'outline-secondary'}
                  size="sm"
                  onClick={() => setSelectedDay(day)}
                >
                  {day}
                </Button>
              ))}
            </div>
            
            {/* Totales del día seleccionado */}
            <div className="mt-3 p-3 bg-light rounded">
              <h6 className="text-muted">Totales del día</h6>
              <div className="small">
                <div>Calorías: {getDailyTotals(selectedDay).calories} kcal</div>
                <div>Proteínas: {getDailyTotals(selectedDay).protein}g</div>
                <div>Carbohidratos: {getDailyTotals(selectedDay).carbs}g</div>
                <div>Grasas: {getDailyTotals(selectedDay).fats}g</div>
              </div>
            </div>
          </div>

          {/* Planificador de comidas */}
          <div className="col-md-10">
            <div className="row">
              {mealTypes.map(mealType => (
                <div key={mealType.key} className="col-md-6 mb-3">
                  <div className="card h-100">
                    <div className="card-header d-flex justify-content-between align-items-center">
                      <h6 className="mb-0">
                        {mealType.icon} {mealType.label}
                      </h6>
                      <Button
                        size="sm"
                        variant="outline-primary"
                        onClick={() => {
                          setSelectedMealType(mealType.key);
                          setShowFoodModal(true);
                        }}
                      >
                        <Plus size={14} />
                      </Button>
                    </div>
                    <div className="card-body">
                      {(() => {
                        const meal = getMealForDayAndType(selectedDay, mealType.key);
                        return meal ? (
                          <div>
                            <div className="d-flex justify-content-between align-items-center mb-2">
                              <small className="text-muted">
                                <Clock size={12} className="me-1" />
                                {meal.meal_time}
                              </small>
                              <Badge bg="success">
                                {meal.total_calories} kcal
                              </Badge>
                            </div>
                            
                            {meal.foods.map((food, index) => (
                              <div key={index} className="d-flex justify-content-between align-items-center mb-1">
                                <div className="small">
                                  {food.food_name} ({food.quantity_grams}g)
                                </div>
                                <Button
                                  size="sm"
                                  variant="outline-danger"
                                  onClick={() => removeFoodFromMeal(index)}
                                >
                                  <Trash2 size={12} />
                                </Button>
                              </div>
                            ))}
                            
                            {meal.notes && (
                              <div className="mt-2">
                                <small className="text-muted">{meal.notes}</small>
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="text-center text-muted">
                            <small>Sin comidas planificadas</small>
                          </div>
                        );
                      })()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Modal.Body>

      {/* Modal para agregar alimentos */}
      <Modal show={showFoodModal} onHide={() => setShowFoodModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Agregar Alimento</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="mb-3">
            <Form.Control
              type="text"
              placeholder="Buscar alimentos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="row">
            {filteredFoods.map(food => (
              <div key={food.id} className="col-md-6 mb-2">
                <FoodItem 
                  food={food} 
                  onAdd={addFoodToMeal}
                />
              </div>
            ))}
          </div>
        </Modal.Body>
      </Modal>
    </Modal>
  );
};

// Componente para mostrar un alimento
interface FoodItemProps {
  food: Food;
  onAdd: (food: Food, quantity: number) => void;
}

const FoodItem: React.FC<FoodItemProps> = ({ food, onAdd }) => {
  const [quantity, setQuantity] = useState(100);

  return (
    <div className="card border">
      <div className="card-body p-2">
        <h6 className="card-title mb-1">{food.name}</h6>
        <small className="text-muted">{food.category}</small>
        
        <div className="row text-center mt-2">
          <div className="col-3">
            <small className="text-muted">Cal</small>
            <div className="fw-bold">{food.calories_per_100g}</div>
          </div>
          <div className="col-3">
            <small className="text-muted">Prot</small>
            <div className="fw-bold">{food.protein_per_100g}g</div>
          </div>
          <div className="col-3">
            <small className="text-muted">Carb</small>
            <div className="fw-bold">{food.carbs_per_100g}g</div>
          </div>
          <div className="col-3">
            <small className="text-muted">Gras</small>
            <div className="fw-bold">{food.fats_per_100g}g</div>
          </div>
        </div>
        
        <div className="d-flex gap-2 mt-2">
          <Form.Control
            type="number"
            size="sm"
            value={quantity}
            onChange={(e) => setQuantity(Number(e.target.value))}
            min="1"
          />
          <Button
            size="sm"
            variant="primary"
            onClick={() => onAdd(food, quantity)}
          >
            Agregar
          </Button>
        </div>
      </div>
    </div>
  );
};

export default MealPlanner; 