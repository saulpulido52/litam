import { MigrationInterface, QueryRunner } from "typeorm";

export class AddNutritionalGoalsToDietPlans1704073400000 implements MigrationInterface {
    name = 'AddNutritionalGoalsToDietPlans1704073400000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Agregar columna nutritional_goals de tipo JSONB
        await queryRunner.query(`
            ALTER TABLE "diet_plans" 
            ADD COLUMN "nutritional_goals" jsonb
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Eliminar columna nutritional_goals
        await queryRunner.query(`
            ALTER TABLE "diet_plans" 
            DROP COLUMN "nutritional_goals"
        `);
    }
} 