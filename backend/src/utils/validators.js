/**
 * Validate email format
 */
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate password strength
 */
const isValidPassword = (password) => {
  // At least 6 characters, one uppercase, one lowercase, one number
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{6,}$/;
  return passwordRegex.test(password);
};

/**
 * Validate latitude
 */
const isValidLatitude = (lat) => {
  return lat >= -90 && lat <= 90;
};

/**
 * Validate longitude
 */
const isValidLongitude = (long) => {
  return long >= -180 && long <= 180;
};

/**
 * Validate student ID format (e.g., S2023001)
 */
const isValidStudentId = (studentId) => {
  const studentIdRegex = /^[A-Z]\d{7}$/;
  return studentIdRegex.test(studentId);
};

/**
 * Validate faculty ID format (e.g., F2023001)
 */
const isValidFacultyId = (facultyId) => {
  const facultyIdRegex = /^[A-Z]\d{7}$/;
  return facultyIdRegex.test(facultyId);
};

/**
 * Validate subject code format (e.g., CSE101)
 */
const isValidSubjectCode = (subjectCode) => {
  const subjectCodeRegex = /^[A-Z]{3}\d{3}$/;
  return subjectCodeRegex.test(subjectCode);
};

module.exports = {
  isValidEmail,
  isValidPassword,
  isValidLatitude,
  isValidLongitude,
  isValidStudentId,
  isValidFacultyId,
  isValidSubjectCode
};