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
