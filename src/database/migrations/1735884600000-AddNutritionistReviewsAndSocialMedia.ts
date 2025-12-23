// src/database/migrations/1735884600000-AddNutritionistReviewsAndSocialMedia.ts
import { MigrationInterface, QueryRunner, Table, Index } from 'typeorm';

export class AddNutritionistReviewsAndSocialMedia1735884600000 implements MigrationInterface {
    name = 'AddNutritionistReviewsAndSocialMedia1735884600000';

    public async up(queryRunner: QueryRunner): Promise<void> {
        // 1. Crear tabla nutritionist_reviews
        await queryRunner.createTable(
            new Table({
                name: 'nutritionist_reviews',
                columns: [
                    {
                        name: 'id',
                        type: 'uuid',
                        isPrimary: true,
                        generationStrategy: 'uuid',
                        default: 'uuid_generate_v4()',
                    },
                    {
                        name: 'nutritionist_id',
                        type: 'uuid',
                        isNullable: false,
                    },
                    {
                        name: 'patient_id',
                        type: 'uuid',
                        isNullable: false,
                    },
                    {
                        name: 'rating',
                        type: 'integer',
                        isNullable: false,
                    },
                    {
                        name: 'comment',
                        type: 'text',
                        isNullable: true,
                    },
                    {
                        name: 'is_verified',
                        type: 'boolean',
                        default: false,
                    },
                    {
                        name: 'is_visible',
                        type: 'boolean',
                        default: true,
                    },
                    {
                        name: 'is_flagged',
                        type: 'boolean',
                        default: false,
                    },
                    {
                        name: 'flag_reason',
                        type: 'text',
                        isNullable: true,
                    },
                    {
                        name: 'communication_rating',
                        type: 'integer',
                        isNullable: true,
                    },
                    {
                        name: 'professionalism_rating',
                        type: 'integer',
                        isNullable: true,
                    },
                    {
                        name: 'results_rating',
                        type: 'integer',
                        isNullable: true,
                    },
                    {
                        name: 'punctuality_rating',
                        type: 'integer',
                        isNullable: true,
                    },
                    {
                        name: 'would_recommend',
                        type: 'boolean',
                        default: false,
                    },
                    {
                        name: 'consultation_duration_months',
                        type: 'integer',
                        isNullable: true,
                    },
                    {
                        name: 'treatment_type',
                        type: 'varchar',
                        length: '100',
                        isNullable: true,
                    },
                    {
                        name: 'created_at',
                        type: 'timestamptz',
                        default: 'CURRENT_TIMESTAMP',
                    },
                    {
                        name: 'updated_at',
                        type: 'timestamptz',
                        default: 'CURRENT_TIMESTAMP',
                        onUpdate: 'CURRENT_TIMESTAMP',
                    },
                ],
                foreignKeys: [
                    {
                        name: 'FK_nutritionist_reviews_nutritionist',
                        columnNames: ['nutritionist_id'],
                        referencedTableName: 'users',
                        referencedColumnNames: ['id'],
                        onDelete: 'CASCADE',
                    },
                    {
                        name: 'FK_nutritionist_reviews_patient',
                        columnNames: ['patient_id'],
                        referencedTableName: 'users',
                        referencedColumnNames: ['id'],
                        onDelete: 'CASCADE',
                    },
                ],
                indices: [
                    {
                        name: 'IDX_nutritionist_reviews_nutritionist',
                        columnNames: ['nutritionist_id'],
                    },
                    {
                        name: 'IDX_nutritionist_reviews_patient',
                        columnNames: ['patient_id'],
                    },
                    {
                        name: 'IDX_nutritionist_reviews_rating',
                        columnNames: ['rating'],
                    },
                    {
                        name: 'IDX_nutritionist_reviews_visible',
                        columnNames: ['is_visible'],
                    },
                ],
            }),
            true,
        );

        // 2. Crear unique constraint para nutritionist + patient
        await queryRunner.query(`
            CREATE UNIQUE INDEX "UQ_nutritionist_reviews_nutritionist_patient" 
            ON "nutritionist_reviews" ("nutritionist_id", "patient_id")
        `);

        // 3. Agregar campos de redes sociales y estadísticas de reviews a nutritionist_profiles
        await queryRunner.query(`
            ALTER TABLE "nutritionist_profiles" 
            ADD COLUMN "social_media" jsonb,
            ADD COLUMN "average_rating" decimal(3,2) DEFAULT 0,
            ADD COLUMN "total_reviews" integer NOT NULL DEFAULT 0,
            ADD COLUMN "verified_reviews" integer NOT NULL DEFAULT 0
        `);

        // 4. Agregar índices para optimizar consultas de reviews
        await queryRunner.query(`
            CREATE INDEX "IDX_nutritionist_profiles_average_rating" ON "nutritionist_profiles" ("average_rating");
            CREATE INDEX "IDX_nutritionist_profiles_total_reviews" ON "nutritionist_profiles" ("total_reviews");
        `);

        // 5. Agregar constraints para validar ratings
        await queryRunner.query(`
            ALTER TABLE "nutritionist_reviews" 
            ADD CONSTRAINT "CHK_nutritionist_reviews_rating_range" CHECK ("rating" >= 1 AND "rating" <= 5),
            ADD CONSTRAINT "CHK_nutritionist_reviews_communication_rating_range" CHECK ("communication_rating" IS NULL OR ("communication_rating" >= 1 AND "communication_rating" <= 5)),
            ADD CONSTRAINT "CHK_nutritionist_reviews_professionalism_rating_range" CHECK ("professionalism_rating" IS NULL OR ("professionalism_rating" >= 1 AND "professionalism_rating" <= 5)),
            ADD CONSTRAINT "CHK_nutritionist_reviews_results_rating_range" CHECK ("results_rating" IS NULL OR ("results_rating" >= 1 AND "results_rating" <= 5)),
            ADD CONSTRAINT "CHK_nutritionist_reviews_punctuality_rating_range" CHECK ("punctuality_rating" IS NULL OR ("punctuality_rating" >= 1 AND "punctuality_rating" <= 5))
        `);

        console.log('✅ Migración completada: Sistema de reviews y redes sociales agregado');
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Revertir en orden inverso

        // 1. Eliminar constraints
        await queryRunner.query(`
            ALTER TABLE "nutritionist_reviews" 
            DROP CONSTRAINT IF EXISTS "CHK_nutritionist_reviews_rating_range",
            DROP CONSTRAINT IF EXISTS "CHK_nutritionist_reviews_communication_rating_range",
            DROP CONSTRAINT IF EXISTS "CHK_nutritionist_reviews_professionalism_rating_range",
            DROP CONSTRAINT IF EXISTS "CHK_nutritionist_reviews_results_rating_range",
            DROP CONSTRAINT IF EXISTS "CHK_nutritionist_reviews_punctuality_rating_range"
        `);

        // 2. Eliminar índices de nutritionist_profiles
        await queryRunner.query(`
            DROP INDEX IF EXISTS "IDX_nutritionist_profiles_average_rating";
            DROP INDEX IF EXISTS "IDX_nutritionist_profiles_total_reviews";
        `);

        // 3. Eliminar campos agregados a nutritionist_profiles
        await queryRunner.query(`
            ALTER TABLE "nutritionist_profiles" 
            DROP COLUMN IF EXISTS "social_media",
            DROP COLUMN IF EXISTS "average_rating",
            DROP COLUMN IF EXISTS "total_reviews",
            DROP COLUMN IF EXISTS "verified_reviews"
        `);

        // 4. Eliminar tabla nutritionist_reviews
        await queryRunner.dropTable('nutritionist_reviews');

        console.log('✅ Migración revertida: Sistema de reviews y redes sociales eliminado');
    }
} 