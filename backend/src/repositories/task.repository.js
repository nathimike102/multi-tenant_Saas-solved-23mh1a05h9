// Task Repository
const BaseRepository = require('./base.repository');

class TaskRepository extends BaseRepository {
  constructor() {
    super('task');
  }

  /**
   * List tasks for project with pagination and filters
   */
  async listByProject(projectId, tenantId, page = 1, limit = 50, filters = {}) {
    const skip = (page - 1) * limit;

    const where = { projectId, tenantId };
    if (filters.status) where.status = filters.status;
    if (filters.assignedTo) where.assignedTo = filters.assignedTo;
    if (filters.priority) where.priority = filters.priority;
    if (filters.search) {
      where.title = { contains: filters.search, mode: 'insensitive' };
    }

    const [tasks, total] = await Promise.all([
      this.prisma.task.findMany({
        where,
        skip,
        take: limit,
        include: {
          assignee: { select: { id: true, fullName: true, email: true } },
        },
        orderBy: [{ priority: 'desc' }, { dueDate: 'asc' }],
      }),
      this.prisma.task.count({ where }),
    ]);

    return {
      tasks,
      total,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        limit,
      },
    };
  }

  /**
   * Find task by ID with tenant scope
   */
  async findByIdWithTenant(taskId, tenantId) {
    return this.prisma.task.findFirst({
      where: { id: taskId, tenantId },
      include: {
        assignee: { select: { id: true, fullName: true, email: true } },
        project: { select: { id: true, name: true } },
      },
    });
  }

  /**
   * Count tasks in project
   */
  async countByProject(projectId) {
    return this.prisma.task.count({ where: { projectId } });
  }
}

module.exports = new TaskRepository();
