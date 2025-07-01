// src/modules/diet_plans/diet_plan.service.ts
import { Repository } from 'typeorm';
import { AppDataSource } from '../../database/data-source';
import { User } from '../../database/entities/user.entity';
import { DietPlan, DietPlanStatus } from '../../database/entities/diet_plan.entity';
import { Meal } from '../../database/entities/meal.entity';
import { MealItem } from '../../database/entities/meal_item.entity';
import { Food } from '../../database/entities/food.entity';
import { PatientNutritionistRelation, RelationshipStatus } from '../../database/entities/patient_nutritionist_relation.entity';
import {
    CreateDietPlanDto,
    UpdateDietPlanDto,
    MealDto,
    MealItemDto,
    GenerateDietPlanAiDto,
    WeeklyPlanDto,
    AddWeekToPlanDto,
} from '../../modules/diet_plans/diet_plan.dto';
import { AppError } from '../../utils/app.error';
import { RoleName } from '../../database/entities/role.entity';
import { PatientProfile } from '../../database/entities/patient_profile.entity';

class DietPlanService {
    private dietPlanRepository: Repository<DietPlan>;
    private mealRepository: Repository<Meal>;
    private mealItemRepository: Repository<MealItem>;
    private foodRepository: Repository<Food>;
    private userRepository: Repository<User>;
    private patientProfileRepository: Repository<PatientProfile>;
    private relationRepository: Repository<PatientNutritionistRelation>;

    constructor() {
        this.dietPlanRepository = AppDataSource.getRepository(DietPlan);
        this.mealRepository = AppDataSource.getRepository(Meal);
        this.mealItemRepository = AppDataSource.getRepository(MealItem);
        this.foodRepository = AppDataSource.getRepository(Food);
        this.userRepository = AppDataSource.getRepository(User);
        this.patientProfileRepository = AppDataSource.getRepository(PatientProfile);
        this.relationRepository = AppDataSource.getRepository(PatientNutritionistRelation);
    }

    // --- Utilidades para fechas semanales ---
    private calculateWeekDates(startDate: string, weekNumber: number): { startDate: string; endDate: string } {
        const start = new Date(startDate);
        const weekStart = new Date(start);
        weekStart.setDate(start.getDate() + (weekNumber - 1) * 7);
        
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 6);
        
        return {
            startDate: weekStart.toISOString().split('T')[0],
            endDate: weekEnd.toISOString().split('T')[0]
        };
    }

    // --- Lógica de IA (Simulación Inicial) ---
    private async generateBasicDietPlanMeals(
        patientId: string,
        nutritionistId: string,
        notesForAI?: string
    ): Promise<MealDto[]> {
        const patient = await this.userRepository.findOne({
            where: { id: patientId },
            relations: ['patient_profile'],
        });

        if (!patient || !patient.patient_profile) {
            throw new AppError('Perfil de paciente no encontrado para generar la dieta.', 404);
        }

        const profile = patient.patient_profile;
        const patientGoals = profile.goals || [];
        const patientAllergies = profile.allergies || [];
        const patientDietaryPreferences = profile.dietary_preferences || [];
        const patientBudget = profile.monthly_budget || 0;
        const patientActivityLevel = profile.activity_level || 'sedentario';

        const availableFoods = await this.foodRepository.find({
            take: 10,
            order: { name: 'ASC' },
        });

        if (availableFoods.length === 0) {
            throw new AppError('No hay alimentos disponibles para generar un plan de dieta. Asegúrate de crear algunos primero.', 500);
        }

        const meals: MealDto[] = [];
        const mealNames = ['Desayuno', 'Colación AM', 'Almuerzo', 'Colación PM', 'Cena'];

        for (let i = 0; i < mealNames.length; i++) {
            const mealItems: MealItemDto[] = [];
            const foodCount = Math.floor(Math.random() * 2) + 1;

            for (let j = 0; j < foodCount; j++) {
                const randomFood = availableFoods[Math.floor(Math.random() * availableFoods.length)];
                let quantity: number;
                if (randomFood.unit === 'unidad') {
                    quantity = Math.floor(Math.random() * 3) + 1; // 1, 2 o 3 unidades
                } else {
                    quantity = Math.floor(Math.random() * 200) + 50; // 50-250 gramos/ml
                }

                mealItems.push({
                    foodId: randomFood.id,
                    quantity: quantity,
                });
            }

            if (mealItems.length > 0) {
                meals.push({
                    name: mealNames[i],
                    order: i + 1,
                    mealItems: mealItems,
                });
            }
        }

        return meals;
    }

    // --- Generación de plan semanal con IA ---
    private async generateWeeklyPlanWithAI(
        patientId: string,
        weekNumber: number,
        startDate: string,
        dailyCalories: number,
        goal: string,
        dietaryRestrictions?: string[],
        allergies?: string[],
        preferredFoods?: string[],
        dislikedFoods?: string[]
    ): Promise<WeeklyPlanDto> {
        const weekDates = this.calculateWeekDates(startDate, weekNumber);
        
        // Calcular macros basados en calorías y objetivo
        let proteinRatio = 0.3; // 30% por defecto
        let carbsRatio = 0.45;  // 45% por defecto
        let fatsRatio = 0.25;   // 25% por defecto

        // Ajustar ratios según el objetivo
        switch (goal) {
            case 'weight_loss':
                proteinRatio = 0.35; // Más proteína para preservar músculo
                carbsRatio = 0.35;
                fatsRatio = 0.30;
                break;
            case 'muscle_gain':
                proteinRatio = 0.40; // Mucha más proteína
                carbsRatio = 0.40;
                fatsRatio = 0.20;
                break;
            case 'weight_gain':
                proteinRatio = 0.25;
                carbsRatio = 0.50; // Más carbohidratos
                fatsRatio = 0.25;
                break;
        }

        const dailyMacros = {
            protein: Math.round(dailyCalories * proteinRatio / 4),
            carbohydrates: Math.round(dailyCalories * carbsRatio / 4),
            fats: Math.round(dailyCalories * fatsRatio / 9)
        };

        // Generar comidas para cada día de la semana
        const meals: any[] = [];
        const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
        const mealTypes = ['breakfast', 'lunch', 'dinner', 'snack'];

        for (const day of days) {
            for (const mealType of mealTypes) {
                // Generar 2-4 alimentos por comida
                const foodCount = Math.floor(Math.random() * 3) + 2;
                const foods: any[] = [];

                for (let i = 0; i < foodCount; i++) {
                    // Simular alimentos (en producción esto vendría de la base de datos)
                    const mockFoods = [
                        { id: 'food-1', name: 'Pollo', calories: 165, protein: 31, carbs: 0, fats: 3.6 },
                        { id: 'food-2', name: 'Arroz integral', calories: 111, protein: 2.6, carbs: 23, fats: 0.9 },
                        { id: 'food-3', name: 'Brócoli', calories: 34, protein: 2.8, carbs: 7, fats: 0.4 },
                        { id: 'food-4', name: 'Aguacate', calories: 160, protein: 2, carbs: 9, fats: 15 },
                        { id: 'food-5', name: 'Huevo', calories: 70, protein: 6, carbs: 0.6, fats: 5 },
                        { id: 'food-6', name: 'Avena', calories: 68, protein: 2.4, carbs: 12, fats: 1.4 },
                        { id: 'food-7', name: 'Salmón', calories: 208, protein: 25, carbs: 0, fats: 12 },
                        { id: 'food-8', name: 'Quinoa', calories: 120, protein: 4.4, carbs: 22, fats: 1.9 }
                    ];

                    const randomFood = mockFoods[Math.floor(Math.random() * mockFoods.length)];
                    const quantity = Math.floor(Math.random() * 150) + 50; // 50-200g
                    
                    foods.push({
                        foodId: randomFood.id,
                        foodName: randomFood.name,
                        quantityGrams: quantity,
                        calories: Math.round((randomFood.calories * quantity) / 100),
                        protein: Math.round((randomFood.protein * quantity) / 100),
                        carbs: Math.round((randomFood.carbs * quantity) / 100),
                        fats: Math.round((randomFood.fats * quantity) / 100)
                    });
                }

                meals.push({
                    day,
                    mealType,
                    foods,
                    notes: `${mealType} para ${day}`
                });
            }
        }

        return {
            weekNumber,
            startDate: weekDates.startDate,
            endDate: weekDates.endDate,
            dailyCaloriesTarget: dailyCalories,
            dailyMacrosTarget: dailyMacros,
            meals,
            notes: `Semana ${weekNumber} generada por IA - Objetivo: ${goal}`
        };
    }

    // --- Métodos de CRUD para Diet Plans ---

    // Crear un plan de dieta semanal
    public async createDietPlan(dietPlanDto: CreateDietPlanDto, nutritionistId: string) {
        const nutritionist = await this.userRepository.findOne({
            where: { id: nutritionistId, role: { name: RoleName.NUTRITIONIST } },
        });
        if (!nutritionist) {
            throw new AppError('Nutriólogo no encontrado o no autorizado.', 403);
        }

        const patient = await this.userRepository.findOne({
            where: { id: dietPlanDto.patientId, role: { name: RoleName.PATIENT } },
        });
        if (!patient) {
            throw new AppError('Paciente no encontrado.', 404);
        }

        const activeRelation = await this.relationRepository.findOne({
            where: {
                patient: { id: patient.id },
                nutritionist: { id: nutritionist.id },
                status: RelationshipStatus.ACTIVE,
            },
        });
        if (!activeRelation) {
            throw new AppError('El nutriólogo no está vinculado activamente con este paciente.', 403);
        }

        // Calcular macros si no están definidos
        let dailyMacros = dietPlanDto.dailyMacrosTarget;
        if (dietPlanDto.dailyCaloriesTarget && (!dailyMacros?.protein || !dailyMacros?.carbohydrates || !dailyMacros?.fats)) {
            const calories = dietPlanDto.dailyCaloriesTarget;
            dailyMacros = {
                protein: Math.round(calories * 0.3 / 4), // 30% proteínas
                carbohydrates: Math.round(calories * 0.45 / 4), // 45% carbohidratos
                fats: Math.round(calories * 0.25 / 9) // 25% grasas
            };
        }

        const newDietPlan = this.dietPlanRepository.create({
            name: dietPlanDto.name,
            description: dietPlanDto.description,
            patient: patient,
            nutritionist: nutritionist,
            notes: dietPlanDto.notes,
            start_date: new Date(dietPlanDto.startDate),
            end_date: new Date(dietPlanDto.endDate),
            daily_calories_target: dietPlanDto.dailyCaloriesTarget,
            daily_macros_target: dailyMacros,
            generated_by_ia: dietPlanDto.generatedByIA || false,
            ia_version: dietPlanDto.iaVersion,
            status: DietPlanStatus.DRAFT,
            // Campos para plan semanal
            is_weekly_plan: dietPlanDto.isWeeklyPlan || true,
            total_weeks: dietPlanDto.totalWeeks || 1,
            weekly_plans: dietPlanDto.weeklyPlans || [],
            // Restricciones patológicas - Normalizar nombres de campos
            pathological_restrictions: dietPlanDto.pathologicalRestrictions ? {
                medical_conditions: dietPlanDto.pathologicalRestrictions.medical_conditions || dietPlanDto.pathologicalRestrictions.medicalConditions || [],
                allergies: dietPlanDto.pathologicalRestrictions.allergies || [],
                intolerances: dietPlanDto.pathologicalRestrictions.intolerances || [],
                medications: dietPlanDto.pathologicalRestrictions.medications || [],
                special_considerations: dietPlanDto.pathologicalRestrictions.special_considerations || dietPlanDto.pathologicalRestrictions.specialConsiderations || [],
                emergency_contacts: dietPlanDto.pathologicalRestrictions.emergency_contacts || dietPlanDto.pathologicalRestrictions.emergencyContacts || []
            } : null,
            // === NUEVOS CAMPOS PARA COMPLETAR TABS ===
            meal_frequency: dietPlanDto.mealFrequency || null,
            meal_timing: dietPlanDto.mealTiming || null,
            nutritional_goals: dietPlanDto.nutritionalGoals || null,
            flexibility_settings: dietPlanDto.flexibilitySettings || null
        });

        // Guardar el plan
        await this.dietPlanRepository.save(newDietPlan);

        // Si hay planes semanales, procesarlos y normalizar nombres de campos
        if (dietPlanDto.weeklyPlans && dietPlanDto.weeklyPlans.length > 0) {
            // Normalizar nombres de campos de snake_case a estructura interna
            const normalizedWeeklyPlans = dietPlanDto.weeklyPlans.map(plan => ({
                week_number: plan.week_number || plan.weekNumber,
                start_date: plan.start_date || plan.startDate,
                end_date: plan.end_date || plan.endDate,
                daily_calories_target: plan.daily_calories_target || plan.dailyCaloriesTarget,
                daily_macros_target: plan.daily_macros_target || plan.dailyMacrosTarget,
                meals: plan.meals || [],
                notes: plan.notes
            }));
            
            newDietPlan.weekly_plans = normalizedWeeklyPlans;
            await this.dietPlanRepository.save(newDietPlan);
        }

        // Procesar comidas tradicionales si existen (para compatibilidad)
        if (dietPlanDto.meals && dietPlanDto.meals.length > 0) {
            newDietPlan.meals = [];
            for (const mealDto of dietPlanDto.meals) {
                const newMeal = this.mealRepository.create({
                    name: mealDto.name,
                    order: mealDto.order,
                    diet_plan: newDietPlan,
                });
                await this.mealRepository.save(newMeal);

                newMeal.meal_items = [];
                for (const itemDto of mealDto.mealItems) {
                    const food = await this.foodRepository.findOneBy({ id: itemDto.foodId });
                    if (!food) {
                        throw new AppError(`Alimento con ID ${itemDto.foodId} no encontrado.`, 404);
                    }
                    const newMealItem = this.mealItemRepository.create({
                        food: food,
                        quantity: itemDto.quantity,
                        meal: newMeal,
                    });
                    await this.mealItemRepository.save(newMealItem);
                    newMeal.meal_items.push(newMealItem);
                }
                const savedMeal = await this.mealRepository.findOne({
                    where: { id: newMeal.id },
                    relations: ['meal_items', 'meal_items.food'],
                });
                newDietPlan.meals.push(savedMeal!);
            }
        }

        // Recargar el plan completo
        const savedPlan = await this.dietPlanRepository.findOne({
            where: { id: newDietPlan.id },
            relations: [
                'patient',
                'nutritionist',
                'meals',
                'meals.meal_items',
                'meals.meal_items.food',
            ],
        });
        return savedPlan;
    }

    // Generar plan de dieta con IA
    public async generateDietPlanByAI(generateDto: GenerateDietPlanAiDto, nutritionistId: string) {
        const nutritionist = await this.userRepository.findOne({
            where: { id: nutritionistId, role: { name: RoleName.NUTRITIONIST } },
        });
        if (!nutritionist) {
            throw new AppError('Nutriólogo no encontrado o no autorizado.', 403);
        }

        const patient = await this.userRepository.findOne({
            where: { id: generateDto.patientId, role: { name: RoleName.PATIENT } },
        });
        if (!patient) {
            throw new AppError('Paciente no encontrado.', 404);
        }

        const activeRelation = await this.relationRepository.findOne({
            where: {
                patient: { id: patient.id },
                nutritionist: { id: nutritionist.id },
                status: RelationshipStatus.ACTIVE,
            },
        });
        if (!activeRelation) {
            throw new AppError('El nutriólogo no está vinculado activamente con este paciente.', 403);
        }

        // Calcular calorías diarias si no se proporcionan
        let dailyCalories = generateDto.dailyCaloriesTarget;
        if (!dailyCalories) {
            // Calcular basado en perfil del paciente
            const patientProfile = await this.patientProfileRepository.findOne({
                where: { user: { id: patient.id } }
            });
            
            if (patientProfile) {
                const weight = patientProfile.current_weight || 70;
                const height = patientProfile.height || 170;
                const age = 30;
                const activityLevel = patientProfile.activity_level || 'sedentario';
                
                // Fórmula básica de Harris-Benedict
                let bmr = 88.362 + (13.397 * weight) + (4.799 * height) - (5.677 * age);
                
                // Ajustar por nivel de actividad
                const activityMultipliers = {
                    'sedentario': 1.2,
                    'ligero': 1.375,
                    'moderado': 1.55,
                    'activo': 1.725,
                    'muy_activo': 1.9
                };
                
                const multiplier = activityMultipliers[activityLevel as keyof typeof activityMultipliers] || 1.2;
                dailyCalories = Math.round(bmr * multiplier);
                
                // Ajustar según objetivo
                switch (generateDto.goal) {
                    case 'weight_loss':
                        dailyCalories = Math.round(dailyCalories * 0.85); // 15% déficit
                        break;
                    case 'weight_gain':
                        dailyCalories = Math.round(dailyCalories * 1.15); // 15% superávit
                        break;
                    case 'muscle_gain':
                        dailyCalories = Math.round(dailyCalories * 1.1); // 10% superávit
                        break;
                }
            } else {
                dailyCalories = 2000; // Valor por defecto
            }
        }

        // Crear el plan base
        const createDto: CreateDietPlanDto = {
            name: generateDto.name,
            patientId: generateDto.patientId,
            description: `Plan generado por IA - Objetivo: ${generateDto.goal}`,
            startDate: generateDto.startDate,
            endDate: generateDto.endDate,
            dailyCaloriesTarget: dailyCalories,
            notes: generateDto.notesForAI,
            isWeeklyPlan: true,
            totalWeeks: generateDto.totalWeeks,
            generatedByIA: true,
            iaVersion: '1.0',
            weeklyPlans: []
        };

        // Generar planes semanales
        const weeklyPlans: WeeklyPlanDto[] = [];
        for (let week = 1; week <= generateDto.totalWeeks; week++) {
            const weeklyPlan = await this.generateWeeklyPlanWithAI(
                generateDto.patientId,
                week,
                generateDto.startDate,
                dailyCalories,
                generateDto.goal,
                generateDto.dietaryRestrictions,
                generateDto.allergies,
                generateDto.preferredFoods,
                generateDto.dislikedFoods
            );
            weeklyPlans.push(weeklyPlan);
        }

        createDto.weeklyPlans = weeklyPlans;

        // Crear el plan usando el método existente
        return await this.createDietPlan(createDto, nutritionistId);
    }

    // Agregar una semana a un plan existente
    public async addWeekToPlan(dietPlanId: string, weekData: WeeklyPlanDto, nutritionistId: string) {
        const dietPlan = await this.dietPlanRepository.findOne({
            where: { id: dietPlanId },
            relations: ['nutritionist']
        });

        if (!dietPlan) {
            throw new AppError('Plan de dieta no encontrado.', 404);
        }

        if (dietPlan.nutritionist.id !== nutritionistId) {
            throw new AppError('No tienes permisos para modificar este plan de dieta.', 403);
        }

        // Verificar que la semana no exista ya
        const existingWeeks = dietPlan.weekly_plans || [];
        const weekExists = existingWeeks.some(week => week.weekNumber === weekData.weekNumber);
        
        if (weekExists) {
            throw new AppError(`La semana ${weekData.weekNumber} ya existe en este plan.`, 400);
        }

        // Agregar la nueva semana
        existingWeeks.push(weekData);
        dietPlan.weekly_plans = existingWeeks;
        dietPlan.total_weeks = existingWeeks.length;

        await this.dietPlanRepository.save(dietPlan);

        return await this.getDietPlanById(dietPlanId, nutritionistId, RoleName.NUTRITIONIST);
    }

    // Obtener un plan de dieta por ID (Nutriólogo, Paciente, Admin)
    public async getDietPlanById(dietPlanId: string, userId: string, userRole: RoleName) {
        const dietPlan = await this.dietPlanRepository.findOne({
            where: { id: dietPlanId },
            relations: [
                'patient',
                'nutritionist',
                'meals',
                'meals.meal_items',
                'meals.meal_items.food',
            ],
        });

        if (!dietPlan) {
            throw new AppError('Plan de dieta no encontrado.', 404);
        }

        if (userRole === RoleName.NUTRITIONIST && dietPlan.nutritionist.id !== userId) {
            throw new AppError('No tienes permiso para ver este plan de dieta.', 403);
        }
        if (userRole === RoleName.PATIENT && dietPlan.patient.id !== userId) {
            throw new AppError('No tienes permiso para ver este plan de dieta.', 403);
        }

        const { password_hash: patientHash, ...patientWithoutHash } = dietPlan.patient;
        const { password_hash: nutritionistHash, ...nutritionistWithoutHash } = dietPlan.nutritionist;

        return {
            ...dietPlan,
            patient: patientWithoutHash,
            nutritionist: nutritionistWithoutHash,
        };
    }

    // Obtener planes de dieta de un paciente específico (solo por su nutriólogo o admin)
    public async getDietPlansForPatient(patientId: string, userId: string, callerRole: RoleName) {
        // Si es un paciente, verificar que esté viendo sus propios planes
        if (callerRole === RoleName.PATIENT) {
            if (patientId !== userId) {
                throw new AppError('No tienes permiso para ver los planes de otro paciente.', 403);
            }
        }
        // Si es un nutriólogo, verificar que esté vinculado con el paciente
        else if (callerRole === RoleName.NUTRITIONIST) {
            const relation = await this.relationRepository.findOne({
                where: {
                    patient: { id: patientId },
                    nutritionist: { id: userId },
                    status: RelationshipStatus.ACTIVE,
                },
            });
            if (!relation) {
                throw new AppError('No estás vinculado con este paciente o no tienes permiso para ver sus planes.', 403);
            }
        }
        // Los administradores pueden ver todos los planes

        const dietPlans = await this.dietPlanRepository.find({
            where: { patient: { id: patientId } },
            relations: [
                'patient',
                'nutritionist',
                'meals',
                'meals.meal_items',
                'meals.meal_items.food',
            ],
            order: { start_date: 'DESC' },
        });

        return dietPlans.map(plan => {
            const { password_hash: patientHash, ...patientWithoutHash } = plan.patient;
            const { password_hash: nutritionistHash, ...nutritionistWithoutHash } = plan.nutritionist;
            return {
                ...plan,
                patient: patientWithoutHash,
                nutritionist: nutritionistWithoutHash,
            };
        });
    }

    // Obtener todos los planes de dieta de un nutriólogo
    public async getDietPlansForNutritionist(nutritionistId: string) {
        const dietPlans = await this.dietPlanRepository.find({
            where: { nutritionist: { id: nutritionistId } },
            relations: [
                'patient',
                'nutritionist',
                'meals',
                'meals.meal_items',
                'meals.meal_items.food',
            ],
            order: { created_at: 'DESC' },
        });

        return dietPlans.map(plan => {
            const { password_hash: patientHash, ...patientWithoutHash } = plan.patient;
            const { password_hash: nutritionistHash, ...nutritionistWithoutHash } = plan.nutritionist;
            return {
                ...plan,
                patient: patientWithoutHash,
                nutritionist: nutritionistWithoutHash,
            };
        });
    }

    // Actualizar un plan de dieta (Nutriólogo)
    public async updateDietPlan(dietPlanId: string, updateDto: UpdateDietPlanDto, nutritionistId: string) {
        const dietPlan = await this.dietPlanRepository.findOne({
            where: { id: dietPlanId, nutritionist: { id: nutritionistId } },
            relations: ['meals', 'meals.meal_items', 'meals.meal_items.food'],
        });

        if (!dietPlan) {
            throw new AppError('Plan de dieta no encontrado o no autorizado para actualizar.', 404);
        }

        if (dietPlan.status === DietPlanStatus.ACTIVE && updateDto.status !== DietPlanStatus.ARCHIVED && updateDto.status !== DietPlanStatus.DRAFT) {
            throw new AppError('No se puede modificar un plan de dieta activo directamente. Cambie su estado a DRAFT o ARCHIVED primero.', 400);
        }
        if (dietPlan.status === DietPlanStatus.ARCHIVED && updateDto.status !== DietPlanStatus.DRAFT) { // Permitir desarchivar a borrador
            throw new AppError('No se puede modificar un plan de dieta archivado directamente (solo cambiar a DRAFT).', 400);
        }


        if (updateDto.name !== undefined) dietPlan.name = updateDto.name;
        if (updateDto.description !== undefined) dietPlan.description = updateDto.description;
        if (updateDto.notes !== undefined) dietPlan.notes = updateDto.notes;
        if (updateDto.startDate !== undefined) dietPlan.start_date = new Date(updateDto.startDate);
        if (updateDto.endDate !== undefined) dietPlan.end_date = new Date(updateDto.endDate);
        if (updateDto.dailyCaloriesTarget !== undefined) dietPlan.daily_calories_target = updateDto.dailyCaloriesTarget;
        if (updateDto.isWeeklyPlan !== undefined) dietPlan.is_weekly_plan = updateDto.isWeeklyPlan;
        if (updateDto.totalWeeks !== undefined) dietPlan.total_weeks = updateDto.totalWeeks;
        if (updateDto.weeklyPlans !== undefined) dietPlan.weekly_plans = updateDto.weeklyPlans;

        if (updateDto.dailyMacrosTarget !== undefined) {
            const { protein, carbohydrates, fats } = updateDto.dailyMacrosTarget;
            if (
                protein !== undefined &&
                carbohydrates !== undefined &&
                fats !== undefined
            ) {
                dietPlan.daily_macros_target = { protein, carbohydrates, fats };
            } else {
                throw new AppError('Todos los valores de macronutrientes (proteína, carbohidratos, grasas) deben estar definidos.', 400);
            }
        }
        if (updateDto.status !== undefined) dietPlan.status = updateDto.status;

        // Lógica para actualizar comidas/items (complejo, solo permitir para planes DRAFT o PENDING_REVIEW)
        if (updateDto.meals !== undefined) {
            if (dietPlan.status !== DietPlanStatus.DRAFT && dietPlan.status !== DietPlanStatus.PENDING_REVIEW) {
                throw new AppError('La actualización detallada de comidas solo está permitida para planes en borrador o pendientes de revisión.', 400);
            }
            
            // Guardar el plan primero para asegurar que existe
            await this.dietPlanRepository.save(dietPlan);
            
            // Eliminar comidas e ítems existentes para recrearlos
            if (dietPlan.meals && dietPlan.meals.length > 0) {
                for (const meal of dietPlan.meals) {
                    if (meal.meal_items && meal.meal_items.length > 0) {
                        await this.mealItemRepository.remove(meal.meal_items);
                    }
                }
                await this.mealRepository.remove(dietPlan.meals);
            }
            
            dietPlan.meals = []; // Resetear el array de comidas

            for (const mealDto of updateDto.meals) {
                const newMeal = this.mealRepository.create({
                    name: mealDto.name,
                    order: mealDto.order,
                    diet_plan: dietPlan,
                });
                
                // Guardar la comida primero
                const savedMeal = await this.mealRepository.save(newMeal);
                savedMeal.meal_items = [];

                for (const itemDto of mealDto.mealItems) {
                    const food = await this.foodRepository.findOneBy({ id: itemDto.foodId });
                    if (!food) {
                        throw new AppError(`Alimento con ID ${itemDto.foodId} no encontrado durante la actualización del plan.`, 404);
                    }
                    const newMealItem = this.mealItemRepository.create({
                        food: food,
                        quantity: itemDto.quantity,
                        meal: savedMeal,
                    });
                    
                    // Guardar el item de comida
                    const savedMealItem = await this.mealItemRepository.save(newMealItem);
                    savedMeal.meal_items.push(savedMealItem);
                }
                dietPlan.meals.push(savedMeal);
            }
        }


        await this.dietPlanRepository.save(dietPlan);
        
        // Recargar el plan con todas las relaciones para devolverlo completo
        const updatedDietPlan = await this.dietPlanRepository.findOne({
            where: { id: dietPlanId },
            relations: [
                'patient',
                'nutritionist',
                'meals',
                'meals.meal_items',
                'meals.meal_items.food',
            ],
        });

        if (!updatedDietPlan) {
            throw new AppError('Error al recargar el plan de dieta actualizado.', 500);
        }

        // Mapear los campos para la respuesta
        const { password_hash: patientHash, ...patientWithoutHash } = updatedDietPlan.patient;
        const { password_hash: nutritionistHash, ...nutritionistWithoutHash } = updatedDietPlan.nutritionist;

        return {
            ...updatedDietPlan,
            patient: patientWithoutHash,
            nutritionist: nutritionistWithoutHash,
        };
    }

    // Cambiar el estado de un plan (Nutriólogo)
    public async updateDietPlanStatus(dietPlanId: string, newStatus: DietPlanStatus, nutritionistId: string) {
        const dietPlan = await this.dietPlanRepository.findOne({
            where: { id: dietPlanId, nutritionist: { id: nutritionistId } },
            relations: ['patient'], // Necesario para verificar si hay otro plan activo para el paciente
        });

        if (!dietPlan) {
            throw new AppError('Plan de dieta no encontrado o no autorizado para actualizar.', 404);
        }

        // Reglas de transición de estados
        // Simplificado, una lógica real podría ser un autómata de estados más complejo
        if (newStatus === DietPlanStatus.ACTIVE) {
            const overlappingPlan = await this.dietPlanRepository.findOne({
                where: {
                    patient: { id: dietPlan.patient.id },
                    status: DietPlanStatus.ACTIVE,
                    // Lógica para verificar rangos de fechas superpuestos más compleja
                    // Por ahora, una simple verificación si ya hay un plan activo para el mismo paciente
                },
            });
            if (overlappingPlan && overlappingPlan.id !== dietPlan.id) {
                throw new AppError('Ya existe un plan activo para este paciente. Desactívelo primero antes de activar otro.', 400);
            }
        }
        
        // No permitir activación si el plan está vacío (no tiene comidas)
        if (newStatus === DietPlanStatus.ACTIVE) {
            const planWithMeals = await this.dietPlanRepository.findOne({
                where: { id: dietPlanId },
                relations: ['meals'],
            });
            if (!planWithMeals || !planWithMeals.meals || planWithMeals.meals.length === 0) {
                throw new AppError('No se puede activar un plan de dieta sin comidas asignadas.', 400);
            }
        }

        dietPlan.status = newStatus;
        await this.dietPlanRepository.save(dietPlan);
        return dietPlan;
    }

    // Eliminar un plan de dieta (Nutriólogo/Admin)
    public async deleteDietPlan(dietPlanId: string, deleterId: string, deleterRole: RoleName) {
        const dietPlan = await this.dietPlanRepository.findOne({
            where: { id: dietPlanId },
            relations: ['nutritionist'],
        });

        if (!dietPlan) {
            throw new AppError('Plan de dieta no encontrado.', 404);
        }

        if (dietPlan.nutritionist.id !== deleterId && deleterRole !== RoleName.ADMIN) {
            throw new AppError('No tienes permiso para eliminar este plan de dieta.', 403);
        }

        if (dietPlan.status === DietPlanStatus.ACTIVE) {
            throw new AppError('No se puede eliminar un plan de dieta activo. Desactívelo o archívelo primero.', 400);
        }

        await this.dietPlanRepository.remove(dietPlan);
        return { message: 'Plan de dieta eliminado con éxito.' };
    }
}

export default new DietPlanService();