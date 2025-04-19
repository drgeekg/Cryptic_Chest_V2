const express = require('express');
const router = express.Router();
const passwordController = require('../controllers/passwordController');
const auth = require('../middleware/auth');

// All routes require authentication
router.use(auth);

// Password routes
router.get('/', passwordController.getPasswords);
router.post('/', passwordController.addPassword);
// Specific route must come BEFORE the generic /:id route
router.delete('/user/:userId', passwordController.deleteAllUserPasswords);
router.put('/:id', passwordController.updatePassword);
router.delete('/:id', passwordController.deletePassword);
router.get('/search', passwordController.searchPasswords);
router.get('/category/:category', passwordController.filterByCategory);

module.exports = router;