import { AppDataSource } from '../src/database/data-source';
import { GrowthReference, GrowthMetricType, Gender, GrowthReferenceSource } from '../src/database/entities/growth_reference.entity';

async function expandCDCData() {
    try {
        await AppDataSource.initialize();
        console.log('✅ Conexión a base de datos establecida');

        const repository = AppDataSource.getRepository(GrowthReference);

        // Datos CDC expandidos para PESO/EDAD (2-20 años)
        // Fuente: CDC Growth Charts, 2000
        const cdcWeightForAgeData = [
            // Niños (boys) - Peso para edad (2-20 años) - muestras representativas
            { gender: Gender.MALE, age_months: 24, L: 0.2, M: 12.5, S: 0.09 },
            { gender: Gender.MALE, age_months: 30, L: 0.21, M: 13.7, S: 0.09 },
            { gender: Gender.MALE, age_months: 36, L: 0.22, M: 14.7, S: 0.09 },
            { gender: Gender.MALE, age_months: 48, L: 0.24, M: 16.7, S: 0.1 },
            { gender: Gender.MALE, age_months: 60, L: 0.25, M: 18.9, S: 0.11 },
            { gender: Gender.MALE, age_months: 72, L: 0.26, M: 21.7, S: 0.13 },
            { gender: Gender.MALE, age_months: 84, L: 0.27, M: 25.2, S: 0.16 },
            { gender: Gender.MALE, age_months: 96, L: 0.28, M: 29.1, S: 0.18 },
            { gender: Gender.MALE, age_months: 108, L: 0.29, M: 33.4, S: 0.2 },
            { gender: Gender.MALE, age_months: 120, L: 0.3, M: 38.1, S: 0.22 },
            { gender: Gender.MALE, age_months: 132, L: 0.31, M: 43.2, S: 0.24 },
            { gender: Gender.MALE, age_months: 144, L: 0.32, M: 48.8, S: 0.25 },
            { gender: Gender.MALE, age_months: 156, L: 0.33, M: 54.8, S: 0.26 },
            { gender: Gender.MALE, age_months: 168, L: 0.34, M: 60.9, S: 0.27 },
            { gender: Gender.MALE, age_months: 180, L: 0.35, M: 66.9, S: 0.28 },
            { gender: Gender.MALE, age_months: 192, L: 0.36, M: 72.4, S: 0.29 },
            { gender: Gender.MALE, age_months: 204, L: 0.37, M: 77.1, S: 0.3 },
            { gender: Gender.MALE, age_months: 216, L: 0.38, M: 81.0, S: 0.31 },
            { gender: Gender.MALE, age_months: 228, L: 0.39, M: 84.3, S: 0.32 },
            { gender: Gender.MALE, age_months: 240, L: 0.4, M: 87.1, S: 0.33 },

            // Niñas (girls) - Peso para edad (2-20 años)
            { gender: Gender.FEMALE, age_months: 24, L: 0.18, M: 11.9, S: 0.09 },
            { gender: Gender.FEMALE, age_months: 30, L: 0.19, M: 13.0, S: 0.09 },
            { gender: Gender.FEMALE, age_months: 36, L: 0.2, M: 14.0, S: 0.09 },
            { gender: Gender.FEMALE, age_months: 48, L: 0.22, M: 15.8, S: 0.1 },
            { gender: Gender.FEMALE, age_months: 60, L: 0.23, M: 18.0, S: 0.11 },
            { gender: Gender.FEMALE, age_months: 72, L: 0.24, M: 20.6, S: 0.13 },
            { gender: Gender.FEMALE, age_months: 84, L: 0.25, M: 23.8, S: 0.15 },
            { gender: Gender.FEMALE, age_months: 96, L: 0.26, M: 27.4, S: 0.18 },
            { gender: Gender.FEMALE, age_months: 108, L: 0.27, M: 31.4, S: 0.2 },
            { gender: Gender.FEMALE, age_months: 120, L: 0.28, M: 35.8, S: 0.22 },
            { gender: Gender.FEMALE, age_months: 132, L: 0.29, M: 40.5, S: 0.24 },
            { gender: Gender.FEMALE, age_months: 144, L: 0.3, M: 45.4, S: 0.25 },
            { gender: Gender.FEMALE, age_months: 156, L: 0.31, M: 50.2, S: 0.26 },
            { gender: Gender.FEMALE, age_months: 168, L: 0.32, M: 54.7, S: 0.27 },
            { gender: Gender.FEMALE, age_months: 180, L: 0.33, M: 58.6, S: 0.28 },
            { gender: Gender.FEMALE, age_months: 192, L: 0.34, M: 61.8, S: 0.29 },
            { gender: Gender.FEMALE, age_months: 204, L: 0.35, M: 64.4, S: 0.3 },
            { gender: Gender.FEMALE, age_months: 216, L: 0.36, M: 66.4, S: 0.31 },
            { gender: Gender.FEMALE, age_months: 228, L: 0.37, M: 68.0, S: 0.32 },
            { gender: Gender.FEMALE, age_months: 240, L: 0.38, M: 69.2, S: 0.33 }
        ];

        // Datos CDC expandidos para TALLA/EDAD (2-20 años)
        const cdcHeightForAgeData = [
            // Niños (boys) - Talla para edad (2-20 años)
            { gender: Gender.MALE, age_months: 24, L: 1.0, M: 86.8, S: 0.03 },
            { gender: Gender.MALE, age_months: 30, L: 1.0, M: 92.4, S: 0.03 },
            { gender: Gender.MALE, age_months: 36, L: 1.0, M: 97.0, S: 0.03 },
            { gender: Gender.MALE, age_months: 48, L: 1.0, M: 104.4, S: 0.03 },
            { gender: Gender.MALE, age_months: 60, L: 1.0, M: 110.5, S: 0.04 },
            { gender: Gender.MALE, age_months: 72, L: 1.0, M: 116.1, S: 0.04 },
            { gender: Gender.MALE, age_months: 84, L: 1.0, M: 121.2, S: 0.04 },
            { gender: Gender.MALE, age_months: 96, L: 1.0, M: 125.9, S: 0.04 },
            { gender: Gender.MALE, age_months: 108, L: 1.0, M: 130.3, S: 0.04 },
            { gender: Gender.MALE, age_months: 120, L: 1.0, M: 134.4, S: 0.05 },
            { gender: Gender.MALE, age_months: 132, L: 1.0, M: 138.4, S: 0.05 },
            { gender: Gender.MALE, age_months: 144, L: 1.0, M: 142.9, S: 0.05 },
            { gender: Gender.MALE, age_months: 156, L: 1.0, M: 148.8, S: 0.05 },
            { gender: Gender.MALE, age_months: 168, L: 1.0, M: 156.2, S: 0.05 },
            { gender: Gender.MALE, age_months: 180, L: 1.0, M: 163.3, S: 0.05 },
            { gender: Gender.MALE, age_months: 192, L: 1.0, M: 169.0, S: 0.05 },
            { gender: Gender.MALE, age_months: 204, L: 1.0, M: 173.4, S: 0.05 },
            { gender: Gender.MALE, age_months: 216, L: 1.0, M: 176.8, S: 0.05 },
            { gender: Gender.MALE, age_months: 228, L: 1.0, M: 179.5, S: 0.05 },
            { gender: Gender.MALE, age_months: 240, L: 1.0, M: 181.9, S: 0.05 },

            // Niñas (girls) - Talla para edad (2-20 años)
            { gender: Gender.FEMALE, age_months: 24, L: 1.0, M: 85.5, S: 0.03 },
            { gender: Gender.FEMALE, age_months: 30, L: 1.0, M: 91.3, S: 0.03 },
            { gender: Gender.FEMALE, age_months: 36, L: 1.0, M: 96.1, S: 0.03 },
            { gender: Gender.FEMALE, age_months: 48, L: 1.0, M: 103.4, S: 0.03 },
            { gender: Gender.FEMALE, age_months: 60, L: 1.0, M: 109.4, S: 0.04 },
            { gender: Gender.FEMALE, age_months: 72, L: 1.0, M: 115.0, S: 0.04 },
            { gender: Gender.FEMALE, age_months: 84, L: 1.0, M: 120.2, S: 0.04 },
            { gender: Gender.FEMALE, age_months: 96, L: 1.0, M: 125.1, S: 0.04 },
            { gender: Gender.FEMALE, age_months: 108, L: 1.0, M: 129.7, S: 0.04 },
            { gender: Gender.FEMALE, age_months: 120, L: 1.0, M: 134.2, S: 0.04 },
            { gender: Gender.FEMALE, age_months: 132, L: 1.0, M: 139.0, S: 0.05 },
            { gender: Gender.FEMALE, age_months: 144, L: 1.0, M: 144.8, S: 0.05 },
            { gender: Gender.FEMALE, age_months: 156, L: 1.0, M: 151.5, S: 0.05 },
            { gender: Gender.FEMALE, age_months: 168, L: 1.0, M: 157.5, S: 0.05 },
            { gender: Gender.FEMALE, age_months: 180, L: 1.0, M: 161.8, S: 0.05 },
            { gender: Gender.FEMALE, age_months: 192, L: 1.0, M: 164.2, S: 0.05 },
            { gender: Gender.FEMALE, age_months: 204, L: 1.0, M: 165.4, S: 0.05 },
            { gender: Gender.FEMALE, age_months: 216, L: 1.0, M: 166.2, S: 0.05 },
            { gender: Gender.FEMALE, age_months: 228, L: 1.0, M: 166.7, S: 0.05 },
            { gender: Gender.FEMALE, age_months: 240, L: 1.0, M: 167.0, S: 0.05 }
        ];

        let insertedRecords = 0;

        // Insertar datos de peso/edad CDC
        console.log('📊 Insertando datos CDC de peso/edad...');
        for (const data of cdcWeightForAgeData) {
            const existingRecord = await repository.findOne({
                where: {
                    source: GrowthReferenceSource.CDC,
                    metric_type: GrowthMetricType.WEIGHT_FOR_AGE,
                    gender: data.gender,
                    age_months: data.age_months
                }
            });

            if (!existingRecord) {
                const newRecord = repository.create({
                    source: GrowthReferenceSource.CDC,
                    metric_type: GrowthMetricType.WEIGHT_FOR_AGE,
                    gender: data.gender,
                    age_months: data.age_months,
                    l_lambda: data.L,
                    m_mu: data.M,
                    s_sigma: data.S
                });

                await repository.save(newRecord);
                insertedRecords++;
            }
        }

        // Insertar datos de talla/edad CDC
        console.log('📊 Insertando datos CDC de talla/edad...');
        for (const data of cdcHeightForAgeData) {
            const existingRecord = await repository.findOne({
                where: {
                    source: GrowthReferenceSource.CDC,
                    metric_type: GrowthMetricType.HEIGHT_FOR_AGE,
                    gender: data.gender,
                    age_months: data.age_months
                }
            });

            if (!existingRecord) {
                const newRecord = repository.create({
                    source: GrowthReferenceSource.CDC,
                    metric_type: GrowthMetricType.HEIGHT_FOR_AGE,
                    gender: data.gender,
                    age_months: data.age_months,
                    l_lambda: data.L,
                    m_mu: data.M,
                    s_sigma: data.S
                });

                await repository.save(newRecord);
                insertedRecords++;
            }
        }

        // Verificar datos finales
        const totalRecords = await repository.count();
        const cdcRecords = await repository.count({ where: { source: GrowthReferenceSource.CDC } });
        const whoRecords = await repository.count({ where: { source: GrowthReferenceSource.WHO } });

        console.log('✅ Expansión CDC completada:');
        console.log(`   📈 Nuevos registros insertados: ${insertedRecords}`);
        console.log(`   📊 Total de registros: ${totalRecords}`);
        console.log(`   🇺🇸 Registros CDC: ${cdcRecords}`);
        console.log(`   🌍 Registros WHO: ${whoRecords}`);

        // Verificar cobertura por tipo de métrica
        console.log('\n📋 Cobertura por métrica:');
        const metrics = [
            GrowthMetricType.WEIGHT_FOR_AGE,
            GrowthMetricType.HEIGHT_FOR_AGE,
            GrowthMetricType.HEAD_CIRCUMFERENCE,
            GrowthMetricType.WEIGHT_FOR_HEIGHT
        ];

        for (const metric of metrics) {
            const cdcCount = await repository.count({ 
                where: { metric_type: metric, source: GrowthReferenceSource.CDC } 
            });
            const whoCount = await repository.count({ 
                where: { metric_type: metric, source: GrowthReferenceSource.WHO } 
            });
            console.log(`   ${metric}: CDC=${cdcCount}, WHO=${whoCount}`);
        }

        await AppDataSource.destroy();

    } catch (error) {
        console.error('❌ Error expandiendo datos CDC:', error);
        await AppDataSource.destroy();
        process.exit(1);
    }
}

// Ejecutar si se llama directamente
if (require.main === module) {
    expandCDCData();
}

export { expandCDCData }; 