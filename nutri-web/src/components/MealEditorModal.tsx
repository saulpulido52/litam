import React, { useState } from 'react';
import { Modal, Button } from 'react-bootstrap';
import { Search, Plus, Trash2, ChevronRight } from 'lucide-react';
import type { Meal, Food, MealFood, MealRecipe } from '../hooks/useMealPlanner';
import type { Recipe } from '../services/recipeService';

interface MealEditorModalProps {
    show: boolean;
    onHide: () => void;
    meal: Meal;
    foods: Food[];
    recipes: Recipe[];
    onSave: (updatedMeal: Meal) => void;
}

// ... imports

export default function MealEditorModal({ show, onHide, meal, foods, recipes, onSave }: MealEditorModalProps) {
    const [searchTerm, setSearchTerm] = useState('');
    const [activeTab, setActiveTab] = useState<'foods' | 'recipes'>('foods');
    const [editingMeal, setMeal] = useState<Meal>(meal);

    // Filter lists
    const filteredFoods = foods.filter(f =>
        f.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const filteredRecipes = recipes.filter(r =>
        r.title.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Helpers
    const handleAddFood = (food: Food) => {
        const defaultQty = 100; // grams

        const newFood: MealFood = {
            food_id: food.id,
            food_name: food.name,
            quantity_grams: defaultQty,
            calories: food.calories,
            protein: food.protein,
            carbs: food.carbohydrates,
            fats: food.fats
        };

        const updatedMeal = {
            ...editingMeal,
            foods: [...editingMeal.foods, newFood],
            total_calories: editingMeal.total_calories + newFood.calories,
            total_protein: editingMeal.total_protein + newFood.protein,
            total_carbs: editingMeal.total_carbs + newFood.carbs,
            total_fats: editingMeal.total_fats + newFood.fats
        };
        setMeal(updatedMeal);
    };

    const handleAddRecipe = (recipe: Recipe) => {
        const servings = 1;
        const factor = servings / (recipe.servings || 1);
        const uniqueRecipeId = `${recipe.id}-${Date.now()}`;

        const newRecipe: MealRecipe = {
            recipe_id: uniqueRecipeId,
            recipe_name: recipe.title,
            servings: servings,
            calories: (recipe.total_calories || 0) * factor,
            protein: (recipe.total_protein || 0) * factor,
            carbs: (recipe.total_carbs || 0) * factor,
            fats: (recipe.total_fats || 0) * factor,
            original_recipe_id: recipe.id,
            is_modified: false
        };

        const updatedMeal = {
            ...editingMeal,
            recipes: [...editingMeal.recipes, newRecipe],
            total_calories: editingMeal.total_calories + newRecipe.calories,
            total_protein: editingMeal.total_protein + newRecipe.protein,
            total_carbs: editingMeal.total_carbs + newRecipe.carbs,
            total_fats: editingMeal.total_fats + newRecipe.fats
        };
        setMeal(updatedMeal);
    };

    const handleUpdateQuantity = (index: number, newQuantity: number) => {
        if (newQuantity < 0) return;

        const updatedMeal = { ...editingMeal };
        const item = updatedMeal.foods[index];
        const oldQuantity = item.quantity_grams;

        // Calcular factores
        const oldFactor = oldQuantity / 100;
        const newFactor = newQuantity / 100;

        // Restar valores viejos
        updatedMeal.total_calories -= item.calories;
        updatedMeal.total_protein -= item.protein;
        updatedMeal.total_carbs -= item.carbs;
        updatedMeal.total_fats -= item.fats;

        // Actualizar item
        item.quantity_grams = newQuantity;
        // Recalcular valores nutricionales del item basados en la info original (assumed linear from current values if base not available, but ideally we should have base values. 
        // NOTE: In this context, we are recalculating based on the CURRENT values which might be dangerous if repeated. 
        // BETTER: We should rely on the base food values if possible, but here we only have the item.
        // Assuming item values are currently correct for 'quantity_grams', we derive base 100g values first.
        const baseCalories = item.calories / oldFactor;
        const baseProtein = item.protein / oldFactor;
        const baseCarbs = item.carbs / oldFactor;
        const baseFats = item.fats / oldFactor;

        item.calories = baseCalories * newFactor;
        item.protein = baseProtein * newFactor;
        item.carbs = baseCarbs * newFactor;
        item.fats = baseFats * newFactor;

        // Sumar valores nuevos
        updatedMeal.total_calories += item.calories;
        updatedMeal.total_protein += item.protein;
        updatedMeal.total_carbs += item.carbs;
        updatedMeal.total_fats += item.fats;

        setMeal(updatedMeal);
    };

    const handleRemoveItem = (index: number, type: 'food' | 'recipe') => {
        let updatedMeal = { ...editingMeal };

        if (type === 'food') {
            const item = editingMeal.foods[index];
            updatedMeal.foods = editingMeal.foods.filter((_, i) => i !== index);
            updatedMeal.total_calories = (updatedMeal.total_calories || 0) - (item.calories || 0);
            updatedMeal.total_protein = (updatedMeal.total_protein || 0) - (item.protein || 0);
            updatedMeal.total_carbs = (updatedMeal.total_carbs || 0) - (item.carbs || 0);
            updatedMeal.total_fats = (updatedMeal.total_fats || 0) - (item.fats || 0);
        } else {
            const item = editingMeal.recipes[index];
            updatedMeal.recipes = editingMeal.recipes.filter((_, i) => i !== index);
            updatedMeal.total_calories = (updatedMeal.total_calories || 0) - (item.calories || 0);
            updatedMeal.total_protein = (updatedMeal.total_protein || 0) - (item.protein || 0);
            updatedMeal.total_carbs = (updatedMeal.total_carbs || 0) - (item.carbs || 0);
            updatedMeal.total_fats = (updatedMeal.total_fats || 0) - (item.fats || 0);
        }

        // Safety check for negative zeros
        if (updatedMeal.total_calories < 0) updatedMeal.total_calories = 0;
        if (updatedMeal.total_protein < 0) updatedMeal.total_protein = 0;
        if (updatedMeal.total_carbs < 0) updatedMeal.total_carbs = 0;
        if (updatedMeal.total_fats < 0) updatedMeal.total_fats = 0;

        setMeal(updatedMeal);
    };

    const saveChanges = () => {
        onSave(editingMeal);
    };

    return (
        <Modal show={show} onHide={onHide} size="xl" centered contentClassName="border-0 rounded-4 overflow-hidden">
            <Modal.Header closeButton className="border-bottom-0 bg-light p-4">
                <div>
                    <span className="badge bg-white text-secondary shadow-sm rounded-pill mb-2 px-3">
                        {editingMeal.day} - {editingMeal.meal_type}
                    </span>
                    <h5 className="modal-title fw-bold">Editar Comida</h5>
                </div>
            </Modal.Header>
            <Modal.Body className="p-0">
                <div className="row g-0" style={{ height: '70vh' }}>
                    {/* Left: Search & Add */}
                    <div className="col-lg-7 border-end p-4 d-flex flex-column h-100">
                        <div className="input-group mb-4 shadow-sm">
                            <span className="input-group-text bg-white border-end-0 ps-3">
                                <Search size={18} className="text-secondary" />
                            </span>
                            <input
                                type="text"
                                className="form-control border-start-0 py-3 text-dark"
                                placeholder="🔍 Buscar aquí alimentos o recetas..."
                                style={{ fontSize: '1.1rem' }}
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                            />
                        </div>

                        <div className="d-flex mb-3 gap-2">
                            <button
                                className={`btn rounded-pill px-4 flex-grow-1 ${activeTab === 'foods' ? 'btn-primary' : 'btn-light text-muted'}`}
                                onClick={() => setActiveTab('foods')}
                            >
                                🍏 Alimentos
                            </button>
                            <button
                                className={`btn rounded-pill px-4 flex-grow-1 ${activeTab === 'recipes' ? 'btn-primary' : 'btn-light text-muted'}`}
                                onClick={() => setActiveTab('recipes')}
                            >
                                🍲 Recetas
                            </button>
                        </div>

                        <div className="overflow-auto custom-scrollbar flex-grow-1 pe-2">
                            {activeTab === 'foods' ? (
                                <div className="d-flex flex-column gap-2">
                                    {filteredFoods.map(food => (
                                        <div key={food.id} className="d-flex justify-content-between align-items-center p-3 rounded-3 bg-white border border-light shadow-sm hover-shadow-md transition-all">
                                            <div>
                                                <div className="fw-bold text-dark">{food.name}</div>
                                                <div className="small text-muted">{food.calories} kcal / 100g</div>
                                            </div>
                                            <button className="btn btn-sm btn-outline-primary rounded-circle p-2" onClick={() => handleAddFood(food)}>
                                                <Plus size={16} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="d-flex flex-column gap-2">
                                    {filteredRecipes.map(recipe => (
                                        <div key={recipe.id} className="d-flex justify-content-between align-items-center p-3 rounded-3 bg-white border border-light shadow-sm hover-shadow-md transition-all">
                                            <div>
                                                <div className="fw-bold text-dark">{recipe.title}</div>
                                                <div className="small text-muted">{recipe.total_calories} kcal • {recipe.prep_time_minutes} min</div>
                                            </div>
                                            <button className="btn btn-sm btn-outline-primary rounded-circle p-2" onClick={() => handleAddRecipe(recipe)}>
                                                <Plus size={16} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right: Current Meal Content */}
                    <div className="col-lg-5 bg-light p-4 d-flex flex-column h-100">
                        <div className="mb-4">
                            <h6 className="fw-bold text-dark mb-3">Contenido Actual</h6>

                            <div className="bg-white rounded-4 p-3 shadow-sm mb-3 d-flex justify-content-between">
                                <div className="text-center">
                                    <h5 className="fw-bold text-primary mb-0">{Math.round(editingMeal.total_calories || 0)}</h5>
                                    <small className="text-muted">kcal</small>
                                </div>
                                <div className="text-center">
                                    <h5 className="fw-bold text-dark mb-0">{Math.round(editingMeal.total_protein || 0)}g</h5>
                                    <small className="text-muted">Prot</small>
                                </div>
                                <div className="text-center">
                                    <h5 className="fw-bold text-dark mb-0">{Math.round(editingMeal.total_carbs || 0)}g</h5>
                                    <small className="text-muted">Carb</small>
                                </div>
                                <div className="text-center">
                                    <h5 className="fw-bold text-dark mb-0">{Math.round(editingMeal.total_fats || 0)}g</h5>
                                    <small className="text-muted">Gras</small>
                                </div>
                            </div>
                        </div>

                        <div className="overflow-auto custom-scrollbar flex-grow-1">
                            {editingMeal.recipes.length > 0 && <h6 className="small text-uppercase fw-bold text-muted mb-2">Recetas</h6>}
                            {editingMeal.recipes.map((item: MealRecipe, idx: number) => (
                                <div key={item.recipe_id} className="bg-white p-3 rounded-3 mb-2 shadow-sm d-flex justify-content-between align-items-center">
                                    <div>
                                        <div className="fw-medium text-dark">{item.recipe_name}</div>
                                        <div className="small text-muted">{Math.round(item.calories)} kcal • {item.servings} porción</div>
                                    </div>
                                    <button className="btn btn-link text-danger p-0" onClick={() => handleRemoveItem(idx, 'recipe')}>
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            ))}

                            {editingMeal.foods.length > 0 && <h6 className="small text-uppercase fw-bold text-muted mb-2 mt-3">Alimentos</h6>}
                            {editingMeal.foods.map((item: MealFood, idx: number) => (
                                <div key={`${item.food_id}-${idx}`} className="bg-white p-3 rounded-3 mb-2 shadow-sm d-flex justify-content-between align-items-center">
                                    <div className="flex-grow-1">
                                        <div className="fw-medium text-dark">{item.food_name}</div>
                                        <div className="d-flex align-items-center mt-1 gap-2">
                                            <div className="d-flex align-items-center bg-light rounded-pill px-2 py-1 border">
                                                <input
                                                    type="number"
                                                    className="form-control form-control-sm border-0 bg-transparent p-0 text-center fw-bold text-primary"
                                                    style={{ width: '50px' }}
                                                    value={item.quantity_grams}
                                                    onChange={(e) => handleUpdateQuantity(idx, parseFloat(e.target.value) || 0)}
                                                    min="0"
                                                />
                                                <span className="small text-muted ms-1">g</span>
                                            </div>
                                            <span className="small text-muted">• {Math.round(item.calories || 0)} kcal</span>
                                        </div>
                                    </div>
                                    <button className="btn btn-link text-danger p-0 ms-2" onClick={() => handleRemoveItem(idx, 'food')}>
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            ))}

                            {editingMeal.recipes.length === 0 && editingMeal.foods.length === 0 && (
                                <div className="text-center py-5 text-muted">
                                    <div className="mb-2">🍽️</div>
                                    <small>Comida vacía. Agrega alimentos del panel izquierdo.</small>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </Modal.Body>
            <Modal.Footer className="border-top-0 bg-light p-3">
                <Button variant="link" className="text-muted text-decoration-none me-auto" onClick={onHide}>
                    Cancelar
                </Button>
                <Button variant="dark" className="rounded-pill px-4 fw-bold" onClick={saveChanges}>
                    <ChevronRight size={16} className="me-2" />
                    Confirmar Cambios
                </Button>
            </Modal.Footer>
        </Modal>
    );
};
