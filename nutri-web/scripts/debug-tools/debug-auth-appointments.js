// Test de autenticación y obtención de citas
// Para ejecutar en la consola del navegador

async function debugFrontendAuth() {
  console.log('=== DEBUG AUTENTICACIÓN Y CITAS ===');
  
  // 1. Verificar si hay token
  const token = localStorage.getItem('token') || sessionStorage.getItem('token');
  console.log('1. Token presente:', !!token);
  
  if (!token) {
    console.log('❌ No hay token. Necesitas hacer login primero.');
    
    // Intentar login automático
    console.log('🔄 Intentando login automático...');
    try {
      const loginResponse = await fetch('http://localhost:4000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: 'nutri.admin@sistema.com',
          password: 'nutri123'
        })
      });
      
      const loginData = await loginResponse.json();
      
      if (loginData.status === 'success') {
        const newToken = loginData.data.token;
        localStorage.setItem('token', newToken);
        console.log('✅ Login exitoso, token guardado');
        
        // Intentar obtener citas con el nuevo token
        await testGetAppointments(newToken);
      } else {
        console.log('❌ Error en login:', loginData.message);
      }
    } catch (error) {
      console.log('❌ Error de red en login:', error);
    }
  } else {
    console.log('✅ Token encontrado');
    await testGetAppointments(token);
  }
}

async function testGetAppointments(token) {
  console.log('2. Probando obtener citas...');
  
  try {
    const response = await fetch('http://localhost:4000/api/appointments/my-appointments', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    const data = await response.json();
    console.log('📥 Respuesta completa:', data);
    
    if (data.status === 'success') {
      console.log('✅ Citas obtenidas exitosamente');
      console.log('📊 Número de citas:', data.data?.appointments?.length || 0);
      
      if (data.data?.appointments?.length > 0) {
        console.log('📋 Primeras citas:');
        data.data.appointments.forEach((apt, index) => {
          console.log(`  ${index + 1}. ID: ${apt.id}`);
          console.log(`     Paciente: ${apt.patient?.first_name} ${apt.patient?.last_name}`);
          console.log(`     Fecha: ${apt.start_time}`);
          console.log(`     Estado: ${apt.status}`);
        });
      } else {
        console.log('ℹ️ No hay citas en el sistema');
      }
    } else {
      console.log('❌ Error obteniendo citas:', data.message);
    }
  } catch (error) {
    console.log('❌ Error de red obteniendo citas:', error);
  }
}

// Ejecutar el debug
debugFrontendAuth();
