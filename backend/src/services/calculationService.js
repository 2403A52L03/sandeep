/**
 * Business logic calculations for crop progress, yield variance,
 * irrigation consumption, activity costs, and agronomic threshold alerts.
 */

/**
 * Calculates crop cultivation progress percentage
 * @param {string|Date} plantingDate 
 * @param {string|Date} expectedHarvestDate 
 * @returns {number|string} Progress percentage (0-100) or 'Not available'
 */
const calculateCropProgress = (plantingDate, expectedHarvestDate) => {
  if (!plantingDate || !expectedHarvestDate) return 'Not available';

  const start = new Date(plantingDate).getTime();
  const end = new Date(expectedHarvestDate).getTime();
  const now = new Date().getTime();

  if (isNaN(start) || isNaN(end) || end <= start) return 'Not available';

  const totalDurationMs = end - start;
  const elapsedMs = now - start;

  if (elapsedMs <= 0) return 0;
  if (elapsedMs >= totalDurationMs) return 100;

  const percentage = Math.round((elapsedMs / totalDurationMs) * 100);
  return Math.min(100, Math.max(0, percentage));
};

/**
 * Calculates days remaining until expected harvest
 * @param {string|Date} expectedHarvestDate 
 * @param {string} status 
 * @returns {object} { days: number, isOverdue: boolean, label: string }
 */
const calculateDaysUntilHarvest = (expectedHarvestDate, status = '') => {
  if (!expectedHarvestDate) {
    return { days: null, isOverdue: false, label: 'No harvest date configured' };
  }

  if (status.toLowerCase() === 'harvested') {
    return { days: 0, isOverdue: false, label: 'Harvested' };
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const targetDate = new Date(expectedHarvestDate);
  targetDate.setHours(0, 0, 0, 0);

  const diffTime = targetDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    return {
      days: Math.abs(diffDays),
      isOverdue: true,
      label: `${Math.abs(diffDays)} days overdue for harvest`
    };
  } else if (diffDays === 0) {
    return {
      days: 0,
      isOverdue: false,
      label: 'Due for harvest today'
    };
  } else {
    return {
      days: diffDays,
      isOverdue: false,
      label: `${diffDays} days remaining`
    };
  }
};

/**
 * Calculates yield difference: Actual Yield - Expected Yield
 * @param {number} actualYield 
 * @param {number} expectedYield 
 * @returns {object} { difference, percentageDiff, status }
 */
const calculateYieldDifference = (actualYield, expectedYield) => {
  if (actualYield === null || actualYield === undefined || expectedYield === null || expectedYield === undefined) {
    return { difference: null, percentageDiff: null, status: 'Pending' };
  }

  const act = parseFloat(actualYield);
  const exp = parseFloat(expectedYield);

  if (isNaN(act) || isNaN(exp)) {
    return { difference: null, percentageDiff: null, status: 'Invalid' };
  }

  const diff = parseFloat((act - exp).toFixed(2));
  const pct = exp > 0 ? parseFloat(((diff / exp) * 100).toFixed(1)) : 0;

  return {
    difference: diff,
    percentageDiff: pct,
    status: diff > 0 ? 'Surplus' : diff < 0 ? 'Deficit' : 'On Target'
  };
};

/**
 * Agronomic Thresholds for Environmental and Soil Readings
 * Configurable demo thresholds as required by specification
 */
const SENSOR_THRESHOLDS = {
  soilMoisture: { min: 30.0, max: 70.0, unit: '%' },
  temperature: { min: 18.0, max: 38.0, unit: '°C' },
  humidity: { min: 40.0, max: 85.0, unit: '%' },
  soilPh: { min: 6.0, max: 7.8, unit: 'pH' }
};

/**
 * Evaluates an observation reading against configurable alert thresholds
 */
const evaluateSensorAlerts = (reading) => {
  const alerts = [];

  if (reading.soil_moisture !== undefined && reading.soil_moisture !== null) {
    const moisture = parseFloat(reading.soil_moisture);
    if (moisture < SENSOR_THRESHOLDS.soilMoisture.min) {
      alerts.push({
        severity: 'critical',
        parameter: 'Soil Moisture',
        message: `Critically low soil moisture (${moisture}%). Minimum threshold: ${SENSOR_THRESHOLDS.soilMoisture.min}%. Irrigation cycle advised.`
      });
    } else if (moisture > SENSOR_THRESHOLDS.soilMoisture.max) {
      alerts.push({
        severity: 'warning',
        parameter: 'Soil Moisture',
        message: `High soil moisture (${moisture}%). Maximum threshold: ${SENSOR_THRESHOLDS.soilMoisture.max}%. Risk of waterlogging.`
      });
    }
  }

  if (reading.temperature !== undefined && reading.temperature !== null) {
    const temp = parseFloat(reading.temperature);
    if (temp > SENSOR_THRESHOLDS.temperature.max) {
      alerts.push({
        severity: 'warning',
        parameter: 'Ambient Temperature',
        message: `Elevated temperature (${temp}°C). Heat stress precaution recommended.`
      });
    }
  }

  if (reading.soil_ph !== undefined && reading.soil_ph !== null) {
    const ph = parseFloat(reading.soil_ph);
    if (ph < SENSOR_THRESHOLDS.soilPh.min || ph > SENSOR_THRESHOLDS.soilPh.max) {
      alerts.push({
        severity: 'warning',
        parameter: 'Soil pH',
        message: `Soil pH (${ph}) outside optimal range (6.0 - 7.8). Nutrient uptake may be restricted.`
      });
    }
  }

  return alerts;
};

module.exports = {
  calculateCropProgress,
  calculateDaysUntilHarvest,
  calculateYieldDifference,
  SENSOR_THRESHOLDS,
  evaluateSensorAlerts
};
