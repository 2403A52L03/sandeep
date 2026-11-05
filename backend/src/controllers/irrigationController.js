const db = require('../config/db');
const { successResponse, errorResponse } = require('../utils/response');

/**
 * Get all irrigation records with filters
 */
const getIrrigationRecords = async (req, res, next) => {
  try {
    const { farm_id, plot_id, crop_id, status, method, startDate, endDate } = req.query;
    const user = req.user;

    let queryText = `
      SELECT ir.*, 
             f.name as farm_name,
             p.name as plot_name,
             c.crop_name,
             u.full_name as scheduled_by_name
      FROM irrigation_records ir
      JOIN farms f ON ir.farm_id = f.id
      JOIN plots p ON ir.plot_id = p.id
      LEFT JOIN crops c ON ir.crop_id = c.id
      LEFT JOIN users u ON ir.created_by = u.id
      WHERE 1=1
    `;
    const params = [];
    let paramIndex = 1;

    if (user.role === 'farmer') {
      queryText += ` AND f.owner_id = $${paramIndex++}`;
      params.push(user.id);
    }

    if (farm_id) {
      queryText += ` AND ir.farm_id = $${paramIndex++}`;
      params.push(farm_id);
    }

    if (plot_id) {
      queryText += ` AND ir.plot_id = $${paramIndex++}`;
      params.push(plot_id);
    }

    if (crop_id) {
      queryText += ` AND ir.crop_id = $${paramIndex++}`;
      params.push(crop_id);
    }

    if (status) {
      queryText += ` AND ir.status = $${paramIndex++}`;
      params.push(status);
    }

    if (method) {
      queryText += ` AND ir.irrigation_method = $${paramIndex++}`;
      params.push(method);
    }

    if (startDate) {
      queryText += ` AND ir.scheduled_date >= $${paramIndex++}`;
      params.push(startDate);
    }

    if (endDate) {
      queryText += ` AND ir.scheduled_date <= $${paramIndex++}`;
      params.push(endDate);
    }

    queryText += ` ORDER BY ir.scheduled_date DESC, ir.id DESC`;

    const result = await db.query(queryText, params);
    return successResponse(res, 200, 'Irrigation records retrieved', result.rows);
  } catch (err) {
    next(err);
  }
};

/**
 * Get single irrigation record
 */
const getIrrigationById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const user = req.user;

    const result = await db.query(
      `SELECT ir.*, f.name as farm_name, f.owner_id, p.name as plot_name, c.crop_name
       FROM irrigation_records ir
       JOIN farms f ON ir.farm_id = f.id
       JOIN plots p ON ir.plot_id = p.id
       LEFT JOIN crops c ON ir.crop_id = c.id
       WHERE ir.id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return errorResponse(res, 404, 'Irrigation record not found.');
    }

    if (user.role === 'farmer' && result.rows[0].owner_id !== user.id) {
      return errorResponse(res, 403, 'Permission denied.');
    }

    return successResponse(res, 200, 'Irrigation record retrieved', result.rows[0]);
  } catch (err) {
    next(err);
  }
};

/**
 * Create a new irrigation schedule
 */
const createIrrigationRecord = async (req, res, next) => {
  try {
    const user = req.user;
    const {
      farm_id,
      plot_id,
      crop_id,
      irrigation_method,
      scheduled_date,
      start_time,
      duration_minutes,
      water_quantity_litres,
      actual_irrigation_date,
      status,
      notes
    } = req.body;

    const result = await db.query(
      `INSERT INTO irrigation_records (
         farm_id, plot_id, crop_id, irrigation_method, scheduled_date, 
         start_time, duration_minutes, water_quantity_litres, actual_irrigation_date, 
         status, notes, created_by
       )
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
       RETURNING *`,
      [
        farm_id,
        plot_id,
        crop_id || null,
        irrigation_method || 'Drip',
        scheduled_date,
        start_time || '06:00 AM',
        duration_minutes || 60,
        water_quantity_litres || 0,
        actual_irrigation_date || (status === 'Completed' ? scheduled_date : null),
        status || 'Scheduled',
        notes || null,
        user.id
      ]
    );

    return successResponse(res, 201, 'Irrigation event scheduled successfully', result.rows[0]);
  } catch (err) {
    next(err);
  }
};

/**
 * Update an irrigation record
 */
const updateIrrigationRecord = async (req, res, next) => {
  try {
    const { id } = req.params;
    const user = req.user;
    const {
      irrigation_method,
      scheduled_date,
      start_time,
      duration_minutes,
      water_quantity_litres,
      actual_irrigation_date,
      status,
      notes
    } = req.body;

    const checkRes = await db.query(
      'SELECT ir.id, f.owner_id FROM irrigation_records ir JOIN farms f ON ir.farm_id = f.id WHERE ir.id = $1',
      [id]
    );

    if (checkRes.rows.length === 0) {
      return errorResponse(res, 404, 'Irrigation record not found.');
    }

    if (user.role === 'farmer' && checkRes.rows[0].owner_id !== user.id) {
      return errorResponse(res, 403, 'Permission denied.');
    }

    const result = await db.query(
      `UPDATE irrigation_records SET
         irrigation_method = COALESCE($1, irrigation_method),
         scheduled_date = COALESCE($2, scheduled_date),
         start_time = COALESCE($3, start_time),
         duration_minutes = COALESCE($4, duration_minutes),
         water_quantity_litres = COALESCE($5, water_quantity_litres),
         actual_irrigation_date = COALESCE($6, actual_irrigation_date),
         status = COALESCE($7, status),
         notes = COALESCE($8, notes),
         updated_at = CURRENT_TIMESTAMP
       WHERE id = $9
       RETURNING *`,
      [
        irrigation_method,
        scheduled_date,
        start_time,
        duration_minutes,
        water_quantity_litres,
        actual_irrigation_date,
        status,
        notes,
        id
      ]
    );

    return successResponse(res, 200, 'Irrigation record updated successfully', result.rows[0]);
  } catch (err) {
    next(err);
  }
};

/**
 * Delete an irrigation record
 */
const deleteIrrigationRecord = async (req, res, next) => {
  try {
    const { id } = req.params;
    const user = req.user;

    const checkRes = await db.query(
      'SELECT ir.id, f.owner_id FROM irrigation_records ir JOIN farms f ON ir.farm_id = f.id WHERE ir.id = $1',
      [id]
    );

    if (checkRes.rows.length === 0) {
      return errorResponse(res, 404, 'Irrigation record not found.');
    }

    if (user.role === 'farmer' && checkRes.rows[0].owner_id !== user.id) {
      return errorResponse(res, 403, 'Permission denied.');
    }

    await db.query('DELETE FROM irrigation_records WHERE id = $1', [id]);
    return successResponse(res, 200, 'Irrigation record deleted successfully.');
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getIrrigationRecords,
  getIrrigationById,
  createIrrigationRecord,
  updateIrrigationRecord,
  deleteIrrigationRecord
};
