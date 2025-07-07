import { Request, Response, NextFunction } from 'express';
import googleCalendarService from './google-calendar.service';
import { AppError } from '../../utils/app.error';

class GoogleCalendarController {
    /**
     * Obtiene la lista de calendarios del usuario
     */
    public async getCalendarList(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = req.user?.id;
            if (!userId) {
                throw new AppError('Usuario no autenticado', 401);
            }

            const calendars = await googleCalendarService.getCalendarList(userId);

            res.json({
                status: 'success',
                data: { calendars }
            });
        } catch (error: any) {
            console.error('Error getting calendar list:', error);
            if (error instanceof AppError) {
                return next(error);
            }
            next(new AppError('Error al obtener lista de calendarios', 500));
        }
    }

    /**
     * Establece el calendario principal para sincronización
     */
    public async setPrimaryCalendar(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = req.user?.id;
            if (!userId) {
                throw new AppError('Usuario no autenticado', 401);
            }

            const { calendarId } = req.body;
            if (!calendarId) {
                throw new AppError('ID de calendario requerido', 400);
            }

            await googleCalendarService.setPrimaryCalendar(userId, calendarId);

            res.json({
                status: 'success',
                message: 'Calendario principal configurado exitosamente'
            });
        } catch (error: any) {
            console.error('Error setting primary calendar:', error);
            if (error instanceof AppError) {
                return next(error);
            }
            next(new AppError('Error al configurar calendario principal', 500));
        }
    }

    /**
     * Habilita o deshabilita la sincronización de calendario
     */
    public async toggleCalendarSync(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = req.user?.id;
            if (!userId) {
                throw new AppError('Usuario no autenticado', 401);
            }

            const { enabled } = req.body;
            if (typeof enabled !== 'boolean') {
                throw new AppError('Estado de sincronización requerido', 400);
            }

            await googleCalendarService.toggleCalendarSync(userId, enabled);

            res.json({
                status: 'success',
                message: `Sincronización de calendario ${enabled ? 'habilitada' : 'deshabilitada'} exitosamente`
            });
        } catch (error: any) {
            console.error('Error toggling calendar sync:', error);
            if (error instanceof AppError) {
                return next(error);
            }
            next(new AppError('Error al cambiar estado de sincronización', 500));
        }
    }

    /**
     * Sincroniza citas desde la base de datos a Google Calendar
     */
    public async syncAppointmentsToGoogleCalendar(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = req.user?.id;
            if (!userId) {
                throw new AppError('Usuario no autenticado', 401);
            }

            const result = await googleCalendarService.syncAppointmentsToGoogleCalendar(userId);

            res.json({
                status: 'success',
                message: 'Sincronización completada exitosamente',
                data: result
            });
        } catch (error: any) {
            console.error('Error syncing appointments to Google Calendar:', error);
            if (error instanceof AppError) {
                return next(error);
            }
            next(new AppError('Error al sincronizar citas con Google Calendar', 500));
        }
    }

    /**
     * Sincroniza eventos de Google Calendar a la base de datos
     */
    public async syncGoogleCalendarToAppointments(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = req.user?.id;
            if (!userId) {
                throw new AppError('Usuario no autenticado', 401);
            }

            const result = await googleCalendarService.syncGoogleCalendarToAppointments(userId);

            res.json({
                status: 'success',
                message: 'Sincronización completada exitosamente',
                data: result
            });
        } catch (error: any) {
            console.error('Error syncing Google Calendar to appointments:', error);
            if (error instanceof AppError) {
                return next(error);
            }
            next(new AppError('Error al sincronizar Google Calendar con citas', 500));
        }
    }

    /**
     * Crea un evento en Google Calendar
     */
    public async createCalendarEvent(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = req.user?.id;
            if (!userId) {
                throw new AppError('Usuario no autenticado', 401);
            }

            const { summary, description, startDateTime, endDateTime, attendees } = req.body;

            if (!summary || !startDateTime || !endDateTime) {
                throw new AppError('Resumen, fecha de inicio y fecha de fin son requeridos', 400);
            }

            const eventData = {
                summary,
                description,
                start: {
                    dateTime: startDateTime,
                    timeZone: 'America/Mexico_City'
                },
                end: {
                    dateTime: endDateTime,
                    timeZone: 'America/Mexico_City'
                },
                attendees: attendees || [],
                reminders: {
                    useDefault: false,
                    overrides: [
                        { method: 'email' as const, minutes: 24 * 60 },
                        { method: 'popup' as const, minutes: 30 }
                    ]
                }
            };

            const eventId = await googleCalendarService.createCalendarEvent(userId, eventData);

            res.json({
                status: 'success',
                message: 'Evento creado exitosamente',
                data: { eventId }
            });
        } catch (error: any) {
            console.error('Error creating calendar event:', error);
            if (error instanceof AppError) {
                return next(error);
            }
            next(new AppError('Error al crear evento en Google Calendar', 500));
        }
    }

    /**
     * Actualiza un evento en Google Calendar
     */
    public async updateCalendarEvent(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = req.user?.id;
            if (!userId) {
                throw new AppError('Usuario no autenticado', 401);
            }

            const { eventId } = req.params;
            const updateData = req.body;

            if (!eventId) {
                throw new AppError('ID de evento requerido', 400);
            }

            await googleCalendarService.updateCalendarEvent(userId, eventId, updateData);

            res.json({
                status: 'success',
                message: 'Evento actualizado exitosamente'
            });
        } catch (error: any) {
            console.error('Error updating calendar event:', error);
            if (error instanceof AppError) {
                return next(error);
            }
            next(new AppError('Error al actualizar evento en Google Calendar', 500));
        }
    }

    /**
     * Elimina un evento de Google Calendar
     */
    public async deleteCalendarEvent(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = req.user?.id;
            if (!userId) {
                throw new AppError('Usuario no autenticado', 401);
            }

            const { eventId } = req.params;

            if (!eventId) {
                throw new AppError('ID de evento requerido', 400);
            }

            await googleCalendarService.deleteCalendarEvent(userId, eventId);

            res.json({
                status: 'success',
                message: 'Evento eliminado exitosamente'
            });
        } catch (error: any) {
            console.error('Error deleting calendar event:', error);
            if (error instanceof AppError) {
                return next(error);
            }
            next(new AppError('Error al eliminar evento de Google Calendar', 500));
        }
    }
}

export default new GoogleCalendarController(); 