const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { registerValidator, loginValidator, changePasswordValidator } = require('../validators/authValidator');
const { authenticateToken } = require('../middleware/auth');
const { authLimiter } = require('../middleware/rateLimiter');

router.post('/register', authLimiter, registerValidator, authController.register);
router.post('/login', authLimiter, loginValidator, authController.login);
router.get('/me', authenticateToken, authController.getMe);
router.post('/logout', authenticateToken, authController.logout);
router.patch('/change-password', authenticateToken, changePasswordValidator, authController.changePassword);

module.exports = router;
