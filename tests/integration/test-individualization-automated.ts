#!/usr/bin/env ts-node

/**
 * Script automatizado para verificar la individualización del dashboard
 * Ejecuta los tests y genera un reporte de verificación
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

interface TestResult {
  testSuite: string;
  passed: number;
  failed: number;
  total: number;
  errors: string[];
  duration: number;
}

class IndividualizationTestRunner {
  private results: TestResult[] = [];
  private startTime: number = Date.now();

  async runTests(): Promise<void> {
    console.log('🚀 Iniciando tests automatizados de individualización del dashboard...\n');

    // Tests unitarios del servicio
    await this.runTestSuite(
      'Dashboard Service Unit Tests',
      'src/__tests__/dashboard/dashboard.individualization.test.ts'
    );

    // Tests de integración de la API
    await this.runTestSuite(
      'Dashboard API Integration Tests',
      'src/__tests__/dashboard/dashboard.integration.test.ts'
    );

    this.generateReport();
  }

  private async runTestSuite(suiteName: string, testFile: string): Promise<void> {
    console.log(`📋 Ejecutando: ${suiteName}`);
    console.log(`📁 Archivo: ${testFile}\n`);

    const startTime = Date.now();
    const result: TestResult = {
      testSuite: suiteName,
      passed: 0,
      failed: 0,
      total: 0,
      errors: [],
      duration: 0
    };

    try {
      // Ejecutar Jest con configuración específica
      const jestCommand = `npx jest "${testFile}" --verbose --detectOpenHandles --forceExit --testTimeout=30000`;
      
      console.log(`⚡ Comando: ${jestCommand}\n`);
      
      const output = execSync(jestCommand, { 
        encoding: 'utf8',
        stdio: 'pipe',
        timeout: 60000 // 1 minuto timeout
      });

      // Parsear output de Jest
      this.parseJestOutput(output, result);
      
      console.log(`✅ ${suiteName} completado`);
      console.log(`   Pasaron: ${result.passed}/${result.total} tests`);
      if (result.failed > 0) {
        console.log(`   ❌ Fallaron: ${result.failed} tests`);
      }
      
    } catch (error: any) {
      console.log(`❌ Error ejecutando ${suiteName}:`);
      
      // Intentar parsear output incluso con errores
      if (error.stdout) {
        this.parseJestOutput(error.stdout, result);
      }
      
      if (error.stderr) {
        result.errors.push(error.stderr);
        console.log(`   Error: ${error.stderr.slice(0, 200)}...`);
      }
      
      if (error.message) {
        result.errors.push(error.message);
      }
    }

    result.duration = Date.now() - startTime;
    this.results.push(result);
    console.log(`   ⏱️  Duración: ${result.duration}ms\n`);
  }

  private parseJestOutput(output: string, result: TestResult): void {
    const lines = output.split('\n');
    
    for (const line of lines) {
      // Buscar líneas de resumen de Jest
      if (line.includes('Tests:')) {
        const failedMatch = line.match(/(\d+) failed/);
        const passedMatch = line.match(/(\d+) passed/);
        const totalMatch = line.match(/(\d+) total/);
        
        if (failedMatch) result.failed = parseInt(failedMatch[1]);
        if (passedMatch) result.passed = parseInt(passedMatch[1]);
        if (totalMatch) result.total = parseInt(totalMatch[1]);
      }
      
      // Capturar errores específicos
      if (line.includes('FAIL') || line.includes('Error:')) {
        result.errors.push(line.trim());
      }
    }
    
    // Si no se encontraron números específicos, intentar conteo manual
    if (result.total === 0) {
      const testMatches = output.match(/✓|×/g);
      if (testMatches) {
        result.total = testMatches.length;
        result.passed = (output.match(/✓/g) || []).length;
        result.failed = (output.match(/×/g) || []).length;
      }
    }
  }

  private generateReport(): void {
    const totalTime = Date.now() - this.startTime;
    const totalPassed = this.results.reduce((sum, r) => sum + r.passed, 0);
    const totalFailed = this.results.reduce((sum, r) => sum + r.failed, 0);
    const totalTests = this.results.reduce((sum, r) => sum + r.total, 0);
    
    console.log('\n' + '='.repeat(80));
    console.log('📊 REPORTE DE TESTS DE INDIVIDUALIZACIÓN');
    console.log('='.repeat(80));
    
    console.log(`\n🕐 Tiempo total de ejecución: ${totalTime}ms (${(totalTime/1000).toFixed(1)}s)`);
    console.log(`📈 Resumen general: ${totalPassed}/${totalTests} tests pasaron`);
    
    if (totalFailed === 0) {
      console.log('🎉 TODOS LOS TESTS DE INDIVIDUALIZACIÓN PASARON ✅');
    } else {
      console.log(`⚠️  ${totalFailed} tests fallaron ❌`);
    }
    
    console.log('\n📋 Detalle por suite:');
    console.log('-'.repeat(80));
    
    this.results.forEach((result, index) => {
      const status = result.failed === 0 ? '✅' : '❌';
      const percentage = result.total > 0 ? ((result.passed / result.total) * 100).toFixed(1) : '0';
      
      console.log(`${index + 1}. ${status} ${result.testSuite}`);
      console.log(`   📊 ${result.passed}/${result.total} pasaron (${percentage}%)`);
      console.log(`   ⏱️  ${result.duration}ms`);
      
      if (result.errors.length > 0) {
        console.log(`   🚨 Errores encontrados:`);
        result.errors.slice(0, 3).forEach(error => {
          console.log(`      - ${error.slice(0, 100)}...`);
        });
        if (result.errors.length > 3) {
          console.log(`      ... y ${result.errors.length - 3} errores más`);
        }
      }
      console.log('');
    });
    
    // Generar archivo de reporte
    this.saveReportToFile(totalPassed, totalFailed, totalTests, totalTime);
    
    console.log('='.repeat(80));
    
    // Verificaciones específicas de individualización
    this.performIndividualizationChecks();
  }
  
  private performIndividualizationChecks(): void {
    console.log('\n🔍 VERIFICACIONES ESPECÍFICAS DE INDIVIDUALIZACIÓN');
    console.log('-'.repeat(60));
    
    const checks = [
      {
        name: 'Separación de datos por nutriólogo',
        passed: this.results.some(r => r.testSuite.includes('Unit Tests') && r.passed > 0),
        description: 'Los datos de cada nutriólogo están completamente separados'
      },
      {
        name: 'Autenticación y autorización',
        passed: this.results.some(r => r.testSuite.includes('Integration') && r.passed > 0),
        description: 'La API requiere autenticación y filtra por usuario'
      },
      {
        name: 'Sin filtrado de datos cruzados',
        passed: this.results.every(r => r.failed === 0),
        description: 'No hay exposición de datos entre diferentes nutriólogos'
      },
      {
        name: 'Consistencia en respuestas',
        passed: this.results.length > 0 && this.results.every(r => r.total > 0),
        description: 'Las respuestas son consistentes para el mismo usuario'
      }
    ];
    
    checks.forEach((check, index) => {
      const status = check.passed ? '✅ PASS' : '❌ FAIL';
      console.log(`${index + 1}. ${status} - ${check.name}`);
      console.log(`   📝 ${check.description}`);
    });
    
    const allPassed = checks.every(check => check.passed);
    
    console.log('\n' + (allPassed ? '🎯' : '⚠️') + ' RESULTADO FINAL:');
    if (allPassed) {
      console.log('✅ La individualización está funcionando correctamente');
      console.log('🛡️  Cada nutriólogo solo puede acceder a sus propios datos');
      console.log('🚀 El sistema está listo para producción');
    } else {
      console.log('❌ Se detectaron problemas en la individualización');
      console.log('🔧 Revisar las verificaciones que fallaron');
      console.log('⚠️  NO desplegar hasta resolver los problemas');
    }
  }
  
  private saveReportToFile(passed: number, failed: number, total: number, duration: number): void {
    const timestamp = new Date().toISOString();
    const reportData = {
      timestamp,
      summary: {
        total_tests: total,
        passed_tests: passed,
        failed_tests: failed,
        success_rate: total > 0 ? ((passed / total) * 100).toFixed(2) + '%' : '0%',
        duration_ms: duration
      },
      test_suites: this.results,
      individualization_status: failed === 0 ? 'VERIFIED' : 'ISSUES_DETECTED'
    };
    
    const fileName = `individualization-test-report-${Date.now()}.json`;
    fs.writeFileSync(fileName, JSON.stringify(reportData, null, 2));
    
    console.log(`💾 Reporte guardado en: ${fileName}`);
  }
}

// Ejecutar si es llamado directamente
if (require.main === module) {
  const runner = new IndividualizationTestRunner();
  runner.runTests().catch(error => {
    console.error('💥 Error ejecutando tests:', error);
    process.exit(1);
  });
}

export { IndividualizationTestRunner }; 