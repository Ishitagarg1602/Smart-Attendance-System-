const Student = require('../models/Student.model');
const Class = require('../models/Class.model');
const QRSession = require('../models/QRSession.model');
const Attendance = require('../models/Attendance.model');
const { checkLocationWithinRadius } = require('../utils/haversine');

/**
 * Mark attendance
 */
exports.markAttendance = async (req, res) => {
  try {
    const { token, location, deviceInfo } = req.body;
    const studentId = req.user._id;

    // Find student
    const student = await Student.findOne({ user: studentId });
    if (!student) {
      return res.status(404).json({
        success: false,
        error: 'Student profile not found'
      });
    }

    // Find active QR session with the token
    const session = await QRSession.findOne({
      token,
      isActive: true,
      expiresAt: { $gt: new Date() }
    }).populate('classId');

    if (!session) {
      return res.status(400).json({
        success: false,
        error: 'Invalid or expired QR code'
      });
    }

    // Check if student has already marked attendance for this session
    if (session.hasMarkedAttendance(student._id)) {
      return res.status(400).json({
        success: false,
        error: 'Attendance already marked for this session'
      });
    }

    // Check if student is enrolled in the class
    const classData = await Class.findById(session.classId._id);
    if (!classData.studentsEnrolled.includes(student._id)) {
      return res.status(403).json({
        success: false,
        error: 'You are not enrolled in this class'
      });
    }

    // GPS validation
    const classLocation = classData.classLocation;
    const locationCheck = checkLocationWithinRadius(
      { lat: classLocation.lat, long: classLocation.long },
      location,
      process.env.ALLOWED_GPS_RADIUS || 20
    );

    if (!locationCheck.isWithinRadius) {
      // Still create attendance record but mark as rejected
      const attendance = new Attendance({
        sessionId: session._id,
        studentId: student._id,
        classId: session.classId._id,
        location,
        status: 'rejected',
        rejectionReason: `Location out of range. Distance: ${locationCheck.distance}m`,
        distanceFromClass: locationCheck.distance
      });

      await attendance.save();

      return res.status(400).json({
        success: false,
        error: `You are ${locationCheck.distance}m away from class. Maximum allowed: ${process.env.ALLOWED_GPS_RADIUS || 20}m`
      });
    }

    // Mark attendance
    const attendance = new Attendance({
      sessionId: session._id,
      studentId: student._id,
      classId: session.classId._id,
      location,
      status: 'present',
      distanceFromClass: locationCheck.distance,
      deviceInfo
    });

    await attendance.save();

    // Add student to session's attendanceMarked array
    session.attendanceMarked.push(student._id);
    await session.save();

    // Update student's attendance count
    student.attendanceCount += 1;
    await student.save();

    res.json({
      success: true,
      message: 'Attendance marked successfully',
      data: {
        attendance,
        distance: locationCheck.distance
      }
    });
  } catch (error) {
    console.error('Mark attendance error:', error);
    if (error.code === 11000) { // Duplicate key error
      return res.status(400).json({
        success: false,
        error: 'Attendance already marked for this session'
      });
    }
    res.status(500).json({
      success: false,
      error: 'Failed to mark attendance'
    });
  }
};

/**
 * Get student's attendance history
 */
exports.getAttendanceHistory = async (req, res) => {
  try {
    const student = await Student.findOne({ user: req.user._id });
    if (!student) {
      return res.status(404).json({
        success: false,
        error: 'Student profile not found'
      });
    }

    const { classId, startDate, endDate, limit = 50 } = req.query;

    // Build query
    const query = { studentId: student._id };
    
    if (classId) {
      query.classId = classId;
    }

    if (startDate || endDate) {
      query.timestamp = {};
      if (startDate) {
        query.timestamp.$gte = new Date(startDate);
      }
      if (endDate) {
        query.timestamp.$lte = new Date(endDate);
      }
    }

    const attendance = await Attendance.find(query)
      .populate('classId', 'subjectName subjectCode department')
      .populate('sessionId', 'createdAt expiresAt')
      .sort({ timestamp: -1 })
      .limit(parseInt(limit));

    // Get statistics
    const totalAttendance = await Attendance.countDocuments({ studentId: student._id });
    const presentCount = await Attendance.countDocuments({ 
      studentId: student._id, 
      status: 'present' 
    });
    const attendancePercentage = totalAttendance > 0 
      ? ((presentCount / totalAttendance) * 100).toFixed(2) 
      : 0;

    res.json({
      success: true,
      data: {
        attendance,
        statistics: {
          totalAttendance,
          presentCount,
          attendancePercentage,
          rejectedCount: totalAttendance - presentCount
        },
        student: {
          studentId: student.studentId,
          rollNumber: student.rollNumber,
          semester: student.semester
        }
      }
    });
  } catch (error) {
    console.error('Get attendance history error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get attendance history'
    });
  }
};

/**
 * Get enrolled classes
 */
exports.getEnrolledClasses = async (req, res) => {
  try {
    const student = await Student.findOne({ user: req.user._id })
      .populate({
        path: 'enrolledClasses',
        populate: {
          path: 'faculty',
          populate: { path: 'user', select: 'name email' }
        }
      });

    if (!student) {
      return res.status(404).json({
        success: false,
        error: 'Student profile not found'
      });
    }

    res.json({
      success: true,
      data: {
        classes: student.enrolledClasses,
        totalClasses: student.enrolledClasses.length
      }
    });
  } catch (error) {
    console.error('Get enrolled classes error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get enrolled classes'
    });
  }
};

/**
 * Enroll in a class
 */
exports.enrollInClass = async (req, res) => {
  try {
    const { classId } = req.body;
    
    const student = await Student.findOne({ user: req.user._id });
    if (!student) {
      return res.status(404).json({
        success: false,
        error: 'Student profile not found'
      });
    }

    const classData = await Class.findById(classId);
    if (!classData) {
      return res.status(404).json({
        success: false,
        error: 'Class not found'
      });
    }

    // Check if already enrolled
    if (student.enrolledClasses.includes(classId)) {
      return res.status(400).json({
        success: false,
        error: 'Already enrolled in this class'
      });
    }

    // Add student to class
    classData.studentsEnrolled.push(student._id);
    await classData.save();

    // Add class to student
    student.enrolledClasses.push(classId);
    await student.save();

    res.json({
      success: true,
      message: 'Successfully enrolled in class',
      data: { class: classData }
    });
  } catch (error) {
    console.error('Enroll in class error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to enroll in class'
    });
  }
};