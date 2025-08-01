import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { TemplateMeal } from './template-meal.entity';
import { Recipe } from './recipe.entity';

@Entity('template_recipes')
export class TemplateRecipe {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    // Relación con la comida de la plantilla
    @ManyToOne(() => TemplateMeal, (meal) => meal.recipes, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'template_meal_id' })
    meal!: TemplateMeal;

    // Referencia a la receta base
    @ManyToOne(() => Recipe, { nullable: false })
    @JoinColumn({ name: 'recipe_id' })
    recipe!: Recipe;

    @Column({ type: 'varchar', length: 255, nullable: false })
    recipeName!: string; // Nombre de la receta (copiado para evitar cambios)

    @Column({ type: 'decimal', precision: 8, scale: 2, default: 1 })
    servings!: number; // Número de porciones a preparar

    // Valores nutricionales por porción
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

    // Información de la receta copiada para la plantilla
    @Column({ type: 'text', nullable: true })
    instructions?: string; // Instrucciones de preparación

    @Column({ type: 'integer', nullable: true })
    prepTimeMinutes?: number; // Tiempo de preparación

    @Column({ type: 'integer', nullable: true })
    cookTimeMinutes?: number; // Tiempo de cocción

    @Column({
        type: 'enum',
        enum: ['easy', 'medium', 'hard'],
        default: 'medium',
        nullable: false,
    })
    difficulty!: 'easy' | 'medium' | 'hard';

    // Información adicional específica para la plantilla
    @Column({ type: 'text', nullable: true })
    templateNotes?: string; // Notas específicas para esta plantilla

    @Column({ type: 'decimal', precision: 8, scale: 2, nullable: true })
    estimatedCost?: number; // Costo estimado por porción

    @Column({ type: 'boolean', default: false })
    isOptional!: boolean; // Si la receta es opcional en la plantilla

    @Column({ type: 'varchar', length: 255, array: true, default: '{}' })
    alternatives?: string[]; // Recetas alternativas sugeridas

    // Tags específicos de la plantilla
    @Column({ type: 'varchar', length: 100, array: true, default: '{}' })
    templateTags?: string[]; // Tags adicionales para la plantilla

    @CreateDateColumn()
    createdAt!: Date;

    // Método para calcular valores nutricionales basados en la receta base
    calculateNutritionFromRecipe() {
        if (!this.recipe || !this.servings) return;

        // Calcular basado en el número de porciones y los valores de la receta base
        const totalCalories = this.recipe.total_calories || 0;
        const totalMacros = this.recipe.total_macros;
        const recipeServings = this.recipe.servings || 1;

        // Calcular calorías y macros por porción de la receta original
        const caloriesPerOriginalServing = totalCalories / recipeServings;
        const proteinPerOriginalServing = (totalMacros?.protein || 0) / recipeServings;
        const carbsPerOriginalServing = (totalMacros?.carbohydrates || 0) / recipeServings;
        const fatsPerOriginalServing = (totalMacros?.fats || 0) / recipeServings;
        const fiberPerOriginalServing = ((totalMacros as any)?.fiber || 0) / recipeServings;

        // Asignar valores para las porciones especificadas en la plantilla
        this.caloriesPerServing = caloriesPerOriginalServing * this.servings;
        this.proteinPerServing = proteinPerOriginalServing * this.servings;
        this.carbohydratesPerServing = carbsPerOriginalServing * this.servings;
        this.fatsPerServing = fatsPerOriginalServing * this.servings;
        this.fiberPerServing = fiberPerOriginalServing * this.servings;

        // Copiar otros campos útiles
        this.prepTimeMinutes = this.recipe.prep_time_minutes || undefined;
        this.cookTimeMinutes = this.recipe.cook_time_minutes || undefined;
        this.instructions = this.recipe.instructions;
    }
} 