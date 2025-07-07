import { MigrationInterface, QueryRunner } from "typeorm";

export class AddGoogleOAuthFields1704073600000 implements MigrationInterface {
    name = 'AddGoogleOAuthFields1704073600000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Agregar campos para Google OAuth
        await queryRunner.query(`
            ALTER TABLE "users" 
            ADD COLUMN "google_id" VARCHAR(255) UNIQUE,
            ADD COLUMN "google_email" VARCHAR(255),
            ADD COLUMN "google_access_token" TEXT,
            ADD COLUMN "google_refresh_token" TEXT,
            ADD COLUMN "google_token_expires_at" TIMESTAMPTZ,
            ADD COLUMN "google_calendar_id" VARCHAR(255),
            ADD COLUMN "google_calendar_sync_enabled" BOOLEAN DEFAULT FALSE,
            ADD COLUMN "google_calendar_last_sync" TIMESTAMPTZ,
            ADD COLUMN "auth_provider" VARCHAR(50) DEFAULT 'local'
        `);

        // Crear índice para búsquedas por Google ID
        await queryRunner.query(`
            CREATE INDEX "IDX_users_google_id" ON "users" ("google_id")
        `);

        // Crear índice para búsquedas por proveedor de autenticación
        await queryRunner.query(`
            CREATE INDEX "IDX_users_auth_provider" ON "users" ("auth_provider")
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Eliminar índices
        await queryRunner.query(`DROP INDEX "IDX_users_auth_provider"`);
        await queryRunner.query(`DROP INDEX "IDX_users_google_id"`);

        // Eliminar columnas
        await queryRunner.query(`
            ALTER TABLE "users" 
            DROP COLUMN "google_id",
            DROP COLUMN "google_email",
            DROP COLUMN "google_access_token",
            DROP COLUMN "google_refresh_token",
            DROP COLUMN "google_token_expires_at",
            DROP COLUMN "google_calendar_id",
            DROP COLUMN "google_calendar_sync_enabled",
            DROP COLUMN "google_calendar_last_sync",
            DROP COLUMN "auth_provider"
        `);
    }
} 