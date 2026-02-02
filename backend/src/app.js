// Express Application Setup
const express = require('express');
const cors = require('cors');
const logger = require('./utils/logger');
const db = require('./config/database');

// Middleware imports
const { errorHandler, notFound } = require('./middleware/errorHandler');

// Routes import
const apiRoutes = require('./routes');

// Initialize express app
const app = express();

// Middleware setup - CORS with environment variable
const corsOrigin = process.env.CORS_ORIGIN 
  ? process.env.CORS_ORIGIN.split(',').map(origin => origin.trim())
  : (process.env.FRONTEND_URL || ['http://localhost:3000', 'http://localhost:5173']);

const corsOptions = {
  origin: corsOrigin,
  credentials: true,
};

app.use(cors(corsOptions));
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

// Health check endpoint with database status
app.get('/api/health', async (req, res) => {
  try {
    // Test database connection
    await db.prisma.$queryRaw`SELECT 1`;
    res.json({ status: 'ok', database: 'connected', timestamp: new Date().toISOString() });
  } catch (error) {
    logger.error('Health check failed', error);
    res.status(503).json({ status: 'error', database: 'disconnected', timestamp: new Date().toISOString() });
  }
});

// Legacy health endpoint for compatibility
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Root endpoint - API information
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Nathi Multi-Tenant SaaS API',
    version: '1.0.0',
    status: 'online',
    endpoints: {
      health: '/api/health',
      auth: {
        login: 'POST /api/auth/login',
        register: 'POST /api/auth/register',
        refresh: 'POST /api/auth/refresh'
      },
      tenants: 'GET /api/tenants (super_admin only)',
      projects: 'GET /api/projects',
      tasks: 'GET /api/tasks',
      users: 'GET /api/users'
    },
    documentation: 'https://github.com/your-repo/docs'
  });
});

// API routes
app.use('/api', apiRoutes);

// 404 handler
app.use(notFound);

// Error handling middleware (must be last)
app.use(errorHandler);

module.exports = app;
