const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const roleController = require('../controllers/roleController');
const { authenticate } = require('../middleware/auth');
const { requireRole } = require('../middleware/permissions');

// Validation rules
const roleValidation = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Role name is required')
    .isLength({ min: 2 })
    .withMessage('Role name must be at least 2 characters'),
  body('description')
    .optional()
    .trim()
    .isString()
    .withMessage('Description must be a string'),
  body('permissions')
    .optional()
    .isArray()
    .withMessage('Permissions must be an array')
    .custom((value) => {
      const validPermissions = ['create', 'edit', 'delete', 'publish', 'view'];
      if (value && !value.every(p => validPermissions.includes(p))) {
        throw new Error('Invalid permission. Allowed: create, edit, delete, publish, view');
      }
      return true;
    }),
];

// All routes require authentication
router.use(authenticate);

// Get access matrix (all roles can view)
router.get('/access-matrix', roleController.getAccessMatrix);

// Get all roles (all authenticated users can view)
router.get('/', roleController.getAllRoles);

// Get role by ID (all authenticated users can view)
router.get('/:id', roleController.getRoleById);

// Create, update, delete routes require SuperAdmin role
router.post('/', requireRole('SUPERADMIN'), roleValidation, roleController.createRole);
router.put('/:id', requireRole('SUPERADMIN'), roleValidation, roleController.updateRole);
router.delete('/:id', requireRole('SUPERADMIN'), roleController.deleteRole);

module.exports = router;
