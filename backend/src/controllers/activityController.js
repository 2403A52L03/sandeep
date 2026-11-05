const db = require('../config/db');
const { successResponse, errorResponse } = require('../utils/response');

/**
 * Get all farm activities with filters
 */
const getActivities = async (req, res, next) => {
  try {
    const { farm_id, plot_id, crop_id, activity_type, status, startDate, endDate, search } = req.query;
    const user = req.user;

    let queryText = `
      SELECT fa.*, 
             f.name as farm_name,
             p.name as plot_name,
             c.crop_name,
             u.full_name as created_by_name
      FROM farm_activities fa
      JOIN farms f ON fa.farm_id = f.id
      JOIN plots p ON fa.plot_id = p.id
      LEFT JOIN crops c ON fa.crop_id = c.id
      LEFT JOIN users u ON fa.created_by = u.id
      WHERE 1=1
    `;
    const params = [];
    let paramIndex = 1;

    if (user.role === 'farmer') {
      queryText += ` AND f.owner_id = $${paramIndex++}`;
      params.push(user.id);
    }

    if (farm_id) {
      queryText += ` AND fa.farm_id = $${paramIndex++}`;
      params.push(farm_id);
    }

    if (plot_id) {
      queryText += ` AND fa.plot_id = $${paramIndex++}`;
      params.push(plot_id);
    }

    if (crop_id) {
      queryText += ` AND fa.crop_id = $${paramIndex++}`;
      params.push(crop_id);
    }

    if (activity_type) {
      queryText += ` AND fa.activity_type = $${paramIndex++}`;
      params.push(activity_type);
    }

    if (status) {
      queryText += ` AND fa.status = $${paramIndex++}`;
      params.push(status);
    }

    if (startDate) {
      queryText += ` AND fa.activity_date >= $${paramIndex++}`;
      params.push(startDate);
    }

    if (endDate) {
      queryText += ` AND fa.activity_date <= $${paramIndex++}`;
      params.push(endDate);
    }

    if (search) {
      queryText += ` AND (fa.description ILIKE $${paramIndex} OR f.name ILIKE $${paramIndex} OR fa.activity_type ILIKE $${paramIndex})`;
      params.push(`%${search}%`);
      paramIndex++;
    }

    queryText += ` ORDER BY fa.activity_date DESC, fa.id DESC`;

    const result = await db.query(queryText, params);

    // Calculate aggregated statistics
    let totalCost = 0;
    let totalLabourHours = 0;
    result.rows.forEach(row => {
      totalCost += parseFloat(row.cost || 0);
      totalLabourHours += parseFloat(row.labour_hours || 0);
    });

    return successResponse(res, 200, 'Farm activities retrieved', result.rows, {
      total_records: result.rows.length,
      total_cost: parseFloat(totalCost.toFixed(2)),
      total_labour_hours: parseFloat(totalLabourHours.toFixed(1))
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Get activity by ID
 */
const getActivityById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const user = req.user;

    const result = await db.query(
      `SELECT fa.*, f.name as farm_name, f.owner_id, p.name as plot_name, c.crop_name
       FROM farm_activities fa
       JOIN farms f ON fa.farm_id = f.id
       JOIN plots p ON fa.plot_id = p.id
       LEFT JOIN crops c ON fa.crop_id = c.id
       WHERE fa.id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return errorResponse(res, 404, 'Activity not found.');
    }

    if (user.role === 'farmer' && result.rows[0].owner_id !== user.id) {
      return errorResponse(res, 403, 'Permission denied.');
    }

    return successResponse(res, 200, 'Activity retrieved', result.rows[0]);
  } catch (err) {
    next(err);
  }
};

/**
 * Create a new farm activity
 */
const createActivity = async (req, res, next) => {
  try {
    const user = req.user;
    const {
      farm_id,
      plot_id,
      crop_id,
      activity_type,
      activity_date,
      description,
      labour_hours,
      cost,
      status,
      notes
    } = req.body;

    const result = await db.query(
      `INSERT INTO farm_activities (
         farm_id, plot_id, crop_id, activity_type, activity_date, 
         description, labour_hours, cost, status, notes, created_by
       )
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
       RETURNING *`,
      [
        farm_id,
        plot_id,
        crop_id || null,
        activity_type,
        activity_date,
        description || null,
        labour_hours || 0,
        cost || 0,
        status || 'Completed',
        notes || null,
        user.id
      ]
    );

    return successResponse(res, 201, 'Farm activity recorded successfully', result.rows[0]);
  } catch (err) {
    next(err);
  }
};

/**
 * Update a farm activity
 */
const updateActivity = async (req, res, next) => {
  try {
    const { id } = req.params;
    const user = req.user;
    const {
      activity_type,
      activity_date,
      description,
      labour_hours,
      cost,
      status,
      notes
    } = req.body;

    const checkRes = await db.query(
      'SELECT fa.id, f.owner_id FROM farm_activities fa JOIN farms f ON fa.farm_id = f.id WHERE fa.id = $1',
      [id]
    );

    if (checkRes.rows.length === 0) {
      return errorResponse(res, 404, 'Activity not found.');
    }

    if (user.role === 'farmer' && checkRes.rows[0].owner_id !== user.id) {
      return errorResponse(res, 403, 'Permission denied.');
    }

    const result = await db.query(
      `UPDATE farm_activities SET
         activity_type = COALESCE($1, activity_type),
         activity_date = COALESCE($2, activity_date),
         description = COALESCE($3, description),
         labour_hours = COALESCE($4, labour_hours),
         cost = COALESCE($5, cost),
         status = COALESCE($6, status),
         notes = COALESCE($7, notes),
         updated_at = CURRENT_TIMESTAMP
       WHERE id = $8
       RETURNING *`,
      [
        activity_type,
        activity_date,
        description,
        labour_hours,
        cost,
        status,
        notes,
        id
      ]
    );

    return successResponse(res, 200, 'Farm activity updated successfully', result.rows[0]);
  } catch (err) {
    next(err);
  }
};

/**
 * Delete a farm activity
 */
const deleteActivity = async (req, res, next) => {
  try {
    const { id } = req.params;
    const user = req.user;

    const checkRes = await db.query(
      'SELECT fa.id, f.owner_id FROM farm_activities fa JOIN farms f ON fa.farm_id = f.id WHERE fa.id = $1',
      [id]
    );

    if (checkRes.rows.length === 0) {
      return errorResponse(res, 404, 'Activity not found.');
    }

    if (user.role === 'farmer' && checkRes.rows[0].owner_id !== user.id) {
      return errorResponse(res, 403, 'Permission denied.');
    }

    await db.query('DELETE FROM farm_activities WHERE id = $1', [id]);
    return successResponse(res, 200, 'Farm activity deleted successfully.');
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getActivities,
  getActivityById,
  createActivity,
  updateActivity,
  deleteActivity
};
