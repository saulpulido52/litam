import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddCustomNutritionFieldsToRecipeIngredients1751945000000 implements MigrationInterface {
    name = 'AddCustomNutritionFieldsToRecipeIngredients1751945000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Agregar campos opcionales para nutrición personalizada
        await queryRunner.query(`
            ALTER TABLE "recipe_ingredients" 
            ADD COLUMN "custom_calories_per_100g" DECIMAL(8,2) NULL,
            ADD COLUMN "custom_protein_per_100g" DECIMAL(8,2) NULL,
            ADD COLUMN "custom_carbohydrates_per_100g" DECIMAL(8,2) NULL,
            ADD COLUMN "custom_fats_per_100g" DECIMAL(8,2) NULL,
            ADD COLUMN "custom_fiber_per_100g" DECIMAL(8,2) NULL,
            ADD COLUMN "notes" TEXT NULL
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Revertir los cambios
        await queryRunner.query(`
            ALTER TABLE "recipe_ingredients" 
            DROP COLUMN "custom_calories_per_100g",
            DROP COLUMN "custom_protein_per_100g",
            DROP COLUMN "custom_carbohydrates_per_100g",
            DROP COLUMN "custom_fats_per_100g",
            DROP COLUMN "custom_fiber_per_100g",
            DROP COLUMN "notes"
        `);
    }
} 