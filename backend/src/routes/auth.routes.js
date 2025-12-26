// Authentication Routes
const express = require('express');
const { authenticate } = require('../middleware/auth');
const { validateBody } = require('../middleware/validation');
const { registerTenantSchema, loginSchema } = require('../utils/validation');
const AuthController = require('../controllers/auth.controller');

const router = express.Router();

// Public endpoints
router.post('/register-tenant', validateBody(registerTenantSchema), AuthController.registerTenant);
router.post('/login', validateBody(loginSchema), AuthController.login);

// Protected endpoints
router.get('/me', authenticate, AuthController.getCurrentUser);
router.post('/logout', authenticate, AuthController.logout);

module.exports = router;
