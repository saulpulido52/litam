import React, { useState } from 'react';

interface NutritionalCardSimpleProps {
  dietPlan?: any;
  patient: any;
  patients?: any[]; // Lista completa de pacientes disponibles
  clinicalRecords?: any[]; // Todos los expedientes clínicos disponibles
  mode: 'create' | 'edit' | 'view';
  onSave?: (planData: any) => void;
  onClose?: () => void;
  isLoading?: boolean;
}

const NutritionalCardSimple: React.FC<NutritionalCardSimpleProps> = ({
  dietPlan,
  patient,
  patients = [],
  clinicalRecords = [],
  mode,
  onSave,
  onClose,
  isLoading = false
}) => {
  const [activeTab, setActiveTab] = useState<string>('summary');
  const [recommendationsApplied, setRecommendationsApplied] = useState<boolean>(false);
  const [planData, setPlanData] = useState<any>({
    patientId: dietPlan?.patient_id || patient?.id || '',
    name: dietPlan?.name || '',
    description: dietPlan?.description || '',
    notes: dietPlan?.notes || '',
    startDate: dietPlan?.start_date ? new Date(dietPlan.start_date).toISOString().split('T')[0] : '',
    endDate: dietPlan?.end_date ? new Date(dietPlan.end_date).toISOString().split('T')[0] : '',
    dailyCaloriesTarget: dietPlan?.daily_calories_target || dietPlan?.target_calories || 2000,
    dailyMacrosTarget: dietPlan?.daily_macros_target || {
      protein: 150,
      carbohydrates: 225,
      fats: 56
    },
    isWeeklyPlan: dietPlan?.is_weekly_plan ?? true,
    totalWeeks: dietPlan?.total_weeks || 4,
    weeklyPlans: dietPlan?.weekly_plans || [],
    // Nuevos campos de nutrición
    waterIntake: dietPlan?.water_intake || 2.5,
    fiberTarget: dietPlan?.fiber_target || 25,
    // Nuevos campos de comidas
    planType: dietPlan?.plan_type || 'weekly',
    mealsPerDay: dietPlan?.meals_per_day || 5,
    calorieDistribution: dietPlan?.calorie_distribution || 'balanced',
    // Nuevos campos de horarios
    mealTimes: dietPlan?.meal_times || {
      breakfast: '07:00',
      midMorning: '10:00',
      lunch: '13:00',
      snack: '16:00',
      dinner: '19:00'
    },
    bedTime: dietPlan?.bed_time || '22:00',
    // Nuevos campos de restricciones
    foodAllergies: dietPlan?.food_allergies || '',
    foodIntolerances: dietPlan?.food_intolerances || '',
    medicalConditions: dietPlan?.medical_conditions || '',
    medications: dietPlan?.medications || '',
    isVegetarian: dietPlan?.is_vegetarian || false,
    isVegan: dietPlan?.is_vegan || false,
    isGlutenFree: dietPlan?.is_gluten_free || false,
    isLactoseFree: dietPlan?.is_lactose_free || false,
    isKeto: dietPlan?.is_keto || false,
    isLowSodium: dietPlan?.is_low_sodium || false
  });

  const tabs = [
    { key: 'summary', label: 'Resumen', icon: '📋' },
    { key: 'meals', label: 'Comidas', icon: '🍽️' },
    { key: 'nutrition', label: 'Nutrición', icon: '🎯' },
    { key: 'schedule', label: 'Horarios', icon: '⏰' },
    { key: 'restrictions', label: 'Restricciones', icon: '🛡️' }
  ];

  const handleSave = () => {
    console.log('🚀 === INICIO CREACIÓN PLAN NUTRICIONAL ===');
    console.log('📋 TODOS LOS INPUTS DEL FORMULARIO (planData completo):', {
      // === DATOS BÁSICOS ===
      name: planData.name,
      description: planData.description,
      patientId: planData.patientId,
      startDate: planData.startDate,
      endDate: planData.endDate,
      notes: planData.notes,
      
      // === OBJETIVOS NUTRICIONALES ===
      dailyCaloriesTarget: planData.dailyCaloriesTarget,
      dailyMacrosTarget: {
        protein: planData.dailyMacrosTarget?.protein,
        carbohydrates: planData.dailyMacrosTarget?.carbohydrates,
        fats: planData.dailyMacrosTarget?.fats
      },
      
      // === CONFIGURACIÓN TEMPORAL ===
      isWeeklyPlan: planData.isWeeklyPlan,
      totalWeeks: planData.totalWeeks,
      weeklyPlans: planData.weeklyPlans?.length || 0,
      planType: planData.planType,
      planPeriod: planData.planPeriod,
      totalPeriods: planData.totalPeriods,
      
      // === DATOS NUTRICIONALES DETALLADOS (Los más importantes) ===
      waterIntake: planData.waterIntake,
      fiberTarget: planData.fiberTarget,
      mealsPerDay: planData.mealsPerDay,
      calorieDistribution: planData.calorieDistribution,
      mealTimes: planData.mealTimes,
      bedTime: planData.bedTime,
      
      // === ALERGIAS Y RESTRICCIONES MÉDICAS ===
      foodAllergies: planData.foodAllergies,
      foodIntolerances: planData.foodIntolerances,
      medicalConditions: planData.medicalConditions,
      medications: planData.medications,
      
      // === PREFERENCIAS DIETÉTICAS ===
      isVegetarian: planData.isVegetarian,
      isVegan: planData.isVegan,
      isGlutenFree: planData.isGlutenFree,
      isLactoseFree: planData.isLactoseFree,
      isKeto: planData.isKeto,
      isLowSodium: planData.isLowSodium
    });
    
    console.log('🔍 Validando datos antes de guardar:', {
      hasOnSave: !!onSave,
      patientId: planData.patientId,
      name: planData.name?.trim(),
      startDate: planData.startDate,
      selectedPatient: selectedPatient ? `${selectedPatient.first_name} ${selectedPatient.last_name}` : 'null'
    });

    if (!onSave) {
      console.error('❌ No hay función onSave definida');
      alert('Error: Función de guardado no disponible');
      return;
    }

    if (!planData.patientId) {
      console.error('❌ PatientId requerido');
      alert('Por favor selecciona un paciente');
      return;
    }

    if (!planData.name?.trim()) {
      console.error('❌ Nombre del plan requerido');
      alert('Por favor ingresa un nombre para el plan');
      return;
    }

    if (!planData.startDate) {
      console.error('❌ Fecha de inicio requerida');
      alert('Por favor selecciona una fecha de inicio');
      return;
    }

    console.log('💾 Guardando plan nutricional - datos validados correctamente');
    
    // Construir pathologicalRestrictions con estructura compatible con DietPlanViewer
    const pathologicalRestrictions = {
      // Información médica (snake_case para compatibilidad con viewer)
      medical_conditions: planData.medicalConditions ? [
        {
          name: 'Condiciones médicas registradas',
          category: 'medical',
          severity: 'medium',
          description: planData.medicalConditions,
          dietary_implications: [],
          restricted_foods: [],
          recommended_foods: [],
          monitoring_requirements: [],
          emergency_instructions: ''
        }
      ] : [],
      
      // Alergias alimentarias
      allergies: planData.foodAllergies ? [
        {
          allergen: planData.foodAllergies,
          type: 'food',
          severity: 'medium',
          symptoms: [],
          cross_reactions: [],
          emergency_medication: '',
          avoidance_instructions: `Evitar completamente: ${planData.foodAllergies}`
        }
      ] : [],
      
      // Intolerancias
      intolerances: planData.foodIntolerances ? [
        {
          substance: planData.foodIntolerances,
          type: 'food',
          severity: 'mild',
          symptoms: [],
          threshold_amount: '',
          alternatives: [],
          preparation_notes: ''
        }
      ] : [],
      
      // Medicamentos
      medications: planData.medications ? [
        {
          name: planData.medications,
          dosage: 'Ver expediente clínico',
          frequency: 'Según prescripción médica',
          food_interactions: [],
          timing_requirements: ''
        }
      ] : [],
      
      // Consideraciones especiales - SOLO preferencias dietéticas médicas
      special_considerations: [
        // SOLO preferencias dietéticas/médicas (NO configuración nutricional)
        ...(planData.isVegetarian ? ['🌱 Dieta vegetariana'] : []),
        ...(planData.isVegan ? ['🌿 Dieta vegana'] : []),
        ...(planData.isGlutenFree ? ['🚫 Sin gluten'] : []),
        ...(planData.isLactoseFree ? ['🥛 Sin lactosa'] : []),
        ...(planData.isKeto ? ['🥑 Dieta cetogénica'] : []),
        ...(planData.isLowSodium ? ['🧂 Bajo en sodio'] : [])
      ].filter(item => item.length > 0),
      
      emergency_contacts: []
    };

    // === GENERAR DATOS INTELIGENTES PARA COMPLETAR TODOS LOS TABS ===
    
    console.log('🧠 Generando datos inteligentes para completar pestañas...');
    
    // 1. MEAL_FREQUENCY - Frecuencia de comidas basada en mealsPerDay
    const mealFrequency = {
      breakfast: true,
      morning_snack: (planData.mealsPerDay || 3) >= 4,
      lunch: true,
      afternoon_snack: (planData.mealsPerDay || 3) >= 5,
      dinner: true,
      evening_snack: (planData.mealsPerDay || 3) >= 6
    };
    
    // 2. MEAL_TIMING - Horarios inteligentes basados en mealTimes o defaults + hora de dormir
    const mealTiming = planData.mealTimes ? {
      breakfast_time: planData.mealTimes.breakfast || '08:00',
      lunch_time: planData.mealTimes.lunch || '13:00', 
      dinner_time: planData.mealTimes.dinner || '19:00',
      snack_times: [
        planData.mealTimes.midMorning || '10:30',
        planData.mealTimes.snack || '16:00'
      ].filter((_) => mealFrequency.morning_snack || mealFrequency.afternoon_snack),
      bed_time: planData.bedTime || '22:00'
    } : {
      breakfast_time: '08:00',
      lunch_time: '13:00',
      dinner_time: '19:00',
      snack_times: mealFrequency.morning_snack ? ['10:30', '16:00'] : [],
      bed_time: planData.bedTime || '22:00'
    };
    
    // 3. NUTRITIONAL_GOALS - Objetivos nutricionales específicos
    const nutritionalGoals = {
      water_intake_liters: planData.waterIntake || 2.5,
      fiber_target_grams: planData.fiberTarget || 25,
      calorie_distribution: planData.calorieDistribution || 'balanced',
      meals_per_day: planData.mealsPerDay || 3
    };
    
    // 4. FLEXIBILITY_SETTINGS - Configuración de flexibilidad inteligente
    const flexibilitySettings = {
      allow_meal_swapping: true,
      allow_portion_adjustment: true,
      allow_food_substitution: !planData.foodAllergies && !planData.medicalConditions, // Más restrictivo si hay alergias
      cheat_days_per_week: planData.isKeto ? 0 : 1, // Sin días de trampa si es keto
      free_meals_per_week: 2
    };
    
    // 5. WEEKLY_PLANS - Generar estructura semanal básica
    const weeklyPlans = [];
    for (let week = 1; week <= (planData.totalWeeks || 1); week++) {
      const startDate = new Date(planData.startDate);
      startDate.setDate(startDate.getDate() + (week - 1) * 7);
      const endDate = new Date(startDate);
      endDate.setDate(startDate.getDate() + 6);
      
      weeklyPlans.push({
        week_number: week,
        start_date: startDate.toISOString().split('T')[0],
        end_date: endDate.toISOString().split('T')[0],
        daily_calories_target: planData.dailyCaloriesTarget,
        daily_macros_target: planData.dailyMacrosTarget,
        meals: [], // Se llenarán posteriormente por el nutricionista
        notes: `Semana ${week} - Plan generado automáticamente`
      });
    }
    
    console.log('✅ Datos inteligentes generados:', {
      meal_frequency: mealFrequency,
      meal_timing: mealTiming,
      nutritional_goals: nutritionalGoals,
      flexibility_settings: flexibilitySettings,
      weekly_plans_count: weeklyPlans.length
    });

    // Filtrar solo los campos que acepta el backend según CreateDietPlanDto
    const allowedFields = {
      name: planData.name,
      patientId: planData.patientId,
      description: planData.description,
      startDate: planData.startDate,
      endDate: planData.endDate,
      dailyCaloriesTarget: planData.dailyCaloriesTarget,
      dailyMacrosTarget: planData.dailyMacrosTarget,
      notes: planData.notes,
      isWeeklyPlan: planData.isWeeklyPlan,
      totalWeeks: planData.totalWeeks,
      weeklyPlans: weeklyPlans, // Planes semanales generados
      planType: planData.planType,
      planPeriod: planData.planPeriod,
      totalPeriods: planData.totalPeriods,
      pathologicalRestrictions: pathologicalRestrictions,
      // === NUEVOS CAMPOS PARA COMPLETAR TABS ===
      mealFrequency: mealFrequency,
      mealTiming: mealTiming,
      nutritionalGoals: nutritionalGoals,
      flexibilitySettings: flexibilitySettings
    };
    
    // Remover campos undefined/null para limpiar el payload
    const transformedData = Object.fromEntries(
      Object.entries(allowedFields).filter(([_, value]) => value !== undefined && value !== null && value !== '')
    );
    
    console.log('🛡️ PATHOLOGICAL RESTRICTIONS CONSTRUIDOS (compatible con DietPlanViewer):', {
      medical_conditions: pathologicalRestrictions.medical_conditions,
      allergies: pathologicalRestrictions.allergies,
      intolerances: pathologicalRestrictions.intolerances,
      medications: pathologicalRestrictions.medications,
      special_considerations: pathologicalRestrictions.special_considerations,
      totales: {
        condiciones_medicas: pathologicalRestrictions.medical_conditions.length,
        alergias: pathologicalRestrictions.allergies.length,
        intolerancias: pathologicalRestrictions.intolerances.length,
        medicamentos: pathologicalRestrictions.medications.length,
        consideraciones_especiales: pathologicalRestrictions.special_considerations.length
      }
    });
    
    console.log('🎯 === LO QUE DEBERÍA APARECER EN "DETALLES DEL PLAN NUTRICIONAL" ===');
    
    console.log('📋 TAB RESUMEN - Información que se mostrará:', {
      nombre: allowedFields.name,
      descripcion: allowedFields.description || 'Sin descripción',
      fechaInicio: allowedFields.startDate,
      fechaFin: allowedFields.endDate,
      duracion: `${allowedFields.totalWeeks} semana${allowedFields.totalWeeks !== 1 ? 's' : ''}`,
      caloriasDiarias: allowedFields.dailyCaloriesTarget + ' kcal',
      macronutrientes: {
        proteinas: allowedFields.dailyMacrosTarget?.protein + 'g',
        carbohidratos: allowedFields.dailyMacrosTarget?.carbohydrates + 'g',
        grasas: allowedFields.dailyMacrosTarget?.fats + 'g'
      },
      notas: allowedFields.notes || 'Sin notas'
    });
    
    console.log('🍽️ TAB COMIDAS - Contenido que se mostrará:', {
      estado: '✅ COMPLETO CON DATOS INTELIGENTES',
      cantidadSemanas: allowedFields.weeklyPlans.length,
      primeraSemanaDatos: {
        semana: allowedFields.weeklyPlans[0]?.week_number,
        fechaInicio: allowedFields.weeklyPlans[0]?.start_date,
        fechaFin: allowedFields.weeklyPlans[0]?.end_date,
        calorias: allowedFields.weeklyPlans[0]?.daily_calories_target,
        macros: allowedFields.weeklyPlans[0]?.daily_macros_target
      },
      nota: 'Estructura semanal generada automáticamente - nutricionista puede agregar comidas específicas después'
    });
    
    console.log('🎯 TAB NUTRICIÓN - Contenido que se mostrará:', {
      estado: '✅ COMPLETO CON DATOS INTELIGENTES',
      objetivosNutricionales: {
        ingestaAgua: `${allowedFields.nutritionalGoals.water_intake_liters}L diarios`,
        objetivoFibra: `${allowedFields.nutritionalGoals.fiber_target_grams}g diarios`,
        comidasPorDia: `${allowedFields.nutritionalGoals.meals_per_day} comidas`,
        distribucionCalorica: allowedFields.nutritionalGoals.calorie_distribution
      },
      frecuenciaComidas: {
        desayuno: allowedFields.mealFrequency.breakfast ? '✓' : '✗',
        meriendaManana: allowedFields.mealFrequency.morning_snack ? '✓' : '✗',
        almuerzo: allowedFields.mealFrequency.lunch ? '✓' : '✗',
        meriendaTarde: allowedFields.mealFrequency.afternoon_snack ? '✓' : '✗',
        cena: allowedFields.mealFrequency.dinner ? '✓' : '✗',
        meriendaNoche: allowedFields.mealFrequency.evening_snack ? '✓' : '✗'
      },
      configuracionFlexibilidad: {
        intercambioComidas: allowedFields.flexibilitySettings.allow_meal_swapping ? '✓' : '✗',
        ajustePorciones: allowedFields.flexibilitySettings.allow_portion_adjustment ? '✓' : '✗',
        sustitucionAlimentos: allowedFields.flexibilitySettings.allow_food_substitution ? '✓' : '✗',
        diasTrampaSemanales: allowedFields.flexibilitySettings.cheat_days_per_week,
        comidasLibresSemanales: allowedFields.flexibilitySettings.free_meals_per_week
      }
    });
    
    console.log('⏰ TAB HORARIOS - Contenido que se mostrará:', {
      estado: '✅ COMPLETO CON DATOS INTELIGENTES',
      horariosComidas: {
        desayuno: allowedFields.mealTiming.breakfast_time,
        almuerzo: allowedFields.mealTiming.lunch_time,
        cena: allowedFields.mealTiming.dinner_time,
        meriendas: allowedFields.mealTiming.snack_times
      },
      horaDormir: allowedFields.mealTiming.bed_time,
      basadoEn: planData.mealTimes ? 'Horarios del formulario' : 'Horarios por defecto'
    });
    
    console.log('🛡️ TAB RESTRICCIONES - Información que se mostrará:');
    if (pathologicalRestrictions.medical_conditions.length > 0) {
      console.log('🏥 CONDICIONES MÉDICAS que aparecerán:', pathologicalRestrictions.medical_conditions.map(condition => ({
        nombre: condition.name,
        descripcion: condition.description,
        categoria: condition.category
      })));
    } else {
      console.log('🏥 CONDICIONES MÉDICAS: Sin condiciones médicas registradas');
    }
    
    if (pathologicalRestrictions.allergies.length > 0) {
      console.log('🥜 ALERGIAS que aparecerán:', pathologicalRestrictions.allergies.map(allergy => ({
        alérgeno: allergy.allergen,
        tipo: allergy.type,
        severidad: allergy.severity,
        instrucciones: allergy.avoidance_instructions
      })));
    } else {
      console.log('🥜 ALERGIAS: Sin alergias registradas');
    }
    
    if (pathologicalRestrictions.intolerances.length > 0) {
      console.log('🤧 INTOLERANCIAS que aparecerán:', pathologicalRestrictions.intolerances.map(intolerance => ({
        sustancia: intolerance.substance,
        tipo: intolerance.type,
        severidad: intolerance.severity
      })));
    } else {
      console.log('🤧 INTOLERANCIAS: Sin intolerancias registradas');
    }
    
    if (pathologicalRestrictions.medications.length > 0) {
      console.log('💊 MEDICAMENTOS que aparecerán:', pathologicalRestrictions.medications.map(medication => ({
        nombre: medication.name,
        dosis: medication.dosage,
        frecuencia: medication.frequency
      })));
    } else {
      console.log('💊 MEDICAMENTOS: Sin medicamentos registrados');
    }
    
    if (pathologicalRestrictions.special_considerations.length > 0) {
      console.log('✨ CONSIDERACIONES ESPECIALES que aparecerán:', pathologicalRestrictions.special_considerations);
    } else {
      console.log('✨ CONSIDERACIONES ESPECIALES: Sin consideraciones especiales');
    }
    
    console.log('🎯 === FIN PREVISUALIZACIÓN DE DETALLES ===');
    
    console.log('📤 Enviando datos transformados:', JSON.stringify(transformedData, null, 2));
    
    // Validar estructura antes de enviar
    const requiredFields = ['patientId', 'name', 'startDate', 'endDate'];
    const missingFields = requiredFields.filter(field => !transformedData[field]);
    
    if (missingFields.length > 0) {
      console.error('❌ Campos requeridos faltantes:', missingFields);
      alert('Campos requeridos faltantes: ' + missingFields.join(', '));
      return;
    }
    
    try {
      console.log('🚀 Llamando a onSave con datos transformados...');
      console.log('📤 PAYLOAD FINAL ENVIADO AL BACKEND:', JSON.stringify(transformedData, null, 2));
      
      onSave(transformedData);
      
      console.log('✅ onSave ejecutado exitosamente');
      console.log('🎯 INSTRUCCIONES PARA VER LOS DATOS GUARDADOS:');
      console.log('1. Ve a la página de Planes Nutricionales');
      console.log(`2. Busca el plan: "${transformedData.name}"`);
      console.log('3. Haz clic en "Ver Detalles"');
      console.log('4. Ve a la pestaña "🛡️ Restricciones" para ver toda la información guardada');
      console.log('🚀 === FIN PROCESO DE GUARDADO ===');
      
    } catch (error) {
      console.error('❌ ERROR AL EJECUTAR onSave:', error);
      console.error('📋 DATOS QUE SE INTENTARON ENVIAR:', transformedData);
      alert('Error al guardar el plan: ' + (error as Error).message);
    }
  };

  const updatePlanData = (field: string, value: any) => {
    setPlanData((prev: any) => {
      const newData = {
        ...prev,
        [field]: value
      };
      
      // Auto-calcular fecha de fin basándose en fecha de inicio y semanas
      if (field === 'startDate' || field === 'totalWeeks') {
        if (newData.startDate && newData.totalWeeks) {
          const startDate = new Date(newData.startDate);
          const endDate = new Date(startDate);
          endDate.setDate(startDate.getDate() + (newData.totalWeeks * 7));
          newData.endDate = endDate.toISOString().split('T')[0];
        }
      }
      
      return newData;
    });
  };

  // Obtener datos del paciente seleccionado
  const getSelectedPatient = () => {
    if (planData.patientId && patients.length > 0) {
      return patients.find(p => p.id === planData.patientId);
    }
    return patient;
  };

  // Obtener expediente clínico del paciente seleccionado
  const getSelectedPatientClinicalRecord = () => {
    const currentPatient = getSelectedPatient();
    if (!currentPatient || !clinicalRecords.length) return null;
    
    console.log('🔍 Buscando expediente para paciente:', {
      id: currentPatient.id,
      name: `${currentPatient.first_name} ${currentPatient.last_name}`,
      email: currentPatient.email,
      totalRecords: clinicalRecords.length
    });
    
    // Buscar expedientes del paciente actual por ID o por email
    const patientRecords = clinicalRecords.filter(record => {
      const matchById = record.patient?.id === currentPatient.id;
      const matchByEmail = record.patient?.email === currentPatient.email;
      
      console.log('🔍 Comparando expediente:', {
        recordPatient: `${record.patient?.first_name} ${record.patient?.last_name}`,
        recordEmail: record.patient?.email,
        recordId: record.patient?.id,
        matchById,
        matchByEmail
      });
      
      return matchById || matchByEmail;
    });
    
    console.log(`✅ Expedientes encontrados para ${currentPatient.first_name}: ${patientRecords.length}`);
    
    if (patientRecords.length === 0) return null;
    
    // Obtener el expediente más reciente
    const latestRecord = patientRecords.sort((a, b) => 
      new Date(b.record_date || b.created_at || '').getTime() - 
      new Date(a.record_date || a.created_at || '').getTime()
    )[0];
    
    console.log('📋 Expediente más reciente seleccionado:', {
      id: latestRecord.id,
      date: latestRecord.record_date,
      diagnosis: latestRecord.nutritional_diagnosis
    });
    
    return latestRecord;
  };

  const selectedPatient = getSelectedPatient();
  const clinicalRecord = getSelectedPatientClinicalRecord();

  // Debug: Log de datos disponibles
  React.useEffect(() => {
    console.log('🔍 NutritionalCardSimple - Estado actual:', {
      selectedPatient: selectedPatient ? `${selectedPatient.first_name} ${selectedPatient.last_name}` : 'null',
      totalClinicalRecords: clinicalRecords.length,
      clinicalRecord: clinicalRecord ? {
        id: clinicalRecord.id,
        patient: `${clinicalRecord.patient?.first_name} ${clinicalRecord.patient?.last_name}`,
        date: clinicalRecord.record_date,
        diagnosis: clinicalRecord.nutritional_diagnosis,
        allergies: clinicalRecord.pathological_antecedents?.allergies
      } : 'null'
    });
  }, [selectedPatient?.id, clinicalRecords.length, clinicalRecord?.id]);

  // Flag para evitar aplicación múltiple
  const [alreadyAppliedRecord, setAlreadyAppliedRecord] = React.useState<string | null>(null);

  // Aplicar recomendaciones del expediente clínico
  const applyRecommendationsFromClinicalRecord = (record: any) => {
    if (!record || mode === 'view') return;
    
    // Evitar aplicar el mismo expediente múltiples veces
    if (alreadyAppliedRecord === record.id) {
      console.log('🛑 Expediente ya aplicado, evitando duplicación:', record.id);
      return;
    }
    
    console.log('🏥 Aplicando recomendaciones del expediente clínico por primera vez...');
    setAlreadyAppliedRecord(record.id);
    setRecommendationsApplied(true);

    // Calcular calorías basándose en datos antropométricos
    if (record.anthropometric_measurements) {
      const measurements = record.anthropometric_measurements;
      let recommendedCalories = planData.dailyCaloriesTarget;

      // Cálculo básico basado en peso y altura
      if (measurements.current_weight_kg && measurements.height_m) {
        const weight = parseFloat(measurements.current_weight_kg);
        const height = parseFloat(measurements.height_m);
        
        // Fórmula Harris-Benedict simplificada (TMB básica)
        const gender = selectedPatient?.gender || selectedPatient?.user?.gender || 'male';
        const age = selectedPatient?.age || selectedPatient?.user?.age || 25;
        
        let bmr = 0;
        if (gender === 'male') {
          bmr = 88.362 + (13.397 * weight) + (4.799 * height * 100) - (5.677 * age);
        } else {
          bmr = 447.593 + (9.247 * weight) + (3.098 * height * 100) - (4.330 * age);
        }
        
        // Factor de actividad moderado (1.5)
        recommendedCalories = Math.round(bmr * 1.5);
      }

      // Aplicar solo si es creación de plan nuevo o si las calorías actuales son por defecto
      if (mode === 'create' || planData.dailyCaloriesTarget === 2000) {
        updatePlanData('dailyCaloriesTarget', recommendedCalories);
        
        // Recalcular macronutrientes basándose en las nuevas calorías
        const protein = Math.round(recommendedCalories * 0.25 / 4);
        const carbs = Math.round(recommendedCalories * 0.45 / 4);
        const fats = Math.round(recommendedCalories * 0.30 / 9);
        
        updatePlanData('dailyMacrosTarget', {
          protein,
          carbohydrates: carbs,
          fats
        });
      }
    }

    // Sugerir restricciones alimentarias basándose en diagnóstico nutricional
    if (record.nutritional_diagnosis) {
      const diagnosis = record.nutritional_diagnosis.toLowerCase();
      const existingConditions = planData.medicalConditions || '';
      
      if (diagnosis.includes('diabetes')) {
        updatePlanData('isLowSodium', true);
        const diabetesNote = 'Diabetes - Control de glucosa y carbohidratos';
        if (!existingConditions.includes(diabetesNote)) {
          const newConditions = existingConditions ? `${existingConditions}; ${diabetesNote}` : diabetesNote;
          updatePlanData('medicalConditions', newConditions);
        }
      }
      if (diagnosis.includes('hipertensión') || diagnosis.includes('hipertension')) {
        updatePlanData('isLowSodium', true);
        const htnNote = 'Hipertensión - Restricción de sodio';
        if (!existingConditions.includes(htnNote)) {
          const newConditions = existingConditions ? `${existingConditions}; ${htnNote}` : htnNote;
          updatePlanData('medicalConditions', newConditions);
        }
      }
      if (diagnosis.includes('obesidad')) {
        const obesityNote = 'Obesidad - Plan de reducción calórica';
        if (!existingConditions.includes(obesityNote)) {
          const newConditions = existingConditions ? `${existingConditions}; ${obesityNote}` : obesityNote;
          updatePlanData('medicalConditions', newConditions);
        }
      }
    }

    // Aplicar datos desde el expediente clínico usando las propiedades correctas
    console.log('📋 Procesando datos del expediente:', {
      diagnosed_diseases: record.diagnosed_diseases,
      dietary_history: record.dietary_history,
      family_medical_history: record.family_medical_history
    });

    // 1. Alergias desde dietary_history.malestar_alergia_foods
    if (record.dietary_history?.malestar_alergia_foods?.length > 0) {
      console.log('🥜 Aplicando alergias:', record.dietary_history.malestar_alergia_foods);
      updatePlanData('foodAllergies', record.dietary_history.malestar_alergia_foods.join(', '));
    }
    
    // 2. Medicamentos desde diagnosed_diseases.medications_list
    if (record.diagnosed_diseases?.medications_list?.length > 0) {
      console.log('💊 Aplicando medicamentos:', record.diagnosed_diseases.medications_list);
      updatePlanData('medications', record.diagnosed_diseases.medications_list.join(', '));
    }
    
    // 3. Condiciones médicas desde diagnosed_diseases (con prevención de duplicados)
    const medicalConditions = [];
    if (record.diagnosed_diseases?.disease_name) {
      medicalConditions.push(record.diagnosed_diseases.disease_name);
    }
    if (record.diagnosed_diseases?.important_disease_name) {
      medicalConditions.push(record.diagnosed_diseases.important_disease_name);
    }
    
    if (medicalConditions.length > 0) {
      console.log('🏥 Aplicando condiciones médicas:', medicalConditions);
      
      // Obtener condiciones existentes y limpiar duplicados
      const existingConditions = planData.medicalConditions || '';
      const existingList = existingConditions
        .split(/[;,]/)
        .map((item: string) => item.trim())
        .filter((item: string) => item.length > 0);
      
      // Agregar solo las condiciones que no existen ya
      const newConditionsToAdd = medicalConditions.filter(condition => 
        !existingList.some((existing: string) => 
          existing.toLowerCase().includes(condition.toLowerCase())
        )
      );
      
      if (newConditionsToAdd.length > 0) {
        const finalConditions = existingConditions ? 
          `${existingConditions}, ${newConditionsToAdd.join(', ')}` : 
          newConditionsToAdd.join(', ');
        updatePlanData('medicalConditions', finalConditions);
        console.log('✅ Condiciones médicas agregadas (sin duplicados):', newConditionsToAdd);
      } else {
        console.log('ℹ️ Todas las condiciones médicas ya existían, no se agregaron duplicados');
      }
    }

    // 4. Los antecedentes familiares NO van en condiciones médicas del paciente
    // Solo se usan para aplicar restricciones preventivas automáticamente
    if (record.family_medical_history) {
      const familyHistory = record.family_medical_history;
      
      // Solo aplicar restricciones automáticas basadas en antecedentes familiares
      // NO agregar los antecedentes como condiciones médicas del paciente
      if (familyHistory.diabetes || familyHistory.hta) {
        // Sugerir bajo en sodio por antecedentes de diabetes o hipertensión
        updatePlanData('isLowSodium', true);
        console.log('🧂 Activado "Bajo en Sodio" por antecedentes familiares de diabetes/hipertensión');
      }
      
      if (familyHistory.obesity) {
        // Los antecedentes de obesidad pueden sugerir un plan más conservador en calorías
        console.log('⚖️ Antecedente familiar de obesidad detectado - considerar plan preventivo');
      }
      
      console.log('👨‍👩‍👧‍👦 Antecedentes familiares procesados para recomendaciones automáticas:', {
        diabetes: familyHistory.diabetes,
        hta: familyHistory.hta,
        obesity: familyHistory.obesity,
        aplicaciones: 'Solo restricciones preventivas, no como condiciones del paciente'
      });
    }
  };

  // Resetear flag cuando cambia el paciente o modo
  React.useEffect(() => {
    setAlreadyAppliedRecord(null);
  }, [selectedPatient?.id, mode]);

  // Efecto para aplicar recomendaciones cuando cambia el expediente clínico
  React.useEffect(() => {
    if (clinicalRecord && selectedPatient && mode === 'create') {
      console.log('🏥 Aplicando recomendaciones del expediente clínico:', {
        patient: `${selectedPatient.first_name} ${selectedPatient.last_name}`,
        recordDate: clinicalRecord.record_date,
        diagnosis: clinicalRecord.nutritional_diagnosis
      });
      applyRecommendationsFromClinicalRecord(clinicalRecord);
    }
  }, [clinicalRecord?.id, selectedPatient?.id, mode]);

  return (
    <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog modal-xl">
        <div className="modal-content">
          {/* Header */}
          <div className="card-header bg-primary text-white">
            <div className="d-flex align-items-center justify-content-between">
              <h5 className="mb-0 d-flex align-items-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="me-2">
                  <path d="M8 2v4"></path>
                  <path d="M16 2v4"></path>
                  <rect width="18" height="18" x="3" y="4" rx="2"></rect>
                  <path d="M3 10h18"></path>
                </svg>
                <span>
                  {mode === 'create' ? 'Crear Plan Nutricional' : 
                   mode === 'edit' ? 'Editar Plan Nutricional' : 
                   'Ver Plan Nutricional'}
                </span>
              </h5>
              <button 
                type="button" 
                className="btn-close btn-close-white" 
                onClick={onClose}
              ></button>
            </div>
          </div>

          {/* Información del paciente */}
          <div className="modal-body p-0">
            <div className="bg-light border-bottom p-3">
              <div className="row align-items-center">
                <div className="col-md-8">
                  {selectedPatient ? (
                    <>
                      <h6 className="mb-1 text-primary">
                        👤 {selectedPatient?.user?.first_name || selectedPatient?.first_name} {selectedPatient?.user?.last_name || selectedPatient?.last_name}
                      </h6>
                      <div className="text-muted small">
                        <span className="me-3">📧 {selectedPatient?.user?.email || selectedPatient?.email}</span>
                        <span className="me-3">📞 {selectedPatient?.user?.phone || selectedPatient?.phone || 'N/A'}</span>
                        <span>🎂 {selectedPatient?.user?.age || selectedPatient?.age || 'N/A'} años</span>
                      </div>
                    </>
                  ) : (
                    <>
                      <h6 className="mb-1 text-warning">
                        ⚠️ Selecciona un paciente
                      </h6>
                      <div className="text-muted small">
                        Elige un paciente de la lista para crear su plan nutricional
                      </div>
                    </>
                  )}
                </div>
                <div className="col-md-4 text-md-end">
                  {clinicalRecord && selectedPatient && (
                    <div className="d-flex flex-column align-items-end">
                      <span className="badge bg-success mb-1">
                        📋 Expediente clínico disponible
                      </span>
                      <small className="text-muted">
                        📅 {new Date(clinicalRecord.record_date || clinicalRecord.created_at).toLocaleDateString('es-ES')}
                      </small>
                      {clinicalRecord.nutritional_diagnosis && (
                        <small className="text-success text-end" style={{ fontSize: '0.7rem' }}>
                          🎯 {clinicalRecord.nutritional_diagnosis}
                        </small>
                      )}
                    </div>
                  )}
                  {selectedPatient && !clinicalRecord && (
                    <span className="badge bg-info">
                      📋 Sin expediente clínico
                    </span>
                  )}
                  {!selectedPatient && (
                    <span className="badge bg-warning">
                      ❓ Sin paciente seleccionado
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Pestañas de navegación */}
            <ul className="nav nav-tabs mb-0" style={{ backgroundColor: '#f8f9fa' }}>
              {tabs.map(tab => (
                <li key={tab.key} className="nav-item">
                  <button 
                    className={`nav-link ${activeTab === tab.key ? 'active' : ''}`}
                    onClick={() => setActiveTab(tab.key)}
                    disabled={isLoading}
                  >
                    <span className="me-1">{tab.icon}</span>
                    {tab.label}
                  </button>
                </li>
              ))}
            </ul>

            {/* Contenido de la pestaña activa */}
            <div className="p-4" style={{ minHeight: '500px', maxHeight: '70vh', overflowY: 'auto' }}>
              {activeTab === 'summary' && (
                <div className="summary-tab">
                  <h6 className="mb-3">📋 Información General del Plan</h6>
                  
                  {clinicalRecord && selectedPatient && mode === 'create' && (
                    <div className={`alert border-0 mb-3 ${recommendationsApplied ? 'alert-success' : 'alert-info'}`}>
                      <div className="d-flex align-items-start">
                        <div className={`rounded-circle p-2 me-3 ${recommendationsApplied ? 'bg-success bg-opacity-10' : 'bg-info bg-opacity-10'}`}>
                          {recommendationsApplied ? '🏥' : '📋'}
                        </div>
                        <div className="flex-grow-1">
                          <h6 className="alert-heading mb-2">
                            {recommendationsApplied ? 'Recomendaciones Aplicadas Automáticamente' : 'Expediente Clínico Detectado'}
                          </h6>
                          <p className="mb-2 small">
                            {recommendationsApplied ? 
                              `Se han calculado automáticamente las calorías y aplicado restricciones basándose en el expediente clínico de ${selectedPatient.first_name} ${selectedPatient.last_name}.` :
                              `Se detectó un expediente clínico para ${selectedPatient.first_name} ${selectedPatient.last_name}. Las recomendaciones se aplicarán automáticamente.`
                            }
                          </p>
                          <div className="small text-muted">
                            <div className="row">
                              <div className="col-md-6">
                                📅 <strong>Fecha:</strong> {new Date(clinicalRecord.record_date || clinicalRecord.created_at).toLocaleDateString('es-ES')}
                              </div>
                              {clinicalRecord.nutritional_diagnosis && (
                                <div className="col-md-6">
                                  🎯 <strong>Diagnóstico:</strong> {clinicalRecord.nutritional_diagnosis}
                                </div>
                              )}
                            </div>
                            {clinicalRecord.anthropometric_measurements && (
                              <div className="row mt-1">
                                {clinicalRecord.anthropometric_measurements.current_weight_kg && (
                                  <div className="col-md-4">
                                    ⚖️ <strong>Peso:</strong> {clinicalRecord.anthropometric_measurements.current_weight_kg} kg
                                  </div>
                                )}
                                {clinicalRecord.anthropometric_measurements.height_m && (
                                  <div className="col-md-4">
                                    📏 <strong>Altura:</strong> {(clinicalRecord.anthropometric_measurements.height_m * 100).toFixed(0)} cm
                                  </div>
                                )}
                                {clinicalRecord.anthropometric_measurements.current_weight_kg && clinicalRecord.anthropometric_measurements.height_m && (
                                  <div className="col-md-4">
                                    📊 <strong>IMC:</strong> {(
                                      clinicalRecord.anthropometric_measurements.current_weight_kg / 
                                      (clinicalRecord.anthropometric_measurements.height_m ** 2)
                                    ).toFixed(1)}
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {selectedPatient && !clinicalRecord && mode === 'create' && (
                    <div className="alert alert-info border-0 mb-3">
                      <div className="d-flex align-items-center">
                        <div className="bg-info bg-opacity-10 rounded-circle p-2 me-3">
                          💡
                        </div>
                        <div>
                          <strong>Recomendación:</strong> Para obtener mejores cálculos nutricionales, considera crear un expediente clínico para <strong>{selectedPatient.first_name} {selectedPatient.last_name}</strong> antes del plan.
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <div className="row">
                    <div className="col-md-8">
                      {/* Información Básica */}
                      <div className="card mb-3">
                        <div className="card-header">
                          <h6 className="mb-0">📝 Datos Básicos</h6>
                        </div>
                        <div className="card-body">
                          <div className="mb-3">
                            <label className="form-label">👤 Paciente Asignado *</label>
                            
                            <select
                              className="form-select form-select-lg"
                              value={planData.patientId || patient?.id || patient?.user?.id || ''}
                              onChange={(e) => {
                                console.log('🔄 Seleccionando paciente:', e.target.value);
                                updatePlanData('patientId', e.target.value);
                              }}
                              disabled={mode === 'view' || isLoading}
                              required
                            >
                              <option value="">Seleccionar paciente...</option>
                              {patients.length > 0 ? (
                                patients.map((p) => {
                                  const patientName = `${p.first_name || p.user?.first_name || ''} ${p.last_name || p.user?.last_name || ''}`.trim();
                                  const patientAge = p.age || (p.birth_date ? new Date().getFullYear() - new Date(p.birth_date).getFullYear() : 'N/A');
                                  const patientEmail = p.email || p.user?.email || '';
                                  const genderIcon = (p.gender === 'female' || p.user?.gender === 'female') ? '👩' : 
                                                   (p.gender === 'male' || p.user?.gender === 'male') ? '👨' : '👤';
                                  
                                  console.log('👤 Paciente disponible:', { id: p.id, name: patientName, email: patientEmail });
                                  
                                  return (
                                    <option key={p.id} value={p.id}>
                                      {genderIcon} {patientName} ({patientAge} años) - {patientEmail}
                                    </option>
                                  );
                                })
                              ) : (
                                <option value="" disabled>❌ No hay pacientes disponibles</option>
                              )}
                            </select>
                            <small className="text-muted">
                              💡 Solo aparecen los pacientes asignados a ti como nutriólogo
                            </small>
                          </div>

                          <div className="mb-3">
                            <label className="form-label">Nombre del Plan *</label>
                            <input
                              type="text"
                              className="form-control"
                              value={planData.name}
                              onChange={(e) => updatePlanData('name', e.target.value)}
                              placeholder="Ej: Plan de Control de Peso - Enero 2025"
                              disabled={mode === 'view' || isLoading}
                              required
                            />
                          </div>

                          <div className="mb-3">
                            <label className="form-label">Descripción</label>
                            <textarea
                              className="form-control"
                              rows={2}
                              value={planData.description}
                              onChange={(e) => updatePlanData('description', e.target.value)}
                              placeholder="Descripción detallada del plan nutricional..."
                              disabled={mode === 'view' || isLoading}
                            />
                          </div>
                        </div>
                      </div>

                      {/* Duración y Fechas */}
                      <div className="card mb-3">
                        <div className="card-header">
                          <h6 className="mb-0">📅 Duración del Plan</h6>
                        </div>
                        <div className="card-body">
                          <div className="row">
                            <div className="col-md-6">
                              <label className="form-label">Fecha de Inicio *</label>
                              <input
                                type="date"
                                className="form-control"
                                value={planData.startDate}
                                onChange={(e) => updatePlanData('startDate', e.target.value)}
                                disabled={mode === 'view' || isLoading}
                                required
                              />
                            </div>
                            <div className="col-md-6">
                              <label className="form-label">Duración (semanas) *</label>
                              <select
                                className="form-select"
                                value={planData.totalWeeks}
                                onChange={(e) => updatePlanData('totalWeeks', parseInt(e.target.value))}
                                disabled={mode === 'view' || isLoading}
                              >
                                <option value="1">1 semana</option>
                                <option value="2">2 semanas</option>
                                <option value="3">3 semanas</option>
                                <option value="4">4 semanas (1 mes)</option>
                                <option value="6">6 semanas</option>
                                <option value="8">8 semanas (2 meses)</option>
                                <option value="12">12 semanas (3 meses)</option>
                                <option value="16">16 semanas (4 meses)</option>
                                <option value="24">24 semanas (6 meses)</option>
                              </select>
                            </div>
                          </div>
                          
                          {planData.startDate && planData.totalWeeks && (
                            <div className="mt-3 p-3 bg-light rounded">
                              <div className="row text-center">
                                <div className="col-md-4">
                                  <small className="text-muted d-block">Inicio</small>
                                  <strong className="text-success">
                                    {new Date(planData.startDate).toLocaleDateString('es-ES', { 
                                      weekday: 'short', 
                                      day: 'numeric', 
                                      month: 'short' 
                                    })}
                                  </strong>
                                </div>
                                <div className="col-md-4">
                                  <small className="text-muted d-block">Duración</small>
                                  <strong className="text-primary">
                                    {planData.totalWeeks} semana{planData.totalWeeks !== 1 ? 's' : ''}
                                    <br />
                                    <small>({planData.totalWeeks * 7} días)</small>
                                  </strong>
                                </div>
                                <div className="col-md-4">
                                  <small className="text-muted d-block">Fin</small>
                                  <strong className="text-danger">
                                    {planData.endDate && new Date(planData.endDate).toLocaleDateString('es-ES', { 
                                      weekday: 'short', 
                                      day: 'numeric', 
                                      month: 'short' 
                                    })}
                                  </strong>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Macronutrientes */}
                      <div className="card">
                        <div className="card-header">
                          <h6 className="mb-0">🎯 Objetivos Nutricionales</h6>
                        </div>
                        <div className="card-body">
                          <div className="mb-3">
                            <label className="form-label">Calorías Diarias Objetivo *</label>
                            <div className="input-group">
                              <input
                                type="number"
                                className="form-control form-control-lg"
                                value={planData.dailyCaloriesTarget}
                                onChange={(e) => updatePlanData('dailyCaloriesTarget', parseInt(e.target.value) || 0)}
                                min="1000"
                                max="5000"
                                step="50"
                                disabled={mode === 'view' || isLoading}
                              />
                              <span className="input-group-text"><strong>kcal</strong></span>
                            </div>
                          </div>

                          <div className="row">
                            <div className="col-md-4">
                              <label className="form-label text-danger">🥩 Proteínas (g) *</label>
                              <input
                                type="number"
                                className="form-control form-control-lg text-center"
                                value={planData.dailyMacrosTarget.protein}
                                onChange={(e) => updatePlanData('dailyMacrosTarget', {
                                  ...planData.dailyMacrosTarget,
                                  protein: parseInt(e.target.value) || 0
                                })}
                                min="0"
                                max="500"
                                disabled={mode === 'view' || isLoading}
                              />
                              <small className="text-muted text-center d-block">
                                {Math.round((planData.dailyMacrosTarget.protein * 4 / planData.dailyCaloriesTarget) * 100)}% del total
                              </small>
                            </div>
                            <div className="col-md-4">
                              <label className="form-label text-warning">🌾 Carbohidratos (g) *</label>
                              <input
                                type="number"
                                className="form-control form-control-lg text-center"
                                value={planData.dailyMacrosTarget.carbohydrates}
                                onChange={(e) => updatePlanData('dailyMacrosTarget', {
                                  ...planData.dailyMacrosTarget,
                                  carbohydrates: parseInt(e.target.value) || 0
                                })}
                                min="0"
                                max="1000"
                                disabled={mode === 'view' || isLoading}
                              />
                              <small className="text-muted text-center d-block">
                                {Math.round((planData.dailyMacrosTarget.carbohydrates * 4 / planData.dailyCaloriesTarget) * 100)}% del total
                              </small>
                            </div>
                            <div className="col-md-4">
                              <label className="form-label text-success">🥑 Grasas (g) *</label>
                              <input
                                type="number"
                                className="form-control form-control-lg text-center"
                                value={planData.dailyMacrosTarget.fats}
                                onChange={(e) => updatePlanData('dailyMacrosTarget', {
                                  ...planData.dailyMacrosTarget,
                                  fats: parseInt(e.target.value) || 0
                                })}
                                min="0"
                                max="300"
                                disabled={mode === 'view' || isLoading}
                              />
                              <small className="text-muted text-center d-block">
                                {Math.round((planData.dailyMacrosTarget.fats * 9 / planData.dailyCaloriesTarget) * 100)}% del total
                              </small>
                            </div>
                          </div>
                          
                          <div className="mt-3 p-2 bg-light rounded">
                            <div className="d-flex justify-content-between align-items-center">
                              <span><strong>Total Calculado:</strong></span>
                              <span className={`badge ${
                                Math.abs(((planData.dailyMacrosTarget.protein * 4) + 
                                         (planData.dailyMacrosTarget.carbohydrates * 4) + 
                                         (planData.dailyMacrosTarget.fats * 9)) - planData.dailyCaloriesTarget) <= 50 
                                ? 'bg-success' : 'bg-warning'
                              }`}>
                                {(planData.dailyMacrosTarget.protein * 4) + 
                                 (planData.dailyMacrosTarget.carbohydrates * 4) + 
                                 (planData.dailyMacrosTarget.fats * 9)} kcal
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="col-md-4">
                      <div className="card mb-3">
                        <div className="card-header">
                          <h6 className="mb-0">📊 Resumen Visual</h6>
                        </div>
                        <div className="card-body text-center">
                          <h3 className="text-primary mb-1">{planData.dailyCaloriesTarget.toLocaleString()}</h3>
                          <p className="text-muted mb-3">kcal diarias</p>
                          
                          <div className="progress mb-3" style={{ height: '25px' }}>
                            <div 
                              className="progress-bar bg-danger" 
                              style={{ 
                                width: `${(planData.dailyMacrosTarget.protein * 4 / planData.dailyCaloriesTarget) * 100}%` 
                              }}
                              title={`Proteínas: ${planData.dailyMacrosTarget.protein}g`}
                            >
                              <small className="text-white"><strong>P</strong></small>
                            </div>
                            <div 
                              className="progress-bar bg-warning" 
                              style={{ 
                                width: `${(planData.dailyMacrosTarget.carbohydrates * 4 / planData.dailyCaloriesTarget) * 100}%` 
                              }}
                              title={`Carbohidratos: ${planData.dailyMacrosTarget.carbohydrates}g`}
                            >
                              <small className="text-dark"><strong>C</strong></small>
                            </div>
                            <div 
                              className="progress-bar bg-success" 
                              style={{ 
                                width: `${(planData.dailyMacrosTarget.fats * 9 / planData.dailyCaloriesTarget) * 100}%` 
                              }}
                              title={`Grasas: ${planData.dailyMacrosTarget.fats}g`}
                            >
                              <small className="text-white"><strong>G</strong></small>
                            </div>
                          </div>
                          
                          <div className="small">
                            <div className="d-flex justify-content-between mb-1">
                              <span className="text-danger">🥩 Proteínas</span>
                              <strong>{planData.dailyMacrosTarget.protein}g</strong>
                            </div>
                            <div className="d-flex justify-content-between mb-1">
                              <span className="text-warning">🌾 Carbohidratos</span>
                              <strong>{planData.dailyMacrosTarget.carbohydrates}g</strong>
                            </div>
                            <div className="d-flex justify-content-between">
                              <span className="text-success">🥑 Grasas</span>
                              <strong>{planData.dailyMacrosTarget.fats}g</strong>
                            </div>
                          </div>
                        </div>
                      </div>

                      {selectedPatient && (
                        <div className="card">
                          <div className="card-header">
                            <h6 className="mb-0">🏥 Datos del Paciente</h6>
                          </div>
                          <div className="card-body">
                            <div className="small">
                              <div className="d-flex justify-content-between mb-1">
                                <span>Nombre:</span>
                                <strong>{selectedPatient?.user?.first_name || selectedPatient?.first_name} {selectedPatient?.user?.last_name || selectedPatient?.last_name}</strong>
                              </div>
                              <div className="d-flex justify-content-between mb-1">
                                <span>Email:</span>
                                <strong className="text-truncate" style={{ maxWidth: '120px' }}>{selectedPatient?.user?.email || selectedPatient?.email}</strong>
                              </div>
                              <div className="d-flex justify-content-between mb-1">
                                <span>Edad:</span>
                                <strong>{selectedPatient?.user?.age || selectedPatient?.age || 'N/A'} años</strong>
                              </div>
                              <div className="d-flex justify-content-between mb-1">
                                <span>Género:</span>
                                <strong>
                                  {(selectedPatient?.user?.gender || selectedPatient?.gender) === 'female' ? '👩 Femenino' : 
                                   (selectedPatient?.user?.gender || selectedPatient?.gender) === 'male' ? '👨 Masculino' : '👤 N/A'}
                                </strong>
                              </div>
                              {clinicalRecord && (
                                <>
                                  <hr className="my-2" />
                                  <div className="d-flex justify-content-between mb-1">
                                    <span>Peso:</span>
                                    <strong>{clinicalRecord.anthropometric_measurements?.current_weight_kg || 'N/A'} kg</strong>
                                  </div>
                                  <div className="d-flex justify-content-between mb-1">
                                    <span>Altura:</span>
                                    <strong>{clinicalRecord.anthropometric_measurements?.height_m ? (clinicalRecord.anthropometric_measurements.height_m * 100).toFixed(0) + ' cm' : 'N/A'}</strong>
                                  </div>
                                  <div className="d-flex justify-content-between">
                                    <span>Diagnóstico:</span>
                                    <strong>{clinicalRecord.nutritional_diagnosis || 'N/A'}</strong>
                                  </div>
                                </>
                              )}
                              {!clinicalRecord && (
                                <div className="text-center mt-2 p-2 bg-light rounded">
                                  <small className="text-muted">📋 Sin expediente clínico</small>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      )}
                      
                      <div className="mt-3">
                        <label className="form-label">Notas Adicionales</label>
                        <textarea
                          className="form-control"
                          rows={3}
                          value={planData.notes}
                          onChange={(e) => updatePlanData('notes', e.target.value)}
                          placeholder="Notas para el seguimiento..."
                          disabled={mode === 'view' || isLoading}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'meals' && (
                <div className="meals-tab">
                  <h6 className="mb-3">🍽️ Planificación de Comidas</h6>
                  
                  <div className="row">
                    <div className="col-md-8">
                      <div className="card">
                        <div className="card-header">
                          <h6 className="mb-0">📅 Estructura Semanal</h6>
                        </div>
                        <div className="card-body">
                          <div className="row">
                            <div className="col-md-6">
                              <label className="form-label">Tipo de Plan</label>
                              <select
                                className="form-select"
                                value={planData.planType || 'weekly'}
                                onChange={(e) => updatePlanData('planType', e.target.value)}
                                disabled={mode === 'view' || isLoading}
                              >
                                <option value="daily">Plan Diario</option>
                                <option value="weekly">Plan Semanal</option>
                                <option value="monthly">Plan Mensual</option>
                                <option value="custom">Personalizado</option>
                              </select>
                            </div>
                            <div className="col-md-6">
                              <label className="form-label">Duración (semanas)</label>
                              <input
                                type="number"
                                className="form-control"
                                value={planData.totalWeeks}
                                onChange={(e) => updatePlanData('totalWeeks', parseInt(e.target.value) || 1)}
                                min="1"
                                max="52"
                                disabled={mode === 'view' || isLoading}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="card mt-3">
                        <div className="card-header">
                          <h6 className="mb-0">🍽️ Comidas del Día</h6>
                        </div>
                        <div className="card-body">
                          <div className="row">
                            <div className="col-md-6">
                              <label className="form-label">Número de comidas</label>
                              <select
                                className="form-select"
                                value={planData.mealsPerDay || 5}
                                onChange={(e) => updatePlanData('mealsPerDay', parseInt(e.target.value))}
                                disabled={mode === 'view' || isLoading}
                              >
                                <option value="3">3 comidas principales</option>
                                <option value="4">4 comidas al día</option>
                                <option value="5">5 comidas (recomendado)</option>
                                <option value="6">6 comidas pequeñas</option>
                              </select>
                            </div>
                            <div className="col-md-6">
                              <label className="form-label">Distribución calórica</label>
                              <select
                                className="form-select"
                                value={planData.calorieDistribution || 'balanced'}
                                onChange={(e) => updatePlanData('calorieDistribution', e.target.value)}
                                disabled={mode === 'view' || isLoading}
                              >
                                <option value="balanced">Balanceada</option>
                                <option value="breakfast_heavy">Desayuno abundante</option>
                                <option value="lunch_heavy">Almuerzo abundante</option>
                                <option value="evening_light">Cenas ligeras</option>
                              </select>
                            </div>
                          </div>
                          
                          <div className="mt-3">
                            <h6 className="text-muted">Estructura típica de comidas:</h6>
                            <div className="row">
                              <div className="col-md-6">
                                <ul className="list-unstyled small">
                                  <li>🌅 <strong>Desayuno:</strong> 25% ({Math.round(planData.dailyCaloriesTarget * 0.25)} kcal)</li>
                                  <li>🍎 <strong>Media mañana:</strong> 10% ({Math.round(planData.dailyCaloriesTarget * 0.10)} kcal)</li>
                                  <li>🥗 <strong>Almuerzo:</strong> 35% ({Math.round(planData.dailyCaloriesTarget * 0.35)} kcal)</li>
                                </ul>
                              </div>
                              <div className="col-md-6">
                                <ul className="list-unstyled small">
                                  <li>🥨 <strong>Merienda:</strong> 10% ({Math.round(planData.dailyCaloriesTarget * 0.10)} kcal)</li>
                                  <li>🍽️ <strong>Cena:</strong> 20% ({Math.round(planData.dailyCaloriesTarget * 0.20)} kcal)</li>
                                </ul>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="col-md-4">
                      <div className="card">
                        <div className="card-header">
                          <h6 className="mb-0">⏰ Horarios Sugeridos</h6>
                        </div>
                        <div className="card-body">
                          <div className="small">
                            <div className="d-flex justify-content-between align-items-center mb-2 p-2 bg-light rounded">
                              <span>🌅 Desayuno</span>
                              <input
                                type="time"
                                className="form-control form-control-sm"
                                style={{ width: '90px' }}
                                value={planData.mealTimes?.breakfast || '07:00'}
                                onChange={(e) => updatePlanData('mealTimes', {
                                  ...planData.mealTimes,
                                  breakfast: e.target.value
                                })}
                                disabled={mode === 'view' || isLoading}
                              />
                            </div>
                            <div className="d-flex justify-content-between align-items-center mb-2 p-2 bg-light rounded">
                              <span>🍎 Media mañana</span>
                              <input
                                type="time"
                                className="form-control form-control-sm"
                                style={{ width: '90px' }}
                                value={planData.mealTimes?.midMorning || '10:00'}
                                onChange={(e) => updatePlanData('mealTimes', {
                                  ...planData.mealTimes,
                                  midMorning: e.target.value
                                })}
                                disabled={mode === 'view' || isLoading}
                              />
                            </div>
                            <div className="d-flex justify-content-between align-items-center mb-2 p-2 bg-light rounded">
                              <span>🥗 Almuerzo</span>
                              <input
                                type="time"
                                className="form-control form-control-sm"
                                style={{ width: '90px' }}
                                value={planData.mealTimes?.lunch || '13:00'}
                                onChange={(e) => updatePlanData('mealTimes', {
                                  ...planData.mealTimes,
                                  lunch: e.target.value
                                })}
                                disabled={mode === 'view' || isLoading}
                              />
                            </div>
                            <div className="d-flex justify-content-between align-items-center mb-2 p-2 bg-light rounded">
                              <span>🥨 Merienda</span>
                              <input
                                type="time"
                                className="form-control form-control-sm"
                                style={{ width: '90px' }}
                                value={planData.mealTimes?.snack || '16:00'}
                                onChange={(e) => updatePlanData('mealTimes', {
                                  ...planData.mealTimes,
                                  snack: e.target.value
                                })}
                                disabled={mode === 'view' || isLoading}
                              />
                            </div>
                            <div className="d-flex justify-content-between align-items-center mb-2 p-2 bg-light rounded">
                              <span>🍽️ Cena</span>
                              <input
                                type="time"
                                className="form-control form-control-sm"
                                style={{ width: '90px' }}
                                value={planData.mealTimes?.dinner || '19:00'}
                                onChange={(e) => updatePlanData('mealTimes', {
                                  ...planData.mealTimes,
                                  dinner: e.target.value
                                })}
                                disabled={mode === 'view' || isLoading}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'nutrition' && (
                <div className="nutrition-tab">
                  <h6 className="mb-3">🎯 Objetivos Nutricionales</h6>
                  
                  <div className="row">
                    <div className="col-md-8">
                      <div className="card">
                        <div className="card-header">
                          <h6 className="mb-0">📊 Distribución de Macronutrientes</h6>
                        </div>
                        <div className="card-body">
                          <div className="row">
                            <div className="col-md-4">
                              <label className="form-label">Proteínas (g)</label>
                              <input
                                type="number"
                                className="form-control"
                                value={planData.dailyMacrosTarget.protein}
                                onChange={(e) => updatePlanData('dailyMacrosTarget', {
                                  ...planData.dailyMacrosTarget,
                                  protein: parseInt(e.target.value) || 0
                                })}
                                min="0"
                                max="500"
                                disabled={mode === 'view' || isLoading}
                              />
                              <small className="text-muted">
                                {Math.round((planData.dailyMacrosTarget.protein * 4 / planData.dailyCaloriesTarget) * 100)}% del total
                              </small>
                            </div>
                            <div className="col-md-4">
                              <label className="form-label">Carbohidratos (g)</label>
                              <input
                                type="number"
                                className="form-control"
                                value={planData.dailyMacrosTarget.carbohydrates}
                                onChange={(e) => updatePlanData('dailyMacrosTarget', {
                                  ...planData.dailyMacrosTarget,
                                  carbohydrates: parseInt(e.target.value) || 0
                                })}
                                min="0"
                                max="1000"
                                disabled={mode === 'view' || isLoading}
                              />
                              <small className="text-muted">
                                {Math.round((planData.dailyMacrosTarget.carbohydrates * 4 / planData.dailyCaloriesTarget) * 100)}% del total
                              </small>
                            </div>
                            <div className="col-md-4">
                              <label className="form-label">Grasas (g)</label>
                              <input
                                type="number"
                                className="form-control"
                                value={planData.dailyMacrosTarget.fats}
                                onChange={(e) => updatePlanData('dailyMacrosTarget', {
                                  ...planData.dailyMacrosTarget,
                                  fats: parseInt(e.target.value) || 0
                                })}
                                min="0"
                                max="300"
                                disabled={mode === 'view' || isLoading}
                              />
                              <small className="text-muted">
                                {Math.round((planData.dailyMacrosTarget.fats * 9 / planData.dailyCaloriesTarget) * 100)}% del total
                              </small>
                            </div>
                          </div>
                          
                          <div className="mt-3">
                            <div className="d-flex justify-content-between align-items-center mb-2">
                              <span>Total calculado:</span>
                              <strong>
                                {(planData.dailyMacrosTarget.protein * 4) + 
                                 (planData.dailyMacrosTarget.carbohydrates * 4) + 
                                 (planData.dailyMacrosTarget.fats * 9)} kcal
                              </strong>
                            </div>
                            <div className="d-flex justify-content-between align-items-center">
                              <span>Objetivo diario:</span>
                              <strong>{planData.dailyCaloriesTarget} kcal</strong>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="card mt-3">
                        <div className="card-header">
                          <h6 className="mb-0">💧 Hidratación y Otros</h6>
                        </div>
                        <div className="card-body">
                          <div className="row">
                            <div className="col-md-6">
                              <label className="form-label">Agua diaria (L)</label>
                              <input
                                type="number"
                                className="form-control"
                                value={planData.waterIntake || 2.5}
                                onChange={(e) => updatePlanData('waterIntake', parseFloat(e.target.value) || 0)}
                                min="1"
                                max="5"
                                step="0.1"
                                disabled={mode === 'view' || isLoading}
                              />
                            </div>
                            <div className="col-md-6">
                              <label className="form-label">Fibra (g)</label>
                              <input
                                type="number"
                                className="form-control"
                                value={planData.fiberTarget || 25}
                                onChange={(e) => updatePlanData('fiberTarget', parseInt(e.target.value) || 0)}
                                min="10"
                                max="50"
                                disabled={mode === 'view' || isLoading}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="col-md-4">
                      <div className="card">
                        <div className="card-header">
                          <h6 className="mb-0">📈 Gráfico Visual</h6>
                        </div>
                        <div className="card-body">
                          <div className="text-center mb-3">
                            <div className="progress" style={{ height: '20px' }}>
                              <div 
                                className="progress-bar bg-danger" 
                                style={{ 
                                  width: `${(planData.dailyMacrosTarget.protein * 4 / planData.dailyCaloriesTarget) * 100}%` 
                                }}
                                title={`Proteínas: ${planData.dailyMacrosTarget.protein}g`}
                              ></div>
                              <div 
                                className="progress-bar bg-warning" 
                                style={{ 
                                  width: `${(planData.dailyMacrosTarget.carbohydrates * 4 / planData.dailyCaloriesTarget) * 100}%` 
                                }}
                                title={`Carbohidratos: ${planData.dailyMacrosTarget.carbohydrates}g`}
                              ></div>
                              <div 
                                className="progress-bar bg-success" 
                                style={{ 
                                  width: `${(planData.dailyMacrosTarget.fats * 9 / planData.dailyCaloriesTarget) * 100}%` 
                                }}
                                title={`Grasas: ${planData.dailyMacrosTarget.fats}g`}
                              ></div>
                            </div>
                          </div>
                          
                          <div className="small">
                            <div className="d-flex justify-content-between mb-2">
                              <span className="d-flex align-items-center">
                                <span className="badge bg-danger me-2" style={{ width: '12px', height: '12px' }}></span>
                                Proteínas
                              </span>
                              <span>{planData.dailyMacrosTarget.protein}g</span>
                            </div>
                            <div className="d-flex justify-content-between mb-2">
                              <span className="d-flex align-items-center">
                                <span className="badge bg-warning me-2" style={{ width: '12px', height: '12px' }}></span>
                                Carbohidratos
                              </span>
                              <span>{planData.dailyMacrosTarget.carbohydrates}g</span>
                            </div>
                            <div className="d-flex justify-content-between">
                              <span className="d-flex align-items-center">
                                <span className="badge bg-success me-2" style={{ width: '12px', height: '12px' }}></span>
                                Grasas
                              </span>
                              <span>{planData.dailyMacrosTarget.fats}g</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'schedule' && (
                <div className="schedule-tab">
                  <h6 className="mb-3">⏰ Horarios de Comidas</h6>
                  
                  <div className="row">
                    <div className="col-md-8">
                      <div className="card">
                        <div className="card-header">
                          <h6 className="mb-0">📅 Horarios Detallados</h6>
                        </div>
                        <div className="card-body">
                          <div className="row">
                            <div className="col-md-6">
                              <div className="mb-3">
                                <label className="form-label">🌅 Desayuno</label>
                                <div className="input-group">
                                  <input
                                    type="time"
                                    className="form-control"
                                    value={planData.mealTimes?.breakfast || '07:00'}
                                    onChange={(e) => updatePlanData('mealTimes', {
                                      ...planData.mealTimes,
                                      breakfast: e.target.value
                                    })}
                                    disabled={mode === 'view' || isLoading}
                                  />
                                  <span className="input-group-text">
                                    {Math.round(planData.dailyCaloriesTarget * 0.25)} kcal
                                  </span>
                                </div>
                                <small className="text-muted">Ayuno nocturno: 8-10 horas</small>
                              </div>
                              
                              <div className="mb-3">
                                <label className="form-label">🍎 Media Mañana</label>
                                <div className="input-group">
                                  <input
                                    type="time"
                                    className="form-control"
                                    value={planData.mealTimes?.midMorning || '10:00'}
                                    onChange={(e) => updatePlanData('mealTimes', {
                                      ...planData.mealTimes,
                                      midMorning: e.target.value
                                    })}
                                    disabled={mode === 'view' || isLoading}
                                  />
                                  <span className="input-group-text">
                                    {Math.round(planData.dailyCaloriesTarget * 0.10)} kcal
                                  </span>
                                </div>
                                <small className="text-muted">Intervalo: 3 horas</small>
                              </div>
                              
                              <div className="mb-3">
                                <label className="form-label">🥗 Almuerzo</label>
                                <div className="input-group">
                                  <input
                                    type="time"
                                    className="form-control"
                                    value={planData.mealTimes?.lunch || '13:00'}
                                    onChange={(e) => updatePlanData('mealTimes', {
                                      ...planData.mealTimes,
                                      lunch: e.target.value
                                    })}
                                    disabled={mode === 'view' || isLoading}
                                  />
                                  <span className="input-group-text">
                                    {Math.round(planData.dailyCaloriesTarget * 0.35)} kcal
                                  </span>
                                </div>
                                <small className="text-muted">Comida principal del día</small>
                              </div>
                            </div>
                            
                            <div className="col-md-6">
                              <div className="mb-3">
                                <label className="form-label">🥨 Merienda</label>
                                <div className="input-group">
                                  <input
                                    type="time"
                                    className="form-control"
                                    value={planData.mealTimes?.snack || '16:00'}
                                    onChange={(e) => updatePlanData('mealTimes', {
                                      ...planData.mealTimes,
                                      snack: e.target.value
                                    })}
                                    disabled={mode === 'view' || isLoading}
                                  />
                                  <span className="input-group-text">
                                    {Math.round(planData.dailyCaloriesTarget * 0.10)} kcal
                                  </span>
                                </div>
                                <small className="text-muted">Interval: 3 horas</small>
                              </div>
                              
                              <div className="mb-3">
                                <label className="form-label">🍽️ Cena</label>
                                <div className="input-group">
                                  <input
                                    type="time"
                                    className="form-control"
                                    value={planData.mealTimes?.dinner || '19:00'}
                                    onChange={(e) => updatePlanData('mealTimes', {
                                      ...planData.mealTimes,
                                      dinner: e.target.value
                                    })}
                                    disabled={mode === 'view' || isLoading}
                                  />
                                  <span className="input-group-text">
                                    {Math.round(planData.dailyCaloriesTarget * 0.20)} kcal
                                  </span>
                                </div>
                                <small className="text-muted">3 horas antes de dormir</small>
                              </div>
                              
                              <div className="mb-3">
                                <label className="form-label">🌙 Hora de Dormir</label>
                                <input
                                  type="time"
                                  className="form-control"
                                  value={planData.bedTime || '22:00'}
                                  onChange={(e) => updatePlanData('bedTime', e.target.value)}
                                  disabled={mode === 'view' || isLoading}
                                />
                                <small className="text-muted">Para calcular ayuno nocturno</small>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="col-md-4">
                      <div className="card">
                        <div className="card-header">
                          <h6 className="mb-0">📊 Análisis de Intervalos</h6>
                        </div>
                        <div className="card-body">
                          <div className="small">
                            <div className="mb-3">
                              <h6 className="text-primary mb-2">⏰ Timeline del día</h6>
                              <div className="timeline-item mb-2">
                                <div className="d-flex justify-content-between">
                                  <span>🌅 Desayuno</span>
                                  <strong>{planData.mealTimes?.breakfast || '07:00'}</strong>
                                </div>
                              </div>
                              <div className="timeline-item mb-2">
                                <div className="d-flex justify-content-between">
                                  <span>🍎 Media mañana</span>
                                  <strong>{planData.mealTimes?.midMorning || '10:00'}</strong>
                                </div>
                              </div>
                              <div className="timeline-item mb-2">
                                <div className="d-flex justify-content-between">
                                  <span>🥗 Almuerzo</span>
                                  <strong>{planData.mealTimes?.lunch || '13:00'}</strong>
                                </div>
                              </div>
                              <div className="timeline-item mb-2">
                                <div className="d-flex justify-content-between">
                                  <span>🥨 Merienda</span>
                                  <strong>{planData.mealTimes?.snack || '16:00'}</strong>
                                </div>
                              </div>
                              <div className="timeline-item mb-2">
                                <div className="d-flex justify-content-between">
                                  <span>🍽️ Cena</span>
                                  <strong>{planData.mealTimes?.dinner || '19:00'}</strong>
                                </div>
                              </div>
                            </div>
                            
                            <div className="alert alert-light p-2">
                              <h6 className="text-success mb-2">✅ Recomendaciones</h6>
                              <ul className="mb-0 ps-3 small">
                                <li>Intervalos de 3-4 horas entre comidas</li>
                                <li>Última comida 3h antes de dormir</li>
                                <li>Desayuno dentro de 1h de despertar</li>
                                <li>Hidratación constante entre comidas</li>
                              </ul>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'restrictions' && (
                <div className="restrictions-tab">
                  <h6 className="mb-3">🛡️ Restricciones y Alergias</h6>
                  
                  <div className="row">
                    <div className="col-md-8">
                      <div className="card">
                        <div className="card-header">
                          <h6 className="mb-0">🚫 Restricciones Alimentarias</h6>
                        </div>
                        <div className="card-body">
                          <div className="row">
                            <div className="col-md-6">
                              <div className="mb-3">
                                <label className="form-label">Alergias Alimentarias</label>
                                <textarea
                                  className="form-control"
                                  rows={3}
                                  value={planData.foodAllergies || ''}
                                  onChange={(e) => updatePlanData('foodAllergies', e.target.value)}
                                  placeholder="Ej: Nueces, mariscos, gluten..."
                                  disabled={mode === 'view' || isLoading}
                                />
                              </div>
                              
                              <div className="mb-3">
                                <label className="form-label">Intolerancias</label>
                                <textarea
                                  className="form-control"
                                  rows={3}
                                  value={planData.foodIntolerances || ''}
                                  onChange={(e) => updatePlanData('foodIntolerances', e.target.value)}
                                  placeholder="Ej: Lactosa, fructosa..."
                                  disabled={mode === 'view' || isLoading}
                                />
                              </div>
                            </div>
                            
                            <div className="col-md-6">
                              <div className="mb-3">
                                <label className="form-label">Condiciones Médicas</label>
                                <textarea
                                  className="form-control"
                                  rows={3}
                                  value={planData.medicalConditions || ''}
                                  onChange={(e) => updatePlanData('medicalConditions', e.target.value)}
                                  placeholder="Ej: Diabetes, hipertensión..."
                                  disabled={mode === 'view' || isLoading}
                                />
                              </div>
                              
                              <div className="mb-3">
                                <label className="form-label">Medicamentos</label>
                                <textarea
                                  className="form-control"
                                  rows={3}
                                  value={planData.medications || ''}
                                  onChange={(e) => updatePlanData('medications', e.target.value)}
                                  placeholder="Medicamentos actuales..."
                                  disabled={mode === 'view' || isLoading}
                                />
                              </div>
                            </div>
                          </div>
                          
                          <div className="row">
                            <div className="col-md-12">
                              <div className="mb-3">
                                <label className="form-label">Preferencias Dietéticas</label>
                                <div className="row">
                                  <div className="col-md-6">
                                    <div className="form-check">
                                      <input
                                        className="form-check-input"
                                        type="checkbox"
                                        checked={planData.isVegetarian || false}
                                        onChange={(e) => updatePlanData('isVegetarian', e.target.checked)}
                                        disabled={mode === 'view' || isLoading}
                                      />
                                      <label className="form-check-label">🥬 Vegetariano</label>
                                    </div>
                                    <div className="form-check">
                                      <input
                                        className="form-check-input"
                                        type="checkbox"
                                        checked={planData.isVegan || false}
                                        onChange={(e) => updatePlanData('isVegan', e.target.checked)}
                                        disabled={mode === 'view' || isLoading}
                                      />
                                      <label className="form-check-label">🌱 Vegano</label>
                                    </div>
                                    <div className="form-check">
                                      <input
                                        className="form-check-input"
                                        type="checkbox"
                                        checked={planData.isGlutenFree || false}
                                        onChange={(e) => updatePlanData('isGlutenFree', e.target.checked)}
                                        disabled={mode === 'view' || isLoading}
                                      />
                                      <label className="form-check-label">🚫 Sin Gluten</label>
                                    </div>
                                  </div>
                                  <div className="col-md-6">
                                    <div className="form-check">
                                      <input
                                        className="form-check-input"
                                        type="checkbox"
                                        checked={planData.isLactoseFree || false}
                                        onChange={(e) => updatePlanData('isLactoseFree', e.target.checked)}
                                        disabled={mode === 'view' || isLoading}
                                      />
                                      <label className="form-check-label">🥛 Sin Lactosa</label>
                                    </div>
                                    <div className="form-check">
                                      <input
                                        className="form-check-input"
                                        type="checkbox"
                                        checked={planData.isKeto || false}
                                        onChange={(e) => updatePlanData('isKeto', e.target.checked)}
                                        disabled={mode === 'view' || isLoading}
                                      />
                                      <label className="form-check-label">🥑 Cetogénico</label>
                                    </div>
                                    <div className="form-check">
                                      <input
                                        className="form-check-input"
                                        type="checkbox"
                                        checked={planData.isLowSodium || false}
                                        onChange={(e) => updatePlanData('isLowSodium', e.target.checked)}
                                        disabled={mode === 'view' || isLoading}
                                      />
                                      <label className="form-check-label">🧂 Bajo en Sodio</label>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="col-md-4">
                      <div className="card">
                        <div className="card-header">
                          <h6 className="mb-0">⚠️ Alertas de Seguridad</h6>
                        </div>
                        <div className="card-body">
                          <div className="alert alert-warning p-2">
                            <h6 className="text-warning mb-2">🚨 Importante</h6>
                            <ul className="mb-0 ps-3 small">
                              <li>Verificar todas las alergias antes de crear el plan</li>
                              <li>Consultar con médico si hay condiciones serias</li>
                              <li>Revisar interacciones medicamento-alimento</li>
                            </ul>
                          </div>
                          
                          {clinicalRecord && (
                            <div className="card">
                              <div className="card-header p-2">
                                <h6 className="mb-0 small">📋 Del Expediente Clínico</h6>
                                <small className="text-muted">
                                  📅 {new Date(clinicalRecord.record_date || clinicalRecord.created_at).toLocaleDateString('es-ES')}
                                </small>
                              </div>
                              <div className="card-body p-2 small">
                                {clinicalRecord.nutritional_diagnosis && (
                                  <div className="mb-2 p-2 bg-success bg-opacity-10 rounded">
                                    <strong className="text-success">🎯 Diagnóstico Nutricional:</strong>
                                    <div>{clinicalRecord.nutritional_diagnosis}</div>
                                  </div>
                                )}
                                
                                {clinicalRecord.dietary_history?.malestar_alergia_foods?.length > 0 && (
                                  <div className="mb-2">
                                    <strong className="text-danger">🚨 Alergias alimentarias registradas:</strong>
                                    <ul className="mb-0 ps-3">
                                      {clinicalRecord.dietary_history.malestar_alergia_foods.map((allergy: any, index: number) => (
                                        <li key={index} className="text-danger">{allergy}</li>
                                      ))}
                                    </ul>
                                  </div>
                                )}
                                
                                {(clinicalRecord.diagnosed_diseases?.disease_name || clinicalRecord.diagnosed_diseases?.important_disease_name) && (
                                  <div className="mb-2">
                                    <strong className="text-warning">⚠️ Condiciones médicas:</strong>
                                    <ul className="mb-0 ps-3">
                                      {clinicalRecord.diagnosed_diseases?.disease_name && (
                                        <li className="text-warning">{clinicalRecord.diagnosed_diseases.disease_name}</li>
                                      )}
                                      {clinicalRecord.diagnosed_diseases?.important_disease_name && (
                                        <li className="text-warning">{clinicalRecord.diagnosed_diseases.important_disease_name}</li>
                                      )}
                                    </ul>
                                  </div>
                                )}
                                
                                {clinicalRecord.diagnosed_diseases?.medications_list?.length > 0 && (
                                  <div className="mb-2">
                                    <strong className="text-info">💊 Medicamentos actuales:</strong>
                                    <ul className="mb-0 ps-3">
                                      {clinicalRecord.diagnosed_diseases.medications_list.map((med: any, index: number) => (
                                        <li key={index} className="text-info">{med}</li>
                                      ))}
                                    </ul>
                                  </div>
                                )}

                                {clinicalRecord.family_medical_history && Object.values(clinicalRecord.family_medical_history).some((value: any) => value === true || value?.length > 0) && (
                                  <div className="mb-2">
                                    <strong className="text-primary">👨‍👩‍👧‍👦 Antecedentes familiares:</strong>
                                    <ul className="mb-0 ps-3">
                                      {clinicalRecord.family_medical_history.diabetes && (
                                        <li className="text-primary">Diabetes</li>
                                      )}
                                      {clinicalRecord.family_medical_history.hta && (
                                        <li className="text-primary">Hipertensión arterial</li>
                                      )}
                                      {clinicalRecord.family_medical_history.obesity && (
                                        <li className="text-primary">Obesidad</li>
                                      )}
                                      {clinicalRecord.family_medical_history.cancer && (
                                        <li className="text-primary">Cáncer</li>
                                      )}
                                      {clinicalRecord.family_medical_history.dyslipidemia && (
                                        <li className="text-primary">Dislipidemia</li>
                                      )}
                                      {clinicalRecord.family_medical_history.other_history && (
                                        <li className="text-primary">{clinicalRecord.family_medical_history.other_history}</li>
                                      )}
                                    </ul>
                                  </div>
                                )}

                                {clinicalRecord.dietary_history?.disliked_foods?.length > 0 && (
                                  <div className="mb-2">
                                    <strong className="text-secondary">🚫 Alimentos no tolerados:</strong>
                                    <ul className="mb-0 ps-3">
                                      {clinicalRecord.dietary_history.disliked_foods.map((food: any, index: number) => (
                                        <li key={index} className="text-secondary">{food}</li>
                                      ))}
                                    </ul>
                                  </div>
                                )}
                                
                                {clinicalRecord.anthropometric_measurements && (
                                  <div className="mt-2 p-2 bg-light rounded">
                                    <strong>📏 Mediciones Antropométricas:</strong>
                                    <div className="row">
                                      {clinicalRecord.anthropometric_measurements.current_weight_kg && (
                                        <div className="col-6">
                                          <small>Peso: <strong>{clinicalRecord.anthropometric_measurements.current_weight_kg} kg</strong></small>
                                        </div>
                                      )}
                                      {clinicalRecord.anthropometric_measurements.height_m && (
                                        <div className="col-6">
                                          <small>Altura: <strong>{(clinicalRecord.anthropometric_measurements.height_m * 100).toFixed(0)} cm</strong></small>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                )}
                                
                                <div className="mt-2 p-2 bg-primary bg-opacity-10 rounded">
                                  <small className="text-primary">
                                    💡 <strong>Nota:</strong> Estos datos se han aplicado automáticamente al plan nutricional. Puedes modificarlos según sea necesario.
                                  </small>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Footer con botones de acción */}
          <div className="modal-footer">
            <div className="d-flex justify-content-between w-100">
              <div>
                {mode !== 'view' && (
                  <div className="small">
                    {(!planData.patientId || !planData.name.trim() || !planData.startDate) ? (
                      <span className="text-warning">
                        ⚠️ Completa: {!planData.patientId ? 'Paciente' : ''} 
                        {!planData.patientId && (!planData.name.trim() || !planData.startDate) ? ', ' : ''}
                        {!planData.name.trim() ? 'Nombre del Plan' : ''}
                        {!planData.name.trim() && !planData.startDate ? ', ' : ''}
                        {!planData.startDate ? 'Fecha de Inicio' : ''}
                      </span>
                    ) : (
                      <span className="text-success">
                        ✅ Listo para guardar
                      </span>
                    )}
                  </div>
                )}
              </div>
              <div>
                <button 
                  type="button" 
                  className="btn btn-secondary me-2" 
                  onClick={onClose}
                  disabled={isLoading}
                >
                  {mode === 'view' ? 'Cerrar' : 'Cancelar'}
                </button>
                {mode !== 'view' && (
                  <button 
                    type="button" 
                    className="btn btn-primary" 
                    onClick={handleSave}
                    disabled={isLoading || !planData.name.trim() || !planData.patientId || !planData.startDate}
                  >
                    {isLoading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                        Guardando...
                      </>
                    ) : (
                      <>
                        💾 {mode === 'create' ? 'Crear Plan' : 'Guardar Cambios'}
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NutritionalCardSimple; 