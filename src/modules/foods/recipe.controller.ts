// src/modules/foods/recipe.controller.ts
import { Request, Response, NextFunction } from 'express';
import recipeService from './recipe.service';
import { AppError } from '../../utils/app.error';
import { 
    CreateRecipeDto, 
    UpdateRecipeDto, 
    RecipeSearchDto, 
    GenerateRecipeDto 
} from './recipe.dto';
import { RoleName } from '../../database/entities/role.entity';

class RecipeController {
    // Crear nueva receta
    public async createRecipe(req: Request, res: Response, next: NextFunction) {
        try {
            if (!req.user || (req.user.role.name !== RoleName.NUTRITIONIST && req.user.role.name !== RoleName.ADMIN)) {
                return next(new AppError('Acceso denegado. Solo nutriólogos o administradores pueden crear recetas.', 403));
            }

            const recipe = await recipeService.createRecipe(req.body as CreateRecipeDto, req.user.id);
            
            res.status(201).json({
                status: 'success',
                message: 'Receta creada exitosamente con cálculos nutricionales automáticos',
                data: { recipe },
            });
        } catch (error: any) {
            console.error('Error en RecipeController.createRecipe:', error);
            if (error instanceof AppError) {
                return next(error);
            }
            next(new AppError('Error al crear la receta.', 500));
        }
    }

    // Clonar una receta existente
    public async cloneRecipe(req: Request, res: Response, next: NextFunction) {
        try {
            if (!req.user || (req.user.role.name !== RoleName.NUTRITIONIST && req.user.role.name !== RoleName.ADMIN)) {
                return next(new AppError('Acceso denegado. Solo nutriólogos o administradores pueden clonar recetas.', 403));
            }

            const { id } = req.params;
            const { title, description } = req.body;
            
            const clonedRecipe = await recipeService.cloneRecipe(
                id, 
                req.user.id,
                title || undefined,
                description || undefined
            );
            
            res.status(201).json({
                status: 'success',
                message: 'Receta clonada exitosamente',
                data: { recipe: clonedRecipe },
            });
        } catch (error: any) {
            console.error('Error en RecipeController.cloneRecipe:', error);
            if (error instanceof AppError) {
                return next(error);
            }
            next(new AppError('Error al clonar la receta.', 500));
        }
    }

    // Marcar receta como base (solo admin)
    public async markAsBaseRecipe(req: Request, res: Response, next: NextFunction) {
        try {
            if (!req.user || req.user.role.name !== RoleName.ADMIN) {
                return next(new AppError('Acceso denegado. Solo administradores pueden marcar recetas como base.', 403));
            }

            const { id } = req.params;
            
            const baseRecipe = await recipeService.markAsBaseRecipe(id, req.user.id);
            
            res.status(200).json({
                status: 'success',
                message: 'Receta marcada como base exitosamente',
                data: { recipe: baseRecipe },
            });
        } catch (error: any) {
            console.error('Error en RecipeController.markAsBaseRecipe:', error);
            if (error instanceof AppError) {
                return next(error);
            }
            next(new AppError('Error al marcar la receta como base.', 500));
        }
    }

    // Compartir receta a todos los nutriólogos (solo admin)
    public async shareRecipeToAllNutritionists(req: Request, res: Response, next: NextFunction) {
        try {
            if (!req.user || req.user.role.name !== RoleName.ADMIN) {
                return next(new AppError('Acceso denegado. Solo administradores pueden compartir recetas.', 403));
            }

            const { id } = req.params;
            
            const sharedRecipes = await recipeService.shareRecipeToAllNutritionists(id, req.user.id);
            
            res.status(200).json({
                status: 'success',
                message: `Receta compartida exitosamente con ${sharedRecipes.length} nutriólogos`,
                data: { 
                    sharedRecipes,
                    totalNutritionists: sharedRecipes.length
                },
            });
        } catch (error: any) {
            console.error('Error en RecipeController.shareRecipeToAllNutritionists:', error);
            if (error instanceof AppError) {
                return next(error);
            }
            next(new AppError('Error al compartir la receta.', 500));
        }
    }

    // Obtener recetas base (solo admin)
    public async getBaseRecipes(req: Request, res: Response, next: NextFunction) {
        try {
            if (!req.user || req.user.role.name !== RoleName.ADMIN) {
                return next(new AppError('Acceso denegado. Solo administradores pueden ver recetas base.', 403));
            }

            const baseRecipes = await recipeService.getBaseRecipes(req.user.id);
            
            res.status(200).json({
                status: 'success',
                results: baseRecipes.length,
                data: { recipes: baseRecipes },
            });
        } catch (error: any) {
            console.error('Error en RecipeController.getBaseRecipes:', error);
            if (error instanceof AppError) {
                return next(error);
            }
            next(new AppError('Error al obtener recetas base.', 500));
        }
    }

    // Obtener recetas compartidas por admin
    public async getSharedRecipes(req: Request, res: Response, next: NextFunction) {
        try {
            if (!req.user) {
                return next(new AppError('Usuario no autenticado.', 401));
            }

            const sharedRecipes = await recipeService.getSharedRecipes(req.user.id);
            
            res.status(200).json({
                status: 'success',
                results: sharedRecipes.length,
                data: { recipes: sharedRecipes },
            });
        } catch (error: any) {
            console.error('Error en RecipeController.getSharedRecipes:', error);
            if (error instanceof AppError) {
                return next(error);
            }
            next(new AppError('Error al obtener recetas compartidas.', 500));
        }
    }

    // Obtener todas las recetas con filtros
    public async getAllRecipes(req: Request, res: Response, next: NextFunction) {
        try {
            // Manejar tags que pueden venir como string o array
            const handleTags = (tags: any): string[] | undefined => {
                if (!tags) return undefined;
                if (Array.isArray(tags)) return tags.map(tag => String(tag));
                if (typeof tags === 'string') return tags.split(',');
                return [String(tags)];
            };

            const searchDto: RecipeSearchDto = {
                search: req.query.search as string,
                tags: handleTags(req.query.tags),
                mealType: req.query.mealType as string,
                maxCaloriesPerServing: req.query.maxCaloriesPerServing ? parseInt(req.query.maxCaloriesPerServing as string) : undefined,
                minCaloriesPerServing: req.query.minCaloriesPerServing ? parseInt(req.query.minCaloriesPerServing as string) : undefined,
                maxPrepTime: req.query.maxPrepTime ? parseInt(req.query.maxPrepTime as string) : undefined,
                difficulty: req.query.difficulty as string,
                sortBy: req.query.sortBy as string,
                page: req.query.page ? parseInt(req.query.page as string) : 1,
                limit: req.query.limit ? parseInt(req.query.limit as string) : 20
            };

            const result = await recipeService.getAllRecipes(searchDto);
            
            res.status(200).json({
                status: 'success',
                results: result.recipes.length,
                pagination: result.pagination,
                data: { recipes: result.recipes },
            });
        } catch (error: any) {
            console.error('Error en RecipeController.getAllRecipes:', error);
            if (error instanceof AppError) {
                return next(error);
            }
            next(new AppError('Error al obtener las recetas.', 500));
        }
    }

    // Obtener receta por ID
    public async getRecipeById(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            const recipe = await recipeService.getRecipeById(id);
            
            res.status(200).json({
                status: 'success',
                data: { recipe },
            });
        } catch (error: any) {
            console.error('Error en RecipeController.getRecipeById:', error);
            if (error instanceof AppError) {
                return next(error);
            }
            next(new AppError('Error al obtener la receta.', 500));
        }
    }

    // Actualizar receta
    public async updateRecipe(req: Request, res: Response, next: NextFunction) {
        try {
            if (!req.user) {
                return next(new AppError('Usuario no autenticado.', 401));
            }

            const { id } = req.params;
            const recipe = await recipeService.updateRecipe(id, req.body as UpdateRecipeDto, req.user.id);
            
            res.status(200).json({
                status: 'success',
                message: 'Receta actualizada exitosamente',
                data: { recipe },
            });
        } catch (error: any) {
            console.error('Error en RecipeController.updateRecipe:', error);
            if (error instanceof AppError) {
                return next(error);
            }
            next(new AppError('Error al actualizar la receta.', 500));
        }
    }

    // Eliminar receta
    public async deleteRecipe(req: Request, res: Response, next: NextFunction) {
        try {
            if (!req.user) {
                return next(new AppError('Usuario no autenticado.', 401));
            }

            const { id } = req.params;
            await recipeService.deleteRecipe(id, req.user.id);
            
            res.status(200).json({
                status: 'success',
                message: 'Receta eliminada exitosamente',
            });
        } catch (error: any) {
            console.error('Error en RecipeController.deleteRecipe:', error);
            if (error instanceof AppError) {
                return next(error);
            }
            next(new AppError('Error al eliminar la receta.', 500));
        }
    }

    // Generar recetas automáticamente para un paciente
    public async generateRecipeForPatient(req: Request, res: Response, next: NextFunction) {
        try {
            if (!req.user || (req.user.role.name !== RoleName.NUTRITIONIST && req.user.role.name !== RoleName.ADMIN)) {
                return next(new AppError('Acceso denegado. Solo nutriólogos o administradores pueden generar recetas.', 403));
            }

            const recipes = await recipeService.generateRecipeForPatient(req.body as GenerateRecipeDto);
            
            res.status(200).json({
                status: 'success',
                message: 'Recetas generadas automáticamente basadas en el perfil del paciente',
                results: recipes.length,
                data: { recipes },
            });
        } catch (error: any) {
            console.error('Error en RecipeController.generateRecipeForPatient:', error);
            if (error instanceof AppError) {
                return next(error);
            }
            next(new AppError('Error al generar recetas para el paciente.', 500));
        }
    }

    // Obtener estadísticas de recetas
    public async getRecipeStats(req: Request, res: Response, next: NextFunction) {
        try {
            if (!req.user || (req.user.role.name !== RoleName.NUTRITIONIST && req.user.role.name !== RoleName.ADMIN)) {
                return next(new AppError('Acceso denegado.', 403));
            }

            const stats = await recipeService.getRecipeStats();
            
            res.status(200).json({
                status: 'success',
                data: { stats },
            });
        } catch (error: any) {
            console.error('Error en RecipeController.getRecipeStats:', error);
            if (error instanceof AppError) {
                return next(error);
            }
            next(new AppError('Error al obtener estadísticas de recetas.', 500));
        }
    }

    // Calcular información nutricional de una receta (sin guardar)
    public async calculateNutrition(req: Request, res: Response, next: NextFunction) {
        try {
            const { ingredients, servings } = req.body;
            
            if (!ingredients || !Array.isArray(ingredients) || !servings) {
                return next(new AppError('Se requieren ingredientes y número de porciones.', 400));
            }

            // Usar el método privado del servicio (necesitamos hacerlo público o crear uno nuevo)
            // Por ahora crearemos una receta temporal para el cálculo
            const tempRecipe: CreateRecipeDto = {
                title: 'Temporal',
                instructions: 'Temporal',
                ingredients,
                servings
            };

            // Crear una instancia temporal del servicio para acceder al método de cálculo
            const nutritionInfo = await (recipeService as any).calculateRecipeNutrition(ingredients, servings);
            
            res.status(200).json({
                status: 'success',
                message: 'Información nutricional calculada exitosamente',
                data: { nutrition: nutritionInfo },
            });
        } catch (error: any) {
            console.error('Error en RecipeController.calculateNutrition:', error);
            if (error instanceof AppError) {
                return next(error);
            }
            next(new AppError('Error al calcular información nutricional.', 500));
        }
    }

    // Buscar recetas por ingredientes
    public async searchByIngredients(req: Request, res: Response, next: NextFunction) {
        try {
            const { ingredients } = req.query;
            
            if (!ingredients) {
                return next(new AppError('Se requiere al menos un ingrediente para buscar.', 400));
            }

            const ingredientArray = (ingredients as string).split(',').map(i => i.trim());
            
            const searchDto: RecipeSearchDto = {
                search: ingredientArray.join(' '),
                limit: 50
            };

            const result = await recipeService.getAllRecipes(searchDto);
            
            // Filtrar recetas que contengan al menos uno de los ingredientes
            const filteredRecipes = result.recipes.filter(recipe => 
                recipe.ingredients.some(recipeIngredient =>
                    ingredientArray.some(searchIngredient =>
                        recipeIngredient.ingredient_name.toLowerCase().includes(searchIngredient.toLowerCase())
                    )
                )
            );

            res.status(200).json({
                status: 'success',
                message: `Encontradas ${filteredRecipes.length} recetas con los ingredientes solicitados`,
                results: filteredRecipes.length,
                data: { recipes: filteredRecipes },
            });
        } catch (error: any) {
            console.error('Error en RecipeController.searchByIngredients:', error);
            if (error instanceof AppError) {
                return next(error);
            }
            next(new AppError('Error al buscar recetas por ingredientes.', 500));
        }
    }

    // Obtener recetas populares/recomendadas
    public async getPopularRecipes(req: Request, res: Response, next: NextFunction) {
        try {
            const searchDto: RecipeSearchDto = {
                sortBy: 'created_desc',
                limit: 12
            };

            const result = await recipeService.getAllRecipes(searchDto);
            
            res.status(200).json({
                status: 'success',
                message: 'Recetas populares obtenidas exitosamente',
                results: result.recipes.length,
                data: { recipes: result.recipes },
            });
        } catch (error: any) {
            console.error('Error en RecipeController.getPopularRecipes:', error);
            if (error instanceof AppError) {
                return next(error);
            }
            next(new AppError('Error al obtener recetas populares.', 500));
        }
    }
}

export default new RecipeController(); 