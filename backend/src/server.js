// Server Startup
require('dotenv').config();
const app = require('./app');
const logger = require('./utils/logger');
const db = require('./config/database');

const PORT = process.env.PORT || 5000;
const NODE_ENV = process.env.NODE_ENV || 'development';

// Server instance
let server;

// Start server
async function startServer() {
  try {
    // Test database connection
    await db.prisma.$connect();
    logger.info('Database connected successfully');

    // Start HTTP server
    server = app.listen(PORT, () => {
      logger.info({ port: PORT, env: NODE_ENV }, 'Server started');
    });
  } catch (error) {
    logger.error({ error }, 'Failed to start server');
    process.exit(1);
  }
}

// Graceful shutdown
async function shutdown() {
  logger.info('Starting graceful shutdown...');

  if (server) {
    server.close(async () => {
      await db.prisma.$disconnect();
      logger.info('Server shutdown complete');
      process.exit(0);
    });
  }
}

// Handle process signals
process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

// Unhandled exceptions
process.on('uncaughtException', (error) => {
  logger.error({ error }, 'Uncaught exception');
  shutdown();
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error({ reason, promise }, 'Unhandled rejection');
  shutdown();
});

// Start the server
startServer();
