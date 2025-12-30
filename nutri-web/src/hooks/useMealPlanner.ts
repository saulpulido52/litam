import { useState, useCallback, useEffect, useMemo } from 'react';
import { foodService } from '../services/foodService';
import { recipeService } from '../services/recipeService';
import type { Recipe } from '../services/recipeService';

// Interfaces compatible with existing code
export interface Food {
    id: string;
    name: string;
    calories: number;
    protein: number;
    carbohydrates: number;
    fats: number;
    unit: string;
    serving_size: number;
    category?: string;
}

export interface MealFood {
    food_id: string;
    food_name: string;
    quantity_grams: number;
    calories: number;
    protein: number;
    carbs: number;
    fats: number;
}

export interface MealRecipe {
    recipe_id: string;
    recipe_name: string;
    servings: number;
    calories: number;
    protein: number;
    carbs: number;
    fats: number;
    original_recipe_id?: string;
    is_modified?: boolean;
    modification_timestamp?: string;
    recipe_data?: any;
}

export interface Meal {
    id?: string;
    day: 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday' | 'Lunes' | 'Martes' | 'Miércoles' | 'Jueves' | 'Viernes' | 'Sábado' | 'Domingo';
    meal_type: 'breakfast' | 'morning_snack' | 'lunch' | 'afternoon_snack' | 'dinner' | 'evening_snack';
    meal_time: string;
    foods: MealFood[];
    recipes: MealRecipe[];
    total_calories: number;
    total_protein: number;
    total_carbs: number;
    total_fats: number;
    notes?: string;
}

export interface WeeklyPlan {
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

interface UseMealPlannerProps {
    initialPlans: WeeklyPlan[];
    dietPlan: any;
    isOpen: boolean;
    onSave: (plans: WeeklyPlan[]) => void;
}

export const useMealPlanner = ({
    initialPlans,
    dietPlan,
    isOpen,
    onSave
}: UseMealPlannerProps) => {
    // === STATE ===
    const [plans, setPlans] = useState<WeeklyPlan[]>([]);
    const [selectedWeek, setSelectedWeek] = useState<number>(1);
    const [foods, setFoods] = useState<Food[]>([]);
    const [recipes, setRecipes] = useState<Recipe[]>([]);
    const [isLoadingData, setIsLoadingData] = useState(false);
    const [dataError, setDataError] = useState<string | null>(null);

    // === INITIALIZATION ===
    // === INITIALIZATION & LOCAL STORAGE ===
    useEffect(() => {
        if (!dietPlan?.id) return;

        const storageKey = `meal_plan_draft_${dietPlan.id}`;
        let localDraft: WeeklyPlan[] | null = null;

        try {
            const saved = localStorage.getItem(storageKey);
            if (saved) {
                localDraft = JSON.parse(saved);
            }
        } catch (e) {
            console.error('Error parsing local draft:', e);
        }

        // Strategy: Use Local Draft if available and has content (User "Source of Truth")
        // Otherwise use DB data (initialPlans), otherwise generate defaults.

        const hasLocalContent = localDraft && localDraft.some(p => p.meals && p.meals.length > 0);

        if (hasLocalContent && localDraft) {
            console.log('useMealPlanner: Local Draft found. Reconciling with current plan settings...');

            // 1. Calculate EXPECTED numberOfWeeks based on current plan
            let numberOfWeeks = 4;
            if (dietPlan?.duration_value && dietPlan?.duration_unit) {
                const val = Number(dietPlan.duration_value);
                if (dietPlan.duration_unit === 'weeks' || dietPlan.duration_unit === 'semanas') {
                    numberOfWeeks = val;
                } else if (dietPlan.duration_unit === 'months' || dietPlan.duration_unit === 'meses') {
                    numberOfWeeks = val * 4;
                }
            } else if (dietPlan?.start_date && dietPlan?.end_date) {
                const start = new Date(dietPlan.start_date);
                const end = new Date(dietPlan.end_date);
                const diffTime = Math.abs(end.getTime() - start.getTime());
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
                numberOfWeeks = Math.ceil(diffDays / 7);
            }
            if (numberOfWeeks < 1) numberOfWeeks = 1;
            if (numberOfWeeks > 12) numberOfWeeks = 12;

            // 2. Determine correct calorie target
            const targetCal = dietPlan?.target_calories || dietPlan?.daily_calories_target || 2000;
            const targetMacros = {
                protein: dietPlan?.daily_macros_target?.protein || Math.round(targetCal * 0.25 / 4) || 100,
                carbohydrates: dietPlan?.daily_macros_target?.carbohydrates || Math.round(targetCal * 0.50 / 4) || 250,
                fats: dietPlan?.daily_macros_target?.fats || Math.round(targetCal * 0.25 / 9) || 60
            };

            // Fix Duration: Slice or Extend draft
            let reconciledWithDuration = [...localDraft];

            // Update Calories for ALL existing weeks to match current plan
            reconciledWithDuration = reconciledWithDuration.map(p => ({
                ...p,
                daily_calories_target: targetCal, // Force sync calorie target
                daily_macros_target: targetMacros
            }));

            if (reconciledWithDuration.length > numberOfWeeks) {
                console.log(`useMealPlanner: Trimming draft from ${reconciledWithDuration.length} to ${numberOfWeeks} weeks.`);
                reconciledWithDuration = reconciledWithDuration.slice(0, numberOfWeeks);
            } else if (reconciledWithDuration.length < numberOfWeeks) {
                console.log(`useMealPlanner: Extending draft from ${reconciledWithDuration.length} to ${numberOfWeeks} weeks.`);
                for (let i = reconciledWithDuration.length + 1; i <= numberOfWeeks; i++) {
                    let weekStart = new Date();
                    if (dietPlan?.start_date) {
                        weekStart = new Date(dietPlan.start_date);
                        weekStart.setDate(weekStart.getDate() + (i - 1) * 7);
                    }
                    const weekEnd = new Date(weekStart);
                    weekEnd.setDate(weekEnd.getDate() + 6);

                    reconciledWithDuration.push({
                        week_number: i,
                        start_date: weekStart.toISOString().split('T')[0],
                        end_date: weekEnd.toISOString().split('T')[0],
                        daily_calories_target: targetCal,
                        daily_macros_target: targetMacros,
                        meals: []
                    });
                }
            }

            setPlans(reconciledWithDuration);
            return;
        }

        if (initialPlans && initialPlans.length > 0) {
            console.log('useMealPlanner: Initializing with DB plans. Checking duration consistency...');

            // 1. Calculate Target Duration
            let targetWeeks = 4;
            if (dietPlan?.custom_duration?.value) {
                const val = Number(dietPlan.custom_duration.value);
                const unit = String(dietPlan.custom_duration.unit).toLowerCase();
                if (unit.includes('week') || unit.includes('semana')) targetWeeks = val;
                else if (unit.includes('month') || unit.includes('mes')) targetWeeks = val * 4;
            }
            else if (dietPlan?.total_weeks) {
                targetWeeks = Number(dietPlan.total_weeks);
            }
            else if (dietPlan?.duration_value && dietPlan?.duration_unit) {
                const val = Number(dietPlan.duration_value);
                const unit = String(dietPlan.duration_unit).toLowerCase();
                if (unit.includes('week') || unit.includes('semana')) targetWeeks = val;
                else if (unit.includes('month') || unit.includes('mes')) targetWeeks = val * 4;
            }
            else if (dietPlan?.start_date && dietPlan?.end_date) {
                const start = new Date(dietPlan.start_date);
                const end = new Date(dietPlan.end_date);
                const diffTime = Math.abs(end.getTime() - start.getTime());
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                targetWeeks = Math.round(diffDays / 7);
                if (targetWeeks < 1 && diffDays > 0) targetWeeks = 1;
            }
            targetWeeks = Math.max(1, Math.min(targetWeeks, 12));

            // 2. Normalize existing plans
            let reconciled = initialPlans.map((p, index) => ({
                ...p,
                week_number: p.week_number || (index + 1),
                meals: p.meals || []
            }));

            // 3. Resize (Slice or Extend) PRESERVING MEALS
            if (reconciled.length > targetWeeks) {
                console.log(`useMealPlanner: Resizing DB plans from ${reconciled.length} to ${targetWeeks} weeks.`);
                reconciled = reconciled.slice(0, targetWeeks);
            } else if (reconciled.length < targetWeeks) {
                console.log(`useMealPlanner: Extending DB plans from ${reconciled.length} to ${targetWeeks} weeks.`);
                const targetCal = dietPlan?.target_calories || dietPlan?.daily_calories_target || 2000;
                const targetMacros = {
                    protein: dietPlan?.daily_macros_target?.protein || Math.round(targetCal * 0.25 / 4) || 100,
                    carbohydrates: dietPlan?.daily_macros_target?.carbohydrates || Math.round(targetCal * 0.50 / 4) || 250,
                    fats: dietPlan?.daily_macros_target?.fats || Math.round(targetCal * 0.25 / 9) || 60
                };

                for (let i = reconciled.length + 1; i <= targetWeeks; i++) {
                    // Calculate dates for new week
                    let weekStart = new Date();
                    if (dietPlan?.start_date) {
                        weekStart = new Date(dietPlan.start_date);
                        weekStart.setDate(weekStart.getDate() + (i - 1) * 7);
                    }
                    const weekEnd = new Date(weekStart);
                    weekEnd.setDate(weekEnd.getDate() + 6);

                    reconciled.push({
                        week_number: i,
                        start_date: weekStart.toISOString().split('T')[0],
                        end_date: weekEnd.toISOString().split('T')[0],
                        daily_calories_target: targetCal,
                        daily_macros_target: targetMacros,
                        meals: []
                    });
                }
            }

            console.log('useMealPlanner: Final reconciled plans:', reconciled);
            setPlans(reconciled);
        } else {
            // Generar planes por defecto basados en la duración del plan
            const defaultPlans: WeeklyPlan[] = [];
            let numberOfWeeks = 4; // Default fallback

            // 1. Prioridad: Duración explícita
            if (dietPlan?.duration_value && dietPlan?.duration_unit) {
                const val = Number(dietPlan.duration_value);
                const unit = String(dietPlan.duration_unit).toLowerCase();

                if (unit.includes('week') || unit.includes('semana')) {
                    numberOfWeeks = val;
                } else if (unit.includes('month') || unit.includes('mes')) {
                    numberOfWeeks = val * 4;
                }
            }
            // 2. Fallback: Fechas (si no hay duration_value)
            else if (dietPlan?.start_date && dietPlan?.end_date) {
                const start = new Date(dietPlan.start_date);
                const end = new Date(dietPlan.end_date);
                const diffTime = Math.abs(end.getTime() - start.getTime());
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
                numberOfWeeks = Math.ceil(diffDays / 7);
            }

            if (numberOfWeeks < 1) numberOfWeeks = 1;
            if (numberOfWeeks > 12) numberOfWeeks = 12; // Safety cap

            console.log(`useMealPlanner: Generating ${numberOfWeeks} weeks based on plan dates`);

            for (let week = 1; week <= numberOfWeeks; week++) {
                const startDate = new Date(); // Esto debería ser dietPlan.start_date idealmente, pero mantenemos lógica actual para las fechas relativas si es necesario, O MEJOR AUN:

                // Usar la fecha real del plan si existe
                let weekStart = new Date();
                if (dietPlan?.start_date) {
                    weekStart = new Date(dietPlan.start_date);
                    weekStart.setDate(weekStart.getDate() + (week - 1) * 7);
                } else {
                    weekStart.setDate(weekStart.getDate() + (week - 1) * 7);
                }

                const weekEnd = new Date(weekStart);
                weekEnd.setDate(weekEnd.getDate() + 6);

                // Fix Calorie Mapping: check target_calories first (DB standard), then daily_calories_target
                const targetCal = dietPlan?.target_calories || dietPlan?.daily_calories_target || 2000;

                defaultPlans.push({
                    week_number: week,
                    start_date: weekStart.toISOString().split('T')[0],
                    end_date: weekEnd.toISOString().split('T')[0],
                    daily_calories_target: targetCal,
                    daily_macros_target: {
                        protein: dietPlan?.daily_macros_target?.protein || Math.round(targetCal * 0.25 / 4) || 100,
                        carbohydrates: dietPlan?.daily_macros_target?.carbohydrates || Math.round(targetCal * 0.50 / 4) || 250,
                        fats: dietPlan?.daily_macros_target?.fats || Math.round(targetCal * 0.25 / 9) || 60
                    },
                    meals: [],
                    notes: ''
                });
            }
            console.log('useMealPlanner: Initialized with DEFAULT plans');
            setPlans(defaultPlans);
        }
    }, [initialPlans, dietPlan]);

    // === AUTO-SAVE TO LOCAL STORAGE ===
    useEffect(() => {
        if (!dietPlan?.id || plans.length === 0) return;

        const storageKey = `meal_plan_draft_${dietPlan.id}`;
        try {
            localStorage.setItem(storageKey, JSON.stringify(plans));
            // console.log('useMealPlanner: Draft saved to LocalStorage'); // Verbose
        } catch (e) {
            console.error('Error saving draft locally:', e);
        }
    }, [plans, dietPlan]);

    // === DATA LOADING ===
    useEffect(() => {
        if (isOpen && (foods.length === 0 || recipes.length === 0)) {
            const loadData = async () => {
                setIsLoadingData(true);
                setDataError(null);
                try {
                    const [foodList, recipeResponse] = await Promise.allSettled([
                        foodService.getAllFoods(),
                        recipeService.getAllRecipes()
                    ]);

                    if (foodList.status === 'fulfilled') {
                        setFoods(foodList.value);
                    } else {
                        console.error('Error loading foods:', foodList.reason);
                    }

                    if (recipeResponse.status === 'fulfilled') {
                        setRecipes((recipeResponse.value.recipes || []) as unknown as Recipe[]);
                    } else {
                        console.error('Error loading recipes:', recipeResponse.reason);
                        // No bloquear la UI, pero notificar
                        setDataError('Algunas recetas no pudieron cargarse. El planificador funcionará con funciones limitadas.');
                    }
                } catch (error) {
                    console.error('Critical error loading meal planner data:', error);
                    setDataError('Error de conexión al cargar datos.');
                } finally {
                    setIsLoadingData(false);
                }
            };
            loadData();
        }
    }, [isOpen]);

    // === SELECTORS ===
    const currentPlan = useMemo(() => {
        return plans.find(p => p.week_number === selectedWeek) || plans[0];
    }, [plans, selectedWeek]);

    const getDailyTotals = useCallback((day: string) => {
        if (!currentPlan) return { calories: 0, protein: 0, carbs: 0, fats: 0 };

        const dayMeals = currentPlan.meals.filter(meal => meal.day === day);
        return dayMeals.reduce((totals, meal) => ({
            calories: totals.calories + meal.total_calories,
            protein: totals.protein + meal.total_protein,
            carbs: totals.carbs + meal.total_carbs,
            fats: totals.fats + meal.total_fats
        }), { calories: 0, protein: 0, carbs: 0, fats: 0 });
    }, [currentPlan]);

    // === ACTIONS ===

    // Core update function
    // Core update function
    const updateMealInPlan = useCallback((updatedMeal: Meal) => {
        console.log('useMealPlanner: updateMealInPlan called', updatedMeal);
        setPlans(prevPlans => {
            console.log('useMealPlanner: setPlans updater called. PrevPlans length:', prevPlans.length, 'Target Week:', selectedWeek);
            return prevPlans.map(plan => {
                console.log(`Checking plan week ${plan.week_number} against selected ${selectedWeek}`);
                if (plan.week_number === selectedWeek) {
                    const existingMealIndex = plan.meals.findIndex(meal =>
                        meal.day === updatedMeal.day && meal.meal_type === updatedMeal.meal_type
                    );

                    let updatedMeals;
                    if (existingMealIndex >= 0) {
                        updatedMeals = [...plan.meals];
                        updatedMeals[existingMealIndex] = updatedMeal;
                    } else {
                        updatedMeals = [...plan.meals, updatedMeal];
                    }
                    console.log('useMealPlanner: New meals array', updatedMeals);
                    return { ...plan, meals: updatedMeals };
                }
                return plan;
            });
        });
    }, [selectedWeek]);

    const addFoodToMeal = useCallback((meal: Meal, food: Food, quantity: number) => {
        const factor = quantity / 100;
        const newFood: MealFood = {
            food_id: food.id,
            food_name: food.name,
            quantity_grams: quantity,
            calories: food.calories * factor,
            protein: food.protein * factor,
            carbs: food.carbohydrates * factor,
            fats: food.fats * factor
        };

        const updatedMeal = {
            ...meal,
            foods: [...meal.foods, newFood],
            total_calories: meal.total_calories + newFood.calories,
            total_protein: meal.total_protein + newFood.protein,
            total_carbs: meal.total_carbs + newFood.carbs,
            total_fats: meal.total_fats + newFood.fats
        };

        updateMealInPlan(updatedMeal);
    }, [updateMealInPlan]);

    const addRecipeToMeal = useCallback((meal: Meal, recipe: Recipe, servings: number, isModified = false) => {
        const factor = servings / (recipe.servings || 1);

        // Crear instancia única
        const uniqueRecipeId = isModified
            ? `${recipe.id}-modified-${Date.now()}`
            : `${recipe.id}-instance-${Date.now()}`;

        const newRecipe: MealRecipe = {
            recipe_id: uniqueRecipeId,
            recipe_name: isModified ? `${recipe.title} (Modificada)` : recipe.title,
            servings,
            calories: (recipe.total_calories || 0) * factor,
            protein: (recipe.total_protein || 0) * factor,
            carbs: (recipe.total_carbs || 0) * factor,
            fats: (recipe.total_fats || 0) * factor,
            original_recipe_id: recipe.id,
            is_modified: isModified,
            modification_timestamp: new Date().toISOString(),
            recipe_data: isModified ? {
                title: recipe.title,
                totalCalories: recipe.total_calories,
                totalMacros: {
                    protein: recipe.total_protein,
                    carbohydrates: recipe.total_carbs,
                    fats: recipe.total_fats
                },
                servings: recipe.servings,
                ingredients: recipe.ingredients || []
            } : undefined
        };

        const updatedMeal = {
            ...meal,
            recipes: [...meal.recipes, newRecipe],
            total_calories: meal.total_calories + newRecipe.calories,
            total_protein: meal.total_protein + newRecipe.protein,
            total_carbs: meal.total_carbs + newRecipe.carbs,
            total_fats: meal.total_fats + newRecipe.fats
        };

        updateMealInPlan(updatedMeal);
    }, [updateMealInPlan]);

    const removeFoodFromMeal = useCallback((meal: Meal, index: number) => {
        const foodToRemove = meal.foods[index];
        const updatedMeal = {
            ...meal,
            foods: meal.foods.filter((_, i) => i !== index),
            total_calories: meal.total_calories - foodToRemove.calories,
            total_protein: meal.total_protein - foodToRemove.protein,
            total_carbs: meal.total_carbs - foodToRemove.carbs,
            total_fats: meal.total_fats - foodToRemove.fats
        };
        updateMealInPlan(updatedMeal);
    }, [updateMealInPlan]);

    const removeRecipeFromMeal = useCallback((meal: Meal, index: number) => {
        const recipeToRemove = meal.recipes[index];
        const updatedMeal = {
            ...meal,
            recipes: meal.recipes.filter((_, i) => i !== index),
            total_calories: meal.total_calories - recipeToRemove.calories,
            total_protein: meal.total_protein - recipeToRemove.protein,
            total_carbs: meal.total_carbs - recipeToRemove.carbs,
            total_fats: meal.total_fats - recipeToRemove.fats
        };
        updateMealInPlan(updatedMeal);
    }, [updateMealInPlan]);

    const handleSave = useCallback(() => {
        console.log('💾 useMealPlanner: handleSave triggered');
        console.log('📊 Current Plans State:', plans);

        // Log naming convention check
        if (plans.length > 0) {
            console.log('🔎 Sample Plan Structure (Week 1):', {
                week_number: plans[0].week_number,
                daily_calories_target: plans[0].daily_calories_target,
                meals_count: plans[0].meals?.length,
                first_meal: plans[0].meals?.[0]
            });
        }

        onSave(plans);
    }, [plans, onSave]);

    return {
        plans,
        setPlans,
        selectedWeek,
        setSelectedWeek,
        currentPlan,
        foods,
        recipes,
        isLoadingData,
        dataError,
        getDailyTotals,
        updateMealInPlan,
        addFoodToMeal,
        addRecipeToMeal,
        removeFoodFromMeal,
        removeRecipeFromMeal,
        handleSave
    };
};
