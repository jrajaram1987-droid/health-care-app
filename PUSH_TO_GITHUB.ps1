# PowerShell script to push healthcare app to GitHub
# Run this script in PowerShell: .\PUSH_TO_GITHUB.ps1

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Healthcare App - Git Push Script" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if git is installed
try {
    $gitVersion = git --version
    Write-Host "Git found: $gitVersion" -ForegroundColor Green
} catch {
    Write-Host "ERROR: Git is not installed!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please install Git from: https://git-scm.com/download/win" -ForegroundColor Yellow
    Write-Host "After installation, restart PowerShell and run this script again." -ForegroundColor Yellow
    Write-Host ""
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host ""
Write-Host "Step 1: Initializing git repository..." -ForegroundColor Cyan
git init

Write-Host ""
Write-Host "Step 2: Adding all files..." -ForegroundColor Cyan
git add .

Write-Host ""
Write-Host "Step 3: Creating initial commit..." -ForegroundColor Cyan
git commit -m "Initial commit: Healthcare app with full functionality"

Write-Host ""
Write-Host "Step 4: Setting branch to main..." -ForegroundColor Cyan
git branch -M main

Write-Host ""
Write-Host "Step 5: Adding remote repository..." -ForegroundColor Cyan
# Check if remote already exists
$remoteExists = git remote get-url origin 2>$null
if ($remoteExists) {
    Write-Host "Remote 'origin' already exists. Removing it..." -ForegroundColor Yellow
    git remote remove origin
}
git remote add origin https://github.com/jrajaram1987-droid/health-care-app.git

Write-Host ""
Write-Host "Step 6: Pushing to GitHub..." -ForegroundColor Cyan
Write-Host "You may be prompted for GitHub credentials." -ForegroundColor Yellow
Write-Host ""
git push -u origin main

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Green
    Write-Host "SUCCESS! Code pushed to GitHub!" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "Repository URL: https://github.com/jrajaram1987-droid/health-care-app" -ForegroundColor Cyan
} else {
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Red
    Write-Host "ERROR: Push failed!" -ForegroundColor Red
    Write-Host "========================================" -ForegroundColor Red
    Write-Host ""
    Write-Host "Common issues:" -ForegroundColor Yellow
    Write-Host "1. Authentication failed - Use a Personal Access Token" -ForegroundColor Yellow
    Write-Host "2. Repository doesn't exist - Create it on GitHub first" -ForegroundColor Yellow
    Write-Host "3. Network issues - Check your internet connection" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "See GIT_SETUP.md for troubleshooting tips." -ForegroundColor Yellow
}

Write-Host ""
Read-Host "Press Enter to exit"

