import React, { useState, useEffect } from 'react';
import { useAuth } from '../../store/AuthContext';
import studentService from '../../services/student.service';
import { toast } from 'react-toastify';

const AttendanceHistory = () => {
  const { user } = useAuth();
  const [attendance, setAttendance] = useState([]);
  const [statistics, setStatistics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    classId: '',
    limit: 50
  });

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async (applyFilters = false) => {
    try {
      const params = applyFilters ? filters : {};
      const response = await studentService.getAttendanceHistory(params);
      if (response.success) {
        setAttendance(response.data.attendance);
        setStatistics(response.data.statistics);
      }
    } catch (error) {
      toast.error('Failed to load attendance history');
    } finally {
      setLoading(false);
    }
  };

  const handleFilter = () => {
    loadHistory(true);
  };

  const handleReset = () => {
    setFilters({
      startDate: '',
      endDate: '',
      classId: '',
      limit: 50
    });
    loadHistory(false);
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'present': return '#10b981';
      case 'rejected': return '#ef4444';
      default: return '#64748b';
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
          <h2>Student Portal</h2>
          <p>{user?.name}</p>
        </div>
        <nav className="sidebar-nav">
          <a href="/student/dashboard" className="nav-item">
            <span>📊</span> Dashboard
          </a>
          <a href="/student/scan" className="nav-item">
            <span>📷</span> Scan QR
          </a>
          <a href="/student/history" className="nav-item active">
            <span>📝</span> Attendance History
          </a>
        </nav>
      </div>

      {/* Main Content */}
      <div className="main-content">
        <div className="card">
          <h1 className="mb-4">Attendance History</h1>

          {/* Statistics */}
          {statistics && (
            <div className="stats-grid mb-4">
              <div className="stat-card">
                <div className="stat-label">Total Attendance</div>
                <div className="stat-value">{statistics.totalAttendance}</div>
              </div>
              <div className="stat-card">
                <div className="stat-label">Present</div>
                <div className="stat-value" style={{ color: '#10b981' }}>{statistics.presentCount}</div>
              </div>
              <div className="stat-card">
                <div className="stat-label">Attendance %</div>
                <div className="stat-value">{statistics.attendancePercentage}%</div>
              </div>
              <div className="stat-card">
                <div className="stat-label">Rejected</div>
                <div className="stat-value" style={{ color: '#ef4444' }}>{statistics.rejectedCount}</div>
              </div>
            </div>
          )}

          {/* Filters */}
          <div className="row mb-4">
            <div className="col-md-3">
              <div className="form-group">
                <label className="form-label">Start Date</label>
                <input
                  type="date"
                  className="form-input"
                  value={filters.startDate}
                  onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
                />
              </div>
            </div>
            <div className="col-md-3">
              <div className="form-group">
                <label className="form-label">End Date</label>
                <input
                  type="date"
                  className="form-input"
                  value={filters.endDate}
                  onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
                />
              </div>
            </div>
            <div className="col-md-2">
              <div className="form-group">
                <label className="form-label">Limit</label>
                <select
                  className="form-input"
                  value={filters.limit}
                  onChange={(e) => setFilters({ ...filters, limit: e.target.value })}
                >
                  <option value="20">20</option>
                  <option value="50">50</option>
                  <option value="100">100</option>
                </select>
              </div>
            </div>
            <div className="col-md-2">
              <div className="form-group">
                <label className="form-label">&nbsp;</label>
                <button
                  className="btn btn-primary w-full"
                  onClick={handleFilter}
                >
                  Apply
                </button>
              </div>
            </div>
            <div className="col-md-2">
              <div className="form-group">
                <label className="form-label">&nbsp;</label>
                <button
                  className="btn btn-secondary w-full"
                  onClick={handleReset}
                >
                  Reset
                </button>
              </div>
            </div>
          </div>

          {/* Attendance Table */}
          {attendance.length === 0 ? (
            <p className="text-center">No attendance records found</p>
          ) : (
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th>Subject</th>
                    <th>Date</th>
                    <th>Time</th>
                    <th>Distance</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {attendance.map((record) => (
                    <tr key={record._id}>
                      <td>
                        <strong>{record.classId?.subjectName}</strong>
                        <br />
                        <small>{record.classId?.subjectCode}</small>
                      </td>
                      <td>{new Date(record.timestamp).toLocaleDateString()}</td>
                      <td>{new Date(record.timestamp).toLocaleTimeString()}</td>
                      <td>
                        {record.distanceFromClass}m
                        {record.distanceFromClass > 20 && (
                          <small className="block text-danger">Outside range</small>
                        )}
                      </td>
                      <td>
                        <span className={`badge badge-${record.status}`}>
                          {record.status}
                        </span>
                        {record.rejectionReason && (
                          <small className="block text-muted">
                            {record.rejectionReason}
                          </small>
                        )}
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

export default AttendanceHistory;