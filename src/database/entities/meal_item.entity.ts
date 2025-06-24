import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    JoinColumn,
    CreateDateColumn,
    UpdateDateColumn,
} from 'typeorm';
import { Food } from '../../database/entities/food.entity'; // Importa Food
import { Meal } from '../../database/entities/meal.entity'; // Importa Meal

@Entity('meal_items')
export class MealItem {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @ManyToOne(() => Food, (food) => food.meal_items, { nullable: false, eager: true, onDelete: 'CASCADE' }) // Asegurada relación inversa y ON DELETE CASCADE
    @JoinColumn({ name: 'food_id' })
    food!: Food;

    @Column({ type: 'decimal', precision: 10, scale: 2, nullable: false })
    quantity!: number;

    @ManyToOne(() => Meal, (meal) => meal.meal_items, { nullable: false, onDelete: 'CASCADE' })
    @JoinColumn({ name: 'meal_id' })
    meal!: Meal;

    @CreateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
    created_at!: Date;

    @UpdateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
    updated_at!: Date;
}