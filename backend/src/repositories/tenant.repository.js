// Tenant Repository
const BaseRepository = require('./base.repository');

class TenantRepository extends BaseRepository {
  constructor() {
    super('tenant');
  }

  /**
   * Find tenant by subdomain
   */
  async findBySubdomain(subdomain) {
    return this.prisma.tenant.findUnique({ where: { subdomain } });
  }

  /**
   * Find tenant by ID with stats
   */
  async findWithStats(tenantId) {
    const tenant = await this.prisma.tenant.findUnique({
      where: { id: tenantId },
    });

    if (!tenant) return null;

    // Calculate stats
    const totalUsers = await this.prisma.user.count({ where: { tenantId } });
    const totalProjects = await this.prisma.project.count({ where: { tenantId } });
    const totalTasks = await this.prisma.task.count({ where: { tenantId } });

    return {
      ...tenant,
      stats: {
        totalUsers,
        totalProjects,
        totalTasks,
      },
    };
  }

  /**
   * List all tenants with pagination and filters
   */
  async listAll(page = 1, limit = 10, filters = {}) {
    const skip = (page - 1) * limit;

    const where = {};
    if (filters.status) where.status = filters.status;
    if (filters.subscriptionPlan) where.subscriptionPlan = filters.subscriptionPlan;

    const [tenants, total] = await Promise.all([
      this.prisma.tenant.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.tenant.count({ where }),
    ]);

    // Add stats to each tenant
    const tenantsWithStats = await Promise.all(
      tenants.map(async (tenant) => {
        const totalUsers = await this.prisma.user.count({ where: { tenantId: tenant.id } });
        const totalProjects = await this.prisma.project.count({
          where: { tenantId: tenant.id },
        });

        return {
          ...tenant,
          totalUsers,
          totalProjects,
        };
      })
    );

    return {
      data: tenantsWithStats,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalTenants: total,
        limit,
      },
    };
  }
}

module.exports = new TenantRepository();
