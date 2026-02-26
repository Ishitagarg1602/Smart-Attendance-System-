import api from './api';

class AdminService {
  async getUsers(params = {}) {
    try {
      const response = await api.get('/admin/users', { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }

  async getUserById(userId) {
    try {
      const response = await api.get(`/admin/users/${userId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }

  async toggleUserStatus(userId) {
    try {
      const response = await api.put(`/admin/users/${userId}/toggle-status`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }

  async deleteUser(userId) {
    try {
      const response = await api.delete(`/admin/users/${userId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }

  async createUser(userData) {
    try {
      const response = await api.post('/admin/users', userData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }

  async updateUser(userId, userData) {
    try {
      const response = await api.put(`/admin/users/${userId}`, userData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }

  async getStatistics() {
    try {
      const response = await api.get('/admin/statistics');
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }

  async getAttendanceReport(params = {}) {
    try {
      const response = await api.get('/admin/reports/attendance', { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }

  async getAllClasses(params = {}) {
    try {
      const response = await api.get('/admin/classes', { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }

  async createClass(classData) {
    try {
      const response = await api.post('/admin/classes', classData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }

  async updateClass(classId, classData) {
    try {
      const response = await api.put(`/admin/classes/${classId}`, classData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }

  async deleteClass(classId) {
    try {
      const response = await api.delete(`/admin/classes/${classId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }

  async getSystemLogs(params = {}) {
    try {
      const response = await api.get('/admin/logs', { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }

  async getBackupStatus() {
    try {
      const response = await api.get('/admin/backup/status');
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }

  async createBackup() {
    try {
      const response = await api.post('/admin/backup/create');
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }
}

export default new AdminService();