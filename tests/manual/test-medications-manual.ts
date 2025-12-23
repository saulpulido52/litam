// test-medications-manual.ts
import axios from 'axios';

async function testMedicationsManual() {
  console.log('🧪 PRUEBA MANUAL DE MEDICAMENTOS');
  console.log('='.repeat(50));

  // Token obtenido del login anterior
  const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJlYWE1YWU0NS1kMmM0LTQ1ZjYtYWI4OC1hYmMwZjJlOWE5OTUiLCJyb2xlIjoibnV0cml0aW9uaXN0IiwiaWF0IjoxNzUxMTczOTQwLCJleHAiOjE3NTExNzc1NDB9.CeCgQEZvi50RC-EgB6hC4RFP2DOEhW_-vBcZo_N3EUI';
  
  try {
    // 👥 PASO 1: Obtener pacientes
    console.log('\n👥 PASO 1: Obteniendo pacientes...');
    const patientsResponse = await axios.get('http://localhost:4000/api/patients/my-patients', {
      headers: { Authorization: `Bearer ${token}` }
    });

    console.log('Status:', patientsResponse.data.status);
    console.log('Patients data:', JSON.stringify(patientsResponse.data.data, null, 2));

    // Si no hay pacientes asignados, obtenemos todos los pacientes
    if (!patientsResponse.data.data.patients || patientsResponse.data.data.patients.length === 0) {
      console.log('\n🔄 No hay pacientes asignados, obteniendo todos...');
      
      const allPatientsResponse = await axios.get('http://localhost:4000/api/patients', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log('All patients:', JSON.stringify(allPatientsResponse.data.data, null, 2));
      
      if (allPatientsResponse.data.data.patients.length > 0) {
        var selectedPatient = allPatientsResponse.data.data.patients[0];
        console.log(`📝 Usando paciente: ${selectedPatient.user.full_name} (ID: ${selectedPatient.id})`);
      } else {
        throw new Error('No hay pacientes disponibles');
      }
    } else {
      var selectedPatient = patientsResponse.data.data.patients[0];
      console.log(`✅ Paciente asignado: ${selectedPatient.user.full_name} (ID: ${selectedPatient.id})`);
    }

    // 📋 PASO 2: Crear expediente con medicamentos
    console.log('\n📋 PASO 2: Creando expediente con medicamentos...');
    
    const expedienteData = {
      recordDate: '2025-06-29',
      patientId: selectedPatient.id,
      expedientNumber: `MANUAL-TEST-${Date.now()}`,
      consultationReason: 'Prueba manual de funcionalidad de medicamentos',
      
      // 🩺 NUEVA FUNCIONALIDAD: Medicamentos
      diagnosedDiseases: {
        hasDisease: true,
        diseaseName: 'Diabetes Mellitus Tipo 2',
        sinceWhen: 'Hace 2 años',
        takesMedication: true,
        medicationsList: [
          'Metformina 500mg - 2 veces al día con alimentos',
          'Insulina glargina 20 unidades - 1 vez al día',
          'Atorvastatina 20mg - 1 por la noche'
        ]
      },
      
      nutritionalDiagnosis: 'Control nutricional de diabetes tipo 2',
      nutritionalPlanAndManagement: 'Plan alimentario coordinado con medicamentos'
    };

    console.log('Enviando datos:', JSON.stringify(expedienteData, null, 2));

    const createResponse = await axios.post('http://localhost:4000/api/clinical-records', expedienteData, {
      headers: { 
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('✅ Respuesta del servidor:', JSON.stringify(createResponse.data, null, 2));

    if (createResponse.data.status === 'success') {
      const recordId = createResponse.data.data.record.id;
      console.log(`\n✅ EXPEDIENTE CREADO EXITOSAMENTE`);
      console.log(`📋 ID: ${recordId}`);

      // 🔍 PASO 3: Verificar expediente
      console.log('\n🔍 PASO 3: Verificando expediente...');
      
      const getResponse = await axios.get(`http://localhost:4000/api/clinical-records/${recordId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const savedRecord = getResponse.data.data.record;
      console.log('Expediente guardado:', JSON.stringify(savedRecord.diagnosed_diseases, null, 2));

      const savedMedications = savedRecord.diagnosed_diseases?.medicationsList || [];
      console.log(`\n💊 MEDICAMENTOS VERIFICADOS:`);
      console.log(`   Total: ${savedMedications.length}`);
      savedMedications.forEach((med: string, index: number) => {
        console.log(`   ${index + 1}. ${med}`);
      });

      // Verificar que coincidan
      const expectedMeds = expedienteData.diagnosedDiseases.medicationsList;
      const allMatch = expectedMeds.every(med => savedMedications.includes(med));
      
      if (allMatch) {
        console.log('\n🎉 ¡PRUEBA EXITOSA!');
        console.log('✅ Todos los medicamentos se guardaron correctamente');
        console.log('✅ La funcionalidad de medicamentos está funcionando perfectamente');
      } else {
        console.log('\n❌ Error: Los medicamentos no coinciden');
        console.log('Esperados:', expectedMeds);
        console.log('Guardados:', savedMedications);
      }

    } else {
      console.log('❌ Error al crear expediente');
    }

  } catch (error: any) {
    console.error('❌ ERROR:', error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Response:', JSON.stringify(error.response.data, null, 2));
    }
  }
}

testMedicationsManual().catch(console.error); 