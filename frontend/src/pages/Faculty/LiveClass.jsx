import React, { useState, useEffect, useRef } from 'react';
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
  
  // Use refs to prevent multiple intervals
  const timerRef = useRef(null);

  // Poll for attendance updates
  useEffect(() => {
    loadClassData();
    const interval = setInterval(loadClassData, 5000);
    return () => clearInterval(interval);
  }, [classId]);

  // QR Expiry timer manager
  useEffect(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    if (session) {
      setQrData(JSON.stringify({
        token: session.token,
        classId: session.classId,
        expiresAt: session.expiresAt
      }));

      const now = new Date().getTime();
      let expiryTimestamp = new Date(session.expiresAt).getTime();
      
      const initialSeconds = Math.max(0, Math.floor((expiryTimestamp - now) / 1000));
      setExpiryTime(Math.min(initialSeconds, 60)); // Cap at 60 seconds

      timerRef.current = setInterval(() => {
        const currentNow = new Date().getTime();
        const secondsLeft = Math.max(0, Math.floor((expiryTimestamp - currentNow) / 1000));
        
        setExpiryTime(secondsLeft);

        // Check 5-minute absolute timeout
        const startTimeStr = localStorage.getItem('classStartTime-' + classId);
        const startTime = startTimeStr ? parseInt(startTimeStr) : currentNow;
        const totalElapsedSeconds = Math.floor((currentNow - startTime) / 1000);

        if (totalElapsedSeconds >= 300) { // 5 minutes
          clearInterval(timerRef.current);
          timerRef.current = null;
          toast.info('5 minutes have elapsed! Auto-stopping the class.');
          handleStopClass(true);
          return;
        }

        if (secondsLeft <= 0) {
          clearInterval(timerRef.current);
          timerRef.current = null;
          // Auto-renew the QR code session!
          startSession(true);
        }
      }, 1000);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [session]);

  const loadClassData = async () => {
    try {
      // 1. Get entire attendance for today so it doesn't reset every 60s
      const today = new Date().toISOString().split('T')[0];
      const attendanceRes = await facultyService.getClassAttendance(classId, { date: today });
      if (attendanceRes.success) {
        setAttendance(attendanceRes.data.attendance || []);
      }

      // 2. Fetch the active QR session (if any)
      const response = await facultyService.getActiveSession(classId);
      if (response.success && response.data.session) {
        // Prevent unnecessary state updates if it's the exact same session
        setSession((prev) => {
          if (!prev || prev._id !== response.data.session._id) {
            return response.data.session;
          }
          return prev;
        });
      } else {
        setSession(null);
      }
    } catch (error) {
      // Ignore 404s when there is simply no active session
      if (error && error.error !== 'No active session found') {
        console.error('Failed to load class data:', error);
      }
    } finally {
      setLoading(false);
    }
  };

  const startSession = async (silent = false) => {
    try {
      const response = await facultyService.startClass(classId);
      if (response.success) {
        setSession(response.data.session);
        if (!silent) {
          localStorage.setItem('classStartTime-' + classId, Date.now());
          toast.success('Class started! QR code is now active.');
        }
      }
    } catch (error) {
      if (!silent) toast.error(error.error || 'Failed to start class');
    }
  };

  const handleStartClass = () => startSession(false);

  const handleStopClass = async (autoStop = false) => {
    if (autoStop === true || window.confirm('Are you sure you want to stop this class?')) {
      try {
        const response = await facultyService.stopClass(classId);
        if (response.success) {
          if (autoStop !== true) toast.success('Class stopped');
          localStorage.removeItem('classStartTime-' + classId);
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

      <div className="main-content">
        <div className="row">
          <div className="col-md-5">
            <div className="card">
              <h2 className="mb-3">QR Code Scanner</h2>
              
              {session ? (
                <div className="qr-container">
                  <div className="qr-code">
                    {qrData && <QRCode value={qrData} size={256} />}
                  </div>
                  
                  <div className="mt-4">
                    <div className="stat-card">
                      <div className="stat-label">Token Refreshes In</div>
                      <div className="stat-value" style={{ 
                        color: expiryTime < 10 ? '#ef4444' : '#1e293b',
                        fontSize: '2.5rem'
                      }}>
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