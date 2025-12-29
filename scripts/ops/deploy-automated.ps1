# Script de despliegue automatizado para Litam Nutrition Platform
# Autor: Asistente IA
# Fecha: $(Get-Date)

Write-Host "🚀 Iniciando despliegue automatizado de Litam..." -ForegroundColor Green

# Función para mostrar mensajes de estado
function Write-Status {
    param([string]$Message, [string]$Type = "info")
    
    switch ($Type) {
        "success" { Write-Host "✅ $Message" -ForegroundColor Green }
        "error" { Write-Host "❌ $Message" -ForegroundColor Red }
        "warning" { Write-Host "⚠️ $Message" -ForegroundColor Yellow }
        "info" { Write-Host "ℹ️ $Message" -ForegroundColor Cyan }
        default { Write-Host "ℹ️ $Message" -ForegroundColor White }
    }
}

# Verificar que estamos en el directorio correcto
if (-not (Test-Path "package.json")) {
    Write-Status "Error: No se encontró package.json. Asegúrate de estar en el directorio nutri-web" "error"
    exit 1
}

Write-Status "Verificando dependencias..."

# Instalar dependencias si es necesario
if (-not (Test-Path "node_modules")) {
    Write-Status "Instalando dependencias..."
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Status "Error al instalar dependencias" "error"
        exit 1
    }
}

# Construir la aplicación
Write-Status "Construyendo aplicación..."
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Status "Error al construir la aplicación" "error"
    exit 1
}

Write-Status "Aplicación construida exitosamente" "success"

# Verificar si Vercel CLI está instalado
try {
    $vercelVersion = vercel --version 2>$null
    Write-Status "Vercel CLI encontrado: $vercelVersion" "success"
} catch {
    Write-Status "Instalando Vercel CLI..."
    npm install -g vercel
}

# Verificar si el usuario está logueado en Vercel
try {
    $vercelUser = vercel whoami 2>$null
    if ($LASTEXITCODE -eq 0) {
        Write-Status "Usuario logueado en Vercel: $vercelUser" "success"
    } else {
        Write-Status "No estás logueado en Vercel. Iniciando login..." "warning"
        vercel login
    }
} catch {
    Write-Status "Error al verificar login de Vercel" "error"
    exit 1
}

# Desplegar en Vercel
Write-Status "Desplegando en Vercel..."
vercel --prod --yes

if ($LASTEXITCODE -eq 0) {
    Write-Status "¡Despliegue en Vercel completado exitosamente!" "success"
    Write-Host ""
    Write-Host "🎉 ¡Tu aplicación Litam está ahora desplegada!" -ForegroundColor Green
    Write-Host ""
    Write-Host "📋 Próximos pasos:" -ForegroundColor Yellow
    Write-Host "1. Configura las variables de entorno en Vercel Dashboard"
    Write-Host "2. Conecta tu repositorio de GitHub a Vercel para despliegues automáticos"
    Write-Host "3. Configura un dominio personalizado si lo deseas"
    Write-Host ""
    Write-Host "🔗 URLs importantes:" -ForegroundColor Cyan
    Write-Host "- Vercel Dashboard: https://vercel.com/dashboard"
    Write-Host "- Documentación: https://vercel.com/docs"
    Write-Host ""
} else {
    Write-Status "Error en el despliegue de Vercel" "error"
    Write-Host ""
    Write-Host "🔧 Solución de problemas:" -ForegroundColor Yellow
    Write-Host "1. Verifica que tienes una cuenta en Vercel"
    Write-Host "2. Asegúrate de estar logueado: vercel login"
    Write-Host "3. Verifica la configuración en vercel.json"
    Write-Host ""
}

Write-Host "Presiona cualquier tecla para continuar..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown") 