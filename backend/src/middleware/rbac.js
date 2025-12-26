// RBAC (Role-Based Access Control) Middleware
const { sendError } = require('../utils/response');

/**
 * Check if user has required role(s)
 */
const requireRole = (allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return sendError(res, 'Authentication required', 401);
    }

    if (!allowedRoles.includes(req.user.role)) {
      return sendError(res, 'You do not have permission to access this resource', 403);
    }

    next();
  };
};

/**
 * Check if user belongs to the specified tenant
 */
const requireTenant = (req, res, next) => {
  if (!req.user) {
    return sendError(res, 'Authentication required', 401);
  }

  // Super admins can access any tenant
  if (req.user.role === 'super_admin') {
    return next();
  }

  // Extract tenantId from params, body, or query
  const tenantId = req.params.tenantId || req.body?.tenantId || req.query?.tenantId;

  // Check if user's tenant matches requested tenant
  if (req.user.tenantId !== tenantId) {
    return sendError(res, 'You do not have access to this tenant', 403);
  }

  next();
};

/**
 * Super admin only
 */
const requireSuperAdmin = (req, res, next) => {
  return requireRole(['super_admin'])(req, res, next);
};

/**
 * Tenant admin or super admin
 */
const requireTenantAdmin = (req, res, next) => {
  return requireRole(['tenant_admin', 'super_admin'])(req, res, next);
};

module.exports = {
  requireRole,
  requireTenant,
  requireSuperAdmin,
  requireTenantAdmin,
};
