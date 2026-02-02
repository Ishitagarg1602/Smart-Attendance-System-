const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
  sessionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'QRSession',
    required: true
  },
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true
  },
  classId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Class',
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now,
    required: true
  },
  location: {
    lat: {
      type: Number,
      required: true
    },
    long: {
      type: Number,
      required: true
    },
    accuracy: {
      type: Number,
      default: 0
    }
  },
  status: {
    type: String,
    enum: ['present', 'late', 'absent', 'rejected'],
    default: 'present',
    required: true
  },
  rejectionReason: {
    type: String,
    trim: true
  },
  deviceInfo: {
    deviceId: String,
    platform: String,
    appVersion: String
  },
  distanceFromClass: {
    type: Number,
    required: true
  }
});

// Compound index for preventing duplicate attendance
attendanceSchema.index({ sessionId: 1, studentId: 1 }, { unique: true });

// Index for faster queries
attendanceSchema.index({ studentId: 1, classId: 1, timestamp: -1 });

module.exports = mongoose.model('Attendance', attendanceSchema);