import { MigrationInterface, QueryRunner, TableColumn } from "typeorm";

export class AddMealDataToDietPlans1704073300000 implements MigrationInterface {
    name = 'AddMealDataToDietPlans1704073300000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.addColumn("diet_plans", new TableColumn({
            name: "meal_frequency",
            type: "jsonb",
            isNullable: true,
            comment: "Frecuencia de comidas (desayuno, almuerzo, cena, meriendas)"
        }));

        await queryRunner.addColumn("diet_plans", new TableColumn({
            name: "meal_timing",
            type: "jsonb",
            isNullable: true,
            comment: "Horarios específicos de las comidas"
        }));

        await queryRunner.addColumn("diet_plans", new TableColumn({
            name: "flexibility_settings",
            type: "jsonb",
            isNullable: true,
            comment: "Configuración de flexibilidad del plan nutricional"
        }));
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropColumn("diet_plans", "flexibility_settings");
        await queryRunner.dropColumn("diet_plans", "meal_timing");
        await queryRunner.dropColumn("diet_plans", "meal_frequency");
    }
} 