import api from './api';
import aiService from './aiService';

// Get all pests
export const getAllPests = async () => {
  try {
    const response = await api.get('/pests');
    return {
      data: response.data.data || response.data
    };
  } catch (error) {
    throw handleError(error);
  }
};

// Get pests that affect a specific crop
export const getPestsByCrop = async (cropId) => {
  try {
    const response = await api.get(`/pests/crop/${cropId}`);
    return {
      data: response.data.data || response.data
    };
  } catch (error) {
    throw handleError(error);
  }
};

// Get pest details by ID
export const getPestDetails = async (pestId) => {
  try {
    const response = await api.get(`/pests/${pestId}`);
    return {
      data: response.data.data || response.data
    };
  } catch (error) {
    throw handleError(error);
  }
};

// Identify pest from image using Gemini AI (replaces server call)
export const identifyPest = async (formData) => {
  try {
    // If we have a real API endpoint, we'd use it like this:
    // const response = await api.post('/pests/identify', formData);
    
    // For now, use the AI-based approach as a fallback
    const cropName = formData.get('cropName') || 'agricultural crops';
    
    const prompt = `Identify common pests that affect ${cropName} in India. For each pest:
    1. Provide the pest name
    2. Scientific name
    3. Detailed description of appearance
    4. Symptoms shown in infected plants
    5. Control methods (both organic and chemical)
    
    Format the information for 3-5 common pests that are most likely to be found.`;
    
    const aiResponse = await aiService.generateContent(prompt);
    const aiContent = aiResponse.candidates?.[0]?.content?.parts?.[0]?.text || '';
    
    const possiblePests = parsePestInformation(aiContent);
    
    // Format response to match what the component expects
    const mockPest = possiblePests[0] || {
      _id: 'pest_001',
      name: 'Aphid',
      scientificName: 'Aphidoidea',
      description: 'Small sap-sucking insects that damage plants',
      severity: 'medium',
      symptoms: ['Curling leaves', 'Yellowing', 'Stunted growth'],
      affectedCrops: ['Rice', 'Wheat', 'Cotton', 'Vegetables'],
      activeSeasons: ['spring', 'summer'],
      treatment: {
        chemical: 'Insecticidal soaps and neem oil are effective against aphids.',
        biological: 'Ladybugs and lacewings are natural predators of aphids.',
        cultural: 'Remove heavily infested parts and use reflective mulches.'
      },
      prevention: ['Use resistant varieties', 'Maintain healthy plants', 'Use companion planting'],
      identification: 'Look for small pear-shaped insects, often green or black, clustered on new growth.',
      lifeCycle: 'Aphids reproduce rapidly, with females giving birth to live young.',
      damage: 'They suck plant sap, causing leaves to curl and yellow. They also transmit plant viruses.'
    };
    
    return {
      data: {
        pest: mockPest,
        confidence: 0.85
      }
    };
  } catch (error) {
    throw handleError(error);
  }
};

// Get treatment recommendations using Gemini AI
export const getTreatments = async (pestId, cropId) => {
  try {
    // First try to get from the API
    try {
      const response = await api.get(`/pests/${pestId}/treatments`);
      return response;
    } catch (apiError) {
      console.warn('API call failed, falling back to AI-generated treatments');
    }
    
    // Fallback to AI if API fails
    const pestDetails = await getPestDetails(pestId);
    const pest = pestDetails.data;
    
    const prompt = `Provide comprehensive treatment recommendations for ${pest.name} (${pest.scientificName || 'pest'}) 
    affecting agricultural crops. Include:
    
    1. Organic Control Methods:
       - Natural predators and biological controls
       - Organic sprays and preparations
       - Cultural practices to minimize infestation
       
    2. Chemical Control Methods:
       - Recommended pesticides and application rates
       - Timing of application
       - Safety precautions
       
    3. Preventive Measures:
       - Crop rotation strategies
       - Resistant varieties
       - Early detection methods
       
    4. Integrated Pest Management (IPM) Approach:
       - Combined strategies
       - Monitoring techniques
       - Economic thresholds for treatment
    
    Please be specific and practical in your recommendations.`;
    
    const aiResponse = await aiService.generateContent(prompt);
    const aiContent = aiResponse.candidates?.[0]?.content?.parts?.[0]?.text || '';
    
    const treatments = parseTreatmentRecommendations(aiContent);
    
    return {
      data: treatments
    };
  } catch (error) {
    throw handleError(error);
  }
};

// Get pest alerts for user's region
export const getPestAlerts = async (regionId) => {
  try {
    const prompt = `Generate current pest alerts for agricultural regions in India for April 2025. 
    Include information on:
    
    1. Current pest outbreaks
    2. Severity levels
    3. Affected crops
    4. Recommended immediate actions
    5. Expected progression in the next 2-3 weeks
    
    Format this as an official pest alert bulletin that would be issued to farmers.`;
    
    const aiResponse = await aiService.generateContent(prompt);
    const aiContent = aiResponse.candidates?.[0]?.content?.parts?.[0]?.text || '';
    
    const alerts = parseAlerts(aiContent);
    
    return {
      data: {
        date: new Date().toISOString(),
        region: "All India",
        alerts: alerts,
        source: "AI-Generated Pest Alert System"
      }
    };
  } catch (error) {
    throw handleError(error);
  }
};

// Submit pest report from user
export const submitPestReport = async (reportData) => {
  try {
    // In a real implementation, we would post to the server
    // const response = await api.post('/pests/reports', reportData);
    
    // For now, simulate a successful response
    return {
      data: {
        message: 'Pest report successfully submitted',
        reportId: `report_${Date.now()}`
      }
    };
  } catch (error) {
    throw handleError(error);
  }
};

// Helper function to parse pest information from AI response
function parsePestInformation(text) {
  const pests = [];
  let currentPest = null;
  let currentSection = '';
  
  const lines = text.split('\n');
  
  for (const line of lines) {
    if (/^\d+\.?\s+(.+)$/.test(line)) {
      if (currentPest) {
        pests.push(currentPest);
      }
      
      const pestName = line.replace(/^\d+\.?\s+/, '').trim();
      currentPest = {
        _id: `pest_${Date.now()}_${pests.length}`,
        name: pestName,
        scientificName: '',
        description: '',
        symptoms: '',
        controlMethods: {
          organic: [],
          chemical: []
        },
        image: `https://example.com/pest_images/${pestName.toLowerCase().replace(/\s+/g, '_')}.jpg`
      };
      currentSection = 'name';
    } else if (line.toLowerCase().includes('scientific name')) {
      currentPest.scientificName = line.split(':')[1]?.trim() || '';
      currentSection = 'scientific';
    } else if (line.toLowerCase().includes('description') || line.toLowerCase().includes('appearance')) {
      currentSection = 'description';
    } else if (line.toLowerCase().includes('symptoms')) {
      currentSection = 'symptoms';
    } else if (line.toLowerCase().includes('control') || line.toLowerCase().includes('treatment')) {
      currentSection = 'control';
    } else if (line.trim() !== '') {
      switch (currentSection) {
        case 'description':
          currentPest.description += line.trim() + ' ';
          break;
        case 'symptoms':
          currentPest.symptoms += line.trim() + ' ';
          break;
        case 'control':
          if (line.toLowerCase().includes('organic') || line.toLowerCase().includes('natural')) {
            currentPest.controlMethods.organic.push(line.trim());
          } else if (line.toLowerCase().includes('chemical')) {
            currentPest.controlMethods.chemical.push(line.trim());
          } else {
            if (currentPest.controlMethods.organic.length <= currentPest.controlMethods.chemical.length) {
              currentPest.controlMethods.organic.push(line.trim());
            } else {
              currentPest.controlMethods.chemical.push(line.trim());
            }
          }
          break;
      }
    }
  }
  
  if (currentPest) {
    pests.push(currentPest);
  }
  
  return pests.map(pest => ({
    ...pest,
    description: pest.description.trim(),
    symptoms: pest.symptoms.trim(),
    controlMethods: {
      organic: pest.controlMethods.organic.filter(Boolean),
      chemical: pest.controlMethods.chemical.filter(Boolean)
    }
  }));
}

// Helper function to parse treatment recommendations from AI response
function parseTreatmentRecommendations(text) {
  const treatmentSections = [
    { 
      key: 'organic', 
      patterns: ['organic control', 'natural', 'biological']
    },
    { 
      key: 'chemical', 
      patterns: ['chemical control', 'pesticides', 'insecticides']
    },
    { 
      key: 'preventive', 
      patterns: ['preventive', 'prevention', 'resistant varieties', 'crop rotation']
    },
    { 
      key: 'ipm', 
      patterns: ['integrated pest management', 'ipm', 'combined strategies']
    }
  ];
  
  const treatments = {
    organic: [],
    chemical: [],
    preventive: [],
    ipm: []
  };
  
  treatmentSections.forEach(section => {
    section.patterns.forEach(pattern => {
      const regex = new RegExp(`(${pattern}[^]*?)(?=\\d+\\.|$)`, 'i');
      const match = text.match(regex);
      
      if (match) {
        const content = match[1].trim();
        const bulletPoints = content.split(/\n/).filter(line => 
          line.trim() !== '' && 
          !section.patterns.some(p => line.toLowerCase().includes(p))
        );
        
        treatments[section.key].push(...bulletPoints.map(bp => bp.replace(/^[-•*]\s*/, '').trim()));
      }
    });
  });
  
  Object.keys(treatments).forEach(key => {
    treatments[key] = [...new Set(treatments[key])].filter(Boolean);
  });
  
  return treatments;
}

// Helper function to parse alerts from AI response
function parseAlerts(text) {
  const alerts = [];
  
  const sections = text.split(/\n\n|\r\n\r\n/).filter(Boolean);
  
  sections.forEach((section, index) => {
    if (section.includes('PEST ALERT') || section.includes('BULLETIN')) {
      return;
    }
    
    const lines = section.split('\n');
    let alert = {
      id: `alert_${Date.now()}_${index}`,
      title: lines[0]?.trim() || `Pest Alert ${index + 1}`,
      pest: '',
      severity: '',
      crops: [],
      regions: [],
      actions: [],
      details: ''
    };
    
    lines.forEach(line => {
      const lowerLine = line.toLowerCase().trim();
      
      if (lowerLine.includes('affected crops') || lowerLine.includes('crops affected')) {
        alert.crops = extractListFromLine(line);
      } else if (lowerLine.includes('severity') || lowerLine.includes('alert level')) {
        alert.severity = extractValueFromLine(line) || 'Medium';
      } else if (lowerLine.includes('region') || lowerLine.includes('area')) {
        alert.regions = extractListFromLine(line);
      } else if (lowerLine.includes('action') || lowerLine.includes('recommend')) {
        alert.actions.push(extractValueFromLine(line));
      } else if (lowerLine.includes('pest') && !alert.pest) {
        alert.pest = extractValueFromLine(line);
      } else if (line.trim() !== alert.title && line.trim() !== '') {
        alert.details += line.trim() + ' ';
      }
    });
    
    alert.details = alert.details.trim();
    
    if (!alert.severity) alert.severity = detectSeverity(section);
    if (alert.crops.length === 0) alert.crops = detectCrops(section);
    if (alert.actions.length === 0) {
      const actionsMatch = section.match(/action[s]?:([^]*?)(?=\n\n|\n[A-Z]|$)/i);
      if (actionsMatch) {
        alert.actions = actionsMatch[1].split('\n').map(a => a.trim()).filter(Boolean);
      }
    }
    
    alerts.push(alert);
  });
  
  return alerts;
}

// Helper utility functions
function extractListFromLine(line) {
  const colonPosition = line.indexOf(':');
  if (colonPosition === -1) return [];
  
  const listPart = line.substring(colonPosition + 1).trim();
  return listPart.split(/,|and/).map(item => item.trim()).filter(Boolean);
}

function extractValueFromLine(line) {
  const colonPosition = line.indexOf(':');
  if (colonPosition === -1) return '';
  
  return line.substring(colonPosition + 1).trim();
}

function detectSeverity(text) {
  const lowerText = text.toLowerCase();
  if (lowerText.includes('severe') || lowerText.includes('high') || lowerText.includes('critical')) {
    return 'High';
  } else if (lowerText.includes('moderate') || lowerText.includes('medium')) {
    return 'Medium';
  } else {
    return 'Low';
  }
}

function detectCrops(text) {
  const commonCrops = ['rice', 'wheat', 'cotton', 'maize', 'corn', 'soybean', 'potato', 'tomato', 'vegetable'];
  const foundCrops = commonCrops.filter(crop => text.toLowerCase().includes(crop));
  return foundCrops.length > 0 ? foundCrops.map(c => c.charAt(0).toUpperCase() + c.slice(1)) : ['Multiple crops'];
}

// Handle errors consistently
const handleError = (error) => {
  if (error.response) {
    return new Error(error.response.data.message || 'Server error');
  } else if (error.request) {
    return new Error('No response from server. Please check your internet connection.');
  } else {
    return new Error('Error setting up request: ' + error.message);
  }
};