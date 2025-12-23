// src/database/entities/nutritionist_review.entity.ts
import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    JoinColumn,
    CreateDateColumn,
    UpdateDateColumn,
    Unique,
} from 'typeorm';
import { User } from './user.entity';
import { Min, Max } from 'class-validator';

@Entity('nutritionist_reviews')
@Unique(['nutritionist', 'patient']) // Un paciente solo puede dar una reseña por nutriólogo
export class NutritionistReview {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @ManyToOne(() => User, { nullable: false, onDelete: 'CASCADE' })
    @JoinColumn({ name: 'nutritionist_id' })
    nutritionist!: User; // El nutriólogo que recibe la reseña

    @ManyToOne(() => User, { nullable: false, onDelete: 'CASCADE' })
    @JoinColumn({ name: 'patient_id' })
    patient!: User; // El paciente que deja la reseña

    @Column({ type: 'integer', nullable: false })
    @Min(1, { message: 'La calificación debe ser al menos 1 estrella.' })
    @Max(5, { message: 'La calificación no puede exceder 5 estrellas.' })
    rating!: number; // Calificación de 1 a 5 estrellas

    @Column({ type: 'text', nullable: true })
    comment: string | null; // Comentario opcional del paciente

    @Column({ type: 'boolean', default: false })
    is_verified!: boolean; // Si la reseña fue verificada (paciente tuvo al menos una consulta)

    @Column({ type: 'boolean', default: true })
    is_visible!: boolean; // Si la reseña es visible públicamente

    @Column({ type: 'boolean', default: false })
    is_flagged!: boolean; // Si la reseña fue reportada por contenido inapropiado

    @Column({ type: 'text', nullable: true })
    flag_reason: string | null; // Razón del reporte si está flagged

    // Campos específicos de valoración
    @Column({ type: 'integer', nullable: true })
    @Min(1) @Max(5)
    communication_rating: number | null; // Calificación de comunicación

    @Column({ type: 'integer', nullable: true })
    @Min(1) @Max(5)
    professionalism_rating: number | null; // Calificación de profesionalismo

    @Column({ type: 'integer', nullable: true })
    @Min(1) @Max(5)
    results_rating: number | null; // Calificación de resultados obtenidos

    @Column({ type: 'integer', nullable: true })
    @Min(1) @Max(5)
    punctuality_rating: number | null; // Calificación de puntualidad

    @Column({ type: 'boolean', default: false })
    would_recommend!: boolean; // Si recomendaría al nutriólogo

    // Metadata de la consulta
    @Column({ type: 'integer', nullable: true })
    consultation_duration_months: number | null; // Duración del tratamiento en meses

    @Column({ type: 'varchar', length: 100, nullable: true })
    treatment_type: string | null; // Tipo de tratamiento (pérdida de peso, deportiva, etc.)

    @CreateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
    created_at!: Date;

    @UpdateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
    updated_at!: Date;

    // Método helper para calcular la calificación promedio
    getAverageRating(): number {
        const ratings = [
            this.communication_rating,
            this.professionalism_rating,
            this.results_rating,
            this.punctuality_rating
        ].filter(rating => rating !== null) as number[];

        if (ratings.length === 0) return this.rating;
        
        const sum = ratings.reduce((acc, rating) => acc + rating, 0);
        return Math.round((sum / ratings.length) * 10) / 10; // Redondear a 1 decimal
    }
} 