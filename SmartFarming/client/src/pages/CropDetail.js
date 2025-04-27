import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { 
  Box, 
  Typography, 
  Grid, 
  Paper, 
  CircularProgress, 
  Divider, 
  Chip, 
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Card,
  CardContent
} from '@mui/material';
import { 
  LocalOffer as TagIcon,
  Opacity as WaterIcon,
  Thermostat as TempIcon,
  Agriculture as SeedIcon,
  Science as FertilizerIcon,
  BugReport as PestIcon,
  Note as NoteIcon
} from '@mui/icons-material';
import { getCropById } from '../services/cropService';
import { getPestsByCrop } from '../services/pestService';

const CropDetail = () => {
  const { id } = useParams();
  const [crop, setCrop] = useState(null);
  const [pests, setPests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    const fetchCropDetails = async () => {
      try {
        setLoading(true);
        const response = await getCropById(id);
        setCrop(response.data);
        
        // Also fetch pests that affect this crop
        const pestsResponse = await getPestsByCrop(id);
        setPests(pestsResponse.data.data || []);
        
      } catch (err) {
        setError(err.message || 'Failed to fetch crop details');
      } finally {
        setLoading(false);
      }
    };
    
    fetchCropDetails();
  }, [id]);
  
  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }
  
  if (error) {
    return (
      <Box sx={{ p: 3, bgcolor: 'error.light', color: 'error.dark', borderRadius: 1 }}>
        <Typography variant="h6">Error: {error}</Typography>
      </Box>
    );
  }
  
  if (!crop) {
    return (
      <Box sx={{ p: 3, bgcolor: 'info.light', color: 'info.dark', borderRadius: 1 }}>
        <Typography variant="h6">No data found for this crop</Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        {crop.name}
      </Typography>
      <Typography variant="subtitle1" color="textSecondary" gutterBottom>
        {crop.scientificName}
      </Typography>
      
      <Grid container spacing={3} sx={{ mt: 1 }}>
        <Grid item xs={12} md={8}>
          <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>Description</Typography>
            <Divider sx={{ mb: 2 }} />
            <Typography variant="body1" paragraph>
              {crop.description}
            </Typography>
            
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
              {crop.tags && crop.tags.map((tag) => (
                <Chip 
                  key={tag} 
                  label={tag} 
                  icon={<TagIcon />} 
                  variant="outlined" 
                  size="small" 
                />
              ))}
            </Box>
          </Paper>

          <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>Growing Conditions</Typography>
            <Divider sx={{ mb: 2 }} />
            
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <List>
                  <ListItem>
                    <ListItemIcon>
                      <TempIcon color="primary" />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Temperature Range"
                      secondary={`${crop.idealTemperature?.min || 'N/A'}°C to ${crop.idealTemperature?.max || 'N/A'}°C`}
                    />
                  </ListItem>
                  
                  <ListItem>
                    <ListItemIcon>
                      <WaterIcon color="primary" />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Water Requirements"
                      secondary={crop.waterRequirement || 'N/A'}
                    />
                  </ListItem>
                </List>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <List>
                  <ListItem>
                    <ListItemIcon>
                      <SeedIcon color="primary" />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Soil Type"
                      secondary={crop.soilType || 'N/A'}
                    />
                  </ListItem>
                  
                  <ListItem>
                    <ListItemIcon>
                      <FertilizerIcon color="primary" />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Nutrient Requirements"
                      secondary={crop.nutrients || 'N/A'}
                    />
                  </ListItem>
                </List>
              </Grid>
            </Grid>
          </Paper>

          <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Cultivation Guide
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            {crop.cultivationSteps && crop.cultivationSteps.length > 0 ? (
              <List>
                {crop.cultivationSteps.map((step, index) => (
                  <ListItem key={index} alignItems="flex-start">
                    <ListItemIcon>
                      <Chip 
                        label={index + 1} 
                        color="primary" 
                        size="small" 
                        sx={{ width: 30, height: 30 }}
                      />
                    </ListItemIcon>
                    <ListItemText 
                      primary={step.title}
                      secondary={step.description}
                    />
                  </ListItem>
                ))}
              </List>
            ) : (
              <Typography variant="body2" color="textSecondary">
                No cultivation steps available.
              </Typography>
            )}
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>Seasonal Information</Typography>
              <Divider sx={{ mb: 2 }} />
              
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="body2" color="textSecondary">
                    Planting Season:
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    {crop.season || 'Not specified'}
                  </Typography>
                </Grid>
                
                <Grid item xs={6}>
                  <Typography variant="body2" color="textSecondary">
                    Harvesting Season:
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    {crop.harvestingSeason || 'Not specified'}
                  </Typography>
                </Grid>
                
                <Grid item xs={12}>
                  <Typography variant="body2" color="textSecondary">
                    Growth Duration:
                  </Typography>
                  <Typography variant="body1">
                    {crop.growthDuration ? `${crop.growthDuration} days` : 'Not specified'}
                  </Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
          
          <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>Common Pests</Typography>
            <Divider sx={{ mb: 2 }} />
            
            {pests && pests.length > 0 ? (
              <List>
                {pests.map(pest => (
                  <ListItem key={pest._id} button component="a" href={`/pests/${pest._id}`}>
                    <ListItemIcon>
                      <PestIcon color="error" />
                    </ListItemIcon>
                    <ListItemText 
                      primary={pest.name}
                      secondary={pest.scientificName}
                    />
                  </ListItem>
                ))}
              </List>
            ) : (
              <Typography variant="body2" color="textSecondary">
                No common pests recorded for this crop.
              </Typography>
            )}
          </Paper>
          
          <Paper elevation={2} sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>Notes</Typography>
            <Divider sx={{ mb: 2 }} />
            
            {crop.notes ? (
              <Typography variant="body2">{crop.notes}</Typography>
            ) : (
              <Box sx={{ textAlign: 'center', py: 2 }}>
                <NoteIcon color="disabled" sx={{ fontSize: 40 }} />
                <Typography variant="body2" color="textSecondary">
                  No additional notes available.
                </Typography>
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default CropDetail;