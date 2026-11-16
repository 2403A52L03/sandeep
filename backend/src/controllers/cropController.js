const db = require('../config/db');
const { calculateCropProgress, calculateDaysUntilHarvest, calculateYieldDifference } = require('../services/calculationService');
const { successResponse, errorResponse } = require('../utils/response');

/**
 * Enriches a raw crop record with dynamic growth calculations
 */
const enrichCropCalculations = (crop) => {
  const progress = calculateCropProgress(crop.planting_date, crop.expected_harvest_date);
  const harvestInfo = calculateDaysUntilHarvest(crop.expected_harvest_date, crop.status);
  const yieldDiff = calculateYieldDifference(crop.actual_yield, crop.expected_yield);

  // Calculate days since planting
  let daysSincePlanting = null;
  if (crop.planting_date) {
    const plantingTime = new Date(crop.planting_date).getTime();
    const now = new Date().getTime();
    daysSincePlanting = Math.max(0, Math.floor((now - plantingTime) / (1000 * 60 * 60 * 24)));
  }

  return {
    ...crop,
    growth_progress_percentage: progress,
    days_since_planting: daysSincePlanting,
    days_until_harvest: harvestInfo.days,
    is_overdue: harvestInfo.isOverdue,
    harvest_status_label: harvestInfo.label,
    yield_difference: yieldDiff.difference,
    yield_variance_status: yieldDiff.status
  };
};

/**
 * Get all crops with filters and calculations
 */
const getCrops = async (req, res, next) => {
  try {
    const { plot_id, farm_id, status, category, search } = req.query;
    const user = req.user;

    let queryText = `
      SELECT c.*, 
             p.name as plot_name,
             p.area as plot_total_area,
             f.id as farm_id,
             f.name as farm_name,
             f.owner_id
      FROM crops c
      JOIN plots p ON c.plot_id = p.id
      JOIN farms f ON p.farm_id = f.id
      WHERE 1=1
    `;
    const params = [];
    let paramIndex = 1;

    if (user.role === 'farmer') {
      queryText += ` AND f.owner_id = $${paramIndex++}`;
      params.push(user.id);
    }

    if (farm_id) {
      queryText += ` AND f.id = $${paramIndex++}`;
      params.push(farm_id);
    }

    if (plot_id) {
      queryText += ` AND c.plot_id = $${paramIndex++}`;
      params.push(plot_id);
    }

    if (status) {
      queryText += ` AND c.status = $${paramIndex++}`;
      params.push(status);
    }

    if (category) {
      queryText += ` AND c.crop_category ILIKE $${paramIndex++}`;
      params.push(`%${category}%`);
    }

    if (search) {
      queryText += ` AND (c.crop_name ILIKE $${paramIndex} OR c.variety ILIKE $${paramIndex} OR p.name ILIKE $${paramIndex})`;
      params.push(`%${search}%`);
      paramIndex++;
    }

    queryText += ` ORDER BY c.expected_harvest_date ASC`;

    const result = await db.query(queryText, params);
    const enrichedCrops = result.rows.map(enrichCropCalculations);

    return successResponse(res, 200, 'Crops retrieved successfully', enrichedCrops);
  } catch (err) {
    next(err);
  }
};

/**
 * Get crop by ID with full details, observations and irrigation history
 */
const getCropById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const user = req.user;

    const cropRes = await db.query(
      `SELECT c.*, 
              p.name as plot_name, 
              p.area as plot_total_area,
              f.id as farm_id,
              f.name as farm_name, 
              f.owner_id
       FROM crops c
       JOIN plots p ON c.plot_id = p.id
       JOIN farms f ON p.farm_id = f.id
       WHERE c.id = $1`,
      [id]
    );

    if (cropRes.rows.length === 0) {
      return errorResponse(res, 404, 'Crop record not found.');
    }

    const crop = cropRes.rows[0];

    if (user.role === 'farmer' && crop.owner_id !== user.id) {
      return errorResponse(res, 403, 'Permission denied.');
    }

    // Recent soil observations for this crop
    const obsRes = await db.query(
      `SELECT * FROM soil_observations WHERE crop_id = $1 ORDER BY observation_date DESC LIMIT 5`,
      [id]
    );

    // Recent irrigation events
    const irrRes = await db.query(
      `SELECT * FROM irrigation_records WHERE crop_id = $1 ORDER BY scheduled_date DESC LIMIT 5`,
      [id]
    );

    const enriched = enrichCropCalculations(crop);
    enriched.soil_observations = obsRes.rows;
    enriched.irrigation_records = irrRes.rows;

    return successResponse(res, 200, 'Crop details retrieved', enriched);
  } catch (err) {
    next(err);
  }
};

/**
 * Register a new crop
 */
const createCrop = async (req, res, next) => {
  try {
    const user = req.user;
    const {
      plot_id,
      crop_name,
      crop_category,
      variety,
      planting_date,
      expected_harvest_date,
      actual_harvest_date,
      cultivated_area,
      expected_yield,
      actual_yield,
      yield_unit,
      status
    } = req.body;

    // Verify plot and farm ownership
    const plotRes = await db.query(
      'SELECT p.id, p.area, f.owner_id FROM plots p JOIN farms f ON p.farm_id = f.id WHERE p.id = $1',
      [plot_id]
    );

    if (plotRes.rows.length === 0) {
      return errorResponse(res, 404, 'Associated plot does not exist.');
    }

    if (user.role === 'farmer' && plotRes.rows[0].owner_id !== user.id) {
      return errorResponse(res, 403, 'Permission denied. You can only register crops on your own farms.');
    }

    const result = await db.query(
      `INSERT INTO crops (
         plot_id, crop_name, crop_category, variety, planting_date, 
         expected_harvest_date, actual_harvest_date, cultivated_area, 
         expected_yield, actual_yield, yield_unit, status
       )
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
       RETURNING *`,
      [
        plot_id,
        crop_name,
        crop_category || 'Cereals',
        variety || null,
        planting_date,
        expected_harvest_date,
        actual_harvest_date || null,
        cultivated_area,
        expected_yield || null,
        actual_yield || null,
        yield_unit || 'Quintals',
        status || 'Planted'
      ]
    );

    const enriched = enrichCropCalculations(result.rows[0]);
    return successResponse(res, 201, 'Crop registered successfully', enriched);
  } catch (err) {
    next(err);
  }
};

/**
 * Update an existing crop
 */
const updateCrop = async (req, res, next) => {
  try {
    const { id } = req.params;
    const user = req.user;
    const {
      crop_name,
      crop_category,
      variety,
      planting_date,
      expected_harvest_date,
      actual_harvest_date,
      cultivated_area,
      expected_yield,
      actual_yield,
      yield_unit,
      status
    } = req.body;

    const checkRes = await db.query(
      'SELECT c.id, f.owner_id FROM crops c JOIN plots p ON c.plot_id = p.id JOIN farms f ON p.farm_id = f.id WHERE c.id = $1',
      [id]
    );

    if (checkRes.rows.length === 0) {
      return errorResponse(res, 404, 'Crop record not found.');
    }

    if (user.role === 'farmer' && checkRes.rows[0].owner_id !== user.id) {
      return errorResponse(res, 403, 'Permission denied.');
    }

    const result = await db.query(
      `UPDATE crops SET
         crop_name = COALESCE($1, crop_name),
         crop_category = COALESCE($2, crop_category),
         variety = COALESCE($3, variety),
         planting_date = COALESCE($4, planting_date),
         expected_harvest_date = COALESCE($5, expected_harvest_date),
         actual_harvest_date = COALESCE($6, actual_harvest_date),
         cultivated_area = COALESCE($7, cultivated_area),
         expected_yield = COALESCE($8, expected_yield),
         actual_yield = COALESCE($9, actual_yield),
         yield_unit = COALESCE($10, yield_unit),
         status = COALESCE($11, status),
         updated_at = CURRENT_TIMESTAMP
       WHERE id = $12
       RETURNING *`,
      [
        crop_name,
        crop_category,
        variety,
        planting_date,
        expected_harvest_date,
        actual_harvest_date,
        cultivated_area,
        expected_yield,
        actual_yield,
        yield_unit,
        status,
        id
      ]
    );

    const enriched = enrichCropCalculations(result.rows[0]);
    return successResponse(res, 200, 'Crop updated successfully', enriched);
  } catch (err) {
    next(err);
  }
};

/**
 * Delete a crop
 */
const deleteCrop = async (req, res, next) => {
  try {
    const { id } = req.params;
    const user = req.user;

    const checkRes = await db.query(
      'SELECT c.crop_name, f.owner_id FROM crops c JOIN plots p ON c.plot_id = p.id JOIN farms f ON p.farm_id = f.id WHERE c.id = $1',
      [id]
    );

    if (checkRes.rows.length === 0) {
      return errorResponse(res, 404, 'Crop record not found.');
    }

    if (user.role === 'farmer' && checkRes.rows[0].owner_id !== user.id) {
      return errorResponse(res, 403, 'Permission denied.');
    }

    await db.query('DELETE FROM crops WHERE id = $1', [id]);
    return successResponse(res, 200, `Crop '${checkRes.rows[0].crop_name}' deleted successfully.`);
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getCrops,
  getCropById,
  createCrop,
  updateCrop,
  deleteCrop
};

