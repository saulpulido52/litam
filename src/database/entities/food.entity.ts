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
import { User } from '../../database/entities/user.entity'; // Importa User para la relación created_by_user
import { MealItem } from '../../database/entities/meal_item.entity'; // Importa MealItem para la relación OneToMany

@Entity('foods')
export class Food {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column({ type: 'varchar', length: 255, nullable: false })
    name!: string;

    @Column({ type: 'text', nullable: true })
    description: string | null;

    @Column({ type: 'decimal', precision: 10, scale: 2, nullable: false })
    calories!: number;

    @Column({ type: 'decimal', precision: 10, scale: 2, nullable: false })
    protein!: number;

    @Column({ type: 'decimal', precision: 10, scale: 2, nullable: false })
    carbohydrates!: number;

    @Column({ type: 'decimal', precision: 10, scale: 2, nullable: false })
    fats!: number;

    @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true, default: 0 })
    fiber: number | null;

    @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true, default: 0 })
    sugar: number | null;

    @Column({ type: 'varchar', length: 50, nullable: false })
    unit!: string;

    @Column({ type: 'decimal', precision: 10, scale: 2, nullable: false })
    serving_size!: number;

    @Column({ type: 'varchar', length: 100, nullable: true })
    category: string | null;

    @Column({ type: 'boolean', default: false })
    is_custom!: boolean;

    @ManyToOne(() => User, (user) => user.created_foods, { nullable: true, onDelete: 'CASCADE' })
    @JoinColumn({ name: 'created_by_user_id' })
    created_by_user: User | null;

    @OneToMany(() => MealItem, (mealItem) => mealItem.food) // Relación inversa a MealItem
    meal_items!: MealItem[];

    @CreateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
    created_at!: Date;

    @UpdateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
    updated_at!: Date;
}