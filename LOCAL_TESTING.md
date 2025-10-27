# 🏠 Local Testing Guide

Test your full-stack Todo app on localhost before deploying to AWS.

---

## ⚡ Quick Start (Automatic)

### Option 1: One-Click Start (Opens 2 Terminals)

```powershell
.\start-local.ps1
```

This will:
- ✅ Activate virtual environment
- ✅ Start backend on http://localhost:8000
- ✅ Start frontend on http://localhost:3000
- ✅ Open both in separate terminals

---

## 🔧 Manual Start (2 Terminals)

### Terminal 1 - Backend (FastAPI)

```powershell
# Navigate to project root
cd c:\Users\RakanHabab\Repos\ToDo

# Activate virtual environment
.\venv\Scripts\Activate.ps1

# Start backend
python run.py
```

**Backend running at:**
- API: http://localhost:8000
- Docs: http://localhost:8000/docs
- Health: http://localhost:8000/health

### Terminal 2 - Frontend (React)

```powershell
# Navigate to frontend folder
cd c:\Users\RakanHabab\Repos\ToDo\frontend

# Install dependencies (first time only)
npm install

# Start frontend
npm start
```

**Frontend running at:**
- App: http://localhost:3000

---

## 🧪 Test the Application

### 1. Open Frontend

```
http://localhost:3000
```

You should see the Todo App landing page! ✨

### 2. Login

Click "Sign In" and use default credentials:
```
Username: admin
Password: admin123
```

### 3. Test Features

- ✅ Create a new todo
- ✅ Mark todo as complete
- ✅ Edit a todo
- ✅ Delete a todo
- ✅ Filter todos (All/Active/Completed)

### 4. Test API Directly

Open http://localhost:8000/docs

This shows the interactive API documentation where you can test all endpoints!

---

## 🔍 Verify Everything Works

### Test Backend Health

```powershell
curl http://localhost:8000/health
```

**Expected response:**
```json
{"status":"healthy","version":"1.0.0"}
```

### Test Frontend-Backend Connection

1. Open http://localhost:3000
2. Open browser DevTools (F12)
3. Go to Console tab
4. Login to the app
5. Check for API calls to http://localhost:8000

**You should see:**
```
POST http://localhost:8000/auth/login - 200 OK
GET http://localhost:8000/auth/me - 200 OK
```

---

## 🛠️ Troubleshooting

### Issue: "Port 8000 already in use"

**Solution:**
```powershell
# Find process using port 8000
netstat -ano | findstr :8000

# Kill the process
taskkill /PID <process-id> /F
```

### Issue: "Port 3000 already in use"

**Solution:**
```powershell
# Find process using port 3000
netstat -ano | findstr :3000

# Kill the process
taskkill /PID <process-id> /F
```

### Issue: "Module not found" (Backend)

**Solution:**
```powershell
# Reinstall dependencies
pip install -r requirements.txt
```

### Issue: "Cannot find module" (Frontend)

**Solution:**
```powershell
cd frontend
rm -rf node_modules
npm install
```

### Issue: "Database error"

**Solution:**
```powershell
# Delete old database and restart
rm todo.db
python run.py
```

### Issue: Frontend can't connect to backend

**Check:**
1. Backend is running on port 8000
2. No CORS errors in browser console
3. API URL is correct in `frontend/src/services/api.js`

**Test:**
```powershell
curl http://localhost:8000/health
```

---

## 📁 Directory Structure

```
ToDo/
├── backend files (main.py, etc.)     ← Terminal 1 runs from here
├── frontend/                         ← Terminal 2 runs from here
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── node_modules/
├── venv/                             ← Python virtual environment
├── run.py                            ← Backend startup script
└── start-local.ps1                   ← Auto-start script
```

---

## 🔄 Restart After Changes

### Backend Changes (Python code)

**Automatic reload enabled!** Just save the file, the server will restart automatically.

If not working:
```powershell
# Stop (Ctrl+C) and restart
python run.py
```

### Frontend Changes (React code)

**Automatic reload enabled!** Just save the file, browser will refresh automatically.

If not working:
```powershell
# Stop (Ctrl+C) and restart
npm start
```

---

## 🎯 Testing Checklist

Before deploying to AWS, test these:

- [ ] ✅ Backend starts without errors
- [ ] ✅ Frontend starts without errors
- [ ] ✅ Can access frontend at localhost:3000
- [ ] ✅ Can access API docs at localhost:8000/docs
- [ ] ✅ Health check returns 200 OK
- [ ] ✅ Can login with admin credentials
- [ ] ✅ Can create a todo
- [ ] ✅ Can mark todo as complete
- [ ] ✅ Can edit a todo
- [ ] ✅ Can delete a todo
- [ ] ✅ Can filter todos
- [ ] ✅ Can logout
- [ ] ✅ Can register new user
- [ ] ✅ No errors in browser console
- [ ] ✅ No errors in backend terminal

---

## 🚀 After Local Testing

Once everything works locally:

1. **Stop both servers** (Ctrl+C in both terminals)
2. **Run deployment prep:**
   ```powershell
   .\prepare-fullstack-deployment.ps1
   ```
3. **Deploy to AWS** - Follow QUICK_DEPLOY.md

---

## 💡 Pro Tips

### View Backend Logs

Backend logs appear in Terminal 1 where you ran `python run.py`

### View Frontend Logs

Frontend logs appear in:
- Terminal 2 (compilation)
- Browser console (F12)

### Quick Login Test

```javascript
// In browser console at http://localhost:3000
fetch('http://localhost:8000/auth/login', {
  method: 'POST',
  headers: {'Content-Type': 'application/x-www-form-urlencoded'},
  body: 'username=admin&password=admin123'
}).then(r => r.json()).then(console.log)
```

### Test with Different Database

```powershell
# Rename current database
mv todo.db todo.db.backup

# Start fresh
python run.py
# This creates a new database with default admin
```

---

## 🎉 Success!

If you can:
- ✅ See the frontend
- ✅ Login successfully
- ✅ Create and manage todos
- ✅ No console errors

**You're ready to deploy!** 🚀

---

## 📚 Useful URLs

| Service | URL | Description |
|---------|-----|-------------|
| Frontend | http://localhost:3000 | React app |
| Backend API | http://localhost:8000 | FastAPI root |
| API Docs | http://localhost:8000/docs | Interactive API docs |
| ReDoc | http://localhost:8000/redoc | Alternative API docs |
| Health Check | http://localhost:8000/health | Health endpoint |

---

## 🔧 Development Mode Features

### Backend (FastAPI)

- ✅ Auto-reload on code changes
- ✅ Detailed error messages
- ✅ Interactive API docs
- ✅ Debug logging

### Frontend (React)

- ✅ Hot module replacement
- ✅ Source maps for debugging
- ✅ Lint errors in console
- ✅ Fast refresh

---

**Happy Testing! 🧪**
