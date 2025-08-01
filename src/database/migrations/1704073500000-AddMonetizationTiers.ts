// src/database/migrations/1704073500000-AddMonetizationTiers.ts
import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddMonetizationTiers1704073500000 implements MigrationInterface {
    name = 'AddMonetizationTiers1704073500000';

    public async up(queryRunner: QueryRunner): Promise<void> {
        // No crear enums, usar varchar en su lugar

        // Crear tabla de tiers de nutriólogos
        await queryRunner.query(`
            CREATE TABLE "nutritionist_tiers" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "name" character varying(100) NOT NULL,
                "description" text,
                "tier_type" character varying(20) NOT NULL,
                "payment_model" character varying(20) NOT NULL,
                "commission_rate" numeric(5,2),
                "subscription_price" numeric(10,2),
                "annual_price" numeric(10,2),
                "max_active_patients" integer NOT NULL DEFAULT '1',
                "includes_ai_meal_planning" boolean NOT NULL DEFAULT false,
                "includes_advanced_management" boolean NOT NULL DEFAULT false,
                "includes_priority_support" boolean NOT NULL DEFAULT false,
                "is_active" boolean NOT NULL DEFAULT true,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "PK_nutritionist_tiers" PRIMARY KEY ("id")
            )
        `);

        // No crear enums, usar varchar en su lugar

        // Crear tabla de tiers de pacientes
        await queryRunner.query(`
            CREATE TABLE "patient_tiers" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "name" character varying(100) NOT NULL,
                "description" text,
                "tier_type" character varying(20) NOT NULL,
                "payment_model" character varying(20) NOT NULL,
                "one_time_price" numeric(10,2),
                "monthly_price" numeric(10,2),
                "annual_price" numeric(10,2),
                "shows_ads" boolean NOT NULL DEFAULT true,
                "includes_ai_food_scanning" boolean NOT NULL DEFAULT false,
                "includes_barcode_scanning" boolean NOT NULL DEFAULT false,
                "includes_smart_shopping_list" boolean NOT NULL DEFAULT false,
                "includes_advanced_tracking" boolean NOT NULL DEFAULT false,
                "includes_device_integration" boolean NOT NULL DEFAULT false,
                "is_active" boolean NOT NULL DEFAULT true,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "PK_patient_tiers" PRIMARY KEY ("id")
            )
        `);

        // Agregar columnas de referencia a la tabla users
        await queryRunner.query(`
            ALTER TABLE "users" 
            ADD COLUMN "nutritionist_tier_id" uuid,
            ADD COLUMN "patient_tier_id" uuid
        `);

        // Agregar foreign keys
        await queryRunner.query(`
            ALTER TABLE "users" 
            ADD CONSTRAINT "FK_users_nutritionist_tier" 
            FOREIGN KEY ("nutritionist_tier_id") 
            REFERENCES "nutritionist_tiers"("id") ON DELETE SET NULL
        `);

        await queryRunner.query(`
            ALTER TABLE "users" 
            ADD CONSTRAINT "FK_users_patient_tier" 
            FOREIGN KEY ("patient_tier_id") 
            REFERENCES "patient_tiers"("id") ON DELETE SET NULL
        `);

        // Insertar tiers por defecto
        await queryRunner.query(`
            INSERT INTO "nutritionist_tiers" (
                "name", "description", "tier_type", "payment_model", 
                "commission_rate", "max_active_patients", "includes_ai_meal_planning", 
                "includes_advanced_management", "includes_priority_support"
            ) VALUES 
            (
                'Nutriólogo Básico', 
                'Acceso a un paciente activo con comisión del 20% por consulta',
                'basic', 'commission', 20.00, 1, false, false, false
            ),
            (
                'Nutriólogo Premium', 
                'Acceso ilimitado a pacientes con herramientas avanzadas de IA',
                'premium', 'subscription', NULL, -1, true, true, true
            )
        `);

        await queryRunner.query(`
            INSERT INTO "patient_tiers" (
                "name", "description", "tier_type", "payment_model",
                "one_time_price", "monthly_price", "annual_price", "shows_ads",
                "includes_ai_food_scanning", "includes_barcode_scanning",
                "includes_smart_shopping_list", "includes_advanced_tracking",
                "includes_device_integration"
            ) VALUES 
            (
                'Paciente Gratuito',
                'Acceso básico con anuncios publicitarios',
                'free', 'free', NULL, NULL, NULL, true,
                false, false, false, false, false
            ),
            (
                'Paciente Pro',
                'Sin anuncios por pago único de $40 MXN',
                'pro', 'one_time', 40.00, NULL, NULL, false,
                false, false, false, false, false
            ),
            (
                'Paciente Premium',
                'Herramientas avanzadas de IA y seguimiento',
                'premium', 'subscription', NULL, 99.99, 999.99, false,
                true, true, true, true, true
            )
        `);

        // Asignar tier gratuito por defecto a todos los pacientes existentes
        await queryRunner.query(`
            UPDATE "users" 
            SET "patient_tier_id" = (
                SELECT "id" FROM "patient_tiers" 
                WHERE "tier_type" = 'free' AND "is_active" = true 
                LIMIT 1
            )
            WHERE "role_id" = (SELECT "id" FROM "roles" WHERE "name" = 'patient')
        `);

        // Asignar tier básico por defecto a todos los nutriólogos existentes
        await queryRunner.query(`
            UPDATE "users" 
            SET "nutritionist_tier_id" = (
                SELECT "id" FROM "nutritionist_tiers" 
                WHERE "tier_type" = 'basic' AND "is_active" = true 
                LIMIT 1
            )
            WHERE "role_id" = (SELECT "id" FROM "roles" WHERE "name" = 'nutritionist')
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Eliminar foreign keys
        await queryRunner.query(`
            ALTER TABLE "users" DROP CONSTRAINT "FK_users_patient_tier"
        `);

        await queryRunner.query(`
            ALTER TABLE "users" DROP CONSTRAINT "FK_users_nutritionist_tier"
        `);

        // Eliminar columnas de referencia
        await queryRunner.query(`
            ALTER TABLE "users" DROP COLUMN "patient_tier_id"
        `);

        await queryRunner.query(`
            ALTER TABLE "users" DROP COLUMN "nutritionist_tier_id"
        `);

        // Eliminar tablas
        await queryRunner.query(`DROP TABLE "patient_tiers"`);
        await queryRunner.query(`DROP TABLE "nutritionist_tiers"`);

        // No necesitamos eliminar enums ya que no los creamos
    }
} 