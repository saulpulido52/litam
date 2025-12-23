import { AppDataSource } from '../src/database/data-source';

async function testSeguimientoStats() {
    try {
        await AppDataSource.initialize();
        console.log('🧪 Probando consulta de estadísticas de seguimiento...');

        const nutritionistId = 'ffde8e9e-b6c5-46da-a2e6-67fa408ea051';

        console.log('🔍 Nutritionist ID:', nutritionistId);

        // Probar la primera consulta
        console.log('\n📊 Probando consulta por tipo...');
        try {
            const expedientesPorTipo = await AppDataSource.query(`
                SELECT record.tipo_expediente as tipo, COUNT(*) as total
                FROM clinical_records record
                WHERE record.nutritionist_user_id = $1
                GROUP BY record.tipo_expediente
            `, [nutritionistId]);

            console.log('✅ Consulta por tipo exitosa:', expedientesPorTipo);
        } catch (error) {
            console.error('❌ Error en consulta por tipo:', error);
        }

        // Probar la segunda consulta
        console.log('\n📅 Probando consulta últimos 30 días...');
        try {
            const fecha = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
            const expedientesUltimos30Dias = await AppDataSource.query(`
                SELECT COUNT(*) as total
                FROM clinical_records record
                WHERE record.nutritionist_user_id = $1
                AND record.record_date >= $2
            `, [nutritionistId, fecha]);

            console.log('✅ Consulta últimos 30 días exitosa:', expedientesUltimos30Dias);
        } catch (error) {
            console.error('❌ Error en consulta últimos 30 días:', error);
        }

        // Verificar si hay registros en la tabla
        console.log('\n📈 Verificando registros en clinical_records...');
        try {
            const totalRecords = await AppDataSource.query(`
                SELECT COUNT(*) as total FROM clinical_records
            `);
            console.log('Total de registros:', totalRecords[0].total);

            const recordsForNutritionist = await AppDataSource.query(`
                SELECT COUNT(*) as total 
                FROM clinical_records 
                WHERE nutritionist_user_id = $1
            `, [nutritionistId]);
            console.log('Registros para este nutriólogo:', recordsForNutritionist[0].total);

            // Mostrar algunos registros de ejemplo
            const sampleRecords = await AppDataSource.query(`
                SELECT id, record_date, tipo_expediente, nutritionist_user_id
                FROM clinical_records 
                LIMIT 5
            `);
            console.log('Registros de ejemplo:', sampleRecords);
        } catch (error) {
            console.error('❌ Error verificando registros:', error);
        }

        await AppDataSource.destroy();
        console.log('\n🎉 Prueba completada');
    } catch (error) {
        console.error('❌ Error durante la prueba:', error);
        process.exit(1);
    }
}

testSeguimientoStats(); 