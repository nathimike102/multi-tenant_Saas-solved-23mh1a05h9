// Task Service
const taskRepository = require('../repositories/task.repository');
const projectRepository = require('../repositories/project.repository');
const auditService = require('./audit.service');
const db = require('../config/database');

class TaskService {
  /**
   * Create new task
   */
  async createTask(tenantId, data, userId) {
    const { projectId, title, description, priority, dueDate, assignedTo } = data;

    // Verify project belongs to tenant
    const project = await projectRepository.findByIdWithTenant(projectId, tenantId);
    if (!project) {
      throw new Error('PROJECT_NOT_FOUND', { statusCode: 404 });
    }

    // Verify assigned user belongs to tenant (if provided)
    if (assignedTo) {
      const assignedUser = await db.prisma.user.findFirst({
        where: { id: assignedTo, tenantId },
      });
      if (!assignedUser) {
        throw new Error('USER_NOT_FOUND', { statusCode: 404 });
      }
    }

    const newTask = await taskRepository.create(tenantId, {
      projectId,
      title,
      description: description || null,
      status: 'todo',
      priority: priority || 'medium',
      dueDate: dueDate ? new Date(dueDate) : null,
      assignedTo: assignedTo || null,
    });

    // Audit log
    await auditService.logAction(tenantId, userId, 'CREATE_TASK', 'task', newTask.id);

    return {
      id: newTask.id,
      projectId: newTask.projectId,
      title: newTask.title,
      description: newTask.description,
      status: newTask.status,
      priority: newTask.priority,
      dueDate: newTask.dueDate,
      assignedTo: newTask.assignedTo,
      createdAt: newTask.createdAt,
    };
  }

  /**
   * List tasks in project
   */
  async listTasks(tenantId, projectId, page = 1, limit = 50, filters = {}) {
    // Verify project belongs to tenant
    const project = await projectRepository.findByIdWithTenant(projectId, tenantId);
    if (!project) {
      throw new Error('PROJECT_NOT_FOUND', { statusCode: 404 });
    }

    const result = await taskRepository.listByProject(projectId, tenantId, page, limit, filters);

    return {
      tasks: result.tasks.map((t) => ({
        id: t.id,
        projectId: t.projectId,
        title: t.title,
        description: t.description,
        status: t.status,
        priority: t.priority,
        dueDate: t.dueDate,
        assignedTo: t.assignee ? { id: t.assignee.id, fullName: t.assignee.fullName, email: t.assignee.email } : null,
        createdAt: t.createdAt,
      })),
      pagination: result.pagination,
      total: result.total,
    };
  }

  /**
   * Update task status
   */
  async updateTaskStatus(tenantId, taskId, newStatus, userId) {
    const task = await taskRepository.findByIdWithTenant(taskId, tenantId);

    if (!task) {
      throw new Error('TASK_NOT_FOUND', { statusCode: 404 });
    }

    const updated = await taskRepository.update(taskId, { status: newStatus });

    // Audit log
    await auditService.logAction(tenantId, userId, 'UPDATE_TASK_STATUS', 'task', taskId);

    return {
      id: updated.id,
      status: updated.status,
      updatedAt: updated.updatedAt,
    };
  }

  /**
   * Update task
   */
  async updateTask(tenantId, taskId, data, userId) {
    const task = await taskRepository.findByIdWithTenant(taskId, tenantId);

    if (!task) {
      throw new Error('TASK_NOT_FOUND', { statusCode: 404 });
    }

    // Verify assigned user if provided
    if (data.assignedTo !== undefined && data.assignedTo !== null) {
      const assignedUser = await db.prisma.user.findFirst({
        where: { id: data.assignedTo, tenantId },
      });
      if (!assignedUser) {
        throw new Error('USER_NOT_FOUND', { statusCode: 404 });
      }
    }

    const updateData = {};
    if (data.title !== undefined) updateData.title = data.title;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.status !== undefined) updateData.status = data.status;
    if (data.priority !== undefined) updateData.priority = data.priority;
    if (data.dueDate !== undefined) updateData.dueDate = data.dueDate ? new Date(data.dueDate) : null;
    if (data.assignedTo !== undefined) updateData.assignedTo = data.assignedTo;

    const updated = await taskRepository.update(taskId, updateData);

    // Audit log
    await auditService.logAction(tenantId, userId, 'UPDATE_TASK', 'task', taskId);

    return {
      id: updated.id,
      projectId: updated.projectId,
      title: updated.title,
      description: updated.description,
      status: updated.status,
      priority: updated.priority,
      dueDate: updated.dueDate,
      assignedTo: updated.assignedTo,
      updatedAt: updated.updatedAt,
    };
  }

  /**
   * Delete task
   */
  async deleteTask(tenantId, taskId, userId) {
    const task = await taskRepository.findByIdWithTenant(taskId, tenantId);

    if (!task) {
      throw new Error('TASK_NOT_FOUND', { statusCode: 404 });
    }

    await taskRepository.delete(taskId);

    // Audit log
    await auditService.logAction(tenantId, userId, 'DELETE_TASK', 'task', taskId);

    return { success: true };
  }
}

module.exports = new TaskService();
