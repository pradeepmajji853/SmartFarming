import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { 
  Container, 
  Typography, 
  Grid, 
  Card, 
  CardContent, 
  CardActions, 
  Button, 
  Box, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem, 
  TextField,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Chip,
  Divider,
  CircularProgress,
  Alert,
  Paper,
  Snackbar
} from '@mui/material';
import { 
  FilterList as FilterIcon,
  Search as SearchIcon,
  Agriculture as CropIcon,
  WaterDrop as WaterIcon,
  Terrain as SoilIcon,
  Thermostat as TempIcon,
  Psychology as AIIcon,
  LocationOn as LocationIcon
} from '@mui/icons-material';
import { getCropRecommendations } from '../services/cropService';
import { AuthContext } from '../context/AuthContext';
import { getCurrentWeather } from '../services/weatherService';

const Crops = () => {
  const { user } = useContext(AuthContext);
  const [crops, setCrops] = useState([]);
  const [filteredCrops, setFilteredCrops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isRecommendationMode, setIsRecommendationMode] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  
  // Filter states
  const [filters, setFilters] = useState({
    season: '',
    soilType: '',
    waterRequirement: [],
    temperature: '',
    location: user?.farmDetails?.location || 'New Delhi'
  });
  
  // Soil type options
  const soilTypes = ['Clayey', 'Sandy', 'Loamy', 'Silty', 'Peaty', 'Chalky', 'Black'];
  
  // Water requirement options
  const waterRequirements = ['low', 'medium', 'high'];
  
  // Season options
  const seasons = ['spring', 'summer', 'fall', 'winter', 'all'];

  useEffect(() => {
    // Load initial AI-powered recommendations on component mount
    loadAIRecommendations();
  }, []);

  // Load AI-powered crop recommendations
  const loadAIRecommendations = async () => {
    try {
      setLoading(true);
      setIsRecommendationMode(true);
      
      // Get current season
      const currentSeason = getCurrentSeason();
      
      // Get user's location from context or use default
      const location = user?.farmDetails?.location || 'New Delhi';
      
      // Get user's soil type from context or use default
      const soilType = user?.farmDetails?.soilType || 'Loamy';
      
      // Try to get real temperature data from weather API
      let temperature;
      try {
        const weatherResponse = await getCurrentWeather(location);
        temperature = weatherResponse.data?.current?.temp_c;
      } catch (err) {
        // Fallback temperature based on season if weather API fails
        temperature = getDefaultTemperatureForSeason(currentSeason);
      }
      
      // Get recommendations based on current conditions
      const response = await getCropRecommendations({
        season: currentSeason,
        soilType: soilType,
        temperature: temperature,
        location: location
      });
      
      setCrops(response.data);
      setFilteredCrops(response.data);
      
      // Update filters to match the recommendation parameters
      setFilters(prev => ({
        ...prev,
        season: currentSeason,
        soilType: soilType,
        temperature: temperature?.toString() || '',
        location: location
      }));
      
      setSnackbarMessage('AI-powered crop recommendations loaded based on your location and current conditions.');
      setSnackbarOpen(true);
      setError(null);
    } catch (err) {
      setError(err.message || 'Failed to get AI recommendations');
      setCrops([]);
      setFilteredCrops([]);
    } finally {
      setLoading(false);
    }
  };

  // Get the current season based on the month
  const getCurrentSeason = () => {
    const month = new Date().getMonth();
    if (month >= 2 && month <= 4) return 'spring';
    if (month >= 5 && month <= 7) return 'summer';
    if (month >= 8 && month <= 10) return 'fall';
    return 'winter';
  };
  
  // Get default temperature for a season
  const getDefaultTemperatureForSeason = (season) => {
    switch (season) {
      case 'summer': return 30;
      case 'spring': return 25;
      case 'fall': return 20;
      case 'winter': return 15;
      default: return 25;
    }
  };

  // Handle search and filter changes
  useEffect(() => {
    if (crops.length === 0) return;

    let result = [...crops];
    
    // Apply search filter
    if (searchTerm) {
      const searchTermLower = searchTerm.toLowerCase();
      result = result.filter(crop => 
        crop.name.toLowerCase().includes(searchTermLower) || 
        (crop.benefits && crop.benefits.toLowerCase().includes(searchTermLower))
      );
    }
    
    // Apply season filter
    if (filters.season) {
      result = result.filter(crop => {
        if (!crop.season) return true;
        return crop.season.toLowerCase().includes(filters.season.toLowerCase()) || 
               crop.season.toLowerCase().includes('all');
      });
    }
    
    // Apply soil type filter
    if (filters.soilType) {
      result = result.filter(crop => {
        if (!crop.soilType) return true;
        return crop.soilType.toLowerCase().includes(filters.soilType.toLowerCase());
      });
    }
    
    // Apply water requirement filter
    if (filters.waterRequirement.length > 0) {
      result = result.filter(crop => {
        if (!crop.waterRequirement) return true;
        return filters.waterRequirement.some(req => 
          crop.waterRequirement.toLowerCase().includes(req)
        );
      });
    }
    
    // Apply temperature filter - for LLM generated data which has temperature as a range string
    if (filters.temperature) {
      const targetTemp = parseFloat(filters.temperature);
      result = result.filter(crop => {
        if (!crop.temperature) return true;
        
        // Try to extract min-max from the temperature range string
        const rangeMatch = crop.temperature.match(/(\d+)\s*-\s*(\d+)/);
        if (rangeMatch) {
          const min = parseFloat(rangeMatch[1]);
          const max = parseFloat(rangeMatch[2]);
          return targetTemp >= min && targetTemp <= max;
        }
        
        return true;
      });
    }
    
    setFilteredCrops(result);
  }, [crops, searchTerm, filters]);

  // Handle search input change
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  // Handle filter changes
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle water requirement checkbox changes
  const handleWaterRequirementChange = (requirement) => {
    setFilters(prev => {
      const currentRequirements = [...prev.waterRequirement];
      
      if (currentRequirements.includes(requirement)) {
        return {
          ...prev,
          waterRequirement: currentRequirements.filter(req => req !== requirement)
        };
      } else {
        return {
          ...prev,
          waterRequirement: [...currentRequirements, requirement]
        };
      }
    });
  };

  // Clear all filters
  const handleClearFilters = () => {
    setFilters({
      season: '',
      soilType: '',
      waterRequirement: [],
      temperature: '',
      location: user?.farmDetails?.location || 'New Delhi'
    });
    setSearchTerm('');
  };

  // Get custom recommendations based on user inputs
  const handleGetCustomRecommendations = async () => {
    try {
      setLoading(true);
      setIsRecommendationMode(true);
      
      // Get recommendations based on current filters
      const response = await getCropRecommendations({
        season: filters.season || getCurrentSeason(),
        soilType: filters.soilType,
        temperature: filters.temperature || getDefaultTemperatureForSeason(getCurrentSeason()),
        location: filters.location
      });
      
      setCrops(response.data);
      setFilteredCrops(response.data);
      
      setSnackbarMessage('Custom AI recommendations generated successfully!');
      setSnackbarOpen(true);
      setError(null);
    } catch (err) {
      setError(err.message || 'Failed to get custom recommendations');
    } finally {
      setLoading(false);
    }
  };

  // Handle snackbar close
  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          AI-Powered Crop Recommendations
        </Typography>
        <Typography variant="body1" color="textSecondary" paragraph>
          Get personalized crop suggestions from our AI based on your local conditions and preferences.
        </Typography>
      </Box>

      {/* Smart Recommendation Banner */}
      <Box sx={{ mb: 4 }}>
        <Paper sx={{ p: 3, backgroundImage: 'linear-gradient(to right, #2e7d32, #60ad5e)', color: 'white' }}>
          <Grid container alignItems="center" spacing={2}>
            <Grid item xs={12} md={8}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <AIIcon sx={{ mr: 1 }} />
                <Typography variant="h6">
                  Gemini AI Crop Recommendation Engine
                </Typography>
              </Box>
              <Typography variant="body2">
                Our AI analyzes your location, current season, weather conditions, and soil type to suggest the most suitable crops for planting right now.
              </Typography>
            </Grid>
            <Grid item xs={12} md={4} sx={{ display: 'flex', justifyContent: { xs: 'flex-start', md: 'flex-end' } }}>
              <Button
                variant="contained"
                color="secondary"
                size="large"
                onClick={loadAIRecommendations}
                disabled={loading}
                sx={{ color: 'white', fontWeight: 'bold' }}
              >
                {loading ? 'Loading...' : 'Get AI Recommendations'}
              </Button>
            </Grid>
          </Grid>
        </Paper>
      </Box>

      {/* Search and Filters */}
      <Box sx={{ mb: 2 }}>
        <Typography variant="h6" gutterBottom>
          {isRecommendationMode ? 'Refine AI Recommendations' : 'Search & Filter Crops'}
        </Typography>
      </Box>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* Search Field */}
        <Grid item xs={12} md={4}>
          <TextField
            fullWidth
            label="Search Crops"
            variant="outlined"
            value={searchTerm}
            onChange={handleSearchChange}
            InputProps={{
              startAdornment: <SearchIcon color="action" sx={{ mr: 1 }} />,
            }}
          />
        </Grid>

        {/* Season Filter */}
        <Grid item xs={12} sm={6} md={2}>
          <FormControl fullWidth variant="outlined">
            <InputLabel id="season-label">Season</InputLabel>
            <Select
              labelId="season-label"
              id="season"
              name="season"
              value={filters.season}
              onChange={handleFilterChange}
              label="Season"
            >
              <MenuItem value="">
                <em>Any</em>
              </MenuItem>
              {seasons.map(season => (
                <MenuItem key={season} value={season}>
                  {season.charAt(0).toUpperCase() + season.slice(1)}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        {/* Soil Type Filter */}
        <Grid item xs={12} sm={6} md={2}>
          <FormControl fullWidth variant="outlined">
            <InputLabel id="soil-type-label">Soil Type</InputLabel>
            <Select
              labelId="soil-type-label"
              id="soilType"
              name="soilType"
              value={filters.soilType}
              onChange={handleFilterChange}
              label="Soil Type"
            >
              <MenuItem value="">
                <em>Any</em>
              </MenuItem>
              {soilTypes.map(soil => (
                <MenuItem key={soil} value={soil}>
                  {soil}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        {/* Temperature Filter */}
        <Grid item xs={12} sm={6} md={2}>
          <TextField
            fullWidth
            label="Temperature (°C)"
            variant="outlined"
            type="number"
            name="temperature"
            value={filters.temperature}
            onChange={handleFilterChange}
            InputProps={{
              startAdornment: <TempIcon color="action" sx={{ mr: 1 }} />,
            }}
          />
        </Grid>

        {/* Location Field */}
        <Grid item xs={12} sm={6} md={2}>
          <TextField
            fullWidth
            label="Location"
            variant="outlined"
            name="location"
            value={filters.location}
            onChange={handleFilterChange}
            InputProps={{
              startAdornment: <LocationIcon color="action" sx={{ mr: 1 }} />,
            }}
          />
        </Grid>
      </Grid>

      {/* Water Requirements Filter */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="subtitle2" gutterBottom>
          Water Requirement:
        </Typography>
        <FormGroup row>
          {waterRequirements.map(req => (
            <FormControlLabel
              key={req}
              control={
                <Checkbox
                  checked={filters.waterRequirement.includes(req)}
                  onChange={() => handleWaterRequirementChange(req)}
                  color="primary"
                />
              }
              label={req.charAt(0).toUpperCase() + req.slice(1)}
            />
          ))}
        </FormGroup>
      </Box>

      {/* Action Buttons */}
      <Box sx={{ display: 'flex', gap: 2, mb: 4 }}>
        <Button
          variant="outlined"
          onClick={handleClearFilters}
          startIcon={<FilterIcon />}
        >
          Clear Filters
        </Button>

        <Button
          variant="contained"
          color="primary"
          onClick={handleGetCustomRecommendations}
          disabled={loading}
          startIcon={<AIIcon />}
        >
          Generate Custom AI Recommendations
        </Button>
      </Box>

      {/* Error Message */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Loading Indicator */}
      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      )}

      {/* Results Count */}
      {!loading && (
        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle1">
            {filteredCrops.length} crops found
            {filters.season && ` for ${filters.season} season`}
            {filters.soilType && ` in ${filters.soilType} soil`}
            {filters.location && ` in ${filters.location}`}
            {isRecommendationMode && ' with AI recommendations'}
          </Typography>
        </Box>
      )}

      {/* Results */}
      {!loading && filteredCrops.length > 0 ? (
        <Grid container spacing={3}>
          {filteredCrops.map(crop => (
            <Grid item xs={12} sm={6} md={4} key={crop._id}>
              <Card sx={{ 
                height: '100%', 
                display: 'flex', 
                flexDirection: 'column',
                transition: 'transform 0.2s',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: 3
                } 
              }}>
                <CardContent sx={{ flexGrow: 1 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <Typography variant="h6" component="h2" gutterBottom>
                      {crop.name}
                    </Typography>
                    <Chip
                      label={crop.season ? crop.season.charAt(0).toUpperCase() + crop.season.slice(1) : 'All Seasons'}
                      size="small"
                      color="primary"
                      variant="outlined"
                    />
                  </Box>
                  
                  {crop.benefits && (
                    <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                      {crop.benefits.substring(0, 120)}
                      {crop.benefits.length > 120 ? '...' : ''}
                    </Typography>
                  )}
                  
                  <Divider sx={{ my: 1.5 }} />
                  
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                    {crop.soilType && (
                      <Chip
                        icon={<SoilIcon fontSize="small" />}
                        label={crop.soilType}
                        size="small"
                        variant="outlined"
                      />
                    )}
                    {crop.waterRequirement && (
                      <Chip
                        icon={<WaterIcon fontSize="small" />}
                        label={`${crop.waterRequirement} water`}
                        size="small"
                        color={
                          crop.waterRequirement.toLowerCase().includes('low') ? 'success' : 
                          crop.waterRequirement.toLowerCase().includes('medium') ? 'warning' : 'error'
                        }
                        variant="outlined"
                      />
                    )}
                    {crop.temperature && (
                      <Chip
                        icon={<TempIcon fontSize="small" />}
                        label={crop.temperature}
                        size="small"
                        variant="outlined"
                      />
                    )}
                  </Box>
                  
                  {crop.duration && (
                    <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center' }}>
                      <CropIcon fontSize="small" sx={{ mr: 0.5, color: 'success.main' }} />
                      Growth period: {crop.duration}
                    </Typography>
                  )}
                  
                  {crop.yield && (
                    <Typography variant="body2" sx={{ mt: 1 }}>
                      Expected yield: {crop.yield}
                    </Typography>
                  )}
                </CardContent>
                {isRecommendationMode && (
                  <Box sx={{ px: 2, pb: 1 }}>
                    <Chip
                      icon={<AIIcon fontSize="small" />}
                      label="AI Recommended"
                      size="small"
                      color="secondary"
                    />
                  </Box>
                )}
                <CardActions>
                  <Button size="small" component={Link} to={`/ai-advisor?crop=${encodeURIComponent(crop.name)}`}>
                    Get AI Advice
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      ) : !loading && (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography variant="h6" color="textSecondary">
            No crops found matching your criteria
          </Typography>
          <Button 
            variant="outlined" 
            sx={{ mt: 2 }}
            onClick={handleClearFilters}
          >
            Clear Filters
          </Button>
        </Box>
      )}

      {/* Notification Snackbar */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        message={snackbarMessage}
      />
    </Container>
  );
};

export default Crops;