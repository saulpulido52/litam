import 'reflect-metadata';
import { AppDataSource } from '../src/database/data-source';
import { GrowthReference, GrowthReferenceSource, GrowthMetricType } from '../src/database/entities/growth_reference.entity';

async function checkCdcBmiData() {
    try {
        await AppDataSource.initialize();
        console.log('🔍 Verificando datos BMI de CDC...\n');

        const repository = AppDataSource.getRepository(GrowthReference);

        // Contar registros BMI por fuente
        const cdcBmiCount = await repository.count({
            where: {
                source: GrowthReferenceSource.CDC,
                metric_type: GrowthMetricType.BMI_FOR_AGE
            }
        });

        const whoBmiCount = await repository.count({
            where: {
                source: GrowthReferenceSource.WHO,
                metric_type: GrowthMetricType.BMI_FOR_AGE
            }
        });

        console.log(`📊 Datos BMI para edad:`);
        console.log(`   - CDC: ${cdcBmiCount} registros`);
        console.log(`   - WHO: ${whoBmiCount} registros`);

        // Verificar un registro específico
        const sampleRecord = await repository.findOne({
            where: {
                source: GrowthReferenceSource.CDC,
                metric_type: GrowthMetricType.BMI_FOR_AGE,
                age_months: 36
            }
        });

        if (sampleRecord) {
            console.log('\n✅ Ejemplo de registro BMI CDC (36 meses):');
            console.log(`   - Género: ${sampleRecord.gender}`);
            console.log(`   - L: ${sampleRecord.l_lambda}`);
            console.log(`   - M: ${sampleRecord.m_mu}`);
            console.log(`   - S: ${sampleRecord.s_sigma}`);
        }

    } catch (error) {
        console.error('❌ Error verificando datos BMI de CDC:', error);
    } finally {
        await AppDataSource.destroy();
    }
}

checkCdcBmiData(); 