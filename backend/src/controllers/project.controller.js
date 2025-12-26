// Project Controller
const projectService = require('../services/project.service');
const { sendSuccess, sendError } = require('../utils/response');

class ProjectController {
  /**
   * Create Project
   * POST /api/tenants/:tenantId/projects
   */
  static async createProject(req, res, next) {
    try {
      const result = await projectService.createProject(req.params.tenantId, req.body, req.user.userId);
      sendSuccess(res, result, 'Project created successfully', 201);
    } catch (error) {
      next(error);
    }
  }

  /**
   * List Projects
   * GET /api/tenants/:tenantId/projects
   */
  static async listProjects(req, res, next) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 50;
      const filters = {
        status: req.query.status,
        search: req.query.search,
      };
      const result = await projectService.listProjects(req.params.tenantId, page, limit, filters);
      sendSuccess(res, result, 'Projects retrieved successfully', 200);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update Project
   * PUT /api/tenants/:tenantId/projects/:projectId
   */
  static async updateProject(req, res, next) {
    try {
      const result = await projectService.updateProject(req.params.tenantId, req.params.projectId, req.body, req.user.userId);
      sendSuccess(res, result, 'Project updated successfully', 200);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete Project
   * DELETE /api/tenants/:tenantId/projects/:projectId
   */
  static async deleteProject(req, res, next) {
    try {
      const result = await projectService.deleteProject(req.params.tenantId, req.params.projectId, req.user.userId);
      sendSuccess(res, result, 'Project deleted successfully', 200);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = ProjectController;
