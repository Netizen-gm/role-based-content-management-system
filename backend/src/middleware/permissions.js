// Import Role model (though not directly used here, kept for future reference)
const Role = require('../models/Role');

// Middleware to check if user has required permission(s)
// Accepts one or more permission names as arguments (e.g., 'create', 'edit', 'delete')
const requirePermission = (...requiredPermissions) => {
  // Return middleware function that checks permissions
  return async (req, res, next) => {
    try {
      // Check if user and role exist in request (set by authenticate middleware)
      if (!req.user || !req.user.role) {
        // Return 403 Forbidden if user has no role
        return res.status(403).json({ 
          success: false, 
          message: 'Access denied: No role assigned' 
        });
      }

      // Populate role permissions if role is not already populated with permissions
      if (!req.user.role.permissions) {
        await req.user.populate('role');
      }

      // Get user's permissions from their role
      const userPermissions = req.user.role.permissions || [];
      
      // Check if user has at least one of the required permissions
      // Uses .some() to return true if any permission matches
      const hasPermission = requiredPermissions.some(permission => 
        userPermissions.includes(permission)
      );

      // If user doesn't have any required permissions, deny access
      if (!hasPermission) {
        return res.status(403).json({ 
          success: false, 
          message: `Access denied: Requires one of these permissions: ${requiredPermissions.join(', ')}` 
        });
      }

      // User has required permission, continue to next middleware/route handler
      next();
    } catch (error) {
      // Handle any errors during permission checking
      return res.status(500).json({ 
        success: false, 
        message: 'Permission check error', 
        error: error.message 
      });
    }
  };
};

// Middleware to check if user has a specific role
// Accepts one or more role names as arguments (e.g., 'SUPERADMIN', 'MANAGER')
const requireRole = (...roleNames) => {
  // Return middleware function that checks role
  return async (req, res, next) => {
    try {
      // Check if user and role exist in request
      if (!req.user || !req.user.role) {
        return res.status(403).json({ 
          success: false, 
          message: 'Access denied: No role assigned' 
        });
      }

      // Populate role name if role is not already populated
      if (!req.user.role.name) {
        await req.user.populate('role');
      }

      // Get user's role name and convert to uppercase for comparison
      const userRoleName = req.user.role.name.toUpperCase();
      // Check if user has one of the required roles
      const hasRole = roleNames.some(roleName => 
        userRoleName === roleName.toUpperCase()
      );

      // If user doesn't have required role, deny access
      if (!hasRole) {
        return res.status(403).json({ 
          success: false, 
          message: `Access denied: Requires one of these roles: ${roleNames.join(', ')}` 
        });
      }

      // User has required role, continue to next middleware/route handler
      next();
    } catch (error) {
      // Handle any errors during role checking
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
// First parameter: array of allowed role names
// Second parameter: array of required permission names
const requireRoleOrPermission = (allowedRoles, requiredPermissions) => {
  // Return middleware function that checks role or permission
  return async (req, res, next) => {
    try {
      // Check if user and role exist in request
      if (!req.user || !req.user.role) {
        return res.status(403).json({ 
          success: false, 
          message: 'Access denied: No role assigned' 
        });
      }

      // Populate role if name or permissions are not already populated
      if (!req.user.role.name || !req.user.role.permissions) {
        await req.user.populate('role');
      }

      // Get user's role name and permissions
      const userRoleName = req.user.role.name.toUpperCase();
      const userPermissions = req.user.role.permissions || [];

      // Check if user has one of the allowed roles
      const hasAllowedRole = allowedRoles.some(roleName => 
        userRoleName === roleName.toUpperCase()
      );

      // Check if user has one of the required permissions
      const hasPermission = requiredPermissions.some(permission => 
        userPermissions.includes(permission)
      );

      // Allow access if user has allowed role OR required permission
      if (hasAllowedRole || hasPermission) {
        return next();
      }

      // User doesn't have required role or permission, deny access
      return res.status(403).json({ 
        success: false, 
        message: `Access denied: Requires one of these roles: ${allowedRoles.join(', ')} OR one of these permissions: ${requiredPermissions.join(', ')}` 
      });
    } catch (error) {
      // Handle any errors during access checking
      return res.status(500).json({ 
        success: false, 
        message: 'Access check error', 
        error: error.message 
      });
    }
  };
};

// Export all middleware functions for use in routes
module.exports = {
  requirePermission,
  requireRole,
  requireRoleOrPermission,
};
