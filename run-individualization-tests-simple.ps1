# Script simplificado para ejecutar tests de individualizacion del dashboard
# Ejecutar como: .\run-individualization-tests-simple.ps1

Write-Host "TESTS AUTOMATIZADOS DE INDIVIDUALIZACION NUTRI-WEB" -ForegroundColor Cyan
Write-Host "=================================================" -ForegroundColor Cyan
Write-Host ""

# Verificar dependencias
Write-Host "Verificando dependencias..." -ForegroundColor Yellow

# Verificar Node.js
try {
    $nodeVersion = node --version
    Write-Host "Node.js: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "Node.js no encontrado. Por favor instalar Node.js" -ForegroundColor Red
    exit 1
}

# Verificar package.json
if (-not (Test-Path "package.json")) {
    Write-Host "package.json no encontrado. Ejecutar desde el directorio del proyecto." -ForegroundColor Red
    exit 1
}

Write-Host "Dependencias verificadas" -ForegroundColor Green
Write-Host ""

# Crear directorio de resultados
$OutputDir = "test-results"
if (-not (Test-Path $OutputDir)) {
    New-Item -ItemType Directory -Path $OutputDir | Out-Null
    Write-Host "Directorio creado: $OutputDir" -ForegroundColor Blue
}

# Verificar archivos de test
$testFiles = @(
    "src/__tests__/dashboard/dashboard.individualization.test.ts",
    "src/__tests__/dashboard/dashboard.integration.test.ts"
)

Write-Host "Verificando archivos de test..." -ForegroundColor Yellow
foreach ($file in $testFiles) {
    if (Test-Path $file) {
        Write-Host "Encontrado: $file" -ForegroundColor Green
    } else {
        Write-Host "No encontrado: $file" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "EJECUTANDO TESTS DE INDIVIDUALIZACION" -ForegroundColor Cyan
Write-Host "====================================" -ForegroundColor Cyan

$startTime = Get-Date

# Test 1: Tests unitarios del servicio
Write-Host ""
Write-Host "TEST SUITE 1: Dashboard Service Unit Tests" -ForegroundColor Magenta
Write-Host "Archivo: src/__tests__/dashboard/dashboard.individualization.test.ts" -ForegroundColor Gray

$jestCmd1 = "npx jest src/__tests__/dashboard/dashboard.individualization.test.ts --verbose --detectOpenHandles --forceExit --testTimeout=30000"

try {
    Write-Host "Ejecutando: $jestCmd1" -ForegroundColor Blue
    $result1 = Invoke-Expression $jestCmd1
    $exitCode1 = $LASTEXITCODE
    
    if ($exitCode1 -eq 0) {
        Write-Host "Tests unitarios EXITOSOS" -ForegroundColor Green
    } else {
        Write-Host "Tests unitarios con problemas (codigo: $exitCode1)" -ForegroundColor Yellow
    }
} catch {
    Write-Host "Error ejecutando tests unitarios: $($_.Exception.Message)" -ForegroundColor Red
    $exitCode1 = 1
}

# Test 2: Tests de integracion de la API
Write-Host ""
Write-Host "TEST SUITE 2: Dashboard API Integration Tests" -ForegroundColor Magenta
Write-Host "Archivo: src/__tests__/dashboard/dashboard.integration.test.ts" -ForegroundColor Gray

$jestCmd2 = "npx jest src/__tests__/dashboard/dashboard.integration.test.ts --verbose --detectOpenHandles --forceExit --testTimeout=30000"

try {
    Write-Host "Ejecutando: $jestCmd2" -ForegroundColor Blue
    $result2 = Invoke-Expression $jestCmd2
    $exitCode2 = $LASTEXITCODE
    
    if ($exitCode2 -eq 0) {
        Write-Host "Tests de integracion EXITOSOS" -ForegroundColor Green
    } else {
        Write-Host "Tests de integracion con problemas (codigo: $exitCode2)" -ForegroundColor Yellow
    }
} catch {
    Write-Host "Error ejecutando tests de integracion: $($_.Exception.Message)" -ForegroundColor Red
    $exitCode2 = 1
}

# Generar resumen final
$endTime = Get-Date
$duration = $endTime - $startTime

Write-Host ""
Write-Host "RESUMEN FINAL DE INDIVIDUALIZACION" -ForegroundColor Cyan
Write-Host "=================================" -ForegroundColor Cyan

$totalTests = 2
$passedTests = 0
if ($exitCode1 -eq 0) { $passedTests++ }
if ($exitCode2 -eq 0) { $passedTests++ }
$failedTests = $totalTests - $passedTests

Write-Host "Tiempo total: $($duration.TotalSeconds.ToString('F1')) segundos" -ForegroundColor Blue
Write-Host "Suites ejecutadas: $totalTests" -ForegroundColor Blue
Write-Host "Suites exitosas: $passedTests" -ForegroundColor Green
if ($failedTests -gt 0) {
    Write-Host "Suites con problemas: $failedTests" -ForegroundColor Red
}

# Verificaciones especificas
Write-Host ""
Write-Host "VERIFICACIONES DE INDIVIDUALIZACION:" -ForegroundColor Yellow

$checks = @(
    @{Name="Separacion de datos por nutriologo"; Passed=($exitCode1 -eq 0)},
    @{Name="Autenticacion y autorizacion API"; Passed=($exitCode2 -eq 0)},
    @{Name="Sin exposicion de datos cruzados"; Passed=($passedTests -eq $totalTests)},
    @{Name="Tests automatizados funcionando"; Passed=(Test-Path "test-individualization-automated.ts")}
)

foreach ($check in $checks) {
    $status = if ($check.Passed) { "PASS" } else { "FAIL" }
    Write-Host "   $status - $($check.Name)" -ForegroundColor $(if ($check.Passed) { "Green" } else { "Red" })
}

$allPassed = ($checks | Where-Object { -not $_.Passed }).Count -eq 0

Write-Host ""
if ($allPassed) {
    Write-Host "RESULTADO FINAL: INDIVIDUALIZACION VERIFICADA" -ForegroundColor Green
    Write-Host "Cada nutriologo solo puede acceder a sus propios datos" -ForegroundColor Green
    Write-Host "Sistema listo para produccion" -ForegroundColor Green
    $finalExitCode = 0
} else {
    Write-Host "RESULTADO FINAL: PROBLEMAS DETECTADOS" -ForegroundColor Red
    Write-Host "Revisar las verificaciones que fallaron" -ForegroundColor Red
    Write-Host "NO desplegar hasta resolver los problemas" -ForegroundColor Red
    $finalExitCode = 1
}

# Guardar reporte en archivo
$reportFile = "$OutputDir\individualization-report-$(Get-Date -Format 'yyyyMMdd-HHmmss').txt"
$reportContent = @"
REPORTE DE TESTS DE INDIVIDUALIZACION NUTRI-WEB
================================================
Fecha: $(Get-Date)
Duracion: $($duration.TotalSeconds.ToString('F1')) segundos

RESULTADOS:
- Tests unitarios: $(if ($exitCode1 -eq 0) { "EXITOSOS" } else { "FALLARON" })
- Tests integracion: $(if ($exitCode2 -eq 0) { "EXITOSOS" } else { "FALLARON" })
- Suites exitosas: $passedTests/$totalTests

VERIFICACIONES:
$(foreach ($check in $checks) { "- $($check.Name): $(if ($check.Passed) { "PASS" } else { "FAIL" })" -join "`n" })

ESTADO FINAL: $(if ($allPassed) { "INDIVIDUALIZACION VERIFICADA" } else { "PROBLEMAS DETECTADOS" })
"@

$reportContent | Out-File $reportFile -Encoding UTF8

Write-Host ""
Write-Host "Reporte guardado en: $reportFile" -ForegroundColor Blue
Write-Host ""

exit $finalExitCode 