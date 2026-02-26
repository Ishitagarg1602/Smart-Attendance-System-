import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../store/AuthContext';
import studentService from '../../services/student.service';
import { toast } from 'react-toastify';

const StudentDashboard = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [stats, setStats] = useState(null);
  const [enrolledClasses, setEnrolledClasses] = useState([]);
  const [recentAttendance, setRecentAttendance] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const [statsRes, classesRes, historyRes] = await Promise.all([
        studentService.getDashboardStats(),
        studentService.getEnrolledClasses(),
        studentService.getAttendanceHistory({ limit: 5 })
      ]);

      if (statsRes.success) setStats(statsRes.data);
      if (classesRes.success) setEnrolledClasses(classesRes.data.classes);
      if (historyRes.success) setRecentAttendance(historyRes.data.attendance);
    } catch (error) {
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleScanQR = () => {
    navigate('/student/scan');
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
          <h2>Student Portal</h2>
          <p>{user?.name}</p>
          <small>{user?.studentId}</small>
        </div>
        
        <nav className="sidebar-nav">
          <a href="/student/dashboard" className="nav-item active">
            <span>📊</span> Dashboard
          </a>
          <a href="/student/scan" className="nav-item">
            <span>📷</span> Scan QR
          </a>
          <a href="/student/history" className="nav-item">
            <span>📝</span> Attendance History
          </a>
          <a href="/student/classes" className="nav-item">
            <span>📚</span> My Classes
          </a>
          <a href="/student/profile" className="nav-item">
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
            onClick={handleScanQR}
          >
            📷 Scan QR Code
          </button>
        </div>

        {/* Stats Grid */}
        {stats && (
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-label">Total Attendance</div>
              <div className="stat-value">{stats.totalAttendance || 0}</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Present</div>
              <div className="stat-value" style={{ color: '#10b981' }}>{stats.presentCount || 0}</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Attendance %</div>
              <div className="stat-value">{stats.attendancePercentage || 0}%</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Enrolled Classes</div>
              <div className="stat-value">{stats.enrolledClasses || 0}</div>
            </div>
          </div>
        )}

        {/* Enrolled Classes */}
        <div className="card mt-5">
          <h2 className="mb-4">Your Enrolled Classes</h2>
          
          {enrolledClasses.length === 0 ? (
            <p className="text-center">No classes enrolled yet.</p>
          ) : (
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th>Subject</th>
                    <th>Code</th>
                    <th>Faculty</th>
                    <th>Schedule</th>
                    <th>Room</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {enrolledClasses.slice(0, 3).map((cls) => (
                    <tr key={cls._id}>
                      <td>{cls.subjectName}</td>
                      <td>{cls.subjectCode}</td>
                      <td>{cls.faculty?.user?.name}</td>
                      <td>
                        {cls.schedule?.days?.join(', ')}<br />
                        <small>{cls.schedule?.startTime} - {cls.schedule?.endTime}</small>
                      </td>
                      <td>{cls.classLocation?.roomNumber}</td>
                      <td>
                        <button
                          className="btn btn-success btn-sm"
                          onClick={() => navigate('/student/scan')}
                        >
                          Mark Attendance
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {enrolledClasses.length > 3 && (
                <div className="text-center mt-3">
                  <button
                    className="btn btn-secondary"
                    onClick={() => navigate('/student/classes')}
                  >
                    View All Classes
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Recent Attendance */}
        <div className="card mt-5">
          <h2 className="mb-4">Recent Attendance</h2>
          
          {recentAttendance.length === 0 ? (
            <p className="text-center">No attendance records yet.</p>
          ) : (
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th>Subject</th>
                    <th>Date & Time</th>
                    <th>Distance</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recentAttendance.map((record) => (
                    <tr key={record._id}>
                      <td>{record.classId?.subjectName}</td>
                      <td>
                        {new Date(record.timestamp).toLocaleDateString()}<br />
                        <small>{new Date(record.timestamp).toLocaleTimeString()}</small>
                      </td>
                      <td>{record.distanceFromClass}m</td>
                      <td>
                        <span className={`badge badge-${record.status}`}>
                          {record.status}
                        </span>
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

export default StudentDashboard;