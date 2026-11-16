import { errorResponse } from "../utils/response.js";

export const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return errorResponse(res, 401, "Authentication required");
    }

    const userRole = String(req.user.role || "").toLowerCase();
    const permittedRoles = allowedRoles.map(role => role.toLowerCase());

    if (!permittedRoles.includes(userRole)) {
      return errorResponse(res, 403, "You do not have permission to perform this action");
    }

    next();
  };
};