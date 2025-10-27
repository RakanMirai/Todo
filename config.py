from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    """Application settings loaded from environment variables"""
    
    # Security
    SECRET_KEY: str = "your-secret-key-change-this-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    
    # Database
    DATABASE_URL: str = "sqlite+aiosqlite:///./todo.db"
    
    # Application
    APP_NAME: str = "Todo API"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = True
    PORT: int = 8080
    
    # Rate Limiting
    RATE_LIMIT_PER_MINUTE: str = "60/minute"
    
    # AWS Elastic Beanstalk
    # EB will inject these automatically if using RDS
    RDS_HOSTNAME: str | None = None
    RDS_PORT: str | None = None
    RDS_DB_NAME: str | None = None
    RDS_USERNAME: str | None = None
    RDS_PASSWORD: str | None = None
    
    class Config:
        env_file = ".env"
        case_sensitive = True


@lru_cache()
def get_settings() -> Settings:
    """Get cached settings instance"""
    return Settings()
