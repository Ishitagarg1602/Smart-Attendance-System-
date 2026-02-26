import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import QRCode from 'react-qr-code';
import facultyService from '../../services/faculty.service';
import { toast } from 'react-toastify';

const LiveClass = () => {
  const { classId } = useParams();
  const navigate = useNavigate();
  const [session, setSession] = useState(null);
  const [qrData, setQrData] = useState(null);
  const [attendance, setAttendance] = useState([]);
  const [expiryTime, setExpiryTime] = useState(60);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadActiveSession();
    const interval = setInterval(loadActiveSession, 5000); // Refresh every 5 seconds
    return () => clearInterval(interval);
  }, [classId]);

  useEffect(() => {
    if (session) {
      // Update QR code data
      setQrData(JSON.stringify({
        token: session.token,
        classId: session.classId,
        expiresAt: session.expiresAt
      }));

      // Countdown timer
      const timer = setInterval(() => {
        const now = new Date();
        const expiry = new Date(session.expiresAt);
        const secondsLeft = Math.max(0, Math.floor((expiry - now) / 1000));
        setExpiryTime(secondsLeft);

        if (secondsLeft === 0) {
          loadActiveSession(); // Get new session when expired
        }
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [session]);

  const loadActiveSession = async () => {
    try {
      const response = await facultyService.getActiveSession(classId);
      if (response.success && response.data.session) {
        setSession(response.data.session);
        
        // Load live attendance
        const attendanceRes = await facultyService.getLiveAttendance(response.data.session._id);
        if (attendanceRes.success) {
          setAttendance(attendanceRes.data.attendance);
        }
      } else {
        // No active session, try to start one
        await handleStartClass();
      }
    } catch (error) {
      console.error('Failed to load session:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStartClass = async () => {
    try {
      const response = await facultyService.startClass(classId);
      if (response.success) {
        setSession(response.data.session);
        toast.success('Class started! QR code is now active.');
      }
    } catch (error) {
      toast.error(error.error || 'Failed to start class');
    }
  };

  const handleStopClass = async () => {
    if (window.confirm('Are you sure you want to stop this class?')) {
      try {
        const response = await facultyService.stopClass(classId);
        if (response.success) {
          toast.success('Class stopped');
          navigate('/faculty/dashboard');
        }
      } catch (error) {
        toast.error(error.error || 'Failed to stop class');
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
          <h2>Live Class</h2>
        </div>
        <nav className="sidebar-nav">
          <a href="/faculty/dashboard" className="nav-item">
            <span>📊</span> Dashboard
          </a>
          <a href="#" className="nav-item active">
            <span>📹</span> Live Session
          </a>
        </nav>
      </div>

      {/* Main Content */}
      <div className="main-content">
        <div className="row">
          <div className="col-md-5">
            <div className="card">
              <h2 className="mb-3">QR Code Scanner</h2>
              
              {qrData ? (
                <div className="qr-container">
                  <div className="qr-code">
                    <QRCode value={qrData} size={256} />
                  </div>
                  
                  <div className="mt-4">
                    <div className="stat-card">
                      <div className="stat-label">Time Remaining</div>
                      <div className="stat-value" style={{ color: expiryTime < 10 ? '#ef4444' : '#1e293b' }}>
                        {expiryTime}s
                      </div>
                    </div>
                    
                    <div className="stat-card mt-3">
                      <div className="stat-label">Present Students</div>
                      <div className="stat-value">{attendance.length}</div>
                    </div>
                  </div>

                  <button
                    className="btn btn-danger w-full mt-4"
                    onClick={handleStopClass}
                  >
                    Stop Class
                  </button>
                </div>
              ) : (
                <div className="text-center">
                  <p>No active session</p>
                  <button
                    className="btn btn-primary"
                    onClick={handleStartClass}
                  >
                    Start Class
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="col-md-7">
            <div className="card">
              <h2 className="mb-3">Live Attendance ({attendance.length})</h2>
              
              {attendance.length === 0 ? (
                <p className="text-center">No attendance marked yet</p>
              ) : (
                <div className="table-container">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Student ID</th>
                        <th>Name</th>
                        <th>Time</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {attendance.map((record) => (
                        <tr key={record._id}>
                          <td>{record.studentId?.studentId}</td>
                          <td>{record.studentId?.name}</td>
                          <td>{new Date(record.timestamp).toLocaleTimeString()}</td>
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
      </div>
    </div>
  );
};

export default LiveClass;