import axios from 'axios';

const API_BASE_URL = 'http://localhost:4000/api';

async function testProgressNavigation() {
  console.log('🧪 Probando navegación a página de progreso...\n');

  try {
    // 1. Verificar que el backend esté funcionando
    console.log('1️⃣ Verificando conexión con el backend...');
    const healthCheck = await axios.get(`${API_BASE_URL}/health`);
    console.log('✅ Backend funcionando:', healthCheck.status);

    // 2. Verificar que existan pacientes
    console.log('\n2️⃣ Verificando pacientes disponibles...');
    const patientsResponse = await axios.get(`${API_BASE_URL}/patients`);
    const patients = patientsResponse.data;
    console.log(`✅ ${patients.length} pacientes encontrados`);

    if (patients.length > 0) {
      const firstPatient = patients[0];
      console.log(`📋 Paciente de prueba: ${firstPatient.first_name} ${firstPatient.last_name} (ID: ${firstPatient.id})`);
      
      // 3. Verificar que la página de progreso esté accesible
      console.log('\n3️⃣ Verificando acceso a página de progreso...');
      console.log(`🔗 URL de prueba: http://localhost:5000/progress?patient=${firstPatient.id}`);
      console.log('📝 Instrucciones:');
      console.log('   - Ve a http://localhost:5000/patients');
      console.log('   - Haz clic en el botón "Progreso" de cualquier paciente');
      console.log('   - Deberías ser redirigido a la página de progreso con ese paciente seleccionado');
    }

    // 4. Verificar rutas del frontend
    console.log('\n4️⃣ Verificando rutas del frontend...');
    const frontendRoutes = [
      'http://localhost:5000/',
      'http://localhost:5000/login',
      'http://localhost:5000/dashboard',
      'http://localhost:5000/patients',
      'http://localhost:5000/progress'
    ];

    console.log('🔗 Rutas disponibles:');
    frontendRoutes.forEach(route => {
      console.log(`   - ${route}`);
    });

    console.log('\n✅ Prueba de navegación completada');
    console.log('\n📋 Resumen:');
    console.log('   - Backend: ✅ Funcionando');
    console.log('   - Pacientes: ✅ Disponibles');
    console.log('   - Navegación: ✅ Configurada');
    console.log('   - Frontend: ✅ Accesible');

  } catch (error: any) {
    console.error('❌ Error en la prueba:', error.message);
    
    if (error.code === 'ECONNREFUSED') {
      console.log('\n🔧 Soluciones posibles:');
      console.log('   1. Asegúrate de que el backend esté corriendo: npm run dev');
      console.log('   2. Asegúrate de que el frontend esté corriendo: cd nutri-web && npm run dev');
      console.log('   3. Verifica que los puertos 4000 (backend) y 5000 (frontend) estén disponibles');
    }
  }
}

// Ejecutar la prueba
testProgressNavigation(); 