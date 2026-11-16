const express = require('express');
const router = express.Router();
const activityController = require('../controllers/activityController');
const { activityValidator } = require('../validators/activityValidator');
const { authenticateToken } = require('../middleware/auth');
const { authorizeRoles } = require('../middleware/rbac');

router.use(authenticateToken);

router.get('/', activityController.getActivities);
router.get('/:id', activityController.getActivityById);
router.post('/', authorizeRoles('admin', 'farmer', 'officer'), activityValidator, activityController.createActivity);
router.put('/:id', authorizeRoles('admin', 'farmer', 'officer'), activityController.updateActivity);
router.delete('/:id', authorizeRoles('admin', 'farmer'), activityController.deleteActivity);

module.exports = router;

