const express = require('express');
const router = express.Router();
const facultyController = require('../controllers/faculty.controller');
const { authMiddleware, authorizeRoles } = require('../middleware/auth.middleware');
const { validateRequest, validationRules } = require('../middleware/validation.middleware');

// All faculty routes require authentication and faculty role
router.use(authMiddleware, authorizeRoles('faculty', 'admin'));

/**
 * @route POST /api/faculty/classes
 * @desc Create a new class
 * @access Faculty/Admin
 */
router.post(
  '/classes',
  validationRules.createClass,
  validateRequest,
  facultyController.createClass
);

/**
 * @route GET /api/faculty/classes
 * @desc Get all classes by faculty
 * @access Faculty/Admin
 */
router.get('/classes', facultyController.getClasses);

/**
 * @route POST /api/faculty/classes/:classId/start
 * @desc Start a class (generate QR session)
 * @access Faculty/Admin
 */
router.post('/classes/:classId/start', facultyController.startClass);

/**
 * @route GET /api/faculty/classes/:classId/active-session
 * @desc Get active QR session for a class
 * @access Faculty/Admin
 */
router.get('/classes/:classId/active-session', facultyController.getActiveSession);

/**
 * @route GET /api/faculty/classes/:classId/attendance
 * @desc Get attendance records for a class
 * @access Faculty/Admin
 */
router.get('/classes/:classId/attendance', facultyController.getClassAttendance);

/**
 * @route POST /api/faculty/classes/:classId/stop
 * @desc Stop a class (deactivate QR session)
 * @access Faculty/Admin
 */
router.post('/classes/:classId/stop', facultyController.stopClass);

/**
 * @route GET /api/faculty/sessions/:sessionId/live
 * @desc Get real-time attendance for active session
 * @access Faculty/Admin
 */
router.get('/sessions/:sessionId/live', facultyController.getLiveAttendance);

/**
 * @route GET /api/faculty/dashboard/stats
 * @desc Get faculty dashboard statistics
 * @access Faculty/Admin
 */
router.get('/dashboard/stats', async (req, res) => {
  try {
    const Faculty = require('../models/Faculty.model');
    const Class = require('../models/Class.model');
    const Attendance = require('../models/Attendance.model');

    const faculty = await Faculty.findOne({ user: req.user._id });
    
    const totalClasses = await Class.countDocuments({ faculty: faculty._id });
    const activeClasses = await Class.countDocuments({ 
      faculty: faculty._id,
      isActive: true 
    });
    const totalAttendance = await Attendance.countDocuments();
    
    // Get today's attendance
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayAttendance = await Attendance.countDocuments({
      timestamp: { $gte: today }
    });

    res.json({
      success: true,
      data: {
        totalClasses,
        activeClasses,
        totalAttendance,
        todayAttendance
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;