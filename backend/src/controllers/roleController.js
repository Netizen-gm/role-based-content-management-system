const roleService = require('../services/roleService');
const { validationResult } = require('express-validator');

// Get all roles
const getAllRoles = async (req, res) => {
  try {
    const roles = await roleService.getAllRoles();
    res.json({
      success: true,
      data: { roles },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch roles',
      error: error.message,
    });
  }
};

// Get role by ID
const getRoleById = async (req, res) => {
  try {
    const role = await roleService.getRoleById(req.params.id);
    if (!role) {
      return res.status(404).json({
        success: false,
        message: 'Role not found',
      });
    }
    res.json({
      success: true,
      data: { role },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch role',
      error: error.message,
    });
  }
};

// Create new role
const createRole = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array(),
      });
    }

    const roleData = {
      ...req.body,
      createdBy: req.user._id,
    };

    const role = await roleService.createRole(roleData);
    res.status(201).json({
      success: true,
      message: 'Role created successfully',
      data: { role },
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Role with this name already exists',
      });
    }
    res.status(500).json({
      success: false,
      message: 'Failed to create role',
      error: error.message,
    });
  }
};

// Update role
const updateRole = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array(),
      });
    }

    const role = await roleService.updateRole(req.params.id, req.body);
    if (!role) {
      return res.status(404).json({
        success: false,
        message: 'Role not found',
      });
    }
    res.json({
      success: true,
      message: 'Role updated successfully',
      data: { role },
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Role with this name already exists',
      });
    }
    res.status(500).json({
      success: false,
      message: 'Failed to update role',
      error: error.message,
    });
  }
};

// Delete role
const deleteRole = async (req, res) => {
  try {
    await roleService.deleteRole(req.params.id);
    res.json({
      success: true,
      message: 'Role deleted successfully',
    });
  } catch (error) {
    if (error.message === 'Role not found') {
      return res.status(404).json({
        success: false,
        message: error.message,
      });
    }
    if (error.message === 'Cannot delete default role') {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }
    res.status(500).json({
      success: false,
      message: 'Failed to delete role',
      error: error.message,
    });
  }
};

// Get access matrix
const getAccessMatrix = async (req, res) => {
  try {
    const accessMatrix = await roleService.getAccessMatrix();
    res.json({
      success: true,
      data: { accessMatrix },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch access matrix',
      error: error.message,
    });
  }
};

module.exports = {
  getAllRoles,
  getRoleById,
  createRole,
  updateRole,
  deleteRole,
  getAccessMatrix,
};
