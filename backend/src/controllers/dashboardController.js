const db = require('../config/db');
const { calculateCropProgress, calculateDaysUntilHarvest, evaluateSensorAlerts } = require('../services/calculationService');
const { successResponse } = require('../utils/response');

/**
 * Get comprehensive dashboard overview and KPI statistics
 */
const getSummary = async (req, res, next) => {
  try {
    const user = req.user;
    const { farm_id } = req.query;

    let farmScope = '';
    const params = [];
    if (user.role === 'farmer') {
      farmScope = ' AND f.owner_id = $1';
      params.push(user.id);
    } else if (farm_id) {
      farmScope = ' AND f.id = $1';
      params.push(farm_id);
    }

    // 1. Total Farms
    let totalFarmsQ = 'SELECT COUNT(*)::int as count FROM farms f WHERE 1=1' + farmScope;
    const farmsRes = await db.query(totalFarmsQ, params);
    const totalFarms = farmsRes.rows[0].count;

    // 2. Total Agricultural Plots
    let totalPlotsQ = 'SELECT COUNT(p.*)::int as count FROM plots p JOIN farms f ON p.farm_id = f.id WHERE 1=1' + farmScope;
    const plotsRes = await db.query(totalPlotsQ, params);
    const totalPlots = plotsRes.rows[0].count;

    // 3. Active Crops
    let activeCropsQ = `
      SELECT COUNT(c.*)::int as count 
      FROM crops c 
      JOIN plots p ON c.plot_id = p.id 
      JOIN farms f ON p.farm_id = f.id 
      WHERE c.status NOT IN ('Harvested', 'Failed')` + farmScope;
    const activeCropsRes = await db.query(activeCropsQ, params);
    const activeCrops = activeCropsRes.rows[0].count;

    // 4. Crops Near Harvest (due within next 15 days or overdue)
    let nearHarvestQ = `
      SELECT c.*, p.name as plot_name, f.name as farm_name
      FROM crops c
      JOIN plots p ON c.plot_id = p.id
      JOIN farms f ON p.farm_id = f.id
      WHERE c.status NOT IN ('Harvested', 'Failed')
      ${farmScope}
      ORDER BY c.expected_harvest_date ASC
    `;
    const cropsRes = await db.query(nearHarvestQ, params);
    let nearHarvestCount = 0;
    const upcomingCrops = [];

    cropsRes.rows.forEach(crop => {
      const harvestInfo = calculateDaysUntilHarvest(crop.expected_harvest_date, crop.status);
      const progress = calculateCropProgress(crop.planting_date, crop.expected_harvest_date);
      if (harvestInfo.isOverdue || (harvestInfo.days !== null && harvestInfo.days <= 20)) {
        nearHarvestCount++;
        upcomingCrops.push({
          id: crop.id,
          crop_name: crop.crop_name,
          variety: crop.variety,
          farm_name: crop.farm_name,
          plot_name: crop.plot_name,
          expected_harvest_date: crop.expected_harvest_date,
          days_until_harvest: harvestInfo.days,
          is_overdue: harvestInfo.isOverdue,
          harvest_label: harvestInfo.label,
          progress
        });
      }
    });

    // 5. Irrigation Activities count (Scheduled & In Progress)
    let irrigationQ = `
      SELECT COUNT(ir.*)::int as count,
             COALESCE(SUM(ir.water_quantity_litres), 0)::numeric as total_water_litres
      FROM irrigation_records ir
      JOIN farms f ON ir.farm_id = f.id
      WHERE 1=1 ${farmScope}`;
    const irrRes = await db.query(irrigationQ, params);
    const irrigationCount = irrRes.rows[0].count;
    const totalWaterUsageLitres = parseFloat(irrRes.rows[0].total_water_litres);

    // 6. Recent environmental readings and active alert count
    let envQ = `
      SELECT er.*, f.name as farm_name, p.name as plot_name
      FROM environmental_readings er
      JOIN farms f ON er.farm_id = f.id
      JOIN plots p ON er.plot_id = p.id
      WHERE 1=1 ${farmScope}
      ORDER BY er.recorded_at DESC
      LIMIT 10
    `;
    const envRes = await db.query(envQ, params);
    const activeAlerts = [];
    envRes.rows.forEach(r => {
      const alerts = evaluateSensorAlerts(r);
      alerts.forEach(a => {
        activeAlerts.push({
          farm_name: r.farm_name,
          plot_name: r.plot_name,
          recorded_at: r.recorded_at,
          ...a
        });
      });
    });

    // 7. Recent farm activities
    let activitiesQ = `
      SELECT fa.*, f.name as farm_name, p.name as plot_name, c.crop_name
      FROM farm_activities fa
      JOIN farms f ON fa.farm_id = f.id
      JOIN plots p ON fa.plot_id = p.id
      LEFT JOIN crops c ON fa.crop_id = c.id
      WHERE 1=1 ${farmScope}
      ORDER BY fa.activity_date DESC
      LIMIT 5
    `;
    const activitiesRes = await db.query(activitiesQ, params);

    // 8. Upcoming irrigation schedule
    let upcomingIrrQ = `
      SELECT ir.*, f.name as farm_name, p.name as plot_name, c.crop_name
      FROM irrigation_records ir
      JOIN farms f ON ir.farm_id = f.id
      JOIN plots p ON ir.plot_id = p.id
      LEFT JOIN crops c ON ir.crop_id = c.id
      WHERE ir.status IN ('Scheduled', 'In Progress') ${farmScope}
      ORDER BY ir.scheduled_date ASC
      LIMIT 5
    `;
    const upcomingIrrRes = await db.query(upcomingIrrQ, params);

    return successResponse(res, 200, 'Dashboard summary retrieved', {
      kpi: {
        total_farms: totalFarms,
        total_plots: totalPlots,
        active_crops: activeCrops,
        crops_near_harvest: nearHarvestCount,
        irrigation_activities: irrigationCount,
        total_water_usage_litres: totalWaterUsageLitres,
        environmental_alerts_count: activeAlerts.length
      },
      widgets: {
        upcoming_harvests: upcomingCrops,
        recent_activities: activitiesRes.rows,
        upcoming_irrigation: upcomingIrrRes.rows,
        environmental_alerts: activeAlerts.slice(0, 5),
        recent_sensor_readings: envRes.rows.slice(0, 5)
      }
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Crop-wise distribution data for Pie Chart
 */
const getCropDistribution = async (req, res, next) => {
  try {
    const user = req.user;
    const { farm_id } = req.query;

    let farmScope = '';
    const params = [];
    if (user.role === 'farmer') {
      farmScope = ' AND f.owner_id = $1';
      params.push(user.id);
    } else if (farm_id) {
      farmScope = ' AND f.id = $1';
      params.push(farm_id);
    }

    const queryText = `
      SELECT c.crop_name, 
             c.crop_category,
             COUNT(*)::int as count,
             COALESCE(SUM(c.cultivated_area), 0)::numeric as total_area
      FROM crops c
      JOIN plots p ON c.plot_id = p.id
      JOIN farms f ON p.farm_id = f.id
      WHERE 1=1 ${farmScope}
      GROUP BY c.crop_name, c.crop_category
      ORDER BY total_area DESC
    `;

    const result = await db.query(queryText, params);
    return successResponse(res, 200, 'Crop distribution data', result.rows);
  } catch (err) {
    next(err);
  }
};

/**
 * Monthly farm activity counts and expenditure for Bar Chart
 */
const getMonthlyActivityTrends = async (req, res, next) => {
  try {
    const user = req.user;
    const { farm_id } = req.query;

    let farmScope = '';
    const params = [];
    if (user.role === 'farmer') {
      farmScope = ' AND f.owner_id = $1';
      params.push(user.id);
    } else if (farm_id) {
      farmScope = ' AND f.id = $1';
      params.push(farm_id);
    }

    const queryText = `
      SELECT TO_CHAR(fa.activity_date, 'Mon YYYY') as month,
             COUNT(*)::int as activity_count,
             COALESCE(SUM(fa.cost), 0)::numeric as total_cost,
             COALESCE(SUM(fa.labour_hours), 0)::numeric as total_hours
      FROM farm_activities fa
      JOIN farms f ON fa.farm_id = f.id
      WHERE 1=1 ${farmScope}
      GROUP BY TO_CHAR(fa.activity_date, 'Mon YYYY'), DATE_TRUNC('month', fa.activity_date)
      ORDER BY DATE_TRUNC('month', fa.activity_date) ASC
      LIMIT 12
    `;

    const result = await db.query(queryText, params);
    return successResponse(res, 200, 'Monthly farm activity trends', result.rows);
  } catch (err) {
    next(err);
  }
};

/**
 * Soil moisture trends for Line Chart
 */
const getSoilMoistureTrends = async (req, res, next) => {
  try {
    const user = req.user;
    const { farm_id } = req.query;

    let farmScope = '';
    const params = [];
    if (user.role === 'farmer') {
      farmScope = ' AND f.owner_id = $1';
      params.push(user.id);
    } else if (farm_id) {
      farmScope = ' AND f.id = $1';
      params.push(farm_id);
    }

    const queryText = `
      SELECT TO_CHAR(so.observation_date, 'YYYY-MM-DD') as date,
             so.observation_date,
             so.soil_moisture,
             so.soil_temperature,
             so.soil_ph,
             p.name as plot_name,
             c.crop_name
      FROM soil_observations so
      JOIN farms f ON so.farm_id = f.id
      JOIN plots p ON so.plot_id = p.id
      LEFT JOIN crops c ON so.crop_id = c.id
      WHERE 1=1 ${farmScope}
      ORDER BY so.observation_date ASC
      LIMIT 20
    `;

    const result = await db.query(queryText, params);
    return successResponse(res, 200, 'Soil moisture trend records', result.rows);
  } catch (err) {
    next(err);
  }
};

/**
 * Irrigation usage trends (water quantity by date/method)
 */
const getIrrigationUsageTrends = async (req, res, next) => {
  try {
    const user = req.user;
    const { farm_id } = req.query;

    let farmScope = '';
    const params = [];
    if (user.role === 'farmer') {
      farmScope = ' AND f.owner_id = $1';
      params.push(user.id);
    } else if (farm_id) {
      farmScope = ' AND f.id = $1';
      params.push(farm_id);
    }

    const queryText = `
      SELECT ir.irrigation_method,
             TO_CHAR(ir.scheduled_date, 'YYYY-MM-DD') as date,
             COALESCE(SUM(ir.water_quantity_litres), 0)::numeric as total_litres,
             COUNT(*)::int as events_count
      FROM irrigation_records ir
      JOIN farms f ON ir.farm_id = f.id
      WHERE 1=1 ${farmScope}
      GROUP BY ir.irrigation_method, ir.scheduled_date
      ORDER BY ir.scheduled_date ASC
      LIMIT 20
    `;

    const result = await db.query(queryText, params);
    return successResponse(res, 200, 'Irrigation usage trends', result.rows);
  } catch (err) {
    next(err);
  }
};

/**
 * Active Crop growth progress for Progress Chart
 */
const getCropProgressTrends = async (req, res, next) => {
  try {
    const user = req.user;
    const { farm_id } = req.query;

    let farmScope = '';
    const params = [];
    if (user.role === 'farmer') {
      farmScope = ' AND f.owner_id = $1';
      params.push(user.id);
    } else if (farm_id) {
      farmScope = ' AND f.id = $1';
      params.push(farm_id);
    }

    const queryText = `
      SELECT c.id, c.crop_name, c.variety, c.status, c.planting_date, c.expected_harvest_date, p.name as plot_name
      FROM crops c
      JOIN plots p ON c.plot_id = p.id
      JOIN farms f ON p.farm_id = f.id
      WHERE c.status NOT IN ('Harvested', 'Failed') ${farmScope}
      ORDER BY c.planting_date ASC
    `;

    const result = await db.query(queryText, params);
    const progressData = result.rows.map(crop => ({
      crop_name: `${crop.crop_name} (${crop.plot_name})`,
      progress: calculateCropProgress(crop.planting_date, crop.expected_harvest_date),
      status: crop.status
    }));

    return successResponse(res, 200, 'Crop growth progress data', progressData);
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getSummary,
  getCropDistribution,
  getMonthlyActivityTrends,
  getSoilMoistureTrends,
  getIrrigationUsageTrends,
  getCropProgressTrends
};
