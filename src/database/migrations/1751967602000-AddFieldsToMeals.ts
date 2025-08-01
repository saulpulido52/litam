import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddFieldsToMeals1751967602000 implements MigrationInterface {
    name = 'AddFieldsToMeals1751967602000';

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Agregar campo day
        await queryRunner.addColumn('meals', new TableColumn({
            name: 'day',
            type: 'varchar',
            length: '50',
            isNullable: true,
        }));

        // Agregar campo meal_type
        await queryRunner.addColumn('meals', new TableColumn({
            name: 'meal_type',
            type: 'varchar',
            length: '50',
            isNullable: true,
        }));

        // Agregar campo meal_time
        await queryRunner.addColumn('meals', new TableColumn({
            name: 'meal_time',
            type: 'time',
            isNullable: true,
        }));

        // Agregar campo notes
        await queryRunner.addColumn('meals', new TableColumn({
            name: 'notes',
            type: 'text',
            isNullable: true,
        }));

        console.log('✅ Agregados campos day, meal_type, meal_time y notes a la tabla meals');
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Eliminar campos en orden inverso
        await queryRunner.dropColumn('meals', 'notes');
        await queryRunner.dropColumn('meals', 'meal_time');
        await queryRunner.dropColumn('meals', 'meal_type');
        await queryRunner.dropColumn('meals', 'day');

        console.log('✅ Eliminados campos day, meal_type, meal_time y notes de la tabla meals');
    }
} 