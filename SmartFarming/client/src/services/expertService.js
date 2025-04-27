import axios from 'axios';
import authService from './authService';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Create axios instance with auth headers
const getAuthHeader = () => {
  const user = authService.getCurrentUser();
  return {
    headers: {
      Authorization: `Bearer ${user ? user.token : ''}`
    }
  };
};

// Get all available experts
export const getAllExperts = async (filters = {}) => {
  try {
    // Build query string from filters
    const queryString = Object.entries(filters)
      .filter(([_, value]) => value !== undefined && value !== '')
      .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
      .join('&');
    
    const url = queryString ? `${API_URL}/expert?${queryString}` : `${API_URL}/expert`;
    const response = await axios.get(url, getAuthHeader());
    return response.data;
  } catch (error) {
    throw handleError(error);
  }
};

// Get expert details by ID
export const getExpertDetails = async (expertId) => {
  try {
    const response = await axios.get(
      `${API_URL}/expert/${expertId}`,
      getAuthHeader()
    );
    return response.data;
  } catch (error) {
    throw handleError(error);
  }
};

// Request consultation with an expert
export const requestConsultation = async (consultationData) => {
  try {
    const response = await axios.post(
      `${API_URL}/expert/consultation`,
      consultationData,
      getAuthHeader()
    );
    return response.data;
  } catch (error) {
    throw handleError(error);
  }
};

// Get all consultations for current user
export const getUserConsultations = async (status = 'all') => {
  try {
    const response = await axios.get(
      `${API_URL}/expert/consultation?status=${status}`,
      getAuthHeader()
    );
    return response.data;
  } catch (error) {
    throw handleError(error);
  }
};

// Get consultation details
export const getConsultationDetails = async (consultationId) => {
  try {
    const response = await axios.get(
      `${API_URL}/expert/consultation/${consultationId}`,
      getAuthHeader()
    );
    return response.data;
  } catch (error) {
    throw handleError(error);
  }
};

// Update consultation status (for experts)
export const updateConsultationStatus = async (consultationId, status) => {
  try {
    const response = await axios.put(
      `${API_URL}/expert/consultation/${consultationId}/status`,
      { status },
      getAuthHeader()
    );
    return response.data;
  } catch (error) {
    throw handleError(error);
  }
};

// Send message in consultation
export const sendConsultationMessage = async (consultationId, message) => {
  try {
    const response = await axios.post(
      `${API_URL}/expert/consultation/${consultationId}/message`,
      { message },
      getAuthHeader()
    );
    return response.data;
  } catch (error) {
    throw handleError(error);
  }
};

// Rate and review consultation
export const rateConsultation = async (consultationId, rating, review) => {
  try {
    const response = await axios.post(
      `${API_URL}/expert/consultation/${consultationId}/review`,
      { rating, review },
      getAuthHeader()
    );
    return response.data;
  } catch (error) {
    throw handleError(error);
  }
};

// Handle errors consistently
const handleError = (error) => {
  if (error.response) {
    // The request was made and the server responded with a status code
    // that falls out of the range of 2xx
    return new Error(error.response.data.message || 'Server error');
  } else if (error.request) {
    // The request was made but no response was received
    return new Error('No response from server. Please check your internet connection.');
  } else {
    // Something happened in setting up the request that triggered an Error
    return new Error('Error setting up request: ' + error.message);
  }
};