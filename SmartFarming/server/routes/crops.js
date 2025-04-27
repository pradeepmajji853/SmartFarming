const express = require('express');
const router = express.Router();
const {
  getAllCrops,
  getCrop,
  createCrop,
  updateCrop,
  deleteCrop,
  getRecommendations
} = require('../controllers/cropController');
const { protect, authorize } = require('../middleware/auth');

// Protect all routes
router.use(protect);

// Get crop recommendations
router.get('/recommend', getRecommendations);

// CRUD routes
router.route('/')
  .get(getAllCrops)
  .post(authorize('admin'), createCrop);

router.route('/:id')
  .get(getCrop)
  .put(authorize('admin'), updateCrop)
  .delete(authorize('admin'), deleteCrop);

module.exports = router;