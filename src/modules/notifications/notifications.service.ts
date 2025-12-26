// src/modules/notifications/notifications.service.ts
import { AppDataSource } from '../../database/data-source';
import { Notification, NotificationType, NotificationPriority } from '../../database/entities/notification.entity';
import { AppError } from '../../utils/app.error';

export interface CreateNotificationDto {
    userId: string;
    type: NotificationType;
    title: string;
    message: string;
    priority?: NotificationPriority;
    category: string;
    actionUrl?: string;
    metadata?: any;
}

class NotificationsService {
    private notificationsRepository = AppDataSource.getRepository(Notification);

    /**
     * Get all notifications for a specific user
     */
    async findByUser(userId: string): Promise<Notification[]> {
        return this.notificationsRepository.find({
            where: { user_id: userId },
            order: {
                pinned: 'DESC', // Pinned first
                created_at: 'DESC', // Then by newest
            },
        });
    }

    /**
     * Create a new notification
     */
    async create(createDto: CreateNotificationDto): Promise<Notification> {
        const notification = this.notificationsRepository.create({
            user_id: createDto.userId,
            type: createDto.type,
            title: createDto.title,
            message: createDto.message,
            priority: createDto.priority || NotificationPriority.MEDIUM,
            category: createDto.category,
            action_url: createDto.actionUrl,
            metadata: createDto.metadata,
            read: false,
            pinned: false,
        });

        return this.notificationsRepository.save(notification);
    }

    /**
     * Mark a notification as read
     */
    async markAsRead(id: string, userId: string): Promise<Notification> {
        const notification = await this.findOneByIdAndUser(id, userId);
        notification.read = true;
        return this.notificationsRepository.save(notification);
    }

    /**
     * Mark all notifications as read for a user
     */
    async markAllAsRead(userId: string): Promise<void> {
        await this.notificationsRepository.update(
            { user_id: userId, read: false },
            { read: true }
        );
    }

    /**
     * Toggle pin status
     */
    async togglePin(id: string, userId: string): Promise<Notification> {
        const notification = await this.findOneByIdAndUser(id, userId);
        notification.pinned = !notification.pinned;
        return this.notificationsRepository.save(notification);
    }

    /**
     * Delete a notification
     */
    async delete(id: string, userId: string): Promise<void> {
        const notification = await this.findOneByIdAndUser(id, userId);
        await this.notificationsRepository.remove(notification);
    }

    /**
     * Bulk delete notifications
     */
    async deleteMany(ids: string[], userId: string): Promise<void> {
        // Verify all notifications belong to the user before deleting
        const notifications = await this.notificationsRepository.find({
            where: ids.map(id => ({ id, user_id: userId })),
        });

        if (notifications.length !== ids.length) {
            throw new AppError('Some notifications not found or do not belong to you', 403);
        }

        await this.notificationsRepository.remove(notifications);
    }

    /**
     * Helper: Find notification by ID and verify ownership
     */
    private async findOneByIdAndUser(id: string, userId: string): Promise<Notification> {
        const notification = await this.notificationsRepository.findOne({
            where: { id },
        });

        if (!notification) {
            throw new AppError(`Notification with ID ${id} not found`, 404);
        }

        if (notification.user_id !== userId) {
            throw new AppError('You do not have permission to access this notification', 403);
        }

        return notification;
    }

    /**
     * Get unread count for a user
     */
    async getUnreadCount(userId: string): Promise<number> {
        return this.notificationsRepository.count({
            where: { user_id: userId, read: false },
        });
    }
}

export default new NotificationsService();
