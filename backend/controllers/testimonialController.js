const Testimonial = require('../models/Testimonial');

// @desc    Get all testimonials
// @route   GET /api/testimonials
// @access  Public
const getTestimonials = async (req, res, next) => {
  try {
    const testimonials = await Testimonial.find({ isActive: true }).sort({ createdAt: -1 });
    res.json({ success: true, data: testimonials });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a testimonial
// @route   POST /api/testimonials
// @access  Private (Admin) - Placeholder for now
const createTestimonial = async (req, res, next) => {
  try {
    // Force active for now so user sees their work
    const testimonialData = {
      ...req.body,
      isActive: true,
      avatar: req.body.name ? req.body.name[0].toUpperCase() : 'U'
    };
    const testimonial = await Testimonial.create(testimonialData);
    res.status(201).json({ success: true, data: testimonial });
  } catch (error) {
    next(error);
  }
};

module.exports = { getTestimonials, createTestimonial };
