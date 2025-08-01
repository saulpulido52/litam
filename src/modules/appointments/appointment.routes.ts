// src/modules/appointments/appointment.routes.ts
import { Router } from 'express'; // <-- Asegúrate de que esta línea esté bien
import appointmentController from '../../modules/appointments/appointment.controller';
import { protect, authorize } from '../../middleware/auth.middleware';
import { validateMiddleware } from '../../middleware/validation.middleware';
import {
    ScheduleAppointmentDto,
    UpdateAppointmentStatusDto,
    ManageAvailabilityDto,
    SearchAvailabilityDto,
    NutritionistScheduleAppointmentDto,
} from '../../modules/appointments/appointment.dto';
import { RoleName } from '../../database/entities/role.entity';
import { AppointmentStatus } from '../../database/entities/appointment.entity'; // Asegúrate de importar esto

const router = Router();

// Rutas protegidas (todos deben estar logueados)
router.use(protect);

// --- Rutas de Gestión de Disponibilidad (Solo Nutriólogos) ---
router.route('/availability')
    .post(
        authorize(RoleName.NUTRITIONIST),
        validateMiddleware(ManageAvailabilityDto),
        appointmentController.manageAvailability
    )
    .get(
        authorize(RoleName.NUTRITIONIST),
        appointmentController.getMyAvailability
    );

// Búsqueda de disponibilidad de nutriólogos por otros usuarios (Pacientes, Admin)
// La ruta espera un ID de nutriólogo en los parámetros, no solo en la query string
router.get('/availability/:nutritionistId', appointmentController.searchNutritionistAvailability);

// NUEVAS RUTAS: Gestión avanzada de disponibilidad
// Obtener citas existentes de un nutriólogo por rango de fechas
router.get('/nutritionist/:nutritionistId/appointments', appointmentController.getNutritionistAppointmentsByDateRange);

// Obtener slots disponibles para una fecha específica
router.get('/nutritionist/:nutritionistId/available-slots', appointmentController.getAvailableSlots);

// --- Rutas de Gestión de Citas ---

// Agendar una cita (Solo Pacientes)
router.post(
    '/schedule',
    authorize(RoleName.PATIENT),
    validateMiddleware(ScheduleAppointmentDto),
    appointmentController.scheduleAppointment
);

// Agendar una cita para un paciente (Solo Nutriólogos)
router.post(
    '/schedule-for-patient',
    authorize(RoleName.NUTRITIONIST),
    validateMiddleware(NutritionistScheduleAppointmentDto),
    appointmentController.scheduleAppointmentForPatient
);

// Obtener mis citas (Pacientes y Nutriólogos)
router.get('/my-appointments', appointmentController.getMyAppointments);

// Actualizar el estado de una cita (Nutriólogos, Pacientes, Admin)
router.patch(
    '/:id/status',
    validateMiddleware(UpdateAppointmentStatusDto),
    appointmentController.updateAppointmentStatus
);

// Actualizar una cita completa (fecha, hora, notas) - Solo Nutriólogos
router.patch(
    '/:id',
    authorize(RoleName.NUTRITIONIST),
    appointmentController.updateAppointment
);

// Eliminar una cita completamente (Solo Nutriólogos)
router.delete(
    '/:id',
    authorize(RoleName.NUTRITIONIST),
    appointmentController.deleteAppointment
);

export default router;