import axios from 'axios';
import aiService from './aiService';
import api from './api';

const API_URL = 'http://localhost:5000/api';

// Get current weather for a location through our server API
export const getCurrentWeather = async (location) => {
  try {
    const response = await api.get(`${API_URL}/weather/current/${encodeURIComponent(location)}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Could not fetch current weather' };
  }
};

// Get weather forecast for a location through our server API
export const getWeatherForecast = async (location, days = 5) => {
  try {
    const response = await api.get(`${API_URL}/weather/forecast/${encodeURIComponent(location)}/${days}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Could not fetch weather forecast' };
  }
};

// Get farming advice based on weather using Gemini AI
export const getFarmingAdvice = async (location, crop) => {
  try {
    // Get farming advice through our server API
    const response = await api.get(`${API_URL}/weather/advice/${encodeURIComponent(location)}/${encodeURIComponent(crop)}`);
    
    // Format the response for the frontend
    const advice = response.data;
    
    return {
      success: true,
      location: location,
      crop: crop,
      weatherSummary: advice.current.condition,
      temperature: advice.current.temperature,
      advice: {
        irrigation: advice.advice.irrigation || "No specific irrigation advice available.",
        pestControl: advice.advice.pestControl || "No specific pest control advice available.",
        fieldWork: advice.advice.fieldWork || "No specific field work advice available.",
        generalAdvice: advice.advice.generalAdvice || "No specific general advice available."
      }
    };
  } catch (error) {
    console.error('Error generating farming advice:', error);
    throw { message: 'Could not generate farming advice', error: error.response?.data?.message || error.message };
  }
};