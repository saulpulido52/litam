// src/database/entities/entities/patient_nutritionist_relation.entity.ts
import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    JoinColumn,
    CreateDateColumn,
    UpdateDateColumn,
    Unique,
} from 'typeorm';
import { User } from './user.entity'; // CORREGIDO: './user.entity'
import { RoleName } from './role.entity'; // CORREGIDO: './role.entity'

export enum RelationshipStatus {
    PENDING = 'pending', // Solicitud enviada por el paciente al nutriólogo
    ACTIVE = 'active', // Relación confirmada y activa
    INACTIVE = 'inactive', // Relación pausada o terminada por acuerdo
    REJECTED = 'rejected', // Nutriólogo rechazó la solicitud
    BLOCKED = 'blocked', // Nutriólogo bloqueó al paciente
}

@Entity('patient_nutritionist_relations')
@Unique(['patient', 'nutritionist']) // Asegura que no haya relaciones duplicadas
export class PatientNutritionistRelation {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    // El paciente (usuario con rol 'patient')
    @ManyToOne(() => User, { nullable: false })
    @JoinColumn({ name: 'patient_user_id' })
    patient!: User;

    // El nutriólogo (usuario con rol 'nutritionist')
    @ManyToOne(() => User, { nullable: false })
    @JoinColumn({ name: 'nutritionist_user_id' })
    nutritionist!: User;

    @Column({
        type: 'enum',
        enum: RelationshipStatus,
        default: RelationshipStatus.PENDING,
        nullable: false,
    })
    status!: RelationshipStatus;

    @Column({ type: 'text', nullable: true })
    notes: string | null; // Notas sobre esta relación específica

    @CreateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
    requested_at!: Date;

    @Column({ type: 'timestamptz', nullable: true })
    accepted_at: Date | null;

    @Column({ type: 'timestamptz', nullable: true })
    ended_at: Date | null;

    @UpdateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
    updated_at!: Date;
}