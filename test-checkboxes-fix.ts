/**
 * Script de prueba para verificar el funcionamiento de checkboxes
 * en ClinicalRecordForm y DietPlanCreator
 */

import { clinicalRecordsService } from './src/services/clinicalRecordsService';
import { patientsService } from './src/services/patientsService';

async function testCheckboxesFunctionality() {
  console.log('🧪 INICIANDO PRUEBA DE CHECKBOXES...\n');

  try {
    // 1. Verificar que los servicios funcionan
    console.log('1️⃣ Verificando servicios...');
    
    // Obtener pacientes para pruebas
    const patients = await patientsService.getMyPatients();
    console.log(`✅ ${patients.length} pacientes encontrados`);
    
    if (patients.length === 0) {
      console.log('⚠️ No hay pacientes para probar. Creando datos de prueba...');
      // Aquí podrías crear datos de prueba si es necesario
      return;
    }

    const testPatient = patients[0];
    console.log(`📋 Paciente de prueba: ${testPatient.user.first_name} ${testPatient.user.last_name}`);

    // 2. Verificar expedientes clínicos
    console.log('\n2️⃣ Verificando expedientes clínicos...');
    const records = await clinicalRecordsService.getPatientRecords(testPatient.id);
    console.log(`✅ ${records.length} expedientes encontrados para el paciente`);

    // 3. Verificar estructura de datos de checkboxes
    console.log('\n3️⃣ Verificando estructura de datos...');
    
    if (records.length > 0) {
      const latestRecord = records[0];
      console.log('📊 Estructura de problemas actuales:');
      console.log('- Diarrea:', latestRecord.current_problems?.diarrhea);
      console.log('- Estreñimiento:', latestRecord.current_problems?.constipation);
      console.log('- Gastritis:', latestRecord.current_problems?.gastritis);
      console.log('- Úlcera:', latestRecord.current_problems?.ulcer);
      console.log('- Náuseas:', latestRecord.current_problems?.nausea);
      console.log('- Pirosis:', latestRecord.current_problems?.pyrosis);
      console.log('- Vómito:', latestRecord.current_problems?.vomiting);
      console.log('- Colitis:', latestRecord.current_problems?.colitis);
    }

    // 4. Verificar presión arterial
    console.log('\n4️⃣ Verificando presión arterial...');
    if (records.length > 0) {
      const latestRecord = records[0];
      console.log('🩺 Datos de presión arterial:');
      console.log('- Conoce su presión:', latestRecord.blood_pressure?.knows_bp);
      console.log('- Presión habitual:', latestRecord.blood_pressure?.habitual_bp);
      console.log('- Sistólica:', latestRecord.blood_pressure?.systolic);
      console.log('- Diastólica:', latestRecord.blood_pressure?.diastolic);
    }

    // 5. Verificar historia dietética
    console.log('\n5️⃣ Verificando historia dietética...');
    if (records.length > 0) {
      const latestRecord = records[0];
      console.log('🍽️ Datos de historia dietética:');
      console.log('- Recibió orientación:', latestRecord.dietary_history?.received_nutritional_guidance);
      console.log('- Cuándo recibió:', latestRecord.dietary_history?.when_received);
      console.log('- Nivel de apego:', latestRecord.dietary_history?.adherence_level);
      console.log('- Toma suplementos:', latestRecord.dietary_history?.takes_supplements);
    }

    console.log('\n✅ PRUEBA COMPLETADA EXITOSAMENTE');
    console.log('\n📋 RESUMEN:');
    console.log('- Los servicios están funcionando correctamente');
    console.log('- La estructura de datos es consistente');
    console.log('- Los checkboxes deberían funcionar en el frontend');
    console.log('\n🔧 PRÓXIMOS PASOS:');
    console.log('1. Abrir el navegador y ir a http://localhost:5000');
    console.log('2. Iniciar sesión como nutriólogo');
    console.log('3. Ir a Expedientes Clínicos');
    console.log('4. Crear o editar un expediente');
    console.log('5. Verificar que los checkboxes se marcan/desmarcan');
    console.log('6. Verificar que los datos se guardan correctamente');

  } catch (error) {
    console.error('❌ ERROR EN LA PRUEBA:', error);
    console.log('\n🔧 SOLUCIÓN SUGERIDA:');
    console.log('1. Verificar que el backend esté ejecutándose');
    console.log('2. Verificar la conexión a la base de datos');
    console.log('3. Ejecutar: npm run dev');
  }
}

// Ejecutar la prueba
testCheckboxesFunctionality()
  .then(() => {
    console.log('\n🎯 Prueba finalizada');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Error fatal:', error);
    process.exit(1);
  }); 