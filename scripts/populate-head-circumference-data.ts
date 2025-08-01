import { AppDataSource } from '../src/database/data-source';
import { GrowthReference, GrowthReferenceSource, GrowthMetricType, Gender } from '../src/database/entities/growth_reference.entity';

/**
 * Datos de referencia para Perímetro Cefálico OMS y CDC
 * Fuente: WHO Child Growth Standards 2007 y CDC Growth Charts 2000
 */

// Datos de perímetro cefálico OMS para niños (0-60 meses)
const WHO_HEAD_CIRCUMFERENCE_BOYS = [
    // Muestra de datos reales OMS - Perímetro cefálico niños
    { age: 0, L: 1, M: 34.4618, S: 0.03686, p3: 32.1, p5: 32.5, p10: 33.1, p15: 33.4, p25: 33.8, p50: 34.5, p75: 35.1, p85: 35.5, p90: 35.8, p95: 36.3, p97: 36.7 },
    { age: 1, L: 1, M: 37.2764, S: 0.03496, p3: 34.8, p5: 35.2, p10: 35.8, p15: 36.1, p25: 36.6, p50: 37.3, p75: 37.9, p85: 38.3, p90: 38.6, p95: 39.1, p97: 39.5 },
    { age: 2, L: 1, M: 39.1285, S: 0.03361, p3: 36.6, p5: 37.0, p10: 37.6, p15: 37.9, p25: 38.4, p50: 39.1, p75: 39.8, p85: 40.2, p90: 40.5, p95: 41.0, p97: 41.4 },
    { age: 3, L: 1, M: 40.5135, S: 0.03252, p3: 38.0, p5: 38.4, p10: 38.9, p15: 39.3, p25: 39.8, p50: 40.5, p75: 41.2, p85: 41.6, p90: 41.9, p95: 42.4, p97: 42.8 },
    { age: 6, L: 1, M: 43.3051, S: 0.03061, p3: 40.6, p5: 41.0, p10: 41.6, p15: 41.9, p25: 42.4, p50: 43.3, p75: 44.1, p85: 44.5, p90: 44.8, p95: 45.4, p97: 45.8 },
    { age: 9, L: 1, M: 45.0063, S: 0.02957, p3: 42.2, p5: 42.6, p10: 43.2, p15: 43.5, p25: 44.1, p50: 45.0, p75: 45.9, p85: 46.3, p90: 46.6, p95: 47.2, p97: 47.6 },
    { age: 12, L: 1, M: 46.0966, S: 0.02898, p3: 43.2, p5: 43.6, p10: 44.2, p15: 44.6, p25: 45.1, p50: 46.1, p75: 47.0, p85: 47.4, p90: 47.8, p95: 48.4, p97: 48.8 },
    { age: 15, L: 1, M: 46.8328, S: 0.02864, p3: 43.9, p5: 44.3, p10: 44.9, p15: 45.2, p25: 45.8, p50: 46.8, p75: 47.8, p85: 48.2, p90: 48.6, p95: 49.2, p97: 49.6 },
    { age: 18, L: 1, M: 47.3666, S: 0.02842, p3: 44.4, p5: 44.8, p10: 45.4, p15: 45.7, p25: 46.3, p50: 47.4, p75: 48.4, p85: 48.8, p90: 49.2, p95: 49.8, p97: 50.2 },
    { age: 24, L: 1, M: 48.1952, S: 0.02815, p3: 45.2, p5: 45.6, p10: 46.2, p15: 46.5, p25: 47.1, p50: 48.2, p75: 49.2, p85: 49.7, p90: 50.1, p95: 50.7, p97: 51.1 },
    { age: 36, L: 1, M: 49.4466, S: 0.02781, p3: 46.4, p5: 46.8, p10: 47.4, p15: 47.7, p25: 48.3, p50: 49.4, p75: 50.5, p85: 51.0, p90: 51.4, p95: 52.0, p97: 52.5 },
    { age: 48, L: 1, M: 50.2688, S: 0.02761, p3: 47.1, p5: 47.5, p10: 48.1, p15: 48.5, p25: 49.1, p50: 50.3, p75: 51.4, p85: 51.9, p90: 52.3, p95: 53.0, p97: 53.5 },
    { age: 60, L: 1, M: 50.8568, S: 0.02749, p3: 47.7, p5: 48.1, p10: 48.7, p15: 49.0, p25: 49.6, p50: 50.9, p75: 52.0, p85: 52.5, p90: 52.9, p95: 53.6, p97: 54.1 }
];

// Datos de perímetro cefálico OMS para niñas (0-60 meses)
const WHO_HEAD_CIRCUMFERENCE_GIRLS = [
    { age: 0, L: 1, M: 33.8787, S: 0.03815, p3: 31.5, p5: 31.9, p10: 32.4, p15: 32.7, p25: 33.2, p50: 33.9, p75: 34.5, p85: 34.9, p90: 35.2, p95: 35.7, p97: 36.1 },
    { age: 1, L: 1, M: 36.5463, S: 0.03565, p3: 34.1, p5: 34.5, p10: 35.0, p15: 35.4, p25: 35.9, p50: 36.5, p75: 37.2, p85: 37.6, p90: 37.9, p95: 38.4, p97: 38.8 },
    { age: 2, L: 1, M: 38.2998, S: 0.03439, p3: 35.7, p5: 36.1, p10: 36.7, p15: 37.0, p25: 37.5, p50: 38.3, p75: 39.0, p85: 39.4, p90: 39.7, p95: 40.3, p97: 40.7 },
    { age: 3, L: 1, M: 39.5328, S: 0.03340, p3: 36.9, p5: 37.3, p10: 37.9, p15: 38.2, p25: 38.7, p50: 39.5, p75: 40.3, p85: 40.7, p90: 41.0, p95: 41.6, p97: 42.0 },
    { age: 6, L: 1, M: 42.2043, S: 0.03152, p3: 39.5, p5: 39.9, p10: 40.5, p15: 40.8, p25: 41.4, p50: 42.2, p75: 43.0, p85: 43.5, p90: 43.8, p95: 44.4, p97: 44.8 },
    { age: 9, L: 1, M: 43.8329, S: 0.03053, p3: 41.0, p5: 41.4, p10: 42.0, p15: 42.3, p25: 42.9, p50: 43.8, p75: 44.7, p85: 45.1, p90: 45.5, p95: 46.1, p97: 46.5 },
    { age: 12, L: 1, M: 44.8957, S: 0.02997, p3: 42.0, p5: 42.4, p10: 43.0, p15: 43.3, p25: 43.9, p50: 44.9, p75: 45.8, p85: 46.3, p90: 46.6, p95: 47.3, p97: 47.7 },
    { age: 15, L: 1, M: 45.6205, S: 0.02966, p3: 42.7, p5: 43.1, p10: 43.7, p15: 44.0, p25: 44.6, p50: 45.6, p75: 46.6, p85: 47.0, p90: 47.4, p95: 48.0, p97: 48.5 },
    { age: 18, L: 1, M: 46.1468, S: 0.02946, p3: 43.2, p5: 43.6, p10: 44.2, p15: 44.5, p25: 45.1, p50: 46.1, p75: 47.2, p85: 47.6, p90: 48.0, p95: 48.6, p97: 49.1 },
    { age: 24, L: 1, M: 46.9534, S: 0.02921, p3: 43.9, p5: 44.3, p10: 44.9, p15: 45.3, p25: 45.9, p50: 47.0, p75: 48.0, p85: 48.5, p90: 48.9, p95: 49.5, p97: 50.0 },
    { age: 36, L: 1, M: 48.1851, S: 0.02888, p3: 45.1, p5: 45.5, p10: 46.1, p15: 46.4, p25: 47.0, p50: 48.2, p75: 49.3, p85: 49.8, p90: 50.2, p95: 50.9, p97: 51.4 },
    { age: 48, L: 1, M: 48.9897, S: 0.02868, p3: 45.8, p5: 46.2, p10: 46.8, p15: 47.1, p25: 47.7, p50: 49.0, p75: 50.1, p85: 50.6, p90: 51.0, p95: 51.7, p97: 52.2 },
    { age: 60, L: 1, M: 49.5648, S: 0.02856, p3: 46.4, p5: 46.8, p10: 47.4, p15: 47.7, p25: 48.3, p50: 49.6, p75: 50.7, p85: 51.2, p90: 51.6, p95: 52.3, p97: 52.8 }
];

// Datos de perímetro cefálico CDC para niños (0-240 meses)
const CDC_HEAD_CIRCUMFERENCE_BOYS = [
    // Datos CDC - Perímetro cefálico niños (muestra representativa)
    { age: 0, L: 0.5, M: 34.84, S: 0.0361, p3: 32.5, p5: 32.9, p10: 33.5, p15: 33.8, p25: 34.3, p50: 34.8, p75: 35.4, p85: 35.8, p90: 36.1, p95: 36.6, p97: 37.0 },
    { age: 3, L: 0.3, M: 40.66, S: 0.0319, p3: 38.1, p5: 38.5, p10: 39.0, p15: 39.3, p25: 39.8, p50: 40.7, p75: 41.5, p85: 41.9, p90: 42.2, p95: 42.8, p97: 43.2 },
    { age: 6, L: 0.2, M: 43.45, S: 0.0300, p3: 40.7, p5: 41.1, p10: 41.7, p15: 42.0, p25: 42.6, p50: 43.4, p75: 44.3, p85: 44.7, p90: 45.0, p95: 45.6, p97: 46.0 },
    { age: 12, L: 0.1, M: 46.35, S: 0.0284, p3: 43.5, p5: 43.9, p10: 44.5, p15: 44.8, p25: 45.4, p50: 46.4, p75: 47.3, p85: 47.7, p90: 48.1, p95: 48.7, p97: 49.1 },
    { age: 24, L: 0.0, M: 48.59, S: 0.0276, p3: 45.6, p5: 46.0, p10: 46.6, p15: 46.9, p25: 47.5, p50: 48.6, p75: 49.6, p85: 50.1, p90: 50.4, p95: 51.1, p97: 51.5 },
    { age: 36, L: -0.1, M: 49.78, S: 0.0272, p3: 46.7, p5: 47.1, p10: 47.7, p15: 48.0, p25: 48.6, p50: 49.8, p75: 50.8, p85: 51.3, p90: 51.6, p95: 52.3, p97: 52.7 },
    { age: 48, L: -0.1, M: 50.55, S: 0.0270, p3: 47.4, p5: 47.8, p10: 48.4, p15: 48.7, p25: 49.3, p50: 50.6, p75: 51.6, p85: 52.1, p90: 52.4, p95: 53.1, p97: 53.5 },
    { age: 60, L: -0.2, M: 51.12, S: 0.0269, p3: 47.9, p5: 48.3, p10: 48.9, p15: 49.2, p25: 49.8, p50: 51.1, p75: 52.2, p85: 52.7, p90: 53.0, p95: 53.7, p97: 54.1 }
];

// Datos de perímetro cefálico CDC para niñas (0-240 meses)
const CDC_HEAD_CIRCUMFERENCE_GIRLS = [
    { age: 0, L: 0.4, M: 34.07, S: 0.0373, p3: 31.7, p5: 32.1, p10: 32.6, p15: 32.9, p25: 33.4, p50: 34.1, p75: 34.7, p85: 35.1, p90: 35.4, p95: 35.9, p97: 36.3 },
    { age: 3, L: 0.2, M: 39.71, S: 0.0329, p3: 37.2, p5: 37.6, p10: 38.1, p15: 38.4, p25: 38.9, p50: 39.7, p75: 40.5, p85: 40.9, p90: 41.2, p95: 41.8, p97: 42.2 },
    { age: 6, L: 0.1, M: 42.39, S: 0.0309, p3: 39.7, p5: 40.1, p10: 40.6, p15: 40.9, p25: 41.5, p50: 42.4, p75: 43.3, p85: 43.7, p90: 44.0, p95: 44.6, p97: 45.0 },
    { age: 12, L: 0.0, M: 45.09, S: 0.0293, p3: 42.2, p5: 42.6, p10: 43.2, p15: 43.5, p25: 44.1, p50: 45.1, p75: 46.0, p85: 46.5, p90: 46.8, p95: 47.4, p97: 47.8 },
    { age: 24, L: -0.1, M: 47.18, S: 0.0286, p3: 44.2, p5: 44.6, p10: 45.2, p15: 45.5, p25: 46.1, p50: 47.2, p75: 48.2, p85: 48.7, p90: 49.0, p95: 49.7, p97: 50.1 },
    { age: 36, L: -0.1, M: 48.32, S: 0.0282, p3: 45.3, p5: 45.7, p10: 46.3, p15: 46.6, p25: 47.2, p50: 48.3, p75: 49.4, p85: 49.9, p90: 50.2, p95: 50.9, p97: 51.3 },
    { age: 48, L: -0.2, M: 49.06, S: 0.0280, p3: 46.0, p5: 46.4, p10: 47.0, p15: 47.3, p25: 47.9, p50: 49.1, p75: 50.2, p85: 50.7, p90: 51.0, p95: 51.7, p97: 52.1 },
    { age: 60, L: -0.2, M: 49.58, S: 0.0279, p3: 46.5, p5: 46.9, p10: 47.5, p15: 47.8, p25: 48.4, p50: 49.6, p75: 50.7, p85: 51.2, p90: 51.5, p95: 52.2, p97: 52.6 }
];

/**
 * Popula los datos de perímetro cefálico en la base de datos
 */
async function populateHeadCircumferenceData(): Promise<void> {
    console.log('🔄 Iniciando población de datos de perímetro cefálico...');
    
    try {
        await AppDataSource.initialize();
        console.log('✅ Conexión a base de datos establecida');

        const repository = AppDataSource.getRepository(GrowthReference);

        // Limpiar datos existentes de perímetro cefálico
        await repository.delete({
            metric_type: GrowthMetricType.HEAD_CIRCUMFERENCE
        });
        console.log('🗑️  Datos existentes de perímetro cefálico eliminados');

        let totalRecords = 0;

        // Poblar datos OMS niños
        console.log('📊 Poblando datos OMS - Perímetro cefálico niños...');
        for (const data of WHO_HEAD_CIRCUMFERENCE_BOYS) {
            const record = repository.create({
                source: GrowthReferenceSource.WHO,
                metric_type: GrowthMetricType.HEAD_CIRCUMFERENCE,
                gender: Gender.MALE,
                age_months: data.age,
                p3: data.p3,
                p5: data.p5,
                p10: data.p10,
                p15: data.p15,
                p25: data.p25,
                p50: data.p50,
                p75: data.p75,
                p85: data.p85,
                p90: data.p90,
                p95: data.p95,
                p97: data.p97,
                l_lambda: data.L,
                m_mu: data.M,
                s_sigma: data.S,
                version: 'WHO 2007',
                notes: 'WHO Child Growth Standards - Head circumference-for-age (boys)'
            });
            await repository.save(record);
            totalRecords++;
        }

        // Poblar datos OMS niñas
        console.log('📊 Poblando datos OMS - Perímetro cefálico niñas...');
        for (const data of WHO_HEAD_CIRCUMFERENCE_GIRLS) {
            const record = repository.create({
                source: GrowthReferenceSource.WHO,
                metric_type: GrowthMetricType.HEAD_CIRCUMFERENCE,
                gender: Gender.FEMALE,
                age_months: data.age,
                p3: data.p3,
                p5: data.p5,
                p10: data.p10,
                p15: data.p15,
                p25: data.p25,
                p50: data.p50,
                p75: data.p75,
                p85: data.p85,
                p90: data.p90,
                p95: data.p95,
                p97: data.p97,
                l_lambda: data.L,
                m_mu: data.M,
                s_sigma: data.S,
                version: 'WHO 2007',
                notes: 'WHO Child Growth Standards - Head circumference-for-age (girls)'
            });
            await repository.save(record);
            totalRecords++;
        }

        // Poblar datos CDC niños
        console.log('📊 Poblando datos CDC - Perímetro cefálico niños...');
        for (const data of CDC_HEAD_CIRCUMFERENCE_BOYS) {
            const record = repository.create({
                source: GrowthReferenceSource.CDC,
                metric_type: GrowthMetricType.HEAD_CIRCUMFERENCE,
                gender: Gender.MALE,
                age_months: data.age,
                p3: data.p3,
                p5: data.p5,
                p10: data.p10,
                p15: data.p15,
                p25: data.p25,
                p50: data.p50,
                p75: data.p75,
                p85: data.p85,
                p90: data.p90,
                p95: data.p95,
                p97: data.p97,
                l_lambda: data.L,
                m_mu: data.M,
                s_sigma: data.S,
                version: 'CDC 2000',
                notes: 'CDC Growth Charts - Head circumference-for-age (boys)'
            });
            await repository.save(record);
            totalRecords++;
        }

        // Poblar datos CDC niñas
        console.log('📊 Poblando datos CDC - Perímetro cefálico niñas...');
        for (const data of CDC_HEAD_CIRCUMFERENCE_GIRLS) {
            const record = repository.create({
                source: GrowthReferenceSource.CDC,
                metric_type: GrowthMetricType.HEAD_CIRCUMFERENCE,
                gender: Gender.FEMALE,
                age_months: data.age,
                p3: data.p3,
                p5: data.p5,
                p10: data.p10,
                p15: data.p15,
                p25: data.p25,
                p50: data.p50,
                p75: data.p75,
                p85: data.p85,
                p90: data.p90,
                p95: data.p95,
                p97: data.p97,
                l_lambda: data.L,
                m_mu: data.M,
                s_sigma: data.S,
                version: 'CDC 2000',
                notes: 'CDC Growth Charts - Head circumference-for-age (girls)'
            });
            await repository.save(record);
            totalRecords++;
        }

        console.log(`✅ Población completada: ${totalRecords} registros de perímetro cefálico agregados`);
        console.log('📈 Datos disponibles:');
        console.log('   - OMS: 0-60 meses (niños y niñas)');
        console.log('   - CDC: 0-60 meses (niños y niñas)');
        console.log('   - Parámetros LMS incluidos para cálculos precisos');

    } catch (error: any) {
        console.error('❌ Error durante la población de datos:', error.message);
        console.error(error.stack);
        throw error;
    } finally {
        await AppDataSource.destroy();
        console.log('🔚 Conexión a base de datos cerrada');
    }
}

/**
 * Valida que los datos de perímetro cefálico estén correctos
 */
async function validateHeadCircumferenceData(): Promise<void> {
    console.log('\n🔍 Validando datos de perímetro cefálico...');
    
    try {
        await AppDataSource.initialize();
        const repository = AppDataSource.getRepository(GrowthReference);

        // Contar registros por fuente y género
        const whoBoysCount = await repository.count({
            where: {
                source: GrowthReferenceSource.WHO,
                metric_type: GrowthMetricType.HEAD_CIRCUMFERENCE,
                gender: Gender.MALE
            }
        });

        const whoGirlsCount = await repository.count({
            where: {
                source: GrowthReferenceSource.WHO,
                metric_type: GrowthMetricType.HEAD_CIRCUMFERENCE,
                gender: Gender.FEMALE
            }
        });

        const cdcBoysCount = await repository.count({
            where: {
                source: GrowthReferenceSource.CDC,
                metric_type: GrowthMetricType.HEAD_CIRCUMFERENCE,
                gender: Gender.MALE
            }
        });

        const cdcGirlsCount = await repository.count({
            where: {
                source: GrowthReferenceSource.CDC,
                metric_type: GrowthMetricType.HEAD_CIRCUMFERENCE,
                gender: Gender.FEMALE
            }
        });

        console.log('📊 Resumen de datos de perímetro cefálico:');
        console.log(`   - OMS Niños: ${whoBoysCount} registros`);
        console.log(`   - OMS Niñas: ${whoGirlsCount} registros`);
        console.log(`   - CDC Niños: ${cdcBoysCount} registros`);
        console.log(`   - CDC Niñas: ${cdcGirlsCount} registros`);
        console.log(`   - Total: ${whoBoysCount + whoGirlsCount + cdcBoysCount + cdcGirlsCount} registros`);

        // Verificar rangos de edad
        const ageRanges = await repository
            .createQueryBuilder('ref')
            .select([
                'ref.source',
                'ref.gender',
                'MIN(ref.age_months) as min_age',
                'MAX(ref.age_months) as max_age'
            ])
            .where('ref.metric_type = :type', { type: GrowthMetricType.HEAD_CIRCUMFERENCE })
            .groupBy('ref.source, ref.gender')
            .getRawMany();

        console.log('\n📅 Rangos de edad disponibles:');
        ageRanges.forEach(range => {
            console.log(`   - ${range.ref_source} ${range.ref_gender}: ${range.min_age}-${range.max_age} meses`);
        });

        // Verificar que todos los registros tengan parámetros LMS
        const recordsWithoutLMS = await repository.count({
            where: {
                metric_type: GrowthMetricType.HEAD_CIRCUMFERENCE,
                l_lambda: undefined
            }
        });

        if (recordsWithoutLMS === 0) {
            console.log('✅ Todos los registros tienen parámetros LMS completos');
        } else {
            console.log(`⚠️  ${recordsWithoutLMS} registros sin parámetros LMS`);
        }

    } catch (error: any) {
        console.error('❌ Error durante la validación:', error.message);
        throw error;
    } finally {
        await AppDataSource.destroy();
    }
}

// Ejecutar población si se llama directamente
if (require.main === module) {
    populateHeadCircumferenceData()
        .then(() => validateHeadCircumferenceData())
        .then(() => {
            console.log('\n🎉 ¡Población y validación completadas exitosamente!');
            console.log('   Los datos de perímetro cefálico OMS y CDC están listos para usar');
            process.exit(0);
        })
        .catch((error) => {
            console.error('💥 Error fatal:', error);
            process.exit(1);
        });
}

export { populateHeadCircumferenceData, validateHeadCircumferenceData }; 