// src/modules/appointments/appointment.dto.ts
import {
    IsString,
    IsNotEmpty,
    IsUUID,
    IsDateString,
    IsOptional,
    IsEnum,
    IsNumber,
    Min,
    Max,
    IsArray,
    ValidateNested,
    Length, // <-- AÑADIDO
    IsBoolean, // <-- AÑADIDO
} from 'class-validator';
import { Type } from 'class-transformer';
import { AppointmentStatus } from '../../database/entities/appointment.entity';
import { DayOfWeek } from '../../database/entities/nutritionist_availability.entity';

// DTO para que un Paciente agende una cita
export class ScheduleAppointmentDto {
    @IsUUID('4', { message: 'El ID del nutriólogo debe ser un UUID válido.' })
    nutritionistId!: string;

    @IsDateString({}, { message: 'La hora de inicio debe ser una fecha y hora válidas (ISO 8601).' })
    startTime!: string; // ISO 8601 string, ej: '2025-06-15T09:00:00Z'

    @IsDateString({}, { message: 'La hora de fin debe ser una fecha y hora válidas (ISO 8601).' })
    endTime!: string; // ISO 8601 string, ej: '2025-06-15T09:30:00Z'

    @IsOptional()
    @IsString({ message: 'Las notas deben ser una cadena de texto.' })
    @Length(0, 500, { message: 'Las notas no pueden exceder 500 caracteres.' })
    notes?: string;

    @IsOptional()
    @IsString({ message: 'El enlace de la reunión debe ser una URL válida.' })
    @Length(0, 500, { message: 'El enlace de la reunión no puede exceder 500 caracteres.' })
    meetingLink?: string; // Opcional, puede ser generado después
}

// DTO para que un Nutriólogo o Admin actualice el estado de una cita
export class UpdateAppointmentStatusDto {
    @IsEnum(AppointmentStatus, { message: 'El estado de la cita no es válido.' })
    status!: AppointmentStatus;

    @IsOptional()
    @IsString({ message: 'Las notas de actualización deben ser una cadena de texto.' })
    @Length(0, 500, { message: 'Las notas no pueden exceder 500 caracteres.' })
    notes?: string;
}

// DTO para una franja de disponibilidad de nutriólogo
export class AvailabilitySlotDto {
    @IsEnum(DayOfWeek, { message: 'El día de la semana no es válido.' })
<<<<<<< HEAD
    dayOfWeek!: DayOfWeek;
=======
    day_of_week!: DayOfWeek;
>>>>>>> nutri/main

    @IsNumber({}, { message: 'La hora de inicio en minutos debe ser un número entero.' })
    @Min(0, { message: 'La hora de inicio en minutos no puede ser negativa.' })
    @Max(1439, { message: 'La hora de inicio en minutos no puede exceder 1439 (23:59).' })
<<<<<<< HEAD
    startTimeMinutes!: number; // Ej: 540 (09:00)
=======
    start_time_minutes!: number; // Ej: 540 (09:00)
>>>>>>> nutri/main

    @IsNumber({}, { message: 'La hora de fin en minutos debe ser un número entero.' })
    @Min(0, { message: 'La hora de fin en minutos no puede ser negativa.' })
    @Max(1440, { message: 'La hora de fin en minutos no puede exceder 1440 (24:00).' })
<<<<<<< HEAD
    endTimeMinutes!: number; // Ej: 1020 (17:00)

    @IsOptional()
    @IsBoolean({ message: 'El estado activo debe ser un booleano.' }) // <-- AÑADIDO
    isActive?: boolean;
=======
    end_time_minutes!: number; // Ej: 1020 (17:00)

    @IsOptional()
    @IsBoolean({ message: 'El estado activo debe ser un booleano.' })
    is_active?: boolean;
>>>>>>> nutri/main
}

// DTO para que un Nutriólogo gestione su disponibilidad
export class ManageAvailabilityDto {
    @IsArray({ message: 'Las franjas de disponibilidad deben ser un array.' })
    @ValidateNested({ each: true })
    @Type(() => AvailabilitySlotDto)
    slots!: AvailabilitySlotDto[];
}

// DTO para que un Paciente busque disponibilidad (ej: por fecha o día)
export class SearchAvailabilityDto {
    @IsOptional()
    @IsDateString({}, { message: 'La fecha para buscar debe ser una fecha válida (YYYY-MM-DD).' })
    date?: string; // Para buscar disponibilidad en un día específico

    @IsOptional()
    @IsEnum(DayOfWeek, { message: 'El día de la semana no es válido.' })
    dayOfWeek?: DayOfWeek; // Para buscar disponibilidad recurrente
<<<<<<< HEAD
=======
}

// DTO para que un Nutriólogo cree una cita para un paciente
export class NutritionistScheduleAppointmentDto {
    @IsUUID('4', { message: 'El ID del paciente debe ser un UUID válido.' })
    patientId!: string;

    @IsDateString({}, { message: 'La hora de inicio debe ser una fecha y hora válidas (ISO 8601).' })
    startTime!: string; // ISO 8601 string, ej: '2025-06-15T09:00:00Z'

    @IsDateString({}, { message: 'La hora de fin debe ser una fecha y hora válidas (ISO 8601).' })
    endTime!: string; // ISO 8601 string, ej: '2025-06-15T09:30:00Z'

    @IsOptional()
    @IsString({ message: 'Las notas deben ser una cadena de texto.' })
    @Length(0, 500, { message: 'Las notas no pueden exceder 500 caracteres.' })
    notes?: string;

    @IsOptional()
    @IsString({ message: 'El enlace de la reunión debe ser una URL válida.' })
    @Length(0, 500, { message: 'El enlace de la reunión no puede exceder 500 caracteres.' })
    meetingLink?: string; // Opcional, puede ser generado después
>>>>>>> nutri/main
}