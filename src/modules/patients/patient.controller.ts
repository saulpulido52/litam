// src/modules/patients/patient.controller.ts
import { Request, Response, NextFunction } from 'express';
import patientService from '@/modules/patients/patient.service';
import { AppError } from '@/utils/app.error';
import { CreateUpdatePatientProfileDto } from '@/modules/patients/patient.dto'; // Importar el DTO

class PatientController {
    public async getMyProfile(req: Request, res: Response, next: NextFunction) {
        try {
            if (!req.user || req.user.role.name !== 'patient') {
                return next(new AppError('Acceso denegado. Solo pacientes pueden ver este perfil.', 403));
            }
            const profile = await patientService.getPatientProfile(req.user.id);
            res.status(200).json({
                status: 'success',
                data: { profile },
            });
        } catch (error: any) {
            if (error instanceof AppError) {
                return next(error);
            }
            next(new AppError('Error al obtener el perfil del paciente.', 500));
        }
    }

    public async createOrUpdateMyProfile(req: Request, res: Response, next: NextFunction) {
        try {
            if (!req.user || req.user.role.name !== 'patient') {
                return next(new AppError('Acceso denegado. Solo pacientes pueden actualizar su perfil.', 403));
            }
            // req.body ya ha sido validado por validateMiddleware con CreateUpdatePatientProfileDto
            const updatedProfile = await patientService.createOrUpdatePatientProfile(req.user.id, req.body as CreateUpdatePatientProfileDto);
            res.status(200).json({ // Usar 200 OK para actualizaciones, 201 Created si siempre fuera creación
                status: 'success',
                data: { profile: updatedProfile },
            });
        } catch (error: any) {
            if (error instanceof AppError) {
                return next(error);
            }
            next(new AppError('Error al crear/actualizar el perfil del paciente.', 500));
        }
    }
}

export default new PatientController();