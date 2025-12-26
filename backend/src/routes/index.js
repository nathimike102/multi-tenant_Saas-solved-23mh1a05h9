// Main API Router
const express = require('express');

const authRoutes = require('./auth.routes');
const tenantRoutes = require('./tenant.routes');
const userRoutes = require('./user.routes');
const projectRoutes = require('./project.routes');
const taskRoutes = require('./task.routes');

const router = express.Router();

// Mount routes
router.use('/auth', authRoutes);
router.use('/tenants', tenantRoutes);
router.use('/tenants/:tenantId/users', userRoutes);
router.use('/tenants/:tenantId', projectRoutes);
router.use('/tenants/:tenantId', taskRoutes);

module.exports = router;
