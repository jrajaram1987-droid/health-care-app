# PowerShell script to upload files directly to GitHub via API
# No Git installation required!

param(
    [Parameter(Mandatory=$true)]
    [string]$GitHubToken
)

$ErrorActionPreference = "Stop"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Uploading to GitHub via API" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$repoOwner = "jrajaram1987-droid"
$repoName = "health-care-app"
$baseUrl = "https://api.github.com/repos/$repoOwner/$repoName"

# Headers for GitHub API
$headers = @{
    "Authorization" = "token $GitHubToken"
    "Accept" = "application/vnd.github.v3+json"
}

# Function to get file content as base64
function Get-FileContent {
    param([string]$FilePath)
    $bytes = [System.IO.File]::ReadAllBytes($FilePath)
    $base64 = [Convert]::ToBase64String($bytes)
    return $base64
}

# Function to upload file to GitHub
function Upload-File {
    param(
        [string]$FilePath,
        [string]$Content,
        [string]$Message = "Add file"
    )
    
    $relativePath = $FilePath.Replace((Get-Location).Path + "\", "").Replace("\", "/")
    
    $body = @{
        message = $Message
        content = $Content
    } | ConvertTo-Json
    
    try {
        $uri = "$baseUrl/contents/$relativePath"
        $response = Invoke-RestMethod -Uri $uri -Method Put -Headers $headers -Body $body -ContentType "application/json"
        Write-Host "✓ Uploaded: $relativePath" -ForegroundColor Green
        return $true
    } catch {
        if ($_.Exception.Response.StatusCode -eq 422) {
            Write-Host "⚠ File exists: $relativePath (skipping)" -ForegroundColor Yellow
            return $false
        } else {
            Write-Host "✗ Failed: $relativePath - $($_.Exception.Message)" -ForegroundColor Red
            return $false
        }
    }
}

# Get all files to upload (excluding node_modules, .next, data, etc.)
Write-Host "Scanning files..." -ForegroundColor Cyan
$filesToUpload = Get-ChildItem -Recurse -File | Where-Object {
    $fullPath = $_.FullName
    $relativePath = $fullPath.Replace((Get-Location).Path + "\", "")
    
    # Exclude patterns
    -not ($relativePath -match "node_modules") -and
    -not ($relativePath -match "\.next") -and
    -not ($relativePath -match "^data\\") -and
    -not ($relativePath -match "\.git") -and
    -not ($relativePath -match "\.env") -and
    -not ($relativePath -match "package-lock\.json") -and
    -not ($relativePath -match "pnpm-lock\.yaml")
}

Write-Host "Found $($filesToUpload.Count) files to upload" -ForegroundColor Green
Write-Host ""

$uploaded = 0
$skipped = 0
$failed = 0

foreach ($file in $filesToUpload) {
    $relativePath = $file.FullName.Replace((Get-Location).Path + "\", "").Replace("\", "/")
    Write-Host "Uploading: $relativePath" -ForegroundColor Gray
    
    try {
        $content = Get-FileContent -FilePath $file.FullName
        $result = Upload-File -FilePath $file.FullName -Content $content -Message "Add $relativePath"
        
        if ($result) {
            $uploaded++
        } else {
            $skipped++
        }
    } catch {
        Write-Host "✗ Error uploading $relativePath : $($_.Exception.Message)" -ForegroundColor Red
        $failed++
    }
    
    # Rate limiting - small delay
    Start-Sleep -Milliseconds 100
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Upload Summary" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Uploaded: $uploaded" -ForegroundColor Green
Write-Host "Skipped: $skipped" -ForegroundColor Yellow
Write-Host "Failed: $failed" -ForegroundColor $(if ($failed -gt 0) { "Red" } else { "Green" })
Write-Host ""
Write-Host "Repository: https://github.com/$repoOwner/$repoName" -ForegroundColor Cyan

