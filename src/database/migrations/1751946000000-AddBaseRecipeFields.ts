import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddBaseRecipeFields1751946000000 implements MigrationInterface {
    name = 'AddBaseRecipeFields1751946000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Agregar campos para gestión de recetas base por admin
        await queryRunner.query(`
            ALTER TABLE "recipes" 
            ADD COLUMN "is_base_recipe" BOOLEAN DEFAULT FALSE,
            ADD COLUMN "is_shared_by_admin" BOOLEAN DEFAULT FALSE,
            ADD COLUMN "original_recipe_id" UUID NULL,
            ADD COLUMN "shared_at" TIMESTAMP WITH TIME ZONE NULL,
            ADD COLUMN "shared_by_admin_id" UUID NULL
        `);

        // Agregar constraint para la referencia al admin que compartió
        await queryRunner.query(`
            ALTER TABLE "recipes" 
            ADD CONSTRAINT "FK_recipes_shared_by_admin" 
            FOREIGN KEY ("shared_by_admin_id") REFERENCES "users"("id") ON DELETE SET NULL
        `);

        // Agregar constraint para la referencia a la receta original (cuando es una copia)
        await queryRunner.query(`
            ALTER TABLE "recipes" 
            ADD CONSTRAINT "FK_recipes_original_recipe" 
            FOREIGN KEY ("original_recipe_id") REFERENCES "recipes"("id") ON DELETE SET NULL
        `);

        // Crear índices para mejorar consultas
        await queryRunner.query(`
            CREATE INDEX "IDX_recipes_is_base_recipe" ON "recipes" ("is_base_recipe");
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_recipes_is_shared_by_admin" ON "recipes" ("is_shared_by_admin");
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Eliminar índices
        await queryRunner.query(`DROP INDEX "IDX_recipes_is_shared_by_admin"`);
        await queryRunner.query(`DROP INDEX "IDX_recipes_is_base_recipe"`);
        
        // Eliminar constraints
        await queryRunner.query(`ALTER TABLE "recipes" DROP CONSTRAINT "FK_recipes_original_recipe"`);
        await queryRunner.query(`ALTER TABLE "recipes" DROP CONSTRAINT "FK_recipes_shared_by_admin"`);
        
        // Eliminar columnas
        await queryRunner.query(`
            ALTER TABLE "recipes" 
            DROP COLUMN "is_base_recipe",
            DROP COLUMN "is_shared_by_admin",
            DROP COLUMN "original_recipe_id",
            DROP COLUMN "shared_at",
            DROP COLUMN "shared_by_admin_id"
        `);
    }
} 