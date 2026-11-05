/**
 * Simulated Environmental Sensor Service
 * Simulates microclimate and soil telemetry using realistic diurnal curves and variance.
 * Clearly flagged as "Simulated (Demo)" in adherence to project specifications.
 */

/**
 * Generates realistic agricultural telemetry for a specific plot
 * @param {number} farmId 
 * @param {number} plotId 
 * @param {string} dataSource 
 * @returns {object} Sensor observation record
 */
const generateSimulatedReading = (farmId, plotId, dataSource = 'Simulated (Demo)') => {
  const currentHour = new Date().getHours();

  // Diurnal temperature cycle: coolest at 5 AM (~20°C), peak at 2 PM (~34°C)
  const baseTemp = 27 + 6 * Math.sin(((currentHour - 8) / 24) * 2 * Math.PI);
  const tempVariance = (Math.random() - 0.5) * 2;
  const temperature = parseFloat((baseTemp + tempVariance).toFixed(1));

  // Humidity inverse to temperature: higher early morning, lower in afternoon
  const baseHumidity = 70 - 20 * Math.sin(((currentHour - 8) / 24) * 2 * Math.PI);
  const humidityVariance = (Math.random() - 0.5) * 5;
  const humidity = parseFloat(Math.min(95, Math.max(30, baseHumidity + humidityVariance)).toFixed(1));

  // Wind speed in km/h (moderate breeze between 4 - 16 km/h)
  const windSpeed = parseFloat((6 + Math.random() * 8).toFixed(1));

  // Rainfall: 85% chance of 0mm, occasional light rain
  const hasRain = Math.random() < 0.15;
  const rainfall = hasRain ? parseFloat((Math.random() * 8).toFixed(1)) : 0.0;

  // Soil moisture: 35% to 55% typical range
  const soilMoisture = parseFloat((35 + Math.random() * 20).toFixed(1));

  return {
    farm_id: farmId,
    plot_id: plotId,
    temperature,
    humidity,
    rainfall,
    wind_speed: windSpeed,
    soil_moisture: soilMoisture,
    data_source: dataSource,
    recorded_at: new Date().toISOString()
  };
};

module.exports = {
  generateSimulatedReading
};
