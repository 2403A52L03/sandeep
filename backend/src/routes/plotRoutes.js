const express = require('express');
const router = express.Router();
const plotController = require('../controllers/plotController');
const { plotValidator } = require('../validators/plotValidator');
const { authenticateToken } = require('../middleware/auth');
const { authorizeRoles } = require('../middleware/rbac');

router.use(authenticateToken);

router.get('/', plotController.getPlots);
router.get('/:id', plotController.getPlotById);
router.post('/', authorizeRoles('admin', 'farmer', 'officer'), plotValidator, plotController.createPlot);
router.put('/:id', authorizeRoles('admin', 'farmer', 'officer'), plotValidator, plotController.updatePlot);
router.delete('/:id', authorizeRoles('admin', 'farmer'), plotController.deletePlot);

module.exports = router;

