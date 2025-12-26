import { MigrationInterface, QueryRunner } from "typeorm";

export class ResetNutritionistAvailability1754003000001 implements MigrationInterface {
    name = 'ResetNutritionistAvailability1754003000001'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // 1. Ensure UUID extension exists
        await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);

        // 2. Drop table to clear bad state (Fixes 500 error due to schema mismatch)
        await queryRunner.query(`DROP TABLE IF EXISTS "nutritionist_availabilities" CASCADE`);

        // 3. Recreate Table correctly
        await queryRunner.query(`
            CREATE TABLE "nutritionist_availabilities" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "day_of_week" character varying NOT NULL,
                "start_time_minutes" integer NOT NULL,
                "end_time_minutes" integer NOT NULL,
                "is_active" boolean NOT NULL DEFAULT true,
                "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "nutritionist_user_id" uuid NOT NULL,
                CONSTRAINT "PK_nutritionist_availabilities_id" PRIMARY KEY ("id")
            )
        `);

        // 4. Add Constraints
        await queryRunner.query(`
            ALTER TABLE "nutritionist_availabilities" 
            ADD CONSTRAINT "FK_nutritionist_availabilities_user" 
            FOREIGN KEY ("nutritionist_user_id") 
            REFERENCES "users"("id") 
            ON DELETE CASCADE 
            ON UPDATE NO ACTION
        `);

        // 5. Add Unique Constraint
        await queryRunner.query(`
            ALTER TABLE "nutritionist_availabilities" 
            ADD CONSTRAINT "UQ_nutritionist_availability_slot" 
            UNIQUE ("nutritionist_user_id", "day_of_week", "start_time_minutes", "end_time_minutes")
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "nutritionist_availabilities"`);
    }
}
