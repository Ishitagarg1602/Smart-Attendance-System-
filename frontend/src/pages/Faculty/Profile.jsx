import React, { useState } from 'react';
import { useAuth } from '../../store/AuthContext';
import { toast } from 'react-toastify';

const FacultyProfile = () => {
  const { user, updateProfile, logout } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    department: user?.department || '',
    designation: user?.designation || '',
    facultyId: user?.facultyId || ''
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await updateProfile(formData);
      if (response.success) {
        toast.success('Profile updated successfully');
        setIsEditing(false);
      }
    } catch (error) {
      toast.error(error.error || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dashboard">
      {/* Sidebar */}
      <div className="sidebar">
        <div className="sidebar-header">
          <h2>Faculty Portal</h2>
        </div>
        <nav className="sidebar-nav">
          <a href="/faculty/dashboard" className="nav-item">
            <span>📊</span> Dashboard
          </a>
          <a href="/faculty/classes" className="nav-item">
            <span>📚</span> My Classes
          </a>
          <a href="/faculty/profile" className="nav-item active">
            <span>👤</span> Profile
          </a>
          <button onClick={logout} className="nav-item" style={{ width: '100%', border: 'none', background: 'none', cursor: 'pointer' }}>
            <span>🚪</span> Logout
          </button>
        </nav>
      </div>

      {/* Main Content */}
      <div className="main-content">
        <div className="card">
          <div className="flex justify-between items-center mb-4">
            <h1>Faculty Profile</h1>
            {!isEditing && (
              <button
                className="btn btn-primary"
                onClick={() => setIsEditing(true)}
              >
                Edit Profile
              </button>
            )}
          </div>

          {isEditing ? (
            <form onSubmit={handleSubmit}>
              <div className="row">
                <div className="col-md-6">
                  <div className="form-group">
                    <label className="form-label">Full Name</label>
                    <input
                      type="text"
                      name="name"
                      className="form-input"
                      value={formData.name}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Email</label>
                    <input
                      type="email"
                      name="email"
                      className="form-input"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      disabled
                    />
                    <small className="text-muted">Email cannot be changed</small>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Department</label>
                    <input
                      type="text"
                      name="department"
                      className="form-input"
                      value={formData.department}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>

                <div className="col-md-6">
                  <div className="form-group">
                    <label className="form-label">Designation</label>
                    <input
                      type="text"
                      name="designation"
                      className="form-input"
                      value={formData.designation}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Faculty ID</label>
                    <input
                      type="text"
                      name="facultyId"
                      className="form-input"
                      value={formData.facultyId}
                      onChange={handleChange}
                      required
                      disabled
                    />
                    <small className="text-muted">Faculty ID cannot be changed</small>
                  </div>
                </div>
              </div>

              <div className="flex gap-2 mt-4">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setIsEditing(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={loading}
                >
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          ) : (
            <div className="profile-info">
              <div className="row">
                <div className="col-md-6">
                  <div className="info-item">
                    <label>Full Name</label>
                    <p>{user?.name}</p>
                  </div>
                  <div className="info-item">
                    <label>Email</label>
                    <p>{user?.email}</p>
                  </div>
                  <div className="info-item">
                    <label>Department</label>
                    <p>{user?.department}</p>
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="info-item">
                    <label>Designation</label>
                    <p>{user?.designation || 'Professor'}</p>
                  </div>
                  <div className="info-item">
                    <label>Faculty ID</label>
                    <p>{user?.facultyId}</p>
                  </div>
                  <div className="info-item">
                    <label>Member Since</label>
                    <p>{new Date(user?.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FacultyProfile;