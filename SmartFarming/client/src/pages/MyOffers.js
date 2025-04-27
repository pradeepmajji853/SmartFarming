import React, { useState, useEffect } from 'react';
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
  Chip,
  Divider,
  Alert,
  CircularProgress,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
  Tab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Tooltip,
  IconButton,
  Breadcrumbs
} from '@mui/material';
import {
  ShoppingCart as OfferIcon,
  AccessTime as PendingIcon,
  CheckCircle as AcceptedIcon,
  Cancel as RejectedIcon,
  ArrowBack as BackIcon,
  DeleteOutline as WithdrawIcon,
  InfoOutlined as InfoIcon
} from '@mui/icons-material';
import { getMyOffers } from '../services/marketplaceService';

const MyOffers = () => {
  const [offers, setOffers] = useState([]);
  const [filteredOffers, setFilteredOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tabValue, setTabValue] = useState(0);
  
  // Dialog states
  const [detailsDialog, setDetailsDialog] = useState({
    open: false,
    offer: null
  });
  const [withdrawDialog, setWithdrawDialog] = useState({
    open: false,
    offerId: null
  });

  useEffect(() => {
    const fetchOffers = async () => {
      try {
        setLoading(true);
        const response = await getMyOffers();
        setOffers(response.data);
        filterOffersByStatus(response.data, tabValue);
        setError(null);
      } catch (err) {
        setError(err.message || 'Failed to fetch your offers');
      } finally {
        setLoading(false);
      }
    };

    fetchOffers();
  }, []);

  // Filter offers based on tab selection
  const filterOffersByStatus = (offers, tabIndex) => {
    let filtered;
    
    switch (tabIndex) {
      case 0: // All
        filtered = offers;
        break;
      case 1: // Pending
        filtered = offers.filter(offer => offer.status === 'pending');
        break;
      case 2: // Accepted
        filtered = offers.filter(offer => offer.status === 'accepted');
        break;
      case 3: // Rejected/Withdrawn
        filtered = offers.filter(offer => 
          offer.status === 'rejected' || offer.status === 'withdrawn'
        );
        break;
      default:
        filtered = offers;
    }
    
    setFilteredOffers(filtered);
  };

  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
    filterOffersByStatus(offers, newValue);
  };

  // Format date
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Get status chip color and icon
  const getStatusDetails = (status) => {
    switch (status) {
      case 'pending':
        return { color: 'warning', icon: <PendingIcon />, label: 'Pending' };
      case 'accepted':
        return { color: 'success', icon: <AcceptedIcon />, label: 'Accepted' };
      case 'rejected':
        return { color: 'error', icon: <RejectedIcon />, label: 'Rejected' };
      case 'withdrawn':
        return { color: 'default', icon: <WithdrawIcon />, label: 'Withdrawn' };
      default:
        return { color: 'default', icon: null, label: status };
    }
  };

  // Show offer details dialog
  const handleShowDetails = (offer) => {
    setDetailsDialog({
      open: true,
      offer
    });
  };

  // Withdraw offer confirmation
  const handleWithdrawOffer = (offerId) => {
    setWithdrawDialog({
      open: true,
      offerId
    });
  };

  // Confirm withdraw offer
  const confirmWithdrawOffer = async () => {
    // Implement withdraw offer functionality here
    // You would typically call an API endpoint to update the status
    // For now, we'll just close the dialog
    setWithdrawDialog({
      open: false,
      offerId: null
    });
  };

  return (
    <Container maxWidth="lg">
      {/* Breadcrumbs */}
      <Breadcrumbs sx={{ mb: 2 }}>
        <Link to="/market-access" style={{ textDecoration: 'none', color: 'inherit' }}>
          Digital Marketplace
        </Link>
        <Typography color="text.primary">My Offers</Typography>
      </Breadcrumbs>

      {/* Back button */}
      <Button
        startIcon={<BackIcon />}
        component={Link}
        to="/market-access"
        sx={{ mb: 3 }}
      >
        Back to Marketplace
      </Button>

      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          My Offers
        </Typography>
        <Typography variant="subtitle1" color="textSecondary" paragraph>
          Track and manage all the offers you've made on agricultural produce.
        </Typography>
      </Box>

      {/* Error message */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Tabs for filtering */}
      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
          variant="fullWidth"
        >
          <Tab label="All Offers" icon={<OfferIcon />} iconPosition="start" />
          <Tab label="Pending" icon={<PendingIcon />} iconPosition="start" />
          <Tab label="Accepted" icon={<AcceptedIcon />} iconPosition="start" />
          <Tab label="Rejected/Withdrawn" icon={<RejectedIcon />} iconPosition="start" />
        </Tabs>
      </Paper>

      {/* Loading indicator */}
      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      )}

      {/* No offers message */}
      {!loading && filteredOffers.length === 0 && (
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="body1" color="textSecondary">
            You have no {tabValue !== 0 ? getStatusDetails(
              tabValue === 1 ? 'pending' : tabValue === 2 ? 'accepted' : 'rejected'
            ).label.toLowerCase() : ''} offers.
          </Typography>
          <Button
            component={Link}
            to="/market-access"
            variant="contained"
            color="primary"
            sx={{ mt: 2 }}
          >
            Browse Products
          </Button>
        </Paper>
      )}

      {/* Offers table */}
      {!loading && filteredOffers.length > 0 && (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Product</TableCell>
                <TableCell>Quantity</TableCell>
                <TableCell>Your Offer</TableCell>
                <TableCell>Listed Price</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredOffers.map(offer => {
                const { color, icon, label } = getStatusDetails(offer.status);
                
                return (
                  <TableRow key={offer._id} hover>
                    <TableCell>
                      <Link 
                        to={`/market-access/${offer.productListing._id}`}
                        style={{ textDecoration: 'none', color: 'inherit', fontWeight: 500 }}
                      >
                        {offer.productListing.cropName}
                      </Link>
                      <Typography variant="body2" color="textSecondary">
                        by {offer.productListing.farmer.name}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      {offer.quantity} {offer.productListing.unit}
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight="bold">
                        ₹{offer.offerPrice}/{offer.productListing.unit}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      ₹{offer.productListing.price}/{offer.productListing.unit}
                    </TableCell>
                    <TableCell>
                      {formatDate(offer.createdAt)}
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={label} 
                        color={color} 
                        size="small"
                        icon={icon}
                        variant={offer.status === 'pending' ? 'filled' : 'outlined'}
                      />
                    </TableCell>
                    <TableCell align="right">
                      <Box>
                        <Tooltip title="View Details">
                          <IconButton 
                            size="small" 
                            color="primary"
                            onClick={() => handleShowDetails(offer)}
                          >
                            <InfoIcon />
                          </IconButton>
                        </Tooltip>
                        
                        {offer.status === 'pending' && (
                          <Tooltip title="Withdraw Offer">
                            <IconButton 
                              size="small" 
                              color="error"
                              onClick={() => handleWithdrawOffer(offer._id)}
                            >
                              <WithdrawIcon />
                            </IconButton>
                          </Tooltip>
                        )}
                      </Box>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Offer Details Dialog */}
      <Dialog
        open={detailsDialog.open}
        onClose={() => setDetailsDialog({ open: false, offer: null })}
        maxWidth="sm"
        fullWidth
      >
        {detailsDialog.offer && (
          <>
            <DialogTitle>
              Offer Details
              <Typography variant="subtitle2" color="textSecondary">
                Made on {formatDate(detailsDialog.offer.createdAt)}
              </Typography>
            </DialogTitle>
            <DialogContent>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Typography variant="h6">
                    {detailsDialog.offer.productListing.cropName}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Listed by {detailsDialog.offer.productListing.farmer.name}
                  </Typography>
                </Grid>
                
                <Grid item xs={12}>
                  <Divider />
                </Grid>
                
                <Grid item xs={6}>
                  <Typography variant="body2" color="textSecondary">
                    Your Offer Price
                  </Typography>
                  <Typography variant="body1" fontWeight="bold">
                    ₹{detailsDialog.offer.offerPrice}/{detailsDialog.offer.productListing.unit}
                  </Typography>
                </Grid>
                
                <Grid item xs={6}>
                  <Typography variant="body2" color="textSecondary">
                    Listed Price
                  </Typography>
                  <Typography variant="body1">
                    ₹{detailsDialog.offer.productListing.price}/{detailsDialog.offer.productListing.unit}
                  </Typography>
                </Grid>
                
                <Grid item xs={6}>
                  <Typography variant="body2" color="textSecondary">
                    Quantity
                  </Typography>
                  <Typography variant="body1">
                    {detailsDialog.offer.quantity} {detailsDialog.offer.productListing.unit}
                  </Typography>
                </Grid>
                
                <Grid item xs={6}>
                  <Typography variant="body2" color="textSecondary">
                    Total Value
                  </Typography>
                  <Typography variant="body1" fontWeight="bold">
                    ₹{detailsDialog.offer.quantity * detailsDialog.offer.offerPrice}
                  </Typography>
                </Grid>
                
                <Grid item xs={12}>
                  <Typography variant="body2" color="textSecondary">
                    Status
                  </Typography>
                  <Box sx={{ mt: 1 }}>
                    <Chip 
                      label={getStatusDetails(detailsDialog.offer.status).label} 
                      color={getStatusDetails(detailsDialog.offer.status).color}
                      icon={getStatusDetails(detailsDialog.offer.status).icon}
                    />
                  </Box>
                </Grid>
                
                {detailsDialog.offer.message && (
                  <Grid item xs={12}>
                    <Typography variant="body2" color="textSecondary">
                      Your Message
                    </Typography>
                    <Paper variant="outlined" sx={{ p: 2, mt: 1 }}>
                      <Typography variant="body2">
                        {detailsDialog.offer.message}
                      </Typography>
                    </Paper>
                  </Grid>
                )}
                
                {detailsDialog.offer.respondedAt && (
                  <Grid item xs={12}>
                    <Typography variant="body2" color="textSecondary">
                      Response Date
                    </Typography>
                    <Typography variant="body1">
                      {formatDate(detailsDialog.offer.respondedAt)}
                    </Typography>
                  </Grid>
                )}
                
                <Grid item xs={12}>
                  <Typography variant="body2" color="textSecondary">
                    Contact Method
                  </Typography>
                  <Typography variant="body1" sx={{ textTransform: 'capitalize' }}>
                    {detailsDialog.offer.contactDetails?.preferredContactMethod || 'In-App'}
                  </Typography>
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setDetailsDialog({ open: false, offer: null })}>
                Close
              </Button>
              <Button 
                component={Link}
                to={`/market-access/${detailsDialog.offer.productListing._id}`}
                variant="contained" 
                color="primary"
                onClick={() => setDetailsDialog({ open: false, offer: null })}
              >
                View Listing
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* Withdraw Confirmation Dialog */}
      <Dialog
        open={withdrawDialog.open}
        onClose={() => setWithdrawDialog({ open: false, offerId: null })}
      >
        <DialogTitle>Withdraw Offer</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to withdraw this offer? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setWithdrawDialog({ open: false, offerId: null })}>
            Cancel
          </Button>
          <Button onClick={confirmWithdrawOffer} color="error" variant="contained">
            Withdraw Offer
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default MyOffers;