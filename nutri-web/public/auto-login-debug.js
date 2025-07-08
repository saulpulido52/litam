// Script para auto-login y test de frontend
console.log('🔍 Iniciando auto-login y debug...');

// Simular auto-login
async function autoLogin() {
  try {
    const response = await fetch('http://localhost:4000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'nutri.admin@sistema.com',
        password: 'nutri123'
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log('✅ Login exitoso:', data);

    if (data.status === 'success' && data.data?.token) {
      localStorage.setItem('access_token', data.data.token);
      localStorage.setItem('user', JSON.stringify(data.data.user));
      console.log('🔑 Token guardado en localStorage');
      
      // Redirigir a appointments
      window.location.href = '/appointments';
    } else {
      console.error('❌ No se encontró token en la respuesta');
    }
  } catch (error) {
    console.error('❌ Error en auto-login:', error);
  }
}

// Ejecutar auto-login si estamos en la página de login
if (window.location.pathname === '/login') {
  console.log('📍 En página de login, ejecutando auto-login...');
  setTimeout(autoLogin, 1000);
}
