// src/database/entities/meal.entity.ts
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
import { MealItem } from '../../database/entities/meal_item.entity'; // Para los ítems de la comida
import { DietPlan } from '../../database/entities/diet_plan.entity'; // Para el plan de dieta al que pertenece

@Entity('meals')
export class Meal {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column({ type: 'varchar', length: 100, nullable: false })
    name!: string; // Ej: 'Desayuno', 'Almuerzo', 'Cena', 'Colación AM'

    @OneToMany(() => MealItem, (mealItem) => mealItem.meal, { cascade: true }) // cascade: true para guardar ítems con la comida
    meal_items!: MealItem[];

    @ManyToOne(() => DietPlan, (dietPlan) => dietPlan.meals, { nullable: false, onDelete: 'CASCADE' })
    @JoinColumn({ name: 'diet_plan_id' })
    diet_plan!: DietPlan;

    @Column({ type: 'integer', nullable: false, default: 0 })
    order!: number; // Orden de la comida en el día (ej: 1, 2, 3...)

    @CreateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
    created_at!: Date;

    @UpdateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
    updated_at!: Date;
}