import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import '../../styles/Layout.css';

const Header = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="header">
      <div className="header-content">
        <Link to="/" className="logo">
          <span className="logo-icon">✓</span>
          <span className="logo-text">Todo App</span>
        </Link>

        {isAuthenticated && (
          <nav className="nav">
            <Link to="/todos" className="nav-link">
              My Todos
            </Link>
            {user?.role === 'admin' && (
              <Link to="/admin" className="nav-link admin-link">
                Admin Panel
              </Link>
            )}
          </nav>
        )}

        <div className="header-actions">
          {isAuthenticated ? (
            <>
              <div className="user-info">
                <span className="user-name">{user?.username}</span>
                {user?.role === 'admin' && (
                  <span className="user-badge">Admin</span>
                )}
              </div>
              <button onClick={handleLogout} className="btn btn-secondary">
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-secondary">
                Login
              </Link>
              <Link to="/register" className="btn btn-primary">
                Sign Up
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
