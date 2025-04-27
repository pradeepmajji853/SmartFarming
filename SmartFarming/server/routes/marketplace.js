const express = require('express');
const router = express.Router();
const {
  getAllListings,
  getMyListings,
  getListingById,
  createListing,
  updateListing,
  deleteListing,
  makeOffer,
  getOffersForListing,
  getMyOffers,
  respondToOffer
} = require('../controllers/marketplaceController');
const { protect } = require('../middleware/auth');

// Apply authentication middleware to all routes
router.use(protect);

// Listings routes
router.route('/')
  .get(getAllListings)
  .post(createListing);

router.get('/my-listings', getMyListings);
router.get('/my-offers', getMyOffers);

router.route('/:id')
  .get(getListingById)
  .put(updateListing)
  .delete(deleteListing);

// Offers routes
router.post('/:id/offers', makeOffer);
router.get('/:id/offers', getOffersForListing);
router.put('/offers/:id/respond', respondToOffer);

module.exports = router;