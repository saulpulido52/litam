import axios from 'axios';

const BASE_URL = 'http://localhost:4000/api';

interface TestCase {
  name: string;
  systolic: number;
  diastolic: number;
  shouldFail: boolean;
  expectedError?: string;
}

const testCases: TestCase[] = [
  // Casos que deben fallar
  {
    name: "Diastólica mayor que sistólica",
    systolic: 120,
    diastolic: 130,
    shouldFail: true,
    expectedError: "INVALID_BLOOD_PRESSURE"
  },
  {
    name: "Presión anormalmente alta",
    systolic: 250,
    diastolic: 150,
    shouldFail: true,
    expectedError: "ABNORMAL_BLOOD_PRESSURE"
  },
  {
    name: "Presión anormalmente baja",
    systolic: 40,
    diastolic: 20,
    shouldFail: true,
    expectedError: "ABNORMAL_BLOOD_PRESSURE"
  },
  {
    name: "El caso original: 123/321",
    systolic: 123,
    diastolic: 321,
    shouldFail: true,
    expectedError: "INVALID_BLOOD_PRESSURE"
  },
  // Casos que deben pasar
  {
    name: "Presión normal",
    systolic: 120,
    diastolic: 80,
    shouldFail: false
  },
  {
    name: "Presión ligeramente alta",
    systolic: 140,
    diastolic: 90,
    shouldFail: false
  }
];

async function testBloodPressureValidations() {
  console.log('🩺 Iniciando pruebas de validación de presión arterial...\n');

  // Obtener token de autenticación
  console.log('🔐 Intentando login...');
  const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
    email: 'nutri.demo@example.com',
    password: 'nutri123'
  });

  const token = loginResponse.data.data.token;
  console.log('✅ Login exitoso\n');

  // Configurar headers
  const config = {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  };

  // Buscar pacientes
  const patientsResponse = await axios.get(`${BASE_URL}/patients/my-patients`, config);
  const patients = patientsResponse.data.data;
  
  if (patients.length === 0) {
    console.log('❌ No hay pacientes disponibles para la prueba');
    return;
  }

  const patient = patients[0];
  console.log(`👤 Paciente de prueba: ${patient.first_name} ${patient.last_name}\n`);

  // Ejecutar casos de prueba
  for (let i = 0; i < testCases.length; i++) {
    const testCase = testCases[i];
    console.log(`🧪 Caso ${i + 1}: ${testCase.name}`);
    console.log(`   Presión: ${testCase.systolic}/${testCase.diastolic}`);

    const expedienteData = {
      patientId: patient.id,
      recordDate: new Date().toISOString().split('T')[0],
      expedientNumber: `TEST-${i + 1}`,
      consultationReason: `Prueba de validación: ${testCase.name}`,
      
      bloodPressure: {
        knowsBp: true,
        systolic: testCase.systolic,
        diastolic: testCase.diastolic
      },

      // Datos mínimos requeridos
      currentProblems: {
        diarrhea: false,
        constipation: false,
        gastritis: false,
        ulcer: false,
        nausea: false,
        pyrosis: false,
        vomiting: false,
        colitis: false
      },

      anthropometricMeasurements: {
        currentWeightKg: 70,
        heightM: 1.70
      },

      nutritionalDiagnosis: "Diagnóstico de prueba",
      nutritionalPlanAndManagement: "Plan de prueba"
    };

    try {
      const response = await axios.post(`${BASE_URL}/clinical-records`, expedienteData, config);
      
      if (testCase.shouldFail) {
        console.log(`   ❌ ERROR: Se esperaba que fallara pero fue exitoso`);
        console.log(`   📋 ID del expediente creado: ${response.data.data.id}`);
      } else {
        console.log(`   ✅ ÉXITO: Expediente creado correctamente`);
        console.log(`   📋 ID: ${response.data.data.id}`);
      }
    } catch (error: any) {
      if (testCase.shouldFail) {
        const errorData = error.response?.data;
        console.log(`   ✅ ÉXITO: Validación funcionó correctamente`);
        console.log(`   🚨 Error: ${errorData?.message || error.message}`);
        console.log(`   🔍 Código: ${errorData?.errorCode || 'N/A'}`);
        
        // Verificar si es el error esperado
        if (testCase.expectedError && errorData?.errorCode === testCase.expectedError) {
          console.log(`   ✨ Error esperado correcto: ${testCase.expectedError}`);
        } else if (testCase.expectedError) {
          console.log(`   ⚠️  Error esperado: ${testCase.expectedError}, pero recibido: ${errorData?.errorCode}`);
        }
      } else {
        console.log(`   ❌ ERROR: Se esperaba que fuera exitoso pero falló`);
        console.log(`   🚨 Error: ${error.response?.data?.message || error.message}`);
      }
    }
    
    console.log(''); // Línea en blanco entre casos
  }

  console.log('🏁 Pruebas completadas');
}

// Ejecutar pruebas
testBloodPressureValidations().catch(error => {
  console.error('❌ Error en las pruebas:', error.message);
}); 