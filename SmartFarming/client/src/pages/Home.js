import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Container, 
  Typography, 
  Button, 
  Grid, 
  Card, 
  CardContent, 
  CardMedia, 
  Box,
  Paper
} from '@mui/material';
import {
  WbSunny as WeatherIcon,
  Agriculture as CropIcon,
  BugReport as PestIcon,
  TrendingUp as MarketIcon,
  Assessment as AnalyticsIcon,
  Support as ExpertIcon,
  ShoppingCart as DigitalMarketIcon
} from '@mui/icons-material';

const Home = () => {
  // Feature cards data
  const features = [
    {
      title: 'Real-time Weather',
      description: 'Get accurate weather forecasts and agricultural weather insights for your farm location.',
      icon: <WeatherIcon fontSize="large" sx={{ color: '#2196f3' }} />,
      path: '/weather',
      bgColor: '#e3f2fd'
    },
    {
      title: 'Crop Recommendations',
      description: 'Get personalized crop recommendations based on soil type, season, and weather conditions.',
      icon: <CropIcon fontSize="large" sx={{ color: '#4caf50' }} />,
      path: '/crops',
      bgColor: '#e8f5e9'
    },
    {
      title: 'Pest Control',
      description: 'Identify pests affecting your crops and get targeted treatment recommendations.',
      icon: <PestIcon fontSize="large" sx={{ color: '#ff9800' }} />,
      path: '/pests',
      bgColor: '#fff3e0'
    },
    {
      title: 'Market Prices',
      description: 'Track current market prices for different crops across various markets.',
      icon: <MarketIcon fontSize="large" sx={{ color: '#f44336' }} />,
      path: '/market',
      bgColor: '#ffebee'
    },
    {
      title: 'Farm Analytics',
      description: 'Analyze your farm data to make informed decisions and improve productivity.',
      icon: <AnalyticsIcon fontSize="large" sx={{ color: '#9c27b0' }} />,
      path: '/analytics',
      bgColor: '#f3e5f5'
    },
    {
      title: 'Expert Consultation',
      description: 'Connect with agricultural experts for personalized guidance and problem-solving.',
      icon: <ExpertIcon fontSize="large" sx={{ color: '#3f51b5' }} />,
      path: '/experts',
      bgColor: '#e8eaf6'
    },
    {
      title: 'Digital Market Access',
      description: 'Sell your produce directly to buyers and access a wider market.',
      icon: <DigitalMarketIcon fontSize="large" sx={{ color: '#009688' }} />,
      path: '/market-access',
      bgColor: '#e0f2f1'
    }
  ];

  return (
    <Container maxWidth="lg">
      {/* Hero Section */}
      <Box 
        sx={{
          position: 'relative',
          height: '60vh',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          textAlign: 'center',
          mb: 8,
          backgroundImage: 'url(/static/hero-background.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          borderRadius: 2,
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            borderRadius: 2,
          }
        }}
      >
        <Box sx={{ position: 'relative', zIndex: 1, color: 'white', p: 4 }}>
          <Typography 
            variant="h2" 
            component="h1" 
            gutterBottom
            sx={{ fontWeight: 'bold' }}
          >
            Welcome to Smart Farming
          </Typography>
          <Typography variant="h5" component="p" paragraph>
            Empowering farmers with technology and data-driven insights
          </Typography>
          <Box sx={{ mt: 4 }}>
            <Button 
              component={Link} 
              to="/register" 
              variant="contained" 
              color="primary" 
              size="large"
              sx={{ mr: 2 }}
            >
              Get Started
            </Button>
            <Button 
              component={Link} 
              to="/login" 
              variant="outlined" 
              color="inherit"
              size="large"
            >
              Login
            </Button>
          </Box>
        </Box>
      </Box>

      {/* Features Section */}
      <Box sx={{ mb: 8 }}>
        <Typography 
          variant="h4" 
          component="h2" 
          gutterBottom 
          sx={{ 
            textAlign: 'center', 
            mb: 6,
            fontWeight: 'bold' 
          }}
        >
          Our Smart Farming Services
        </Typography>
        
        <Grid container spacing={4}>
          {features.map((feature, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <Card 
                sx={{ 
                  height: '100%', 
                  display: 'flex', 
                  flexDirection: 'column',
                  transition: 'transform 0.2s',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: 6
                  } 
                }}
                component={Link}
                to={feature.path}
                style={{ textDecoration: 'none' }}
              >
                <Box 
                  sx={{ 
                    p: 3, 
                    display: 'flex', 
                    justifyContent: 'center',
                    backgroundColor: feature.bgColor
                  }}
                >
                  {feature.icon}
                </Box>
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography gutterBottom variant="h5" component="h3">
                    {feature.title}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    {feature.description}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* About Section */}
      <Paper 
        sx={{ 
          p: 4, 
          mb: 8,
          backgroundColor: '#f9f9f9'
        }}
      >
        <Typography variant="h4" component="h2" gutterBottom>
          About Smart Farming
        </Typography>
        <Typography variant="body1" paragraph>
          Smart Farming is an integrated platform that leverages technology, data analytics, and agricultural expertise to help farmers maximize productivity, optimize resource usage, and make informed decisions.
        </Typography>
        <Typography variant="body1" paragraph>
          Our platform brings together real-time weather data, crop recommendations, pest control solutions, market intelligence, farm analytics, expert consultation, and digital market access – all in one place to support sustainable and profitable farming practices.
        </Typography>
        <Button 
          component={Link}
          to="/register" 
          variant="contained" 
          color="primary"
        >
          Join Our Community
        </Button>
      </Paper>
    </Container>
  );
};

export default Home;