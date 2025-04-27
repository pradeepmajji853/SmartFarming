import React, { useState, useEffect, useContext, useRef } from 'react';
import { Link } from 'react-router-dom';
import { 
  Container, 
  Grid, 
  Card, 
  CardContent, 
  CardActions,
  Typography, 
  Box,
  Button,
  Paper,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Skeleton,
  Alert,
  Chip,
  Tab,
  Tabs,
  LinearProgress,
  Avatar,
  IconButton,
  useTheme,
  alpha,
  Tooltip,
  CircularProgress
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { keyframes } from '@mui/system';
import { 
  WbSunny as WeatherIcon,
  NotificationsActive as AlertIcon,
  Agriculture as CropIcon,
  Update as UpdateIcon,
  TrendingUp as MarketIcon,
  Assignment as TaskIcon,
  Support as ExpertIcon,
  ShoppingCart as DigitalMarketIcon,
  Store as ListingIcon,
  ShoppingBasket as OfferIcon,
  Check as AcceptedIcon,
  AccessTime as PendingIcon,
  Cancel as RejectedIcon,
  Waves as WaterIcon,
  WbSunnyOutlined as SunIcon,
  ArrowUpward as ArrowUpIcon,
  ArrowDownward as ArrowDownIcon,
  Speed as SpeedIcon,
  Air as AirIcon,
  Opacity as HumidityIcon,
  MoreVert as MoreIcon,
  Autorenew as RefreshIcon,
  InfoOutlined as InfoIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  BarChart as ChartIcon,
  ShowChart as LineChartIcon,
  WaterDrop as RainIcon
} from '@mui/icons-material';
import { AuthContext } from '../context/AuthContext';
import { getCurrentWeather, getWeatherForecast, getFarmingAdvice } from '../services/weatherService';
import { getCropRecommendations } from '../services/cropService';
import { getMyListings, getMyOffers } from '../services/marketplaceService';
import { getFarmProductivityData } from '../services/analyticsService';
import { getUserConsultations } from '../services/expertService';

// Import Chart.js
import { Chart, registerables } from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
Chart.register(...registerables);

// Define animations
const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const pulse = keyframes`
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
  100% {
    transform: scale(1);
  }
`;

const float = keyframes`
  0% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-10px);
  }
  100% {
    transform: translateY(0px);
  }
`;

const shimmer = keyframes`
  0% {
    background-position: -100% 0;
  }
  100% {
    background-position: 200% 0;
  }
`;

const rotate = keyframes`
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
`;

// Styled components
const AnimatedCard = styled(Card)(({ theme, delay = 0, hover = true }) => ({
  height: '100%',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  animation: `${fadeIn} 0.8s ease-out ${delay}s both`,
  ...(hover && {
    '&:hover': {
      transform: 'translateY(-8px)',
      boxShadow: theme.shadows[10],
    },
  }),
  position: 'relative',
  overflow: 'hidden',
  borderRadius: theme.shape.borderRadius * 2,
}));

const GradientOverlay = styled('div')(({ theme, color = 'primary' }) => ({
  position: 'absolute',
  top: 0,
  right: 0,
  width: '150px',
  height: '150px',
  background: `radial-gradient(circle, ${theme.palette[color].light}15 0%, transparent 70%)`,
  zIndex: 0,
}));

const StatCard = styled(Paper)(({ theme, color = 'primary' }) => ({
  padding: theme.spacing(2),
  backgroundColor: theme.palette.background.paper,
  position: 'relative',
  overflow: 'hidden',
  borderRadius: theme.shape.borderRadius * 2,
  display: 'flex',
  flexDirection: 'column',
  height: '100%',
  transition: 'transform 0.3s ease, box-shadow 0.3s ease',
  '&:hover': {
    transform: 'translateY(-5px)',
    boxShadow: theme.shadows[6],
  },
}));

const GlowingBorder = styled(Paper)(({ theme, color = 'primary' }) => ({
  padding: 0,
  position: 'relative',
  borderRadius: theme.shape.borderRadius * 2,
  overflow: 'hidden',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 'inherit',
    padding: '2px',
    background: `linear-gradient(120deg, ${theme.palette[color].light}, ${theme.palette[color].main}, ${theme.palette.secondary.light})`,
    WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
    WebkitMaskComposite: 'xor',
    maskComposite: 'exclude',
  }
}));

const AnimatedIcon = styled(Box)(({ theme }) => ({
  animation: `${float} 3s ease-in-out infinite`
}));

const GradientText = styled(Typography)(({ theme, gradient = 'primary' }) => {
  const gradients = {
    primary: `linear-gradient(to right, ${theme.palette.primary.main}, ${theme.palette.primary.light})`,
    secondary: `linear-gradient(to right, ${theme.palette.secondary.main}, ${theme.palette.secondary.light})`,
    success: `linear-gradient(to right, ${theme.palette.success.main}, ${theme.palette.success.light})`,
    info: `linear-gradient(to right, ${theme.palette.info.main}, ${theme.palette.info.light})`,
    warning: `linear-gradient(to right, ${theme.palette.warning.main}, ${theme.palette.warning.dark})`,
    error: `linear-gradient(to right, ${theme.palette.error.main}, ${theme.palette.error.light})`,
    weather: `linear-gradient(to right, #3E9BFC, #57C1FF)`,
    market: `linear-gradient(to right, #FF9F43, #FFC107)`
  };

  return {
    backgroundImage: gradients[gradient] || gradients.primary,
    backgroundClip: 'text',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    fontWeight: 700,
    display: 'inline-block',
  };
});

const ProgressCircle = styled(Box)(({ theme, value = 0, color = 'primary', size = 40 }) => ({
  position: 'relative',
  width: size,
  height: size,
  borderRadius: '50%',
  background: `conic-gradient(${theme.palette[color].main} ${value}%, ${alpha(theme.palette[color].light, 0.2)} 0%)`,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  '&::before': {
    content: '""',
    position: 'absolute',
    width: `calc(100% - 10px)`,
    height: `calc(100% - 10px)`,
    borderRadius: '50%',
    background: theme.palette.background.paper,
  }
}));

const IconBox = styled(Box)(({ theme, color = 'primary' }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: alpha(theme.palette[color].main, 0.15),
  color: theme.palette[color].main,
  borderRadius: '50%',
  padding: theme.spacing(1.5),
  marginRight: theme.spacing(2),
  width: 54,
  height: 54,
  transition: 'all 0.2s ease',
  '&:hover': {
    transform: 'scale(1.1)',
    backgroundColor: alpha(theme.palette[color].main, 0.2),
  }
}));

const GradientDivider = styled(Divider)(({ theme }) => ({
  backgroundImage: `linear-gradient(to right, ${theme.palette.primary.main}, transparent)`,
  height: '2px',
  border: 'none',
}));

const StatusChip = styled(Chip)(({ theme, statusColor = 'default' }) => ({
  fontWeight: 500,
  borderRadius: 16,
  backgroundColor: alpha(theme.palette[statusColor].main, 0.12),
  color: theme.palette[statusColor].dark,
  border: `1px solid ${alpha(theme.palette[statusColor].main, 0.3)}`,
  '& .MuiChip-icon': {
    color: theme.palette[statusColor].main,
  }
}));

const GlassCard = styled(Paper)(({ theme, color = 'primary' }) => ({
  backgroundColor: alpha(theme.palette.background.paper, 0.7),
  backdropFilter: 'blur(10px)',
  borderRadius: theme.shape.borderRadius * 2,
  border: `1px solid ${alpha(theme.palette.common.white, 0.2)}`,
  boxShadow: `0 8px 32px 0 ${alpha(theme.palette.common.black, 0.1)}`,
  overflow: 'hidden',
  padding: theme.spacing(3),
  transition: 'all 0.3s ease',
  '&:hover': {
    boxShadow: `0 8px 32px 0 ${alpha(theme.palette.common.black, 0.15)}`,
    borderColor: alpha(theme.palette[color].main, 0.5),
  }
}));

const ShimmerButton = styled(Button)(({ theme }) => ({
  position: 'relative',
  overflow: 'hidden',
  '&::after': {
    content: '""',
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    background: `linear-gradient(90deg, 
      rgba(255, 255, 255, 0) 0%, 
      rgba(255, 255, 255, 0.2) 50%, 
      rgba(255, 255, 255, 0) 100%)`,
    backgroundSize: '200% 100%',
    animation: `${shimmer} 2s infinite`,
  }
}));

const StyledCircularProgress = styled(CircularProgress)(({ theme }) => ({
  color: theme.palette.primary.main,
  '& .MuiCircularProgress-circle': {
    strokeLinecap: 'round',
  }
}));

// Dashboard component
const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const theme = useTheme();
  
  // State variables
  const [loading, setLoading] = useState(true);
  const [weatherData, setWeatherData] = useState(null);
  const [forecastData, setForecastData] = useState({
    labels: [],
    temperatures: [],
    rainfall: []
  });
  const [farmingAdvice, setFarmingAdvice] = useState([]);
  const [marketplaceTab, setMarketplaceTab] = useState(0);
  const [tasks, setTasks] = useState([]);
  const [myListings, setMyListings] = useState([]);
  const [myOffers, setMyOffers] = useState([]);
  const [cropRecommendations, setCropRecommendations] = useState([]);
  const [cropDistribution, setCropDistribution] = useState({
    labels: [],
    datasets: [{
      data: [],
      backgroundColor: [],
      borderColor: theme.palette.background.paper,
      borderWidth: 2,
    }]
  });
  const [consultations, setConsultations] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loadingStates, setLoadingStates] = useState({
    weather: true,
    crops: true,
    marketplace: true,
    analytics: true,
    tasks: true
  });

  // Charts data
  const tempChartData = {
    labels: forecastData.labels,
    datasets: [
      {
        label: 'Temperature (°C)',
        data: forecastData.temperatures,
        borderColor: theme.palette.info.main,
        backgroundColor: alpha(theme.palette.info.main, 0.1),
        fill: true,
        tension: 0.4,
        pointRadius: 5,
        pointBackgroundColor: theme.palette.info.main,
        pointBorderColor: theme.palette.background.paper,
        pointBorderWidth: 2,
      }
    ]
  };

  const rainChartData = {
    labels: forecastData.labels,
    datasets: [
      {
        label: 'Rainfall (mm)',
        data: forecastData.rainfall,
        backgroundColor: alpha(theme.palette.primary.main, 0.7),
        borderRadius: 4,
      }
    ]
  };

  // Chart options
  const lineChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        mode: 'index',
        intersect: false,
        backgroundColor: alpha(theme.palette.background.paper, 0.9),
        titleColor: theme.palette.text.primary,
        bodyColor: theme.palette.text.secondary,
        borderColor: theme.palette.divider,
        borderWidth: 1,
        padding: 12,
        boxShadow: theme.shadows[3],
      }
    },
    scales: {
      x: {
        grid: {
          display: false,
        }
      },
      y: {
        grid: {
          color: alpha(theme.palette.divider, 0.1),
        },
        ticks: {
          callback: (value) => `${value}°C`,
        }
      }
    }
  };

  const barChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      }
    },
    scales: {
      x: {
        grid: {
          display: false,
        }
      },
      y: {
        grid: {
          color: alpha(theme.palette.divider, 0.1),
        },
        ticks: {
          callback: (value) => `${value}mm`,
        }
      }
    }
  };

  const doughnutChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right',
        labels: {
          boxWidth: 15,
          usePointStyle: true,
          pointStyle: 'circle',
          padding: 15,
          font: {
            size: 11,
            family: theme.typography.fontFamily
          }
        }
      },
    },
    cutout: '70%'
  };
  
  // Fetch all data for dashboard
  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      
      try {
        // Fetch weather data
        const weatherPromise = getCurrentWeather(user?.farmDetails?.location || 'Delhi')
          .then(data => {
            setWeatherData(data.data || data);
            return data;
          })
          .catch(err => console.error("Error fetching weather data:", err))
          .finally(() => setLoadingStates(prev => ({ ...prev, weather: false })));
        
        // Fetch forecast data
        const forecastPromise = getWeatherForecast(user?.farmDetails?.location || 'Delhi', 7)
          .then(data => {
            const forecastData = data.data || data;
            const formattedData = {
              labels: forecastData.forecast.map(day => day.date),
              temperatures: forecastData.forecast.map(day => day.avg_temp_c || day.day?.avgtemp_c),
              rainfall: forecastData.forecast.map(day => day.total_precip_mm || day.day?.totalprecip_mm || 0)
            };
            setForecastData(formattedData);
            return forecastData;
          })
          .catch(err => console.error("Error fetching forecast data:", err));
          
        // Fetch farming advice
        const advicePromise = getFarmingAdvice(user?.farmDetails?.location || 'Delhi')
          .then(data => {
            setFarmingAdvice(data.data || data || []);
            return data;
          })
          .catch(err => console.error("Error fetching farming advice:", err));
          
        // Fetch crop recommendations
        const cropRecPromise = getCropRecommendations(user?.farmDetails?.location, user?.farmDetails?.soil)
          .then(data => {
            const crops = data.data || data || [];
            setCropRecommendations(crops.map(crop => ({
              name: crop.name,
              success: crop.successRate || Math.floor(Math.random() * 20) + 80, // If API doesn't provide success rate
              season: crop.season,
              waterRequirement: crop.waterRequirement
            })));
            
            // Generate crop distribution data
            const colors = [
              theme.palette.primary.main,
              theme.palette.secondary.main,
              theme.palette.success.main,
              theme.palette.info.main,
              theme.palette.warning.main,
            ];
            
            // Get top 4 crops by area + "other"
            const distribution = {};
            user?.farmDetails?.crops?.forEach(crop => {
              if (distribution[crop]) {
                distribution[crop]++;
              } else {
                distribution[crop] = 1;
              }
            });
            
            const sortedCrops = Object.keys(distribution)
              .map(crop => ({ name: crop, area: distribution[crop] }))
              .sort((a, b) => b.area - a.area);
            
            const topCrops = sortedCrops.slice(0, 4);
            const otherArea = sortedCrops.slice(4).reduce((sum, crop) => sum + crop.area, 0);
            
            const chartData = {
              labels: [...topCrops.map(crop => crop.name), otherArea > 0 ? 'Other' : null].filter(Boolean),
              datasets: [{
                data: [...topCrops.map(crop => crop.area), otherArea].filter(area => area > 0),
                backgroundColor: colors.slice(0, topCrops.length + (otherArea > 0 ? 1 : 0)),
                borderColor: theme.palette.background.paper,
                borderWidth: 2,
              }]
            };
            
            setCropDistribution(chartData);
            return data;
          })
          .catch(err => console.error("Error fetching crop recommendations:", err))
          .finally(() => setLoadingStates(prev => ({ ...prev, crops: false })));
          
        // Fetch marketplace data
        const marketPromise = Promise.all([
          getMyListings().then(data => {
            const listings = data.data || data || [];
            setMyListings(listings);
            return listings;
          }),
          getMyOffers().then(data => {
            const offers = data.data || data || [];
            setMyOffers(offers);
            return offers;
          })
        ])
        .catch(err => console.error("Error fetching marketplace data:", err))
        .finally(() => setLoadingStates(prev => ({ ...prev, marketplace: false })));
        
        // Fetch analytics data
        const analyticsPromise = getFarmProductivityData()
          .then(data => {
            setAnalytics(data.data || data);
            return data;
          })
          .catch(err => console.error("Error fetching analytics data:", err))
          .finally(() => setLoadingStates(prev => ({ ...prev, analytics: false })));
        
        // Generate tasks based on farm data and weather
        const generateTasks = Promise.all([weatherPromise, cropRecPromise])
          .then(([weatherData, cropData]) => {
            // Generate smart tasks based on weather and crops
            const newTasks = [];
            
            // Weather-based tasks
            if (weatherData) {
              const temp = weatherData.main?.temp || 0;
              const isRaining = weatherData.weather?.[0]?.main === "Rain";
              const humidity = weatherData.main?.humidity || 0;
              
              if (isRaining) {
                newTasks.push("Check drainage systems in all fields");
              } else if (humidity < 40) {
                newTasks.push("Water crops in Field A");
              }
              
              if (temp > 32) {
                newTasks.push("Ensure shade for heat-sensitive crops");
              }
            }
            
            // Crop-based tasks
            const cropNames = cropRecommendations.map(c => c.name);
            if (cropNames.includes("Tomatoes")) {
              newTasks.push("Check tomatoes for signs of blight");
            }
            if (cropNames.includes("Carrots")) {
              newTasks.push("Thin out carrot seedlings");
            }
            
            // Default tasks if not enough were generated
            if (newTasks.length < 3) {
              newTasks.push("Check soil moisture in Field B");
              newTasks.push("Apply organic pest control to crops");
              newTasks.push("Harvest ready vegetables");
              newTasks.push("Perform equipment maintenance");
            }
            
            setTasks(newTasks.slice(0, 5)); // Limit to 5 tasks
            return newTasks;
          })
          .catch(err => console.error("Error generating tasks:", err))
          .finally(() => setLoadingStates(prev => ({ ...prev, tasks: false })));
          
        // Fetch consultations
        const consultationsPromise = getUserConsultations()
          .then(data => {
            setConsultations(data.data || data || []);
            return data;
          })
          .catch(err => console.error("Error fetching consultations:", err));
          
        // Wait for all data to load
        await Promise.all([
          weatherPromise, forecastPromise, advicePromise, cropRecPromise, 
          marketPromise, analyticsPromise, generateTasks, consultationsPromise
        ]);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchDashboardData();
  }, [user]);
  
  // Helper function for offer status details
  const getStatusDetails = (status) => {
    switch (status) {
      case 'accepted':
        return { icon: <AcceptedIcon fontSize="small" />, color: 'success', label: 'Accepted' };
      case 'rejected':
        return { icon: <RejectedIcon fontSize="small" />, color: 'error', label: 'Rejected' };
      default:
        return { icon: <PendingIcon fontSize="small" />, color: 'warning', label: 'Pending' };
    }
  };
  
  // Handle marketplace tab change
  const handleMarketplaceTabChange = (event, newValue) => {
    setMarketplaceTab(newValue);
  };

  // Reference for the weather section to allow smooth scrolling
  const weatherSectionRef = useRef(null);
  
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* User welcome section */}
      <AnimatedCard 
        elevation={0} 
        sx={{ 
          mb: 4, 
          p: 3, 
          backgroundImage: `linear-gradient(to right, ${alpha(theme.palette.primary.light, 0.05)}, ${alpha(theme.palette.success.light, 0.15)})`,
          display: 'flex', 
          flexDirection: { xs: 'column', md: 'row' },
          alignItems: 'center',
          justifyContent: 'space-between'
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap' }}>
          <Box 
            sx={{ 
              position: 'relative', 
              mr: 3,
              '&::after': {
                content: '""',
                position: 'absolute',
                width: '100%',
                height: '100%',
                top: 0,
                left: 0,
                background: `linear-gradient(120deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                opacity: 0.1,
                borderRadius: '50%',
                transform: 'scale(1.4)',
                zIndex: -1
              }
            }}
          >
            <Avatar 
              alt={user?.name} 
              src={user?.imageUrl}
              sx={{ width: 60, height: 60, border: `3px solid ${theme.palette.background.paper}` }}
            />
          </Box>
          <Box>
            <Typography variant="h4" component="h1" gutterBottom>
              Welcome back, <GradientText gradient="primary">{user?.name}</GradientText>
            </Typography>
            <Typography variant="subtitle1" color="textSecondary">
              {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </Typography>
          </Box>
        </Box>
        
        <Button 
          variant="outlined" 
          color="primary" 
          startIcon={<RefreshIcon />}
          sx={{ 
            mt: { xs: 2, md: 0 },
            borderRadius: 2,
            borderWidth: '2px',
            '&:hover': {
              borderWidth: '2px'
            }
          }}
          onClick={() => window.location.reload()}
        >
          Refresh Data
        </Button>
      </AnimatedCard>
      
      {/* Weather overview */}
      <Grid container spacing={3} ref={weatherSectionRef}>
        <Grid item xs={12}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <WeatherIcon color="info" />
              <Typography variant="h5" component="h2">Weather Overview</Typography>
            </Box>
            <Button 
              size="small" 
              component={Link} 
              to="/weather"
              endIcon={<ArrowUpIcon sx={{ transform: 'rotate(45deg)' }} />}
              sx={{ 
                backgroundColor: alpha(theme.palette.info.main, 0.1),
                color: theme.palette.info.main,
                '&:hover': {
                  backgroundColor: alpha(theme.palette.info.main, 0.2),
                }
              }}
            >
              Detailed Forecast
            </Button>
          </Box>
        </Grid>
        
        {loadingStates.weather ? (
          <Grid item xs={12}>
            <AnimatedCard sx={{ p: 3, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <StyledCircularProgress />
              <Typography variant="subtitle1" sx={{ ml: 2 }}>
                Loading weather data...
              </Typography>
            </AnimatedCard>
          </Grid>
        ) : weatherData ? (
          <>
            {/* Current weather */}
            <Grid item xs={12} md={4}>
              <GlassCard 
                elevation={0} 
                color="info" 
                sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}
              >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>Current Weather</Typography>
                  <Chip 
                    label="Now" 
                    size="small" 
                    color="info" 
                    sx={{ height: 24, fontSize: '0.75rem' }} 
                  />
                </Box>
                
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center',
                  justifyContent: 'space-around',
                  my: 2 
                }}>
                  <AnimatedIcon>
                    <SunIcon sx={{ fontSize: 60, color: 'info.main' }} />
                  </AnimatedIcon>
                  
                  <Typography variant="h2" sx={{ fontWeight: 700 }}>
                    {weatherData.main?.temp || weatherData.current?.temp_c || 25}°
                  </Typography>
                </Box>
                
                <Typography variant="body1" align="center" sx={{ mb: 3 }}>
                  {weatherData.weather?.[0]?.description || 
                   weatherData.current?.condition?.text || 'Sunny'}
                </Typography>
                
                <GradientDivider sx={{ mb: 2 }} />
                
                <Grid container spacing={1} sx={{ mt: 'auto' }}>
                  <Grid item xs={4}>
                    <Box sx={{ textAlign: 'center' }}>
                      <HumidityIcon sx={{ color: 'info.main', mb: 0.5 }} />
                      <Typography variant="body2" color="textSecondary">Humidity</Typography>
                      <Typography variant="body1" fontWeight="medium">
                        {weatherData.main?.humidity || weatherData.current?.humidity || 65}%
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={4}>
                    <Box sx={{ textAlign: 'center' }}>
                      <AirIcon sx={{ color: 'info.main', mb: 0.5 }} />
                      <Typography variant="body2" color="textSecondary">Wind</Typography>
                      <Typography variant="body1" fontWeight="medium">
                        {weatherData.wind?.speed || weatherData.current?.wind_kph || 3.5} {weatherData.wind ? 'm/s' : 'km/h'}
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={4}>
                    <Box sx={{ textAlign: 'center' }}>
                      <SpeedIcon sx={{ color: 'info.main', mb: 0.5 }} />
                      <Typography variant="body2" color="textSecondary">Pressure</Typography>
                      <Typography variant="body1" fontWeight="medium">
                        {weatherData.main?.pressure || weatherData.current?.pressure_mb || 1013}
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
              </GlassCard>
            </Grid>
            
            {/* Temperature forecast */}
            <Grid item xs={12} md={4}>
              <AnimatedCard 
                elevation={2} 
                sx={{ 
                  p: 2, 
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column'
                }}
                delay={0.2}
              >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>Temperature</Typography>
                  <Tooltip title="7-day forecast">
                    <InfoIcon fontSize="small" color="action" />
                  </Tooltip>
                </Box>
                
                <Box sx={{ flex: 1, position: 'relative', height: 220, mt: 1 }}>
                  <Line data={tempChartData} options={lineChartOptions} />
                </Box>
                
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1 }}>
                  <Typography variant="caption" color="textSecondary" sx={{ display: 'flex', alignItems: 'center' }}>
                    <TrendingUpIcon fontSize="small" sx={{ mr: 0.5, color: theme.palette.info.main }} />
                    Weekly trend
                  </Typography>
                </Box>
              </AnimatedCard>
            </Grid>
            
            {/* Rainfall forecast */}
            <Grid item xs={12} md={4}>
              <AnimatedCard 
                elevation={2} 
                sx={{ 
                  p: 2, 
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column'
                }}
                delay={0.3}
              >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>Rainfall</Typography>
                  <Tooltip title="7-day precipitation">
                    <InfoIcon fontSize="small" color="action" />
                  </Tooltip>
                </Box>
                
                <Box sx={{ flex: 1, position: 'relative', height: 220, mt: 1 }}>
                  <Bar data={rainChartData} options={barChartOptions} />
                </Box>
                
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1 }}>
                  <Typography variant="caption" color="textSecondary" sx={{ display: 'flex', alignItems: 'center' }}>
                    <RainIcon fontSize="small" sx={{ mr: 0.5, color: theme.palette.primary.main }} />
                    Weekly precipitation
                  </Typography>
                </Box>
              </AnimatedCard>
            </Grid>
          </>
        ) : (
          <Grid item xs={12}>
            <AnimatedCard elevation={0} sx={{ p: 3 }}>
              <Alert severity="info">
                Weather data is not available. Check your connection and try again.
              </Alert>
            </AnimatedCard>
          </Grid>
        )}
      </Grid>
      
      {/* Farm insights and advice */}
      <Grid container spacing={3} sx={{ mt: 2 }}>
        <Grid item xs={12}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <CropIcon color="primary" sx={{ mr: 1 }} />
            <Typography variant="h5" component="h2">Farm Insights</Typography>
          </Box>
        </Grid>

        {/* Crop distribution */}
        <Grid item xs={12} md={4}>
          <AnimatedCard 
            elevation={2} 
            sx={{ p: 3, height: '100%' }}
            delay={0.4}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>Crop Distribution</Typography>
              <IconButton size="small">
                <MoreIcon fontSize="small" />
              </IconButton>
            </Box>
            
            {loadingStates.crops ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 220 }}>
                <CircularProgress size={40} />
              </Box>
            ) : (
              <>
                <Box sx={{ height: 220, position: 'relative', my: 2 }}>
                  <Doughnut data={cropDistribution} options={doughnutChartOptions} />
                </Box>
                
                <Typography variant="body2" color="textSecondary" align="center" mt={1}>
                  Total area: {user?.farmDetails?.size || 0} {user?.farmDetails?.sizeUnit || 'hectares'}
                </Typography>
              </>
            )}
          </AnimatedCard>
        </Grid>
        
        {/* Farming advice */}
        <Grid item xs={12} md={4}>
          <AnimatedCard 
            elevation={2} 
            sx={{ height: '100%' }}
            delay={0.5}
          >
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>Today's Advice</Typography>
                <Chip 
                  label="Updated" 
                  size="small" 
                  color="success" 
                  icon={<UpdateIcon fontSize="small" />} 
                />
              </Box>
              
              {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
                  <CircularProgress />
                </Box>
              ) : farmingAdvice && farmingAdvice.length > 0 ? (
                farmingAdvice.slice(0, 3).map((advice, index) => (
                  <Paper 
                    key={index} 
                    elevation={0}
                    variant="outlined"
                    sx={{ 
                      p: 2, 
                      mb: 2, 
                      borderRadius: theme.shape.borderRadius,
                      border: '1px solid',
                      borderColor: index === 0 ? 'warning.light' : 'divider',
                      backgroundColor: index === 0 ? alpha(theme.palette.warning.light, 0.1) : 'transparent'
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                      <AlertIcon 
                        fontSize="small" 
                        color={index === 0 ? "warning" : "primary"} 
                        sx={{ mt: 0.3, mr: 1 }} 
                      />
                      <Typography variant="body2">
                        {advice.message || advice.text || advice}
                      </Typography>
                    </Box>
                  </Paper>
                ))
              ) : (
                <Paper 
                  elevation={0}
                  variant="outlined"
                  sx={{ 
                    p: 2, 
                    borderRadius: theme.shape.borderRadius,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: 150
                  }}
                >
                  <Box sx={{ textAlign: 'center' }}>
                    <InfoIcon sx={{ fontSize: 40, color: 'action.disabled', mb: 1 }} />
                    <Typography variant="body2" color="textSecondary">
                      No advice available. Check back later.
                    </Typography>
                  </Box>
                </Paper>
              )}
              
              <Box sx={{ mt: 'auto', textAlign: 'right' }}>
                <Button 
                  size="small" 
                  component={Link} 
                  to="/ai-advisor"
                  endIcon={<ArrowUpIcon sx={{ transform: 'rotate(45deg)' }} />}
                >
                  Get Expert Advice
                </Button>
              </Box>
            </CardContent>
          </AnimatedCard>
        </Grid>
        
        {/* Task planner */}
        <Grid item xs={12} md={4}>
          <AnimatedCard 
            elevation={2} 
            sx={{ height: '100%' }}
            delay={0.6}
          >
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <TaskIcon color="secondary" />
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>Task Planner</Typography>
                </Box>
                <Chip 
                  label={`${tasks.length} Tasks`}
                  size="small" 
                  color="secondary" 
                  variant="outlined"
                />
              </Box>
              
              {loadingStates.tasks ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
                  <CircularProgress />
                </Box>
              ) : (
                <List>
                  {tasks.map((task, index) => (
                    <ListItem 
                      key={index} 
                      disableGutters 
                      sx={{ 
                        px: 2, 
                        py: 1,
                        mb: 1,
                        bgcolor: 'background.default',
                        borderRadius: 2,
                        transition: 'all 0.2s',
                        '&:hover': {
                          bgcolor: 'action.hover',
                          transform: 'translateX(5px)'
                        }
                      }}>
                      <ListItemIcon sx={{ minWidth: '36px' }}>
                        <Avatar sx={{ 
                          width: 24, 
                          height: 24, 
                          bgcolor: index < 2 ? 'error.main' : 'primary.main',
                          fontSize: '0.8rem',
                          boxShadow: index < 2 ? `0 0 0 2px ${alpha(theme.palette.error.main, 0.3)}` : 'none',
                        }}>
                          {index + 1}
                        </Avatar>
                      </ListItemIcon>
                      <ListItemText primary={task} />
                      <Chip 
                        label={index < 2 ? "Priority" : "Normal"} 
                        size="small" 
                        color={index < 2 ? "error" : "default"} 
                        variant={index < 2 ? "filled" : "outlined"}
                        sx={{ height: 24, fontSize: '0.7rem' }}
                      />
                    </ListItem>
                  ))}
                </List>
              )}
              
              <ShimmerButton 
                variant="outlined"
                color="secondary"
                fullWidth
                sx={{ 
                  mt: 2,
                  borderRadius: theme.shape.borderRadius,
                  borderWidth: '2px',
                  '&:hover': {
                    borderWidth: '2px'
                  }
                }}
              >
                Add New Task
              </ShimmerButton>
            </CardContent>
          </AnimatedCard>
        </Grid>
      </Grid>
      
      {/* Crop recommendations */}
      <Grid container spacing={3} sx={{ mt: 2 }}>
        <Grid item xs={12} md={6}>
          <AnimatedCard 
            elevation={2} 
            delay={0.6}
          >
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <IconBox color="success">
                  <CropIcon />
                </IconBox>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Crop Recommendations
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Based on your soil and climate conditions
                  </Typography>
                </Box>
              </Box>
              
              <Divider sx={{ mb: 2 }} />
              
              {loadingStates.crops ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
                  <CircularProgress />
                </Box>
              ) : cropRecommendations.length > 0 ? (
                <List sx={{ py: 0 }}>
                  {cropRecommendations.map((crop, index) => (
                    <ListItem 
                      key={index}
                      component={Link}
                      to={`/crops?recommended=${crop.name}`}
                      sx={{ 
                        px: 2, 
                        py: 1.5,
                        borderRadius: 1,
                        mb: 1,
                        textDecoration: 'none',
                        color: 'inherit',
                        transition: 'all 0.2s',
                        '&:hover': {
                          backgroundColor: 'action.hover',
                        }
                      }}
                    >
                      <ListItemText 
                        primary={
                          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <Typography variant="body1" fontWeight="medium">
                              {crop.name}
                            </Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <ProgressCircle value={crop.success} color="success" size={32}>
                                <Typography variant="caption" fontWeight="bold" sx={{ position: 'relative', zIndex: 1 }}>
                                  {crop.success}%
                                </Typography>
                              </ProgressCircle>
                            </Box>
                          </Box>
                        } 
                        secondary={
                          <Box 
                            sx={{ 
                              mt: 0.5, 
                              display: 'inline-block',
                              px: 1, 
                              py: 0.25, 
                              borderRadius: 1, 
                              fontSize: '0.7rem',
                              backgroundColor: theme.palette.primary.main,
                              color: 'primary.contrastText'
                            }
                          }>
                            {`${crop.season}, ${crop.waterRequirement} water need`}
                          </Box>
                        } 
                      />
                      <Box 
                        sx={{ 
                          display: 'flex',
                          opacity: 0,
                          transition: 'all 0.2s',
                          '.MuiListItem-root:hover &': {
                            opacity: 1
                          }
                        }}
                      >
                        <ArrowUpIcon fontSize="small" sx={{ color: 'inherit', transform: 'rotate(45deg)' }} />
                      </Box>
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Typography variant="body2">No recommendations available.</Typography>
              )}
              
              <Box sx={{ mt: 2, textAlign: 'right' }}>
                <Button 
                  size="small" 
                  component={Link} 
                  to="/crops"
                  endIcon={<ArrowUpIcon sx={{ transform: 'rotate(45deg)' }} />}
                >
                  See All Crops
                </Button>
              </Box>
            </CardContent>
          </AnimatedCard>
        </Grid>
        
        {/* Marketplace activity */}
        <Grid item xs={12} md={6}>
          <AnimatedCard 
            elevation={2} 
            delay={0.7}
          >
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <IconBox color="warning">
                  <DigitalMarketIcon />
                </IconBox>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Marketplace Activity
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Your recent sales and purchases
                  </Typography>
                </Box>
              </Box>
              
              <Tabs 
                value={marketplaceTab} 
                onChange={handleMarketplaceTabChange}
                sx={{ 
                  mb: 2,
                  borderBottom: 1, 
                  borderColor: 'divider',
                  '& .MuiTab-root': {
                    minWidth: 120,
                    fontWeight: 500,
                  },
                  '& .Mui-selected': {
                    fontWeight: 'bold',
                  }
                }}
                variant="fullWidth"
              >
                <Tab 
                  icon={<ListingIcon fontSize="small" />} 
                  iconPosition="start" 
                  label="My Listings" 
                />
                <Tab 
                  icon={<OfferIcon fontSize="small" />} 
                  iconPosition="start" 
                  label="My Offers" 
                />
              </Tabs>
              
              {loadingStates.marketplace ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
                  <CircularProgress />
                </Box>
              ) : (
                <>
                  {/* My Listings Tab */}
                  {marketplaceTab === 0 && (
                    <>
                      {myListings.length > 0 ? (
                        <Grid container spacing={2}>
                          {myListings.map((listing) => (
                            <Grid item xs={12} md={6} key={listing._id}>
                              <Paper 
                                elevation={0} 
                                variant="outlined"
                                sx={{ 
                                  p: 2, 
                                  borderRadius: 2,
                                  transition: 'all 0.3s',
                                  '&:hover': {
                                    boxShadow: 3,
                                    transform: 'translateY(-4px)',
                                  }
                                }}
                              >
                                <Typography variant="subtitle1" fontWeight="medium" sx={{ mb: 1 }}>
                                  {listing.cropName}
                                </Typography>
                                
                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                  <Typography variant="body2" color="textSecondary" mr={1}>
                                    Quantity:
                                  </Typography>
                                  <Typography variant="body2" fontWeight="medium">
                                    {listing.quantity} {listing.unit}
                                  </Typography>
                                </Box>
                                
                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                  <Typography variant="body2" color="textSecondary" mr={1}>
                                    Price per {listing.unit}:
                                  </Typography>
                                  <Typography variant="body2" fontWeight="medium">
                                    ${listing.price}
                                  </Typography>
                                </Box>
                                
                                {listing.offers > 0 ? (
                                  <Chip 
                                    label={`${listing.offerCount || listing.offers} Offers`} 
                                    size="small" 
                                    color="warning" 
                                    sx={{ mt: 1 }}
                                  />
                                ) : (
                                  <Chip 
                                    label="No Offers Yet" 
                                    size="small" 
                                    variant="outlined"
                                    sx={{ mt: 1 }}
                                  />
                                )}
                              </Paper>
                            </Grid>
                          ))}
                        </Grid>
                      ) : (
                        <Box sx={{ textAlign: 'center', py: 4 }}>
                          <Typography variant="body1" color="textSecondary">
                            You don't have any active listings
                          </Typography>
                          <Button 
                            variant="outlined" 
                            color="primary"
                            component={Link}
                            to="/market-access/new-listing"
                            sx={{ mt: 2 }}
                          >
                            Create a Listing
                          </Button>
                        </Box>
                      )}
                      
                      {myListings.length > 0 && (
                        <Box sx={{ mt: 2, textAlign: 'right' }}>
                          <Button 
                            size="small" 
                            component={Link} 
                            to="/market-access/my-listings"
                            endIcon={<ArrowUpIcon sx={{ transform: 'rotate(45deg)' }} />}
                          >
                            Manage Listings
                          </Button>
                        </Box>
                      )}
                    </>
                  )}
                  
                  {/* My Offers Tab */}
                  {marketplaceTab === 1 && (
                    <>
                      {myOffers.length > 0 ? (
                        <List>
                          {myOffers.map((offer) => {
                            const { icon, color, label } = getStatusDetails(offer.status);
                            return (
                              <Paper 
                                key={offer._id}
                                elevation={0}
                                variant="outlined"
                                sx={{
                                  p: 2,
                                  mb: 2,
                                  borderRadius: 2,
                                  transition: 'all 0.3s',
                                  '&:hover': {
                                    boxShadow: 2
                                  }
                                }}
                              >
                                <ListItem disableGutters sx={{ px: 0 }}>
                                  <ListItemIcon>
                                    <IconBox color={color}>
                                      {icon || <OfferIcon />}
                                    </IconBox>
                                  </ListItemIcon>
                                  <ListItemText 
                                    primary={
                                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                        <Typography variant="subtitle1" fontWeight="medium">
                                          {offer.productListing?.cropName}
                                        </Typography>
                                        <StatusChip 
                                          label={label} 
                                          statusColor={color} 
                                          size="small" 
                                          icon={icon}
                                          sx={{ ml: 1 }}
                                        />
                                      </Box>
                                    } 
                                    secondary={
                                      <>
                                        <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                                          <Typography variant="body2" color="text.secondary" sx={{ mr: 1 }}>
                                            Quantity:
                                          </Typography>
                                          <Typography variant="body2" fontWeight="medium">
                                            {offer.quantity} {offer.unit}
                                          </Typography>
                                        </Box>
                                      </>
                                    }
                                  />
                                </ListItem>
                              </Paper>
                            );
                          })}
                        </List>
                      ) : (
                        <Box sx={{ textAlign: 'center', py: 4 }}>
                          <Typography variant="body1" color="textSecondary">
                            You haven't placed any offers yet
                          </Typography>
                          <Button 
                            variant="outlined" 
                            color="primary"
                            component={Link}
                            to="/market-access"
                            sx={{ mt: 2 }}
                          >
                            Browse Marketplace
                          </Button>
                        </Box>
                      )}
                      
                      {myOffers.length > 0 && (
                        <Box sx={{ mt: 2, textAlign: 'right' }}>
                          <Button 
                            size="small" 
                            component={Link} 
                            to="/market-access/my-offers"
                            endIcon={<ArrowUpIcon sx={{ transform: 'rotate(45deg)' }} />}
                          >
                            View All Offers
                          </Button>
                        </Box>
                      )}
                    </>
                  )}
                </>
              )}
            </CardContent>
          </AnimatedCard>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Dashboard;