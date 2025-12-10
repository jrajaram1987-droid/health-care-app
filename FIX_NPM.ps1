# Fix npm not recognized in PowerShell

Write-Host "Refreshing PATH environment variable..." -ForegroundColor Yellow

# Refresh PATH from system environment
$env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")

# Fix PowerShell execution policy for npm
Write-Host "Setting execution policy..." -ForegroundColor Yellow
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser -Force

# Test if it works
Write-Host ""
Write-Host "Testing Node.js and npm..." -ForegroundColor Cyan
try {
    $nodeVersion = node --version
    $npmVersion = npm --version
    Write-Host "✅ Node.js: $nodeVersion" -ForegroundColor Green
    Write-Host "✅ npm: $npmVersion" -ForegroundColor Green
    Write-Host ""
    Write-Host "SUCCESS! Now you can run:" -ForegroundColor Green
    Write-Host "  npm install" -ForegroundColor Yellow
    Write-Host "  npm run dev" -ForegroundColor Yellow
} catch {
    Write-Host "❌ Still not working. Try:" -ForegroundColor Red
    Write-Host "1. Close this PowerShell window" -ForegroundColor Yellow
    Write-Host "2. Open a NEW PowerShell window" -ForegroundColor Yellow
    Write-Host "3. Run this script again" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Or restart your computer." -ForegroundColor Yellow
}



