import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../store/AuthContext';
import adminService from '../../services/admin.service';
import { toast } from 'react-toastify';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [stats, setStats] = useState(null);
  const [recentUsers, setRecentUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const [statsRes, usersRes] = await Promise.all([
        adminService.getStatistics(),
        adminService.getUsers({ limit: 5 })
      ]);

      if (statsRes.success) setStats(statsRes.data);
      if (usersRes.success) setRecentUsers(usersRes.data.users);
    } catch (error) {
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center" style={{ minHeight: '60vh' }}>
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="dashboard">
      {/* Sidebar */}
      <div className="sidebar">
        <div className="sidebar-header">
          <h2>Admin Portal</h2>
          <p>{user?.name}</p>
          <small>Administrator</small>
        </div>
        
        <nav className="sidebar-nav">
          <a href="/admin/dashboard" className="nav-item active">
            <span>📊</span> Dashboard
          </a>
          <a href="/admin/users" className="nav-item">
            <span>👥</span> Users
          </a>
          <a href="/admin/classes" className="nav-item">
            <span>📚</span> Classes
          </a>
          <a href="/admin/attendance" className="nav-item">
            <span>📝</span> Attendance
          </a>
          <a href="/admin/reports" className="nav-item">
            <span>📈</span> Reports
          </a>
          <a href="/admin/settings" className="nav-item">
            <span>⚙️</span> Settings
          </a>
          <button onClick={logout} className="nav-item" style={{ width: '100%', border: 'none', background: 'none', cursor: 'pointer' }}>
            <span>🚪</span> Logout
          </button>
        </nav>
      </div>

      {/* Main Content */}
      <div className="main-content">
        <div className="flex justify-between items-center mb-5">
          <h1>Admin Dashboard</h1>
          <button 
            className="btn btn-primary"
            onClick={() => navigate('/admin/reports')}
          >
            📊 Generate Report
          </button>
        </div>

        {/* Stats Grid */}
        {stats && (
          <>
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-label">Total Users</div>
                <div className="stat-value">{stats.users?.total || 0}</div>
                <small>
                  👨‍🎓 {stats.users?.students || 0} Students | 👨‍🏫 {stats.users?.faculty || 0} Faculty
                </small>
              </div>
              <div className="stat-card">
                <div className="stat-label">Total Classes</div>
                <div className="stat-value">{stats.classes || 0}</div>
              </div>
              <div className="stat-card">
                <div className="stat-label">Total Attendance</div>
                <div className="stat-value">{stats.attendance?.total || 0}</div>
                <small>Today: {stats.attendance?.today || 0}</small>
              </div>
              <div className="stat-card">
                <div className="stat-label">Active Sessions</div>
                <div className="stat-value">{stats.activeSessions || 0}</div>
              </div>
            </div>

            {/* Department Distribution */}
            <div className="card mt-5">
              <h2 className="mb-4">Department Distribution</h2>
              <div className="row">
                {stats.departmentStats?.map((dept, index) => (
                  <div key={index} className="col-md-4 mb-3">
                    <div className="stat-card">
                      <div className="stat-label">{dept._id}</div>
                      <div className="stat-value">{dept.count}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* Recent Users */}
        <div className="card mt-5">
          <div className="flex justify-between items-center mb-4">
            <h2>Recent Users</h2>
            <button
              className="btn btn-secondary"
              onClick={() => navigate('/admin/users')}
            >
              View All
            </button>
          </div>
          
          {recentUsers.length === 0 ? (
            <p className="text-center">No users found</p>
          ) : (
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Department</th>
                    <th>Status</th>
                    <th>Joined</th>
                  </tr>
                </thead>
                <tbody>
                  {recentUsers.map((user) => (
                    <tr key={user._id}>
                      <td>{user.name}</td>
                      <td>{user.email}</td>
                      <td>
                        <span className={`badge badge-${user.role}`}>
                          {user.role}
                        </span>
                      </td>
                      <td>{user.department}</td>
                      <td>
                        <span className={`badge ${user.isActive ? 'badge-present' : 'badge-absent'}`}>
                          {user.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="card mt-5">
          <h2 className="mb-4">Quick Actions</h2>
          <div className="row">
            <div className="col-md-3 mb-3">
              <button
                className="btn btn-primary w-full"
                onClick={() => navigate('/admin/users/create')}
              >
                ➕ Add User
              </button>
            </div>
            <div className="col-md-3 mb-3">
              <button
                className="btn btn-primary w-full"
                onClick={() => navigate('/admin/classes/create')}
              >
                ➕ Create Class
              </button>
            </div>
            <div className="col-md-3 mb-3">
              <button
                className="btn btn-primary w-full"
                onClick={() => navigate('/admin/reports')}
              >
                📊 View Reports
              </button>
            </div>
            <div className="col-md-3 mb-3">
              <button
                className="btn btn-primary w-full"
                onClick={() => navigate('/admin/settings')}
              >
                ⚙️ Settings
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;