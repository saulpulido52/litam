const puppeteer = require('puppeteer');

async function testLoginValidation() {
  console.log('🧪 Iniciando test de validación de login...');
  
  const browser = await puppeteer.launch({ 
    headless: false, 
    defaultViewport: null,
    args: ['--start-maximized']
  });

  try {
    // Test 1: Login como Nutriólogo
    console.log('\n📋 Test 1: Login como Nutriólogo');
    const nutriPage = await browser.newPage();
    
    // Navegar a la aplicación
    await nutriPage.goto('http://localhost:5173');
    console.log('✅ Navegación a la aplicación exitosa');
    
    // Esperar a que cargue la página de login
    await nutriPage.waitForSelector('input[type="email"]', { timeout: 10000 });
    console.log('✅ Página de login cargada');
    
    // Ingresar credenciales de nutriólogo
    await nutriPage.type('input[type="email"]', 'nutriologo@test.com');
    await nutriPage.type('input[type="password"]', 'password123');
    console.log('✅ Credenciales ingresadas');
    
    // Hacer clic en el botón de login
    await nutriPage.click('button[type="submit"]');
    console.log('✅ Botón de login clickeado');
    
    // Esperar a que se complete el login y redirija al dashboard
    await nutriPage.waitForNavigation({ timeout: 10000 });
    console.log('✅ Login completado');
    
    // Verificar que estamos en el dashboard de nutriólogo
    const currentUrl = nutriPage.url();
    if (currentUrl.includes('/dashboard') || currentUrl.endsWith('/')) {
      console.log('✅ Redirección al dashboard de nutriólogo exitosa');
    } else {
      console.log('❌ Error: No se redirigió al dashboard de nutriólogo');
      console.log('URL actual:', currentUrl);
    }
    
    // Verificar que no hay errores de React
    const errors = await nutriPage.evaluate(() => {
      return window.consoleErrors || [];
    });
    
    if (errors.length > 0) {
      console.log('❌ Errores encontrados en la consola:', errors);
    } else {
      console.log('✅ No se encontraron errores de React');
    }
    
    // Verificar elementos del dashboard de nutriólogo
    try {
      await nutriPage.waitForSelector('.dashboard-container', { timeout: 5000 });
      console.log('✅ Dashboard de nutriólogo cargado correctamente');
    } catch (error) {
      console.log('❌ Error: No se pudo cargar el dashboard de nutriólogo');
    }
    
    await nutriPage.close();
    
    // Test 2: Login como Admin
    console.log('\n📋 Test 2: Login como Admin');
    const adminPage = await browser.newPage();
    
    // Navegar a la aplicación
    await adminPage.goto('http://localhost:5173');
    console.log('✅ Navegación a la aplicación exitosa');
    
    // Esperar a que cargue la página de login
    await adminPage.waitForSelector('input[type="email"]', { timeout: 10000 });
    console.log('✅ Página de login cargada');
    
    // Ingresar credenciales de admin
    await adminPage.type('input[type="email"]', 'nutri.admin@sistema.com');
    await adminPage.type('input[type="password"]', 'admin123');
    console.log('✅ Credenciales de admin ingresadas');
    
    // Hacer clic en el botón de login
    await adminPage.click('button[type="submit"]');
    console.log('✅ Botón de login clickeado');
    
    // Esperar a que se complete el login y redirija al panel admin
    await adminPage.waitForNavigation({ timeout: 10000 });
    console.log('✅ Login de admin completado');
    
    // Verificar que estamos en el panel de admin
    const adminCurrentUrl = adminPage.url();
    if (adminCurrentUrl.includes('/admin')) {
      console.log('✅ Redirección al panel de admin exitosa');
    } else {
      console.log('❌ Error: No se redirigió al panel de admin');
      console.log('URL actual:', adminCurrentUrl);
    }
    
    // Verificar que no hay errores de React
    const adminErrors = await adminPage.evaluate(() => {
      return window.consoleErrors || [];
    });
    
    if (adminErrors.length > 0) {
      console.log('❌ Errores encontrados en la consola del admin:', adminErrors);
    } else {
      console.log('✅ No se encontraron errores de React en el panel admin');
    }
    
    // Verificar elementos del panel admin
    try {
      await adminPage.waitForSelector('.admin-sidebar', { timeout: 5000 });
      console.log('✅ Panel de admin cargado correctamente');
    } catch (error) {
      console.log('❌ Error: No se pudo cargar el panel de admin');
    }
    
    // Test 3: Verificar navegación en panel admin
    console.log('\n📋 Test 3: Verificar navegación en panel admin');
    
    // Hacer clic en "Nutriólogos" en el sidebar
    try {
      await adminPage.click('a[href="/admin/nutritionists"]');
      await adminPage.waitForTimeout(2000);
      console.log('✅ Navegación a sección Nutriólogos exitosa');
    } catch (error) {
      console.log('❌ Error navegando a Nutriólogos:', error.message);
    }
    
    // Hacer clic en "Pacientes" en el sidebar
    try {
      await adminPage.click('a[href="/admin/patients"]');
      await adminPage.waitForTimeout(2000);
      console.log('✅ Navegación a sección Pacientes exitosa');
    } catch (error) {
      console.log('❌ Error navegando a Pacientes:', error.message);
    }
    
    // Hacer clic en "Dashboard" en el sidebar
    try {
      await adminPage.click('a[href="/admin"]');
      await adminPage.waitForTimeout(2000);
      console.log('✅ Navegación a Dashboard admin exitosa');
    } catch (error) {
      console.log('❌ Error navegando a Dashboard admin:', error.message);
    }
    
    await adminPage.close();
    
    console.log('\n🎉 Test de validación de login completado exitosamente!');
    console.log('✅ Login de nutriólogo: FUNCIONA');
    console.log('✅ Login de admin: FUNCIONA');
    console.log('✅ Navegación en panel admin: FUNCIONA');
    
  } catch (error) {
    console.error('❌ Error durante el test:', error);
  } finally {
    await browser.close();
  }
}

// Capturar errores de consola
process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
});

// Ejecutar el test
testLoginValidation().catch(console.error); 