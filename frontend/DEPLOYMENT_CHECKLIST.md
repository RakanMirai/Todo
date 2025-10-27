# 🚀 Deployment Checklist

This checklist ensures your Todo Frontend is properly configured for production deployment.

---

## ✅ Pre-Deployment Checklist

### 1. Backend API Configuration (CRITICAL)

**Status:** ⚠️ REQUIRED

The frontend needs to know where your backend API is hosted.

**Actions:**
```bash
# When building Docker image, set the backend API URL:
docker build --build-arg REACT_APP_API_URL=https://your-backend-api.com -t todo-frontend .

# Or update in deploy-to-aws.ps1:
$API_URL = "https://your-backend-api.com"
```

**Important:**
- Replace `your-backend-api.com` with your actual backend URL
- Include the protocol (`https://` or `http://`)
- Do NOT include a trailing slash
- Examples:
  - `https://api.todoapp.com`
  - `https://todo-backend.us-east-1.elasticbeanstalk.com`
  - `https://your-alb-url.region.elb.amazonaws.com`

---

### 2. Backend CORS Configuration (CRITICAL)

**Status:** ⚠️ REQUIRED

Your backend must allow requests from your frontend domain.

**Example Backend CORS Config (FastAPI):**
```python
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://your-frontend-domain.com",
        "http://localhost:3000"  # For local dev
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

---

### 3. Code Issues (FIXED ✓)

| Issue | Status | Action Taken |
|-------|--------|--------------|
| Hardcoded localhost URLs | ✅ Fixed | Uses `REACT_APP_API_URL` env var |
| Landing page links | ✅ Fixed | Changed `<a href>` to `<Link>` |
| Development proxy | ✅ OK | Only used in dev, ignored in production |

---

## 🔧 Environment Variables

### Required for Build

```bash
REACT_APP_API_URL=https://your-backend-api.com
```

### How to Set

**Docker Build:**
```bash
docker build --build-arg REACT_APP_API_URL=https://api.example.com -t todo-frontend .
```

**AWS ECS Task Definition:**
```json
"environment": [
  {
    "name": "REACT_APP_API_URL",
    "value": "https://your-backend-api.com"
  }
]
```

⚠️ **Important:** Environment variables in React must be set at **BUILD TIME**, not runtime!

---

## 📋 Deployment Steps

### Step 1: Verify Backend is Running

```bash
# Test your backend API
curl https://your-backend-api.com/docs

# Should return backend documentation or 200 OK
```

### Step 2: Update Configuration

1. Open `deploy-to-aws.ps1` (Windows) or `deploy-to-aws.sh` (Linux/Mac)
2. Update these values:
   ```powershell
   $AWS_ACCOUNT_ID = "123456789012"  # Your AWS account ID
   $API_URL = "https://your-backend-api.com"  # Your backend URL
   $AWS_REGION = "us-east-1"  # Your AWS region
   ```

### Step 3: Build Docker Image Locally (Test)

```bash
# Test build
docker build --build-arg REACT_APP_API_URL=https://your-backend-api.com -t todo-frontend .

# Test run
docker run -p 3000:80 todo-frontend

# Visit http://localhost:3000 and test
```

### Step 4: Deploy to AWS

```bash
# Windows
.\deploy-to-aws.ps1

# Linux/Mac
./deploy-to-aws.sh
```

---

## 🧪 Testing After Deployment

### 1. Test Frontend Loads
```bash
curl https://your-frontend-url.com/
```

### 2. Test API Connectivity
- Open browser DevTools (F12)
- Go to Network tab
- Login to the app
- Check API calls are going to correct backend URL
- Should see requests to `https://your-backend-api.com/auth/login`

### 3. Test Full User Flow
- [ ] Can access landing page
- [ ] Can register new account
- [ ] Can login
- [ ] Can create todos
- [ ] Can view todos
- [ ] Can update todos
- [ ] Can delete todos
- [ ] Admin can access admin panel

---

## 🔍 Troubleshooting

### Issue: API calls failing with CORS errors

**Problem:** Backend CORS not configured

**Solution:**
1. Add your frontend domain to backend CORS allowed origins
2. Ensure credentials are allowed
3. Restart backend service

### Issue: API calls going to localhost

**Problem:** `REACT_APP_API_URL` not set during build

**Solution:**
1. Rebuild Docker image with correct `--build-arg`
2. Ensure environment variable is set at BUILD time
3. Check: `docker inspect todo-frontend | grep REACT_APP`

### Issue: 404 errors when refreshing pages

**Problem:** nginx configuration

**Solution:** ✅ Already handled in `nginx.conf`
- All routes redirect to index.html
- React Router handles client-side routing

### Issue: Images/assets not loading

**Problem:** Incorrect asset paths

**Solution:** ✅ Already handled
- Create React App uses relative paths
- All assets bundled correctly

---

## 🔐 Security Checklist

- [ ] Backend API uses HTTPS
- [ ] CORS properly configured (not using `*` in production)
- [ ] Security headers configured in nginx (✅ already in nginx.conf)
- [ ] Secrets not committed to git (check `.gitignore`)
- [ ] AWS security groups properly configured
- [ ] SSL/TLS certificate configured (via AWS ACM)

---

## 📊 Post-Deployment Monitoring

### CloudWatch Logs
```bash
# View frontend logs
aws logs tail /ecs/todo-frontend --follow
```

### Health Checks
```bash
# Check container health
aws ecs describe-services --cluster todo-cluster --services todo-frontend-service
```

### Metrics to Monitor
- CPU/Memory utilization
- Request count
- Error rate (5xx responses)
- Response time

---

## 💡 Common Configuration Examples

### AWS Application Load Balancer
```
Frontend: https://app.yourdomain.com
Backend:  https://api.yourdomain.com

REACT_APP_API_URL=https://api.yourdomain.com
```

### Single Domain with Path-Based Routing
```
Frontend: https://yourdomain.com
Backend:  https://yourdomain.com/api

REACT_APP_API_URL=https://yourdomain.com/api
```

### Development Environment
```
Frontend: http://localhost:3000
Backend:  http://localhost:8000

REACT_APP_API_URL=http://localhost:8000
```

---

## 🎯 Quick Reference

**Build Command:**
```bash
docker build --build-arg REACT_APP_API_URL=<YOUR_BACKEND_URL> -t todo-frontend .
```

**Run Command:**
```bash
docker run -p 80:80 todo-frontend
```

**Deploy Command (Windows):**
```bash
.\deploy-to-aws.ps1
```

---

## ✅ Final Checklist

Before deploying to production:

- [ ] Backend API is running and accessible
- [ ] Backend CORS includes frontend domain
- [ ] `REACT_APP_API_URL` configured correctly
- [ ] Docker image builds successfully
- [ ] Tested locally with Docker
- [ ] AWS credentials configured
- [ ] AWS resources created (ECR, ECS, ALB)
- [ ] Deploy script updated with correct values
- [ ] Security groups allow traffic
- [ ] SSL certificate configured (for HTTPS)

**Ready to deploy!** 🚀
