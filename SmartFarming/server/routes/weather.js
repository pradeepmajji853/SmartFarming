const express = require('express');
const router = express.Router();
const { getCurrentWeather, getForecast, getFarmingAdvice } = require('../controllers/weatherController');
const { protect } = require('../middleware/auth');

// All weather routes should be protected
router.use(protect);

// Get current weather for a location
router.get('/current/:location', getCurrentWeather);

// Get weather forecast for a location
router.get('/forecast/:location/:days', getForecast);

// Get farming advice based on weather and crop type
router.get('/advice/:location/:crop', getFarmingAdvice);

module.exports = router;