// Project Service
const projectRepository = require('../repositories/project.repository');
const tenantRepository = require('../repositories/tenant.repository');
const auditService = require('./audit.service');

class ProjectService {
  /**
   * Create new project
   */
  async createProject(tenantId, data, userId) {
    const { name, description } = data;

    // Check tenant exists and has project capacity
    const tenant = await tenantRepository.findById(tenantId);
    if (!tenant) {
      throw new Error('TENANT_NOT_FOUND', { statusCode: 404 });
    }

    const projectCount = await projectRepository.countByTenant(tenantId);
    if (projectCount >= tenant.maxProjects) {
      throw new Error('TENANT_PROJECT_LIMIT_EXCEEDED', { statusCode: 409 });
    }

    const newProject = await projectRepository.create(tenantId, {
      name,
      description: description || null,
      status: 'active',
      createdBy: userId,
    });

    // Audit log
    await auditService.logAction(tenantId, userId, 'CREATE_PROJECT', 'project', newProject.id);

    return {
      id: newProject.id,
      name: newProject.name,
      description: newProject.description,
      status: newProject.status,
      createdBy: newProject.createdBy,
      createdAt: newProject.createdAt,
    };
  }

  /**
   * List projects in tenant
   */
  async listProjects(tenantId, page = 1, limit = 50, filters = {}) {
    const result = await projectRepository.listByTenant(tenantId, page, limit, filters);

    return {
      projects: result.projects.map((p) => ({
        id: p.id,
        name: p.name,
        description: p.description,
        status: p.status,
        taskCount: p._count?.tasks || 0,
        createdAt: p.createdAt,
      })),
      pagination: result.pagination,
      total: result.total,
    };
  }

  /**
   * Update project
   */
  async updateProject(tenantId, projectId, data, userId) {
    const project = await projectRepository.findByIdWithTenant(projectId, tenantId);

    if (!project) {
      throw new Error('PROJECT_NOT_FOUND', { statusCode: 404 });
    }

    const updateData = {};
    if (data.name !== undefined) updateData.name = data.name;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.status !== undefined) updateData.status = data.status;

    const updated = await projectRepository.update(projectId, updateData);

    // Audit log
    await auditService.logAction(tenantId, userId, 'UPDATE_PROJECT', 'project', projectId);

    return {
      id: updated.id,
      name: updated.name,
      description: updated.description,
      status: updated.status,
      createdAt: updated.createdAt,
    };
  }

  /**
   * Delete project
   */
  async deleteProject(tenantId, projectId, userId) {
    const project = await projectRepository.findByIdWithTenant(projectId, tenantId);

    if (!project) {
      throw new Error('PROJECT_NOT_FOUND', { statusCode: 404 });
    }

    await projectRepository.delete(projectId);

    // Audit log
    await auditService.logAction(tenantId, userId, 'DELETE_PROJECT', 'project', projectId);

    return { success: true };
  }
}

module.exports = new ProjectService();
