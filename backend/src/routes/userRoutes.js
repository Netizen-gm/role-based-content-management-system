const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const userController = require('../controllers/userController');
const { authenticate } = require('../middleware/auth');
const { requireRole } = require('../middleware/permissions');

// Validation rules
const assignRoleValidation = [
  body('role')
    .trim()
    .notEmpty()
    .withMessage('Role is required')
    .isString()
    .withMessage('Role must be a string'),
];

const updateUserValidation = [
  body('fullName')
    .optional()
    .trim()
    .isLength({ min: 2 })
    .withMessage('Full name must be at least 2 characters'),
  body('email')
    .optional()
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive must be a boolean'),
  body('role')
    .optional()
    .isString()
    .withMessage('Role must be a string'),
];

// All routes require authentication and SuperAdmin role
router.use(authenticate);
router.use(requireRole('SUPERADMIN'));

// Get all users
router.get('/', userController.getAllUsers);

// Get pending role requests
router.get('/pending-requests', userController.getPendingRoleRequests);

// Get user by ID
router.get('/:id', userController.getUserById);

// Approve role request
router.patch('/:id/approve-role', userController.approveRoleRequest);

// Reject role request
router.patch('/:id/reject-role', userController.rejectRoleRequest);

// Assign role to user
router.patch('/:id/assign-role', assignRoleValidation, userController.assignRole);

// Update user
router.put('/:id', updateUserValidation, userController.updateUser);

// Delete user
router.delete('/:id', userController.deleteUser);

module.exports = router;
