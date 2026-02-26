import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import facultyService from '../../services/faculty.service';
import { toast } from 'react-toastify';

const ClassAttendance = () => {
  const { classId } = useParams();
  const navigate = useNavigate();
  const [attendance, setAttendance] = useState([]);
  const [classData, setClassData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    date: new Date().toISOString().split('T')[0],
    studentId: ''
  });

  useEffect(() => {
    loadAttendance();
  }, [classId, filters.date]);

  const loadAttendance = async () => {
    try {
      const response = await facultyService.getClassAttendance(classId, filters);
      if (response.success) {
        setAttendance(response.data.attendance);
        setClassData(response.data.class);
      }
    } catch (error) {
      toast.error('Failed to load attendance records');
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    // Convert attendance to CSV
    const csvData = attendance.map(record => ({
      'Student ID': record.studentId?.studentId,
      'Roll Number': record.studentId?.rollNumber,
      'Name': record.studentId?.name,
      'Date': new Date(record.timestamp).toLocaleDateString(),
      'Time': new Date(record.timestamp).toLocaleTimeString(),
      'Status': record.status,
      'Distance': `${record.distanceFromClass}m`
    }));

    const csv = convertToCSV(csvData);
    downloadCSV(csv, `attendance_${classData?.subjectCode}_${filters.date}.csv`);
  };

  const convertToCSV = (data) => {
    const headers = Object.keys(data[0] || {});
    const rows = data.map(obj => headers.map(header => obj[header]).join(','));
    return [headers.join(','), ...rows].join('\n');
  };

  const downloadCSV = (csv, filename) => {
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
  };

  const calculateStats = () => {
    const total = attendance.length;
    const present = attendance.filter(a => a.status === 'present').length;
    const rejected = attendance.filter(a => a.status === 'rejected').length;
    const percentage = total > 0 ? ((present / total) * 100).toFixed(2) : 0;

    return { total, present, rejected, percentage };
  };

  const stats = calculateStats();

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
        </div>
        <nav className="sidebar-nav">
          <a href="/faculty/dashboard" className="nav-item">
            <span>📊</span> Dashboard
          </a>
          <a href="/faculty/classes" className="nav-item">
            <span>📚</span> My Classes
          </a>
          <a href="#" className="nav-item active">
            <span>📝</span> Attendance
          </a>
        </nav>
      </div>

      {/* Main Content */}
      <div className="main-content">
        <div className="card">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h1>Attendance Records</h1>
              {classData && (
                <p className="text-muted">
                  {classData.subjectName} ({classData.subjectCode}) - Semester {classData.semester}
                </p>
              )}
            </div>
            <button
              className="btn btn-primary"
              onClick={handleExport}
              disabled={attendance.length === 0}
            >
              📥 Export CSV
            </button>
          </div>

          {/* Filters */}
          <div className="row mb-4">
            <div className="col-md-4">
              <div className="form-group">
                <label className="form-label">Filter by Date</label>
                <input
                  type="date"
                  className="form-input"
                  value={filters.date}
                  onChange={(e) => setFilters({ ...filters, date: e.target.value })}
                />
              </div>
            </div>
            <div className="col-md-4">
              <div className="form-group">
                <label className="form-label">Filter by Student ID</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Enter student ID"
                  value={filters.studentId}
                  onChange={(e) => setFilters({ ...filters, studentId: e.target.value })}
                />
              </div>
            </div>
            <div className="col-md-4">
              <div className="form-group">
                <label className="form-label">&nbsp;</label>
                <button
                  className="btn btn-secondary w-full"
                  onClick={loadAttendance}
                >
                  Apply Filters
                </button>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="stats-grid mb-4">
            <div className="stat-card">
              <div className="stat-label">Total Records</div>
              <div className="stat-value">{stats.total}</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Present</div>
              <div className="stat-value" style={{ color: '#10b981' }}>{stats.present}</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Rejected</div>
              <div className="stat-value" style={{ color: '#ef4444' }}>{stats.rejected}</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Attendance %</div>
              <div className="stat-value">{stats.percentage}%</div>
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
                    <th>Student ID</th>
                    <th>Roll Number</th>
                    <th>Name</th>
                    <th>Date & Time</th>
                    <th>Distance</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {attendance.map((record) => (
                    <tr key={record._id}>
                      <td>{record.studentId?.studentId}</td>
                      <td>{record.studentId?.rollNumber}</td>
                      <td>{record.studentId?.name}</td>
                      <td>
                        {new Date(record.timestamp).toLocaleDateString()}<br />
                        <small>{new Date(record.timestamp).toLocaleTimeString()}</small>
                      </td>
                      <td>{record.distanceFromClass}m</td>
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

export default ClassAttendance;