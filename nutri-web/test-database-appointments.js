// Script para verificar citas en la base de datos
async function testDatabaseAppointments() {
  console.log('🔍 Verificando citas en la base de datos...');
  
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
    
    // Paso 2: Verificar información del usuario
    console.log('👤 Verificando información del usuario...');
    const userResponse = await fetch('/api/auth/me', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('access_token')}`
      }
    });
    
    if (userResponse.ok) {
      const userData = await userResponse.json();
      console.log('✅ User data:', userData);
    } else {
      console.log('❌ Error obteniendo datos del usuario');
    }
    
    // Paso 3: Probar endpoint de citas
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
      
      if (appointmentsData.data?.appointments?.length === 0) {
        console.log('⚠️ No hay citas en la base de datos');
        console.log('💡 Esto puede ser normal si no se han creado citas de prueba');
      }
    } else {
      const errorText = await appointmentsResponse.text();
      console.log('❌ Error response:', errorText);
    }
    
    // Paso 4: Verificar si hay pacientes disponibles
    console.log('👥 Verificando pacientes disponibles...');
    const patientsResponse = await fetch('/api/patients/my-patients', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('access_token')}`
      }
    });
    
    if (patientsResponse.ok) {
      const patientsData = await patientsResponse.json();
      console.log('✅ Patients data:', patientsData);
      console.log('📊 Número de pacientes:', patientsData.data?.patients?.length || 0);
    } else {
      console.log('❌ Error obteniendo pacientes');
    }
    
  } catch (error) {
    console.error('❌ Error general:', error);
  }
}

// Ejecutar prueba
testDatabaseAppointments(); 