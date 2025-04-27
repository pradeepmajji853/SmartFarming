import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  Container, 
  Typography, 
  Box, 
  Grid, 
  TextField, 
  Button, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem, 
  FormHelperText,
  InputAdornment,
  Divider,
  Switch,
  FormControlLabel,
  Alert,
  CircularProgress,
  Paper,
  Breadcrumbs
} from '@mui/material';
import { 
  Save as SaveIcon, 
  Cancel as CancelIcon, 
  ArrowBack as BackIcon,
  AttachMoney as PriceIcon,
  DateRange as DateIcon 
} from '@mui/icons-material';
import { AuthContext } from '../context/AuthContext';
import { getListingById, createListing, updateListing } from '../services/marketplaceService';

const ListingEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const isEdit = !!id;

  const [formData, setFormData] = useState({
    cropName: '',
    quantity: '',
    unit: 'kg',
    price: '',
    quality: 'Regular',
    description: '',
    location: user?.farmDetails?.location || '',
    harvestDate: '',
    organicCertified: false,
    images: []
  });

  const [formErrors, setFormErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  // Unit options
  const unitOptions = ['kg', 'quintal', 'ton', 'dozen', 'piece'];

  // Quality options
  const qualityOptions = ['Premium', 'A', 'B', 'C', 'Regular', 'Economy'];

  useEffect(() => {
    // If editing, fetch the listing data
    if (isEdit) {
      const fetchListing = async () => {
        try {
          setLoading(true);
          const response = await getListingById(id);
          
          // Format harvestDate if exists
          let formattedData = { ...response.data };
          if (formattedData.harvestDate) {
            formattedData.harvestDate = new Date(formattedData.harvestDate)
              .toISOString()
              .substring(0, 10);
          }
          
          setFormData(formattedData);
          setError(null);
        } catch (err) {
          setError(err.message || 'Failed to fetch listing details');
        } finally {
          setLoading(false);
        }
      };

      fetchListing();
    }
  }, [id, isEdit]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    // Handle checkbox
    const newValue = type === 'checkbox' ? checked : value;
    
    setFormData(prev => ({
      ...prev,
      [name]: newValue
    }));
    
    // Clear field error
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const errors = {};
    
    // Required fields
    if (!formData.cropName.trim()) {
      errors.cropName = 'Crop name is required';
    }
    
    if (!formData.quantity) {
      errors.quantity = 'Quantity is required';
    } else if (isNaN(formData.quantity) || Number(formData.quantity) <= 0) {
      errors.quantity = 'Quantity must be a positive number';
    }
    
    if (!formData.price) {
      errors.price = 'Price is required';
    } else if (isNaN(formData.price) || Number(formData.price) <= 0) {
      errors.price = 'Price must be a positive number';
    }
    
    if (!formData.location.trim()) {
      errors.location = 'Location is required';
    }
    
    // Check for valid harvest date if provided
    if (formData.harvestDate && !/^\d{4}-\d{2}-\d{2}$/.test(formData.harvestDate)) {
      errors.harvestDate = 'Invalid date format';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    try {
      setLoading(true);
      
      const listingData = {
        ...formData,
        quantity: Number(formData.quantity),
        price: Number(formData.price)
      };
      
      if (isEdit) {
        await updateListing(id, listingData);
      } else {
        await createListing(listingData);
      }
      
      setSuccess(true);
      setError(null);
      
      // Redirect after successful submission
      setTimeout(() => {
        if (isEdit) {
          navigate(`/market-access/${id}`);
        } else {
          navigate('/market-access/my-listings');
        }
      }, 1500);
      
    } catch (err) {
      setError(err.message || `Failed to ${isEdit ? 'update' : 'create'} listing`);
      setSuccess(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="md">
      {/* Breadcrumbs */}
      <Breadcrumbs sx={{ mb: 2 }}>
        <Link to="/market-access" style={{ textDecoration: 'none', color: 'inherit' }}>
          Digital Marketplace
        </Link>
        {isEdit ? (
          <>
            <Link to={`/market-access/${id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
              Listing Details
            </Link>
            <Typography color="text.primary">Edit Listing</Typography>
          </>
        ) : (
          <Typography color="text.primary">New Listing</Typography>
        )}
      </Breadcrumbs>

      {/* Back button */}
      <Button
        startIcon={<BackIcon />}
        onClick={() => navigate(-1)}
        sx={{ mb: 3 }}
      >
        Back
      </Button>

      <Paper sx={{ p: 4 }}>
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            {isEdit ? 'Edit Listing' : 'Create New Listing'}
          </Typography>
          <Typography variant="subtitle1" color="textSecondary">
            {isEdit 
              ? 'Update your product listing information below' 
              : 'List your agricultural produce to connect with potential buyers'
            }
          </Typography>
        </Box>

        {/* Success message */}
        {success && (
          <Alert severity="success" sx={{ mb: 3 }}>
            Listing {isEdit ? 'updated' : 'created'} successfully!
          </Alert>
        )}

        {/* Error message */}
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            {/* Basic Information */}
            <Grid item xs={12}>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Product Information
              </Typography>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                label="Crop Name"
                name="cropName"
                value={formData.cropName}
                onChange={handleChange}
                fullWidth
                required
                error={!!formErrors.cropName}
                helperText={formErrors.cropName}
                disabled={loading}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth error={!!formErrors.quality}>
                <InputLabel id="quality-label">Quality</InputLabel>
                <Select
                  labelId="quality-label"
                  name="quality"
                  value={formData.quality}
                  onChange={handleChange}
                  label="Quality"
                  disabled={loading}
                >
                  {qualityOptions.map(option => (
                    <MenuItem key={option} value={option}>{option}</MenuItem>
                  ))}
                </Select>
                {formErrors.quality && (
                  <FormHelperText>{formErrors.quality}</FormHelperText>
                )}
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                label="Quantity"
                name="quantity"
                type="number"
                value={formData.quantity}
                onChange={handleChange}
                fullWidth
                required
                error={!!formErrors.quantity}
                helperText={formErrors.quantity}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      {formData.unit}
                    </InputAdornment>
                  ),
                }}
                disabled={loading}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel id="unit-label">Unit</InputLabel>
                <Select
                  labelId="unit-label"
                  name="unit"
                  value={formData.unit}
                  onChange={handleChange}
                  label="Unit"
                  disabled={loading}
                >
                  {unitOptions.map(option => (
                    <MenuItem key={option} value={option}>{option}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                label="Price (₹)"
                name="price"
                type="number"
                value={formData.price}
                onChange={handleChange}
                fullWidth
                required
                error={!!formErrors.price}
                helperText={formErrors.price}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PriceIcon />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      per {formData.unit}
                    </InputAdornment>
                  ),
                }}
                disabled={loading}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                label="Harvest Date"
                name="harvestDate"
                type="date"
                value={formData.harvestDate}
                onChange={handleChange}
                fullWidth
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <DateIcon />
                    </InputAdornment>
                  ),
                }}
                InputLabelProps={{
                  shrink: true,
                }}
                error={!!formErrors.harvestDate}
                helperText={formErrors.harvestDate || 'Optional'}
                disabled={loading}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                label="Location"
                name="location"
                value={formData.location}
                onChange={handleChange}
                fullWidth
                required
                error={!!formErrors.location}
                helperText={formErrors.location}
                disabled={loading}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                label="Description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                fullWidth
                multiline
                rows={4}
                helperText="Provide details about your produce, farming methods, etc."
                disabled={loading}
              />
            </Grid>

            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.organicCertified}
                    onChange={handleChange}
                    name="organicCertified"
                    color="success"
                    disabled={loading}
                  />
                }
                label="Organic Certified"
              />
            </Grid>

            {/* Note: Image upload functionality would be added here */}
            
            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
            </Grid>

            {/* Form actions */}
            <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
              <Button
                variant="outlined"
                color="inherit"
                onClick={() => navigate(-1)}
                startIcon={<CancelIcon />}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                startIcon={<SaveIcon />}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <CircularProgress size={24} color="inherit" sx={{ mr: 1 }} />
                    Saving...
                  </>
                ) : (
                  isEdit ? 'Save Changes' : 'Create Listing'
                )}
              </Button>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Container>
  );
};

export default ListingEdit;