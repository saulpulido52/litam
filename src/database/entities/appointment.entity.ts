// src/database/entities/appointment.entity.ts
import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    JoinColumn,
    CreateDateColumn,
    UpdateDateColumn,
} from 'typeorm';
import { User } from '../../database/entities/user.entity'; // Para paciente y nutriólogo

export enum AppointmentStatus {
    SCHEDULED = 'scheduled', // Cita agendada y pendiente
    COMPLETED = 'completed', // Cita finalizada con éxito
    CANCELLED_BY_PATIENT = 'cancelled_by_patient', // Cancelada por el paciente
    CANCELLED_BY_NUTRITIONIST = 'cancelled_by_nutritionist', // Cancelada por el nutriólogo
    RESCHEDULED = 'rescheduled', // Cita re-agendada (la original se marca así)
    NO_SHOW = 'no_show', // Paciente no se presentó
}

@Entity('appointments')
export class Appointment {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @ManyToOne(() => User, (user) => user.patient_appointments, { nullable: false, onDelete: 'CASCADE' })
    @JoinColumn({ name: 'patient_user_id' })
    patient!: User;

    @ManyToOne(() => User, (user) => user.nutritionist_appointments, { nullable: false, onDelete: 'RESTRICT' }) // RESTRICT para no borrar nutriólogo si tiene citas
    @JoinColumn({ name: 'nutritionist_user_id' })
    nutritionist!: User;

    @Column({ type: 'timestamptz', nullable: false })
    start_time!: Date;

    @Column({ type: 'timestamptz', nullable: false })
    end_time!: Date;

    @Column({
<<<<<<< HEAD
        type: 'enum',
        enum: AppointmentStatus,
        default: AppointmentStatus.SCHEDULED,
=======
        type: 'varchar',
        length: 20,
        default: 'scheduled',
>>>>>>> nutri/main
        nullable: false,
    })
    status!: AppointmentStatus;

    @Column({ type: 'text', nullable: true })
    notes: string | null; // Notas del paciente o nutriólogo sobre la cita

    @Column({ type: 'varchar', length: 500, nullable: true })
    meeting_link: string | null; // Enlace a videollamada (Zoom, Meet, etc.)

<<<<<<< HEAD
=======
    // --- CAMPOS PARA GOOGLE CALENDAR ---
    @Column({ type: 'varchar', length: 255, nullable: true })
    google_calendar_event_id: string | null; // ID del evento en Google Calendar

    @Column({ type: 'boolean', default: false })
    synced_to_google_calendar: boolean; // Indica si la cita está sincronizada con Google Calendar

    @Column({ type: 'timestamptz', nullable: true })
    last_sync_to_google: Date | null; // Timestamp de la última sincronización con Google Calendar

>>>>>>> nutri/main
    @CreateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
    created_at!: Date;

    @UpdateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
    updated_at!: Date;
}