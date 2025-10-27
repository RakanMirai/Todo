import React, { useState, useEffect } from 'react';
import { adminAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import '../../styles/Admin.css';

const AdminPanel = () => {
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user } = useAuth();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [usersData, statsData] = await Promise.all([
        adminAPI.getAllUsers(),
        adminAPI.getSystemStats()
      ]);
      setUsers(usersData);
      setStats(statsData);
      setError('');
    } catch (err) {
      setError('Failed to fetch admin data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user?')) {
      return;
    }

    try {
      await adminAPI.deleteUser(userId);
      setUsers(users.filter(u => u.id !== userId));
      fetchData(); // Refresh stats
    } catch (err) {
      setError('Failed to delete user');
      console.error(err);
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      await adminAPI.updateUserRole(userId, newRole);
      setUsers(users.map(u => 
        u.id === userId ? { ...u, role: newRole } : u
      ));
    } catch (err) {
      setError('Failed to update user role');
      console.error(err);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return <div className="loading">Loading admin panel...</div>;
  }

  return (
    <div className="admin-container">
      <div className="admin-header">
        <h1>Admin Panel</h1>
        <p className="admin-subtitle">Manage users and view system statistics</p>
      </div>

      {error && <div className="error-message">{error}</div>}

      {/* System Statistics */}
      {stats && (
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon">👥</div>
            <div className="stat-info">
              <h3>Total Users</h3>
              <p className="stat-number">{stats.total_users || 0}</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">✅</div>
            <div className="stat-info">
              <h3>Total Todos</h3>
              <p className="stat-number">{stats.total_todos || 0}</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">✔️</div>
            <div className="stat-info">
              <h3>Completed Todos</h3>
              <p className="stat-number">{stats.completed_todos || 0}</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">⏳</div>
            <div className="stat-info">
              <h3>Pending Todos</h3>
              <p className="stat-number">{stats.pending_todos || 0}</p>
            </div>
          </div>
        </div>
      )}

      {/* Users Table */}
      <div className="admin-section">
        <h2>User Management ({users.length} users)</h2>
        <div className="table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Username</th>
                <th>Email</th>
                <th>Full Name</th>
                <th>Role</th>
                <th>Verified</th>
                <th>Active</th>
                <th>Created At</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className={u.id === user.id ? 'current-user' : ''}>
                  <td>{u.id}</td>
                  <td>
                    <strong>{u.username}</strong>
                    {u.id === user.id && <span className="badge-self">You</span>}
                  </td>
                  <td>{u.email}</td>
                  <td>{u.full_name || '-'}</td>
                  <td>
                    <select
                      value={u.role}
                      onChange={(e) => handleRoleChange(u.id, e.target.value)}
                      disabled={u.id === user.id}
                      className={`role-badge role-${u.role}`}
                    >
                      <option value="user">User</option>
                      <option value="admin">Admin</option>
                    </select>
                  </td>
                  <td>
                    <span className={`badge ${u.is_verified ? 'badge-success' : 'badge-warning'}`}>
                      {u.is_verified ? '✓ Yes' : '✗ No'}
                    </span>
                  </td>
                  <td>
                    <span className={`badge ${u.is_active ? 'badge-success' : 'badge-danger'}`}>
                      {u.is_active ? '✓ Active' : '✗ Inactive'}
                    </span>
                  </td>
                  <td>{formatDate(u.created_at)}</td>
                  <td>
                    <button
                      onClick={() => handleDeleteUser(u.id)}
                      disabled={u.id === user.id}
                      className="btn-icon btn-danger-icon"
                      title="Delete user"
                    >
                      🗑️
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
