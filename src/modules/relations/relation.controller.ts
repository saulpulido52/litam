// src/modules/relations/relation.controller.ts
import { Request, Response, NextFunction } from 'express';
import relationService from '@/modules/relations/relation.service';
import { AppError } from '@/utils/app.error';
import { RequestRelationDto, UpdateRelationStatusDto } from '@/modules/relations/relation.dto';
import { RoleName } from '@/database/entities/role.entity';
import { RelationshipStatus } from '@/database/entities/patient_nutritionist_relation.entity';

class RelationController {
    // --- Métodos para Pacientes ---

    public async requestRelation(req: Request, res: Response, next: NextFunction) {
        try {
            if (!req.user || req.user.role.name !== RoleName.PATIENT) {
                return next(new AppError('Solo los pacientes pueden solicitar una relación.', 403));
            }
            const relation = await relationService.requestRelation(req.user.id, req.body as RequestRelationDto);
            res.status(201).json({
                status: 'success',
                message: 'Solicitud de relación enviada.',
                data: { relation },
            });
        } catch (error: any) {
            if (error instanceof AppError) {
                return next(error);
            }
            next(new AppError('Error al enviar la solicitud de relación.', 500));
        }
    }

    public async getMyRequests(req: Request, res: Response, next: NextFunction) {
        try {
            if (!req.user || req.user.role.name !== RoleName.PATIENT) {
                return next(new AppError('Solo los pacientes pueden ver sus solicitudes.', 403));
            }
            const requests = await relationService.getPatientRequests(req.user.id);
            res.status(200).json({
                status: 'success',
                data: { requests },
            });
        } catch (error: any) {
            if (error instanceof AppError) {
                return next(error);
            }
            next(new AppError('Error al obtener las solicitudes del paciente.', 500));
        }
    }

    public async getMyActiveNutritionist(req: Request, res: Response, next: NextFunction) {
        try {
            if (!req.user || req.user.role.name !== RoleName.PATIENT) {
                return next(new AppError('Solo los pacientes pueden ver su nutriólogo activo.', 403));
            }
            const nutritionist = await relationService.getPatientActiveNutritionist(req.user.id);
            
            if (!nutritionist) {
                return next(new AppError('No tienes un nutriólogo activo asignado.', 404));
            }
            
            res.status(200).json({
                status: 'success',
                data: { nutritionist },
            });
        } catch (error: any) {
            if (error instanceof AppError) {
                return next(error);
            }
            next(new AppError('Error al obtener el nutriólogo activo.', 500));
        }
    }

    // --- Métodos para Nutriólogos ---

    public async getMyPendingRequests(req: Request, res: Response, next: NextFunction) {
        try {
            if (!req.user || req.user.role.name !== RoleName.NUTRITIONIST) {
                return next(new AppError('Solo los nutriólogos pueden ver sus solicitudes pendientes.', 403));
            }
            const requests = await relationService.getNutritionistPendingRequests(req.user.id);
            res.status(200).json({
                status: 'success',
                data: { requests },
            });
        } catch (error: any) {
            if (error instanceof AppError) {
                return next(error);
            }
            next(new AppError('Error al obtener las solicitudes pendientes del nutriólogo.', 500));
        }
    }

    public async getMyPatients(req: Request, res: Response, next: NextFunction) {
        try {
            if (!req.user || req.user.role.name !== RoleName.NUTRITIONIST) {
                return next(new AppError('Solo los nutriólogos pueden ver sus pacientes.', 403));
            }
            const patients = await relationService.getNutritionistPatients(req.user.id);
            res.status(200).json({
                status: 'success',
                data: { patients },
            });
        } catch (error: any) {
            if (error instanceof AppError) {
                return next(error);
            }
            next(new AppError('Error al obtener los pacientes del nutriólogo.', 500));
        }
    }

    public async updateRelationStatus(req: Request, res: Response, next: NextFunction) {
        try {
            if (!req.user || req.user.role.name !== RoleName.NUTRITIONIST) {
                return next(new AppError('Solo los nutriólogos pueden actualizar el estado de una relación.', 403));
            }
            const { id } = req.params; // ID de la relación
            const { status } = req.body as UpdateRelationStatusDto; // Nuevo estado (ej. 'active', 'rejected')

            const updatedRelation = await relationService.updateRelationStatus(id, req.user.id, status);
            res.status(200).json({
                status: 'success',
                message: `Relación actualizada a ${status}.`,
                data: { relation: updatedRelation },
            });
        } catch (error: any) {
            if (error instanceof AppError) {
                return next(error);
            }
            next(new AppError('Error al actualizar el estado de la relación.', 500));
        }
    }
}

export default new RelationController();