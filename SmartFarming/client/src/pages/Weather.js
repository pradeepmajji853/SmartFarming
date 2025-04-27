import React, { useState, useEffect, useContext } from 'react';
import { 
  Container, 
  Box, 
  Typography, 
  Grid, 
  Card, 
  CardContent,
  Paper, 
  TextField, 
  Button, 
  Tabs, 
  Tab, 
  Divider,
  Alert,
  CircularProgress,
  List,
  ListItem,
  ListItemIcon,
  ListItemText
} from '@mui/material';
import {
  WbSunny as SunnyIcon,
  Cloud as CloudIcon,
  Opacity as RainIcon,
  AcUnit as SnowIcon,
  Air as WindIcon,
  SearchOutlined as SearchIcon,
  Thermostat as TemperatureIcon,
  WaterDrop as HumidityIcon,
  CompareArrows as PressureIcon,
  Visibility as VisibilityIcon,
  LocationOn as LocationIcon
} from '@mui/icons-material';
import { AuthContext } from '../context/AuthContext';
import { getCurrentWeather, getWeatherForecast } from '../services/weatherService';

// Helper function to get weather icon based on condition
const getWeatherIcon = (condition) => {
  const conditionLower = condition.toLowerCase();
  
  if (conditionLower.includes('sun') || conditionLower.includes('clear')) {
    return <SunnyIcon fontSize="large" sx={{ color: '#ff9800' }} />;
  } else if (conditionLower.includes('rain') || conditionLower.includes('drizzle') || conditionLower.includes('shower')) {
    return <RainIcon fontSize="large" sx={{ color: '#2196f3' }} />;
  } else if (conditionLower.includes('snow') || conditionLower.includes('ice') || conditionLower.includes('frost')) {
    return <SnowIcon fontSize="large" sx={{ color: '#90caf9' }} />;
  } else {
    return <CloudIcon fontSize="large" sx={{ color: '#757575' }} />;
  }
};

const Weather = () => {
  const { user } = useContext(AuthContext);
  const [location, setLocation] = useState('');
  const [currentWeather, setCurrentWeather] = useState(null);
  const [forecast, setForecast] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [tabValue, setTabValue] = useState(0);
  const [savedLocations, setSavedLocations] = useState(['New Delhi', 'Mumbai', 'Bangalore']);

  // Initialize location from user's farm location if available
  useEffect(() => {
    if (user?.farmDetails?.location) {
      setLocation(user.farmDetails.location);
      fetchWeatherData(user.farmDetails.location);
    } else if (savedLocations.length > 0) {
      // Default to first saved location if user has no farm location
      setLocation(savedLocations[0]);
      fetchWeatherData(savedLocations[0]);
    }
  }, [user]);

  const fetchWeatherData = async (searchLocation) => {
    setLoading(true);
    setError(null);
    
    try {
      // Fetch current weather and forecast in parallel
      const [currentResponse, forecastResponse] = await Promise.all([
        getCurrentWeather(searchLocation),
        getWeatherForecast(searchLocation, 7)
      ]);
      
      setCurrentWeather(currentResponse.data);
      setForecast(forecastResponse.data);
      
      // Add to saved locations if not already saved
      if (!savedLocations.includes(searchLocation)) {
        setSavedLocations(prev => [searchLocation, ...prev].slice(0, 5)); // Keep max 5 locations
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch weather data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleLocationSearch = (e) => {
    e.preventDefault();
    if (location.trim()) {
      fetchWeatherData(location);
    }
  };

  const handleSavedLocationClick = (loc) => {
    setLocation(loc);
    fetchWeatherData(loc);
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Weather Forecast
        </Typography>
        <Typography variant="body1" color="textSecondary" paragraph>
          Get real-time weather information and forecasts for your farming location.
        </Typography>
      </Box>

      {/* Search and saved locations */}
      <Grid container spacing={2} sx={{ mb: 4 }}>
        <Grid item xs={12} md={8}>
          <Paper component="form" onSubmit={handleLocationSearch} sx={{ p: 2, display: 'flex' }}>
            <TextField
              fullWidth
              label="Enter location"
              value={location}
              onChange={e => setLocation(e.target.value)}
              variant="outlined"
              placeholder="City or District"
              InputProps={{
                startAdornment: <LocationIcon color="action" sx={{ mr: 1 }} />,
              }}
              sx={{ mr: 2 }}
            />
            <Button 
              variant="contained" 
              type="submit"
              disabled={loading || !location.trim()}
              startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <SearchIcon />}
            >
              Search
            </Button>
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2, height: '100%' }}>
            <Typography variant="subtitle2" color="textSecondary" gutterBottom>
              Saved Locations
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {savedLocations.map((loc, index) => (
                <Button
                  key={index}
                  size="small"
                  variant={location === loc ? "contained" : "outlined"}
                  onClick={() => handleSavedLocationClick(loc)}
                  sx={{ minWidth: 'auto' }}
                >
                  {loc}
                </Button>
              ))}
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Error message */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Loading indicator */}
      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      )}

      {/* Weather content */}
      {!loading && currentWeather && forecast && (
        <>
          {/* Current Weather */}
          <Box sx={{ mb: 4 }}>
            <Paper sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <LocationIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="h5">
                  {currentWeather.location.name}, {currentWeather.location.country}
                </Typography>
              </Box>
              
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center',
                    justifyContent: { xs: 'center', md: 'flex-start' },
                    mb: { xs: 2, md: 0 }
                  }}>
                    <Box sx={{ textAlign: 'center', mr: 3 }}>
                      {getWeatherIcon(currentWeather.current.condition.text)}
                      <Typography variant="body2" sx={{ mt: 1 }}>
                        {currentWeather.current.condition.text}
                      </Typography>
                    </Box>
                    <Typography variant="h2" component="p" sx={{ fontWeight: 'bold' }}>
                      {currentWeather.current.temp_c}°C
                    </Typography>
                  </Box>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <List dense>
                    <ListItem>
                      <ListItemIcon>
                        <HumidityIcon color="primary" />
                      </ListItemIcon>
                      <ListItemText 
                        primary="Humidity" 
                        secondary={`${currentWeather.current.humidity}%`}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <WindIcon color="primary" />
                      </ListItemIcon>
                      <ListItemText 
                        primary="Wind" 
                        secondary={`${currentWeather.current.wind_kph} km/h, ${currentWeather.current.wind_dir}`}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <PressureIcon color="primary" />
                      </ListItemIcon>
                      <ListItemText 
                        primary="Pressure" 
                        secondary={`${currentWeather.current.pressure_mb} mb`}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <VisibilityIcon color="primary" />
                      </ListItemIcon>
                      <ListItemText 
                        primary="Visibility" 
                        secondary={`${currentWeather.current.vis_km} km`}
                      />
                    </ListItem>
                  </List>
                </Grid>
              </Grid>
              
              <Box sx={{ mt: 2, textAlign: 'right', color: 'text.secondary' }}>
                <Typography variant="caption">
                  Last updated: {new Date(currentWeather.current.last_updated).toLocaleString()}
                </Typography>
              </Box>
            </Paper>
          </Box>

          {/* Tabs for different forecast views */}
          <Box sx={{ mb: 2 }}>
            <Tabs
              value={tabValue}
              onChange={handleTabChange}
              variant="fullWidth"
              indicatorColor="primary"
              textColor="primary"
            >
              <Tab label="7-Day Forecast" />
              <Tab label="Hourly Forecast" />
              <Tab label="Agricultural Impact" />
            </Tabs>
          </Box>

          {/* 7-Day Forecast */}
          {tabValue === 0 && (
            <Grid container spacing={2}>
              {forecast?.forecast?.forecastday?.map((day, index) => (
                <Grid item xs={6} sm={4} md={3} lg={12/7} key={index}>
                  <Card sx={{ height: '100%' }}>
                    <CardContent sx={{ textAlign: 'center' }}>
                      <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold' }}>
                        {index === 0 ? 'Today' : formatDate(day.date)}
                      </Typography>
                      <Box sx={{ display: 'flex', justifyContent: 'center', mb: 1 }}>
                        {getWeatherIcon(day.day.condition.text)}
                      </Box>
                      <Typography variant="body2" sx={{ mb: 2 }}>
                        {day.day.condition.text}
                      </Typography>
                      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 1 }}>
                        <TemperatureIcon color="error" fontSize="small" />
                        <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                          {day.day.maxtemp_c}°C
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                          / {day.day.mintemp_c}°C
                        </Typography>
                      </Box>
                      <Divider sx={{ my: 1 }} />
                      <Typography variant="body2">
                        Rainfall: {day.day.totalprecip_mm} mm
                      </Typography>
                      <Typography variant="body2">
                        Humidity: {day.day.avghumidity}%
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}

          {/* Hourly Forecast */}
          {tabValue === 1 && (
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Hourly Forecast for Today
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              <Grid container spacing={2}>
                {forecast?.forecast?.forecastday?.[0]?.hour
                  ?.filter((_, index) => index % 3 === 0) // Show every 3 hours
                  .map((hour, index) => {
                    const hourTime = new Date(hour.time);
                    return (
                      <Grid item xs={6} sm={4} md={3} key={index}>
                        <Card sx={{ height: '100%' }}>
                          <CardContent sx={{ textAlign: 'center' }}>
                            <Typography variant="subtitle2" gutterBottom>
                              {hourTime.getHours()}:00
                            </Typography>
                            <Box sx={{ display: 'flex', justifyContent: 'center', mb: 1 }}>
                              {getWeatherIcon(hour.condition.text)}
                            </Box>
                            <Typography variant="h6">
                              {hour.temp_c}°C
                            </Typography>
                            <Typography variant="body2" sx={{ mt: 1 }}>
                              {hour.condition.text}
                            </Typography>
                            <Typography variant="body2" sx={{ mt: 1 }}>
                              Rain: {hour.precip_mm} mm
                            </Typography>
                            <Typography variant="body2">
                              Wind: {hour.wind_kph} km/h
                            </Typography>
                          </CardContent>
                        </Card>
                      </Grid>
                    );
                  })}
              </Grid>
            </Paper>
          )}

          {/* Agricultural Impact */}
          {tabValue === 2 && (
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Agricultural Weather Insights
              </Typography>
              <Divider sx={{ mb: 3 }} />
              
              <Grid container spacing={4}>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold' }}>
                    Irrigation Needs
                  </Typography>
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="body2" paragraph>
                      <strong>Today:</strong> Based on today's forecast ({forecast?.forecast?.forecastday?.[0]?.day?.totalprecip_mm || 0} mm rainfall), 
                      {(forecast?.forecast?.forecastday?.[0]?.day?.totalprecip_mm || 0) > 5 
                        ? " irrigation can be reduced or skipped as rainfall is sufficient."
                        : " supplemental irrigation may be needed for water-intensive crops."
                      }
                    </Typography>
                    <Typography variant="body2" paragraph>
                      <strong>Next 3 Days:</strong> Expected total precipitation of {
                        (forecast?.forecast?.forecastday || []).slice(0, 3)
                          .reduce((sum, day) => sum + (day?.day?.totalprecip_mm || 0), 0).toFixed(1)
                      } mm. Plan irrigation accordingly.
                    </Typography>
                  </Box>
                  
                  <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold', mt: 2 }}>
                    Field Work Suitability
                  </Typography>
                  <Box>
                    <Typography variant="body2">
                      {forecast?.forecast?.forecastday?.[0]?.day?.daily_will_it_rain === 1 
                        ? "Today is not suitable for field operations due to expected rain."
                        : "Today is suitable for field operations including tilling, planting, or harvesting."
                      }
                    </Typography>
                  </Box>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold' }}>
                    Pest and Disease Risk
                  </Typography>
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="body2" paragraph>
                      <strong>Current Conditions:</strong> {
                        currentWeather.current.humidity > 80 && currentWeather.current.temp_c > 25
                          ? "High risk for fungal diseases due to high humidity and temperature."
                          : currentWeather.current.humidity > 80
                            ? "Elevated risk for fungal diseases due to high humidity."
                            : "Standard pest and disease monitoring recommended."
                      }
                    </Typography>
                    <Typography variant="body2">
                      <strong>Recommendation:</strong> {
                        currentWeather.current.humidity > 80
                          ? "Increase monitoring frequency and consider preventative fungicide application."
                          : "Maintain regular pest and disease monitoring schedule."
                      }
                    </Typography>
                  </Box>
                  
                  <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold', mt: 2 }}>
                    Crop Stress Indicators
                  </Typography>
                  <Box>
                    <Typography variant="body2">
                      {currentWeather.current.temp_c > 35
                        ? "Heat stress alert: Consider additional irrigation and shade for sensitive crops."
                        : currentWeather.current.temp_c < 5
                          ? "Cold stress alert: Protect sensitive crops from frost damage."
                          : "Temperature conditions are within optimal range for most crops."
                      }
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </Paper>
          )}
        </>
      )}
    </Container>
  );
};

export default Weather;