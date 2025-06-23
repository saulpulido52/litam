# Script para probar los endpoints de pacientes
Write-Host "🧪 Probando API de Pacientes..." -ForegroundColor Green

# Test 1: Health Check
Write-Host "`n1. Probando Health Check..." -ForegroundColor Yellow
try {
    $health = Invoke-RestMethod -Uri "http://localhost:4000/api/health" -Method GET
    Write-Host "✅ Backend funcionando: $($health.status)" -ForegroundColor Green
} catch {
    Write-Host "❌ Backend no disponible" -ForegroundColor Red
    exit 1
}

# Test 2: Login
Write-Host "`n2. Probando Login..." -ForegroundColor Yellow
try {
    $loginBody = @{
        email = "nutritionist@demo.com"
        password = "demo123"
    } | ConvertTo-Json
    
    $loginResponse = Invoke-RestMethod -Uri "http://localhost:4000/api/auth/login" -Method POST -Body $loginBody -ContentType "application/json"
    $token = $loginResponse.token
    Write-Host "✅ Login exitoso, token obtenido" -ForegroundColor Green
} catch {
    Write-Host "❌ Error en login: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Test 3: Obtener pacientes
Write-Host "`n3. Probando obtener pacientes..." -ForegroundColor Yellow
try {
    $headers = @{
        Authorization = "Bearer $token"
        'Content-Type' = "application/json"
    }
    
    $patients = Invoke-RestMethod -Uri "http://localhost:4000/api/patients/my-patients" -Method GET -Headers $headers
    Write-Host "✅ Pacientes obtenidos: $($patients.data.patients.Count) pacientes" -ForegroundColor Green
    
    if ($patients.data.patients.Count -gt 0) {
        $firstPatient = $patients.data.patients[0]
        Write-Host "   Primer paciente: $($firstPatient.first_name) $($firstPatient.last_name)" -ForegroundColor Cyan
    }
} catch {
    Write-Host "❌ Error obteniendo pacientes: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 4: Crear paciente de prueba
Write-Host "`n4. Probando crear paciente..." -ForegroundColor Yellow
try {
    $newPatientBody = @{
        email = "paciente.test@demo.com"
        password = "test123"
        first_name = "Paciente"
        last_name = "Prueba"
        age = 30
        gender = "male"
        profile = @{
            height = 175
            current_weight = 80
            activity_level = "Moderada"
            medical_conditions = @("Ninguna")
            allergies = @()
            objectives = @("Mantener peso")
        }
    } | ConvertTo-Json -Depth 3
    
    $newPatient = Invoke-RestMethod -Uri "http://localhost:4000/api/patients" -Method POST -Body $newPatientBody -Headers $headers
    Write-Host "✅ Paciente creado: $($newPatient.data.patient.first_name) $($newPatient.data.patient.last_name)" -ForegroundColor Green
    $createdPatientId = $newPatient.data.patient.id
} catch {
    Write-Host "❌ Error creando paciente: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 5: Obtener paciente específico
if ($createdPatientId) {
    Write-Host "`n5. Probando obtener paciente específico..." -ForegroundColor Yellow
    try {
        $specificPatient = Invoke-RestMethod -Uri "http://localhost:4000/api/patients/$createdPatientId" -Method GET -Headers $headers
        Write-Host "✅ Paciente específico obtenido: $($specificPatient.data.patient.email)" -ForegroundColor Green
    } catch {
        Write-Host "❌ Error obteniendo paciente específico: $($_.Exception.Message)" -ForegroundColor Red
    }
}

Write-Host "`n🎉 Pruebas completadas!" -ForegroundColor Green
Write-Host "📱 Frontend disponible en: http://localhost:5000" -ForegroundColor Cyan
Write-Host "🔧 Backend disponible en: http://localhost:4000/api" -ForegroundColor Cyan 