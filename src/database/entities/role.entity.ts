import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { User } from '../../database/entities/user.entity'; // Ruta corregida

export enum RoleName {
    PATIENT = 'patient',
    NUTRITIONIST = 'nutritionist',
    ADMIN = 'admin',
}

@Entity('roles')
export class Role {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({
        type: 'enum',
        enum: RoleName,
        enumName: 'roles_name_enum', // Especifica el nombre del enum en PostgreSQL
        unique: true,
        nullable: false,
    })
    name!: RoleName;

    @OneToMany(() => User, (user) => user.role)
    users!: User[];
}