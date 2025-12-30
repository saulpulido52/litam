// src/modules/foods/food.controller.ts
import { Request, Response, NextFunction } from 'express';
import foodService from '../../modules/foods/food.service';
import { AppError } from '../../utils/app.error';
import { CreateFoodDto, UpdateFoodDto } from '../../modules/foods/food.dto';
import { RoleName } from '../../database/entities/role.entity'; // Necesario para verificar roles si se usa en el controlador

class FoodController {
    public async createFood(req: Request, res: Response, next: NextFunction) {
        try {
            if (!req.user || (req.user.role.name !== RoleName.NUTRITIONIST && req.user.role.name !== RoleName.ADMIN)) {
                return next(new AppError('Acceso denegado. Solo nutriólogos o administradores pueden crear alimentos.', 403));
            }
            const food = await foodService.createFood(req.body as CreateFoodDto, req.user.id);
            res.status(201).json({
                status: 'success',
                data: { food },
            });
        } catch (error: any) {
            if (error instanceof AppError) {
                return next(error);
            }
            next(new AppError('Error al crear el alimento.', 500));
        }
    }

    public async getAllFoods(req: Request, res: Response, next: NextFunction) {
        try {
            // Todos los usuarios pueden ver la lista de alimentos (podría restringirse si es necesario)
            const foods = await foodService.getAllFoods();
            res.status(200).json({
                status: 'success',
                results: foods.length,
                data: { foods },
            });
        } catch (error: any) {
            if (error instanceof AppError) {
                return next(error);
            }
            next(new AppError('Error al obtener los alimentos.', 500));
        }
    }

    public async getFoodById(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            const food = await foodService.getFoodById(id);
            res.status(200).json({
                status: 'success',
                data: { food },
            });
        } catch (error: any) {
            if (error instanceof AppError) {
                return next(error);
            }
            next(new AppError('Error al obtener el alimento.', 500));
        }
    }

    public async updateFood(req: Request, res: Response, next: NextFunction) {
        try {
            if (!req.user) {
                return next(new AppError('Usuario no autenticado.', 401));
            }
            const { id } = req.params;
            const updatedFood = await foodService.updateFood(id, req.body as UpdateFoodDto, req.user.id);
            res.status(200).json({
                status: 'success',
                data: { food: updatedFood },
            });
        } catch (error: any) {
            if (error instanceof AppError) {
                return next(error);
            }
            next(new AppError('Error al actualizar el alimento.', 500));
        }
    }

    public async deleteFood(req: Request, res: Response, next: NextFunction) {
        try {
            if (!req.user) {
                return next(new AppError('Usuario no autenticado.', 401));
            }
            const { id } = req.params;
            await foodService.deleteFood(id, req.user.id);
            res.status(204).json({ // 204 No Content para eliminación exitosa
                status: 'success',
                data: null,
            });
        } catch (error: any) {
            if (error instanceof AppError) {
                return next(error);
            }
            next(new AppError('Error al eliminar el alimento.', 500));
        }
    }

    // Nuevo método para buscar usando NutritionService (Edamam + Cache)
    public async searchFood(req: Request, res: Response, next: NextFunction) {
        try {
            const { query } = req.query;
            if (!query || typeof query !== 'string') {
                return next(new AppError('Se requiere un parámetro de búsqueda (query).', 400));
            }

            // Usar el servicio de nutrición importado dinámicamente o estático si ya está disponible
            // Importando aquí para evitar dependencias circulares si las hubiera, 
            // o idealmente importando arriba.
            const { default: nutritionService } = await import('../nutrition/nutrition.service');

            const food = await nutritionService.fetchRecipeDetails(query, req.user?.id);

            res.status(200).json({
                status: 'success',
                data: { food },
            });
        } catch (error: any) {
            // Si es 404, devolvemos success false pero sin explotar, o dejamos que el error handler lo maneje
            if (error instanceof AppError) {
                return next(error);
            }
            next(new AppError('Error al buscar el alimento.', 500));
        }
    }
}

export default new FoodController();