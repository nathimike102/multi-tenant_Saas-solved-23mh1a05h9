// Authentication Middleware
const { PrismaClient } = require('@prisma/client');
const { extractToken, verifyToken } = require('../utils/jwt');
const { sendError } = require('../utils/response');
const logger = require('../utils/logger');

const prisma = new PrismaClient();

/**
 * Authenticate JWT token and attach user to request
 */
const authenticate = async (req, res, next) => {
  try {
    // Extract token from Authorization header
    const token = extractToken(req.headers.authorization);

    if (!token) {
      return sendError(res, 'Missing or invalid authorization token', 401);
    }

    // Verify token
    const decoded = verifyToken(token);

    // Fetch user from database
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      include: { tenant: true },
    });

    if (!user) {
      return sendError(res, 'User not found', 401);
    }

    if (!user.isActive) {
      return sendError(res, 'User account is inactive', 403);
    }

    // Attach user to request
    req.user = {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
      tenantId: user.tenantId,
      isActive: user.isActive,
      tenant: user.tenant,
    };

    next();
  } catch (error) {
    logger.error({ error }, 'Authentication error');
    return sendError(res, 'Invalid or expired token', 401);
  }
};

/**
 * Optional authentication - doesn't fail if token missing
 */
const authenticateOptional = async (req, res, next) => {
  try {
    const token = extractToken(req.headers.authorization);

    if (!token) {
      return next();
    }

    const decoded = verifyToken(token);
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      include: { tenant: true },
    });

    if (user && user.isActive) {
      req.user = {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        tenantId: user.tenantId,
        isActive: user.isActive,
        tenant: user.tenant,
      };
    }

    next();
  } catch (error) {
    // Continue without user if auth fails
    next();
  }
};

module.exports = {
  authenticate,
  authenticateOptional,
};
