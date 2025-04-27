import React, { useState } from 'react';
import { 
  Box, 
  Button, 
  Container, 
  FormControl, 
  FormLabel, 
  Typography, 
  TextField, 
  Select, 
  MenuItem, 
  InputLabel, 
  Card, 
  CardContent, 
  CardHeader, 
  Divider, 
  CircularProgress,
  Alert,
  Paper
} from '@mui/material';
import aiService from '../services/aiService';

const AIAdvisor = () => {
  const [queryType, setQueryType] = useState('general');
  const [prompt, setPrompt] = useState('');
  const [cropType, setCropType] = useState('');
  const [pestType, setPestType] = useState('');
  const [conditions, setConditions] = useState({
    temperature: '',
    humidity: '',
    soilType: 'loamy',
    rainfall: ''
  });
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleConditionChange = (e) => {
    const { name, value } = e.target;
    setConditions(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResponse(null);
    
    try {
      let result;
      
      switch (queryType) {
        case 'farming_advice':
          result = await aiService.generateFarmingAdvice(cropType, conditions);
          break;
        case 'pest_control':
          result = await aiService.generatePestControlRecommendations(pestType, cropType);
          break;
        case 'market_prediction':
          result = await aiService.generateMarketPricePredictions(cropType);
          break;
        case 'general':
        default:
          result = await aiService.generateContent(prompt);
      }
      
      setResponse(result);
    } catch (err) {
      console.error('Error getting AI response:', err);
      setError(err.message || 'Failed to get AI response');
    } finally {
      setLoading(false);
    }
  };

  const renderFormFields = () => {
    switch (queryType) {
      case 'farming_advice':
        return (
          <>
            <FormControl fullWidth margin="normal">
              <TextField
                label="Crop Type"
                placeholder="e.g., Wheat, Rice, Cotton"
                value={cropType}
                onChange={(e) => setCropType(e.target.value)}
                required
                fullWidth
              />
            </FormControl>
            
            <FormControl fullWidth margin="normal">
              <TextField
                label="Temperature (°C)"
                type="number"
                name="temperature"
                value={conditions.temperature}
                onChange={handleConditionChange}
                required
                fullWidth
              />
            </FormControl>
            
            <FormControl fullWidth margin="normal">
              <TextField
                label="Humidity (%)"
                type="number"
                name="humidity"
                value={conditions.humidity}
                onChange={handleConditionChange}
                required
                fullWidth
              />
            </FormControl>
            
            <FormControl fullWidth margin="normal">
              <InputLabel id="soil-type-label">Soil Type</InputLabel>
              <Select
                labelId="soil-type-label"
                label="Soil Type"
                name="soilType"
                value={conditions.soilType}
                onChange={handleConditionChange}
                fullWidth
                required
              >
                <MenuItem value="clayey">Clayey</MenuItem>
                <MenuItem value="loamy">Loamy</MenuItem>
                <MenuItem value="sandy">Sandy</MenuItem>
                <MenuItem value="silty">Silty</MenuItem>
                <MenuItem value="peaty">Peaty</MenuItem>
                <MenuItem value="chalky">Chalky</MenuItem>
              </Select>
            </FormControl>
            
            <FormControl fullWidth margin="normal">
              <TextField
                label="Recent Rainfall (mm)"
                type="number"
                name="rainfall"
                value={conditions.rainfall}
                onChange={handleConditionChange}
                required
                fullWidth
              />
            </FormControl>
          </>
        );
        
      case 'pest_control':
        return (
          <>
            <FormControl fullWidth margin="normal">
              <TextField
                label="Pest Type"
                placeholder="e.g., Aphids, Bollworms, Stem Borers"
                value={pestType}
                onChange={(e) => setPestType(e.target.value)}
                required
                fullWidth
              />
            </FormControl>
            
            <FormControl fullWidth margin="normal">
              <TextField
                label="Crop Type"
                placeholder="e.g., Wheat, Rice, Cotton"
                value={cropType}
                onChange={(e) => setCropType(e.target.value)}
                required
                fullWidth
              />
            </FormControl>
          </>
        );
        
      case 'market_prediction':
        return (
          <FormControl fullWidth margin="normal">
            <TextField
              label="Crop Type"
              placeholder="e.g., Wheat, Rice, Cotton"
              value={cropType}
              onChange={(e) => setCropType(e.target.value)}
              required
              fullWidth
            />
          </FormControl>
        );
        
      case 'general':
      default:
        return (
          <FormControl fullWidth margin="normal">
            <TextField
              label="Your Question"
              placeholder="Ask any farming related question"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              multiline
              rows={4}
              required
              fullWidth
            />
          </FormControl>
        );
    }
  };

  const renderResponse = () => {
    if (loading) {
      return (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 5 }}>
          <CircularProgress size={60} />
          <Typography variant="body1" sx={{ mt: 2 }}>Getting AI-powered insights...</Typography>
        </Box>
      );
    }
    
    if (error) {
      return (
        <Alert severity="error" sx={{ mt: 2 }}>
          <Typography variant="subtitle1">Error:</Typography>
          <Typography variant="body2">{error}</Typography>
        </Alert>
      );
    }
    
    if (response) {
      // Extract the text content from the Gemini API response structure
      const content = response.candidates?.[0]?.content?.parts?.[0]?.text || 
                      'No response content available';
                      
      return (
        <Card variant="outlined" sx={{ mt: 3 }}>
          <CardHeader title="AI Advisor Response" />
          <Divider />
          <CardContent>
            <Typography variant="body1" component="div" sx={{ whiteSpace: 'pre-wrap' }}>
              {content}
            </Typography>
          </CardContent>
        </Card>
      );
    }
    
    return null;
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        AI Farming Advisor
      </Typography>
      
      <Paper elevation={2} sx={{ p: 3, mb: 4 }}>
        <form onSubmit={handleSubmit}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <FormControl fullWidth margin="normal">
              <InputLabel id="query-type-label">What would you like advice on?</InputLabel>
              <Select
                labelId="query-type-label"
                label="What would you like advice on?"
                value={queryType}
                onChange={(e) => setQueryType(e.target.value)}
                fullWidth
              >
                <MenuItem value="general">General Farming Question</MenuItem>
                <MenuItem value="farming_advice">Crop-Specific Farming Advice</MenuItem>
                <MenuItem value="pest_control">Pest Control Recommendations</MenuItem>
                <MenuItem value="market_prediction">Market Price Predictions</MenuItem>
              </Select>
            </FormControl>
            
            {renderFormFields()}
            
            <Button 
              type="submit" 
              variant="contained" 
              color="primary"
              size="large"
              disabled={loading}
              sx={{ mt: 2 }}
            >
              {loading ? 'Getting Advice...' : 'Get AI Advice'}
            </Button>
          </Box>
        </form>
      </Paper>
      
      {renderResponse()}
    </Container>
  );
};

export default AIAdvisor;