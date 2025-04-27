import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { 
  Container, 
  Typography, 
  Box, 
  Grid, 
  Card, 
  CardContent, 
  CardActions, 
  Button, 
  TextField, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem, 
  InputAdornment,
  Chip,
  Divider,
  Alert,
  CircularProgress,
  Paper
} from '@mui/material';
import {
  Search as SearchIcon,
  FilterList as FilterIcon,
  Add as AddIcon,
  LocationOn as LocationIcon,
  ShoppingBag as ProductIcon,
  AttachMoney as PriceIcon
} from '@mui/icons-material';
import { AuthContext } from '../context/AuthContext';
import { getAllListings } from '../services/marketplaceService';

const DigitalMarket = () => {
  const { user } = useContext(AuthContext);
  const [listings, setListings] = useState([]);
  const [filteredListings, setFilteredListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filter states
  const [filters, setFilters] = useState({
    cropName: '',
    location: '',
    minPrice: '',
    maxPrice: '',
    quality: ''
  });

  // Quality options
  const qualityOptions = ['Premium', 'A', 'B', 'C', 'Regular', 'Economy'];

  useEffect(() => {
    const fetchListings = async () => {
      try {
        setLoading(true);
        const response = await getAllListings({ status: 'active' });
        setListings(response.data);
        setFilteredListings(response.data);
        setError(null);
      } catch (err) {
        setError(err.message || 'Failed to fetch listings');
      } finally {
        setLoading(false);
      }
    };

    fetchListings();
  }, []);

  // Handle filter changes
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prevFilters => ({
      ...prevFilters,
      [name]: value
    }));
  };

  // Apply filters
  const handleApplyFilters = async () => {
    try {
      setLoading(true);
      const activeFilters = Object.fromEntries(
        Object.entries(filters).filter(([key, value]) => value !== '')
      );
      
      const response = await getAllListings({
        ...activeFilters,
        status: 'active'
      });
      
      setFilteredListings(response.data);
      setError(null);
    } catch (err) {
      setError(err.message || 'Error applying filters');
    } finally {
      setLoading(false);
    }
  };

  // Clear all filters
  const handleClearFilters = () => {
    setFilters({
      cropName: '',
      location: '',
      minPrice: '',
      maxPrice: '',
      quality: ''
    });
    
    // Reset to all listings
    setFilteredListings(listings);
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Digital Marketplace
        </Typography>
        <Typography variant="subtitle1" color="textSecondary" paragraph>
          Browse and connect directly with farmers to purchase quality agricultural produce.
        </Typography>
      </Box>

      <Grid container spacing={4}>
        {/* Left side - Filters */}
        <Grid item xs={12} md={3}>
          <Paper sx={{ p: 3, mb: { xs: 3, md: 0 } }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <FilterIcon sx={{ mr: 1 }} color="primary" />
              <Typography variant="h6">Filters</Typography>
            </Box>
            <Divider sx={{ mb: 3 }} />

            <FormControl fullWidth margin="normal" variant="outlined">
              <TextField
                label="Crop Name"
                name="cropName"
                value={filters.cropName}
                onChange={handleFilterChange}
                variant="outlined"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <ProductIcon fontSize="small" />
                    </InputAdornment>
                  ),
                }}
                fullWidth
              />
            </FormControl>

            <FormControl fullWidth margin="normal" variant="outlined">
              <TextField
                label="Location"
                name="location"
                value={filters.location}
                onChange={handleFilterChange}
                variant="outlined"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LocationIcon fontSize="small" />
                    </InputAdornment>
                  ),
                }}
                fullWidth
              />
            </FormControl>

            <Box sx={{ display: 'flex', gap: 1, mb: 2, mt: 2 }}>
              <TextField
                label="Min Price"
                name="minPrice"
                value={filters.minPrice}
                onChange={handleFilterChange}
                variant="outlined"
                type="number"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      ₹
                    </InputAdornment>
                  ),
                }}
              />
              <TextField
                label="Max Price"
                name="maxPrice"
                value={filters.maxPrice}
                onChange={handleFilterChange}
                variant="outlined"
                type="number"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      ₹
                    </InputAdornment>
                  ),
                }}
              />
            </Box>

            <FormControl fullWidth margin="normal" variant="outlined">
              <InputLabel id="quality-label">Quality</InputLabel>
              <Select
                labelId="quality-label"
                id="quality"
                name="quality"
                value={filters.quality}
                onChange={handleFilterChange}
                label="Quality"
              >
                <MenuItem value="">
                  <em>Any</em>
                </MenuItem>
                {qualityOptions.map(quality => (
                  <MenuItem key={quality} value={quality}>{quality}</MenuItem>
                ))}
              </Select>
            </FormControl>

            <Box sx={{ mt: 3, display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Button
                variant="contained"
                color="primary"
                onClick={handleApplyFilters}
                startIcon={<SearchIcon />}
                fullWidth
              >
                Apply Filters
              </Button>
              <Button
                variant="outlined"
                onClick={handleClearFilters}
                fullWidth
              >
                Clear Filters
              </Button>
            </Box>

            {user && user.role === 'farmer' && (
              <Box sx={{ mt: 3, pt: 2, borderTop: 1, borderColor: 'divider' }}>
                <Button
                  component={Link}
                  to="/market-access/new-listing"
                  variant="contained"
                  color="secondary"
                  startIcon={<AddIcon />}
                  fullWidth
                >
                  Add New Listing
                </Button>
                <Button
                  component={Link}
                  to="/market-access/my-listings"
                  variant="outlined"
                  sx={{ mt: 1 }}
                  fullWidth
                >
                  My Listings
                </Button>
              </Box>
            )}

            {user && (
              <Box sx={{ mt: 2 }}>
                <Button
                  component={Link}
                  to="/market-access/my-offers"
                  variant="outlined"
                  color="primary"
                  sx={{ mt: 1 }}
                  fullWidth
                >
                  My Offers
                </Button>
              </Box>
            )}
          </Paper>
        </Grid>

        {/* Right side - Listings */}
        <Grid item xs={12} md={9}>
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

          {/* Results count */}
          {!loading && (
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle1">
                {filteredListings.length} listings found
                {filters.cropName && ` for "${filters.cropName}"`}
                {filters.location && ` in ${filters.location}`}
              </Typography>
            </Box>
          )}

          {/* No results message */}
          {!loading && filteredListings.length === 0 && (
            <Alert severity="info">
              No product listings match your criteria. Try adjusting your filters or check back later.
            </Alert>
          )}

          {/* Listings grid */}
          {!loading && filteredListings.length > 0 && (
            <Grid container spacing={3}>
              {filteredListings.map(listing => (
                <Grid item xs={12} sm={6} md={4} key={listing._id}>
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
                    {/* Add image if available */}
                    {listing.images && listing.images.length > 0 && (
                      <Box sx={{ position: 'relative', pt: '56.25%', overflow: 'hidden' }}>
                        <Box
                          component="img"
                          src={listing.images[0]}
                          alt={listing.cropName}
                          sx={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                          }}
                        />
                      </Box>
                    )}
                    
                    <CardContent sx={{ flexGrow: 1 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                        <Typography variant="h6" component="h2">
                          {listing.cropName}
                        </Typography>
                        <Chip 
                          label={listing.quality} 
                          size="small" 
                          color={
                            listing.quality === 'Premium' ? 'success' : 
                            ['A', 'Regular'].includes(listing.quality) ? 'primary' : 'default'
                          }
                          variant={listing.quality === 'Premium' ? 'filled' : 'outlined'}
                        />
                      </Box>

                      <Typography variant="body2" color="textSecondary" sx={{ mb: 1, display: 'flex', alignItems: 'center' }}>
                        <LocationIcon fontSize="small" sx={{ mr: 0.5 }} />
                        {listing.location}
                      </Typography>

                      <Typography variant="body2" sx={{ mb: 1 }}>
                        {listing.description && listing.description.length > 100
                          ? `${listing.description.substring(0, 100)}...`
                          : listing.description || 'No description provided.'}
                      </Typography>

                      <Box sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>
                        <PriceIcon color="primary" sx={{ mr: 1 }} />
                        <Typography variant="h6" color="primary">
                          ₹{listing.price}/{listing.unit}
                        </Typography>
                      </Box>

                      <Typography variant="body2" sx={{ mt: 1 }}>
                        Quantity available: {listing.quantity} {listing.unit}
                      </Typography>
                      
                      {listing.organicCertified && (
                        <Chip 
                          label="Organic Certified" 
                          color="success" 
                          size="small" 
                          variant="outlined"
                          sx={{ mt: 1 }}
                        />
                      )}
                    </CardContent>
                    
                    <CardActions>
                      <Button 
                        component={Link}
                        to={`/market-access/${listing._id}`}
                        size="small" 
                        variant="contained" 
                        fullWidth
                      >
                        View Details
                      </Button>
                    </CardActions>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </Grid>
      </Grid>
    </Container>
  );
};

export default DigitalMarket;