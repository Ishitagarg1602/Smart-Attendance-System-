const express = require('express');
const router = express.Router();
const User = require('../models/User.model');
const Student = require('../models/Student.model');
const Faculty = require('../models/Faculty.model');
const Class = require('../models/Class.model');
const Attendance = require('../models/Attendance.model');
const { authMiddleware, authorizeRoles } = require('../middleware/auth.middleware');
const adminController = require('../controllers/admin.controller');

// All admin routes require authentication and admin role
router.use(authMiddleware, authorizeRoles('admin'));

/**
 * @route POST /api/admin/users
 * @desc Create a new user directly
 * @access Admin
 */
router.post('/users', adminController.createUser);

/**
 * @route DELETE /api/admin/users/:userId
 * @desc Delete a user
 * @access Admin
 */
router.delete('/users/:userId', adminController.deleteUser);

/**
 * @route PUT /api/admin/users/:userId/password
 * @desc Change user password manually by admin
 * @access Admin
 */
router.put('/users/:userId/password', adminController.changePassword);

/**
 * @route GET /api/admin/users
 * @desc Get all users
 * @access Admin
 */
router.get('/users', async (req, res) => {
  try {
    const { role, page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    const query = {};
    if (role) query.role = role;

    const users = await User.find(query)
      .select('-password')
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await User.countDocuments(query);

    res.json({
      success: true,
      data: {
        users,
        pagination: {
          total,
          page: parseInt(page),
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * @route GET /api/admin/users/:userId
 * @desc Get user by ID
 * @access Admin
 */
router.get('/users/:userId', async (req, res) => {
  try {
    const user = await User.findById(req.params.userId).select('-password');
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    let roleData = {};
    if (user.role === 'student') {
      roleData = await Student.findOne({ user: user._id });
    } else if (user.role === 'faculty') {
      roleData = await Faculty.findOne({ user: user._id });
    }

    res.json({
      success: true,
      data: { user, roleData }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * @route PUT /api/admin/users/:userId/toggle-status
 * @desc Activate/deactivate user
 * @access Admin
 */
router.put('/users/:userId/toggle-status', async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    user.isActive = !user.isActive;
    await user.save();

    res.json({
      success: true,
      message: `User ${user.isActive ? 'activated' : 'deactivated'} successfully`,
      data: { isActive: user.isActive }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * @route GET /api/admin/statistics
 * @desc Get system statistics
 * @access Admin
 */
router.get('/statistics', async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalStudents = await User.countDocuments({ role: 'student' });
    const totalFaculty = await User.countDocuments({ role: 'faculty' });
    const totalClasses = await Class.countDocuments();
    const totalAttendance = await Attendance.countDocuments();
    
    // Today's attendance
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayAttendance = await Attendance.countDocuments({
      timestamp: { $gte: today }
    });

    // Active sessions
    const activeSessions = await require('../models/QRSession.model').countDocuments({
      isActive: true,
      expiresAt: { $gt: new Date() }
    });

    // Department wise distribution
    const departmentStats = await User.aggregate([
      { $match: { role: { $in: ['student', 'faculty'] } } },
      { $group: { _id: '$department', count: { $sum: 1 } } }
    ]);

    res.json({
      success: true,
      data: {
        users: {
          total: totalUsers,
          students: totalStudents,
          faculty: totalFaculty
        },
        classes: totalClasses,
        attendance: {
          total: totalAttendance,
          today: todayAttendance
        },
        activeSessions,
        departmentStats
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * @route GET /api/admin/reports/attendance
 * @desc Generate attendance reports
 * @access Admin
 */
router.get('/reports/attendance', async (req, res) => {
  try {
    const { startDate, endDate, department, classId } = req.query;

    const query = {};
    
    if (startDate || endDate) {
      query.timestamp = {};
      if (startDate) query.timestamp.$gte = new Date(startDate);
      if (endDate) query.timestamp.$lte = new Date(endDate);
    }

    if (classId) {
      query.classId = classId;
    }

    const attendance = await Attendance.find(query)
      .populate('studentId', 'studentId rollNumber')
      .populate('classId', 'subjectName subjectCode department')
      .populate('sessionId', 'createdAt')
      .sort({ timestamp: -1 });

    // Filter by department if specified
    let filteredAttendance = attendance;
    if (department) {
      filteredAttendance = attendance.filter(a => 
        a.classId?.department === department
      );
    }

    // Calculate summary
    const summary = {
      total: filteredAttendance.length,
      present: filteredAttendance.filter(a => a.status === 'present').length,
      rejected: filteredAttendance.filter(a => a.status === 'rejected').length,
      byClass: {},
      byDepartment: {}
    };

    filteredAttendance.forEach(a => {
      // By class
      const className = a.classId?.subjectCode || 'Unknown';
      if (!summary.byClass[className]) {
        summary.byClass[className] = 0;
      }
      summary.byClass[className]++;

      // By department
      const dept = a.classId?.department || 'Unknown';
      if (!summary.byDepartment[dept]) {
        summary.byDepartment[dept] = 0;
      }
      summary.byDepartment[dept]++;
    });

    res.json({
      success: true,
      data: {
        attendance: filteredAttendance,
        summary,
        filters: { startDate, endDate, department, classId }
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;