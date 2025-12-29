import { AppDataSource } from './src/database/data-source';

async function addMissingColumn() {
    try {
        await AppDataSource.initialize();
        console.log('✅ Conexión a base de datos establecida');

        const queryRunner = AppDataSource.createQueryRunner();

        // Verificar si la columna existe
        const checkColumn = await queryRunner.query(`
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name='recipes' AND column_name='is_base_recipe'
        `);

        if (checkColumn.length === 0) {
            console.log('⚠️  Columna is_base_recipe no existe, agregándola...');

            await queryRunner.query(`
                ALTER TABLE "recipes" 
                ADD COLUMN "is_base_recipe" BOOLEAN DEFAULT FALSE,
                ADD COLUMN "is_shared_by_admin" BOOLEAN DEFAULT FALSE,
                ADD COLUMN "original_recipe_id" UUID NULL,
                ADD COLUMN "shared_at" TIMESTAMP WITH TIME ZONE NULL,
                ADD COLUMN "shared_by_admin_id" UUID NULL
            `);

            await queryRunner.query(`
                ALTER TABLE "recipes" 
                ADD CONSTRAINT "FK_recipes_shared_by_admin" 
                FOREIGN KEY ("shared_by_admin_id") REFERENCES "users"("id") ON DELETE SET NULL
            `);

            await queryRunner.query(`
                ALTER TABLE "recipes" 
                ADD CONSTRAINT "FK_recipes_original_recipe" 
                FOREIGN KEY ("original_recipe_id") REFERENCES "recipes"("id") ON DELETE SET NULL
            `);

            await queryRunner.query(`
                CREATE INDEX "IDX_recipes_is_base_recipe" ON "recipes" ("is_base_recipe");
            `);

            await queryRunner.query(`
                CREATE INDEX "IDX_recipes_is_shared_by_admin" ON "recipes" ("is_shared_by_admin");
            `);

            console.log('✅ Columnas agregadas exitosamente');
        } else {
            console.log('✅ La columna is_base_recipe ya existe');
        }

        await queryRunner.release();
        await AppDataSource.destroy();
        console.log('✅ Proceso completado');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

addMissingColumn();
