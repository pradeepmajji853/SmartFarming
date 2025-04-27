import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, CssBaseline, Box } from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

// Import custom theme
import theme from './theme';

// Context Providers
import { AuthProvider } from './context/AuthContext';

// Components
import Sidebar from './components/Navbar'; // Still importing from Navbar.js but using as Sidebar

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Weather from './pages/Weather';
import Crops from './pages/Crops';
import CropDetail from './pages/CropDetail';
import Market from './pages/Market';
import MarketTrends from './pages/MarketTrends';
import DigitalMarket from './pages/DigitalMarket';
import MyListings from './pages/MyListings';
import ListingDetail from './pages/ListingDetail';
import ListingEdit from './pages/ListingEdit';
import MyOffers from './pages/MyOffers';
import ManageOffers from './pages/ManageOffers';
import ExpertConsultation from './pages/ExpertConsultation';
import AIAdvisor from './pages/AIAdvisor';
import Profile from './pages/Profile';

// Route Guard
const PrivateRoute = ({ children }) => {
  const user = JSON.parse(localStorage.getItem('user'));
  const isAuthenticated = user && user.token;
  return isAuthenticated ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <AuthProvider>
          <Router>
            <Box sx={{ display: 'flex' }}>
              <Sidebar />
              <Box 
                component="main" 
                sx={{ 
                  flexGrow: 1, 
                  pt: 4, 
                  pb: 6, 
                  px: { xs: 2, sm: 4 },
                  minHeight: '100vh',
                  overflow: 'hidden' 
                }}
              >
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route 
                    path="/dashboard" 
                    element={
                      <PrivateRoute>
                        <Dashboard />
                      </PrivateRoute>
                    } 
                  />
                  <Route 
                    path="/weather" 
                    element={
                      <PrivateRoute>
                        <Weather />
                      </PrivateRoute>
                    } 
                  />
                  <Route 
                    path="/crops" 
                    element={
                      <PrivateRoute>
                        <Crops />
                      </PrivateRoute>
                    } 
                  />
                  <Route 
                    path="/crops/:id" 
                    element={
                      <PrivateRoute>
                        <CropDetail />
                      </PrivateRoute>
                    } 
                  />
                  <Route 
                    path="/market" 
                    element={
                      <PrivateRoute>
                        <Market />
                      </PrivateRoute>
                    } 
                  />
                  <Route 
                    path="/market-trends" 
                    element={
                      <PrivateRoute>
                        <MarketTrends />
                      </PrivateRoute>
                    } 
                  />
                  <Route 
                    path="/market-access" 
                    element={
                      <PrivateRoute>
                        <DigitalMarket />
                      </PrivateRoute>
                    } 
                  />
                  <Route 
                    path="/market-access/my-listings" 
                    element={
                      <PrivateRoute>
                        <MyListings />
                      </PrivateRoute>
                    } 
                  />
                  <Route 
                    path="/market-access/:id" 
                    element={
                      <PrivateRoute>
                        <ListingDetail />
                      </PrivateRoute>
                    } 
                  />
                  <Route 
                    path="/market-access/edit/:id" 
                    element={
                      <PrivateRoute>
                        <ListingEdit />
                      </PrivateRoute>
                    } 
                  />
                  <Route 
                    path="/market-access/new-listing" 
                    element={
                      <PrivateRoute>
                        <ListingEdit />
                      </PrivateRoute>
                    } 
                  />
                  <Route 
                    path="/market-access/my-offers" 
                    element={
                      <PrivateRoute>
                        <MyOffers />
                      </PrivateRoute>
                    } 
                  />
                  <Route 
                    path="/market-access/:id/offers" 
                    element={
                      <PrivateRoute>
                        <ManageOffers />
                      </PrivateRoute>
                    } 
                  />
                  <Route 
                    path="/experts" 
                    element={
                      <PrivateRoute>
                        <ExpertConsultation />
                      </PrivateRoute>
                    } 
                  />
                  <Route 
                    path="/ai-advisor" 
                    element={
                      <PrivateRoute>
                        <AIAdvisor />
                      </PrivateRoute>
                    } 
                  />
                  <Route 
                    path="/profile" 
                    element={
                      <PrivateRoute>
                        <Profile />
                      </PrivateRoute>
                    } 
                  />
                </Routes>
              </Box>
            </Box>
          </Router>
        </AuthProvider>
      </LocalizationProvider>
    </ThemeProvider>
  );
}

export default App;
