// Project Repository
const BaseRepository = require('./base.repository');

class ProjectRepository extends BaseRepository {
  constructor() {
    super('project');
  }

  /**
   * List projects for tenant with pagination
   */
  async listByTenant(tenantId, page = 1, limit = 20, filters = {}) {
    const skip = (page - 1) * limit;

    const where = { tenantId };
    if (filters.status) where.status = filters.status;
    if (filters.search) {
      where.name = { contains: filters.search, mode: 'insensitive' };
    }

    const [projects, total] = await Promise.all([
      this.prisma.project.findMany({
        where,
        skip,
        take: limit,
        include: {
          creator: { select: { id: true, fullName: true } },
          tasks: { select: { status: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.project.count({ where }),
    ]);

    // Format response with task counts
    const formattedProjects = projects.map((project) => ({
      ...project,
      taskCount: project.tasks.length,
      completedTaskCount: project.tasks.filter((t) => t.status === 'completed').length,
      tasks: undefined, // Remove tasks array
    }));

    return {
      projects: formattedProjects,
      total,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        limit,
      },
    };
  }

  /**
   * Count projects in tenant
   */
  async countByTenant(tenantId) {
    return this.prisma.project.count({ where: { tenantId } });
  }

  /**
   * Find project by ID with tenant scope
   */
  async findByIdWithTenant(projectId, tenantId) {
    return this.prisma.project.findFirst({
      where: { id: projectId, tenantId },
      include: { creator: { select: { id: true, fullName: true } } },
    });
  }
}

module.exports = new ProjectRepository();
