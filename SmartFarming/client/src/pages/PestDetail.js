import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Box,
  Typography,
  Grid,
  Paper,
  CircularProgress,
  Divider,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Button,
  Card,
  CardContent,
  CardMedia,
  Alert
} from '@mui/material';
import {
  BugReport as BugIcon,
  Science as ScienceIcon,
  Agriculture as CropIcon,
  Warning as SeverityIcon,
  CalendarMonth as SeasonIcon,
  Healing as TreatmentIcon
} from '@mui/icons-material';
import { getPestDetails, getTreatments } from '../services/pestService';

const PestDetail = () => {
  const { id } = useParams();
  const [pest, setPest] = useState(null);
  const [treatments, setTreatments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPestDetails = async () => {
      try {
        setLoading(true);
        
        // Fetch pest details
        const response = await getPestDetails(id);
        setPest(response.data);

        // Get treatment recommendations
        const treatmentResponse = await getTreatments(id);
        setTreatments(treatmentResponse.data.data || []);
        
      } catch (err) {
        setError(err.message || 'Failed to fetch pest details');
      } finally {
        setLoading(false);
      }
    };

    fetchPestDetails();
  }, [id]);

  const getSeverityColor = (severity) => {
    switch (severity?.toLowerCase()) {
      case 'low': return 'success';
      case 'medium': return 'warning';
      case 'high': return 'error';
      default: return 'default';
    }
  };
  
  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mt: 2 }}>
        Error: {error}
      </Alert>
    );
  }

  if (!pest) {
    return (
      <Alert severity="info" sx={{ mt: 2 }}>
        No data found for this pest
      </Alert>
    );
  }

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        {pest.name}
      </Typography>
      <Typography variant="subtitle1" color="textSecondary" gutterBottom>
        {pest.scientificName}
      </Typography>

      <Grid container spacing={3} sx={{ mt: 1 }}>
        <Grid item xs={12} md={8}>
          <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Typography variant="h6" gutterBottom>About this Pest</Typography>
              <Chip 
                icon={<SeverityIcon />} 
                label={`Severity: ${pest.severity || 'Unknown'}`}
                color={getSeverityColor(pest.severity)}
              />
            </Box>
            <Divider sx={{ mb: 2 }} />
            <Typography variant="body1" paragraph>
              {pest.description}
            </Typography>
            
            {pest.symptoms && (
              <Box mt={3}>
                <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                  Symptoms
                </Typography>
                <Typography variant="body2">
                  {pest.symptoms}
                </Typography>
              </Box>
            )}
          </Paper>

          <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>Treatment Recommendations</Typography>
            <Divider sx={{ mb: 2 }} />
            
            {treatments && treatments.length > 0 ? (
              <List>
                {treatments.map((treatment, index) => (
                  <Card key={index} variant="outlined" sx={{ mb: 2 }}>
                    <CardContent>
                      <Typography variant="h6" color="primary">
                        {treatment.method}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        Effectiveness: {treatment.effectiveness}
                      </Typography>
                      <Typography variant="body2" paragraph>
                        {treatment.description}
                      </Typography>
                      
                      <Grid container spacing={2}>
                        <Grid item xs={12} sm={6}>
                          <Typography variant="subtitle2">Application Method:</Typography>
                          <Typography variant="body2" paragraph>
                            {treatment.applicationMethod}
                          </Typography>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <Typography variant="subtitle2">Precautions:</Typography>
                          <Typography variant="body2" paragraph>
                            {treatment.precautions}
                          </Typography>
                        </Grid>
                      </Grid>
                    </CardContent>
                  </Card>
                ))}
              </List>
            ) : (
              <Typography variant="body2" color="text.secondary">
                No specific treatment recommendations available.
              </Typography>
            )}
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          {pest.imageUrl && (
            <Card sx={{ mb: 3 }}>
              <CardMedia
                component="img"
                height="200"
                image={pest.imageUrl}
                alt={pest.name}
                sx={{ objectFit: 'cover' }}
              />
            </Card>
          )}

          <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
            <Box display="flex" alignItems="center" mb={1}>
              <ScienceIcon color="primary" sx={{ mr: 1 }} />
              <Typography variant="h6">Classification</Typography>
            </Box>
            <Divider sx={{ mb: 2 }} />
            
            <List dense disablePadding>
              {pest.classification && Object.entries(pest.classification).map(([key, value]) => (
                <ListItem key={key} disableGutters>
                  <ListItemText 
                    primary={key.charAt(0).toUpperCase() + key.slice(1)} 
                    secondary={value}
                  />
                </ListItem>
              ))}
            </List>
          </Paper>

          <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
            <Box display="flex" alignItems="center" mb={1}>
              <CropIcon color="primary" sx={{ mr: 1 }} />
              <Typography variant="h6">Affected Crops</Typography>
            </Box>
            <Divider sx={{ mb: 2 }} />
            
            {pest.affectedCrops && pest.affectedCrops.length > 0 ? (
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {pest.affectedCrops.map((crop) => (
                  <Chip 
                    key={crop._id || crop}
                    label={crop.name || crop}
                    component={Link}
                    to={`/crops/${crop._id || crop}`}
                    clickable
                    variant="outlined"
                    size="small"
                    sx={{ mb: 1 }}
                  />
                ))}
              </Box>
            ) : (
              <Typography variant="body2" color="textSecondary">
                No specific crops listed.
              </Typography>
            )}
          </Paper>

          <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
            <Box display="flex" alignItems="center" mb={1}>
              <SeasonIcon color="primary" sx={{ mr: 1 }} />
              <Typography variant="h6">Active Seasons</Typography>
            </Box>
            <Divider sx={{ mb: 2 }} />
            
            {pest.activeSeasons && pest.activeSeasons.length > 0 ? (
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {pest.activeSeasons.map((season) => (
                  <Chip 
                    key={season}
                    label={season}
                    size="small"
                    sx={{ mb: 1 }}
                  />
                ))}
              </Box>
            ) : (
              <Typography variant="body2" color="textSecondary">
                Active seasons not specified.
              </Typography>
            )}
          </Paper>

          <Button 
            variant="contained" 
            color="primary" 
            fullWidth
            component={Link}
            to="/pests"
          >
            Back to All Pests
          </Button>
        </Grid>
      </Grid>
    </Box>
  );
};

export default PestDetail;