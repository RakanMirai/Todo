from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from sqlalchemy.orm import selectinload
from database import get_db
from models import Todo, User
from schemas import (
    TodoCreate, TodoUpdate, TodoResponse,
    MessageResponse
)
from dependencies import get_current_active_user
from datetime import datetime
from typing import List
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/todos", tags=["Todos"])


@router.post("/", response_model=TodoResponse, status_code=status.HTTP_201_CREATED)
async def create_todo(
    todo_data: TodoCreate,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Create a new todo item
    
    - **title**: Todo title (required, 1-200 characters)
    - **description**: Optional description (max 1000 characters)
    - **priority**: Priority level (low, medium, high)
    
    Requires authentication
    """
    # Create new todo
    new_todo = Todo(
        title=todo_data.title,
        description=todo_data.description,
        priority=todo_data.priority,
        owner_id=current_user.id,
        is_completed=False
    )
    
    db.add(new_todo)
    await db.commit()
    await db.refresh(new_todo)
    
    logger.info(f"Todo created: {new_todo.id} by user {current_user.username}")
    
    return new_todo


@router.get("/", response_model=List[TodoResponse])
async def get_todos(
    skip: int = Query(0, ge=0, description="Number of items to skip"),
    limit: int = Query(10, ge=1, le=100, description="Number of items to return"),
    completed: bool | None = Query(None, description="Filter by completion status"),
    priority: str | None = Query(None, description="Filter by priority (low, medium, high)"),
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Get all todos for the current user with pagination and filters
    
    - **skip**: Number of items to skip (pagination)
    - **limit**: Maximum number of items to return (1-100)
    - **completed**: Filter by completion status (optional)
    - **priority**: Filter by priority level (optional)
    
    Requires authentication
    """
    # Build query
    query = select(Todo).where(Todo.owner_id == current_user.id)
    
    # Apply filters
    if completed is not None:
        query = query.where(Todo.is_completed == completed)
    
    if priority:
        query = query.where(Todo.priority == priority)
    
    # Apply ordering and pagination
    query = query.order_by(Todo.created_at.desc()).offset(skip).limit(limit)
    
    # Execute query
    result = await db.execute(query)
    todos = result.scalars().all()
    
    return todos


@router.get("/{todo_id}", response_model=TodoResponse)
async def get_todo(
    todo_id: int,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Get a specific todo by ID
    
    - **todo_id**: ID of the todo to retrieve
    
    Requires authentication and ownership
    """
    # Get todo
    result = await db.execute(
        select(Todo).where(Todo.id == todo_id)
    )
    todo = result.scalar_one_or_none()
    
    if not todo:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Todo not found"
        )
    
    # Check ownership
    if todo.owner_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to access this todo"
        )
    
    return todo


@router.put("/{todo_id}", response_model=TodoResponse)
async def update_todo(
    todo_id: int,
    todo_data: TodoUpdate,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Update a todo item
    
    - **todo_id**: ID of the todo to update
    - **title**: New title (optional)
    - **description**: New description (optional)
    - **priority**: New priority (optional)
    - **is_completed**: Completion status (optional)
    
    Requires authentication and ownership
    """
    # Get todo
    result = await db.execute(
        select(Todo).where(Todo.id == todo_id)
    )
    todo = result.scalar_one_or_none()
    
    if not todo:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Todo not found"
        )
    
    # Check ownership
    if todo.owner_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to update this todo"
        )
    
    # Update fields
    update_data = todo_data.model_dump(exclude_unset=True)
    
    for field, value in update_data.items():
        setattr(todo, field, value)
    
    # Update completed_at timestamp if marking as completed
    if todo_data.is_completed is not None:
        if todo_data.is_completed and not todo.is_completed:
            todo.completed_at = datetime.utcnow()
        elif not todo_data.is_completed and todo.is_completed:
            todo.completed_at = None
    
    await db.commit()
    await db.refresh(todo)
    
    logger.info(f"Todo updated: {todo.id} by user {current_user.username}")
    
    return todo


@router.patch("/{todo_id}/complete", response_model=TodoResponse)
async def toggle_todo_completion(
    todo_id: int,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Toggle todo completion status
    
    - **todo_id**: ID of the todo to toggle
    
    Requires authentication and ownership
    """
    # Get todo
    result = await db.execute(
        select(Todo).where(Todo.id == todo_id)
    )
    todo = result.scalar_one_or_none()
    
    if not todo:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Todo not found"
        )
    
    # Check ownership
    if todo.owner_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to update this todo"
        )
    
    # Toggle completion
    todo.is_completed = not todo.is_completed
    
    if todo.is_completed:
        todo.completed_at = datetime.utcnow()
    else:
        todo.completed_at = None
    
    await db.commit()
    await db.refresh(todo)
    
    logger.info(
        f"Todo completion toggled: {todo.id} "
        f"(completed={todo.is_completed}) by user {current_user.username}"
    )
    
    return todo


@router.delete("/{todo_id}", response_model=MessageResponse)
async def delete_todo(
    todo_id: int,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Delete a todo item
    
    - **todo_id**: ID of the todo to delete
    
    Requires authentication and ownership
    """
    # Get todo
    result = await db.execute(
        select(Todo).where(Todo.id == todo_id)
    )
    todo = result.scalar_one_or_none()
    
    if not todo:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Todo not found"
        )
    
    # Check ownership
    if todo.owner_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to delete this todo"
        )
    
    # Delete todo
    await db.delete(todo)
    await db.commit()
    
    logger.info(f"Todo deleted: {todo_id} by user {current_user.username}")
    
    return {"message": "Todo successfully deleted"}


@router.get("/stats/summary")
async def get_todo_stats(
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Get statistics about user's todos
    
    Returns counts of total, completed, and pending todos
    
    Requires authentication
    """
    # Get total count
    total_result = await db.execute(
        select(func.count(Todo.id)).where(Todo.owner_id == current_user.id)
    )
    total = total_result.scalar()
    
    # Get completed count
    completed_result = await db.execute(
        select(func.count(Todo.id)).where(
            Todo.owner_id == current_user.id,
            Todo.is_completed == True
        )
    )
    completed = completed_result.scalar()
    
    # Get pending count
    pending = total - completed
    
    # Get counts by priority
    priority_result = await db.execute(
        select(Todo.priority, func.count(Todo.id))
        .where(Todo.owner_id == current_user.id)
        .group_by(Todo.priority)
    )
    priority_counts = {priority: count for priority, count in priority_result.all()}
    
    return {
        "total": total,
        "completed": completed,
        "pending": pending,
        "by_priority": priority_counts
    }
