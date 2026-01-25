require('dotenv').config({ override: true });
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');

const authRoutes = require('./routes/auth');
const livestockRoutes = require('./routes/livestock');
const healthRoutes = require('./routes/health');
const testimonialRoutes = require('./routes/testimonial');

const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/livestock', livestockRoutes);
app.use('/api/testimonials', testimonialRoutes);
app.use('/api', healthRoutes);

// Health check
app.get('/api/status', (req, res) => {
  res.json({ status: 'Livestock Marketplace API is running 🐄', timestamp: new Date() });
});

// Error Handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
