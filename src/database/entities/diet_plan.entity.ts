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
import { User } from '@/database/entities/user.entity'; // Para paciente y nutriólogo
import { Meal } from '@/database/entities/meal.entity'; // Para las comidas del plan

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

    @CreateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
    created_at!: Date;

    @UpdateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
    updated_at!: Date;
}   