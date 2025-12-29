import { useState, useEffect, useMemo } from 'react';

interface UseNutritionalPlanProps {
    dietPlan?: any;
    patient: any;
    patients: any[];
    clinicalRecords: any[];
    mode: 'create' | 'edit' | 'view';
    onSave?: (planData: any) => void;
}

export const useNutritionalPlan = ({
    dietPlan,
    patient,
    patients = [],
    clinicalRecords = [],
    mode,
    onSave
}: UseNutritionalPlanProps) => {

    // === STATE MANAGEMENT ===
    const [recommendationsApplied, setRecommendationsApplied] = useState<boolean>(false);
    const [alreadyAppliedRecord, setAlreadyAppliedRecord] = useState<string | null>(null);

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
        // Nutrition Fields
        waterIntake: dietPlan?.water_intake || 2.5,
        fiberTarget: dietPlan?.fiber_target || 25,
        // Meal Fields
        planType: dietPlan?.plan_type || 'weekly',
        mealsPerDay: dietPlan?.meals_per_day || 5,
        calorieDistribution: dietPlan?.calorie_distribution || 'balanced',
        // Schedule Fields
        mealTimes: dietPlan?.meal_times || {
            breakfast: '07:00',
            midMorning: '10:00',
            lunch: '13:00',
            snack: '16:00',
            dinner: '19:00'
        },
        bedTime: dietPlan?.bed_time || '22:00',
        // Restrictions & Health - Leer desde pathological_restrictions
        foodAllergies: dietPlan?.pathological_restrictions?.allergies?.join(', ') || dietPlan?.food_allergies || '',
        foodIntolerances: dietPlan?.pathological_restrictions?.intolerances?.join(', ') || dietPlan?.food_intolerances || '',
        medicalConditions: dietPlan?.pathological_restrictions?.medical_conditions?.join(', ') || dietPlan?.medical_conditions || '',
        medications: dietPlan?.pathological_restrictions?.medications?.join(', ') || dietPlan?.medications || '',
        isVegetarian: dietPlan?.is_vegetarian || false,
        isVegan: dietPlan?.is_vegan || false,
        isGlutenFree: dietPlan?.is_gluten_free || false,
        isLactoseFree: dietPlan?.is_lactose_free || false,
        isKeto: dietPlan?.is_keto || false,
        isLowSodium: dietPlan?.is_low_sodium || false
    });

    // === HELPERS & DERIVED STATE ===

    const updatePlanData = (field: string, value: any) => {
        setPlanData((prev: any) => {
            const newData = {
                ...prev,
                [field]: value
            };

            // Auto-calculate end date based on start date and weeks
            if (newData.startDate && newData.totalWeeks) {
                if (field === 'startDate' || field === 'totalWeeks') {
                    const startDate = new Date(newData.startDate);
                    const endDate = new Date(startDate);
                    endDate.setDate(startDate.getDate() + (newData.totalWeeks * 7));
                    newData.endDate = endDate.toISOString().split('T')[0];
                }
            }
            return newData;
        });
    };

    // Derived: Selected Patient
    const selectedPatient = useMemo(() => {
        if (planData.patientId && patients.length > 0) {
            return patients.find(p => p.id === planData.patientId) || patient;
        }
        return patient;
    }, [planData.patientId, patients, patient]);

    // Derived: Relevant Clinical Record
    const relevantClinicalRecord = useMemo(() => {
        if (!selectedPatient || !clinicalRecords.length) return null;

        const patientRecords = clinicalRecords.filter(record => {
            const matchById = record.patient?.id === selectedPatient.id;
            const matchByEmail = record.patient?.email === selectedPatient.email;
            return matchById || matchByEmail;
        });

        if (patientRecords.length === 0) return null;

        // Get the most recent record
        return patientRecords.sort((a, b) =>
            new Date(b.record_date || b.created_at || '').getTime() -
            new Date(a.record_date || a.created_at || '').getTime()
        )[0];
    }, [selectedPatient, clinicalRecords]);

    // Reset applied flag when patient changes
    useEffect(() => {
        // If patient changes, allow re-application if record changes
        // (Implementation detail: dependent on how strict we want to be)
        setAlreadyAppliedRecord(null);
        setRecommendationsApplied(false);
    }, [planData.patientId]);


    // === CORE LOGIC: APPLY RECOMMENDATIONS ===

    const applyRecommendationsFromClinicalRecord = () => {
        const record = relevantClinicalRecord;
        if (!record || mode === 'view') return;

        if (alreadyAppliedRecord === record.id) {
            console.log('🛑 Expediente ya aplicado:', record.id);
            return;
        }

        console.log('🏥 Aplicando recomendaciones del expediente clínico...');
        setAlreadyAppliedRecord(record.id);
        setRecommendationsApplied(true);

        // Calculate Calories (BMR)
        if (record.anthropometric_measurements) {
            const measurements = record.anthropometric_measurements;
            let recommendedCalories = planData.dailyCaloriesTarget;

            if (measurements.current_weight_kg && measurements.height_m) {
                const weight = parseFloat(measurements.current_weight_kg);
                const height = parseFloat(measurements.height_m);
                const gender = selectedPatient?.gender || selectedPatient?.user?.gender || 'male';
                const age = selectedPatient?.age || selectedPatient?.user?.age || 25;

                let bmr = 0;
                if (gender === 'male') {
                    bmr = 88.362 + (13.397 * weight) + (4.799 * height * 100) - (5.677 * age);
                } else {
                    bmr = 447.593 + (9.247 * weight) + (3.098 * height * 100) - (4.330 * age);
                }
                recommendedCalories = Math.round(bmr * 1.5);
            }

            if (mode === 'create' || planData.dailyCaloriesTarget === 2000) {
                updatePlanData('dailyCaloriesTarget', recommendedCalories);
                updatePlanData('dailyMacrosTarget', {
                    protein: Math.round(recommendedCalories * 0.25 / 4),
                    carbohydrates: Math.round(recommendedCalories * 0.45 / 4),
                    fats: Math.round(recommendedCalories * 0.30 / 9)
                });
            }
        }

        // Suggest Restrictions
        if (record.nutritional_diagnosis) {
            const diagnosis = record.nutritional_diagnosis.toLowerCase();
            const existingConditions = planData.medicalConditions || '';
            let newConditions = existingConditions;

            const addCondition = (note: string) => {
                if (!newConditions.includes(note)) {
                    newConditions = newConditions ? `${newConditions}; ${note}` : note;
                }
            };

            if (diagnosis.includes('diabetes')) {
                updatePlanData('isLowSodium', true);
                addCondition('Diabetes - Control de glucosa y carbohidratos');
            }
            if (diagnosis.includes('hipertensión') || diagnosis.includes('hipertension')) {
                updatePlanData('isLowSodium', true);
                addCondition('Hipertensión - Restricción de sodio');
            }
            if (diagnosis.includes('obesidad')) {
                addCondition('Obesidad - Plan de reducción calórica');
            }

            if (newConditions !== existingConditions) {
                updatePlanData('medicalConditions', newConditions);
            }
        }

        // Apply specific history
        if (record.dietary_history?.malestar_alergia_foods?.length > 0) {
            updatePlanData('foodAllergies', record.dietary_history.malestar_alergia_foods.join(', '));
        }
        if (record.diagnosed_diseases?.medications_list?.length > 0) {
            updatePlanData('medications', record.diagnosed_diseases.medications_list.join(', '));
        }

        // Apply medical conditions from history
        const historyConditions = [];
        if (record.diagnosed_diseases?.disease_name) historyConditions.push(record.diagnosed_diseases.disease_name);
        if (record.diagnosed_diseases?.important_disease_name) historyConditions.push(record.diagnosed_diseases.important_disease_name);

        if (historyConditions.length > 0) {
            const existingConditions = planData.medicalConditions || '';
            // Simple duplicate check logic
            const finalConditions = existingConditions
                ? `${existingConditions}, ${historyConditions.join(', ')}`
                : historyConditions.join(', ');
            updatePlanData('medicalConditions', finalConditions);
        }

        // Family History
        if (record.family_medical_history) {
            if (record.family_medical_history.diabetes || record.family_medical_history.hta) {
                updatePlanData('isLowSodium', true);
            }
        }
    };

    // === CORE LOGIC: SAVE HANDLER ===

    const handleSave = () => {
        if (!onSave) {
            alert('Error: Función de guardado no disponible');
            return;
        }

        // Validation
        if (!planData.patientId) { alert('Por favor selecciona un paciente'); return; }
        if (!planData.name?.trim()) { alert('Por favor ingresa un nombre para el plan'); return; }
        if (!planData.startDate) { alert('Por favor selecciona una fecha de inicio'); return; }

        // Build Pathological Restrictions - Formato simple que espera el backend
        const pathologicalRestrictions = {
            medical_conditions: planData.medicalConditions
                ? planData.medicalConditions.split(',').map((c: string) => c.trim()).filter(Boolean)
                : [],
            allergies: planData.foodAllergies
                ? planData.foodAllergies.split(',').map((a: string) => a.trim()).filter(Boolean)
                : [],
            intolerances: planData.foodIntolerances
                ? planData.foodIntolerances.split(',').map((i: string) => i.trim()).filter(Boolean)
                : [],
            medications: planData.medications
                ? planData.medications.split(',').map((m: string) => m.trim()).filter(Boolean)
                : [],
            special_considerations: [
                ...(planData.isVegetarian ? ['Dieta vegetariana'] : []),
                ...(planData.isVegan ? ['Dieta vegana'] : []),
                ...(planData.isGlutenFree ? ['Sin gluten'] : []),
                ...(planData.isLactoseFree ? ['Sin lactosa'] : []),
                ...(planData.isKeto ? ['Dieta cetogénica'] : []),
                ...(planData.isLowSodium ? ['Bajo en sodio'] : [])
            ],
            emergency_contacts: []
        };

        // Smart Data Generation
        const mealFrequency = {
            breakfast: true,
            morning_snack: (planData.mealsPerDay || 3) >= 4,
            lunch: true,
            afternoon_snack: (planData.mealsPerDay || 3) >= 5,
            dinner: true,
            evening_snack: (planData.mealsPerDay || 3) >= 6
        };

        const mealTiming = planData.mealTimes ? {
            breakfast_time: planData.mealTimes.breakfast || '08:00',
            lunch_time: planData.mealTimes.lunch || '13:00',
            dinner_time: planData.mealTimes.dinner || '19:00',
            snack_times: [
                mealFrequency.morning_snack ? (planData.mealTimes.midMorning || '10:00') : null,
                mealFrequency.afternoon_snack ? (planData.mealTimes.snack || '16:00') : null
            ].filter(Boolean) as string[],
            bed_time: planData.bedTime || '22:00'
        } : {
            breakfast_time: '08:00', lunch_time: '13:00', dinner_time: '19:00',
            snack_times: [
                mealFrequency.morning_snack ? '10:30' : null,
                mealFrequency.afternoon_snack ? '16:00' : null
            ].filter(Boolean) as string[],
            bed_time: planData.bedTime || '22:00'
        };

        const nutritionalGoals = {
            water_intake_liters: planData.waterIntake || 2.5,
            fiber_target_grams: planData.fiberTarget || 25,
            calorie_distribution: planData.calorieDistribution || 'balanced',
            meals_per_day: planData.mealsPerDay || 3
        };

        const flexibilitySettings = {
            allow_meal_swapping: true,
            allow_portion_adjustment: true,
            allow_food_substitution: !planData.foodAllergies && !planData.medicalConditions,
            cheat_days_per_week: planData.isKeto ? 0 : 1,
            free_meals_per_week: 2
        };

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
                meals: [],
                notes: `Semana ${week} - Plan generado automáticamente`
            });
        }

        // Construct DTO
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
            weeklyPlans: weeklyPlans,
            planType: planData.planType,
            planPeriod: planData.planPeriod,
            totalPeriods: planData.totalPeriods,
            pathologicalRestrictions,
            mealFrequency,
            mealTiming,
            nutritionalGoals,
            flexibilitySettings
        };

        // Filter undefined
        const transformedData = Object.fromEntries(
            Object.entries(allowedFields).filter(([_, value]) => value !== undefined && value !== null && value !== '')
        );

        try {
            onSave(transformedData);
        } catch (error) {
            console.error('Error saving plan:', error);
            alert('Error al guardar el plan');
        }
    };

    return {
        planData,
        updatePlanData,
        handleSave,
        activeTab: 'summary', // Note: Managing activeTab locally in component might be better if it doesn't affect logic
        selectedPatient,
        relevantClinicalRecord, // 'clinicalRecord' in the component
        recommendationsApplied,
        applyRecommendationsFromClinicalRecord
    };
};
