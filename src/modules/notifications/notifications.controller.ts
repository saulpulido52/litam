// src/modules/notifications/notifications.controller.ts
import { Request, Response, NextFunction } from 'express';
import notificationsService from './notifications.service';
import { NotificationType, NotificationPriority } from '../../database/entities/notification.entity';
import { asyncHandler } from '../../utils/async.handler';

class NotificationsController {
    /**
     * GET /api/notifications
     * Get all notifications for the authenticated user
     */
    getNotifications = asyncHandler(async (req: Request, res: Response) => {
        const userId = req.user.id;
        const notifications = await notificationsService.findByUser(userId);

        res.status(200).json(notifications);
    });

    /**
     * GET /api/notifications/unread-count
     * Get count of unread notifications
     */
    getUnreadCount = asyncHandler(async (req: Request, res: Response) => {
        const userId = req.user.id;
        const count = await notificationsService.getUnreadCount(userId);

        res.status(200).json({ count });
    });

    /**
     * POST /api/notifications
     * Create a new notification
     */
    createNotification = asyncHandler(async (req: Request, res: Response) => {
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
    });

    /**
     * PATCH /api/notifications/:id/read
     * Mark a notification as read
     */
    markAsRead = asyncHandler(async (req: Request, res: Response) => {
        const userId = req.user.id;
        const { id } = req.params;

        const notification = await notificationsService.markAsRead(id, userId);

        res.status(200).json(notification);
    });

    /**
     * PATCH /api/notifications/mark-all-read
     * Mark all notifications as read
     */
    markAllAsRead = asyncHandler(async (req: Request, res: Response) => {
        const userId = req.user.id;

        await notificationsService.markAllAsRead(userId);

        res.status(200).json({ message: 'All notifications marked as read' });
    });

    /**
     * PATCH /api/notifications/:id/pin
     * Toggle pin status
     */
    togglePin = asyncHandler(async (req: Request, res: Response) => {
        const userId = req.user.id;
        const { id } = req.params;

        const notification = await notificationsService.togglePin(id, userId);

        res.status(200).json(notification);
    });

    /**
     * DELETE /api/notifications/:id
     * Delete a notification
     */
    deleteNotification = asyncHandler(async (req: Request, res: Response) => {
        const userId = req.user.id;
        const { id } = req.params;

        await notificationsService.delete(id, userId);

        res.status(200).json({ message: 'Notification deleted successfully' });
    });

    /**
     * POST /api/notifications/bulk-delete
     * Bulk delete notifications
     */
    bulkDelete = asyncHandler(async (req: Request, res: Response) => {
        const userId = req.user.id;
        const { ids } = req.body;

        if (!Array.isArray(ids) || ids.length === 0) {
            return res.status(400).json({ message: 'IDs array is required' });
        }

        await notificationsService.deleteMany(ids, userId);

        res.status(200).json({ message: `${ids.length} notifications deleted successfully` });
    });
}

export default new NotificationsController();
