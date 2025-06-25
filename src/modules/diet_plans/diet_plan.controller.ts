// src/modules/diet_plans/diet_plan.controller.ts
import { Request, Response, NextFunction } from 'express';
import dietPlanService from '../../modules/diet_plans/diet_plan.service';
import { AppError } from '../../utils/app.error';
import {
    CreateDietPlanDto,
    UpdateDietPlanDto,
    GenerateDietPlanAiDto,
    UpdateDietPlanStatusDto,
    WeeklyPlanDto,
} from '../../modules/diet_plans/diet_plan.dto';
import { RoleName } from '../../database/entities/role.entity';
import { DietPlanStatus } from '../../database/entities/diet_plan.entity';

class DietPlanController {
    public async createDietPlan(req: Request, res: Response, next: NextFunction) {
        try {
            if (!req.user || (req.user.role.name !== RoleName.NUTRITIONIST && req.user.role.name !== RoleName.ADMIN)) {
                return next(new AppError('Acceso denegado. Solo nutriólogos o administradores pueden crear planes de dieta.', 403));
            }
            const dietPlan = await dietPlanService.createDietPlan(req.body as CreateDietPlanDto, req.user.id);
            res.status(201).json({
                status: 'success',
                data: { dietPlan },
            });
        } catch (error: any) {
            console.error('Error en DietPlanController.createDietPlan:', error); // LOG DE DEBUG
            if (error instanceof AppError) {
                return next(error);
            }
            next(new AppError('Error al crear el plan de dieta.', 500));
        }
    }

    public async generateDietPlanByAI(req: Request, res: Response, next: NextFunction) {
        try {
            if (!req.user || req.user.role.name !== RoleName.NUTRITIONIST) {
                return next(new AppError('Acceso denegado. Solo nutriólogos pueden generar planes de dieta con IA.', 403));
            }
            const dietPlan = await dietPlanService.generateDietPlanByAI(req.body as GenerateDietPlanAiDto, req.user.id);
            res.status(201).json({
                status: 'success',
                message: 'Plan de dieta generado por IA (requiere revisión).',
                data: { dietPlan },
            });
        } catch (error: any) {
            console.error('Error en DietPlanController.generateDietPlanByAI:', error); // LOG DE DEBUG
            if (error instanceof AppError) {
                return next(error);
            }
            next(new AppError('Error al generar el plan de dieta con IA.', 500));
        }
    }

    public async getDietPlanById(req: Request, res: Response, next: NextFunction) {
        try {
            if (!req.user) {
                return next(new AppError('Usuario no autenticado.', 401));
            }
            const { id } = req.params;
            const dietPlan = await dietPlanService.getDietPlanById(id, req.user.id, req.user.role.name);
            res.status(200).json({
                status: 'success',
                data: { dietPlan },
            });
        } catch (error: any) {
            console.error('Error en DietPlanController.getDietPlanById:', error); // LOG DE DEBUG
            if (error instanceof AppError) {
                return next(error);
            }
            next(new AppError('Error al obtener el plan de dieta.', 500));
        }
    }

    public async getMyDietPlans(req: Request, res: Response, next: NextFunction) {
        try {
            if (!req.user || req.user.role.name !== RoleName.NUTRITIONIST) {
                return next(new AppError('Acceso denegado. Solo nutriólogos pueden ver sus planes de dieta.', 403));
            }
            
            const dietPlans = await dietPlanService.getDietPlansForNutritionist(req.user.id);
            res.status(200).json({
                status: 'success',
                results: dietPlans.length,
                data: { dietPlans },
            });
        } catch (error: any) {
            console.error('Error en DietPlanController.getMyDietPlans:', error);
            if (error instanceof AppError) {
                return next(error);
            }
            next(new AppError('Error al obtener los planes de dieta del nutriólogo.', 500));
        }
    }

    public async getDietPlansForPatient(req: Request, res: Response, next: NextFunction) {
        try {
            if (!req.user) {
                return next(new AppError('Usuario no autenticado.', 401));
            }

            const { patientId } = req.params;
            const userRole = req.user.role.name;

            // Permitir que pacientes vean sus propios planes
            if (userRole === RoleName.PATIENT && req.user.id !== patientId) {
                return next(new AppError('Acceso denegado. Solo puedes ver tus propios planes de dieta.', 403));
            }

            // Permitir que nutriólogos y administradores vean planes de pacientes
            if (userRole !== RoleName.PATIENT && userRole !== RoleName.NUTRITIONIST && userRole !== RoleName.ADMIN) {
                return next(new AppError('Acceso denegado. Solo pacientes, nutriólogos o administradores pueden ver planes de dieta.', 403));
            }

            const dietPlans = await dietPlanService.getDietPlansForPatient(patientId, req.user.id, userRole);
            res.status(200).json({
                status: 'success',
                results: dietPlans.length,
                data: { dietPlans },
            });
        } catch (error: any) {
            console.error('Error en DietPlanController.getDietPlansForPatient:', error); // LOG DE DEBUG
            if (error instanceof AppError) {
                return next(error);
            }
            next(new AppError('Error al obtener los planes de dieta para el paciente.', 500));
        }
    }

    public async updateDietPlan(req: Request, res: Response, next: NextFunction) {
        try {
            if (!req.user || req.user.role.name !== RoleName.NUTRITIONIST) {
                return next(new AppError('Acceso denegado. Solo nutriólogos pueden actualizar planes de dieta.', 403));
            }
            const { id } = req.params;
            const updatedDietPlan = await dietPlanService.updateDietPlan(id, req.body as UpdateDietPlanDto, req.user.id);
            res.status(200).json({
                status: 'success',
                data: { dietPlan: updatedDietPlan },
            });
        } catch (error: any) {
            console.error('Error en DietPlanController.updateDietPlan:', error); // LOG DE DEBUG
            if (error instanceof AppError) {
                return next(error);
            }
            next(new AppError('Error al actualizar el plan de dieta.', 500));
        }
    }

    public async updateDietPlanStatus(req: Request, res: Response, next: NextFunction) {
        try {
            if (!req.user || req.user.role.name !== RoleName.NUTRITIONIST) {
                return next(new AppError('Acceso denegado. Solo nutriólogos pueden cambiar el estado de un plan de dieta.', 403));
            }
            const { id } = req.params;
            const { status } = req.body as UpdateDietPlanStatusDto;

            const updatedDietPlan = await dietPlanService.updateDietPlanStatus(id, status, req.user.id);
            res.status(200).json({
                status: 'success',
                message: `Estado del plan actualizado a ${status}.`,
                data: { dietPlan: updatedDietPlan },
            });
        } catch (error: any) {
            console.error('Error en DietPlanController.updateDietPlanStatus:', error); // LOG DE DEBUG
            if (error instanceof AppError) {
                return next(error);
            }
            next(new AppError('Error al actualizar el estado del plan de dieta.', 500));
        }
    }

    public async addWeekToPlan(req: Request, res: Response, next: NextFunction) {
        try {
            if (!req.user || req.user.role.name !== RoleName.NUTRITIONIST) {
                return next(new AppError('Acceso denegado. Solo nutriólogos pueden agregar semanas a un plan de dieta.', 403));
            }
            const { id } = req.params;
            const weekData = req.body as WeeklyPlanDto;

            const updatedDietPlan = await dietPlanService.addWeekToPlan(id, weekData, req.user.id);
            res.status(200).json({
                status: 'success',
                message: `Semana ${weekData.weekNumber} agregada al plan de dieta.`,
                data: { dietPlan: updatedDietPlan },
            });
        } catch (error: any) {
            console.error('Error en DietPlanController.addWeekToPlan:', error);
            if (error instanceof AppError) {
                return next(error);
            }
            next(new AppError('Error al agregar semana al plan de dieta.', 500));
        }
    }

    public async deleteDietPlan(req: Request, res: Response, next: NextFunction) {
        try {
            if (!req.user || (req.user.role.name !== RoleName.NUTRITIONIST && req.user.role.name !== RoleName.ADMIN)) {
                return next(new AppError('Acceso denegado. Solo nutriólogos o administradores pueden eliminar planes de dieta.', 403));
            }
            const { id } = req.params;
            await dietPlanService.deleteDietPlan(id, req.user.id, req.user.role.name);
            res.status(200).json({
                status: 'success',
                message: 'Plan de dieta eliminado exitosamente.',
                data: null,
            });
        } catch (error: any) {
            console.error('Error en DietPlanController.deleteDietPlan:', error); // LOG DE DEBUG
            if (error instanceof AppError) {
                return next(error);
            }
            next(new AppError('Error al eliminar el plan de dieta.', 500));
        }
    }
}

export default new DietPlanController();