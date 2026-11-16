const express = require('express');
const router = express.Router();
const irrigationController = require('../controllers/irrigationController');
const { irrigationValidator } = require('../validators/irrigationValidator');
const { authenticateToken } = require('../middleware/auth');
const { authorizeRoles } = require('../middleware/rbac');

router.use(authenticateToken);

router.get('/', irrigationController.getIrrigationRecords);
router.get('/:id', irrigationController.getIrrigationById);
router.post('/', authorizeRoles('admin', 'farmer', 'officer'), irrigationValidator, irrigationController.createIrrigationRecord);
router.put('/:id', authorizeRoles('admin', 'farmer', 'officer'), irrigationController.updateIrrigationRecord);
router.delete('/:id', authorizeRoles('admin', 'farmer'), irrigationController.deleteIrrigationRecord);

module.exports = router;

