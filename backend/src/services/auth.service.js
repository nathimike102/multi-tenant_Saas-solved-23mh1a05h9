// Authentication Service
const jwtUtils = require('../utils/jwt');
const passwordUtils = require('../utils/password');
const tenantRepository = require('../repositories/tenant.repository');
const userRepository = require('../repositories/user.repository');
const db = require('../config/database');

class AuthService {
  /**
   * Register a new tenant with admin user
   */
  async registerTenant(data) {
    const { tenantName, subdomain, adminEmail, adminPassword, adminFullName } = data;

    // Check if subdomain already exists
    const existingTenant = await tenantRepository.findBySubdomain(subdomain);
    if (existingTenant) {
      throw new Error('SUBDOMAIN_EXISTS', { statusCode: 409 });
    }

    // Check if admin email already exists globally
    const existingUser = await userRepository.findByEmail(adminEmail);
    if (existingUser) {
      throw new Error('EMAIL_EXISTS', { statusCode: 409 });
    }

    // Validate password strength
    const passwordValidation = passwordUtils.validatePasswordStrength(adminPassword);
    if (!passwordValidation.valid) {
      throw new Error(`PASSWORD_WEAK: ${passwordValidation.message}`, { statusCode: 400 });
    }

    // Transaction: create tenant + admin user
    const result = await db.transaction(async (tx) => {
      const tenant = await tx.tenant.create({
        data: {
          name: tenantName,
          subdomain,
          status: 'active',
          subscriptionPlan: 'free',
          maxUsers: 10,
          maxProjects: 5,
        },
      });

      const hashedPassword = await passwordUtils.hashPassword(adminPassword);

      const adminUser = await tx.user.create({
        data: {
          tenantId: tenant.id,
          email: adminEmail,
          passwordHash: hashedPassword,
          fullName: adminFullName,
          role: 'tenant_admin',
          isActive: true,
        },
      });

      return { tenant, adminUser };
    });

    const { adminUser, tenant } = result;

    const token = jwtUtils.generateToken({
      userId: adminUser.id,
      tenantId: tenant.id,
      role: adminUser.role,
      email: adminUser.email,
    });

    return {
      tenantId: tenant.id,
      tenant: {
        id: tenant.id,
        name: tenant.name,
        subdomain: tenant.subdomain,
        subscriptionPlan: tenant.subscriptionPlan,
      },
      user: {
        id: adminUser.id,
        email: adminUser.email,
        fullName: adminUser.fullName,
        role: adminUser.role,
      },
      token,
    };
  }

  /**
   * Login user with email and password
   */
  async login(email, password) {
    const user = await userRepository.findByEmail(email);

    if (!user) {
      throw new Error('INVALID_CREDENTIALS', { statusCode: 401 });
    }

    const isPasswordValid = await passwordUtils.comparePassword(password, user.passwordHash);
    if (!isPasswordValid) {
      throw new Error('INVALID_CREDENTIALS', { statusCode: 401 });
    }

    if (!user.isActive) {
      throw new Error('USER_INACTIVE', { statusCode: 403 });
    }

    const token = jwtUtils.generateToken({
      userId: user.id,
      tenantId: user.tenantId,
      role: user.role,
      email: user.email,
    });

    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        tenantId: user.tenantId,
      },
    };
  }

  /**
   * Get current user info from token
   */
  async getCurrentUser(userId) {
    const user = await userRepository.findById(userId);

    if (!user) {
      throw new Error('USER_NOT_FOUND', { statusCode: 404 });
    }

    if (!user.isActive) {
      throw new Error('USER_INACTIVE', { statusCode: 403 });
    }

    return {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
      tenantId: user.tenantId,
      isActive: user.isActive,
    };
  }

  /**
   * Logout (client-side token deletion, but we can validate token revocation if needed)
   */
  async logout(userId) {
    // In current implementation, logout is client-side (delete token)
    // Could add token blacklist here if needed
    return { success: true };
  }
}

module.exports = new AuthService();
