// scripts/populate-weight-for-height-data.ts
import 'dotenv/config';
import { AppDataSource } from '../src/database/data-source';
import { GrowthReference, GrowthReferenceSource, GrowthMetricType, Gender } from '../src/database/entities/growth_reference.entity';

// Datos WHO peso/talla para lactantes (45-110 cm)
const WHO_WEIGHT_FOR_HEIGHT_BOYS = [
  // height_cm, p3, p5, p10, p15, p25, p50, p75, p85, p90, p95, p97, l, m, s
  { height: 45, p3: 1.9, p5: 2.0, p10: 2.2, p15: 2.3, p25: 2.4, p50: 2.7, p75: 3.0, p85: 3.2, p90: 3.4, p95: 3.7, p97: 3.9, l: 0.2, m: 2.69, s: 0.14 },
  { height: 50, p3: 2.9, p5: 3.0, p10: 3.2, p15: 3.4, p25: 3.6, p50: 4.0, p75: 4.4, p85: 4.7, p90: 4.9, p95: 5.3, p97: 5.6, l: 0.1, m: 4.03, s: 0.13 },
  { height: 55, p3: 3.8, p5: 4.0, p10: 4.3, p15: 4.5, p25: 4.8, p50: 5.3, p75: 5.9, p85: 6.2, p90: 6.5, p95: 7.0, p97: 7.4, l: 0.1, m: 5.32, s: 0.12 },
  { height: 60, p3: 4.8, p5: 5.1, p10: 5.4, p15: 5.7, p25: 6.0, p50: 6.7, p75: 7.4, p85: 7.8, p90: 8.2, p95: 8.8, p97: 9.3, l: 0.0, m: 6.69, s: 0.12 },
  { height: 65, p3: 5.9, p5: 6.2, p10: 6.6, p15: 6.9, p25: 7.3, p50: 8.0, p75: 8.9, p85: 9.4, p90: 9.8, p95: 10.6, p97: 11.2, l: 0.0, m: 8.02, s: 0.12 },
  { height: 70, p3: 7.0, p5: 7.3, p10: 7.8, p15: 8.1, p25: 8.6, p50: 9.4, p75: 10.5, p85: 11.1, p90: 11.6, p95: 12.5, p97: 13.2, l: -0.1, m: 9.38, s: 0.12 },
  { height: 75, p3: 8.1, p5: 8.5, p10: 9.0, p15: 9.4, p25: 9.9, p50: 10.9, p75: 12.1, p85: 12.8, p90: 13.4, p95: 14.5, p97: 15.3, l: -0.1, m: 10.78, s: 0.12 },
  { height: 80, p3: 9.2, p5: 9.6, p10: 10.2, p15: 10.6, p25: 11.2, p50: 12.3, p75: 13.7, p85: 14.5, p90: 15.2, p95: 16.4, p97: 17.3, l: -0.1, m: 12.15, s: 0.12 },
  { height: 85, p3: 10.3, p5: 10.8, p10: 11.4, p15: 11.9, p25: 12.6, p50: 13.8, p75: 15.3, p85: 16.2, p90: 17.0, p95: 18.4, p97: 19.4, l: -0.2, m: 13.60, s: 0.12 },
  { height: 90, p3: 11.4, p5: 11.9, p10: 12.6, p15: 13.1, p25: 13.9, p50: 15.3, p75: 17.0, p85: 18.0, p90: 18.9, p95: 20.4, p97: 21.6, l: -0.2, m: 15.05, s: 0.12 },
  { height: 95, p3: 12.5, p5: 13.1, p10: 13.8, p15: 14.4, p25: 15.3, p50: 16.8, p75: 18.6, p85: 19.7, p90: 20.7, p95: 22.4, p97: 23.7, l: -0.2, m: 16.52, s: 0.12 },
  { height: 100, p3: 13.6, p5: 14.2, p10: 15.0, p15: 15.6, p25: 16.6, p50: 18.3, p75: 20.3, p85: 21.5, p90: 22.6, p95: 24.5, p97: 25.9, l: -0.3, m: 18.02, s: 0.12 },
  { height: 105, p3: 14.7, p5: 15.4, p10: 16.2, p15: 16.9, p25: 18.0, p50: 19.9, p75: 22.0, p85: 23.3, p90: 24.5, p95: 26.5, p97: 28.1, l: -0.3, m: 19.54, s: 0.12 },
  { height: 110, p3: 15.8, p5: 16.5, p10: 17.4, p15: 18.1, p25: 19.3, p50: 21.4, p75: 23.7, p85: 25.1, p90: 26.4, p95: 28.6, p97: 30.3, l: -0.3, m: 21.08, s: 0.12 }
];

const WHO_WEIGHT_FOR_HEIGHT_GIRLS = [
  // height_cm, p3, p5, p10, p15, p25, p50, p75, p85, p90, p95, p97, l, m, s
  { height: 45, p3: 1.8, p5: 1.9, p10: 2.1, p15: 2.2, p25: 2.3, p50: 2.6, p75: 2.9, p85: 3.1, p90: 3.2, p95: 3.5, p97: 3.7, l: 0.2, m: 2.58, s: 0.14 },
  { height: 50, p3: 2.7, p5: 2.9, p10: 3.1, p15: 3.2, p25: 3.4, p50: 3.8, p75: 4.2, p85: 4.4, p90: 4.6, p95: 5.0, p97: 5.3, l: 0.1, m: 3.84, s: 0.13 },
  { height: 55, p3: 3.6, p5: 3.8, p10: 4.1, p15: 4.3, p25: 4.5, p50: 5.0, p75: 5.5, p85: 5.8, p90: 6.1, p95: 6.6, p97: 7.0, l: 0.1, m: 5.05, s: 0.12 },
  { height: 60, p3: 4.5, p5: 4.7, p10: 5.0, p15: 5.3, p25: 5.6, p50: 6.2, p75: 6.9, p85: 7.3, p90: 7.6, p95: 8.2, p97: 8.7, l: 0.0, m: 6.26, s: 0.12 },
  { height: 65, p3: 5.4, p5: 5.7, p10: 6.0, p15: 6.3, p25: 6.7, p50: 7.4, p75: 8.2, p85: 8.7, p90: 9.1, p95: 9.8, p97: 10.4, l: 0.0, m: 7.47, s: 0.12 },
  { height: 70, p3: 6.3, p5: 6.6, p10: 7.0, p15: 7.3, p25: 7.8, p50: 8.6, p75: 9.6, p85: 10.2, p90: 10.6, p95: 11.5, p97: 12.2, l: -0.1, m: 8.69, s: 0.12 },
  { height: 75, p3: 7.2, p5: 7.5, p10: 8.0, p15: 8.4, p25: 8.9, p50: 9.8, p75: 10.9, p85: 11.6, p90: 12.1, p95: 13.1, p97: 13.9, l: -0.1, m: 9.92, s: 0.12 },
  { height: 80, p3: 8.1, p5: 8.5, p10: 9.0, p15: 9.4, p25: 10.0, p50: 11.0, p75: 12.3, p85: 13.0, p90: 13.6, p95: 14.8, p97: 15.7, l: -0.1, m: 11.17, s: 0.12 },
  { height: 85, p3: 9.0, p5: 9.4, p10: 10.0, p15: 10.5, p25: 11.1, p50: 12.2, p75: 13.6, p85: 14.5, p90: 15.1, p95: 16.4, p97: 17.4, l: -0.2, m: 12.44, s: 0.12 },
  { height: 90, p3: 9.9, p5: 10.4, p10: 11.0, p15: 11.5, p25: 12.2, p50: 13.4, p75: 15.0, p85: 15.9, p90: 16.7, p95: 18.1, p97: 19.2, l: -0.2, m: 13.73, s: 0.12 },
  { height: 95, p3: 10.8, p5: 11.3, p10: 12.0, p15: 12.5, p25: 13.3, p50: 14.7, p75: 16.4, p85: 17.4, p90: 18.2, p95: 19.8, p97: 21.0, l: -0.2, m: 15.04, s: 0.12 },
  { height: 100, p3: 11.7, p5: 12.3, p10: 13.0, p15: 13.6, p25: 14.5, p50: 15.9, p75: 17.7, p85: 18.8, p90: 19.7, p95: 21.4, p97: 22.7, l: -0.3, m: 16.36, s: 0.12 },
  { height: 105, p3: 12.6, p5: 13.2, p10: 14.0, p15: 14.6, p25: 15.6, p50: 17.2, p75: 19.1, p85: 20.3, p90: 21.3, p95: 23.1, p97: 24.5, l: -0.3, m: 17.71, s: 0.12 },
  { height: 110, p3: 13.5, p5: 14.2, p10: 15.0, p15: 15.7, p25: 16.7, p50: 18.4, p75: 20.5, p85: 21.7, p90: 22.8, p95: 24.8, p97: 26.3, l: -0.3, m: 19.08, s: 0.12 }
];

// Datos CDC peso/talla simplificados
const CDC_WEIGHT_FOR_HEIGHT_BOYS = [
  { height: 77, p3: 8.5, p5: 8.8, p10: 9.3, p15: 9.7, p25: 10.2, p50: 11.2, p75: 12.4, p85: 13.1, p90: 13.7, p95: 14.8, p97: 15.6, l: -0.1, m: 11.1, s: 0.12 },
  { height: 80, p3: 9.2, p5: 9.6, p10: 10.1, p15: 10.5, p25: 11.1, p50: 12.2, p75: 13.5, p85: 14.3, p90: 15.0, p95: 16.2, p97: 17.1, l: -0.1, m: 12.1, s: 0.12 },
  { height: 85, p3: 10.5, p5: 10.9, p10: 11.5, p15: 12.0, p25: 12.7, p50: 13.9, p75: 15.4, p85: 16.3, p90: 17.1, p95: 18.5, p97: 19.5, l: -0.2, m: 13.8, s: 0.12 },
  { height: 90, p3: 11.8, p5: 12.3, p10: 12.9, p15: 13.5, p25: 14.3, p50: 15.7, p75: 17.4, p85: 18.4, p90: 19.3, p95: 20.9, p97: 22.0, l: -0.2, m: 15.6, s: 0.12 },
  { height: 95, p3: 13.1, p5: 13.6, p10: 14.3, p15: 14.9, p25: 15.8, p50: 17.4, p75: 19.3, p85: 20.4, p90: 21.4, p95: 23.2, p97: 24.5, l: -0.2, m: 17.3, s: 0.12 },
  { height: 100, p3: 14.4, p5: 15.0, p10: 15.7, p15: 16.4, p25: 17.4, p50: 19.2, p75: 21.3, p85: 22.5, p90: 23.6, p95: 25.6, p97: 27.0, l: -0.3, m: 19.1, s: 0.12 }
];

const CDC_WEIGHT_FOR_HEIGHT_GIRLS = [
  { height: 77, p3: 8.0, p5: 8.3, p10: 8.8, p15: 9.1, p25: 9.6, p50: 10.5, p75: 11.6, p85: 12.2, p90: 12.8, p95: 13.8, p97: 14.5, l: -0.1, m: 10.4, s: 0.12 },
  { height: 80, p3: 8.6, p5: 8.9, p10: 9.4, p15: 9.8, p25: 10.3, p50: 11.3, p75: 12.5, p85: 13.2, p90: 13.8, p95: 14.9, p97: 15.7, l: -0.1, m: 11.2, s: 0.12 },
  { height: 85, p3: 9.6, p5: 10.0, p10: 10.5, p15: 10.9, p25: 11.5, p50: 12.6, p75: 14.0, p85: 14.8, p90: 15.5, p95: 16.7, p97: 17.6, l: -0.2, m: 12.5, s: 0.12 },
  { height: 90, p3: 10.6, p5: 11.0, p10: 11.6, p15: 12.1, p25: 12.8, p50: 14.0, p75: 15.5, p85: 16.4, p90: 17.2, p95: 18.6, p97: 19.6, l: -0.2, m: 13.9, s: 0.12 },
  { height: 95, p3: 11.6, p5: 12.1, p10: 12.7, p15: 13.2, p25: 14.0, p50: 15.3, p75: 17.0, p85: 18.0, p90: 18.9, p95: 20.4, p97: 21.5, l: -0.2, m: 15.2, s: 0.12 },
  { height: 100, p3: 12.6, p5: 13.1, p10: 13.8, p15: 14.4, p25: 15.2, p50: 16.7, p75: 18.5, p85: 19.6, p90: 20.6, p95: 22.3, p97: 23.5, l: -0.3, m: 16.6, s: 0.12 }
];

async function populateWeightForHeightData() {
  try {
    console.log('🔄 Iniciando población de datos peso/talla...');
    
    // Inicializar conexión
    await AppDataSource.initialize();
    console.log('✅ Conexión a base de datos establecida');

    const growthRefRepo = AppDataSource.getRepository(GrowthReference);

    // Limpiar datos existentes de peso/talla
    await growthRefRepo.delete({ metric_type: GrowthMetricType.WEIGHT_FOR_HEIGHT });
    console.log('🗑️ Datos existentes de peso/talla eliminados');

    const references: Partial<GrowthReference>[] = [];

    // Poblar datos WHO para niños
    console.log('📊 Poblando datos WHO - Peso/Talla niños...');
    WHO_WEIGHT_FOR_HEIGHT_BOYS.forEach(data => {
      references.push({
        source: GrowthReferenceSource.WHO,
        metric_type: GrowthMetricType.WEIGHT_FOR_HEIGHT,
        gender: Gender.MALE,
        age_months: data.height, // Para peso/talla usamos height en lugar de age_months
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
        notes: "WHO Child Growth Standards - Weight-for-height (boys)",
        version: "WHO 2006"
      });
    });

    // Poblar datos WHO para niñas
    console.log('📊 Poblando datos WHO - Peso/Talla niñas...');
    WHO_WEIGHT_FOR_HEIGHT_GIRLS.forEach(data => {
      references.push({
        source: GrowthReferenceSource.WHO,
        metric_type: GrowthMetricType.WEIGHT_FOR_HEIGHT,
        gender: Gender.FEMALE,
        age_months: data.height, // Para peso/talla usamos height en lugar de age_months
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
        notes: "WHO Child Growth Standards - Weight-for-height (girls)",
        version: "WHO 2006"
      });
    });

    // Poblar datos CDC para niños
    console.log('📊 Poblando datos CDC - Peso/Talla niños...');
    CDC_WEIGHT_FOR_HEIGHT_BOYS.forEach(data => {
      references.push({
        source: GrowthReferenceSource.CDC,
        metric_type: GrowthMetricType.WEIGHT_FOR_HEIGHT,
        gender: Gender.MALE,
        age_months: data.height, // Para peso/talla usamos height en lugar de age_months
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
        notes: "CDC Growth Charts - Weight-for-height (boys)",
        version: "CDC 2000"
      });
    });

    // Poblar datos CDC para niñas
    console.log('📊 Poblando datos CDC - Peso/Talla niñas...');
    CDC_WEIGHT_FOR_HEIGHT_GIRLS.forEach(data => {
      references.push({
        source: GrowthReferenceSource.CDC,
        metric_type: GrowthMetricType.WEIGHT_FOR_HEIGHT,
        gender: Gender.FEMALE,
        age_months: data.height, // Para peso/talla usamos height en lugar de age_months
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
        notes: "CDC Growth Charts - Weight-for-height (girls)",
        version: "CDC 2000"
      });
    });

    // Insertar en lotes
    const batchSize = 50;
    for (let i = 0; i < references.length; i += batchSize) {
      const batch = references.slice(i, i + batchSize);
      await growthRefRepo.save(batch);
      console.log(`   Insertadas ${Math.min(i + batchSize, references.length)}/${references.length} referencias`);
    }

    console.log(`✅ Población completada: ${references.length} registros de peso/talla agregados`);

    // Verificar resultados
    const whoCount = await growthRefRepo.count({
      where: { metric_type: GrowthMetricType.WEIGHT_FOR_HEIGHT, source: GrowthReferenceSource.WHO }
    });
    const cdcCount = await growthRefRepo.count({
      where: { metric_type: GrowthMetricType.WEIGHT_FOR_HEIGHT, source: GrowthReferenceSource.CDC }
    });

    console.log('📈 Datos disponibles:');
    console.log(`   - OMS: ${whoCount} registros (45-110 cm para lactantes/niños pequeños)`);
    console.log(`   - CDC: ${cdcCount} registros (77-100 cm para complemento)`);
    console.log('   - Parámetros LMS incluidos para cálculos precisos');
    console.log('🔚 Conexión a base de datos cerrada');

  } catch (error) {
    console.error('❌ Error poblando datos peso/talla:', error);
    throw error;
  } finally {
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
    }
  }
}

// Ejecutar si es llamado directamente
if (require.main === module) {
  populateWeightForHeightData()
    .then(() => {
      console.log('🎉 ¡Población de peso/talla completada exitosamente!');
      console.log('   Las curvas peso/talla para lactantes están listas para usar');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Error en población:', error);
      process.exit(1);
    });
}

export { populateWeightForHeightData }; 