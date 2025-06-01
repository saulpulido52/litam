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
    @PrimaryGeneratedColumn()
    id!: number; // Añadido '!'

    @Column({
        type: 'enum',
        enum: RoleName,
        enumName: 'role_name_enum', // Especifica el nombre del enum en PostgreSQL
        unique: true,
        nullable: false,
    })
    name!: RoleName; // Añadido '!'

    @OneToMany(() => User, (user) => user.role)
    users!: User[]; // Añadido '!'
}