const mongoose = require('mongoose');
const Livestock = require('../models/Livestock');

// @desc    Update health score (future AI integration endpoint)
// @route   PATCH /api/livestock/:animalId/healthscore
// @access  Private (will be called by mobile AI app with API key)
const updateHealthScore = async (req, res, next) => {
  try {
    const { animalId } = req.params;
    const { healthScore } = req.body;

    if (healthScore === undefined || healthScore === null) {
      return res.status(400).json({ success: false, message: 'healthScore is required' });
    }

    if (healthScore < 0 || healthScore > 100) {
      return res.status(400).json({ success: false, message: 'healthScore must be between 0 and 100' });
    }

    const livestock = await Livestock.findOne({ animalId });
    if (!livestock) {
      return res.status(404).json({ success: false, message: 'Livestock not found with provided animalId' });
    }

    livestock.healthScore = healthScore;
    // Pre-save hook will compute healthStatus and isHealthVerified
    await livestock.save();

    res.json({
      success: true,
      message: 'Health score updated successfully',
      data: {
        animalId: livestock.animalId,
        healthScore: livestock.healthScore,
        healthStatus: livestock.healthStatus,
        isHealthVerified: livestock.isHealthVerified,
      },
    });
  } catch (error) {
    next(error);
  }
};

const syncHealthScore = async (req, res, next) => {
  try {
    const { livestockId, healthScore, status } = req.body;

    if (!livestockId || healthScore === undefined || !status) {
      return res.status(400).json({ success: false, message: 'livestockId, healthScore, and status are required' });
    }

    const query = mongoose.Types.ObjectId.isValid(livestockId)
      ? { $or: [{ _id: livestockId }, { animalId: livestockId }] }
      : { animalId: livestockId };

    const livestock = await Livestock.findOne(query);
    if (!livestock) {
      return res.status(404).json({ success: false, message: 'Livestock not found with provided ID' });
    }

    livestock.healthScore = healthScore;
    livestock.healthStatus = status;
    livestock.isHealthVerified = true;
    
    await livestock.save();

    res.json({
      success: true,
      message: 'Health status synced successfully',
      data: livestock
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { updateHealthScore, syncHealthScore };
