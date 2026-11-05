const db = require('../config/db');
const { generateSimulatedReading } = require('../services/simulationService');
const { evaluateSensorAlerts } = require('../services/calculationService');
const { successResponse, errorResponse } = require('../utils/response');

/**
 * Get soil observations with filters
 */
const getSoilObservations = async (req, res, next) => {
  try {
    const { farm_id, plot_id, crop_id, startDate, endDate } = req.query;
    const user = req.user;

    let queryText = `
      SELECT so.*, 
             f.name as farm_name,
             p.name as plot_name,
             c.crop_name,
             u.full_name as recorder_name
      FROM soil_observations so
      JOIN farms f ON so.farm_id = f.id
      JOIN plots p ON so.plot_id = p.id
      LEFT JOIN crops c ON so.crop_id = c.id
      LEFT JOIN users u ON so.created_by = u.id
      WHERE 1=1
    `;
    const params = [];
    let paramIndex = 1;

    if (user.role === 'farmer') {
      queryText += ` AND f.owner_id = $${paramIndex++}`;
      params.push(user.id);
    }

    if (farm_id) {
      queryText += ` AND so.farm_id = $${paramIndex++}`;
      params.push(farm_id);
    }

    if (plot_id) {
      queryText += ` AND so.plot_id = $${paramIndex++}`;
      params.push(plot_id);
    }

    if (crop_id) {
      queryText += ` AND so.crop_id = $${paramIndex++}`;
      params.push(crop_id);
    }

    if (startDate) {
      queryText += ` AND so.observation_date >= $${paramIndex++}`;
      params.push(startDate);
    }

    if (endDate) {
      queryText += ` AND so.observation_date <= $${paramIndex++}`;
      params.push(endDate);
    }

    queryText += ` ORDER BY so.observation_date DESC, so.created_at DESC`;

    const result = await db.query(queryText, params);

    // Attach alert evaluations
    const observations = result.rows.map(obs => ({
      ...obs,
      alerts: evaluateSensorAlerts(obs)
    }));

    return successResponse(res, 200, 'Soil observations retrieved', observations);
  } catch (err) {
    next(err);
  }
};

/**
 * Record a new soil observation
 */
const createSoilObservation = async (req, res, next) => {
  try {
    const user = req.user;
    const {
      farm_id,
      plot_id,
      crop_id,
      observation_date,
      soil_moisture,
      soil_temperature,
      soil_ph,
      nitrogen,
      phosphorus,
      potassium,
      notes
    } = req.body;

    const result = await db.query(
      `INSERT INTO soil_observations (
         farm_id, plot_id, crop_id, observation_date, soil_moisture, 
         soil_temperature, soil_ph, nitrogen, phosphorus, potassium, notes, created_by
       )
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
       RETURNING *`,
      [
        farm_id,
        plot_id,
        crop_id || null,
        observation_date,
        soil_moisture || null,
        soil_temperature || null,
        soil_ph || null,
        nitrogen || null,
        phosphorus || null,
        potassium || null,
        notes || null,
        user.id
      ]
    );

    const record = result.rows[0];
    record.alerts = evaluateSensorAlerts(record);

    return successResponse(res, 201, 'Soil observation recorded successfully', record);
  } catch (err) {
    next(err);
  }
};

/**
 * Get environmental telemetry streams (simulated/sensor readings)
 */
const getEnvironmentalReadings = async (req, res, next) => {
  try {
    const { farm_id, plot_id, limit = 50 } = req.query;
    const user = req.user;

    let queryText = `
      SELECT er.*, 
             f.name as farm_name,
             p.name as plot_name
      FROM environmental_readings er
      JOIN farms f ON er.farm_id = f.id
      JOIN plots p ON er.plot_id = p.id
      WHERE 1=1
    `;
    const params = [];
    let paramIndex = 1;

    if (user.role === 'farmer') {
      queryText += ` AND f.owner_id = $${paramIndex++}`;
      params.push(user.id);
    }

    if (farm_id) {
      queryText += ` AND er.farm_id = $${paramIndex++}`;
      params.push(farm_id);
    }

    if (plot_id) {
      queryText += ` AND er.plot_id = $${paramIndex++}`;
      params.push(plot_id);
    }

    queryText += ` ORDER BY er.recorded_at DESC LIMIT $${paramIndex}`;
    params.push(parseInt(limit, 10));

    const result = await db.query(queryText, params);

    const readings = result.rows.map(r => ({
      ...r,
      alerts: evaluateSensorAlerts(r)
    }));

    return successResponse(res, 200, 'Environmental readings retrieved', readings);
  } catch (err) {
    next(err);
  }
};

/**
 * Trigger simulated telemetry stream for demonstration
 * Accurately labeled "Simulated (Demo)"
 */
const triggerSimulation = async (req, res, next) => {
  try {
    const { farm_id, plot_id } = req.body;

    let targetFarmId = farm_id;
    let targetPlotId = plot_id;

    // If not supplied, pick the first available farm and plot
    if (!targetFarmId || !targetPlotId) {
      const firstPlot = await db.query('SELECT id, farm_id FROM plots ORDER BY id ASC LIMIT 1');
      if (firstPlot.rows.length === 0) {
        return errorResponse(res, 400, 'Please register at least one farm and plot before simulating sensor streams.');
      }
      targetFarmId = firstPlot.rows[0].farm_id;
      targetPlotId = firstPlot.rows[0].id;
    }

    const simulated = generateSimulatedReading(targetFarmId, targetPlotId, 'Simulated (Demo)');

    const result = await db.query(
      `INSERT INTO environmental_readings (
         farm_id, plot_id, temperature, humidity, rainfall, wind_speed, soil_moisture, data_source, recorded_at
       )
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [
        simulated.farm_id,
        simulated.plot_id,
        simulated.temperature,
        simulated.humidity,
        simulated.rainfall,
        simulated.wind_speed,
        simulated.soil_moisture,
        simulated.data_source,
        simulated.recorded_at
      ]
    );

    const newReading = result.rows[0];
    newReading.alerts = evaluateSensorAlerts(newReading);

    return successResponse(
      res,
      201,
      'Simulated environmental sensor reading generated and logged to database.',
      newReading
    );
  } catch (err) {
    next(err);
  }
};

/**
 * Get environmental and soil trend aggregates for Recharts
 */
const getTrends = async (req, res, next) => {
  try {
    const { farm_id } = req.query;
    const user = req.user;

    let whereClause = 'WHERE 1=1';
    const params = [];

    if (user.role === 'farmer') {
      whereClause += ' AND f.owner_id = $1';
      params.push(user.id);
    } else if (farm_id) {
      whereClause += ' AND er.farm_id = $1';
      params.push(farm_id);
    }

    const queryText = `
      SELECT TO_CHAR(er.recorded_at, 'MM/DD HH24:MI') as timestamp_label,
             er.recorded_at,
             er.temperature,
             er.humidity,
             er.soil_moisture,
             er.rainfall,
             p.name as plot_name
      FROM environmental_readings er
      JOIN farms f ON er.farm_id = f.id
      JOIN plots p ON er.plot_id = p.id
      ${whereClause}
      ORDER BY er.recorded_at ASC
      LIMIT 30
    `;

    const result = await db.query(queryText, params);
    return successResponse(res, 200, 'Trend series retrieved', result.rows);
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getSoilObservations,
  createSoilObservation,
  getEnvironmentalReadings,
  triggerSimulation,
  getTrends
};
