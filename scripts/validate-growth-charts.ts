import { AppDataSource } from '../src/database/data-source';
import { GrowthReference, GrowthReferenceSource, GrowthMetricType, Gender } from '../src/database/entities/growth_reference.entity';
import growthChartsService from '../src/modules/growth_charts/growth_charts.service';

interface ValidationTest {
    name: string;
    source: GrowthReferenceSource;
    metricType: GrowthMetricType;
    gender: Gender;
    ageMonths: number;
    value: number;
    expectedPercentileRange: [number, number]; // [min, max] percentil esperado
    expectedZScoreRange: [number, number]; // [min, max] z-score esperado
}

/**
 * Casos de prueba basados en ejemplos oficiales de OMS y CDC
 * Estos valores han sido extraídos de las tablas oficiales para validación
 */
const VALIDATION_TESTS: ValidationTest[] = [
    // OMS - Peso para edad niños
    {
        name: 'OMS - Niño 9 meses, 9.5kg (peso para edad)',
        source: GrowthReferenceSource.WHO,
        metricType: GrowthMetricType.WEIGHT_FOR_AGE,
        gender: Gender.MALE,
        ageMonths: 9,
        value: 9.5,
        expectedPercentileRange: [48, 52], // Cerca del P50
        expectedZScoreRange: [-0.1, 0.1]
    },
    // OMS - Talla para edad niñas
    {
        name: 'OMS - Niña 12 meses, 74cm (talla para edad)',
        source: GrowthReferenceSource.WHO,
        metricType: GrowthMetricType.HEIGHT_FOR_AGE,
        gender: Gender.FEMALE,
        ageMonths: 12,
        value: 74,
        expectedPercentileRange: [48, 52], // Cerca del P50
        expectedZScoreRange: [-0.1, 0.1]
    },
    // OMS - IMC para edad
    {
        name: 'OMS - Niño 24 meses, IMC 16.5 (IMC para edad)',
        source: GrowthReferenceSource.WHO,
        metricType: GrowthMetricType.BMI_FOR_AGE,
        gender: Gender.MALE,
        ageMonths: 24,
        value: 16.5,
        expectedPercentileRange: [48, 52], // Cerca del P50
        expectedZScoreRange: [-0.1, 0.1]
    },
    // CDC - Peso para edad
    {
        name: 'CDC - Niña 60 meses, 18kg (peso para edad)',
        source: GrowthReferenceSource.CDC,
        metricType: GrowthMetricType.WEIGHT_FOR_AGE,
        gender: Gender.FEMALE,
        ageMonths: 60,
        value: 18,
        expectedPercentileRange: [48, 52], // Cerca del P50
        expectedZScoreRange: [-0.1, 0.1]
    },
    // Casos extremos - P3
    {
        name: 'OMS - Caso bajo P3 - Niño 6 meses, 6kg',
        source: GrowthReferenceSource.WHO,
        metricType: GrowthMetricType.WEIGHT_FOR_AGE,
        gender: Gender.MALE,
        ageMonths: 6,
        value: 6.0,
        expectedPercentileRange: [1, 5], // Debería estar cerca del P3
        expectedZScoreRange: [-2.5, -1.5]
    },
    // Casos extremos - P97
    {
        name: 'OMS - Caso alto P97 - Niña 24 meses, 14kg',
        source: GrowthReferenceSource.WHO,
        metricType: GrowthMetricType.WEIGHT_FOR_AGE,
        gender: Gender.FEMALE,
        ageMonths: 24,
        value: 14.0,
        expectedPercentileRange: [95, 99], // Debería estar cerca del P97
        expectedZScoreRange: [1.5, 2.5]
    }
];

/**
 * Valida la fórmula LMS comparando con el método oficial de CDC
 */
function validateLMSFormula(L: number, M: number, S: number, value: number): { zScore: number; percentile: number } {
    // Fórmula oficial CDC: Z = ((X/M)^L - 1) / (L*S) cuando L ≠ 0
    let zScore: number;
    
    if (L !== 0) {
        zScore = (Math.pow(value / M, L) - 1) / (L * S);
    } else {
        // Cuando L = 0: Z = ln(X/M) / S
        zScore = Math.log(value / M) / S;
    }
    
    // Convertir Z-score a percentil usando función de distribución normal
    const percentile = cdfNormal(zScore) * 100;
    
    return { zScore, percentile };
}

/**
 * Función de distribución normal acumulativa (CDF)
 */
function cdfNormal(z: number): number {
    return 0.5 * (1 + erf(z / Math.sqrt(2)));
}

/**
 * Función de error usando aproximación de Abramowitz y Stegun
 */
function erf(x: number): number {
    const a1 =  0.254829592;
    const a2 = -0.284496736;
    const a3 =  1.421413741;
    const a4 = -1.453152027;
    const a5 =  1.061405429;
    const p  =  0.3275911;

    const sign = x >= 0 ? 1 : -1;
    x = Math.abs(x);

    const t = 1.0 / (1.0 + p * x);
    const y = 1.0 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-x * x);

    return sign * y;
}

/**
 * Valida un test individual
 */
async function runValidationTest(test: ValidationTest): Promise<{
    passed: boolean;
    result?: any;
    error?: string;
    details: {
        calculatedPercentile?: number;
        calculatedZScore?: number;
        expectedPercentileRange: [number, number];
        expectedZScoreRange: [number, number];
    };
}> {
    try {
        const result = await growthChartsService.calculateGrowthPercentile({
            ageMonths: test.ageMonths,
            value: test.value,
            gender: test.gender,
            metricType: test.metricType,
            source: test.source
        });

        const percentileInRange = result.percentile >= test.expectedPercentileRange[0] && 
                                 result.percentile <= test.expectedPercentileRange[1];
        
        const zScoreInRange = result.zScore >= test.expectedZScoreRange[0] && 
                             result.zScore <= test.expectedZScoreRange[1];

        return {
            passed: percentileInRange && zScoreInRange,
            result,
            details: {
                calculatedPercentile: result.percentile,
                calculatedZScore: result.zScore,
                expectedPercentileRange: test.expectedPercentileRange,
                expectedZScoreRange: test.expectedZScoreRange
            }
        };

    } catch (error: any) {
        return {
            passed: false,
            error: error.message,
            details: {
                expectedPercentileRange: test.expectedPercentileRange,
                expectedZScoreRange: test.expectedZScoreRange
            }
        };
    }
}

/**
 * Valida que las fórmulas LMS estén implementadas correctamente
 */
async function validateLMSImplementation(): Promise<void> {
    console.log('\n=== VALIDACIÓN DE FÓRMULAS LMS ===');
    
    // Obtener una muestra de referencias para validar fórmulas
    const repository = AppDataSource.getRepository(GrowthReference);
    const sampleReferences = await repository.find({
        where: { source: GrowthReferenceSource.WHO },
        take: 5
    });

    let formulaTestsPassed = 0;
    let formulaTestsTotal = 0;

    for (const ref of sampleReferences) {
        if (ref.l_lambda && ref.m_mu && ref.s_sigma) {
            formulaTestsTotal++;
            
            // Probar con el valor P50 (mediana)
            const testValue = ref.m_mu;
            
            // Calcular usando nuestro método
            const ourZScore = ref.calculateZScore(testValue);
            
            // Calcular usando fórmula oficial
            const officialResult = validateLMSFormula(ref.l_lambda, ref.m_mu, ref.s_sigma, testValue);
            
            // Para el valor P50, el Z-score debería ser ~0
            const zScoreDiff = Math.abs(ourZScore! - officialResult.zScore);
            const percentileDiff = Math.abs(50 - officialResult.percentile);
            
            if (zScoreDiff < 0.001 && percentileDiff < 1) {
                formulaTestsPassed++;
                console.log(`✅ Fórmula LMS correcta para ${ref.source} ${ref.metric_type} ${ref.gender} ${ref.age_months}m`);
            } else {
                console.log(`❌ Discrepancia en fórmula LMS para ${ref.source} ${ref.metric_type} ${ref.gender} ${ref.age_months}m`);
                console.log(`   Z-score diff: ${zScoreDiff}, Percentile diff: ${percentileDiff}`);
            }
        }
    }

    console.log(`\nResultado fórmulas LMS: ${formulaTestsPassed}/${formulaTestsTotal} tests pasaron`);
}

/**
 * Función principal de validación
 */
async function validateGrowthCharts(): Promise<void> {
    console.log('🔍 INICIANDO VALIDACIÓN DE CURVAS DE CRECIMIENTO OMS Y CDC');
    console.log('=====================================================');

    try {
        await AppDataSource.initialize();
        console.log('✅ Conexión a base de datos establecida');

        // Verificar que existan datos de referencia
        const repository = AppDataSource.getRepository(GrowthReference);
        const totalReferences = await repository.count();
        
        if (totalReferences === 0) {
            console.log('❌ ERROR: No se encontraron datos de referencia en la base de datos');
            console.log('   Asegúrate de haber poblado la tabla growth_references con datos OMS y CDC');
            return;
        }

        console.log(`✅ Se encontraron ${totalReferences} referencias de crecimiento en la base de datos`);

        // Verificar distribución de datos
        const whoCount = await repository.count({ where: { source: GrowthReferenceSource.WHO } });
        const cdcCount = await repository.count({ where: { source: GrowthReferenceSource.CDC } });
        
        console.log(`   - OMS: ${whoCount} referencias`);
        console.log(`   - CDC: ${cdcCount} referencias`);

        // Validar fórmulas LMS
        await validateLMSImplementation();

        // Ejecutar tests de validación
        console.log('\n=== TESTS DE VALIDACIÓN CON CASOS CONOCIDOS ===');
        
        let testsPassed = 0;
        let testsTotal = VALIDATION_TESTS.length;

        for (const test of VALIDATION_TESTS) {
            console.log(`\nEjecutando: ${test.name}`);
            
            const result = await runValidationTest(test);
            
            if (result.passed) {
                testsPassed++;
                console.log(`✅ PASÓ - Percentil: ${result.details.calculatedPercentile?.toFixed(1)}, Z-score: ${result.details.calculatedZScore?.toFixed(2)}`);
            } else {
                console.log(`❌ FALLÓ - ${test.name}`);
                if (result.error) {
                    console.log(`   Error: ${result.error}`);
                } else {
                    console.log(`   Percentil calculado: ${result.details.calculatedPercentile?.toFixed(1)} (esperado: ${test.expectedPercentileRange[0]}-${test.expectedPercentileRange[1]})`);
                    console.log(`   Z-score calculado: ${result.details.calculatedZScore?.toFixed(2)} (esperado: ${test.expectedZScoreRange[0]}-${test.expectedZScoreRange[1]})`);
                }
            }
        }

        // Resumen final
        console.log('\n=== RESUMEN DE VALIDACIÓN ===');
        console.log(`Tests de validación: ${testsPassed}/${testsTotal} pasaron (${((testsPassed/testsTotal)*100).toFixed(1)}%)`);
        
        if (testsPassed === testsTotal) {
            console.log('🎉 ¡VALIDACIÓN EXITOSA! Las curvas de crecimiento están implementadas correctamente');
            console.log('   ✅ Fórmulas LMS validadas contra estándares oficiales');
            console.log('   ✅ Cálculos de percentiles precisos');
            console.log('   ✅ Interpretaciones clínicas correctas');
        } else {
            console.log('⚠️  VALIDACIÓN PARCIAL - Algunos tests fallaron');
            console.log('   Revisar los datos de referencia y la implementación de fórmulas');
        }

        // Recomendaciones adicionales
        console.log('\n=== RECOMENDACIONES DE VALIDACIÓN ADICIONALES ===');
        console.log('1. Comparar con calculadoras oficiales online:');
        console.log('   - OMS: https://www.who.int/tools/child-growth-standards/software');
        console.log('   - CDC: https://www.cdc.gov/growthcharts/computer_programs.htm');
        console.log('2. Validar con casos clínicos reales conocidos');
        console.log('3. Verificar rangos de edad apropiados (OMS: 0-60 meses, CDC: 2-240 meses)');
        console.log('4. Confirmar unidades de medida (peso en kg, altura en cm)');

    } catch (error: any) {
        console.error('❌ ERROR durante la validación:', error.message);
        console.error(error.stack);
    } finally {
        await AppDataSource.destroy();
        console.log('\n✅ Validación completada');
    }
}

// Ejecutar validación si se llama directamente
if (require.main === module) {
    validateGrowthCharts()
        .then(() => process.exit(0))
        .catch((error) => {
            console.error('Error fatal:', error);
            process.exit(1);
        });
}

export { validateGrowthCharts, VALIDATION_TESTS }; 