# Script para configurar variables de entorno de Supabase
Write-Host "🔧 Configurando variables de entorno para Supabase..." -ForegroundColor Green

# Crear archivo .env en nutri-web
$envContent = @"
# Supabase Configuration
VITE_SUPABASE_URL=https://zmetgcekjpxcboyrnhat.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InptZXRnY2VranB4Y2JveXJuaGF0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE3ODkyOTAsImV4cCI6MjA2NzM2NTI5MH0.Swr7n6k79dK8a7XpFadALQthq7eX5DRLR1-oJxwCswM

# API Configuration
VITE_API_URL=https://zmetgcekjpxcboyrnhat.supabase.co/rest/v1

# Development Configuration
VITE_APP_NAME=Litam
VITE_APP_VERSION=1.0.0
VITE_APP_ENV=development
"@

# Guardar en nutri-web/.env
$envContent | Out-File -FilePath "nutri-web\.env" -Encoding UTF8

Write-Host "✅ Archivo .env creado en nutri-web/.env" -ForegroundColor Green
Write-Host "📝 Variables configuradas:" -ForegroundColor Cyan
Write-Host "   - VITE_SUPABASE_URL" -ForegroundColor White
Write-Host "   - VITE_SUPABASE_ANON_KEY" -ForegroundColor White
Write-Host "   - VITE_API_URL" -ForegroundColor White
Write-Host "   - VITE_APP_NAME" -ForegroundColor White
Write-Host "   - VITE_APP_VERSION" -ForegroundColor White
Write-Host "   - VITE_APP_ENV" -ForegroundColor White

Write-Host "🚀 Para usar en desarrollo local:" -ForegroundColor Yellow
Write-Host "   cd nutri-web" -ForegroundColor White
Write-Host "   npm run dev" -ForegroundColor White 