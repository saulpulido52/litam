import { Repository } from 'typeorm';
import { AppDataSource } from '../../database/data-source';
import { User } from '../../database/entities/user.entity';
import { Appointment, AppointmentStatus } from '../../database/entities/appointment.entity';
import { AppError } from '../../utils/app.error';
import axios from 'axios';
import googleAuthService from '../auth/google-auth.service';

interface GoogleCalendarEvent {
    id?: string;
    summary: string;
    description?: string;
    start: {
        dateTime: string;
        timeZone: string;
    };
    end: {
        dateTime: string;
        timeZone: string;
    };
    attendees?: Array<{
        email: string;
        displayName?: string;
    }>;
    reminders?: {
        useDefault: boolean;
        overrides?: Array<{
            method: 'email' | 'popup';
            minutes: number;
        }>;
    };
}

interface GoogleCalendarListResponse {
    items: Array<{
        id: string;
        summary: string;
        primary?: boolean;
    }>;
}

class GoogleCalendarService {
    private userRepository: Repository<User>;
    private appointmentRepository: Repository<Appointment>;

    constructor() {
        this.userRepository = AppDataSource.getRepository(User);
        this.appointmentRepository = AppDataSource.getRepository(Appointment);
    }

    /**
     * Obtiene la lista de calendarios del usuario
     */
    public async getCalendarList(userId: string): Promise<Array<{ id: string; summary: string; primary: boolean }>> {
        try {
            const accessToken = await googleAuthService.getValidGoogleToken(userId);
            if (!accessToken) {
                throw new AppError('No hay token válido de Google', 401);
            }

            const response = await axios.get('https://www.googleapis.com/calendar/v3/users/me/calendarList', {
                headers: {
                    Authorization: `Bearer ${accessToken}`
                }
            });

            const calendarList: GoogleCalendarListResponse = response.data;
            return calendarList.items.map(calendar => ({
                id: calendar.id,
                summary: calendar.summary,
                primary: calendar.primary || false
            }));
        } catch (error) {
            console.error('Error getting calendar list:', error);
            throw new AppError('Error al obtener lista de calendarios', 500);
        }
    }

    /**
     * Establece el calendario principal para sincronización
     */
    public async setPrimaryCalendar(userId: string, calendarId: string): Promise<void> {
        try {
            const user = await this.userRepository.findOne({ where: { id: userId } });
            if (!user) {
                throw new AppError('Usuario no encontrado', 404);
            }

            user.google_calendar_id = calendarId;
            await this.userRepository.save(user);
        } catch (error) {
            console.error('Error setting primary calendar:', error);
            throw error;
        }
    }

    /**
     * Habilita o deshabilita la sincronización de calendario
     */
    public async toggleCalendarSync(userId: string, enabled: boolean): Promise<void> {
        try {
            const user = await this.userRepository.findOne({ where: { id: userId } });
            if (!user) {
                throw new AppError('Usuario no encontrado', 404);
            }

            user.google_calendar_sync_enabled = enabled;
            if (enabled) {
                user.google_calendar_last_sync = new Date();
            }
            await this.userRepository.save(user);
        } catch (error) {
            console.error('Error toggling calendar sync:', error);
            throw error;
        }
    }

    /**
     * Crea un evento en Google Calendar
     */
    public async createCalendarEvent(userId: string, eventData: GoogleCalendarEvent): Promise<string> {
        try {
            const user = await this.userRepository.findOne({ where: { id: userId } });
            if (!user || !user.google_calendar_id) {
                throw new AppError('Calendario de Google no configurado', 400);
            }

            const accessToken = await googleAuthService.getValidGoogleToken(userId);
            if (!accessToken) {
                throw new AppError('No hay token válido de Google', 401);
            }

            const response = await axios.post(
                `https://www.googleapis.com/calendar/v3/calendars/${user.google_calendar_id}/events`,
                eventData,
                {
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            return response.data.id;
        } catch (error) {
            console.error('Error creating calendar event:', error);
            throw new AppError('Error al crear evento en Google Calendar', 500);
        }
    }

    /**
     * Actualiza un evento en Google Calendar
     */
    public async updateCalendarEvent(userId: string, eventId: string, eventData: Partial<GoogleCalendarEvent>): Promise<void> {
        try {
            const user = await this.userRepository.findOne({ where: { id: userId } });
            if (!user || !user.google_calendar_id) {
                throw new AppError('Calendario de Google no configurado', 400);
            }

            const accessToken = await googleAuthService.getValidGoogleToken(userId);
            if (!accessToken) {
                throw new AppError('No hay token válido de Google', 401);
            }

            await axios.put(
                `https://www.googleapis.com/calendar/v3/calendars/${user.google_calendar_id}/events/${eventId}`,
                eventData,
                {
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                        'Content-Type': 'application/json'
                    }
                }
            );
        } catch (error) {
            console.error('Error updating calendar event:', error);
            throw new AppError('Error al actualizar evento en Google Calendar', 500);
        }
    }

    /**
     * Elimina un evento de Google Calendar
     */
    public async deleteCalendarEvent(userId: string, eventId: string): Promise<void> {
        try {
            const user = await this.userRepository.findOne({ where: { id: userId } });
            if (!user || !user.google_calendar_id) {
                throw new AppError('Calendario de Google no configurado', 400);
            }

            const accessToken = await googleAuthService.getValidGoogleToken(userId);
            if (!accessToken) {
                throw new AppError('No hay token válido de Google', 401);
            }

            await axios.delete(
                `https://www.googleapis.com/calendar/v3/calendars/${user.google_calendar_id}/events/${eventId}`,
                {
                    headers: {
                        Authorization: `Bearer ${accessToken}`
                    }
                }
            );
        } catch (error) {
            console.error('Error deleting calendar event:', error);
            throw new AppError('Error al eliminar evento de Google Calendar', 500);
        }
    }

    /**
     * Sincroniza citas desde la base de datos a Google Calendar
     */
    public async syncAppointmentsToGoogleCalendar(userId: string): Promise<{ created: number; updated: number; deleted: number }> {
        try {
            const user = await this.userRepository.findOne({ where: { id: userId } });
            if (!user || !user.google_calendar_sync_enabled || !user.google_calendar_id) {
                throw new AppError('Sincronización de calendario no habilitada', 400);
            }

            // Obtener citas del usuario
            const appointments = await this.appointmentRepository.find({
                where: { nutritionist: { id: userId } },
                relations: ['patient']
            });

            let created = 0;
            let updated = 0;
            let deleted = 0;

            for (const appointment of appointments) {
                const eventData: GoogleCalendarEvent = {
                    summary: `Consulta: ${appointment.patient.first_name} ${appointment.patient.last_name}`,
                    description: `Consulta nutricional con ${appointment.patient.first_name} ${appointment.patient.last_name}\n\nNotas: ${appointment.notes || 'Consulta regular'}`,
                    start: {
                        dateTime: appointment.start_time.toISOString(),
                        timeZone: 'America/Mexico_City'
                    },
                    end: {
                        dateTime: appointment.end_time.toISOString(),
                        timeZone: 'America/Mexico_City'
                    },
                    attendees: [
                        {
                            email: appointment.patient.email,
                            displayName: `${appointment.patient.first_name} ${appointment.patient.last_name}`
                        }
                    ],
                    reminders: {
                        useDefault: false,
                        overrides: [
                            { method: 'email', minutes: 24 * 60 }, // 1 día antes
                            { method: 'popup', minutes: 30 } // 30 minutos antes
                        ]
                    }
                };

                if (appointment.google_calendar_event_id) {
                    // Actualizar evento existente
                    await this.updateCalendarEvent(userId, appointment.google_calendar_event_id, eventData);
                    updated++;
                } else {
                    // Crear nuevo evento
                    const googleEventId = await this.createCalendarEvent(userId, eventData);
                    appointment.google_calendar_event_id = googleEventId;
                    await this.appointmentRepository.save(appointment);
                    created++;
                }
            }

            // Actualizar timestamp de última sincronización
            user.google_calendar_last_sync = new Date();
            await this.userRepository.save(user);

            return { created, updated, deleted };
        } catch (error) {
            console.error('Error syncing appointments to Google Calendar:', error);
            throw error;
        }
    }

    /**
     * Obtiene eventos de Google Calendar y los sincroniza con la base de datos
     */
    public async syncGoogleCalendarToAppointments(userId: string): Promise<{ imported: number; updated: number }> {
        try {
            const user = await this.userRepository.findOne({ where: { id: userId } });
            if (!user || !user.google_calendar_sync_enabled || !user.google_calendar_id) {
                throw new AppError('Sincronización de calendario no habilitada', 400);
            }

            const accessToken = await googleAuthService.getValidGoogleToken(userId);
            if (!accessToken) {
                throw new AppError('No hay token válido de Google', 401);
            }

            // Obtener eventos de Google Calendar
            const response = await axios.get(
                `https://www.googleapis.com/calendar/v3/calendars/${user.google_calendar_id}/events`,
                {
                    headers: {
                        Authorization: `Bearer ${accessToken}`
                    },
                    params: {
                        timeMin: new Date().toISOString(),
                        maxResults: 100,
                        singleEvents: true,
                        orderBy: 'startTime'
                    }
                }
            );

            let imported = 0;
            let updated = 0;

            for (const event of response.data.items) {
                // Verificar si el evento ya existe en la base de datos
                const existingAppointment = await this.appointmentRepository.findOne({
                    where: { google_calendar_event_id: event.id }
                });

                if (!existingAppointment) {
                    // Crear nueva cita basada en el evento de Google
                    const appointment = this.appointmentRepository.create({
                        nutritionist: { id: userId },
                        start_time: new Date(event.start.dateTime),
                        end_time: new Date(event.end.dateTime),
                        notes: event.description || 'Consulta sincronizada desde Google Calendar',
                        google_calendar_event_id: event.id,
                        status: AppointmentStatus.SCHEDULED
                    });
                    await this.appointmentRepository.save(appointment);
                    imported++;
                }
            }

            // Actualizar timestamp de última sincronización
            user.google_calendar_last_sync = new Date();
            await this.userRepository.save(user);

            return { imported, updated };
        } catch (error) {
            console.error('Error syncing Google Calendar to appointments:', error);
            throw error;
        }
    }
}

export default new GoogleCalendarService(); 