// src/modules/nutritionists/nutritionist.controller.ts
import { Request, Response, NextFunction } from 'express';
import nutritionistService from '../../modules/nutritionists/nutritionist.service';
import { AppError } from '../../utils/app.error';
import { CreateUpdateNutritionistProfileDto } from '../../modules/nutritionists/nutritionist.dto';

class NutritionistController {
    public async getMyProfile(req: Request, res: Response, next: NextFunction) {
        try {
            if (!req.user || req.user.role.name !== 'nutritionist') {
                return next(new AppError('Acceso denegado. Solo nutriólogos pueden ver este perfil.', 403));
            }
            const profile = await nutritionistService.getNutritionistProfile(req.user.id);
            // Incluir datos del usuario base
            const user = req.user;
            res.status(200).json({
                status: 'success',
                data: {
                    user: {
                        id: user.id,
                        email: user.email,
                        first_name: user.first_name,
                        last_name: user.last_name,
                        phone: user.phone,
                        age: user.age,
                        gender: user.gender
                    },
                    profile
                },
            });
        } catch (error: any) {
            if (error instanceof AppError) {
                return next(error);
            }
            next(new AppError('Error al obtener el perfil del nutriólogo.', 500));
        }
    }

    public async createOrUpdateMyProfile(req: Request, res: Response, next: NextFunction) {
        try {
            if (!req.user || req.user.role.name !== 'nutritionist') {
                return next(new AppError('Acceso denegado. Solo nutriólogos pueden actualizar su perfil.', 403));
            }
            const updatedProfile = await nutritionistService.createOrUpdateNutritionistProfile(req.user.id, req.body as CreateUpdateNutritionistProfileDto);
            res.status(200).json({
                status: 'success',
                data: { profile: updatedProfile },
            });
        } catch (error: any) {
            if (error instanceof AppError) {
                return next(error);
            }
            next(new AppError('Error al crear/actualizar el perfil del nutriólogo.', 500));
        }
    }
}

export default new NutritionistController();