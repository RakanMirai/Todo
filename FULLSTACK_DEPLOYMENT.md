# 🚀 Full-Stack Todo App - AWS Deployment Guide

Complete guide to deploy your **FastAPI backend + React frontend** as a single Docker container on AWS Elastic Beanstalk.

---

## 📦 Architecture

```
┌─────────────────────────────────────┐
│   AWS Elastic Beanstalk (Port 8080) │
│                                      │
│  ┌────────────────────────────────┐ │
│  │   Nginx (Port 8080)            │ │
│  │   ├─ / → React Frontend (SPA)  │ │
│  │   └─ /api/* → Backend Proxy    │ │
│  └────────────────────────────────┘ │
│               ↓                      │
│  ┌────────────────────────────────┐ │
│  │   Uvicorn (Port 8000)          │ │
│  │   └─ FastAPI Backend           │ │
│  └────────────────────────────────┘ │
└─────────────────────────────────────┘
```

**Key Points:**
- Single Docker container runs both frontend and backend
- Nginx serves React and proxies `/api/*` requests to FastAPI
- Frontend and backend share the same domain (no CORS issues!)
- Port 8080 exposed externally

---

## ✅ Prerequisites

- [x] Python 3.11+
- [x] Node.js 18+
- [x] Docker (optional, for local testing)
- [x] AWS Account
- [x] Backend code ready
- [x] Frontend code ready

---

## 🛠️ Step 1: Prepare Application

### Install Frontend Dependencies

```powershell
cd frontend
npm install
cd ..
```

### Test Locally (Optional)

**Terminal 1 - Backend:**
```powershell
python run.py
# Runs on http://localhost:8000
```

**Terminal 2 - Frontend:**
```powershell
cd frontend
npm start
# Runs on http://localhost:3000
```

---

## 📦 Step 2: Create Deployment Package

Run the preparation script:

```powershell
.\prepare-fullstack-deployment.ps1
```

This creates `fullstack-deployment.zip` containing:
- ✅ Backend code (Python/FastAPI)
- ✅ Frontend code (React)
- ✅ Dockerfile (multi-stage build)
- ✅ Nginx configuration
- ✅ Startup script

---

## 🔑 Step 3: Generate SECRET_KEY

```powershell
python -c "import secrets; print(secrets.token_urlsafe(64))"
```

**Copy the output!** Example:
```
YwJ8YxK3N_7mF9ZvHqPt8RnL4X2QdSbC6Ae0WgU1VhIxMzPqRsT...
```

---

## ☁️ Step 4: Deploy to AWS Elastic Beanstalk

### Option A: AWS Console (Easiest)

1. **Go to [Elastic Beanstalk Console](https://console.aws.amazon.com/elasticbeanstalk/)**

2. **Create Application:**
   - Click "Create Application"
   - Application name: `todo-fullstack`
   - Platform: **Docker**
   - Platform branch: **Docker running on 64bit Amazon Linux 2023**

3. **Upload Code:**
   - Choose "Upload your code"
   - Click "Choose file"
   - Select `fullstack-deployment.zip`
   - Version label: `v1.0` (or auto-generate)

4. **Configure Environment:**
   - Click "Configure more options"
   - Find "Software" → Click "Edit"

5. **Add Environment Variables:**
   ```
   SECRET_KEY=<your-generated-64-char-key>
   DATABASE_URL=postgresql+asyncpg://user:pass@host:5432/dbname
   DEBUG=False
   ALGORITHM=HS256
   ACCESS_TOKEN_EXPIRE_MINUTES=30
   REFRESH_TOKEN_EXPIRE_DAYS=7
   ```

6. **Click "Create environment"**

   ⏳ Wait 10-15 minutes for deployment...

---

### Option B: EB CLI

```powershell
# Install EB CLI
pip install awsebcli

# Initialize
eb init

# Create environment with deployment
eb create todo-fullstack --single

# Set environment variables
eb setenv `
  SECRET_KEY="<your-key>" `
  DATABASE_URL="postgresql+asyncpg://..." `
  DEBUG=False

# Deploy
eb deploy

# Open in browser
eb open
```

---

## 🗄️ Step 5: Setup Database (RDS PostgreSQL)

### Create RDS Database:

1. Go to [RDS Console](https://console.aws.amazon.com/rds/)
2. Click "Create database"
3. **Settings:**
   - Engine: **PostgreSQL 15**
   - Template: **Free tier** (for testing) or **Production**
   - DB instance: `db.t3.micro`
   - DB identifier: `todo-postgres`
   - Username: `todouser`
   - Password: `<create-strong-password>`
4. **Connectivity:**
   - Public access: **Yes** (for easier setup)
   - VPC: Same as EB environment
5. **Additional configuration:**
   - Initial database name: `tododb`
6. **Create database**

⏳ Wait 5-10 minutes...

### Get RDS Endpoint:

1. Go to RDS → Databases → `todo-postgres`
2. Copy **Endpoint** (e.g., `todo-postgres.xxxxx.us-east-1.rds.amazonaws.com`)

### Configure Security Group:

1. In RDS database page → **Connectivity & security**
2. Click the **VPC security group**
3. **Edit inbound rules** → **Add rule:**
   - Type: **PostgreSQL**
   - Port: **5432**
   - Source: **EB security group** (or `0.0.0.0/0` for testing)
4. **Save rules**

### Update DATABASE_URL:

```powershell
# Format: postgresql+asyncpg://user:password@endpoint:5432/dbname
eb setenv DATABASE_URL="postgresql+asyncpg://todouser:YourPassword@todo-postgres.xxxxx.us-east-1.rds.amazonaws.com:5432/tododb"
```

---

## ✅ Step 6: Verify Deployment

### Get Your URL:

```powershell
eb status
# Look for: CNAME: todo-fullstack.us-east-1.elasticbeanstalk.com
```

### Test Frontend:

Open in browser:
```
http://todo-fullstack.us-east-1.elasticbeanstalk.com
```

You should see the React landing page! ✨

### Test Backend API:

```powershell
# Health check
curl http://todo-fullstack.us-east-1.elasticbeanstalk.com/api/health

# API docs
# Open in browser:
http://todo-fullstack.us-east-1.elasticbeanstalk.com/docs
```

### Test Login:

1. Go to your app URL
2. Click "Sign In"
3. Use default admin:
   - Username: `admin`
   - Password: `admin123`
4. **⚠️ Change password immediately!**

---

## 🔧 Troubleshooting

### Issue: "502 Bad Gateway"

**Check logs:**
```powershell
eb logs
```

**Common causes:**
- Backend failed to start
- Nginx configuration error
- Health check failing

**Solution:**
```powershell
# SSH into instance
eb ssh

# Check nginx
sudo systemctl status nginx

# Check Docker logs
sudo docker logs $(sudo docker ps -q)
```

### Issue: "Can't connect to API"

**Check:**
1. Frontend is trying to connect to `/api/*`
2. Nginx is proxying correctly
3. Backend is running on port 8000

**Test internally:**
```powershell
eb ssh
curl http://localhost:8080/api/health
curl http://localhost:8000/health
```

### Issue: Frontend shows blank page

**Check:**
1. React build succeeded
2. Nginx is serving files from `/usr/share/nginx/html`
3. Check browser console for errors

**View nginx logs:**
```powershell
eb ssh
sudo tail -f /var/log/nginx/error.log
```

### Issue: Database connection failed

**Check:**
1. DATABASE_URL format is correct
2. RDS security group allows connections
3. Database exists and is accessible

**Test connection:**
```powershell
eb ssh
# Install psql
sudo yum install -y postgresql15

# Test connection
psql "postgresql://todouser:pass@host:5432/tododb"
```

---

## 🔄 Updating Your Application

### Update Code:

```powershell
# 1. Make your code changes

# 2. Rebuild deployment package
.\prepare-fullstack-deployment.ps1

# 3. Upload to EB
# Via Console: Upload new fullstack-deployment.zip
# Via CLI:
eb deploy
```

### Update Environment Variables:

```powershell
eb setenv KEY=VALUE
```

### View Current Settings:

```powershell
eb printenv
```

---

## 🔒 Security Checklist

- [ ] SECRET_KEY is randomly generated (64+ characters)
- [ ] DATABASE_URL uses strong password
- [ ] DEBUG=False in production
- [ ] Admin password changed from default
- [ ] RDS security group restricts access
- [ ] SSL/HTTPS enabled (optional)
- [ ] CORS configured properly (already done via /api proxy)

---

## 💰 Cost Estimate

| Resource | Type | Monthly Cost |
|----------|------|--------------|
| EB Environment | t3.micro (single) | $10-15 |
| RDS PostgreSQL | db.t3.micro | $15 ($0 first 12 months) |
| Data Transfer | - | $1-5 |
| **Total** | | **$25-35/month** |

**AWS Free Tier:**
- RDS: 750 hours/month for 12 months
- EC2: 750 hours/month for 12 months

---

## 🧹 Cleanup (When Done Testing)

```powershell
# Terminate environment
eb terminate todo-fullstack

# Delete RDS database
aws rds delete-db-instance --db-instance-identifier todo-postgres --skip-final-snapshot

# Delete application
aws elasticbeanstalk delete-application --application-name todo-fullstack
```

---

## 📚 Architecture Details

### File Structure in Container:

```
/app/                           # Backend (FastAPI)
├── main.py
├── auth.py
├── config.py
├── routers/
└── ...

/usr/share/nginx/html/          # Frontend (React build)
├── index.html
├── static/
│   ├── js/
│   ├── css/
│   └── media/
└── ...

/etc/nginx/conf.d/default.conf  # Nginx config
```

### Request Flow:

1. **User visits:** `http://your-app.com`
   - Nginx serves React `index.html`

2. **User navigates:** `/todos`
   - React Router handles (SPA)
   - Nginx serves `index.html`

3. **Frontend API call:** `fetch('/api/todos')`
   - Nginx proxies to `http://localhost:8000/todos`
   - FastAPI handles request
   - Response returns to React

### Ports:

- **8080:** External (EB load balancer → Nginx)
- **8000:** Internal (Nginx → Uvicorn)

---

## 🎉 Success!

Your full-stack Todo application is now:
- ✅ Deployed on AWS
- ✅ Frontend and backend integrated
- ✅ Single Docker container
- ✅ Production-ready
- ✅ Scalable

**Next Steps:**
1. Test all features
2. Change admin password
3. Set up custom domain (optional)
4. Enable HTTPS (optional)
5. Configure auto-scaling (optional)

---

## 📞 Support

**Common Commands:**
```powershell
eb status              # Check environment status
eb health              # Check health
eb logs                # View logs
eb ssh                 # SSH into instance
eb printenv            # Show environment variables
eb deploy              # Deploy updates
```

**Useful Links:**
- [EB Docker Docs](https://docs.aws.amazon.com/elasticbeanstalk/latest/dg/single-container-docker.html)
- [Nginx Docs](https://nginx.org/en/docs/)
- [FastAPI Docs](https://fastapi.tiangolo.com/)
- [React Docs](https://react.dev/)

---

**Happy Deploying! 🚀**
