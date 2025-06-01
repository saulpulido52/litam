// src/modules/diet_plans/diet_plan.service.ts
import { Repository } from 'typeorm';
import { AppDataSource } from '@/database/data-source';
import { User } from '@/database/entities/user.entity';
import { DietPlan, DietPlanStatus } from '@/database/entities/diet_plan.entity';
import { Meal } from '@/database/entities/meal.entity';
import { MealItem } from '@/database/entities/meal_item.entity';
import { Food } from '@/database/entities/food.entity';
import { PatientNutritionistRelation, RelationshipStatus } from '@/database/entities/patient_nutritionist_relation.entity';
import {
    CreateDietPlanDto,
    UpdateDietPlanDto,
    MealDto,
    MealItemDto,
    GenerateDietPlanAiDto,
} from '@/modules/diet_plans/diet_plan.dto';
import { AppError } from '@/utils/app.error';
import { RoleName } from '@/database/entities/role.entity';
import { PatientProfile } from '@/database/entities/patient_profile.entity';

class DietPlanService {
    private dietPlanRepository: Repository<DietPlan>;
    private mealRepository: Repository<Meal>;
    private mealItemRepository: Repository<MealItem>;
    private foodRepository: Repository<Food>;
    private userRepository: Repository<User>;
    private patientProfileRepository: Repository<PatientProfile>;
    private relationRepository: Repository<PatientNutritionistRelation>; // Añadido para la relación

    constructor() {
        this.dietPlanRepository = AppDataSource.getRepository(DietPlan);
        this.mealRepository = AppDataSource.getRepository(Meal);
        this.mealItemRepository = AppDataSource.getRepository(MealItem);
        this.foodRepository = AppDataSource.getRepository(Food);
        this.userRepository = AppDataSource.getRepository(User);
        this.patientProfileRepository = AppDataSource.getRepository(PatientProfile);
        this.relationRepository = AppDataSource.getRepository(PatientNutritionistRelation); // Inicializar
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

                // Aquí se podría añadir lógica para evitar alergias, cumplir preferencias, etc.
                // Ej: if (patientAllergies.includes(randomFood.name.toLowerCase())) continue;

                mealItems.push({
                    foodId: randomFood.id,
                    quantity: quantity,
                });
            }

            if (mealItems.length > 0) { // Asegurarse de que al menos un item se añadió
                meals.push({
                    name: mealNames[i],
                    order: i + 1,
                    mealItems: mealItems,
                });
            }
        }

        return meals;
    }

    // --- Métodos de CRUD para Diet Plans ---

    // Crear un plan de dieta (Nutriólogo)
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

        const newDietPlan = this.dietPlanRepository.create({
            name: dietPlanDto.name,
            patient: patient,
            nutritionist: nutritionist,
            notes: dietPlanDto.notes,
            start_date: new Date(dietPlanDto.startDate),
            end_date: new Date(dietPlanDto.endDate),
            daily_calories_target: dietPlanDto.dailyCaloriesTarget,
            daily_macros_target: dietPlanDto.dailyMacrosTarget,
            generated_by_ia: dietPlanDto.generatedByIA || false,
            ia_version: dietPlanDto.iaVersion,
            status: DietPlanStatus.DRAFT, // Siempre comienza como borrador
        });

        if (dietPlanDto.meals && dietPlanDto.meals.length > 0) {
            newDietPlan.meals = [];
            for (const mealDto of dietPlanDto.meals) {
                const newMeal = this.mealRepository.create({
                    name: mealDto.name,
                    order: mealDto.order,
                    diet_plan: newDietPlan,
                });
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
                    newMeal.meal_items.push(newMealItem);
                }
                newDietPlan.meals.push(newMeal);
            }
        }

        await this.dietPlanRepository.save(newDietPlan);
        return newDietPlan;
    }

    // Generar y crear un plan de dieta por IA (Nutriólogo)
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

        const generatedMeals = await this.generateBasicDietPlanMeals(
            generateDto.patientId,
            nutritionistId,
            generateDto.notesForAI
        );

        const newDietPlan = this.dietPlanRepository.create({
            name: generateDto.name,
            patient: patient,
            nutritionist: nutritionist,
            notes: generateDto.notesForAI,
            start_date: new Date(generateDto.startDate),
            end_date: new Date(generateDto.endDate),
            generated_by_ia: true,
            ia_version: '1.0', // Versión inicial de la IA
            status: DietPlanStatus.PENDING_REVIEW, // Generado por IA, necesita revisión
        });

        newDietPlan.meals = [];
        for (const mealDto of generatedMeals) {
            const newMeal = this.mealRepository.create({
                name: mealDto.name,
                order: mealDto.order,
                diet_plan: newDietPlan,
            });
            newMeal.meal_items = [];

            for (const itemDto of mealDto.mealItems) {
                const food = await this.foodRepository.findOneBy({ id: itemDto.foodId });
                if (!food) {
                    throw new AppError(`Alimento con ID ${itemDto.foodId} no encontrado durante generación IA.`, 500);
                }
                const newMealItem = this.mealItemRepository.create({
                    food: food,
                    quantity: itemDto.quantity,
                    meal: newMeal,
                });
                newMeal.meal_items.push(newMealItem);
            }
            newDietPlan.meals.push(newMeal);
        }

        await this.dietPlanRepository.save(newDietPlan);
        return newDietPlan;
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
    public async getDietPlansForPatient(patientId: string, nutritionistId: string, callerRole: RoleName) {
        if (callerRole === RoleName.NUTRITIONIST) {
            const relation = await this.relationRepository.findOne({
                where: {
                    patient: { id: patientId },
                    nutritionist: { id: nutritionistId },
                    status: RelationshipStatus.ACTIVE,
                },
            });
            if (!relation) {
                throw new AppError('No estás vinculado con este paciente o no tienes permiso para ver sus planes.', 403);
            }
        }

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
        if (updateDto.notes !== undefined) dietPlan.notes = updateDto.notes;
        if (updateDto.startDate !== undefined) dietPlan.start_date = new Date(updateDto.startDate);
        if (updateDto.endDate !== undefined) dietPlan.end_date = new Date(updateDto.endDate);
        if (updateDto.dailyCaloriesTarget !== undefined) dietPlan.daily_calories_target = updateDto.dailyCaloriesTarget;

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
            // Eliminar comidas e ítems existentes para recrearlos
            await this.mealItemRepository.remove(dietPlan.meals.flatMap(meal => meal.meal_items));
            await this.mealRepository.remove(dietPlan.meals);
            
            dietPlan.meals = []; // Resetear el array de comidas

            for (const mealDto of updateDto.meals) {
                const newMeal = this.mealRepository.create({
                    name: mealDto.name,
                    order: mealDto.order,
                    diet_plan: dietPlan,
                });
                newMeal.meal_items = [];

                for (const itemDto of mealDto.mealItems) {
                    const food = await this.foodRepository.findOneBy({ id: itemDto.foodId });
                    if (!food) {
                        throw new AppError(`Alimento con ID ${itemDto.foodId} no encontrado durante la actualización del plan.`, 404);
                    }
                    const newMealItem = this.mealItemRepository.create({
                        food: food,
                        quantity: itemDto.quantity,
                        meal: newMeal,
                    });
                    newMeal.meal_items.push(newMealItem);
                }
                dietPlan.meals.push(newMeal);
            }
        }


        await this.dietPlanRepository.save(dietPlan);
        return dietPlan;
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