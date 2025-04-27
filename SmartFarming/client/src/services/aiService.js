import api from './api';

const GEMINI_API_KEY = 'AIzaSyD_RTZuh-ygB1FbOuu14i5LQcz-8w3MmRY';
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

/**
 * Generate AI content using Google's Gemini API
 * 
 * @param {string} prompt - The text prompt to send to Gemini
 * @returns {Promise} - Promise containing the AI response
 */
export const generateContent = async (prompt) => {
  try {
    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: prompt }]
        }]
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || 'Failed to generate content');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error generating AI content:', error);
    throw error;
  }
};

/**
 * Generate farming advice based on crop type and conditions
 * 
 * @param {string} cropType - The type of crop
 * @param {object} conditions - Weather and soil conditions
 * @returns {Promise} - Promise containing farming advice
 */
export const generateFarmingAdvice = async (cropType, conditions) => {
  const prompt = `As a farming expert, give me specific advice for growing ${cropType} with the following conditions: 
    Temperature: ${conditions.temperature}°C, 
    Humidity: ${conditions.humidity}%, 
    Soil type: ${conditions.soilType}, 
    Recent rainfall: ${conditions.rainfall}mm.
    Please include advice on irrigation, pest prevention, and optimal fertilization.`;
  
  return generateContent(prompt);
};

/**
 * Generate pest control recommendations
 * 
 * @param {string} pestType - The type of pest
 * @param {string} cropType - The affected crop
 * @returns {Promise} - Promise containing pest control recommendations
 */
export const generatePestControlRecommendations = async (pestType, cropType) => {
  const prompt = `Recommend organic and chemical methods to control ${pestType} affecting ${cropType} crops. 
    Include application methods, precautions, and effectiveness.`;
  
  return generateContent(prompt);
};

/**
 * Generate market price predictions
 * 
 * @param {string} cropType - The type of crop
 * @returns {Promise} - Promise containing price predictions
 */
export const generateMarketPricePredictions = async (cropType) => {
  const prompt = `Based on current market trends, predict the price trajectory for ${cropType} 
    in the next 3 months. Include factors that might affect the price.`;
  
  return generateContent(prompt);
};

const aiService = {
  generateContent,
  generateFarmingAdvice,
  generatePestControlRecommendations,
  generateMarketPricePredictions
};

export default aiService;