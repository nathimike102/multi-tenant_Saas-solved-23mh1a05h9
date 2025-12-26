// User Controller
const userService = require('../services/user.service');
const { sendSuccess, sendError } = require('../utils/response');

class UserController {
  /**
   * Add User
   * POST /api/tenants/:tenantId/users
   */
  static async addUser(req, res, next) {
    try {
      const result = await userService.addUser(req.params.tenantId, req.body);
      sendSuccess(res, result, 'User added successfully', 201);
    } catch (error) {
      next(error);
    }
  }

  /**
   * List Users
   * GET /api/tenants/:tenantId/users
   */
  static async listUsers(req, res, next) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 50;
      const filters = {
        role: req.query.role,
        isActive: req.query.isActive,
        search: req.query.search,
      };
      const result = await userService.listUsers(req.params.tenantId, page, limit, filters);
      sendSuccess(res, result, 'Users retrieved successfully', 200);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update User
   * PUT /api/tenants/:tenantId/users/:userId
   */
  static async updateUser(req, res, next) {
    try {
      const result = await userService.updateUser(req.params.tenantId, req.params.userId, req.body);
      sendSuccess(res, result, 'User updated successfully', 200);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete User
   * DELETE /api/tenants/:tenantId/users/:userId
   */
  static async deleteUser(req, res, next) {
    try {
      const result = await userService.deleteUser(req.params.tenantId, req.params.userId);
      sendSuccess(res, result, 'User deleted successfully', 200);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = UserController;
