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
      console.log('✅ AuthService: Raw response status:', response.status);
      console.log('✅ AuthService: Raw response data:', response.data);
      
      if (!response.data) {
        console.error('❌ AuthService: No data in response');
        throw new Error('No data received from server');
      }
      
      // CRITICAL: Check if server returned success: false
      if (response.data.success === false) {
        console.error('❌ AuthService: Server returned success: false -', response.data.message);
        throw new Error(response.data.message || 'Login failed');
      }
      
      if (!response.data.token || !response.data.user) {
        console.error('❌ AuthService: Missing token or user in response:', response.data);
        throw new Error('Login response missing token or user data');
      }
      
      console.log('✅ AuthService: Login successful, returning data');
      return response.data;
    } catch (error) {
      console.error('❌ AuthService: Login error details:', error);
      
      // If it's our thrown error, re-throw it
      if (error.message && !error.response) {
        throw error;
      }
      
      // If server returned error response
      if (error.response?.data) {
        throw new Error(error.response.data.message || 'Login failed');
      }
      
      throw new Error('Network error or server unavailable');
    }
  },

  register: async (email, password) => {
    const response = await api.post('/auth/register', { email, password });
    return response.data;
  }
};

export default authService;