// src/modules/foods/recipe.service.ts
import { Repository } from 'typeorm';
import { AppDataSource } from '../../database/data-source';
import { Recipe, RecipeIngredient } from '../../database/entities/recipe.entity';
import { Food } from '../../database/entities/food.entity';
import { User } from '../../database/entities/user.entity';
import { PatientProfile } from '../../database/entities/patient_profile.entity';
import { ClinicalRecord } from '../../database/entities/clinical_record.entity';
import { 
    CreateRecipeDto, 
    UpdateRecipeDto, 
    RecipeSearchDto, 
    GenerateRecipeDto,
    RecipeNutritionInfo,
    RecipeIngredientDto 
} from './recipe.dto';
import { AppError } from '../../utils/app.error';
import { RoleName } from '../../database/entities/role.entity';

class RecipeService {
    private recipeRepository: Repository<Recipe>;
    private recipeIngredientRepository: Repository<RecipeIngredient>;
    private foodRepository: Repository<Food>;
    private userRepository: Repository<User>;
    private patientRepository: Repository<PatientProfile>;
    private clinicalRecordRepository: Repository<ClinicalRecord>;

    constructor() {
        this.recipeRepository = AppDataSource.getRepository(Recipe);
        this.recipeIngredientRepository = AppDataSource.getRepository(RecipeIngredient);
        this.foodRepository = AppDataSource.getRepository(Food);
        this.userRepository = AppDataSource.getRepository(User);
        this.patientRepository = AppDataSource.getRepository(PatientProfile);
        this.clinicalRecordRepository = AppDataSource.getRepository(ClinicalRecord);
    }

    // Crear nueva receta con cálculo automático de valores nutricionales
    public async createRecipe(recipeDto: CreateRecipeDto, createdById: string): Promise<Recipe> {
        const creator = await this.userRepository.findOne({ 
            where: { id: createdById },
            relations: ['role']
        });
        
        if (!creator) {
            throw new AppError('Usuario creador no encontrado.', 404);
        }
        
        if (creator.role.name !== RoleName.NUTRITIONIST && creator.role.name !== RoleName.ADMIN) {
            throw new AppError('Solo nutriólogos o administradores pueden crear recetas.', 403);
        }

        // Calcular valores nutricionales automáticamente
        const nutritionInfo = await this.calculateRecipeNutrition(recipeDto.ingredients, recipeDto.servings);

        // Crear la receta
        const newRecipe = this.recipeRepository.create({
            title: recipeDto.title,
            description: recipeDto.description,
            instructions: recipeDto.instructions,
            tags: recipeDto.tags,
            image_url: recipeDto.imageUrl,
            prep_time_minutes: recipeDto.prepTimeMinutes,
            cook_time_minutes: recipeDto.cookTimeMinutes,
            servings: recipeDto.servings,
            total_calories: nutritionInfo.totalCalories,
            total_macros: nutritionInfo.totalMacros,
            is_published: recipeDto.isPublished ?? true,
            created_by: creator
        });

        const savedRecipe = await this.recipeRepository.save(newRecipe);

        // Crear ingredientes de la receta
        const ingredients = await Promise.all(
            recipeDto.ingredients.map(async (ingredientDto) => {
                const ingredient = this.recipeIngredientRepository.create({
                    recipe: savedRecipe,
                    ingredient_name: ingredientDto.ingredientName,
                    quantity: ingredientDto.quantity,
                    unit: ingredientDto.unit,
                    food: ingredientDto.foodId ? await this.foodRepository.findOne({ 
                        where: { id: ingredientDto.foodId } 
                    }) : null,
                    // Campos personalizados opcionales
                    custom_calories_per_100g: ingredientDto.customCaloriesPer100g,
                    custom_protein_per_100g: ingredientDto.customProteinPer100g,
                    custom_carbohydrates_per_100g: ingredientDto.customCarbohydratesPer100g,
                    custom_fats_per_100g: ingredientDto.customFatsPer100g,
                    custom_fiber_per_100g: ingredientDto.customFiberPer100g,
                    notes: ingredientDto.notes
                });
                return this.recipeIngredientRepository.save(ingredient);
            })
        );

        // Retornar receta completa con ingredientes
        return this.recipeRepository.findOne({
            where: { id: savedRecipe.id },
            relations: ['ingredients', 'ingredients.food', 'created_by']
        }) as Promise<Recipe>;
    }

    // Clonar una receta existente
    public async cloneRecipe(
        originalRecipeId: string, 
        clonedByUserId: string, 
        newTitle?: string, 
        newDescription?: string
    ): Promise<Recipe> {
        // Obtener el usuario que está clonando
        const clonedByUser = await this.userRepository.findOne({ 
            where: { id: clonedByUserId },
            relations: ['role']
        });
        
        if (!clonedByUser) {
            throw new AppError('Usuario no encontrado.', 404);
        }

        // Obtener la receta original con todos sus ingredientes
        const originalRecipe = await this.recipeRepository.findOne({
            where: { id: originalRecipeId },
            relations: ['ingredients', 'ingredients.food']
        });

        if (!originalRecipe) {
            throw new AppError('Receta original no encontrada', 404);
        }

        // Recalcular valores nutricionales basados en la receta original
        const ingredientsDto = originalRecipe.ingredients.map(ing => ({
            ingredientName: ing.ingredient_name,
            quantity: ing.quantity,
            unit: ing.unit,
            foodId: ing.food?.id,
            calories: ing.food?.calories,
            protein: ing.food?.protein,
            carbohydrates: ing.food?.carbohydrates,
            fats: ing.food?.fats,
            fiber: ing.food?.fiber
        }));

        const nutritionInfo = await this.calculateRecipeNutrition(ingredientsDto, originalRecipe.servings!);

        // Crear nueva receta basada en la original
        const clonedRecipe = this.recipeRepository.create({
            title: newTitle || `${originalRecipe.title} (Copia)`,
            description: newDescription || originalRecipe.description,
            instructions: originalRecipe.instructions,
            tags: originalRecipe.tags,
            image_url: originalRecipe.image_url,
            prep_time_minutes: originalRecipe.prep_time_minutes,
            cook_time_minutes: originalRecipe.cook_time_minutes,
            servings: originalRecipe.servings,
            total_calories: nutritionInfo.totalCalories,
            total_macros: nutritionInfo.totalMacros,
            is_published: true, // Las copias inician como publicadas
            created_by: clonedByUser
        });

        // Guardar la nueva receta
        const savedClonedRecipe = await this.recipeRepository.save(clonedRecipe);

        // Clonar todos los ingredientes
        if (originalRecipe.ingredients && originalRecipe.ingredients.length > 0) {
            await Promise.all(
                originalRecipe.ingredients.map(async (originalIngredient) => {
                    const clonedIngredient = this.recipeIngredientRepository.create({
                        recipe: savedClonedRecipe,
                        ingredient_name: originalIngredient.ingredient_name,
                        quantity: originalIngredient.quantity,
                        unit: originalIngredient.unit,
                        food: originalIngredient.food,
                        // Copiar campos personalizados si existen
                        custom_calories_per_100g: originalIngredient.custom_calories_per_100g,
                        custom_protein_per_100g: originalIngredient.custom_protein_per_100g,
                        custom_carbohydrates_per_100g: originalIngredient.custom_carbohydrates_per_100g,
                        custom_fats_per_100g: originalIngredient.custom_fats_per_100g,
                        custom_fiber_per_100g: originalIngredient.custom_fiber_per_100g,
                        notes: originalIngredient.notes
                    });
                    return this.recipeIngredientRepository.save(clonedIngredient);
                })
            );
        }

        // Retornar receta clonada completa
        return this.recipeRepository.findOne({
            where: { id: savedClonedRecipe.id },
            relations: ['ingredients', 'ingredients.food', 'created_by']
        }) as Promise<Recipe>;
    }

    // Marcar receta como base (solo admin)
    public async markAsBaseRecipe(recipeId: string, adminUserId: string): Promise<Recipe> {
        const admin = await this.userRepository.findOne({ 
            where: { id: adminUserId },
            relations: ['role']
        });
        
        if (!admin || admin.role.name !== RoleName.ADMIN) {
            throw new AppError('Solo administradores pueden marcar recetas como base.', 403);
        }

        const recipe = await this.recipeRepository.findOne({ 
            where: { id: recipeId },
            relations: ['created_by']
        });

        if (!recipe) {
            throw new AppError('Receta no encontrada', 404);
        }

        recipe.is_base_recipe = true;
        recipe.is_shared_by_admin = true;
        recipe.shared_by_admin = admin;
        recipe.shared_at = new Date();

        await this.recipeRepository.save(recipe);

        return this.recipeRepository.findOne({
            where: { id: recipeId },
            relations: ['ingredients', 'ingredients.food', 'created_by', 'shared_by_admin']
        }) as Promise<Recipe>;
    }

    // Compartir receta a todos los nutriólogos (solo admin)
    public async shareRecipeToAllNutritionists(recipeId: string, adminUserId: string): Promise<Recipe[]> {
        const admin = await this.userRepository.findOne({ 
            where: { id: adminUserId },
            relations: ['role']
        });
        
        if (!admin || admin.role.name !== RoleName.ADMIN) {
            throw new AppError('Solo administradores pueden compartir recetas a todos los nutriólogos.', 403);
        }

        const originalRecipe = await this.recipeRepository.findOne({
            where: { id: recipeId },
            relations: ['ingredients', 'ingredients.food', 'created_by']
        });

        if (!originalRecipe) {
            throw new AppError('Receta original no encontrada', 404);
        }

        // Marcar la receta original como base
        originalRecipe.is_base_recipe = true;
        originalRecipe.is_shared_by_admin = true;
        originalRecipe.shared_by_admin = admin;
        originalRecipe.shared_at = new Date();
        await this.recipeRepository.save(originalRecipe);

        // Obtener todos los nutriólogos
        const nutritionists = await this.userRepository.find({
            where: { 
                role: { name: RoleName.NUTRITIONIST },
                is_active: true
            },
            relations: ['role']
        });

        // Crear una copia para cada nutriólogo
        const sharedRecipes: Recipe[] = [];
        
        for (const nutritionist of nutritionists) {
            const clonedRecipe = this.recipeRepository.create({
                title: `${originalRecipe.title} (Base)`,
                description: originalRecipe.description,
                instructions: originalRecipe.instructions,
                tags: originalRecipe.tags,
                image_url: originalRecipe.image_url,
                prep_time_minutes: originalRecipe.prep_time_minutes,
                cook_time_minutes: originalRecipe.cook_time_minutes,
                servings: originalRecipe.servings,
                total_calories: originalRecipe.total_calories,
                total_macros: originalRecipe.total_macros,
                is_published: true,
                is_shared_by_admin: true,
                original_recipe_id: originalRecipe.id,
                shared_at: new Date(),
                shared_by_admin: admin,
                created_by: nutritionist
            });

            const savedClonedRecipe = await this.recipeRepository.save(clonedRecipe);

            // Clonar ingredientes
            if (originalRecipe.ingredients && originalRecipe.ingredients.length > 0) {
                await Promise.all(
                    originalRecipe.ingredients.map(async (originalIngredient) => {
                        const clonedIngredient = this.recipeIngredientRepository.create({
                            recipe: savedClonedRecipe,
                            ingredient_name: originalIngredient.ingredient_name,
                            quantity: originalIngredient.quantity,
                            unit: originalIngredient.unit,
                            food: originalIngredient.food,
                            custom_calories_per_100g: originalIngredient.custom_calories_per_100g,
                            custom_protein_per_100g: originalIngredient.custom_protein_per_100g,
                            custom_carbohydrates_per_100g: originalIngredient.custom_carbohydrates_per_100g,
                            custom_fats_per_100g: originalIngredient.custom_fats_per_100g,
                            custom_fiber_per_100g: originalIngredient.custom_fiber_per_100g,
                            notes: originalIngredient.notes
                        });
                        await this.recipeIngredientRepository.save(clonedIngredient);
                    })
                );
            }

            sharedRecipes.push(savedClonedRecipe);
        }

        return sharedRecipes;
    }

    // Obtener recetas base (solo admin)
    public async getBaseRecipes(adminUserId: string): Promise<Recipe[]> {
        const admin = await this.userRepository.findOne({ 
            where: { id: adminUserId },
            relations: ['role']
        });
        
        if (!admin || admin.role.name !== RoleName.ADMIN) {
            throw new AppError('Solo administradores pueden ver recetas base.', 403);
        }

        return this.recipeRepository.find({
            where: { is_base_recipe: true },
            relations: ['ingredients', 'ingredients.food', 'created_by', 'shared_by_admin'],
            order: { created_at: 'DESC' }
        });
    }

    // Obtener recetas compartidas por admin (para nutriólogos)
    public async getSharedRecipes(userId: string): Promise<Recipe[]> {
        const user = await this.userRepository.findOne({ 
            where: { id: userId },
            relations: ['role']
        });
        
        if (!user) {
            throw new AppError('Usuario no encontrado.', 404);
        }

        if (user.role.name === RoleName.ADMIN) {
            // Si es admin, mostrar todas las recetas base
            return this.getBaseRecipes(userId);
        } else if (user.role.name === RoleName.NUTRITIONIST) {
            // Si es nutriólogo, mostrar las recetas compartidas con él
            return this.recipeRepository.find({
                where: { 
                    is_shared_by_admin: true,
                    created_by: { id: userId }
                },
                relations: ['ingredients', 'ingredients.food', 'created_by', 'shared_by_admin', 'original_recipe'],
                order: { shared_at: 'DESC' }
            });
        } else {
            return []; // Pacientes no tienen acceso a recetas compartidas
        }
    }

    // Calcular valores nutricionales de la receta
    private async calculateRecipeNutrition(
        ingredients: RecipeIngredientDto[], 
        servings: number
    ): Promise<RecipeNutritionInfo> {
        let totalCalories = 0;
        let totalProtein = 0;
        let totalCarbs = 0;
        let totalFats = 0;
        let totalFiber = 0;

        const ingredientBreakdown = await Promise.all(
            ingredients.map(async (ingredient) => {
                let calories = 0;
                let protein = 0;
                let carbs = 0;
                let fats = 0;
                let fiber = 0;

                // Determinar valores nutricionales: priorizar custom > food > dto
                let caloriesPer100g = 0;
                let proteinPer100g = 0;
                let carbsPer100g = 0;
                let fatsPer100g = 0;
                let fiberPer100g = 0;

                // Si hay valores personalizados, usarlos
                if (ingredient.customCaloriesPer100g !== undefined || 
                    ingredient.customProteinPer100g !== undefined ||
                    ingredient.customCarbohydratesPer100g !== undefined ||
                    ingredient.customFatsPer100g !== undefined ||
                    ingredient.customFiberPer100g !== undefined) {
                    
                    caloriesPer100g = ingredient.customCaloriesPer100g ?? 0;
                    proteinPer100g = ingredient.customProteinPer100g ?? 0;
                    carbsPer100g = ingredient.customCarbohydratesPer100g ?? 0;
                    fatsPer100g = ingredient.customFatsPer100g ?? 0;
                    fiberPer100g = ingredient.customFiberPer100g ?? 0;
                }
                // Si hay foodId y no hay valores custom, usar datos de la BD
                else if (ingredient.foodId) {
                    const food = await this.foodRepository.findOne({ 
                        where: { id: ingredient.foodId } 
                    });
                    
                    if (food) {
                        caloriesPer100g = Number(food.calories);
                        proteinPer100g = Number(food.protein);
                        carbsPer100g = Number(food.carbohydrates);
                        fatsPer100g = Number(food.fats);
                        fiberPer100g = Number(food.fiber || 0);
                    }
                } 
                // Usar valores proporcionados en el DTO como fallback
                else {
                    caloriesPer100g = ingredient.caloriesPer100g || 0;
                    proteinPer100g = ingredient.proteinPer100g || 0;
                    carbsPer100g = ingredient.carbsPer100g || 0;
                    fatsPer100g = ingredient.fatsPer100g || 0;
                }

                // Calcular basado en la cantidad actual
                const factor = this.convertToGrams(ingredient.quantity, ingredient.unit) / 100;
                calories = caloriesPer100g * factor;
                protein = proteinPer100g * factor;
                carbs = carbsPer100g * factor;
                fats = fatsPer100g * factor;
                fiber = fiberPer100g * factor;

                totalCalories += calories;
                totalProtein += protein;
                totalCarbs += carbs;
                totalFats += fats;
                totalFiber += fiber;

                return {
                    ingredientName: ingredient.ingredientName,
                    quantity: ingredient.quantity,
                    unit: ingredient.unit,
                    calories: Math.round(calories * 100) / 100,
                    protein: Math.round(protein * 100) / 100,
                    carbs: Math.round(carbs * 100) / 100,
                    fats: Math.round(fats * 100) / 100
                };
            })
        );

        return {
            totalCalories: Math.round(totalCalories),
            caloriesPerServing: Math.round(totalCalories / servings),
            totalMacros: {
                protein: Math.round(totalProtein * 100) / 100,
                carbohydrates: Math.round(totalCarbs * 100) / 100,
                fats: Math.round(totalFats * 100) / 100,
                fiber: Math.round(totalFiber * 100) / 100
            },
            macrosPerServing: {
                protein: Math.round((totalProtein / servings) * 100) / 100,
                carbohydrates: Math.round((totalCarbs / servings) * 100) / 100,
                fats: Math.round((totalFats / servings) * 100) / 100,
                fiber: Math.round((totalFiber / servings) * 100) / 100
            },
            ingredientBreakdown
        };
    }

    // Convertir diferentes unidades a gramos para cálculos consistentes
    private convertToGrams(quantity: number, unit: string, food?: Food): number {
        const unitLower = unit.toLowerCase();
        
        // Conversiones básicas a gramos
        const conversions: { [key: string]: number } = {
            'g': 1,
            'gramos': 1,
            'kg': 1000,
            'kilogramos': 1000,
            'ml': 1, // Asumiendo densidad similar al agua
            'mililitros': 1,
            'l': 1000,
            'litros': 1000,
            'taza': 240, // Aproximadamente 240g para líquidos
            'tazas': 240,
            'cucharada': 15,
            'cucharadas': 15,
            'cucharadita': 5,
            'cucharaditas': 5,
            'pizca': 1,
            'pizças': 1,
            'unidad': food?.serving_size ? Number(food.serving_size) : 100,
            'unidades': food?.serving_size ? Number(food.serving_size) : 100,
            'pieza': food?.serving_size ? Number(food.serving_size) : 100,
            'piezas': food?.serving_size ? Number(food.serving_size) : 100
        };

        return quantity * (conversions[unitLower] || 100); // Default 100g si no se reconoce la unidad
    }

    // **OPTIMIZACIÓN**: Obtener todas las recetas con filtros y paginación optimizada
    public async getAllRecipes(searchDto: RecipeSearchDto = {}) {
        // Construir query base más eficiente
        const queryBuilder = this.recipeRepository.createQueryBuilder('recipe')
            .leftJoinAndSelect('recipe.created_by', 'creator')
            .where('recipe.is_published = :isPublished', { isPublished: true });

        // **OPTIMIZACIÓN**: Solo cargar ingredients y food si es necesario
        const needsIngredients = searchDto.search || (searchDto as any).detailedResults;
        if (needsIngredients) {
            queryBuilder
                .leftJoinAndSelect('recipe.ingredients', 'ingredients')
                .leftJoinAndSelect('ingredients.food', 'food');
        }

        // **OPTIMIZACIÓN**: Aplicar filtros de forma más eficiente
        if (searchDto.search) {
            if (needsIngredients) {
                queryBuilder.andWhere(
                    '(recipe.title ILIKE :search OR recipe.description ILIKE :search OR ingredients.ingredient_name ILIKE :search)',
                    { search: `%${searchDto.search}%` }
                );
            } else {
                queryBuilder.andWhere(
                    '(recipe.title ILIKE :search OR recipe.description ILIKE :search)',
                    { search: `%${searchDto.search}%` }
                );
            }
        }

        if (searchDto.tags && searchDto.tags.length > 0) {
            queryBuilder.andWhere('recipe.tags && ARRAY[:...tags]', { tags: searchDto.tags });
        }

        if (searchDto.mealType) {
            queryBuilder.andWhere('recipe.tags @> ARRAY[:mealType]', { mealType: searchDto.mealType });
        }

        if (searchDto.maxCaloriesPerServing) {
            queryBuilder.andWhere('(recipe.total_calories / recipe.servings) <= :maxCalories', { 
                maxCalories: searchDto.maxCaloriesPerServing 
            });
        }

        if (searchDto.minCaloriesPerServing) {
            queryBuilder.andWhere('(recipe.total_calories / recipe.servings) >= :minCalories', { 
                minCalories: searchDto.minCaloriesPerServing 
            });
        }

        if (searchDto.maxPrepTime) {
            queryBuilder.andWhere('recipe.prep_time_minutes <= :maxPrepTime', { 
                maxPrepTime: searchDto.maxPrepTime 
            });
        }

        // Ordenamiento
        const sortBy = searchDto.sortBy || 'created_desc';
        switch (sortBy) {
            case 'calories_asc':
                queryBuilder.orderBy('recipe.total_calories', 'ASC');
                break;
            case 'calories_desc':
                queryBuilder.orderBy('recipe.total_calories', 'DESC');
                break;
            case 'time_asc':
                queryBuilder.orderBy('recipe.prep_time_minutes', 'ASC');
                break;
            case 'time_desc':
                queryBuilder.orderBy('recipe.prep_time_minutes', 'DESC');
                break;
            case 'name_asc':
                queryBuilder.orderBy('recipe.title', 'ASC');
                break;
            case 'name_desc':
                queryBuilder.orderBy('recipe.title', 'DESC');
                break;
            default:
                queryBuilder.orderBy('recipe.created_at', 'DESC');
        }

        // **OPTIMIZACIÓN**: Paginación más eficiente
        const page = searchDto.page || 1;
        const limit = Math.min(searchDto.limit || 20, 100); // Limitar máximo a 100
        const skip = (page - 1) * limit;

        queryBuilder.skip(skip).take(limit);

        // **OPTIMIZACIÓN**: Usar COUNT separado para mejor rendimiento en tablas grandes
        const [recipes, total] = await Promise.all([
            queryBuilder.getMany(),
            queryBuilder.getCount()
        ]);

        return {
            recipes,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit)
            }
        };
    }

    // Obtener receta por ID
    public async getRecipeById(id: string): Promise<Recipe> {
        const recipe = await this.recipeRepository.findOne({
            where: { id },
            relations: ['ingredients', 'ingredients.food', 'created_by']
        });

        if (!recipe) {
            throw new AppError('Receta no encontrada.', 404);
        }

        return recipe;
    }

    // Actualizar receta
    public async updateRecipe(id: string, updateDto: UpdateRecipeDto, userId: string): Promise<Recipe> {
        const recipe = await this.getRecipeById(id);
        
        // Verificar permisos
        const user = await this.userRepository.findOne({ 
            where: { id: userId },
            relations: ['role']
        });

        if (!user || (user.role.name !== RoleName.ADMIN && recipe.created_by?.id !== userId)) {
            throw new AppError('No tienes permisos para editar esta receta.', 403);
        }

        // Si se actualizaron ingredientes o porciones, recalcular nutrición
        if (updateDto.ingredients || updateDto.servings) {
            const ingredients = updateDto.ingredients || recipe.ingredients.map(ing => ({
                ingredientName: ing.ingredient_name,
                quantity: Number(ing.quantity),
                unit: ing.unit,
                foodId: ing.food?.id
            }));
            const servings = updateDto.servings || recipe.servings || 1;
            
            const nutritionInfo = await this.calculateRecipeNutrition(ingredients, servings);
            
            // Actualizar los valores nutricionales directamente en la receta
            await this.recipeRepository.update(id, {
                total_calories: nutritionInfo.totalCalories,
                total_macros: nutritionInfo.totalMacros
            });

            // Actualizar ingredientes si se proporcionaron
            if (updateDto.ingredients) {
                // Eliminar ingredientes existentes
                await this.recipeIngredientRepository.delete({ recipe: { id } });
                
                // Crear nuevos ingredientes
                await Promise.all(
                    updateDto.ingredients.map(async (ingredientDto) => {
                        const ingredient = this.recipeIngredientRepository.create({
                            recipe: recipe,
                            ingredient_name: ingredientDto.ingredientName,
                            quantity: ingredientDto.quantity,
                            unit: ingredientDto.unit,
                            food: ingredientDto.foodId ? await this.foodRepository.findOne({ 
                                where: { id: ingredientDto.foodId } 
                            }) : null
                        });
                        return this.recipeIngredientRepository.save(ingredient);
                    })
                );
            }
        }

        // Actualizar receta
        await this.recipeRepository.update(id, updateDto);
        
        return this.getRecipeById(id);
    }

    // Eliminar receta
    public async deleteRecipe(id: string, userId: string): Promise<void> {
        const recipe = await this.getRecipeById(id);
        
        const user = await this.userRepository.findOne({ 
            where: { id: userId },
            relations: ['role']
        });

        if (!user || (user.role.name !== RoleName.ADMIN && recipe.created_by?.id !== userId)) {
            throw new AppError('No tienes permisos para eliminar esta receta.', 403);
        }

        await this.recipeRepository.remove(recipe);
    }

    // Generar recetas automáticamente para un paciente
    public async generateRecipeForPatient(generateDto: GenerateRecipeDto): Promise<Recipe[]> {
        // Obtener información del paciente
        const patient = await this.patientRepository.findOne({
            where: { id: generateDto.patientId },
            relations: ['user']
        });

        if (!patient) {
            throw new AppError('Paciente no encontrado.', 404);
        }

        // Obtener restricciones alimentarias (por ahora solo las del DTO)
        const avoidIngredients = generateDto.avoidIngredients || [];

        // Buscar recetas que cumplan los criterios
        const searchDto: RecipeSearchDto = {
            maxCaloriesPerServing: generateDto.targetCalories * 1.2, // 20% de margen
            minCaloriesPerServing: generateDto.targetCalories * 0.8, // 20% de margen
            mealType: generateDto.mealType,
            limit: 10
        };

        const { recipes } = await this.getAllRecipes(searchDto);

        // Filtrar recetas que no contengan ingredientes prohibidos
        const filteredRecipes = recipes.filter(recipe => {
            const hasAvoidedIngredients = recipe.ingredients.some(ingredient =>
                avoidIngredients.some(avoid => 
                    ingredient.ingredient_name.toLowerCase().includes(avoid.toLowerCase())
                )
            );
            return !hasAvoidedIngredients;
        });

        return filteredRecipes.slice(0, 5); // Devolver máximo 5 recetas
    }

    // Obtener estadísticas de recetas
    public async getRecipeStats() {
        const totalRecipes = await this.recipeRepository.count({ where: { is_published: true } });
        
        const avgCalories = await this.recipeRepository
            .createQueryBuilder('recipe')
            .select('AVG(recipe.total_calories / recipe.servings)', 'avg')
            .where('recipe.is_published = :isPublished', { isPublished: true })
            .getRawOne();

        const popularTags = await this.recipeRepository
            .createQueryBuilder('recipe')
            .select('UNNEST(recipe.tags) as tag, COUNT(*) as count')
            .where('recipe.is_published = :isPublished', { isPublished: true })
            .groupBy('tag')
            .orderBy('count', 'DESC')
            .limit(10)
            .getRawMany();

        return {
            totalRecipes,
            avgCaloriesPerServing: Math.round(Number(avgCalories?.avg) || 0),
            popularTags: popularTags.map(t => ({ tag: t.tag, count: parseInt(t.count) }))
        };
    }
}

export default new RecipeService(); 