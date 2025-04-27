const Market = require('../models/Market');

// @desc    Get all market prices
// @route   GET /api/market
// @access  Private
exports.getAllMarketPrices = async (req, res) => {
  try {
    // Build query with filters
    let query = {};
    
    // Filter by crop if provided
    if (req.query.crop) {
      query.cropName = { $regex: req.query.crop, $options: 'i' };
    }
    
    // Filter by location if provided
    if (req.query.location) {
      query.location = { $regex: req.query.location, $options: 'i' };
    }
    
    // Filter by market type if provided
    if (req.query.marketType && ['wholesale', 'retail'].includes(req.query.marketType)) {
      query.marketType = req.query.marketType;
    }
    
    // Filter by date range if provided
    if (req.query.fromDate || req.query.toDate) {
      query.date = {};
      
      if (req.query.fromDate) {
        query.date.$gte = new Date(req.query.fromDate);
      }
      
      if (req.query.toDate) {
        query.date.$lte = new Date(req.query.toDate);
      }
    }
    
    // Execute query with sorting and pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const startIndex = (page - 1) * limit;
    
    const marketPrices = await Market.find(query)
      .sort({ date: -1 })
      .skip(startIndex)
      .limit(limit);
      
    const total = await Market.countDocuments(query);
    
    res.status(200).json({
      success: true,
      count: marketPrices.length,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit)
      },
      data: marketPrices
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching market prices',
      error: error.message
    });
  }
};

// @desc    Get market price trends for a specific crop
// @route   GET /api/market/trends/:crop
// @access  Private
exports.getMarketTrends = async (req, res) => {
  try {
    const { crop } = req.params;
    const { location, days = 30 } = req.query;
    
    // Calculate date range
    const toDate = new Date();
    const fromDate = new Date();
    fromDate.setDate(fromDate.getDate() - parseInt(days));
    
    // Build query
    let query = {
      cropName: { $regex: crop, $options: 'i' },
      date: { $gte: fromDate, $lte: toDate }
    };
    
    if (location) {
      query.location = { $regex: location, $options: 'i' };
    }
    
    // Get price data grouped by date
    const priceData = await Market.aggregate([
      { $match: query },
      { $sort: { date: 1 } },
      {
        $group: {
          _id: {
            date: { $dateToString: { format: '%Y-%m-%d', date: '$date' } },
            marketType: '$marketType'
          },
          avgPrice: { $avg: '$price' },
          minPrice: { $min: '$price' },
          maxPrice: { $max: '$price' },
          locations: { $addToSet: '$location' }
        }
      },
      { $sort: { '_id.date': 1 } },
      {
        $group: {
          _id: '$_id.marketType',
          prices: {
            $push: {
              date: '$_id.date',
              avgPrice: '$avgPrice',
              minPrice: '$minPrice',
              maxPrice: '$maxPrice',
              locations: '$locations'
            }
          }
        }
      }
    ]);
    
    // Format the response
    const formattedData = {
      crop,
      period: `${fromDate.toISOString().split('T')[0]} to ${toDate.toISOString().split('T')[0]}`,
      wholesale: priceData.find(data => data._id === 'wholesale')?.prices || [],
      retail: priceData.find(data => data._id === 'retail')?.prices || []
    };
    
    res.status(200).json({
      success: true,
      data: formattedData
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching market trends',
      error: error.message
    });
  }
};

// @desc    Add a new market price
// @route   POST /api/market
// @access  Private
exports.addMarketPrice = async (req, res) => {
  try {
    const marketPrice = await Market.create(req.body);
    
    res.status(201).json({
      success: true,
      data: marketPrice
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error adding market price',
      error: error.message
    });
  }
};

// @desc    Get market prices comparison between different locations
// @route   GET /api/market/compare
// @access  Private
exports.compareMarketPrices = async (req, res) => {
  try {
    const { crop, locations } = req.query;
    
    if (!crop || !locations) {
      return res.status(400).json({
        success: false,
        message: 'Please provide crop and locations parameters'
      });
    }
    
    const locationArray = locations.split(',');
    
    // Get latest prices for the crop in different locations
    const priceComparison = await Market.aggregate([
      {
        $match: {
          cropName: { $regex: crop, $options: 'i' },
          location: { $in: locationArray }
        }
      },
      { $sort: { date: -1 } },
      {
        $group: {
          _id: {
            location: '$location',
            marketType: '$marketType'
          },
          latestPrice: { $first: '$price' },
          lastUpdated: { $first: '$date' }
        }
      },
      {
        $group: {
          _id: '$_id.location',
          prices: {
            $push: {
              marketType: '$_id.marketType',
              price: '$latestPrice',
              lastUpdated: '$lastUpdated'
            }
          }
        }
      }
    ]);
    
    res.status(200).json({
      success: true,
      data: {
        crop,
        locations: priceComparison
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error comparing market prices',
      error: error.message
    });
  }
};