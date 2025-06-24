// src/modules/auth/auth.controller.ts
import { Request, Response, NextFunction } from 'express';
import authService from '../../modules/auth/auth.service';
import { AppError } from '../../utils/app.error';

class AuthController {
    public async registerPatient(req: Request, res: Response, next: NextFunction) {
        try {
            const { user, token } = await authService.registerPatient(req.body);
            res.status(201).json({
                status: 'success',
                data: { user, token },
            });
        } catch (error: any) {
            console.error('Error en AuthController.registerPatient:', error); // LOG DE DEBUG
            if (error instanceof AppError) {
                return next(error);
            }
            next(new AppError('Error al registrar paciente.', 500));
        }
    }

    public async registerNutritionist(req: Request, res: Response, next: NextFunction) {
        try {
            const { user, token } = await authService.registerNutritionist(req.body);
            res.status(201).json({
                status: 'success',
                data: { user, token },
            });
        } catch (error: any) {
            console.error('Error en AuthController.registerNutritionist:', error); // LOG DE DEBUG
            if (error instanceof AppError) {
                return next(error);
            }
            next(new AppError('Error al registrar nutriólogo.', 500));
        }
    }

    public async login(req: Request, res: Response, next: NextFunction) {
        try {
            const { user, token } = await authService.login(req.body);
            res.status(200).json({
                status: 'success',
                data: { user, token },
            });
        } catch (error: any) {
            console.error('Error en AuthController.login:', error); // LOG DE DEBUG
            if (error instanceof AppError) {
                return next(error);
            }
            next(new AppError('Error de autenticación.', 500));
        }
    }

    public async logout(req: Request, res: Response, next: NextFunction) {
        res.status(200).json({ status: 'success', message: 'Sesión cerrada exitosamente.' });
    }
}

export default new AuthController();