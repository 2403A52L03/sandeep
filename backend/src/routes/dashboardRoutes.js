const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const { authenticateToken } = require('../middleware/auth');

router.use(authenticateToken);

router.get('/summary', dashboardController.getSummary);
router.get('/crop-distribution', dashboardController.getCropDistribution);
router.get('/monthly-activity', dashboardController.getMonthlyActivityTrends);
router.get('/soil-trends', dashboardController.getSoilMoistureTrends);
router.get('/irrigation-trends', dashboardController.getIrrigationUsageTrends);
router.get('/crop-progress', dashboardController.getCropProgressTrends);

module.exports = router;

