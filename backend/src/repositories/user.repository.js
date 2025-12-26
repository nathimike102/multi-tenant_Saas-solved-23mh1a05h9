// User Repository
const BaseRepository = require('./base.repository');

class UserRepository extends BaseRepository {
  constructor() {
    super('user');
  }

  /**
   * Find user by email in specific tenant
   */
  async findByEmailInTenant(email, tenantId) {
    return this.prisma.user.findFirst({
      where: { email, tenantId },
    });
  }

  /**
   * Find user by email globally
   */
  async findByEmail(email) {
    return this.prisma.user.findFirst({
      where: { email },
    });
  }

  /**
   * List users in tenant with pagination
   */
  async listByTenant(tenantId, page = 1, limit = 50, filters = {}) {
    const skip = (page - 1) * limit;

    const where = { tenantId };
    if (filters.search) {
      where.OR = [
        { email: { contains: filters.search, mode: 'insensitive' } },
        { fullName: { contains: filters.search, mode: 'insensitive' } },
      ];
    }
    if (filters.role) {
      where.role = filters.role;
    }

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        skip,
        take: limit,
        select: {
          id: true,
          email: true,
          fullName: true,
          role: true,
          isActive: true,
          createdAt: true,
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.user.count({ where }),
    ]);

    return {
      users,
      total,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        limit,
      },
    };
  }

  /**
   * Count users in tenant
   */
  async countByTenant(tenantId) {
    return this.prisma.user.count({ where: { tenantId } });
  }
}

module.exports = new UserRepository();
