// src/modules/admin/admin.controller.ts
import { Request, Response, NextFunction } from 'express';
import adminService from '../../modules/admin/admin.service';
import { AppError } from '../../utils/app.error';
import {
    AdminUpdateUserDto,
    AdminVerifyNutritionistDto,
    AdminUpdateUserSubscriptionDto,
    AdminUpdateSettingsDto, // Si se añade
} from '../../modules/admin/admin.dto';
import { RoleName } from '../../database/entities/role.entity';
import { SubscriptionStatus } from '../../database/entities/user_subscription.entity'; // Para tipo en query param

class AdminController {
    // --- Gestión de Usuarios ---

    public async getAllUsers(req: Request, res: Response, next: NextFunction) {
        try {
            // Los query params llegan como string, AdminUpdateUserDto los validará si se usa.
            const role = req.query.role as RoleName | undefined;
            const isActive = req.query.isActive === 'true' ? true : req.query.isActive === 'false' ? false : undefined;
            const page = parseInt(req.query.page as string || '1', 10);
            const limit = parseInt(req.query.limit as string || '20', 10);

            const result = await adminService.getAllUsers(role, isActive, page, limit);
            res.status(200).json({
                status: 'success',
                ...result, // users, total, page, limit, totalPages
            });
        } catch (error: any) {
            console.error('Error en AdminController.getAllUsers:', error);
            if (error instanceof AppError) {
                return next(error);
            }
            next(new AppError('Error al obtener todos los usuarios.', 500));
        }
    }

    public async getUserById(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            const user = await adminService.getUserById(id);
            res.status(200).json({
                status: 'success',
                data: { user },
            });
        } catch (error: any) {
            console.error('Error en AdminController.getUserById:', error);
            if (error instanceof AppError) {
                return next(error);
            }
            next(new AppError('Error al obtener el usuario.', 500));
        }
    }

    public async adminUpdateUser(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            const updatedUser = await adminService.adminUpdateUser(id, req.body as AdminUpdateUserDto);
            res.status(200).json({
                status: 'success',
                message: 'Usuario actualizado exitosamente.',
                data: { user: updatedUser },
            });
        } catch (error: any) {
            console.error('Error en AdminController.adminUpdateUser:', error);
            if (error instanceof AppError) {
                return next(error);
            }
            next(new AppError('Error al actualizar el usuario.', 500));
        }
    }

    public async adminDeleteUser(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            await adminService.adminDeleteUser(id);
            res.status(204).json({
                status: 'success',
                data: null,
            });
        } catch (error: any) {
            console.error('Error en AdminController.adminDeleteUser:', error);
            if (error instanceof AppError) {
                return next(error);
            }
            next(new AppError('Error al eliminar el usuario.', 500));
        }
    }

    public async adminVerifyNutritionist(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params; // ID del nutriólogo a verificar
            const result = await adminService.adminVerifyNutritionist(id, req.body as AdminVerifyNutritionistDto);
            res.status(200).json({
                status: 'success',
                message: result.message,
            });
        } catch (error: any) {
            console.error('Error en AdminController.adminVerifyNutritionist:', error);
            if (error instanceof AppError) {
                return next(error);
            }
            next(new AppError('Error al verificar el nutriólogo.', 500));
        }
    }

    // --- Gestión de Suscripciones de Usuario (por Admin) ---

    public async getAllUserSubscriptions(req: Request, res: Response, next: NextFunction) {
        try {
            const status = req.query.status as SubscriptionStatus | undefined;
            const page = parseInt(req.query.page as string || '1', 10);
            const limit = parseInt(req.query.limit as string || '20', 10);

            const result = await adminService.getAllUserSubscriptions(status, page, limit);
            res.status(200).json({
                status: 'success',
                ...result, // subscriptions, total, page, limit, totalPages
            });
        } catch (error: any) {
            console.error('Error en AdminController.getAllUserSubscriptions:', error);
            if (error instanceof AppError) {
                return next(error);
            }
            next(new AppError('Error al obtener todas las suscripciones de usuarios.', 500));
        }
    }

    public async adminUpdateUserSubscription(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params; // ID de la UserSubscription
            const updatedSubscription = await adminService.adminUpdateUserSubscription(id, req.body as AdminUpdateUserSubscriptionDto);
            res.status(200).json({
                status: 'success',
                message: 'Suscripción de usuario actualizada exitosamente por admin.',
                data: { subscription: updatedSubscription },
            });
        } catch (error: any) {
            console.error('Error en AdminController.adminUpdateUserSubscription:', error);
            if (error instanceof AppError) {
                return next(error);
            }
            next(new AppError('Error al actualizar la suscripción de usuario por admin.', 500));
        }
    }

    public async adminDeleteUserSubscription(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params; // ID de la UserSubscription
            await adminService.adminDeleteUserSubscription(id);
            res.status(204).json({
                status: 'success',
                data: null,
            });
        } catch (error: any) {
            console.error('Error en AdminController.adminDeleteUserSubscription:', error);
            if (error instanceof AppError) {
                return next(error);
            }
            next(new AppError('Error al eliminar la suscripción de usuario por admin.', 500));
        }
    }

    // --- Gestión de Configuraciones (ej. para la IA, general) ---
    // Esto es un placeholder; la implementación real dependería del tipo de configuración.
    public async updateGeneralSettings(req: Request, res: Response, next: NextFunction) {
        try {
            // const settings = await adminService.updateSettings(req.body as AdminUpdateSettingsDto);
            res.status(200).json({
                status: 'success',
                message: 'Configuración general actualizada (simulado).',
                data: req.body,
            });
        } catch (error: any) {
            console.error('Error en AdminController.updateGeneralSettings:', error);
            if (error instanceof AppError) {
                return next(error);
            }
            next(new AppError('Error al actualizar la configuración general.', 500));
        }
    }
}

export default new AdminController();