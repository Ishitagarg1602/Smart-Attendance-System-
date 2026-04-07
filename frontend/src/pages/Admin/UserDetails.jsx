import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import adminService from '../../services/admin.service';
import { toast } from 'react-toastify';

const UserDetails = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [roleData, setRoleData] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const [passwordForm, setPasswordForm] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);

  useEffect(() => {
    loadUser();
  }, [userId]);

  const loadUser = async () => {
    try {
      const response = await adminService.getUserById(userId);
      if (response.success) {
        setUser(response.data.user);
        setRoleData(response.data.roleData);
      }
    } catch (error) {
      toast.error('Failed to load user details');
      navigate('/admin/users');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordReset = async (e) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    
    setPasswordLoading(true);
    try {
      const response = await adminService.changePassword(userId, newPassword);
      if (response.success) {
        toast.success('User password changed successfully!');
        setNewPassword('');
        setPasswordForm(false);
      }
    } catch (error) {
      toast.error(error.error || 'Failed to change password');
    } finally {
      setPasswordLoading(false);
    }
  };

  if (loading) return <div className="flex justify-center mt-8"><div className="spinner"></div></div>;

  return (
    <div className="dashboard">
      <div className="sidebar">
        <div className="sidebar-header">
          <h2>Admin Portal</h2>
        </div>
        <nav className="sidebar-nav">
          <a href="/admin/dashboard" className="nav-item"><span>📊</span> Dashboard</a>
          <a href="/admin/users" className="nav-item active"><span>👥</span> Users</a>
          <a href="/admin/classes" className="nav-item"><span>📚</span> Classes</a>
          <a href="/admin/reports" className="nav-item"><span>📈</span> Reports</a>
        </nav>
      </div>

      <div className="main-content">
        <div className="card" style={{ maxWidth: '800px', margin: '0 auto' }}>
          <div className="flex justify-between items-center mb-6">
            <h2>User Profile</h2>
            <button className="btn btn-secondary btn-sm" onClick={() => navigate('/admin/users')}>
              Back to Users
            </button>
          </div>

          {/* Profile Overview */}
          <div className="mb-6 p-4 rounded bg-gray-50 border">
            <h3 className="mb-4 text-xl">{user?.name}</h3>
            <div className="row">
              <div className="col-md-6 mb-2"><strong>Email:</strong> {user?.email}</div>
              <div className="col-md-6 mb-2"><strong>Role:</strong> <span className={`badge badge-${user?.role}`}>{user?.role}</span></div>
              <div className="col-md-6 mb-2"><strong>Department:</strong> {user?.department}</div>
              <div className="col-md-6 mb-2"><strong>Status:</strong> {user?.isActive ? 'Active' : 'Inactive'}</div>
              
              {user?.role === 'student' && roleData && (
                <>
                  <div className="col-md-6 mb-2"><strong>Student ID:</strong> {roleData.studentId}</div>
                  <div className="col-md-6 mb-2"><strong>Roll Number:</strong> {roleData.rollNumber}</div>
                  <div className="col-md-6 mb-2"><strong>Semester:</strong> {roleData.semester}</div>
                  <div className="col-md-6 mb-2"><strong>Total Attendance:</strong> {roleData.attendanceCount}</div>
                </>
              )}

              {user?.role === 'faculty' && roleData && (
                <>
                  <div className="col-md-6 mb-2"><strong>Faculty ID:</strong> {roleData.facultyId}</div>
                  <div className="col-md-6 mb-2"><strong>Designation:</strong> {roleData.designation}</div>
                  <div className="col-md-6 mb-2"><strong>HOD:</strong> {roleData.isHOD ? 'Yes' : 'No'}</div>
                </>
              )}
            </div>
          </div>

          <hr/>

          {/* Security Area */}
          <div className="mt-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl">Security & Credentials</h3>
            </div>
            
            <div className="p-4 rounded border" style={{ backgroundColor: '#fff5f5', borderColor: '#feb2b2' }}>
              <div className="flex justify-between items-start">
                <div>
                  <h4 style={{ color: '#c53030', marginBottom: '8px' }}>Force Reset Password</h4>
                  <p className="text-muted mb-0" style={{ fontSize: '0.9rem' }}>
                    Note: For cryptographic security mathematically mandated by bcrypt, it is <b>impossible</b> to decrypt and "view" existing passwords. The system only stores irreversible hashes. However, as an Admin, you can forcefully overwrite the password with a new one below.
                  </p>
                </div>
                {!passwordForm && (
                  <button className="btn btn-warning btn-sm ml-4" onClick={() => setPasswordForm(true)}>
                    Change Password
                  </button>
                )}
              </div>

              {passwordForm && (
                <form onSubmit={handlePasswordReset} className="mt-4 pt-4 border-t" style={{ borderColor: '#fed7d7' }}>
                  <div className="form-group mb-3">
                    <label>New Password</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Minimum 6 characters"
                      required
                    />
                    <small className="form-text text-muted">A secure password is required combining characters and numbers.</small>
                  </div>
                  <div className="flex gap-2">
                    <button type="submit" className="btn btn-danger btn-sm" disabled={passwordLoading}>
                      {passwordLoading ? 'Saving...' : 'Confirm New Password'}
                    </button>
                    <button type="button" className="btn btn-secondary btn-sm" onClick={() => setPasswordForm(false)}>
                      Cancel
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default UserDetails;
