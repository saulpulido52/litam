// src/database/entities/entities/nutritionist_profile.entity.ts
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

@Entity('nutritionist_profiles')
export class NutritionistProfile {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @OneToOne(() => User, (user) => user.nutritionist_profile, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'user_id' })
    user!: User;

    @Column({ type: 'varchar', length: 100, unique: true, nullable: true })
    license_number: string | null; // Número de cédula/licencia profesional

    @Column('text', { array: true, nullable: true })
    specialties: string[] | null; // Ej: ['control_de_peso', 'nutricion_deportiva']

    @Column({ type: 'text', nullable: true })
    bio: string | null; // Biografía o descripción del nutriólogo

    @Column({ type: 'jsonb', nullable: true })
    office_hours: any | null; // Ej: { monday: '9-17', tuesday: '10-18' }

    @Column({ type: 'boolean', default: false })
    is_verified!: boolean; // ¿Verificado por el administrador?

    @CreateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
    created_at!: Date;

    @UpdateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
    updated_at!: Date;
}