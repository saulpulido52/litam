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
}

export default new UserController();