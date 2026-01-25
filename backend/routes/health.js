const express = require('express');
const router = express.Router();
const { updateHealthScore, syncHealthScore } = require('../controllers/healthController');

// Future AI mobile app integration endpoint
// PATCH /api/livestock/:animalId/healthscore
router.patch('/livestock/:animalId/healthscore', updateHealthScore);

// Mobile App AI Sync endpoint
// POST /api/health/update
router.post('/health/update', syncHealthScore);

module.exports = router;
