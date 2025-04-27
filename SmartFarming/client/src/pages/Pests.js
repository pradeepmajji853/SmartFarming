import React, { useState, useEffect } from 'react';
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
  Tabs,
  Tab,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton
} from '@mui/material';
import { 
  Search as SearchIcon,
  BugReport as PestIcon,
  FilterAlt as FilterIcon,
  LocalHospital as TreatmentIcon,
  Agriculture as CropIcon,
  Info as InfoIcon,
  WarningAmber as WarningIcon,
  Close as CloseIcon,
  Image as ImageIcon,
  CloudUpload as UploadIcon
} from '@mui/icons-material';
import { getAllPests, getPestDetails, identifyPest, getTreatments } from '../services/pestService';

const Pests = () => {
  const [pests, setPests] = useState([]);
  const [filteredPests, setFilteredPests] = useState([]);
  const [selectedPest, setSelectedPest] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    cropType: '',
    severity: '',
    season: ''
  });
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [uploadImage, setUploadImage] = useState(null);
  const [uploadPreview, setUploadPreview] = useState('');
  const [identificationLoading, setIdentificationLoading] = useState(false);
  const [identificationResult, setIdentificationResult] = useState(null);
  const [identificationError, setIdentificationError] = useState(null);

  // Options for filters
  const cropTypes = ['Rice', 'Wheat', 'Cotton', 'Corn', 'Sugarcane', 'Vegetables', 'Fruits', 'All'];
  const severityLevels = ['Low', 'Medium', 'High'];
  const seasons = ['Spring', 'Summer', 'Fall', 'Winter', 'All Year'];

  useEffect(() => {
    // Fetch all pests on component mount
    const fetchPests = async () => {
      try {
        setLoading(true);
        const response = await getAllPests();
        setPests(response.data);
        setFilteredPests(response.data);
        setError(null);
      } catch (err) {
        setError(err.message || 'Failed to fetch pest data');
        setPests([]);
        setFilteredPests([]);
      } finally {
        setLoading(false);
      }
    };

    fetchPests();
  }, []);

  // Handle search and filter changes
  useEffect(() => {
    if (pests.length === 0) return;

    let result = [...pests];
    
    // Apply search filter
    if (searchTerm) {
      const searchTermLower = searchTerm.toLowerCase();
      result = result.filter(pest => 
        pest.name.toLowerCase().includes(searchTermLower) || 
        pest.scientificName.toLowerCase().includes(searchTermLower) ||
        pest.description.toLowerCase().includes(searchTermLower)
      );
    }
    
    // Apply crop type filter
    if (filters.cropType && filters.cropType !== 'All') {
      result = result.filter(pest => 
        pest.affectedCrops.includes(filters.cropType)
      );
    }
    
    // Apply severity filter
    if (filters.severity) {
      result = result.filter(pest => 
        pest.severity === filters.severity.toLowerCase()
      );
    }
    
    // Apply season filter
    if (filters.season && filters.season !== 'All Year') {
      result = result.filter(pest => 
        pest.activeSeasons.includes(filters.season.toLowerCase())
      );
    }
    
    setFilteredPests(result);
  }, [pests, searchTerm, filters]);

  // Handle search input change
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  // Handle filter changes
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Clear all filters
  const handleClearFilters = () => {
    setFilters({
      cropType: '',
      severity: '',
      season: ''
    });
    setSearchTerm('');
  };

  const handlePestSelect = async (pestId) => {
    try {
      setLoading(true);
      const response = await getPestDetails(pestId);
      setSelectedPest(response.data);
      setError(null);
    } catch (err) {
      setError(err.message || 'Failed to fetch pest details');
    } finally {
      setLoading(false);
      setTabValue(0); // Reset to first tab
    }
  };

  const handleCloseDetails = () => {
    setSelectedPest(null);
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleImageUpload = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setUploadImage(file);
      setUploadPreview(URL.createObjectURL(file));
    }
  };

  const handleOpenDialog = () => {
    setDialogOpen(true);
    setUploadImage(null);
    setUploadPreview('');
    setIdentificationResult(null);
    setIdentificationError(null);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
  };

  const handleIdentifyPest = async () => {
    if (!uploadImage) {
      setIdentificationError('Please upload an image first');
      return;
    }

    try {
      setIdentificationLoading(true);
      setIdentificationError(null);
      
      // Create form data to send image
      const formData = new FormData();
      formData.append('image', uploadImage);
      
      const response = await identifyPest(formData);
      setIdentificationResult(response.data);
      
      // If a pest was successfully identified, fetch its details
      if (response.data.pest) {
        handlePestSelect(response.data.pest._id);
        handleCloseDialog();
      }
    } catch (err) {
      setIdentificationError(err.message || 'Failed to identify pest');
    } finally {
      setIdentificationLoading(false);
    }
  };

  const getSeverityColor = (severity) => {
    switch(severity) {
      case 'low': return 'success';
      case 'medium': return 'warning';
      case 'high': return 'error';
      default: return 'primary';
    }
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Pest Management
        </Typography>
        <Typography variant="body1" color="textSecondary" paragraph>
          Identify pests affecting your crops and get targeted treatment recommendations.
        </Typography>
      </Box>

      {/* Pest Identification Banner */}
      <Paper sx={{ p: 3, mb: 4, backgroundColor: 'secondary.light' }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={8}>
            <Typography variant="h6" gutterBottom component="div" sx={{ display: 'flex', alignItems: 'center' }}>
              <ImageIcon sx={{ mr: 1 }} /> Identify Pests with Image Recognition
            </Typography>
            <Typography variant="body2">
              Upload a photo of the pest or affected plant part for instant identification and treatment recommendations.
            </Typography>
          </Grid>
          <Grid item xs={12} md={4} sx={{ display: 'flex', justifyContent: { xs: 'flex-start', md: 'flex-end' } }}>
            <Button 
              variant="contained" 
              color="secondary" 
              startIcon={<UploadIcon />}
              onClick={handleOpenDialog}
              size="large"
            >
              Upload & Identify
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Search and Filter Section */}
      <Grid container spacing={2} sx={{ mb: 4 }}>
        <Grid item xs={12} md={4}>
          <TextField
            fullWidth
            label="Search Pests"
            variant="outlined"
            value={searchTerm}
            onChange={handleSearchChange}
            InputProps={{
              startAdornment: <SearchIcon color="action" sx={{ mr: 1 }} />,
            }}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={2}>
          <FormControl fullWidth variant="outlined">
            <InputLabel id="crop-type-label">Crop Type</InputLabel>
            <Select
              labelId="crop-type-label"
              id="cropType"
              name="cropType"
              value={filters.cropType}
              onChange={handleFilterChange}
              label="Crop Type"
            >
              <MenuItem value="">
                <em>Any</em>
              </MenuItem>
              {cropTypes.map(crop => (
                <MenuItem key={crop} value={crop}>{crop}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} sm={6} md={2}>
          <FormControl fullWidth variant="outlined">
            <InputLabel id="severity-label">Severity</InputLabel>
            <Select
              labelId="severity-label"
              id="severity"
              name="severity"
              value={filters.severity}
              onChange={handleFilterChange}
              label="Severity"
            >
              <MenuItem value="">
                <em>Any</em>
              </MenuItem>
              {severityLevels.map(level => (
                <MenuItem key={level} value={level}>{level}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} sm={6} md={2}>
          <FormControl fullWidth variant="outlined">
            <InputLabel id="season-label">Season</InputLabel>
            <Select
              labelId="season-label"
              id="season"
              name="season"
              value={filters.season}
              onChange={handleFilterChange}
              label="Season"
            >
              <MenuItem value="">
                <em>Any</em>
              </MenuItem>
              {seasons.map(season => (
                <MenuItem key={season} value={season}>{season}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} sm={6} md={2} sx={{ display: 'flex', alignItems: 'center' }}>
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

      {/* Error Message */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Loading Indicator */}
      {loading && !selectedPest && (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      )}

      {/* Results Count */}
      {!loading && !selectedPest && (
        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle1">
            {filteredPests.length} pests found
          </Typography>
        </Box>
      )}

      {/* Pest List */}
      {!loading && !selectedPest && filteredPests.length > 0 && (
        <Grid container spacing={2}>
          {filteredPests.map(pest => (
            <Grid item xs={12} sm={6} md={4} key={pest._id}>
              <Card 
                sx={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  height: '100%',
                  cursor: 'pointer',
                  transition: 'transform 0.2s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 3
                  }
                }}
                onClick={() => handlePestSelect(pest._id)}
              >
                <CardMedia
                  component="img"
                  height="140"
                  image={pest.imageUrl || 'https://via.placeholder.com/300x140?text=Pest+Image'}
                  alt={pest.name}
                />
                <CardContent sx={{ flexGrow: 1 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <Typography variant="h6" component="h2">
                      {pest.name}
                    </Typography>
                    <Box 
                      sx={{ 
                        bgcolor: `${getSeverityColor(pest.severity)}.main`, 
                        color: 'white', 
                        px: 1, 
                        py: 0.5,
                        borderRadius: 1,
                        fontSize: '0.75rem',
                        fontWeight: 'bold',
                      }}
                    >
                      {pest.severity.toUpperCase()}
                    </Box>
                  </Box>
                  <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic', mb: 1 }}>
                    {pest.scientificName}
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 2 }}>
                    {pest.description.substring(0, 100)}...
                  </Typography>
                  <Box 
                    sx={{ 
                      display: 'flex', 
                      alignItems: 'center',
                      color: 'text.secondary'
                    }}
                  >
                    <CropIcon fontSize="small" sx={{ mr: 0.5 }} />
                    <Typography variant="body2">
                      Affects: {pest.affectedCrops.slice(0, 2).join(', ')}
                      {pest.affectedCrops.length > 2 ? '...' : ''}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* No Results Message */}
      {!loading && !selectedPest && filteredPests.length === 0 && (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <PestIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="textSecondary">
            No pests found matching your criteria
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

      {/* Pest Details View */}
      {selectedPest && (
        <Box>
          <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Button variant="text" color="primary" onClick={handleCloseDetails}>
              &larr; Back to All Pests
            </Button>
            <Box 
              sx={{ 
                bgcolor: `${getSeverityColor(selectedPest.severity)}.main`, 
                color: 'white', 
                px: 2, 
                py: 0.5,
                borderRadius: 1,
                display: 'flex',
                alignItems: 'center'
              }}
            >
              <WarningIcon fontSize="small" sx={{ mr: 0.5 }} />
              {selectedPest.severity.toUpperCase()} SEVERITY
            </Box>
          </Box>

          <Paper sx={{ p: 3, mb: 3 }}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={4}>
                <img
                  src={selectedPest.imageUrl || 'https://via.placeholder.com/300x300?text=Pest+Image'}
                  alt={selectedPest.name}
                  style={{ width: '100%', borderRadius: 8, marginBottom: 16 }}
                />
                <Typography variant="h5" gutterBottom>
                  {selectedPest.name}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic', mb: 2 }}>
                  {selectedPest.scientificName}
                </Typography>

                <Divider sx={{ my: 2 }} />

                <Typography variant="subtitle2" gutterBottom>
                  Active Seasons
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                  {selectedPest.activeSeasons.map(season => (
                    <Box 
                      key={season} 
                      sx={{ 
                        bgcolor: 'background.paper', 
                        border: 1, 
                        borderColor: 'divider',
                        borderRadius: 1,
                        px: 1,
                        py: 0.5,
                        fontSize: '0.75rem'
                      }}
                    >
                      {season.charAt(0).toUpperCase() + season.slice(1)}
                    </Box>
                  ))}
                </Box>

                <Typography variant="subtitle2" gutterBottom>
                  Affected Crops
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {selectedPest.affectedCrops.map(crop => (
                    <Box 
                      key={crop} 
                      sx={{ 
                        bgcolor: 'background.paper', 
                        border: 1, 
                        borderColor: 'divider',
                        borderRadius: 1,
                        px: 1,
                        py: 0.5,
                        fontSize: '0.75rem'
                      }}
                    >
                      {crop}
                    </Box>
                  ))}
                </Box>
              </Grid>

              <Grid item xs={12} md={8}>
                <Box sx={{ mb: 2, borderBottom: 1, borderColor: 'divider' }}>
                  <Tabs value={tabValue} onChange={handleTabChange} aria-label="pest information tabs">
                    <Tab label="Overview" />
                    <Tab label="Identification" />
                    <Tab label="Treatment" />
                    <Tab label="Prevention" />
                  </Tabs>
                </Box>

                {/* Overview Tab */}
                {tabValue === 0 && (
                  <Box>
                    <Typography variant="body1" paragraph>
                      {selectedPest.description}
                    </Typography>
                    
                    <Typography variant="subtitle1" gutterBottom>
                      Life Cycle
                    </Typography>
                    <Typography variant="body1" paragraph>
                      {selectedPest.lifeCycle}
                    </Typography>
                    
                    <Typography variant="subtitle1" gutterBottom>
                      Damage
                    </Typography>
                    <Typography variant="body1">
                      {selectedPest.damage}
                    </Typography>
                  </Box>
                )}

                {/* Identification Tab */}
                {tabValue === 1 && (
                  <Box>
                    <Typography variant="subtitle1" gutterBottom>
                      How to Identify
                    </Typography>
                    <Typography variant="body1" paragraph>
                      {selectedPest.identification}
                    </Typography>
                    
                    <Typography variant="subtitle1" gutterBottom>
                      Signs and Symptoms
                    </Typography>
                    <List>
                      {selectedPest.symptoms.map((symptom, index) => (
                        <ListItem key={index}>
                          <ListItemIcon>
                            <InfoIcon color="primary" />
                          </ListItemIcon>
                          <ListItemText primary={symptom} />
                        </ListItem>
                      ))}
                    </List>
                  </Box>
                )}

                {/* Treatment Tab */}
                {tabValue === 2 && (
                  <Box>
                    <Typography variant="subtitle1" gutterBottom>
                      Chemical Control
                    </Typography>
                    <Typography variant="body1" paragraph>
                      {selectedPest.treatment.chemical}
                    </Typography>
                    
                    <Typography variant="subtitle1" gutterBottom>
                      Biological Control
                    </Typography>
                    <Typography variant="body1" paragraph>
                      {selectedPest.treatment.biological}
                    </Typography>
                    
                    <Typography variant="subtitle1" gutterBottom>
                      Cultural Control
                    </Typography>
                    <Typography variant="body1">
                      {selectedPest.treatment.cultural}
                    </Typography>
                  </Box>
                )}

                {/* Prevention Tab */}
                {tabValue === 3 && (
                  <Box>
                    <Typography variant="subtitle1" gutterBottom>
                      Preventive Measures
                    </Typography>
                    <List>
                      {selectedPest.prevention.map((measure, index) => (
                        <ListItem key={index}>
                          <ListItemIcon>
                            <TreatmentIcon color="success" />
                          </ListItemIcon>
                          <ListItemText primary={measure} />
                        </ListItem>
                      ))}
                    </List>
                  </Box>
                )}
              </Grid>
            </Grid>
          </Paper>
        </Box>
      )}

      {/* Pest Identification Dialog */}
      <Dialog 
        open={dialogOpen} 
        onClose={handleCloseDialog}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle>
          Pest Identification
          <IconButton
            aria-label="close"
            onClick={handleCloseDialog}
            sx={{ position: 'absolute', right: 8, top: 8 }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle1" gutterBottom>
                Upload Image
              </Typography>
              <Paper 
                variant="outlined" 
                sx={{ 
                  height: 300, 
                  display: 'flex', 
                  justifyContent: 'center', 
                  alignItems: 'center',
                  overflow: 'hidden',
                  position: 'relative'
                }}
              >
                {uploadPreview ? (
                  <img 
                    src={uploadPreview} 
                    alt="Preview" 
                    style={{ 
                      maxWidth: '100%', 
                      maxHeight: '100%', 
                      objectFit: 'contain' 
                    }} 
                  />
                ) : (
                  <Box sx={{ textAlign: 'center', p: 2 }}>
                    <UploadIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 1 }} />
                    <Typography variant="body2" color="textSecondary">
                      Select an image of the pest or affected plant part
                    </Typography>
                  </Box>
                )}
              </Paper>
              <Button
                variant="outlined"
                component="label"
                fullWidth
                sx={{ mt: 2 }}
              >
                Browse Files
                <input
                  type="file"
                  hidden
                  accept="image/*"
                  onChange={handleImageUpload}
                />
              </Button>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle1" gutterBottom>
                Identification Result
              </Typography>
              <Paper 
                variant="outlined" 
                sx={{ 
                  height: 300,
                  p: 2,
                  overflow: 'auto'
                }}
              >
                {identificationLoading && (
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                    <CircularProgress sx={{ mb: 2 }} />
                    <Typography>Analyzing image...</Typography>
                  </Box>
                )}
                
                {identificationError && (
                  <Alert severity="error" sx={{ mb: 2 }}>
                    {identificationError}
                  </Alert>
                )}
                
                {!identificationLoading && !identificationError && !identificationResult && (
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                    <InfoIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 1 }} />
                    <Typography variant="body2" color="textSecondary" align="center">
                      Upload an image and click "Identify" to get pest identification results
                    </Typography>
                  </Box>
                )}
                
                {identificationResult && (
                  <Box>
                    <Typography variant="h6" gutterBottom>
                      {identificationResult.confidence > 0.7 ? 'High Confidence Match' : 'Possible Match'}
                    </Typography>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <img 
                        src={identificationResult.pest?.imageUrl || 'https://via.placeholder.com/50'}
                        alt={identificationResult.pest?.name}
                        style={{ width: 50, height: 50, marginRight: 16, objectFit: 'cover', borderRadius: 4 }}
                      />
                      <Box>
                        <Typography variant="subtitle1">{identificationResult.pest?.name}</Typography>
                        <Typography variant="body2" color="textSecondary" sx={{ fontStyle: 'italic' }}>
                          {identificationResult.pest?.scientificName}
                        </Typography>
                      </Box>
                    </Box>
                    
                    <Typography variant="body2" paragraph>
                      Confidence: {Math.round(identificationResult.confidence * 100)}%
                    </Typography>
                    
                    <Divider sx={{ my: 2 }} />
                    
                    <Typography variant="body2" paragraph>
                      {identificationResult.pest?.description.substring(0, 200)}...
                    </Typography>
                    
                    <Button 
                      variant="contained" 
                      color="primary" 
                      onClick={() => {
                        handlePestSelect(identificationResult.pest?._id);
                        handleCloseDialog();
                      }}
                      disabled={!identificationResult.pest?._id}
                    >
                      View Full Details
                    </Button>
                  </Box>
                )}
              </Paper>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button 
            variant="contained" 
            onClick={handleIdentifyPest}
            disabled={!uploadImage || identificationLoading}
          >
            {identificationLoading ? 'Identifying...' : 'Identify Pest'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Pests;