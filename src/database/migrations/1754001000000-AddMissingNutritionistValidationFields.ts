import { MigrationInterface, QueryRunner } from "typeorm";

export class AddMissingNutritionistValidationFields1754001000000 implements MigrationInterface {
    name = 'AddMissingNutritionistValidationFields1754001000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Agregar campos de validación profesional que faltan
        await queryRunner.query(`ALTER TABLE "nutritionist_profiles" ADD COLUMN "professional_id" varchar(20)`);
        await queryRunner.query(`ALTER TABLE "nutritionist_profiles" ADD COLUMN "professional_id_issuer" varchar(255)`);
        await queryRunner.query(`ALTER TABLE "nutritionist_profiles" ADD COLUMN "university" varchar(100)`);
        await queryRunner.query(`ALTER TABLE "nutritionist_profiles" ADD COLUMN "degree_title" varchar(100)`);
        await queryRunner.query(`ALTER TABLE "nutritionist_profiles" ADD COLUMN "graduation_date" date`);
        await queryRunner.query(`ALTER TABLE "nutritionist_profiles" ADD COLUMN "verification_status" varchar(20) NOT NULL DEFAULT 'pending'`);
        await queryRunner.query(`ALTER TABLE "nutritionist_profiles" ADD COLUMN "verification_notes" text`);
        await queryRunner.query(`ALTER TABLE "nutritionist_profiles" ADD COLUMN "verified_by_admin_id" uuid`);
        await queryRunner.query(`ALTER TABLE "nutritionist_profiles" ADD COLUMN "verified_at" timestamptz`);
        await queryRunner.query(`ALTER TABLE "nutritionist_profiles" ADD COLUMN "uploaded_documents" jsonb`);
        await queryRunner.query(`ALTER TABLE "nutritionist_profiles" ADD COLUMN "rfc" varchar(15)`);
        await queryRunner.query(`ALTER TABLE "nutritionist_profiles" ADD COLUMN "curp" varchar(18)`);

        // Crear índices para mejorar el rendimiento
        await queryRunner.query(`CREATE INDEX "IDX_nutritionist_profiles_professional_id" ON "nutritionist_profiles" ("professional_id")`);
        await queryRunner.query(`CREATE INDEX "IDX_nutritionist_profiles_verification_status" ON "nutritionist_profiles" ("verification_status")`);
        await queryRunner.query(`CREATE INDEX "IDX_nutritionist_profiles_rfc" ON "nutritionist_profiles" ("rfc")`);

        // Actualizar nutriólogos existentes para que tengan estado 'approved' si ya están verificados
        await queryRunner.query(`UPDATE "nutritionist_profiles" SET "verification_status" = 'approved', "verified_at" = NOW() WHERE "is_verified" = true`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Eliminar índices
        await queryRunner.query(`DROP INDEX "IDX_nutritionist_profiles_rfc"`);
        await queryRunner.query(`DROP INDEX "IDX_nutritionist_profiles_verification_status"`);
        await queryRunner.query(`DROP INDEX "IDX_nutritionist_profiles_professional_id"`);

        // Eliminar columnas
        await queryRunner.query(`ALTER TABLE "nutritionist_profiles" DROP COLUMN "curp"`);
        await queryRunner.query(`ALTER TABLE "nutritionist_profiles" DROP COLUMN "rfc"`);
        await queryRunner.query(`ALTER TABLE "nutritionist_profiles" DROP COLUMN "uploaded_documents"`);
        await queryRunner.query(`ALTER TABLE "nutritionist_profiles" DROP COLUMN "verified_at"`);
        await queryRunner.query(`ALTER TABLE "nutritionist_profiles" DROP COLUMN "verified_by_admin_id"`);
        await queryRunner.query(`ALTER TABLE "nutritionist_profiles" DROP COLUMN "verification_notes"`);
        await queryRunner.query(`ALTER TABLE "nutritionist_profiles" DROP COLUMN "verification_status"`);
        await queryRunner.query(`ALTER TABLE "nutritionist_profiles" DROP COLUMN "graduation_date"`);
        await queryRunner.query(`ALTER TABLE "nutritionist_profiles" DROP COLUMN "degree_title"`);
        await queryRunner.query(`ALTER TABLE "nutritionist_profiles" DROP COLUMN "university"`);
        await queryRunner.query(`ALTER TABLE "nutritionist_profiles" DROP COLUMN "professional_id_issuer"`);
        await queryRunner.query(`ALTER TABLE "nutritionist_profiles" DROP COLUMN "professional_id"`);
    }
} 