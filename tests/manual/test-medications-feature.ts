// test-medications-feature.ts
import axios from 'axios';

const BASE_URL = 'http://localhost:4000/api';

interface TestResult {
  step: string;
  success: boolean;
  data?: any;
  error?: string;
}

async function testMedicationsFeature(): Promise<TestResult[]> {
  const results: TestResult[] = [];
  let authToken = '';
  let patientId = '';
  let recordId = '';

  try {
    // 🔐 PASO 1: Autenticación como nutriólogo
    console.log('🔐 PASO 1: Autenticando como nutriólogo...');
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'nutritionist@demo.com',
      password: 'demo123'
    });

    if (loginResponse.data.status === 'success') {
      authToken = loginResponse.data.data.token;
      results.push({
        step: 'Autenticación',
        success: true,
        data: { userId: loginResponse.data.data.user.id, role: loginResponse.data.data.user.role.name }
      });
      console.log('✅ Autenticación exitosa');
    } else {
      throw new Error('Fallo en autenticación');
    }

    // 👤 PASO 2: Buscar un paciente existente
    console.log('👤 PASO 2: Buscando paciente...');
    const patientsResponse = await axios.get(`${BASE_URL}/patients/my-patients`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });

    if (patientsResponse.data.status === 'success' && patientsResponse.data.data.patients.length > 0) {
      patientId = patientsResponse.data.data.patients[0].id;
      results.push({
        step: 'Búsqueda de paciente',
        success: true,
        data: { patientId, patientName: patientsResponse.data.data.patients[0].user.full_name }
      });
      console.log(`✅ Paciente encontrado: ${patientsResponse.data.data.patients[0].user.full_name}`);
    } else {
      throw new Error('No se encontraron pacientes');
    }

    // 📋 PASO 3: Crear expediente clínico con datos de medicamentos
    console.log('📋 PASO 3: Creando expediente con medicamentos...');
    
    const clinicalRecordData = {
      recordDate: new Date().toISOString().split('T')[0],
      patientId: patientId,
      expedientNumber: `EXP-TEST-${Date.now()}`,
      consultationReason: 'Prueba de funcionalidad de medicamentos - Control de diabetes y hipertensión',
      
      // 🩺 NUEVA FUNCIONALIDAD: Enfermedades y Medicamentos
      diagnosedDiseases: {
        hasDisease: true,
        diseaseName: 'Diabetes Mellitus Tipo 2 e Hipertensión Arterial',
        sinceWhen: 'Hace 3 años',
        takesMedication: true,
        medicationsList: [
          'Metformina 500mg - 2 veces al día',
          'Losartán 50mg - 1 vez al día por la mañana', 
          'Aspirina 100mg - 1 vez al día después de la cena',
          'Atorvastatina 20mg - 1 por la noche'
        ],
        hasImportantDisease: true,
        importantDiseaseName: 'Diabetes Mellitus Tipo 2',
        takesSpecialTreatment: true,
        specialTreatmentDetails: 'Control glucémico estricto, dieta especializada y ejercicio supervisado',
        hasSurgery: false,
        surgeryDetails: ''
      },
      
      currentProblems: {
        gastritis: true,
        constipation: false,
        diarrhea: false,
        observations: 'Paciente reporta molestias gástricas ocasionales, posiblemente relacionadas con medicamentos'
      },
      
      anthropometricMeasurements: {
        currentWeightKg: 82.5,
        habitualWeightKg: 85.0,
        heightM: 1.68,
        waistCircCm: 92.0
      },
      
      nutritionalDiagnosis: 'Sobrepeso grado I. Control metabólico de diabetes mellitus tipo 2. Seguimiento nutricional para optimización de medicamentos.',
      
      nutritionalPlanAndManagement: 'Plan alimentario para diabético hipertenso. Coordinación con tratamiento farmacológico. Monitoreo de interacciones fármaco-nutriente.',
      
      evolutionAndFollowUpNotes: 'Primera consulta con nueva funcionalidad de medicamentos. Se registran 4 medicamentos actuales para seguimiento de interacciones.'
    };

    const createRecordResponse = await axios.post(`${BASE_URL}/clinical-records`, clinicalRecordData, {
      headers: { 
        Authorization: `Bearer ${authToken}`,
        'Content-Type': 'application/json'
      }
    });

    if (createRecordResponse.data.status === 'success') {
      recordId = createRecordResponse.data.data.record.id;
      results.push({
        step: 'Creación de expediente',
        success: true,
        data: { 
          recordId,
          medicationsCount: clinicalRecordData.diagnosedDiseases.medicationsList.length,
          medications: clinicalRecordData.diagnosedDiseases.medicationsList
        }
      });
      console.log('✅ Expediente creado exitosamente');
      console.log(`📊 Medicamentos registrados: ${clinicalRecordData.diagnosedDiseases.medicationsList.length}`);
    } else {
      throw new Error('Error al crear expediente');
    }

    // 🔍 PASO 4: Recuperar y verificar los datos guardados
    console.log('🔍 PASO 4: Verificando datos guardados...');
    
    const getRecordResponse = await axios.get(`${BASE_URL}/clinical-records/${recordId}`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });

    if (getRecordResponse.data.status === 'success') {
      const savedRecord = getRecordResponse.data.data.record;
      const savedMedications = savedRecord.diagnosed_diseases?.medicationsList || [];
      
      // Verificar que los medicamentos se guardaron correctamente
      const expectedMedications = clinicalRecordData.diagnosedDiseases.medicationsList;
      const medicationsMatch = expectedMedications.every(med => savedMedications.includes(med));
      
      results.push({
        step: 'Verificación de datos',
        success: medicationsMatch,
        data: {
          expectedCount: expectedMedications.length,
          savedCount: savedMedications.length,
          medicationsMatch,
          savedMedications,
          diseaseInfo: {
            hasDisease: savedRecord.diagnosed_diseases?.hasDisease,
            diseaseName: savedRecord.diagnosed_diseases?.diseaseName,
            takesMedication: savedRecord.diagnosed_diseases?.takesMedication
          }
        }
      });

      if (medicationsMatch) {
        console.log('✅ Datos de medicamentos verificados correctamente');
        console.log(`📝 Medicamentos guardados: ${savedMedications.length}`);
        savedMedications.forEach((med: string, index: number) => {
          console.log(`   ${index + 1}. ${med}`);
        });
      } else {
        console.log('❌ Los medicamentos no coinciden');
        console.log('Esperados:', expectedMedications);
        console.log('Guardados:', savedMedications);
      }
    } else {
      throw new Error('Error al recuperar expediente');
    }

    // 📋 PASO 5: Probar actualización de medicamentos
    console.log('📋 PASO 5: Probando actualización de medicamentos...');
    
    const updatedMedications = [
      'Metformina 850mg - 2 veces al día (DOSIS AJUSTADA)',
      'Losartán 100mg - 1 vez al día por la mañana (DOSIS AUMENTADA)',
      'Aspirina 100mg - 1 vez al día después de la cena',
      'Atorvastatina 40mg - 1 por la noche (DOSIS AUMENTADA)',
      'Glibenclamida 5mg - 1 antes del desayuno (NUEVO MEDICAMENTO)'
    ];

    const updateData = {
      diagnosedDiseases: {
        hasDisease: true,
        diseaseName: 'Diabetes Mellitus Tipo 2 e Hipertensión Arterial',
        sinceWhen: 'Hace 3 años',
        takesMedication: true,
        medicationsList: updatedMedications,
        hasImportantDisease: true,
        importantDiseaseName: 'Diabetes Mellitus Tipo 2',
        takesSpecialTreatment: true,
        specialTreatmentDetails: 'Control glucémico estricto, dieta especializada y ejercicio supervisado. Ajuste de dosis por evolución.',
        hasSurgery: false
      }
    };

    const updateResponse = await axios.put(`${BASE_URL}/clinical-records/${recordId}`, updateData, {
      headers: { 
        Authorization: `Bearer ${authToken}`,
        'Content-Type': 'application/json'
      }
    });

    if (updateResponse.data.status === 'success') {
      results.push({
        step: 'Actualización de medicamentos',
        success: true,
        data: {
          newMedicationsCount: updatedMedications.length,
          updatedMedications
        }
      });
      console.log('✅ Medicamentos actualizados exitosamente');
      console.log(`📊 Nuevos medicamentos: ${updatedMedications.length}`);
    } else {
      throw new Error('Error al actualizar medicamentos');
    }

    // 🔍 PASO 6: Verificar actualización
    console.log('🔍 PASO 6: Verificando actualización...');
    
    const getUpdatedRecordResponse = await axios.get(`${BASE_URL}/clinical-records/${recordId}`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });

    if (getUpdatedRecordResponse.data.status === 'success') {
      const updatedRecord = getUpdatedRecordResponse.data.data.record;
      const finalMedications = updatedRecord.diagnosed_diseases?.medicationsList || [];
      
      const updateSuccess = updatedMedications.every(med => finalMedications.includes(med));
      
      results.push({
        step: 'Verificación de actualización',
        success: updateSuccess,
        data: {
          finalMedicationsCount: finalMedications.length,
          updateSuccess,
          finalMedications
        }
      });

      if (updateSuccess) {
        console.log('✅ Actualización verificada correctamente');
        console.log(`📝 Medicamentos finales: ${finalMedications.length}`);
      } else {
        console.log('❌ La actualización no se reflejó correctamente');
      }
    }

  } catch (error: any) {
    console.error('❌ Error en la prueba:', error.message);
    results.push({
      step: 'Error general',
      success: false,
      error: error.message,
      data: error.response?.data
    });
  }

  return results;
}

// Ejecutar prueba
async function runTest() {
  console.log('🧪 INICIANDO PRUEBA DE FUNCIONALIDAD DE MEDICAMENTOS');
  console.log('=' .repeat(60));
  
  const results = await testMedicationsFeature();
  
  console.log('\n📊 RESULTADOS DE LA PRUEBA');
  console.log('=' .repeat(60));
  
  results.forEach((result, index) => {
    const status = result.success ? '✅' : '❌';
    console.log(`${status} ${index + 1}. ${result.step}: ${result.success ? 'ÉXITO' : 'FALLO'}`);
    
    if (result.error) {
      console.log(`   Error: ${result.error}`);
    }
    
    if (result.data && Object.keys(result.data).length > 0) {
      console.log(`   Datos:`, JSON.stringify(result.data, null, 2));
    }
  });
  
  const successCount = results.filter(r => r.success).length;
  const totalCount = results.length;
  
  console.log('\n🏆 RESUMEN FINAL');
  console.log('=' .repeat(60));
  console.log(`Pruebas exitosas: ${successCount}/${totalCount}`);
  console.log(`Porcentaje de éxito: ${Math.round((successCount/totalCount) * 100)}%`);
  
  if (successCount === totalCount) {
    console.log('🎉 ¡TODAS LAS PRUEBAS PASARON! La funcionalidad de medicamentos está funcionando correctamente.');
  } else {
    console.log('⚠️  Algunas pruebas fallaron. Revisar los errores arriba.');
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  runTest().catch(console.error);
}

export { testMedicationsFeature, runTest }; 