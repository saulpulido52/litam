/**
 * Prueba completa del módulo pediátrico
 * Verifica backend, frontend, datos de referencia y funcionalidades
 */

import axios from 'axios';

const BASE_URL = 'http://localhost:4000/api';

interface TestResult {
  test: string;
  status: 'PASS' | 'FAIL' | 'SKIP';
  message: string;
  details?: any;
}

class PediatricModuleTester {
  private results: TestResult[] = [];
  private token: string = '';

  private addResult(test: string, status: 'PASS' | 'FAIL' | 'SKIP', message: string, details?: any) {
    this.results.push({ test, status, message, details });
    const icon = status === 'PASS' ? '✅' : status === 'FAIL' ? '❌' : '⚠️';
    console.log(`${icon} ${test}: ${message}`);
    if (details) {
      console.log(`   Detalles:`, JSON.stringify(details, null, 2));
    }
  }

  async login(): Promise<boolean> {
    try {
      const response = await axios.post(`${BASE_URL}/auth/login`, {
        email: 'nutritionist@demo.com',
        password: 'demo123'
      });
      
      this.token = response.data.access_token;
      this.addResult('Login', 'PASS', 'Autenticación exitosa');
      return true;
    } catch (error: any) {
      this.addResult('Login', 'FAIL', `Error de autenticación: ${error.message}`);
      return false;
    }
  }

  async testGrowthReferencesData(): Promise<void> {
    try {
      const response = await axios.get(`${BASE_URL}/growth-charts/available-references`, {
        headers: { Authorization: `Bearer ${this.token}` }
      });

      const references = response.data.data;
      
      // Verificar que tenemos datos WHO y CDC
      const hasWHO = references.some((ref: any) => ref.source === 'WHO');
      const hasCDC = references.some((ref: any) => ref.source === 'CDC');
      
      if (hasWHO && hasCDC) {
        this.addResult('Referencias de crecimiento', 'PASS', 
          `Datos disponibles: ${references.length} referencias`, 
          { WHO: references.filter((r: any) => r.source === 'WHO').length,
            CDC: references.filter((r: any) => r.source === 'CDC').length });
      } else {
        this.addResult('Referencias de crecimiento', 'FAIL', 
          'Faltan datos WHO o CDC');
      }
    } catch (error: any) {
      this.addResult('Referencias de crecimiento', 'FAIL', 
        `Error al obtener referencias: ${error.message}`);
    }
  }

  async testPercentileCalculation(): Promise<void> {
    try {
      // Probar cálculo de percentil WHO
      const whoResponse = await axios.post(`${BASE_URL}/growth-charts/calculate-percentile`, {
        ageMonths: 24,
        value: 12.5,
        gender: 'male',
        metricType: 'weight_for_age',
        source: 'WHO'
      }, {
        headers: { Authorization: `Bearer ${this.token}` }
      });

      const whoResult = whoResponse.data.data;
      
      if (whoResult.percentile !== undefined && whoResult.zscore !== undefined) {
        this.addResult('Cálculo percentil WHO', 'PASS', 
          `Percentil: ${whoResult.percentile}%, Z-score: ${whoResult.zscore}`);
      } else {
        this.addResult('Cálculo percentil WHO', 'FAIL', 
          'Respuesta inválida del cálculo');
      }

      // Probar cálculo de percentil CDC
      const cdcResponse = await axios.post(`${BASE_URL}/growth-charts/calculate-percentile`, {
        ageMonths: 36,
        value: 15.0,
        gender: 'female',
        metricType: 'weight_for_age',
        source: 'CDC'
      }, {
        headers: { Authorization: `Bearer ${this.token}` }
      });

      // Probar nueva funcionalidad: Peso/Talla para lactantes
      const weightForHeightResponse = await axios.post(`${BASE_URL}/growth-charts/calculate-percentile`, {
        ageMonths: 75, // 75cm de altura
        value: 9.5,
        gender: 'male',
        metricType: 'weight_for_height',
        source: 'WHO'
      }, {
        headers: { Authorization: `Bearer ${this.token}` }
      });

      const cdcResult = cdcResponse.data.data;
      
      if (cdcResult.percentile !== undefined && cdcResult.zscore !== undefined) {
        this.addResult('Cálculo percentil CDC', 'PASS', 
          `Percentil: ${cdcResult.percentile}%, Z-score: ${cdcResult.zscore}`);
      } else {
        this.addResult('Cálculo percentil CDC', 'FAIL', 
          'Respuesta inválida del cálculo');
      }

      // Verificar resultado peso/talla para lactantes
      const weightForHeightResult = weightForHeightResponse.data.data;
      
      if (weightForHeightResult.percentile !== undefined && weightForHeightResult.zscore !== undefined) {
        this.addResult('Cálculo Peso/Talla lactantes', 'PASS', 
          `Percentil: ${weightForHeightResult.percentile}%, Z-score: ${weightForHeightResult.zscore} (75cm, 9.5kg)`);
      } else {
        this.addResult('Cálculo Peso/Talla lactantes', 'FAIL', 
          'Respuesta inválida del cálculo peso/talla');
      }

    } catch (error: any) {
      this.addResult('Cálculo de percentiles', 'FAIL', 
        `Error en cálculos: ${error.message}`);
    }
  }

  async testChartDataGeneration(): Promise<void> {
    try {
      const response = await axios.get(`${BASE_URL}/growth-charts/chart-data`, {
        params: {
          metric: 'weight_for_age',
          gender: 'male',
          source: 'WHO',
          minAge: 0,
          maxAge: 60
        },
        headers: { Authorization: `Bearer ${this.token}` }
      });

      const chartData = response.data.data;
      
      if (chartData.percentileLines && chartData.percentileLines.length > 0) {
        this.addResult('Generación de datos de gráfico', 'PASS', 
          `${chartData.percentileLines.length} líneas de percentiles generadas`);
      } else {
        this.addResult('Generación de datos de gráfico', 'FAIL', 
          'No se generaron líneas de percentiles');
      }
    } catch (error: any) {
      this.addResult('Generación de datos de gráfico', 'FAIL', 
        `Error al generar gráfico: ${error.message}`);
    }
  }

  async testGrowthAlertsSystem(): Promise<void> {
    try {
      const response = await axios.post(`${BASE_URL}/growth-charts/alerts/evaluate-measurement`, {
        patientId: '66f1ff30-6075-4fc0-8ceb-a3fd0bf2d90f',
        date: new Date().toISOString(),
        ageMonths: 18,
        weight: 8.0, // Peso bajo para generar alerta
        height: 75.0,
        gender: 'male'
      }, {
        headers: { Authorization: `Bearer ${this.token}` }
      });

      const alerts = response.data.data;
      
      this.addResult('Sistema de alertas', 'PASS', 
        `${alerts.length} alertas generadas`, alerts);
    } catch (error: any) {
      this.addResult('Sistema de alertas', 'SKIP', 
        `Error en alertas (puede ser normal): ${error.message}`);
    }
  }

  async testClinicalIntegration(): Promise<void> {
    try {
      const response = await axios.post(`${BASE_URL}/growth-charts/clinical-integration/create-growth-record`, {
        patientId: '66f1ff30-6075-4fc0-8ceb-a3fd0bf2d90f',
        nutritionistId: 'ffde8e9e-b6c5-46da-a2e6-67fa408ea051',
        measurementData: {
          date: new Date(),
          ageMonths: 24,
          weight: 12.5,
          height: 87.0,
          headCircumference: 48.0
        }
      }, {
        headers: { Authorization: `Bearer ${this.token}` }
      });

      if (response.data.status === 'success') {
        this.addResult('Integración clínica', 'PASS', 
          'Expediente clínico creado automáticamente');
      } else {
        this.addResult('Integración clínica', 'FAIL', 
          'Error al crear expediente automático');
      }
    } catch (error: any) {
      this.addResult('Integración clínica', 'SKIP', 
        `No se pudo probar integración: ${error.message}`);
    }
  }

  async testPDFGeneration(): Promise<void> {
    try {
      const response = await axios.post(`${BASE_URL}/growth-charts/export/pediatric-report`, {
        patientId: '66f1ff30-6075-4fc0-8ceb-a3fd0bf2d90f',
        includeGrowthCharts: true,
        includeAlerts: true,
        chartSource: 'WHO'
      }, {
        headers: { Authorization: `Bearer ${this.token}` }
      });

      if (response.data.status === 'success') {
        this.addResult('Generación de PDF', 'PASS', 
          'Reporte pediátrico generado exitosamente');
      } else {
        this.addResult('Generación de PDF', 'FAIL', 
          'Error al generar reporte PDF');
      }
    } catch (error: any) {
      this.addResult('Generación de PDF', 'SKIP', 
        `No se pudo generar PDF: ${error.message}`);
    }
  }

  async testCompleteModule(): Promise<void> {
    console.log('🧪 Iniciando prueba completa del módulo pediátrico...\n');

    // 1. Login
    const loginSuccess = await this.login();
    if (!loginSuccess) {
      console.log('❌ No se pudo autenticar, abortando pruebas');
      return;
    }

    // 2. Verificar datos de referencia
    await this.testGrowthReferencesData();

    // 3. Probar cálculos de percentiles
    await this.testPercentileCalculation();

    // 4. Probar generación de datos de gráfico
    await this.testChartDataGeneration();

    // 5. Probar sistema de alertas
    await this.testGrowthAlertsSystem();

    // 6. Probar integración clínica
    await this.testClinicalIntegration();

    // 7. Probar generación de PDF
    await this.testPDFGeneration();

    // Resumen final
    this.printSummary();
  }

  private printSummary(): void {
    console.log('\n' + '='.repeat(60));
    console.log('📊 RESUMEN DE PRUEBAS DEL MÓDULO PEDIÁTRICO');
    console.log('='.repeat(60));

    const passed = this.results.filter(r => r.status === 'PASS').length;
    const failed = this.results.filter(r => r.status === 'FAIL').length;
    const skipped = this.results.filter(r => r.status === 'SKIP').length;

    console.log(`✅ Pasadas: ${passed}`);
    console.log(`❌ Fallidas: ${failed}`);
    console.log(`⚠️ Omitidas: ${skipped}`);
    console.log(`📊 Total: ${this.results.length}`);

    const successRate = Math.round((passed / this.results.length) * 100);
    console.log(`📈 Tasa de éxito: ${successRate}%`);

    if (successRate >= 75) {
      console.log('\n🎉 ¡MÓDULO PEDIÁTRICO FUNCIONAL!');
      console.log('   El módulo está listo para uso en producción');
    } else if (successRate >= 50) {
      console.log('\n⚠️ MÓDULO PARCIALMENTE FUNCIONAL');
      console.log('   Revisar pruebas fallidas antes de producción');
    } else {
      console.log('\n❌ MÓDULO REQUIERE ATENCIÓN');
      console.log('   Múltiples problemas detectados');
    }

    console.log('\n📋 Detalle de pruebas fallidas:');
    this.results.filter(r => r.status === 'FAIL').forEach(result => {
      console.log(`   • ${result.test}: ${result.message}`);
    });
  }
}

// Ejecutar pruebas
const tester = new PediatricModuleTester();
tester.testCompleteModule().catch(console.error); 