# Direct upload to GitHub - No Git Required!
# This script uploads files directly via GitHub API

param(
    [Parameter(Mandatory=$false)]
    [string]$GitHubToken = ""
)

$repoOwner = "jrajaram1987-droid"
$repoName = "health-care-app"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "GitHub Direct Upload" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# If no token provided, guide user
if ([string]::IsNullOrEmpty($GitHubToken)) {
    Write-Host "To upload directly, you need a GitHub Personal Access Token." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Quick Steps:" -ForegroundColor Cyan
    Write-Host "1. Go to: https://github.com/settings/tokens" -ForegroundColor White
    Write-Host "2. Click 'Generate new token (classic)'" -ForegroundColor White
    Write-Host "3. Check 'repo' permission" -ForegroundColor White
    Write-Host "4. Generate and copy the token" -ForegroundColor White
    Write-Host ""
    Write-Host "Then run:" -ForegroundColor Cyan
    Write-Host "  .\UPLOAD_NOW.ps1 -GitHubToken 'YOUR_TOKEN'" -ForegroundColor Green
    Write-Host ""
    Write-Host "OR use the ZIP file method (no token needed):" -ForegroundColor Cyan
    Write-Host "  File: healthcare-app-upload.zip" -ForegroundColor Green
    Write-Host "  Upload via: https://github.com/new" -ForegroundColor Green
    Write-Host ""
    exit 0
}

# Upload using GitHub API
$baseUrl = "https://api.github.com/repos/$repoOwner/$repoName"
$headers = @{
    "Authorization" = "token $GitHubToken"
    "Accept" = "application/vnd.github.v3+json"
}

# Check if repository exists
$repoExists = $false
try {
    $repoCheck = Invoke-RestMethod -Uri "https://api.github.com/repos/$repoOwner/$repoName" -Headers $headers -ErrorAction Stop
    Write-Host "✓ Repository found" -ForegroundColor Green
    $repoExists = $true
} catch {
    $statusCode = $null
    try {
        $statusCode = $_.Exception.Response.StatusCode.value__
    } catch {
        # Status code not available
    }
    
    if ($statusCode -eq 404) {
        Write-Host "Repository not found. Creating it..." -ForegroundColor Yellow
        $createBody = @{
            name = $repoName
            description = "Healthcare Management App - Full Stack Application"
            private = $false
        } | ConvertTo-Json
        
        $createUrl = "https://api.github.com/user/repos"
        try {
            Invoke-RestMethod -Uri $createUrl -Method Post -Headers $headers -Body $createBody -ContentType "application/json" -ErrorAction Stop | Out-Null
            Write-Host "✓ Repository created" -ForegroundColor Green
            $repoExists = $true
        } catch {
            Write-Host "✗ Failed to create repository: $($_.Exception.Message)" -ForegroundColor Red
            exit 1
        }
    } else {
        Write-Host "✗ Error: $($_.Exception.Message)" -ForegroundColor Red
        exit 1
    }
}

if (-not $repoExists) {
    Write-Host "✗ Cannot proceed without repository" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "Uploading files..." -ForegroundColor Cyan
Write-Host "This may take a few minutes..." -ForegroundColor Yellow
Write-Host ""

# Get files to upload
$files = Get-ChildItem -Recurse -File | Where-Object {
    $path = $_.FullName.Replace((Get-Location).Path + "\", "")
    -not ($path -match "node_modules") -and
    -not ($path -match "\.next") -and
    -not ($path -match "^data\\") -and
    -not ($path -match "\.git") -and
    -not ($path -match "\.zip$")
}

$uploaded = 0
$total = $files.Count
$current = 0

foreach ($file in $files) {
    $current++
    $relativePath = $file.FullName.Replace((Get-Location).Path + "\", "").Replace("\", "/")
    
    Write-Progress -Activity "Uploading to GitHub" -Status "$relativePath" -PercentComplete (($current / $total) * 100)
    
    try {
        $content = [Convert]::ToBase64String([System.IO.File]::ReadAllBytes($file.FullName))
        
        $body = @{
            message = "Add $relativePath"
            content = $content
        } | ConvertTo-Json
        
        $uri = "$baseUrl/contents/$relativePath"
        Invoke-RestMethod -Uri $uri -Method Put -Headers $headers -Body $body -ContentType "application/json" -ErrorAction Stop | Out-Null
        
        $uploaded++
    } catch {
        $statusCode = $_.Exception.Response.StatusCode.value__
        if ($statusCode -eq 422) {
            # File exists, try to update
            try {
                # Get file SHA first
                $getUri = "$baseUrl/contents/$relativePath"
                $existingFile = Invoke-RestMethod -Uri $getUri -Headers $headers
                
                $body = @{
                    message = "Update $relativePath"
                    content = $content
                    sha = $existingFile.sha
                } | ConvertTo-Json
                
                Invoke-RestMethod -Uri $uri -Method Put -Headers $headers -Body $body -ContentType "application/json" -ErrorAction Stop | Out-Null
                $uploaded++
            } catch {
                # Skip if can't update
            }
        }
    }
    
    # Rate limiting
    Start-Sleep -Milliseconds 200
}

Write-Progress -Activity "Uploading to GitHub" -Completed

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "Upload Complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host "Uploaded: $uploaded files" -ForegroundColor Green
Write-Host ""
Write-Host "Repository: https://github.com/$repoOwner/$repoName" -ForegroundColor Cyan
Write-Host ""
