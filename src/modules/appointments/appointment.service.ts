// src/modules/appointments/appointment.service.ts
import { Repository, Between, And } from 'typeorm'; // Importar Between y And para consultas de rango
import { AppDataSource } from '../../database/data-source';
import { User } from '../../database/entities/user.entity';
import { Appointment, AppointmentStatus } from '../../database/entities/appointment.entity';
import { NutritionistAvailability, DayOfWeek } from '../../database/entities/nutritionist_availability.entity';
import { PatientNutritionistRelation, RelationshipStatus } from '../../database/entities/patient_nutritionist_relation.entity';
import {
    ScheduleAppointmentDto,
    UpdateAppointmentStatusDto,
    AvailabilitySlotDto,
    ManageAvailabilityDto,
    SearchAvailabilityDto,
<<<<<<< HEAD
=======
    NutritionistScheduleAppointmentDto,
>>>>>>> nutri/main
} from '../../modules/appointments/appointment.dto';
import { AppError } from '../../utils/app.error';
import { RoleName } from '../../database/entities/role.entity';

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
<<<<<<< HEAD
            if (slotDto.endTimeMinutes <= slotDto.startTimeMinutes) {
                throw new AppError(`La hora de fin (${slotDto.endTimeMinutes} min) debe ser mayor que la hora de inicio (${slotDto.startTimeMinutes} min) para el ${slotDto.dayOfWeek}.`, 400);
=======
            if (slotDto.end_time_minutes <= slotDto.start_time_minutes) {
                throw new AppError(`La hora de fin (${slotDto.end_time_minutes} min) debe ser mayor que la hora de inicio (${slotDto.start_time_minutes} min) para el ${slotDto.day_of_week}.`, 400);
>>>>>>> nutri/main
            }

            const newSlot = this.availabilityRepository.create({
                nutritionist: nutritionist,
<<<<<<< HEAD
                day_of_week: slotDto.dayOfWeek,
                start_time_minutes: slotDto.startTimeMinutes,
                end_time_minutes: slotDto.endTimeMinutes,
                is_active: slotDto.isActive !== undefined ? slotDto.isActive : true, // Por defecto activo
=======
                day_of_week: slotDto.day_of_week,
                start_time_minutes: slotDto.start_time_minutes,
                end_time_minutes: slotDto.end_time_minutes,
                is_active: slotDto.is_active !== undefined ? slotDto.is_active : true, // Por defecto activo
>>>>>>> nutri/main
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

<<<<<<< HEAD
=======
    // NUEVO: Obtener citas existentes de un nutriólogo por rango de fechas
    public async getNutritionistAppointmentsByDateRange(nutritionistId: string, startDate: string, endDate: string) {
        const nutritionist = await this.userRepository.findOne({
            where: { id: nutritionistId, role: { name: RoleName.NUTRITIONIST } },
        });
        if (!nutritionist) {
            throw new AppError('Nutriólogo no encontrado.', 404);
        }

        const start = new Date(startDate);
        const end = new Date(endDate);

        if (start >= end) {
            throw new AppError('La fecha de inicio debe ser anterior a la fecha de fin.', 400);
        }

        // Obtener citas programadas en el rango de fechas
        const appointments = await this.appointmentRepository.find({
            where: {
                nutritionist: { id: nutritionistId },
                status: AppointmentStatus.SCHEDULED,
                start_time: Between(start, end)
            },
            relations: ['patient', 'nutritionist'],
            order: {
                start_time: 'ASC'
            }
        });

        return appointments;
    }

>>>>>>> nutri/main
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

<<<<<<< HEAD
=======
    // NUEVO: Calcular slots disponibles considerando citas existentes
    public async getAvailableSlots(nutritionistId: string, date: string) {
        const nutritionist = await this.userRepository.findOne({
            where: { id: nutritionistId, role: { name: RoleName.NUTRITIONIST } },
        });
        if (!nutritionist) {
            throw new AppError('Nutriólogo no encontrado.', 404);
        }

        const targetDate = new Date(date);
        const dayOfWeek = this.getDayOfWeekFromDate(targetDate);

        // Obtener disponibilidad recurrente para este día
        const availabilitySlots = await this.availabilityRepository.find({
            where: {
                nutritionist: { id: nutritionistId },
                day_of_week: dayOfWeek,
                is_active: true
            }
        });

            // **OPTIMIZACIÓN**: Obtener citas existentes con campos mínimos
    const startOfDay = new Date(targetDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(targetDate);
    endOfDay.setHours(23, 59, 59, 999);

    const existingAppointments = await this.appointmentRepository.find({
        where: {
            nutritionist: { id: nutritionistId },
            status: AppointmentStatus.SCHEDULED,
            start_time: Between(startOfDay, endOfDay)
        },
        select: ['start_time', 'end_time'] // **OPTIMIZACIÓN**: Solo campos necesarios
    });

        // Calcular slots disponibles
        const availableSlots: any[] = [];

        for (const slot of availabilitySlots) {
            // Generar slots de 30 minutos dentro del rango
            for (let minutes = slot.start_time_minutes; minutes < slot.end_time_minutes; minutes += 30) {
                const slotStartTime = this.minutesToTime(targetDate, minutes);
                const slotEndTime = new Date(slotStartTime.getTime() + 30 * 60000);

                // Verificar si está ocupado
                const isOccupied = existingAppointments.some(apt => {
                    const aptStart = new Date(apt.start_time);
                    const aptEnd = new Date(apt.end_time);
                    return slotStartTime < aptEnd && slotEndTime > aptStart;
                });

                // Solo incluir slots futuros
                if (slotStartTime > new Date() && !isOccupied) {
                    availableSlots.push({
                        time: slotStartTime.toTimeString().slice(0, 5), // HH:MM
                        start_time: slotStartTime.toISOString(),
                        end_time: slotEndTime.toISOString(),
                        duration_minutes: 30
                    });
                }
            }
        }

        return availableSlots;
    }

    // Helper: Convertir fecha a día de la semana
    private getDayOfWeekFromDate(date: Date): DayOfWeek {
        const days = [
            DayOfWeek.SUNDAY, DayOfWeek.MONDAY, DayOfWeek.TUESDAY, DayOfWeek.WEDNESDAY,
            DayOfWeek.THURSDAY, DayOfWeek.FRIDAY, DayOfWeek.SATURDAY
        ];
        return days[date.getDay()];
    }

    // Helper: Convertir minutos del día a fecha/hora
    private minutesToTime(date: Date, minutes: number): Date {
        const result = new Date(date);
        result.setHours(Math.floor(minutes / 60), minutes % 60, 0, 0);
        return result;
    }
>>>>>>> nutri/main

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

<<<<<<< HEAD
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
=======
            // **OPTIMIZACIÓN**: Consulta más eficiente para verificar superposición de citas
    const overlappingQuery = await this.appointmentRepository
        .createQueryBuilder('appointment')
        .where('appointment.nutritionist_user_id = :nutritionistId', { nutritionistId: nutritionist.id })
        .andWhere('appointment.status = :status', { status: AppointmentStatus.SCHEDULED })
        .andWhere('(:startTime < appointment.end_time AND :endTime > appointment.start_time)', { startTime, endTime })
        .getOne();
>>>>>>> nutri/main
            
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

<<<<<<< HEAD
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
=======
    public async scheduleAppointmentForPatient(nutritionistId: string, scheduleDto: NutritionistScheduleAppointmentDto) {
        const nutritionist = await this.userRepository.findOne({
            where: { id: nutritionistId, role: { name: RoleName.NUTRITIONIST } },
        });
        if (!nutritionist) {
            throw new AppError('Nutriólogo no encontrado o no autorizado.', 403);
        }

        const patient = await this.userRepository.findOne({
            where: { id: scheduleDto.patientId, role: { name: RoleName.PATIENT } },
        });
        if (!patient) {
            throw new AppError('Paciente no encontrado.', 404);
        }

        // Verificar relación activa entre nutriólogo y paciente
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
        const overlappingQuery = await this.appointmentRepository
            .createQueryBuilder('appointment')
            .where('appointment.nutritionist_user_id = :nutritionistId', { nutritionistId: nutritionist.id })
            .andWhere('appointment.status = :status', { status: AppointmentStatus.SCHEDULED })
            .andWhere('(:startTime < appointment.end_time AND :endTime > appointment.start_time)', { startTime, endTime })
            .getOne();
            
        if (overlappingQuery) {
            throw new AppError('Ya tienes una cita agendada que se superpone con esta franja horaria.', 409);
        }

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

    // **OPTIMIZACIÓN**: Método optimizado para obtener citas con carga selectiva
    public async getMyAppointments(userId: string, userRole: RoleName) {
        let appointments: Appointment[];
        
        // **OPTIMIZACIÓN**: Usar query builder para seleccionar solo campos necesarios
        const baseQuery = this.appointmentRepository
            .createQueryBuilder('appointment')
            .leftJoinAndSelect('appointment.patient', 'patient')
            .leftJoinAndSelect('appointment.nutritionist', 'nutritionist')
            .select([
                'appointment.id',
                'appointment.start_time',
                'appointment.end_time',
                'appointment.status',
                'appointment.notes',
                'appointment.meeting_link',
                'appointment.created_at',
                'patient.id',
                'patient.first_name',
                'patient.last_name',
                'patient.email',
                'nutritionist.id',
                'nutritionist.first_name',
                'nutritionist.last_name',
                'nutritionist.email'
            ])
            .orderBy('appointment.start_time', 'ASC');

        if (userRole === RoleName.PATIENT) {
            appointments = await baseQuery
                .where('patient.id = :userId', { userId })
                .getMany();
        } else if (userRole === RoleName.NUTRITIONIST) {
            appointments = await baseQuery
                .where('nutritionist.id = :userId', { userId })
                .getMany();
>>>>>>> nutri/main
        } else {
            throw new AppError('Acceso denegado. Rol no autorizado para ver citas propias.', 403);
        }

<<<<<<< HEAD
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
=======
        // **OPTIMIZACIÓN**: Ya no es necesario filtrar password_hash porque no se carga
        return appointments;
>>>>>>> nutri/main
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
<<<<<<< HEAD
=======

    // Actualizar una cita completa (fecha, hora, notas)
    public async updateAppointment(appointmentId: string, nutritionistId: string, updateData: any) {
        const appointment = await this.appointmentRepository.findOne({
            where: { id: appointmentId },
            relations: ['patient', 'nutritionist']
        });

        if (!appointment) {
            throw new AppError('Cita no encontrada.', 404);
        }

        // Verificar que el nutriólogo sea el propietario de la cita
        if (appointment.nutritionist.id !== nutritionistId) {
            throw new AppError('No tienes permisos para actualizar esta cita.', 403);
        }

        // Actualizar los campos proporcionados
        if (updateData.start_time) {
            appointment.start_time = new Date(updateData.start_time);
        }
        if (updateData.end_time) {
            appointment.end_time = new Date(updateData.end_time);
        }
        if (updateData.notes !== undefined) {
            appointment.notes = updateData.notes;
        }
        if (updateData.status) {
            appointment.status = updateData.status;
        }

        // Verificar que las fechas sean válidas
        if (appointment.start_time >= appointment.end_time) {
            throw new AppError('La hora de inicio debe ser anterior a la hora de fin.', 400);
        }

        // Verificar conflictos de horario si se cambió la fecha/hora
        if (updateData.start_time || updateData.end_time) {
            const overlappingAppointments = await this.appointmentRepository.createQueryBuilder('appointment')
                .where('appointment.nutritionist_user_id = :nutritionistId', { nutritionistId })
                .andWhere('appointment.id != :appointmentId', { appointmentId })
                .andWhere('appointment.status = :status', { status: AppointmentStatus.SCHEDULED })
                .andWhere('(:start < appointment.end_time AND :end > appointment.start_time)', {
                    start: appointment.start_time,
                    end: appointment.end_time
                })
                .getMany();

            if (overlappingAppointments.length > 0) {
                throw new AppError('Ya tienes una cita programada en ese horario.', 409);
            }
        }

        const updatedAppointment = await this.appointmentRepository.save(appointment);
        return updatedAppointment;
    }

    // Eliminar una cita completamente
    public async deleteAppointment(appointmentId: string, nutritionistId: string) {
        const appointment = await this.appointmentRepository.findOne({
            where: { id: appointmentId },
            relations: ['patient', 'nutritionist']
        });

        if (!appointment) {
            throw new AppError('Cita no encontrada.', 404);
        }

        // Verificar que el nutriólogo sea el propietario de la cita
        if (appointment.nutritionist.id !== nutritionistId) {
            throw new AppError('No tienes permisos para eliminar esta cita.', 403);
        }

        // Eliminar la cita de la base de datos
        await this.appointmentRepository.remove(appointment);
        
        return { message: 'Cita eliminada exitosamente' };
    }
>>>>>>> nutri/main
}

export default new AppointmentService();