import { AppDataSource } from '../src/database/data-source';
import clinicalRecordService from '../src/modules/clinical_records/clinical_record.service';

async function testDetectionEndpoint() {
  console.log('🧪 Iniciando prueba del endpoint de detección automática...');

  try {
    // Inicializar base de datos
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
      console.log('✅ Base de datos inicializada');
    }

    // Datos de prueba
    const testData = {
      patientId: '123e4567-e89b-12d3-a456-426614174000', // UUID de ejemplo
      motivoConsulta: 'Control de peso y seguimiento nutricional',
      esProgramada: true,
      tipoConsultaSolicitada: 'seguimiento'
    };

    console.log('📊 Datos de prueba:', testData);

    // Llamar al servicio directamente
    const resultado = await clinicalRecordService.detectarTipoExpediente(testData);
    
    console.log('✅ Resultado exitoso:');
    console.log('   Tipo sugerido:', resultado.tipoSugerido);
    console.log('   Razón:', resultado.razon);
    console.log('   Expediente base ID:', resultado.expedienteBaseId || 'N/A');
    console.log('   Requiere confirmación:', resultado.requiereConfirmacion);
    console.log('   Alertas:', resultado.alertas || 'Ninguna');

    console.log('\n🎉 ¡Endpoint funcionando correctamente!');

  } catch (error) {
    console.error('❌ Error en la prueba:', error);
    
    if (error instanceof Error) {
      console.error('   Mensaje:', error.message);
      console.error('   Stack:', error.stack);
    }
  } finally {
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
      console.log('🔐 Conexión a base de datos cerrada');
    }
  }
}

// Ejecutar la prueba
testDetectionEndpoint(); 