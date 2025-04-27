import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  Container, 
  Typography, 
  Box, 
  Grid, 
  Card, 
  CardContent,
  Button, 
  TextField,
  Divider,
  Alert,
  CircularProgress,
  Paper,
  Chip,
  Avatar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  InputAdornment,
  IconButton,
  Snackbar,
  Breadcrumbs
} from '@mui/material';
import {
  ArrowBack as BackIcon,
  LocationOn as LocationIcon,
  AttachMoney as PriceIcon,
  CalendarToday as DateIcon,
  Person as FarmerIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Send as SendIcon,
  Verified as VerifiedIcon,
  Phone as PhoneIcon,
  Email as EmailIcon
} from '@mui/icons-material';
import { AuthContext } from '../context/AuthContext';
import { getListingById, deleteListing, makeOffer } from '../services/marketplaceService';

const ListingDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  
  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isOwner, setIsOwner] = useState(false);
  
  // Dialog state
  const [makeOfferDialog, setMakeOfferDialog] = useState(false);
  const [deleteConfirmDialog, setDeleteConfirmDialog] = useState(false);
  
  // Offer form state
  const [offerForm, setOfferForm] = useState({
    quantity: '',
    offerPrice: '',
    message: '',
    contactMethod: 'in-app',
    phone: '',
    email: ''
  });
  const [offerFormErrors, setOfferFormErrors] = useState({});
  
  // Snackbar state
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  useEffect(() => {
    const fetchListing = async () => {
      try {
        setLoading(true);
        const response = await getListingById(id);
        setListing(response.data);
        
        // Check if current user is the owner
        if (user && response.data.farmer && response.data.farmer._id === user._id) {
          setIsOwner(true);
        }
        
        setError(null);
      } catch (err) {
        setError(err.message || 'Failed to fetch listing details');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchListing();
    }
  }, [id, user]);

  // Format date
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Handle offer form changes
  const handleOfferFormChange = (e) => {
    const { name, value } = e.target;
    setOfferForm(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear field error when user types
    if (offerFormErrors[name]) {
      setOfferFormErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  // Validate offer form
  const validateOfferForm = () => {
    const errors = {};
    
    if (!offerForm.quantity) {
      errors.quantity = 'Quantity is required';
    } else if (isNaN(offerForm.quantity) || Number(offerForm.quantity) <= 0) {
      errors.quantity = 'Quantity must be a positive number';
    } else if (listing && Number(offerForm.quantity) > listing.quantity) {
      errors.quantity = 'Quantity exceeds available amount';
    }
    
    if (!offerForm.offerPrice) {
      errors.offerPrice = 'Price is required';
    } else if (isNaN(offerForm.offerPrice) || Number(offerForm.offerPrice) <= 0) {
      errors.offerPrice = 'Price must be a positive number';
    }
    
    if (offerForm.contactMethod === 'phone' && !offerForm.phone) {
      errors.phone = 'Phone number is required';
    }
    
    if (offerForm.contactMethod === 'email' && !offerForm.email) {
      errors.email = 'Email is required';
    }
    
    setOfferFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Submit offer
  const handleOfferSubmit = async () => {
    if (!validateOfferForm()) return;
    
    try {
      // Prepare contact details based on selected method
      const contactDetails = {};
      
      if (offerForm.contactMethod === 'phone') {
        contactDetails.phone = offerForm.phone;
        contactDetails.preferredContactMethod = 'phone';
      } else if (offerForm.contactMethod === 'email') {
        contactDetails.email = offerForm.email;
        contactDetails.preferredContactMethod = 'email';
      } else {
        contactDetails.preferredContactMethod = 'in-app';
      }
      
      // Make offer API call
      await makeOffer(listing._id, {
        quantity: Number(offerForm.quantity),
        offerPrice: Number(offerForm.offerPrice),
        message: offerForm.message,
        contactDetails
      });
      
      // Close dialog and show success message
      setMakeOfferDialog(false);
      setSnackbar({
        open: true,
        message: 'Your offer has been sent to the farmer',
        severity: 'success'
      });
      
      // Reset form
      setOfferForm({
        quantity: '',
        offerPrice: '',
        message: '',
        contactMethod: 'in-app',
        phone: '',
        email: ''
      });
      
    } catch (err) {
      setSnackbar({
        open: true,
        message: err.message || 'Failed to send offer',
        severity: 'error'
      });
    }
  };

  // Handle listing delete
  const handleDelete = async () => {
    try {
      await deleteListing(id);
      setSnackbar({
        open: true,
        message: 'Listing deleted successfully',
        severity: 'success'
      });
      
      // Redirect after a brief delay
      setTimeout(() => {
        navigate('/market-access/my-listings');
      }, 1500);
      
    } catch (err) {
      setSnackbar({
        open: true,
        message: err.message || 'Failed to delete listing',
        severity: 'error'
      });
      setDeleteConfirmDialog(false);
    }
  };

  return (
    <Container maxWidth="lg">
      {/* Breadcrumbs */}
      <Breadcrumbs sx={{ mb: 2 }}>
        <Link to="/market-access" style={{ textDecoration: 'none', color: 'inherit' }}>
          Digital Marketplace
        </Link>
        <Typography color="text.primary">Listing Details</Typography>
      </Breadcrumbs>

      {/* Back button */}
      <Button
        startIcon={<BackIcon />}
        onClick={() => navigate(-1)}
        sx={{ mb: 3 }}
      >
        Back
      </Button>

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

      {/* Listing details */}
      {!loading && listing && (
        <Grid container spacing={4}>
          {/* Left side - Product info */}
          <Grid item xs={12} md={8}>
            <Card>
              {/* Product images */}
              {listing.images && listing.images.length > 0 ? (
                <Box sx={{ height: 300, position: 'relative' }}>
                  <Box
                    component="img"
                    src={listing.images[0]}
                    alt={listing.cropName}
                    sx={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                    }}
                  />
                </Box>
              ) : (
                <Box
                  sx={{
                    height: 200,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    bgcolor: 'grey.100',
                  }}
                >
                  <Typography variant="body1" color="text.secondary">
                    No image available
                  </Typography>
                </Box>
              )}
              
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                  <Typography variant="h4" component="h1" gutterBottom>
                    {listing.cropName}
                  </Typography>
                  <Chip 
                    label={listing.quality} 
                    color={
                      listing.quality === 'Premium' ? 'success' : 
                      ['A', 'Regular'].includes(listing.quality) ? 'primary' : 'default'
                    }
                  />
                </Box>

                <Box sx={{ mb: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <LocationIcon sx={{ mr: 1 }} color="action" />
                    <Typography variant="body1">{listing.location}</Typography>
                  </Box>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <PriceIcon sx={{ mr: 1 }} color="primary" />
                    <Typography variant="h6" color="primary">
                      ₹{listing.price}/{listing.unit}
                    </Typography>
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <DateIcon sx={{ mr: 1 }} color="action" />
                    <Typography variant="body2">
                      Listed on {formatDate(listing.createdAt)}
                    </Typography>
                  </Box>
                </Box>

                <Divider sx={{ my: 2 }} />

                <Typography variant="h6" gutterBottom>
                  Product Details
                </Typography>

                <Grid container spacing={2} sx={{ mb: 3 }}>
                  <Grid item xs={6} md={4}>
                    <Typography variant="body2" color="text.secondary">
                      Quantity Available
                    </Typography>
                    <Typography variant="body1">
                      {listing.quantity} {listing.unit}
                    </Typography>
                  </Grid>
                  
                  {listing.harvestDate && (
                    <Grid item xs={6} md={4}>
                      <Typography variant="body2" color="text.secondary">
                        Harvest Date
                      </Typography>
                      <Typography variant="body1">
                        {formatDate(listing.harvestDate)}
                      </Typography>
                    </Grid>
                  )}
                  
                  <Grid item xs={6} md={4}>
                    <Typography variant="body2" color="text.secondary">
                      Certification
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      {listing.organicCertified ? (
                        <>
                          <VerifiedIcon color="success" sx={{ mr: 0.5 }} fontSize="small" />
                          <Typography variant="body1">Organic Certified</Typography>
                        </>
                      ) : (
                        <Typography variant="body1">Standard</Typography>
                      )}
                    </Box>
                  </Grid>
                </Grid>

                {listing.description && (
                  <>
                    <Typography variant="h6" gutterBottom>
                      Description
                    </Typography>
                    <Typography variant="body1" paragraph>
                      {listing.description}
                    </Typography>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Owner actions */}
            {isOwner && (
              <Paper sx={{ p: 2, mt: 3, display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body1">
                  <strong>This is your listing</strong> - You can manage it here
                </Typography>
                <Box>
                  <Button
                    startIcon={<EditIcon />}
                    component={Link}
                    to={`/market-access/edit/${listing._id}`}
                    sx={{ mr: 1 }}
                  >
                    Edit
                  </Button>
                  <Button
                    startIcon={<DeleteIcon />}
                    color="error"
                    onClick={() => setDeleteConfirmDialog(true)}
                  >
                    Delete
                  </Button>
                </Box>
              </Paper>
            )}
          </Grid>

          {/* Right side - Farmer info and actions */}
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3, mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                Seller Information
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar sx={{ mr: 2 }}>
                  <FarmerIcon />
                </Avatar>
                <Box>
                  <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                    {listing.farmer?.name || 'Unknown Seller'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {listing.farmer?.farmDetails?.location || 'Location not specified'}
                  </Typography>
                </Box>
              </Box>
              
              {/* Contact and offer button */}
              {!isOwner && (
                <Button
                  variant="contained"
                  color="primary"
                  fullWidth
                  onClick={() => setMakeOfferDialog(true)}
                  startIcon={<SendIcon />}
                >
                  Make an Offer
                </Button>
              )}
              
              {isOwner && (
                <Button
                  variant="outlined"
                  color="primary"
                  component={Link}
                  to={`/market-access/${listing._id}/offers`}
                  fullWidth
                >
                  View Offers
                </Button>
              )}
            </Paper>

            {/* Related products section could be added here */}
          </Grid>
        </Grid>
      )}

      {/* Make Offer Dialog */}
      <Dialog 
        open={makeOfferDialog} 
        onClose={() => setMakeOfferDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Make an Offer</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            Please specify the quantity and your offer price per {listing?.unit}.
          </DialogContentText>
          
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                label={`Quantity (${listing?.unit || 'unit'})`}
                name="quantity"
                value={offerForm.quantity}
                onChange={handleOfferFormChange}
                fullWidth
                margin="normal"
                type="number"
                inputProps={{ min: 1, max: listing?.quantity }}
                error={!!offerFormErrors.quantity}
                helperText={offerFormErrors.quantity || `Available: ${listing?.quantity} ${listing?.unit || 'units'}`}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Your Offer Price"
                name="offerPrice"
                value={offerForm.offerPrice}
                onChange={handleOfferFormChange}
                fullWidth
                margin="normal"
                type="number"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      ₹
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      per {listing?.unit || 'unit'}
                    </InputAdornment>
                  )
                }}
                error={!!offerFormErrors.offerPrice}
                helperText={offerFormErrors.offerPrice || `Current price: ₹${listing?.price || 0}`}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Message to Seller (Optional)"
                name="message"
                value={offerForm.message}
                onChange={handleOfferFormChange}
                fullWidth
                margin="normal"
                multiline
                rows={3}
                placeholder="Introduce yourself and explain why you are interested in this produce"
              />
            </Grid>
            
            <Grid item xs={12}>
              <FormControl fullWidth margin="normal">
                <InputLabel id="contact-method-label">Preferred Contact Method</InputLabel>
                <Select
                  labelId="contact-method-label"
                  name="contactMethod"
                  value={offerForm.contactMethod}
                  onChange={handleOfferFormChange}
                  label="Preferred Contact Method"
                >
                  <MenuItem value="in-app">In-App Messages</MenuItem>
                  <MenuItem value="phone">Phone</MenuItem>
                  <MenuItem value="email">Email</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            {offerForm.contactMethod === 'phone' && (
              <Grid item xs={12}>
                <TextField
                  label="Phone Number"
                  name="phone"
                  value={offerForm.phone}
                  onChange={handleOfferFormChange}
                  fullWidth
                  margin="normal"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <PhoneIcon />
                      </InputAdornment>
                    )
                  }}
                  error={!!offerFormErrors.phone}
                  helperText={offerFormErrors.phone}
                />
              </Grid>
            )}
            
            {offerForm.contactMethod === 'email' && (
              <Grid item xs={12}>
                <TextField
                  label="Email"
                  name="email"
                  type="email"
                  value={offerForm.email}
                  onChange={handleOfferFormChange}
                  fullWidth
                  margin="normal"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <EmailIcon />
                      </InputAdornment>
                    )
                  }}
                  error={!!offerFormErrors.email}
                  helperText={offerFormErrors.email}
                />
              </Grid>
            )}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setMakeOfferDialog(false)}>Cancel</Button>
          <Button 
            onClick={handleOfferSubmit} 
            variant="contained" 
            color="primary"
            startIcon={<SendIcon />}
          >
            Send Offer
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteConfirmDialog}
        onClose={() => setDeleteConfirmDialog(false)}
      >
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this listing? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirmDialog(false)}>Cancel</Button>
          <Button onClick={handleDelete} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
      >
        <Alert 
          onClose={() => setSnackbar(prev => ({ ...prev, open: false }))} 
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default ListingDetail;