const express = require('express');
const router = express.Router();
const studentController = require('../controllers/student.controller');
const { authMiddleware, authorizeRoles } = require('../middleware/auth.middleware');
const { validateRequest, validationRules } = require('../middleware/validation.middleware');

// All student routes require authentication and student role
router.use(authMiddleware, authorizeRoles('student'));

/**
 * @route POST /api/student/attendance/mark
 * @desc Mark attendance
 * @access Student
 */
router.post(
  '/attendance/mark',
  validationRules.markAttendance,
  validateRequest,
  studentController.markAttendance
);

/**
 * @route GET /api/student/attendance/history
 * @desc Get student's attendance history
 * @access Student
 */
router.get('/attendance/history', studentController.getAttendanceHistory);

/**
 * @route GET /api/student/classes/enrolled
 * @desc Get enrolled classes
 * @access Student
 */
router.get('/classes/enrolled', studentController.getEnrolledClasses);

/**
 * @route POST /api/student/classes/enroll
 * @desc Enroll in a class
 * @access Student
 */
router.post('/classes/enroll', studentController.enrollInClass);

/**
 * @route GET /api/student/dashboard/stats
 * @desc Get student dashboard statistics
 * @access Student
 */
router.get('/dashboard/stats', async (req, res) => {
  try {
    const Student = require('../models/Student.model');
    const Attendance = require('../models/Attendance.model');

    const student = await Student.findOne({ user: req.user._id });
    
    // Get attendance statistics
    const totalAttendance = await Attendance.countDocuments({ studentId: student._id });
    const presentCount = await Attendance.countDocuments({ 
      studentId: student._id,
      status: 'present' 
    });
    const attendancePercentage = totalAttendance > 0 
      ? ((presentCount / totalAttendance) * 100).toFixed(2) 
      : 0;

    // Get this week's attendance
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());
    weekStart.setHours(0, 0, 0, 0);
    
    const weekAttendance = await Attendance.countDocuments({
      studentId: student._id,
      timestamp: { $gte: weekStart }
    });

    res.json({
      success: true,
      data: {
        totalAttendance,
        presentCount,
        attendancePercentage,
        weekAttendance,
        enrolledClasses: student.enrolledClasses.length
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * @route GET /api/student/classes/:classId/session/current
 * @desc Check if there's an active session for a class
 * @access Student
 */
router.get('/classes/:classId/session/current', async (req, res) => {
  try {
    const QRSession = require('../models/QRSession.model');
    
    const session = await QRSession.findOne({
      classId: req.params.classId,
      isActive: true,
      expiresAt: { $gt: new Date() }
    });

    res.json({
      success: true,
      data: {
        hasActiveSession: !!session,
        session: session || null
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;