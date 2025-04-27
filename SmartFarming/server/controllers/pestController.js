const Pest = require('../models/Pest');
const Crop = require('../models/Crop');
const FarmData = require('../models/FarmData');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Set up storage for pest images
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../uploads/pests');
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Generate unique filename with timestamp
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const fileExt = path.extname(file.originalname);
    cb(null, 'pest-' + uniqueSuffix + fileExt);
  }
});

// Filter to accept only images
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Not an image! Please upload only images.'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB max size
});

// @desc    Get all pests
// @route   GET /api/pests
// @access  Private
exports.getAllPests = async (req, res) => {
  try {
    let query = {};
    
    // Apply filters if provided in query params
    if (req.query.cropType) {
      query.affectedCrops = req.query.cropType;
    }
    
    if (req.query.severity) {
      query.severity = req.query.severity.toLowerCase();
    }
    
    if (req.query.season) {
      query.activeSeasons = req.query.season.toLowerCase();
    }
    
    // Search by name or scientific name
    if (req.query.search) {
      query.$or = [
        { name: { $regex: req.query.search, $options: 'i' } },
        { scientificName: { $regex: req.query.search, $options: 'i' } }
      ];
    }
    
    const pests = await Pest.find(query)
      .select('name scientificName description imageUrl severity affectedCrops activeSeasons')
      .sort({ name: 1 });
      
    res.status(200).json(pests);
  } catch (error) {
    console.error('Error fetching pests:', error);
    res.status(500).json({ message: 'Failed to fetch pests', error: error.message });
  }
};

// @desc    Get a single pest
// @route   GET /api/pests/:id
// @access  Private
exports.getPestById = async (req, res) => {
  try {
    const pest = await Pest.findById(req.params.id).populate('affectedCrops');

    if (!pest) {
      return res.status(404).json({
        success: false,
        message: 'Pest not found'
      });
    }

    res.status(200).json(pest);
  } catch (error) {
    console.error('Error fetching pest:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching pest',
      error: error.message
    });
  }
};

// @desc    Create a pest
// @route   POST /api/pests
// @access  Private/Admin
exports.createPest = async (req, res) => {
  try {
    const pest = await Pest.create(req.body);
    
    // If the pest affects specific crops, update those crop documents
    if (req.body.affectedCrops && req.body.affectedCrops.length > 0) {
      await Crop.updateMany(
        { _id: { $in: req.body.affectedCrops } },
        { $addToSet: { commonPests: pest._id } }
      );
    }
    
    res.status(201).json({
      success: true,
      data: pest
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error creating pest',
      error: error.message
    });
  }
};

// @desc    Update a pest
// @route   PUT /api/pests/:id
// @access  Private/Admin
exports.updatePest = async (req, res) => {
  try {
    const pest = await Pest.findById(req.params.id);
    
    if (!pest) {
      return res.status(404).json({
        success: false,
        message: 'Pest not found'
      });
    }
    
    // If affected crops have changed, update crop documents
    if (req.body.affectedCrops) {
      // Remove this pest from crops that are no longer affected
      const removedCrops = pest.affectedCrops.filter(
        cropId => !req.body.affectedCrops.includes(cropId.toString())
      );
      
      if (removedCrops.length > 0) {
        await Crop.updateMany(
          { _id: { $in: removedCrops } },
          { $pull: { commonPests: pest._id } }
        );
      }
      
      // Add this pest to newly affected crops
      const addedCrops = req.body.affectedCrops.filter(
        cropId => !pest.affectedCrops.map(id => id.toString()).includes(cropId)
      );
      
      if (addedCrops.length > 0) {
        await Crop.updateMany(
          { _id: { $in: addedCrops } },
          { $addToSet: { commonPests: pest._id } }
        );
      }
    }
    
    // Update the pest document
    const updatedPest = await Pest.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    );
    
    res.status(200).json({
      success: true,
      data: updatedPest
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error updating pest',
      error: error.message
    });
  }
};

// @desc    Delete a pest
// @route   DELETE /api/pests/:id
// @access  Private/Admin
exports.deletePest = async (req, res) => {
  try {
    const pest = await Pest.findById(req.params.id);
    
    if (!pest) {
      return res.status(404).json({
        success: false,
        message: 'Pest not found'
      });
    }
    
    // Remove this pest from all crops' commonPests arrays
    if (pest.affectedCrops && pest.affectedCrops.length > 0) {
      await Crop.updateMany(
        { _id: { $in: pest.affectedCrops } },
        { $pull: { commonPests: pest._id } }
      );
    }
    
    await pest.deleteOne();
    
    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting pest',
      error: error.message
    });
  }
};

// @desc    Get pests affecting a specific crop
// @route   GET /api/pests/crop/:cropId
// @access  Private
exports.getPestsByCrop = async (req, res) => {
  try {
    const crop = await Crop.findById(req.params.cropId);
    
    if (!crop) {
      return res.status(404).json({
        success: false,
        message: 'Crop not found'
      });
    }
    
    const pests = await Pest.find({ affectedCrops: req.params.cropId });
    
    res.status(200).json({
      success: true,
      count: pests.length,
      data: pests
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching pests for crop',
      error: error.message
    });
  }
};

// @desc    Get treatment recommendations for a pest
// @route   GET /api/pests/:id/treatments
// @access  Private
exports.getTreatmentRecommendations = async (req, res) => {
  try {
    const pest = await Pest.findById(req.params.id);
    
    if (!pest) {
      return res.status(404).json({
        success: false,
        message: 'Pest not found'
      });
    }
    
    // If pest has treatments defined, return them
    if (pest.treatments && pest.treatments.length > 0) {
      return res.status(200).json({
        success: true,
        data: pest.treatments
      });
    }
    
    // If no specific treatments are defined, provide general recommendations
    // based on pest type/severity
    const generalRecommendations = [
      {
        method: "Biological Control",
        description: `Introduction of natural enemies like predators, parasites, or pathogens to control ${pest.name}.`,
        effectiveness: "Medium to High",
        applicationMethod: "Release natural enemies in affected areas.",
        precautions: "Ensure compatibility with existing ecosystem."
      },
      {
        method: "Cultural Control",
        description: "Modification of farming practices to reduce pest populations.",
        effectiveness: "Medium",
        applicationMethod: "Crop rotation, sanitation, timing of planting.",
        precautions: "Requires planning and consistent implementation."
      },
      {
        method: "Chemical Control",
        description: "Use of appropriate pesticides as a last resort.",
        effectiveness: "High",
        applicationMethod: "Follow product instructions for mixing and application rates.",
        precautions: "Use protective equipment. Apply when beneficial insects are less active."
      }
    ];
    
    // For high severity pests, suggest more intensive measures
    if (pest.severity === 'high') {
      generalRecommendations.push({
        method: "Integrated Pest Management",
        description: "Comprehensive approach combining multiple control strategies.",
        effectiveness: "Very High",
        applicationMethod: "Systematic implementation of multiple control methods.",
        precautions: "Requires expert guidance and regular monitoring."
      });
    }
    
    res.status(200).json({
      success: true,
      note: "Pest does not have specific treatments defined. Providing general recommendations.",
      data: generalRecommendations
    });
  } catch (error) {
    console.error('Error fetching treatment recommendations:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching treatment recommendations',
      error: error.message
    });
  }
};

// @desc    Process image upload and identify pest
// @route   POST /api/pests/identify
// @access  Private
exports.identifyPest = async (req, res) => {
  try {
    // Handle the file upload with multer middleware
    upload.single('image')(req, res, async (err) => {
      if (err) {
        return res.status(400).json({
          success: false,
          message: err.message
        });
      }

      // If no file was uploaded
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'Please upload an image'
        });
      }

      // The file has been uploaded successfully
      const uploadedFilePath = req.file.path;
      const imageUrl = `/uploads/pests/${req.file.filename}`;

      // In a real-world scenario, you would now send this image to an AI/ML service
      // for pest identification. Here we'll simulate a response based on some basic criteria.
      
      // For demonstration purposes, we'll search for pests that affect the crop
      // specified in the request (if any)
      const { cropName, cropId } = req.body;
      
      let matchedPests = [];
      
      if (cropId) {
        // Find pests that affect this specific crop
        matchedPests = await Pest.find({ affectedCrops: cropId })
          .select('name description symptoms controlMethods image');
      } else if (cropName) {
        // Find the crop by name first
        const crop = await Crop.findOne({ 
          name: { $regex: new RegExp(cropName, 'i') } 
        });
        
        if (crop) {
          // Then find pests that affect this crop
          matchedPests = await Pest.find({ affectedCrops: crop._id })
            .select('name description symptoms controlMethods image');
        }
      }
      
      // If no specific crop is provided or no pests found for that crop,
      // return a selection of common pests
      if (matchedPests.length === 0) {
        matchedPests = await Pest.find()
          .select('name description symptoms controlMethods image')
          .limit(5);
      }
      
      res.status(200).json({
        success: true,
        message: 'Image uploaded successfully. Here are potential pest matches.',
        imageUrl,
        possiblePests: matchedPests,
        note: 'In a production environment, this would use an AI model for more accurate identification.'
      });
    });
  } catch (error) {
    console.error('Error in pest identification:', error);
    res.status(500).json({
      success: false,
      message: 'Error processing pest identification',
      error: error.message
    });
  }
};