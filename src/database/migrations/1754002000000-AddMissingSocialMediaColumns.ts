import { MigrationInterface, QueryRunner } from "typeorm";

export class AddMissingSocialMediaColumns1754002000000 implements MigrationInterface {
    name = 'AddMissingSocialMediaColumns1754002000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Agregar columnas faltantes de redes sociales y otras
        await queryRunner.query(`ALTER TABLE "nutritionist_profiles" ADD COLUMN "social_media" jsonb`);
        await queryRunner.query(`ALTER TABLE "nutritionist_profiles" ADD COLUMN "average_rating" decimal(3,2) DEFAULT 0`);
        await queryRunner.query(`ALTER TABLE "nutritionist_profiles" ADD COLUMN "total_reviews" integer DEFAULT 0`);
        await queryRunner.query(`ALTER TABLE "nutritionist_profiles" ADD COLUMN "verified_reviews" integer DEFAULT 0`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Eliminar columnas
        await queryRunner.query(`ALTER TABLE "nutritionist_profiles" DROP COLUMN "verified_reviews"`);
        await queryRunner.query(`ALTER TABLE "nutritionist_profiles" DROP COLUMN "total_reviews"`);
        await queryRunner.query(`ALTER TABLE "nutritionist_profiles" DROP COLUMN "average_rating"`);
        await queryRunner.query(`ALTER TABLE "nutritionist_profiles" DROP COLUMN "social_media"`);
    }
} 