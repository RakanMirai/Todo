import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import ErrorBoundary from './components/ErrorBoundary';
import Header from './components/Layout/Header';
import PrivateRoute from './components/Layout/PrivateRoute';
import AdminRoute from './components/Layout/AdminRoute';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import TodoList from './components/Todo/TodoList';
import AdminPanel from './components/Admin/AdminPanel';
import ImagesPage from './pages/ImagesPage';
import './styles/App.css';

// Landing Page Component
const LandingPage = () => {
  const { isAuthenticated, user } = useAuth();
  // Redirect authenticated users to their appropriate page
  if (isAuthenticated) {
    return <Navigate to="/todos" replace />;
  }

  return (
    <div className="landing-page">
      <div className="landing-content">
        <h1>📝 Welcome to Todo App</h1>
        <p>
          Organize your life with our simple and powerful todo application.
          Create, manage, and complete your tasks efficiently.
        </p>
        <div className="landing-actions">
          <Link to="/register" className="btn btn-primary">
            Get Started
          </Link>
          <Link to="/login" className="btn btn-secondary">
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
};

function App() {
  return (
    <ErrorBoundary>
      <Router>
        <AuthProvider>
          <div className="App">
            <Header />
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route
                path="/todos"
                element={
                  <PrivateRoute>
                    <TodoList />
                  </PrivateRoute>
                }
              />
              <Route
                path="/images"
                element={
                  <PrivateRoute>
                    <ImagesPage />
                  </PrivateRoute>
                }
              />
              <Route
                path="/admin"
                element={
                  <AdminRoute>
                    <AdminPanel />
                  </AdminRoute>
                }
              />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>
        </AuthProvider>
      </Router>
    </ErrorBoundary>
  );
}

export default App;
