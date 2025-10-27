import React, { useState } from 'react';
import '../../styles/Todo.css';

const TodoItem = ({ todo, onUpdate, onDelete, onToggleComplete }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    title: todo.title,
    description: todo.description || '',
    priority: todo.priority,
  });

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditData({
      title: todo.title,
      description: todo.description || '',
      priority: todo.priority,
    });
  };

  const handleSave = () => {
    onUpdate(todo.id, editData);
    setIsEditing(false);
  };

  const handleChange = (e) => {
    setEditData({
      ...editData,
      [e.target.name]: e.target.value,
    });
  };

  const getPriorityClass = (priority) => {
    return `priority-${priority}`;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  if (isEditing) {
    return (
      <div className="todo-item editing">
        <div className="todo-edit-form">
          <input
            type="text"
            name="title"
            value={editData.title}
            onChange={handleChange}
            className="edit-input"
            maxLength="200"
          />
          <textarea
            name="description"
            value={editData.description}
            onChange={handleChange}
            className="edit-textarea"
            rows="2"
            maxLength="1000"
          />
          <div className="edit-actions">
            <select
              name="priority"
              value={editData.priority}
              onChange={handleChange}
              className="edit-select"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
            <button onClick={handleCancel} className="btn btn-secondary btn-sm">
              Cancel
            </button>
            <button onClick={handleSave} className="btn btn-primary btn-sm">
              Save
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`todo-item ${todo.is_completed ? 'completed' : ''}`}>
      <div className="todo-checkbox">
        <input
          type="checkbox"
          checked={todo.is_completed}
          onChange={() => onToggleComplete(todo.id)}
          id={`todo-${todo.id}`}
        />
        <label htmlFor={`todo-${todo.id}`}></label>
      </div>

      <div className="todo-content">
        <div className="todo-header">
          <h3 className="todo-title">{todo.title}</h3>
          <span className={`todo-priority ${getPriorityClass(todo.priority)}`}>
            {todo.priority}
          </span>
        </div>

        {todo.description && (
          <p className="todo-description">{todo.description}</p>
        )}

        <div className="todo-meta">
          <span className="todo-date">Created: {formatDate(todo.created_at)}</span>
          {todo.completed_at && (
            <span className="todo-date">
              Completed: {formatDate(todo.completed_at)}
            </span>
          )}
        </div>
      </div>

      <div className="todo-actions">
        <button
          onClick={handleEdit}
          className="btn-icon"
          title="Edit"
          disabled={todo.is_completed}
        >
          ✏️
        </button>
        <button
          onClick={() => onDelete(todo.id)}
          className="btn-icon"
          title="Delete"
        >
          🗑️
        </button>
      </div>
    </div>
  );
};

export default TodoItem;
