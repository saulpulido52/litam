import { AppDataSource } from '../../database/data-source';
import { Repository } from 'typeorm';
import { WeeklyPlanTemplate, TemplateCategory } from '../../database/entities/weekly-plan-template.entity';
import { TemplateMeal, MealType, DayOfWeek } from '../../database/entities/template-meal.entity';
import { TemplateFood } from '../../database/entities/template-food.entity';
import { TemplateRecipe } from '../../database/entities/template-recipe.entity';
import { User } from '../../database/entities/user.entity';
import { DietPlan } from '../../database/entities/diet_plan.entity';
import { Meal } from '../../database/entities/meal.entity';
import { MealItem } from '../../database/entities/meal_item.entity';
import { AppError } from '../../utils/app.error';

interface CreateTemplateDto {
    name: string;
    description?: string;
    category: TemplateCategory;
    tags?: string[];
    isPublic?: boolean;
    targetCalories?: number;
    targetMacros?: {
        protein: number;
        carbohydrates: number;
        fats: number;
        fiber?: number;
    };
    notes?: string;
    mealTiming?: {
        breakfast?: string;
        morning_snack?: string;
        lunch?: string;
        afternoon_snack?: string;
        dinner?: string;
        evening_snack?: string;
    };
    dietaryRestrictions?: {
        allergies?: string[];
        intolerances?: string[];
        preferences?: string[];
        medicalConditions?: string[];
    };
    difficultyLevel?: 'easy' | 'medium' | 'hard';
    avgPrepTimeMinutes?: number;
    estimatedWeeklyCost?: number;
}

interface ApplyTemplateDto {
    templateId: string;
    patientId: string;
    dietPlanId: string;
    weekNumber?: number;
    adjustments?: {
        calorieMultiplier?: number;
        portionMultiplier?: number;
        excludeOptionalItems?: boolean;
        customMealTiming?: any;
    };
}

export class WeeklyPlanTemplateService {
    private templateRepository: Repository<WeeklyPlanTemplate>;
    private templateMealRepository: Repository<TemplateMeal>;
    private templateFoodRepository: Repository<TemplateFood>;
    private templateRecipeRepository: Repository<TemplateRecipe>;
    private userRepository: Repository<User>;
    private dietPlanRepository: Repository<DietPlan>;
    private mealRepository: Repository<Meal>;
    private mealItemRepository: Repository<MealItem>;

    // **CACHE SIMPLE**: Para evitar queries repetitivas 
    private templateCache = new Map<string, { data: WeeklyPlanTemplate; timestamp: number }>();
    private cacheTimeout = 5 * 60 * 1000; // 5 minutos

    constructor() {
        this.templateRepository = AppDataSource.getRepository(WeeklyPlanTemplate);
        this.templateMealRepository = AppDataSource.getRepository(TemplateMeal);
        this.templateFoodRepository = AppDataSource.getRepository(TemplateFood);
        this.templateRecipeRepository = AppDataSource.getRepository(TemplateRecipe);
        this.userRepository = AppDataSource.getRepository(User);
        this.dietPlanRepository = AppDataSource.getRepository(DietPlan);
        this.mealRepository = AppDataSource.getRepository(Meal);
        this.mealItemRepository = AppDataSource.getRepository(MealItem);
    }

    // Crear una nueva plantilla
    async createTemplate(templateData: CreateTemplateDto, nutritionistId: string): Promise<WeeklyPlanTemplate> {
        try {
            const nutritionist = await this.userRepository.findOne({ where: { id: nutritionistId } });
            if (!nutritionist) {
                throw new AppError('Nutriólogo no encontrado', 404);
            }

            const template = this.templateRepository.create({
                ...templateData,
                createdBy: nutritionist,
                tags: templateData.tags || [],
                isPublic: templateData.isPublic || false,
                usageCount: 0,
                rating: 0,
                ratingCount: 0
            });

            return await this.templateRepository.save(template);
        } catch (error) {
            if (error instanceof AppError) throw error;
            throw new AppError('Error al crear la plantilla', 500);
        }
    }

    // **MÉTODO OPTIMIZADO**: Obtener plantillas SOLO con información básica (sin cargar todas las comidas)
    async getTemplates(nutritionistId: string, filters?: {
        category?: TemplateCategory;
        search?: string;
        tags?: string[];
        isPublic?: boolean;
        page?: number;
        limit?: number;
    }): Promise<{ templates: WeeklyPlanTemplate[]; total: number }> {
        try {
            // Query optimizada: SOLO información básica del template + creador
            const query = this.templateRepository.createQueryBuilder('template')
                .leftJoinAndSelect('template.createdBy', 'creator')
                .select([
                    'template.id',
                    'template.name',
                    'template.description', 
                    'template.category',
                    'template.tags',
                    'template.isPublic',
                    'template.targetCalories',
                    'template.targetMacros',
                    'template.usageCount',
                    'template.rating',
                    'template.ratingCount',
                    'template.difficultyLevel',
                    'template.avgPrepTimeMinutes',
                    'template.estimatedWeeklyCost',
                    'template.createdAt',
                    'template.updatedAt',
                    'creator.id',
                    'creator.first_name',
                    'creator.last_name',
                    'creator.email'
                ]);

            // Filtrar plantillas propias o públicas
            query.where('(template.createdBy.id = :nutritionistId OR template.isPublic = true)', 
                { nutritionistId });

            // Aplicar filtros
            if (filters?.category) {
                query.andWhere('template.category = :category', { category: filters.category });
            }

            if (filters?.search) {
                query.andWhere('(template.name ILIKE :search OR template.description ILIKE :search)', 
                    { search: `%${filters.search}%` });
            }

            if (filters?.tags && filters.tags.length > 0) {
                query.andWhere('template.tags && :tags', { tags: filters.tags });
            }

            if (filters?.isPublic !== undefined) {
                query.andWhere('template.isPublic = :isPublic', { isPublic: filters.isPublic });
            }

            // Paginación optimizada
            const page = filters?.page || 1;
            const limit = Math.min(filters?.limit || 20, 50); // Reducido de 100 a 50
            const skip = (page - 1) * limit;

            // Ordenamiento eficiente
            query.orderBy('template.usageCount', 'DESC')
                .addOrderBy('template.rating', 'DESC')
                .addOrderBy('template.createdAt', 'DESC');

            // Ejecutar queries en paralelo para mejor rendimiento
            const [templates, total] = await Promise.all([
                query.skip(skip).take(limit).getMany(),
                this.getTemplatesCount(nutritionistId, filters)
            ]);

            return { templates, total };
        } catch (error) {
            console.error('Error en getTemplates optimizado:', error);
            throw new AppError('Error al obtener las plantillas', 500);
        }
    }

    // **MÉTODO AUXILIAR**: Contar plantillas sin cargar datos
    private async getTemplatesCount(nutritionistId: string, filters?: {
        category?: TemplateCategory;
        search?: string;
        tags?: string[];
        isPublic?: boolean;
    }): Promise<number> {
        const countQuery = this.templateRepository.createQueryBuilder('template')
            .where('(template.createdBy.id = :nutritionistId OR template.isPublic = true)', 
                { nutritionistId });

        if (filters?.category) {
            countQuery.andWhere('template.category = :category', { category: filters.category });
        }

        if (filters?.search) {
            countQuery.andWhere('(template.name ILIKE :search OR template.description ILIKE :search)', 
                { search: `%${filters.search}%` });
        }

        if (filters?.tags && filters.tags.length > 0) {
            countQuery.andWhere('template.tags && :tags', { tags: filters.tags });
        }

        if (filters?.isPublic !== undefined) {
            countQuery.andWhere('template.isPublic = :isPublic', { isPublic: filters.isPublic });
        }

        return await countQuery.getCount();
    }

    // **MÉTODOS DE CACHE**: Para optimizar queries repetitivas
    private getCacheKey(templateId: string, nutritionistId: string): string {
        return `${templateId}-${nutritionistId}`;
    }

    private getFromCache(templateId: string, nutritionistId: string): WeeklyPlanTemplate | null {
        const key = this.getCacheKey(templateId, nutritionistId);
        const cached = this.templateCache.get(key);
        
        if (cached && (Date.now() - cached.timestamp) < this.cacheTimeout) {
            return cached.data;
        }
        
        // Limpiar cache expirado
        if (cached) {
            this.templateCache.delete(key);
        }
        
        return null;
    }

    private setCache(templateId: string, nutritionistId: string, template: WeeklyPlanTemplate): void {
        const key = this.getCacheKey(templateId, nutritionistId);
        this.templateCache.set(key, {
            data: template,
            timestamp: Date.now()
        });

        // Limpiar cache si tiene más de 100 entradas
        if (this.templateCache.size > 100) {
            const keys = Array.from(this.templateCache.keys());
            keys.slice(0, 20).forEach(key => this.templateCache.delete(key));
        }
    }

    private clearCacheForTemplate(templateId: string): void {
        const keysToDelete = Array.from(this.templateCache.keys())
            .filter(key => key.startsWith(templateId));
        keysToDelete.forEach(key => this.templateCache.delete(key));
    }

    // **MÉTODO OPTIMIZADO**: Obtener plantilla específica con relaciones controladas + CACHE
    async getTemplateById(templateId: string, nutritionistId: string): Promise<WeeklyPlanTemplate> {
        try {
            // **PASO 1**: Verificar cache primero
            const cached = this.getFromCache(templateId, nutritionistId);
            if (cached) {
                console.log(`✅ Template ${templateId} obtenida desde CACHE`);
                return cached;
            }
            // Query optimizada con selects específicos para evitar cargar datos innecesarios
            const template = await this.templateRepository.createQueryBuilder('template')
                .leftJoinAndSelect('template.createdBy', 'creator')
                .leftJoinAndSelect('template.meals', 'meals')
                .leftJoinAndSelect('meals.foods', 'foods')
                .leftJoinAndSelect('foods.food', 'food') 
                .leftJoinAndSelect('meals.recipes', 'recipes')
                .leftJoinAndSelect('recipes.recipe', 'recipe')
                .select([
                    // Template fields
                    'template.id', 'template.name', 'template.description', 'template.category',
                    'template.tags', 'template.isPublic', 'template.targetCalories', 'template.targetMacros',
                    'template.usageCount', 'template.rating', 'template.ratingCount', 'template.notes',
                    'template.mealTiming', 'template.dietaryRestrictions', 'template.difficultyLevel',
                    'template.avgPrepTimeMinutes', 'template.estimatedWeeklyCost', 'template.createdAt', 'template.updatedAt',
                    // Creator fields (solo básicos)
                    'creator.id', 'creator.first_name', 'creator.last_name', 'creator.email',
                    // Meals fields
                    'meals.id', 'meals.dayOfWeek', 'meals.mealType', 'meals.name', 'meals.description',
                    'meals.suggestedTime', 'meals.totalCalories', 'meals.totalProtein', 'meals.totalCarbohydrates',
                    'meals.totalFats', 'meals.totalFiber', 'meals.prepTimeMinutes', 'meals.difficulty',
                    'meals.notes', 'meals.order', 'meals.createdAt',
                    // Template Foods fields
                    'foods.id', 'foods.foodName', 'foods.quantity', 'foods.unit', 'foods.caloriesPerServing',
                    'foods.proteinPerServing', 'foods.carbohydratesPerServing', 'foods.fatsPerServing',
                    'foods.fiberPerServing', 'foods.notes', 'foods.preparation', 'foods.shoppingCategory',
                    'foods.estimatedCost', 'foods.isOptional', 'foods.alternatives',
                    // Food entity (solo campos esenciales)
                    'food.id', 'food.name', 'food.category', 'food.calories', 'food.protein',
                    'food.carbohydrates', 'food.fats', 'food.fiber', 'food.unit', 'food.serving_size',
                    // Template Recipes fields
                    'recipes.id', 'recipes.recipeName', 'recipes.servings', 'recipes.caloriesPerServing',
                    'recipes.proteinPerServing', 'recipes.carbohydratesPerServing', 'recipes.fatsPerServing',
                    'recipes.fiberPerServing', 'recipes.instructions', 'recipes.prepTimeMinutes',
                    'recipes.cookTimeMinutes', 'recipes.difficulty', 'recipes.templateNotes',
                    'recipes.estimatedCost', 'recipes.isOptional', 'recipes.alternatives', 'recipes.templateTags',
                    // Recipe entity (solo campos esenciales)  
                    'recipe.id', 'recipe.title', 'recipe.description', 'recipe.servings', 'recipe.prep_time_minutes',
                    'recipe.cook_time_minutes', 'recipe.difficulty', 'recipe.totalCalories', 'recipe.totalMacros'
                ])
                .where('template.id = :templateId', { templateId })
                .orderBy('meals.dayOfWeek', 'ASC')
                .addOrderBy('meals.order', 'ASC')
                .getOne();

            if (!template) {
                throw new AppError('Plantilla no encontrada', 404);
            }

            // Verificar permisos (propio o público)
            if (template.createdBy.id !== nutritionistId && !template.isPublic) {
                throw new AppError('No tienes permisos para ver esta plantilla', 403);
            }

            // **PASO 3**: Guardar en cache antes de retornar
            this.setCache(templateId, nutritionistId, template);
            console.log(`💾 Template ${templateId} guardada en CACHE`);

            return template;
        } catch (error) {
            if (error instanceof AppError) throw error;
            console.error('Error en getTemplateById optimizado:', error);
            throw new AppError('Error al obtener la plantilla', 500);
        }
    }

    // Actualizar una plantilla
    async updateTemplate(templateId: string, updateData: Partial<CreateTemplateDto>, nutritionistId: string): Promise<WeeklyPlanTemplate> {
        try {
            const template = await this.templateRepository.findOne({
                where: { id: templateId },
                relations: ['createdBy']
            });

            if (!template) {
                throw new AppError('Plantilla no encontrada', 404);
            }

            // Solo el creador puede actualizar
            if (template.createdBy.id !== nutritionistId) {
                throw new AppError('No tienes permisos para actualizar esta plantilla', 403);
            }

            Object.assign(template, updateData);
            const updatedTemplate = await this.templateRepository.save(template);
            
            // **INVALIDAR CACHE**: Limpiar cache para esta plantilla
            this.clearCacheForTemplate(templateId);
            console.log(`🗑️ Cache invalidado para template ${templateId} tras actualización`);
            
            return updatedTemplate;
        } catch (error) {
            if (error instanceof AppError) throw error;
            throw new AppError('Error al actualizar la plantilla', 500);
        }
    }

    // Eliminar una plantilla
    async deleteTemplate(templateId: string, nutritionistId: string): Promise<void> {
        try {
            const template = await this.templateRepository.findOne({
                where: { id: templateId },
                relations: ['createdBy']
            });

            if (!template) {
                throw new AppError('Plantilla no encontrada', 404);
            }

            // Solo el creador puede eliminar
            if (template.createdBy.id !== nutritionistId) {
                throw new AppError('No tienes permisos para eliminar esta plantilla', 403);
            }

            await this.templateRepository.remove(template);
            
            // **INVALIDAR CACHE**: Limpiar cache para esta plantilla eliminada
            this.clearCacheForTemplate(templateId);
            console.log(`🗑️ Cache invalidado para template ${templateId} tras eliminación`);
        } catch (error) {
            if (error instanceof AppError) throw error;
            throw new AppError('Error al eliminar la plantilla', 500);
        }
    }

    // Aplicar plantilla a un plan de dieta
    async applyTemplateToWeek(applyData: ApplyTemplateDto, nutritionistId: string): Promise<Meal[]> {
        try {
            const template = await this.getTemplateById(applyData.templateId, nutritionistId);
            
            const dietPlan = await this.dietPlanRepository.findOne({
                where: { id: applyData.dietPlanId },
                relations: ['nutritionist', 'patient']
            });

            if (!dietPlan) {
                throw new AppError('Plan de dieta no encontrado', 404);
            }

            if (dietPlan.nutritionist.id !== nutritionistId) {
                throw new AppError('No tienes permisos para modificar este plan', 403);
            }

            const createdMeals: Meal[] = [];
            const adjustments = applyData.adjustments || {};

            // Limpiar comidas existentes de la semana si es necesario
            if (applyData.weekNumber) {
                await this.mealRepository.delete({
                    diet_plan: { id: applyData.dietPlanId },
                    // Agregar filtro por semana si existe campo week_number
                });
            }

            // Aplicar cada comida de la plantilla
            for (const templateMeal of template.meals) {
                const meal = this.mealRepository.create({
                    diet_plan: dietPlan,
                    day: templateMeal.dayOfWeek,
                    meal_type: templateMeal.mealType,
                    meal_time: adjustments.customMealTiming?.[templateMeal.mealType] || templateMeal.suggestedTime || '08:00',
                    notes: templateMeal.notes,
                    name: templateMeal.name || `${templateMeal.mealType} ${templateMeal.dayOfWeek}`
                });

                const savedMeal = await this.mealRepository.save(meal);

                // Aplicar alimentos de la plantilla
                for (const templateFood of templateMeal.foods) {
                    if (adjustments.excludeOptionalItems && templateFood.isOptional) continue;

                    const quantity = (templateFood.quantity || 0) * (adjustments.portionMultiplier || 1);
                    
                    const mealItem = this.mealItemRepository.create({
                        meal: savedMeal,
                        food: templateFood.food,
                        quantity: quantity
                    });

                    await this.mealItemRepository.save(mealItem);
                }

                // Nota: Las recetas no están soportadas en el sistema actual con MealItem
                // Se enfocan solo en alimentos individuales

                createdMeals.push(savedMeal);
            }

            // Incrementar contador de uso
            template.usageCount += 1;
            await this.templateRepository.save(template);

            return createdMeals;
        } catch (error) {
            if (error instanceof AppError) throw error;
            throw new AppError('Error al aplicar la plantilla', 500);
        }
    }

    // Crear plantilla desde un plan existente
    async createTemplateFromWeek(dietPlanId: string, weekNumber: number, templateData: CreateTemplateDto, nutritionistId: string): Promise<WeeklyPlanTemplate> {
        try {
            const dietPlan = await this.dietPlanRepository.findOne({
                where: { id: dietPlanId },
                relations: ['nutritionist', 'meals', 'meals.meal_items', 'meals.meal_items.food']
            });

            if (!dietPlan) {
                throw new AppError('Plan de dieta no encontrado', 404);
            }

            if (dietPlan.nutritionist.id !== nutritionistId) {
                throw new AppError('No tienes permisos para crear plantillas desde este plan', 403);
            }

            // Crear la plantilla base
            const template = await this.createTemplate(templateData, nutritionistId);

            // Convertir las comidas del plan en comidas de plantilla
            for (const meal of dietPlan.meals) {
                const templateMeal = this.templateMealRepository.create({
                    template: template,
                    dayOfWeek: meal.day as DayOfWeek,
                    mealType: meal.meal_type as MealType,
                    name: `${meal.meal_type} del ${meal.day}`,
                    description: meal.notes,
                    suggestedTime: meal.meal_time,
                    notes: meal.notes
                });

                const savedTemplateMeal = await this.templateMealRepository.save(templateMeal);

                // Convertir alimentos (usando meal_items)
                for (const mealItem of meal.meal_items || []) {
                    const templateFood = this.templateFoodRepository.create({
                        meal: savedTemplateMeal,
                        food: mealItem.food,
                        foodName: mealItem.food.name,
                        quantity: mealItem.quantity,
                        unit: 'g', // Unidad por defecto
                        notes: ''
                    });

                    templateFood.calculateNutritionFromFood();
                    await this.templateFoodRepository.save(templateFood);
                }

                // Actualizar valores nutricionales de la comida
                savedTemplateMeal.updateNutritionValues();
                await this.templateMealRepository.save(savedTemplateMeal);
            }

            return await this.getTemplateById(template.id, nutritionistId);
        } catch (error) {
            if (error instanceof AppError) throw error;
            throw new AppError('Error al crear plantilla desde el plan', 500);
        }
    }

    // Calificar una plantilla
    async rateTemplate(templateId: string, rating: number, nutritionistId: string): Promise<WeeklyPlanTemplate> {
        try {
            if (rating < 1 || rating > 5) {
                throw new AppError('La calificación debe estar entre 1 y 5', 400);
            }

            const template = await this.getTemplateById(templateId, nutritionistId);
            
            // Calcular nueva calificación promedio
            const currentTotal = (template.rating || 0) * template.ratingCount;
            const newRatingCount = template.ratingCount + 1;
            const newRating = (currentTotal + rating) / newRatingCount;

            template.rating = Math.round(newRating * 100) / 100; // Redondear a 2 decimales
            template.ratingCount = newRatingCount;

            return await this.templateRepository.save(template);
        } catch (error) {
            if (error instanceof AppError) throw error;
            throw new AppError('Error al calificar la plantilla', 500);
        }
    }
} 