const express = require('express');
const router = express.Router();
const cropController = require('../controllers/cropController');
const { cropValidator } = require('../validators/cropValidator');
const { authenticateToken } = require('../middleware/auth');
const { authorizeRoles } = require('../middleware/rbac');

router.use(authenticateToken);

router.get('/', cropController.getCrops);
router.get('/:id', cropController.getCropById);
router.post('/', authorizeRoles('admin', 'farmer', 'officer'), cropValidator, cropController.createCrop);
router.put('/:id', authorizeRoles('admin', 'farmer', 'officer', 'agronomist'), cropController.updateCrop);
router.delete('/:id', authorizeRoles('admin', 'farmer'), cropController.deleteCrop);

module.exports = router;

