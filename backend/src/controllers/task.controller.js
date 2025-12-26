// Task Controller
const taskService = require('../services/task.service');
const { sendSuccess, sendError } = require('../utils/response');

class TaskController {
  /**
   * Create Task
   * POST /api/tenants/:tenantId/projects/:projectId/tasks
   */
  static async createTask(req, res, next) {
    try {
      const result = await taskService.createTask(req.params.tenantId, req.body, req.user.userId);
      sendSuccess(res, result, 'Task created successfully', 201);
    } catch (error) {
      next(error);
    }
  }

  /**
   * List Tasks
   * GET /api/tenants/:tenantId/projects/:projectId/tasks
   */
  static async listTasks(req, res, next) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 50;
      const filters = {
        status: req.query.status,
        priority: req.query.priority,
        assignedTo: req.query.assignedTo,
        search: req.query.search,
      };
      const result = await taskService.listTasks(req.params.tenantId, req.params.projectId, page, limit, filters);
      sendSuccess(res, result, 'Tasks retrieved successfully', 200);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update Task Status
   * PATCH /api/tenants/:tenantId/tasks/:taskId/status
   */
  static async updateTaskStatus(req, res, next) {
    try {
      const result = await taskService.updateTaskStatus(req.params.tenantId, req.params.taskId, req.body.status, req.user.userId);
      sendSuccess(res, result, 'Task status updated successfully', 200);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update Task
   * PUT /api/tenants/:tenantId/tasks/:taskId
   */
  static async updateTask(req, res, next) {
    try {
      const result = await taskService.updateTask(req.params.tenantId, req.params.taskId, req.body, req.user.userId);
      sendSuccess(res, result, 'Task updated successfully', 200);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete Task
   * DELETE /api/tenants/:tenantId/tasks/:taskId
   */
  static async deleteTask(req, res, next) {
    try {
      const result = await taskService.deleteTask(req.params.tenantId, req.params.taskId, req.user.userId);
      sendSuccess(res, result, 'Task deleted successfully', 200);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = TaskController;
