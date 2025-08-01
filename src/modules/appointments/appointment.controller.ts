// src/modules/appointments/appointment.controller.ts
import { Request, Response, NextFunction } from 'express';
import appointmentService from '../../modules/appointments/appointment.service';
import { AppError } from '../../utils/app.error';
import {
    ScheduleAppointmentDto,
    UpdateAppointmentStatusDto,
    ManageAvailabilityDto,
    SearchAvailabilityDto,
    AvailabilitySlotDto,
    NutritionistScheduleAppointmentDto,
} from '../../modules/appointments/appointment.dto';
import { RoleName } from '../../database/entities/role.entity';
import { AppointmentStatus } from '../../database/entities/appointment.entity';

class AppointmentController {
    // --- Gestión de Disponibilidad (Nutriólogos) ---
    public async manageAvailability(req: Request, res: Response, next: NextFunction) {
        try {
            if (!req.user || req.user.role.name !== RoleName.NUTRITIONIST) {
                return next(new AppError('Acceso denegado. Solo los nutriólogos pueden gestionar su disponibilidad.', 403));
            }
            const availability = await appointmentService.manageNutritionistAvailability(req.user.id, req.body as ManageAvailabilityDto);
            res.status(200).json({
                status: 'success',
                message: 'Disponibilidad actualizada exitosamente.',
                data: { availability },
            });
        } catch (error: any) {
            console.error('Error en AppointmentController.manageAvailability:', error);
            if (error instanceof AppError) {
                return next(error);
            }
            next(new AppError('Error al gestionar la disponibilidad.', 500));
        }
    }

    public async getMyAvailability(req: Request, res: Response, next: NextFunction) {
        try {
            if (!req.user || req.user.role.name !== RoleName.NUTRITIONIST) {
                return next(new AppError('Acceso denegado. Solo los nutriólogos pueden ver su disponibilidad.', 403));
            }
            const availability = await appointmentService.getNutritionistAvailability(req.user.id);
            res.status(200).json({
                status: 'success',
                data: { availability },
            });
        } catch (error: any) {
            console.error('Error en AppointmentController.getMyAvailability:', error);
            if (error instanceof AppError) {
                return next(error);
            }
            next(new AppError('Error al obtener la disponibilidad.', 500));
        }
    }

    public async searchNutritionistAvailability(req: Request, res: Response, next: NextFunction) {
        try {
            // Cualquier usuario autenticado (paciente, admin) puede buscar disponibilidad de nutriólogos
            if (!req.user) {
                return next(new AppError('Usuario no autenticado.', 401));
            }
            const { nutritionistId } = req.params; // ID del nutriólogo a buscar
            const searchDto = req.query as unknown as SearchAvailabilityDto; // Query params son strings

            const availability = await appointmentService.searchNutritionistAvailabilityForPatient(nutritionistId, searchDto);
            res.status(200).json({
                status: 'success',
                data: { availability },
            });
        } catch (error: any) {
            console.error('Error en AppointmentController.searchNutritionistAvailability:', error);
            if (error instanceof AppError) {
                return next(error);
            }
            next(new AppError('Error al buscar disponibilidad.', 500));
        }
    }

    // NUEVO: Obtener citas de un nutriólogo por rango de fechas
    public async getNutritionistAppointmentsByDateRange(req: Request, res: Response, next: NextFunction) {
        try {
            if (!req.user) {
                return next(new AppError('Usuario no autenticado.', 401));
            }
            
            const { nutritionistId } = req.params;
            const { startDate, endDate } = req.query;

            if (!startDate || !endDate) {
                return next(new AppError('Se requieren startDate y endDate como parámetros de consulta.', 400));
            }

            const appointments = await appointmentService.getNutritionistAppointmentsByDateRange(
                nutritionistId, 
                startDate as string, 
                endDate as string
            );

            res.status(200).json({
                status: 'success',
                data: { appointments },
            });
        } catch (error: any) {
            console.error('Error en AppointmentController.getNutritionistAppointmentsByDateRange:', error);
            if (error instanceof AppError) {
                return next(error);
            }
            next(new AppError('Error al obtener citas por rango de fechas.', 500));
        }
    }

    // NUEVO: Obtener slots disponibles para una fecha específica
    public async getAvailableSlots(req: Request, res: Response, next: NextFunction) {
        try {
            if (!req.user) {
                return next(new AppError('Usuario no autenticado.', 401));
            }
            
            const { nutritionistId } = req.params;
            const { date } = req.query;

            if (!date) {
                return next(new AppError('Se requiere el parámetro date (YYYY-MM-DD).', 400));
            }

            const availableSlots = await appointmentService.getAvailableSlots(
                nutritionistId, 
                date as string
            );

            res.status(200).json({
                status: 'success',
                data: { 
                    date: date,
                    nutritionistId: nutritionistId,
                    availableSlots 
                },
            });
        } catch (error: any) {
            console.error('Error en AppointmentController.getAvailableSlots:', error);
            if (error instanceof AppError) {
                return next(error);
            }
            next(new AppError('Error al obtener slots disponibles.', 500));
        }
    }

    // --- Gestión de Citas (Pacientes y Nutriólogos) ---
    public async scheduleAppointment(req: Request, res: Response, next: NextFunction) {
        try {
            if (!req.user || req.user.role.name !== RoleName.PATIENT) {
                return next(new AppError('Acceso denegado. Solo los pacientes pueden agendar citas.', 403));
            }
            const appointment = await appointmentService.scheduleAppointment(req.user.id, req.body as ScheduleAppointmentDto);
            res.status(201).json({
                status: 'success',
                message: 'Cita agendada exitosamente.',
                data: { appointment },
            });
        } catch (error: any) {
            console.error('Error en AppointmentController.scheduleAppointment:', error);
            if (error instanceof AppError) {
                return next(error);
            }
            next(new AppError('Error al agendar la cita.', 500));
        }
    }

    public async getMyAppointments(req: Request, res: Response, next: NextFunction) {
        try {
            if (!req.user) {
                return next(new AppError('Usuario no autenticado.', 401));
            }
            const appointments = await appointmentService.getMyAppointments(req.user.id, req.user.role.name);
            res.status(200).json({
                status: 'success',
                results: appointments.length,
                data: { appointments },
            });
        } catch (error: any) {
            console.error('Error en AppointmentController.getMyAppointments:', error);
            if (error instanceof AppError) {
                return next(error);
            }
            next(new AppError('Error al obtener mis citas.', 500));
        }
    }

    public async updateAppointmentStatus(req: Request, res: Response, next: NextFunction) {
        try {
            if (!req.user) {
                return next(new AppError('Usuario no autenticado.', 401));
            }
            const { id } = req.params; // ID de la cita
            const { status } = req.body as UpdateAppointmentStatusDto; // Nuevo estado

            const updatedAppointment = await appointmentService.updateAppointmentStatus(id, status, req.user.id, req.user.role.name);
            res.status(200).json({
                status: 'success',
                message: `Estado de la cita actualizado a ${status}.`,
                data: { appointment: updatedAppointment },
            });
        } catch (error: any) {
            console.error('Error en AppointmentController.updateAppointmentStatus:', error);
            if (error instanceof AppError) {
                return next(error);
            }
            next(new AppError('Error al actualizar el estado de la cita.', 500));
        }
    }

    public async scheduleAppointmentForPatient(req: Request, res: Response, next: NextFunction) {
        try {
            if (!req.user || req.user.role.name !== RoleName.NUTRITIONIST) {
                return next(new AppError('Acceso denegado. Solo los nutriólogos pueden crear citas para sus pacientes.', 403));
            }
            const appointment = await appointmentService.scheduleAppointmentForPatient(req.user.id, req.body as NutritionistScheduleAppointmentDto);
            res.status(201).json({
                status: 'success',
                message: 'Cita agendada exitosamente.',
                data: { appointment },
            });
        } catch (error: any) {
            console.error('Error en AppointmentController.scheduleAppointmentForPatient:', error);
            if (error instanceof AppError) {
                return next(error);
            }
            next(new AppError('Error al agendar la cita.', 500));
        }
    }

    // Actualizar una cita completa (fecha, hora, notas)
    public async updateAppointment(req: Request, res: Response, next: NextFunction) {
        try {
            const appointmentId = req.params.id;
            const updateData = req.body;
            
            if (!req.user || req.user.role.name !== RoleName.NUTRITIONIST) {
                return next(new AppError('Acceso denegado. Solo los nutriólogos pueden actualizar citas.', 403));
            }

            const updatedAppointment = await appointmentService.updateAppointment(appointmentId, req.user.id, updateData);
            
            res.status(200).json({
                status: 'success',
                message: 'Cita actualizada exitosamente.',
                data: { appointment: updatedAppointment },
            });
        } catch (error: any) {
            console.error('Error en AppointmentController.updateAppointment:', error);
            if (error instanceof AppError) {
                return next(error);
            }
            next(new AppError('Error al actualizar la cita.', 500));
        }
    }

    // Eliminar una cita completamente
    public async deleteAppointment(req: Request, res: Response, next: NextFunction) {
        try {
            const appointmentId = req.params.id;
            
            if (!req.user || req.user.role.name !== RoleName.NUTRITIONIST) {
                return next(new AppError('Acceso denegado. Solo los nutriólogos pueden eliminar citas.', 403));
            }

            await appointmentService.deleteAppointment(appointmentId, req.user.id);
            
            res.status(200).json({
                status: 'success',
                message: 'Cita eliminada exitosamente.',
            });
        } catch (error: any) {
            console.error('Error en AppointmentController.deleteAppointment:', error);
            if (error instanceof AppError) {
                return next(error);
            }
            next(new AppError('Error al eliminar la cita.', 500));
        }
    }
}

export default new AppointmentController();