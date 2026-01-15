const jwt = require('jsonwebtoken');
const User = require('../models/User');
const TokenBlacklist = require('../models/TokenBlacklist');
const jwtConfig = require('../config/jwt');

// Generate access token
const generateAccessToken = (userId) => {
  return jwt.sign(
    { userId },
    jwtConfig.accessTokenSecret,
    { expiresIn: jwtConfig.accessTokenExpiry }
  );
};

// Generate refresh token
const generateRefreshToken = (userId) => {
  return jwt.sign(
    { userId },
    jwtConfig.refreshTokenSecret,
    { expiresIn: jwtConfig.refreshTokenExpiry }
  );
};

// Save refresh token to user
const saveRefreshToken = async (userId, refreshToken) => {
  await User.findByIdAndUpdate(userId, { refreshToken });
};

// Clear refresh token from user
const clearRefreshToken = async (userId) => {
  await User.findByIdAndUpdate(userId, { refreshToken: null });
};

// Add token to blacklist
const blacklistToken = async (token, expiresAt) => {
  try {
    await TokenBlacklist.create({ token, expiresAt });
  } catch (error) {
    // Token might already be blacklisted, ignore
    if (error.code !== 11000) {
      throw error;
    }
  }
};

// Generate token pair
const generateTokenPair = async (userId) => {
  // Ensure userId is a string
  const userIdString = userId.toString();
  
  const accessToken = generateAccessToken(userIdString);
  const refreshToken = generateRefreshToken(userIdString);
  
  await saveRefreshToken(userIdString, refreshToken);
  
  return { accessToken, refreshToken };
};

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  saveRefreshToken,
  clearRefreshToken,
  blacklistToken,
  generateTokenPair,
};
