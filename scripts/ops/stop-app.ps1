#!/usr/bin/env pwsh

Write-Host "🛑 Deteniendo Nutri App..." -ForegroundColor Red

# Matar todos los procesos de Node.js
Write-Host "🧹 Cerrando procesos de Node.js..." -ForegroundColor Yellow
$nodeProcesses = Get-Process | Where-Object {$_.ProcessName -eq "node"}

if ($nodeProcesses.Count -gt 0) {
    $nodeProcesses | Stop-Process -Force
    Write-Host "✅ Se cerraron $($nodeProcesses.Count) proceso(s) de Node.js" -ForegroundColor Green
} else {
    Write-Host "ℹ️ No se encontraron procesos de Node.js corriendo" -ForegroundColor Blue
}

# Verificar que los puertos se hayan liberado
Start-Sleep -Seconds 2

$port3000 = (netstat -an | findstr ":3000" | findstr "LISTENING").Count -gt 0
$port3002 = (netstat -an | findstr ":3002" | findstr "LISTENING").Count -gt 0

Write-Host "📊 Estado de los puertos:" -ForegroundColor Yellow
if (-not $port3000) {
    Write-Host "   ✅ Puerto 3000 (Frontend): Libre" -ForegroundColor Green
} else {
    Write-Host "   ⚠️ Puerto 3000 (Frontend): Aún ocupado" -ForegroundColor Yellow
}

if (-not $port3002) {
    Write-Host "   ✅ Puerto 3002 (Backend): Libre" -ForegroundColor Green
} else {
    Write-Host "   ⚠️ Puerto 3002 (Backend): Aún ocupado" -ForegroundColor Yellow
}

if (-not $port3000 -and -not $port3002) {
    Write-Host ""
    Write-Host "✅ ¡Aplicación detenida exitosamente!" -ForegroundColor Green
} else {
    Write-Host ""
    Write-Host "⚠️ Algunos puertos podrían necesitar unos segundos más para liberarse." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "💡 Para reiniciar la aplicación, usa: .\start-app.ps1" -ForegroundColor DarkGray 