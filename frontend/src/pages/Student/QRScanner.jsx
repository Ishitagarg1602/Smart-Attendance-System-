import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import QrScanner from 'react-qr-scanner';
import { useAuth } from '../../store/AuthContext';
import studentService from '../../services/student.service';
import { toast } from 'react-toastify';

const QRScanner = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [scanning, setScanning] = useState(true);
  const [location, setLocation] = useState(null);
  const [locationError, setLocationError] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [deviceInfo, setDeviceInfo] = useState({
    platform: navigator.platform,
    userAgent: navigator.userAgent
  });

  useEffect(() => {
    getCurrentLocation();
  }, []);

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            long: position.coords.longitude,
            accuracy: position.coords.accuracy
          });
          setLocationError(null);
        },
        (error) => {
          let errorMessage = 'Failed to get location';
          switch(error.code) {
            case error.PERMISSION_DENIED:
              errorMessage = 'Location permission denied. Please enable location access.';
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage = 'Location information unavailable.';
              break;
            case error.TIMEOUT:
              errorMessage = 'Location request timed out.';
              break;
          }
          setLocationError(errorMessage);
          toast.error(errorMessage);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        }
      );
    } else {
      setLocationError('Geolocation is not supported by your browser');
    }
  };

  const handleScan = async (data) => {
    if (!data || processing) return;

    try {
      // Parse QR data
      const qrData = JSON.parse(data);
      
      // Validate QR data structure
      if (!qrData.token || !qrData.classId || !qrData.expiresAt) {
        toast.error('Invalid QR code format');
        return;
      }

      // Check if QR is expired
      if (new Date(qrData.expiresAt) < new Date()) {
        toast.error('QR code has expired');
        return;
      }

      // Check if location is available
      if (!location) {
        toast.error('Location not available. Please wait...');
        return;
      }

      setProcessing(true);
      setScanning(false);

      // Mark attendance
      const response = await studentService.markAttendance({
        token: qrData.token,
        location: {
          lat: location.lat,
          long: location.long
        },
        deviceInfo
      });

      if (response.success) {
        toast.success(`✅ Attendance marked! Distance: ${response.data.distance}m`);
        setTimeout(() => {
          navigate('/student/history');
        }, 2000);
      }
    } catch (error) {
      console.error('Scan error:', error);
      toast.error(error.error || 'Failed to mark attendance');
      setScanning(true);
    } finally {
      setProcessing(false);
    }
  };

  const handleError = (error) => {
    console.error('Scanner error:', error);
    toast.error('Camera error. Please check permissions.');
  };

  const previewStyle = {
    height: 300,
    width: '100%',
    borderRadius: '12px',
    overflow: 'hidden'
  };

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
          <a href="/student/scan" className="nav-item active">
            <span>📷</span> Scan QR
          </a>
          <a href="/student/history" className="nav-item">
            <span>📝</span> Attendance History
          </a>
        </nav>
      </div>

      {/* Main Content */}
      <div className="main-content">
        <div className="scanner-container">
          <div className="card">
            <h1 className="mb-4">Scan QR Code</h1>

            {/* Location Status */}
            <div className={`alert ${location ? 'alert-success' : 'alert-warning'} mb-4`}>
              <strong>📍 Location:</strong>{' '}
              {location ? (
                <span>Captured! Accuracy: ±{location.accuracy?.toFixed(2)}m</span>
              ) : (
                <span>{locationError || 'Getting your location...'}</span>
              )}
            </div>

            {/* Scanner */}
            {scanning && location && (
              <div className="scanner-video">
                <QrScanner
                  delay={300}
                  style={previewStyle}
                  onError={handleError}
                  onScan={handleScan}
                  facingMode="environment"
                />
                <div className="scan-overlay">
                  <div className="scan-line"></div>
                </div>
              </div>
            )}

            {/* Processing State */}
            {processing && (
              <div className="text-center p-5">
                <div className="spinner mb-3"></div>
                <p>Processing attendance...</p>
              </div>
            )}

            {/* Instructions */}
            <div className="mt-4">
              <h3>Instructions:</h3>
              <ul className="mt-2">
                <li>Make sure you are within 20 meters of the classroom</li>
                <li>Hold your phone steady over the QR code</li>
                <li>QR code expires every 60 seconds</li>
                <li>Location must be enabled for accurate marking</li>
              </ul>
            </div>

            {/* Manual Location Refresh */}
            <button
              className="btn btn-secondary w-full mt-4"
              onClick={getCurrentLocation}
              disabled={processing}
            >
              🔄 Refresh Location
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QRScanner;