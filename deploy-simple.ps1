# Script de despliegue simplificado para Litam
Write-Host "🚀 Iniciando despliegue de Litam..." -ForegroundColor Green

# Navegar al directorio del frontend
cd nutri-web

# Verificar que estamos en el directorio correcto
if (-not (Test-Path "package.json")) {
    Write-Host "❌ Error: No se encontró package.json" -ForegroundColor Red
    exit 1
}

# Instalar dependencias
Write-Host "📦 Instalando dependencias..." -ForegroundColor Cyan
npm install

# Construir la aplicación
Write-Host "🔨 Construyendo aplicación..." -ForegroundColor Cyan
npm run build

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Error al construir la aplicación" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Aplicación construida exitosamente" -ForegroundColor Green

# Verificar Vercel CLI
$vercelVersion = vercel --version
Write-Host "✅ Vercel CLI encontrado: $vercelVersion" -ForegroundColor Green

# Verificar login de Vercel
$vercelUser = vercel whoami
Write-Host "✅ Usuario logueado en Vercel: $vercelUser" -ForegroundColor Green

# Desplegar en Vercel
Write-Host "🚀 Desplegando en Vercel..." -ForegroundColor Cyan
vercel --prod --yes

if ($LASTEXITCODE -eq 0) {
    Write-Host "🎉 ¡Despliegue completado exitosamente!" -ForegroundColor Green
    Write-Host "🌐 Tu aplicación está disponible en: https://nutri.vercel.app" -ForegroundColor Cyan
} else {
    Write-Host "❌ Error en el despliegue" -ForegroundColor Red
}

Write-Host "Despliegue completado. Presiona Enter para continuar..."
Read-Host 