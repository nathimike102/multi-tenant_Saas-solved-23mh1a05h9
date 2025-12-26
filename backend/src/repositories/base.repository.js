// Base Repository with tenant scoping
const db = require('../config/database');

class BaseRepository {
  constructor(model) {
    this.model = model;
    this.prisma = db.prisma;
  }

  /**
   * Find by ID with tenant scoping
   */
  async findById(id, tenantId = null) {
    const where = { id };
    if (tenantId) {
      where.tenantId = tenantId;
    }
    return this.prisma[this.model].findFirst({ where });
  }

  /**
   * Find many with tenant scoping
   */
  async findMany(where = {}, options = {}) {
    return this.prisma[this.model].findMany({
      where,
      ...options,
    });
  }

  /**
   * Create record
   */
  async create(data) {
    return this.prisma[this.model].create({ data });
  }

  /**
   * Update record
   */
  async update(id, data, tenantId = null) {
    const where = { id };
    if (tenantId) {
      where.tenantId = tenantId;
    }
    return this.prisma[this.model].update({ where, data });
  }

  /**
   * Delete record
   */
  async delete(id, tenantId = null) {
    const where = { id };
    if (tenantId) {
      where.tenantId = tenantId;
    }
    return this.prisma[this.model].delete({ where });
  }

  /**
   * Count records
   */
  async count(where = {}) {
    return this.prisma[this.model].count({ where });
  }
}

module.exports = BaseRepository;
