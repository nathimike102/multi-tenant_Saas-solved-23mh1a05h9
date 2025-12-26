// Tenant Controller
const tenantService = require('../services/tenant.service');
const { sendSuccess, sendError } = require('../utils/response');

class TenantController {
  /**
   * Get Tenant Details
   * GET /api/tenants/:tenantId
   */
  static async getTenantDetails(req, res, next) {
    try {
      const result = await tenantService.getTenantDetails(req.params.tenantId);
      sendSuccess(res, result, 'Tenant details retrieved successfully', 200);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update Tenant
   * PUT /api/tenants/:tenantId
   */
  static async updateTenant(req, res, next) {
    try {
      const result = await tenantService.updateTenant(req.params.tenantId, req.body);
      sendSuccess(res, result, 'Tenant updated successfully', 200);
    } catch (error) {
      next(error);
    }
  }

  /**
   * List All Tenants
   * GET /api/tenants
   */
  static async listAllTenants(req, res, next) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 50;
      const filters = {
        status: req.query.status,
        subscriptionPlan: req.query.subscriptionPlan,
      };
      const result = await tenantService.listAllTenants(page, limit, filters);
      sendSuccess(res, result, 'Tenants retrieved successfully', 200);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = TenantController;
