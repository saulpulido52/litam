// src/database/entities/recipe.entity.ts
import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    JoinColumn,
    CreateDateColumn,
    UpdateDateColumn,
    OneToMany,
} from 'typeorm';
import { User } from '../../database/entities/user.entity'; // Para el creador de la receta
import { Food } from '../../database/entities/food.entity'; // Para ingredientes (si se referencian Food existentes)

// CLASE RECIPE (PADRE) - DEFINIR PRIMERO
@Entity('recipes')
export class Recipe {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column({ type: 'varchar', length: 255, nullable: false })
    title!: string;

    @Column({ type: 'text', nullable: true })
    description: string | null;

    @Column({ type: 'text', nullable: false })
    instructions!: string; // Pasos de preparación

    @OneToMany(() => RecipeIngredient, (ingredient) => ingredient.recipe, { cascade: true })
    ingredients!: RecipeIngredient[]; // Lista de ingredientes de la receta

    @Column('text', { array: true, nullable: true })
    tags: string[] | null; // Ej: ['desayuno', 'vegano', 'rápido', 'bajo en carbohidratos']

    @Column({ type: 'varchar', length: 255, nullable: true })
    image_url: string | null; // Foto del plato final

    @Column({ type: 'integer', nullable: true })
    prep_time_minutes: number | null; // Tiempo de preparación en minutos

    @Column({ type: 'integer', nullable: true })
    cook_time_minutes: number | null; // Tiempo de cocción en minutos

    @Column({ type: 'integer', nullable: true })
    servings: number | null; // Número de porciones

    @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
    total_calories: number | null; // Calculado o estimado

    @Column({ type: 'jsonb', nullable: true })
    total_macros: { protein?: number; carbohydrates?: number; fats?: number } | null; // Calculado o estimado

    @Column({ type: 'boolean', default: true })
    is_published!: boolean;

<<<<<<< HEAD
=======
    // Campos para gestión de recetas base por admin
    @Column({ type: 'boolean', default: false })
    is_base_recipe!: boolean; // Indica si es una receta base creada/marcada por admin

    @Column({ type: 'boolean', default: false })
    is_shared_by_admin!: boolean; // Indica si fue compartida por un admin

    @Column({ type: 'uuid', nullable: true })
    original_recipe_id?: string; // ID de la receta original (cuando es copia/clon)

    @Column({ type: 'timestamptz', nullable: true })
    shared_at?: Date; // Fecha cuando fue compartida por admin

    @ManyToOne(() => User, { nullable: true })
    @JoinColumn({ name: 'shared_by_admin_id' })
    shared_by_admin?: User; // Admin que compartió la receta

    @ManyToOne(() => Recipe, { nullable: true })
    @JoinColumn({ name: 'original_recipe_id' })
    original_recipe?: Recipe; // Referencia a la receta original

>>>>>>> nutri/main
    @ManyToOne(() => User, (user) => user.created_recipes, { nullable: false, onDelete: 'RESTRICT' })
    @JoinColumn({ name: 'created_by_user_id' })
    created_by!: User;

    @ManyToOne(() => User, (user) => user.modified_recipes, { nullable: true, onDelete: 'SET NULL' })
    @JoinColumn({ name: 'last_modified_by_user_id' })
    last_modified_by: User | null;

    @CreateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
    created_at!: Date;

    @UpdateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
    updated_at!: Date;
}

// CLASE RECIPEINGREDIENT (HIJA) - DEFINIR DESPUÉS
@Entity('recipe_ingredients')
export class RecipeIngredient {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @ManyToOne(() => Food, { nullable: true, onDelete: 'RESTRICT' }) // Puede ser un Food de la BD o un ingrediente genérico
    @JoinColumn({ name: 'food_id' })
    food: Food | null;

    @Column({ type: 'varchar', length: 255, nullable: false })
    ingredient_name!: string; // Ej: "Harina de avena", "Tomate"

    @Column({ type: 'decimal', precision: 10, scale: 2, nullable: false })
    quantity!: number;

    @Column({ type: 'varchar', length: 50, nullable: false })
    unit!: string; // Ej: "g", "ml", "tazas", "cucharadas"

<<<<<<< HEAD
=======
    // Campos opcionales para nutrición personalizada (sobrescriben los valores del Food)
    @Column({ type: 'decimal', precision: 8, scale: 2, nullable: true })
    custom_calories_per_100g?: number;

    @Column({ type: 'decimal', precision: 8, scale: 2, nullable: true })
    custom_protein_per_100g?: number;

    @Column({ type: 'decimal', precision: 8, scale: 2, nullable: true })
    custom_carbohydrates_per_100g?: number;

    @Column({ type: 'decimal', precision: 8, scale: 2, nullable: true })
    custom_fats_per_100g?: number;

    @Column({ type: 'decimal', precision: 8, scale: 2, nullable: true })
    custom_fiber_per_100g?: number;

    @Column({ type: 'text', nullable: true })
    notes?: string; // Notas sobre el ajuste nutricional

>>>>>>> nutri/main
    @ManyToOne(() => Recipe, (recipe) => recipe.ingredients, { nullable: false, onDelete: 'CASCADE' })
    @JoinColumn({ name: 'recipe_id' })
    recipe!: Recipe;

    @CreateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
    created_at!: Date;

    @UpdateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
    updated_at!: Date;
}