import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: API_URL,
});

const authService = {
  setAuthToken: (token) => {
    if (token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
  },

  removeAuthToken: () => {
    delete api.defaults.headers.common['Authorization'];
  },

  login: async (email, password) => {
    try {
      console.log('🔍 AuthService: Attempting login for', email);
      const response = await api.post('/auth/login', { email, password });
      console.log('✅ AuthService: Login response', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ AuthService: Login error', error.response?.data || error.message);
      throw error;
    }
  },

  register: async (email, password) => {
    const response = await api.post('/auth/register', { email, password });
    return response.data;
  }
};

export default authService;