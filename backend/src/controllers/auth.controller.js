const User = require('../models/User.model');
const Student = require('../models/Student.model');
const Faculty = require('../models/Faculty.model');
const { generateToken } = require('../utils/helpers');
const { isValidEmail, isValidPassword } = require('../utils/validators');

/**
 * Register a new user
 */
exports.register = async (req, res) => {
  try {
    const { email, password, name, role, department, studentId, facultyId, rollNumber, designation, semester } = req.body;

    // Validate email and password
    if (!isValidEmail(email)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid email format'
      });
    }

    if (!isValidPassword(password)) {
      return res.status(400).json({
        success: false,
        error: 'Password must be at least 6 characters with one uppercase, one lowercase, and one number'
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: 'User already exists with this email'
      });
    }

    // Create user
    const user = new User({
      email,
      password,
      name,
      role,
      department
    });

    await user.save();

    // Create role-specific document
    if (role === 'student') {
      const student = new Student({
        user: user._id,
        studentId: studentId || `S${Date.now().toString().slice(-7)}`,
        rollNumber: rollNumber || `R${Date.now().toString().slice(-7)}`,
        semester: semester || 1
      });
      await student.save();
    } else if (role === 'faculty') {
      const faculty = new Faculty({
        user: user._id,
        facultyId: facultyId || `F${Date.now().toString().slice(-7)}`,
        designation: designation || 'Professor',
        department
      });
      await faculty.save();
    }

    // Generate token
    const token = generateToken(user._id, user.role);

    // Remove password from response
    const userResponse = user.toObject();
    delete userResponse.password;

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user: userResponse,
        token
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      error: 'Registration failed'
    });
  }
};

/**
 * Login user
 */
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      });
    }

    // Check if account is active
    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        error: 'Account is deactivated'
      });
    }

    // Verify password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      });
    }

    // Generate token
    const token = generateToken(user._id, user.role);

    // Get role-specific data
    let roleData = {};
    if (user.role === 'student') {
      const student = await Student.findOne({ user: user._id });
      roleData = {
        studentId: student?.studentId,
        rollNumber: student?.rollNumber,
        semester: student?.semester
      };
    } else if (user.role === 'faculty') {
      const faculty = await Faculty.findOne({ user: user._id });
      roleData = {
        facultyId: faculty?.facultyId,
        designation: faculty?.designation,
        isHOD: faculty?.isHOD
      };
    }

    // Remove password from response
    const userResponse = user.toObject();
    delete userResponse.password;

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: { ...userResponse, ...roleData },
        token
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      error: 'Login failed'
    });
  }
};

/**
 * Get current user profile
 */
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    // Get role-specific data
    let roleData = {};
    if (user.role === 'student') {
      const student = await Student.findOne({ user: user._id });
      roleData = {
        studentId: student?.studentId,
        rollNumber: student?.rollNumber,
        semester: student?.semester,
        enrolledClasses: student?.enrolledClasses,
        attendanceCount: student?.attendanceCount
      };
    } else if (user.role === 'faculty') {
      const faculty = await Faculty.findOne({ user: user._id });
      roleData = {
        facultyId: faculty?.facultyId,
        designation: faculty?.designation,
        isHOD: faculty?.isHOD,
        createdClasses: faculty?.createdClasses
      };
    }

    res.json({
      success: true,
      data: {
        user: { ...user.toObject(), ...roleData }
      }
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get profile'
    });
  }
};

/**
 * Update user profile
 */
exports.updateProfile = async (req, res) => {
  try {
    const updates = req.body;
    delete updates.password; // Prevent password update through this route
    delete updates.role; // Prevent role change

    const user = await User.findByIdAndUpdate(
      req.user._id,
      updates,
      { new: true, runValidators: true }
    ).select('-password');

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: { user }
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update profile'
    });
  }
};