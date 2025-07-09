const puppeteer = require('puppeteer');

(async () => {
  console.log('🔍 Iniciando debug de re-renders en frontend...\n');

  const browser = await puppeteer.launch({ 
    headless: false,
    devtools: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    const page = await browser.newPage();
    
    // Escuchar todos los console.log del frontend
    page.on('console', (msg) => {
      const text = msg.text();
      if (text.includes('AppointmentsPage') || text.includes('useAppointments') || text.includes('Cargando citas')) {
        console.log('🎯 Frontend Log:', text);
      }
    });

    // Escuchar errores
    page.on('pageerror', (error) => {
      console.error('❌ Frontend Error:', error.message);
    });

    console.log('📱 Navegando al login...');
    await page.goto('http://localhost:3000/login', { waitUntil: 'networkidle2' });

    // Login automático
    console.log('🔐 Haciendo login...');
    await page.waitForSelector('input[name="email"]', { timeout: 10000 });
    await page.type('input[name="email"]', 'admin@example.com');
    await page.type('input[name="password"]', 'admin123');
    
    await page.click('button[type="submit"]');
    await page.waitForNavigation({ waitUntil: 'networkidle2' });

    console.log('✅ Login exitoso, navegando a citas...');
    
    // Ir a la página de citas
    await page.goto('http://localhost:3000/appointments', { waitUntil: 'networkidle2' });
    
    console.log('📅 En la página de citas, esperando cargas...');
    
    // Esperar 10 segundos para observar los logs
    await page.waitForTimeout(10000);
    
    console.log('\n📊 Resumen:');
    console.log('- Si ves múltiples "Componente renderizado" significa re-renders frecuentes');
    console.log('- Si ves múltiples "Cargando citas" significa múltiples cargas de datos');
    console.log('- Si ves "Componente desmontado" seguido de "montado" significa re-mounting');
    
    // Refrescar la página para ver si se re-monta
    console.log('\n🔄 Refrescando página para probar re-mounting...');
    await page.reload({ waitUntil: 'networkidle2' });
    await page.waitForTimeout(5000);

  } catch (error) {
    console.error('❌ Error en el test:', error.message);
  } finally {
    console.log('\n🔚 Cerrando browser en 30 segundos...');
    setTimeout(() => {
      browser.close();
    }, 30000);
  }
})();
