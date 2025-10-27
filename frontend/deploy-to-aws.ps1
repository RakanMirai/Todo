# AWS Deployment Script for Todo Frontend (PowerShell)
# Run with: .\deploy-to-aws.ps1

# ========================================
# Configuration - UPDATE THESE VALUES
# ========================================
$AWS_REGION = if ($env:AWS_REGION) { $env:AWS_REGION } else { "us-east-1" }
$AWS_ACCOUNT_ID = if ($env:AWS_ACCOUNT_ID) { $env:AWS_ACCOUNT_ID } else { "YOUR_ACCOUNT_ID" }
$ECR_REPO = if ($env:ECR_REPO) { $env:ECR_REPO } else { "todo-frontend" }
$ECS_CLUSTER = if ($env:ECS_CLUSTER) { $env:ECS_CLUSTER } else { "todo-cluster" }
$ECS_SERVICE = if ($env:ECS_SERVICE) { $env:ECS_SERVICE } else { "todo-frontend-service" }
$API_URL = if ($env:API_URL) { $env:API_URL } else { "https://your-backend-api.com" }

# ========================================
# Functions
# ========================================

function Write-Info {
    param([string]$Message)
    Write-Host "[INFO] $Message" -ForegroundColor Green
}

function Write-Warning-Custom {
    param([string]$Message)
    Write-Host "[WARN] $Message" -ForegroundColor Yellow
}

function Write-Error-Custom {
    param([string]$Message)
    Write-Host "[ERROR] $Message" -ForegroundColor Red
}

function Test-CommandExists {
    param([string]$Command)
    $null -ne (Get-Command $Command -ErrorAction SilentlyContinue)
}

function Test-Prerequisites {
    Write-Info "Running pre-flight checks..."
    
    if (-not (Test-CommandExists "aws")) {
        Write-Error-Custom "AWS CLI not found. Please install it first."
        exit 1
    }
    Write-Info "✓ AWS CLI found"
    
    if (-not (Test-CommandExists "docker")) {
        Write-Error-Custom "Docker not found. Please install it first."
        exit 1
    }
    Write-Info "✓ Docker found"
}

function Test-Configuration {
    if ($AWS_ACCOUNT_ID -eq "YOUR_ACCOUNT_ID") {
        Write-Error-Custom "Please update AWS_ACCOUNT_ID in the script or set environment variable"
        exit 1
    }
    
    if ($API_URL -eq "https://your-backend-api.com") {
        Write-Warning-Custom "Using default API_URL. Update it if needed."
    }
}

# ========================================
# Main Deployment Process
# ========================================

Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "  Todo Frontend - AWS Deployment" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host ""

# Pre-flight checks
Test-Prerequisites
Test-Configuration
Write-Host ""

# Display configuration
Write-Info "Deployment Configuration:"
Write-Host "  AWS Region:    $AWS_REGION"
Write-Host "  AWS Account:   $AWS_ACCOUNT_ID"
Write-Host "  ECR Repo:      $ECR_REPO"
Write-Host "  ECS Cluster:   $ECS_CLUSTER"
Write-Host "  ECS Service:   $ECS_SERVICE"
Write-Host "  Backend API:   $API_URL"
Write-Host ""

$confirmation = Read-Host "Continue with deployment? (y/n)"
if ($confirmation -ne 'y' -and $confirmation -ne 'Y') {
    Write-Info "Deployment cancelled"
    exit 0
}

try {
    # Step 1: Login to ECR
    Write-Info "Step 1/5: Logging into Amazon ECR..."
    $ecrPassword = aws ecr get-login-password --region $AWS_REGION
    $ecrPassword | docker login --username AWS --password-stdin "$AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com"
    Write-Host ""
    
    # Step 2: Build Docker image
    Write-Info "Step 2/5: Building Docker image..."
    docker build --build-arg REACT_APP_API_URL="$API_URL" -t $ECR_REPO .
    if ($LASTEXITCODE -ne 0) { throw "Docker build failed" }
    Write-Host ""
    
    # Step 3: Tag image
    Write-Info "Step 3/5: Tagging Docker image..."
    $timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
    docker tag "${ECR_REPO}:latest" "$AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/${ECR_REPO}:latest"
    docker tag "${ECR_REPO}:latest" "$AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/${ECR_REPO}:$timestamp"
    Write-Host ""
    
    # Step 4: Push to ECR
    Write-Info "Step 4/5: Pushing image to Amazon ECR..."
    docker push "$AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/${ECR_REPO}:latest"
    if ($LASTEXITCODE -ne 0) { throw "Docker push failed" }
    docker push "$AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/${ECR_REPO}:$timestamp"
    Write-Host ""
    
    # Step 5: Update ECS service
    Write-Info "Step 5/5: Updating ECS service..."
    aws ecs update-service `
        --cluster $ECS_CLUSTER `
        --service $ECS_SERVICE `
        --force-new-deployment `
        --region $AWS_REGION `
        --no-cli-pager | Out-Null
    Write-Host ""
    
    Write-Info "✅ Deployment complete!"
    Write-Host ""
    Write-Info "Next steps:"
    Write-Host "  1. Monitor deployment: aws ecs describe-services --cluster $ECS_CLUSTER --services $ECS_SERVICE"
    Write-Host "  2. View logs: aws logs tail /ecs/$ECR_REPO --follow"
    Write-Host "  3. Check AWS Console: https://$AWS_REGION.console.aws.amazon.com/ecs/home?region=$AWS_REGION#/clusters/$ECS_CLUSTER/services"
    Write-Host ""
}
catch {
    Write-Error-Custom "Deployment failed: $_"
    exit 1
}
