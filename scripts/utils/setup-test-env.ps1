# setup-test-env.ps1
$env:DB_HOST = "localhost"
$env:DB_PORT = "5432"
$env:DB_USERNAME = "postgres"
$env:DB_PASSWORD = ""
$env:DB_DATABASE = "nutri_test"
$env:NODE_ENV = "test"
$env:JWT_SECRET = "test-secret-key-for-testing-purposes"

Write-Host "✅ Variables de entorno configuradas para pruebas"
Write-Host "DB_HOST: $env:DB_HOST"
Write-Host "DB_DATABASE: $env:DB_DATABASE"
Write-Host "NODE_ENV: $env:NODE_ENV"

# Ejecutar las pruebas
npm test 