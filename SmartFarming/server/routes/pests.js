const express = require('express');
const router = express.Router();
const {
  getAllPests,
  getPestById,
  createPest,
  updatePest,
  deletePest,
  getPestsByCrop,
  getTreatmentRecommendations,
  identifyPest
} = require('../controllers/pestController');
const { protect, authorize } = require('../middleware/auth');

// Protect all routes
router.use(protect);

// Get pests by crop
router.get('/crop/:cropId', getPestsByCrop);

// Get treatment recommendations
router.get('/:id/treatments', getTreatmentRecommendations);

// Pest identification route
router.post('/identify', identifyPest);

// CRUD routes
router.route('/')
  .get(getAllPests)
  .post(authorize('admin'), createPest);

router.route('/:id')
  .get(getPestById)
  .put(authorize('admin'), updatePest)
  .delete(authorize('admin'), deletePest);

module.exports = router;