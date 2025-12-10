# Create ZIP file for GitHub upload
# This excludes node_modules, .next, and data folders

Write-Host "Creating ZIP file for GitHub upload..." -ForegroundColor Cyan

# Files and folders to include
$itemsToInclude = @(
    "app",
    "components",
    "hooks",
    "lib",
    "public",
    "scripts",
    "styles",
    "*.json",
    "*.mjs",
    "*.ts",
    "*.md",
    "*.txt",
    "*.ps1",
    "*.bat",
    ".gitignore",
    "vercel.json",
    "next.config.mjs",
    "tsconfig.json",
    "postcss.config.mjs",
    "components.json"
)

# Create temporary folder
$tempFolder = "temp_upload"
if (Test-Path $tempFolder) {
    Remove-Item $tempFolder -Recurse -Force
}
New-Item -ItemType Directory -Path $tempFolder | Out-Null

Write-Host "Copying files..." -ForegroundColor Yellow

# Copy files
foreach ($item in $itemsToInclude) {
    if (Test-Path $item) {
        Copy-Item -Path $item -Destination $tempFolder -Recurse -Force -ErrorAction SilentlyContinue
    }
}

# Remove unwanted folders from temp
$foldersToRemove = @("node_modules", ".next", "data", ".git")
foreach ($folder in $foldersToRemove) {
    $folderPath = Join-Path $tempFolder $folder
    if (Test-Path $folderPath) {
        Remove-Item $folderPath -Recurse -Force -ErrorAction SilentlyContinue
    }
}

# Create ZIP
$zipFile = "healthcare-app-upload.zip"
if (Test-Path $zipFile) {
    Remove-Item $zipFile -Force
}

Write-Host "Creating ZIP archive..." -ForegroundColor Yellow
Compress-Archive -Path "$tempFolder\*" -DestinationPath $zipFile -Force

# Cleanup
Remove-Item $tempFolder -Recurse -Force

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "ZIP file created: $zipFile" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. Go to: https://github.com/new" -ForegroundColor Yellow
Write-Host "2. Create repository: health-care-app" -ForegroundColor Yellow
Write-Host "3. Click 'uploading an existing file'" -ForegroundColor Yellow
Write-Host "4. Upload: $zipFile" -ForegroundColor Yellow
Write-Host "5. Extract and commit!" -ForegroundColor Yellow
Write-Host ""

