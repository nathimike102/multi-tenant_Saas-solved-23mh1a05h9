// Validation Utilities
const z = require('zod');

/**
 * Validate email format
 */
const emailSchema = z.string().email('Invalid email format');

/**
 * Validate UUID
 */
const uuidSchema = z.string().uuid('Invalid UUID format');

/**
 * Tenant Registration Schema
 */
const registerTenantSchema = z.object({
  tenantName: z.string().min(1, 'Tenant name is required').max(255),
  subdomain: z
    .string()
    .min(3, 'Subdomain must be at least 3 characters')
    .max(63, 'Subdomain must be at most 63 characters')
    .regex(/^[a-z0-9-]+$/, 'Subdomain can only contain lowercase letters, numbers, and hyphens'),
  adminEmail: emailSchema,
  adminPassword: z.string().min(8, 'Password must be at least 8 characters'),
  adminFullName: z.string().min(1, 'Full name is required').max(255),
});

/**
 * Login Schema
 */
const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required'),
  tenantSubdomain: z.string().optional(),
  tenantId: z.string().uuid().optional(),
});

/**
 * Create User Schema
 */
const createUserSchema = z.object({
  email: emailSchema,
  password: z.string().min(8, 'Password must be at least 8 characters'),
  fullName: z.string().min(1, 'Full name is required'),
  role: z.enum(['user', 'tenant_admin']).default('user'),
});

/**
 * Update User Schema
 */
const updateUserSchema = z.object({
  fullName: z.string().min(1).max(255).optional(),
  role: z.enum(['user', 'tenant_admin']).optional(),
  isActive: z.boolean().optional(),
});

/**
 * Update Tenant Schema
 */
const updateTenantSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  status: z.enum(['active', 'suspended', 'trial']).optional(),
  subscriptionPlan: z.enum(['free', 'pro', 'enterprise']).optional(),
  maxUsers: z.number().int().positive().optional(),
  maxProjects: z.number().int().positive().optional(),
});

/**
 * Create Project Schema
 */
const createProjectSchema = z.object({
  name: z.string().min(1, 'Project name is required').max(255),
  description: z.string().max(2000).optional(),
  status: z.enum(['active', 'archived', 'completed']).default('active'),
});

/**
 * Update Project Schema
 */
const updateProjectSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  description: z.string().max(2000).optional(),
  status: z.enum(['active', 'archived', 'completed']).optional(),
});

/**
 * Create Task Schema
 */
const createTaskSchema = z.object({
  title: z.string().min(1, 'Task title is required').max(255),
  description: z.string().max(2000).optional(),
  assignedTo: z.string().uuid().optional(),
  priority: z.enum(['low', 'medium', 'high']).default('medium'),
  dueDate: z.string().datetime().optional(),
});

/**
 * Update Task Schema
 */
const updateTaskSchema = z.object({
  title: z.string().min(1).max(255).optional(),
  description: z.string().max(2000).optional(),
  status: z.enum(['todo', 'in_progress', 'completed']).optional(),
  priority: z.enum(['low', 'medium', 'high']).optional(),
  assignedTo: z.string().uuid().nullable().optional(),
  dueDate: z.string().datetime().nullable().optional(),
});

/**
 * Update Task Status Schema
 */
const updateTaskStatusSchema = z.object({
  status: z.enum(['todo', 'in_progress', 'completed']),
});

/**
 * Validate data against schema
 */
const validate = (schema, data) => {
  try {
    return {
      valid: true,
      data: schema.parse(data),
      errors: null,
    };
  } catch (error) {
    return {
      valid: false,
      data: null,
      errors: error.errors.map((err) => ({
        path: err.path.join('.'),
        message: err.message,
      })),
    };
  }
};

module.exports = {
  emailSchema,
  uuidSchema,
  registerTenantSchema,
  loginSchema,
  createUserSchema,
  updateUserSchema,
  updateTenantSchema,
  createProjectSchema,
  updateProjectSchema,
  createTaskSchema,
  updateTaskSchema,
  updateTaskStatusSchema,
  validate,
};
