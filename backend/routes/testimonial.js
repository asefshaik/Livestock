const express = require('express');
const router = express.Router();
const { getTestimonials, createTestimonial } = require('../controllers/testimonialController');
const { protect, requireRole } = require('../middleware/auth');

router.get('/', getTestimonials);

// Open to any authenticated user for now
router.post('/', protect, createTestimonial);

module.exports = router;
