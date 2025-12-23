# scripts/test-admin-system.ps1
# Script para probar el sistema de administración completo de Litam

Write-Host "🧪 INICIANDO PRUEBAS DEL SISTEMA DE ADMINISTRACIÓN - LITAM" -ForegroundColor Green
Write-Host "=================================================================" -ForegroundColor Green

# Verificar que estamos en el directorio correcto
if (-not (Test-Path "package.json")) {
    Write-Host "❌ Error: Ejecuta este script desde el directorio raíz del proyecto" -ForegroundColor Red
    exit 1
}

Write-Host "📋 Lista de verificación del sistema:" -ForegroundColor Yellow
Write-Host ""

# 1. Verificar dependencias del backend
Write-Host "1. 🔍 Verificando dependencias del backend..." -ForegroundColor Cyan
try {
    if (Test-Path "node_modules") {
        Write-Host "   ✅ Dependencias del backend instaladas" -ForegroundColor Green
    } else {
        Write-Host "   ⚠️  Instalando dependencias del backend..." -ForegroundColor Yellow
        npm install
    }
} catch {
    Write-Host "   ❌ Error instalando dependencias del backend" -ForegroundColor Red
}

# 2. Verificar dependencias del frontend
Write-Host "2. 🔍 Verificando dependencias del frontend..." -ForegroundColor Cyan
Set-Location "nutri-web"
try {
    if (Test-Path "node_modules") {
        Write-Host "   ✅ Dependencias del frontend instaladas" -ForegroundColor Green
    } else {
        Write-Host "   ⚠️  Instalando dependencias del frontend..." -ForegroundColor Yellow
        npm install
    }
} catch {
    Write-Host "   ❌ Error instalando dependencias del frontend" -ForegroundColor Red
}
Set-Location ".."

# 3. Verificar archivos del sistema de admin
Write-Host "3. 🔍 Verificando archivos del sistema de administración..." -ForegroundColor Cyan

$adminFiles = @(
    "src/modules/admin/admin.service.ts",
    "src/modules/admin/admin.controller.ts", 
    "src/modules/admin/admin.routes.ts",
    "src/modules/admin/admin.dto.ts",
    "nutri-web/src/services/adminService.ts",
    "nutri-web/src/pages/AdminDashboard.tsx",
    "nutri-web/src/components/Admin/AdminAppointmentsTab.tsx",
    "nutri-web/src/components/Admin/AdminFoodsTab.tsx",
    "nutri-web/src/components/Admin/AdminAdvancedMetricsTab.tsx"
)

foreach ($file in $adminFiles) {
    if (Test-Path $file) {
        Write-Host "   ✅ $file" -ForegroundColor Green
    } else {
        Write-Host "   ❌ $file (FALTANTE)" -ForegroundColor Red
    }
}

# 4. Verificar script de datos de demo
Write-Host "4. 🔍 Verificando script de datos de demostración..." -ForegroundColor Cyan
if (Test-Path "scripts/seed-admin-demo-data.js") {
    Write-Host "   ✅ Script de datos de demo disponible" -ForegroundColor Green
} else {
    Write-Host "   ❌ Script de datos de demo no encontrado" -ForegroundColor Red
}

Write-Host ""
Write-Host "🚀 INSTRUCCIONES PARA PROBAR EL SISTEMA:" -ForegroundColor Yellow
Write-Host "=========================================" -ForegroundColor Yellow
Write-Host ""
Write-Host "1. 🖥️  Iniciar el backend:" -ForegroundColor White
Write-Host "   npm run dev" -ForegroundColor Gray
Write-Host ""
Write-Host "2. 🌐 Iniciar el frontend (en otra terminal):" -ForegroundColor White
Write-Host "   cd nutri-web" -ForegroundColor Gray
Write-Host "   npm run dev" -ForegroundColor Gray
Write-Host ""
Write-Host "3. 📊 Poblar con datos de demostración (opcional):" -ForegroundColor White
Write-Host "   node scripts/seed-admin-demo-data.js" -ForegroundColor Gray
Write-Host ""
Write-Host "4. 🔐 Acceder al panel de admin:" -ForegroundColor White
Write-Host "   URL: http://localhost:5173/admin/login" -ForegroundColor Gray
Write-Host "   Usuario: admin@litam.com" -ForegroundColor Gray
Write-Host "   Contraseña: admin123" -ForegroundColor Gray
Write-Host ""
Write-Host "📋 FUNCIONALIDADES A PROBAR:" -ForegroundColor Yellow
Write-Host "=============================" -ForegroundColor Yellow
Write-Host "✅ Dashboard principal con métricas" -ForegroundColor Green
Write-Host "✅ Gestión de usuarios (crear/editar/eliminar)" -ForegroundColor Green
Write-Host "✅ Gestión de citas (crear/editar/eliminar)" -ForegroundColor Green
Write-Host "✅ Gestión de alimentos (crear/editar/eliminar)" -ForegroundColor Green
Write-Host "✅ Métricas avanzadas del sistema" -ForegroundColor Green
Write-Host "✅ Gestión de suscripciones" -ForegroundColor Green
Write-Host "✅ Salud del sistema" -ForegroundColor Green
Write-Host "✅ Integridad de datos" -ForegroundColor Green
Write-Host "✅ Configuraciones del sistema" -ForegroundColor Green
Write-Host ""
Write-Host "🎯 CASOS DE PRUEBA SUGERIDOS:" -ForegroundColor Yellow
Write-Host "==============================" -ForegroundColor Yellow
Write-Host "1. Crear un nuevo paciente desde el admin" -ForegroundColor White
Write-Host "2. Crear un nuevo nutriólogo" -ForegroundColor White
Write-Host "3. Programar una cita entre el paciente y nutriólogo" -ForegroundColor White
Write-Host "4. Agregar nuevos alimentos a la base de datos" -ForegroundColor White
Write-Host "5. Verificar las métricas avanzadas del sistema" -ForegroundColor White
Write-Host "6. Explorar todas las pestañas del dashboard" -ForegroundColor White
Write-Host ""
Write-Host "📞 CREDENCIALES DE USUARIOS DE DEMO:" -ForegroundColor Yellow
Write-Host "====================================" -ForegroundColor Yellow
Write-Host "👑 Admin:" -ForegroundColor Green
Write-Host "   admin@litam.com / admin123" -ForegroundColor Gray
Write-Host ""
Write-Host "👨‍⚕️ Nutriólogos:" -ForegroundColor Blue
Write-Host "   maria.gonzalez@nutricionista.com / nutricionista123" -ForegroundColor Gray
Write-Host "   carlos.hernandez@nutricionista.com / nutricionista123" -ForegroundColor Gray
Write-Host ""
Write-Host "👤 Pacientes:" -ForegroundColor Magenta
Write-Host "   ana.martinez@paciente.com / paciente123" -ForegroundColor Gray
Write-Host "   luis.garcia@paciente.com / paciente123" -ForegroundColor Gray
Write-Host ""
Write-Host "🎉 ¡SISTEMA LISTO PARA PRUEBAS!" -ForegroundColor Green
Write-Host "===============================" -ForegroundColor Green