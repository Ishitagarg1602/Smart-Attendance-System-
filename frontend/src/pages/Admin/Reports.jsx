import React, { useState, useEffect } from 'react';
import adminService from '../../services/admin.service';
import { toast } from 'react-toastify';

const Reports = () => {
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    startDate: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    department: '',
    classId: ''
  });
  const [classes, setClasses] = useState([]);
  const [departments, setDepartments] = useState([]);

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      const [statsRes] = await Promise.all([
        adminService.getStatistics()
      ]);

      if (statsRes.success) {
        const depts = statsRes.data.departmentStats?.map(d => d._id) || [];
        setDepartments(depts);
      }
    } catch (error) {
      console.error('Failed to load initial data:', error);
    }
  };

  const generateReport = async () => {
    setLoading(true);
    try {
      const response = await adminService.getAttendanceReport(filters);
      if (response.success) {
        setReportData(response.data);
        toast.success('Report generated successfully');
      }
    } catch (error) {
      toast.error(error.error || 'Failed to generate report');
    } finally {
      setLoading(false);
    }
  };

  const exportToCSV = () => {
    if (!reportData) return;

    // Prepare data for CSV
    const csvData = reportData.attendance.map(record => ({
      'Student ID': record.studentId?.studentId,
      'Student Name': record.studentId?.name,
      'Subject': record.classId?.subjectName,
      'Subject Code': record.classId?.subjectCode,
      'Department': record.classId?.department,
      'Date': new Date(record.timestamp).toLocaleDateString(),
      'Time': new Date(record.timestamp).toLocaleTimeString(),
      'Status': record.status,
      'Distance': `${record.distanceFromClass}m`
    }));

    // Convert to CSV
    const headers = Object.keys(csvData[0] || {});
    const rows = csvData.map(obj => headers.map(header => obj[header]).join(','));
    const csv = [headers.join(','), ...rows].join('\n');

    // Download
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `attendance_report_${filters.startDate}_to_${filters.endDate}.csv`;
    a.click();
  };

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
          <a href="/admin/users" className="nav-item">
            <span>👥</span> Users
          </a>
          <a href="/admin/reports" className="nav-item active">
            <span>📈</span> Reports
          </a>
        </nav>
      </div>

      {/* Main Content */}
      <div className="main-content">
        <div className="card">
          <h1 className="mb-4">Attendance Reports</h1>

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
            <div className="col-md-3">
              <div className="form-group">
                <label className="form-label">Department</label>
                <select
                  className="form-input"
                  value={filters.department}
                  onChange={(e) => setFilters({ ...filters, department: e.target.value })}
                >
                  <option value="">All Departments</option>
                  {departments.map(dept => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="col-md-3">
              <div className="form-group">
                <label className="form-label">&nbsp;</label>
                <button
                  className="btn btn-primary w-full"
                  onClick={generateReport}
                  disabled={loading}
                >
                  {loading ? 'Generating...' : 'Generate Report'}
                </button>
              </div>
            </div>
          </div>

          {/* Report Results */}
          {reportData && (
            <>
              {/* Summary Cards */}
              <div className="stats-grid mb-4">
                <div className="stat-card">
                  <div className="stat-label">Total Records</div>
                  <div className="stat-value">{reportData.summary.total}</div>
                </div>
                <div className="stat-card">
                  <div className="stat-label">Present</div>
                  <div className="stat-value" style={{ color: '#10b981' }}>{reportData.summary.present}</div>
                </div>
                <div className="stat-card">
                  <div className="stat-label">Rejected</div>
                  <div className="stat-value" style={{ color: '#ef4444' }}>{reportData.summary.rejected}</div>
                </div>
                <div className="stat-card">
                  <div className="stat-label">Attendance Rate</div>
                  <div className="stat-value">
                    {((reportData.summary.present / reportData.summary.total) * 100).toFixed(2)}%
                  </div>
                </div>
              </div>

              {/* Department Summary */}
              <div className="card mb-4">
                <h3 className="mb-3">Department-wise Summary</h3>
                <div className="table-container">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Department</th>
                        <th>Attendance Count</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Object.entries(reportData.summary.byDepartment).map(([dept, count]) => (
                        <tr key={dept}>
                          <td>{dept}</td>
                          <td>{count}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Class Summary */}
              <div className="card mb-4">
                <h3 className="mb-3">Class-wise Summary</h3>
                <div className="table-container">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Subject Code</th>
                        <th>Attendance Count</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Object.entries(reportData.summary.byClass).map(([subject, count]) => (
                        <tr key={subject}>
                          <td>{subject}</td>
                          <td>{count}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Detailed Records */}
              <div className="card">
                <div className="flex justify-between items-center mb-3">
                  <h3>Detailed Records</h3>
                  <button
                    className="btn btn-primary"
                    onClick={exportToCSV}
                  >
                    📥 Export CSV
                  </button>
                </div>
                
                <div className="table-container" style={{ maxHeight: '400px', overflowY: 'auto' }}>
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Student ID</th>
                        <th>Student Name</th>
                        <th>Subject</th>
                        <th>Date</th>
                        <th>Time</th>
                        <th>Distance</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {reportData.attendance.map((record) => (
                        <tr key={record._id}>
                          <td>{record.studentId?.studentId}</td>
                          <td>{record.studentId?.name}</td>
                          <td>{record.classId?.subjectCode}</td>
                          <td>{new Date(record.timestamp).toLocaleDateString()}</td>
                          <td>{new Date(record.timestamp).toLocaleTimeString()}</td>
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
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Reports;