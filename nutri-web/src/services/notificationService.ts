import axios from 'axios';

// Lógica robusta de fallback igual que api.ts
const envApiUrl = import.meta.env.VITE_API_URL;
let API_URL = envApiUrl;

if (!API_URL) {
    if (import.meta.env.MODE === 'production') {
        API_URL = 'https://litam.onrender.com/api'; // Fallback seguro para producción
    } else {
        API_URL = 'http://localhost:3000/api'; // Fallback para desarrollo
    }
}

console.log('🔔 [NotificationService] Mode:', import.meta.env.MODE);
console.log('🔔 [NotificationService] VITE_API_URL:', envApiUrl);
console.log('🔔 [NotificationService] Final API_URL:', API_URL);

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
        const token = localStorage.getItem('access_token');
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
            // Return empty array - backend endpoints not implemented yet
            return [];
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
}

export default new NotificationService();
