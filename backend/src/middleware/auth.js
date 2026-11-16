
import jwt from "jsonwebtoken";
import env from "../config/env.js";
import { errorResponse } from "../utils/response.js";

export const authenticateToken = (req, res, next) => {
  const authHeader = req.headers.authorization;

  const token =
    authHeader && authHeader.startsWith("Bearer ")
      ? authHeader.split(" ")[1]
      : null;

  if (!token) {
    return errorResponse(
      res,
      401,
      "Authentication token required. Please log in."
    );
  }

  try {
    const decoded = jwt.verify(token, env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return errorResponse(
        res,
        401,
        "Session has expired. Please log in again."
      );
    }

    return errorResponse(res, 403, "Invalid authentication token.");
  }
};
