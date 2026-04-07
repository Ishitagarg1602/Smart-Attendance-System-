const Class = require('../models/Class.model');
const QRSession = require('../models/QRSession.model');
const Attendance = require('../models/Attendance.model');
const Faculty = require('../models/Faculty.model');
const Student = require('../models/Student.model');
const { generateRandomToken, getExpiryTime } = require('../utils/helpers');
const { checkLocationWithinRadius } = require('../utils/haversine');

/**
 * Create a new class
 */
exports.createClass = async (req, res) => {
  try {
    // Find faculty
    const faculty = await Faculty.findOne({ user: req.user._id });
    if (!faculty) {
      return res.status(404).json({
        success: false,
        error: 'Faculty profile not found'
      });
    }

    const classData = {
      ...req.body,
      faculty: faculty._id
    };

    const newClass = new Class(classData);
    await newClass.save();

    // Add class to faculty's createdClasses
    faculty.createdClasses.push(newClass._id);
    await faculty.save();

    res.status(201).json({
      success: true,
      message: 'Class created successfully',
      data: { class: newClass }
    });
  } catch (error) {
    console.error('Create class error:', error);
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        error: 'A class with this Subject Code already exists.'
      });
    }
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to create class'
    });
  }
};

/**
 * Get all classes by faculty
 */
exports.getClasses = async (req, res) => {
  try {
    // Find faculty
    const faculty = await Faculty.findOne({ user: req.user._id });
    if (!faculty) {
      return res.status(404).json({
        success: false,
        error: 'Faculty profile not found'
      });
    }

    const classes = await Class.find({ faculty: faculty._id })
      .populate('studentsEnrolled', 'studentId rollNumber name')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: { classes }
    });
  } catch (error) {
    console.error('Get classes error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get classes'
    });
  }
};

/**
 * Start a class (generate QR session)
 */
exports.startClass = async (req, res) => {
  try {
    const { classId } = req.params;
    
    // Find faculty
    const faculty = await Faculty.findOne({ user: req.user._id });
    if (!faculty) {
      return res.status(404).json({
        success: false,
        error: 'Faculty profile not found'
      });
    }

    // Find class
    const classData = await Class.findById(classId);
    if (!classData) {
      return res.status(404).json({
        success: false,
        error: 'Class not found'
      });
    }

    // Check if faculty owns this class
    if (classData.faculty.toString() !== faculty._id.toString()) {
      return res.status(403).json({
        success: false,
        error: 'You are not authorized to start this class'
      });
    }

    // Check if there's an active session
    const existingSession = await QRSession.findOne({
      classId,
      isActive: true,
      expiresAt: { $gt: new Date() }
    });

    if (existingSession) {
      // Calculate remaining seconds correctly
      const now = new Date();
      const expiry = new Date(existingSession.expiresAt);
      const remainingSeconds = Math.max(0, Math.floor((expiry - now) / 1000));
      
      return res.json({
        success: true,
        message: 'Active session already exists',
        data: {
          session: {
            ...existingSession.toObject(),
            expiresAt: existingSession.expiresAt // Send as Date object
          },
          expiresIn: remainingSeconds
        }
      });
    }

    // Create new QR session - FIXED EXPIRY
    const expirySeconds = parseInt(process.env.QR_EXPIRY_TIME) || 60;
    const expiresAt = new Date(Date.now() + expirySeconds * 1000);
    
    const session = new QRSession({
      classId,
      facultyId: faculty._id,
      expiresAt: expiresAt,
      createdAt: new Date()
    });

    await session.save();

    // Calculate initial seconds
    const now = new Date();
    const remainingSeconds = Math.max(0, Math.floor((expiresAt - now) / 1000));

    res.status(201).json({
      success: true,
      message: 'Class started successfully',
      data: {
        session: {
          ...session.toObject(),
          expiresAt: expiresAt // Send as Date object
        },
        expiresIn: remainingSeconds
      }
    });
  } catch (error) {
    console.error('Start class error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to start class'
    });
  }
};

/**
 * Get active QR session for a class
 */
exports.getActiveSession = async (req, res) => {
  try {
    const { classId } = req.params;

    // Find faculty
    const faculty = await Faculty.findOne({ user: req.user._id });
    if (!faculty) {
      return res.status(404).json({
        success: false,
        error: 'Faculty profile not found'
      });
    }

    // Find active session
    const session = await QRSession.findOne({
      classId,
      facultyId: faculty._id,
      isActive: true,
      expiresAt: { $gt: new Date() }
    });

    if (!session) {
      return res.status(404).json({
        success: false,
        error: 'No active session found'
      });
    }

    res.json({
      success: true,
      data: {
        session,
        expiresIn: Math.floor((session.expiresAt - new Date()) / 1000)
      }
    });
  } catch (error) {
    console.error('Get active session error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get active session'
    });
  }
};

/**
 * Get attendance records for a class
 */
exports.getClassAttendance = async (req, res) => {
  try {
    const { classId } = req.params;
    const { date, studentId } = req.query;

    // Find faculty
    const faculty = await Faculty.findOne({ user: req.user._id });
    if (!faculty) {
      return res.status(404).json({
        success: false,
        error: 'Faculty profile not found'
      });
    }

    // Build query
    const query = { classId };
    
    if (date) {
      const startDate = new Date(date);
      startDate.setHours(0, 0, 0, 0);
      const endDate = new Date(date);
      endDate.setHours(23, 59, 59, 999);
      query.timestamp = { $gte: startDate, $lte: endDate };
    }

    if (studentId) {
      const student = await Student.findOne({ studentId });
      if (student) {
        query.studentId = student._id;
      }
    }

    const attendance = await Attendance.find(query)
      .populate('studentId', 'studentId rollNumber name')
      .populate('sessionId', 'token expiresAt createdAt')
      .sort({ timestamp: -1 });

    // Get class details
    const classData = await Class.findById(classId)
      .populate('studentsEnrolled', 'studentId rollNumber name');

    res.json({
      success: true,
      data: {
        class: classData,
        attendance,
        totalRecords: attendance.length
      }
    });
  } catch (error) {
    console.error('Get class attendance error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get attendance records'
    });
  }
};

/**
 * Stop a class (deactivate QR session)
 */
exports.stopClass = async (req, res) => {
  try {
    const { classId } = req.params;

    // Find faculty
    const faculty = await Faculty.findOne({ user: req.user._id });
    if (!faculty) {
      return res.status(404).json({
        success: false,
        error: 'Faculty profile not found'
      });
    }

    // Deactivate all active sessions for this class
    const result = await QRSession.updateMany(
      {
        classId,
        facultyId: faculty._id,
        isActive: true
      },
      {
        $set: { isActive: false }
      }
    );

    res.json({
      success: true,
      message: 'Class stopped successfully',
      data: { modifiedCount: result.modifiedCount }
    });
  } catch (error) {
    console.error('Stop class error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to stop class'
    });
  }
};

/**
 * Get real-time attendance for active session
 */
exports.getLiveAttendance = async (req, res) => {
  try {
    const { sessionId } = req.params;

    const session = await QRSession.findById(sessionId)
      .populate('attendanceMarked', 'studentId rollNumber name');

    if (!session) {
      return res.status(404).json({
        success: false,
        error: 'Session not found'
      });
    }

    // Get detailed attendance records
    const attendanceDetails = await Attendance.find({ sessionId })
      .populate('studentId', 'studentId rollNumber name')
      .sort({ timestamp: -1 });

    res.json({
      success: true,
      data: {
        session,
        attendance: attendanceDetails,
        totalPresent: attendanceDetails.length
      }
    });
  } catch (error) {
    console.error('Get live attendance error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get live attendance'
    });
  }
};