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
        type: 'varchar',
        length: 50,
        unique: true,
        nullable: false,
    })
    name!: RoleName;

    @OneToMany(() => User, (user) => user.role)
    users!: User[];
}