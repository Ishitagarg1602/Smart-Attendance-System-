const { validationResult } = require('express-validator');

const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array().map(error => ({
        field: error.param,
        message: error.msg
      }))
    });
  }
  
  next();
};

// Validation rules
const validationRules = {
  register: [
    require('express-validator').body('email').isEmail().normalizeEmail(),
    require('express-validator').body('password')
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters long'),
    require('express-validator').body('name').notEmpty().trim(),
    require('express-validator').body('role')
      .isIn(['student', 'faculty', 'admin'])
      .withMessage('Invalid role'),
    require('express-validator').body('department').notEmpty().trim()
  ],
  
  login: [
    require('express-validator').body('email').isEmail().normalizeEmail(),
    require('express-validator').body('password').notEmpty()
  ],
  
  createClass: [
    require('express-validator').body('subjectName').notEmpty().trim(),
    require('express-validator').body('subjectCode').notEmpty().trim(),
    require('express-validator').body('department').notEmpty().trim(),
    require('express-validator').body('semester').isInt({ min: 1, max: 8 }),
    require('express-validator').body('classLocation.lat').isFloat(),
    require('express-validator').body('classLocation.long').isFloat(),
    require('express-validator').body('classLocation.roomNumber').notEmpty().trim(),
    require('express-validator').body('schedule.days').isArray(),
    require('express-validator').body('schedule.startTime').notEmpty(),
    require('express-validator').body('schedule.endTime').notEmpty()
  ],
  
  markAttendance: [
    require('express-validator').body('token').notEmpty().trim(),
    require('express-validator').body('location.lat').isFloat(),
    require('express-validator').body('location.long').isFloat(),
    require('express-validator').body('deviceInfo').optional().isObject()
  ]
};

module.exports = { validateRequest, validationRules };