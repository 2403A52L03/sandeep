const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const { authenticateToken } = require('../middleware/auth');

router.use(authenticateToken);

router.get('/crop-monitoring', reportController.getCropMonitoringReport);
router.get('/farm-activities', reportController.getFarmActivitiesReport);
router.get('/irrigation', reportController.getIrrigationReport);
router.get('/yield', reportController.getYieldReport);

module.exports = router;

