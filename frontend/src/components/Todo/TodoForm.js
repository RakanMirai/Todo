import React, { useState, useEffect } from 'react';
import '../../styles/Todo.css';

const TodoForm = ({ onSubmit, initialData, onCancel }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'medium',
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title || '',
        description: initialData.description || '',
        priority: initialData.priority || 'medium',
      });
    }
  }, [initialData]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      // Escape key to clear/cancel
      if (e.key === 'Escape') {
        if (onCancel) {
          onCancel();
        } else {
          setFormData({ title: '', description: '', priority: 'medium' });
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onCancel]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
    if (!initialData) {
      // Reset form only if creating new todo
      setFormData({
        title: '',
        description: '',
        priority: 'medium',
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="todo-form">
      <div className="form-group">
        <input
          type="text"
          name="title"
          value={formData.title}
          onChange={handleChange}
          placeholder="What needs to be done?"
          required
          className="todo-input"
          maxLength="200"
        />
      </div>

      <div className="form-group">
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          placeholder="Add a description (optional)"
          className="todo-textarea"
          rows="3"
          maxLength="1000"
        />
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="priority">Priority</label>
          <select
            id="priority"
            name="priority"
            value={formData.priority}
            onChange={handleChange}
            className="todo-select"
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>

        <div className="form-actions">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="btn btn-secondary"
            >
              Cancel
            </button>
          )}
          <button type="submit" className="btn btn-primary">
            {initialData ? 'Update' : 'Add Todo'}
          </button>
        </div>
      </div>
    </form>
  );
};

export default TodoForm;
