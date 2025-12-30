import React, { useState } from 'react';
import { Modal, Button, Spinner } from 'react-bootstrap'; // Added Spinner
import { Search, Plus, Trash2, ChevronRight } from 'lucide-react';
import type { Meal, Food, MealFood, MealRecipe } from '../hooks/useMealPlanner';
import type { Recipe } from '../services/recipeService';
import { foodService } from '../services/foodService'; // Import Service

interface MealEditorModalProps {
    show: boolean;
    onHide: () => void;
    meal: Meal;
    foods: Food[];
    recipes: Recipe[];
    onSave: (updatedMeal: Meal) => void;
}

export default function MealEditorModal({ show, onHide, meal, foods, recipes, onSave }: MealEditorModalProps) {
    const [searchTerm, setSearchTerm] = useState('');
    const [activeTab, setActiveTab] = useState<'foods' | 'recipes'>('foods');
    const [editingMeal, setMeal] = useState<Meal>(meal);

    // Search State
    const [externalFoods, setExternalFoods] = useState<Food[]>([]);
    const [isSearching, setIsSearching] = useState(false);

    // Filter logic: Local + External
    const displayFoods = searchTerm
        ? [...externalFoods, ...foods.filter(f => f.name.toLowerCase().includes(searchTerm.toLowerCase()))]
            // Deduplicate by ID just in case
            .filter((v, i, a) => a.findIndex(t => t.id === v.id) === i)
        : foods;

    const filteredRecipes = recipes.filter(r =>
        r.title.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // External Search Handler
    const handleSearch = async () => {
        if (!searchTerm.trim()) return;

        setIsSearching(true);
        try {
            console.log('🔍 Executing search in Modal:', searchTerm);
            const results = await foodService.searchFoods(searchTerm);
            setExternalFoods(results);
        } catch (error) {
            console.error('Search failed:', error);
        } finally {
            setIsSearching(false);
        }
    };

    // Helpers
    const recalculateTotals = (foods: MealFood[], recipes: MealRecipe[]) => {
        let calories = 0, protein = 0, carbs = 0, fats = 0;

        foods.forEach(f => {
            calories += Number(f.calories) || 0;
            protein += Number(f.protein) || 0;
            carbs += Number(f.carbs) || 0;
            fats += Number(f.fats) || 0;
        });

        recipes.forEach(r => {
            calories += Number(r.calories) || 0;
            protein += Number(r.protein) || 0;
            carbs += Number(r.carbs) || 0;
            fats += Number(r.fats) || 0;
        });

        return {
            total_calories: Math.max(0, calories),
            total_protein: Math.max(0, protein),
            total_carbs: Math.max(0, carbs),
            total_fats: Math.max(0, fats)
        };
    };

    const handleAddFood = (food: Food) => {
        const defaultQty = 100; // grams

        const newFood: MealFood = {
            // Ensure ID is robust
            food_id: food.id || `temp-${Date.now()}`,
            food_name: food.name,
            quantity_grams: defaultQty,
            calories: Number(food.calories) || 0,
            protein: Number(food.protein) || 0,
            carbs: Number(food.carbohydrates) || 0,
            fats: Number(food.fats) || 0
        };

        const newFoods = [...editingMeal.foods, newFood];
        const newRecipes = [...editingMeal.recipes];
        const totals = recalculateTotals(newFoods, newRecipes);

        setMeal({
            ...editingMeal,
            foods: newFoods,
            recipes: newRecipes,
            ...totals
        });
    };

    const handleAddRecipe = (recipe: Recipe) => {
        const servings = 1;
        const factor = servings / (recipe.servings || 1);
        const uniqueRecipeId = `${recipe.id}-${Date.now()}`;

        const newRecipe: MealRecipe = {
            recipe_id: uniqueRecipeId,
            recipe_name: recipe.title,
            servings: servings,
            calories: (Number(recipe.total_calories) || 0) * factor,
            protein: (Number(recipe.total_protein) || 0) * factor,
            carbs: (Number(recipe.total_carbs) || 0) * factor,
            fats: (Number(recipe.total_fats) || 0) * factor,
            original_recipe_id: recipe.id,
            is_modified: false
        };

        const newFoods = [...editingMeal.foods];
        const newRecipes = [...editingMeal.recipes, newRecipe];
        const totals = recalculateTotals(newFoods, newRecipes);

        setMeal({
            ...editingMeal,
            foods: newFoods,
            recipes: newRecipes,
            ...totals
        });
    };

    const handleUpdateQuantity = (index: number, newQuantity: number) => {
        if (isNaN(newQuantity) || newQuantity < 0) return;

        // Try to find original in prop foods OR external results
        const originalFood = [...foods, ...externalFoods].find(f => f.id === editingMeal.foods[index].food_id);

        const newFoods = editingMeal.foods.map((item, i) => {
            if (i !== index) return item;

            // Strategy: Try to find original food to recalculate from base 100g
            if (originalFood) {
                const ratio = newQuantity / 100;
                return {
                    ...item,
                    quantity_grams: newQuantity,
                    calories: (Number(originalFood.calories) || 0) * ratio,
                    protein: (Number(originalFood.protein) || 0) * ratio,
                    carbs: (Number(originalFood.carbohydrates) || 0) * ratio,
                    fats: (Number(originalFood.fats) || 0) * ratio
                };
            }

            // Fallback: Ratio based estimation (less accurate if multiple edits)
            const oldQuantity = Number(item.quantity_grams) || 100;
            const safeOldQty = oldQuantity === 0 ? 100 : oldQuantity;
            const ratio = newQuantity / safeOldQty;

            return {
                ...item,
                quantity_grams: newQuantity,
                calories: (Number(item.calories) || 0) * ratio,
                protein: (Number(item.protein) || 0) * ratio,
                carbs: (Number(item.carbs) || 0) * ratio,
                fats: (Number(item.fats) || 0) * ratio
            };
        });

        const newRecipes = [...editingMeal.recipes];
        const totals = recalculateTotals(newFoods, newRecipes);

        setMeal({
            ...editingMeal,
            foods: newFoods,
            recipes: newRecipes,
            ...totals
        });
    };

    const handleRemoveItem = (index: number, type: 'food' | 'recipe') => {
        let newFoods = [...editingMeal.foods];
        let newRecipes = [...editingMeal.recipes];

        if (type === 'food') {
            newFoods = newFoods.filter((_, i) => i !== index);
        } else {
            newRecipes = newRecipes.filter((_, i) => i !== index);
        }

        const totals = recalculateTotals(newFoods, newRecipes);

        setMeal({
            ...editingMeal,
            foods: newFoods,
            recipes: newRecipes,
            ...totals
        });
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
                                placeholder="🔍 Buscar en web (ej. Manzana, Pollo)..."
                                style={{ fontSize: '1.1rem' }}
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && handleSearch()}
                            />
                            <button
                                className="btn btn-primary px-4 fw-bold"
                                onClick={handleSearch}
                                disabled={isSearching}
                            >
                                {isSearching ? <Spinner size="sm" animation="border" /> : 'Buscar'}
                            </button>
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
                                    {displayFoods.length === 0 && !isSearching && (
                                        <div className="text-center py-5 text-muted">
                                            <p>No se encontraron alimentos locales.</p>
                                            <small>Presiona "Buscar" para consultar la base de datos global.</small>
                                        </div>
                                    )}
                                    {displayFoods.map(food => (
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
