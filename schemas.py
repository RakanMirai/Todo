from pydantic import BaseModel, EmailStr, Field, ConfigDict
from typing import Optional
from datetime import datetime
from models import UserRole, TodoPriority


# ============= User Schemas =============

class UserBase(BaseModel):
    """Base user schema with common fields"""
    email: EmailStr
    username: str = Field(..., min_length=3, max_length=50)
    full_name: Optional[str] = None


class UserCreate(UserBase):
    """Schema for user registration"""
    password: str = Field(..., min_length=8, max_length=100)


class UserUpdate(BaseModel):
    """Schema for updating user information"""
    email: Optional[EmailStr] = None
    full_name: Optional[str] = None


class UserResponse(UserBase):
    """Schema for user response"""
    id: int
    role: UserRole
    is_active: bool
    is_verified: bool
    created_at: datetime
    
    model_config = ConfigDict(from_attributes=True)


class UserInDB(UserResponse):
    """Schema for user in database (includes hashed password)"""
    hashed_password: str


# ============= Todo Schemas =============

class TodoBase(BaseModel):
    """Base todo schema with common fields"""
    title: str = Field(..., min_length=1, max_length=200)
    description: Optional[str] = Field(None, max_length=1000)
    priority: TodoPriority = TodoPriority.MEDIUM


class TodoCreate(TodoBase):
    """Schema for creating a new todo"""
    pass


class TodoUpdate(BaseModel):
    """Schema for updating a todo"""
    title: Optional[str] = Field(None, min_length=1, max_length=200)
    description: Optional[str] = Field(None, max_length=1000)
    priority: Optional[TodoPriority] = None
    is_completed: Optional[bool] = None


class TodoResponse(TodoBase):
    """Schema for todo response"""
    id: int
    is_completed: bool
    owner_id: int
    created_at: datetime
    updated_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    
    model_config = ConfigDict(from_attributes=True)


class TodoWithOwner(TodoResponse):
    """Schema for todo with owner information (for admin)"""
    owner: UserResponse
    
    model_config = ConfigDict(from_attributes=True)


# ============= Authentication Schemas =============

class Token(BaseModel):
    """Schema for JWT token response"""
    access_token: str
    refresh_token: str
    token_type: str = "bearer"


class TokenData(BaseModel):
    """Schema for token payload data"""
    username: Optional[str] = None
    user_id: Optional[int] = None
    role: Optional[UserRole] = None


class LoginRequest(BaseModel):
    """Schema for login request"""
    username: str
    password: str


class RefreshTokenRequest(BaseModel):
    """Schema for refresh token request"""
    refresh_token: str


# ============= Admin Schemas =============

class UserRoleUpdate(BaseModel):
    """Schema for updating user role (admin only)"""
    role: UserRole


class PaginationParams(BaseModel):
    """Schema for pagination parameters"""
    skip: int = Field(0, ge=0)
    limit: int = Field(10, ge=1, le=100)


# ============= Response Schemas =============

class MessageResponse(BaseModel):
    """Generic message response"""
    message: str


class ErrorResponse(BaseModel):
    """Error response schema"""
    detail: str


class PaginatedResponse(BaseModel):
    """Generic paginated response"""
    total: int
    skip: int
    limit: int
    items: list
