import React, { useState, useContext, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Container, 
  Typography, 
  TextField, 
  Button, 
  Grid, 
  Box, 
  Paper, 
  Alert, 
  InputAdornment, 
  IconButton,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  FormHelperText
} from '@mui/material';
import { Visibility, VisibilityOff, PersonAdd } from '@mui/icons-material';
import { AuthContext } from '../context/AuthContext';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'farmer',
    farmDetails: {
      location: '',
      size: '',
      crops: []
    }
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [step, setStep] = useState(1);
  
  const { register, user, loading, error } = useContext(AuthContext);
  const navigate = useNavigate();
  
  useEffect(() => {
    // If user is already logged in, redirect to dashboard
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Handle nested farmDetails object
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prevState => ({
        ...prevState,
        [parent]: {
          ...prevState[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prevState => ({
        ...prevState,
        [name]: value
      }));
    }
    
    // Clear field error when user types
    if (formErrors[name]) {
      setFormErrors(prevErrors => ({
        ...prevErrors,
        [name]: ''
      }));
    }
  };
  
  const toggleShowPassword = () => {
    setShowPassword(prevState => !prevState);
  };
  
  const validateStep1 = () => {
    const errors = {};
    
    // Name validation
    if (!formData.name.trim()) {
      errors.name = 'Name is required';
    }
    
    // Email validation
    if (!formData.email) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Email address is invalid';
    }
    
    // Password validation
    if (!formData.password) {
      errors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }
    
    // Confirm password validation
    if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  const validateStep2 = () => {
    const errors = {};
    
    // Location validation
    if (!formData.farmDetails.location.trim()) {
      errors['farmDetails.location'] = 'Farm location is required';
    }
    
    // Farm size validation
    if (!formData.farmDetails.size) {
      errors['farmDetails.size'] = 'Farm size is required';
    } else if (isNaN(formData.farmDetails.size) || formData.farmDetails.size <= 0) {
      errors['farmDetails.size'] = 'Farm size must be a positive number';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  const handleNext = () => {
    if (validateStep1()) {
      setStep(2);
    }
  };
  
  const handleBack = () => {
    setStep(1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (step === 1) {
      handleNext();
      return;
    }
    
    if (!validateStep2()) return;
    
    // Call register from AuthContext
    const success = await register(formData);
    
    if (success) {
      navigate('/dashboard');
    }
  };

  return (
    <Container component="main" maxWidth="sm">
      <Paper elevation={3} sx={{ p: 4, my: 8, borderRadius: 2 }}>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <PersonAdd color="primary" sx={{ fontSize: 48, mb: 2 }} />
          <Typography component="h1" variant="h5" sx={{ mb: 3 }}>
            Create Your Smart Farming Account
          </Typography>
          
          {error && (
            <Alert severity="error" sx={{ width: '100%', mb: 2 }}>
              {error}
            </Alert>
          )}
          
          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1, width: '100%' }}>
            {step === 1 ? (
              /* Step 1: Basic Info */
              <>
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  id="name"
                  label="Full Name"
                  name="name"
                  autoComplete="name"
                  autoFocus
                  value={formData.name}
                  onChange={handleChange}
                  error={!!formErrors.name}
                  helperText={formErrors.name}
                  disabled={loading}
                />
                
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  id="email"
                  label="Email Address"
                  name="email"
                  autoComplete="email"
                  value={formData.email}
                  onChange={handleChange}
                  error={!!formErrors.email}
                  helperText={formErrors.email}
                  disabled={loading}
                />
                
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  name="password"
                  label="Password"
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  autoComplete="new-password"
                  value={formData.password}
                  onChange={handleChange}
                  error={!!formErrors.password}
                  helperText={formErrors.password}
                  disabled={loading}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          aria-label="toggle password visibility"
                          onClick={toggleShowPassword}
                          edge="end"
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    )
                  }}
                />
                
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  name="confirmPassword"
                  label="Confirm Password"
                  type={showPassword ? 'text' : 'password'}
                  id="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  error={!!formErrors.confirmPassword}
                  helperText={formErrors.confirmPassword}
                  disabled={loading}
                />
                
                <FormControl fullWidth margin="normal">
                  <InputLabel id="role-label">Role</InputLabel>
                  <Select
                    labelId="role-label"
                    id="role"
                    name="role"
                    value={formData.role}
                    label="Role"
                    onChange={handleChange}
                    disabled={loading}
                  >
                    <MenuItem value="farmer">Farmer</MenuItem>
                    <MenuItem value="expert">Agricultural Expert</MenuItem>
                  </Select>
                </FormControl>
                
                <Button
                  fullWidth
                  variant="contained"
                  color="primary"
                  size="large"
                  onClick={handleNext}
                  sx={{ mt: 3, mb: 2, py: 1.2 }}
                  disabled={loading}
                >
                  Next
                </Button>
              </>
            ) : (
              /* Step 2: Farm Details */
              <>
                <Typography variant="h6" sx={{ mt: 2, mb: 3 }}>
                  Farm Details
                </Typography>
                
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  id="farmDetails.location"
                  label="Farm Location"
                  name="farmDetails.location"
                  placeholder="e.g., City, State, Country"
                  value={formData.farmDetails.location}
                  onChange={handleChange}
                  error={!!formErrors['farmDetails.location']}
                  helperText={formErrors['farmDetails.location']}
                  disabled={loading}
                />
                
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  id="farmDetails.size"
                  label="Farm Size (acres)"
                  name="farmDetails.size"
                  type="number"
                  value={formData.farmDetails.size}
                  onChange={handleChange}
                  error={!!formErrors['farmDetails.size']}
                  helperText={formErrors['farmDetails.size']}
                  disabled={loading}
                  InputProps={{
                    inputProps: { min: 0 }
                  }}
                />
                
                <TextField
                  margin="normal"
                  fullWidth
                  id="farmDetails.crops"
                  label="Main Crops (comma separated)"
                  name="farmDetails.crops"
                  placeholder="e.g., Wheat, Rice, Cotton"
                  value={formData.farmDetails.crops.join?.(', ') || ''}
                  onChange={(e) => {
                    const cropsValue = e.target.value;
                    const cropsArray = cropsValue
                      .split(',')
                      .map(crop => crop.trim())
                      .filter(crop => crop !== '');
                      
                    setFormData(prev => ({
                      ...prev,
                      farmDetails: {
                        ...prev.farmDetails,
                        crops: cropsArray
                      }
                    }));
                  }}
                  disabled={loading}
                />
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3, mb: 2 }}>
                  <Button
                    variant="outlined"
                    onClick={handleBack}
                    sx={{ py: 1.2, px: 4 }}
                    disabled={loading}
                  >
                    Back
                  </Button>
                  
                  <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    size="large"
                    sx={{ py: 1.2, px: 4 }}
                    disabled={loading}
                  >
                    {loading ? 'Registering...' : 'Register'}
                  </Button>
                </Box>
              </>
            )}
            
            <Grid container justifyContent="flex-end" sx={{ mt: 2 }}>
              <Grid item>
                <Link to="/login" style={{ textDecoration: 'none' }}>
                  <Typography variant="body2" color="primary">
                    Already have an account? Sign in
                  </Typography>
                </Link>
              </Grid>
            </Grid>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
};

export default Register;