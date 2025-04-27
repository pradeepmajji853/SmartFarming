const ProductListing = require('../models/ProductListing');
const PurchaseOffer = require('../models/PurchaseOffer');
const User = require('../models/User');

// @desc    Get all product listings with optional filters
// @route   GET /api/marketplace
// @access  Private
exports.getAllListings = async (req, res) => {
  try {
    // Extract query params
    const { 
      cropName, 
      location, 
      minPrice, 
      maxPrice, 
      quality, 
      status = 'active',
      sort = 'createdAt',
      limit = 100
    } = req.query;

    // Build filter object
    const filter = { status };
    
    if (cropName) {
      filter.cropName = { $regex: cropName, $options: 'i' }; // Case insensitive search
    }
    
    if (location) {
      filter.location = { $regex: location, $options: 'i' };
    }
    
    if (quality) {
      filter.quality = quality;
    }
    
    // Price range filter
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }

    // Execute query with populate for farmer details
    const listings = await ProductListing.find(filter)
      .populate('farmer', 'name farmDetails.location')
      .sort({ [sort]: -1 })
      .limit(Number(limit));

    res.status(200).json({
      success: true,
      count: listings.length,
      data: listings
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching listings',
      error: error.message
    });
  }
};

// @desc    Get listings by current user (farmer)
// @route   GET /api/marketplace/my-listings
// @access  Private
exports.getMyListings = async (req, res) => {
  try {
    const listings = await ProductListing.find({ farmer: req.user._id })
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: listings.length,
      data: listings
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching your listings',
      error: error.message
    });
  }
};

// @desc    Get single listing
// @route   GET /api/marketplace/:id
// @access  Private
exports.getListingById = async (req, res) => {
  try {
    const listing = await ProductListing.findById(req.params.id)
      .populate('farmer', 'name farmDetails.location');

    if (!listing) {
      return res.status(404).json({
        success: false,
        message: 'Listing not found'
      });
    }

    res.status(200).json({
      success: true,
      data: listing
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching listing',
      error: error.message
    });
  }
};

// @desc    Create new listing
// @route   POST /api/marketplace
// @access  Private
exports.createListing = async (req, res) => {
  try {
    // Set the farmer to the current logged in user
    req.body.farmer = req.user._id;
    
    // Create the listing
    const listing = await ProductListing.create(req.body);

    res.status(201).json({
      success: true,
      data: listing
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error creating listing',
      error: error.message
    });
  }
};

// @desc    Update listing
// @route   PUT /api/marketplace/:id
// @access  Private
exports.updateListing = async (req, res) => {
  try {
    // Find listing
    let listing = await ProductListing.findById(req.params.id);

    if (!listing) {
      return res.status(404).json({
        success: false,
        message: 'Listing not found'
      });
    }

    // Make sure user is the listing owner
    if (listing.farmer.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to update this listing'
      });
    }

    // Update listing
    listing = await ProductListing.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      data: listing
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error updating listing',
      error: error.message
    });
  }
};

// @desc    Delete listing
// @route   DELETE /api/marketplace/:id
// @access  Private
exports.deleteListing = async (req, res) => {
  try {
    // Find listing
    const listing = await ProductListing.findById(req.params.id);

    if (!listing) {
      return res.status(404).json({
        success: false,
        message: 'Listing not found'
      });
    }

    // Make sure user is the listing owner
    if (listing.farmer.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to delete this listing'
      });
    }

    // Delete listing - replacing remove() with deleteOne()
    await ProductListing.deleteOne({ _id: req.params.id });

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting listing',
      error: error.message
    });
  }
};

// @desc    Make an offer on a product listing
// @route   POST /api/marketplace/:id/offers
// @access  Private
exports.makeOffer = async (req, res) => {
  try {
    // Find listing
    const listing = await ProductListing.findById(req.params.id);

    if (!listing) {
      return res.status(404).json({
        success: false,
        message: 'Listing not found'
      });
    }

    // Check if listing is active
    if (listing.status !== 'active') {
      return res.status(400).json({
        success: false,
        message: `Cannot make offer on a listing with status: ${listing.status}`
      });
    }

    // Check if user is not making an offer on their own listing
    if (listing.farmer.toString() === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'You cannot make an offer on your own listing'
      });
    }

    // Check if quantity is available
    if (req.body.quantity > listing.quantity) {
      return res.status(400).json({
        success: false,
        message: 'Requested quantity exceeds available quantity'
      });
    }

    // Create offer
    const offer = await PurchaseOffer.create({
      productListing: req.params.id,
      buyer: req.user._id,
      offerPrice: req.body.offerPrice,
      quantity: req.body.quantity,
      message: req.body.message,
      contactDetails: req.body.contactDetails
    });

    res.status(201).json({
      success: true,
      data: offer
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error making offer',
      error: error.message
    });
  }
};

// @desc    Get all offers for a specific listing
// @route   GET /api/marketplace/:id/offers
// @access  Private
exports.getOffersForListing = async (req, res) => {
  try {
    // Find listing
    const listing = await ProductListing.findById(req.params.id);

    if (!listing) {
      return res.status(404).json({
        success: false,
        message: 'Listing not found'
      });
    }

    // Make sure user is the listing owner
    if (listing.farmer.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to view these offers'
      });
    }

    // Get offers
    const offers = await PurchaseOffer.find({ productListing: req.params.id })
      .populate('buyer', 'name email')
      .populate('productListing', 'cropName unit price')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: offers.length,
      data: offers
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching offers',
      error: error.message
    });
  }
};

// @desc    Get all offers made by current user
// @route   GET /api/marketplace/my-offers
// @access  Private
exports.getMyOffers = async (req, res) => {
  try {
    const offers = await PurchaseOffer.find({ buyer: req.user._id })
      .populate({
        path: 'productListing',
        select: 'cropName unit price quantity farmer status',
        populate: {
          path: 'farmer',
          select: 'name'
        }
      })
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: offers.length,
      data: offers
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching your offers',
      error: error.message
    });
  }
};

// @desc    Respond to an offer (accept/reject)
// @route   PUT /api/marketplace/offers/:id/respond
// @access  Private
exports.respondToOffer = async (req, res) => {
  try {
    const { response } = req.body;

    // Validate response
    if (!['accepted', 'rejected'].includes(response)) {
      return res.status(400).json({
        success: false,
        message: 'Response must be either accepted or rejected'
      });
    }

    // Find offer
    const offer = await PurchaseOffer.findById(req.params.id)
      .populate('productListing');

    if (!offer) {
      return res.status(404).json({
        success: false,
        message: 'Offer not found'
      });
    }

    // Check if user owns the listing related to this offer
    if (offer.productListing.farmer.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to respond to this offer'
      });
    }

    // Update offer status
    offer.status = response;
    offer.respondedAt = Date.now();
    await offer.save();

    // If accepted, update listing status and quantity
    if (response === 'accepted') {
      const listing = offer.productListing;
      
      // Reduce quantity or mark as sold
      if (offer.quantity >= listing.quantity) {
        listing.status = 'sold';
      } else {
        listing.quantity -= offer.quantity;
      }
      
      await listing.save();
    }

    res.status(200).json({
      success: true,
      data: offer
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error responding to offer',
      error: error.message
    });
  }
};