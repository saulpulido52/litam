// src/database/entities/food.entity.ts
import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    ManyToOne,
    JoinColumn,
    OneToMany,
} from 'typeorm';
import { User } from '@/database/entities/user.entity'; // Para 'created_by_user'
import { MealItem } from '@/database/entities/meal_item.entity'; // Para relación inversa

@Entity('foods')
export class Food {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column({ type: 'varchar', length: 255, nullable: false })
    name!: string;

    @Column({ type: 'text', nullable: true })
    description: string | null;

    @Column({ type: 'decimal', precision: 10, scale: 2, nullable: false })
    calories!: number; // Por porción o unidad base (ej: por 100g)

    @Column({ type: 'decimal', precision: 10, scale: 2, nullable: false })
    protein!: number; // Gramos

    @Column({ type: 'decimal', precision: 10, scale: 2, nullable: false })
    carbohydrates!: number; // Gramos

    @Column({ type: 'decimal', precision: 10, scale: 2, nullable: false })
    fats!: number; // Gramos

    @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true, default: 0 })
    fiber: number | null; // Gramos

    @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true, default: 0 })
    sugar: number | null; // Gramos

    @Column({ type: 'varchar', length: 50, nullable: false })
    unit!: string; // Ej: 'g', 'ml', 'unidad', 'cucharada'

    @Column({ type: 'decimal', precision: 10, scale: 2, nullable: false })
    serving_size!: number; // Tamaño de la porción en la unidad base (ej: 100 para 100g, 1 para 1 unidad)

    @Column({ type: 'varchar', length: 100, nullable: true })
    category: string | null; // Ej: 'Frutas', 'Verduras', 'Proteínas', 'Lácteos'

    @Column({ type: 'boolean', default: false })
    is_custom!: boolean; // Si el alimento fue añadido por un nutriólogo/admin (no de una BD global)

    @ManyToOne(() => User, { nullable: true }) // Nullable si es un alimento global precargado
    @JoinColumn({ name: 'created_by_user_id' })
    created_by_user: User | null;

    @OneToMany(() => MealItem, (mealItem) => mealItem.food)
    meal_items!: MealItem[]; // Relación inversa a MealItem

    @CreateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
    created_at!: Date;

    @UpdateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
    updated_at!: Date;
}