// Ejecutar en la consola del navegador para hacer login automático
async function autoLogin() {
  console.log('🔄 Iniciando login automático...');
  
  try {
    const response = await fetch('http://localhost:4000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'nutri.admin@sistema.com',
        password: 'nutri123'
      })
    });
    
    const data = await response.json();
    
    if (data.status === 'success') {
      // Guardar token en localStorage exactamente como lo hace authService
      localStorage.setItem('access_token', data.data.token);
      localStorage.setItem('user', JSON.stringify(data.data.user));
      
      console.log('✅ Login automático exitoso');
      console.log('🔑 Token guardado:', data.data.token.substring(0, 20) + '...');
      console.log('👤 Usuario:', data.data.user.first_name, data.data.user.last_name);
      console.log('🔄 Recarga la página para ver los cambios');
      
      // Opcional: recargar la página automáticamente
      // window.location.reload();
      
    } else {
      console.error('❌ Error en login automático:', data.message);
    }
  } catch (error) {
    console.error('❌ Error de red en login automático:', error);
  }
}

// Ejecutar automáticamente
autoLogin();
