// scripts/populate-growth-references.ts
import { AppDataSource } from '../src/database/data-source';
import { GrowthReference, GrowthReferenceSource, GrowthMetricType, Gender } from '../src/database/entities/growth_reference.entity';

// Datos de muestra de la OMS para peso/edad (niños 0-60 meses)
// En producción, estos datos se obtendrían de las tablas oficiales de la OMS
const WHO_WEIGHT_FOR_AGE_BOYS = [
    // Cada objeto representa un mes de edad con sus percentiles
    { ageMonths: 0, p3: 2.5, p5: 2.6, p10: 2.8, p15: 2.9, p25: 3.1, p50: 3.3, p75: 3.6, p85: 3.8, p90: 3.9, p95: 4.2, p97: 4.4, l: 0.3487, m: 3.3464, s: 0.14602 },
    { ageMonths: 1, p3: 3.4, p5: 3.6, p10: 3.8, p15: 4.0, p25: 4.3, p50: 4.5, p75: 4.9, p85: 5.1, p90: 5.3, p95: 5.7, p97: 5.9, l: 0.2581, m: 4.4709, s: 0.13395 },
    { ageMonths: 2, p3: 4.3, p5: 4.5, p10: 4.7, p15: 4.9, p25: 5.2, p50: 5.6, p75: 6.0, p85: 6.3, p90: 6.5, p95: 6.9, p97: 7.1, l: 0.2257, m: 5.5675, s: 0.12619 },
    { ageMonths: 3, p3: 5.0, p5: 5.2, p10: 5.5, p15: 5.7, p25: 6.0, p50: 6.4, p75: 6.9, p85: 7.2, p90: 7.4, p95: 7.9, p97: 8.2, l: 0.2084, m: 6.3762, s: 0.11986 },
    { ageMonths: 6, p3: 6.1, p5: 6.4, p10: 6.7, p15: 6.9, p25: 7.3, p50: 7.9, p75: 8.5, p85: 8.9, p90: 9.2, p95: 9.8, p97: 10.2, l: 0.1738, m: 7.9340, s: 0.11316 },
    { ageMonths: 12, p3: 7.7, p5: 8.0, p10: 8.4, p15: 8.7, p25: 9.2, p50: 9.9, p75: 10.8, p85: 11.3, p90: 11.7, p95: 12.4, p97: 12.9, l: 0.1395, m: 9.9085, s: 0.10958 },
    { ageMonths: 24, p3: 9.7, p5: 10.2, p10: 10.7, p15: 11.1, p25: 11.8, p50: 12.9, p75: 14.2, p85: 15.0, p90: 15.5, p95: 16.5, p97: 17.2, l: 0.1134, m: 12.8761, s: 0.10497 },
    { ageMonths: 36, p3: 11.3, p5: 11.9, p10: 12.5, p15: 13.0, p25: 13.8, p50: 15.2, p75: 16.9, p85: 17.9, p90: 18.6, p95: 19.9, p97: 20.7, l: 0.0968, m: 15.2301, s: 0.10152 },
    { ageMonths: 48, p3: 12.7, p5: 13.4, p10: 14.1, p15: 14.7, p25: 15.7, p50: 17.4, p75: 19.4, p85: 20.7, p90: 21.6, p95: 23.2, p97: 24.2, l: 0.0844, m: 17.4182, s: 0.09901 },
    { ageMonths: 60, p3: 14.1, p5: 14.9, p10: 15.8, p15: 16.5, p25: 17.7, p50: 19.7, p75: 22.2, p85: 23.7, p90: 24.8, p95: 26.7, p97: 27.9, l: 0.0740, m: 19.6947, s: 0.09718 }
];

// Datos de muestra de la OMS para peso/edad (niñas 0-60 meses)
const WHO_WEIGHT_FOR_AGE_GIRLS = [
    { ageMonths: 0, p3: 2.4, p5: 2.5, p10: 2.7, p15: 2.8, p25: 3.0, p50: 3.2, p75: 3.5, p85: 3.7, p90: 3.8, p95: 4.1, p97: 4.2, l: 0.3809, m: 3.2322, s: 0.14171 },
    { ageMonths: 1, p3: 3.2, p5: 3.4, p10: 3.6, p15: 3.8, p25: 4.0, p50: 4.2, p75: 4.5, p85: 4.7, p90: 4.8, p95: 5.1, p97: 5.3, l: 0.2986, m: 4.1873, s: 0.13724 },
    { ageMonths: 2, p3: 4.0, p5: 4.2, p10: 4.5, p15: 4.7, p25: 4.9, p50: 5.1, p75: 5.5, p85: 5.7, p90: 5.9, p95: 6.2, p97: 6.4, l: 0.2581, m: 5.1282, s: 0.13000 },
    { ageMonths: 3, p3: 4.7, p5: 4.9, p10: 5.2, p15: 5.4, p25: 5.7, p50: 6.0, p75: 6.4, p85: 6.7, p90: 6.9, p95: 7.2, p97: 7.5, l: 0.2306, m: 5.9458, s: 0.12385 },
    { ageMonths: 6, p3: 5.7, p5: 6.0, p10: 6.3, p15: 6.5, p25: 6.9, p50: 7.3, p75: 7.8, p85: 8.2, p90: 8.4, p95: 8.9, p97: 9.2, l: 0.1849, m: 7.2970, s: 0.11474 },
    { ageMonths: 12, p3: 7.0, p5: 7.3, p10: 7.7, p15: 8.0, p25: 8.5, p50: 9.0, p75: 9.8, p85: 10.2, p90: 10.5, p95: 11.2, p97: 11.5, l: 0.1317, m: 9.0360, s: 0.10996 },
    { ageMonths: 24, p3: 8.7, p5: 9.2, p10: 9.7, p15: 10.1, p25: 10.8, p50: 11.9, p75: 13.1, p85: 13.9, p90: 14.4, p95: 15.4, p97: 16.0, l: 0.0966, m: 11.9434, s: 0.10433 },
    { ageMonths: 36, p3: 10.2, p5: 10.8, p10: 11.4, p15: 11.9, p25: 12.7, p50: 14.1, p75: 15.8, p85: 16.8, p90: 17.5, p95: 18.8, p97: 19.6, l: 0.0752, m: 14.1303, s: 0.10064 },
    { ageMonths: 48, p3: 11.6, p5: 12.3, p10: 13.0, p15: 13.6, p25: 14.6, p50: 16.4, p75: 18.5, p85: 19.8, p90: 20.7, p95: 22.3, p97: 23.4, l: 0.0608, m: 16.4228, s: 0.09715 },
    { ageMonths: 60, p3: 13.0, p5: 13.8, p10: 14.7, p15: 15.4, p25: 16.6, p50: 18.7, p75: 21.2, p85: 22.8, p90: 23.9, p95: 25.9, p97: 27.1, l: 0.0508, m: 18.6647, s: 0.09421 }
];

// Datos de muestra de la OMS para talla/edad (niños 0-60 meses)
const WHO_HEIGHT_FOR_AGE_BOYS = [
    { ageMonths: 0, p3: 46.1, p5: 46.8, p10: 47.8, p15: 48.4, p25: 49.4, p50: 50.5, p75: 51.7, p85: 52.4, p90: 52.9, p95: 53.7, p97: 54.2, l: 1, m: 50.5, s: 0.03647 },
    { ageMonths: 1, p3: 50.8, p5: 51.5, p10: 52.4, p15: 53.0, p25: 54.1, p50: 55.2, p75: 56.4, p85: 57.1, p90: 57.6, p95: 58.4, p97: 58.9, l: 1, m: 55.2, s: 0.03538 },
    { ageMonths: 2, p3: 54.4, p5: 55.2, p10: 56.2, p15: 56.8, p25: 57.9, p50: 59.1, p75: 60.3, p85: 61.0, p90: 61.5, p95: 62.4, p97: 62.9, l: 1, m: 59.1, s: 0.03424 },
    { ageMonths: 3, p3: 57.3, p5: 58.1, p10: 59.1, p15: 59.8, p25: 61.0, p50: 62.2, p75: 63.5, p85: 64.3, p90: 64.8, p95: 65.7, p97: 66.3, l: 1, m: 62.2, s: 0.03291 },
    { ageMonths: 6, p3: 63.3, p5: 64.2, p10: 65.2, p15: 66.0, p25: 67.2, p50: 68.6, p75: 70.0, p85: 70.8, p90: 71.4, p95: 72.4, p97: 73.0, l: 1, m: 68.6, s: 0.02980 },
    { ageMonths: 12, p3: 71.0, p5: 72.0, p10: 73.1, p15: 74.0, p25: 75.4, p50: 77.0, p75: 78.7, p85: 79.6, p90: 80.3, p95: 81.5, p97: 82.2, l: 1, m: 77.0, s: 0.02647 },
    { ageMonths: 24, p3: 82.3, p5: 83.5, p10: 85.0, p15: 86.0, p25: 87.7, p50: 89.9, p75: 92.2, p85: 93.4, p90: 94.2, p95: 95.8, p97: 96.7, l: 1, m: 89.9, s: 0.02488 },
    { ageMonths: 36, p3: 91.9, p5: 93.2, p10: 94.8, p15: 95.9, p25: 97.8, p50: 100.4, p75: 103.1, p85: 104.5, p90: 105.4, p95: 107.2, p97: 108.1, l: 1, m: 100.4, s: 0.02438 },
    { ageMonths: 48, p3: 100.7, p5: 102.1, p10: 103.9, p15: 105.1, p25: 107.2, p50: 110.0, p75: 113.0, p85: 114.6, p90: 115.6, p95: 117.6, p97: 118.6, l: 1, m: 110.0, s: 0.02423 },
    { ageMonths: 60, p3: 108.5, p5: 110.0, p10: 111.9, p15: 113.2, p25: 115.4, p50: 118.4, p75: 121.6, p85: 123.4, p90: 124.4, p95: 126.6, p97: 127.6, l: 1, m: 118.4, s: 0.02440 }
];

// Datos de muestra de la OMS para talla/edad (niñas 0-60 meses)
const WHO_HEIGHT_FOR_AGE_GIRLS = [
    { ageMonths: 0, p3: 45.4, p5: 46.1, p10: 47.1, p15: 47.7, p25: 48.7, p50: 49.8, p75: 51.0, p85: 51.7, p90: 52.2, p95: 53.0, p97: 53.5, l: 1, m: 49.8, s: 0.03686 },
    { ageMonths: 1, p3: 49.8, p5: 50.5, p10: 51.5, p15: 52.1, p25: 53.2, p50: 54.3, p75: 55.5, p85: 56.2, p90: 56.7, p95: 57.6, p97: 58.1, l: 1, m: 54.3, s: 0.03548 },
    { ageMonths: 2, p3: 53.0, p5: 53.8, p10: 54.8, p15: 55.4, p25: 56.6, p50: 57.8, p75: 59.1, p85: 59.8, p90: 60.4, p95: 61.3, p97: 61.8, l: 1, m: 57.8, s: 0.03436 },
    { ageMonths: 3, p3: 55.6, p5: 56.4, p10: 57.5, p15: 58.2, p25: 59.4, p50: 60.7, p75: 62.1, p85: 62.9, p90: 63.4, p95: 64.4, p97: 65.0, l: 1, m: 60.7, s: 0.03328 },
    { ageMonths: 6, p3: 61.2, p5: 62.1, p10: 63.2, p15: 64.0, p25: 65.3, p50: 66.8, p75: 68.3, p85: 69.1, p90: 69.7, p95: 70.8, p97: 71.4, l: 1, m: 66.8, s: 0.03064 },
    { ageMonths: 12, p3: 68.9, p5: 69.9, p10: 71.1, p15: 72.0, p25: 73.4, p50: 75.0, p75: 76.7, p85: 77.6, p90: 78.3, p95: 79.5, p97: 80.2, l: 1, m: 75.0, s: 0.02734 },
    { ageMonths: 24, p3: 80.0, p5: 81.2, p10: 82.7, p15: 83.7, p25: 85.4, p50: 87.6, p75: 89.9, p85: 91.1, p90: 91.9, p95: 93.6, p97: 94.5, l: 1, m: 87.6, s: 0.02573 },
    { ageMonths: 36, p3: 89.0, p5: 90.3, p10: 91.9, p15: 93.0, p25: 94.9, p50: 97.4, p75: 100.1, p85: 101.5, p90: 102.4, p95: 104.3, p97: 105.2, l: 1, m: 97.4, s: 0.02532 },
    { ageMonths: 48, p3: 97.1, p5: 98.5, p10: 100.3, p15: 101.5, p25: 103.6, p50: 106.4, p75: 109.4, p85: 111.0, p90: 112.0, p95: 114.1, p97: 115.1, l: 1, m: 106.4, s: 0.02524 },
    { ageMonths: 60, p3: 104.7, p5: 106.2, p10: 108.1, p15: 109.4, p25: 111.7, p50: 114.7, p75: 118.0, p85: 119.7, p90: 120.8, p95: 123.1, p97: 124.2, l: 1, m: 114.7, s: 0.02556 }
];

async function populateGrowthReferences() {
    try {
        // Inicializar conexión a la base de datos
        if (!AppDataSource.isInitialized) {
            await AppDataSource.initialize();
        }

        const growthRefRepo = AppDataSource.getRepository(GrowthReference);

        console.log('🔄 Limpiando referencias existentes...');
        await growthRefRepo.clear();

        console.log('📊 Poblando datos de referencia OMS...');

        const references: Partial<GrowthReference>[] = [];

        // Peso para edad - Niños
        WHO_WEIGHT_FOR_AGE_BOYS.forEach(data => {
            references.push({
                source: GrowthReferenceSource.WHO,
                metric_type: GrowthMetricType.WEIGHT_FOR_AGE,
                gender: Gender.MALE,
                age_months: data.ageMonths,
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
                l_lambda: data.l,
                m_mu: data.m,
                s_sigma: data.s,
                version: 'WHO 2006',
                notes: 'Estándares de crecimiento infantil de la OMS 2006'
            });
        });

        // Peso para edad - Niñas
        WHO_WEIGHT_FOR_AGE_GIRLS.forEach(data => {
            references.push({
                source: GrowthReferenceSource.WHO,
                metric_type: GrowthMetricType.WEIGHT_FOR_AGE,
                gender: Gender.FEMALE,
                age_months: data.ageMonths,
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
                l_lambda: data.l,
                m_mu: data.m,
                s_sigma: data.s,
                version: 'WHO 2006',
                notes: 'Estándares de crecimiento infantil de la OMS 2006'
            });
        });

        // Talla para edad - Niños
        WHO_HEIGHT_FOR_AGE_BOYS.forEach(data => {
            references.push({
                source: GrowthReferenceSource.WHO,
                metric_type: GrowthMetricType.HEIGHT_FOR_AGE,
                gender: Gender.MALE,
                age_months: data.ageMonths,
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
                l_lambda: data.l,
                m_mu: data.m,
                s_sigma: data.s,
                version: 'WHO 2006',
                notes: 'Estándares de crecimiento infantil de la OMS 2006'
            });
        });

        // Talla para edad - Niñas
        WHO_HEIGHT_FOR_AGE_GIRLS.forEach(data => {
            references.push({
                source: GrowthReferenceSource.WHO,
                metric_type: GrowthMetricType.HEIGHT_FOR_AGE,
                gender: Gender.FEMALE,
                age_months: data.ageMonths,
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
                l_lambda: data.l,
                m_mu: data.m,
                s_sigma: data.s,
                version: 'WHO 2006',
                notes: 'Estándares de crecimiento infantil de la OMS 2006'
            });
        });

        // Generar datos de IMC para edad (calculados a partir de peso y talla)
        console.log('🧮 Generando datos de IMC para edad...');
        
        for (let ageMonths = 0; ageMonths <= 60; ageMonths++) {
            // Encontrar datos de peso y talla para esta edad
            const weightBoys = WHO_WEIGHT_FOR_AGE_BOYS.find(d => d.ageMonths === ageMonths);
            const heightBoys = WHO_HEIGHT_FOR_AGE_BOYS.find(d => d.ageMonths === ageMonths);
            const weightGirls = WHO_WEIGHT_FOR_AGE_GIRLS.find(d => d.ageMonths === ageMonths);
            const heightGirls = WHO_HEIGHT_FOR_AGE_GIRLS.find(d => d.ageMonths === ageMonths);

            if (weightBoys && heightBoys) {
                // Calcular IMC para percentiles de niños
                const heightInM = heightBoys.p50 / 100;
                references.push({
                    source: GrowthReferenceSource.WHO,
                    metric_type: GrowthMetricType.BMI_FOR_AGE,
                    gender: Gender.MALE,
                    age_months: ageMonths,
                    p3: weightBoys.p3 / Math.pow(heightInM, 2),
                    p5: weightBoys.p5 / Math.pow(heightInM, 2),
                    p10: weightBoys.p10 / Math.pow(heightInM, 2),
                    p15: weightBoys.p15 / Math.pow(heightInM, 2),
                    p25: weightBoys.p25 / Math.pow(heightInM, 2),
                    p50: weightBoys.p50 / Math.pow(heightInM, 2),
                    p75: weightBoys.p75 / Math.pow(heightInM, 2),
                    p85: weightBoys.p85 / Math.pow(heightInM, 2),
                    p90: weightBoys.p90 / Math.pow(heightInM, 2),
                    p95: weightBoys.p95 / Math.pow(heightInM, 2),
                    p97: weightBoys.p97 / Math.pow(heightInM, 2),
                    l_lambda: 0,
                    m_mu: weightBoys.p50 / Math.pow(heightInM, 2),
                    s_sigma: 0.1,
                    version: 'WHO 2006 (calculado)',
                    notes: 'IMC calculado a partir de datos de peso y talla OMS'
                });
            }

            if (weightGirls && heightGirls) {
                // Calcular IMC para percentiles de niñas
                const heightInM = heightGirls.p50 / 100;
                references.push({
                    source: GrowthReferenceSource.WHO,
                    metric_type: GrowthMetricType.BMI_FOR_AGE,
                    gender: Gender.FEMALE,
                    age_months: ageMonths,
                    p3: weightGirls.p3 / Math.pow(heightInM, 2),
                    p5: weightGirls.p5 / Math.pow(heightInM, 2),
                    p10: weightGirls.p10 / Math.pow(heightInM, 2),
                    p15: weightGirls.p15 / Math.pow(heightInM, 2),
                    p25: weightGirls.p25 / Math.pow(heightInM, 2),
                    p50: weightGirls.p50 / Math.pow(heightInM, 2),
                    p75: weightGirls.p75 / Math.pow(heightInM, 2),
                    p85: weightGirls.p85 / Math.pow(heightInM, 2),
                    p90: weightGirls.p90 / Math.pow(heightInM, 2),
                    p95: weightGirls.p95 / Math.pow(heightInM, 2),
                    p97: weightGirls.p97 / Math.pow(heightInM, 2),
                    l_lambda: 0,
                    m_mu: weightGirls.p50 / Math.pow(heightInM, 2),
                    s_sigma: 0.1,
                    version: 'WHO 2006 (calculado)',
                    notes: 'IMC calculado a partir de datos de peso y talla OMS'
                });
            }
        }

        // Insertar todos los datos en lotes
        console.log(`💾 Insertando ${references.length} referencias en la base de datos...`);
        
        const batchSize = 50;
        for (let i = 0; i < references.length; i += batchSize) {
            const batch = references.slice(i, i + batchSize);
            await growthRefRepo.save(batch);
            console.log(`   Insertadas ${Math.min(i + batchSize, references.length)}/${references.length} referencias`);
        }

        console.log('✅ Datos de referencia OMS poblados exitosamente');
        console.log(`📊 Total de referencias insertadas: ${references.length}`);
        
        // Mostrar resumen
        const summary = await growthRefRepo
            .createQueryBuilder('ref')
            .select(['ref.source', 'ref.metric_type', 'ref.gender', 'COUNT(*) as count'])
            .groupBy('ref.source, ref.metric_type, ref.gender')
            .getRawMany();

        console.log('\n📈 Resumen de datos insertados:');
        summary.forEach(item => {
            console.log(`   ${item.ref_source} - ${item.ref_metric_type} - ${item.ref_gender}: ${item.count} registros`);
        });

    } catch (error) {
        console.error('❌ Error poblando datos de referencia:', error);
        throw error;
    } finally {
        if (AppDataSource.isInitialized) {
            await AppDataSource.destroy();
        }
    }
}

// Ejecutar el script si se llama directamente
if (require.main === module) {
    populateGrowthReferences()
        .then(() => {
            console.log('🎉 Script completado exitosamente');
            process.exit(0);
        })
        .catch((error) => {
            console.error('💥 Error ejecutando script:', error);
            process.exit(1);
        });
}

export { populateGrowthReferences }; 