import { MigrationInterface, QueryRunner, TableColumn } from "typeorm";

export class AddPathologicalRestrictionsToDietPlans1704073200000 implements MigrationInterface {
    name = 'AddPathologicalRestrictionsToDietPlans1704073200000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.addColumn("diet_plans", new TableColumn({
            name: "pathological_restrictions",
            type: "jsonb",
            isNullable: true,
            comment: "Restricciones médicas, alergias, medicamentos y consideraciones especiales del plan nutricional"
        }));
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropColumn("diet_plans", "pathological_restrictions");
    }
} 