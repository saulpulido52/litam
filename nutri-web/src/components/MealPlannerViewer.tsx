import React, { useState, useEffect } from 'react';
import type { DietPlan } from '../types/diet';
import dietPlansService from '../services/dietPlansService';

interface MealPlannerViewerProps {
  dietPlanId?: string;
  onClose?: () => void;
}

// Permitir meal_time: string | undefined para compatibilidad
interface Meal {
  id?: string;
  day: string;
  meal_type: string;
  meal_time?: string;
  meal_description: string;
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

const MealPlannerViewer: React.FC<MealPlannerViewerProps> = ({ dietPlanId, onClose }) => {
  const [dietPlan, setDietPlan] = useState<DietPlan | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedWeek, setSelectedWeek] = useState<number>(1);

  useEffect(() => {
    if (dietPlanId) {
      loadDietPlan();
    }
    // eslint-disable-next-line
  }, [dietPlanId]);

  const loadDietPlan = async () => {
    if (!dietPlanId) return;

    setLoading(true);
    setError(null);

    try {
      const plan = await dietPlansService.getDietPlanById(dietPlanId);
      setDietPlan(plan);
      // Seleccionar la primera semana por defecto
      if (plan.weekly_plans && plan.weekly_plans.length > 0) {
        setSelectedWeek(plan.weekly_plans[0].week_number);
      }
    } catch (err) {
      setError('Error al cargar el plan de dieta');
      console.error('Error loading diet plan:', err);
    } finally {
      setLoading(false);
    }
  };

  // Adaptar el tipado para aceptar meals con meal_time opcional
  const getSelectedWeekPlan = (): WeeklyPlan | null => {
    if (!dietPlan?.weekly_plans) return null;
    const week = dietPlan.weekly_plans.find(week => week.week_number === selectedWeek);
    if (!week) return null;
    // Adaptar meals si es necesario
    const meals: Meal[] = (week.meals as any[]).map((m) => ({
      ...m,
      meal_time: m.meal_time ?? ''}));
    return { ...week, meals };
  };

  const calculateWeeklyTotals = (meals: Meal[]) => {
    return meals.reduce((totals, meal) => {
      totals.calories += meal.total_calories || 0;
      totals.protein += meal.total_protein || 0;
      totals.carbs += meal.total_carbs || 0;
      totals.fats += meal.total_fats || 0;
      return totals;
    }, { calories: 0, protein: 0, carbs: 0, fats: 0 });
  };

  const formatMealType = (mealType: string) => {
    const types: { [key: string]: string } = {
      breakfast: 'Desayuno',
      morning_snack: 'Refrigerio Mañana',
      lunch: 'Almuerzo',
      afternoon_snack: 'Refrigerio Tarde',
      dinner: 'Cena',
      evening_snack: 'Refrigerio Noche'
    };
    return types[mealType] || mealType;
  };

  const formatDay = (day: string) => {
    const days: { [key: string]: string } = {
      'Lunes': 'Lun',
      'Martes': 'Mar',
      'Miércoles': 'Mié',
      'Jueves': 'Jue',
      'Viernes': 'Vie',
      'Sábado': 'Sáb',
      'Domingo': 'Dom'
    };
    return days[day] || day;
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Cargando plan de comidas...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 max-w-md">
          <div className="text-red-500 text-center">
            <svg className="w-12 h-12 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <h3 className="text-lg font-semibold mb-2">Error</h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={onClose}
              className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!dietPlan) {
    return null;
  }

  const selectedWeekPlan = getSelectedWeekPlan();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold">Planificador de Comidas</h2>
              <p className="text-blue-100">{dietPlan.name}</p>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-blue-200 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {/* Plan Info */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-semibold text-blue-800 mb-2">Información General</h3>
              <p><span className="font-medium">Paciente:</span> {dietPlan.patient?.first_name} {dietPlan.patient?.last_name}</p>
              <p><span className="font-medium">Duración:</span> {dietPlan.start_date} - {dietPlan.end_date}</p>
              <p><span className="font-medium">Semanas:</span> {dietPlan.total_weeks}</p>
            </div>
            
            <div className="bg-green-50 p-4 rounded-lg">
              <h3 className="font-semibold text-green-800 mb-2">Objetivos Diarios</h3>
              <p><span className="font-medium">Calorías:</span> {dietPlan.target_calories} kcal</p>
              <p><span className="font-medium">Proteínas:</span> {dietPlan.target_protein}g</p>
              <p><span className="font-medium">Carbohidratos:</span> {dietPlan.target_carbs}g</p>
              <p><span className="font-medium">Grasas:</span> {dietPlan.target_fats}g</p>
            </div>

            <div className="bg-purple-50 p-4 rounded-lg">
              <h3 className="font-semibold text-purple-800 mb-2">Estado</h3>
              <p><span className="font-medium">Status:</span> 
                <span className={`ml-2 px-2 py-1 rounded text-xs ${
                  dietPlan.status === 'active' ? 'bg-green-100 text-green-800' :
                  dietPlan.status === 'draft' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {dietPlan.status === 'active' ? 'Activo' :
                   dietPlan.status === 'draft' ? 'Borrador' :
                   dietPlan.status === 'completed' ? 'Completado' : 'Cancelado'}
                </span>
              </p>
              {dietPlan.notes && (
                <p className="mt-2"><span className="font-medium">Notas:</span> {dietPlan.notes}</p>
              )}
            </div>
          </div>

          {/* Week Selector */}
          {dietPlan.weekly_plans && dietPlan.weekly_plans.length > 1 && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-3">Seleccionar Semana</h3>
              <div className="flex flex-wrap gap-2">
                {dietPlan.weekly_plans.map((week) => (
                  <button
                    key={week.week_number}
                    onClick={() => setSelectedWeek(week.week_number)}
                    className={`px-4 py-2 rounded-lg border transition-colors ${
                      selectedWeek === week.week_number
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    Semana {week.week_number}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Weekly Plan */}
          {selectedWeekPlan && (
            <div className="space-y-6">
              {/* Week Header */}
              <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white p-4 rounded-lg">
                <h3 className="text-xl font-bold">Semana {selectedWeekPlan.week_number}</h3>
                <p className="text-orange-100">
                  {selectedWeekPlan.start_date} - {selectedWeekPlan.end_date}
                </p>
                {selectedWeekPlan.notes && (
                  <p className="text-orange-100 mt-2">{selectedWeekPlan.notes}</p>
                )}
              </div>

              {/* Meals Table */}
              {selectedWeekPlan.meals && selectedWeekPlan.meals.length > 0 ? (
                <div className="bg-white border rounded-lg overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Día
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Comida
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Hora
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Descripción
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Calorías
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Proteínas
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Carbohidratos
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Grasas
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {selectedWeekPlan.meals.map((meal, index) => (
                          <tr key={meal.id || index} className="hover:bg-gray-50">
                            <td className="px-4 py-3 whitespace-nowrap">
                              <span className="text-sm font-medium text-gray-900">
                                {formatDay(meal.day)}
                              </span>
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap">
                              <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                                {formatMealType(meal.meal_type)}
                              </span>
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                              {meal.meal_time}
                            </td>
                            <td className="px-4 py-3">
                              <div className="text-sm text-gray-900">
                                {meal.meal_description}
                                {meal.notes && (
                                  <p className="text-xs text-gray-500 mt-1">{meal.notes}</p>
                                )}
                              </div>
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                              <span className="font-medium">{meal.total_calories}</span> kcal
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                              <span className="font-medium">{meal.total_protein}</span>g
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                              <span className="font-medium">{meal.total_carbs}</span>g
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                              <span className="font-medium">{meal.total_fats}</span>g
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 bg-gray-50 rounded-lg">
                  <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <p className="text-gray-500">No hay comidas planificadas para esta semana</p>
                </div>
              )}

              {/* Weekly Totals */}
              {selectedWeekPlan.meals && selectedWeekPlan.meals.length > 0 && (
                <div className="bg-gradient-to-r from-green-500 to-teal-500 text-white p-4 rounded-lg">
                  <h4 className="text-lg font-semibold mb-3">Totales de la Semana {selectedWeekPlan.week_number}</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {(() => {
                      const totals = calculateWeeklyTotals(selectedWeekPlan.meals);
                      return (
                        <>
                          <div className="text-center">
                            <p className="text-2xl font-bold">{totals.calories}</p>
                            <p className="text-green-100">Calorías</p>
                          </div>
                          <div className="text-center">
                            <p className="text-2xl font-bold">{totals.protein}g</p>
                            <p className="text-green-100">Proteínas</p>
                          </div>
                          <div className="text-center">
                            <p className="text-2xl font-bold">{totals.carbs}g</p>
                            <p className="text-green-100">Carbohidratos</p>
                          </div>
                          <div className="text-center">
                            <p className="text-2xl font-bold">{totals.fats}g</p>
                            <p className="text-green-100">Grasas</p>
                          </div>
                        </>
                      );
                    })()}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* No Weekly Plans */}
          {(!dietPlan.weekly_plans || dietPlan.weekly_plans.length === 0) && (
            <div className="text-center py-8 bg-gray-50 rounded-lg">
              <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <p className="text-gray-500">No hay planes semanales configurados</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MealPlannerViewer; 