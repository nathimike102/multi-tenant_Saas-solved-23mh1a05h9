// Project Routes
const express = require('express');
const { authenticate } = require('../middleware/auth');
const { requireTenant } = require('../middleware/rbac');
const { validateBody, validateParams } = require('../middleware/validation');
const { createProjectSchema, updateProjectSchema } = require('../utils/validation');
const ProjectController = require('../controllers/project.controller');

const router = express.Router({ mergeParams: true });

// Tenant endpoints
router.post('/', authenticate, requireTenant, validateBody(createProjectSchema), ProjectController.createProject);
router.get('/', authenticate, requireTenant, ProjectController.listProjects);
router.put('/:projectId', authenticate, requireTenant, validateBody(updateProjectSchema), ProjectController.updateProject);
router.delete('/:projectId', authenticate, requireTenant, ProjectController.deleteProject);

module.exports = router;
