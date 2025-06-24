// src/modules/appointments/appointment.routes.ts
import { Router } from 'express'; // <-- Asegúrate de que esta línea esté bien
import appointmentController from '../../modules/appointments/appointment.controller';
import { protect, authorize } from '../../middleware/auth.middleware';
import { validateMiddleware } from '../../middleware/validation.middleware';
import {
    ScheduleAppointmentDto,
    UpdateAppointmentStatusDto,
    ManageAvailabilityDto,
    SearchAvailabilityDto, // Asegúrate de importar esto también si lo usas en este archivo
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


// --- Rutas de Gestión de Citas ---

// Agendar una cita (Solo Pacientes)
router.post(
    '/schedule',
    authorize(RoleName.PATIENT),
    validateMiddleware(ScheduleAppointmentDto),
    appointmentController.scheduleAppointment
);

// Obtener mis citas (Pacientes y Nutriólogos)
router.get('/my-appointments', appointmentController.getMyAppointments);

// Actualizar el estado de una cita (Nutriólogos, Pacientes, Admin)
router.patch(
    '/:id/status',
    validateMiddleware(UpdateAppointmentStatusDto),
    appointmentController.updateAppointmentStatus
);

export default router;