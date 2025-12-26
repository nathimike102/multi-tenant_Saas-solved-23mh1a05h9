// Task Routes
const express = require('express');
const { authenticate } = require('../middleware/auth');
const { requireTenant } = require('../middleware/rbac');
const { validateBody, validateParams } = require('../middleware/validation');
const { createTaskSchema, updateTaskSchema, updateTaskStatusSchema } = require('../utils/validation');
const TaskController = require('../controllers/task.controller');

const router = express.Router({ mergeParams: true });

// Tenant endpoints
router.post('/projects/:projectId/tasks', authenticate, requireTenant, validateBody(createTaskSchema), TaskController.createTask);
router.get('/projects/:projectId/tasks', authenticate, requireTenant, TaskController.listTasks);
router.patch('/:taskId/status', authenticate, requireTenant, validateBody(updateTaskStatusSchema), TaskController.updateTaskStatus);
router.put('/:taskId', authenticate, requireTenant, validateBody(updateTaskSchema), TaskController.updateTask);
router.delete('/:taskId', authenticate, requireTenant, TaskController.deleteTask);

module.exports = router;
