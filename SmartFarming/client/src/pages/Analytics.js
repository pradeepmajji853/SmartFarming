import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Paper,
  Box,
  Grid,
  Card,
  CardContent,
  Divider,
  ButtonGroup,
  Button,
  CircularProgress,
  Alert,
  Tabs,
  Tab
} from '@mui/material';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { Line, Bar, Pie } from 'react-chartjs-2';
import {
  Assessment as AnalyticsIcon,
  Inventory as YieldIcon,
  WaterDrop as RainfallIcon,
  Bolt as EnergyIcon,
  AttachMoney as FinanceIcon,
  BugReport as PestIcon,
  Grain as CropPerformanceIcon
} from '@mui/icons-material';
import { getCropPerformanceData, getWeatherImpactData, getPestAnalysisData, getFinancialAnalytics } from '../services/analyticsService';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const Analytics = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cropPerformance, setCropPerformance] = useState(null);
  const [weatherImpact, setWeatherImpact] = useState(null);
  const [pestAnalysis, setPestAnalysis] = useState(null);
  const [financialAnalytics, setFinancialAnalytics] = useState(null);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  useEffect(() => {
    fetchAnalyticsData();
  }, [selectedYear]);

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch crop performance data
      const cropData = await getCropPerformanceData(selectedYear);
      setCropPerformance(cropData.data);

      // Fetch weather impact data
      const weatherData = await getWeatherImpactData();
      setWeatherImpact(weatherData.data);

      // Fetch pest analysis data
      const pestData = await getPestAnalysisData(selectedYear);
      setPestAnalysis(pestData.data);

      // Fetch financial analytics
      const financialData = await getFinancialAnalytics(selectedYear);
      setFinancialAnalytics(financialData.data);

    } catch (err) {
      console.error('Error fetching analytics data:', err);
      setError('Failed to load analytics data. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleYearChange = (year) => {
    setSelectedYear(year);
  };

  // Mock data colors
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

  // Generate mock yield comparison data
  const generateMockYieldData = () => {
    return {
      labels: ['Your Farm', 'District Avg', 'State Avg'],
      datasets: [{
        label: 'Yield (Q/Ha)',
        data: [24.2, 20.8, 19.5],
        backgroundColor: '#8884d8',
      }]
    };
  };

  // Generate mock monthly rainfall data
  const generateMockRainfallData = () => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return {
      labels: months,
      datasets: [{
        label: 'Rainfall (mm)',
        data: months.map(() => Math.floor(Math.random() * 150)),
        backgroundColor: '#82ca9d',
      }]
    };
  };

  // Generate mock pest occurrence data
  const generateMockPestData = () => {
    const data = [35, 25, 20, 15, 5];
    return {
      labels: ['Aphids', 'Bollworm', 'Stem Borer', 'Leaf Roller', 'Others'],
      datasets: [{
        label: 'Pest Occurrence (%)',
        data: data,
        backgroundColor: COLORS,
        borderWidth: 1,
      }]
    };
  };

  // Generate mock financial data
  const generateMockFinancialData = () => {
    const data = [15, 25, 20, 30, 10];
    return {
      labels: ['Seeds', 'Fertilizers', 'Pesticides', 'Labor', 'Equipment'],
      datasets: [{
        label: 'Expense Distribution (%)',
        data: data,
        backgroundColor: COLORS,
        borderWidth: 1,
      }]
    };
  };

  // Generate yield history data
  const generateYieldHistoryData = () => {
    const mockData = cropPerformance?.yieldHistory || [
      { year: 2020, yield: 18.5, target: 17 },
      { year: 2021, yield: 19.8, target: 18 },
      { year: 2022, yield: 17.2, target: 19 },
      { year: 2023, yield: 20.5, target: 20 },
      { year: 2024, yield: 22.3, target: 20 },
      { year: 2025, yield: 19.8, target: 22 }
    ];

    return {
      labels: mockData.map(item => item.year),
      datasets: [
        {
          label: 'Actual Yield',
          data: mockData.map(item => item.yield),
          borderColor: '#8884d8',
          backgroundColor: 'rgba(136, 132, 216, 0.5)',
        },
        {
          label: 'Target Yield',
          data: mockData.map(item => item.target),
          borderColor: '#82ca9d',
          backgroundColor: 'rgba(130, 202, 157, 0.5)',
        }
      ]
    };
  };

  // Generate seasonal threat data
  const generateThreatData = () => {
    const seasons = ['Spring', 'Summer', 'Fall', 'Winter'];
    const values = [3, 4, 2, 1]; // Medium, High, Low, Very Low
    
    return {
      labels: seasons,
      datasets: [{
        label: 'Threat Level',
        data: values,
        backgroundColor: '#FF8042',
      }]
    };
  };

  // Chart options
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true
      }
    }
  };

  return (
    <Container maxWidth="xl">
      <Typography variant="h4" component="h1" gutterBottom>
        Farm Analytics
      </Typography>
      
      <Typography variant="subtitle1" color="textSecondary" paragraph>
        Analyze your farm data to make informed decisions and improve productivity
      </Typography>

      {/* Year selection */}
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Tabs value={activeTab} onChange={handleTabChange} aria-label="analytics tabs">
          <Tab icon={<CropPerformanceIcon />} label="Crop Performance" />
          <Tab icon={<RainfallIcon />} label="Weather Impact" />
          <Tab icon={<PestIcon />} label="Pest Analysis" />
          <Tab icon={<FinanceIcon />} label="Financial" />
        </Tabs>
        
        <ButtonGroup variant="outlined" size="small">
          {[2023, 2024, 2025].map(year => (
            <Button
              key={year}
              onClick={() => handleYearChange(year)}
              variant={selectedYear === year ? 'contained' : 'outlined'}
            >
              {year}
            </Button>
          ))}
        </ButtonGroup>
      </Box>

      {/* Error Message */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Loading Indicator */}
      {loading && (
        <Box display="flex" justifyContent="center" my={4}>
          <CircularProgress />
        </Box>
      )}

      {/* Crop Performance Tab */}
      {!loading && !error && activeTab === 0 && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Paper sx={{ p: 3, height: '100%' }}>
              <Typography variant="h6" gutterBottom>
                Crop Yield Trends
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              <Box sx={{ height: 400 }}>
                <Line options={chartOptions} data={generateYieldHistoryData()} />
              </Box>
            </Paper>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3, mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                Yield Comparison
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              <Box sx={{ height: 250 }}>
                <Bar options={chartOptions} data={generateMockYieldData()} />
              </Box>
            </Paper>
            
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Growth Factors
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              <Box>
                {(cropPerformance?.factors || [
                  { name: 'Rainfall', impact: 'Positive', value: '+12%' },
                  { name: 'Soil Quality', impact: 'Neutral', value: '0%' },
                  { name: 'Pest Management', impact: 'Negative', value: '-5%' }
                ]).map((factor, index) => (
                  <Box key={index} sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2">{factor.name}</Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        color:
                          factor.impact === 'Positive'
                            ? 'success.main'
                            : factor.impact === 'Negative'
                            ? 'error.main'
                            : 'text.secondary'
                      }}
                    >
                      {factor.value}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </Paper>
          </Grid>
        </Grid>
      )}

      {/* Weather Impact Tab */}
      {!loading && !error && activeTab === 1 && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Monthly Rainfall Distribution
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              <Box sx={{ height: 400 }}>
                <Bar options={chartOptions} data={generateMockRainfallData()} />
              </Box>
            </Paper>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3, mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                Weather Impact Analysis
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              <Box>
                <Typography variant="body2" gutterBottom>
                  <strong>Correlation with Crop Yield:</strong> {weatherImpact?.correlation || '0.78'}
                </Typography>
                
                <Typography variant="subtitle2" sx={{ mt: 2 }}>
                  Key Weather Factors:
                </Typography>
                
                {(weatherImpact?.impacts || [
                  { factor: 'Rainfall', correlation: 0.85, effect: 'High positive impact on crop yields' },
                  { factor: 'Temperature', correlation: -0.45, effect: 'Moderate negative impact during heat waves' },
                  { factor: 'Humidity', correlation: 0.32, effect: 'Slight positive impact on certain crops' }
                ]).map((impact, index) => (
                  <Card key={index} variant="outlined" sx={{ mb: 2, mt: 1 }}>
                    <CardContent>
                      <Typography variant="subtitle2" color="primary">
                        {impact.factor}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        Correlation: {impact.correlation.toFixed(2)}
                      </Typography>
                      <Typography variant="body2">
                        {impact.effect}
                      </Typography>
                    </CardContent>
                  </Card>
                ))}
              </Box>
            </Paper>
          </Grid>
        </Grid>
      )}

      {/* Pest Analysis Tab */}
      {!loading && !error && activeTab === 2 && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Pest Occurrence Distribution
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              <Box sx={{ height: 400 }}>
                <Pie data={generateMockPestData()} />
              </Box>
            </Paper>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3, mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                Seasonal Pest Threat Analysis
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              <Box sx={{ height: 250 }}>
                <Bar options={chartOptions} data={generateThreatData()} />
              </Box>
            </Paper>
            
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Recommendations
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              <Box component="ul" sx={{ pl: 2 }}>
                {(pestAnalysis?.recommendations || [
                  'Regular field scouting during high-risk seasons',
                  'Preventive measures for common pests',
                  'Early intervention when pest indicators detected'
                ]).map((recommendation, index) => (
                  <Box component="li" key={index} sx={{ mb: 1 }}>
                    <Typography variant="body2">{recommendation}</Typography>
                  </Box>
                ))}
              </Box>
            </Paper>
          </Grid>
        </Grid>
      )}

      {/* Financial Tab */}
      {!loading && !error && activeTab === 3 && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Expense Distribution
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              <Box sx={{ height: 400 }}>
                <Pie data={generateMockFinancialData()} />
              </Box>
            </Paper>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Financial Summary
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Card sx={{ bgcolor: 'success.light' }}>
                    <CardContent>
                      <Typography color="success.dark" variant="subtitle2" gutterBottom>
                        Revenue
                      </Typography>
                      <Typography variant="h4" color="success.dark">
                        ₹{financialAnalytics?.revenue || '125,000'}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                
                <Grid item xs={6}>
                  <Card sx={{ bgcolor: 'error.light' }}>
                    <CardContent>
                      <Typography color="error.dark" variant="subtitle2" gutterBottom>
                        Expenses
                      </Typography>
                      <Typography variant="h4" color="error.dark">
                        ₹{financialAnalytics?.expenses || '78,500'}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                
                <Grid item xs={6}>
                  <Card>
                    <CardContent>
                      <Typography color="primary" variant="subtitle2" gutterBottom>
                        Profit
                      </Typography>
                      <Typography variant="h4" color="primary">
                        ₹{financialAnalytics?.profit || '46,500'}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                
                <Grid item xs={6}>
                  <Card>
                    <CardContent>
                      <Typography color="primary" variant="subtitle2" gutterBottom>
                        Profit Margin
                      </Typography>
                      <Typography variant="h4" color="primary">
                        {financialAnalytics?.profitMargin || '37.2'}%
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
              
              <Box sx={{ mt: 3 }}>
                <Typography variant="subtitle1" gutterBottom>
                  Cost Optimization Opportunities
                </Typography>
                
                <Box component="ul" sx={{ pl: 2 }}>
                  <Box component="li">
                    <Typography variant="body2">Optimize fertilizer usage (potential 10% savings)</Typography>
                  </Box>
                  <Box component="li">
                    <Typography variant="body2">Invest in modern irrigation systems (reduce water costs by 15%)</Typography>
                  </Box>
                  <Box component="li">
                    <Typography variant="body2">Explore bulk purchasing for seeds and pesticides</Typography>
                  </Box>
                </Box>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      )}
    </Container>
  );
};

export default Analytics;