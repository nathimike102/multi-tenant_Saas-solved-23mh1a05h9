// Tenant Service
const tenantRepository = require('../repositories/tenant.repository');
const userRepository = require('../repositories/user.repository');
const projectRepository = require('../repositories/project.repository');
const taskRepository = require('../repositories/task.repository');

class TenantService {
  /**
   * Get tenant details with statistics
   */
  async getTenantDetails(tenantId) {
    const tenant = await tenantRepository.findById(tenantId);

    if (!tenant) {
      throw new Error('TENANT_NOT_FOUND', { statusCode: 404 });
    }

    const stats = await tenantRepository.findWithStats(tenantId);

    return {
      ...tenant,
      stats,
    };
  }

  /**
   * Update tenant information
   */
  async updateTenant(tenantId, data) {
    const tenant = await tenantRepository.findById(tenantId);

    if (!tenant) {
      throw new Error('TENANT_NOT_FOUND', { statusCode: 404 });
    }

    // Check if new subdomain is unique (if provided)
    if (data.subdomain && data.subdomain !== tenant.subdomain) {
      const existing = await tenantRepository.findBySubdomain(data.subdomain);
      if (existing) {
        throw new Error('SUBDOMAIN_EXISTS', { statusCode: 409 });
      }
    }

    const updateData = {};
    if (data.name !== undefined) updateData.name = data.name;
    if (data.subdomain !== undefined) updateData.subdomain = data.subdomain;
    if (data.status !== undefined) updateData.status = data.status;
    if (data.subscriptionPlan !== undefined) updateData.subscriptionPlan = data.subscriptionPlan;
    if (data.maxUsers !== undefined) updateData.maxUsers = data.maxUsers;
    if (data.maxProjects !== undefined) updateData.maxProjects = data.maxProjects;

    const updated = await tenantRepository.update(tenantId, updateData);

    return {
      id: updated.id,
      name: updated.name,
      subdomain: updated.subdomain,
      status: updated.status,
      subscriptionPlan: updated.subscriptionPlan,
      maxUsers: updated.maxUsers,
      maxProjects: updated.maxProjects,
    };
  }

  /**
   * List all tenants with pagination
   */
  async listAllTenants(page = 1, limit = 50, filters = {}) {
    const list = await tenantRepository.listAll(page, limit, filters);

    return {
      tenants: list.tenants.map((t) => ({
        id: t.id,
        name: t.name,
        subdomain: t.subdomain,
        status: t.status,
        subscriptionPlan: t.subscriptionPlan,
        maxUsers: t.maxUsers,
        maxProjects: t.maxProjects,
      })),
      pagination: list.pagination,
      total: list.total,
    };
  }
}

module.exports = new TenantService();
