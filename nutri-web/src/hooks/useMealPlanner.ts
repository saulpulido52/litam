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
            console.log('useMealPlanner: Using LOCAL DRAFT instead of DB/Default', localDraft);
            setPlans(localDraft);
            return;
        }

        if (initialPlans && initialPlans.length > 0) {
            // Normalize plans to ensure week_number exists
            const normalized = initialPlans.map((p, index) => ({
                ...p,
                week_number: p.week_number || (index + 1),
                meals: p.meals || []
            }));
            console.log('useMealPlanner: Initialized with DB plans:', normalized);
            setPlans(normalized);
        } else {
            // Generar planes por defecto
            const defaultPlans: WeeklyPlan[] = [];
            for (let week = 1; week <= 4; week++) {
                const startDate = new Date();
                startDate.setDate(startDate.getDate() + (week - 1) * 7);
                const endDate = new Date(startDate);
                endDate.setDate(endDate.getDate() + 6);

                defaultPlans.push({
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
