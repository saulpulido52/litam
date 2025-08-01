import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, JoinColumn, CreateDateColumn } from 'typeorm';
import { WeeklyPlanTemplate } from './weekly-plan-template.entity';
import { TemplateFood } from './template-food.entity';
import { TemplateRecipe } from './template-recipe.entity';

export enum MealType {
    BREAKFAST = 'breakfast',
    MORNING_SNACK = 'morning_snack',
    LUNCH = 'lunch',
    AFTERNOON_SNACK = 'afternoon_snack',
    DINNER = 'dinner',
    EVENING_SNACK = 'evening_snack'
}

export enum DayOfWeek {
    MONDAY = 'monday',
    TUESDAY = 'tuesday',
    WEDNESDAY = 'wednesday',
    THURSDAY = 'thursday',
    FRIDAY = 'friday',
    SATURDAY = 'saturday',
    SUNDAY = 'sunday'
}

@Entity('template_meals')
export class TemplateMeal {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    // Relación con la plantilla
    @ManyToOne(() => WeeklyPlanTemplate, (template) => template.meals, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'template_id' })
    template!: WeeklyPlanTemplate;

    @Column({
        type: 'enum',
        enum: DayOfWeek,
        nullable: false,
    })
    dayOfWeek!: DayOfWeek;

    @Column({
        type: 'enum',
        enum: MealType,
        nullable: false,
    })
    mealType!: MealType;

    @Column({ type: 'varchar', length: 255, nullable: true })
    name?: string; // Ej: 'Desayuno Energético'

    @Column({ type: 'text', nullable: true })
    description?: string;

    @Column({ type: 'time', nullable: true })
    suggestedTime?: string; // Ej: '08:00'

    // Alimentos y recetas de la comida
    @OneToMany(() => TemplateFood, (food) => food.meal, { cascade: true, eager: true })
    foods!: TemplateFood[];

    @OneToMany(() => TemplateRecipe, (recipe) => recipe.meal, { cascade: true, eager: true })
    recipes!: TemplateRecipe[];

    // Valores nutricionales calculados (se actualizan al guardar)
    @Column({ type: 'decimal', precision: 8, scale: 2, default: 0 })
    totalCalories!: number;

    @Column({ type: 'decimal', precision: 8, scale: 2, default: 0 })
    totalProtein!: number;

    @Column({ type: 'decimal', precision: 8, scale: 2, default: 0 })
    totalCarbohydrates!: number;

    @Column({ type: 'decimal', precision: 8, scale: 2, default: 0 })
    totalFats!: number;

    @Column({ type: 'decimal', precision: 8, scale: 2, default: 0 })
    totalFiber?: number;

    // Tiempo estimado de preparación (en minutos)
    @Column({ type: 'integer', nullable: true })
    prepTimeMinutes?: number;

    // Nivel de dificultad de preparación
    @Column({
        type: 'enum',
        enum: ['easy', 'medium', 'hard'],
        default: 'medium',
        nullable: false,
    })
    difficulty!: 'easy' | 'medium' | 'hard';

    // Notas adicionales
    @Column({ type: 'text', nullable: true })
    notes?: string;

    // Orden dentro del día (para múltiples comidas del mismo tipo)
    @Column({ type: 'integer', default: 1 })
    order!: number;

    @CreateDateColumn()
    createdAt!: Date;

    // Método helper para calcular la nutrición total
    calculateNutrition() {
        let totals = {
            calories: 0,
            protein: 0,
            carbohydrates: 0,
            fats: 0,
            fiber: 0
        };

        // Sumar alimentos
        this.foods.forEach(food => {
            const quantity = food.quantity || 0;
            totals.calories += (food.caloriesPerServing || 0) * quantity;
            totals.protein += (food.proteinPerServing || 0) * quantity;
            totals.carbohydrates += (food.carbohydratesPerServing || 0) * quantity;
            totals.fats += (food.fatsPerServing || 0) * quantity;
            totals.fiber += (food.fiberPerServing || 0) * quantity;
        });

        // Sumar recetas
        this.recipes.forEach(recipe => {
            const servings = recipe.servings || 1;
            totals.calories += (recipe.caloriesPerServing || 0) * servings;
            totals.protein += (recipe.proteinPerServing || 0) * servings;
            totals.carbohydrates += (recipe.carbohydratesPerServing || 0) * servings;
            totals.fats += (recipe.fatsPerServing || 0) * servings;
            totals.fiber += (recipe.fiberPerServing || 0) * servings;
        });

        return totals;
    }

    // Actualizar valores nutricionales calculados
    updateNutritionValues() {
        const nutrition = this.calculateNutrition();
        this.totalCalories = nutrition.calories;
        this.totalProtein = nutrition.protein;
        this.totalCarbohydrates = nutrition.carbohydrates;
        this.totalFats = nutrition.fats;
        this.totalFiber = nutrition.fiber;
    }
} 