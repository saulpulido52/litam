import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    OneToOne,
    JoinColumn,
    CreateDateColumn,
    UpdateDateColumn,
} from 'typeorm';
import { User } from '@/database/entities/user.entity';

@Entity('nutritionist_profiles')
export class NutritionistProfile {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @OneToOne(() => User, (user) => user.nutritionist_profile, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'user_id' })
    user!: User;

    // --- Credenciales profesionales ---
    @Column({ type: 'varchar', length: 100, unique: true, nullable: true })
    license_number!: string | null;

    @Column({ type: 'varchar', length: 255, nullable: true })
    license_issuing_authority: string | null; // Nuevo campo: Entidad emisora de la licencia

    @Column('text', { array: true, nullable: true })
    specialties!: string[] | null;

    @Column({ type: 'integer', nullable: true })
    years_of_experience: number | null; // Nuevo campo: Años de experiencia

    // --- Formación ---
    @Column('text', { array: true, nullable: true })
    education: string[] | null; // Nuevo campo: Educación

    @Column('text', { array: true, nullable: true })
    certifications: string[] | null; // Nuevo campo: Certificaciones

    @Column('text', { array: true, nullable: true })
    areas_of_interest: string[] | null; // Nuevo campo: Áreas de interés

    // --- Práctica profesional ---
    @Column({ type: 'text', nullable: true })
    treatment_approach: string | null; // Nuevo campo: Enfoque de tratamiento

    @Column('text', { array: true, nullable: true })
    languages: string[] | null; // Nuevo campo: Idiomas

    @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
    consultation_fee: number | null; // Nuevo campo: Tarifa por consulta

    // --- Campos existentes ---
    @Column({ type: 'text', nullable: true })
    bio!: string | null;

    @Column({ type: 'jsonb', nullable: true })
    office_hours: any | null;

    @Column({ type: 'boolean', default: false })
    is_verified!: boolean;

    @CreateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
    created_at!: Date;

    @UpdateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
    updated_at!: Date;
}