# AWS Deployment Guide - Todo Frontend

This guide covers deploying the Todo App frontend to AWS using various services.

## 📋 Prerequisites

- AWS Account with appropriate permissions
- AWS CLI installed and configured
- Docker installed locally
- Backend API deployed and accessible

---

## 🚀 Deployment Options

### Option 1: AWS ECS with Fargate (Recommended)
### Option 2: AWS Elastic Beanstalk
### Option 3: AWS App Runner (Simplest)
### Option 4: AWS ECS with EC2

---

## 🎯 Option 1: AWS ECS with Fargate (Recommended)

### Step 1: Create ECR Repository

```bash
# Create ECR repository
aws ecr create-repository \
    --repository-name todo-frontend \
    --region us-east-1

# Login to ECR
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin YOUR_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com
```

### Step 2: Build and Push Docker Image

```bash
# Build the image with your backend API URL
docker build \
    --build-arg REACT_APP_API_URL=https://your-backend-api.com \
    -t todo-frontend .

# Tag the image
docker tag todo-frontend:latest YOUR_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/todo-frontend:latest

# Push to ECR
docker push YOUR_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/todo-frontend:latest
```

### Step 3: Create ECS Cluster

```bash
aws ecs create-cluster \
    --cluster-name todo-cluster \
    --region us-east-1
```

### Step 4: Create CloudWatch Log Group

```bash
aws logs create-log-group \
    --log-group-name /ecs/todo-frontend \
    --region us-east-1
```

### Step 5: Register Task Definition

1. Update `aws-task-definition.json` with your:
   - AWS Account ID
   - AWS Region
   - ECR image URI

2. Register the task definition:

```bash
aws ecs register-task-definition \
    --cli-input-json file://aws-task-definition.json
```

### Step 6: Create Application Load Balancer

```bash
# Create ALB
aws elbv2 create-load-balancer \
    --name todo-frontend-alb \
    --subnets subnet-xxxxx subnet-yyyyy \
    --security-groups sg-xxxxx \
    --scheme internet-facing \
    --type application \
    --region us-east-1

# Create Target Group
aws elbv2 create-target-group \
    --name todo-frontend-tg \
    --protocol HTTP \
    --port 80 \
    --vpc-id vpc-xxxxx \
    --target-type ip \
    --health-check-path / \
    --region us-east-1

# Create Listener
aws elbv2 create-listener \
    --load-balancer-arn YOUR_ALB_ARN \
    --protocol HTTP \
    --port 80 \
    --default-actions Type=forward,TargetGroupArn=YOUR_TG_ARN
```

### Step 7: Create ECS Service

```bash
aws ecs create-service \
    --cluster todo-cluster \
    --service-name todo-frontend-service \
    --task-definition todo-frontend:1 \
    --desired-count 2 \
    --launch-type FARGATE \
    --platform-version LATEST \
    --network-configuration "awsvpcConfiguration={subnets=[subnet-xxxxx,subnet-yyyyy],securityGroups=[sg-xxxxx],assignPublicIp=ENABLED}" \
    --load-balancers "targetGroupArn=YOUR_TG_ARN,containerName=todo-frontend,containerPort=80" \
    --region us-east-1
```

### Step 8: Configure Auto Scaling (Optional)

```bash
# Register scalable target
aws application-autoscaling register-scalable-target \
    --service-namespace ecs \
    --scalable-dimension ecs:service:DesiredCount \
    --resource-id service/todo-cluster/todo-frontend-service \
    --min-capacity 2 \
    --max-capacity 10

# Create scaling policy
aws application-autoscaling put-scaling-policy \
    --service-namespace ecs \
    --scalable-dimension ecs:service:DesiredCount \
    --resource-id service/todo-cluster/todo-frontend-service \
    --policy-name cpu-scaling-policy \
    --policy-type TargetTrackingScaling \
    --target-tracking-scaling-policy-configuration file://scaling-policy.json
```

---

## 🎯 Option 2: AWS Elastic Beanstalk

### Step 1: Initialize Elastic Beanstalk

```bash
# Install EB CLI
pip install awsebcli

# Initialize EB application
eb init -p docker todo-frontend --region us-east-1

# Create environment
eb create todo-frontend-prod \
    --instance-type t3.small \
    --envvars REACT_APP_API_URL=https://your-backend-api.com
```

### Step 2: Deploy

```bash
# Deploy application
eb deploy

# Open in browser
eb open
```

### Step 3: Configure Auto Scaling

```bash
eb scale 2  # Set minimum instances
```

---

## 🎯 Option 3: AWS App Runner (Simplest)

### Step 1: Push to ECR (same as Option 1, Step 1-2)

### Step 2: Create App Runner Service

```bash
aws apprunner create-service \
    --service-name todo-frontend \
    --source-configuration '{
        "ImageRepository": {
            "ImageIdentifier": "YOUR_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/todo-frontend:latest",
            "ImageRepositoryType": "ECR",
            "ImageConfiguration": {
                "Port": "80",
                "RuntimeEnvironmentVariables": {
                    "NODE_ENV": "production"
                }
            }
        },
        "AutoDeploymentsEnabled": true
    }' \
    --instance-configuration '{
        "Cpu": "1 vCPU",
        "Memory": "2 GB"
    }'
```

---

## 🔧 Environment Variables

Set these when building or deploying:

- `REACT_APP_API_URL` - Your backend API URL (required)

**Example:**
```bash
# For ECS/ECR
docker build --build-arg REACT_APP_API_URL=https://api.yourdomain.com -t todo-frontend .

# For Elastic Beanstalk
eb setenv REACT_APP_API_URL=https://api.yourdomain.com
```

---

## 🔐 Security Considerations

### 1. Configure Security Groups

```bash
# Allow HTTP/HTTPS traffic
aws ec2 authorize-security-group-ingress \
    --group-id sg-xxxxx \
    --protocol tcp \
    --port 80 \
    --cidr 0.0.0.0/0

aws ec2 authorize-security-group-ingress \
    --group-id sg-xxxxx \
    --protocol tcp \
    --port 443 \
    --cidr 0.0.0.0/0
```

### 2. Set Up HTTPS with ACM

```bash
# Request certificate
aws acm request-certificate \
    --domain-name yourdomain.com \
    --validation-method DNS \
    --region us-east-1

# Add HTTPS listener to ALB
aws elbv2 create-listener \
    --load-balancer-arn YOUR_ALB_ARN \
    --protocol HTTPS \
    --port 443 \
    --certificates CertificateArn=YOUR_CERT_ARN \
    --default-actions Type=forward,TargetGroupArn=YOUR_TG_ARN
```

### 3. Configure CORS on Backend API

Ensure your backend allows requests from your frontend domain.

---

## 📊 Monitoring and Logging

### CloudWatch Logs

```bash
# View logs
aws logs tail /ecs/todo-frontend --follow
```

### CloudWatch Metrics

Monitor these key metrics:
- CPU Utilization
- Memory Utilization
- Request Count
- Target Response Time

### Set Up Alarms

```bash
aws cloudwatch put-metric-alarm \
    --alarm-name high-cpu-todo-frontend \
    --alarm-description "Alert when CPU exceeds 80%" \
    --metric-name CPUUtilization \
    --namespace AWS/ECS \
    --statistic Average \
    --period 300 \
    --threshold 80 \
    --comparison-operator GreaterThanThreshold \
    --evaluation-periods 2
```

---

## 🔄 CI/CD Pipeline

### GitHub Actions Example

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to AWS ECS

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v2
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: us-east-1
      
      - name: Login to Amazon ECR
        id: login-ecr
        uses: aws-actions/amazon-ecr-login@v1
      
      - name: Build and push image
        env:
          ECR_REGISTRY: ${{ steps.login-ecr.outputs.registry }}
          ECR_REPOSITORY: todo-frontend
          IMAGE_TAG: ${{ github.sha }}
        run: |
          docker build --build-arg REACT_APP_API_URL=${{ secrets.API_URL }} -t $ECR_REGISTRY/$ECR_REPOSITORY:$IMAGE_TAG .
          docker push $ECR_REGISTRY/$ECR_REPOSITORY:$IMAGE_TAG
          docker tag $ECR_REGISTRY/$ECR_REPOSITORY:$IMAGE_TAG $ECR_REGISTRY/$ECR_REPOSITORY:latest
          docker push $ECR_REGISTRY/$ECR_REPOSITORY:latest
      
      - name: Deploy to ECS
        run: |
          aws ecs update-service \
            --cluster todo-cluster \
            --service todo-frontend-service \
            --force-new-deployment
```

---

## 💰 Cost Estimation

### ECS Fargate (Recommended)
- **vCPU**: 0.25 vCPU = ~$0.04/hour
- **Memory**: 512 MB = ~$0.005/hour
- **Total**: ~$32/month (2 instances)
- **ALB**: ~$20/month
- **Data Transfer**: Variable

### App Runner
- **vCPU + Memory**: ~$25-40/month
- **Requests**: $0.10 per million requests

### Elastic Beanstalk
- **t3.small**: ~$15/month per instance
- **Load Balancer**: ~$20/month

---

## 🧪 Testing the Deployment

```bash
# Test health endpoint
curl http://your-alb-url.region.elb.amazonaws.com/

# Test with custom domain
curl https://yourdomain.com/
```

---

## 🛠️ Troubleshooting

### Container won't start
```bash
# Check ECS task logs
aws ecs describe-tasks \
    --cluster todo-cluster \
    --tasks TASK_ARN

# View CloudWatch logs
aws logs tail /ecs/todo-frontend --follow
```

### Health check failing
- Verify nginx is running on port 80
- Check security group allows traffic
- Verify VPC/subnet configuration

### Can't connect to backend API
- Verify REACT_APP_API_URL is set correctly
- Check CORS configuration on backend
- Verify backend security group allows frontend traffic

---

## 📚 Additional Resources

- [AWS ECS Documentation](https://docs.aws.amazon.com/ecs/)
- [AWS Elastic Beanstalk](https://docs.aws.amazon.com/elasticbeanstalk/)
- [AWS App Runner](https://docs.aws.amazon.com/apprunner/)
- [Docker Best Practices](https://docs.docker.com/develop/dev-best-practices/)

---

## 🚀 Quick Start Script

Save as `deploy-to-aws.sh`:

```bash
#!/bin/bash

# Configuration
AWS_REGION="us-east-1"
AWS_ACCOUNT_ID="YOUR_ACCOUNT_ID"
ECR_REPO="todo-frontend"
API_URL="https://your-backend-api.com"

# Build and push
echo "Building Docker image..."
docker build --build-arg REACT_APP_API_URL=$API_URL -t $ECR_REPO .

echo "Tagging image..."
docker tag $ECR_REPO:latest $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/$ECR_REPO:latest

echo "Logging into ECR..."
aws ecr get-login-password --region $AWS_REGION | docker login --username AWS --password-stdin $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com

echo "Pushing to ECR..."
docker push $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/$ECR_REPO:latest

echo "Updating ECS service..."
aws ecs update-service \
    --cluster todo-cluster \
    --service todo-frontend-service \
    --force-new-deployment \
    --region $AWS_REGION

echo "Deployment initiated! Check AWS Console for status."
```

Make it executable: `chmod +x deploy-to-aws.sh`
