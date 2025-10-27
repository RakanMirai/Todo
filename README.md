# 📝 Todo App - Full-Stack Application

A modern full-stack Todo application with FastAPI backend and React frontend, deployable as a single Docker container to AWS Elastic Beanstalk.

## ✨ Features

- 🔐 **User Authentication** - JWT-based auth with access/refresh tokens
- 👥 **Role-Based Access** - User and Admin roles
- ✅ **Full CRUD Operations** - Create, read, update, delete todos
- 📊 **Priority Levels** - Low, medium, high priority tasks
- 🎯 **Filtering** - View all, active, or completed todos
- 📱 **Responsive Design** - Works on desktop and mobile
- 🔒 **Security** - Rate limiting, password hashing, JWT tokens
- 📚 **API Documentation** - Auto-generated interactive docs

## 🏗️ Tech Stack

### Backend
- **FastAPI** - Modern Python web framework
- **SQLAlchemy** - Async ORM
- **PostgreSQL** - Production database (SQLite for dev)
- **JWT** - Authentication tokens
- **Pydantic** - Data validation

### Frontend
- **React 18** - UI library
- **React Router** - Client-side routing
- **Axios** - HTTP client
- **Modern CSS** - Styled components

### Deployment
- **Docker** - Containerization
- **Nginx** - Reverse proxy & static file serving
- **AWS Elastic Beanstalk** - Hosting platform

## 📦 Project Structure

```
ToDo/
├── Backend (FastAPI)
│   ├── main.py              # Application entry point
│   ├── auth.py              # Authentication logic
│   ├── config.py            # Configuration
│   ├── database.py          # Database connection
│   ├── models.py            # SQLAlchemy models
│   ├── schemas.py           # Pydantic schemas
│   ├── dependencies.py      # FastAPI dependencies
│   ├── middleware.py        # Custom middleware
│   └── routers/             # API route handlers
│       ├── auth.py          # Auth endpoints
│       ├── todos.py         # Todo endpoints
│       └── admin.py         # Admin endpoints
│
├── Frontend (React)
│   ├── src/
│   │   ├── components/      # React components
│   │   ├── context/         # React context (auth)
│   │   ├── services/        # API client
│   │   └── styles/          # CSS styles
│   ├── public/              # Static files
│   └── package.json         # Dependencies
│
├── Deployment
│   ├── Dockerfile           # Multi-stage Docker build
│   ├── nginx-fullstack.conf # Nginx configuration
│   ├── start-fullstack.sh   # Container startup script
│   └── prepare-fullstack-deployment.ps1
│
├── Development
│   ├── run.py               # Run backend locally
│   ├── start-local.ps1      # Start both services
│   ├── docker-compose.yml   # Local Docker setup
│   └── requirements.txt     # Python dependencies
│
└── Documentation
    ├── README.md            # This file
    ├── QUICK_DEPLOY.md      # Quick AWS deployment guide
    ├── FULLSTACK_DEPLOYMENT.md  # Detailed deployment guide
    └── LOCAL_TESTING.md     # Local development guide
```

## 🚀 Quick Start

### Local Development

#### Prerequisites
- Python 3.11+
- Node.js 18+
- npm or yarn

#### Option 1: Automatic Start (Recommended)

```powershell
# Clone the repository
git clone <your-repo-url>
cd ToDo

# Create virtual environment
python -m venv venv
.\venv\Scripts\Activate.ps1

# Install Python dependencies
pip install -r requirements.txt

# Start both backend and frontend
.\start-local.ps1
```

This opens two terminals:
- Backend: http://localhost:8000
- Frontend: http://localhost:3000

#### Option 2: Manual Start

**Terminal 1 - Backend:**
```powershell
.\venv\Scripts\Activate.ps1
python run.py
```

**Terminal 2 - Frontend:**
```powershell
cd frontend
npm install
npm start
```

#### Default Login
```
Username: admin
Password: admin123
```
⚠️ Change this in production!

### Docker (Local)

```powershell
# Build and run with Docker Compose
docker-compose up

# Access at http://localhost:8000
```

## ☁️ AWS Deployment

### Quick Deploy

1. **Prepare package:**
```powershell
.\prepare-fullstack-deployment.ps1
```

2. **Generate SECRET_KEY:**
```powershell
python -c "import secrets; print(secrets.token_urlsafe(64))"
```

3. **Upload to AWS:**
- Go to [AWS Elastic Beanstalk](https://console.aws.amazon.com/elasticbeanstalk/)
- Create Application → Platform: **Docker**
- Upload `fullstack-deployment.zip`

4. **Set Environment Variables:**
```
SECRET_KEY=<your-generated-key>
DATABASE_URL=postgresql+asyncpg://user:pass@host:5432/dbname
DEBUG=False
```

5. **Done!** Wait 10-15 minutes.

See [QUICK_DEPLOY.md](QUICK_DEPLOY.md) for step-by-step instructions.

## 📚 API Documentation

### Interactive API Docs
- **Swagger UI:** http://localhost:8000/docs
- **ReDoc:** http://localhost:8000/redoc

### Key Endpoints

#### Authentication
- `POST /auth/register` - Register new user
- `POST /auth/login` - Login (get tokens)
- `GET /auth/me` - Get current user
- `POST /auth/refresh` - Refresh access token

#### Todos
- `GET /todos/` - List todos
- `POST /todos/` - Create todo
- `GET /todos/{id}` - Get todo
- `PUT /todos/{id}` - Update todo
- `PATCH /todos/{id}/complete` - Toggle complete
- `DELETE /todos/{id}` - Delete todo
- `GET /todos/stats/summary` - Get statistics

#### Admin
- `GET /admin/users` - List users
- `PUT /admin/users/{id}/role` - Update user role
- `DELETE /admin/users/{id}` - Delete user

## 🧪 Testing

### Run Tests
```powershell
# Backend tests
pytest

# Frontend tests
cd frontend
npm test
```

### Manual Testing
```powershell
# Health check
curl http://localhost:8000/health

# Login
curl -X POST http://localhost:8000/auth/login \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=admin&password=admin123"
```

## 🔧 Configuration

### Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `SECRET_KEY` | Yes | - | JWT signing key (64+ chars) |
| `DATABASE_URL` | Yes | sqlite+aiosqlite:///./todo.db | Database connection string |
| `DEBUG` | No | True | Debug mode (set False in prod) |
| `ALGORITHM` | No | HS256 | JWT algorithm |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | No | 30 | Token expiry |
| `REFRESH_TOKEN_EXPIRE_DAYS` | No | 7 | Refresh token expiry |

### Database

**Development (SQLite):**
```
DATABASE_URL=sqlite+aiosqlite:///./todo.db
```

**Production (PostgreSQL):**
```
DATABASE_URL=postgresql+asyncpg://user:password@host:5432/dbname
```

## 🔒 Security

- ✅ Password hashing with bcrypt
- ✅ JWT token authentication
- ✅ Role-based access control
- ✅ Rate limiting (60 req/min)
- ✅ CORS configuration
- ✅ SQL injection protection (SQLAlchemy)
- ✅ XSS protection (React)
- ✅ Security headers (Nginx)

## 📊 Architecture

### Development (Separate)
```
Frontend (React) :3000 → Backend (FastAPI) :8000 → Database
```

### Production (Integrated)
```
User → Port 8080 (Nginx)
         ├─ / → React Frontend (SPA)
         └─ /api/* → Backend (Proxy)
                      ↓
                 Uvicorn :8000
                      ↓
                 PostgreSQL
```

## 🛠️ Development

### Backend Hot Reload
Backend automatically reloads on file changes when running `python run.py`.

### Frontend Hot Reload
Frontend automatically refreshes on file changes when running `npm start`.

### Adding Dependencies

**Backend:**
```powershell
pip install <package>
pip freeze > requirements.txt
```

**Frontend:**
```powershell
cd frontend
npm install <package>
```

## 📝 Scripts

| Script | Purpose |
|--------|---------|
| `start-local.ps1` | Start both backend & frontend |
| `run.py` | Start backend only |
| `prepare-fullstack-deployment.ps1` | Create AWS deployment package |
| `docker-compose up` | Run with Docker locally |

## 🐛 Troubleshooting

### Port Already in Use
```powershell
# Find process
netstat -ano | findstr :8000

# Kill process
taskkill /PID <pid> /F
```

### Database Issues
```powershell
# Delete database and restart
rm todo.db
python run.py
```

### Frontend Can't Connect
1. Check backend is running on port 8000
2. Check CORS settings in `main.py`
3. Verify API URL in `frontend/src/services/api.js`

### Docker Build Fails
```powershell
# Clean Docker cache
docker system prune -a

# Rebuild
docker-compose build --no-cache
```

## 📈 Scaling

### Database
- Use PostgreSQL in production
- Enable connection pooling
- Add database indexes

### Caching
- Add Redis for session storage
- Cache frequently accessed data
- Use CDN for static assets

### Load Balancing
- Deploy multiple EB instances
- Use AWS Application Load Balancer
- Enable auto-scaling

## 📄 License

MIT License - see LICENSE file for details

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📞 Support

- 📚 [Detailed Deployment Guide](FULLSTACK_DEPLOYMENT.md)
- ⚡ [Quick Deploy Reference](QUICK_DEPLOY.md)
- 🧪 [Local Testing Guide](LOCAL_TESTING.md)
- 🐛 [GitHub Issues](your-repo-url/issues)

## 🎉 Acknowledgments

- FastAPI for the amazing framework
- React team for the UI library
- AWS for hosting platform

---

**Built with ❤️ using FastAPI and React**
