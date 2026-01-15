const jwt = require('jsonwebtoken');
const User = require('../models/User');
const TokenBlacklist = require('../models/TokenBlacklist');
const jwtConfig = require('../config/jwt');

// Middleware to verify access token
const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        success: false, 
        message: 'No token provided or invalid format' 
      });
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Check if token is blacklisted
    const blacklisted = await TokenBlacklist.findOne({ token });
    if (blacklisted) {
      return res.status(401).json({ 
        success: false, 
        message: 'Token has been revoked' 
      });
    }

    // Verify token
    const decoded = jwt.verify(token, jwtConfig.accessTokenSecret);

    // Get user with role populated
    // Ensure userId is treated as ObjectId if it's a string
    const userId = decoded.userId;
    const user = await User.findById(userId)
      .populate('role')
      .select('-password -refreshToken');

    if (!user || !user.isActive) {
      return res.status(401).json({ 
        success: false, 
        message: 'User not found or inactive' 
      });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid token' 
      });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        success: false, 
        message: 'Token expired' 
      });
    }
    return res.status(500).json({ 
      success: false, 
      message: 'Authentication error', 
      error: error.message 
    });
  }
};

// Middleware to verify refresh token
const authenticateRefresh = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(401).json({ 
        success: false, 
        message: 'Refresh token required' 
      });
    }

    // Check if token is blacklisted
    const blacklisted = await TokenBlacklist.findOne({ token: refreshToken });
    if (blacklisted) {
      return res.status(401).json({ 
        success: false, 
        message: 'Refresh token has been revoked' 
      });
    }

    // Verify refresh token
    const decoded = jwt.verify(refreshToken, jwtConfig.refreshTokenSecret);

    // Get user and verify refresh token matches
    const user = await User.findById(decoded.userId)
      .populate('role')
      .select('+refreshToken');

    if (!user || !user.isActive || user.refreshToken !== refreshToken) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid refresh token' 
      });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid refresh token' 
      });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        success: false, 
        message: 'Refresh token expired' 
      });
    }
    return res.status(500).json({ 
      success: false, 
      message: 'Refresh token error', 
      error: error.message 
    });
  }
};

module.exports = {
  authenticate,
  authenticateRefresh,
};
