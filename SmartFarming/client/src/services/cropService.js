import api from './api';
import aiService from './aiService';

// Get all crops
export const getAllCrops = async () => {
  try {
    const response = await api.get('/crops');
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Could not fetch crops' };
  }
};

// Get single crop by ID
export const getCropById = async (cropId) => {
  try {
    const response = await api.get(`/crops/${cropId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Could not fetch crop details' };
  }
};

// Get crop recommendations based on conditions using Gemini AI
export const getCropRecommendations = async (conditions) => {
  try {
    const { season, soilType, temperature, waterAvailability, location } = conditions;
    
    // Create a prompt for Gemini AI
    const prompt = `As an agricultural expert, recommend the best crops to grow with these conditions:
    ${season ? `Season: ${season}` : 'Season: Current growing season'}
    ${soilType ? `Soil Type: ${soilType}` : ''}
    ${temperature ? `Average Temperature: ${temperature}°C` : ''}
    ${waterAvailability ? `Water Availability: ${waterAvailability}` : ''}
    ${location ? `Location: ${location}` : ''}
    
    Please provide recommendations in this specific format for each crop:
    1. [Crop Name]
       - Growing Season: [seasons]
       - Water Requirement: [low/medium/high]
       - Temperature Range: [min-max °C]
       - Soil Requirement: [soil types]
       - Growing Duration: [days/months]
       - Expected Yield: [amount per acre/hectare]
       - Key Benefits: [brief description]
    
    Recommend 5 suitable crops for these conditions.`;
    
    // Get recommendations from Gemini AI
    const aiResponse = await aiService.generateContent(prompt);
    
    // Parse the AI response into structured data
    const aiContent = aiResponse.candidates?.[0]?.content?.parts?.[0]?.text || '';
    const cropRecommendations = parseCropRecommendations(aiContent);
    
    return {
      success: true,
      data: cropRecommendations,
      conditions: conditions
    };
  } catch (error) {
    console.error('Error getting crop recommendations:', error);
    throw { message: 'Could not fetch crop recommendations', error: error.message };
  }
};

// Function to parse crop recommendations from AI response
function parseCropRecommendations(text) {
  const crops = [];
  const cropSections = text.split(/\d+\.\s+/).filter(Boolean); // Split by numbered list items
  
  cropSections.forEach(section => {
    const lines = section.trim().split('\n').filter(Boolean);
    
    if (lines.length > 0) {
      const name = lines[0].replace(/\[|\]/g, '').trim();
      let cropData = {
        _id: generatePseudoId(name), // Generate a pseudo ID based on name
        name: name,
        season: '',
        waterRequirement: '',
        temperature: '',
        soilType: '',
        duration: '',
        yield: '',
        benefits: ''
      };
      
      // Process the details for this crop
      lines.slice(1).forEach(line => {
        line = line.trim().replace(/^-\s+/, '');
        
        if (line.includes('Growing Season:')) {
          cropData.season = extractValue(line, 'Growing Season:');
        } else if (line.includes('Water Requirement:')) {
          cropData.waterRequirement = extractValue(line, 'Water Requirement:');
        } else if (line.includes('Temperature Range:')) {
          cropData.temperature = extractValue(line, 'Temperature Range:');
        } else if (line.includes('Soil Requirement:')) {
          cropData.soilType = extractValue(line, 'Soil Requirement:');
        } else if (line.includes('Growing Duration:')) {
          cropData.duration = extractValue(line, 'Growing Duration:');
        } else if (line.includes('Expected Yield:')) {
          cropData.yield = extractValue(line, 'Expected Yield:');
        } else if (line.includes('Key Benefits:')) {
          cropData.benefits = extractValue(line, 'Key Benefits:');
        }
      });
      
      crops.push(cropData);
    }
  });
  
  return crops;
}

// Helper function to extract value from a line
function extractValue(line, key) {
  return line.replace(key, '').trim();
}

// Helper function to generate a pseudo-ID based on the crop name
function generatePseudoId(name) {
  // Create a simple hash of the name
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    const char = name.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return `crop_${Math.abs(hash).toString(16)}`;
}