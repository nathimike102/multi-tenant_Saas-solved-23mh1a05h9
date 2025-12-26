// User Service
const passwordUtils = require('../utils/password');
const userRepository = require('../repositories/user.repository');
const tenantRepository = require('../repositories/tenant.repository');
const db = require('../config/database');

class UserService {
  /**
   * Add new user to tenant
   */
  async addUser(tenantId, data) {
    const { email, fullName, password, role } = data;

    // Check tenant exists and has user capacity
    const tenant = await tenantRepository.findById(tenantId);
    if (!tenant) {
      throw new Error('TENANT_NOT_FOUND', { statusCode: 404 });
    }

    const userCount = await userRepository.countByTenant(tenantId);
    if (userCount >= tenant.maxUsers) {
      throw new Error('TENANT_USER_LIMIT_EXCEEDED', { statusCode: 409 });
    }

    // Check if email already exists in this tenant
    const existing = await userRepository.findByEmailInTenant(email, tenantId);
    if (existing) {
      throw new Error('EMAIL_EXISTS_IN_TENANT', { statusCode: 409 });
    }

    // Validate password strength
    const passwordValidation = passwordUtils.validatePasswordStrength(password);
    if (!passwordValidation.valid) {
      throw new Error(`PASSWORD_WEAK: ${passwordValidation.message}`, { statusCode: 400 });
    }

    const hashedPassword = await passwordUtils.hashPassword(password);

    const newUser = await userRepository.create(tenantId, {
      email,
      passwordHash: hashedPassword,
      fullName,
      role: role || 'user',
      isActive: true,
    });

    return {
      id: newUser.id,
      email: newUser.email,
      fullName: newUser.fullName,
      role: newUser.role,
      isActive: newUser.isActive,
    };
  }

  /**
   * List users in tenant
   */
  async listUsers(tenantId, page = 1, limit = 50, filters = {}) {
    const result = await userRepository.listByTenant(tenantId, page, limit, filters);

    return {
      users: result.users.map((u) => ({
        id: u.id,
        email: u.email,
        fullName: u.fullName,
        role: u.role,
        isActive: u.isActive,
        createdAt: u.createdAt,
      })),
      pagination: result.pagination,
      total: result.total,
    };
  }

  /**
   * Update user information
   */
  async updateUser(tenantId, userId, data) {
    const user = await userRepository.findById(userId);

    if (!user || user.tenantId !== tenantId) {
      throw new Error('USER_NOT_FOUND', { statusCode: 404 });
    }

    const updateData = {};
    if (data.fullName !== undefined) updateData.fullName = data.fullName;
    if (data.role !== undefined) updateData.role = data.role;
    if (data.isActive !== undefined) updateData.isActive = data.isActive;

    // If password is being updated, validate and hash it
    if (data.password !== undefined) {
      const passwordValidation = passwordUtils.validatePasswordStrength(data.password);
      if (!passwordValidation.valid) {
        throw new Error(`PASSWORD_WEAK: ${passwordValidation.message}`, { statusCode: 400 });
      }
      updateData.passwordHash = await passwordUtils.hashPassword(data.password);
    }

    const updated = await userRepository.update(userId, updateData);

    return {
      id: updated.id,
      email: updated.email,
      fullName: updated.fullName,
      role: updated.role,
      isActive: updated.isActive,
    };
  }

  /**
   * Delete user from tenant
   */
  async deleteUser(tenantId, userId) {
    const user = await userRepository.findById(userId);

    if (!user || user.tenantId !== tenantId) {
      throw new Error('USER_NOT_FOUND', { statusCode: 404 });
    }

    // Prevent deleting the only tenant admin
    const adminCount = await db.prisma.user.count({
      where: { tenantId, role: 'tenant_admin' },
    });

    if (user.role === 'tenant_admin' && adminCount === 1) {
      throw new Error('CANNOT_DELETE_LAST_ADMIN', { statusCode: 409 });
    }

    await userRepository.delete(userId);

    return { success: true };
  }
}

module.exports = new UserService();
