const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');

// Mock expert controller functions
// In a production environment, you would replace these with actual controller functions
const expertController = {
  getAllExperts: (req, res) => {
    // Sample data
    const experts = [
      {
        _id: "e1001",
        name: "Dr. Sarah Johnson",
        specialty: "Crop Disease",
        qualification: "PhD in Plant Pathology",
        experience: 12,
        rating: 4.9,
        imageUrl: "https://randomuser.me/api/portraits/women/22.jpg",
        availableSlots: 5,
        consultationFee: 60
      },
      {
        _id: "e1002",
        name: "Prof. Michael Chen",
        specialty: "Soil Science",
        qualification: "PhD in Soil Chemistry",
        experience: 15,
        rating: 4.8,
        imageUrl: "https://randomuser.me/api/portraits/men/32.jpg",
        availableSlots: 3,
        consultationFee: 70
      },
      {
        _id: "e1003",
        name: "Dr. Emily Rodriguez",
        specialty: "Sustainable Farming",
        qualification: "PhD in Agricultural Sciences",
        experience: 8,
        rating: 4.7,
        imageUrl: "https://randomuser.me/api/portraits/women/45.jpg",
        availableSlots: 7,
        consultationFee: 55
      },
      {
        _id: "e1004",
        name: "Dr. Robert Williams",
        specialty: "Pest Management",
        qualification: "PhD in Entomology",
        experience: 10,
        rating: 4.6,
        imageUrl: "https://randomuser.me/api/portraits/men/67.jpg",
        availableSlots: 4,
        consultationFee: 65
      }
    ];

    // Apply filters if provided in query params
    let filteredExperts = [...experts];
    
    if (req.query.specialty) {
      filteredExperts = filteredExperts.filter(expert => 
        expert.specialty.toLowerCase().includes(req.query.specialty.toLowerCase())
      );
    }
    
    if (req.query.minRating) {
      filteredExperts = filteredExperts.filter(expert => 
        expert.rating >= parseFloat(req.query.minRating)
      );
    }
    
    res.status(200).json({
      success: true,
      count: filteredExperts.length,
      data: filteredExperts
    });
  },

  getExpertById: (req, res) => {
    const expertId = req.params.id;
    
    // Sample data - in a real app this would be fetched from the database
    const expertDetails = {
      _id: expertId,
      name: "Dr. Sarah Johnson",
      specialty: "Crop Disease",
      qualification: "PhD in Plant Pathology",
      experience: 12,
      bio: "Specializing in the diagnosis and treatment of plant diseases across a wide variety of crops. Experienced in developing integrated disease management strategies specific to local environmental conditions.",
      rating: 4.9,
      imageUrl: "https://randomuser.me/api/portraits/women/22.jpg",
      specialties: ["Fungal Diseases", "Bacterial Infections", "Viral Plant Diseases"],
      languages: ["English", "Spanish"],
      availability: [
        { day: "Monday", slots: ["10:00 AM - 11:00 AM", "2:00 PM - 3:00 PM"] },
        { day: "Wednesday", slots: ["9:00 AM - 10:00 AM", "1:00 PM - 2:00 PM"] },
        { day: "Friday", slots: ["11:00 AM - 12:00 PM", "4:00 PM - 5:00 PM"] }
      ],
      consultationFee: 60,
      reviews: [
        {
          user: "John D.",
          rating: 5,
          comment: "Dr. Johnson helped me identify and treat a complex fungal infection in my wheat crop. Excellent advice!",
          date: "2025-03-15"
        },
        {
          user: "Maria S.",
          rating: 4.5,
          comment: "Comprehensive guidance on treating tomato blight. Very knowledgeable and practical recommendations.",
          date: "2025-02-28"
        }
      ]
    };

    if (expertId) {
      res.status(200).json({
        success: true,
        data: expertDetails
      });
    } else {
      res.status(404).json({
        success: false,
        message: 'Expert not found'
      });
    }
  },

  requestConsultation: (req, res) => {
    const { expertId, scheduledDate, scheduledTime, description, preferredContactMethod } = req.body;
    
    // In a real app, this would save the consultation request to the database
    
    // Mock response
    res.status(201).json({
      success: true,
      data: {
        consultationId: "c" + Date.now(),
        expertId,
        farmer: req.user._id,
        scheduledDate,
        scheduledTime,
        status: "pending",
        description,
        preferredContactMethod,
        createdAt: new Date().toISOString()
      },
      message: "Consultation request submitted successfully"
    });
  },

  getUserConsultations: (req, res) => {
    const status = req.query.status || 'all';
    
    // Sample data - in a real app this would be fetched from the database
    const consultations = [
      {
        _id: "c1001",
        expert: {
          _id: "e1001",
          name: "Dr. Sarah Johnson",
          specialty: "Crop Disease",
          imageUrl: "https://randomuser.me/api/portraits/women/22.jpg"
        },
        scheduledDate: "2025-05-01",
        scheduledTime: "10:00 AM - 11:00 AM",
        status: "confirmed",
        description: "Issues with wheat rust disease in north field",
        createdAt: "2025-04-22T14:32:10.555Z"
      },
      {
        _id: "c1002",
        expert: {
          _id: "e1003",
          name: "Dr. Emily Rodriguez",
          specialty: "Sustainable Farming",
          imageUrl: "https://randomuser.me/api/portraits/women/45.jpg"
        },
        scheduledDate: "2025-05-03",
        scheduledTime: "2:00 PM - 3:00 PM",
        status: "pending",
        description: "Planning to transition to organic farming methods",
        createdAt: "2025-04-23T09:15:43.123Z"
      }
    ];
    
    let filteredConsultations = consultations;
    
    if (status !== 'all') {
      filteredConsultations = consultations.filter(c => c.status === status);
    }
    
    res.status(200).json({
      success: true,
      count: filteredConsultations.length,
      data: filteredConsultations
    });
  },

  getConsultationDetails: (req, res) => {
    const consultationId = req.params.id;
    
    // Sample data
    const consultationDetails = {
      _id: consultationId,
      expert: {
        _id: "e1001",
        name: "Dr. Sarah Johnson",
        specialty: "Crop Disease",
        imageUrl: "https://randomuser.me/api/portraits/women/22.jpg",
        qualification: "PhD in Plant Pathology"
      },
      farmer: {
        _id: req.user._id,
        name: req.user.name
      },
      scheduledDate: "2025-05-01",
      scheduledTime: "10:00 AM - 11:00 AM",
      status: "confirmed",
      description: "Issues with wheat rust disease in north field",
      preferredContactMethod: "video",
      createdAt: "2025-04-22T14:32:10.555Z",
      messages: [
        {
          sender: "farmer",
          message: "I've noticed rust-like spots on my wheat crop in the northern field.",
          timestamp: "2025-04-22T14:32:10.555Z"
        },
        {
          sender: "expert",
          message: "Can you share some images of the affected plants?",
          timestamp: "2025-04-22T15:05:22.123Z"
        },
        {
          sender: "farmer",
          message: "I've uploaded the images to the consultation.",
          timestamp: "2025-04-22T15:30:45.987Z"
        },
        {
          sender: "expert",
          message: "Thank you. Based on the images, it appears to be wheat leaf rust (Puccinia triticina). I'll prepare some treatment recommendations for our scheduled consultation.",
          timestamp: "2025-04-22T16:15:10.456Z"
        }
      ],
      attachments: [
        {
          name: "infected_wheat_1.jpg",
          url: "https://example.com/uploads/infected_wheat_1.jpg",
          uploadedAt: "2025-04-22T15:30:45.987Z"
        },
        {
          name: "field_map.pdf",
          url: "https://example.com/uploads/field_map.pdf",
          uploadedAt: "2025-04-22T15:30:45.987Z"
        }
      ]
    };
    
    if (consultationId) {
      res.status(200).json({
        success: true,
        data: consultationDetails
      });
    } else {
      res.status(404).json({
        success: false,
        message: 'Consultation not found'
      });
    }
  },

  updateConsultationStatus: (req, res) => {
    const consultationId = req.params.id;
    const { status } = req.body;
    
    // Validate status
    const validStatuses = ['pending', 'confirmed', 'completed', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status value'
      });
    }
    
    // In a real app, this would update the status in the database
    
    res.status(200).json({
      success: true,
      message: `Consultation status updated to ${status}`,
      data: {
        _id: consultationId,
        status
      }
    });
  },

  sendConsultationMessage: (req, res) => {
    const consultationId = req.params.id;
    const { message } = req.body;
    
    // In a real app, this would save the message to the database
    
    const newMessage = {
      _id: "m" + Date.now(),
      sender: req.user.role === 'expert' ? 'expert' : 'farmer',
      message,
      timestamp: new Date().toISOString()
    };
    
    res.status(201).json({
      success: true,
      data: newMessage
    });
  },

  rateConsultation: (req, res) => {
    const consultationId = req.params.id;
    const { rating, review } = req.body;
    
    // Validate rating
    if (rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: 'Rating must be between 1 and 5'
      });
    }
    
    // In a real app, this would save the review to the database
    
    res.status(200).json({
      success: true,
      message: 'Consultation rated successfully',
      data: {
        consultationId,
        rating,
        review,
        submittedAt: new Date().toISOString()
      }
    });
  }
};

// Expert listing and details routes
router.get('/', protect, expertController.getAllExperts);
router.get('/:id', protect, expertController.getExpertById);

// Consultation routes
router.route('/consultation')
  .post(protect, expertController.requestConsultation)
  .get(protect, expertController.getUserConsultations);

router.route('/consultation/:id')
  .get(protect, expertController.getConsultationDetails);

router.route('/consultation/:id/status')
  .put(protect, authorize('expert', 'admin'), expertController.updateConsultationStatus);

router.route('/consultation/:id/message')
  .post(protect, expertController.sendConsultationMessage);

router.route('/consultation/:id/review')
  .post(protect, authorize('farmer'), expertController.rateConsultation);

module.exports = router;