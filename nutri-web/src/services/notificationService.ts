import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export interface Notification {
    id: string;
    type: 'appointment' | 'patient' | 'reminder' | 'system' | 'success' | 'warning' | 'info';
    title: string;
    message: string;
    time: string;
    read: boolean;
    pinned: boolean;
    priority: 'low' | 'medium' | 'high';
    category: string;
    actionUrl?: string;
    metadata?: {
        patientId?: string;
        patientName?: string;
        appointmentId?: string;
        recordId?: string;
    };
}

class NotificationService {
    private getAuthHeaders() {
        const token = localStorage.getItem('token');
        return {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        };
    }

    async getNotifications(): Promise<Notification[]> {
        try {
            const response = await axios.get(`${API_URL}/notifications`, this.getAuthHeaders());
            return response.data;
        } catch (error) {
            console.error('Error fetching notifications:', error);
            // Return mock data for now if backend is not ready
            return this.getMockNotifications();
        }
    }

    async markAsRead(notificationId: string): Promise<void> {
        try {
            await axios.patch(
                `${API_URL}/notifications/${notificationId}/read`,
                {},
                this.getAuthHeaders()
            );
        } catch (error) {
            console.error('Error marking notification as read:', error);
        }
    }

    async markAllAsRead(): Promise<void> {
        try {
            await axios.patch(`${API_URL}/notifications/mark-all-read`, {}, this.getAuthHeaders());
        } catch (error) {
            console.error('Error marking all notifications as read:', error);
        }
    }

    async deleteNotification(notificationId: string): Promise<void> {
        try {
            await axios.delete(`${API_URL}/notifications/${notificationId}`, this.getAuthHeaders());
        } catch (error) {
            console.error('Error deleting notification:', error);
        }
    }

    async togglePin(notificationId: string): Promise<void> {
        try {
            await axios.patch(
                `${API_URL}/notifications/${notificationId}/pin`,
                {},
                this.getAuthHeaders()
            );
        } catch (error) {
            console.error('Error toggling pin:', error);
        }
    }

    // Mock data for development/fallback
    private getMockNotifications(): Notification[] {
        return [
            {
                id: '1',
                type: 'appointment',
                title: 'Nueva Cita Programada',
                message: 'Tienes una nueva cita con María González para mañana a las 10:00 AM',
                time: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
                read: false,
                pinned: true,
                priority: 'high',
                category: 'Citas',
                actionUrl: '/appointments',
                metadata: {
                    patientId: '123',
                    patientName: 'María González',
                    appointmentId: 'app-001'
                }
            },
            {
                id: '2',
                type: 'patient',
                title: 'Nuevo Paciente Registrado',
                message: 'Carlos Rodríguez se ha registrado como tu paciente',
                time: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
                read: false,
                pinned: false,
                priority: 'medium',
                category: 'Pacientes',
                actionUrl: '/patients',
                metadata: {
                    patientId: '456',
                    patientName: 'Carlos Rodríguez'
                }
            },
            {
                id: '3',
                type: 'reminder',
                title: 'Recordatorio de Seguimiento',
                message: 'Es momento de revisar el progreso de Ana Martínez',
                time: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
                read: true,
                pinned: false,
                priority: 'medium',
                category: 'Seguimiento',
                actionUrl: '/progress',
                metadata: {
                    patientId: '789',
                    patientName: 'Ana Martínez'
                }
            },
            {
                id: '4',
                type: 'system',
                title: 'Actualización del Sistema',
                message: 'Se han aplicado mejoras en el sistema de expedientes clínicos',
                time: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
                read: true,
                pinned: false,
                priority: 'low',
                category: 'Sistema',
                actionUrl: '/dashboard'
            },
            {
                id: '5',
                type: 'success',
                title: 'Expediente Completado',
                message: 'El expediente clínico de Juan Pérez ha sido completado exitosamente',
                time: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(),
                read: true,
                pinned: false,
                priority: 'medium',
                category: 'Expedientes',
                actionUrl: '/clinical-records',
                metadata: {
                    patientId: '101',
                    patientName: 'Juan Pérez',
                    recordId: 'rec-001'
                }
            },
            {
                id: '6',
                type: 'warning',
                title: 'Plan Nutricional Vencido',
                message: 'El plan nutricional de Laura Sánchez expira en 3 días',
                time: new Date(Date.now() - 1000 * 60 * 60 * 24 * 4).toISOString(),
                read: false,
                pinned: true,
                priority: 'high',
                category: 'Planes Nutricionales',
                actionUrl: '/diet-plans',
                metadata: {
                    patientId: '202',
                    patientName: 'Laura Sánchez'
                }
            },
            {
                id: '7',
                type: 'info',
                title: 'Nuevo Reporte Disponible',
                message: 'El reporte mensual de pacientes está listo para revisión',
                time: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(),
                read: true,
                pinned: false,
                priority: 'low',
                category: 'Reportes',
                actionUrl: '/reports'
            },
            {
                id: '8',
                type: 'appointment',
                title: 'Cita Cancelada',
                message: 'Pedro López ha cancelado su cita del viernes',
                time: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
                read: false,
                pinned: false,
                priority: 'medium',
                category: 'Citas',
                actionUrl: '/appointments',
                metadata: {
                    patientId: '303',
                    patientName: 'Pedro López'
                }
            }
        ];
    }
}

export default new NotificationService();
