# Push Todo App to GitHub

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Push Todo App to GitHub" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Step 1: Initialize Git
Write-Host "Step 1: Initializing Git repository..." -ForegroundColor Yellow
git init

if ($LASTEXITCODE -ne 0) {
    Write-Host "Failed to initialize git repository" -ForegroundColor Red
    exit 1
}

Write-Host "+ Git repository initialized" -ForegroundColor Green
Write-Host ""

# Step 2: Add all files
Write-Host "Step 2: Adding files to Git..." -ForegroundColor Yellow
git add .

Write-Host "+ Files staged for commit" -ForegroundColor Green
Write-Host ""

# Step 3: Check what will be committed
Write-Host "Files to be committed:" -ForegroundColor Cyan
git status --short

Write-Host ""
Write-Host "Files being ignored:" -ForegroundColor Gray
git status --ignored --short | Select-Object -First 10
Write-Host ""

# Step 4: Create initial commit
Write-Host "Step 3: Creating initial commit..." -ForegroundColor Yellow
git commit -m "Initial commit: Full-stack Todo app with FastAPI + React

- Backend: FastAPI with JWT auth, SQLAlchemy, PostgreSQL support
- Frontend: React 18 with React Router, modern UI
- Deployment: Docker multi-stage build for AWS Elastic Beanstalk
- Features: Full CRUD, auth, admin panel, role-based access
- Documentation: Comprehensive guides for local dev and AWS deployment"

if ($LASTEXITCODE -ne 0) {
    Write-Host "Failed to create commit" -ForegroundColor Red
    exit 1
}

Write-Host "+ Initial commit created" -ForegroundColor Green
Write-Host ""

# Step 5: Instructions for GitHub
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Next Steps: Connect to GitHub" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Option 1: Create New Repository on GitHub" -ForegroundColor Yellow
Write-Host ""
Write-Host "1. Go to: https://github.com/new" -ForegroundColor White
Write-Host "2. Repository name: todo-fullstack-app" -ForegroundColor White
Write-Host "3. Description: Full-stack Todo app with FastAPI and React" -ForegroundColor White
Write-Host "4. Keep it Public or Private (your choice)" -ForegroundColor White
Write-Host "5. DO NOT initialize with README (we already have one)" -ForegroundColor White
Write-Host "6. Click 'Create repository'" -ForegroundColor White
Write-Host ""

Write-Host "Then run these commands:" -ForegroundColor Yellow
Write-Host ""
Write-Host "git remote add origin https://github.com/YOUR_USERNAME/todo-fullstack-app.git" -ForegroundColor Cyan
Write-Host "git branch -M main" -ForegroundColor Cyan
Write-Host "git push -u origin main" -ForegroundColor Cyan
Write-Host ""

Write-Host "========================================" -ForegroundColor Green
Write-Host "Option 2: Push to Existing Repository" -ForegroundColor Yellow
Write-Host ""
Write-Host "If you already have a repository, run:" -ForegroundColor White
Write-Host ""
Write-Host "git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git" -ForegroundColor Cyan
Write-Host "git branch -M main" -ForegroundColor Cyan
Write-Host "git push -u origin main" -ForegroundColor Cyan
Write-Host ""

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Git repository is ready!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
