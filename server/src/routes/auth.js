const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const auth = require('../middleware/auth');

// Public routes
router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/recover', authController.recover);

// Protected routes
router.get('/current-user', auth, authController.getCurrentUser);

module.exports = router;