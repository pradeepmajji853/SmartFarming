const Crop = require('../models/Crop');

// @desc    Get all crops
// @route   GET /api/crops
// @access  Private
exports.getAllCrops = async (req, res) => {
  try {
    const crops = await Crop.find();
    res.status(200).json({ success: true, count: crops.length, data: crops });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error', error: error.message });
  }
};

// @desc    Get single crop
// @route   GET /api/crops/:id
// @access  Private
exports.getCrop = async (req, res) => {
  try {
    const crop = await Crop.findById(req.params.id).populate('commonPests');

    if (!crop) {
      return res.status(404).json({ success: false, message: 'Crop not found' });
    }

    res.status(200).json({ success: true, data: crop });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error', error: error.message });
  }
};

// @desc    Create new crop
// @route   POST /api/crops
// @access  Private/Admin
exports.createCrop = async (req, res) => {
  try {
    const crop = await Crop.create(req.body);
    res.status(201).json({ success: true, data: crop });
  } catch (error) {
    res.status(400).json({ success: false, message: 'Error creating crop', error: error.message });
  }
};

// @desc    Update crop
// @route   PUT /api/crops/:id
// @access  Private/Admin
exports.updateCrop = async (req, res) => {
  try {
    const crop = await Crop.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    if (!crop) {
      return res.status(404).json({ success: false, message: 'Crop not found' });
    }

    res.status(200).json({ success: true, data: crop });
  } catch (error) {
    res.status(400).json({ success: false, message: 'Error updating crop', error: error.message });
  }
};

// @desc    Delete crop
// @route   DELETE /api/crops/:id
// @access  Private/Admin
exports.deleteCrop = async (req, res) => {
  try {
    const crop = await Crop.findByIdAndDelete(req.params.id);

    if (!crop) {
      return res.status(404).json({ success: false, message: 'Crop not found' });
    }

    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error', error: error.message });
  }
};

// @desc    Get crop recommendations based on conditions
// @route   GET /api/crops/recommend
// @access  Private
exports.getRecommendations = async (req, res) => {
  try {
    const { season, soilType, temperature, waterAvailability } = req.query;
    
    // Build query
    const query = {};
    
    // Filter by season if provided
    if (season) {
      query.season = { $in: [season, 'all'] };
    }
    
    // Filter by soil type if provided
    if (soilType) {
      query.soilType = soilType;
    }
    
    // Filter by water requirement if provided
    if (waterAvailability) {
      if (waterAvailability === 'low') {
        query.waterRequirement = 'low';
      } else if (waterAvailability === 'medium') {
        query.waterRequirement = { $in: ['low', 'medium'] };
      }
      // If high water availability, no need to filter
    }
    
    // Find crops matching the criteria
    let crops = await Crop.find(query);
    
    // Filter by temperature if provided
    if (temperature) {
      const temp = parseFloat(temperature);
      crops = crops.filter(crop => 
        temp >= crop.idealTemperature.min && temp <= crop.idealTemperature.max
      );
    }
    
    res.status(200).json({
      success: true,
      count: crops.length,
      data: crops
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error getting crop recommendations',
      error: error.message
    });
  }
};