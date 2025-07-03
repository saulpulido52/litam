// test-medications-simple.ts
import axios from 'axios';

const BASE_URL = 'http://localhost:4000/api';

async function testMedicationsSimple() {
  console.log('🧪 PRUEBA SIMPLE DE MEDICAMENTOS');
  console.log('='.repeat(50));

  try {
    // 🔐 PASO 1: Login como nutriólogo
    console.log('\n🔐 PASO 1: Autenticando...');
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'nutritionist@demo.com',
      password: 'demo123'
    });

    if (loginResponse.data.status !== 'success') {
      throw new Error('Error en login');
    }

    const token = loginResponse.data.data.token;
    const nutritionist = loginResponse.data.data.user;
    console.log(`✅ Login exitoso: ${nutritionist.full_name}`);

    // 👥 PASO 2: Obtener pacientes asignados
    console.log('\n👥 PASO 2: Obteniendo pacientes...');
    const patientsResponse = await axios.get(`${BASE_URL}/patients/my-patients`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    console.log('Response status:', patientsResponse.data.status);
    console.log('Patients data:', patientsResponse.data.data);

    if (patientsResponse.data.status !== 'success' || !patientsResponse.data.data.patients || patientsResponse.data.data.patients.length === 0) {
      console.log('❌ No hay pacientes asignados a este nutriólogo');
      console.log('🔄 Intentando crear relación con paciente existente...');

      // Obtener un paciente cualquiera
      const allPatientsResponse = await axios.get(`${BASE_URL}/patients`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (allPatientsResponse.data.data.patients.length === 0) {
        throw new Error('No hay pacientes en el sistema');
      }

      const randomPatient = allPatientsResponse.data.data.patients[0];
      console.log(`📝 Usando paciente: ${randomPatient.user.full_name}`);

      // Intentar crear relación
      try {
        await axios.post(`${BASE_URL}/relations`, {
          patientId: randomPatient.id,
          nutritionistId: nutritionist.id
        }, {
          headers: { Authorization: `Bearer ${token}` }
        });
        console.log('✅ Relación creada');
      } catch (error: any) {
        console.log('⚠️ Error al crear relación:', error.response?.data?.message || error.message);
      }

      // Usar este paciente para la prueba
      var selectedPatient = randomPatient;
    } else {
      var selectedPatient = patientsResponse.data.data.patients[0];
      console.log(`✅ Paciente encontrado: ${selectedPatient.user.full_name}`);
    }

    // 📋 PASO 3: Crear expediente con medicamentos
    console.log('\n📋 PASO 3: Creando expediente con medicamentos...');
    
    const expedienteData = {
      recordDate: new Date().toISOString().split('T')[0],
      patientId: selectedPatient.id,
      expedientNumber: `TEST-MED-${Date.now()}`,
      consultationReason: 'Prueba de funcionalidad de medicamentos',
      
      // 🩺 NUEVA FUNCIONALIDAD: Medicamentos
      diagnosedDiseases: {
        hasDisease: true,
        diseaseName: 'Diabetes Mellitus Tipo 2',
        sinceWhen: 'Hace 2 años',
        takesMedication: true,
        medicationsList: [
          'Metformina 500mg - 2 veces al día',
          'Insulina glargina 20 unidades - 1 vez al día',
          'Atorvastatina 20mg - 1 por la noche'
        ],
        hasImportantDisease: true,
        importantDiseaseName: 'Diabetes Mellitus Tipo 2'
      },
      
      nutritionalDiagnosis: 'Control nutricional de diabetes con medicamentos',
      nutritionalPlanAndManagement: 'Plan dietético coordinado con tratamiento farmacológico'
    };

    const createResponse = await axios.post(`${BASE_URL}/clinical-records`, expedienteData, {
      headers: { 
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (createResponse.data.status === 'success') {
      const recordId = createResponse.data.data.record.id;
      console.log('✅ Expediente creado exitosamente');
      console.log(`📋 ID del expediente: ${recordId}`);
      console.log(`💊 Medicamentos registrados: ${expedienteData.diagnosedDiseases.medicationsList.length}`);
      
      // Mostrar medicamentos
      expedienteData.diagnosedDiseases.medicationsList.forEach((med, index) => {
        console.log(`   ${index + 1}. ${med}`);
      });

      // 🔍 PASO 4: Verificar que se guardó correctamente
      console.log('\n🔍 PASO 4: Verificando datos guardados...');
      
      const getResponse = await axios.get(`${BASE_URL}/clinical-records/${recordId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (getResponse.data.status === 'success') {
        const savedRecord = getResponse.data.data.record;
        const savedMedications = savedRecord.diagnosed_diseases?.medicationsList || [];
        
        console.log('✅ Expediente recuperado exitosamente');
        console.log(`💊 Medicamentos guardados: ${savedMedications.length}`);
        
        // Verificar que coincidan
        const expectedMeds = expedienteData.diagnosedDiseases.medicationsList;
        const allMatch = expectedMeds.every(med => savedMedications.includes(med));
        
        if (allMatch) {
          console.log('✅ ¡TODOS LOS MEDICAMENTOS COINCIDEN!');
          console.log('\n🎉 PRUEBA EXITOSA: La funcionalidad de medicamentos está funcionando correctamente');
          
          // Verificar otros campos
          console.log('\n📊 DATOS ADICIONALES VERIFICADOS:');
          console.log(`   - Tiene enfermedad: ${savedRecord.diagnosed_diseases?.hasDisease}`);
          console.log(`   - Nombre enfermedad: ${savedRecord.diagnosed_diseases?.diseaseName}`);
          console.log(`   - Desde cuándo: ${savedRecord.diagnosed_diseases?.sinceWhen}`);
          console.log(`   - Toma medicamentos: ${savedRecord.diagnosed_diseases?.takesMedication}`);
          
        } else {
          console.log('❌ Los medicamentos no coinciden');
          console.log('Esperados:', expectedMeds);
          console.log('Guardados:', savedMedications);
        }
      } else {
        console.log('❌ Error al recuperar expediente');
      }

    } else {
      console.log('❌ Error al crear expediente');
      console.log('Response:', createResponse.data);
    }

  } catch (error: any) {
    console.error('❌ ERROR:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
      console.error('Status:', error.response.status);
    }
  }
}

// Ejecutar
testMedicationsSimple().catch(console.error); 