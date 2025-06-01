// src/database/entities/entities/role.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { User } from './user.entity'; // CORREGIDO: './user.entity'

export enum RoleName {
    PATIENT = 'patient',
    NUTRITIONIST = 'nutritionist',
    ADMIN = 'admin',
}

@Entity('roles')
export class Role {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column({ type: 'enum', enum: RoleName, unique: true })
    name!: RoleName;

    @OneToMany(() => User, (user) => user.role)
    users!: User[];
}

// src/database/entities/entities/patient-profile.entity.ts
import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    OneToOne,
    JoinColumn,
    CreateDateColumn,
    UpdateDateColumn,
} from 'typeorm';
import { User } from './user.entity'; // CORREGIDO: './user.entity'

@Entity('patient_profiles')
export class PatientProfile {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column()
    address!: string;

    @Column()
    phoneNumber!: string;

    @Column()
    dateOfBirth!: Date;

    @Column()
    gender!: string;

    @Column()
    height!: number;

    @Column()
    weight!: number;

    @Column()
    medicalHistory!: string;

    @Column()
    allergies!: string;

    @Column()
    medications!: string;

    @Column()
    emergencyContact!: string;

    @Column()
    relationshipToEmergencyContact!: string;

    @Column()
    insuranceProvider!: string;

    @Column()
    policyNumber!: string;

    @Column()
    groupNumber!: string;

    @Column()
    subscriberName!: string;

    @Column()
    subscriberId!: string;

    @Column()
    patientId!: string;

    @OneToOne(() => User, (user) => user.patientProfile)
    @JoinColumn()
    user!: User;

    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt!: Date;
}
