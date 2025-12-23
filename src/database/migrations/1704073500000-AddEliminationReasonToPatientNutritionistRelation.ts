import { MigrationInterface, QueryRunner } from "typeorm";

export class AddEliminationReasonToPatientNutritionistRelation1704073500000 implements MigrationInterface {
    name = 'AddEliminationReasonToPatientNutritionistRelation1704073500000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "patient_nutritionist_relations" ADD "elimination_reason" text`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "patient_nutritionist_relations" DROP COLUMN "elimination_reason"`);
    }
} 