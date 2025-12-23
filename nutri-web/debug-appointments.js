// Script de debug para verificar la conexión con appointments
async function debugAppointments() {
  console.log('🔍 Debugging appointments connection...');
  
  try {
    // Verificar si hay token
    const token = localStorage.getItem('access_token');
    console.log('🔑 Token encontrado:', token ? 'Sí' : 'No');
    
    if (!token) {
      console.log('❌ No hay token de autenticación');
      return;
    }
    
    // Probar conexión con el backend
    const response = await fetch('http://localhost:4000/api/appointments/my-appointments', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('📡 Status:', response.status);
    console.log('📡 Status Text:', response.statusText);
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Datos recibidos:', data);
      console.log('📊 Número de citas:', data.data?.appointments?.length || 0);
    } else {
      const errorData = await response.text();
      console.log('❌ Error response:', errorData);
    }
    
  } catch (error) {
    console.error('❌ Error de conexión:', error);
  }
}

// Ejecutar debug
debugAppointments(); 