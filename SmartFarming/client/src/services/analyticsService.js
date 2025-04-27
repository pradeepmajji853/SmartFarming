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

// Get farm productivity analytics
export const getFarmProductivityData = async (timeframe = 'yearly') => {
  try {
    const response = await axios.get(
      `${API_URL}/analytics/productivity?timeframe=${timeframe}`,
      getAuthHeader()
    );
    return response.data;
  } catch (error) {
    throw handleError(error);
  }
};

// Get crop performance analytics
export const getCropPerformanceData = async (cropId, params = {}) => {
  try {
    const response = await axios.get(
      `${API_URL}/analytics/crops/${cropId}`,
      {
        ...getAuthHeader(),
        params
      }
    );
    return response.data;
  } catch (error) {
    throw handleError(error);
  }
};

// Get weather impact analysis
export const getWeatherImpactData = async (startDate, endDate) => {
  try {
    const params = { startDate, endDate };
    const response = await axios.get(
      `${API_URL}/analytics/weather-impact`,
      {
        ...getAuthHeader(),
        params
      }
    );
    return response.data;
  } catch (error) {
    throw handleError(error);
  }
};

// Get pest occurrence analysis
export const getPestAnalysisData = async (year) => {
  try {
    const response = await axios.get(
      `${API_URL}/analytics/pests?year=${year || new Date().getFullYear()}`,
      getAuthHeader()
    );
    return response.data;
  } catch (error) {
    throw handleError(error);
  }
};

// Get farm expense and income analytics
export const getFinancialAnalytics = async (year) => {
  try {
    const response = await axios.get(
      `${API_URL}/analytics/financial?year=${year || new Date().getFullYear()}`,
      getAuthHeader()
    );
    return response.data;
  } catch (error) {
    throw handleError(error);
  }
};

// Submit farm data for better analytics
export const submitFarmData = async (farmData) => {
  try {
    const response = await axios.post(
      `${API_URL}/analytics/farm-data`,
      farmData,
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