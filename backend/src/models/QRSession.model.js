const mongoose = require('mongoose');
const crypto = require('crypto');

const qrSessionSchema = new mongoose.Schema({
  classId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Class',
    required: true
  },
  facultyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Faculty',
    required: true
  },
  token: {
    type: String,
    required: true,
    unique: true,
    default: () => crypto.randomBytes(32).toString('hex')
  },
  expiresAt: {
    type: Date,
    required: true,
    index: { expires: 0 } // TTL index for auto-deletion
  },
  isActive: {
    type: Boolean,
    default: true
  },
  attendanceMarked: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student'
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Check if session is expired
qrSessionSchema.methods.isExpired = function() {
  return this.expiresAt < new Date();
};

// Check if student has already marked attendance
qrSessionSchema.methods.hasMarkedAttendance = function(studentId) {
  return this.attendanceMarked.includes(studentId);
};

module.exports = mongoose.model('QRSession', qrSessionSchema);