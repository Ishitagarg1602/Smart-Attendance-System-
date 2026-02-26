import api from './api';

class AuthService {
  async login(email, password) {
    try {
      const response = await api.post('/auth/login', { email, password });
      if (response.data.success) {
        localStorage.setItem('token', response.data.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.data.user));
      }
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }

  async register(userData) {
    try {
      const response = await api.post('/auth/register', userData);
      if (response.data.success) {
        localStorage.setItem('token', response.data.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.data.user));
      }
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }

  async getProfile() {
    try {
      const response = await api.get('/auth/profile');
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }

  async updateProfile(profileData) {
    try {
      const response = await api.put('/auth/profile', profileData);
      if (response.data.success) {
        const user = JSON.parse(localStorage.getItem('user'));
        localStorage.setItem('user', JSON.stringify({ ...user, ...response.data.data.user }));
      }
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }

  getCurrentUser() {
    return JSON.parse(localStorage.getItem('user'));
  }

  isAuthenticated() {
    return !!localStorage.getItem('token');
  }

  getUserRole() {
    const user = this.getCurrentUser();
    return user?.role || null;
  }
}

export default new AuthService();