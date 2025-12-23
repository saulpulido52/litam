import { MigrationInterface, QueryRunner } from "typeorm";

export class AddGoogleCalendarToAppointments1704073700000 implements MigrationInterface {
    name = 'AddGoogleCalendarToAppointments1704073700000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Agregar campos para Google Calendar en appointments
        await queryRunner.query(`
            ALTER TABLE "appointments" 
            ADD COLUMN "google_calendar_event_id" VARCHAR(255),
            ADD COLUMN "synced_to_google_calendar" BOOLEAN DEFAULT FALSE,
            ADD COLUMN "last_sync_to_google" TIMESTAMPTZ
        `);

        // Crear índice para búsquedas por Google Calendar Event ID
        await queryRunner.query(`
            CREATE INDEX "IDX_appointments_google_event_id" ON "appointments" ("google_calendar_event_id")
        `);

        // Crear índice para búsquedas por estado de sincronización
        await queryRunner.query(`
            CREATE INDEX "IDX_appointments_synced_to_google" ON "appointments" ("synced_to_google_calendar")
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Eliminar índices
        await queryRunner.query(`DROP INDEX "IDX_appointments_synced_to_google"`);
        await queryRunner.query(`DROP INDEX "IDX_appointments_google_event_id"`);

        // Eliminar columnas
        await queryRunner.query(`
            ALTER TABLE "appointments" 
            DROP COLUMN "google_calendar_event_id",
            DROP COLUMN "synced_to_google_calendar",
            DROP COLUMN "last_sync_to_google"
        `);
    }
} 