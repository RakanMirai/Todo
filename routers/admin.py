from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from sqlalchemy.orm import selectinload
from database import get_db
from models import User, Todo, UserRole
from schemas import (
    UserResponse, UserRoleUpdate, TodoWithOwner,
    MessageResponse
)
from dependencies import require_admin
from typing import List
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/admin", tags=["Admin"])


@router.get("/users", response_model=List[UserResponse])
async def get_all_users(
    skip: int = Query(0, ge=0, description="Number of items to skip"),
    limit: int = Query(10, ge=1, le=100, description="Number of items to return"),
    role: str | None = Query(None, description="Filter by role (user, admin)"),
    is_active: bool | None = Query(None, description="Filter by active status"),
    current_admin: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db)
):
    """
    Get all users (admin only)
    
    - **skip**: Number of items to skip (pagination)
    - **limit**: Maximum number of items to return (1-100)
    - **role**: Filter by user role (optional)
    - **is_active**: Filter by active status (optional)
    
    Requires admin privileges
    """
    # Build query
    query = select(User)
    
    # Apply filters
    if role:
        try:
            role_enum = UserRole(role)
            query = query.where(User.role == role_enum)
        except ValueError:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid role: {role}. Must be 'user' or 'admin'"
            )
    
    if is_active is not None:
        query = query.where(User.is_active == is_active)
    
    # Apply ordering and pagination
    query = query.order_by(User.created_at.desc()).offset(skip).limit(limit)
    
    # Execute query
    result = await db.execute(query)
    users = result.scalars().all()
    
    logger.info(f"Admin {current_admin.username} retrieved user list")
    
    return users


@router.get("/users/{user_id}", response_model=UserResponse)
async def get_user_details(
    user_id: int,
    current_admin: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db)
):
    """
    Get detailed information about a specific user (admin only)
    
    - **user_id**: ID of the user to retrieve
    
    Requires admin privileges
    """
    # Get user
    result = await db.execute(
        select(User).where(User.id == user_id)
    )
    user = result.scalar_one_or_none()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    logger.info(f"Admin {current_admin.username} viewed user {user.username}")
    
    return user


@router.put("/users/{user_id}/role", response_model=UserResponse)
async def update_user_role(
    user_id: int,
    role_update: UserRoleUpdate,
    current_admin: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db)
):
    """
    Update a user's role (admin only)
    
    - **user_id**: ID of the user to update
    - **role**: New role (user or admin)
    
    Requires admin privileges
    """
    # Get user
    result = await db.execute(
        select(User).where(User.id == user_id)
    )
    user = result.scalar_one_or_none()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Prevent self-demotion
    if user.id == current_admin.id and role_update.role != UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot demote yourself from admin role"
        )
    
    # Update role
    old_role = user.role
    user.role = role_update.role
    
    await db.commit()
    await db.refresh(user)
    
    logger.info(
        f"Admin {current_admin.username} changed user {user.username} "
        f"role from {old_role} to {role_update.role}"
    )
    
    return user


@router.patch("/users/{user_id}/activate", response_model=UserResponse)
async def toggle_user_active_status(
    user_id: int,
    current_admin: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db)
):
    """
    Toggle user active status (admin only)
    
    - **user_id**: ID of the user to toggle
    
    Requires admin privileges
    """
    # Get user
    result = await db.execute(
        select(User).where(User.id == user_id)
    )
    user = result.scalar_one_or_none()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Prevent self-deactivation
    if user.id == current_admin.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot deactivate your own account"
        )
    
    # Toggle active status
    user.is_active = not user.is_active
    
    await db.commit()
    await db.refresh(user)
    
    logger.info(
        f"Admin {current_admin.username} set user {user.username} "
        f"active status to {user.is_active}"
    )
    
    return user


@router.delete("/users/{user_id}", response_model=MessageResponse)
async def delete_user(
    user_id: int,
    current_admin: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db)
):
    """
    Delete a user and all their todos (admin only)
    
    - **user_id**: ID of the user to delete
    
    Requires admin privileges
    """
    # Get user
    result = await db.execute(
        select(User).where(User.id == user_id)
    )
    user = result.scalar_one_or_none()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Prevent self-deletion
    if user.id == current_admin.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot delete your own account"
        )
    
    # Delete user (todos will be cascade deleted)
    username = user.username
    await db.delete(user)
    await db.commit()
    
    logger.info(f"Admin {current_admin.username} deleted user {username}")
    
    return {"message": f"User {username} successfully deleted"}


@router.get("/todos", response_model=List[TodoWithOwner])
async def get_all_todos(
    skip: int = Query(0, ge=0, description="Number of items to skip"),
    limit: int = Query(10, ge=1, le=100, description="Number of items to return"),
    completed: bool | None = Query(None, description="Filter by completion status"),
    user_id: int | None = Query(None, description="Filter by user ID"),
    current_admin: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db)
):
    """
    Get all todos from all users (admin only)
    
    - **skip**: Number of items to skip (pagination)
    - **limit**: Maximum number of items to return (1-100)
    - **completed**: Filter by completion status (optional)
    - **user_id**: Filter by user ID (optional)
    
    Requires admin privileges
    """
    # Build query with owner relationship
    query = select(Todo).options(selectinload(Todo.owner))
    
    # Apply filters
    if completed is not None:
        query = query.where(Todo.is_completed == completed)
    
    if user_id is not None:
        query = query.where(Todo.owner_id == user_id)
    
    # Apply ordering and pagination
    query = query.order_by(Todo.created_at.desc()).offset(skip).limit(limit)
    
    # Execute query
    result = await db.execute(query)
    todos = result.scalars().all()
    
    logger.info(f"Admin {current_admin.username} retrieved todos list")
    
    return todos


@router.get("/stats/overview")
async def get_system_stats(
    current_admin: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db)
):
    """
    Get system-wide statistics (admin only)
    
    Returns counts of users, todos, and other metrics
    
    Requires admin privileges
    """
    # Get total users
    total_users_result = await db.execute(select(func.count(User.id)))
    total_users = total_users_result.scalar()
    
    # Get active users
    active_users_result = await db.execute(
        select(func.count(User.id)).where(User.is_active == True)
    )
    active_users = active_users_result.scalar()
    
    # Get verified users
    verified_users_result = await db.execute(
        select(func.count(User.id)).where(User.is_verified == True)
    )
    verified_users = verified_users_result.scalar()
    
    # Get total todos
    total_todos_result = await db.execute(select(func.count(Todo.id)))
    total_todos = total_todos_result.scalar()
    
    # Get completed todos
    completed_todos_result = await db.execute(
        select(func.count(Todo.id)).where(Todo.is_completed == True)
    )
    completed_todos = completed_todos_result.scalar()
    
    # Get users by role
    role_result = await db.execute(
        select(User.role, func.count(User.id))
        .group_by(User.role)
    )
    users_by_role = {role.value: count for role, count in role_result.all()}
    
    logger.info(f"Admin {current_admin.username} viewed system stats")
    
    return {
        "users": {
            "total": total_users,
            "active": active_users,
            "verified": verified_users,
            "by_role": users_by_role
        },
        "todos": {
            "total": total_todos,
            "completed": completed_todos,
            "pending": total_todos - completed_todos
        }
    }
