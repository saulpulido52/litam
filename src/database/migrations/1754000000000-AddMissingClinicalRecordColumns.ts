import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddMissingClinicalRecordColumns1754000000000 implements MigrationInterface {
    name = 'AddMissingClinicalRecordColumns1754000000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
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
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Eliminar columnas
        await queryRunner.query(`ALTER TABLE "clinical_records" DROP COLUMN "capacidad_paciente"`);
        await queryRunner.query(`ALTER TABLE "clinical_records" DROP COLUMN "juicio_clinico"`);
        await queryRunner.query(`ALTER TABLE "clinical_records" DROP COLUMN "analisis_riesgo_beneficio"`);
    }
} 