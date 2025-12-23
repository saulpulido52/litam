// src/database/entities/diet_plan.entity.ts
import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    OneToMany,
    JoinColumn,
    CreateDateColumn,
    UpdateDateColumn,
} from 'typeorm';
import { User } from '../../database/entities/user.entity'; // Para paciente y nutriólogo
import { Meal } from '../../database/entities/meal.entity'; // Para las comidas del plan

export enum DietPlanStatus {
    DRAFT = 'draft', // En borrador, el nutriólogo lo está creando
    PENDING_REVIEW = 'pending_review', // IA lo generó o nutriólogo lo terminó, esperando revisión final
    ACTIVE = 'active', // Plan asignado y activo para el paciente
    ARCHIVED = 'archived', // Plan antiguo o ya no en uso
}

@Entity('diet_plans')
export class DietPlan {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column({ type: 'varchar', length: 255, nullable: false })
    name!: string; // Ej: 'Plan Semanal de Pérdida de Peso (Semana 1)'

    @Column({ type: 'text', nullable: true })
    description: string | null; // Descripción detallada del plan nutricional

    @ManyToOne(() => User, { nullable: false, onDelete: 'CASCADE'  })
    @JoinColumn({ name: 'patient_user_id' })
    patient!: User;

    @ManyToOne(() => User, { nullable: false, onDelete: 'CASCADE'  })
    @JoinColumn({ name: 'nutritionist_user_id' })
    nutritionist!: User;

    @OneToMany(() => Meal, (meal) => meal.diet_plan, { cascade: true }) // cascade: true para guardar comidas con el plan
    meals!: Meal[];

    @Column({ type: 'boolean', default: false })
    generated_by_ia!: boolean;

    @Column({ type: 'varchar', length: 50, nullable: true })
    ia_version: string | null; // Versión del motor IA usado, ej: '1.0'

    @Column({
        type: 'enum',
        enum: DietPlanStatus,
        default: DietPlanStatus.DRAFT,
        nullable: false,
    })
    status!: DietPlanStatus;

    @Column({ type: 'text', nullable: true })
    notes: string | null; // Notas adicionales del nutriólogo

    @Column({ type: 'date', nullable: false }) // Solo fecha, sin hora
    start_date!: Date;

    @Column({ type: 'date', nullable: false }) // Solo fecha, sin hora
    end_date!: Date;

    @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
    daily_calories_target: number | null;

    @Column({ type: 'jsonb', nullable: true })
    daily_macros_target: any | null; // Ej: { protein: 150, carbs: 200, fats: 50 }

    // Campos para plan semanal
    @Column({ type: 'boolean', default: true })
    is_weekly_plan!: boolean; // Indica si es un plan semanal

    @Column({ type: 'integer', default: 1 })
    total_weeks!: number; // Número total de semanas del plan

    @Column({ type: 'jsonb', nullable: true })
    weekly_plans: any[] | null; // Array de planes semanales con estructura detallada

    // Campo para restricciones patológicas
    @Column({ type: 'jsonb', nullable: true })
    pathological_restrictions: any | null; // Restricciones médicas, alergias, medicamentos, etc.

    // === NUEVOS CAMPOS PARA COMPLETAR TABS ===
    @Column({ type: 'jsonb', nullable: true })
    meal_frequency: any | null; // Frecuencia de comidas (desayuno, almuerzo, etc.)

    @Column({ type: 'jsonb', nullable: true })
    meal_timing: any | null; // Horarios de comidas

    @Column({ type: 'jsonb', nullable: true })
    meal_schedules: any | null; // Horarios detallados de comidas del NutritionalScheduleTab

    @Column({ type: 'jsonb', nullable: true })
    nutritional_goals: any | null; // Objetivos nutricionales (agua, fibra, distribución calórica)

    @Column({ type: 'jsonb', nullable: true })
    flexibility_settings: any | null; // Configuración de flexibilidad del plan

    @CreateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
    created_at!: Date;

    @UpdateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
    updated_at!: Date;
}   