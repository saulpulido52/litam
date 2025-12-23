import { useState, useEffect } from 'react';

interface NutritionalScheduleTabProps {
  dietPlan: any;
  onPlanDataChange: (data: any) => void;
}

export default function NutritionalScheduleTab({
  dietPlan,
  onPlanDataChange
}: NutritionalScheduleTabProps) {
  // Estado inicial con horarios por defecto
  const defaultSchedule = {
    wakeUpTime: '07:00',
    bedTime: '22:00',
    mealsSchedule: [
      {
      mealType: 'breakfast',
      mealName: 'Desayuno',
        scheduledTime: '07:00',
        duration: 30,
        isFlexible: false,
        icon: '🌅',
        notes: '',
        calories: 666
      },
      {
        mealType: 'morning_snack',
        mealName: 'Media Mañana',
        scheduledTime: '10:00',
        duration: 15,
        isFlexible: true,
        icon: '🍎',
        notes: '',
        calories: 266
      },
      {
        mealType: 'lunch',
        mealName: 'Almuerzo',
        scheduledTime: '13:00',
        duration: 45,
        isFlexible: false,
        icon: '🥗',
        notes: '',
        calories: 932
      },
      {
        mealType: 'afternoon_snack',
        mealName: 'Merienda',
        scheduledTime: '16:00',
        duration: 15,
        isFlexible: true,
        icon: '🥨',
        notes: '',
        calories: 266
      },
      {
        mealType: 'dinner',
        mealName: 'Cena',
        scheduledTime: '19:00',
      duration: 30,
      isFlexible: false,
        icon: '🍽️',
        notes: '',
        calories: 533
      }
    ],
    exerciseTime: '',
    exerciseDuration: 0,
    supplementTimes: [],
    waterReminders: ['08:00', '12:00', '16:00', '20:00']
  };

  const [schedule, setSchedule] = useState(defaultSchedule);
  const [showTimeAnalysis, setShowTimeAnalysis] = useState(false);

  // Cargar horarios existentes cuando el componente se monta o cambia el plan
  useEffect(() => {
    if (dietPlan && dietPlan.mealSchedules) {
      // Si ya existe el formato nuevo, usarlo directamente
      console.log('Cargando mealSchedules existentes:', dietPlan.mealSchedules);
    setSchedule(dietPlan.mealSchedules);
    } else if (dietPlan && dietPlan.meal_timing) {
      // Convertir formato antiguo a nuevo formato
      console.log('Convirtiendo formato antiguo meal_timing:', dietPlan.meal_timing);
      const convertedSchedule = {
        ...defaultSchedule,
        wakeUpTime: dietPlan.meal_timing.wakeUpTime || defaultSchedule.wakeUpTime,
        bedTime: dietPlan.meal_timing.bedTime || defaultSchedule.bedTime,
        exerciseTime: dietPlan.meal_timing.exerciseTime || defaultSchedule.exerciseTime,
        exerciseDuration: dietPlan.meal_timing.exerciseDuration || defaultSchedule.exerciseDuration,
        waterReminders: dietPlan.meal_timing.waterReminders || defaultSchedule.waterReminders,
        mealsSchedule: defaultSchedule.mealsSchedule.map(meal => ({
          ...meal,
          scheduledTime: dietPlan.meal_timing[meal.mealType] || meal.scheduledTime,
          duration: dietPlan.meal_timing[`${meal.mealType}_duration`] || meal.duration,
          calories: dietPlan.meal_timing[`${meal.mealType}_calories`] || meal.calories,
          isFlexible: dietPlan.meal_timing[`${meal.mealType}_flexible`] !== undefined 
            ? dietPlan.meal_timing[`${meal.mealType}_flexible`] 
            : meal.isFlexible,
          notes: dietPlan.meal_timing[`${meal.mealType}_notes`] || meal.notes
        }))
      };
      console.log('Horarios convertidos:', convertedSchedule);
      setSchedule(convertedSchedule);
    } else {
      // Si no hay datos existentes, usar el estado por defecto
      console.log('Usando horarios por defecto');
      setSchedule(defaultSchedule);
    }
  }, [dietPlan]);

  // Función para guardar cambios en el plan de dieta
  const saveScheduleToPlan = (updatedSchedule: any) => {
    // Crear el formato antiguo con todos los campos individuales
    const oldFormat = {
      wakeUpTime: updatedSchedule.wakeUpTime,
      bedTime: updatedSchedule.bedTime,
      exerciseTime: updatedSchedule.exerciseTime,
      exerciseDuration: updatedSchedule.exerciseDuration,
      waterReminders: updatedSchedule.waterReminders,
      // Campos individuales para cada comida
      breakfast: updatedSchedule.mealsSchedule.find((m: any) => m.mealType === 'breakfast')?.scheduledTime,
      breakfast_duration: updatedSchedule.mealsSchedule.find((m: any) => m.mealType === 'breakfast')?.duration,
      breakfast_calories: updatedSchedule.mealsSchedule.find((m: any) => m.mealType === 'breakfast')?.calories,
      breakfast_flexible: updatedSchedule.mealsSchedule.find((m: any) => m.mealType === 'breakfast')?.isFlexible,
      breakfast_notes: updatedSchedule.mealsSchedule.find((m: any) => m.mealType === 'breakfast')?.notes,
      
      morning_snack: updatedSchedule.mealsSchedule.find((m: any) => m.mealType === 'morning_snack')?.scheduledTime,
      morning_snack_duration: updatedSchedule.mealsSchedule.find((m: any) => m.mealType === 'morning_snack')?.duration,
      morning_snack_calories: updatedSchedule.mealsSchedule.find((m: any) => m.mealType === 'morning_snack')?.calories,
      morning_snack_flexible: updatedSchedule.mealsSchedule.find((m: any) => m.mealType === 'morning_snack')?.isFlexible,
      morning_snack_notes: updatedSchedule.mealsSchedule.find((m: any) => m.mealType === 'morning_snack')?.notes,
      
      lunch: updatedSchedule.mealsSchedule.find((m: any) => m.mealType === 'lunch')?.scheduledTime,
      lunch_duration: updatedSchedule.mealsSchedule.find((m: any) => m.mealType === 'lunch')?.duration,
      lunch_calories: updatedSchedule.mealsSchedule.find((m: any) => m.mealType === 'lunch')?.calories,
      lunch_flexible: updatedSchedule.mealsSchedule.find((m: any) => m.mealType === 'lunch')?.isFlexible,
      lunch_notes: updatedSchedule.mealsSchedule.find((m: any) => m.mealType === 'lunch')?.notes,
      
      afternoon_snack: updatedSchedule.mealsSchedule.find((m: any) => m.mealType === 'afternoon_snack')?.scheduledTime,
      afternoon_snack_duration: updatedSchedule.mealsSchedule.find((m: any) => m.mealType === 'afternoon_snack')?.duration,
      afternoon_snack_calories: updatedSchedule.mealsSchedule.find((m: any) => m.mealType === 'afternoon_snack')?.calories,
      afternoon_snack_flexible: updatedSchedule.mealsSchedule.find((m: any) => m.mealType === 'afternoon_snack')?.isFlexible,
      afternoon_snack_notes: updatedSchedule.mealsSchedule.find((m: any) => m.mealType === 'afternoon_snack')?.notes,
      
      dinner: updatedSchedule.mealsSchedule.find((m: any) => m.mealType === 'dinner')?.scheduledTime,
      dinner_duration: updatedSchedule.mealsSchedule.find((m: any) => m.mealType === 'dinner')?.duration,
      dinner_calories: updatedSchedule.mealsSchedule.find((m: any) => m.mealType === 'dinner')?.calories,
      dinner_flexible: updatedSchedule.mealsSchedule.find((m: any) => m.mealType === 'dinner')?.isFlexible,
      dinner_notes: updatedSchedule.mealsSchedule.find((m: any) => m.mealType === 'dinner')?.notes
    };

    const updatedPlan = {
      ...dietPlan,
      mealSchedules: updatedSchedule,
      meal_timing: oldFormat
    };
    
    console.log('Guardando horarios actualizados:', updatedPlan);
    onPlanDataChange(updatedPlan);
  };

  // Aplicar horarios típicos según el perfil del paciente
  const applyLifestyleSchedule = (lifestyleType: string) => {
    const schedulePresets = {
      student: {
        wakeUpTime: '06:30',
        bedTime: '23:00',
        mealsSchedule: [
          { mealType: 'breakfast', mealName: 'Desayuno', scheduledTime: '07:00', duration: 15, isFlexible: false, icon: '🌅', notes: '', calories: 666 },
          { mealType: 'morning_snack', mealName: 'Colación Matutina', scheduledTime: '10:30', duration: 10, isFlexible: true, icon: '☕', notes: '', calories: 266 },
          { mealType: 'lunch', mealName: 'Comida', scheduledTime: '13:00', duration: 25, isFlexible: true, icon: '🍽️', notes: '', calories: 932 },
          { mealType: 'afternoon_snack', mealName: 'Colación Vespertina', scheduledTime: '16:00', duration: 10, isFlexible: true, icon: '🥪', notes: '', calories: 266 },
          { mealType: 'dinner', mealName: 'Cena', scheduledTime: '19:30', duration: 25, isFlexible: false, icon: '🌙', notes: '', calories: 533 }
        ]
      },
      office_worker: {
        wakeUpTime: '06:00',
        bedTime: '22:30',
        mealsSchedule: [
          { mealType: 'breakfast', mealName: 'Desayuno', scheduledTime: '06:30', duration: 20, isFlexible: false, icon: '🌅', notes: '', calories: 666 },
          { mealType: 'morning_snack', mealName: 'Colación Matutina', scheduledTime: '09:30', duration: 10, isFlexible: true, icon: '☕', notes: '', calories: 266 },
          { mealType: 'lunch', mealName: 'Comida', scheduledTime: '13:00', duration: 45, isFlexible: false, icon: '🍽️', notes: '', calories: 932 },
          { mealType: 'afternoon_snack', mealName: 'Colación Vespertina', scheduledTime: '16:00', duration: 10, isFlexible: true, icon: '🥪', notes: '', calories: 266 },
          { mealType: 'dinner', mealName: 'Cena', scheduledTime: '19:00', duration: 30, isFlexible: false, icon: '🌙', notes: '', calories: 533 }
        ]
      },
      shift_worker: {
        wakeUpTime: '05:00',
        bedTime: '21:00',
        mealsSchedule: [
          { mealType: 'breakfast', mealName: 'Desayuno', scheduledTime: '05:30', duration: 20, isFlexible: false, icon: '🌅', notes: '', calories: 666 },
          { mealType: 'morning_snack', mealName: 'Colación Matutina', scheduledTime: '08:00', duration: 10, isFlexible: true, icon: '☕', notes: '', calories: 266 },
          { mealType: 'lunch', mealName: 'Comida', scheduledTime: '11:30', duration: 30, isFlexible: false, icon: '🍽️', notes: '', calories: 932 },
          { mealType: 'afternoon_snack', mealName: 'Colación Vespertina', scheduledTime: '15:00', duration: 10, isFlexible: true, icon: '🥪', notes: '', calories: 266 },
          { mealType: 'dinner', mealName: 'Cena', scheduledTime: '17:30', duration: 25, isFlexible: false, icon: '🌙', notes: '', calories: 533 }
        ]
      },
      homemaker: {
        wakeUpTime: '07:00',
        bedTime: '22:00',
        mealsSchedule: [
          { mealType: 'breakfast', mealName: 'Desayuno', scheduledTime: '07:30', duration: 25, isFlexible: true, icon: '🌅', notes: '', calories: 666 },
          { mealType: 'morning_snack', mealName: 'Colación Matutina', scheduledTime: '10:00', duration: 15, isFlexible: true, icon: '☕', notes: '', calories: 266 },
          { mealType: 'lunch', mealName: 'Comida', scheduledTime: '13:30', duration: 35, isFlexible: true, icon: '🍽️', notes: '', calories: 932 },
          { mealType: 'afternoon_snack', mealName: 'Colación Vespertina', scheduledTime: '16:30', duration: 15, isFlexible: true, icon: '🥪', notes: '', calories: 266 },
          { mealType: 'dinner', mealName: 'Cena', scheduledTime: '19:30', duration: 30, isFlexible: true, icon: '🌙', notes: '', calories: 533 }
        ]
      }
    };

    const preset = schedulePresets[lifestyleType as keyof typeof schedulePresets];
    if (preset) {
      const updatedSchedule = {
        ...schedule,
        ...preset
      };
      setSchedule(updatedSchedule);
      saveScheduleToPlan(updatedSchedule);
    }
  };

  // Analizar tiempo entre comidas
  const analyzeTimingGaps = () => {
    const gaps = [];
    const meals = schedule.mealsSchedule
      .sort((a, b) => a.scheduledTime.localeCompare(b.scheduledTime));

    for (let i = 0; i < meals.length - 1; i++) {
      const current = new Date(`2000-01-01T${meals[i].scheduledTime}`);
      const next = new Date(`2000-01-01T${meals[i + 1].scheduledTime}`);
      const diffHours = (next.getTime() - current.getTime()) / (1000 * 60 * 60);
      
      gaps.push({
        from: meals[i].mealName,
        to: meals[i + 1].mealName,
        hours: diffHours,
        recommendation: diffHours > 5 ? 'Gap muy largo - considerar colación' : 
                      diffHours < 2 ? 'Gap muy corto - ajustar horarios' : 
                      'Timing adecuado'
      });
    }
    return gaps;
  };

  // Actualizar horario de comida
  const updateMealSchedule = (mealType: string, field: string, value: any) => {
    const updatedSchedule = {
      ...schedule,
      mealsSchedule: schedule.mealsSchedule.map(meal =>
        meal.mealType === mealType ? { ...meal, [field]: value } : meal
      )
    };
    setSchedule(updatedSchedule);
    saveScheduleToPlan(updatedSchedule);
  };

  // Agregar recordatorio de agua
  const addWaterReminder = () => {
    const newTime = '12:00'; // Tiempo por defecto
    const updatedSchedule = {
      ...schedule,
      waterReminders: [...schedule.waterReminders, newTime].sort()
    };
    setSchedule(updatedSchedule);
    saveScheduleToPlan(updatedSchedule);
  };

  // Eliminar recordatorio de agua
  const removeWaterReminder = (index: number) => {
    const updatedSchedule = {
      ...schedule,
      waterReminders: schedule.waterReminders.filter((_, i) => i !== index)
    };
    setSchedule(updatedSchedule);
    saveScheduleToPlan(updatedSchedule);
  };

  const timingGaps = analyzeTimingGaps();

  return (
    <div className="nutritional-schedule-tab">
      <div className="row">
        {/* Panel principal - Horarios */}
        <div className="col-md-8">
          {/* Horarios básicos */}
          <div className="card mb-4">
            <div className="card-header">
              <h6 className="mb-0">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-sun-moon me-2">
                  <path d="M12 8a2.83 2.83 0 0 0 4 4 4 4 0 1 1-4-4"></path>
                  <path d="M12 2v2"></path>
                  <path d="m4.9 4.9 1.4 1.4"></path>
                  <path d="M2 12h2"></path>
                  <path d="m4.9 19.1 1.4-1.4"></path>
                  <path d="M12 20v2"></path>
                  <path d="m19.1 19.1-1.4-1.4"></path>
                  <path d="M20 12h2"></path>
                  <path d="m19.1 4.9-1.4 1.4"></path>
                </svg>
                Rutina Diaria
              </h6>
            </div>
            <div className="card-body">
              <div className="row mb-4">
                <div className="col-md-4">
                  <label className="form-label" htmlFor="wake-up-time">Hora de Despertar</label>
                  <input
                    type="time"
                    className="form-control"
                    id="wake-up-time"
                    name="wake-up-time"
                    value={schedule.wakeUpTime}
                    onChange={(e) => {
                      const updatedSchedule = { ...schedule, wakeUpTime: e.target.value };
                      setSchedule(updatedSchedule);
                      saveScheduleToPlan(updatedSchedule);
                    }}
                  />
                </div>
                <div className="col-md-4">
                  <label className="form-label" htmlFor="bed-time">Hora de Dormir</label>
                  <input
                    type="time"
                    className="form-control"
                    id="bed-time"
                    name="bed-time"
                    value={schedule.bedTime}
                    onChange={(e) => {
                      const updatedSchedule = { ...schedule, bedTime: e.target.value };
                      setSchedule(updatedSchedule);
                      saveScheduleToPlan(updatedSchedule);
                    }}
                  />
                </div>
                <div className="col-md-4">
                  <label className="form-label" htmlFor="lifestyle-preset">Presets de Estilo de Vida</label>
                  <select
                    className="form-select"
                    id="lifestyle-preset"
                    name="lifestyle-preset"
                    onChange={(e) => {
                      if (e.target.value) {
                        applyLifestyleSchedule(e.target.value);
                      }
                    }}
                    defaultValue=""
                  >
                    <option value="">Seleccionar preset...</option>
                    <option value="student">Estudiante</option>
                    <option value="office_worker">Oficinista</option>
                    <option value="shift_worker">Trabajador por Turnos</option>
                    <option value="homemaker">Ama/o de Casa</option>
                  </select>
                </div>
              </div>

              {/* Ejercicio */}
              <div className="row">
                <div className="col-md-6">
                  <label className="form-label" htmlFor="exercise-time">Hora de Ejercicio (Opcional)</label>
                  <input
                    type="time"
                    className="form-control"
                    id="exercise-time"
                    name="exercise-time"
                    value={schedule.exerciseTime || ''}
                    onChange={(e) => {
                      const updatedSchedule = { ...schedule, exerciseTime: e.target.value };
                      setSchedule(updatedSchedule);
                      saveScheduleToPlan(updatedSchedule);
                    }}
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label" htmlFor="exercise-duration">Duración del Ejercicio</label>
                  <div className="input-group">
                    <input
                      type="number"
                      className="form-control"
                      id="exercise-duration"
                      name="exercise-duration"
                      value={schedule.exerciseDuration || ''}
                      onChange={(e) => {
                        const updatedSchedule = { ...schedule, exerciseDuration: parseInt(e.target.value) || 0 };
                        setSchedule(updatedSchedule);
                        saveScheduleToPlan(updatedSchedule);
                      }}
                      min="15"
                      max="180"
                      step="15"
                    />
                    <span className="input-group-text">min</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Horarios de comidas */}
          <div className="card mb-4">
            <div className="card-header d-flex justify-content-between align-items-center">
              <h6 className="mb-0">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-utensils me-2">
                  <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"></path>
                  <path d="M7 2v20"></path>
                  <path d="M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Z"></path>
                </svg>
                Horarios de Comidas
              </h6>
              <button
                type="button"
                className="btn btn-sm btn-outline-info"
                onClick={() => setShowTimeAnalysis(!showTimeAnalysis)}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-analytics me-1">
                  <path d="M3 3v18h18"></path>
                  <path d="m19 9-5 5-4-4-3 3"></path>
                </svg>
                {showTimeAnalysis ? 'Ocultar' : 'Analizar'} Timing
              </button>
            </div>
            <div className="card-body">
              {/* Timeline visual */}
              <div className="timeline-container mb-4">
                <div className="timeline-line position-relative">
                  {schedule.mealsSchedule.map((meal, _) => {
                    const timePosition = ((parseInt(meal.scheduledTime.split(':')[0]) * 60 + parseInt(meal.scheduledTime.split(':')[1])) / (24 * 60)) * 100;
                    
                    return (
                      <div
                        key={meal.mealType}
                        className="timeline-marker position-absolute"
                        style={{ left: `${timePosition}%`, transform: 'translateX(-50%)' }}
                      >
                        <div className="text-center">
                          <div className={`badge ${meal.isFlexible ? 'bg-warning' : 'bg-primary'} mb-1`} style={{ fontSize: '16px' }}>
                            {meal.icon}
                          </div>
                          <div className="small text-muted">{meal.scheduledTime}</div>
                          <div className="small fw-bold">{meal.mealName}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Configuración detallada de cada comida */}
              <div className="row">
                {schedule.mealsSchedule.map((meal, _) => (
                  <div key={meal.mealType} className="col-12 mb-3">
                    <div className="border rounded p-3">
                      <div className="row align-items-center">
                        <div className="col-md-2">
                          <div className="d-flex align-items-center">
                            <span className="me-2" style={{ fontSize: '24px' }}>{meal.icon}</span>
                            <div>
                              <div className="fw-bold small">{meal.mealName}</div>
                              <div className={`badge ${meal.isFlexible ? 'bg-warning' : 'bg-success'}`}>
                                {meal.isFlexible ? 'Flexible' : 'Fijo'}
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="col-md-2">
                          <label className="form-label small" htmlFor={`meal-time-${meal.mealType}`}>Hora</label>
                          <input
                            type="time"
                            className="form-control form-control-sm"
                            id={`meal-time-${meal.mealType}`}
                            name={`meal-time-${meal.mealType}`}
                            value={meal.scheduledTime}
                            onChange={(e) => updateMealSchedule(meal.mealType, 'scheduledTime', e.target.value)}
                          />
                        </div>

                        <div className="col-md-2">
                          <label className="form-label small" htmlFor={`meal-duration-${meal.mealType}`}>Duración</label>
                          <div className="input-group input-group-sm">
                            <input
                              type="number"
                              className="form-control"
                              id={`meal-duration-${meal.mealType}`}
                              name={`meal-duration-${meal.mealType}`}
                              value={meal.duration}
                              onChange={(e) => updateMealSchedule(meal.mealType, 'duration', parseInt(e.target.value) || 0)}
                              min="5"
                              max="60"
                              step="5"
                            />
                            <span className="input-group-text">min</span>
                          </div>
                        </div>

                        <div className="col-md-2">
                          <label className="form-label small" htmlFor={`meal-calories-${meal.mealType}`}>Calorías</label>
                          <div className="input-group input-group-sm">
                            <input
                              type="number"
                              className="form-control"
                              id={`meal-calories-${meal.mealType}`}
                              name={`meal-calories-${meal.mealType}`}
                              value={meal.calories}
                              onChange={(e) => updateMealSchedule(meal.mealType, 'calories', parseInt(e.target.value) || 0)}
                              min="0"
                              max="2000"
                              step="10"
                            />
                            <span className="input-group-text">kcal</span>
                          </div>
                        </div>

                        <div className="col-md-2">
                          <label className="form-label small" htmlFor={`meal-flexible-${meal.mealType}`}>Flexibilidad</label>
                          <div className="form-check form-switch">
                            <input
                              className="form-check-input"
                              type="checkbox"
                              id={`meal-flexible-${meal.mealType}`}
                              name={`meal-flexible-${meal.mealType}`}
                              checked={meal.isFlexible}
                              onChange={(e) => updateMealSchedule(meal.mealType, 'isFlexible', e.target.checked)}
                            />
                            <label className="form-check-label small" htmlFor={`meal-flexible-${meal.mealType}`}>
                              {meal.isFlexible ? 'Flexible' : 'Fijo'}
                            </label>
                          </div>
                        </div>

                        <div className="col-md-2">
                          <label className="form-label small" htmlFor={`meal-notes-${meal.mealType}`}>Notas</label>
                          <input
                            type="text"
                            className="form-control form-control-sm"
                            id={`meal-notes-${meal.mealType}`}
                            name={`meal-notes-${meal.mealType}`}
                            value={meal.notes || ''}
                            onChange={(e) => updateMealSchedule(meal.mealType, 'notes', e.target.value)}
                            placeholder="Ej: Después del ejercicio, en oficina..."
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Análisis de timing */}
              {showTimeAnalysis && (
                <div className="mt-4">
                  <h6 className="mb-3">Análisis de Intervalos</h6>
                  <div className="table-responsive">
                    <table className="table table-sm">
                      <thead>
                        <tr>
                          <th>Desde</th>
                          <th>Hasta</th>
                          <th>Intervalo</th>
                          <th>Recomendación</th>
                        </tr>
                      </thead>
                      <tbody>
                        {timingGaps.map((gap, index) => (
                          <tr key={index}>
                            <td>{gap.from}</td>
                            <td>{gap.to}</td>
                            <td>{gap.hours.toFixed(1)} horas</td>
                            <td>
                              <span className={`badge ${
                                gap.recommendation.includes('adecuado') ? 'bg-success' : 
                                gap.recommendation.includes('largo') ? 'bg-warning' : 'bg-danger'
                              }`}>
                                {gap.recommendation}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Recordatorios de hidratación */}
          <div className="card">
            <div className="card-header d-flex justify-content-between align-items-center">
              <h6 className="mb-0">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-droplets me-2">
                  <path d="M7 16.3c2.2 0 4-1.83 4-4.05 0-1.16-.57-2.26-1.71-3.19S7.29 6.75 7 5.3c-.29 1.45-1.14 2.84-2.29 3.76S3 11.1 3 12.25c0 2.22 1.8 4.05 4 4.05z"></path>
                  <path d="M12.56 6.6A10.97 10.97 0 0 0 14 3.02c.5 2.5 2.04 4.64 4.24 6.09 1.12.73 1.76 1.97 1.76 3.28 0 2.22-1.78 4.02-4 4.02-2.2 0-4-1.8-4-4.02 0-1.25.61-2.4 1.56-3.12z"></path>
                </svg>
                Recordatorios de Hidratación
              </h6>
              <button
                type="button"
                className="btn btn-sm btn-outline-primary"
                onClick={addWaterReminder}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-plus me-1">
                  <path d="M5 12h14"></path>
                  <path d="M12 5v14"></path>
                </svg>
                Agregar
              </button>
            </div>
            <div className="card-body">
              <div className="row">
                {schedule.waterReminders.map((time, index) => (
                  <div key={index} className="col-md-3 mb-2">
                    <div className="input-group input-group-sm">
                      <span className="input-group-text">💧</span>
                      <input
                        type="time"
                        className="form-control"
                        id={`water-reminder-${index}`}
                        name={`water-reminder-${index}`}
                        value={time}
                        onChange={(e) => {
                          const updatedReminders = [...schedule.waterReminders];
                          updatedReminders[index] = e.target.value;
                          const updatedSchedule = { ...schedule, waterReminders: updatedReminders.sort() };
                          setSchedule(updatedSchedule);
                          saveScheduleToPlan(updatedSchedule);
                        }}
                      />
                      <button
                        type="button"
                        className="btn btn-outline-danger btn-sm"
                        onClick={() => removeWaterReminder(index)}
                        aria-label={`Eliminar recordatorio de agua ${index + 1}`}
                      >
                        ×
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              
              {schedule.waterReminders.length === 0 && (
                <div className="text-center text-muted py-3">
                  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-droplets mb-2">
                    <path d="M7 16.3c2.2 0 4-1.83 4-4.05 0-1.16-.57-2.26-1.71-3.19S7.29 6.75 7 5.3c-.29 1.45-1.14 2.84-2.29 3.76S3 11.1 3 12.25c0 2.22 1.8 4.05 4 4.05z"></path>
                    <path d="M12.56 6.6A10.97 10.97 0 0 0 14 3.02c.5 2.5 2.04 4.64 4.24 6.09 1.12.73 1.76 1.97 1.76 3.28 0 2.22-1.78 4.02-4 4.02-2.2 0-4-1.8-4-4.02 0-1.25.61-2.4 1.56-3.12z"></path>
                  </svg>
                  <p>No hay recordatorios de hidratación configurados</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Panel lateral */}
        <div className="col-md-4">
          {/* Resumen del día */}
          <div className="card mb-3">
            <div className="card-header">
              <h6 className="mb-0">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-clock me-2">
                  <circle cx="12" cy="12" r="10"></circle>
                  <polyline points="12 6 12 12 16 14"></polyline>
                </svg>
                Resumen del Día
              </h6>
            </div>
            <div className="card-body">
              <div className="small">
                <div className="d-flex justify-content-between mb-2">
                  <span>🌅 Despertar:</span>
                  <strong>{schedule.wakeUpTime}</strong>
                </div>
                <div className="d-flex justify-content-between mb-2">
                  <span>🌙 Dormir:</span>
                  <strong>{schedule.bedTime}</strong>
                </div>
                <div className="d-flex justify-content-between mb-2">
                  <span>🍽️ Comidas:</span>
                  <strong>{schedule.mealsSchedule.length}</strong>
                </div>
                <div className="d-flex justify-content-between mb-2">
                  <span>💧 Recordatorios:</span>
                  <strong>{schedule.waterReminders.length}</strong>
                </div>
                {schedule.exerciseTime && (
                  <div className="d-flex justify-content-between mb-2">
                    <span>🏃 Ejercicio:</span>
                    <strong>{schedule.exerciseTime} ({schedule.exerciseDuration}min)</strong>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Tips de programación */}
          <div className="card mb-3">
            <div className="card-header">
              <h6 className="mb-0">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-lightbulb me-2">
                  <path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 12 2c-3.3 0-6 2.7-6 6 0 1.3.5 2.6 1.5 3.5.8.8 1.3 1.5 1.5 2.5"></path>
                  <path d="M9 18h6"></path>
                  <path d="M10 22h4"></path>
                </svg>
                Tips de Horarios
              </h6>
            </div>
            <div className="card-body">
              <div className="small">
                <ul className="list-unstyled mb-0">
                  <li className="mb-2">
                    ⏰ <strong>Consistencia:</strong> Mantén horarios regulares para mejorar la digestión.
                  </li>
                  <li className="mb-2">
                    🥗 <strong>Espaciado:</strong> Deja 3-4 horas entre comidas principales.
                  </li>
                  <li className="mb-2">
                    🌙 <strong>Cena:</strong> Come al menos 2-3 horas antes de dormir.
                  </li>
                  <li className="mb-2">
                    💧 <strong>Hidratación:</strong> Bebe agua regularmente durante el día.
                  </li>
                  <li>
                    🏃 <strong>Ejercicio:</strong> No hagas ejercicio intenso justo antes de las comidas.
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Estadísticas de timing */}
          <div className="card">
            <div className="card-header">
              <h6 className="mb-0">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-bar-chart me-2">
                  <line x1="4" x2="4" y1="21" y2="14"></line>
                  <line x1="8" x2="8" y1="21" y2="10"></line>
                  <line x1="12" x2="12" y1="21" y2="12"></line>
                  <line x1="16" x2="16" y1="21" y2="6"></line>
                  <line x1="20" x2="20" y1="21" y2="10"></line>
                </svg>
                Estadísticas
              </h6>
            </div>
            <div className="card-body">
              <div className="small">
                <div className="d-flex justify-content-between mb-1">
                  <span>Primera comida:</span>
                  <span className="fw-bold">{schedule.mealsSchedule.length > 0 ? schedule.mealsSchedule.map(m => m.scheduledTime).sort()[0] : 'N/A'}</span>
                </div>
                <div className="d-flex justify-content-between mb-1">
                  <span>Última comida:</span>
                  <span className="fw-bold">{schedule.mealsSchedule.length > 0 ? schedule.mealsSchedule.map(m => m.scheduledTime).sort().reverse()[0] : 'N/A'}</span>
                </div>
                <div className="d-flex justify-content-between mb-1">
                  <span>Tiempo total alimentación:</span>
                  <span className="fw-bold">
                    {(() => {
                      const first = Math.min(...schedule.mealsSchedule.map(m => parseInt(m.scheduledTime.replace(':', ''))));
                      const last = Math.max(...schedule.mealsSchedule.map(m => parseInt(m.scheduledTime.replace(':', ''))));
                      const diffHours = Math.floor((last - first) / 100) + (((last - first) % 100) / 60);
                      return `${diffHours.toFixed(1)}h`;
                    })()}
                  </span>
                </div>
                <div className="d-flex justify-content-between">
                  <span>Comidas flexibles:</span>
                  <span className="fw-bold">{schedule.mealsSchedule.filter(m => m.isFlexible).length}/{schedule.mealsSchedule.length}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 