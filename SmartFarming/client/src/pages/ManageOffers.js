import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  Container, 
  Typography, 
  Box, 
  Grid, 
  Card, 
  CardContent, 
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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Avatar,
  Breadcrumbs,
  Tooltip,
  IconButton
} from '@mui/material';
import {
  ArrowBack as BackIcon,
  Person as BuyerIcon,
  CheckCircle as AcceptIcon,
  Cancel as RejectIcon,
  InfoOutlined as InfoIcon,
  ThumbUp as AcceptedIcon,
  ThumbDown as RejectedIcon,
  AccessTime as PendingIcon
} from '@mui/icons-material';
import { getOffersForListing, getListingById, respondToOffer } from '../services/marketplaceService';

const ManageOffers = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [listing, setListing] = useState(null);
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  
  // Dialog state
  const [responseDialog, setResponseDialog] = useState({
    open: false,
    offerId: null,
    action: null // 'accept' or 'reject'
  });
  const [offerDetailsDialog, setOfferDetailsDialog] = useState({
    open: false,
    offer: null
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch listing details
        const listingResponse = await getListingById(id);
        setListing(listingResponse.data);
        
        // Fetch offers for this listing
        const offersResponse = await getOffersForListing(id);
        setOffers(offersResponse.data);
        
        setError(null);
      } catch (err) {
        setError(err.message || 'Failed to fetch offers');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchData();
    }
  }, [id]);

  // Format date
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleString(undefined, options);
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
      default:
        return { color: 'default', icon: null, label: status };
    }
  };

  // Show response dialog for accept/reject
  const handleShowResponseDialog = (offerId, action) => {
    setResponseDialog({
      open: true,
      offerId,
      action
    });
  };

  // Show offer details dialog
  const handleShowOfferDetails = (offer) => {
    setOfferDetailsDialog({
      open: true,
      offer
    });
  };

  // Handle offer response (accept/reject)
  const handleOfferResponse = async () => {
    try {
      const { offerId, action } = responseDialog;
      
      // Call API to respond to offer
      await respondToOffer(offerId, action);
      
      // Update the offer in the local state
      setOffers(prevOffers => 
        prevOffers.map(offer => 
          offer._id === offerId 
            ? { ...offer, status: action } 
            : offer
        )
      );
      
      // Show success message
      setSuccess(`Offer ${action === 'accepted' ? 'accepted' : 'rejected'} successfully!`);
      
      // Close dialog
      setResponseDialog({
        open: false,
        offerId: null,
        action: null
      });
      
      // Clear success message after some time
      setTimeout(() => {
        setSuccess(null);
      }, 5000);
      
    } catch (err) {
      setError(err.message || 'Failed to respond to offer');
    }
  };

  // Calculate difference between offer price and listing price
  const calculatePriceDifference = (offerPrice, listingPrice) => {
    const diff = ((offerPrice - listingPrice) / listingPrice) * 100;
    return diff.toFixed(1);
  };

  return (
    <Container maxWidth="lg">
      {/* Breadcrumbs */}
      <Breadcrumbs sx={{ mb: 2 }}>
        <Link to="/market-access" style={{ textDecoration: 'none', color: 'inherit' }}>
          Digital Marketplace
        </Link>
        <Link to={`/market-access/${id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
          Listing Details
        </Link>
        <Typography color="text.primary">Manage Offers</Typography>
      </Breadcrumbs>

      {/* Back button */}
      <Button
        startIcon={<BackIcon />}
        onClick={() => navigate(`/market-access/${id}`)}
        sx={{ mb: 3 }}
      >
        Back to Listing
      </Button>

      {/* Error message */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Success message */}
      {success && (
        <Alert severity="success" sx={{ mb: 3 }}>
          {success}
        </Alert>
      )}

      {/* Loading indicator */}
      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      )}

      {/* Listing summary */}
      {!loading && listing && (
        <Paper sx={{ p: 3, mb: 4 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={8}>
              <Typography variant="h5" gutterBottom>
                {listing.cropName}
              </Typography>
              <Typography variant="body1" color="textSecondary" paragraph>
                {listing.quantity} {listing.unit} available at ₹{listing.price}/{listing.unit}
              </Typography>
              <Chip 
                label={listing.status === 'active' ? 'Active' : listing.status}
                color={listing.status === 'active' ? 'success' : 'default'}
                size="small"
              />
            </Grid>
            <Grid item xs={12} md={4} sx={{ display: 'flex', justifyContent: { md: 'flex-end' }, alignItems: 'center' }}>
              <Button
                component={Link}
                to={`/market-access/${id}`}
                variant="outlined"
                sx={{ mr: 1 }}
              >
                View Listing
              </Button>
              <Button
                component={Link}
                to={`/market-access/edit/${id}`}
                variant="contained"
              >
                Edit
              </Button>
            </Grid>
          </Grid>
        </Paper>
      )}

      {/* Offers section */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" component="h2" gutterBottom>
          Offers Received
        </Typography>
        <Typography variant="subtitle1" color="textSecondary">
          Review and respond to offers from potential buyers
        </Typography>
      </Box>
      
      {/* No offers message */}
      {!loading && offers.length === 0 && (
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="body1" color="textSecondary">
            No offers have been made on this listing yet.
          </Typography>
        </Paper>
      )}

      {/* Offers table */}
      {!loading && offers.length > 0 && (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Buyer</TableCell>
                <TableCell>Offer Price</TableCell>
                <TableCell>Quantity</TableCell>
                <TableCell>Total Value</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {offers.map(offer => {
                const { color, icon, label } = getStatusDetails(offer.status);
                const isPending = offer.status === 'pending';
                const priceDiff = calculatePriceDifference(offer.offerPrice, listing.price);
                const priceColor = priceDiff >= 0 ? 'success.main' : 'error.main';
                
                return (
                  <TableRow key={offer._id} hover>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Avatar sx={{ mr: 1, width: 32, height: 32 }}>
                          <BuyerIcon fontSize="small" />
                        </Avatar>
                        <Typography variant="body2">
                          {offer.buyer.name}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box>
                        <Typography variant="body2" fontWeight="bold">
                          ₹{offer.offerPrice}/{listing.unit}
                        </Typography>
                        <Typography variant="caption" sx={{ color: priceColor }}>
                          {priceDiff > 0 ? '+' : ''}{priceDiff}% {priceDiff >= 0 ? 'above' : 'below'} asking
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      {offer.quantity} {listing.unit}
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight="bold">
                        ₹{offer.quantity * offer.offerPrice}
                      </Typography>
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
                      />
                    </TableCell>
                    <TableCell align="right">
                      <Box>
                        <Tooltip title="View Details">
                          <IconButton 
                            size="small" 
                            color="primary"
                            onClick={() => handleShowOfferDetails(offer)}
                          >
                            <InfoIcon />
                          </IconButton>
                        </Tooltip>
                        
                        {isPending && (
                          <>
                            <Tooltip title="Accept Offer">
                              <IconButton 
                                size="small" 
                                color="success"
                                onClick={() => handleShowResponseDialog(offer._id, 'accepted')}
                              >
                                <AcceptIcon />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Reject Offer">
                              <IconButton 
                                size="small" 
                                color="error"
                                onClick={() => handleShowResponseDialog(offer._id, 'rejected')}
                              >
                                <RejectIcon />
                              </IconButton>
                            </Tooltip>
                          </>
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

      {/* Response confirmation dialog */}
      <Dialog
        open={responseDialog.open}
        onClose={() => setResponseDialog({ open: false, offerId: null, action: null })}
      >
        <DialogTitle>
          {responseDialog.action === 'accepted' ? 'Accept Offer' : 'Reject Offer'}
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            {responseDialog.action === 'accepted' 
              ? 'Are you sure you want to accept this offer? The buyer will be notified that their offer has been accepted.'
              : 'Are you sure you want to reject this offer? The buyer will be notified that their offer has been rejected.'
            }
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setResponseDialog({ open: false, offerId: null, action: null })}>
            Cancel
          </Button>
          <Button 
            onClick={handleOfferResponse} 
            color={responseDialog.action === 'accepted' ? 'success' : 'error'} 
            variant="contained"
          >
            {responseDialog.action === 'accepted' ? 'Accept' : 'Reject'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Offer Details Dialog */}
      <Dialog
        open={offerDetailsDialog.open}
        onClose={() => setOfferDetailsDialog({ open: false, offer: null })}
        maxWidth="sm"
        fullWidth
      >
        {offerDetailsDialog.offer && (
          <>
            <DialogTitle>
              Offer Details
              <Typography variant="subtitle2" color="textSecondary">
                Received on {formatDate(offerDetailsDialog.offer.createdAt)}
              </Typography>
            </DialogTitle>
            <DialogContent>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Avatar sx={{ mr: 2 }}>
                      <BuyerIcon />
                    </Avatar>
                    <Box>
                      <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                        {offerDetailsDialog.offer.buyer.name}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        {offerDetailsDialog.offer.buyer.email}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
                
                <Grid item xs={12}>
                  <Divider />
                </Grid>
                
                <Grid item xs={6}>
                  <Typography variant="body2" color="textSecondary">
                    Offer Price
                  </Typography>
                  <Typography variant="body1" fontWeight="bold">
                    ₹{offerDetailsDialog.offer.offerPrice}/{listing?.unit}
                  </Typography>
                  {listing && (
                    <Typography variant="caption" sx={{ 
                      color: offerDetailsDialog.offer.offerPrice >= listing.price 
                        ? 'success.main' 
                        : 'error.main' 
                    }}>
                      {offerDetailsDialog.offer.offerPrice >= listing.price ? '+' : ''}
                      {calculatePriceDifference(offerDetailsDialog.offer.offerPrice, listing.price)}%
                      compared to asking price
                    </Typography>
                  )}
                </Grid>
                
                <Grid item xs={6}>
                  <Typography variant="body2" color="textSecondary">
                    Quantity
                  </Typography>
                  <Typography variant="body1">
                    {offerDetailsDialog.offer.quantity} {listing?.unit}
                  </Typography>
                  {listing && (
                    <Typography variant="caption">
                      {Math.round((offerDetailsDialog.offer.quantity / listing.quantity) * 100)}% of available quantity
                    </Typography>
                  )}
                </Grid>
                
                <Grid item xs={6}>
                  <Typography variant="body2" color="textSecondary">
                    Total Value
                  </Typography>
                  <Typography variant="body1" fontWeight="bold">
                    ₹{offerDetailsDialog.offer.quantity * offerDetailsDialog.offer.offerPrice}
                  </Typography>
                </Grid>
                
                <Grid item xs={6}>
                  <Typography variant="body2" color="textSecondary">
                    Status
                  </Typography>
                  <Box sx={{ mt: 1 }}>
                    <Chip 
                      label={getStatusDetails(offerDetailsDialog.offer.status).label} 
                      color={getStatusDetails(offerDetailsDialog.offer.status).color}
                      icon={getStatusDetails(offerDetailsDialog.offer.status).icon}
                    />
                  </Box>
                </Grid>
                
                {offerDetailsDialog.offer.message && (
                  <Grid item xs={12}>
                    <Typography variant="body2" color="textSecondary">
                      Buyer Message
                    </Typography>
                    <Paper variant="outlined" sx={{ p: 2, mt: 1 }}>
                      <Typography variant="body2">
                        {offerDetailsDialog.offer.message}
                      </Typography>
                    </Paper>
                  </Grid>
                )}
                
                <Grid item xs={12}>
                  <Typography variant="body2" color="textSecondary">
                    Buyer's Preferred Contact Method
                  </Typography>
                  <Typography variant="body1" sx={{ textTransform: 'capitalize' }}>
                    {offerDetailsDialog.offer.contactDetails?.preferredContactMethod || 'In-App'}
                  </Typography>
                  {offerDetailsDialog.offer.contactDetails?.phone && (
                    <Typography variant="body2">
                      Phone: {offerDetailsDialog.offer.contactDetails.phone}
                    </Typography>
                  )}
                  {offerDetailsDialog.offer.contactDetails?.email && (
                    <Typography variant="body2">
                      Email: {offerDetailsDialog.offer.contactDetails.email}
                    </Typography>
                  )}
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setOfferDetailsDialog({ open: false, offer: null })}>
                Close
              </Button>
              {offerDetailsDialog.offer.status === 'pending' && (
                <>
                  <Button 
                    onClick={() => {
                      setOfferDetailsDialog({ open: false, offer: null });
                      handleShowResponseDialog(offerDetailsDialog.offer._id, 'rejected');
                    }}
                    color="error"
                  >
                    Reject
                  </Button>
                  <Button 
                    onClick={() => {
                      setOfferDetailsDialog({ open: false, offer: null });
                      handleShowResponseDialog(offerDetailsDialog.offer._id, 'accepted');
                    }}
                    color="success"
                    variant="contained"
                  >
                    Accept
                  </Button>
                </>
              )}
            </DialogActions>
          </>
        )}
      </Dialog>
    </Container>
  );
};

export default ManageOffers;