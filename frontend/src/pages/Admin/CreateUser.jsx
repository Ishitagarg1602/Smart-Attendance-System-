import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import adminService from '../../services/admin.service';
import { toast } from 'react-toastify';

const CreateUser = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    role: 'student',
    department: '',
    studentId: '',
    rollNumber: '',
    semester: 1,
    facultyId: '',
    designation: ''
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
      const response = await adminService.createUser(formData);
      if (response.success) {
        toast.success(`Successfully created ${formData.role} account!`);
        navigate('/admin/users');
      }
    } catch (error) {
      toast.error(error.error || 'Failed to create user');
    } finally {
      setLoading(false);
    }
  };

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
        <div className="card" style={{ maxWidth: '600px', margin: '0 auto' }}>
          <div className="flex justify-between items-center mb-4">
            <h2>Add New User</h2>
            <button className="btn btn-secondary btn-sm" onClick={() => navigate('/admin/users')}>
              Back to Users
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Role *</label>
              <select name="role" className="form-input" value={formData.role} onChange={handleChange} required>
                <option value="student">Student</option>
                <option value="faculty">Faculty</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Full Name *</label>
              <input type="text" name="name" className="form-input" value={formData.name} onChange={handleChange} required />
            </div>

            <div className="form-group">
              <label className="form-label">Email *</label>
              <input type="email" name="email" className="form-input" value={formData.email} onChange={handleChange} required />
            </div>

            <div className="form-group">
              <label className="form-label">Password *</label>
              <input type="text" name="password" className="form-input" value={formData.password} onChange={handleChange} placeholder="Should be min 6 chars, uppercase, lowercase, number" required />
            </div>

            <div className="form-group">
              <label className="form-label">Department *</label>
              <input type="text" name="department" className="form-input" value={formData.department} onChange={handleChange} required />
            </div>

            {formData.role === 'student' ? (
              <>
                <div className="form-group">
                  <label className="form-label">Student ID (Leave blank to auto-generate)</label>
                  <input type="text" name="studentId" className="form-input" value={formData.studentId} onChange={handleChange} />
                </div>
                <div className="form-group">
                  <label className="form-label">Roll Number (Leave blank to auto-generate)</label>
                  <input type="text" name="rollNumber" className="form-input" value={formData.rollNumber} onChange={handleChange} />
                </div>
                <div className="form-group">
                  <label className="form-label">Semester *</label>
                  <select name="semester" className="form-input" value={formData.semester} onChange={handleChange} required>
                    {[1,2,3,4,5,6,7,8].map(num => (
                      <option key={num} value={num}>Semester {num}</option>
                    ))}
                  </select>
                </div>
              </>
            ) : (
              <>
                <div className="form-group">
                  <label className="form-label">Faculty ID (Leave blank to auto-generate)</label>
                  <input type="text" name="facultyId" className="form-input" value={formData.facultyId} onChange={handleChange} />
                </div>
                <div className="form-group">
                  <label className="form-label">Designation *</label>
                  <input type="text" name="designation" className="form-input" value={formData.designation} onChange={handleChange} required />
                </div>
              </>
            )}

            <button type="submit" className="btn btn-primary w-full mt-4" disabled={loading}>
              {loading ? 'Creating...' : 'Create User'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateUser;
