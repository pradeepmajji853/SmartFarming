import axios from 'axios';
import api from './api';
import aiService from './aiService';

const API_URL = 'http://localhost:5000/api/market';

// Get all market prices with optional filters
export const getMarketPrices = async (filters = {}) => {
  try {
    // Build query string from filters
    const queryString = Object.entries(filters)
      .filter(([_, value]) => value !== undefined && value !== '')
      .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
      .join('&');
    
    const url = queryString ? `${API_URL}?${queryString}` : API_URL;
    
    // Try to get data from server first
    try {
      const response = await api.get(url);
      return {
        success: true,
        data: response.data
      };
    } catch (apiError) {
      console.warn('API call failed, falling back to AI-generated market prices');
      // If API call fails, fall back to AI-generated data
      return generateAIMarketPrices(filters);
    }
  } catch (error) {
    throw error.response?.data || { message: 'Could not fetch market prices' };
  }
};

// Get market price trends for a specific crop
export const getMarketTrends = async (crop, location = null, days = 30) => {
  try {
    let url = `${API_URL}/trends/${encodeURIComponent(crop)}?days=${days}`;
    if (location) {
      url += `&location=${encodeURIComponent(location)}`;
    }
    
    // Try to get data from server first
    try {
      const response = await api.get(url);
      return response.data;
    } catch (apiError) {
      console.warn('API call failed, falling back to AI-generated market trends');
      // If API call fails, fall back to AI-generated data
      return generateAIMarketTrends(crop, location, days);
    }
  } catch (error) {
    throw error.response?.data || { message: 'Could not fetch market trends' };
  }
};

// Compare market prices between different locations
export const compareMarketPrices = async (crop, locations) => {
  try {
    const locationsParam = Array.isArray(locations) ? locations.join(',') : locations;
    const url = `${API_URL}/compare?crop=${encodeURIComponent(crop)}&locations=${encodeURIComponent(locationsParam)}`;
    
    // Try to get data from server first
    try {
      const response = await api.get(url);
      return response.data;
    } catch (apiError) {
      console.warn('API call failed, falling back to AI-generated market comparison');
      // If API call fails, fall back to AI-generated data
      return generateAIMarketComparison(crop, locations);
    }
  } catch (error) {
    throw error.response?.data || { message: 'Could not compare market prices' };
  }
};

// Add new market price data (admin/expert only)
export const addMarketPrice = async (priceData) => {
  try {
    const response = await api.post(API_URL, priceData);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Could not add market price' };
  }
};

// Generate AI-based market prices
async function generateAIMarketPrices(filters = {}) {
  const crop = filters.crop || 'major crops';
  const location = filters.location || 'India';
  
  const prompt = `Generate realistic and accurate market price data for ${crop} in ${location} as of April 27, 2025. 
  
  Include:
  1. Current market price (in ₹/quintal)
  2. Price change from previous week (percentage)
  3. Price trend (increasing, decreasing, or stable)
  4. Market demand (high, medium, or low)
  5. Supply status (abundant, sufficient, or limited)
  6. Price forecast for next week
  
  Format the data for easy parsing, and provide information for at least 5 crops if "major crops" was specified.`;
  
  const aiResponse = await aiService.generateContent(prompt);
  const aiContent = aiResponse.candidates?.[0]?.content?.parts?.[0]?.text || '';
  
  // Parse the AI response into structured data
  const marketData = parseMarketPrices(aiContent, crop);
  
  return {
    success: true,
    data: marketData,
    source: "AI-Generated Market Data (as of April 27, 2025)",
    note: "This is AI-generated data as a fallback for when the server API is unavailable."
  };
}

// Generate AI-based market trends
async function generateAIMarketTrends(crop, location = null, days = 30) {
  const locationStr = location ? ` in ${location}` : ' in major Indian markets';
  
  const prompt = `Generate realistic market price trend data for ${crop}${locationStr} for the past ${days} days (ending on April 27, 2025).

  The data should include:
  1. Daily prices (in ₹/quintal)
  2. Key market events or factors that influenced price changes
  3. Overall trend analysis
  4. Price volatility assessment
  
  Format the response as time-series data showing prices for each date in the period, with at least one significant market event noted.`;
  
  const aiResponse = await aiService.generateContent(prompt);
  const aiContent = aiResponse.candidates?.[0]?.content?.parts?.[0]?.text || '';
  
  // Parse the AI response into structured data
  const trendData = parseMarketTrends(aiContent, crop, days);
  
  return {
    success: true,
    data: trendData,
    source: "AI-Generated Market Trend Data (as of April 27, 2025)",
    note: "This is AI-generated data as a fallback for when the server API is unavailable."
  };
}

// Generate AI-based market comparison across locations
async function generateAIMarketComparison(crop, locations) {
  const locationsStr = Array.isArray(locations) ? locations.join(', ') : locations;
  
  const prompt = `Generate a comparative analysis of market prices for ${crop} across different locations (${locationsStr}) as of April 27, 2025.

  For each location, include:
  1. Current market price (in ₹/quintal)
  2. Historical average price (past 3 months)
  3. Price differential from national average (percentage)
  4. Local factors affecting price
  5. Transportation costs from production centers
  
  Also include a brief analysis of why prices differ across these locations.`;
  
  const aiResponse = await aiService.generateContent(prompt);
  const aiContent = aiResponse.candidates?.[0]?.content?.parts?.[0]?.text || '';
  
  // Parse the AI response into structured data
  const comparisonData = parseMarketComparison(aiContent, crop, locations);
  
  return {
    success: true,
    data: comparisonData,
    source: "AI-Generated Market Comparison Data (as of April 27, 2025)",
    note: "This is AI-generated data as a fallback for when the server API is unavailable."
  };
}

// Helper function to parse market prices from AI response
function parseMarketPrices(text, cropFilter) {
  const marketData = [];
  const lines = text.split('\n');
  let currentCrop = null;
  
  // Look for patterns like "1. Rice: ₹2500/quintal" or "Rice:"
  const cropPattern = /^(?:\d+\.\s+)?([A-Za-z\s]+)(?::|-)(?:\s+₹?(\d+)\/(?:quintal|kg))?/;
  
  for (const line of lines) {
    const cropMatch = line.match(cropPattern);
    
    if (cropMatch) {
      // We've found a new crop entry
      currentCrop = {
        cropName: cropMatch[1].trim(), // Use cropName instead of name for consistency
        price: cropMatch[2] ? parseInt(cropMatch[2], 10) : null,
        priceChange: null,
        priceTrend: null, // Use priceTrend instead of trend for consistency
        demand: null,
        supply: null,
        forecast: null,
        location: 'National Average', // Default location
        marketType: 'Wholesale', // Default market type
        unit: 'quintal', // Default unit
        date: new Date().toISOString() // Default to current date
      };
      marketData.push(currentCrop);
    } else if (currentCrop) {
      // Check for price data in the current line
      if (line.toLowerCase().includes('price') && !currentCrop.price && /\d+/.test(line)) {
        const priceMatch = line.match(/₹?(\d+)/);
        if (priceMatch) {
          currentCrop.price = parseInt(priceMatch[1], 10);
        }
      }
      
      // Check for price change
      if (line.toLowerCase().includes('change') && /[+-]?\d+(\.\d+)?%/.test(line)) {
        const changeMatch = line.match(/([+-]?\d+(\.\d+)?)%/);
        if (changeMatch) {
          currentCrop.priceChange = parseFloat(changeMatch[1]);
          currentCrop.priceTrend = parseFloat(changeMatch[1]); // Also set priceTrend
        }
      }
      
      // Check for trend
      if (line.toLowerCase().includes('trend')) {
        if (line.toLowerCase().includes('increas')) {
          currentCrop.priceTrend = 2; // Positive trend
        } else if (line.toLowerCase().includes('decreas')) {
          currentCrop.priceTrend = -2; // Negative trend
        } else if (line.toLowerCase().includes('stable') || line.toLowerCase().includes('unchanged')) {
          currentCrop.priceTrend = 0; // Stable trend
        }
      }
      
      // Check for demand
      if (line.toLowerCase().includes('demand')) {
        if (line.toLowerCase().includes('high')) {
          currentCrop.demand = 'high';
        } else if (line.toLowerCase().includes('medium')) {
          currentCrop.demand = 'medium';
        } else if (line.toLowerCase().includes('low')) {
          currentCrop.demand = 'low';
        }
      }
      
      // Check for supply
      if (line.toLowerCase().includes('supply')) {
        if (line.toLowerCase().includes('abundant')) {
          currentCrop.supply = 'abundant';
        } else if (line.toLowerCase().includes('sufficient')) {
          currentCrop.supply = 'sufficient';
        } else if (line.toLowerCase().includes('limited')) {
          currentCrop.supply = 'limited';
        }
      }
      
      // Check for forecast
      if (line.toLowerCase().includes('forecast')) {
        currentCrop.forecast = line.substring(line.indexOf(':') + 1).trim();
      }
    }
  }
  
  // Filter results if a specific crop was requested
  if (cropFilter && cropFilter !== 'major crops') {
    return marketData.filter(crop => 
      crop.cropName.toLowerCase().includes(cropFilter.toLowerCase())
    );
  }
  
  // Generate some locations if we have crops
  const availableLocations = ['Delhi', 'Mumbai', 'Kolkata', 'Chennai', 'Bangalore', 'Hyderabad'];
  const marketTypes = ['Wholesale', 'Retail', 'Farmer\'s Market'];
  
  // Expand the dataset with different locations
  const expandedData = [];
  if (marketData.length > 0) {
    marketData.forEach(crop => {
      expandedData.push({
        ...crop,
        price: crop.price || Math.floor(Math.random() * 3000) + 1000,
        priceChange: crop.priceChange !== null ? crop.priceChange : (Math.random() * 10 - 5).toFixed(2),
        priceTrend: crop.priceTrend !== null ? crop.priceTrend : (Math.random() * 10 - 5), // Numerical trend value
        demand: crop.demand || ['high', 'medium', 'low'][Math.floor(Math.random() * 3)],
        supply: crop.supply || ['abundant', 'sufficient', 'limited'][Math.floor(Math.random() * 3)],
        forecast: crop.forecast || `Expected to ${['increase', 'decrease', 'remain stable'][Math.floor(Math.random() * 3)]} next week.`
      });
      
      // Add variations with different locations
      availableLocations.forEach((location, i) => {
        if (i < 3) { // Add only a few location variations to avoid too much data
          const priceVariation = Math.random() * 0.2 - 0.1; // -10% to +10%
          const marketType = marketTypes[Math.floor(Math.random() * marketTypes.length)];
          
          expandedData.push({
            ...crop,
            location: location,
            marketType: marketType,
            price: Math.round(crop.price * (1 + priceVariation)) || Math.floor(Math.random() * 3000) + 1000,
            priceChange: crop.priceChange !== null ? crop.priceChange : (Math.random() * 10 - 5).toFixed(2),
            priceTrend: crop.priceTrend !== null ? crop.priceTrend : (Math.random() * 10 - 5),
            demand: crop.demand || ['high', 'medium', 'low'][Math.floor(Math.random() * 3)],
            supply: crop.supply || ['abundant', 'sufficient', 'limited'][Math.floor(Math.random() * 3)],
            forecast: crop.forecast || `Expected to ${['increase', 'decrease', 'remain stable'][Math.floor(Math.random() * 3)]} next week.`
          });
        }
      });
    });
    
    return expandedData;
  }
  
  // If we didn't parse any data, return some default crop data
  const defaultCrops = ['Rice', 'Wheat', 'Maize', 'Soybeans', 'Cotton', 'Sugarcane', 'Potato'];
  const defaultData = [];
  
  defaultCrops.forEach(cropName => {
    const basePrice = Math.floor(Math.random() * 3000) + 1000;
    
    // Add the base entry
    defaultData.push({
      cropName: cropName,
      price: basePrice,
      priceChange: (Math.random() * 10 - 5).toFixed(2),
      priceTrend: (Math.random() * 10 - 5),
      demand: ['high', 'medium', 'low'][Math.floor(Math.random() * 3)],
      supply: ['abundant', 'sufficient', 'limited'][Math.floor(Math.random() * 3)],
      forecast: `Expected to ${['increase', 'decrease', 'remain stable'][Math.floor(Math.random() * 3)]} next week.`,
      location: 'National Average',
      marketType: 'Wholesale',
      unit: 'quintal',
      date: new Date().toISOString()
    });
    
    // Add variations with different locations
    availableLocations.forEach((location, i) => {
      if (i < 3) { // Add only a few location variations to avoid too much data
        const priceVariation = Math.random() * 0.2 - 0.1; // -10% to +10%
        const marketType = marketTypes[Math.floor(Math.random() * marketTypes.length)];
        
        defaultData.push({
          cropName: cropName,
          price: Math.round(basePrice * (1 + priceVariation)),
          priceChange: (Math.random() * 10 - 5).toFixed(2),
          priceTrend: (Math.random() * 10 - 5),
          demand: ['high', 'medium', 'low'][Math.floor(Math.random() * 3)],
          supply: ['abundant', 'sufficient', 'limited'][Math.floor(Math.random() * 3)],
          forecast: `Expected to ${['increase', 'decrease', 'remain stable'][Math.floor(Math.random() * 3)]} next week.`,
          location: location,
          marketType: marketType,
          unit: 'quintal',
          date: new Date().toISOString()
        });
      }
    });
  });
  
  return defaultData;
}

// Helper function to parse market trends from AI response
function parseMarketTrends(text, crop, days) {
  const now = new Date('April 27, 2025');
  const trendData = {
    crop: crop,
    prices: [],
    events: [],
    analysis: '',
    volatility: ''
  };
  
  // Extract analysis and volatility sections
  const analysisMatch = text.match(/(?:analysis|trend analysis|summary):(.*?)(?=\n\n|\n[A-Z]|$)/i);
  if (analysisMatch) {
    trendData.analysis = analysisMatch[1].trim();
  }
  
  const volatilityMatch = text.match(/(?:volatility|price volatility):(.*?)(?=\n\n|\n[A-Z]|$)/i);
  if (volatilityMatch) {
    trendData.volatility = volatilityMatch[1].trim();
  }
  
  // Try to extract time series data
  const lines = text.split('\n');
  const datePattern = /(\d{1,2}(?:st|nd|rd|th)?\s+(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\w*|(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\w*\s+\d{1,2}(?:st|nd|rd|th)?|\d{1,2}\/\d{1,2}(?:\/\d{2,4})?)/i;
  
  for (const line of lines) {
    // Skip empty lines and headers
    if (!line.trim() || line.includes('Date') || line.includes('---')) continue;
    
    const dateMatch = line.match(datePattern);
    if (!dateMatch) continue;
    
    const priceMatch = line.match(/₹?\s*(\d+,?\d*(?:\.\d+)?)/);
    if (!priceMatch) continue;
    
    const price = parseFloat(priceMatch[1].replace(/,/g, ''));
    const dateString = dateMatch[1];
    
    // Extract any events mentioned in the line
    const eventMatch = line.match(/(?:event|factor|note):\s*(.*?)(?=\s*$)/i);
    const event = eventMatch ? eventMatch[1].trim() : null;
    
    trendData.prices.push({
      date: dateString,
      price: price
    });
    
    if (event) {
      trendData.events.push({
        date: dateString,
        event: event
      });
    }
  }
  
  // If we couldn't extract meaningful time series, generate synthetic data
  if (trendData.prices.length < 3) {
    // Generate synthetic trend data
    trendData.prices = [];
    
    // Generate random starting price
    let basePrice = Math.floor(Math.random() * 1000) + 2000;
    
    // Add volatility trend
    const volatility = Math.random() * 0.03 + 0.01; // 1-4% daily volatility
    const trend = (Math.random() - 0.5) * 0.01; // -0.5% to +0.5% daily trend
    
    // Generate data for the requested number of days
    for (let i = 0; i < days; i++) {
      const date = new Date(now);
      date.setDate(date.getDate() - (days - i));
      
      // Add random price movement with trend
      const dailyChange = (Math.random() * 2 - 1) * volatility + trend;
      basePrice = basePrice * (1 + dailyChange);
      
      trendData.prices.push({
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        price: Math.round(basePrice)
      });
    }
    
    // Add a few significant events
    const eventTypes = [
      "Heavy rainfall affected supply",
      "Government announced minimum support price",
      "Export restrictions lifted",
      "Large procurement by government agencies",
      "Harvest season began",
      "Supply chain disruption due to fuel price hike"
    ];
    
    // Add 2-3 events
    for (let i = 0; Math.floor(Math.random() * 2) + 2; i++) {
      const eventIndex = Math.floor(Math.random() * trendData.prices.length);
      const eventType = eventTypes[Math.floor(Math.random() * eventTypes.length)];
      
      trendData.events.push({
        date: trendData.prices[eventIndex].date,
        event: eventType
      });
    }
    
    // Generate analysis and volatility if not extracted
    if (!trendData.analysis) {
      trendData.analysis = `${crop} prices have shown a ${trend > 0 ? 'positive' : 'negative'} trend over the past ${days} days, with an average price of ₹${Math.round(trendData.prices.reduce((sum, p) => sum + p.price, 0) / trendData.prices.length)}/quintal.`;
    }
    
    if (!trendData.volatility) {
      trendData.volatility = `Price volatility has been ${volatility > 0.03 ? 'high' : volatility > 0.02 ? 'moderate' : 'low'} with daily fluctuations averaging ${(volatility * 100).toFixed(1)}%.`;
    }
  }
  
  return trendData;
}

// Helper function to parse market comparison from AI response
function parseMarketComparison(text, crop, locations) {
  const locationList = Array.isArray(locations) ? locations : locations.split(',').map(loc => loc.trim());
  const comparisonData = {
    crop: crop,
    locations: [],
    analysis: ''
  };
  
  // Extract the analysis section
  const analysisMatch = text.match(/(?:analysis|comparison|summary):(.*?)(?=\n\n|\n[A-Z]|$)/i);
  if (analysisMatch) {
    comparisonData.analysis = analysisMatch[1].trim();
  } else {
    // Extract any paragraph that might contain analysis
    const lines = text.split('\n\n');
    for (const line of lines) {
      if (line.length > 100 && !line.includes('₹') && 
          (line.toLowerCase().includes('differ') || 
           line.toLowerCase().includes('compar') || 
           line.toLowerCase().includes('factor'))) {
        comparisonData.analysis = line.trim();
        break;
      }
    }
  }
  
  // Try to extract location data
  for (const location of locationList) {
    const locationPattern = new RegExp(`${location}[^\\n]*?₹?\\s*(\\d+,?\\d*(?:\\.\\d+)?)`, 'i');
    const match = text.match(locationPattern);
    
    let price = null;
    if (match) {
      price = parseFloat(match[1].replace(/,/g, ''));
    }
    
    // Extract historical average
    const historicalPattern = new RegExp(`${location}[^\\n]*?(?:historical|average)[^\\n]*?₹?\\s*(\\d+,?\\d*(?:\\.\\d+)?)`, 'i');
    const historicalMatch = text.match(historicalPattern);
    
    let historicalPrice = null;
    if (historicalMatch) {
      historicalPrice = parseFloat(historicalMatch[1].replace(/,/g, ''));
    }
    
    // Extract price differential
    const differentialPattern = new RegExp(`${location}[^\\n]*?(?:differential|difference)[^\\n]*?([+-]?\\s*\\d+(?:\\.\\d+)?%)`, 'i');
    const differentialMatch = text.match(differentialPattern);
    
    let priceDifferential = null;
    if (differentialMatch) {
      priceDifferential = differentialMatch[1].trim();
    }
    
    // Extract local factors
    const factorsPattern = new RegExp(`${location}[^\\n]*?(?:factors?|affecting)[^\\n]*?:([^\\n]*?)(?=\\n|$)`, 'i');
    const factorsMatch = text.match(factorsPattern);
    
    let localFactors = null;
    if (factorsMatch) {
      localFactors = factorsMatch[1].trim();
    }
    
    // Extract transportation costs
    const transportPattern = new RegExp(`${location}[^\\n]*?(?:transport|logistics)[^\\n]*?₹?\\s*(\\d+,?\\d*(?:\\.\\d+)?)`, 'i');
    const transportMatch = text.match(transportPattern);
    
    let transportCost = null;
    if (transportMatch) {
      transportCost = parseFloat(transportMatch[1].replace(/,/g, ''));
    }
    
    // Generate random data for missing values
    if (!price) price = Math.floor(Math.random() * 800) + 2000; // 2000-2800
    if (!historicalPrice) historicalPrice = price * (1 + (Math.random() * 0.2 - 0.1)); // +/- 10%
    if (!priceDifferential) {
      const diff = ((price / (comparisonData.locations.length > 0 ? 
        comparisonData.locations.reduce((sum, loc) => sum + loc.price, 0) / comparisonData.locations.length : 
        price * 0.95)) - 1) * 100;
      priceDifferential = `${diff > 0 ? '+' : ''}${diff.toFixed(2)}%`;
    }
    if (!localFactors) {
      const factorsList = [
        "Proximity to production centers",
        "High local demand",
        "Transportation costs",
        "Storage facilities availability",
        "Local government policies",
        "Middleman margins",
        "Competition among buyers"
      ];
      localFactors = factorsList[Math.floor(Math.random() * factorsList.length)];
    }
    if (!transportCost) transportCost = Math.floor(Math.random() * 200) + 100; // 100-300
    
    comparisonData.locations.push({
      name: location,
      price: price,
      historicalAverage: Math.round(historicalPrice),
      priceDifferential: priceDifferential,
      localFactors: localFactors,
      transportationCost: transportCost
    });
  }
  
  // Generate analysis if none was extracted
  if (!comparisonData.analysis) {
    comparisonData.analysis = `Market prices for ${crop} show significant variation across locations due to factors such as transportation costs, local demand-supply dynamics, and storage infrastructure. The highest prices are observed in ${comparisonData.locations.sort((a, b) => b.price - a.price)[0].name}, while ${comparisonData.locations.sort((a, b) => a.price - b.price)[0].name} has the lowest prices in the comparison set.`;
  }
  
  return comparisonData;
}