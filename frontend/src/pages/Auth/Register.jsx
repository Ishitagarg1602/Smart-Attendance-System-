import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../store/AuthContext';
import { toast } from 'react-toastify';

const Register = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    role: 'student',
    department: '',
    // Student specific
    studentId: '',
    rollNumber: '',
    semester: 1,
    // Faculty specific
    facultyId: '',
    designation: ''
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleNext = () => {
    if (step === 1) {
      if (!formData.email || !formData.password || !formData.name || !formData.department) {
        toast.error('Please fill all required fields');
        return;
      }
      if (formData.password.length < 6) {
        toast.error('Password must be at least 6 characters');
        return;
      }
    }
    setStep(step + 1);
  };

  const handleBack = () => {
    setStep(step - 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await register(formData);
      toast.success(response.message || 'Registration successful!');
      
      // Redirect based on role
      if (formData.role === 'faculty') {
        navigate('/faculty/dashboard');
      } else {
        navigate('/student/dashboard');
      }
    } catch (error) {
      if (error.errors && error.errors.length > 0) {
        const errorMessages = error.errors.map(e => `${e.field}: ${e.message}`).join('\n');
        toast.error(`Validation Failed:\n${errorMessages}`);
      } else {
        toast.error(error.error || 'Registration failed');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card card fade-in" style={{ maxWidth: '500px' }}>
        <h1 className="login-title">Create Account</h1>
        <p className="login-subtitle">Step {step} of 2</p>

        <form onSubmit={handleSubmit}>
          {step === 1 && (
            <>
              <div className="form-group">
                <label className="form-label">Role *</label>
                <select
                  name="role"
                  className="form-input"
                  value={formData.role}
                  onChange={handleChange}
                  required
                >
                  <option value="student">Student</option>
                  <option value="faculty">Faculty</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Full Name *</label>
                <input
                  type="text"
                  name="name"
                  className="form-input"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter your full name"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Email *</label>
                <input
                  type="email"
                  name="email"
                  className="form-input"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter your email"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Password *</label>
                <input
                  type="password"
                  name="password"
                  className="form-input"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Min. 6 characters"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Department *</label>
                <input
                  type="text"
                  name="department"
                  className="form-input"
                  value={formData.department}
                  onChange={handleChange}
                  placeholder="e.g., Computer Science"
                  required
                />
              </div>

              <button
                type="button"
                className="btn btn-primary w-full"
                onClick={handleNext}
              >
                Next
              </button>
            </>
          )}

          {step === 2 && (
            <>
              {formData.role === 'student' ? (
                <>
                  <div className="form-group">
                    <label className="form-label">Student ID *</label>
                    <input
                      type="text"
                      name="studentId"
                      className="form-input"
                      value={formData.studentId}
                      onChange={handleChange}
                      placeholder="e.g., S2023001"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Roll Number *</label>
                    <input
                      type="text"
                      name="rollNumber"
                      className="form-input"
                      value={formData.rollNumber}
                      onChange={handleChange}
                      placeholder="e.g., R2023001"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Semester *</label>
                    <select
                      name="semester"
                      className="form-input"
                      value={formData.semester}
                      onChange={handleChange}
                      required
                    >
                      {[1,2,3,4,5,6,7,8].map(num => (
                        <option key={num} value={num}>Semester {num}</option>
                      ))}
                    </select>
                  </div>
                </>
              ) : (
                <>
                  <div className="form-group">
                    <label className="form-label">Faculty ID *</label>
                    <input
                      type="text"
                      name="facultyId"
                      className="form-input"
                      value={formData.facultyId}
                      onChange={handleChange}
                      placeholder="e.g., F2023001"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Designation *</label>
                    <input
                      type="text"
                      name="designation"
                      className="form-input"
                      value={formData.designation}
                      onChange={handleChange}
                      placeholder="e.g., Professor"
                      required
                    />
                  </div>
                </>
              )}

              <div className="flex gap-2">
                <button
                  type="button"
                  className="btn btn-secondary w-full"
                  onClick={handleBack}
                >
                  Back
                </button>
                <button
                  type="submit"
                  className="btn btn-primary w-full"
                  disabled={loading}
                >
                  {loading ? 'Creating Account...' : 'Register'}
                </button>
              </div>
            </>
          )}
        </form>

        <div className="mt-4 text-center">
          <p>Already have an account? <Link to="/login">Login</Link></p>
        </div>
      </div>
    </div>
  );
};

export default Register;