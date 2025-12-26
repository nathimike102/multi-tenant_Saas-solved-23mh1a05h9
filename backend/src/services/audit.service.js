// Audit Service
const logger = require('../utils/logger');
const db = require('../config/database');

class AuditService {
  /**
   * Log action for audit trail
   */
  async logAction(tenantId, userId, action, entityType, entityId, metadata = {}) {
    try {
      await db.prisma.auditLog.create({
        data: {
          tenantId: tenantId || null,
          userId: userId || null,
          action,
          entityType,
          entityId,
          ipAddress: metadata.ipAddress || null,
          metadata: metadata.metadata || null,
        },
      });
    } catch (error) {
      logger.error({ error, action, entityType }, 'Audit log creation failed');
    }
  }
}

module.exports = new AuditService();
