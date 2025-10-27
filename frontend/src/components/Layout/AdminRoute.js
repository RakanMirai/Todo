import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const AdminRoute = ({ children }) => {
  const { user, isAuthenticated, loading } = useAuth();

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (user?.role !== 'admin') {
    return (
      <div className="access-denied">
        <h1>Access Denied</h1>
        <p>You don't have permission to access this page.</p>
        <p>Admin privileges are required.</p>
      </div>
    );
  }

  return children;
};

export default AdminRoute;
