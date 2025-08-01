import { Request, Response, NextFunction } from 'express';
import { WeeklyPlanTemplateService } from './weekly-plan-template.service';
import { TemplateCategory } from '../../database/entities/weekly-plan-template.entity';
import { AppError } from '../../utils/app.error';

export class WeeklyPlanTemplateController {
    private templateService: WeeklyPlanTemplateService;

    constructor() {
        this.templateService = new WeeklyPlanTemplateService();
    }

    // Crear nueva plantilla
    public async createTemplate(req: Request, res: Response, next: NextFunction) {
        try {
            const nutritionistId = req.user?.id;
            if (!nutritionistId) {
                throw new AppError('Usuario no autenticado', 401);
            }

            const templateData = {
                name: req.body.name,
                description: req.body.description,
                category: req.body.category as TemplateCategory,
                tags: req.body.tags,
                isPublic: req.body.isPublic,
                targetCalories: req.body.targetCalories,
                targetMacros: req.body.targetMacros,
                notes: req.body.notes,
                mealTiming: req.body.mealTiming,
                dietaryRestrictions: req.body.dietaryRestrictions,
                difficultyLevel: req.body.difficultyLevel,
                avgPrepTimeMinutes: req.body.avgPrepTimeMinutes,
                estimatedWeeklyCost: req.body.estimatedWeeklyCost
            };

            const template = await this.templateService.createTemplate(templateData, nutritionistId);

            res.status(201).json({
                success: true,
                message: 'Plantilla creada exitosamente',
                data: template
            });
        } catch (error) {
            console.error('Error en createTemplate:', error);
            next(error);
        }
    }

    // Obtener plantillas (propias + públicas)
    public async getTemplates(req: Request, res: Response, next: NextFunction) {
        try {
            const nutritionistId = req.user?.id;
            if (!nutritionistId) {
                throw new AppError('Usuario no autenticado', 401);
            }

            const filters = {
                category: req.query.category as TemplateCategory,
                search: req.query.search as string,
                tags: req.query.tags ? (req.query.tags as string).split(',') : undefined,
                isPublic: req.query.isPublic === 'true' ? true : req.query.isPublic === 'false' ? false : undefined,
                page: req.query.page ? parseInt(req.query.page as string) : 1,
                limit: req.query.limit ? parseInt(req.query.limit as string) : 20
            };

            const result = await this.templateService.getTemplates(nutritionistId, filters);

            res.json({
                success: true,
                message: 'Plantillas obtenidas exitosamente',
                data: result.templates,
                pagination: {
                    page: filters.page,
                    limit: filters.limit,
                    total: result.total,
                    totalPages: Math.ceil(result.total / filters.limit)
                }
            });
        } catch (error) {
            console.error('Error en getTemplates:', error);
            next(error);
        }
    }

    // Obtener plantilla por ID
    public async getTemplateById(req: Request, res: Response, next: NextFunction) {
        try {
            const nutritionistId = req.user?.id;
            if (!nutritionistId) {
                throw new AppError('Usuario no autenticado', 401);
            }

            const templateId = req.params.id;
            const template = await this.templateService.getTemplateById(templateId, nutritionistId);

            res.json({
                success: true,
                message: 'Plantilla obtenida exitosamente',
                data: template
            });
        } catch (error) {
            console.error('Error en getTemplateById:', error);
            next(error);
        }
    }

    // Actualizar plantilla
    public async updateTemplate(req: Request, res: Response, next: NextFunction) {
        try {
            const nutritionistId = req.user?.id;
            if (!nutritionistId) {
                throw new AppError('Usuario no autenticado', 401);
            }

            const templateId = req.params.id;
            const updateData = {
                name: req.body.name,
                description: req.body.description,
                category: req.body.category,
                tags: req.body.tags,
                isPublic: req.body.isPublic,
                targetCalories: req.body.targetCalories,
                targetMacros: req.body.targetMacros,
                notes: req.body.notes,
                mealTiming: req.body.mealTiming,
                dietaryRestrictions: req.body.dietaryRestrictions,
                difficultyLevel: req.body.difficultyLevel,
                avgPrepTimeMinutes: req.body.avgPrepTimeMinutes,
                estimatedWeeklyCost: req.body.estimatedWeeklyCost
            };

            const template = await this.templateService.updateTemplate(templateId, updateData, nutritionistId);

            res.json({
                success: true,
                message: 'Plantilla actualizada exitosamente',
                data: template
            });
        } catch (error) {
            console.error('Error en updateTemplate:', error);
            next(error);
        }
    }

    // Eliminar plantilla
    public async deleteTemplate(req: Request, res: Response, next: NextFunction) {
        try {
            const nutritionistId = req.user?.id;
            if (!nutritionistId) {
                throw new AppError('Usuario no autenticado', 401);
            }

            const templateId = req.params.id;
            await this.templateService.deleteTemplate(templateId, nutritionistId);

            res.json({
                success: true,
                message: 'Plantilla eliminada exitosamente'
            });
        } catch (error) {
            console.error('Error en deleteTemplate:', error);
            next(error);
        }
    }

    // Aplicar plantilla a un plan de dieta
    public async applyTemplate(req: Request, res: Response, next: NextFunction) {
        try {
            const nutritionistId = req.user?.id;
            if (!nutritionistId) {
                throw new AppError('Usuario no autenticado', 401);
            }

            const applyData = {
                templateId: req.body.templateId,
                patientId: req.body.patientId,
                dietPlanId: req.body.dietPlanId,
                weekNumber: req.body.weekNumber,
                adjustments: req.body.adjustments
            };

            const meals = await this.templateService.applyTemplateToWeek(applyData, nutritionistId);

            res.json({
                success: true,
                message: 'Plantilla aplicada exitosamente',
                data: {
                    mealsCreated: meals.length,
                    meals: meals
                }
            });
        } catch (error) {
            console.error('Error en applyTemplate:', error);
            next(error);
        }
    }

    // Crear plantilla desde un plan existente
    public async createFromWeek(req: Request, res: Response, next: NextFunction) {
        try {
            const nutritionistId = req.user?.id;
            if (!nutritionistId) {
                throw new AppError('Usuario no autenticado', 401);
            }

            const templateData = {
                name: req.body.name,
                description: req.body.description,
                category: req.body.category as TemplateCategory,
                tags: req.body.tags,
                isPublic: req.body.isPublic,
                targetCalories: req.body.targetCalories,
                targetMacros: req.body.targetMacros,
                notes: req.body.notes,
                mealTiming: req.body.mealTiming,
                dietaryRestrictions: req.body.dietaryRestrictions,
                difficultyLevel: req.body.difficultyLevel,
                avgPrepTimeMinutes: req.body.avgPrepTimeMinutes,
                estimatedWeeklyCost: req.body.estimatedWeeklyCost
            };

            const template = await this.templateService.createTemplateFromWeek(
                req.body.dietPlanId,
                req.body.weekNumber,
                templateData,
                nutritionistId
            );

            res.status(201).json({
                success: true,
                message: 'Plantilla creada desde el plan exitosamente',
                data: template
            });
        } catch (error) {
            console.error('Error en createFromWeek:', error);
            next(error);
        }
    }

    // Calificar plantilla
    public async rateTemplate(req: Request, res: Response, next: NextFunction) {
        try {
            const nutritionistId = req.user?.id;
            if (!nutritionistId) {
                throw new AppError('Usuario no autenticado', 401);
            }

            const templateId = req.params.id;
            const rating = req.body.rating;

            if (!rating || rating < 1 || rating > 5) {
                throw new AppError('La calificación debe estar entre 1 y 5', 400);
            }

            const template = await this.templateService.rateTemplate(templateId, rating, nutritionistId);

            res.json({
                success: true,
                message: 'Plantilla calificada exitosamente',
                data: {
                    templateId: template.id,
                    newRating: template.rating,
                    ratingCount: template.ratingCount
                }
            });
        } catch (error) {
            console.error('Error en rateTemplate:', error);
            next(error);
        }
    }

    // Obtener categorías disponibles
    public async getCategories(req: Request, res: Response, next: NextFunction) {
        try {
            const categories = Object.values(TemplateCategory).map(category => ({
                value: category,
                label: this.getCategoryLabel(category)
            }));

            res.json({
                success: true,
                message: 'Categorías obtenidas exitosamente',
                data: categories
            });
        } catch (error) {
            console.error('Error en getCategories:', error);
            next(error);
        }
    }

    // Helper para obtener etiquetas de categorías
    private getCategoryLabel(category: TemplateCategory): string {
        const labels: Record<TemplateCategory, string> = {
            [TemplateCategory.WEIGHT_LOSS]: 'Pérdida de Peso',
            [TemplateCategory.WEIGHT_GAIN]: 'Aumento de Peso',
            [TemplateCategory.MUSCLE_GAIN]: 'Ganancia Muscular',
            [TemplateCategory.MAINTENANCE]: 'Mantenimiento',
            [TemplateCategory.DIABETIC]: 'Diabético',
            [TemplateCategory.HYPERTENSION]: 'Hipertensión',
            [TemplateCategory.VEGETARIAN]: 'Vegetariano',
            [TemplateCategory.VEGAN]: 'Vegano',
            [TemplateCategory.KETO]: 'Ketogénico',
            [TemplateCategory.MEDITERRANEAN]: 'Mediterráneo',
            [TemplateCategory.LOW_SODIUM]: 'Bajo en Sodio',
            [TemplateCategory.LOW_CARB]: 'Bajo en Carbohidratos',
            [TemplateCategory.HIGH_PROTEIN]: 'Alto en Proteínas',
            [TemplateCategory.CUSTOM]: 'Personalizado'
        };
        return labels[category] || category;
    }
} 