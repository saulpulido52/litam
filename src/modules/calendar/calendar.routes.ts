import { Router } from 'express';
import googleCalendarController from './google-calendar.controller';
import { protect } from '../../middleware/auth.middleware';

const router = Router();

// Rutas protegidas para Google Calendar
router.get('/google/calendars', protect, googleCalendarController.getCalendarList);

router.post('/google/primary-calendar', protect, googleCalendarController.setPrimaryCalendar);

router.post('/google/toggle-sync', protect, googleCalendarController.toggleCalendarSync);

router.post('/google/sync-to-calendar', protect, googleCalendarController.syncAppointmentsToGoogleCalendar);

router.post('/google/sync-from-calendar', protect, googleCalendarController.syncGoogleCalendarToAppointments);

router.post('/google/events', protect, googleCalendarController.createCalendarEvent);

router.put('/google/events/:eventId', protect, googleCalendarController.updateCalendarEvent);

router.delete('/google/events/:eventId', protect, googleCalendarController.deleteCalendarEvent);

export default router; 