// src/modules/notifications/notifications.controller.ts
import { Request, Response, NextFunction } from 'express';
import notificationsService from './notifications.service';
import { NotificationType, NotificationPriority } from '../../database/entities/notification.entity';
import { AppError } from '../../utils/app.error';

class NotificationsController {
    /**
     * GET /api/notifications
     * Get all notifications for the authenticated user
     */
    public async getNotifications(req: Request, res: Response, next: NextFunction) {
        try {
            if (!req.user) {
                return next(new AppError('Usuario no autenticado en la solicitud.', 401));
            }
            const userId = req.user.id;
            const notifications = await notificationsService.findByUser(userId);

            res.status(200).json(notifications);
        } catch (error) {
            next(error);
        }
    }

    /**
     * GET /api/notifications/unread-count
     * Get count of unread notifications
     */
    public async getUnreadCount(req: Request, res: Response, next: NextFunction) {
        try {
            if (!req.user) {
                return next(new AppError('Usuario no autenticado en la solicitud.', 401));
            }
            const userId = req.user.id;
            const count = await notificationsService.getUnreadCount(userId);

            res.status(200).json({ count });
        } catch (error) {
            next(error);
        }
    }

    /**
     * POST /api/notifications
     * Create a new notification
     */
    public async createNotification(req: Request, res: Response, next: NextFunction) {
        try {
            if (!req.user) {
                return next(new AppError('Usuario no autenticado en la solicitud.', 401));
            }
            const userId = req.user.id;
            const { type, title, message, priority, category, actionUrl, metadata } = req.body;

            const notification = await notificationsService.create({
                userId,
                type: type as NotificationType,
                title,
                message,
                priority: priority as NotificationPriority,
                category,
                actionUrl,
                metadata,
            });

            res.status(201).json(notification);
        } catch (error) {
            next(error);
        }
    }

    /**
     * PATCH /api/notifications/:id/read
     * Mark a notification as read
     */
    public async markAsRead(req: Request, res: Response, next: NextFunction) {
        try {
            if (!req.user) {
                return next(new AppError('Usuario no autenticado en la solicitud.', 401));
            }
            const userId = req.user.id;
            const { id } = req.params;

            const notification = await notificationsService.markAsRead(id, userId);

            res.status(200).json(notification);
        } catch (error) {
            next(error);
        }
    }

    /**
     * PATCH /api/notifications/mark-all-read
     * Mark all notifications as read
     */
    public async markAllAsRead(req: Request, res: Response, next: NextFunction) {
        try {
            if (!req.user) {
                return next(new AppError('Usuario no autenticado en la solicitud.', 401));
            }
            const userId = req.user.id;

            await notificationsService.markAllAsRead(userId);

            res.status(200).json({ message: 'All notifications marked as read' });
        } catch (error) {
            next(error);
        }
    }

    /**
     * PATCH /api/notifications/:id/pin
     * Toggle pin status
     */
    public async togglePin(req: Request, res: Response, next: NextFunction) {
        try {
            if (!req.user) {
                return next(new AppError('Usuario no autenticado en la solicitud.', 401));
            }
            const userId = req.user.id;
            const { id } = req.params;

            const notification = await notificationsService.togglePin(id, userId);

            res.status(200).json(notification);
        } catch (error) {
            next(error);
        }
    }

    /**
     * DELETE /api/notifications/:id
     * Delete a notification
     */
    public async deleteNotification(req: Request, res: Response, next: NextFunction) {
        try {
            if (!req.user) {
                return next(new AppError('Usuario no autenticado en la solicitud.', 401));
            }
            const userId = req.user.id;
            const { id } = req.params;

            await notificationsService.delete(id, userId);

            res.status(200).json({ message: 'Notification deleted successfully' });
        } catch (error) {
            next(error);
        }
    }

    /**
     * POST /api/notifications/bulk-delete
     * Bulk delete notifications
     */
    public async bulkDelete(req: Request, res: Response, next: NextFunction) {
        try {
            if (!req.user) {
                return next(new AppError('Usuario no autenticado en la solicitud.', 401));
            }
            const userId = req.user.id;
            const { ids } = req.body;

            if (!Array.isArray(ids) || ids.length === 0) {
                return next(new AppError('IDs array is required', 400));
            }

            await notificationsService.deleteMany(ids, userId);

            res.status(200).json({ message: `${ids.length} notifications deleted successfully` });
        } catch (error) {
            next(error);
        }
    }
}

export default new NotificationsController();
