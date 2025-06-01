// src/database/entities/meal_item.entity.ts
import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    JoinColumn,
    CreateDateColumn,
    UpdateDateColumn,
} from 'typeorm';
import { Food } from '@/database/entities/food.entity'; // Para el alimento
import { Meal } from '@/database/entities/meal.entity'; // Para la comida a la que pertenece

@Entity('meal_items')
export class MealItem {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @ManyToOne(() => Food, { nullable: false, eager: true }) // eager: true para cargar el alimento automáticamente
    @JoinColumn({ name: 'food_id' })
    food!: Food;

    @Column({ type: 'decimal', precision: 10, scale: 2, nullable: false })
    quantity!: number; // Cantidad de la porción (ej: 1.5 unidades, 200 gramos)

    @ManyToOne(() => Meal, (meal) => meal.meal_items, { nullable: false, onDelete: 'CASCADE' })
    @JoinColumn({ name: 'meal_id' })
    meal!: Meal;

    @CreateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
    created_at!: Date;

    @UpdateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
    updated_at!: Date;
}