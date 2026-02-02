// Main API Router
const express = require('express');
const { authenticate } = require('../middleware/auth');
const { requireRole } = require('../middleware/rbac');

const authRoutes = require('./auth.routes');
const tenantRoutes = require('./tenant.routes');
const userRoutes = require('./user.routes');
const projectRoutes = require('./project.routes');
const taskRoutes = require('./task.routes');
const TenantController = require('../controllers/tenant.controller');
const UserController = require('../controllers/user.controller');

const router = express.Router();

// Mount routes
router.use('/auth', authRoutes);
router.use('/tenants', tenantRoutes);
router.use('/tenants/:tenantId/users', userRoutes);
router.use('/tenants/:tenantId/projects', projectRoutes);
router.use('/tenants/:tenantId', taskRoutes);

// Super admin endpoints for managing all resources across all tenants
router.get('/admin/tenants', authenticate, requireRole(['super_admin']), (req, res, next) => TenantController.listAllTenants(req, res, next));
router.get('/admin/users', authenticate, requireRole(['super_admin']), (req, res, next) => UserController.listAllUsers(req, res, next));

module.exports = router;
