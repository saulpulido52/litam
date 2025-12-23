import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddPediatricFieldsToPatientProfiles1704073500000 implements MigrationInterface {
    name = 'AddPediatricFieldsToPatientProfiles1704073500000';

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Agregar campos específicos para pacientes pediátricos
        await queryRunner.query(`
            ALTER TABLE "patient_profiles" 
            ADD COLUMN "is_pediatric_patient" boolean DEFAULT false;
        `);

        await queryRunner.query(`
            ALTER TABLE "patient_profiles" 
            ADD COLUMN "caregiver_info" jsonb NULL;
        `);

        await queryRunner.query(`
            ALTER TABLE "patient_profiles" 
            ADD COLUMN "birth_history" jsonb NULL;
        `);

        await queryRunner.query(`
            ALTER TABLE "patient_profiles" 
            ADD COLUMN "feeding_history" jsonb NULL;
        `);

        await queryRunner.query(`
            ALTER TABLE "patient_profiles" 
            ADD COLUMN "developmental_milestones" jsonb NULL;
        `);

        await queryRunner.query(`
            ALTER TABLE "patient_profiles" 
            ADD COLUMN "pediatric_growth_history" jsonb NULL;
        `);

        await queryRunner.query(`
            ALTER TABLE "patient_profiles" 
            ADD COLUMN "school_social_info" jsonb NULL;
        `);

        await queryRunner.query(`
            ALTER TABLE "patient_profiles" 
            ADD COLUMN "vaccination_status" jsonb NULL;
        `);

        await queryRunner.query(`
            ALTER TABLE "patient_profiles" 
            ADD COLUMN "pediatric_habits" jsonb NULL;
        `);

        await queryRunner.query(`
            ALTER TABLE "patient_profiles" 
            ADD COLUMN "pediatric_measurements" jsonb NULL;
        `);

        await queryRunner.query(`
            ALTER TABLE "patient_profiles" 
            ADD COLUMN "pediatric_medical_history" jsonb NULL;
        `);

        await queryRunner.query(`
            ALTER TABLE "patient_profiles" 
            ADD COLUMN "pediatric_nutrition_assessment" jsonb NULL;
        `);

        // Crear índices para mejorar el rendimiento en consultas pediátricas
        await queryRunner.query(`
            CREATE INDEX "IDX_patient_profiles_is_pediatric" 
            ON "patient_profiles" ("is_pediatric_patient");
        `);

        // Agregar comentarios para documentar el propósito de los campos
        await queryRunner.query(`
            COMMENT ON COLUMN "patient_profiles"."is_pediatric_patient" 
            IS 'Indica si el paciente es pediátrico (menor de 18 años)';
        `);

        await queryRunner.query(`
            COMMENT ON COLUMN "patient_profiles"."caregiver_info" 
            IS 'Información del cuidador responsable del paciente pediátrico';
        `);

        await queryRunner.query(`
            COMMENT ON COLUMN "patient_profiles"."birth_history" 
            IS 'Datos del embarazo, parto y nacimiento del paciente';
        `);

        await queryRunner.query(`
            COMMENT ON COLUMN "patient_profiles"."feeding_history" 
            IS 'Historial de lactancia y alimentación temprana';
        `);

        await queryRunner.query(`
            COMMENT ON COLUMN "patient_profiles"."developmental_milestones" 
            IS 'Hitos del desarrollo psicomotor del niño';
        `);

        await queryRunner.query(`
            COMMENT ON COLUMN "patient_profiles"."pediatric_growth_history" 
            IS 'Historial específico de crecimiento pediátrico y percentiles';
        `);

        await queryRunner.query(`
            COMMENT ON COLUMN "patient_profiles"."school_social_info" 
            IS 'Información escolar y social del paciente pediátrico';
        `);

        await queryRunner.query(`
            COMMENT ON COLUMN "patient_profiles"."vaccination_status" 
            IS 'Estado de vacunación del paciente pediátrico';
        `);

        await queryRunner.query(`
            COMMENT ON COLUMN "patient_profiles"."pediatric_habits" 
            IS 'Hábitos específicos del paciente pediátrico (sueño, alimentación, etc.)';
        `);

        await queryRunner.query(`
            COMMENT ON COLUMN "patient_profiles"."pediatric_measurements" 
            IS 'Mediciones antropométricas específicas pediátricas';
        `);

        await queryRunner.query(`
            COMMENT ON COLUMN "patient_profiles"."pediatric_medical_history" 
            IS 'Historial médico específico pediátrico';
        `);

        await queryRunner.query(`
            COMMENT ON COLUMN "patient_profiles"."pediatric_nutrition_assessment" 
            IS 'Evaluación nutricional específica pediátrica';
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Eliminar índices
        await queryRunner.query(`DROP INDEX "IDX_patient_profiles_is_pediatric";`);

        // Eliminar campos pediátricos en orden inverso
        await queryRunner.query(`ALTER TABLE "patient_profiles" DROP COLUMN "pediatric_nutrition_assessment";`);
        await queryRunner.query(`ALTER TABLE "patient_profiles" DROP COLUMN "pediatric_medical_history";`);
        await queryRunner.query(`ALTER TABLE "patient_profiles" DROP COLUMN "pediatric_measurements";`);
        await queryRunner.query(`ALTER TABLE "patient_profiles" DROP COLUMN "pediatric_habits";`);
        await queryRunner.query(`ALTER TABLE "patient_profiles" DROP COLUMN "vaccination_status";`);
        await queryRunner.query(`ALTER TABLE "patient_profiles" DROP COLUMN "school_social_info";`);
        await queryRunner.query(`ALTER TABLE "patient_profiles" DROP COLUMN "pediatric_growth_history";`);
        await queryRunner.query(`ALTER TABLE "patient_profiles" DROP COLUMN "developmental_milestones";`);
        await queryRunner.query(`ALTER TABLE "patient_profiles" DROP COLUMN "feeding_history";`);
        await queryRunner.query(`ALTER TABLE "patient_profiles" DROP COLUMN "birth_history";`);
        await queryRunner.query(`ALTER TABLE "patient_profiles" DROP COLUMN "caregiver_info";`);
        await queryRunner.query(`ALTER TABLE "patient_profiles" DROP COLUMN "is_pediatric_patient";`);
    }
} 