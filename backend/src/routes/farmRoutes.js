const express = require('express');
const router = express.Router();
const farmController = require('../controllers/farmController');
const { farmValidator } = require('../validators/farmValidator');
const { authenticateToken } = require('../middleware/auth');
const { authorizeRoles } = require('../middleware/rbac');

router.use(authenticateToken);

// All roles can view farms based on scoping
router.get('/', farmController.getFarms);
router.get('/:id', farmController.getFarmById);

// Admin, Farmer, Officer can register/edit farms (Agronomist has read-only access)
router.post('/', authorizeRoles('admin', 'farmer', 'officer'), farmValidator, farmController.createFarm);
router.put('/:id', authorizeRoles('admin', 'farmer', 'officer'), farmValidator, farmController.updateFarm);
router.delete('/:id', authorizeRoles('admin', 'farmer'), farmController.deleteFarm);

module.exports = router;
