// Tenant Routes
const express = require('express');
const { authenticate } = require('../middleware/auth');
const { requireSuperAdmin } = require('../middleware/rbac');
const { validateBody, validateParams } = require('../middleware/validation');
const { updateTenantSchema } = require('../utils/validation');
const TenantController = require('../controllers/tenant.controller');

const router = express.Router();

// Super admin only endpoints
router.get('/', authenticate, requireSuperAdmin, TenantController.listAllTenants);
router.get('/:tenantId', authenticate, TenantController.getTenantDetails);
router.put('/:tenantId', authenticate, validateBody(updateTenantSchema), TenantController.updateTenant);

module.exports = router;
