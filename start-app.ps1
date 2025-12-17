Write-Host "🚀 Iniciando Nutri App..." -ForegroundColor Green

# Matar procesos de Node.js existentes para evitar conflictos
Write-Host "🧹 Limpiando procesos de Node.js existentes..." -ForegroundColor Yellow
Get-Process | Where-Object {$_.ProcessName -eq "node"} | Stop-Process -Force -ErrorAction SilentlyContinue

# Esperar un momento para que se liberen los puertos
Start-Sleep -Seconds 2

Write-Host "⚡ Iniciando Backend (Puerto 4000)..." -ForegroundColor Cyan
Start-Process -FilePath "powershell" -ArgumentList "-Command", "cd '$PWD'; npm run dev" -WindowStyle Minimized

# Esperar que el backend se inicie
Start-Sleep -Seconds 5

Write-Host "🌐 Iniciando Frontend (Puerto 5000)..." -ForegroundColor Cyan
Start-Process -FilePath "powershell" -ArgumentList "-Command", "cd '$PWD/nutri-web'; npm run dev" -WindowStyle Minimized

# Esperar que el frontend se inicie
Start-Sleep -Seconds 5

Write-Host "📊 Verificando servicios..." -ForegroundColor Yellow
$backend = (netstat -an | findstr ":4000" | findstr "LISTENING").Count -gt 0
$frontend = (netstat -an | findstr ":5000" | findstr "LISTENING").Count -gt 0

if ($backend -and $frontend) {
    Write-Host "✅ ¡Aplicación iniciada exitosamente!" -ForegroundColor Green
    Write-Host "🔑 Credenciales de prueba:" -ForegroundColor White
    Write-Host "   Email: nutritionist@demo.com" -ForegroundColor Gray
    Write-Host "   Password: demo123" -ForegroundColor Gray
    Write-Host ""
    Write-Host "🌐 URLs de la aplicación:" -ForegroundColor White
    Write-Host "   Frontend: http://localhost:5000" -ForegroundColor Gray
    Write-Host "   Backend API: http://localhost:4000/api" -ForegroundColor Gray
    Write-Host ""
    Write-Host "🚀 Abriendo aplicación en el navegador..." -ForegroundColor Cyan
    Start-Sleep -Seconds 2
    Start-Process "http://localhost:5000"
}
else {
    Write-Host "❌ Error al iniciar algunos servicios:" -ForegroundColor Red
    if (-not $backend) { Write-Host "   - Backend no está corriendo en puerto 4000" -ForegroundColor Red }
    if (-not $frontend) { Write-Host "   - Frontend no está corriendo en puerto 5000" -ForegroundColor Red }
    Write-Host "   Intenta ejecutar el script nuevamente." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "💡 Para detener la aplicación, usa: Get-Process | Where-Object {`$_.ProcessName -eq 'node'} | Stop-Process -Force" -ForegroundColor DarkGray

npx ts-node seed-test-data.ts 