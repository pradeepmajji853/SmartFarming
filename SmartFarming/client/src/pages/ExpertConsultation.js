import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Button,
  Box,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Rating,
  Chip,
  Avatar,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Tabs,
  Tab,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Alert
} from '@mui/material';
import {
  Search as SearchIcon,
  FilterList as FilterIcon,
  Star as StarIcon,
  Event as EventIcon,
  VideoCall as VideoIcon,
  Phone as PhoneIcon,
  Chat as ChatIcon,
  Money as MoneyIcon,
  Person as PersonIcon,
  Language as LanguageIcon,
  Schedule as ScheduleIcon
} from '@mui/icons-material';
import { getAllExperts, getExpertDetails, requestConsultation, getUserConsultations } from '../services/expertService';

const ExpertConsultation = () => {
  const [experts, setExperts] = useState([]);
  const [filteredExperts, setFilteredExperts] = useState([]);
  const [selectedExpert, setSelectedExpert] = useState(null);
  const [userConsultations, setUserConsultations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    specialty: '',
    minRating: ''
  });
  const [tabValue, setTabValue] = useState(0);
  const [consultationDialog, setConsultationDialog] = useState(false);
  const [consultationForm, setConsultationForm] = useState({
    scheduledDate: '',
    scheduledTime: '',
    description: '',
    preferredContactMethod: 'video'
  });
  const [formErrors, setFormErrors] = useState({});
  
  // Fetch experts on component mount
  useEffect(() => {
    fetchExperts();
    fetchUserConsultations();
  }, []);
  
  // Apply search and filters
  useEffect(() => {
    if (experts.length === 0) return;
    
    let result = [...experts];
    
    // Apply search
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      result = result.filter(expert => 
        expert.name.toLowerCase().includes(searchLower) || 
        expert.specialty.toLowerCase().includes(searchLower) ||
        expert.qualification.toLowerCase().includes(searchLower)
      );
    }
    
    // Apply specialty filter
    if (filters.specialty) {
      result = result.filter(expert => 
        expert.specialty.toLowerCase().includes(filters.specialty.toLowerCase())
      );
    }
    
    // Apply rating filter
    if (filters.minRating) {
      result = result.filter(expert => 
        expert.rating >= parseFloat(filters.minRating)
      );
    }
    
    setFilteredExperts(result);
  }, [experts, searchTerm, filters]);
  
  const fetchExperts = async () => {
    try {
      setLoading(true);
      const response = await getAllExperts();
      setExperts(response.data);
      setFilteredExperts(response.data);
      setError(null);
    } catch (err) {
      setError(err.message || 'Failed to fetch experts');
      setExperts([]);
      setFilteredExperts([]);
    } finally {
      setLoading(false);
    }
  };
  
  const fetchUserConsultations = async () => {
    try {
      const response = await getUserConsultations();
      setUserConsultations(response.data);
    } catch (err) {
      console.error('Error fetching consultations:', err);
      // Don't set error state to avoid blocking the entire page
    }
  };
  
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };
  
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleClearFilters = () => {
    setSearchTerm('');
    setFilters({
      specialty: '',
      minRating: ''
    });
  };
  
  const handleExpertSelect = async (expertId) => {
    try {
      setLoading(true);
      const response = await getExpertDetails(expertId);
      setSelectedExpert(response.data);
      setError(null);
    } catch (err) {
      setError(err.message || 'Failed to fetch expert details');
    } finally {
      setLoading(false);
    }
  };
  
  const handleBackToExperts = () => {
    setSelectedExpert(null);
  };
  
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };
  
  const handleOpenConsultationDialog = () => {
    setConsultationDialog(true);
    setConsultationForm({
      scheduledDate: '',
      scheduledTime: '',
      description: '',
      preferredContactMethod: 'video'
    });
    setFormErrors({});
  };
  
  const handleCloseConsultationDialog = () => {
    setConsultationDialog(false);
  };
  
  const handleConsultationFormChange = (e) => {
    const { name, value } = e.target;
    setConsultationForm(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error for this field
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
  };
  
  const validateForm = () => {
    const errors = {};
    
    if (!consultationForm.scheduledDate) {
      errors.scheduledDate = 'Please select a date';
    }
    
    if (!consultationForm.scheduledTime) {
      errors.scheduledTime = 'Please select a time slot';
    }
    
    if (!consultationForm.description) {
      errors.description = 'Please provide a description of your issue';
    } else if (consultationForm.description.length < 10) {
      errors.description = 'Description is too short';
    }
    
    if (!consultationForm.preferredContactMethod) {
      errors.preferredContactMethod = 'Please select a contact method';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  const handleRequestConsultation = async () => {
    if (!validateForm()) return;
    
    try {
      setLoading(true);
      await requestConsultation({
        expertId: selectedExpert._id,
        ...consultationForm
      });
      
      // Update consultations list
      await fetchUserConsultations();
      
      // Close dialog
      handleCloseConsultationDialog();
      
      // Show confirmation
      // You would typically use a snackbar here
      alert('Consultation request submitted successfully!');
    } catch (err) {
      setError(err.message || 'Failed to request consultation');
    } finally {
      setLoading(false);
    }
  };

  // Options for specialty filter
  const specialtyOptions = [
    'Crop Disease',
    'Pest Management',
    'Soil Health',
    'Irrigation',
    'Organic Farming',
    'Sustainable Farming'
  ];
  
  // Available rating options
  const ratingOptions = ['4.0+', '4.5+', '4.8+'];
  
  // Get status badge color
  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed': return 'success';
      case 'pending': return 'warning';
      case 'completed': return 'info';
      case 'canceled': return 'error';
      default: return 'default';
    }
  };
  
  return (
    <Container maxWidth="lg">
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Expert Consultation
        </Typography>
        <Typography variant="subtitle1" color="textSecondary" paragraph>
          Connect with agricultural experts for personalized guidance and problem-solving.
        </Typography>
      </Box>
      
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      {!selectedExpert && (
        <>
          {/* Tabs for main sections */}
          <Paper sx={{ mb: 3 }}>
            <Tabs
              value={tabValue}
              onChange={handleTabChange}
              indicatorColor="primary"
              textColor="primary"
              variant="fullWidth"
            >
              <Tab label="Find Experts" />
              <Tab label="My Consultations" />
            </Tabs>
          </Paper>
          
          {/* Find Experts Tab */}
          {tabValue === 0 && (
            <>
              {/* Search and Filter Row */}
              <Grid container spacing={2} sx={{ mb: 4 }}>
                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    label="Search Experts"
                    variant="outlined"
                    value={searchTerm}
                    onChange={handleSearchChange}
                    InputProps={{
                      startAdornment: <SearchIcon color="action" sx={{ mr: 1 }} />,
                    }}
                  />
                </Grid>
                
                <Grid item xs={12} sm={6} md={3}>
                  <FormControl fullWidth variant="outlined">
                    <InputLabel id="specialty-label">Specialty</InputLabel>
                    <Select
                      labelId="specialty-label"
                      id="specialty"
                      name="specialty"
                      value={filters.specialty}
                      onChange={handleFilterChange}
                      label="Specialty"
                    >
                      <MenuItem value="">
                        <em>Any</em>
                      </MenuItem>
                      {specialtyOptions.map(specialty => (
                        <MenuItem key={specialty} value={specialty}>{specialty}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                
                <Grid item xs={12} sm={6} md={3}>
                  <FormControl fullWidth variant="outlined">
                    <InputLabel id="rating-label">Minimum Rating</InputLabel>
                    <Select
                      labelId="rating-label"
                      id="minRating"
                      name="minRating"
                      value={filters.minRating}
                      onChange={handleFilterChange}
                      label="Minimum Rating"
                    >
                      <MenuItem value="">
                        <em>Any</em>
                      </MenuItem>
                      {ratingOptions.map(rating => (
                        <MenuItem key={rating} value={rating.replace('+', '')}>
                          {rating}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                
                <Grid item xs={12} md={2} sx={{ display: 'flex', alignItems: 'center' }}>
                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<FilterIcon />}
                    onClick={handleClearFilters}
                  >
                    Clear Filters
                  </Button>
                </Grid>
              </Grid>
              
              {/* Experts List */}
              {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
                  <CircularProgress />
                </Box>
              ) : filteredExperts.length > 0 ? (
                <Grid container spacing={3}>
                  {filteredExperts.map(expert => (
                    <Grid item xs={12} md={6} key={expert._id}>
                      <Card 
                        sx={{ 
                          display: 'flex', 
                          flexDirection: { xs: 'column', sm: 'row' },
                          transition: 'transform 0.2s',
                          '&:hover': {
                            transform: 'translateY(-4px)',
                            boxShadow: 3
                          }
                        }}
                      >
                        <CardMedia
                          component="img"
                          sx={{ width: { xs: '100%', sm: 140 }, height: { xs: 200, sm: 'auto' }, objectFit: 'cover' }}
                          image={expert.imageUrl || 'https://via.placeholder.com/140x200?text=Expert+Photo'}
                          alt={expert.name}
                        />
                        <CardContent sx={{ flex: '1 0 auto', display: 'flex', flexDirection: 'column' }}>
                          <Typography variant="h6" component="h2">
                            {expert.name}
                          </Typography>
                          
                          <Typography variant="subtitle2" color="primary" gutterBottom>
                            {expert.specialty}
                          </Typography>
                          
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                            <Rating value={expert.rating} readOnly precision={0.5} size="small" />
                            <Typography variant="body2" sx={{ ml: 1 }}>
                              {expert.rating}
                            </Typography>
                          </Box>
                          
                          <Typography variant="body2" color="text.secondary">
                            {expert.qualification}
                          </Typography>
                          
                          <Box sx={{ display: 'flex', alignItems: 'center', mt: 1, mb: 1 }}>
                            <MoneyIcon fontSize="small" color="action" sx={{ mr: 1 }} />
                            <Typography variant="body2">
                              ₹{expert.consultationFee} / session
                            </Typography>
                          </Box>
                          
                          <Box sx={{ mt: 'auto', pt: 1 }}>
                            <Button 
                              variant="contained" 
                              onClick={() => handleExpertSelect(expert._id)}
                              fullWidth
                            >
                              View Profile
                            </Button>
                          </Box>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              ) : (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <Typography variant="h6" color="textSecondary">
                    No experts found matching your criteria
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
            </>
          )}
          
          {/* My Consultations Tab */}
          {tabValue === 1 && (
            <>
              {userConsultations.length > 0 ? (
                <List>
                  {userConsultations.map(consultation => (
                    <Paper 
                      key={consultation._id} 
                      variant="outlined"
                      sx={{ mb: 2, overflow: 'hidden' }}
                    >
                      <ListItem
                        secondaryAction={
                          <Chip 
                            label={consultation.status} 
                            color={getStatusColor(consultation.status)} 
                          />
                        }
                      >
                        <ListItemAvatar>
                          <Avatar 
                            src={consultation.expert.imageUrl} 
                            alt={consultation.expert.name}
                          >
                            <PersonIcon />
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={<>
                            <Typography component="span" variant="subtitle1">
                              {consultation.expert.name}
                            </Typography> - <Typography component="span" variant="body2" color="textSecondary">
                              {consultation.expert.specialty}
                            </Typography>
                          </>}
                          secondary={
                            <Box sx={{ mt: 1 }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                                <EventIcon fontSize="small" color="action" sx={{ mr: 1 }} />
                                <Typography variant="body2">
                                  {consultation.scheduledDate} | {consultation.scheduledTime}
                                </Typography>
                              </Box>
                              <Typography variant="body2" color="textSecondary">
                                {consultation.description.substring(0, 100)}
                                {consultation.description.length > 100 ? '...' : ''}
                              </Typography>
                            </Box>
                          }
                        />
                      </ListItem>
                      <Divider />
                      <Box sx={{ display: 'flex', justifyContent: 'flex-end', p: 1 }}>
                        <Button 
                          size="small" 
                          component={Link} 
                          to={`/consultations/${consultation._id}`}
                        >
                          View Details
                        </Button>
                        {consultation.status === 'confirmed' && (
                          <Button 
                            size="small" 
                            variant="contained" 
                            color="primary" 
                            sx={{ ml: 1 }}
                            component={Link}
                            to={`/consultations/${consultation._id}/chat`}
                          >
                            Start Session
                          </Button>
                        )}
                      </Box>
                    </Paper>
                  ))}
                </List>
              ) : (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <Typography variant="h6" color="textSecondary">
                    You don't have any consultations yet
                  </Typography>
                  <Button 
                    variant="outlined" 
                    sx={{ mt: 2 }}
                    onClick={() => setTabValue(0)}
                  >
                    Find Experts
                  </Button>
                </Box>
              )}
            </>
          )}
        </>
      )}
      
      {/* Expert Details View */}
      {selectedExpert && (
        <Box>
          <Button 
            variant="text" 
            onClick={handleBackToExperts}
            sx={{ mb: 2 }}
          >
            &larr; Back to Experts
          </Button>
          
          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <Card>
                <CardMedia
                  component="img"
                  height="300"
                  image={selectedExpert.imageUrl || 'https://via.placeholder.com/300x300?text=Expert+Photo'}
                  alt={selectedExpert.name}
                  sx={{ objectFit: 'cover' }}
                />
                <CardContent>
                  <Typography variant="h5" gutterBottom>
                    {selectedExpert.name}
                  </Typography>
                  
                  <Typography variant="subtitle1" color="primary" gutterBottom>
                    {selectedExpert.specialty}
                  </Typography>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Rating value={selectedExpert.rating} readOnly precision={0.5} />
                    <Typography variant="body2" sx={{ ml: 1 }}>
                      ({selectedExpert.rating})
                    </Typography>
                  </Box>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <PersonIcon fontSize="small" color="action" sx={{ mr: 1 }} />
                    <Typography variant="body2">
                      {selectedExpert.experience} years of experience
                    </Typography>
                  </Box>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <LanguageIcon fontSize="small" color="action" sx={{ mr: 1 }} />
                    <Typography variant="body2">
                      Languages: {selectedExpert.languages?.join(', ') || 'English'}
                    </Typography>
                  </Box>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <MoneyIcon fontSize="small" color="action" sx={{ mr: 1 }} />
                    <Typography variant="body2">
                      Consultation Fee: ₹{selectedExpert.consultationFee} / session
                    </Typography>
                  </Box>
                  
                  <Box sx={{ mt: 2 }}>
                    <Button 
                      variant="contained" 
                      color="primary"
                      fullWidth
                      onClick={handleOpenConsultationDialog}
                    >
                      Book Consultation
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} md={8}>
              <Paper sx={{ p: 3, mb: 3 }}>
                <Typography variant="h6" gutterBottom>
                  About
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <Typography variant="body1" paragraph>
                  {selectedExpert.bio}
                </Typography>
                
                <Typography variant="h6" gutterBottom>
                  Specialties
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                  {selectedExpert.specialties?.map((specialty, index) => (
                    <Chip 
                      key={index} 
                      label={specialty} 
                      size="small" 
                    />
                  ))}
                </Box>
              </Paper>
              
              <Paper sx={{ p: 3, mb: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Availability
                </Typography>
                <Divider sx={{ mb: 2 }} />
                
                <Box sx={{ mb: 2 }}>
                  {selectedExpert.availability?.map((item, index) => (
                    <Paper variant="outlined" key={index} sx={{ p: 2, mb: 2 }}>
                      <Typography variant="subtitle1" gutterBottom>
                        {item.day}
                      </Typography>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                        {item.slots.map((slot, i) => (
                          <Chip 
                            key={i} 
                            label={slot} 
                            size="small" 
                            icon={<ScheduleIcon />}
                            variant="outlined"
                          />
                        ))}
                      </Box>
                    </Paper>
                  ))}
                </Box>
              </Paper>
              
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Reviews
                </Typography>
                <Divider sx={{ mb: 2 }} />
                
                {selectedExpert.reviews?.length > 0 ? (
                  <List>
                    {selectedExpert.reviews.map((review, index) => (
                      <React.Fragment key={index}>
                        {index > 0 && <Divider variant="inset" component="li" />}
                        <ListItem alignItems="flex-start">
                          <ListItemAvatar>
                            <Avatar>{review.user.charAt(0)}</Avatar>
                          </ListItemAvatar>
                          <ListItemText
                            primary={
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Typography component="span" variant="subtitle2">
                                  {review.user}
                                </Typography>
                                <Box>
                                  <Rating value={review.rating} size="small" readOnly />
                                </Box>
                              </Box>
                            }
                            secondary={
                              <>
                                <Typography
                                  component="span"
                                  variant="body2"
                                  color="text.primary"
                                  sx={{ display: 'block', mt: 1 }}
                                >
                                  {review.comment}
                                </Typography>
                                <Typography variant="caption" sx={{ mt: 0.5, display: 'block', textAlign: 'right' }}>
                                  {review.date}
                                </Typography>
                              </>
                            }
                          />
                        </ListItem>
                      </React.Fragment>
                    ))}
                  </List>
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    No reviews available yet.
                  </Typography>
                )}
              </Paper>
            </Grid>
          </Grid>
        </Box>
      )}
      
      {/* Consultation Request Dialog */}
      <Dialog
        open={consultationDialog}
        onClose={handleCloseConsultationDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Book Consultation with {selectedExpert?.name}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Date"
                name="scheduledDate"
                type="date"
                value={consultationForm.scheduledDate}
                onChange={handleConsultationFormChange}
                fullWidth
                margin="normal"
                InputLabelProps={{
                  shrink: true,
                }}
                inputProps={{
                  min: new Date().toISOString().split('T')[0] // Today's date
                }}
                error={!!formErrors.scheduledDate}
                helperText={formErrors.scheduledDate}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth margin="normal" error={!!formErrors.scheduledTime}>
                <InputLabel id="time-slot-label">Time Slot</InputLabel>
                <Select
                  labelId="time-slot-label"
                  name="scheduledTime"
                  value={consultationForm.scheduledTime}
                  onChange={handleConsultationFormChange}
                  label="Time Slot"
                >
                  <MenuItem value="">
                    <em>Select a time slot</em>
                  </MenuItem>
                  <MenuItem value="10:00 AM - 11:00 AM">10:00 AM - 11:00 AM</MenuItem>
                  <MenuItem value="11:30 AM - 12:30 PM">11:30 AM - 12:30 PM</MenuItem>
                  <MenuItem value="2:00 PM - 3:00 PM">2:00 PM - 3:00 PM</MenuItem>
                  <MenuItem value="3:30 PM - 4:30 PM">3:30 PM - 4:30 PM</MenuItem>
                  <MenuItem value="5:00 PM - 6:00 PM">5:00 PM - 6:00 PM</MenuItem>
                </Select>
                {formErrors.scheduledTime && (
                  <Typography variant="caption" color="error">
                    {formErrors.scheduledTime}
                  </Typography>
                )}
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Describe your issue or question"
                name="description"
                value={consultationForm.description}
                onChange={handleConsultationFormChange}
                fullWidth
                margin="normal"
                multiline
                rows={4}
                placeholder="Please provide details about your farming issue or questions you'd like to discuss with the expert"
                error={!!formErrors.description}
                helperText={formErrors.description}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth margin="normal" error={!!formErrors.preferredContactMethod}>
                <InputLabel id="contact-method-label">Preferred Contact Method</InputLabel>
                <Select
                  labelId="contact-method-label"
                  name="preferredContactMethod"
                  value={consultationForm.preferredContactMethod}
                  onChange={handleConsultationFormChange}
                  label="Preferred Contact Method"
                >
                  <MenuItem value="video">
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <VideoIcon sx={{ mr: 1 }} /> Video Call
                    </Box>
                  </MenuItem>
                  <MenuItem value="phone">
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <PhoneIcon sx={{ mr: 1 }} /> Phone Call
                    </Box>
                  </MenuItem>
                  <MenuItem value="chat">
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <ChatIcon sx={{ mr: 1 }} /> Text Chat
                    </Box>
                  </MenuItem>
                </Select>
                {formErrors.preferredContactMethod && (
                  <Typography variant="caption" color="error">
                    {formErrors.preferredContactMethod}
                  </Typography>
                )}
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseConsultationDialog}>Cancel</Button>
          <Button 
            onClick={handleRequestConsultation} 
            variant="contained"
            color="primary"
          >
            Request Consultation
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default ExpertConsultation;