// src/modules/educational_content/educational_content.controller.ts
import { Request, Response, NextFunction } from 'express';
import educationalContentService from '../../modules/educational_content/educational_content.service';
import { AppError } from '../../utils/app.error';
import {
    CreateUpdateEducationalContentDto,
    CreateUpdateRecipeDto,
} from '../../modules/educational_content/educational_content.dto';
import { RoleName } from '../../database/entities/role.entity';
import { ContentType } from '../../database/entities/educational_content.entity';

class EducationalContentController {
    // --- Gestión de Contenido Educativo (Artículos, Guías, Videos) ---

    public async createEducationalContent(req: Request, res: Response, next: NextFunction) {
        try {
            if (!req.user || (req.user.role.name !== RoleName.NUTRITIONIST && req.user.role.name !== RoleName.ADMIN)) {
                return next(new AppError('Acceso denegado. Solo nutriólogos o administradores pueden crear contenido educativo.', 403));
            }
            const content = await educationalContentService.createEducationalContent(req.body as CreateUpdateEducationalContentDto, req.user.id);
            res.status(201).json({
                status: 'success',
                data: { content },
            });
        } catch (error: any) {
            console.error('Error en EducationalContentController.createEducationalContent:', error);
            if (error instanceof AppError) {
                return next(error);
            }
            next(new AppError('Error al crear el contenido educativo.', 500));
        }
    }

    public async getAllEducationalContent(req: Request, res: Response, next: NextFunction) {
        try {
            // Parámetros de query para filtrar
            const isPublished = req.query.isPublished === 'true' ? true : req.query.isPublished === 'false' ? false : undefined;
            const type = req.query.type as ContentType | undefined;
            const tags = req.query.tags ? (req.query.tags as string).split(',') : undefined;

            const content = await educationalContentService.getAllEducationalContent(isPublished, type, tags);
            res.status(200).json({
                status: 'success',
                results: content.length,
                data: { content },
            });
        } catch (error: any) {
            console.error('Error en EducationalContentController.getAllEducationalContent:', error);
            if (error instanceof AppError) {
                return next(error);
            }
            next(new AppError('Error al obtener el contenido educativo.', 500));
        }
    }

    public async getEducationalContentById(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            const content = await educationalContentService.getEducationalContentById(id);
            res.status(200).json({
                status: 'success',
                data: { content },
            });
        } catch (error: any) {
            console.error('Error en EducationalContentController.getEducationalContentById:', error);
            if (error instanceof AppError) {
                return next(error);
            }
            next(new AppError('Error al obtener el contenido educativo.', 500));
        }
    }

    public async updateEducationalContent(req: Request, res: Response, next: NextFunction) {
        try {
            if (!req.user || (req.user.role.name !== RoleName.NUTRITIONIST && req.user.role.name !== RoleName.ADMIN)) {
                return next(new AppError('Acceso denegado. Solo nutriólogos o administradores pueden actualizar contenido educativo.', 403));
            }
            const { id } = req.params;
            const updatedContent = await educationalContentService.updateEducationalContent(id, req.body as CreateUpdateEducationalContentDto, req.user.id);
            res.status(200).json({
                status: 'success',
                message: 'Contenido educativo actualizado exitosamente.',
                data: { content: updatedContent },
            });
        } catch (error: any) {
            console.error('Error en EducationalContentController.updateEducationalContent:', error);
            if (error instanceof AppError) {
                return next(error);
            }
            next(new AppError('Error al actualizar el contenido educativo.', 500));
        }
    }

    public async deleteEducationalContent(req: Request, res: Response, next: NextFunction) {
        try {
            if (!req.user || (req.user.role.name !== RoleName.NUTRITIONIST && req.user.role.name !== RoleName.ADMIN)) {
                return next(new AppError('Acceso denegado. Solo nutriólogos o administradores pueden eliminar contenido educativo.', 403));
            }
            const { id } = req.params;
            await educationalContentService.deleteEducationalContent(id, req.user.id);
            res.status(204).json({
                status: 'success',
                data: null,
            });
        } catch (error: any) {
            console.error('Error en EducationalContentController.deleteEducationalContent:', error);
            if (error instanceof AppError) {
                return next(error);
            }
            next(new AppError('Error al eliminar el contenido educativo.', 500));
        }
    }

    // --- Gestión de Recetas ---

    public async createRecipe(req: Request, res: Response, next: NextFunction) {
        try {
            if (!req.user || (req.user.role.name !== RoleName.NUTRITIONIST && req.user.role.name !== RoleName.ADMIN)) {
                return next(new AppError('Acceso denegado. Solo nutriólogos o administradores pueden crear recetas.', 403));
            }
            const recipe = await educationalContentService.createRecipe(req.body as CreateUpdateRecipeDto, req.user.id);
            res.status(201).json({
                status: 'success',
                data: { recipe },
            });
        } catch (error: any) {
            console.error('Error en EducationalContentController.createRecipe:', error);
            if (error instanceof AppError) {
                return next(error);
            }
            next(new AppError('Error al crear la receta.', 500));
        }
    }

    public async getAllRecipes(req: Request, res: Response, next: NextFunction) {
        try {
            const isPublished = req.query.isPublished === 'true' ? true : req.query.isPublished === 'false' ? false : undefined;
            const tags = req.query.tags ? (req.query.tags as string).split(',') : undefined;
            const keyword = req.query.keyword as string | undefined;

            const recipes = await educationalContentService.getAllRecipes(isPublished, tags, keyword);
            res.status(200).json({
                status: 'success',
                results: recipes.length,
                data: { recipes },
            });
        } catch (error: any) {
            console.error('Error en EducationalContentController.getAllRecipes:', error);
            if (error instanceof AppError) {
                return next(error);
            }
            next(new AppError('Error al obtener las recetas.', 500));
        }
    }

    public async getRecipeById(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            const recipe = await educationalContentService.getRecipeById(id);
            res.status(200).json({
                status: 'success',
                data: { recipe },
            });
        } catch (error: any) {
            console.error('Error en EducationalContentController.getRecipeById:', error);
            if (error instanceof AppError) {
                return next(error);
            }
            next(new AppError('Error al obtener la receta.', 500));
        }
    }

    public async updateRecipe(req: Request, res: Response, next: NextFunction) {
        try {
            if (!req.user || (req.user.role.name !== RoleName.NUTRITIONIST && req.user.role.name !== RoleName.ADMIN)) {
                return next(new AppError('Acceso denegado. Solo nutriólogos o administradores pueden actualizar recetas.', 403));
            }
            const { id } = req.params;
            const updatedRecipe = await educationalContentService.updateRecipe(id, req.body as CreateUpdateRecipeDto, req.user.id); // Usar el DTO correcto para recetas
            res.status(200).json({
                status: 'success',
                message: 'Receta actualizada exitosamente.',
                data: { recipe: updatedRecipe },
            });
        } catch (error: any) {
            console.error('Error en EducationalContentController.updateRecipe:', error);
            if (error instanceof AppError) {
                return next(error);
            }
            next(new AppError('Error al actualizar la receta.', 500));
        }
    }

    public async deleteRecipe(req: Request, res: Response, next: NextFunction) {
        try {
            if (!req.user || (req.user.role.name !== RoleName.NUTRITIONIST && req.user.role.name !== RoleName.ADMIN)) {
                return next(new AppError('Acceso denegado. Solo nutriólogos o administradores pueden eliminar recetas.', 403));
            }
            const { id } = req.params;
            await educationalContentService.deleteRecipe(id, req.user.id);
            res.status(204).json({
                status: 'success',
                data: null,
            });
        } catch (error: any) {
            console.error('Error en EducationalContentController.deleteRecipe:', error);
            if (error instanceof AppError) {
                return next(error);
            }
            next(new AppError('Error al eliminar la receta.', 500));
        }
    }
}

export default new EducationalContentController();