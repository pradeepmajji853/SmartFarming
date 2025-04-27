const axios = require('axios');

// @desc    Get current weather data for a location
// @route   GET /api/weather/current/:location
// @access  Private
exports.getCurrentWeather = async (req, res) => {
  try {
    const { location } = req.params;
    
    // Make request to weather API
    const response = await axios.get(`https://api.weatherapi.com/v1/current.json`, {
      params: {
        key: process.env.WEATHER_API_KEY,
        q: location,
        aqi: 'yes'  // Include air quality data
      }
    });

    // Format response
    const weatherData = {
      location: {
        name: response.data.location.name,
        region: response.data.location.region,
        country: response.data.location.country,
        lat: response.data.location.lat,
        lon: response.data.location.lon,
        localtime: response.data.location.localtime
      },
      current: {
        temp_c: response.data.current.temp_c,
        temp_f: response.data.current.temp_f,
        condition: response.data.current.condition,
        wind_kph: response.data.current.wind_kph,
        wind_dir: response.data.current.wind_dir,
        humidity: response.data.current.humidity,
        precip_mm: response.data.current.precip_mm,
        uv: response.data.current.uv
      },
      air_quality: response.data.current.air_quality
    };

    res.status(200).json({
      success: true,
      data: weatherData
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching weather data',
      error: error.message
    });
  }
};

// @desc    Get weather forecast for a location
// @route   GET /api/weather/forecast/:location/:days
// @access  Private
exports.getForecast = async (req, res) => {
  try {
    const { location, days } = req.params;
    
    // Validate days parameter
    const forecastDays = parseInt(days);
    if (isNaN(forecastDays) || forecastDays < 1 || forecastDays > 10) {
      return res.status(400).json({
        success: false,
        message: 'Days must be between 1 and 10'
      });
    }

    // Make request to weather API
    const response = await axios.get(`https://api.weatherapi.com/v1/forecast.json`, {
      params: {
        key: process.env.WEATHER_API_KEY,
        q: location,
        days: forecastDays,
        aqi: 'yes',
        alerts: 'yes'
      }
    });

    // Format response with farming-relevant data
    const forecastData = {
      location: {
        name: response.data.location.name,
        region: response.data.location.region,
        country: response.data.location.country
      },
      forecast: response.data.forecast.forecastday.map(day => ({
        date: day.date,
        max_temp_c: day.day.maxtemp_c,
        min_temp_c: day.day.mintemp_c,
        avg_temp_c: day.day.avgtemp_c,
        max_wind_kph: day.day.maxwind_kph,
        total_precip_mm: day.day.totalprecip_mm,
        avg_humidity: day.day.avghumidity,
        condition: day.day.condition,
        uv: day.day.uv,
        sunrise: day.astro.sunrise,
        sunset: day.astro.sunset,
        hourly: day.hour.map(hour => ({
          time: hour.time,
          temp_c: hour.temp_c,
          condition: hour.condition,
          wind_kph: hour.wind_kph,
          wind_dir: hour.wind_dir,
          precip_mm: hour.precip_mm,
          humidity: hour.humidity,
          cloud: hour.cloud,
          will_it_rain: hour.will_it_rain,
          chance_of_rain: hour.chance_of_rain
        }))
      })),
      alerts: response.data.alerts ? response.data.alerts.alert : []
    };

    res.status(200).json({
      success: true,
      data: forecastData
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching weather forecast',
      error: error.message
    });
  }
};

// @desc    Get weather-based farming advice
// @route   GET /api/weather/advice/:location/:crop
// @access  Private
exports.getFarmingAdvice = async (req, res) => {
  try {
    const { location, crop } = req.params;
    
    // Get current weather and forecast
    const weatherResponse = await axios.get(`https://api.weatherapi.com/v1/forecast.json`, {
      params: {
        key: process.env.WEATHER_API_KEY,
        q: location,
        days: 3,
        aqi: 'no',
        alerts: 'no'
      }
    });
    
    const currentConditions = weatherResponse.data.current;
    const forecast = weatherResponse.data.forecast.forecastday;
    
    // Generate farming advice based on weather conditions
    // This is a simplified example - in production this would use more complex logic or ML models
    let advice = {
      irrigation: null,
      pestControl: null,
      fieldWork: null,
      generalAdvice: null
    };
    
    // Irrigation advice
    const willRainToday = forecast[0].day.daily_will_it_rain === 1;
    const chanceOfRain = forecast[0].day.daily_chance_of_rain;
    const recentRainfall = currentConditions.precip_mm;
    
    if (recentRainfall > 5) {
      advice.irrigation = "Irrigation can be skipped today due to recent rainfall.";
    } else if (willRainToday && chanceOfRain > 70) {
      advice.irrigation = "High chance of rain today. Consider delaying irrigation.";
    } else if (currentConditions.humidity < 40 && currentConditions.temp_c > 30) {
      advice.irrigation = "Hot and dry conditions. Irrigation recommended, preferably during early morning or evening.";
    } else {
      advice.irrigation = "Normal irrigation schedule recommended based on crop requirements.";
    }
    
    // Field work advice
    if (willRainToday && chanceOfRain > 70) {
      advice.fieldWork = "Postpone non-essential field operations due to expected rainfall.";
    } else if (currentConditions.wind_kph > 30) {
      advice.fieldWork = "Strong winds may affect spraying operations. Consider postponing or using drift reduction methods.";
    } else {
      advice.fieldWork = "Weather conditions suitable for regular field operations.";
    }
    
    // Pest control advice
    if (currentConditions.humidity > 75 && currentConditions.temp_c > 25) {
      advice.pestControl = "High humidity and warm temperatures increase fungal disease risk. Monitor crops closely.";
    } else if (currentConditions.temp_c > 32) {
      advice.pestControl = "Hot conditions may increase insect activity. Scout for pests more frequently.";
    } else {
      advice.pestControl = "Continue regular pest monitoring based on crop stage.";
    }
    
    // General advice based on crop type
    // This would be more sophisticated in a production system, with a database of crop requirements
    if (crop.toLowerCase() === 'rice') {
      advice.generalAdvice = "Maintain proper water levels in paddy fields. Check for rice stem borer and leaf folder.";
    } else if (crop.toLowerCase() === 'wheat') {
      advice.generalAdvice = "Monitor soil moisture levels. Watch for rust diseases in current conditions.";
    } else if (crop.toLowerCase() === 'cotton') {
      advice.generalAdvice = "Check for bollworm infestation. Ensure adequate drainage if rainfall is expected.";
    } else {
      advice.generalAdvice = "Adjust farm operations according to current weather conditions and crop requirements.";
    }
    
    res.status(200).json({
      success: true,
      location: weatherResponse.data.location.name,
      current: {
        temperature: currentConditions.temp_c,
        condition: currentConditions.condition.text,
        humidity: currentConditions.humidity,
        rainfall: currentConditions.precip_mm
      },
      forecast: forecast.map(day => ({
        date: day.date,
        maxTemp: day.day.maxtemp_c,
        minTemp: day.day.mintemp_c,
        condition: day.day.condition.text,
        chanceOfRain: day.day.daily_chance_of_rain
      })),
      advice
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error generating farming advice',
      error: error.message
    });
  }
};