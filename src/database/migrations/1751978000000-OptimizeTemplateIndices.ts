import { MigrationInterface, QueryRunner } from 'typeorm';

export class OptimizeTemplateIndices1751978000000 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        // **ÍNDICES OPTIMIZADOS PARA PLANTILLAS**
        
        // Índice para buscar plantillas por nutriólogo + categoría + público
        await queryRunner.query(`
            CREATE INDEX IF NOT EXISTS "IDX_weekly_plan_templates_nutritionist_category_public" 
            ON "weekly_plan_templates" ("created_by_nutritionist_id", "category", "isPublic")
        `);

        // Índice para buscar plantillas por tags (array)
        await queryRunner.query(`
            CREATE INDEX IF NOT EXISTS "IDX_weekly_plan_templates_tags_gin" 
            ON "weekly_plan_templates" USING gin ("tags")
        `);

        // Índice para ordenamiento por popularidad/calificación
        await queryRunner.query(`
            CREATE INDEX IF NOT EXISTS "IDX_weekly_plan_templates_popularity" 
            ON "weekly_plan_templates" ("usageCount" DESC, "rating" DESC, "createdAt" DESC)
        `);

        // Índice para búsqueda de texto en nombre y descripción
        await queryRunner.query(`
            CREATE INDEX IF NOT EXISTS "IDX_weekly_plan_templates_search_text" 
            ON "weekly_plan_templates" USING gin (to_tsvector('spanish', coalesce("name", '') || ' ' || coalesce("description", '')))
        `);

        // Índice para template_meals ordenado por día y orden
        await queryRunner.query(`
            CREATE INDEX IF NOT EXISTS "IDX_template_meals_template_day_order" 
            ON "template_meals" ("template_id", "dayOfWeek", "order")
        `);

        // Índice para template_foods por meal
        await queryRunner.query(`
            CREATE INDEX IF NOT EXISTS "IDX_template_foods_meal" 
            ON "template_foods" ("template_meal_id")
        `);

        // Índice para template_recipes por meal
        await queryRunner.query(`
            CREATE INDEX IF NOT EXISTS "IDX_template_recipes_meal" 
            ON "template_recipes" ("template_meal_id")
        `);

        // Índice compuesto para permisos de acceso
        await queryRunner.query(`
            CREATE INDEX IF NOT EXISTS "IDX_weekly_plan_templates_access" 
            ON "weekly_plan_templates" ("created_by_nutritionist_id", "isPublic") 
            WHERE "isPublic" = true OR "created_by_nutritionist_id" IS NOT NULL
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // **ROLLBACK**: Eliminar índices creados
        await queryRunner.query(`DROP INDEX IF EXISTS "IDX_weekly_plan_templates_nutritionist_category_public"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "IDX_weekly_plan_templates_tags_gin"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "IDX_weekly_plan_templates_popularity"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "IDX_weekly_plan_templates_search_text"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "IDX_template_meals_template_day_order"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "IDX_template_foods_meal"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "IDX_template_recipes_meal"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "IDX_weekly_plan_templates_access"`);
    }
} 