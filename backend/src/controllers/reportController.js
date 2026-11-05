const db = require('../config/db');
const { calculateCropProgress, calculateYieldDifference } = require('../services/calculationService');
const { successResponse } = require('../utils/response');

/**
 * Report A: Crop-wise Monitoring Report
 * Crop name, Farm, Plot, Planting date, Crop status, Latest soil moisture, Latest temperature, Crop growth progress
 */
const getCropMonitoringReport = async (req, res, next) => {
  try {
    const user = req.user;
    const { farm_id, crop_id, status, search } = req.query;

    let queryText = `
      SELECT c.id, 
             c.crop_name, 
             c.variety, 
             c.crop_category, 
             c.planting_date, 
             c.expected_harvest_date, 
             c.status,
             c.cultivated_area,
             p.name as plot_name,
             f.id as farm_id,
             f.name as farm_name,
             so.soil_moisture as latest_soil_moisture,
             er.temperature as latest_temperature
      FROM crops c
      JOIN plots p ON c.plot_id = p.id
      JOIN farms f ON p.farm_id = f.id
      LEFT JOIN (
        SELECT crop_id, MAX(soil_moisture) as soil_moisture 
        FROM soil_observations 
        GROUP BY crop_id
      ) so ON so.crop_id = c.id
      LEFT JOIN (
        SELECT plot_id, MAX(temperature) as temperature 
        FROM environmental_readings 
        GROUP BY plot_id
      ) er ON er.plot_id = p.id
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

    if (crop_id) {
      queryText += ` AND c.id = $${paramIndex++}`;
      params.push(crop_id);
    }

    if (status) {
      queryText += ` AND c.status = $${paramIndex++}`;
      params.push(status);
    }

    if (search) {
      queryText += ` AND (c.crop_name ILIKE $${paramIndex} OR f.name ILIKE $${paramIndex} OR p.name ILIKE $${paramIndex})`;
      params.push(`%${search}%`);
      paramIndex++;
    }

    queryText += ` ORDER BY c.planting_date DESC`;

    const result = await db.query(queryText, params);

    const reportRows = result.rows.map(row => ({
      ...row,
      growth_progress: calculateCropProgress(row.planting_date, row.expected_harvest_date),
      latest_soil_moisture: row.latest_soil_moisture !== null ? `${row.latest_soil_moisture}%` : 'N/A',
      latest_temperature: row.latest_temperature !== null ? `${row.latest_temperature}°C` : 'N/A'
    }));

    return successResponse(res, 200, 'Crop-wise monitoring report generated', reportRows, {
      total_crops_reported: reportRows.length
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Report B: Farm Activity Report
 * Farm name, Activity type, Activity date, Crop, Labour hours, Activity cost, Activity status
 */
const getFarmActivitiesReport = async (req, res, next) => {
  try {
    const user = req.user;
    const { farm_id, activity_type, status, startDate, endDate, search } = req.query;

    let queryText = `
      SELECT fa.id,
             f.name as farm_name,
             p.name as plot_name,
             fa.activity_type,
             fa.activity_date,
             COALESCE(c.crop_name, 'General Plot Activity') as crop_name,
             fa.labour_hours,
             fa.cost,
             fa.status,
             fa.description
      FROM farm_activities fa
      JOIN farms f ON fa.farm_id = f.id
      JOIN plots p ON fa.plot_id = p.id
      LEFT JOIN crops c ON fa.crop_id = c.id
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
      queryText += ` AND (f.name ILIKE $${paramIndex} OR fa.activity_type ILIKE $${paramIndex} OR fa.description ILIKE $${paramIndex})`;
      params.push(`%${search}%`);
      paramIndex++;
    }

    queryText += ` ORDER BY fa.activity_date DESC`;

    const result = await db.query(queryText, params);

    let totalCost = 0;
    let totalLabourHours = 0;
    result.rows.forEach(r => {
      totalCost += parseFloat(r.cost || 0);
      totalLabourHours += parseFloat(r.labour_hours || 0);
    });

    return successResponse(res, 200, 'Farm activity report generated', result.rows, {
      total_activities: result.rows.length,
      total_cost: parseFloat(totalCost.toFixed(2)),
      total_labour_hours: parseFloat(totalLabourHours.toFixed(1))
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Report C: Irrigation Report
 * Farm, Plot, Crop, Irrigation method, Irrigation date, Water quantity, Duration, Status
 */
const getIrrigationReport = async (req, res, next) => {
  try {
    const user = req.user;
    const { farm_id, method, status, startDate, endDate, search } = req.query;

    let queryText = `
      SELECT ir.id,
             f.name as farm_name,
             p.name as plot_name,
             COALESCE(c.crop_name, 'Whole Plot') as crop_name,
             ir.irrigation_method,
             ir.scheduled_date as irrigation_date,
             ir.actual_irrigation_date,
             ir.water_quantity_litres,
             ir.duration_minutes,
             ir.status,
             ir.notes
      FROM irrigation_records ir
      JOIN farms f ON ir.farm_id = f.id
      JOIN plots p ON ir.plot_id = p.id
      LEFT JOIN crops c ON ir.crop_id = c.id
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

    if (method) {
      queryText += ` AND ir.irrigation_method = $${paramIndex++}`;
      params.push(method);
    }

    if (status) {
      queryText += ` AND ir.status = $${paramIndex++}`;
      params.push(status);
    }

    if (startDate) {
      queryText += ` AND ir.scheduled_date >= $${paramIndex++}`;
      params.push(startDate);
    }

    if (endDate) {
      queryText += ` AND ir.scheduled_date <= $${paramIndex++}`;
      params.push(endDate);
    }

    if (search) {
      queryText += ` AND (f.name ILIKE $${paramIndex} OR p.name ILIKE $${paramIndex} OR ir.irrigation_method ILIKE $${paramIndex})`;
      params.push(`%${search}%`);
      paramIndex++;
    }

    queryText += ` ORDER BY ir.scheduled_date DESC`;

    const result = await db.query(queryText, params);

    let totalWaterLitres = 0;
    let totalMinutes = 0;
    result.rows.forEach(r => {
      totalWaterLitres += parseFloat(r.water_quantity_litres || 0);
      totalMinutes += parseInt(r.duration_minutes || 0, 10);
    });

    return successResponse(res, 200, 'Irrigation report generated', result.rows, {
      total_irrigation_events: result.rows.length,
      total_water_litres: parseFloat(totalWaterLitres.toFixed(2)),
      total_duration_hours: parseFloat((totalMinutes / 60).toFixed(1))
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Report D: Yield / Production Report
 * Farm, Plot, Crop, Cultivated area, Expected yield, Actual yield, Yield unit, Production difference
 */
const getYieldReport = async (req, res, next) => {
  try {
    const user = req.user;
    const { farm_id, status, search } = req.query;

    let queryText = `
      SELECT c.id,
             f.name as farm_name,
             p.name as plot_name,
             c.crop_name,
             c.variety,
             c.crop_category,
             c.cultivated_area,
             c.expected_yield,
             c.actual_yield,
             c.yield_unit,
             c.status,
             c.planting_date,
             c.actual_harvest_date
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

    if (status) {
      queryText += ` AND c.status = $${paramIndex++}`;
      params.push(status);
    }

    if (search) {
      queryText += ` AND (c.crop_name ILIKE $${paramIndex} OR f.name ILIKE $${paramIndex} OR c.variety ILIKE $${paramIndex})`;
      params.push(`%${search}%`);
      paramIndex++;
    }

    queryText += ` ORDER BY c.planting_date DESC`;

    const result = await db.query(queryText, params);

    let totalExpectedYield = 0;
    let totalActualYield = 0;
    let completedHarvestCount = 0;

    const reportRows = result.rows.map(row => {
      const yieldCalc = calculateYieldDifference(row.actual_yield, row.expected_yield);

      if (row.expected_yield !== null) totalExpectedYield += parseFloat(row.expected_yield);
      if (row.actual_yield !== null) {
        totalActualYield += parseFloat(row.actual_yield);
        completedHarvestCount++;
      }

      return {
        ...row,
        production_difference: yieldCalc.difference !== null ? `${yieldCalc.difference > 0 ? '+' : ''}${yieldCalc.difference} ${row.yield_unit}` : 'Pending Harvest',
        variance_percentage: yieldCalc.percentageDiff !== null ? `${yieldCalc.percentageDiff}%` : 'N/A',
        production_status: yieldCalc.status
      };
    });

    const netVariance = parseFloat((totalActualYield - totalExpectedYield).toFixed(2));

    return successResponse(res, 200, 'Yield and production report generated', reportRows, {
      total_crops_evaluated: reportRows.length,
      completed_harvests: completedHarvestCount,
      total_expected_yield: parseFloat(totalExpectedYield.toFixed(2)),
      total_actual_yield: parseFloat(totalActualYield.toFixed(2)),
      net_variance: netVariance
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getCropMonitoringReport,
  getFarmActivitiesReport,
  getIrrigationReport,
  getYieldReport
};
