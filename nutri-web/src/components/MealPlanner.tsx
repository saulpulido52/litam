import React, { useState, useEffect } from 'react';
import { 
  Plus,
  Trash2,
  Calendar,
  Save,
  Target,
  CheckCircle,
  Shield,
  Utensils
} from 'lucide-react';
import { Button, Modal, Badge, Alert, Card, Row, Col } from 'react-bootstrap';

interface Food {
  id: string;
  name: string;
  calories_per_100g: number;
  protein_per_100g: number;
  carbs_per_100g: number;
  fats_per_100g: number;
  category: string;
  glycemic_index?: number;
  sodium_content?: number;
  potassium_content?: number;
  phosphorus_content?: number;
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

// Usar la interfaz DietPlan del tipo diet.ts
import type { DietPlan } from '../types/diet';

interface MealPlannerProps {
  weeklyPlans: WeeklyPlan[];
  dietPlan: DietPlan;
  onSave: (weeklyPlans: WeeklyPlan[]) => void;
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
  const [plans, setPlans] = useState<WeeklyPlan[]>(weeklyPlans);
  const [selectedWeek, setSelectedWeek] = useState<number>(1);
  const [selectedDay, setSelectedDay] = useState<string>('Lunes');

  const [showFoodModal, setShowFoodModal] = useState(false);
  const [editingMeal, setEditingMeal] = useState<Meal | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [foods, setFoods] = useState<Food[]>([]);

  const [activeTab, setActiveTab] = useState<'planner' | 'restrictions' | 'objectives' | 'shopping'>('planner');
  const [showAddFoodModal, setShowAddFoodModal] = useState(false);
  const [customFood, setCustomFood] = useState({
    name: '',
    category: '',
    calories_per_100g: 0,
    protein_per_100g: 0,
    carbs_per_100g: 0,
    fats_per_100g: 0
  });

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

  // Categorías de supermercado
  const shoppingCategories = [
    { name: 'Frutas y Verduras', icon: '🥬', color: 'success' },
    { name: 'Proteínas', icon: '🥩', color: 'danger' },
    { name: 'Lácteos', icon: '🥛', color: 'info' },
    { name: 'Cereales y Granos', icon: '🌾', color: 'warning' },
    { name: 'Grasas Saludables', icon: '🥑', color: 'primary' },
    { name: 'Condimentos', icon: '🧂', color: 'secondary' },
    { name: 'Otros', icon: '📦', color: 'dark' }
  ];

  // Extraer restricciones del plan nutricional
  const restrictions = dietPlan.pathological_restrictions || {};
  const mealFrequency = dietPlan.meal_frequency || {};
  const mealTiming = dietPlan.meal_timing || {};
  const flexibilitySettings = dietPlan.flexibility_settings || {};

  // Función para determinar qué tipos de comidas están habilitados basándose en la configuración
  const getEnabledMealTypes = () => {
    // Si no hay configuración específica, mostrar todas las comidas
    if (!mealFrequency || Object.keys(mealFrequency).length === 0) {
      return mealTypes;
    }

    // Filtrar solo los tipos de comidas que están habilitados
    return mealTypes.filter(type => mealFrequency[type.key as keyof typeof mealFrequency]);
  };

  // Obtener los tipos de comidas habilitados
  const enabledMealTypes = getEnabledMealTypes();

  useEffect(() => {
    loadFoods();
  }, []);

  useEffect(() => {
    filterFoodsByRestrictions();
  }, [foods, restrictions]);

  const loadFoods = async () => {
    try {
      // Alimentos base con información nutricional detallada
      const mockFoods: Food[] = [
        {
          id: '1',
          name: 'Pollo (pechuga)',
          calories_per_100g: 165,
          protein_per_100g: 31,
          carbs_per_100g: 0,
          fats_per_100g: 3.6,
          category: 'Proteínas',
          glycemic_index: 0,
          sodium_content: 74
        },
        {
          id: '2',
          name: 'Arroz integral',
          calories_per_100g: 111,
          protein_per_100g: 2.6,
          carbs_per_100g: 23,
          fats_per_100g: 0.9,
          category: 'Carbohidratos',
          glycemic_index: 55,
          sodium_content: 5
        },
        {
          id: '3',
          name: 'Brócoli',
          calories_per_100g: 34,
          protein_per_100g: 2.8,
          carbs_per_100g: 7,
          fats_per_100g: 0.4,
          category: 'Verduras',
          glycemic_index: 15,
          sodium_content: 33,
          potassium_content: 316
        },
        {
          id: '4',
          name: 'Aguacate',
          calories_per_100g: 160,
          protein_per_100g: 2,
          carbs_per_100g: 9,
          fats_per_100g: 15,
          category: 'Grasas saludables',
          glycemic_index: 15,
          sodium_content: 7,
          potassium_content: 485
        },
        {
          id: '5',
          name: 'Huevo',
          calories_per_100g: 155,
          protein_per_100g: 13,
          carbs_per_100g: 1.1,
          fats_per_100g: 11,
          category: 'Proteínas',
          glycemic_index: 0,
          sodium_content: 124
        },
        {
          id: '6',
          name: 'Avena',
          calories_per_100g: 389,
          protein_per_100g: 17,
          carbs_per_100g: 66,
          fats_per_100g: 7,
          category: 'Carbohidratos',
          glycemic_index: 55,
          sodium_content: 2
        },
        {
          id: '7',
          name: 'Leche descremada',
          calories_per_100g: 42,
          protein_per_100g: 3.4,
          carbs_per_100g: 5,
          fats_per_100g: 0.1,
          category: 'Lácteos',
          glycemic_index: 30,
          sodium_content: 44,
          potassium_content: 150
        },
        {
          id: '8',
          name: 'Plátano',
          calories_per_100g: 89,
          protein_per_100g: 1.1,
          carbs_per_100g: 23,
          fats_per_100g: 0.3,
          category: 'Frutas',
          glycemic_index: 51,
          sodium_content: 1,
          potassium_content: 358
        },
        {
          id: '9',
          name: 'Salmón',
          calories_per_100g: 208,
          protein_per_100g: 25,
          carbs_per_100g: 0,
          fats_per_100g: 12,
          category: 'Proteínas',
          glycemic_index: 0,
          sodium_content: 59,
          potassium_content: 363
        },
        {
          id: '10',
          name: 'Quinoa',
          calories_per_100g: 120,
          protein_per_100g: 4.4,
          carbs_per_100g: 22,
          fats_per_100g: 1.9,
          category: 'Carbohidratos',
          glycemic_index: 53,
          sodium_content: 7,
          potassium_content: 172
        }
      ];
      setFoods(mockFoods);
    } catch (error) {
      console.error('Error loading foods:', error);
    }
  };

  const filterFoodsByRestrictions = () => {
    // Por ahora, mostrar todos los alimentos disponibles
    // En el futuro, se puede implementar filtrado basado en restricciones
    // Foods are now filtered dynamically
  };

  const getCurrentPlan = () => {
    return plans.find(plan => plan.week_number === selectedWeek) || plans[0];
  };

  const getMealForDayAndType = (day: string, mealType: string): Meal | null => {
    const currentPlan = getCurrentPlan();
    if (!currentPlan) return null;
    
    return currentPlan.meals.find(meal => 
      meal.day === day && meal.meal_type === mealType
    ) || null;
  };

  const createEmptyMeal = (day: string, mealType: string): Meal => {
    const defaultTime = (mealTiming as any)[mealType] || '08:00';
    
    return {
      day,
      meal_type: mealType as 'breakfast' | 'morning_snack' | 'lunch' | 'afternoon_snack' | 'dinner' | 'evening_snack',
      meal_time: defaultTime,
      foods: [],
      total_calories: 0,
      total_protein: 0,
      total_carbs: 0,
      total_fats: 0
    };
  };

  const addFoodToMeal = (food: Food, quantity: number) => {
    const calories = (food.calories_per_100g * quantity) / 100;
    const protein = (food.protein_per_100g * quantity) / 100;
    const carbs = (food.carbs_per_100g * quantity) / 100;
    const fats = (food.fats_per_100g * quantity) / 100;

    const mealFood: MealFood = {
      food_id: food.id,
      food_name: food.name,
      quantity_grams: quantity,
      calories,
      protein,
      carbs,
      fats
    };

    if (editingMeal) {
      const updatedMeal = {
        ...editingMeal,
        foods: [...editingMeal.foods, mealFood],
        total_calories: editingMeal.total_calories + calories,
        total_protein: editingMeal.total_protein + protein,
        total_carbs: editingMeal.total_carbs + carbs,
        total_fats: editingMeal.total_fats + fats
      };
      updateMealInPlan(updatedMeal);
    }
  };

  const removeFoodFromMeal = (foodIndex: number) => {
    if (editingMeal) {
      const foodToRemove = editingMeal.foods[foodIndex];
      const updatedMeal = {
        ...editingMeal,
        foods: editingMeal.foods.filter((_, index) => index !== foodIndex),
        total_calories: editingMeal.total_calories - foodToRemove.calories,
        total_protein: editingMeal.total_protein - foodToRemove.protein,
        total_carbs: editingMeal.total_carbs - foodToRemove.carbs,
        total_fats: editingMeal.total_fats - foodToRemove.fats
      };
      updateMealInPlan(updatedMeal);
    }
  };

  const updateMealInPlan = (updatedMeal: Meal) => {
    const currentPlan = getCurrentPlan();
    if (!currentPlan) return;

    const updatedPlans = plans.map(plan => {
      if (plan.week_number === selectedWeek) {
        const existingMealIndex = plan.meals.findIndex(meal => 
          meal.day === updatedMeal.day && meal.meal_type === updatedMeal.meal_type
        );

        if (existingMealIndex >= 0) {
          // Actualizar comida existente
          const updatedMeals = [...plan.meals];
          updatedMeals[existingMealIndex] = updatedMeal;
          return { ...plan, meals: updatedMeals };
        } else {
          // Agregar nueva comida
          return { ...plan, meals: [...plan.meals, updatedMeal] };
        }
      }
      return plan;
    });

    setPlans(updatedPlans);
    setEditingMeal(updatedMeal);
  };

  const getDailyTotals = (day: string) => {
    const currentPlan = getCurrentPlan();
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
    const currentPlan = getCurrentPlan();
    if (!currentPlan) return { calories: 0, protein: 0, carbs: 0, fats: 0 };

    return currentPlan.meals.reduce((totals, meal) => ({
      calories: totals.calories + meal.total_calories,
      protein: totals.protein + meal.total_protein,
      carbs: totals.carbs + meal.total_carbs,
      fats: totals.fats + meal.total_fats
    }), { calories: 0, protein: 0, carbs: 0, fats: 0 });
  };

  const handleSave = () => {
    onSave(plans);
  };

  // Función para generar la lista de supermercado
  const generateShoppingList = () => {
    const shoppingList: { [category: string]: { [foodName: string]: number } } = {};
    
    // Recorrer todos los planes (semanas)
    plans.forEach(plan => {
      // Recorrer todas las comidas de la semana
      plan.meals.forEach(meal => {
        // Recorrer todos los alimentos de cada comida
        meal.foods.forEach(food => {
          // Buscar la categoría del alimento en la lista de alimentos disponibles
          const foodInfo = foods.find(f => f.id === food.food_id);
          const category = foodInfo?.category || 'Otros';
          const foodName = food.food_name;
          const quantity = food.quantity_grams;
          
          if (!shoppingList[category]) {
            shoppingList[category] = {};
          }
          
          if (!shoppingList[category][foodName]) {
            shoppingList[category][foodName] = 0;
          }
          
          shoppingList[category][foodName] += quantity;
        });
      });
    });
    
    return shoppingList;
  };

  // Función para obtener el total de semanas
  const getTotalWeeks = () => {
    return plans.length;
  };

  // Función para formatear cantidades
  const formatQuantity = (grams: number) => {
    if (grams >= 1000) {
      return `${(grams / 1000).toFixed(1)} kg`;
    } else {
      return `${grams}g`;
    }
  };

  const addCustomFood = () => {
    if (!customFood.name || !customFood.category) {
      alert('Por favor completa el nombre y categoría del alimento');
      return;
    }

    const newCustomFood: Food = {
      id: `custom_${Date.now()}`,
      name: customFood.name,
      category: customFood.category,
      calories_per_100g: customFood.calories_per_100g,
      protein_per_100g: customFood.protein_per_100g,
      carbs_per_100g: customFood.carbs_per_100g,
      fats_per_100g: customFood.fats_per_100g
    };

    setFoods(prev => [...prev, newCustomFood]);
    setCustomFood({
      name: '',
      category: '',
      calories_per_100g: 0,
      protein_per_100g: 0,
      carbs_per_100g: 0,
      fats_per_100g: 0
    });
    setShowAddFoodModal(false);
  };

  const resetCustomFood = () => {
    setCustomFood({
      name: '',
      category: '',
      calories_per_100g: 0,
      protein_per_100g: 0,
      carbs_per_100g: 0,
      fats_per_100g: 0
    });
  };

  const filteredFoods = foods.filter(food => 
    food.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    food.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Modal show={isOpen} onHide={onClose} size="xl" centered>
      <Modal.Header closeButton>
        <Modal.Title>
          <div className="d-flex align-items-center">
            <Utensils className="me-2" />
            Planificador de Comidas - {dietPlan.name}
          </div>
        </Modal.Title>
      </Modal.Header>
      
      <Modal.Body>
        {/* Tabs de navegación */}
        <div className="mb-3">
          <ul className="nav nav-tabs">
            <li className="nav-item">
              <button
                className={`nav-link ${activeTab === 'planner' ? 'active' : ''}`}
                onClick={() => setActiveTab('planner')}
              >
                <Calendar className="me-1" size={16} />
                Planificador
              </button>
            </li>
            <li className="nav-item">
              <button
                className={`nav-link ${activeTab === 'restrictions' ? 'active' : ''}`}
                onClick={() => setActiveTab('restrictions')}
              >
                <Shield className="me-1" size={16} />
                Restricciones
              </button>
            </li>
            <li className="nav-item">
              <button
                className={`nav-link ${activeTab === 'objectives' ? 'active' : ''}`}
                onClick={() => setActiveTab('objectives')}
              >
                <Target className="me-1" size={16} />
                Objetivos
              </button>
            </li>
            <li className="nav-item">
              <button
                className={`nav-link ${activeTab === 'shopping' ? 'active' : ''}`}
                onClick={() => setActiveTab('shopping')}
              >
                <Utensils className="me-1" size={16} />
                Lista de Super
              </button>
            </li>
          </ul>
        </div>

        {activeTab === 'planner' && (
          <div className="row">
            {/* Panel izquierdo - Planificador */}
            <div className="col-md-8">
              <div className="mb-3">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <h6>Semana {selectedWeek}</h6>
                  <div className="btn-group btn-group-sm">
                    {plans.map((plan) => (
                      <button
                        key={plan.week_number}
                        className={`btn ${selectedWeek === plan.week_number ? 'btn-primary' : 'btn-outline-primary'}`}
                        onClick={() => setSelectedWeek(plan.week_number)}
                      >
                        Semana {plan.week_number}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Alerta informativa sobre el número de comidas */}
                {enabledMealTypes.length !== mealTypes.length && (
                  <Alert variant="info" className="mb-3">
                    <Target className="me-2" />
                    <strong>Configuración de comidas:</strong> Solo {enabledMealTypes.length} tipos de comidas están habilitados según el plan nutricional.
                    <br />
                    <small className="text-muted">
                      Comidas disponibles: {enabledMealTypes.map(type => type.label).join(', ')}
                    </small>
                  </Alert>
                )}

                <div className="table-responsive">
                  <table className="table table-sm">
                    <thead>
                      <tr>
                        <th>Día</th>
                        {enabledMealTypes.map(type => (
                          <th key={type.key} className="text-center">
                            <div className="d-flex flex-column align-items-center">
                              <span>{type.icon}</span>
                              <small>{type.label}</small>
                            </div>
                          </th>
                        ))}
                        <th className="text-center">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {daysOfWeek.map(day => {
                        const dayTotals = getDailyTotals(day);
                        return (
                          <tr key={day}>
                            <td className="fw-medium">{day}</td>
                            {enabledMealTypes.map(type => {
                              const meal = getMealForDayAndType(day, type.key);
                              return (
                                <td key={type.key} className="text-center">
                                  {meal ? (
                                    <div className="d-flex flex-column align-items-center">
                                      <small className="text-success fw-medium">
                                        {Math.round(meal.total_calories)} cal
                                      </small>
                                      <small className="text-muted">
                                        {meal.foods.length} alimentos
                                      </small>
                                      <button
                                        className="btn btn-sm btn-outline-primary mt-1"
                                        onClick={() => {
                                          setEditingMeal(meal);
                                          setSelectedDay(day);
                                          setShowFoodModal(true);
                                        }}
                                      >
                                        <Plus size={12} />
                                      </button>
                                    </div>
                                  ) : (
                                    <button
                                      className="btn btn-sm btn-outline-secondary"
                                      onClick={() => {
                                        const newMeal = createEmptyMeal(day, type.key);
                                        setEditingMeal(newMeal);
                                        setSelectedDay(day);
                                        setShowFoodModal(true);
                                      }}
                                    >
                                      <Plus size={12} />
                                    </button>
                                  )}
                                </td>
                              );
                            })}
                            <td className="text-center">
                              <div className="d-flex flex-column align-items-center">
                                <small className="fw-medium">
                                  {Math.round(dayTotals.calories)} cal
                                </small>
                                <small className="text-muted">
                                  P: {Math.round(dayTotals.protein)}g
                                </small>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Panel derecho - Resumen y controles */}
            <div className="col-md-4">
              <Card className="mb-3">
                <Card.Header>
                  <h6 className="mb-0">Resumen Semanal</h6>
                </Card.Header>
                <Card.Body>
                  {(() => {
                    const weeklyTotals = getWeeklyTotals();
                    const targetCalories = getCurrentPlan()?.daily_calories_target || 2000;
                    const targetProtein = getCurrentPlan()?.daily_macros_target?.protein || 150;
                    
                    return (
                      <div>
                        <div className="mb-2">
                          <small className="text-muted">Calorías promedio por día</small>
                          <div className="d-flex justify-content-between">
                            <span>{Math.round(weeklyTotals.calories / 7)} cal</span>
                            <span className="text-muted">/ {targetCalories} cal</span>
                          </div>
                          <div className="progress" style={{height: '4px'}}>
                            <div 
                              className="progress-bar" 
                              style={{width: `${Math.min(100, (weeklyTotals.calories / 7 / targetCalories) * 100)}%`}}
                            ></div>
                          </div>
                        </div>
                        
                        <div className="mb-2">
                          <small className="text-muted">Proteína promedio por día</small>
                          <div className="d-flex justify-content-between">
                            <span>{Math.round(weeklyTotals.protein / 7)}g</span>
                            <span className="text-muted">/ {targetProtein}g</span>
                          </div>
                          <div className="progress" style={{height: '4px'}}>
                            <div 
                              className="progress-bar bg-success" 
                              style={{width: `${Math.min(100, (weeklyTotals.protein / 7 / targetProtein) * 100)}%`}}
                            ></div>
                          </div>
                        </div>
                      </div>
                    );
                  })()}
                </Card.Body>
              </Card>

              <Card>
                <Card.Header>
                  <h6 className="mb-0">Configuración del Plan</h6>
                </Card.Header>
                <Card.Body>
                  <div className="mb-2">
                    <small className="text-muted">Frecuencia de comidas</small>
                    <div className="mt-1">
                      {mealTypes.map(type => (
                        <Badge 
                          key={type.key}
                          bg={mealFrequency[type.key as keyof typeof mealFrequency] ? 'success' : 'secondary'}
                          className="me-1 mb-1"
                        >
                          {type.icon} {type.label}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  
                  <div className="mb-2">
                    <small className="text-muted">Flexibilidad</small>
                    <div className="mt-1">
                      {flexibilitySettings.allow_meal_swapping && (
                        <Badge bg="info" className="me-1">Intercambio de comidas</Badge>
                      )}
                      {flexibilitySettings.allow_portion_adjustment && (
                        <Badge bg="info" className="me-1">Ajuste de porciones</Badge>
                      )}
                      {flexibilitySettings.allow_food_substitution && (
                        <Badge bg="info" className="me-1">Sustitución de alimentos</Badge>
                      )}
                    </div>
                  </div>
                </Card.Body>
              </Card>
            </div>
          </div>
        )}

        {activeTab === 'restrictions' && (
          <div>
            <Alert variant="info" className="mb-3">
              <Shield className="me-2" />
              <strong>Restricciones aplicadas al planificador:</strong> Solo se muestran alimentos compatibles con las restricciones del paciente.
            </Alert>

            <Row>
              <Col md={12} className="mb-3">
                <Card border="info">
                  <Card.Header className="bg-info text-white">
                    <Shield className="me-2" />
                    Información del Plan Nutricional
                  </Card.Header>
                  <Card.Body>
                    <p className="text-muted">
                      El planificador respeta las restricciones y objetivos configurados en el plan nutricional.
                      Los alimentos mostrados son compatibles con las necesidades del paciente.
                    </p>
                  </Card.Body>
                </Card>
              </Col>
            </Row>

            <Card className="mt-3">
              <Card.Header>
                <h6 className="mb-0">Alimentos Disponibles ({filteredFoods.length})</h6>
              </Card.Header>
              <Card.Body>
                <div className="row">
                  {filteredFoods.map(food => (
                    <div key={food.id} className="col-md-6 col-lg-4 mb-2">
                      <div className="border rounded p-2">
                        <div className="d-flex justify-content-between align-items-start">
                          <div>
                            <strong>{food.name}</strong>
                            <br />
                            <small className="text-muted">{food.category}</small>
                          </div>
                          <Badge bg="success">{Math.round(food.calories_per_100g)} cal/100g</Badge>
                        </div>
                        <div className="mt-1">
                          <small className="text-muted">
                            P: {food.protein_per_100g}g | C: {food.carbs_per_100g}g | G: {food.fats_per_100g}g
                          </small>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card.Body>
            </Card>
          </div>
        )}

        {activeTab === 'objectives' && (
          <div>
            <Alert variant="success" className="mb-3">
              <Target className="me-2" />
              <strong>Objetivos nutricionales del plan:</strong> El planificador respeta estos objetivos al sugerir comidas.
            </Alert>

            <Row>
              <Col md={6} className="mb-3">
                <Card border="primary">
                  <Card.Header className="bg-primary text-white">
                    <Target className="me-2" />
                    Objetivos Diarios
                  </Card.Header>
                  <Card.Body>
                                         <div className="mb-2">
                       <strong>Calorías:</strong> {dietPlan.target_calories || 2000} cal
                     </div>
                     <div className="mb-2">
                       <strong>Proteínas:</strong> {dietPlan.target_protein || 150}g
                     </div>
                     <div className="mb-2">
                       <strong>Carbohidratos:</strong> {dietPlan.target_carbs || 225}g
                     </div>
                     <div className="mb-2">
                       <strong>Grasas:</strong> {dietPlan.target_fats || 56}g
                     </div>
                  </Card.Body>
                </Card>
              </Col>

              <Col md={6} className="mb-3">
                <Card border="success">
                  <Card.Header className="bg-success text-white">
                    <CheckCircle className="me-2" />
                    Distribución de Comidas
                  </Card.Header>
                  <Card.Body>
                    {mealTypes.map(type => (
                      <div key={type.key} className="mb-2">
                        <div className="d-flex justify-content-between align-items-center">
                          <span>{type.icon} {type.label}</span>
                          <Badge bg={mealFrequency[type.key as keyof typeof mealFrequency] ? 'success' : 'secondary'}>
                            {mealFrequency[type.key as keyof typeof mealFrequency] ? 'Activo' : 'Inactivo'}
                          </Badge>
                        </div>
                        {mealTiming[type.key as keyof typeof mealTiming] && (
                          <small className="text-muted">
                            Horario: {mealTiming[type.key as keyof typeof mealTiming]}
                          </small>
                        )}
                      </div>
                    ))}
                  </Card.Body>
                </Card>
              </Col>
            </Row>
          </div>
        )}

        {activeTab === 'shopping' && (
          <div>
            <Alert variant="info" className="mb-3">
              <Utensils className="me-2" />
              <strong>Lista de Supermercado:</strong> Generada automáticamente para {getTotalWeeks()} semana(s) del plan nutricional.
            </Alert>

            <div className="mb-3">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <h6>Lista de Compras por Categorías</h6>
                <Button 
                  variant="outline-primary" 
                  size="sm"
                  onClick={() => {
                    const shoppingList = generateShoppingList();
                    const text = Object.entries(shoppingList)
                      .map(([category, foods]) => {
                        const categoryInfo = shoppingCategories.find(c => c.name === category);
                        return `${categoryInfo?.icon || '📦'} ${category}:\n${Object.entries(foods)
                          .map(([food, quantity]) => `  • ${food}: ${formatQuantity(quantity)}`)
                          .join('\n')}`;
                      })
                      .join('\n\n');
                    
                    navigator.clipboard.writeText(text);
                    alert('Lista copiada al portapapeles');
                  }}
                >
                  📋 Copiar Lista
                </Button>
              </div>
            </div>

            <div className="row">
              {(() => {
                const shoppingList = generateShoppingList();
                const categories = Object.keys(shoppingList);
                
                if (categories.length === 0) {
                  return (
                    <div className="col-12">
                      <div className="text-center py-4">
                        <p className="text-muted mb-2">No hay alimentos planificados aún</p>
                        <small className="text-muted">Agrega comidas al planificador para generar la lista de supermercado</small>
                      </div>
                    </div>
                  );
                }

                return categories.map(category => {
                  const categoryInfo = shoppingCategories.find(c => c.name === category);
                  const foods = shoppingList[category];
                  const totalItems = Object.keys(foods).length;
                  const totalQuantity = Object.values(foods).reduce((sum, qty) => sum + qty, 0);

                  return (
                    <div key={category} className="col-md-6 mb-3">
                      <Card border={categoryInfo?.color || 'secondary'}>
                        <Card.Header className={`bg-${categoryInfo?.color || 'secondary'} text-white`}>
                          <span className="me-2">{categoryInfo?.icon || '📦'}</span>
                          {category}
                          <Badge bg="light" text="dark" className="ms-2">
                            {totalItems} items
                          </Badge>
                        </Card.Header>
                        <Card.Body>
                          <div className="mb-2">
                            <small className="text-muted">
                              Total: {formatQuantity(totalQuantity)}
                            </small>
                          </div>
                          <div className="shopping-list">
                            {Object.entries(foods).map(([foodName, quantity]) => (
                              <div key={foodName} className="d-flex justify-content-between align-items-center mb-1">
                                <span className="food-name">{foodName}</span>
                                <Badge bg="outline-secondary" className="quantity-badge">
                                  {formatQuantity(quantity)}
                                </Badge>
                              </div>
                            ))}
                          </div>
                        </Card.Body>
                      </Card>
                    </div>
                  );
                });
              })()}
            </div>

            <div className="mt-3">
              <Card border="warning">
                <Card.Header className="bg-warning text-dark">
                  <span className="me-2">💡</span>
                  Consejos para el Supermercado
                </Card.Header>
                <Card.Body>
                  <ul className="list-unstyled mb-0">
                    <li className="mb-2">• Compra alimentos frescos y de temporada</li>
                    <li className="mb-2">• Revisa las fechas de vencimiento</li>
                    <li className="mb-2">• Prefiere alimentos orgánicos cuando sea posible</li>
                    <li className="mb-2">• Lleva bolsas reutilizables</li>
                    <li className="mb-2">• Compara precios entre marcas</li>
                    <li className="mb-2">• Planifica las comidas de la semana</li>
                  </ul>
                </Card.Body>
              </Card>
            </div>
          </div>
        )}
      </Modal.Body>

      <Modal.Footer>
        <Button variant="secondary" onClick={onClose}>
          Cancelar
        </Button>
        <Button variant="primary" onClick={handleSave}>
          <Save className="me-2" size={16} />
          Guardar Plan
        </Button>
      </Modal.Footer>

      {/* Modal para agregar/editar comidas */}
      <Modal show={showFoodModal} onHide={() => setShowFoodModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            {editingMeal ? `Editar ${mealTypes.find(t => t.key === editingMeal.meal_type)?.label} - ${selectedDay}` : 'Agregar Comida'}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {editingMeal && (
            <div>
              <div className="mb-3">
                <label className="form-label">Buscar alimentos</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Buscar por nombre o categoría..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <div className="mb-3">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <h6>Alimentos disponibles:</h6>
                  <Button 
                    variant="outline-primary" 
                    size="sm"
                    onClick={() => setShowAddFoodModal(true)}
                  >
                    <Plus size={16} className="me-1" />
                    Agregar Alimento Personalizado
                  </Button>
                </div>
                <div className="row">
                  {filteredFoods.length === 0 ? (
                    <div className="col-12">
                      <div className="text-center py-3">
                        <p className="text-muted mb-2">No se encontraron alimentos con "{searchTerm}"</p>
                        <Button 
                          variant="outline-success" 
                          size="sm"
                          onClick={() => setShowAddFoodModal(true)}
                        >
                          <Plus size={16} className="me-1" />
                          Agregar "{searchTerm}" como alimento personalizado
                        </Button>
                      </div>
                    </div>
                  ) : (
                    filteredFoods.map(food => (
                      <FoodItem key={food.id} food={food} onAdd={addFoodToMeal} />
                    ))
                  )}
                </div>
              </div>

              <div className="mb-3">
                <h6>Alimentos en la comida:</h6>
                {editingMeal.foods.length === 0 ? (
                  <p className="text-muted">No hay alimentos agregados</p>
                ) : (
                  <div className="table-responsive">
                    <table className="table table-sm">
                      <thead>
                        <tr>
                          <th>Alimento</th>
                          <th>Cantidad (g)</th>
                          <th>Calorías</th>
                          <th>Proteínas</th>
                          <th>Carbohidratos</th>
                          <th>Grasas</th>
                          <th></th>
                        </tr>
                      </thead>
                      <tbody>
                        {editingMeal.foods.map((food, index) => (
                          <tr key={index}>
                            <td>{food.food_name}</td>
                            <td>{food.quantity_grams}</td>
                            <td>{Math.round(food.calories)}</td>
                            <td>{Math.round(food.protein)}g</td>
                            <td>{Math.round(food.carbs)}g</td>
                            <td>{Math.round(food.fats)}g</td>
                            <td>
                              <button
                                className="btn btn-sm btn-outline-danger"
                                onClick={() => removeFoodFromMeal(index)}
                              >
                                <Trash2 size={12} />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot>
                        <tr className="table-active">
                          <td><strong>Total</strong></td>
                          <td>{editingMeal.foods.reduce((sum, f) => sum + f.quantity_grams, 0)}g</td>
                          <td><strong>{Math.round(editingMeal.total_calories)}</strong></td>
                          <td><strong>{Math.round(editingMeal.total_protein)}g</strong></td>
                          <td><strong>{Math.round(editingMeal.total_carbs)}g</strong></td>
                          <td><strong>{Math.round(editingMeal.total_fats)}g</strong></td>
                          <td></td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowFoodModal(false)}>
            Cerrar
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modal para agregar alimento personalizado */}
      <Modal show={showAddFoodModal} onHide={() => setShowAddFoodModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            <Plus className="me-2" />
            Agregar Alimento Personalizado
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="row">
            <div className="col-md-6 mb-3">
              <label className="form-label">Nombre del alimento *</label>
              <input
                type="text"
                className="form-control"
                placeholder="Ej: Ensalada de quinoa"
                value={customFood.name}
                onChange={(e) => setCustomFood(prev => ({ ...prev, name: e.target.value }))}
              />
            </div>
            <div className="col-md-6 mb-3">
              <label className="form-label">Categoría *</label>
              <select
                className="form-select"
                value={customFood.category}
                onChange={(e) => setCustomFood(prev => ({ ...prev, category: e.target.value }))}
              >
                <option value="">Seleccionar categoría</option>
                <option value="Cereales y granos">Cereales y granos</option>
                <option value="Frutas">Frutas</option>
                <option value="Verduras">Verduras</option>
                <option value="Proteínas">Proteínas</option>
                <option value="Lácteos">Lácteos</option>
                <option value="Grasas">Grasas</option>
                <option value="Bebidas">Bebidas</option>
                <option value="Postres">Postres</option>
                <option value="Otros">Otros</option>
              </select>
            </div>
          </div>

          <div className="row">
            <div className="col-md-6 mb-3">
              <label className="form-label">Calorías por 100g</label>
              <input
                type="number"
                className="form-control"
                placeholder="0"
                value={customFood.calories_per_100g}
                onChange={(e) => setCustomFood(prev => ({ ...prev, calories_per_100g: Number(e.target.value) }))}
              />
            </div>
            <div className="col-md-6 mb-3">
              <label className="form-label">Proteínas por 100g (g)</label>
              <input
                type="number"
                className="form-control"
                placeholder="0"
                step="0.1"
                value={customFood.protein_per_100g}
                onChange={(e) => setCustomFood(prev => ({ ...prev, protein_per_100g: Number(e.target.value) }))}
              />
            </div>
          </div>

          <div className="row">
            <div className="col-md-6 mb-3">
              <label className="form-label">Carbohidratos por 100g (g)</label>
              <input
                type="number"
                className="form-control"
                placeholder="0"
                step="0.1"
                value={customFood.carbs_per_100g}
                onChange={(e) => setCustomFood(prev => ({ ...prev, carbs_per_100g: Number(e.target.value) }))}
              />
            </div>
            <div className="col-md-6 mb-3">
              <label className="form-label">Grasas por 100g (g)</label>
              <input
                type="number"
                className="form-control"
                placeholder="0"
                step="0.1"
                value={customFood.fats_per_100g}
                onChange={(e) => setCustomFood(prev => ({ ...prev, fats_per_100g: Number(e.target.value) }))}
              />
            </div>
          </div>

          <div className="alert alert-info">
            <small>
              <strong>Nota:</strong> Los valores nutricionales son por 100 gramos del alimento. 
              Si no conoces los valores exactos, puedes usar valores aproximados o consultar 
              tablas nutricionales de referencia.
            </small>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => {
            setShowAddFoodModal(false);
            resetCustomFood();
          }}>
            Cancelar
          </Button>
          <Button variant="primary" onClick={addCustomFood}>
            <Plus className="me-2" />
            Agregar Alimento
          </Button>
        </Modal.Footer>
      </Modal>
    </Modal>
  );
};

interface FoodItemProps {
  food: Food;
  onAdd: (food: Food, quantity: number) => void;
}

const FoodItem: React.FC<FoodItemProps> = ({ food, onAdd }) => {
  const [quantity, setQuantity] = useState(100);

  return (
    <div className="col-md-6 col-lg-4 mb-2">
      <div className="border rounded p-2">
        <div className="d-flex justify-content-between align-items-start mb-2">
          <div>
            <strong>{food.name}</strong>
            <br />
            <small className="text-muted">{food.category}</small>
          </div>
          <Badge bg="success">{Math.round(food.calories_per_100g)} cal/100g</Badge>
        </div>
        
        <div className="mb-2">
          <small className="text-muted">
            P: {food.protein_per_100g}g | C: {food.carbs_per_100g}g | G: {food.fats_per_100g}g
          </small>
        </div>
        
        <div className="d-flex align-items-center">
          <input
            type="number"
            className="form-control form-control-sm me-2"
            value={quantity}
            onChange={(e) => setQuantity(Number(e.target.value))}
            min="1"
            style={{width: '80px'}}
          />
          <span className="text-muted me-2">g</span>
          <button
            className="btn btn-sm btn-primary"
            onClick={() => onAdd(food, quantity)}
          >
            <Plus size={12} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default MealPlanner; 