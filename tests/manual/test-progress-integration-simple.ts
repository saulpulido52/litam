/**
 * Script de prueba simple para verificar la integración de progreso
 * cuando tanto el frontend como el backend estén funcionando
 */

interface TestResult {
  test: string;
  status: 'PASS' | 'FAIL' | 'SKIP';
  message: string;
}

class ProgressIntegrationTester {
  private results: TestResult[] = [];

  private addResult(test: string, status: 'PASS' | 'FAIL' | 'SKIP', message: string) {
    this.results.push({ test, status, message });
    const icon = status === 'PASS' ? '✅' : status === 'FAIL' ? '❌' : '⚠️';
    console.log(`${icon} ${test}: ${message}`);
  }

  async testBackendHealth(): Promise<boolean> {
    try {
      const response = await fetch('http://localhost:4000/api/auth/login', {
        method: 'GET'
      });
      
      if (response.status === 404 || response.status === 405) {
        this.addResult('Backend Health', 'PASS', 'Backend responde con error estructurado (esperado)');
        return true;
      }
      
      this.addResult('Backend Health', 'PASS', `Backend responde (status: ${response.status})`);
      return true;
    } catch (error) {
      this.addResult('Backend Health', 'FAIL', 'Backend no está disponible');
      return false;
    }
  }

  async testFrontendHealth(): Promise<boolean> {
    try {
      const response = await fetch('http://localhost:3000', {
        method: 'GET'
      });
      
      this.addResult('Frontend Health', 'PASS', `Frontend responde (status: ${response.status})`);
      return true;
    } catch (error) {
      this.addResult('Frontend Health', 'FAIL', 'Frontend no está disponible');
      return false;
    }
  }

  async testProgressAPI(): Promise<boolean> {
    try {
      // Intentar login primero
      const loginResponse = await fetch('http://localhost:4000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'nutritionist@demo.com',
          password: 'demo123'
        })
      });

      if (!loginResponse.ok) {
        this.addResult('Progress API Login', 'FAIL', `Login falló: ${loginResponse.status}`);
        return false;
      }

      const loginData = await loginResponse.json();
      const token = loginData.access_token;

      // Probar endpoint de progreso
      const progressResponse = await fetch('http://localhost:4000/api/progress-tracking/me', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (progressResponse.ok) {
        this.addResult('Progress API', 'PASS', 'Endpoint de progreso responde correctamente');
        return true;
      } else {
        this.addResult('Progress API', 'FAIL', `Endpoint falló: ${progressResponse.status}`);
        return false;
      }
    } catch (error) {
      this.addResult('Progress API', 'FAIL', `Error: ${(error as Error).message}`);
      return false;
    }
  }

  async testComponentsExist(): Promise<boolean> {
    try {
      // Verificar que los archivos de componentes existen
      const fs = require('fs');
      const path = require('path');
      
      const componentPaths = [
        'nutri-web/src/components/ProgressCharts/EnhancedEvolutionChart.tsx',
        'nutri-web/src/components/ProgressCharts/ProgressMetrics.tsx',
        'nutri-web/src/components/ProgressCharts/WeightEvolutionChart.tsx',
        'nutri-web/src/pages/ProgressTrackingPage.tsx',
        'nutri-web/src/services/patientsService.ts',
        'nutri-web/src/hooks/usePatients.ts'
      ];

      let allExist = true;
      for (const componentPath of componentPaths) {
        if (fs.existsSync(componentPath)) {
          console.log(`    ✓ ${componentPath}`);
        } else {
          console.log(`    ✗ ${componentPath}`);
          allExist = false;
        }
      }

      if (allExist) {
        this.addResult('Component Files', 'PASS', 'Todos los archivos de componentes existen');
        return true;
      } else {
        this.addResult('Component Files', 'FAIL', 'Algunos archivos de componentes faltan');
        return false;
      }
    } catch (error) {
      this.addResult('Component Files', 'FAIL', `Error verificando archivos: ${(error as Error).message}`);
      return false;
    }
  }

  async runAllTests(): Promise<void> {
    console.log('🧪 Ejecutando pruebas de integración de progreso...\n');

    // Pruebas básicas de conectividad
    const backendOk = await this.testBackendHealth();
    const frontendOk = await this.testFrontendHealth();

    // Pruebas de estructura
    await this.testComponentsExist();

    // Pruebas de API (solo si backend está disponible)
    if (backendOk) {
      await this.testProgressAPI();
    } else {
      this.addResult('Progress API', 'SKIP', 'Backend no disponible');
    }

    // Resumen
    console.log('\n📊 Resumen de pruebas:');
    console.log('========================');
    
    const passed = this.results.filter(r => r.status === 'PASS').length;
    const failed = this.results.filter(r => r.status === 'FAIL').length;
    const skipped = this.results.filter(r => r.status === 'SKIP').length;

    console.log(`✅ Pasadas: ${passed}`);
    console.log(`❌ Fallidas: ${failed}`);
    console.log(`⚠️ Omitidas: ${skipped}`);

    if (failed === 0) {
      console.log('\n🎉 Todas las pruebas disponibles pasaron!');
      if (backendOk && frontendOk) {
        console.log('\n💡 Sistema listo para probar:');
        console.log('   1. Ir a http://localhost:3000');
        console.log('   2. Login con: nutritionist@demo.com / demo123');
        console.log('   3. Navegar a "Seguimiento de Progreso"');
        console.log('   4. Seleccionar un paciente y probar las funciones');
      }
    } else {
      console.log('\n⚠️ Algunas pruebas fallaron. Revisar la configuración.');
    }
  }
}

// Ejecutar las pruebas
const tester = new ProgressIntegrationTester();
tester.runAllTests().catch(console.error); 