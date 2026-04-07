import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import facultyService from '../../services/faculty.service';
import { toast } from 'react-toastify';

const CreateClass = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    subjectName: '',
    subjectCode: '',
    department: '',
    semester: 1,
    classLocation: {
      lat: '',
      long: '',
      roomNumber: ''
    },
    schedule: {
      days: [],
      startTime: '',
      endTime: ''
    }
  });

  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData({
        ...formData,
        [parent]: {
          ...formData[parent],
          [child]: value
        }
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };

  const handleDayToggle = (day) => {
    const updatedDays = formData.schedule.days.includes(day)
      ? formData.schedule.days.filter(d => d !== day)
      : [...formData.schedule.days, day];
    
    setFormData({
      ...formData,
      schedule: {
        ...formData.schedule,
        days: updatedDays
      }
    });
  };

  const handleGetCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setFormData({
            ...formData,
            classLocation: {
              ...formData.classLocation,
              lat: position.coords.latitude,
              long: position.coords.longitude
            }
          });
          toast.success('Location captured successfully!');
        },
        (error) => {
          toast.error('Failed to get location: ' + error.message);
        }
      );
    } else {
      toast.error('Geolocation is not supported by your browser');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validate form
      if (formData.schedule.days.length === 0) {
        toast.error('Please select at least one day');
        setLoading(false);
        return;
      }

      const response = await facultyService.createClass(formData);
      if (response.success) {
        toast.success('Class created successfully!');
        navigate('/faculty/dashboard');
      }
    } catch (error) {
      if (error.errors && error.errors.length > 0) {
        const errorMessages = error.errors.map(e => `${e.field}: ${e.message}`).join('\n');
        toast.error(`Validation Failed:\n${errorMessages}`);
      } else {
        toast.error(error.error || 'Failed to create class');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dashboard">
      {/* Sidebar (same as dashboard) */}
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
          <a href="/faculty/create-class" className="nav-item active">
            <span>➕</span> Create Class
          </a>
        </nav>
      </div>

      {/* Main Content */}
      <div className="main-content">
        <div className="card">
          <h1 className="mb-4">Create New Class</h1>

          <form onSubmit={handleSubmit}>
            <div className="row">
              <div className="col-md-6">
                <h3 className="mb-3">Basic Information</h3>
                
                <div className="form-group">
                  <label className="form-label">Subject Name *</label>
                  <input
                    type="text"
                    name="subjectName"
                    className="form-input"
                    value={formData.subjectName}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Subject Code *</label>
                  <input
                    type="text"
                    name="subjectCode"
                    className="form-input"
                    value={formData.subjectCode}
                    onChange={handleChange}
                    placeholder="e.g., CSE101"
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
              </div>

              <div className="col-md-6">
                <h3 className="mb-3">Location</h3>
                
                <div className="form-group">
                  <label className="form-label">Room Number *</label>
                  <input
                    type="text"
                    name="classLocation.roomNumber"
                    className="form-input"
                    value={formData.classLocation.roomNumber}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="flex gap-2 mb-3">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={handleGetCurrentLocation}
                  >
                    📍 Get Current Location
                  </button>
                </div>

                <div className="form-group">
                  <label className="form-label">Latitude *</label>
                  <input
                    type="number"
                    step="any"
                    name="classLocation.lat"
                    className="form-input"
                    value={formData.classLocation.lat}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Longitude *</label>
                  <input
                    type="number"
                    step="any"
                    name="classLocation.long"
                    className="form-input"
                    value={formData.classLocation.long}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
            </div>

            <div className="mt-4">
              <h3 className="mb-3">Schedule</h3>
              
              <div className="form-group">
                <label className="form-label">Days *</label>
                <div className="flex gap-2 flex-wrap">
                  {daysOfWeek.map(day => (
                    <button
                      key={day}
                      type="button"
                      className={`btn ${formData.schedule.days.includes(day) ? 'btn-primary' : 'btn-secondary'}`}
                      onClick={() => handleDayToggle(day)}
                    >
                      {day}
                    </button>
                  ))}
                </div>
              </div>

              <div className="row">
                <div className="col-md-6">
                  <div className="form-group">
                    <label className="form-label">Start Time *</label>
                    <input
                      type="time"
                      name="schedule.startTime"
                      className="form-input"
                      value={formData.schedule.startTime}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>

                <div className="col-md-6">
                  <div className="form-group">
                    <label className="form-label">End Time *</label>
                    <input
                      type="time"
                      name="schedule.endTime"
                      className="form-input"
                      value={formData.schedule.endTime}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-2 mt-5">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => navigate('/faculty/dashboard')}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading}
              >
                {loading ? 'Creating...' : 'Create Class'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateClass;