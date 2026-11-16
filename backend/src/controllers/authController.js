
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import db from "../config/db.js";
import env from "../config/env.js";
import {
  successResponse,
  errorResponse
} from "../utils/response.js";

// Register a new user
export const registerUser = async (req, res, next) => {
  try {
    const { full_name, email, phone, password, role } = req.body;

    const existing = await db.query(
      "SELECT id FROM users WHERE email = $1",
      [email.toLowerCase()]
    );

    if (existing.rows.length > 0) {
      return errorResponse(
        res,
        409,
        "An account with this email address already exists."
      );
    }

    let assignedRole = "farmer";

    if (
      role &&
      ["farmer", "officer", "agronomist"].includes(role.toLowerCase())
    ) {
      assignedRole = role.toLowerCase();
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const result = await db.query(
      `INSERT INTO users
       (full_name, email, phone, password_hash, role, is_active)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, full_name, email, phone, role, is_active, created_at`,
      [
        full_name,
        email.toLowerCase(),
        phone || null,
        passwordHash,
        assignedRole,
        true
      ]
    );

    const user = result.rows[0];

    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
        name: user.full_name
      },
      env.JWT_SECRET,
      { expiresIn: env.JWT_EXPIRES_IN }
    );

    return successResponse(res, 201, "User registered successfully", {
      user,
      token
    });
  } catch (err) {
    next(err);
  }
};

// Login an existing user
export const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const result = await db.query(
      `SELECT id, full_name, email, phone, password_hash, role, is_active
       FROM users WHERE email = $1`,
      [email.toLowerCase()]
    );

    if (result.rows.length === 0) {
      return errorResponse(res, 401, "Invalid email or password.");
    }

    const user = result.rows[0];

    if (!user.is_active) {
      return errorResponse(
        res,
        403,
        "Account is inactive. Please contact the administrator."
      );
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);

    if (!isMatch) {
      return errorResponse(res, 401, "Invalid email or password.");
    }

    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
        name: user.full_name
      },
      env.JWT_SECRET,
      { expiresIn: env.JWT_EXPIRES_IN }
    );

    delete user.password_hash;

    return successResponse(res, 200, "Login successful", {
      user,
      token
    });
  } catch (err) {
    next(err);
  }
};

// Get current authenticated user
export const getMe = async (req, res, next) => {
  try {
    const result = await db.query(
      `SELECT id, full_name, email, phone, role, is_active, created_at
       FROM users WHERE id = $1`,
      [req.user.id]
    );

    if (result.rows.length === 0) {
      return errorResponse(res, 404, "User profile not found.");
    }

    return successResponse(
      res,
      200,
      "User profile retrieved",
      result.rows[0]
    );
  } catch (err) {
    next(err);
  }
};

// Change user password
export const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const userRes = await db.query(
      "SELECT password_hash FROM users WHERE id = $1",
      [req.user.id]
    );

    if (userRes.rows.length === 0) {
      return errorResponse(res, 404, "User not found.");
    }

    const isMatch = await bcrypt.compare(
      currentPassword,
      userRes.rows[0].password_hash
    );

    if (!isMatch) {
      return errorResponse(
        res,
        400,
        "Current password verification failed."
      );
    }

    const newHash = await bcrypt.hash(newPassword, 10);

    await db.query(
      `UPDATE users
       SET password_hash = $1, updated_at = CURRENT_TIMESTAMP
       WHERE id = $2`,
      [newHash, req.user.id]
    );

    return successResponse(res, 200, "Password updated successfully.");
  } catch (err) {
    next(err);
  }
};

// Logout placeholder
export const logout = async (req, res) => {
  return successResponse(
    res,
    200,
    "Logout successful. Session token invalidated."
  );
};
