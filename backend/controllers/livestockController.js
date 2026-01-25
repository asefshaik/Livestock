const Livestock = require('../models/Livestock');

// @desc    Create livestock listing
// @route   POST /api/livestock
// @access  Private (Farmer)
const createLivestock = async (req, res, next) => {
  try {
    const { animalType, breed, age, weight, price, description, location } = req.body;

    const images = req.files ? req.files.map(file => file.path) : [];

    const livestock = await Livestock.create({
      farmerId: req.user._id,
      animalType,
      breed,
      age: Number(age),
      weight: Number(weight),
      price: Number(price),
      description,
      location,
      images,
    });

    await livestock.populate('farmerId', 'name email location phone profileImage');

    res.status(201).json({ success: true, data: livestock });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all livestock
// @route   GET /api/livestock
// @access  Public
const getAllLivestock = async (req, res, next) => {
  try {
    const { animalType, location, minPrice, maxPrice, healthStatus, sort, page = 1, limit = 12 } = req.query;

    const query = { isActive: true };

    if (animalType) query.animalType = animalType;
    if (location) query.location = { $regex: location, $options: 'i' };
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }
    if (healthStatus) query.healthStatus = healthStatus;

    let sortOption = { createdAt: -1 };
    if (sort === 'price_asc') sortOption = { price: 1 };
    else if (sort === 'price_desc') sortOption = { price: -1 };
    else if (sort === 'health_score') sortOption = { healthScore: -1 };

    const skip = (Number(page) - 1) * Number(limit);
    const total = await Livestock.countDocuments(query);
    const livestock = await Livestock.find(query)
      .populate('farmerId', 'name email location phone profileImage')
      .sort(sortOption)
      .skip(skip)
      .limit(Number(limit));

    res.json({
      success: true,
      data: livestock,
      pagination: {
        total,
        page: Number(page),
        pages: Math.ceil(total / Number(limit)),
        limit: Number(limit),
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single livestock
// @route   GET /api/livestock/:id
// @access  Public
const getLivestock = async (req, res, next) => {
  try {
    const livestock = await Livestock.findById(req.params.id)
      .populate('farmerId', 'name email location phone profileImage');

    if (!livestock) {
      return res.status(404).json({ success: false, message: 'Livestock not found' });
    }

    res.json({ success: true, data: livestock });
  } catch (error) {
    next(error);
  }
};

// @desc    Update livestock
// @route   PUT /api/livestock/:id
// @access  Private (Farmer - owner)
const updateLivestock = async (req, res, next) => {
  try {
    const livestock = await Livestock.findById(req.params.id);

    if (!livestock) {
      return res.status(404).json({ success: false, message: 'Livestock not found' });
    }

    // Check ownership
    if (livestock.farmerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to update this listing' });
    }

    // Prevent changing farmerId or animalId
    const { farmerId, animalId, ...updateData } = req.body;

    const newImages = req.files ? req.files.map(file => file.path) : [];
    
    // Apply updates
    Object.keys(updateData).forEach(key => {
      livestock[key] = updateData[key];
    });

    if (newImages.length > 0) {
      livestock.images = [...(livestock.images || []), ...newImages];
    }

    await livestock.save();
    await livestock.populate('farmerId', 'name email location phone profileImage');

    res.json({ success: true, data: livestock });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete livestock
// @route   DELETE /api/livestock/:id
// @access  Private (Farmer - owner)
const deleteLivestock = async (req, res, next) => {
  try {
    const livestock = await Livestock.findById(req.params.id);

    if (!livestock) {
      return res.status(404).json({ success: false, message: 'Livestock not found' });
    }

    if (livestock.farmerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this listing' });
    }

    await Livestock.findByIdAndDelete(req.params.id);

    res.json({ success: true, message: 'Livestock listing deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// @desc    Get farmer's listings
// @route   GET /api/farmer/livestock
// @access  Private (Farmer)
const getFarmerLivestock = async (req, res, next) => {
  try {
    const livestock = await Livestock.find({ farmerId: req.user._id })
      .sort({ createdAt: -1 });

    const stats = {
      total: livestock.length,
      verified: livestock.filter(l => l.isHealthVerified).length,
      avgHealthScore: livestock.filter(l => l.healthScore !== null).length > 0
        ? Math.round(livestock.filter(l => l.healthScore !== null).reduce((sum, l) => sum + l.healthScore, 0) / livestock.filter(l => l.healthScore !== null).length)
        : null,
    };

    res.json({ success: true, data: livestock, stats });
  } catch (error) {
    next(error);
  }
};

module.exports = { createLivestock, getAllLivestock, getLivestock, updateLivestock, deleteLivestock, getFarmerLivestock };
