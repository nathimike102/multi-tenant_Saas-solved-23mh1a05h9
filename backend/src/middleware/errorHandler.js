// Error Handling Middleware
const { sendError } = require('../utils/response');
const logger = require('../utils/logger');

/**
 * Global error handler middleware
 */
const errorHandler = (err, req, res, next) => {
  logger.error({ error: err, path: req.path, method: req.method }, 'Unhandled error');

  // Prisma errors
  if (err.name === 'PrismaClientKnownRequestError') {
    if (err.code === 'P2002') {
      return sendError(res, 'This resource already exists', 409);
    }
    if (err.code === 'P2025') {
      return sendError(res, 'Resource not found', 404);
    }
  }

  // Validation errors
  if (err.name === 'ValidationError') {
    return sendError(res, err.message, 400);
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return sendError(res, 'Invalid token', 401);
  }

  if (err.name === 'TokenExpiredError') {
    return sendError(res, 'Token expired', 401);
  }

  // Default error
  return sendError(res, err.message || 'Internal server error', err.statusCode || 500);
};

/**
 * Not found handler
 */
const notFound = (req, res) => {
  return sendError(res, `Route ${req.path} not found`, 404);
};

module.exports = {
  errorHandler,
  notFound,
};
