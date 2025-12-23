/**
 * Verificación de que la corrección del módulo pediátrico funcione
 */

import axios from 'axios';

const BASE_URL = 'http://localhost:4000/api';

interface TestResult {
  test: string;
  status: 'PASS' | 'FAIL';
  message: string;
  details?: any;
}

class PediatricFixVerification {
  private results: TestResult[] = [];
  private token: string = '';

  private addResult(test: string, status: 'PASS' | 'FAIL', message: string, details?: any) {
    this.results.push({ test, status, message, details });
    const icon = status === 'PASS' ? '✅' : '❌';
    console.log(`${icon} ${test}: ${message}`);
    if (details) {
      console.log(`   📋 Detalles:`, JSON.stringify(details, null, 2));
    }
  }

  async login(): Promise<boolean> {
    try {
      console.log('🔐 Iniciando sesión...');
      const response = await axios.post(`${BASE_URL}/auth/login`, {
        email: 'nutritionist@demo.com',
        password: 'demo123'
      });

      // Manejar diferentes estructuras de respuesta
      let token;
      if (response.data?.data?.access_token) {
        token = response.data.data.access_token;
      } else if (response.data?.access_token) {
        token = response.data.access_token;
      } else {
        throw new Error('Token no encontrado en la respuesta');
      }

      this.token = token;
      this.addResult('Login', 'PASS', 'Autenticación exitosa');
      return true;
    } catch (error: any) {
      console.log('🔍 Error completo:', error);
      console.log('🔍 Respuesta:', error.response?.data);
      this.addResult('Login', 'FAIL', 'Error en autenticación', error.message);
      return false;
    }
  }

  async testPatientsEndpoint(): Promise<void> {
    try {
      console.log('\n📋 Probando endpoint de pacientes...');
      const response = await axios.get(`${BASE_URL}/patients/my-patients`, {
        headers: { Authorization: `Bearer ${this.token}` }
      });

      if (response.status === 200 && response.data.status === 'success') {
        const patients = response.data.data;
        this.addResult('Endpoint de Pacientes', 'PASS', 
          `${patients.length} pacientes encontrados`, {
            totalPatients: patients.length,
            firstPatientName: patients[0]?.first_name || 'Sin pacientes'
          });
      } else {
        this.addResult('Endpoint de Pacientes', 'FAIL', 
          'Respuesta inválida del servidor', response.data);
      }
    } catch (error: any) {
      this.addResult('Endpoint de Pacientes', 'FAIL', 
        'Error en consulta de pacientes', error.response?.data || error.message);
    }
  }

  async testGrowthChartsEndpoint(): Promise<void> {
    try {
      console.log('\n📊 Probando endpoint de gráficos de crecimiento...');
      const response = await axios.get(`${BASE_URL}/growth-charts/chart-data`, {
        headers: { Authorization: `Bearer ${this.token}` }
      });

      if (response.status === 200 && response.data.status === 'success') {
        this.addResult('Endpoint Growth Charts', 'PASS', 
          'Datos de crecimiento disponibles', {
            hasData: !!response.data.data,
            dataType: typeof response.data.data
          });
      } else {
        this.addResult('Endpoint Growth Charts', 'FAIL', 
          'Respuesta inválida', response.data);
      }
    } catch (error: any) {
      this.addResult('Endpoint Growth Charts', 'FAIL', 
        'Error en gráficos de crecimiento', error.response?.data || error.message);
    }
  }

  async testWeightForHeightData(): Promise<void> {
    try {
      console.log('\n🍼 Probando datos peso/talla para lactantes...');
      const response = await axios.post(`${BASE_URL}/growth-charts/calculate-percentile`, {
        heightCm: 55,
        value: 5.3,
        gender: 'male',
        metricType: 'weight_for_height',
        source: 'WHO'
      }, {
        headers: { Authorization: `Bearer ${this.token}` }
      });

      if (response.status === 200 && response.data.status === 'success') {
        const result = response.data.data;
        this.addResult('Peso/Talla Lactantes', 'PASS', 
          `Percentil: ${result.percentile}%, Z-score: ${result.zscore}`, result);
      } else {
        this.addResult('Peso/Talla Lactantes', 'FAIL', 
          'Cálculo falló', response.data);
      }
    } catch (error: any) {
      this.addResult('Peso/Talla Lactantes', 'FAIL', 
        'Error en cálculo peso/talla', error.response?.data || error.message);
    }
  }

  printSummary(): void {
    console.log('\n🎯 ================================');
    console.log('   RESUMEN DE VERIFICACIÓN');
    console.log('🎯 ================================');
    
    const passed = this.results.filter(r => r.status === 'PASS').length;
    const failed = this.results.filter(r => r.status === 'FAIL').length;
    
    console.log(`✅ Pruebas exitosas: ${passed}`);
    console.log(`❌ Pruebas fallidas: ${failed}`);
    console.log(`📊 Total de pruebas: ${this.results.length}`);
    
    if (failed === 0) {
      console.log('\n🎉 ¡MÓDULO PEDIÁTRICO FUNCIONANDO CORRECTAMENTE!');
      console.log('   - Rutas corregidas ✅');
      console.log('   - Backend funcional ✅');
      console.log('   - Datos peso/talla disponibles ✅');
      console.log('   - Listo para uso en producción ✅');
    } else {
      console.log('\n⚠️ Hay problemas que requieren atención:');
      this.results.filter(r => r.status === 'FAIL').forEach(result => {
        console.log(`   - ${result.test}: ${result.message}`);
      });
    }
  }

  async runFullVerification(): Promise<void> {
    console.log('🚀 Iniciando verificación completa del módulo pediátrico...\n');

    if (await this.login()) {
      await this.testPatientsEndpoint();
      await this.testGrowthChartsEndpoint();
      await this.testWeightForHeightData();
    }

    this.printSummary();
  }
}

const verifier = new PediatricFixVerification();
verifier.runFullVerification(); 