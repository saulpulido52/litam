// users.controller.ts 
import { Request, Response, NextFunction } from 'express';
import userService from '../../modules/users/users.service'; // Ruta corregida
import { AppError } from '../../utils/app.error';

class UserController {
    public async getMyProfile(req: Request, res: Response, next: NextFunction) {
        try {
            if (!req.user) {
                return next(new AppError('Usuario no autenticado en la solicitud.', 401));
            }
            const user = await userService.getUserProfile(req.user.id);
            res.status(200).json({
                status: 'success',
                data: { user },
            });
        } catch (error: any) {
            if (error instanceof AppError) {
                return next(error);
            }
            next(new AppError('Error al obtener el perfil.', 500));
        }
    }

    public async updateMyProfile(req: Request, res: Response, next: NextFunction) {
        try {
            if (!req.user) {
                return next(new AppError('Usuario no autenticado en la solicitud.', 401));
            }
            const updatedUser = await userService.updateProfile(req.user.id, req.body);
            res.status(200).json({
                status: 'success',
                data: { user: updatedUser },
            });
        } catch (error: any) {
            if (error instanceof AppError) {
                return next(error);
            }
            next(new AppError('Error al actualizar el perfil.', 500));
        }
    }

    public async updatePassword(req: Request, res: Response, next: NextFunction) {
        try {
            if (!req.user) {
                return next(new AppError('Usuario no autenticado en la solicitud.', 401));
            }

            const { currentPassword, newPassword } = req.body;

            if (!currentPassword || !newPassword) {
                return next(new AppError('Contraseña actual y nueva contraseña son requeridas.', 400));
            }

            const result = await userService.updatePassword(req.user.id, currentPassword, newPassword);
            res.status(200).json({
                status: 'success',
                data: result,
            });
        } catch (error: any) {
            if (error instanceof AppError) {
                return next(error);
            }
            next(new AppError('Error al actualizar la contraseña.', 500));
        }
    }

    public async getProfileStats(req: Request, res: Response, next: NextFunction) {
        try {
            if (!req.user) {
                return next(new AppError('Usuario no autenticado en la solicitud.', 401));
            }

            const stats = await userService.getProfileStats(req.user.id);
            res.status(200).json({
                status: 'success',
                data: { stats },
            });
        } catch (error: any) {
            if (error instanceof AppError) {
                return next(error);
            }
            next(new AppError('Error al obtener estadísticas del perfil.', 500));
        }
    }

    public async updateNotificationSettings(req: Request, res: Response, next: NextFunction) {
        try {
            if (!req.user) {
                return next(new AppError('Usuario no autenticado en la solicitud.', 401));
            }

            const result = await userService.updateNotificationSettings(req.user.id, req.body);
            res.status(200).json({
                status: 'success',
                data: result,
            });
        } catch (error: any) {
            if (error instanceof AppError) {
                return next(error);
            }
            next(new AppError('Error al actualizar configuraciones de notificación.', 500));
        }
    }

    public async deleteAccount(req: Request, res: Response, next: NextFunction) {
        try {
            if (!req.user) {
                return next(new AppError('Usuario no autenticado en la solicitud.', 401));
            }

            const { confirmPassword } = req.body;

            if (!confirmPassword) {
                return next(new AppError('Contraseña de confirmación es requerida.', 400));
            }

            const result = await userService.deleteAccount(req.user.id, confirmPassword);
            res.status(200).json({
                status: 'success',
                data: result,
            });
        } catch (error: any) {
            if (error instanceof AppError) {
                return next(error);
            }
            next(new AppError('Error al eliminar la cuenta.', 500));
        }
    }
}

export default new UserController();