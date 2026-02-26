import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import adminService from '../../services/admin.service';
import { toast } from 'react-toastify';

const UserManagement = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    pages: 1
  });
  const [filters, setFilters] = useState({
    role: '',
    search: '',
    page: 1,
    limit: 20
  });

  useEffect(() => {
    loadUsers();
  }, [filters.page, filters.role]);

  const loadUsers = async () => {
    try {
      const response = await adminService.getUsers(filters);
      if (response.success) {
        setUsers(response.data.users);
        setPagination(response.data.pagination);
      }
    } catch (error) {
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setFilters({ ...filters, page: 1 });
    loadUsers();
  };

  const handleToggleStatus = async (userId, currentStatus) => {
    if (window.confirm(`Are you sure you want to ${currentStatus ? 'deactivate' : 'activate'} this user?`)) {
      try {
        const response = await adminService.toggleUserStatus(userId);
        if (response.success) {
          toast.success(`User ${response.data.isActive ? 'activated' : 'deactivated'} successfully`);
          loadUsers();
        }
      } catch (error) {
        toast.error(error.error || 'Failed to update user status');
      }
    }
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      try {
        const response = await adminService.deleteUser(userId);
        if (response.success) {
          toast.success('User deleted successfully');
          loadUsers();
        }
      } catch (error) {
        toast.error(error.error || 'Failed to delete user');
      }
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
        </div>
        <nav className="sidebar-nav">
          <a href="/admin/dashboard" className="nav-item">
            <span>📊</span> Dashboard
          </a>
          <a href="/admin/users" className="nav-item active">
            <span>👥</span> Users
          </a>
          <a href="/admin/classes" className="nav-item">
            <span>📚</span> Classes
          </a>
          <a href="/admin/reports" className="nav-item">
            <span>📈</span> Reports
          </a>
        </nav>
      </div>

      {/* Main Content */}
      <div className="main-content">
        <div className="card">
          <div className="flex justify-between items-center mb-4">
            <h1>User Management</h1>
            <button
              className="btn btn-primary"
              onClick={() => navigate('/admin/users/create')}
            >
              + Add New User
            </button>
          </div>

          {/* Filters */}
          <div className="row mb-4">
            <div className="col-md-4">
              <form onSubmit={handleSearch}>
                <div className="form-group">
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Search by name or email..."
                    value={filters.search}
                    onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                  />
                </div>
              </form>
            </div>
            <div className="col-md-3">
              <div className="form-group">
                <select
                  className="form-input"
                  value={filters.role}
                  onChange={(e) => setFilters({ ...filters, role: e.target.value, page: 1 })}
                >
                  <option value="">All Roles</option>
                  <option value="student">Students</option>
                  <option value="faculty">Faculty</option>
                  <option value="admin">Admins</option>
                </select>
              </div>
            </div>
            <div className="col-md-2">
              <div className="form-group">
                <select
                  className="form-input"
                  value={filters.limit}
                  onChange={(e) => setFilters({ ...filters, limit: e.target.value })}
                >
                  <option value="20">20 per page</option>
                  <option value="50">50 per page</option>
                  <option value="100">100 per page</option>
                </select>
              </div>
            </div>
          </div>

          {/* Users Table */}
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Department</th>
                  <th>ID</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
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
                      {user.role === 'student' ? user.studentId : 
                       user.role === 'faculty' ? user.facultyId : 'ADMIN'}
                    </td>
                    <td>
                      <span className={`badge ${user.isActive ? 'badge-present' : 'badge-absent'}`}>
                        {user.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td>
                      <div className="flex gap-2">
                        <button
                          className="btn btn-secondary btn-sm"
                          onClick={() => navigate(`/admin/users/${user._id}`)}
                        >
                          View
                        </button>
                        <button
                          className={`btn ${user.isActive ? 'btn-warning' : 'btn-success'} btn-sm`}
                          onClick={() => handleToggleStatus(user._id, user.isActive)}
                        >
                          {user.isActive ? 'Deactivate' : 'Activate'}
                        </button>
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => handleDeleteUser(user._id)}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="flex justify-center gap-2 mt-4">
              <button
                className="btn btn-secondary"
                disabled={pagination.page === 1}
                onClick={() => setFilters({ ...filters, page: pagination.page - 1 })}
              >
                Previous
              </button>
              <span className="btn" style={{ background: '#f1f5f9' }}>
                Page {pagination.page} of {pagination.pages}
              </span>
              <button
                className="btn btn-secondary"
                disabled={pagination.page === pagination.pages}
                onClick={() => setFilters({ ...filters, page: pagination.page + 1 })}
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserManagement;