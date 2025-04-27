import React, { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Container, 
  Typography, 
  Box, 
  Grid, 
  Card, 
  CardContent, 
  CardActions, 
  Button, 
  Chip,
  Divider,
  Alert,
  CircularProgress,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  IconButton,
  Menu,
  MenuItem,
  Snackbar
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  LocationOn as LocationIcon,
  AttachMoney as PriceIcon,
  Add as AddIcon,
  ArrowBack as BackIcon,
  MoreVert as MoreIcon,
  CalendarToday as DateIcon,
  Visibility as ViewIcon,
  VisibilityOff as HideIcon
} from '@mui/icons-material';
import { AuthContext } from '../context/AuthContext';
import { getMyListings, deleteListing, updateListing } from '../services/marketplaceService';

const MyListings = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  
  // State variables
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedListing, setSelectedListing] = useState(null);
  const [menuAnchorEl, setMenuAnchorEl] = useState(null);
  const [activeListingId, setActiveListingId] = useState(null);
  
  // Snackbar state
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  // Fetch user's listings on component mount
  useEffect(() => {
    fetchMyListings();
  }, []);

  // Function to fetch user's listings from the API
  const fetchMyListings = async () => {
    try {
      setLoading(true);
      const response = await getMyListings();
      setListings(response.data || []);
      setError(null);
    } catch (err) {
      setError(err.message || 'Failed to fetch your listings');
      setListings([]);
    } finally {
      setLoading(false);
    }
  };

  // Format date
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Handle menu open
  const handleMenuOpen = (event, listingId) => {
    setMenuAnchorEl(event.currentTarget);
    setActiveListingId(listingId);
  };

  // Handle menu close
  const handleMenuClose = () => {
    setMenuAnchorEl(null);
    setActiveListingId(null);
  };

  // Open delete confirmation dialog
  const handleDeleteClick = (listing) => {
    setSelectedListing(listing);
    setDeleteDialogOpen(true);
    handleMenuClose();
  };

  // Handle listing deletion
  const handleDeleteConfirm = async () => {
    if (!selectedListing) return;
    
    try {
      await deleteListing(selectedListing._id);
      
      // Remove deleted listing from state
      setListings(listings.filter(listing => listing._id !== selectedListing._id));
      
      // Show success message
      setSnackbar({
        open: true,
        message: 'Listing deleted successfully',
        severity: 'success'
      });
      
    } catch (err) {
      setSnackbar({
        open: true,
        message: err.message || 'Failed to delete listing',
        severity: 'error'
      });
    } finally {
      setDeleteDialogOpen(false);
      setSelectedListing(null);
    }
  };

  // Handle listing status toggle (active/inactive)
  const handleToggleStatus = async (listing) => {
    try {
      const newStatus = listing.status === 'active' ? 'inactive' : 'active';
      
      await updateListing(listing._id, {
        ...listing,
        status: newStatus
      });
      
      // Update listing status in state
      setListings(listings.map(item => 
        item._id === listing._id ? { ...item, status: newStatus } : item
      ));
      
      // Show success message
      setSnackbar({
        open: true,
        message: `Listing ${newStatus === 'active' ? 'activated' : 'deactivated'} successfully`,
        severity: 'success'
      });
      
    } catch (err) {
      setSnackbar({
        open: true,
        message: err.message || 'Failed to update listing status',
        severity: 'error'
      });
    } finally {
      handleMenuClose();
    }
  };

  // Close snackbar
  const handleSnackbarClose = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };
  
  // Get status chip color and label
  const getStatusChip = (status) => {
    switch (status) {
      case 'active':
        return { color: 'success', label: 'Active' };
      case 'inactive':
        return { color: 'default', label: 'Inactive' };
      case 'sold':
        return { color: 'primary', label: 'Sold' };
      default:
        return { color: 'default', label: status };
    }
  };

  return (
    <Container maxWidth="lg">
      {/* Header with back button */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <IconButton 
          onClick={() => navigate(-1)} 
          sx={{ mr: 2 }}
          aria-label="back"
        >
          <BackIcon />
        </IconButton>
        <Typography variant="h4" component="h1">
          My Listings
        </Typography>
      </Box>
      
      <Typography variant="subtitle1" color="textSecondary" paragraph>
        Manage your product listings in the digital marketplace.
      </Typography>

      {/* Add new listing button */}
      <Box sx={{ mb: 4 }}>
        <Button
          component={Link}
          to="/market-access/new-listing"
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
        >
          Add New Listing
        </Button>
      </Box>

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

      {/* No listings message */}
      {!loading && listings.length === 0 && (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" gutterBottom>
            You don't have any listings yet
          </Typography>
          <Typography variant="body1" color="textSecondary" paragraph>
            Create your first listing to start selling your agricultural products.
          </Typography>
          <Button
            component={Link}
            to="/market-access/new-listing"
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
          >
            Create First Listing
          </Button>
        </Paper>
      )}

      {/* Listings grid */}
      {!loading && listings.length > 0 && (
        <Grid container spacing={3}>
          {listings.map(listing => {
            const statusInfo = getStatusChip(listing.status);
            
            return (
              <Grid item xs={12} sm={6} md={4} key={listing._id}>
                <Card sx={{ 
                  height: '100%', 
                  display: 'flex', 
                  flexDirection: 'column',
                  opacity: listing.status === 'inactive' ? 0.7 : 1,
                  transition: 'all 0.2s',
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
                  
                  <CardContent sx={{ flexGrow: 1, position: 'relative', pt: 3 }}>
                    <Box 
                      sx={{ 
                        position: 'absolute', 
                        top: 0, 
                        right: 0,
                        display: 'flex',
                        alignItems: 'center',
                        zIndex: 2,
                      }}
                    >
                      <Chip 
                        label={statusInfo.label}
                        size="small"
                        color={statusInfo.color}
                      />
                      <IconButton 
                        size="small" 
                        onClick={(e) => handleMenuOpen(e, listing._id)}
                        sx={{ ml: 1 }}
                      >
                        <MoreIcon fontSize="small" />
                      </IconButton>
                    </Box>

                    <Typography variant="h6" component="h2">
                      {listing.cropName}
                    </Typography>

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap', mt: 1 }}>
                      <Chip 
                        label={listing.quality} 
                        size="small" 
                        color={
                          listing.quality === 'Premium' ? 'success' : 
                          ['A', 'Regular'].includes(listing.quality) ? 'primary' : 'default'
                        }
                        variant={listing.quality === 'Premium' ? 'filled' : 'outlined'}
                      />
                      {listing.organicCertified && (
                        <Chip 
                          label="Organic" 
                          size="small" 
                          color="success" 
                          variant="outlined"
                        />
                      )}
                    </Box>

                    <Typography variant="body2" color="textSecondary" sx={{ mt: 1, display: 'flex', alignItems: 'center' }}>
                      <LocationIcon fontSize="small" sx={{ mr: 0.5 }} />
                      {listing.location}
                    </Typography>

                    <Box sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>
                      <PriceIcon color="primary" sx={{ mr: 1 }} />
                      <Typography variant="h6" color="primary">
                        ₹{listing.price}/{listing.unit}
                      </Typography>
                    </Box>

                    <Box sx={{ mt: 1 }}>
                      <Typography variant="body2">
                        Quantity: {listing.quantity} {listing.unit}
                      </Typography>
                    </Box>
                    
                    <Box sx={{ mt: 1, display: 'flex', alignItems: 'center' }}>
                      <DateIcon fontSize="small" sx={{ mr: 0.5, color: 'action.active' }} />
                      <Typography variant="caption" color="text.secondary">
                        Posted on {formatDate(listing.createdAt)}
                      </Typography>
                    </Box>
                    
                    {listing.offerCount > 0 && (
                      <Chip 
                        label={`${listing.offerCount} Offers`} 
                        size="small" 
                        color="warning" 
                        sx={{ mt: 1 }}
                      />
                    )}
                  </CardContent>
                  
                  <CardActions sx={{ p: 2, pt: 0, display: 'flex', justifyContent: 'space-between' }}>
                    <Button 
                      component={Link}
                      to={`/market-access/${listing._id}`}
                      size="small" 
                      variant="outlined"
                      startIcon={<ViewIcon />}
                    >
                      View
                    </Button>
                    <Button 
                      component={Link}
                      to={`/market-access/edit/${listing._id}`}
                      size="small" 
                      variant="contained"
                      color="primary"
                      startIcon={<EditIcon />}
                    >
                      Edit
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      )}

      {/* Action menu for each listing */}
      <Menu
        anchorEl={menuAnchorEl}
        open={Boolean(menuAnchorEl)}
        onClose={handleMenuClose}
        elevation={3}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        <MenuItem 
          component={Link}
          to={`/market-access/edit/${activeListingId}`}
        >
          <EditIcon fontSize="small" sx={{ mr: 1 }} />
          Edit Listing
        </MenuItem>
        
        {listings.find(l => l._id === activeListingId)?.status === 'active' ? (
          <MenuItem onClick={() => handleToggleStatus(listings.find(l => l._id === activeListingId))}>
            <HideIcon fontSize="small" sx={{ mr: 1 }} />
            Deactivate
          </MenuItem>
        ) : (
          <MenuItem onClick={() => handleToggleStatus(listings.find(l => l._id === activeListingId))}>
            <ViewIcon fontSize="small" sx={{ mr: 1 }} />
            Activate
          </MenuItem>
        )}
        
        <Divider />
        <MenuItem 
          onClick={() => handleDeleteClick(listings.find(l => l._id === activeListingId))}
          sx={{ color: 'error.main' }}
        >
          <DeleteIcon fontSize="small" sx={{ mr: 1 }} />
          Delete Listing
        </MenuItem>
      </Menu>

      {/* Delete confirmation dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete the listing "{selectedListing?.cropName}"? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setDeleteDialogOpen(false)}
            color="primary"
          >
            Cancel
          </Button>
          <Button 
            onClick={handleDeleteConfirm} 
            color="error"
            variant="contained"
            autoFocus
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Notification snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
      >
        <Alert 
          onClose={handleSnackbarClose} 
          severity={snackbar.severity}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default MyListings;