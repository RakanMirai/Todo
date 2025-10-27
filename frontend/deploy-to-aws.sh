#!/bin/bash

# AWS Deployment Script for Todo Frontend
# Make this file executable: chmod +x deploy-to-aws.sh

set -e  # Exit on error

# ========================================
# Configuration - UPDATE THESE VALUES
# ========================================
AWS_REGION="${AWS_REGION:-us-east-1}"
AWS_ACCOUNT_ID="${AWS_ACCOUNT_ID:-YOUR_ACCOUNT_ID}"
ECR_REPO="${ECR_REPO:-todo-frontend}"
ECS_CLUSTER="${ECS_CLUSTER:-todo-cluster}"
ECS_SERVICE="${ECS_SERVICE:-todo-frontend-service}"
API_URL="${API_URL:-https://your-backend-api.com}"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# ========================================
# Functions
# ========================================

print_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

check_aws_cli() {
    if ! command -v aws &> /dev/null; then
        print_error "AWS CLI not found. Please install it first."
        exit 1
    fi
    print_info "AWS CLI found"
}

check_docker() {
    if ! command -v docker &> /dev/null; then
        print_error "Docker not found. Please install it first."
        exit 1
    fi
    print_info "Docker found"
}

validate_config() {
    if [ "$AWS_ACCOUNT_ID" == "YOUR_ACCOUNT_ID" ]; then
        print_error "Please update AWS_ACCOUNT_ID in the script"
        exit 1
    fi
    
    if [ "$API_URL" == "https://your-backend-api.com" ]; then
        print_warning "Using default API_URL. Update it if needed."
    fi
}

# ========================================
# Main Deployment Process
# ========================================

main() {
    echo "========================================="
    echo "  Todo Frontend - AWS Deployment"
    echo "========================================="
    echo ""
    
    # Pre-flight checks
    print_info "Running pre-flight checks..."
    check_aws_cli
    check_docker
    validate_config
    echo ""
    
    # Display configuration
    print_info "Deployment Configuration:"
    echo "  AWS Region:    $AWS_REGION"
    echo "  AWS Account:   $AWS_ACCOUNT_ID"
    echo "  ECR Repo:      $ECR_REPO"
    echo "  ECS Cluster:   $ECS_CLUSTER"
    echo "  ECS Service:   $ECS_SERVICE"
    echo "  Backend API:   $API_URL"
    echo ""
    
    read -p "Continue with deployment? (y/n) " -n 1 -r
    echo ""
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        print_info "Deployment cancelled"
        exit 0
    fi
    
    # Step 1: Login to ECR
    print_info "Step 1/5: Logging into Amazon ECR..."
    aws ecr get-login-password --region "$AWS_REGION" | \
        docker login --username AWS --password-stdin \
        "$AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com"
    echo ""
    
    # Step 2: Build Docker image
    print_info "Step 2/5: Building Docker image..."
    docker build \
        --build-arg REACT_APP_API_URL="$API_URL" \
        -t "$ECR_REPO" \
        .
    echo ""
    
    # Step 3: Tag image
    print_info "Step 3/5: Tagging Docker image..."
    docker tag \
        "$ECR_REPO:latest" \
        "$AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/$ECR_REPO:latest"
    
    docker tag \
        "$ECR_REPO:latest" \
        "$AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/$ECR_REPO:$(date +%Y%m%d-%H%M%S)"
    echo ""
    
    # Step 4: Push to ECR
    print_info "Step 4/5: Pushing image to Amazon ECR..."
    docker push "$AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/$ECR_REPO:latest"
    docker push "$AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/$ECR_REPO:$(date +%Y%m%d-%H%M%S)"
    echo ""
    
    # Step 5: Update ECS service
    print_info "Step 5/5: Updating ECS service..."
    aws ecs update-service \
        --cluster "$ECS_CLUSTER" \
        --service "$ECS_SERVICE" \
        --force-new-deployment \
        --region "$AWS_REGION" \
        > /dev/null
    echo ""
    
    print_info "✅ Deployment complete!"
    echo ""
    print_info "Next steps:"
    echo "  1. Monitor deployment: aws ecs describe-services --cluster $ECS_CLUSTER --services $ECS_SERVICE"
    echo "  2. View logs: aws logs tail /ecs/$ECR_REPO --follow"
    echo "  3. Check AWS Console: https://$AWS_REGION.console.aws.amazon.com/ecs/home?region=$AWS_REGION#/clusters/$ECS_CLUSTER/services"
    echo ""
}

# Run main function
main
