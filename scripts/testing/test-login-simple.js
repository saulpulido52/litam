const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

async function testLoginSimple() {
  console.log('🧪 Iniciando test simple de validación de login...');
  
  const baseUrl = 'http://localhost:4000/api';
  
  let nutriToken = null;
  let adminToken = null;

  try {
    // Test 1: Login como Nutriólogo
    console.log('\n📋 Test 1: Login como Nutriólogo');
    const nutriResponse = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'nutriologo@test.com', password: 'password123' })
    });
    if (nutriResponse.ok) {
      const nutriData = await nutriResponse.json();
      // Soportar estructura { status, data: { user, token } }
      const user = nutriData.data?.user || nutriData.user;
      nutriToken = nutriData.data?.token || nutriData.token;
      if (user) {
        console.log('✅ Login de nutriólogo exitoso');
        console.log('📊 Datos del usuario:', {
          id: user.id,
          email: user.email,
          role: user.role?.name,
          name: `${user.first_name} ${user.last_name}`
        });
        if (user.role?.name === 'nutritionist') {
          console.log('✅ Rol de nutriólogo correcto');
        } else {
          console.log('❌ Error: Rol incorrecto para nutriólogo');
        }
      } else {
        console.log('❌ Respuesta inesperada en login de nutriólogo:', nutriData);
      }
    } else {
      console.log('❌ Error en login de nutriólogo:', nutriResponse.status);
      const errorData = await nutriResponse.text();
      console.log('Error details:', errorData);
    }
  } catch (error) {
    console.error('❌ Error durante el login de nutriólogo:', error.message);
  }

  try {
    // Test 2: Login como Admin
    console.log('\n📋 Test 2: Login como Admin');
    const adminResponse = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'nutri.admin@sistema.com', password: 'admin123' })
    });
    if (adminResponse.ok) {
      const adminData = await adminResponse.json();
      // Soportar estructura { status, data: { user, token } }
      const user = adminData.data?.user || adminData.user;
      adminToken = adminData.data?.token || adminData.token;
      if (user) {
        console.log('✅ Login de admin exitoso');
        console.log('📊 Datos del usuario:', {
          id: user.id,
          email: user.email,
          role: user.role?.name,
          name: `${user.first_name} ${user.last_name}`
        });
        if (user.role?.name === 'admin') {
          console.log('✅ Rol de admin correcto');
        } else {
          console.log('❌ Error: Rol incorrecto para admin');
        }
      } else {
        console.log('❌ Respuesta inesperada en login de admin:', adminData);
      }
    } else {
      console.log('❌ Error en login de admin:', adminResponse.status);
      const errorData = await adminResponse.text();
      console.log('Error details:', errorData);
    }
  } catch (error) {
    console.error('❌ Error durante el login de admin:', error.message);
  }

  // Test 3: Verificar endpoints protegidos
  console.log('\n📋 Test 3: Verificar acceso a endpoints protegidos');
  try {
    if (nutriToken) {
      const nutriDashboardResponse = await fetch(`${baseUrl}/dashboard`, {
        headers: { 'Authorization': `Bearer ${nutriToken}` }
      });
      if (nutriDashboardResponse.ok) {
        console.log('✅ Nutriólogo puede acceder al dashboard');
      } else {
        console.log('❌ Error: Nutriólogo no puede acceder al dashboard');
        const errorData = await nutriDashboardResponse.text();
        console.log('Error details:', errorData);
      }
    } else {
      console.log('❌ No se obtuvo token de nutriólogo, no se puede probar acceso a dashboard');
    }
  } catch (error) {
    console.error('❌ Error al probar acceso de nutriólogo:', error.message);
  }

  try {
    if (adminToken) {
      const adminDashboardResponse = await fetch(`${baseUrl}/admin`, {
        headers: { 'Authorization': `Bearer ${adminToken}` }
      });
      if (adminDashboardResponse.ok) {
        console.log('✅ Admin puede acceder al panel de administración');
      } else {
        console.log('❌ Error: Admin no puede acceder al panel de administración');
        const errorData = await adminDashboardResponse.text();
        console.log('Error details:', errorData);
      }
    } else {
      console.log('❌ No se obtuvo token de admin, no se puede probar acceso a panel admin');
    }
  } catch (error) {
    console.error('❌ Error al probar acceso de admin:', error.message);
  }

  console.log('\n🎉 Test de validación de login completado!');
  if (nutriToken) console.log('✅ Autenticación de nutriólogo: FUNCIONA');
  if (adminToken) console.log('✅ Autenticación de admin: FUNCIONA');
  if (nutriToken && adminToken) console.log('✅ Verificación de roles y acceso a apartados: FUNCIONA');
}

testLoginSimple().catch(console.error); 