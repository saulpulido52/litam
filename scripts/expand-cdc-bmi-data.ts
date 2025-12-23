import 'reflect-metadata';
import { AppDataSource } from '../src/database/data-source';
import { GrowthReference, GrowthReferenceSource, GrowthMetricType, Gender } from '../src/database/entities/growth_reference.entity';

// Datos BMI para edad CDC (2-20 años)
const cdcBmiData = [
    // BMI para edad - Niños (male)
    { age_months: 24, gender: Gender.MALE, metric_type: GrowthMetricType.BMI_FOR_AGE, l_lambda: -1.4529, m_mu: 16.5707, s_sigma: 0.07851 },
    { age_months: 36, gender: Gender.MALE, metric_type: GrowthMetricType.BMI_FOR_AGE, l_lambda: -1.6908, m_mu: 16.0541, s_sigma: 0.08007 },
    { age_months: 48, gender: Gender.MALE, metric_type: GrowthMetricType.BMI_FOR_AGE, l_lambda: -1.8139, m_mu: 15.7573, s_sigma: 0.08317 },
    { age_months: 60, gender: Gender.MALE, metric_type: GrowthMetricType.BMI_FOR_AGE, l_lambda: -1.8627, m_mu: 15.5863, s_sigma: 0.08771 },
    { age_months: 72, gender: Gender.MALE, metric_type: GrowthMetricType.BMI_FOR_AGE, l_lambda: -1.8661, m_mu: 15.5053, s_sigma: 0.09349 },
    { age_months: 84, gender: Gender.MALE, metric_type: GrowthMetricType.BMI_FOR_AGE, l_lambda: -1.8421, m_mu: 15.4931, s_sigma: 0.10021 },
    { age_months: 96, gender: Gender.MALE, metric_type: GrowthMetricType.BMI_FOR_AGE, l_lambda: -1.8025, m_mu: 15.5395, s_sigma: 0.10758 },
    { age_months: 108, gender: Gender.MALE, metric_type: GrowthMetricType.BMI_FOR_AGE, l_lambda: -1.7530, m_mu: 15.6406, s_sigma: 0.11537 },
    { age_months: 120, gender: Gender.MALE, metric_type: GrowthMetricType.BMI_FOR_AGE, l_lambda: -1.6970, m_mu: 15.7956, s_sigma: 0.12334 },
    { age_months: 132, gender: Gender.MALE, metric_type: GrowthMetricType.BMI_FOR_AGE, l_lambda: -1.6361, m_mu: 16.0053, s_sigma: 0.13129 },
    { age_months: 144, gender: Gender.MALE, metric_type: GrowthMetricType.BMI_FOR_AGE, l_lambda: -1.5710, m_mu: 16.2712, s_sigma: 0.13903 },
    { age_months: 156, gender: Gender.MALE, metric_type: GrowthMetricType.BMI_FOR_AGE, l_lambda: -1.5018, m_mu: 16.5952, s_sigma: 0.14639 },
    { age_months: 168, gender: Gender.MALE, metric_type: GrowthMetricType.BMI_FOR_AGE, l_lambda: -1.4280, m_mu: 16.9788, s_sigma: 0.15321 },
    { age_months: 180, gender: Gender.MALE, metric_type: GrowthMetricType.BMI_FOR_AGE, l_lambda: -1.3489, m_mu: 17.4234, s_sigma: 0.15935 },
    { age_months: 192, gender: Gender.MALE, metric_type: GrowthMetricType.BMI_FOR_AGE, l_lambda: -1.2630, m_mu: 17.9296, s_sigma: 0.16467 },
    { age_months: 204, gender: Gender.MALE, metric_type: GrowthMetricType.BMI_FOR_AGE, l_lambda: -1.1684, m_mu: 18.4967, s_sigma: 0.16905 },
    { age_months: 216, gender: Gender.MALE, metric_type: GrowthMetricType.BMI_FOR_AGE, l_lambda: -1.0625, m_mu: 19.1222, s_sigma: 0.17241 },
    { age_months: 228, gender: Gender.MALE, metric_type: GrowthMetricType.BMI_FOR_AGE, l_lambda: -0.9422, m_mu: 19.8013, s_sigma: 0.17465 },
    { age_months: 240, gender: Gender.MALE, metric_type: GrowthMetricType.BMI_FOR_AGE, l_lambda: -0.8042, m_mu: 20.5263, s_sigma: 0.17575 },

    // BMI para edad - Niñas (female)
    { age_months: 24, gender: Gender.FEMALE, metric_type: GrowthMetricType.BMI_FOR_AGE, l_lambda: -1.1959, m_mu: 16.4073, s_sigma: 0.08442 },
    { age_months: 36, gender: Gender.FEMALE, metric_type: GrowthMetricType.BMI_FOR_AGE, l_lambda: -1.3663, m_mu: 15.9020, s_sigma: 0.08664 },
    { age_months: 48, gender: Gender.FEMALE, metric_type: GrowthMetricType.BMI_FOR_AGE, l_lambda: -1.4351, m_mu: 15.6061, s_sigma: 0.09080 },
    { age_months: 60, gender: Gender.FEMALE, metric_type: GrowthMetricType.BMI_FOR_AGE, l_lambda: -1.4496, m_mu: 15.4323, s_sigma: 0.09664 },
    { age_months: 72, gender: Gender.FEMALE, metric_type: GrowthMetricType.BMI_FOR_AGE, l_lambda: -1.4320, m_mu: 15.3432, s_sigma: 0.10377 },
    { age_months: 84, gender: Gender.FEMALE, metric_type: GrowthMetricType.BMI_FOR_AGE, l_lambda: -1.3942, m_mu: 15.3201, s_sigma: 0.11179 },
    { age_months: 96, gender: Gender.FEMALE, metric_type: GrowthMetricType.BMI_FOR_AGE, l_lambda: -1.3436, m_mu: 15.3543, s_sigma: 0.12033 },
    { age_months: 108, gender: Gender.FEMALE, metric_type: GrowthMetricType.BMI_FOR_AGE, l_lambda: -1.2844, m_mu: 15.4429, s_sigma: 0.12905 },
    { age_months: 120, gender: Gender.FEMALE, metric_type: GrowthMetricType.BMI_FOR_AGE, l_lambda: -1.2188, m_mu: 15.5862, s_sigma: 0.13765 },
    { age_months: 132, gender: Gender.FEMALE, metric_type: GrowthMetricType.BMI_FOR_AGE, l_lambda: -1.1480, m_mu: 15.7862, s_sigma: 0.14585 },
    { age_months: 144, gender: Gender.FEMALE, metric_type: GrowthMetricType.BMI_FOR_AGE, l_lambda: -1.0722, m_mu: 16.0459, s_sigma: 0.15340 },
    { age_months: 156, gender: Gender.FEMALE, metric_type: GrowthMetricType.BMI_FOR_AGE, l_lambda: -0.9910, m_mu: 16.3684, s_sigma: 0.16007 },
    { age_months: 168, gender: Gender.FEMALE, metric_type: GrowthMetricType.BMI_FOR_AGE, l_lambda: -0.9036, m_mu: 16.7570, s_sigma: 0.16565 },
    { age_months: 180, gender: Gender.FEMALE, metric_type: GrowthMetricType.BMI_FOR_AGE, l_lambda: -0.8088, m_mu: 17.2141, s_sigma: 0.16996 },
    { age_months: 192, gender: Gender.FEMALE, metric_type: GrowthMetricType.BMI_FOR_AGE, l_lambda: -0.7048, m_mu: 17.7407, s_sigma: 0.17288 },
    { age_months: 204, gender: Gender.FEMALE, metric_type: GrowthMetricType.BMI_FOR_AGE, l_lambda: -0.5894, m_mu: 18.3359, s_sigma: 0.17428 },
    { age_months: 216, gender: Gender.FEMALE, metric_type: GrowthMetricType.BMI_FOR_AGE, l_lambda: -0.4598, m_mu: 18.9957, s_sigma: 0.17413 },
    { age_months: 228, gender: Gender.FEMALE, metric_type: GrowthMetricType.BMI_FOR_AGE, l_lambda: -0.3132, m_mu: 19.7124, s_sigma: 0.17243 },
    { age_months: 240, gender: Gender.FEMALE, metric_type: GrowthMetricType.BMI_FOR_AGE, l_lambda: -0.1460, m_mu: 20.4729, s_sigma: 0.16927 },
];

async function expandCdcBmiData() {
    try {
        await AppDataSource.initialize();
        console.log('🔍 Expandiendo datos BMI de CDC...\n');

        const repository = AppDataSource.getRepository(GrowthReference);

        // Verificar si ya existen datos BMI de CDC
        const existingCount = await repository.count({
            where: {
                source: GrowthReferenceSource.CDC,
                metric_type: GrowthMetricType.BMI_FOR_AGE
            }
        });

        if (existingCount > 0) {
            console.log(`✅ Ya existen ${existingCount} registros BMI de CDC`);
            return;
        }

        // Insertar datos BMI
        let insertedCount = 0;
        for (const data of cdcBmiData) {
            const exists = await repository.findOne({
                where: {
                    age_months: data.age_months,
                    gender: data.gender,
                    metric_type: data.metric_type,
                    source: GrowthReferenceSource.CDC
                }
            });

            if (!exists) {
                await repository.save({
                    ...data,
                    source: GrowthReferenceSource.CDC
                });
                insertedCount++;
            }
        }

        console.log(`✅ Se insertaron ${insertedCount} nuevos registros BMI de CDC`);

        // Mostrar resumen
        console.log('\n📊 Resumen de datos BMI por fuente:');
        const whoCount = await repository.count({ 
            where: { 
                metric_type: GrowthMetricType.BMI_FOR_AGE, 
                source: GrowthReferenceSource.WHO 
            } 
        });
        const cdcCount = await repository.count({ 
            where: { 
                metric_type: GrowthMetricType.BMI_FOR_AGE, 
                source: GrowthReferenceSource.CDC 
            } 
        });
        console.log(`   BMI para edad: CDC=${cdcCount}, WHO=${whoCount}`);

    } catch (error) {
        console.error('❌ Error expandiendo datos BMI de CDC:', error);
    } finally {
        await AppDataSource.destroy();
    }
}

expandCdcBmiData(); 