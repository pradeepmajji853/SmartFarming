import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Container,
  Typography,
  Paper,
  Box,
  Grid,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  CircularProgress,
  Alert,
  Chip,
  Divider
} from '@mui/material';
import {
  TrendingUp as TrendingIcon,
  FilterList as FilterIcon,
  Search as SearchIcon,
  ArrowUpward as IncreaseIcon,
  ArrowDownward as DecreaseIcon,
  RemoveCircleOutline as StableIcon
} from '@mui/icons-material';
import { getMarketPrices } from '../services/marketService';

const Market = () => {
  const [marketData, setMarketData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [filters, setFilters] = useState({
    cropName: '',
    location: '',
    marketType: ''
  });

  // Mock locations for filters
  const locations = ['Delhi', 'Mumbai', 'Kolkata', 'Chennai', 'Bangalore', 'Hyderabad'];
  
  // Mock market types for filters
  const marketTypes = ['Wholesale', 'Retail', 'Farmer\'s Market'];

  useEffect(() => {
    fetchMarketData();
  }, []);

  const fetchMarketData = async () => {
    try {
      setLoading(true);
      const response = await getMarketPrices();
      // Ensure marketData is always an array
      if (Array.isArray(response.data)) {
        setMarketData(response.data);
      } else {
        console.warn("Market data is not an array:", response.data);
        setMarketData([]);
      }
      setError(null);
    } catch (err) {
      console.error('Error fetching market data:', err);
      setError('Failed to load market price data. Please try again later.');
      setMarketData([]);
    } finally {
      setLoading(false);
    }
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleFilterChange = (event) => {
    const { name, value } = event.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleApplyFilters = async () => {
    try {
      setLoading(true);
      const response = await getMarketPrices(filters);
      // Ensure marketData is always an array
      if (Array.isArray(response.data)) {
        setMarketData(response.data);
      } else {
        console.warn("Market data is not an array:", response.data);
        setMarketData([]);
      }
      setError(null);
    } catch (err) {
      console.error('Error applying filters:', err);
      setError('Error applying filters. Please try again.');
      setMarketData([]);
    } finally {
      setLoading(false);
    }
  };

  const handleClearFilters = () => {
    setFilters({
      cropName: '',
      location: '',
      marketType: ''
    });
    fetchMarketData();
  };

  // Calculate price trend
  const getPriceTrend = (item) => {
    // This would normally use historical data to calculate the trend
    // For demo purposes, we'll use a random value
    const trendValue = item.priceTrend || (Math.random() * 10) - 5;
    
    if (trendValue > 1) {
      return { icon: <IncreaseIcon fontSize="small" color="error" />, text: `+${trendValue.toFixed(1)}%`, color: 'error' };
    } else if (trendValue < -1) {
      return { icon: <DecreaseIcon fontSize="small" color="success" />, text: `${trendValue.toFixed(1)}%`, color: 'success' };
    } else {
      return { icon: <StableIcon fontSize="small" color="info" />, text: 'Stable', color: 'info' };
    }
  };

  const filteredData = marketData.filter(item => 
    (filters.cropName ? item.cropName.toLowerCase().includes(filters.cropName.toLowerCase()) : true) &&
    (filters.location ? item.location === filters.location : true) &&
    (filters.marketType ? item.marketType === filters.marketType : true)
  );

  return (
    <Container maxWidth="xl">
      <Typography variant="h4" component="h1" gutterBottom>
        Market Prices
      </Typography>
      
      <Typography variant="subtitle1" color="textSecondary" paragraph>
        Track current market prices for different crops across various markets
      </Typography>

      {/* Filters Section */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <FilterIcon sx={{ mr: 1 }} color="primary" />
          <Typography variant="h6">Filters</Typography>
        </Box>
        
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              label="Crop Name"
              name="cropName"
              value={filters.cropName}
              onChange={handleFilterChange}
              variant="outlined"
              InputProps={{
                startAdornment: <SearchIcon color="action" fontSize="small" sx={{ mr: 1 }} />,
              }}
            />
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth variant="outlined">
              <InputLabel>Location</InputLabel>
              <Select
                name="location"
                value={filters.location}
                onChange={handleFilterChange}
                label="Location"
              >
                <MenuItem value="">
                  <em>Any</em>
                </MenuItem>
                {locations.map(location => (
                  <MenuItem key={location} value={location}>{location}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth variant="outlined">
              <InputLabel>Market Type</InputLabel>
              <Select
                name="marketType"
                value={filters.marketType}
                onChange={handleFilterChange}
                label="Market Type"
              >
                <MenuItem value="">
                  <em>Any</em>
                </MenuItem>
                {marketTypes.map(type => (
                  <MenuItem key={type} value={type}>{type}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                variant="contained"
                color="primary"
                onClick={handleApplyFilters}
                fullWidth
              >
                Apply
              </Button>
              <Button
                variant="outlined"
                onClick={handleClearFilters}
              >
                Clear
              </Button>
            </Box>
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

      {/* Market Data Table */}
      {!loading && !error && (
        <Paper sx={{ width: '100%', overflow: 'hidden' }}>
          <TableContainer>
            <Table stickyHeader aria-label="market prices table">
              <TableHead>
                <TableRow>
                  <TableCell>Crop</TableCell>
                  <TableCell>Price (₹/unit)</TableCell>
                  <TableCell>Price Trend</TableCell>
                  <TableCell>Location</TableCell>
                  <TableCell>Market Type</TableCell>
                  <TableCell>Date Updated</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredData
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((item, index) => {
                    const trend = getPriceTrend(item);
                    
                    return (
                      <TableRow hover key={index}>
                        <TableCell component="th" scope="row">
                          {item.cropName}
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" fontWeight="bold">
                            ₹{item.price}/{item.unit}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            size="small"
                            icon={trend.icon}
                            label={trend.text}
                            color={trend.color}
                            variant="outlined"
                          />
                        </TableCell>
                        <TableCell>{item.location}</TableCell>
                        <TableCell>{item.marketType}</TableCell>
                        <TableCell>{new Date(item.date).toLocaleDateString()}</TableCell>
                        <TableCell align="right">
                          <Button
                            size="small"
                            variant="outlined"
                            component={Link}
                            to={`/market/trends/${item.cropName}`}
                            startIcon={<TrendingIcon />}
                          >
                            View Trends
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                
                {filteredData.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} align="center">
                      <Typography variant="body1" sx={{ py: 2 }}>
                        No market data available.
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
          
          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={filteredData.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </Paper>
      )}
    </Container>
  );
};

export default Market;