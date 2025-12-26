// Express Application Setup
const express = require('express');
const cors = require('cors');
const logger = require('./utils/logger');

// Middleware imports
const { errorHandler, notFound } = require('./middleware/errorHandler');

// Routes import
const apiRoutes = require('./routes');

// Initialize express app
const app = express();

// Middleware setup
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
  logger.info(
    {
      method: req.method,
      url: req.url,
      ip: req.ip,
    },
    'Incoming request'
  );
  next();
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API routes
app.use('/api', apiRoutes);

// 404 handler
app.use(notFound);

// Error handling middleware (must be last)
app.use(errorHandler);

module.exports = app;
