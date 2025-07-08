// Script de prueba para verificar autenticación y citas
async function testAuthAndAppointments() {
  console.log('🧪 Testing authentication and appointments...');
  
  try {
    // Paso 1: Verificar si hay token
    const token = localStorage.getItem('access_token');
    console.log('🔑 Token en localStorage:', token ? 'Presente' : 'Ausente');
    
    if (!token) {
      console.log('❌ No hay token, haciendo login...');
      
      // Hacer login
      const loginResponse = await fetch('/api/auth/login', {
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
      console.log('📡 Login response:', loginData);
      
      if (loginData.status === 'success') {
        localStorage.setItem('access_token', loginData.data.token);
        localStorage.setItem('user', JSON.stringify(loginData.data.user));
        console.log('✅ Login exitoso');
      } else {
        console.log('❌ Login falló:', loginData.message);
        return;
      }
    }
    
    // Paso 2: Probar endpoint de citas
    console.log('📡 Probando endpoint de citas...');
    const appointmentsResponse = await fetch('/api/appointments/my-appointments', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('access_token')}`
      }
    });
    
    console.log('📡 Appointments status:', appointmentsResponse.status);
    console.log('📡 Appointments status text:', appointmentsResponse.statusText);
    
    if (appointmentsResponse.ok) {
      const appointmentsData = await appointmentsResponse.json();
      console.log('✅ Appointments data:', appointmentsData);
      console.log('📊 Número de citas:', appointmentsData.data?.appointments?.length || 0);
    } else {
      const errorText = await appointmentsResponse.text();
      console.log('❌ Error response:', errorText);
    }
    
  } catch (error) {
    console.error('❌ Error general:', error);
  }
}

// Ejecutar prueba
testAuthAndAppointments(); 