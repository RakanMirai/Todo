# Docker Deployment Guide

Quick reference for building and running the Todo Frontend with Docker.

## 🚀 Quick Start

### Local Development with Docker

```bash
# Build the image
docker build -t todo-frontend .

# Run the container
docker run -p 3000:80 todo-frontend

# Access at http://localhost:3000
```

### Using Docker Compose

```bash
# Start the service
docker-compose up -d

# View logs
docker-compose logs -f

# Stop the service
docker-compose down
```

## 🔧 Build with Custom Backend URL

```bash
# Build with production backend URL
docker build \
    --build-arg REACT_APP_API_URL=https://api.yourdomain.com \
    -t todo-frontend .

# Run the container
docker run -p 80:80 todo-frontend
```

## 📦 Multi-Platform Builds

```bash
# Build for multiple architectures
docker buildx build \
    --platform linux/amd64,linux/arm64 \
    -t todo-frontend:latest \
    --build-arg REACT_APP_API_URL=https://api.yourdomain.com \
    .
```

## 🧪 Testing the Container

```bash
# Run container
docker run -d -p 3000:80 --name todo-test todo-frontend

# Test health endpoint
curl http://localhost:3000/

# Check logs
docker logs todo-test

# Stop and remove
docker stop todo-test && docker rm todo-test
```

## 📊 Container Details

- **Base Image**: `nginx:alpine` (~7MB)
- **Final Image Size**: ~50-60MB
- **Exposed Port**: 80
- **Health Check**: Built-in via nginx

## 🔍 Troubleshooting

### Container won't start
```bash
# Check logs
docker logs <container-id>

# Inspect the image
docker inspect todo-frontend
```

### Can't access the application
```bash
# Check if container is running
docker ps

# Check port mapping
docker port <container-id>

# Test from inside container
docker exec -it <container-id> wget -O- http://localhost/
```

### Build fails
```bash
# Clear Docker cache
docker builder prune

# Rebuild without cache
docker build --no-cache -t todo-frontend .
```

## 📚 Additional Commands

```bash
# View image details
docker images todo-frontend

# Remove old images
docker image prune -a

# Save image to file
docker save todo-frontend:latest | gzip > todo-frontend.tar.gz

# Load image from file
docker load < todo-frontend.tar.gz
```

## 🌐 Environment Variables

The following build arguments are available:

- `REACT_APP_API_URL` - Backend API URL (default: http://localhost:8000)

Example:
```bash
docker build --build-arg REACT_APP_API_URL=https://api.example.com -t todo-frontend .
```

## 🔐 Production Best Practices

1. **Use specific tags** instead of `latest`
   ```bash
   docker build -t todo-frontend:v1.0.0 .
   ```

2. **Scan for vulnerabilities**
   ```bash
   docker scan todo-frontend:latest
   ```

3. **Use multi-stage builds** (already implemented)

4. **Set resource limits**
   ```bash
   docker run -m 512m --cpus=0.5 -p 3000:80 todo-frontend
   ```

5. **Run as non-root user** (nginx handles this)

## 🚀 Deploy to Docker Hub

```bash
# Tag the image
docker tag todo-frontend yourusername/todo-frontend:latest

# Login to Docker Hub
docker login

# Push the image
docker push yourusername/todo-frontend:latest
```

## ☁️ Deploy to AWS

See [AWS_DEPLOYMENT.md](./AWS_DEPLOYMENT.md) for detailed AWS deployment instructions.

Quick deploy:
```bash
# Windows
.\deploy-to-aws.ps1

# Linux/Mac
./deploy-to-aws.sh
```
