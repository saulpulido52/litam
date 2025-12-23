// nutri-web/src/components/MealPlanner.tsx
import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { 
  Plus,
  Trash2,
  Calendar,
  Save,
  Target,
  Shield,
  Utensils,
  Edit,
  Apple,
  ChefHat,
  CheckCircle
} from 'lucide-react';
import { Button, Modal, Row, Col, Tabs, Tab, Form, Badge, Alert } from 'react-bootstrap';
import { foodService } from '../services/foodService';
import { recipeService } from '../services/recipeService';
import type { Recipe } from '../types/recipe';
import { RecipeEditorModal } from './RecipeEditor/RecipeEditorModal';
import { ShoppingListModal } from './ShoppingList/ShoppingListModal';
import RecipeViewer from './RecipeBook/RecipeViewer';
import TemplateApplicator from './Templates/TemplateApplicator';

// Interfaces para compatibilidad con el diseño original
interface Food {
  id: string;
  name: string;
  calories: number;
  protein: number;
  carbohydrates: number;
  fats: number;
  fiber: number;
  unit: string;
  serving_size: number;
  category?: string;
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

interface MealRecipe {
  recipe_id: string;
  recipe_name: string;
  servings: number;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  // Campos adicionales para manejar recetas modificadas
  original_recipe_id?: string;
  is_modified?: boolean;
  modification_timestamp?: string;
  recipe_data?: {
    title: string;
    description?: string;
    totalCalories?: number;
    totalMacros?: {
      protein: number;
      carbohydrates: number;
      fats: number;
    };
    servings: number;
    ingredients?: any[];
  };
}

interface Meal {
  id?: string;
  day: string;
  meal_type: 'breakfast' | 'morning_snack' | 'lunch' | 'afternoon_snack' | 'dinner' | 'evening_snack';
  meal_time: string;
  meal_description?: string; // Para comidas manuales
  foods: MealFood[];
  recipes: MealRecipe[];
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
  dietPlan: any;
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
  const [plans, setPlans] = useState<WeeklyPlan[]>(() => {
    if (weeklyPlans && weeklyPlans.length > 0) {
      console.log('🏗️ Inicializando con weeklyPlans existentes:', weeklyPlans);
      return weeklyPlans;
    } else {
      // Crear planes por defecto para 4 semanas si no hay datos
      const defaultPlans: WeeklyPlan[] = [];
      for (let week = 1; week <= 4; week++) {
        const startDate = new Date();
        startDate.setDate(startDate.getDate() + (week - 1) * 7);
        const endDate = new Date(startDate);
        endDate.setDate(endDate.getDate() + 6);

        const defaultPlan: WeeklyPlan = {
          week_number: week,
          start_date: startDate.toISOString().split('T')[0],
          end_date: endDate.toISOString().split('T')[0],
          daily_calories_target: dietPlan?.daily_calories_target || 2000,
          daily_macros_target: {
            protein: dietPlan?.daily_macros_target?.protein || 150,
            carbohydrates: dietPlan?.daily_macros_target?.carbohydrates || 250,
            fats: dietPlan?.daily_macros_target?.fats || 67
          },
          meals: [],
          notes: ''
        };
        defaultPlans.push(defaultPlan);
      }
      console.log('🏗️ Creando planes por defecto:', defaultPlans);
      return defaultPlans;
    }
  });
  const [selectedWeek, setSelectedWeek] = useState<number>(1);
  const [selectedDay, setSelectedDay] = useState<string>('Lunes');

  const [showFoodModal, setShowFoodModal] = useState(false);
  const [editingMeal, setEditingMeal] = useState<Meal | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [foods, setFoods] = useState<Food[]>([]);
  const [recipes, setRecipes] = useState<Recipe[]>([]);

  // Estados para los nuevos modales
  const [showRecipeEditor, setShowRecipeEditor] = useState(false);
  const [editingRecipe, setEditingRecipe] = useState<Recipe | null>(null);
  const [showRecipeViewer, setShowRecipeViewer] = useState(false);
  const [viewingRecipe, setViewingRecipe] = useState<Recipe | null>(null);
  const [showShoppingList, setShowShoppingList] = useState(false);
  const [showTemplateApplicator, setShowTemplateApplicator] = useState(false);

  const [activeTab, setActiveTab] = useState<'planner' | 'restrictions' | 'objectives' | 'shopping'>('planner');
  const [contentType, setContentType] = useState<'foods' | 'recipes' | 'manual'>('foods');

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

  // Extraer restricciones del plan nutricional
  // const restrictions = dietPlan?.pathological_restrictions || {};
  const mealFrequency = dietPlan?.meal_frequency || {};
  const mealTiming = dietPlan?.meal_timing || {};

  // Memoizar los tipos de comidas habilitados
  const enabledMealTypes = useMemo(() => {
    if (!mealFrequency || Object.keys(mealFrequency).length === 0) {
      return mealTypes;
    }
    return mealTypes.filter(type => mealFrequency[type.key as keyof typeof mealFrequency]);
  }, [mealFrequency]);

  // Memoizar funciones para evitar re-renders
  const loadFoods = useCallback(async () => {
    try {
      const foodList = await foodService.getAllFoods();
      setFoods(foodList);
    } catch (error) {
      console.error('Error loading foods:', error);
    }
  }, []);

  const loadRecipes = useCallback(async () => {
    try {
      const recipeResponse = await recipeService.getAllRecipes();
      setRecipes((recipeResponse.recipes || []) as unknown as Recipe[]);
    } catch (error) {
      console.error('Error loading recipes:', error);
    }
  }, []);

  useEffect(() => {
    if (isOpen && foods.length === 0) {
      loadFoods();
    }
  }, [isOpen, foods.length, loadFoods]);

  useEffect(() => {
    if (isOpen && recipes.length === 0) {
      loadRecipes();
    }
  }, [isOpen, recipes.length, loadRecipes]);

  // Actualizar plans cuando weeklyPlans prop cambie
  useEffect(() => {
    if (weeklyPlans && weeklyPlans.length > 0) {
      console.log('📋 weeklyPlans recibidos:', weeklyPlans);
      if (JSON.stringify(weeklyPlans) !== JSON.stringify(plans)) {
        setPlans(weeklyPlans);
        console.log('🔄 Plans actualizados desde props');
      }
    }
  }, [weeklyPlans]);

  // Debug del estado actual
  useEffect(() => {
    console.log('📊 Estado actual de plans:', plans);
    console.log('📊 Semana seleccionada:', selectedWeek);
    console.log('📊 Plan actual:', getCurrentPlan());
  }, [plans, selectedWeek]);

  const getCurrentPlan = useCallback(() => {
    return plans.find(plan => plan.week_number === selectedWeek) || plans[0];
  }, [plans, selectedWeek]);

  const getMealForDayAndType = useCallback((day: string, mealType: string): Meal | null => {
    const currentPlan = getCurrentPlan();
    if (!currentPlan) {
      console.log('❌ getMealForDayAndType: No hay plan actual');
      return null;
    }
    
    const meal = currentPlan.meals.find(meal => 
      meal.day === day && meal.meal_type === mealType
    ) || null;
    
    console.log(`🔍 Buscando comida para ${day} - ${mealType}:`, meal);
    console.log('🔍 Comidas disponibles en el plan:', currentPlan.meals.map(m => `${m.day}-${m.meal_type}`));
    
    return meal;
  }, [getCurrentPlan]);

  const createEmptyMeal = useCallback((day: string, mealType: string): Meal => {
    const defaultTime = (mealTiming as any)[mealType] || '08:00';
    
    const newMeal: Meal = {
      id: `${day}-${mealType}-${Date.now()}`,
      day,
      meal_type: mealType as 'breakfast' | 'morning_snack' | 'lunch' | 'afternoon_snack' | 'dinner' | 'evening_snack',
      meal_time: defaultTime,
      foods: [],
      recipes: [],
      total_calories: 0,
      total_protein: 0,
      total_carbs: 0,
      total_fats: 0
    };
    
    console.log('🆕 Creando comida vacía:', newMeal);
    return newMeal;
  }, [mealTiming]);

  const updateMealInPlan = useCallback((updatedMeal: Meal) => {
    console.log('🔄 Actualizando comida en plan:', updatedMeal);
    const currentPlan = getCurrentPlan();
    if (!currentPlan) {
      console.error('❌ No se encontró el plan actual');
      return;
    }

    console.log('📋 Plan actual:', currentPlan);
    console.log('📋 Número de comidas en plan actual:', currentPlan.meals.length);

    // Asegurar que la comida tenga un ID
    if (!updatedMeal.id) {
      updatedMeal.id = `${updatedMeal.day}-${updatedMeal.meal_type}-${Date.now()}`;
      console.log('🆔 Asignando ID a la comida:', updatedMeal.id);
    }

    const updatedPlans = plans.map(plan => {
      if (plan.week_number === selectedWeek) {
        const existingMealIndex = plan.meals.findIndex(meal => 
          meal.day === updatedMeal.day && meal.meal_type === updatedMeal.meal_type
        );

        console.log('🔍 Índice de comida existente:', existingMealIndex);
        console.log('🔍 Comidas actuales en plan:', plan.meals.map(m => `${m.day}-${m.meal_type} (${m.total_calories} kcal)`));

        if (existingMealIndex >= 0) {
          const updatedMeals = [...plan.meals];
          updatedMeals[existingMealIndex] = { ...updatedMeal };
          console.log('✏️ Actualizando comida existente en índice:', existingMealIndex);
          console.log('✏️ Comida actualizada:', updatedMeal);
          return { ...plan, meals: updatedMeals };
        } else {
          console.log('➕ Agregando nueva comida');
          console.log('➕ Nueva comida:', updatedMeal);
          return { ...plan, meals: [...plan.meals, { ...updatedMeal }] };
        }
      }
      return plan;
    });

    console.log('🎯 Planes antes de actualizar:', plans);
    console.log('🎯 Planes después de actualizar:', updatedPlans);
    
    setPlans(updatedPlans);
    setEditingMeal(updatedMeal);
    
    // Verificar que se actualizó correctamente
    setTimeout(() => {
      const verifyPlan = updatedPlans.find(p => p.week_number === selectedWeek);
      const verifyMeal = verifyPlan?.meals.find(m => 
        m.day === updatedMeal.day && m.meal_type === updatedMeal.meal_type
      );
      console.log('✅ Verificación - Comida guardada:', verifyMeal);
      
      // Verificación específica para recetas modificadas
      if (verifyMeal && verifyMeal.recipes.length > 0) {
        const modifiedRecipes = verifyMeal.recipes.filter(r => r.is_modified);
        if (modifiedRecipes.length > 0) {
          console.log('🔍 VERIFICACIÓN RECETAS MODIFICADAS:');
          modifiedRecipes.forEach((recipe, index) => {
            console.log(`  Receta ${index + 1}:`, {
              id: recipe.recipe_id,
              name: recipe.recipe_name,
              calories: recipe.calories,
              isModified: recipe.is_modified,
              originalId: recipe.original_recipe_id,
              timestamp: recipe.modification_timestamp,
              hasCompleteData: !!(recipe.recipe_data?.title && recipe.recipe_data?.totalCalories),
              recipeDataPreview: recipe.recipe_data ? {
                title: recipe.recipe_data.title,
                calories: recipe.recipe_data.totalCalories,
                servings: recipe.recipe_data.servings
              } : 'NO_DATA'
            });
          });
        }
      }
    }, 100);
  }, [getCurrentPlan, plans, selectedWeek]);

  const addFoodToMeal = useCallback((food: Food, quantity: number) => {
    console.log('🍎 Agregando alimento:', food.name, 'cantidad:', quantity);
    console.log('🍽️ Estado editingMeal:', editingMeal);

    if (!editingMeal) {
      console.error('❌ No hay comida en edición. editingMeal es null/undefined');
      alert('Error: No hay una comida seleccionada para editar. Por favor, selecciona una comida primero.');
      return;
    }

    const calories = (food.calories * quantity) / 100;
    const protein = (food.protein * quantity) / 100;
    const carbs = (food.carbohydrates * quantity) / 100;
    const fats = (food.fats * quantity) / 100;

    const mealFood: MealFood = {
      food_id: food.id,
      food_name: food.name,
      quantity_grams: quantity,
      calories,
      protein,
      carbs,
      fats
    };

    console.log('🥗 Alimento creado:', mealFood);

    const updatedMeal = {
      ...editingMeal,
      foods: [...editingMeal.foods, mealFood],
      total_calories: editingMeal.total_calories + calories,
      total_protein: editingMeal.total_protein + protein,
      total_carbs: editingMeal.total_carbs + carbs,
      total_fats: editingMeal.total_fats + fats
    };

    console.log('🍽️ Comida actualizada:', updatedMeal);
    updateMealInPlan(updatedMeal);
  }, [editingMeal, updateMealInPlan]);

  const addRecipeToMeal = useCallback((recipe: Recipe, servings: number, isModified: boolean = false) => {
    console.log('🍳 Agregando receta al meal:', recipe.title, 'servings:', servings, 'modificada:', isModified);
    
    if (!editingMeal) {
      console.error('❌ No hay comida en edición para agregar receta');
      alert('Error: No hay una comida seleccionada para editar. Por favor, selecciona una comida primero.');
      return;
    }

    const factor = servings / (recipe.servings || 1);
    const calories = (recipe.totalCalories || 0) * factor;
    const protein = (recipe.totalMacros?.protein || 0) * factor;
    const carbs = (recipe.totalMacros?.carbohydrates || 0) * factor;
    const fats = (recipe.totalMacros?.fats || 0) * factor;

    // Crear una copia única de la receta para este meal
    const uniqueRecipeId = isModified 
      ? `${recipe.id}-modified-${Date.now()}` 
      : `${recipe.id}-instance-${Date.now()}`;

    const mealRecipe: MealRecipe = {
      recipe_id: uniqueRecipeId, // ID único para esta instancia
      recipe_name: isModified ? `${recipe.title} (Modificada)` : recipe.title,
      servings,
      calories,
      protein,
      carbs,
      fats,
      // Datos adicionales para la instancia modificada
      original_recipe_id: recipe.id,
      is_modified: isModified,
      modification_timestamp: new Date().toISOString(),
      // Guardar datos completos de la receta modificada
      recipe_data: isModified ? {
        title: recipe.title,
        description: recipe.description,
        totalCalories: recipe.totalCalories,
        totalMacros: recipe.totalMacros,
        servings: recipe.servings,
        ingredients: recipe.ingredients || []
      } : undefined
    };

    console.log('🥗 Instancia de receta creada:', mealRecipe);

    const updatedMeal = {
      ...editingMeal,
      recipes: [...editingMeal.recipes, mealRecipe],
      total_calories: editingMeal.total_calories + calories,
      total_protein: editingMeal.total_protein + protein,
      total_carbs: editingMeal.total_carbs + carbs,
      total_fats: editingMeal.total_fats + fats
    };

    console.log('🍽️ Comida actualizada con receta:', updatedMeal);
    updateMealInPlan(updatedMeal);
  }, [editingMeal, updateMealInPlan]);

  const removeFoodFromMeal = useCallback((foodIndex: number) => {
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
  }, [editingMeal, updateMealInPlan]);

  const removeRecipeFromMeal = useCallback((recipeIndex: number) => {
    console.log('🗑️ Removiendo receta del meal, índice:', recipeIndex);
    if (editingMeal) {
      const recipeToRemove = editingMeal.recipes[recipeIndex];
      console.log('🗑️ Receta a remover:', recipeToRemove);
      
      const updatedMeal = {
        ...editingMeal,
        recipes: editingMeal.recipes.filter((_, index) => index !== recipeIndex),
        total_calories: editingMeal.total_calories - recipeToRemove.calories,
        total_protein: editingMeal.total_protein - recipeToRemove.protein,
        total_carbs: editingMeal.total_carbs - recipeToRemove.carbs,
        total_fats: editingMeal.total_fats - recipeToRemove.fats
      };
      
      console.log('🗑️ Meal actualizado tras remover receta:', updatedMeal);
      updateMealInPlan(updatedMeal);
    }
  }, [editingMeal, updateMealInPlan]);

  const getDailyTotals = useCallback((day: string) => {
    const currentPlan = getCurrentPlan();
    if (!currentPlan) return { calories: 0, protein: 0, carbs: 0, fats: 0 };

    const dayMeals = currentPlan.meals.filter(meal => meal.day === day);
    const totals = dayMeals.reduce((totals, meal) => ({
      calories: totals.calories + meal.total_calories,
      protein: totals.protein + meal.total_protein,
      carbs: totals.carbs + meal.total_carbs,
      fats: totals.fats + meal.total_fats
    }), { calories: 0, protein: 0, carbs: 0, fats: 0 });
    
    console.log(`📊 Totales para ${day}:`, {
      meals: dayMeals.length,
      breakdown: dayMeals.map(m => ({
        type: m.meal_type,
        calories: m.total_calories,
        foods: m.foods.length,
        recipes: m.recipes.length,
        isModified: m.recipes.some(r => r.is_modified)
      })),
      totals
    });
    
    return totals;
  }, [getCurrentPlan]);

  const handleSave = useCallback(() => {
    onSave(plans);
  }, [onSave, plans]);

  // Funciones para el modal de edición de recetas
  const handleEditRecipe = (recipe: Recipe) => {
    console.log('🍳 Abriendo editor de receta:', recipe.title);
    setEditingRecipe(recipe);
    setShowRecipeEditor(true);
  };

  const handleSaveRecipeChanges = (modifiedRecipe: Recipe, isModified: boolean) => {
    console.log('💾 Guardando cambios de receta:', { 
      title: modifiedRecipe.title, 
      isModified,
      calories: modifiedRecipe.totalCalories 
    });
    
    if (editingMeal && isModified) {
      // Crear nuevo MealRecipe a partir de la Recipe modificada
      const updatedMealRecipe = {
        recipe_id: modifiedRecipe.id,
        recipe_name: modifiedRecipe.title,
        servings: 1,
        calories: modifiedRecipe.totalCalories || 0,
        protein: modifiedRecipe.totalMacros?.protein || 0,
        carbs: modifiedRecipe.totalMacros?.carbohydrates || 0,
        fats: modifiedRecipe.totalMacros?.fats || 0
      };
      
      // Actualizar la receta en la comida editada
      const updatedRecipes = editingMeal.recipes.map(recipe => 
        recipe.recipe_id === modifiedRecipe.id ? updatedMealRecipe : recipe
      );
      
      setEditingMeal({
        ...editingMeal,
        recipes: updatedRecipes
      });
      
      console.log('✅ Receta actualizada exitosamente en la comida');
    }
    
    setShowRecipeEditor(false);
    setEditingRecipe(null);
    
    // Mostrar automáticamente el visor de recetas después de guardar
    if (isModified) {
      setTimeout(() => {
        setViewingRecipe(modifiedRecipe);
        setShowRecipeViewer(true);
      }, 500);
    }
  };

  // Función para mostrar la lista de compras
  const handleShowShoppingList = () => {
    const currentPlan = getCurrentPlan();
    if (currentPlan) {
      setShowShoppingList(true);
    } else {
      alert('No hay un plan semanal para generar la lista de compras');
    }
  };

  // Función para aplicar plantilla
  const handleShowTemplateApplicator = () => {
    setShowTemplateApplicator(true);
  };

  // Función para manejar plantilla aplicada
  const handleTemplateApplied = (appliedMeals: any[]) => {
    console.log('✅ Plantilla aplicada, comidas creadas:', appliedMeals);
    // Recargar o actualizar el estado del plan
    // Aquí podrías llamar a una función para refrescar los datos
    alert(`¡Plantilla aplicada exitosamente! Se crearon ${appliedMeals.length} comidas.`);
  };

  // Filtrar alimentos y recetas según búsqueda
  const filteredFoods = useMemo(() => 
    foods.filter(food => 
      food.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (food.category && food.category.toLowerCase().includes(searchTerm.toLowerCase()))
    ), [foods, searchTerm]);

  const filteredRecipes = useMemo(() => 
    recipes.filter(recipe => 
      recipe.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (recipe.description && recipe.description.toLowerCase().includes(searchTerm.toLowerCase()))
    ), [recipes, searchTerm]);

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
          </ul>
        </div>

        {activeTab === 'planner' && (
          <div className="row">
            {/* Panel principal - Tabla de planificación */}
            <div className="col-md-12">
              <div className="mb-3">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <h6>Semana {selectedWeek}</h6>
                  <div className="d-flex align-items-center">
                    <button
                      className="btn btn-sm btn-success me-2"
                      onClick={() => {
                        console.log('🧪 PRUEBA COMPLETA: Agregando recetas variadas para verificar contadores');
                        
                        // Receta 1: Original en Lunes/Desayuno
                        const recipe1: MealRecipe = {
                          recipe_id: 'test-original-' + Date.now(),
                          recipe_name: 'Avena con Frutas',
                          servings: 1,
                          calories: 350,
                          protein: 15,
                          carbs: 45,
                          fats: 12,
                          is_modified: false
                        };

                        const meal1: Meal = {
                          id: 'meal1-' + Date.now(),
                          day: 'Lunes',
                          meal_type: 'breakfast',
                          meal_time: '08:00',
                          foods: [],
                          recipes: [recipe1],
                          total_calories: 350,
                          total_protein: 15,
                          total_carbs: 45,
                          total_fats: 12
                        };

                        // Receta 2: Modificada en Martes/Almuerzo
                        const recipe2: MealRecipe = {
                          recipe_id: 'test-modified-' + Date.now(),
                          recipe_name: 'Pollo al Horno (Modificada)',
                          servings: 1.5,
                          calories: 600,
                          protein: 45,
                          carbs: 30,
                          fats: 25,
                          original_recipe_id: 'original-chicken-recipe',
                          is_modified: true,
                          modification_timestamp: new Date().toISOString(),
                          recipe_data: {
                            title: 'Pollo al Horno',
                            description: 'Pollo con más proteína',
                            totalCalories: 500,
                            totalMacros: { protein: 35, carbohydrates: 25, fats: 20 },
                            servings: 1,
                            ingredients: []
                          }
                        };

                        const meal2: Meal = {
                          id: 'meal2-' + Date.now(),
                          day: 'Martes',
                          meal_type: 'lunch',
                          meal_time: '13:00',
                          foods: [],
                          recipes: [recipe2],
                          total_calories: 600,
                          total_protein: 45,
                          total_carbs: 30,
                          total_fats: 25
                        };

                        // Agregar ambas comidas
                        updateMealInPlan(meal1);
                        setTimeout(() => updateMealInPlan(meal2), 100);
                        
                        console.log('🧪 Comidas agregadas - verificar contadores en tabla');
                      }}
                    >
                      🧪 Verificar Contadores
                    </button>
                    <button
                      className="btn btn-sm btn-danger me-2"
                      onClick={() => {
                        console.log('🧹 LIMPIAR: Removiendo todas las comidas de prueba');
                        const clearedPlans = plans.map(plan => ({
                          ...plan,
                          meals: []
                        }));
                        setPlans(clearedPlans);
                        console.log('🧹 Planes limpiados');
                      }}
                    >
                      🧹 Limpiar
                    </button>
                    <button
                      className="btn btn-sm btn-info me-2"
                      onClick={() => {
                        console.log('📋 REPORTE DE ESTADO COMPLETO:');
                        console.log('=====================================');
                        
                        const currentPlan = getCurrentPlan();
                        if (!currentPlan) {
                          console.log('❌ No hay plan actual');
                          return;
                        }

                        console.log('📊 Plan actual:', {
                          semana: currentPlan.week_number,
                          totalComidas: currentPlan.meals.length,
                          objetivoKcal: currentPlan.daily_calories_target
                        });

                        // Resumen por día
                        daysOfWeek.forEach(day => {
                          const dayMeals = currentPlan.meals.filter(m => m.day === day);
                          const dayTotals = dayMeals.reduce((acc, meal) => ({
                            calories: acc.calories + meal.total_calories,
                            protein: acc.protein + meal.total_protein,
                            foods: acc.foods + meal.foods.length,
                            recipes: acc.recipes + meal.recipes.length,
                            modifiedRecipes: acc.modifiedRecipes + meal.recipes.filter(r => r.is_modified).length
                          }), { calories: 0, protein: 0, foods: 0, recipes: 0, modifiedRecipes: 0 });

                          if (dayTotals.calories > 0) {
                            console.log(`📅 ${day}:`, {
                              comidas: dayMeals.length,
                              totalKcal: Math.round(dayTotals.calories),
                              alimentos: dayTotals.foods,
                              recetas: dayTotals.recipes,
                              recetasModificadas: dayTotals.modifiedRecipes,
                              detalleComidas: dayMeals.map(m => ({
                                tipo: m.meal_type,
                                kcal: m.total_calories,
                                elementos: `${m.foods.length}A + ${m.recipes.length}R`
                              }))
                            });
                          }
                        });

                        // Verificar persistencia de datos de recetas modificadas
                        const allModifiedRecipes = currentPlan.meals.flatMap(m => m.recipes.filter(r => r.is_modified));
                        if (allModifiedRecipes.length > 0) {
                          console.log('🔍 RECETAS MODIFICADAS GUARDADAS:');
                          allModifiedRecipes.forEach((recipe, index) => {
                            console.log(`  ${index + 1}. ${recipe.recipe_name}:`, {
                              persistenciaCompleta: !!(recipe.recipe_data && recipe.original_recipe_id),
                              datosOriginales: recipe.recipe_data ? 'SÍ' : 'NO',
                              timestamp: recipe.modification_timestamp,
                              calorías: recipe.calories
                            });
                          });
                        }

                        console.log('=====================================');
                      }}
                    >
                      📋 Estado
                    </button>
                    <button
                      className="btn btn-sm btn-warning me-2"
                      onClick={handleShowShoppingList}
                      title="Generar lista de compras semanal"
                    >
                      🛒 Lista de Compras
                    </button>
                    <button
                      className="btn btn-sm btn-success me-2"
                      onClick={handleShowTemplateApplicator}
                      title="Aplicar plantilla de plan semanal"
                    >
                      📚 Usar Plantilla
                    </button>
                    <button
                      className="btn btn-sm btn-primary me-2"
                      onClick={() => {
                        const currentPlan = getCurrentPlan();
                        if (!currentPlan || currentPlan.meals.length === 0) {
                          alert('❌ No hay comidas en el plan actual para guardar como plantilla.\n\nPrimero agrega comidas al planificador.');
                          return;
                        }
                        const templateName = prompt('💾 Nombre de la plantilla:', `Plan Semanal - ${new Date().toLocaleDateString()}`);
                        if (templateName) {
                          alert('✅ Funcionalidad de guardar plantilla será implementada próximamente.\n\n' + 
                                `Plantilla: "${templateName}"\n` +
                                `Comidas: ${currentPlan.meals.length}\n` +
                                `Semana: ${selectedWeek}`);
                        }
                      }}
                      title="Guardar plan actual como plantilla reutilizable"
                    >
                      💾 Guardar como Plantilla
                    </button>
                    <button
                      className="btn btn-sm btn-info me-2"
                      onClick={() => {
                        console.log('🔍 DIAGNÓSTICO DE LISTA DE COMPRAS:');
                        console.log('=====================================');
                        
                        const currentPlan = getCurrentPlan();
                        if (!currentPlan) {
                          console.log('❌ No hay plan actual');
                          alert('❌ No hay plan semanal para diagnosticar');
                          return;
                        }

                        console.log('📊 Plan actual:', {
                          semana: currentPlan.week_number,
                          totalComidas: currentPlan.meals.length
                        });

                        let totalAlimentos = 0;
                        let totalRecetas = 0;
                        const alimentosDetallados: any[] = [];
                        const recetasDetalladas: any[] = [];

                        currentPlan.meals.forEach(meal => {
                          console.log(`\n🍽️ COMIDA: ${meal.day} - ${meal.meal_type}`);
                          
                          if (meal.foods && meal.foods.length > 0) {
                            console.log(`  🍎 Alimentos (${meal.foods.length}):`);
                            meal.foods.forEach((food: any, index: number) => {
                              const foodInfo = {
                                nombre: food.food_name,
                                cantidad: food.quantity_grams,
                                unidad: 'g',
                                comida: `${meal.day} ${meal.meal_type}`
                              };
                              alimentosDetallados.push(foodInfo);
                              console.log(`    ${index + 1}. ${food.food_name} - ${food.quantity_grams}g`);
                              totalAlimentos++;
                            });
                          } else {
                            console.log(`  🍎 No hay alimentos en esta comida`);
                          }

                          if (meal.recipes && meal.recipes.length > 0) {
                            console.log(`  🍳 Recetas (${meal.recipes.length}):`);
                            meal.recipes.forEach((recipe: any, index: number) => {
                              const recipeInfo = {
                                nombre: recipe.recipe_name,
                                porciones: recipe.servings,
                                modificada: recipe.is_modified,
                                tieneIngredientes: !!(recipe.recipe_data && recipe.recipe_data.ingredients),
                                comida: `${meal.day} ${meal.meal_type}`
                              };
                              recetasDetalladas.push(recipeInfo);
                              console.log(`    ${index + 1}. ${recipe.recipe_name} - ${recipe.servings} porciones ${recipe.is_modified ? '(MODIFICADA)' : ''}`);
                              
                              if (recipe.recipe_data && recipe.recipe_data.ingredients) {
                                console.log(`      ↳ Ingredientes definidos: ${recipe.recipe_data.ingredients.length}`);
                                recipe.recipe_data.ingredients.forEach((ing: any, i: number) => {
                                  console.log(`        ${i + 1}. ${ing.food_name || ing.ingredient_name} - ${ing.shopping_quantity || ing.quantity}${ing.shopping_unit?.abbreviation || ing.unit || 'g'}`);
                                });
                              } else {
                                console.log(`      ⚠️ Sin ingredientes definidos`);
                              }
                              totalRecetas++;
                            });
                          } else {
                            console.log(`  🍳 No hay recetas en esta comida`);
                          }
                        });

                        console.log('\n📋 RESUMEN PARA LISTA DE COMPRAS:');
                        console.log(`  Total alimentos individuales: ${totalAlimentos}`);
                        console.log(`  Total recetas: ${totalRecetas}`);
                        
                        if (totalAlimentos === 0 && totalRecetas === 0) {
                          console.log('❌ NO HAY DATOS PARA LISTA DE COMPRAS');
                          alert('❌ No hay alimentos ni recetas en el plan semanal.\n\nPara generar lista de compras:\n1. Agrega alimentos al planificador\n2. Agrega recetas con ingredientes definidos\n3. Haz clic en "Guardar Comida"');
                        } else {
                          console.log('✅ Datos disponibles para lista de compras');
                          
                          let mensaje = `📊 DIAGNÓSTICO DE LISTA DE COMPRAS:\n\n`;
                          mensaje += `📈 Total items encontrados:\n`;
                          mensaje += `• ${totalAlimentos} alimentos individuales\n`;
                          mensaje += `• ${totalRecetas} recetas\n\n`;
                          
                          if (alimentosDetallados.length > 0) {
                            mensaje += `🍎 ALIMENTOS ENCONTRADOS:\n`;
                            alimentosDetallados.forEach((item, i) => {
                              mensaje += `${i + 1}. ${item.nombre} - ${item.cantidad}${item.unidad}\n   (${item.comida})\n`;
                            });
                            mensaje += `\n`;
                          }
                          
                          if (recetasDetalladas.length > 0) {
                            mensaje += `🍳 RECETAS ENCONTRADAS:\n`;
                            recetasDetalladas.forEach((item, i) => {
                              mensaje += `${i + 1}. ${item.nombre} - ${item.porciones} porciones\n   (${item.comida})${item.modificada ? ' [MODIFICADA]' : ''}\n`;
                              if (!item.tieneIngredientes) {
                                mensaje += `   ⚠️ Sin ingredientes definidos\n`;
                              }
                            });
                          }
                          
                          mensaje += `\n💡 Si no ves items en la lista de compras:\n`;
                          mensaje += `• Verifica que guardaste las comidas\n`;
                          mensaje += `• Asegúrate que las recetas tengan ingredientes\n`;
                          mensaje += `• Revisa la consola para más detalles`;
                          
                          alert(mensaje);
                        }

                        console.log('=====================================');
                      }}
                    >
                      🔍 Diagnosticar
                    </button>
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
                </div>

                {/* Tabla de planificación semanal */}
                <div className="table-responsive">
                  <table className="table table-sm table-bordered">
                    <thead className="table-light">
                      <tr>
                        <th style={{width: '150px'}}>Comida</th>
                        {daysOfWeek.map(day => (
                          <th key={day} className="text-center" style={{width: '120px'}}>
                            {day}
                          </th>
                        ))}
                        <th className="text-center" style={{width: '100px'}}>Total Semana</th>
                      </tr>
                    </thead>
                    <tbody>
                      {enabledMealTypes.map(type => {
                        // Calcular totales semanales para este tipo de comida
                        const weeklyTotals = daysOfWeek.reduce((totals, day) => {
                          const meal = getMealForDayAndType(day, type.key);
                          if (meal) {
                            totals.calories += meal.total_calories;
                            totals.count += 1;
                            // Debug específico para recetas
                            if (meal.recipes.length > 0) {
                              console.log(`🔍 ${type.key} ${day} tiene ${meal.recipes.length} recetas:`, 
                                meal.recipes.map(r => `${r.recipe_name}: ${r.calories} kcal${r.is_modified ? ' (MOD)' : ''}`));
                            }
                          }
                          return totals;
                        }, { calories: 0, count: 0 });
                        
                        // Debug de totales semanales
                        if (weeklyTotals.calories > 0) {
                          console.log(`📊 Totales semanales ${type.key}:`, weeklyTotals);
                        }

                        return (
                          <tr key={type.key}>
                            <td className="fw-medium">
                              <div className="d-flex align-items-center">
                                <span className="me-2">{type.icon}</span>
                                <small>{type.label}</small>
                              </div>
                            </td>
                            {daysOfWeek.map(day => {
                              const meal = getMealForDayAndType(day, type.key);
                              console.log(`🎯 Renderizando celda ${day} - ${type.key}, meal encontrada:`, meal);
                              return (
                                <td key={day} className="text-center p-1">
                                  {meal ? (
                                    <div className="meal-cell">
                                      <div className="text-success fw-bold small">
                                        {Math.round(meal.total_calories)} kcal
                                      </div>
                                      {meal.meal_description && (
                                        <div className="text-muted small text-truncate" title={meal.meal_description}>
                                          {meal.meal_description.substring(0, 30)}...
                                        </div>
                                      )}
                                      {meal.foods.length > 0 && (
                                        <div className="text-info small">
                                          {meal.foods.length} alimento{meal.foods.length > 1 ? 's' : ''}
                                        </div>
                                      )}
                                      {meal.recipes.length > 0 && (
                                        <div className="text-warning small">
                                          {meal.recipes.length} receta{meal.recipes.length > 1 ? 's' : ''}
                                          {meal.recipes.some(r => r.is_modified) && (
                                            <span className="badge bg-warning ms-1" style={{fontSize: '0.6em'}}>
                                              Modificada{meal.recipes.filter(r => r.is_modified).length > 1 ? 's' : ''}
                                            </span>
                                          )}
                                        </div>
                                      )}
                                      <div className="mt-1">
                                        <button
                                          className="btn btn-sm btn-outline-primary me-1"
                                          onClick={() => {
                                            setEditingMeal(meal);
                                            setSelectedDay(day);
                                            setShowFoodModal(true);
                                          }}
                                          title="Editar comida"
                                        >
                                          <Edit size={10} />
                                        </button>
                                        <button
                                          className="btn btn-sm btn-outline-danger"
                                          onClick={() => {
                                            const updatedPlans = plans.map(plan => {
                                              if (plan.week_number === selectedWeek) {
                                                return {
                                                  ...plan,
                                                  meals: plan.meals.filter(m => 
                                                    !(m.day === day && m.meal_type === type.key)
                                                  )
                                                };
                                              }
                                              return plan;
                                            });
                                            setPlans(updatedPlans);
                                          }}
                                          title="Eliminar comida"
                                        >
                                          <Trash2 size={10} />
                                        </button>
                                      </div>
                                    </div>
                                  ) : (
                                    <button
                                      className="btn btn-sm btn-outline-secondary w-100"
                                      onClick={() => {
                                        const newMeal = createEmptyMeal(day, type.key);
                                        setEditingMeal(newMeal);
                                        setSelectedDay(day);
                                        setShowFoodModal(true);
                                      }}
                                      title="Agregar comida"
                                    >
                                      <Plus size={12} />
                                    </button>
                                  )}
                                </td>
                              );
                            })}
                            <td className="text-center">
                              <div className="fw-bold text-primary">
                                {Math.round(weeklyTotals.calories)} kcal
                              </div>
                              <small className="text-muted">
                                ({weeklyTotals.count} comidas)
                              </small>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                    <tfoot className="table-secondary">
                      <tr>
                        <td className="fw-bold">Total Diario</td>
                        {daysOfWeek.map(day => {
                          const dayTotals = getDailyTotals(day);
                          return (
                            <td key={day} className="text-center">
                              <div className="fw-bold">
                                {Math.round(dayTotals.calories)} kcal
                              </div>
                              <small className="text-muted">
                                P: {Math.round(dayTotals.protein)}g
                              </small>
                            </td>
                          );
                        })}
                        <td className="text-center">
                          <div className="fw-bold text-success">
                            {Math.round(plans.find(p => p.week_number === selectedWeek)?.daily_calories_target || 0)} kcal
                          </div>
                          <small className="text-muted">Objetivo</small>
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'restrictions' && (
          <div>
            <Alert variant="info" className="mb-3">
              <Shield className="me-2" />
              <strong>Restricciones aplicadas:</strong> Solo se muestran alimentos y recetas compatibles.
            </Alert>
          </div>
        )}

        {activeTab === 'objectives' && (
          <div>
            <Alert variant="success" className="mb-3">
              <Target className="me-2" />
              <strong>Objetivos nutricionales del plan:</strong> El planificador respeta estos objetivos.
            </Alert>
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
      <Modal show={showFoodModal} onHide={() => setShowFoodModal(false)} size="xl">
        <Modal.Header closeButton>
          <Modal.Title>
            {editingMeal ? `Editar ${mealTypes.find(t => t.key === editingMeal.meal_type)?.label} - ${selectedDay}` : 'Agregar Comida'}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {editingMeal && (
            <div>
              {/* Tabs para tipo de contenido */}
              <Tabs activeKey={contentType} onSelect={(k) => setContentType(k as any)} className="mb-3">
                <Tab eventKey="foods" title={
                  <span><Apple className="me-1" size={16} />Alimentos</span>
                }>
                  <div className="mb-3">
                    <Form.Control
                      type="text"
                      placeholder="Buscar alimentos..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                                    <div 
                    className="border rounded p-2" 
                    style={{
                      height: '400px',
                      overflowY: 'auto',
                      backgroundColor: '#f8f9fa'
                    }}
                  >
                    <div className="row">
                      {filteredFoods.map(food => (
                        <FoodItem key={food.id} food={food} onAdd={addFoodToMeal} />
                      ))}
                    </div>
                  </div>
                </Tab>
                
                <Tab eventKey="recipes" title={
                  <span><ChefHat className="me-1" size={16} />Recetas</span>
                }>
                  <div className="mb-3">
                    <Form.Control
                      type="text"
                      placeholder="Buscar recetas..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <div 
                    className="border rounded p-2" 
                    style={{
                      height: '400px',
                      overflowY: 'auto',
                      backgroundColor: '#f8f9fa'
                    }}
                  >
                    <div className="row">
                      {filteredRecipes.map(recipe => (
                        <RecipeItem key={recipe.id} recipe={recipe} onAdd={addRecipeToMeal} onEdit={handleEditRecipe} />
                      ))}
                    </div>
                  </div>
                </Tab>

                <Tab eventKey="manual" title={
                  <span><Edit className="me-1" size={16} />Manual</span>
                }>
                  <div className="mb-3">
                    <Form.Group className="mb-2">
                      <Form.Label>Descripción de la comida</Form.Label>
                      <Form.Control
                        as="textarea"
                        rows={3}
                        value={editingMeal.meal_description || ''}
                        onChange={(e) => setEditingMeal({
                          ...editingMeal,
                          meal_description: e.target.value
                        })}
                        placeholder="Ej: Ensalada de pollo con aguacate y aceite de oliva"
                      />
                    </Form.Group>
                    
                    <Row>
                      <Col md={3}>
                        <Form.Group>
                          <Form.Label>Calorías</Form.Label>
                          <Form.Control
                            type="number"
                            value={editingMeal.total_calories}
                            onChange={(e) => setEditingMeal({
                              ...editingMeal,
                              total_calories: Number(e.target.value)
                            })}
                          />
                        </Form.Group>
                      </Col>
                      <Col md={3}>
                        <Form.Group>
                          <Form.Label>Proteína (g)</Form.Label>
                          <Form.Control
                            type="number"
                            value={editingMeal.total_protein}
                            onChange={(e) => setEditingMeal({
                              ...editingMeal,
                              total_protein: Number(e.target.value)
                            })}
                          />
                        </Form.Group>
                      </Col>
                      <Col md={3}>
                        <Form.Group>
                          <Form.Label>Carbohidratos (g)</Form.Label>
                          <Form.Control
                            type="number"
                            value={editingMeal.total_carbs}
                            onChange={(e) => setEditingMeal({
                              ...editingMeal,
                              total_carbs: Number(e.target.value)
                            })}
                          />
                        </Form.Group>
                      </Col>
                      <Col md={3}>
                        <Form.Group>
                          <Form.Label>Grasas (g)</Form.Label>
                          <Form.Control
                            type="number"
                            value={editingMeal.total_fats}
                            onChange={(e) => setEditingMeal({
                              ...editingMeal,
                              total_fats: Number(e.target.value)
                            })}
                          />
                        </Form.Group>
                      </Col>
                    </Row>

                    <Button 
                      variant="success" 
                      className="mt-3"
                      onClick={() => {
                        updateMealInPlan(editingMeal);
                        alert('Comida manual guardada. Haz clic en "Guardar Comida" para finalizar.');
                      }}
                    >
                      <Save className="me-1" size={16} />
                      Aplicar Valores Manuales
                    </Button>
                  </div>
                </Tab>
              </Tabs>

              {/* Resumen de la comida actual */}
              <div className="mt-4">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h6>Contenido de la comida:</h6>
                  <div>
                    {(editingMeal.foods.length > 0 || editingMeal.recipes.length > 0) ? (
                      <Badge bg="success" className="me-2">
                        {editingMeal.foods.length} alimentos + {editingMeal.recipes.length} recetas
                      </Badge>
                    ) : (
                      <Badge bg="secondary">
                        Comida vacía
                      </Badge>
                    )}
                  </div>
                </div>
                
                {/* Alimentos agregados */}
                {editingMeal.foods.length > 0 ? (
                  <div className="mb-3">
                    <h6 className="text-success">Alimentos:</h6>
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
                              <td>{food.quantity_grams}g</td>
                              <td>{Math.round(food.calories)} kcal</td>
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
                      </table>
                    </div>
                  </div>
                ) : (
                  <Alert variant="light" className="small text-center mb-3">
                    <em>No hay alimentos agregados. Usa el tab "Alimentos" arriba para seleccionar.</em>
                  </Alert>
                )}

                {/* Recetas agregadas */}
                {editingMeal.recipes.length > 0 && (
                  <div className="mb-3">
                    <h6 className="text-warning">Recetas:</h6>
                    <div className="table-responsive">
                      <table className="table table-sm">
                        <thead>
                          <tr>
                            <th>Receta</th>
                            <th>Porciones</th>
                            <th>Calorías</th>
                            <th>Proteínas</th>
                            <th>Carbohidratos</th>
                            <th>Grasas</th>
                            <th></th>
                          </tr>
                        </thead>
                        <tbody>
                          {editingMeal.recipes.map((recipe, index) => (
                            <tr key={index} className={recipe.is_modified ? 'table-warning' : ''}>
                              <td>
                                <div>
                                  {recipe.recipe_name}
                                  {recipe.is_modified && (
                                    <div>
                                      <Badge bg="warning" className="ms-1">Modificada</Badge>
                                      <small className="text-muted d-block">
                                        Creada: {new Date(recipe.modification_timestamp!).toLocaleTimeString()}
                                      </small>
                                    </div>
                                  )}
                                </div>
                              </td>
                              <td>{recipe.servings}</td>
                              <td>{Math.round(recipe.calories)} kcal</td>
                              <td>{Math.round(recipe.protein)}g</td>
                              <td>{Math.round(recipe.carbs)}g</td>
                              <td>{Math.round(recipe.fats)}g</td>
                              <td>
                                <div className="btn-group btn-group-sm">
                                  {recipe.is_modified && recipe.recipe_data && (
                                    <button
                                      className="btn btn-outline-info"
                                      onClick={() => {
                                        alert(`Receta Modificada:\n\nTítulo: ${recipe.recipe_data!.title}\nDescripción: ${recipe.recipe_data!.description}\nCalorías Totales: ${recipe.recipe_data!.totalCalories}\nPorciones Originales: ${recipe.recipe_data!.servings}`);
                                      }}
                                      title="Ver detalles de modificación"
                                    >
                                      <Edit size={10} />
                                    </button>
                                  )}
                                  <button
                                    className="btn btn-outline-danger"
                                    onClick={() => removeRecipeFromMeal(index)}
                                    title="Eliminar receta"
                                  >
                                    <Trash2 size={10} />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Total de la comida */}
                <div className="alert alert-info">
                  <strong>Total de la comida:</strong>
                  <div className="row mt-2">
                    <div className="col-md-3">
                      <strong>Calorías:</strong> {Math.round(editingMeal.total_calories)} kcal
                    </div>
                    <div className="col-md-3">
                      <strong>Proteínas:</strong> {Math.round(editingMeal.total_protein)}g
                    </div>
                    <div className="col-md-3">
                      <strong>Carbohidratos:</strong> {Math.round(editingMeal.total_carbs)}g
                    </div>
                    <div className="col-md-3">
                      <strong>Grasas:</strong> {Math.round(editingMeal.total_fats)}g
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <div className="d-flex justify-content-between align-items-center w-100">
            <div>
              {editingMeal && (
                <small className="text-muted">
                  Total: <strong>{Math.round(editingMeal.total_calories)} kcal</strong> | 
                  P: {Math.round(editingMeal.total_protein)}g | 
                  C: {Math.round(editingMeal.total_carbs)}g | 
                  G: {Math.round(editingMeal.total_fats)}g
                </small>
              )}
            </div>
            <div>
              <Button 
                variant="secondary" 
                onClick={() => setShowFoodModal(false)}
                className="me-2"
              >
                Cancelar
              </Button>
              <Button 
                variant="success" 
                size="lg"
                className="px-4"
                onClick={() => {
                  console.log('💾 Botón Guardar Comida clickeado');
                  console.log('💾 Estado de editingMeal:', editingMeal);
                  if (editingMeal) {
                    console.log('💾 Guardando comida con datos:', {
                      day: editingMeal.day,
                      meal_type: editingMeal.meal_type,
                      foods: editingMeal.foods.length,
                      recipes: editingMeal.recipes.length,
                      calories: editingMeal.total_calories,
                      recipesDetail: editingMeal.recipes.map(r => ({
                        name: r.recipe_name,
                        calories: r.calories,
                        isModified: r.is_modified,
                        hasRecipeData: !!r.recipe_data
                      }))
                    });
                    updateMealInPlan(editingMeal);
                    setShowFoodModal(false);
                    console.log('💾 Modal cerrado, comida debería estar guardada');
                    
                    // Feedback visual para el usuario
                    alert(`✅ Comida guardada exitosamente!\n\n${editingMeal.foods.length} alimentos + ${editingMeal.recipes.length} recetas\nTotal: ${Math.round(editingMeal.total_calories)} kcal`);
                  } else {
                    console.error('💾 ❌ No hay editingMeal para guardar');
                  }
                }}
                disabled={!editingMeal || (editingMeal.foods.length === 0 && editingMeal.recipes.length === 0 && !editingMeal.meal_description)}
              >
                <Save className="me-2" size={20} />
                {editingMeal && (editingMeal.foods.length > 0 || editingMeal.recipes.length > 0) 
                  ? `Guardar Comida (${editingMeal.foods.length + editingMeal.recipes.length} items)` 
                  : 'Guardar Comida'}
              </Button>
            </div>
          </div>
        </Modal.Footer>
      </Modal>

      {/* Modal de edición avanzada de recetas */}
      <RecipeEditorModal
        show={showRecipeEditor}
        onHide={() => {
          setShowRecipeEditor(false);
          setEditingRecipe(null);
        }}
        recipe={editingRecipe}
        onSave={handleSaveRecipeChanges}
        availableFoods={foods}
      />

      {/* Modal de lista de compras */}
      <ShoppingListModal
        show={showShoppingList}
        onHide={() => setShowShoppingList(false)}
        weeklyPlan={getCurrentPlan() as any}
        patientName={dietPlan?.patient_name || 'Paciente'}
      />

      {/* Modal de visualización de recetas */}
      {showRecipeViewer && viewingRecipe && (
        <RecipeViewer
          recipe={viewingRecipe}
          isOpen={showRecipeViewer}
          onClose={() => {
            setShowRecipeViewer(false);
            setViewingRecipe(null);
          }}
          onEdit={() => {
            setShowRecipeViewer(false);
            setEditingRecipe(viewingRecipe);
            setShowRecipeEditor(true);
          }}
        />
      )}

      {/* Modal de aplicador de plantillas */}
      <TemplateApplicator
        isOpen={showTemplateApplicator}
        onClose={() => setShowTemplateApplicator(false)}
        dietPlanId={dietPlan.id}
        patientId={dietPlan.patient_id}
        weekNumber={selectedWeek}
        onTemplateApplied={handleTemplateApplied}
      />
    </Modal>
  );
};

// Componente para mostrar alimentos
interface FoodItemProps {
  food: Food;
  onAdd: (food: Food, quantity: number) => void;
}

const FoodItem: React.FC<FoodItemProps> = ({ food, onAdd }) => {
  const [quantity, setQuantity] = useState(100);
  const [isAdding, setIsAdding] = useState(false);

  const handleAdd = async () => {
    setIsAdding(true);
    try {
      await onAdd(food, quantity);
      // Pequeño feedback visual
      setTimeout(() => {
        setIsAdding(false);
      }, 500);
    } catch (error) {
      setIsAdding(false);
    }
  };

  return (
    <div className="col-md-6 col-lg-4 mb-2">
      <div className={`border rounded p-2 ${isAdding ? 'bg-light border-success' : ''}`}>
        <div className="d-flex justify-content-between align-items-start mb-2">
          <div>
            <strong>{food.name}</strong>
            <br />
            <small className="text-muted">{food.category || 'Alimento'}</small>
          </div>
          <Badge bg="success">{Math.round(food.calories)} kcal/100g</Badge>
        </div>
        
        <div className="mb-2">
          <small className="text-muted">
            P: {food.protein}g | C: {food.carbohydrates}g | G: {food.fats}g
          </small>
        </div>
        
        <div className="d-flex align-items-center justify-content-between">
          <div className="d-flex align-items-center">
            <input
              type="number"
              className="form-control form-control-sm me-2"
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
              min="1"
              style={{width: '70px'}}
            />
            <span className="text-muted small">g</span>
          </div>
          <button
            className={`btn btn-sm ${isAdding ? 'btn-success' : 'btn-primary'}`}
            onClick={handleAdd}
            disabled={isAdding}
          >
            {isAdding ? <CheckCircle size={12} /> : <Plus size={12} />}
          </button>
        </div>
        
        {isAdding && (
          <div className="text-center mt-2">
            <small className="text-success">
              ✅ Agregado: {quantity}g
            </small>
          </div>
        )}
      </div>
    </div>
  );
};

// Componente para mostrar recetas
interface RecipeItemProps {
  recipe: Recipe;
  onAdd: (recipe: Recipe, servings: number, isModified?: boolean) => void;
  onModify?: (recipe: Recipe) => void;
  onEdit?: (recipe: Recipe) => void;
}

const RecipeItem: React.FC<RecipeItemProps> = ({ recipe, onAdd, onEdit }) => {
  const [servings, setServings] = useState(1);
  const [isEditing, setIsEditing] = useState(false);
  const [editedRecipe, setEditedRecipe] = useState<Recipe>(recipe);

  const handleSaveChanges = () => {
    // Aquí podrías llamar a un servicio para guardar cambios permanentes si es necesario
    setIsEditing(false);
    console.log('💾 Cambios guardados para la receta:', editedRecipe.title);
    console.log('💾 Datos de la receta modificada:', editedRecipe);
    
    // Mostrar mensaje de confirmación
    const changes = [];
    if (editedRecipe.title !== recipe.title) changes.push(`Título: "${editedRecipe.title}"`);
    if (editedRecipe.totalCalories !== recipe.totalCalories) changes.push(`Calorías: ${editedRecipe.totalCalories}`);
    if (editedRecipe.servings !== recipe.servings) changes.push(`Porciones: ${editedRecipe.servings}`);
    
    if (changes.length > 0) {
      alert(`✅ Receta modificada con éxito!\n\nCambios realizados:\n${changes.join('\n')}\n\nAhora puedes seleccionar esta versión modificada.`);
    }
  };

  const handleSelectRecipe = () => {
    console.log('🎯 Seleccionando receta modificada:', editedRecipe);
    onAdd(editedRecipe, servings, true); // true = es una receta modificada
  };

  const resetChanges = () => {
    setEditedRecipe(recipe);
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <div className="col-md-12 mb-3">
        <div className="border rounded p-3 bg-light">
          <h6 className="text-primary mb-3">
            <Edit size={16} className="me-1" />
            Modificando: {recipe.title}
          </h6>
          
          <Row>
            <Col md={6}>
              <Form.Group className="mb-2">
                <Form.Label className="small">Título:</Form.Label>
                <Form.Control
                  size="sm"
                  value={editedRecipe.title}
                  onChange={(e) => setEditedRecipe({
                    ...editedRecipe,
                    title: e.target.value
                  })}
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-2">
                <Form.Label className="small">Porciones originales:</Form.Label>
                <Form.Control
                  size="sm"
                  type="number"
                  value={editedRecipe.servings}
                  onChange={(e) => setEditedRecipe({
                    ...editedRecipe,
                    servings: Number(e.target.value)
                  })}
                />
              </Form.Group>
            </Col>
          </Row>

          <Form.Group className="mb-2">
            <Form.Label className="small">Descripción:</Form.Label>
            <Form.Control
              as="textarea"
              rows={2}
              size="sm"
              value={editedRecipe.description || ''}
              onChange={(e) => setEditedRecipe({
                ...editedRecipe,
                description: e.target.value
              })}
            />
          </Form.Group>

          <Row className="mb-3">
            <Col md={3}>
              <Form.Group>
                <Form.Label className="small">Calorías totales:</Form.Label>
                <Form.Control
                  size="sm"
                  type="number"
                  value={editedRecipe.totalCalories || 0}
                  onChange={(e) => setEditedRecipe({
                    ...editedRecipe,
                    totalCalories: Number(e.target.value)
                  })}
                />
              </Form.Group>
            </Col>
            <Col md={3}>
              <Form.Group>
                <Form.Label className="small">Proteínas (g):</Form.Label>
                <Form.Control
                  size="sm"
                  type="number"
                  value={editedRecipe.totalMacros?.protein || 0}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditedRecipe({
                    ...editedRecipe,
                    totalMacros: {
                      ...editedRecipe.totalMacros!,
                      protein: Number(e.target.value)
                    }
                  })}
                />
              </Form.Group>
            </Col>
            <Col md={3}>
              <Form.Group>
                <Form.Label className="small">Carbohidratos (g):</Form.Label>
                <Form.Control
                  size="sm"
                  type="number"
                  value={editedRecipe.totalMacros?.carbohydrates || 0}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditedRecipe({
                    ...editedRecipe,
                    totalMacros: {
                      ...editedRecipe.totalMacros!,
                      carbohydrates: Number(e.target.value)
                    }
                  })}
                />
              </Form.Group>
            </Col>
            <Col md={3}>
              <Form.Group>
                <Form.Label className="small">Grasas (g):</Form.Label>
                <Form.Control
                  size="sm"
                  type="number"
                  value={editedRecipe.totalMacros?.fats || 0}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditedRecipe({
                    ...editedRecipe,
                    totalMacros: {
                      ...editedRecipe.totalMacros!,
                      fats: Number(e.target.value)
                    }
                  })}
                />
              </Form.Group>
            </Col>
          </Row>

          <div className="d-flex justify-content-between align-items-center">
            <div className="d-flex align-items-center">
              <input
                type="number"
                className="form-control form-control-sm me-2"
                value={servings}
                onChange={(e) => setServings(Number(e.target.value))}
                min="0.1"
                step="0.1"
                style={{width: '80px'}}
              />
              <span className="text-muted me-2">porciones para el plan</span>
            </div>
            
            <div className="btn-group btn-group-sm">
              <button
                className="btn btn-outline-secondary"
                onClick={resetChanges}
                title="Cancelar cambios"
              >
                Cancelar
              </button>
              <button
                className="btn btn-success"
                onClick={handleSaveChanges}
                title="Guardar cambios"
              >
                <Save size={12} className="me-1" />
                Guardar
              </button>
                             <button
                 className="btn btn-primary"
                 onClick={handleSelectRecipe}
                 title="Agregar esta versión modificada al plan de comidas"
               >
                 <CheckCircle size={12} className="me-1" />
                 Agregar Modificada
               </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="col-md-6 col-lg-4 mb-2">
      <div className="border rounded p-2">
        <div className="d-flex justify-content-between align-items-start mb-2">
          <div>
            <strong>{recipe.title}</strong>
            <br />
            <small className="text-muted">
              {recipe.servings} porciones | {recipe.prepTimeMinutes}min
            </small>
          </div>
          <Badge bg="warning">{Math.round(recipe.totalCalories || 0)} kcal</Badge>
        </div>
        
        <div className="mb-2">
          <small className="text-muted">
            {recipe.description?.substring(0, 50)}...
          </small>
        </div>

        <div className="mb-2">
          <small className="text-success">
            P: {Math.round(recipe.totalMacros?.protein || 0)}g | 
            C: {Math.round(recipe.totalMacros?.carbohydrates || 0)}g | 
            G: {Math.round(recipe.totalMacros?.fats || 0)}g
          </small>
        </div>
        
        <div className="d-flex align-items-center justify-content-between">
          <div className="d-flex align-items-center">
            <input
              type="number"
              className="form-control form-control-sm me-2"
              value={servings}
              onChange={(e) => setServings(Number(e.target.value))}
              min="0.1"
              step="0.1"
              style={{width: '70px'}}
            />
            <span className="text-muted small">porciones</span>
          </div>
          
          <div className="btn-group btn-group-sm">
            <button
              className="btn btn-outline-info"
              onClick={() => onEdit && onEdit(recipe)}
              title="Modificar receta en editor avanzado"
            >
              <Edit size={10} />
            </button>
            <button
              className="btn btn-warning"
              onClick={() => {
                console.log('🍳 Agregando receta original (sin modificar):', recipe.title);
                onAdd(recipe, servings, false); // false = receta original
              }}
              title="Agregar receta tal como está"
            >
              <Plus size={10} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MealPlanner; 