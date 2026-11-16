const bcrypt = require('bcryptjs');
const db = require('../config/db');
const { successResponse, errorResponse } = require('../utils/response');

/**
 * Get all users with search, role filters, and pagination
 */
const getUsers = async (req, res, next) => {
  try {
    const { role, is_active, search } = req.query;

    let queryText = `
      SELECT id, full_name, email, phone, role, is_active, created_at, updated_at,
             (SELECT COUNT(*) FROM farms WHERE owner_id = users.id)::int as farms_owned_count
      FROM users
      WHERE 1=1
    `;
    const params = [];
    let paramIndex = 1;

    if (role) {
      queryText += ` AND role = $${paramIndex++}`;
      params.push(role.toLowerCase());
    }

    if (is_active !== undefined) {
      queryText += ` AND is_active = $${paramIndex++}`;
      params.push(is_active === 'true' || is_active === true);
    }

    if (search) {
      queryText += ` AND (full_name ILIKE $${paramIndex} OR email ILIKE $${paramIndex} OR phone ILIKE $${paramIndex})`;
      params.push(`%${search}%`);
      paramIndex++;
    }

    queryText += ` ORDER BY created_at DESC`;

    const result = await db.query(queryText, params);
    return successResponse(res, 200, 'Users retrieved successfully', result.rows);
  } catch (err) {
    next(err);
  }
};

/**
 * Admin creates a user with explicit role
 */
const createUser = async (req, res, next) => {
  try {
    const { full_name, email, phone, password, role } = req.body;

    const existing = await db.query('SELECT id FROM users WHERE email = $1', [email.toLowerCase()]);
    if (existing.rows.length > 0) {
      return errorResponse(res, 409, 'A user with this email already exists.');
    }

    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password || 'Password@123', salt);

    const validRoles = ['admin', 'farmer', 'officer', 'agronomist'];
    const assignedRole = validRoles.includes(role?.toLowerCase()) ? role.toLowerCase() : 'farmer';

    const result = await db.query(
      `INSERT INTO users (full_name, email, phone, password_hash, role, is_active)
       VALUES ($1, $2, $3, $4, $5, true)
       RETURNING id, full_name, email, phone, role, is_active, created_at`,
      [full_name, email.toLowerCase(), phone || null, password_hash, assignedRole]
    );

    return successResponse(res, 201, 'User account created successfully', result.rows[0]);
  } catch (err) {
    next(err);
  }
};

/**
 * Admin updates user profile or role
 */
const updateUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { full_name, email, phone, role, password } = req.body;

    // Check user existence
    const userRes = await db.query('SELECT id, role FROM users WHERE id = $1', [id]);
    if (userRes.rows.length === 0) {
      return errorResponse(res, 404, 'User not found.');
    }

    let passwordHash = null;
    if (password) {
      const salt = await bcrypt.genSalt(10);
      passwordHash = await bcrypt.hash(password, salt);
    }

    const validRoles = ['admin', 'farmer', 'officer', 'agronomist'];
    const safeRole = role && validRoles.includes(role.toLowerCase()) ? role.toLowerCase() : null;

    const result = await db.query(
      `UPDATE users SET
         full_name = COALESCE($1, full_name),
         email = COALESCE($2, email),
         phone = COALESCE($3, phone),
         role = COALESCE($4, role),
         password_hash = COALESCE($5, password_hash),
         updated_at = CURRENT_TIMESTAMP
       WHERE id = $6
       RETURNING id, full_name, email, phone, role, is_active, updated_at`,
      [full_name, email ? email.toLowerCase() : null, phone, safeRole, passwordHash, id]
    );

    return successResponse(res, 200, 'User details updated successfully', result.rows[0]);
  } catch (err) {
    next(err);
  }
};

/**
 * Toggle active/inactive status
 */
const toggleUserStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const currentAdminId = req.user.id;

    if (parseInt(id, 10) === currentAdminId) {
      return errorResponse(res, 400, 'Administrators cannot deactivate their own active account.');
    }

    const checkRes = await db.query('SELECT is_active, full_name FROM users WHERE id = $1', [id]);
    if (checkRes.rows.length === 0) {
      return errorResponse(res, 404, 'User not found.');
    }

    const currentStatus = checkRes.rows[0].is_active;
    const newStatus = !currentStatus;

    const result = await db.query(
      'UPDATE users SET is_active = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING id, full_name, email, role, is_active',
      [newStatus, id]
    );

    return successResponse(
      res,
      200,
      `User '${result.rows[0].full_name}' has been ${newStatus ? 'activated' : 'deactivated'}.`,
      result.rows[0]
    );
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getUsers,
  createUser,
  updateUser,
  toggleUserStatus
};

