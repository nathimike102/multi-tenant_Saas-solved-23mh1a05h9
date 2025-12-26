// User Routes
const express = require('express');
const { authenticate } = require('../middleware/auth');
const { requireTenantAdmin, requireTenant } = require('../middleware/rbac');
const { validateBody, validateParams } = require('../middleware/validation');
const { createUserSchema, updateUserSchema } = require('../utils/validation');
const UserController = require('../controllers/user.controller');

const router = express.Router({ mergeParams: true });

// Tenant admin endpoints
router.post('/', authenticate, requireTenantAdmin, validateBody(createUserSchema), UserController.addUser);
router.get('/', authenticate, requireTenant, UserController.listUsers);
router.put('/:userId', authenticate, requireTenantAdmin, validateBody(updateUserSchema), UserController.updateUser);
router.delete('/:userId', authenticate, requireTenantAdmin, UserController.deleteUser);

module.exports = router;
