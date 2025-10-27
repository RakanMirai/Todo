import React, { useState, useEffect } from 'react';
import { todoAPI } from '../../services/api';
import TodoForm from './TodoForm';
import TodoItem from './TodoItem';
import '../../styles/Todo.css';

const TodoList = () => {
  const [todos, setTodos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all'); // all, active, completed
  const [stats, setStats] = useState(null);

  useEffect(() => {
    fetchTodos();
    fetchStats();
  }, []);

  const fetchTodos = async () => {
    try {
      setLoading(true);
      const data = await todoAPI.getTodos();
      setTodos(data);
      setError('');
    } catch (err) {
      setError('Failed to fetch todos');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const data = await todoAPI.getStats();
      setStats(data);
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    }
  };

  const handleCreateTodo = async (todoData) => {
    try {
      const newTodo = await todoAPI.createTodo(todoData);
      setTodos([newTodo, ...todos]);
      fetchStats();
      setError('');
    } catch (err) {
      setError('Failed to create todo');
      console.error(err);
    }
  };

  const handleUpdateTodo = async (id, todoData) => {
    try {
      const updatedTodo = await todoAPI.updateTodo(id, todoData);
      setTodos(todos.map((todo) => (todo.id === id ? updatedTodo : todo)));
      setError('');
    } catch (err) {
      setError('Failed to update todo');
      console.error(err);
    }
  };

  const handleDeleteTodo = async (id) => {
    if (!window.confirm('Are you sure you want to delete this todo?')) {
      return;
    }

    try {
      await todoAPI.deleteTodo(id);
      setTodos(todos.filter((todo) => todo.id !== id));
      fetchStats();
      setError('');
    } catch (err) {
      setError('Failed to delete todo');
      console.error(err);
    }
  };

  const handleToggleComplete = async (id) => {
    // Optimistic update
    const previousTodos = [...todos];
    setTodos(todos.map((todo) => 
      todo.id === id ? { ...todo, is_completed: !todo.is_completed } : todo
    ));

    try {
      const updatedTodo = await todoAPI.toggleComplete(id);
      setTodos(todos.map((todo) => (todo.id === id ? updatedTodo : todo)));
      fetchStats();
      setError('');
    } catch (err) {
      // Revert on error
      setTodos(previousTodos);
      setError('Failed to toggle todo');
      console.error(err);
    }
  };

  const getFilteredTodos = () => {
    switch (filter) {
      case 'active':
        return todos.filter((todo) => !todo.is_completed);
      case 'completed':
        return todos.filter((todo) => todo.is_completed);
      default:
        return todos;
    }
  };

  const filteredTodos = getFilteredTodos();

  if (loading) {
    return <div className="loading">Loading todos...</div>;
  }

  return (
    <div className="todo-container">
      <div className="todo-header-section">
        <h1>My Todos</h1>
        {stats && (
          <div className="todo-stats">
            <div className="stat-item">
              <span className="stat-value">{stats.total}</span>
              <span className="stat-label">Total</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">{stats.pending}</span>
              <span className="stat-label">Active</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">{stats.completed}</span>
              <span className="stat-label">Completed</span>
            </div>
          </div>
        )}
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="todo-form-container">
        <h2>Add New Todo</h2>
        <TodoForm onSubmit={handleCreateTodo} />
      </div>

      <div className="todo-filters">
        <button
          className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
          onClick={() => setFilter('all')}
        >
          All ({todos.length})
        </button>
        <button
          className={`filter-btn ${filter === 'active' ? 'active' : ''}`}
          onClick={() => setFilter('active')}
        >
          Active ({todos.filter((t) => !t.is_completed).length})
        </button>
        <button
          className={`filter-btn ${filter === 'completed' ? 'active' : ''}`}
          onClick={() => setFilter('completed')}
        >
          Completed ({todos.filter((t) => t.is_completed).length})
        </button>
      </div>

      <div className="todo-list">
        {filteredTodos.length === 0 ? (
          <div className="empty-state">
            <p>
              {filter === 'completed'
                ? '🎉 No completed todos yet!'
                : filter === 'active'
                ? '✨ No active todos!'
                : '📝 No todos yet. Create one above!'}
            </p>
          </div>
        ) : (
          filteredTodos.map((todo) => (
            <TodoItem
              key={todo.id}
              todo={todo}
              onUpdate={handleUpdateTodo}
              onDelete={handleDeleteTodo}
              onToggleComplete={handleToggleComplete}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default TodoList;
