# PowerShell script to start the frontend

Write-Host "Starting Todo App Frontend..." -ForegroundColor Green
Write-Host "================================" -ForegroundColor Green
Write-Host ""

# Check if node_modules exists
if (-not (Test-Path ".\node_modules"))
{
    Write-Host "X Dependencies not installed!" -ForegroundColor Red
    Write-Host "  Installing now..." -ForegroundColor Yellow
    npm install
    Write-Host "+ Dependencies installed!" -ForegroundColor Cyan
    Write-Host ""
}

Write-Host "+ Starting React development server..." -ForegroundColor Cyan
Write-Host "  App: http://localhost:3000" -ForegroundColor White
Write-Host ""
Write-Host "Make sure the backend is running on port 8000!" -ForegroundColor Yellow
Write-Host "Press Ctrl+C to stop the server" -ForegroundColor Gray
Write-Host ""

# Start the development server
npm start
