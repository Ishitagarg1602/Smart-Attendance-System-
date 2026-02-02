const jwt = require('jsonwebtoken');
const qrcode = require('qrcode');

/**
 * Generate JWT token
 */
const generateToken = (userId, role) => {
  return jwt.sign(
    { userId, role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE || '7d' }
  );
};

/**
 * Generate QR code from data
 */
const generateQRCode = async (data) => {
  try {
    return await qrcode.toDataURL(JSON.stringify(data));
  } catch (error) {
    throw new Error('Failed to generate QR code');
  }
};

/**
 * Generate random token for QR session
 */
const generateRandomToken = (length = 32) => {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
};

/**
 * Calculate expiry time
 */
const getExpiryTime = (minutes = 1) => {
  const now = new Date();
  now.setMinutes(now.getMinutes() + minutes);
  return now;
};

/**
 * Format response
 */
const formatResponse = (success, data = null, message = '', error = null) => {
  return {
    success,
    data,
    message,
    error,
    timestamp: new Date().toISOString()
  };
};

module.exports = {
  generateToken,
  generateQRCode,
  generateRandomToken,
  getExpiryTime,
  formatResponse
};