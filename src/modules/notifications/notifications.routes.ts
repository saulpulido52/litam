// src/modules/notifications/notifications.routes.ts
import { Router } from 'express';
import notificationsController from './notifications.controller';
import { protect } from '../../middleware/auth.middleware';

const router = Router();

// All routes require authentication
router.use(protect);

// Get all notifications for authenticated user
router.get('/', notificationsController.getNotifications);

// Get unread count
router.get('/unread-count', notificationsController.getUnreadCount);

// Create notification
router.post('/', notificationsController.createNotification);

// Mark all as read (must be before /:id routes)
router.patch('/mark-all-read', notificationsController.markAllAsRead);

// Bulk delete
router.post('/bulk-delete', notificationsController.bulkDelete);

// Mark single as read
router.patch('/:id/read', notificationsController.markAsRead);

// Toggle pin
router.patch('/:id/pin', notificationsController.togglePin);

// Delete single notification
router.delete('/:id', notificationsController.deleteNotification);

export default router;
