import React from 'react';
import {
    Plus,
    MoreVertical,
    Clock
} from 'lucide-react';
import { Dropdown } from 'react-bootstrap';
import type { Meal, MealFood, MealRecipe } from '../../hooks/useMealPlanner';

interface WeeklyMealGridProps {
    currentPlan: any;
    selectedWeek: number;
    daysOfWeek: string[];
    mealTypes: any[];
    onEditMeal: (meal: Meal) => void;
    onAddMeal: (day: string, mealType: string) => void;
}

const WeeklyMealGrid: React.FC<WeeklyMealGridProps> = ({
    currentPlan,
    selectedWeek,
    daysOfWeek,
    mealTypes,
    onEditMeal,
    onAddMeal
}) => {
    // Debug logging
    console.log('WeeklyMealGrid Render:', { week: selectedWeek, mealsCount: currentPlan?.meals?.length, types: mealTypes.length });

    const getMeal = (day: string, typeKey: string) => {
        if (!currentPlan || !currentPlan.meals) return undefined;
        // Strict matching for debugging
        const found = currentPlan.meals.find((m: Meal) => m.day === day && m.meal_type === typeKey);
        // console.log(`GetMeal [${day} - ${typeKey}]:`, found ? 'Found' : 'Empty');
        return found;
    };

    return (
        <div className="table-responsive rounded-4 shadow-sm border bg-white">
            <table className="table table-borderless mb-0 align-middle">
                <thead className="bg-light border-bottom">
                    <tr>
                        <th className="py-3 ps-3 text-uppercase text-secondary small fw-bold" style={{ minWidth: '120px' }}>Comida</th>
                        {daysOfWeek.map(day => (
                            <th key={day} className="py-3 text-center text-uppercase text-secondary small fw-bold" style={{ minWidth: '140px' }}>
                                <div className="d-flex flex-column align-items-center">
                                    <span>{day}</span>
                                </div>
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {mealTypes.map((type) => (
                        <tr key={type.key} className="border-bottom-custom">
                            <td className="ps-3 py-2">
                                <div className="d-flex align-items-center py-1">
                                    <span className="fs-5 me-2">{type.icon}</span>
                                    <div>
                                        <div className="fw-bold text-dark small">{type.label}</div>
                                        <div className="text-muted small d-flex align-items-center" style={{ fontSize: '0.75rem' }}>
                                            <Clock size={10} className="me-1" />
                                            {type.time}
                                        </div>
                                    </div>
                                </div>
                            </td>
                            {daysOfWeek.map(day => {
                                const meal = getMeal(day, type.key);
                                const isEmpty = !meal || (meal.foods.length === 0 && meal.recipes.length === 0);

                                return (
                                    <td key={`${day}-${type.key}`} className="p-1 meal-cell">
                                        <div
                                            className={`meal-card rounded-3 p-2 transition-all h-100 position-relative group-hover
                                                ${isEmpty ? 'bg-light bg-opacity-50 border border-dashed border-2 cursor-pointer hover-bg-light-dark' : 'bg-white shadow-sm border border-transparent hover-shadow-md cursor-pointer'}
                                            `}
                                            onClick={() => isEmpty ? onAddMeal(day, type.key) : onEditMeal(meal)}
                                            style={{ minHeight: '70px' }}
                                        >
                                            {isEmpty ? (
                                                <div className="d-flex flex-column align-items-center justify-content-center h-100 text-muted opacity-50">
                                                    <Plus size={24} className="mb-1" />
                                                </div>
                                            ) : (
                                                <>
                                                    <div className="d-flex justify-content-between align-items-start mb-2">
                                                        <span className="badge bg-primary bg-opacity-10 text-primary rounded-pill small">
                                                            {Math.round(meal.total_calories)} kcal
                                                        </span>
                                                        <div className="text-end lh-1">
                                                            <div className="small fw-bold text-dark">{Math.round(meal.total_protein)}p</div>
                                                        </div>
                                                    </div>

                                                    <div className="meal-content">
                                                        {[...meal.recipes, ...meal.foods].slice(0, 3).map((item: any, idx) => (
                                                            <div key={idx} className="small text-truncate text-secondary mb-1 d-flex align-items-center">
                                                                <span className="bullet bg-secondary rounded-circle me-1" style={{ width: 4, height: 4 }}></span>
                                                                {item.recipe_name || item.food_name}
                                                            </div>
                                                        ))}
                                                        {([...meal.recipes, ...meal.foods].length > 3) && (
                                                            <div className="small text-muted fst-italic ps-1">
                                                                + {([...meal.recipes, ...meal.foods].length - 3)} más
                                                            </div>
                                                        )}
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    </td>
                                );
                            })}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default WeeklyMealGrid;
