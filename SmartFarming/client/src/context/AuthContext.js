import { createContext, useState, useEffect } from 'react';
import authService from '../services/authService';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // Load user from localStorage on app startup
  useEffect(() => {
    const loadUser = async () => {
      if (isInitialized) return; // Skip if already initialized
      
      try {
        const storedUser = authService.getCurrentUser();
        
        if (storedUser) {
          setUser(storedUser);
        }
      } catch (error) {
        setError('Authentication failed. Please login again.');
      } finally {
        setLoading(false);
        setIsInitialized(true);
      }
    };

    loadUser();
  }, [isInitialized]);

  // Register user
  const register = async (userData) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await authService.register(userData);
      
      if (response.success) {
        setUser(response.user);
        return true;
      } else {
        setError(response.message || 'Registration failed');
        return false;
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Registration failed');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Login user
  const login = async (email, password) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await authService.login(email, password);
      
      if (response.success) {
        setUser(response.user);
        return true;
      } else {
        setError(response.message || 'Invalid credentials');
        return false;
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Invalid credentials');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Logout user
  const logout = () => {
    authService.logout();
    setUser(null);
  };

  // Update user profile
  const updateProfile = async (userData) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await authService.updateProfile(userData);
      
      if (response.success) {
        setUser(response.user);
        return true;
      } else {
        setError(response.message || 'Failed to update profile');
        return false;
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to update profile');
      return false;
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        register,
        login,
        logout,
        updateProfile
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};