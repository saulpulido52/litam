Write-Host "🔍 Verificando compilación del backend..." -ForegroundColor Yellow

try {
    Write-Host "📋 Instalando dependencias..." -ForegroundColor Blue
    npm install --silent

    Write-Host "🔨 Verificando compilación TypeScript..." -ForegroundColor Blue
    npx tsc --noEmit --skipLibCheck

    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Compilación exitosa! Iniciando servidor..." -ForegroundColor Green
        npm run dev
    } else {
        Write-Host "❌ Errores de compilación encontrados" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "❌ Error: $_" -ForegroundColor Red
    exit 1
} 