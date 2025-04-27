import axios from 'axios';
import { getAuthToken } from './authService';

// Create axios instance
const api = axios.create({
  baseURL: 'http://localhost:5000/api'
});

// Add request interceptor to include auth token in all requests
api.interceptors.request.use(
  (config) => {
    const token = getAuthToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle common errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle authentication errors
    if (error.response && error.response.status === 401) {
      // If token is expired or invalid, clear local storage
      localStorage.removeItem('user');
      
      // Only redirect if not already on login page to prevent redirect loops
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;