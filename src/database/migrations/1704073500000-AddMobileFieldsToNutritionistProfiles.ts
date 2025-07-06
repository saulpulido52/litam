import { MigrationInterface, QueryRunner } from "typeorm";

export class AddMobileFieldsToNutritionistProfiles1704073500000 implements MigrationInterface {
    name = 'AddMobileFieldsToNutritionistProfiles1704073500000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "nutritionist_profiles" 
            ADD COLUMN "professional_summary" text,
            ADD COLUMN "offers_in_person" boolean NOT NULL DEFAULT true,
            ADD COLUMN "offers_online" boolean NOT NULL DEFAULT true,
            ADD COLUMN "clinic_name" varchar(255),
            ADD COLUMN "clinic_address" text,
            ADD COLUMN "clinic_city" varchar(100),
            ADD COLUMN "clinic_state" varchar(100),
            ADD COLUMN "clinic_zip_code" varchar(10),
            ADD COLUMN "clinic_country" varchar(100),
            ADD COLUMN "latitude" decimal(10,8),
            ADD COLUMN "longitude" decimal(11,8),
            ADD COLUMN "clinic_notes" text,
            ADD COLUMN "clinic_phone" varchar(20),
            ADD COLUMN "is_available" boolean NOT NULL DEFAULT true
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "nutritionist_profiles" 
            DROP COLUMN "professional_summary",
            DROP COLUMN "offers_in_person",
            DROP COLUMN "offers_online",
            DROP COLUMN "clinic_name",
            DROP COLUMN "clinic_address",
            DROP COLUMN "clinic_city",
            DROP COLUMN "clinic_state",
            DROP COLUMN "clinic_zip_code",
            DROP COLUMN "clinic_country",
            DROP COLUMN "latitude",
            DROP COLUMN "longitude",
            DROP COLUMN "clinic_notes",
            DROP COLUMN "clinic_phone",
            DROP COLUMN "is_available"
        `);
    }
} 