import api from './api';
import axios from 'axios';

const AUTH_URL = 'http://localhost:5000/api/auth/';

// Register user
const register = async (userData) => {
  // We use direct axios here since the user isn't authenticated yet
  const response = await axios.post(AUTH_URL + 'register', userData);
  
  if (response.data.success) {
    localStorage.setItem('user', JSON.stringify(response.data.user));
  }
  
  return response.data;
};

// Login user
const login = async (email, password) => {
  // We use direct axios here since the user isn't authenticated yet
  const response = await axios.post(AUTH_URL + 'login', { email, password });
  
  if (response.data.success) {
    localStorage.setItem('user', JSON.stringify(response.data.user));
  }
  
  return response.data;
};

// Logout user
const logout = () => {
  localStorage.removeItem('user');
};

// Get current user
const getCurrentUser = () => {
  try {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  } catch (error) {
    // If there's an error parsing the JSON, remove the corrupted data
    console.error('Error parsing user from localStorage', error);
    localStorage.removeItem('user');
    return null;
  }
};

// Get auth token for API requests
const getAuthToken = () => {
  const user = getCurrentUser();
  return user ? user.token : null;
};

// Update user profile
const updateProfile = async (userData) => {
  // We use our authenticated api instance
  const response = await api.put('/auth/updateprofile', userData);
  
  if (response.data.success) {
    // Update stored user data with new profile information
    const currentUser = getCurrentUser();
    const updatedUser = { ...currentUser, ...response.data.user };
    localStorage.setItem('user', JSON.stringify(updatedUser));
  }
  
  return response.data;
};

const authService = {
  register,
  login,
  logout,
  getCurrentUser,
  updateProfile,
  getAuthToken
};

export default authService;
export { getAuthToken };