import 'reflect-metadata';
import { AppDataSource } from '../src/database/data-source';
import { GrowthReference, GrowthReferenceSource, GrowthMetricType, Gender } from '../src/database/entities/growth_reference.entity';

async function checkGrowthData() {
    try {
        await AppDataSource.initialize();
        console.log('🔍 Verificando datos de crecimiento en la BD...\n');

        const repository = AppDataSource.getRepository(GrowthReference);

        // Contar total de registros
        const totalCount = await repository.count();
        console.log(`📊 Total de registros: ${totalCount}`);

        // Contar por fuente
        const whoCount = await repository.count({ where: { source: GrowthReferenceSource.WHO } });
        const cdcCount = await repository.count({ where: { source: GrowthReferenceSource.CDC } });
        
        console.log(`\n📈 Por fuente:`);
        console.log(`   - WHO: ${whoCount} registros`);
        console.log(`   - CDC: ${cdcCount} registros`);

        // Verificar datos específicos para CDC height_for_age female 24 meses
        console.log(`\n🔍 Buscando datos específicos: CDC, height_for_age, female, 24 meses...`);
        
        const specificData = await repository.findOne({
            where: {
                source: GrowthReferenceSource.CDC,
                metric_type: GrowthMetricType.HEIGHT_FOR_AGE,
                gender: Gender.FEMALE,
                age_months: 24
            }
        });

        if (specificData) {
            console.log('✅ Datos encontrados:', {
                id: specificData.id,
                p50: specificData.p50,
                p3: specificData.p3,
                p97: specificData.p97
            });
        } else {
            console.log('❌ No se encontraron datos para esta combinación específica');
            
            // Buscar qué datos CDC existen
            const cdcData = await repository.find({
                where: { source: GrowthReferenceSource.CDC },
                take: 10
            });
            
            console.log('\n📋 Muestra de datos CDC disponibles:');
            cdcData.forEach(d => {
                console.log(`   - ${d.metric_type}, ${d.gender}, ${d.age_months} meses`);
            });
        }

        // Verificar métricas disponibles por fuente
        const metrics = await repository
            .createQueryBuilder('gr')
            .select('DISTINCT gr.metric_type', 'metric_type')
            .addSelect('gr.source', 'source')
            .getRawMany();

        console.log('\n📊 Métricas disponibles por fuente:');
        metrics.forEach(m => {
            console.log(`   - ${m.source}: ${m.metric_type}`);
        });

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        if (AppDataSource.isInitialized) {
            await AppDataSource.destroy();
        }
    }
}

checkGrowthData(); 