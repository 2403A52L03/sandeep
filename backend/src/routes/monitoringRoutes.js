const express = require('express');
const router = express.Router();
const monitoringController = require('../controllers/monitoringController');
const { soilObservationValidator, environmentalReadingValidator } = require('../validators/monitoringValidator');
const { authenticateToken } = require('../middleware/auth');
const { authorizeRoles } = require('../middleware/rbac');

router.use(authenticateToken);

// Soil Observations
router.get('/soil', monitoringController.getSoilObservations);
router.post('/soil', authorizeRoles('admin', 'farmer', 'officer', 'agronomist'), soilObservationValidator, monitoringController.createSoilObservation);

// Environmental Telemetry Streams
router.get('/environment', monitoringController.getEnvironmentalReadings);
router.post('/environment/simulate', monitoringController.triggerSimulation);

// Trends for Recharts
router.get('/trends', monitoringController.getTrends);

module.exports = router;
