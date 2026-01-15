const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Role = require('../models/Role');
const authService = require('../services/authService');
const jwtConfig = require('../config/jwt');
const { validationResult } = require('express-validator');

// Register new user
const register = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array(),
      });
    }

    const { fullName, email, password, role: roleName } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists',
      });
    }

    // Get default VIEWER role for new users
    const defaultRole = await Role.findOne({ name: 'VIEWER' });
    if (!defaultRole) {
      return res.status(500).json({
        success: false,
        message: 'Default role not found. Please seed roles first.',
      });
    }

    // Handle role request if provided
    let requestedRole = null;
    let roleRequestStatus = null;
    
    if (roleName && roleName.toUpperCase() !== 'VIEWER') {
      // User requested a role other than VIEWER - needs SuperAdmin approval
      const requestedRoleDoc = await Role.findOne({ name: roleName.toUpperCase() });
      if (!requestedRoleDoc) {
        return res.status(400).json({
          success: false,
          message: 'Invalid role specified',
        });
      }
      requestedRole = requestedRoleDoc._id;
      roleRequestStatus = 'pending';
    }

    // Create user with VIEWER role by default
    // If role was requested, store it for SuperAdmin approval
    const user = new User({
      fullName,
      email,
      password,
      role: defaultRole._id, // Always start with VIEWER
      requestedRole: requestedRole, // Store requested role for approval
      roleRequestStatus: roleRequestStatus, // Mark as pending if role requested
      profilePhoto: req.file ? `/uploads/${req.file.filename}` : null,
    });

    await user.save();

    // Generate tokens
    const { accessToken, refreshToken } = await authService.generateTokenPair(user._id);

    // Populate role for response
    await user.populate('role');

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user: {
          id: user._id,
          fullName: user.fullName,
          email: user.email,
          role: user.role.name,
          profilePhoto: user.profilePhoto,
        },
        accessToken,
        refreshToken,
      },
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Registration failed',
      error: error.message,
      ...(process.env.NODE_ENV === 'development' && { stack: error.stack }),
    });
  }
};

// Login user
const login = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array(),
      });
    }

    const { email, password } = req.body;

    // Normalize email (lowercase and trim)
    const normalizedEmail = email.toLowerCase().trim();

    // Find user with password
    const user = await User.findOne({ email: normalizedEmail }).select('+password').populate('role');
    
    if (!user) {
      console.log(`Login attempt failed: User not found for email: ${normalizedEmail}`);
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
    }

    if (!user.isActive) {
      console.log(`Login attempt failed: User ${normalizedEmail} is inactive`);
      return res.status(401).json({
        success: false,
        message: 'Account is inactive',
      });
    }

    // Verify password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      console.log(`Login attempt failed: Invalid password for email: ${normalizedEmail}`);
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
    }

    // Ensure role is populated
    if (!user.role || !user.role.name) {
      await user.populate('role');
    }

    // Generate new tokens (token rotation)
    const { accessToken, refreshToken } = await authService.generateTokenPair(user._id);

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: user._id,
          fullName: user.fullName,
          email: user.email,
          role: user.role ? user.role.name : 'UNKNOWN',
          profilePhoto: user.profilePhoto,
        },
        accessToken,
        refreshToken,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Login failed',
      error: error.message,
      ...(process.env.NODE_ENV === 'development' && { stack: error.stack }),
    });
  }
};

// Refresh access token
const refreshToken = async (req, res) => {
  try {
    const { refreshToken: oldRefreshToken } = req.body;

    if (!oldRefreshToken) {
      return res.status(400).json({
        success: false,
        message: 'Refresh token required',
      });
    }

    // Verify and get user (middleware already did this)
    const user = req.user;

    // Generate new token pair (token rotation)
    const { accessToken, refreshToken: newRefreshToken } = 
      await authService.generateTokenPair(user._id);

    // Blacklist old refresh token
    const decoded = jwt.decode(oldRefreshToken);
    if (decoded && decoded.exp) {
      const expiresAt = new Date(decoded.exp * 1000);
      await authService.blacklistToken(oldRefreshToken, expiresAt);
    }

    res.json({
      success: true,
      message: 'Token refreshed successfully',
      data: {
        accessToken,
        refreshToken: newRefreshToken,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Token refresh failed',
      error: error.message,
    });
  }
};

// Logout user
const logout = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    const { refreshToken } = req.body;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const accessToken = authHeader.substring(7);
      
      try {
        const decoded = jwt.decode(accessToken);
        if (decoded && decoded.exp) {
          const expiresAt = new Date(decoded.exp * 1000);
          await authService.blacklistToken(accessToken, expiresAt);
        }
      } catch (error) {
        // Token might be invalid, continue anyway
      }
    }

    if (refreshToken) {
      try {
        const decoded = jwt.decode(refreshToken);
        if (decoded && decoded.exp) {
          const expiresAt = new Date(decoded.exp * 1000);
          await authService.blacklistToken(refreshToken, expiresAt);
        }
      } catch (error) {
        // Token might be invalid, continue anyway
      }

      // Clear refresh token from user
      await authService.clearRefreshToken(req.user._id);
    }

    res.json({
      success: true,
      message: 'Logout successful',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Logout failed',
      error: error.message,
    });
  }
};

// Get current user profile
const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate('role')
      .select('-password -refreshToken');

    res.json({
      success: true,
      data: {
        user: {
          id: user._id,
          fullName: user.fullName,
          email: user.email,
          role: user.role.name,
          profilePhoto: user.profilePhoto,
          permissions: user.role.permissions,
          createdAt: user.createdAt,
        },
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to get profile',
      error: error.message,
    });
  }
};

module.exports = {
  register,
  login,
  refreshToken,
  logout,
  getProfile,
};
