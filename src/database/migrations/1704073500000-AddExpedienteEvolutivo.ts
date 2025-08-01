import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddExpedienteEvolutivo1704073500000 implements MigrationInterface {
    name = 'AddExpedienteEvolutivo1704073500000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // No crear enum, usar varchar en su lugar

        // Agregar el campo tipo_expediente con valor por defecto
        await queryRunner.query(`
            ALTER TABLE "clinical_records" 
            ADD COLUMN "tipo_expediente" character varying(50) NOT NULL DEFAULT 'inicial'
        `);

        // Agregar campo para referenciar el expediente base
        await queryRunner.query(`
            ALTER TABLE "clinical_records" 
            ADD COLUMN "expediente_base_id" uuid
        `);

        // Agregar campos JSONB para metadatos del seguimiento
        await queryRunner.query(`
            ALTER TABLE "clinical_records" 
            ADD COLUMN "seguimiento_metadata" jsonb
        `);

        // Agregar campo para análisis de riesgo-beneficio
        await queryRunner.query(`
            ALTER TABLE "clinical_records" 
            ADD COLUMN "analisis_riesgo_beneficio" jsonb
        `);

        // Agregar campo para juicio clínico
        await queryRunner.query(`
            ALTER TABLE "clinical_records" 
            ADD COLUMN "juicio_clinico" jsonb
        `);

        // Agregar campo para capacidad del paciente
        await queryRunner.query(`
            ALTER TABLE "clinical_records" 
            ADD COLUMN "capacidad_paciente" jsonb
        `);

        // Crear índice para expediente_base_id para mejorar consultas de seguimiento
        await queryRunner.query(`
            CREATE INDEX "IDX_clinical_records_expediente_base" 
            ON "clinical_records" ("expediente_base_id")
        `);

        // Crear índice compuesto para consultas de seguimiento por paciente y tipo
        await queryRunner.query(`
            CREATE INDEX "IDX_clinical_records_patient_tipo" 
            ON "clinical_records" ("patient_user_id", "tipo_expediente")
        `);

        // Crear índice para consultas por fecha y tipo
        await queryRunner.query(`
            CREATE INDEX "IDX_clinical_records_date_tipo" 
            ON "clinical_records" ("record_date", "tipo_expediente")
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Eliminar índices
        await queryRunner.query(`DROP INDEX "IDX_clinical_records_date_tipo"`);
        await queryRunner.query(`DROP INDEX "IDX_clinical_records_patient_tipo"`);
        await queryRunner.query(`DROP INDEX "IDX_clinical_records_expediente_base"`);

        // Eliminar columnas
        await queryRunner.query(`ALTER TABLE "clinical_records" DROP COLUMN "capacidad_paciente"`);
        await queryRunner.query(`ALTER TABLE "clinical_records" DROP COLUMN "juicio_clinico"`);
        await queryRunner.query(`ALTER TABLE "clinical_records" DROP COLUMN "analisis_riesgo_beneficio"`);
        await queryRunner.query(`ALTER TABLE "clinical_records" DROP COLUMN "seguimiento_metadata"`);
        await queryRunner.query(`ALTER TABLE "clinical_records" DROP COLUMN "expediente_base_id"`);
        await queryRunner.query(`ALTER TABLE "clinical_records" DROP COLUMN "tipo_expediente"`);

        // No necesitamos eliminar el enum ya que no lo creamos
    }
} 