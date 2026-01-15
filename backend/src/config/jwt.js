module.exports = {
  accessTokenSecret: process.env.JWT_ACCESS_SECRET || 'your-access-secret-key-change-in-production',
  refreshTokenSecret: process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-key-change-in-production',
  accessTokenExpiry: process.env.ACCESS_TOKEN_EXPIRES || process.env.JWT_ACCESS_EXPIRY || '15m',
  refreshTokenExpiry: process.env.REFRESH_TOKEN_EXPIRES || process.env.JWT_REFRESH_EXPIRY || '7d',
};
