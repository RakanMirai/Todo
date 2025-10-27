# ⚡ Quick Deploy Reference

## 🚀 Deploy in 5 Minutes

### 1. Create Package
```powershell
.\prepare-fullstack-deployment.ps1
```

### 2. Generate SECRET_KEY
```powershell
python -c "import secrets; print(secrets.token_urlsafe(64))"
```

### 3. Upload to AWS
1. Go to: https://console.aws.amazon.com/elasticbeanstalk/
2. Create Application → Platform: **Docker**
3. Upload: `fullstack-deployment.zip`

### 4. Set Environment Variables
```
SECRET_KEY=<your-generated-key>
DATABASE_URL=postgresql+asyncpg://user:pass@host:5432/dbname
DEBUG=False
```

### 5. Wait & Test
⏳ 10-15 minutes → ✅ Done!

---

## 🌐 Your App URLs

```
Frontend:  http://your-app.elasticbeanstalk.com/
API Docs:  http://your-app.elasticbeanstalk.com/docs
API:       http://your-app.elasticbeanstalk.com/api/*
Health:    http://your-app.elasticbeanstalk.com/api/health
```

---

## 🔑 Default Login

```
Username: admin
Password: admin123
```

**⚠️ CHANGE IMMEDIATELY!**

---

## 🛠️ Common Commands

```powershell
# Deploy updates
.\prepare-fullstack-deployment.ps1
# Then upload new ZIP to EB

# Generate new SECRET_KEY
python -c "import secrets; print(secrets.token_urlsafe(64))"

# Test locally with Docker
docker build -t todo-fullstack .
docker run -p 8080:8080 -e SECRET_KEY="test" -e DATABASE_URL="sqlite+aiosqlite:///./todo.db" todo-fullstack

# View logs (if EB CLI installed)
eb logs
```

---

## 📦 What's in the Package?

```
fullstack-deployment.zip
├── Backend (FastAPI)
│   ├── main.py
│   ├── auth.py
│   ├── config.py
│   └── routers/
├── Frontend (React)
│   ├── src/
│   ├── public/
│   └── package.json
├── Dockerfile (multi-stage)
├── nginx-fullstack.conf
└── start-fullstack.sh
```

---

## 🏗️ Architecture

```
Port 8080 (External)
    ↓
 Nginx
    ├─ /     → React Frontend
    └─ /api/ → Backend Proxy
           ↓
      Uvicorn (Port 8000)
           ↓
      FastAPI Backend
```

---

## ✅ Deployment Checklist

- [ ] Frontend dependencies installed (`cd frontend && npm install`)
- [ ] Run `prepare-fullstack-deployment.ps1`
- [ ] Generate SECRET_KEY
- [ ] Create RDS PostgreSQL database
- [ ] Get RDS endpoint
- [ ] Upload ZIP to EB
- [ ] Set environment variables
- [ ] Wait for deployment
- [ ] Test frontend URL
- [ ] Test API at `/api/health`
- [ ] Login and change admin password

---

## 🔧 Quick Troubleshooting

| Issue | Solution |
|-------|----------|
| 502 Bad Gateway | Check logs: `eb logs` |
| Can't connect | Check security groups |
| Blank page | Check browser console |
| API not working | Test `/api/health` |
| Database error | Verify DATABASE_URL |

---

## 💰 Cost

**~$25-35/month** (with free tier: ~$10/month)

---

## 📞 Need Help?

See **FULLSTACK_DEPLOYMENT.md** for detailed guide!

---

**Ready? Run the prep script and deploy!** 🚀
