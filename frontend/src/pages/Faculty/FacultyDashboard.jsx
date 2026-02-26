import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../store/AuthContext';
import facultyService from '../../services/faculty.service';
import { toast } from 'react-toastify';

const FacultyDashboard = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [stats, setStats] = useState(null);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const [statsRes, classesRes] = await Promise.all([
        facultyService.getDashboardStats(),
        facultyService.getClasses()
      ]);

      if (statsRes.success) setStats(statsRes.data);
      if (classesRes.success) setClasses(classesRes.data.classes);
    } catch (error) {
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleStartClass = async (classId) => {
    try {
      const response = await facultyService.startClass(classId);
      if (response.success) {
        toast.success('Class started successfully!');
        navigate(`/faculty/class/${classId}/live`);
      }
    } catch (error) {
      toast.error(error.error || 'Failed to start class');
    }
  };

  const handleViewAttendance = (classId) => {
    navigate(`/faculty/class/${classId}/attendance`);
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
          <h2>Faculty Portal</h2>
          <p>{user?.name}</p>
          <small>{user?.department}</small>
        </div>
        
        <nav className="sidebar-nav">
          <a href="/faculty/dashboard" className="nav-item active">
            <span>📊</span> Dashboard
          </a>
          <a href="/faculty/classes" className="nav-item">
            <span>📚</span> My Classes
          </a>
          <a href="/faculty/create-class" className="nav-item">
            <span>➕</span> Create Class
          </a>
          <a href="/faculty/attendance" className="nav-item">
            <span>📝</span> Attendance Records
          </a>
          <a href="/faculty/profile" className="nav-item">
            <span>👤</span> Profile
          </a>
          <button onClick={logout} className="nav-item" style={{ width: '100%', border: 'none', background: 'none', cursor: 'pointer' }}>
            <span>🚪</span> Logout
          </button>
        </nav>
      </div>

      {/* Main Content */}
      <div className="main-content">
        <div className="flex justify-between items-center mb-5">
          <h1>Welcome back, {user?.name}!</h1>
          <button 
            className="btn btn-primary"
            onClick={() => navigate('/faculty/create-class')}
          >
            + Create New Class
          </button>
        </div>

        {/* Stats Grid */}
        {stats && (
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-label">Total Classes</div>
              <div className="stat-value">{stats.totalClasses || 0}</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Active Classes</div>
              <div className="stat-value">{stats.activeClasses || 0}</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Total Attendance</div>
              <div className="stat-value">{stats.totalAttendance || 0}</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Today's Attendance</div>
              <div className="stat-value">{stats.todayAttendance || 0}</div>
            </div>
          </div>
        )}

        {/* Recent Classes */}
        <div className="card mt-5">
          <h2 className="mb-4">Your Classes</h2>
          
          {classes.length === 0 ? (
            <p className="text-center">No classes created yet.</p>
          ) : (
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th>Subject</th>
                    <th>Code</th>
                    <th>Semester</th>
                    <th>Room</th>
                    <th>Students</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {classes.map((cls) => (
                    <tr key={cls._id}>
                      <td>{cls.subjectName}</td>
                      <td>{cls.subjectCode}</td>
                      <td>Semester {cls.semester}</td>
                      <td>{cls.classLocation.roomNumber}</td>
                      <td>{cls.studentsEnrolled?.length || 0}</td>
                      <td>
                        <div className="flex gap-2">
                          <button
                            className="btn btn-success btn-sm"
                            onClick={() => handleStartClass(cls._id)}
                          >
                            Start Class
                          </button>
                          <button
                            className="btn btn-secondary btn-sm"
                            onClick={() => handleViewAttendance(cls._id)}
                          >
                            View
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FacultyDashboard;