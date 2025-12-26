// Authentication Controller
const authService = require('../services/auth.service');
const { sendSuccess, sendError } = require('../utils/response');

class AuthController {
  /**
   * Register Tenant
   * POST /api/auth/register-tenant
   */
  static async registerTenant(req, res, next) {
    try {
      const result = await authService.registerTenant(req.body);
      sendSuccess(res, result, 'Tenant registered successfully', 201);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Login
   * POST /api/auth/login
   */
  static async login(req, res, next) {
    try {
      const result = await authService.login(req.body.email, req.body.password);
      sendSuccess(res, result, 'Login successful', 200);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get Current User
   * GET /api/auth/me
   */
  static async getCurrentUser(req, res, next) {
    try {
      const result = await authService.getCurrentUser(req.user.userId);
      sendSuccess(res, result, 'User retrieved successfully', 200);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Logout
   * POST /api/auth/logout
   */
  static async logout(req, res, next) {
    try {
      const result = await authService.logout(req.user.userId);
      sendSuccess(res, result, 'Logout successful', 200);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = AuthController;
