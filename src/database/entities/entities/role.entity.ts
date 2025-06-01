// src/database/entities/entities/role.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { User } from './user.entity'; // Asumiendo que user.entity.ts está en el mismo directorio

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
        unique: true,
        nullable: false,
    })
    name!: RoleName; // Añadido '!'

    @OneToMany(() => User, (user) => user.role)
    users!: User[]; // Añadido '!'
}