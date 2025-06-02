// src/modules/appointments/appointment.service.ts
import { Repository, Between, And } from 'typeorm'; // Importar Between y And para consultas de rango
import { AppDataSource } from '@/database/data-source';
import { User } from '@/database/entities/user.entity';
import { Appointment, AppointmentStatus } from '@/database/entities/appointment.entity';
import { NutritionistAvailability, DayOfWeek } from '@/database/entities/nutritionist_availability.entity';
import { PatientNutritionistRelation, RelationshipStatus } from '@/database/entities/patient_nutritionist_relation.entity';
import {
    ScheduleAppointmentDto,
    UpdateAppointmentStatusDto,
    AvailabilitySlotDto,
    ManageAvailabilityDto,
    SearchAvailabilityDto,
} from '@/modules/appointments/appointment.dto';
import { AppError } from '@/utils/app.error';
import { RoleName } from '@/database/entities/role.entity';

class AppointmentService {
    private userRepository: Repository<User>;
    private appointmentRepository: Repository<Appointment>;
    private availabilityRepository: Repository<NutritionistAvailability>;
    private relationRepository: Repository<PatientNutritionistRelation>;

    constructor() {
        this.userRepository = AppDataSource.getRepository(User);
        this.appointmentRepository = AppDataSource.getRepository(Appointment);
        this.availabilityRepository = AppDataSource.getRepository(NutritionistAvailability);
        this.relationRepository = AppDataSource.getRepository(PatientNutritionistRelation);
    }

    // --- Gestión de Disponibilidad (Nutriólogos) ---

    public async manageNutritionistAvailability(nutritionistId: string, manageDto: ManageAvailabilityDto) {
        const nutritionist = await this.userRepository.findOne({
            where: { id: nutritionistId, role: { name: RoleName.NUTRITIONIST } },
        });
        if (!nutritionist) {
            throw new AppError('Nutriólogo no encontrado o no autorizado.', 403);
        }

        // Eliminar todas las disponibilidades existentes para este nutriólogo para una actualización "completa"
        // Alternativamente, se podría hacer un UPSERT o un PATCH más granular si la UI lo permite.
        await this.availabilityRepository.delete({ nutritionist: { id: nutritionistId } });

        const newAvailabilities: NutritionistAvailability[] = [];
        for (const slotDto of manageDto.slots) {
            // Validar que la hora de fin sea mayor que la de inicio
            if (slotDto.endTimeMinutes <= slotDto.startTimeMinutes) {
                throw new AppError(`La hora de fin (${slotDto.endTimeMinutes} min) debe ser mayor que la hora de inicio (${slotDto.startTimeMinutes} min) para el ${slotDto.dayOfWeek}.`, 400);
            }

            const newSlot = this.availabilityRepository.create({
                nutritionist: nutritionist,
                day_of_week: slotDto.dayOfWeek,
                start_time_minutes: slotDto.startTimeMinutes,
                end_time_minutes: slotDto.endTimeMinutes,
                is_active: slotDto.isActive !== undefined ? slotDto.isActive : true, // Por defecto activo
            });
            newAvailabilities.push(newSlot);
        }

        await this.availabilityRepository.save(newAvailabilities);
        return newAvailabilities;
    }

    public async getNutritionistAvailability(nutritionistId: string) {
        const availability = await this.availabilityRepository.find({
            where: { nutritionist: { id: nutritionistId }, is_active: true },
            order: { day_of_week: 'ASC', start_time_minutes: 'ASC' },
        });
        return availability;
    }

    public async searchNutritionistAvailabilityForPatient(nutritionistId: string, searchDto: SearchAvailabilityDto) {
        // En una implementación real, esto sería mucho más complejo:
        // 1. Obtener la disponibilidad recurrente del nutriólogo.
        // 2. Obtener todas las citas ya agendadas del nutriólogo.
        // 3. Calcular las franjas horarias disponibles para el día/rango solicitado.

        const nutritionist = await this.userRepository.findOne({
            where: { id: nutritionistId, role: { name: RoleName.NUTRITIONIST } },
        });
        if (!nutritionist) {
            throw new AppError('Nutriólogo no encontrado.', 404);
        }

        // Simulación básica: solo devolver la disponibilidad recurrente
        const availabilitySlots = await this.getNutritionistAvailability(nutritionistId);

        // Filtrar por día de la semana si se especifica
        if (searchDto.dayOfWeek) {
            return availabilitySlots.filter(slot => slot.day_of_week === searchDto.dayOfWeek);
        }

        // Si se busca por fecha, podríamos intentar mapear la disponibilidad recurrente a franjas concretas en esa fecha.
        // Por ahora, solo devolver la disponibilidad completa.
        // En fase 4: Se calcularían bloques de tiempo disponibles para esa fecha específica.
        return availabilitySlots;
    }


    // --- Gestión de Citas (Pacientes y Nutriólogos) ---

    public async scheduleAppointment(patientId: string, scheduleDto: ScheduleAppointmentDto) {
        const patient = await this.userRepository.findOne({
            where: { id: patientId, role: { name: RoleName.PATIENT } },
        });
        if (!patient) {
            throw new AppError('Paciente no encontrado o no autorizado.', 403);
        }

        const nutritionist = await this.userRepository.findOne({
            where: { id: scheduleDto.nutritionistId, role: { name: RoleName.NUTRITIONIST } },
        });
        if (!nutritionist) {
            throw new AppError('Nutriólogo no encontrado.', 404);
        }

        // Verificar relación activa
        const activeRelation = await this.relationRepository.findOne({
            where: {
                patient: { id: patient.id },
                nutritionist: { id: nutritionist.id },
                status: RelationshipStatus.ACTIVE,
            },
        });
        if (!activeRelation) {
            throw new AppError('El paciente no está vinculado activamente con este nutriólogo. No se pueden agendar citas.', 403);
        }

        const startTime = new Date(scheduleDto.startTime);
        const endTime = new Date(scheduleDto.endTime);

        if (startTime >= endTime) {
            throw new AppError('La hora de inicio de la cita debe ser anterior a la hora de fin.', 400);
        }
        if (startTime < new Date()) {
            throw new AppError('No se pueden agendar citas en el pasado.', 400);
        }

        // Verificar si hay citas superpuestas para el nutriólogo
        const overlappingAppointment = await this.appointmentRepository.findOne({
            where: {
                nutritionist: { id: nutritionist.id },
                status: AppointmentStatus.SCHEDULED, // Solo citas agendadas
                // Lógica de superposición de tiempo:
                start_time: Between(startTime, endTime), // La nueva cita empieza durante una existente
                end_time: Between(startTime, endTime), // La nueva cita termina durante una existente
                // Más compleja para cubrir todos los casos: existente_inicio < nuevo_fin AND existente_fin > nuevo_inicio
                // Usaremos una consulta avanzada para mejor precisión.
            },
        });

        // Consulta más robusta para superposición de citas
        const overlappingQuery = await this.appointmentRepository
            .createQueryBuilder('appointment')
            .where('appointment.nutritionist_user_id = :nutritionistId', { nutritionistId: nutritionist.id })
            .andWhere('appointment.status = :status', { status: AppointmentStatus.SCHEDULED })
            .andWhere('(:startTime < appointment.end_time AND :endTime > appointment.start_time)', { startTime, endTime })
            .getOne();
            
        if (overlappingQuery) {
            throw new AppError('El nutriólogo ya tiene una cita agendada que se superpone con esta franja horaria.', 409); // 409 Conflict
        }

        // TODO: Verificar si la franja horaria de la cita está dentro de la disponibilidad definida por el nutriólogo
        // Esto implicaría:
        // 1. Obtener la disponibilidad del nutriólogo para el DayOfWeek de startTime.
        // 2. Convertir startTime y endTime a minutos del día.
        // 3. Comprobar si startTime_minutes y endTime_minutes caen dentro de un slot disponible.
        // Esto puede ser complejo y se podría añadir en una fase posterior o refactorizar aquí.

        const newAppointment = this.appointmentRepository.create({
            patient: patient,
            nutritionist: nutritionist,
            start_time: startTime,
            end_time: endTime,
            notes: scheduleDto.notes,
            meeting_link: scheduleDto.meetingLink,
            status: AppointmentStatus.SCHEDULED,
        });

        await this.appointmentRepository.save(newAppointment);
        return newAppointment;
    }

    public async getMyAppointments(userId: string, userRole: RoleName) {
        let appointments: Appointment[];
        if (userRole === RoleName.PATIENT) {
            appointments = await this.appointmentRepository.find({
                where: { patient: { id: userId } },
                relations: ['nutritionist', 'patient'], // Cargar ambos lados de la relación
                order: { start_time: 'ASC' },
            });
        } else if (userRole === RoleName.NUTRITIONIST) {
            appointments = await this.appointmentRepository.find({
                where: { nutritionist: { id: userId } },
                relations: ['patient', 'nutritionist'], // Cargar ambos lados
                order: { start_time: 'ASC' },
            });
        } else {
            throw new AppError('Acceso denegado. Rol no autorizado para ver citas propias.', 403);
        }

        // Ocultar hash de password de los usuarios relacionados
        return appointments.map(appt => {
            const { password_hash: patientHash, ...patientWithoutHash } = appt.patient;
            const { password_hash: nutritionistHash, ...nutritionistWithoutHash } = appt.nutritionist;
            return {
                ...appt,
                patient: patientWithoutHash,
                nutritionist: nutritionistWithoutHash,
            };
        });
    }

    public async updateAppointmentStatus(appointmentId: string, newStatus: AppointmentStatus, callerId: string, callerRole: RoleName) {
        const appointment = await this.appointmentRepository.findOne({
            where: { id: appointmentId },
            relations: ['patient', 'nutritionist'],
        });

        if (!appointment) {
            throw new AppError('Cita no encontrada.', 404);
        }

        // Verificar permisos para cambiar el estado de la cita
        if (callerRole === RoleName.PATIENT) {
            if (appointment.patient.id !== callerId || (newStatus !== AppointmentStatus.CANCELLED_BY_PATIENT && newStatus !== AppointmentStatus.RESCHEDULED)) {
                throw new AppError('No tienes permiso para actualizar el estado de esta cita, o el estado es inválido para tu rol.', 403);
            }
            appointment.status = newStatus;
        } else if (callerRole === RoleName.NUTRITIONIST) {
            if (appointment.nutritionist.id !== callerId || newStatus === AppointmentStatus.CANCELLED_BY_PATIENT) { // Nutriólogo no puede cancelar POR PACIENTE
                throw new AppError('No tienes permiso para actualizar el estado de esta cita, o el estado es inválido para tu rol.', 403);
            }
            appointment.status = newStatus;
        } else if (callerRole === RoleName.ADMIN) {
            // Admin puede cambiar a cualquier estado
            appointment.status = newStatus;
        } else {
            throw new AppError('Acceso denegado. Rol no autorizado para actualizar citas.', 403);
        }

        // Validaciones de transición de estado (ej: no se puede cancelar una cita completada)
        if (appointment.status === AppointmentStatus.COMPLETED && newStatus !== AppointmentStatus.COMPLETED) {
            throw new AppError('No se puede cambiar el estado de una cita ya completada.', 400);
        }

        await this.appointmentRepository.save(appointment);
        return appointment;
    }
}

export default new AppointmentService();