# Test Patients API Endpoint
Write-Host "Testing Patients API Endpoint..." -ForegroundColor Cyan

# Login as nutritionist
Write-Host "`nLogging in as nutritionist..." -ForegroundColor Yellow
$loginBody = @{
    email = "nutritionist@demo.com"
    password = "demo123"
} | ConvertTo-Json

try {
    $loginResponse = Invoke-RestMethod -Uri "http://localhost:4000/api/auth/login" -Method POST -Body $loginBody -ContentType "application/json"
    $token = $loginResponse.data.token
    Write-Host "Login successful" -ForegroundColor Green
} catch {
    Write-Host "Login failed: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Test my-patients endpoint
Write-Host "`nTesting /patients/my-patients endpoint..." -ForegroundColor Yellow
try {
    $headers = @{
        "Authorization" = "Bearer $token"
        "Content-Type" = "application/json"
    }
    
    $response = Invoke-RestMethod -Uri "http://localhost:4000/api/patients/my-patients" -Method GET -Headers $headers
    
    Write-Host "API call successful" -ForegroundColor Green
    Write-Host "Total patients: $($response.data.total)" -ForegroundColor Cyan
    Write-Host "Patients returned: $($response.data.patients.Count)" -ForegroundColor Cyan
    
    # Check for problematic IDs
    $problematicIds = @("73a9ef86-60fc-4b3a-b8a0-8b87998b86a8")
    $problematicPatients = @()
    
    foreach ($patient in $response.data.patients) {
        $patientId = $patient.user.id
        $patientName = "$($patient.user.first_name) $($patient.user.last_name)"
        $patientEmail = $patient.user.email
        
        Write-Host "`nPatient: $patientName" -ForegroundColor White
        Write-Host "   ID: $patientId" -ForegroundColor Gray
        Write-Host "   Email: $patientEmail" -ForegroundColor Gray
        
        if ($problematicIds -contains $patientId) {
            Write-Host "   PROBLEMATIC ID DETECTED!" -ForegroundColor Red
            $problematicPatients += @{
                id = $patientId
                name = $patientName
                email = $patientEmail
            }
        } else {
            Write-Host "   Valid ID" -ForegroundColor Green
        }
    }
    
    if ($problematicPatients.Count -gt 0) {
        Write-Host "`nPROBLEM DETECTED:" -ForegroundColor Red
        Write-Host "   The API is returning patients with problematic IDs:" -ForegroundColor Red
        foreach ($problematic in $problematicPatients) {
            Write-Host "   - $($problematic.name) ($($problematic.id))" -ForegroundColor Red
        }
    } else {
        Write-Host "`nNO PROBLEMS DETECTED:" -ForegroundColor Green
        Write-Host "   All patients returned by the API have valid IDs." -ForegroundColor Green
    }
    
} catch {
    Write-Host "API call failed: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response) {
        $statusCode = $_.Exception.Response.StatusCode
        Write-Host "   Status Code: $statusCode" -ForegroundColor Red
    }
}

Write-Host "`n🎉 Pruebas completadas!" -ForegroundColor Green
Write-Host "📱 Frontend disponible en: http://localhost:5000" -ForegroundColor Cyan
Write-Host "🔧 Backend disponible en: http://localhost:4000/api" -ForegroundColor Cyan 