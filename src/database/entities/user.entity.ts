// src/database/entities/entities/user.entity.ts
import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    ManyToOne,
    JoinColumn,
} from 'typeorm';
import { Role } from './role.entity'; // CORREGIDO: './role.entity'
import bcrypt from 'bcrypt';

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

    @Column({ type: 'timestamp', nullable: true })
    passwordChangedAt?: Date;
    // Añadido '?'
    // @BeforeInsert() // Comentado por ahora
}

