import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateNutritionistAvailability1754003000000 implements MigrationInterface {
    name = 'CreateNutritionistAvailability1754003000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // 1. Create Table if not exists
        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS "nutritionist_availabilities" (
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

        // 2. Add Constraint if not exists (Postgres idiom)
        await queryRunner.query(`
            DO $$ 
            BEGIN 
                IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'FK_nutritionist_availabilities_user') THEN 
                    ALTER TABLE "nutritionist_availabilities" 
                    ADD CONSTRAINT "FK_nutritionist_availabilities_user" 
                    FOREIGN KEY ("nutritionist_user_id") 
                    REFERENCES "users"("id") 
                    ON DELETE CASCADE 
                    ON UPDATE NO ACTION; 
                END IF; 
            END $$;
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "nutritionist_availabilities" DROP CONSTRAINT "FK_nutritionist_availabilities_user"`);
        await queryRunner.query(`DROP TABLE "nutritionist_availabilities"`);
    }
}
