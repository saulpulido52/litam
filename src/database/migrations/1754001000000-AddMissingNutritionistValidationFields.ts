import { MigrationInterface, QueryRunner } from "typeorm";

export class AddMissingNutritionistValidationFields1754001000000 implements MigrationInterface {
    name = 'AddMissingNutritionistValidationFields1754001000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Agregar campos de validación profesional que faltan
        await queryRunner.query(`
            ALTER TABLE "nutritionist_profiles" 
            ADD COLUMN "professional_id" varchar(20),
            ADD COLUMN "professional_id_issuer" varchar(255),
            ADD COLUMN "university" varchar(100),
            ADD COLUMN "degree_title" varchar(100),
            ADD COLUMN "graduation_date" date,
            ADD COLUMN "verification_status" varchar(20) NOT NULL DEFAULT 'pending',
            ADD COLUMN "verification_notes" text,
            ADD COLUMN "verified_by_admin_id" uuid,
            ADD COLUMN "verified_at" timestamptz,
            ADD COLUMN "uploaded_documents" jsonb,
            ADD COLUMN "rfc" varchar(15),
            ADD COLUMN "curp" varchar(18)
        `);

        // Crear índices para mejorar el rendimiento
        await queryRunner.query(`
            CREATE INDEX "IDX_nutritionist_profiles_professional_id" ON "nutritionist_profiles" ("professional_id")
        `);
        
        await queryRunner.query(`
            CREATE INDEX "IDX_nutritionist_profiles_verification_status" ON "nutritionist_profiles" ("verification_status")
        `);

        await queryRunner.query(`
            CREATE INDEX "IDX_nutritionist_profiles_rfc" ON "nutritionist_profiles" ("rfc")
        `);

        // Actualizar nutriólogos existentes para que tengan estado 'approved' si ya están verificados
        await queryRunner.query(`
            UPDATE "nutritionist_profiles" 
            SET "verification_status" = 'approved', "verified_at" = NOW() 
            WHERE "is_verified" = true
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Eliminar índices
        await queryRunner.query(`DROP INDEX "IDX_nutritionist_profiles_rfc"`);
        await queryRunner.query(`DROP INDEX "IDX_nutritionist_profiles_verification_status"`);
        await queryRunner.query(`DROP INDEX "IDX_nutritionist_profiles_professional_id"`);

        // Eliminar columnas
        await queryRunner.query(`
            ALTER TABLE "nutritionist_profiles" 
            DROP COLUMN "curp",
            DROP COLUMN "rfc",
            DROP COLUMN "uploaded_documents",
            DROP COLUMN "verified_at",
            DROP COLUMN "verified_by_admin_id",
            DROP COLUMN "verification_notes",
            DROP COLUMN "verification_status",
            DROP COLUMN "graduation_date",
            DROP COLUMN "degree_title",
            DROP COLUMN "university",
            DROP COLUMN "professional_id_issuer",
            DROP COLUMN "professional_id"
        `);
    }
} 