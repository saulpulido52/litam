import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    OneToOne,
    JoinColumn,
    CreateDateColumn,
    UpdateDateColumn,
} from 'typeorm';
import { User } from '../../database/entities/user.entity';

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

    // === NUEVOS CAMPOS PARA VALIDACIÓN PROFESIONAL ===
    @Column({ type: 'varchar', length: 20, nullable: true })
    professional_id: string | null; // Cédula profesional

    @Column({ type: 'varchar', length: 255, nullable: true })
    professional_id_issuer: string | null; // Entidad que emitió la cédula (SEP, universidad)

    @Column({ type: 'varchar', length: 100, nullable: true })
    university: string | null; // Universidad donde estudió

    @Column({ type: 'varchar', length: 100, nullable: true })
    degree_title: string | null; // Título profesional (Lic. en Nutrición, etc.)

    @Column({ type: 'date', nullable: true })
    graduation_date: Date | null; // Fecha de graduación

    @Column({ type: 'enum', enum: ['pending', 'approved', 'rejected', 'under_review'], default: 'pending' })
    verification_status: 'pending' | 'approved' | 'rejected' | 'under_review'; // Estado de verificación

    @Column({ type: 'text', nullable: true })
    verification_notes: string | null; // Notas del administrador sobre la verificación

    @Column({ type: 'uuid', nullable: true })
    verified_by_admin_id: string | null; // ID del admin que verificó

    @Column({ type: 'timestamptz', nullable: true })
    verified_at: Date | null; // Fecha de verificación

    // Documentos cargados para validación
    @Column({ type: 'jsonb', nullable: true })
    uploaded_documents: {
        professional_id_front?: string; // URL imagen frontal de cédula
        professional_id_back?: string; // URL imagen trasera de cédula
        diploma?: string; // URL imagen del título profesional
        additional_certifications?: string[]; // URLs de certificaciones adicionales
    } | null;

    // Información adicional de validación
    @Column({ type: 'varchar', length: 15, nullable: true })
    rfc: string | null; // RFC para validación fiscal

    @Column({ type: 'varchar', length: 18, nullable: true })
    curp: string | null; // CURP para validación de identidad

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

    // --- NUEVOS CAMPOS PARA APP MÓVIL ---
    
    // Descripción profesional breve
    @Column({ type: 'text', nullable: true })
    professional_summary: string | null; // Descripción breve para pacientes

    // Modalidad de consulta
    @Column({ type: 'boolean', default: true })
    offers_in_person: boolean; // Consultas presenciales

    @Column({ type: 'boolean', default: true })
    offers_online: boolean; // Consultas online

    // Ubicación del consultorio
    @Column({ type: 'varchar', length: 255, nullable: true })
    clinic_name: string | null; // Nombre del consultorio/clínica

    @Column({ type: 'text', nullable: true })
    clinic_address: string | null; // Dirección completa del consultorio

    @Column({ type: 'varchar', length: 100, nullable: true })
    clinic_city: string | null; // Ciudad

    @Column({ type: 'varchar', length: 100, nullable: true })
    clinic_state: string | null; // Estado/Provincia

    @Column({ type: 'varchar', length: 10, nullable: true })
    clinic_zip_code: string | null; // Código postal

    @Column({ type: 'varchar', length: 100, nullable: true })
    clinic_country: string | null; // País

    // Coordenadas para Google Maps
    @Column({ type: 'decimal', precision: 10, scale: 8, nullable: true })
    latitude: number | null; // Latitud

    @Column({ type: 'decimal', precision: 11, scale: 8, nullable: true })
    longitude: number | null; // Longitud

    // Información adicional del consultorio
    @Column({ type: 'text', nullable: true })
    clinic_notes: string | null; // Notas sobre el consultorio (estacionamiento, accesibilidad, etc.)

    @Column({ type: 'varchar', length: 20, nullable: true })
    clinic_phone: string | null; // Teléfono del consultorio

    // Estado de disponibilidad
    @Column({ type: 'boolean', default: true })
    is_available: boolean; // Si está disponible para nuevos pacientes

    // === REDES SOCIALES ===
    @Column({ type: 'jsonb', nullable: true })
    social_media: {
        instagram?: string;
        facebook?: string;
        linkedin?: string;
        twitter?: string;
        youtube?: string;
        tiktok?: string;
        website?: string;
    } | null; // Redes sociales profesionales

    // === CAMPOS CALCULADOS PARA REVIEWS ===
    @Column({ type: 'decimal', precision: 3, scale: 2, nullable: true, default: 0 })
    average_rating: number | null; // Calificación promedio (se actualiza cuando se agregan reviews)

    @Column({ type: 'integer', nullable: false, default: 0 })
    total_reviews!: number; // Número total de reseñas

    @Column({ type: 'integer', nullable: false, default: 0 })
    verified_reviews!: number; // Número de reseñas verificadas

    @CreateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
    created_at!: Date;

    @UpdateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
    updated_at!: Date;
}