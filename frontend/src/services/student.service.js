import api from './api';

class StudentService {
  async markAttendance(attendanceData) {
    try {
      const response = await api.post('/student/attendance/mark', attendanceData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }

  async getAttendanceHistory(params = {}) {
    try {
      const response = await api.get('/student/attendance/history', { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }

  async getEnrolledClasses() {
    try {
      const response = await api.get('/student/classes/enrolled');
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }

  async enrollInClass(classId) {
    try {
      const response = await api.post('/student/classes/enroll', { classId });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }

  async getDashboardStats() {
    try {
      const response = await api.get('/student/dashboard/stats');
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }

  async checkActiveSession(classId) {
    try {
      const response = await api.get(`/student/classes/${classId}/session/current`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }
}

export default new StudentService();