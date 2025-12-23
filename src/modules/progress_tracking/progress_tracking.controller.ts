// src/modules/progress_tracking/progress_tracking.controller.ts
import { Request, Response, NextFunction } from 'express';
import progressTrackingService from '../../modules/progress_tracking/progress_tracking.service';
import progressAnalysisService from '../../modules/progress_tracking/progress_analysis.service';
import { SearchProgressLogsDto, CreateUpdateProgressLogDto } from '../../modules/progress_tracking/progress_tracking.dto';
import { AppError } from '../../utils/app.error';
import { RoleName } from '../../database/entities/role.entity';

class ProgressTrackingController {
    // --- Métodos para Pacientes ---
    public async createProgressLog(req: Request, res: Response, next: NextFunction) {
        try {
            if (!req.user || req.user.role.name !== RoleName.PATIENT) {
                return next(new AppError('Acceso denegado. Solo los pacientes pueden registrar su progreso.', 403));
            }
            const log = await progressTrackingService.createProgressLog(req.user.id, req.body as CreateUpdateProgressLogDto);
            res.status(201).json({
                status: 'success',
                message: 'Registro de progreso creado exitosamente.',
                data: { log },
            });
        } catch (error: any) {
            console.error('Error en ProgressTrackingController.createProgressLog:', error);
            if (error instanceof AppError) {
                return next(error);
            }
            next(new AppError('Error al crear el registro de progreso.', 500));
        }
    }

    public async getMyProgressLogs(req: Request, res: Response, next: NextFunction) {
        try {
            if (!req.user || req.user.role.name !== RoleName.PATIENT) {
                return next(new AppError('Acceso denegado. Solo los pacientes pueden ver su progreso.', 403));
            }
            // Los query params llegan como string, SearchProgressLogsDto los validará
            const searchDto = req.query as unknown as SearchProgressLogsDto;
            const logs = await progressTrackingService.getMyProgressLogs(req.user.id, searchDto);
            res.status(200).json({
                status: 'success',
                results: logs.length,
                data: { logs },
            });
        } catch (error: any) {
            console.error('Error en ProgressTrackingController.getMyProgressLogs:', error);
            if (error instanceof AppError) {
                return next(error);
            }
            next(new AppError('Error al obtener los registros de progreso.', 500));
        }
    }

    public async updateProgressLog(req: Request, res: Response, next: NextFunction) {
        try {
            if (!req.user || req.user.role.name !== RoleName.PATIENT) {
                return next(new AppError('Acceso denegado. Solo los pacientes pueden actualizar su progreso.', 403));
            }
            const { id } = req.params; // ID del registro de progreso
            const updatedLog = await progressTrackingService.updateProgressLog(id, req.user.id, req.body as CreateUpdateProgressLogDto);
            res.status(200).json({
                status: 'success',
                message: 'Registro de progreso actualizado exitosamente.',
                data: { log: updatedLog },
            });
        } catch (error: any) {
            console.error('Error en ProgressTrackingController.updateProgressLog:', error);
            if (error instanceof AppError) {
                return next(error);
            }
            next(new AppError('Error al actualizar el registro de progreso.', 500));
        }
    }

    public async deleteProgressLog(req: Request, res: Response, next: NextFunction) {
        try {
            if (!req.user || req.user.role.name !== RoleName.PATIENT) {
                return next(new AppError('Acceso denegado. Solo los pacientes pueden eliminar su progreso.', 403));
            }
            const { id } = req.params; // ID del registro de progreso
            await progressTrackingService.deleteProgressLog(id, req.user.id);
            res.status(204).json({ // 204 No Content para eliminación exitosa
                status: 'success',
                data: null,
            });
        } catch (error: any) {
            console.error('Error en ProgressTrackingController.deleteProgressLog:', error);
            if (error instanceof AppError) {
                return next(error);
            }
            next(new AppError('Error al eliminar el registro de progreso.', 500));
        }
    }


    // --- Métodos para Nutriólogos (ver progreso de sus pacientes) ---
    public async getPatientProgressLogs(req: Request, res: Response, next: NextFunction) {
        try {
            if (!req.user || req.user.role.name !== RoleName.NUTRITIONIST) {
                return next(new AppError('Acceso denegado. Solo los nutriólogos pueden ver el progreso de los pacientes.', 403));
            }
            const { patientId } = req.params; // ID del paciente cuyos logs se quieren ver
            const searchDto = req.query as unknown as SearchProgressLogsDto;
            const logs = await progressTrackingService.getPatientProgressLogsByNutritionist(patientId, req.user.id, searchDto);
            res.status(200).json({
                status: 'success',
                results: logs.length,
                data: { logs },
            });
        } catch (error: any) {
            console.error('Error en ProgressTrackingController.getPatientProgressLogs:', error);
            if (error instanceof AppError) {
                return next(error);
            }
            next(new AppError('Error al obtener los registros de progreso del paciente.', 500));
        }
    }

    // --- Nuevo método para análisis automático ---
    public async generateAutomaticProgress(req: Request, res: Response, next: NextFunction) {
        try {
            if (!req.user || req.user.role.name !== RoleName.NUTRITIONIST) {
                return next(new AppError('Acceso denegado. Solo los nutriólogos pueden generar análisis automático.', 403));
            }
            
            const { patientId } = req.params;
            
            console.log('🤖 Generando análisis automático de progreso para paciente:', patientId);
            
            // Generar análisis completo basado en expedientes y planes de dieta
            const analysis = await progressAnalysisService.analyzePatientProgress(patientId);
            
            // Obtener los logs de progreso actualizados después del análisis
            const logs = await progressTrackingService.getPatientProgressLogsByNutritionist(patientId, req.user.id, {});
            
            res.status(200).json({
                status: 'success',
                message: 'Análisis automático de progreso generado exitosamente',
                data: {
                    analysis,
                    logs,
                    generatedAt: new Date().toISOString(),
                    basedOn: {
                        clinicalRecords: analysis.timelineData.length,
                        activePlan: analysis.dietPlanAdherence.currentPlan?.name || null
                    }
                }
            });
        } catch (error: any) {
            console.error('Error en ProgressTrackingController.generateAutomaticProgress:', error);
            if (error instanceof AppError) {
                return next(error);
            }
            next(new AppError('Error al generar el análisis automático de progreso.', 500));
        }
    }

    // --- Método para obtener análisis sin generar logs ---
    public async getProgressAnalysis(req: Request, res: Response, next: NextFunction) {
        try {
            if (!req.user || req.user.role.name !== RoleName.NUTRITIONIST) {
                return next(new AppError('Acceso denegado. Solo los nutriólogos pueden ver análisis de progreso.', 403));
            }
            
            const { patientId } = req.params;
            
            console.log('📊 Obteniendo análisis de progreso para paciente:', patientId);
            
            // Solo generar análisis sin crear logs automáticos
            const analysis = await progressAnalysisService.analyzePatientProgress(patientId);
            
            res.status(200).json({
                status: 'success',
                data: { analysis }
            });
        } catch (error: any) {
            console.error('Error en ProgressTrackingController.getProgressAnalysis:', error);
            if (error instanceof AppError) {
                return next(error);
            }
            next(new AppError('Error al obtener el análisis de progreso.', 500));
        }
    }
}

export default new ProgressTrackingController();