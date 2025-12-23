import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateRecipeTables1751944800000 implements MigrationInterface {
    name = 'CreateRecipeTables1751944800000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Crear tabla recipes
        await queryRunner.query(`
            CREATE TABLE "recipes" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "title" character varying(255) NOT NULL,
                "description" text,
                "instructions" text NOT NULL,
                "tags" text array,
                "image_url" character varying(255),
                "prep_time_minutes" integer,
                "cook_time_minutes" integer,
                "servings" integer,
                "total_calories" numeric(10,2),
                "total_macros" jsonb,
                "is_published" boolean NOT NULL DEFAULT true,
                "created_by_user_id" uuid,
                "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                CONSTRAINT "PK_8f09680a51bf3669c1598a21682" PRIMARY KEY ("id")
            )
        `);

        // Crear tabla recipe_ingredients
        await queryRunner.query(`
            CREATE TABLE "recipe_ingredients" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "ingredient_name" character varying(255) NOT NULL,
                "quantity" numeric(10,2) NOT NULL,
                "unit" character varying(50) NOT NULL,
                "food_id" uuid,
                "recipe_id" uuid NOT NULL,
                "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                CONSTRAINT "PK_20b8e25b893ff9ca2b8a47f81b6" PRIMARY KEY ("id")
            )
        `);

        // Crear índices para mejorar performance
        await queryRunner.query(`
            CREATE INDEX "IDX_recipes_title" ON "recipes" ("title")
        `);

        await queryRunner.query(`
            CREATE INDEX "IDX_recipes_tags" ON "recipes" USING gin ("tags")
        `);

        await queryRunner.query(`
            CREATE INDEX "IDX_recipes_is_published" ON "recipes" ("is_published")
        `);

        await queryRunner.query(`
            CREATE INDEX "IDX_recipes_created_by_user" ON "recipes" ("created_by_user_id")
        `);

        await queryRunner.query(`
            CREATE INDEX "IDX_recipe_ingredients_recipe" ON "recipe_ingredients" ("recipe_id")
        `);

        await queryRunner.query(`
            CREATE INDEX "IDX_recipe_ingredients_food" ON "recipe_ingredients" ("food_id")
        `);

        // Crear foreign keys
        await queryRunner.query(`
            ALTER TABLE "recipes" 
            ADD CONSTRAINT "FK_recipes_created_by_user_id" 
            FOREIGN KEY ("created_by_user_id") 
            REFERENCES "users"("id") 
            ON DELETE CASCADE
        `);

        await queryRunner.query(`
            ALTER TABLE "recipe_ingredients" 
            ADD CONSTRAINT "FK_recipe_ingredients_recipe_id" 
            FOREIGN KEY ("recipe_id") 
            REFERENCES "recipes"("id") 
            ON DELETE CASCADE
        `);

        await queryRunner.query(`
            ALTER TABLE "recipe_ingredients" 
            ADD CONSTRAINT "FK_recipe_ingredients_food_id" 
            FOREIGN KEY ("food_id") 
            REFERENCES "foods"("id") 
            ON DELETE RESTRICT
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Eliminar foreign keys
        await queryRunner.query(`
            ALTER TABLE "recipe_ingredients" 
            DROP CONSTRAINT "FK_recipe_ingredients_food_id"
        `);

        await queryRunner.query(`
            ALTER TABLE "recipe_ingredients" 
            DROP CONSTRAINT "FK_recipe_ingredients_recipe_id"
        `);

        await queryRunner.query(`
            ALTER TABLE "recipes" 
            DROP CONSTRAINT "FK_recipes_created_by_user_id"
        `);

        // Eliminar índices
        await queryRunner.query(`DROP INDEX "IDX_recipe_ingredients_food"`);
        await queryRunner.query(`DROP INDEX "IDX_recipe_ingredients_recipe"`);
        await queryRunner.query(`DROP INDEX "IDX_recipes_created_by_user"`);
        await queryRunner.query(`DROP INDEX "IDX_recipes_is_published"`);
        await queryRunner.query(`DROP INDEX "IDX_recipes_tags"`);
        await queryRunner.query(`DROP INDEX "IDX_recipes_title"`);

        // Eliminar tablas
        await queryRunner.query(`DROP TABLE "recipe_ingredients"`);
        await queryRunner.query(`DROP TABLE "recipes"`);
    }
} 