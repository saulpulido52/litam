$files = Get-Content conflicts.txt
foreach ($file in $files) {
    if ($file -and (Test-Path $file)) {
        Write-Host "Restoring $file from nutri/main..."
        git checkout nutri/main -- "$file"
    }
}
Write-Host "Conflict resolution complete."
