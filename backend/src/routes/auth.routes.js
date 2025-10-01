const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticateToken } = require('../middleware/auth.middleware');
const { validateBody } = require('../middleware/validation.middleware');
const { registerSchema, loginSchema } = require('../schemas/auth.schema');

// Rutas públicas
router.post('/register', validateBody(registerSchema), authController.register);
router.post('/login', validateBody(loginSchema), authController.login);

// Rutas protegidas
router.get('/verify', authenticateToken, authController.verifyTokenEndpoint);

module.exports = router;
