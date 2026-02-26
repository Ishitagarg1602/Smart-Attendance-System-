import api from './api';

class FacultyService {
  async createClass(classData) {
    try {
      const response = await api.post('/faculty/classes', classData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }

  async getClasses() {
    try {
      const response = await api.get('/faculty/classes');
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }

  async startClass(classId) {
    try {
      const response = await api.post(`/faculty/classes/${classId}/start`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }

  async getActiveSession(classId) {
    try {
      const response = await api.get(`/faculty/classes/${classId}/active-session`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }

  async getClassAttendance(classId, params = {}) {
    try {
      const response = await api.get(`/faculty/classes/${classId}/attendance`, { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }

  async stopClass(classId) {
    try {
      const response = await api.post(`/faculty/classes/${classId}/stop`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }

  async getLiveAttendance(sessionId) {
    try {
      const response = await api.get(`/faculty/sessions/${sessionId}/live`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }

  async getDashboardStats() {
    try {
      const response = await api.get('/faculty/dashboard/stats');
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }
}

export default new FacultyService();