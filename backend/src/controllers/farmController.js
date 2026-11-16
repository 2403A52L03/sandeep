
import db from "../config/db.js";
import { successResponse, errorResponse } from "../utils/response.js";

/**
 * Get all farms with optional filtering and role-based scoping
 */
const getFarms = async (req, res, next) => {
  try {
    const {
      search,
      district,
      soil_type,
      sortBy = "created_at",
      sortOrder = "DESC"
    } = req.query;

    const user = req.user;

    let queryText = `
      SELECT f.*
      FROM farms f
      WHERE 1=1
    `;

    const params = [];
    let paramIndex = 1;

    if (user.role === "farmer") {
      queryText += ` AND f.owner_id = $${paramIndex++}`;
      params.push(user.id);
    }

    if (search) {
      queryText += ` AND (
        f.name ILIKE $${paramIndex}
        OR f.village ILIKE $${paramIndex}
        OR f.location ILIKE $${paramIndex}
      )`;
      params.push(`%${search}%`);
      paramIndex++;
    }

    if (district) {
      queryText += ` AND f.district ILIKE $${paramIndex++}`;
      params.push(`%${district}%`);
    }

    if (soil_type) {
      queryText += ` AND f.soil_type ILIKE $${paramIndex++}`;
      params.push(`%${soil_type}%`);
    }

    const validSortCols = [
      "name",
      "total_area",
      "created_at",
      "district"
    ];

    const safeSortCol = validSortCols.includes(sortBy)
      ? `f.${sortBy}`
      : "f.created_at";

    const safeSortOrder =
      sortOrder.toUpperCase() === "ASC" ? "ASC" : "DESC";

    queryText += ` ORDER BY ${safeSortCol} ${safeSortOrder}`;

    const result = await db.query(queryText, params);
    const farms = result.rows;

    for (const farm of farms) {
      const userRes = await db.query(
        "SELECT full_name, email FROM users WHERE id = $1",
        [farm.owner_id]
      );

      farm.owner_name = userRes.rows[0]?.full_name || "Farm Owner";
      farm.owner_email = userRes.rows[0]?.email || "";

      const plotsRes = await db.query(
        "SELECT COUNT(*)::int AS count FROM plots WHERE farm_id = $1",
        [farm.id]
      );

      const cropsRes = await db.query(
        `SELECT COUNT(c.id)::int AS count
         FROM crops c
         JOIN plots p ON c.plot_id = p.id
         WHERE p.farm_id = $1
         AND c.status NOT IN ('Harvested', 'Failed')`,
        [farm.id]
      );

      farm.total_plots = plotsRes.rows[0]?.count || 0;
      farm.active_crops = cropsRes.rows[0]?.count || 0;
    }

    return successResponse(
      res,
      200,
      "Farms retrieved successfully",
      farms
    );
  } catch (err) {
    next(err);
  }
};

/**
 * Get farm by ID
 */
const getFarmById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const user = req.user;

    const farmRes = await db.query(
      `SELECT f.*,
              u.full_name AS owner_name,
              u.email AS owner_email,
              u.phone AS owner_phone
       FROM farms f
       LEFT JOIN users u ON f.owner_id = u.id
       WHERE f.id = $1`,
      [id]
    );

    if (farmRes.rows.length === 0) {
      return errorResponse(res, 404, "Farm not found.");
    }

    const farm = farmRes.rows[0];

    if (
      user.role === "farmer" &&
      String(farm.owner_id) !== String(user.id)
    ) {
      return errorResponse(
        res,
        403,
        "Access denied. You can only view your own farms."
      );
    }

    const plotsRes = await db.query(
      `SELECT p.*,
              (SELECT COUNT(*)
               FROM crops c
               WHERE c.plot_id = p.id
               AND c.status NOT IN ('Harvested', 'Failed'))::int
               AS active_crops_count
       FROM plots p
       WHERE p.farm_id = $1
       ORDER BY p.name ASC`,
      [id]
    );

    const cropsRes = await db.query(
      `SELECT c.*, p.name AS plot_name
       FROM crops c
       JOIN plots p ON c.plot_id = p.id
       WHERE p.farm_id = $1
       ORDER BY c.expected_harvest_date ASC`,
      [id]
    );

    const activitiesRes = await db.query(
      `SELECT fa.*, p.name AS plot_name, c.crop_name
       FROM farm_activities fa
       LEFT JOIN plots p ON fa.plot_id = p.id
       LEFT JOIN crops c ON fa.crop_id = c.id
       WHERE fa.farm_id = $1
       ORDER BY fa.activity_date DESC
       LIMIT 5`,
      [id]
    );

    farm.plots = plotsRes.rows;
    farm.crops = cropsRes.rows;
    farm.recent_activities = activitiesRes.rows;

    return successResponse(
      res,
      200,
      "Farm details retrieved",
      farm
    );
  } catch (err) {
    next(err);
  }
};

/**
 * Create a new farm
 */
const createFarm = async (req, res, next) => {
  try {
    const user = req.user;

    const {
      name,
      owner_id,
      location,
      village,
      district,
      state,
      latitude,
      longitude,
      total_area,
      area_unit,
      soil_type,
      description
    } = req.body;

    const assignedOwner =
      user.role === "admin" && owner_id ? owner_id : user.id;

    const result = await db.query(
      `INSERT INTO farms (
        name, owner_id, location, village, district, state,
        latitude, longitude, total_area, area_unit, soil_type, description
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      RETURNING *`,
      [
        name,
        assignedOwner,
        location || null,
        village || null,
        district || null,
        state || "Telangana",
        latitude || null,
        longitude || null,
        total_area,
        area_unit || "Acres",
        soil_type || "Red Sandy Loam",
        description || null
      ]
    );

    return successResponse(
      res,
      201,
      "Farm registered successfully",
      result.rows[0]
    );
  } catch (err) {
    next(err);
  }
};

/**
 * Update an existing farm
 */
const updateFarm = async (req, res, next) => {
  try {
    const { id } = req.params;
    const user = req.user;

    const {
      name,
      location,
      village,
      district,
      state,
      latitude,
      longitude,
      total_area,
      area_unit,
      soil_type,
      description
    } = req.body;

    const checkRes = await db.query(
      "SELECT owner_id FROM farms WHERE id = $1",
      [id]
    );

    if (checkRes.rows.length === 0) {
      return errorResponse(res, 404, "Farm not found.");
    }

    if (
      user.role === "farmer" &&
      String(checkRes.rows[0].owner_id) !== String(user.id)
    ) {
      return errorResponse(
        res,
        403,
        "Permission denied. You can only edit your own farms."
      );
    }

    const result = await db.query(
      `UPDATE farms SET
         name = COALESCE($1, name),
         location = COALESCE($2, location),
         village = COALESCE($3, village),
         district = COALESCE($4, district),
         state = COALESCE($5, state),
         latitude = COALESCE($6, latitude),
         longitude = COALESCE($7, longitude),
         total_area = COALESCE($8, total_area),
         area_unit = COALESCE($9, area_unit),
         soil_type = COALESCE($10, soil_type),
         description = COALESCE($11, description),
         updated_at = CURRENT_TIMESTAMP
       WHERE id = $12
       RETURNING *`,
      [
        name,
        location,
        village,
        district,
        state,
        latitude,
        longitude,
        total_area,
        area_unit,
        soil_type,
        description,
        id
      ]
    );

    return successResponse(
      res,
      200,
      "Farm updated successfully",
      result.rows[0]
    );
  } catch (err) {
    next(err);
  }
};

/**
 * Delete a farm
 */
const deleteFarm = async (req, res, next) => {
  try {
    const { id } = req.params;
    const user = req.user;

    const checkRes = await db.query(
      "SELECT owner_id, name FROM farms WHERE id = $1",
      [id]
    );

    if (checkRes.rows.length === 0) {
      return errorResponse(res, 404, "Farm not found.");
    }

    if (
      user.role === "farmer" &&
      String(checkRes.rows[0].owner_id) !== String(user.id)
    ) {
      return errorResponse(
        res,
        403,
        "Permission denied. You can only delete your own farms."
      );
    }

    await db.query("DELETE FROM farms WHERE id = $1", [id]);

    return successResponse(
      res,
      200,
      `Farm '${checkRes.rows[0].name}' deleted successfully.`
    );
  } catch (err) {
    next(err);
  }
};

export {
  getFarms,
  getFarmById,
  createFarm,
  updateFarm,
  deleteFarm
};
