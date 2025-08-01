# Script para configurar Supabase para Litam
# Autor: Asistente IA

Write-Host "🔧 Configurando Supabase para Litam..." -ForegroundColor Green

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

Write-Status "Instalando Supabase CLI..."
npm install -g supabase

Write-Status "Inicializando Supabase localmente..."
supabase init

Write-Status "Iniciando Supabase localmente..."
supabase start

Write-Status "Aplicando migraciones..."
supabase db reset

Write-Status "Generando tipos de TypeScript..."
supabase gen types typescript --local > ../src/types/supabase.ts

Write-Status "¡Supabase configurado exitosamente!" "success"

Write-Host ""
Write-Host "📋 Información importante:" -ForegroundColor Yellow
Write-Host "- Supabase Studio: http://localhost:54323"
Write-Host "- API URL: http://localhost:54321"
Write-Host "- Database URL: postgresql://postgres:postgres@localhost:54322/postgres"
Write-Host ""
Write-Host "🔗 Para producción:" -ForegroundColor Cyan
Write-Host "1. Ve a https://supabase.com"
Write-Host "2. Crea una cuenta y un nuevo proyecto"
Write-Host "3. Obtén las credenciales de producción"
Write-Host "4. Configura las variables de entorno"
Write-Host ""

Write-Host "Presiona cualquier tecla para continuar..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown") 