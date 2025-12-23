import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { TemplateMeal } from './template-meal.entity';
import { Food } from './food.entity';

@Entity('template_foods')
export class TemplateFood {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    // Relación con la comida de la plantilla
    @ManyToOne(() => TemplateMeal, (meal) => meal.foods, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'template_meal_id' })
    meal!: TemplateMeal;

    // Referencia al alimento base
    @ManyToOne(() => Food, { nullable: false })
    @JoinColumn({ name: 'food_id' })
    food!: Food;

    @Column({ type: 'varchar', length: 255, nullable: false })
    foodName!: string; // Nombre del alimento (copiado para evitar cambios)

    @Column({ type: 'decimal', precision: 8, scale: 2, nullable: false })
    quantity!: number; // Cantidad requerida

    @Column({ type: 'varchar', length: 50, default: 'g' })
    unit!: string; // Unidad de medida (g, ml, piezas, etc.)

    // Valores nutricionales por porción/cantidad especificada
    @Column({ type: 'decimal', precision: 8, scale: 2, default: 0 })
    caloriesPerServing!: number;

    @Column({ type: 'decimal', precision: 8, scale: 2, default: 0 })
    proteinPerServing!: number;

    @Column({ type: 'decimal', precision: 8, scale: 2, default: 0 })
    carbohydratesPerServing!: number;

    @Column({ type: 'decimal', precision: 8, scale: 2, default: 0 })
    fatsPerServing!: number;

    @Column({ type: 'decimal', precision: 8, scale: 2, default: 0 })
    fiberPerServing?: number;

    // Información adicional
    @Column({ type: 'text', nullable: true })
    notes?: string; // Notas específicas para esta preparación

    @Column({ type: 'varchar', length: 255, nullable: true })
    preparation?: string; // Ej: 'cocido', 'crudo', 'al vapor'

    // Información de compras
    @Column({ type: 'varchar', length: 100, nullable: true })
    shoppingCategory?: string; // Categoría en el supermercado

    @Column({ type: 'decimal', precision: 8, scale: 2, nullable: true })
    estimatedCost?: number; // Costo estimado por porción

    @Column({ type: 'boolean', default: false })
    isOptional!: boolean; // Si el alimento es opcional en la plantilla

    @Column({ type: 'varchar', length: 255, array: true, default: '{}' })
    alternatives?: string[]; // Alimentos alternativos sugeridos

    @CreateDateColumn()
    createdAt!: Date;

    // Método para calcular valores nutricionales basados en el alimento base
    calculateNutritionFromFood() {
        if (!this.food || !this.quantity) return;

        // Calcular basado en la cantidad y los valores del alimento base
        const servingRatio = this.quantity / (this.food.serving_size || 100);
        
        this.caloriesPerServing = (this.food.calories || 0) * servingRatio;
        this.proteinPerServing = (this.food.protein || 0) * servingRatio;
        this.carbohydratesPerServing = (this.food.carbohydrates || 0) * servingRatio;
        this.fatsPerServing = (this.food.fats || 0) * servingRatio;
        this.fiberPerServing = (this.food.fiber || 0) * servingRatio;
    }
} 