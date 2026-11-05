const db = require('../config/db');
const { successResponse, errorResponse } = require('../utils/response');

/**
 * Get all plots with optional farm filter and cultivated crop info
 */
const getPlots = async (req, res, next) => {
  try {
    const { farm_id, search } = req.query;
    const user = req.user;

    let queryText = `
      SELECT p.*, 
             f.name as farm_name,
             f.total_area as farm_total_area,
             f.area_unit,
             (SELECT COUNT(*) FROM crops c WHERE c.plot_id = p.id AND c.status NOT IN ('Harvested', 'Failed'))::int as active_crops_count,
             (SELECT crop_name FROM crops c WHERE c.plot_id = p.id AND c.status NOT IN ('Harvested', 'Failed') ORDER BY c.planting_date DESC LIMIT 1) as current_crop_name
      FROM plots p
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
      queryText += ` AND p.farm_id = $${paramIndex++}`;
      params.push(farm_id);
    }

    if (search) {
      queryText += ` AND (p.name ILIKE $${paramIndex} OR f.name ILIKE $${paramIndex})`;
      params.push(`%${search}%`);
      paramIndex++;
    }

    queryText += ` ORDER BY p.created_at DESC`;

    const result = await db.query(queryText, params);
    return successResponse(res, 200, 'Plots retrieved successfully', result.rows);
  } catch (err) {
    next(err);
  }
};

/**
 * Get plot by ID
 */
const getPlotById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const user = req.user;

    const plotRes = await db.query(
      `SELECT p.*, f.name as farm_name, f.owner_id, f.total_area as farm_total_area, f.area_unit
       FROM plots p
       JOIN farms f ON p.farm_id = f.id
       WHERE p.id = $1`,
      [id]
    );

    if (plotRes.rows.length === 0) {
      return errorResponse(res, 404, 'Plot not found.');
    }

    const plot = plotRes.rows[0];

    if (user.role === 'farmer' && plot.owner_id !== user.id) {
      return errorResponse(res, 403, 'Permission denied. You can only view plots on your own farms.');
    }

    // Associated crops
    const cropsRes = await db.query(
      `SELECT * FROM crops WHERE plot_id = $1 ORDER BY planting_date DESC`,
      [id]
    );
    plot.crops = cropsRes.rows;

    return successResponse(res, 200, 'Plot details retrieved', plot);
  } catch (err) {
    next(err);
  }
};

/**
 * Create a new plot with area boundary validation
 */
const createPlot = async (req, res, next) => {
  try {
    const user = req.user;
    const { farm_id, name, area, soil_type, irrigation_type, latitude, longitude, description } = req.body;

    // Check farm existence & ownership
    const farmRes = await db.query('SELECT id, name, owner_id, total_area, area_unit FROM farms WHERE id = $1', [farm_id]);
    if (farmRes.rows.length === 0) {
      return errorResponse(res, 404, 'Specified farm does not exist.');
    }

    const farm = farmRes.rows[0];
    if (user.role === 'farmer' && farm.owner_id !== user.id) {
      return errorResponse(res, 403, 'Permission denied. You can only add plots to your own farms.');
    }

    // Validate that plot area does not exceed available farm area
    const existingPlotsRes = await db.query(
      'SELECT COALESCE(SUM(area), 0)::numeric as total_allocated FROM plots WHERE farm_id = $1',
      [farm_id]
    );
    const totalAllocated = parseFloat(existingPlotsRes.rows[0].total_allocated);
    const newPlotArea = parseFloat(area);
    const farmLimit = parseFloat(farm.total_area);

    if (totalAllocated + newPlotArea > farmLimit) {
      const remainingArea = Math.max(0, farmLimit - totalAllocated).toFixed(2);
      return errorResponse(
        res,
        400,
        `Plot area (${newPlotArea} ${farm.area_unit}) exceeds available farm area. Remaining unallocated area on '${farm.name}' is ${remainingArea} ${farm.area_unit}.`
      );
    }

    const result = await db.query(
      `INSERT INTO plots (farm_id, name, area, soil_type, irrigation_type, latitude, longitude, description)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [
        farm_id,
        name,
        newPlotArea,
        soil_type || 'Red Sandy Loam',
        irrigation_type || 'Drip',
        latitude || null,
        longitude || null,
        description || null
      ]
    );

    return successResponse(res, 201, 'Plot created successfully', result.rows[0]);
  } catch (err) {
    next(err);
  }
};

/**
 * Update a plot
 */
const updatePlot = async (req, res, next) => {
  try {
    const { id } = req.params;
    const user = req.user;
    const { name, area, soil_type, irrigation_type, latitude, longitude, description } = req.body;

    const plotRes = await db.query(
      'SELECT p.*, f.owner_id, f.total_area as farm_total_area, f.area_unit, f.name as farm_name FROM plots p JOIN farms f ON p.farm_id = f.id WHERE p.id = $1',
      [id]
    );

    if (plotRes.rows.length === 0) {
      return errorResponse(res, 404, 'Plot not found.');
    }

    const currentPlot = plotRes.rows[0];
    if (user.role === 'farmer' && currentPlot.owner_id !== user.id) {
      return errorResponse(res, 403, 'Permission denied. You can only update plots on your own farms.');
    }

    // Check area constraint if area is changed
    if (area && parseFloat(area) !== parseFloat(currentPlot.area)) {
      const otherPlotsRes = await db.query(
        'SELECT COALESCE(SUM(area), 0)::numeric as total_allocated FROM plots WHERE farm_id = $1 AND id != $2',
        [currentPlot.farm_id, id]
      );
      const otherAllocated = parseFloat(otherPlotsRes.rows[0].total_allocated);
      const farmLimit = parseFloat(currentPlot.farm_total_area);
      const updatedArea = parseFloat(area);

      if (otherAllocated + updatedArea > farmLimit) {
        const remainingArea = Math.max(0, farmLimit - otherAllocated).toFixed(2);
        return errorResponse(
          res,
          400,
          `Updated plot area (${updatedArea} ${currentPlot.area_unit}) exceeds available farm area. Remaining area: ${remainingArea} ${currentPlot.area_unit}.`
        );
      }
    }

    const result = await db.query(
      `UPDATE plots SET
         name = COALESCE($1, name),
         area = COALESCE($2, area),
         soil_type = COALESCE($3, soil_type),
         irrigation_type = COALESCE($4, irrigation_type),
         latitude = COALESCE($5, latitude),
         longitude = COALESCE($6, longitude),
         description = COALESCE($7, description),
         updated_at = CURRENT_TIMESTAMP
       WHERE id = $8
       RETURNING *`,
      [name, area, soil_type, irrigation_type, latitude, longitude, description, id]
    );

    return successResponse(res, 200, 'Plot updated successfully', result.rows[0]);
  } catch (err) {
    next(err);
  }
};

/**
 * Delete a plot
 */
const deletePlot = async (req, res, next) => {
  try {
    const { id } = req.params;
    const user = req.user;

    const checkRes = await db.query(
      'SELECT p.name, f.owner_id FROM plots p JOIN farms f ON p.farm_id = f.id WHERE p.id = $1',
      [id]
    );

    if (checkRes.rows.length === 0) {
      return errorResponse(res, 404, 'Plot not found.');
    }

    if (user.role === 'farmer' && checkRes.rows[0].owner_id !== user.id) {
      return errorResponse(res, 403, 'Permission denied.');
    }

    await db.query('DELETE FROM plots WHERE id = $1', [id]);
    return successResponse(res, 200, `Plot '${checkRes.rows[0].name}' deleted successfully.`);
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getPlots,
  getPlotById,
  createPlot,
  updatePlot,
  deletePlot
};
