const Role = require('../models/Role');

// Middleware to check if user has required permission(s)
const requirePermission = (...requiredPermissions) => {
  return async (req, res, next) => {
    try {
      if (!req.user || !req.user.role) {
        return res.status(403).json({ 
          success: false, 
          message: 'Access denied: No role assigned' 
        });
      }

      // Populate role if not already populated
      if (!req.user.role.permissions) {
        await req.user.populate('role');
      }

      const userPermissions = req.user.role.permissions || [];
      
      // Check if user has at least one of the required permissions
      const hasPermission = requiredPermissions.some(permission => 
        userPermissions.includes(permission)
      );

      if (!hasPermission) {
        return res.status(403).json({ 
          success: false, 
          message: `Access denied: Requires one of these permissions: ${requiredPermissions.join(', ')}` 
        });
      }

      next();
    } catch (error) {
      return res.status(500).json({ 
        success: false, 
        message: 'Permission check error', 
        error: error.message 
      });
    }
  };
};

// Middleware to check if user has a specific role
const requireRole = (...roleNames) => {
  return async (req, res, next) => {
    try {
      if (!req.user || !req.user.role) {
        return res.status(403).json({ 
          success: false, 
          message: 'Access denied: No role assigned' 
        });
      }

      // Populate role if not already populated
      if (!req.user.role.name) {
        await req.user.populate('role');
      }

      const userRoleName = req.user.role.name.toUpperCase();
      const hasRole = roleNames.some(roleName => 
        userRoleName === roleName.toUpperCase()
      );

      if (!hasRole) {
        return res.status(403).json({ 
          success: false, 
          message: `Access denied: Requires one of these roles: ${roleNames.join(', ')}` 
        });
      }

      next();
    } catch (error) {
      return res.status(500).json({ 
        success: false, 
        message: 'Role check error', 
        error: error.message 
      });
    }
  };
};

// Middleware to check if user has required role OR permission
// Useful for allowing multiple roles (e.g., SuperAdmin and Manager) to perform actions
const requireRoleOrPermission = (allowedRoles, requiredPermissions) => {
  return async (req, res, next) => {
    try {
      if (!req.user || !req.user.role) {
        return res.status(403).json({ 
          success: false, 
          message: 'Access denied: No role assigned' 
        });
      }

      // Populate role if not already populated
      if (!req.user.role.name || !req.user.role.permissions) {
        await req.user.populate('role');
      }

      const userRoleName = req.user.role.name.toUpperCase();
      const userPermissions = req.user.role.permissions || [];

      // Check if user has one of the allowed roles
      const hasAllowedRole = allowedRoles.some(roleName => 
        userRoleName === roleName.toUpperCase()
      );

      // Check if user has required permission
      const hasPermission = requiredPermissions.some(permission => 
        userPermissions.includes(permission)
      );

      // Allow if user has allowed role OR required permission
      if (hasAllowedRole || hasPermission) {
        return next();
      }

      return res.status(403).json({ 
        success: false, 
        message: `Access denied: Requires one of these roles: ${allowedRoles.join(', ')} OR one of these permissions: ${requiredPermissions.join(', ')}` 
      });
    } catch (error) {
      return res.status(500).json({ 
        success: false, 
        message: 'Access check error', 
        error: error.message 
      });
    }
  };
};

module.exports = {
  requirePermission,
  requireRole,
  requireRoleOrPermission,
};
