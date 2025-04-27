const express = require('express');
const router = express.Router();
const {
  getAllMarketPrices,
  getMarketTrends,
  addMarketPrice,
  compareMarketPrices
} = require('../controllers/marketController');
const { protect, authorize } = require('../middleware/auth');

// Protect all routes
router.use(protect);

// Market prices comparison
router.get('/compare', compareMarketPrices);

// Market trends for specific crop
router.get('/trends/:crop', getMarketTrends);

// Main routes
router.route('/')
  .get(getAllMarketPrices)
  .post(authorize('admin', 'expert'), addMarketPrice);

module.exports = router;