from fastapi import FastAPI, Request, status
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from sqlalchemy import select
from database import init_db, get_db
from models import User, UserRole
from auth import get_password_hash
from config import get_settings
from middleware import LoggingMiddleware, SecurityHeadersMiddleware, limiter
from routers import auth, todos, admin
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
import logging

logger = logging.getLogger(__name__)
settings = get_settings()


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Lifespan context manager for startup and shutdown events
    """
    # Startup
    logger.info("Starting up application...")
    
    # Initialize database
    await init_db()
    logger.info("Database initialized")
    
    # Create default admin user if not exists
    await create_default_admin()
    
    logger.info("Application startup complete")
    
    yield
    
    # Shutdown
    logger.info("Shutting down application...")


async def create_default_admin():
    """
    Create a default admin user if no admin exists
    """
    async for db in get_db():
        try:
            # Check if any admin exists
            result = await db.execute(
                select(User).where(User.role == UserRole.ADMIN)
            )
            admin = result.scalar_one_or_none()
            
            if not admin:
                # Create default admin
                default_admin = User(
                    email="admin@example.com",
                    username="admin",
                    full_name="System Administrator",
                    hashed_password=get_password_hash("admin123"),
                    role=UserRole.ADMIN,
                    is_active=True,
                    is_verified=True
                )
                
                db.add(default_admin)
                await db.commit()
                
                logger.warning(
                    "Default admin user created! "
                    "Username: admin, Password: admin123 "
                    "⚠️ CHANGE THIS PASSWORD IMMEDIATELY!"
                )
            
        except Exception as e:
            logger.error(f"Error creating default admin: {e}")
        finally:
            break


# Create FastAPI application
app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="""
    ## FastAPI Todo Application
    
    A comprehensive multi-user Todo API with authentication, authorization, and full CRUD operations.
    
    ### Features
    
    * **Authentication**: JWT-based authentication with access and refresh tokens
    * **Authorization**: Role-based access control (User/Admin)
    * **CRUD Operations**: Full Create, Read, Update, Delete for todos
    * **User Management**: User registration, login, and profile management
    * **Admin Panel**: Admin endpoints for user and todo management
    * **Email Verification**: Mock email verification system
    * **Rate Limiting**: Protection against abuse
    * **Logging**: Comprehensive request/response logging
    * **Validation**: Pydantic models for input validation
    * **Documentation**: Auto-generated interactive API docs
    
    ### Quick Start
    
    1. Register a new user at `/auth/register`
    2. Login at `/auth/login` to get access token
    3. Use the token in the "Authorize" button above
    4. Start creating todos!
    
    ### Default Admin
    
    * **Username**: admin
    * **Password**: admin123
    * ⚠️ Change this password immediately!
    """,
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc"
)

# Add rate limiter state
app.state.limiter = limiter

# Add rate limit exceeded handler
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify actual origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Add custom middleware
app.add_middleware(SecurityHeadersMiddleware)
app.add_middleware(LoggingMiddleware)


# Exception handlers
@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    """
    Handle validation errors with detailed messages
    """
    errors = []
    for error in exc.errors():
        errors.append({
            "field": " -> ".join(str(x) for x in error["loc"]),
            "message": error["msg"],
            "type": error["type"]
        })
    
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={
            "detail": "Validation error",
            "errors": errors
        }
    )


@app.exception_handler(Exception)
async def general_exception_handler(request: Request, exc: Exception):
    """
    Handle general exceptions
    """
    logger.error(f"Unhandled exception: {exc}", exc_info=True)
    
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "detail": "Internal server error",
            "message": str(exc) if settings.DEBUG else "An error occurred"
        }
    )


# Include routers
app.include_router(auth.router)
app.include_router(todos.router)
app.include_router(admin.router)


# Root endpoint
@app.get("/", tags=["Root"])
@limiter.limit("10/minute")
async def root(request: Request):
    """
    Root endpoint with API information
    """
    return {
        "message": "Welcome to Todo API",
        "version": settings.APP_VERSION,
        "docs": "/docs",
        "redoc": "/redoc",
        "endpoints": {
            "authentication": "/auth",
            "todos": "/todos",
            "admin": "/admin"
        }
    }


# Health check endpoint
@app.get("/health", tags=["Health"])
async def health_check():
    """
    Health check endpoint for monitoring
    """
    return {
        "status": "healthy",
        "version": settings.APP_VERSION
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=settings.DEBUG
    )
