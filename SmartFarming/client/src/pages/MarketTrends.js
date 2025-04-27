import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Container,
  Typography,
  Paper,
  Box,
  Grid,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Alert,
  Divider,
  Chip,
  TableContainer,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell
} from '@mui/material';
import {
  ArrowBack as BackIcon,
  TrendingUp as TrendingIcon,
  CompareArrows as CompareIcon,
  LocationOn as LocationIcon
} from '@mui/icons-material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { getMarketTrends, compareMarketPrices } from '../services/marketService';

const MarketTrends = () => {
  const { crop } = useParams();
  const [trendData, setTrendData] = useState([]);
  const [locationData, setLocationData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedLocation, setSelectedLocation] = useState('');
  const [timeRange, setTimeRange] = useState(30);
  const [showComparison, setShowComparison] = useState(false);

  // Mock locations for dropdowns
  const locations = ['Delhi', 'Mumbai', 'Kolkata', 'Chennai', 'Bangalore', 'Hyderabad'];

  useEffect(() => {
    fetchTrendData();
  }, [crop, selectedLocation, timeRange]);

  const fetchTrendData = async () => {
    try {
      setLoading(true);
      const response = await getMarketTrends(crop, selectedLocation, timeRange);
      setTrendData(response.data || []);
      setError(null);
    } catch (err) {
      console.error('Error fetching trend data:', err);
      setError('Failed to load market trend data. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleLocationCompare = async () => {
    try {
      setLoading(true);
      const selectedLocations = locations.slice(0, 4); // For demo, compare top 4 locations
      const response = await compareMarketPrices(crop, selectedLocations);
      setLocationData(response.data || []);
      setShowComparison(true);
      setError(null);
    } catch (err) {
      console.error('Error fetching comparison data:', err);
      setError('Failed to load comparison data. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleLocationChange = (event) => {
    setSelectedLocation(event.target.value);
  };

  const handleTimeRangeChange = (event) => {
    setTimeRange(event.target.value);
  };

  // Generate mock data for the chart if no data is available
  const generateMockData = () => {
    const mockData = [];
    const today = new Date();
    for (let i = timeRange; i >= 0; i--) {
      const date = new Date();
      date.setDate(today.getDate() - i);
      mockData.push({
        date: date.toLocaleDateString(),
        price: Math.floor(Math.random() * (100 - 50) + 50)
      });
    }
    return mockData;
  };

  const chartData = trendData.length > 0 ? trendData : generateMockData();

  return (
    <Container maxWidth="xl">
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <Button component={Link} to="/market" startIcon={<BackIcon />} sx={{ mr: 2 }}>
          Back to Market Prices
        </Button>
        <Typography variant="h4" component="h1">
          {crop} Price Trends
        </Typography>
      </Box>

      <Typography variant="subtitle1" color="textSecondary" paragraph>
        Track how market prices for {crop} have changed over time
      </Typography>

      {/* Filters and Options */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={3}>
            <FormControl fullWidth variant="outlined">
              <InputLabel>Location</InputLabel>
              <Select
                value={selectedLocation}
                onChange={handleLocationChange}
                label="Location"
              >
                <MenuItem value="">
                  <em>All Locations</em>
                </MenuItem>
                {locations.map(location => (
                  <MenuItem key={location} value={location}>{location}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={3}>
            <FormControl fullWidth variant="outlined">
              <InputLabel>Time Range</InputLabel>
              <Select
                value={timeRange}
                onChange={handleTimeRangeChange}
                label="Time Range"
              >
                <MenuItem value={7}>Last 7 Days</MenuItem>
                <MenuItem value={30}>Last 30 Days</MenuItem>
                <MenuItem value={90}>Last 3 Months</MenuItem>
                <MenuItem value={180}>Last 6 Months</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={4}>
            <Button
              fullWidth
              variant="outlined"
              color="primary"
              startIcon={<CompareIcon />}
              onClick={handleLocationCompare}
            >
              Compare Locations
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Error Message */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Loading Indicator */}
      {loading && (
        <Box display="flex" justifyContent="center" my={4}>
          <CircularProgress />
        </Box>
      )}

      {/* Price Trend Chart */}
      {!loading && !error && (
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Price Trend for {crop} {selectedLocation ? `in ${selectedLocation}` : '(All Locations)'}
          </Typography>
          <Divider sx={{ mb: 2 }} />

          <Box sx={{ height: 400 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={chartData}
                margin={{
                  top: 5,
                  right: 30,
                  left: 20,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis 
                  label={{ value: 'Price (₹)', angle: -90, position: 'insideLeft' }} 
                />
                <Tooltip formatter={(value) => `₹${value}`} />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="price"
                  stroke="#2e7d32"
                  activeDot={{ r: 8 }}
                  name="Price"
                />
              </LineChart>
            </ResponsiveContainer>
          </Box>
        </Paper>
      )}

      {/* Location Comparison */}
      {!loading && !error && showComparison && (
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Price Comparison by Location
          </Typography>
          <Divider sx={{ mb: 2 }} />

          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Location</TableCell>
                  <TableCell>Current Price (₹/kg)</TableCell>
                  <TableCell>Average Price (₹/kg)</TableCell>
                  <TableCell>Price Trend</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {locations.slice(0, 4).map((location, index) => (
                  <TableRow key={location}>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <LocationIcon sx={{ mr: 1 }} fontSize="small" color="action" />
                        {location}
                      </Box>
                    </TableCell>
                    <TableCell>₹{Math.floor(Math.random() * (120 - 50) + 50)}</TableCell>
                    <TableCell>₹{Math.floor(Math.random() * (110 - 60) + 60)}</TableCell>
                    <TableCell>
                      <Chip 
                        size="small"
                        icon={<TrendingIcon />}
                        label={`${Math.random() > 0.5 ? '+' : '-'}${(Math.random() * 10).toFixed(1)}%`}
                        color={Math.random() > 0.5 ? 'error' : 'success'}
                        variant="outlined"
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          
          <Box sx={{ mt: 2, textAlign: 'center' }}>
            <Typography variant="body2" color="textSecondary">
              Note: These are indicative prices and may vary based on quality and specific market conditions.
            </Typography>
          </Box>
        </Paper>
      )}
    </Container>
  );
};

export default MarketTrends;