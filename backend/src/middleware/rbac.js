const { errorResponse } = require('../utils/response');

/**
 * Role-Based Access Control (RBAC) Middleware
 * Restricts access to specific user roles
 * @param {string[]} allowedRoles Array of permitted role names
 */
const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return errorResponse(res, 401, 'Unauthorized: User authentication required.');
    }

    const userRole = (req.user.role || '').toLowerCase();
    const normalizedAllowed = allowedRoles.map(r => r.toLowerCase());

    if (!normalizedAllowed.includes(userRole)) {
      return errorResponse(
        res, 
        403, 
        `Access denied. Role '${req.user.role}' does not have sufficient permissions for this operation.`
      );
    }

    next();
  };
};

module.exports = {
  authorizeRoles
};
