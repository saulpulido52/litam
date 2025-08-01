import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { User } from './user.entity';
import { TemplateMeal } from './template-meal.entity';

export enum TemplateCategory {
    WEIGHT_LOSS = 'weight_loss',
    WEIGHT_GAIN = 'weight_gain',
    MUSCLE_GAIN = 'muscle_gain',
    MAINTENANCE = 'maintenance',
    DIABETIC = 'diabetic',
    HYPERTENSION = 'hypertension',
    VEGETARIAN = 'vegetarian',
    VEGAN = 'vegan',
    KETO = 'keto',
    MEDITERRANEAN = 'mediterranean',
    LOW_SODIUM = 'low_sodium',
    LOW_CARB = 'low_carb',
    HIGH_PROTEIN = 'high_protein',
    CUSTOM = 'custom'
}

@Entity('weekly_plan_templates')
export class WeeklyPlanTemplate {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column({ type: 'varchar', length: 255, nullable: false })
    name!: string; // Ej: 'Plan Semanal Pérdida de Peso - Básico'

    @Column({ type: 'text', nullable: true })
    description?: string; // Descripción detallada de la plantilla

    @Column({
        type: 'enum',
        enum: TemplateCategory,
        default: TemplateCategory.CUSTOM,
        nullable: false,
    })
    category!: TemplateCategory;

    @Column({ type: 'varchar', length: 100, array: true, default: '{}' })
    tags!: string[]; // Ej: ['pérdida de peso', 'bajo en carbohidratos', 'fácil']

    // Creador de la plantilla (nutriólogo)
    @ManyToOne(() => User, { nullable: false, onDelete: 'CASCADE' })
    @JoinColumn({ name: 'created_by_nutritionist_id' })
    createdBy!: User;

    // Plantilla pública (visible para otros nutriólogos) o privada
    @Column({ type: 'boolean', default: false })
    isPublic!: boolean;

    // Objetivos nutricionales de la plantilla
    @Column({ type: 'decimal', precision: 8, scale: 2, nullable: true })
    targetCalories?: number;

    @Column({ type: 'jsonb', nullable: true })
    targetMacros?: {
        protein: number;
        carbohydrates: number;
        fats: number;
        fiber?: number;
    };

    // Configuración de comidas de la plantilla
    @OneToMany(() => TemplateMeal, (meal) => meal.template, { cascade: true, eager: true })
    meals!: TemplateMeal[];

    // Metadatos de la plantilla
    @Column({ type: 'integer', default: 0 })
    usageCount!: number; // Cuántas veces se ha usado esta plantilla

    @Column({ type: 'decimal', precision: 3, scale: 2, default: 0 })
    rating?: number; // Rating promedio (0-5)

    @Column({ type: 'integer', default: 0 })
    ratingCount!: number; // Número de ratings

    // Notas del creador
    @Column({ type: 'text', nullable: true })
    notes?: string;

    // Configuración adicional
    @Column({ type: 'jsonb', nullable: true })
    mealTiming?: {
        breakfast?: string;
        morning_snack?: string;
        lunch?: string;
        afternoon_snack?: string;
        dinner?: string;
        evening_snack?: string;
    };

    @Column({ type: 'jsonb', nullable: true })
    dietaryRestrictions?: {
        allergies?: string[];
        intolerances?: string[];
        preferences?: string[];
        medicalConditions?: string[];
    };

    // Nivel de dificultad para el paciente
    @Column({
        type: 'enum',
        enum: ['easy', 'medium', 'hard'],
        default: 'medium',
        nullable: false,
    })
    difficultyLevel!: 'easy' | 'medium' | 'hard';

    // Duración estimada de preparación diaria (en minutos)
    @Column({ type: 'integer', nullable: true })
    avgPrepTimeMinutes?: number;

    // Costo estimado semanal
    @Column({ type: 'decimal', precision: 8, scale: 2, nullable: true })
    estimatedWeeklyCost?: number;

    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt!: Date;

    // Método helper para calcular estadísticas
    calculateWeeklyNutrition() {
        const totals = this.meals.reduce((acc, meal) => {
            acc.calories += meal.totalCalories || 0;
            acc.protein += meal.totalProtein || 0;
            acc.carbohydrates += meal.totalCarbohydrates || 0;
            acc.fats += meal.totalFats || 0;
            return acc;
        }, { calories: 0, protein: 0, carbohydrates: 0, fats: 0 });

        return {
            weeklyTotals: totals,
            dailyAverages: {
                calories: Math.round(totals.calories / 7),
                protein: Math.round(totals.protein / 7),
                carbohydrates: Math.round(totals.carbohydrates / 7),
                fats: Math.round(totals.fats / 7)
            }
        };
    }
} 