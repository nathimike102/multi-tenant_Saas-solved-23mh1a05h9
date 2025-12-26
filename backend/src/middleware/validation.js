// Validation Middleware
const { sendError } = require('../utils/response');
const { validate } = require('../utils/validation');

/**
 * Validate request body against schema
 */
const validateBody = (schema) => {
  return (req, res, next) => {
    const result = validate(schema, req.body);

    if (!result.valid) {
      return sendError(res, 'Validation error', 400, result.errors);
    }

    // Replace body with validated data
    req.body = result.data;
    next();
  };
};

/**
 * Validate request query parameters
 */
const validateQuery = (schema) => {
  return (req, res, next) => {
    const result = validate(schema, req.query);

    if (!result.valid) {
      return sendError(res, 'Invalid query parameters', 400, result.errors);
    }

    req.query = result.data;
    next();
  };
};

/**
 * Validate request params
 */
const validateParams = (schema) => {
  return (req, res, next) => {
    const result = validate(schema, req.params);

    if (!result.valid) {
      return sendError(res, 'Invalid parameters', 400, result.errors);
    }

    req.params = result.data;
    next();
  };
};

module.exports = {
  validateBody,
  validateQuery,
  validateParams,
};
