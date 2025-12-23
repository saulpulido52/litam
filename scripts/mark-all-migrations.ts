import { AppDataSource } from '../src/database/data-source';

async function markAllMigrations() {
    try {
        await AppDataSource.initialize();
        console.log('🔧 Marcando todas las migraciones problemáticas como ejecutadas...');

        // Lista de todas las migraciones que necesitan ser marcadas como ejecutadas
        const migrationsToMark = [
            { name: 'AddMealDataToDietPlans1704073300000', timestamp: 1704073300000 },
            { name: 'AddNutritionalGoalsToDietPlans1704073400000', timestamp: 1704073400000 },
            { name: 'AddEliminationReasonToPatientNutritionistRelation1704073500000', timestamp: 1704073500000 },
            { name: 'AddMobileFieldsToNutritionistProfiles1704073500000', timestamp: 1704073500000 },
            { name: 'AddMonetizationTiers1704073500000', timestamp: 1704073500000 },
            { name: 'AddGoogleOAuthFields1704073600000', timestamp: 1704073600000 },
            { name: 'AddGoogleCalendarToAppointments1704073700000', timestamp: 1704073700000 },
            { name: 'AddNutritionistReviewsAndSocialMedia1735884600000', timestamp: 1735884600000 },
            { name: 'CreateRecipeTables1751944800000', timestamp: 1751944800000 },
            { name: 'AddCustomNutritionFieldsToRecipeIngredients1751945000000', timestamp: 1751945000000 },
            { name: 'AddBaseRecipeFields1751946000000', timestamp: 1751946000000 },
            { name: 'AddFieldsToMeals1751967602000', timestamp: 1751967602000 },
            { name: 'OptimizeTemplateIndices1751978000000', timestamp: 1751978000000 },
            { name: 'AddNutritionistValidationFields1752000000000', timestamp: 1752000000000 }
        ];

        for (const migration of migrationsToMark) {
            const exists = await AppDataSource.query(`
                SELECT 1 FROM "migrations" WHERE "name" = $1
            `, [migration.name]);

            if (exists.length === 0) {
                console.log(`📝 Marcando migración ${migration.name} como ejecutada...`);
                await AppDataSource.query(`
                    INSERT INTO "migrations" ("name", "timestamp") VALUES ($1, $2)
                `, [migration.name, migration.timestamp]);
                console.log(`✅ Migración ${migration.name} marcada como ejecutada`);
            } else {
                console.log(`✅ Migración ${migration.name} ya está marcada como ejecutada`);
            }
        }

        console.log('\n🎉 Todas las migraciones han sido marcadas como ejecutadas');
        
        // Verificar estado final
        const finalMigrations = await AppDataSource.query(`
            SELECT * FROM "migrations" ORDER BY "id" DESC
        `);
        console.log(`\n📋 Total de migraciones ejecutadas: ${finalMigrations.length}`);
        
        await AppDataSource.destroy();
    } catch (error) {
        console.error('❌ Error durante el marcado de migraciones:', error);
        process.exit(1);
    }
}

markAllMigrations(); 