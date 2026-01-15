const User = require('../models/User');
const Role = require('../models/Role');
const { validationResult } = require('express-validator');

// Get all users (SuperAdmin only)
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find()
      .populate('role', 'name description permissions')
      .populate('requestedRole', 'name description')
      .select('-password -refreshToken')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: { users },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch users',
      error: error.message,
    });
  }
};

// Get users with pending role requests (SuperAdmin only)
const getPendingRoleRequests = async (req, res) => {
  try {
    const users = await User.find({ roleRequestStatus: 'pending' })
      .populate('role', 'name description')
      .populate('requestedRole', 'name description')
      .select('-password -refreshToken')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: { users },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch pending role requests',
      error: error.message,
    });
  }
};

// Approve role request (SuperAdmin only)
const approveRoleRequest = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .populate('requestedRole');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    if (user.roleRequestStatus !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'No pending role request for this user',
      });
    }

    // Update user's role to the requested role
    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      {
        role: user.requestedRole._id,
        requestedRole: null,
        roleRequestStatus: 'approved',
      },
      { new: true }
    )
      .populate('role', 'name description permissions')
      .select('-password -refreshToken');

    res.json({
      success: true,
      message: `Role request approved. User assigned ${user.requestedRole.name} role.`,
      data: { user: updatedUser },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to approve role request',
      error: error.message,
    });
  }
};

// Reject role request (SuperAdmin only)
const rejectRoleRequest = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .populate('requestedRole');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    if (user.roleRequestStatus !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'No pending role request for this user',
      });
    }

    // Clear the role request but keep user as VIEWER
    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      {
        requestedRole: null,
        roleRequestStatus: 'rejected',
      },
      { new: true }
    )
      .populate('role', 'name description permissions')
      .select('-password -refreshToken');

    res.json({
      success: true,
      message: 'Role request rejected. User remains as VIEWER.',
      data: { user: updatedUser },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to reject role request',
      error: error.message,
    });
  }
};

// Get user by ID (SuperAdmin only)
const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .populate('role', 'name description permissions')
      .select('-password -refreshToken');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    res.json({
      success: true,
      data: { user },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user',
      error: error.message,
    });
  }
};

// Assign role to user (SuperAdmin only)
const assignRole = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array(),
      });
    }

    const { role: roleName } = req.body;
    const userId = req.params.id;

    // Find the role
    const role = await Role.findOne({ name: roleName.toUpperCase() });
    if (!role) {
      return res.status(400).json({
        success: false,
        message: 'Invalid role specified',
      });
    }

    // Update user's role
    const user = await User.findByIdAndUpdate(
      userId,
      { role: role._id },
      { new: true }
    )
      .populate('role', 'name description permissions')
      .select('-password -refreshToken');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    res.json({
      success: true,
      message: `Role ${role.name} assigned successfully`,
      data: { user },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to assign role',
      error: error.message,
    });
  }
};

// Update user (SuperAdmin only)
const updateUser = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array(),
      });
    }

    const { fullName, email, isActive, role: roleName } = req.body;
    const updateData = {};

    if (fullName) updateData.fullName = fullName;
    if (email) updateData.email = email;
    if (typeof isActive === 'boolean') updateData.isActive = isActive;

    // Handle role assignment
    if (roleName) {
      const role = await Role.findOne({ name: roleName.toUpperCase() });
      if (!role) {
        return res.status(400).json({
          success: false,
          message: 'Invalid role specified',
        });
      }
      updateData.role = role._id;
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    )
      .populate('role', 'name description permissions')
      .select('-password -refreshToken');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    res.json({
      success: true,
      message: 'User updated successfully',
      data: { user },
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Email already exists',
      });
    }
    res.status(500).json({
      success: false,
      message: 'Failed to update user',
      error: error.message,
    });
  }
};

// Delete user (SuperAdmin only)
const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Prevent deleting yourself
    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'You cannot delete your own account',
      });
    }

    await User.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'User deleted successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to delete user',
      error: error.message,
    });
  }
};

module.exports = {
  getAllUsers,
  getUserById,
  assignRole,
  updateUser,
  deleteUser,
  getPendingRoleRequests,
  approveRoleRequest,
  rejectRoleRequest,
};
