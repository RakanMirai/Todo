# Prepare Full-Stack deployment package for AWS Elastic Beanstalk
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Full-Stack Todo App Deployment Package" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Define deployment files
$requiredFiles = @(
    "Dockerfile",
    "requirements.txt",
    "nginx-fullstack.conf",
    "start-fullstack.sh",
    "main.py",
    "auth.py",
    "config.py",
    "database.py",
    "models.py",
    "schemas.py",
    "dependencies.py",
    "middleware.py",
    "routers",
    "frontend"
)

# Check if all required files exist
Write-Host "Checking required files..." -ForegroundColor Yellow
$missingFiles = @()
foreach ($file in $requiredFiles) {
    if (-not (Test-Path $file)) {
        $missingFiles += $file
        Write-Host "  X Missing: $file" -ForegroundColor Red
    } else {
        Write-Host "  + Found: $file" -ForegroundColor Green
    }
}

if ($missingFiles.Count -gt 0) {
    Write-Host ""
    Write-Host "ERROR: Missing required files!" -ForegroundColor Red
    exit 1
}

# Check frontend dependencies
Write-Host ""
Write-Host "Checking frontend setup..." -ForegroundColor Yellow
if (-not (Test-Path "frontend/node_modules")) {
    Write-Host "  ! Frontend dependencies not installed" -ForegroundColor Yellow
    Write-Host "    Run: cd frontend && npm install" -ForegroundColor Gray
} else {
    Write-Host "  + Frontend dependencies installed" -ForegroundColor Green
}

if (-not (Test-Path "frontend/package.json")) {
    Write-Host "  X Missing: frontend/package.json" -ForegroundColor Red
    exit 1
}

# Remove old deployment package if exists
if (Test-Path "fullstack-deployment.zip") {
    Remove-Item "fullstack-deployment.zip" -Force
    Write-Host ""
    Write-Host "Removed old deployment package" -ForegroundColor Gray
}

# Create deployment package
Write-Host ""
Write-Host "Creating full-stack deployment package..." -ForegroundColor Yellow
Write-Host ""

# Compress all files
Compress-Archive -Path $requiredFiles -DestinationPath "fullstack-deployment.zip" -Force

Write-Host "+ Deployment package created: fullstack-deployment.zip" -ForegroundColor Green
Write-Host ""

# Show package size
$zipFile = Get-Item "fullstack-deployment.zip"
$sizeKB = [math]::Round($zipFile.Length / 1KB, 2)
$sizeMB = [math]::Round($zipFile.Length / 1MB, 2)

Write-Host "Package Details:" -ForegroundColor Cyan
Write-Host "  Size: $sizeKB KB ($sizeMB MB)" -ForegroundColor White
Write-Host "  Contents: Backend + Frontend + Nginx" -ForegroundColor White
Write-Host ""

# Show next steps
Write-Host "Next Steps:" -ForegroundColor Cyan
Write-Host "  1. Go to AWS Elastic Beanstalk Console" -ForegroundColor White
Write-Host "  2. Create new application or select existing" -ForegroundColor White
Write-Host "  3. Choose 'Docker' as platform" -ForegroundColor White
Write-Host "  4. Upload 'fullstack-deployment.zip'" -ForegroundColor White
Write-Host "  5. Configure environment variables:" -ForegroundColor White
Write-Host ""
Write-Host "     Required Environment Variables:" -ForegroundColor Yellow
Write-Host "     - SECRET_KEY=<generate-with-python-command>" -ForegroundColor Gray
Write-Host "     - DATABASE_URL=<your-postgres-connection-string>" -ForegroundColor Gray
Write-Host "     - DEBUG=False" -ForegroundColor Gray
Write-Host ""
Write-Host "  6. Generate SECRET_KEY:" -ForegroundColor White
Write-Host "     python -c \"import secrets; print(secrets.token_urlsafe(64))\"" -ForegroundColor Gray
Write-Host ""
Write-Host "Application Architecture:" -ForegroundColor Cyan
Write-Host "  + Port 8080: Nginx (serves React frontend)" -ForegroundColor White
Write-Host "  + Port 8000: Uvicorn (FastAPI backend)" -ForegroundColor White
Write-Host "  + /api/*    : Proxied to backend" -ForegroundColor White
Write-Host "  + /*        : React SPA" -ForegroundColor White
Write-Host ""
Write-Host "Ready to deploy! " -ForegroundColor Green
Write-Host ""
