// src/database/entities/entities/user.entity.ts
import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    ManyToOne,
    JoinColumn,
    // BeforeInsert, // Comentado por ahora
    // BeforeUpdate, // Comentado por ahora
} from 'typeorm';
import { Role } from './role.entity'; // Asumiendo que role.entity.ts está en el mismo directorio
import bcrypt from 'bcrypt'; // Esto debería funcionar ahora

@Entity('users')
export class User {
    @PrimaryGeneratedColumn('uuid')
    id!: string; // Añadido '!'

    @Column({ type: 'varchar', length: 255, unique: true, nullable: false })
    email!: string; // Añadido '!'

    @Column({ type: 'varchar', length: 255, nullable: false, select: false })
    password_hash!: string; // Añadido '!'

    @Column({ type: 'varchar', length: 100, nullable: true })
    first_name!: string | null; // Añadido '!'

    @Column({ type: 'varchar', length: 100, nullable: true })
    last_name!: string | null; // Añadido '!'

    @Column({ type: 'integer', nullable: true })
    age!: number | null; // Añadido '!'

    @Column({ type: 'varchar', length: 50, nullable: true })
    gender!: string | null; // Añadido '!'

    @ManyToOne(() => Role, (role) => role.users, { eager: true, nullable: false })
    @JoinColumn({ name: 'role_id' })
    role!: Role; // Añadido '!'

    @Column({ type: 'boolean', default: true })
    is_active!: boolean; // Añadido '!'

    @CreateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
    created_at!: Date; // Añadido '!'

    @UpdateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
    updated_at!: Date; // Añadido '!'
}