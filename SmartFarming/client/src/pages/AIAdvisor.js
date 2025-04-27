import React from 'react';
import { Box, Container, Typography } from '@mui/material';
import AIAdvisorComponent from '../components/AIAdvisor';

const AIAdvisorPage = () => {
  return (
    <Container maxWidth="xl">
      <Box sx={{ mb: 4, mt: 2 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          AI Farming Advisor
        </Typography>
        <Typography variant="subtitle1" color="text.secondary" gutterBottom>
          Get personalized farming recommendations powered by Google's Gemini AI
        </Typography>
      </Box>
      
      <AIAdvisorComponent />
    </Container>
  );
};

export default AIAdvisorPage;