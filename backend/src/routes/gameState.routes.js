const express = require('express');
const router = express.Router();
const gameStateController = require('../controllers/gameStateController');
const { authenticateToken, verifyProfileAccess } = require('../middleware/auth.middleware');

// Todas las rutas requieren autenticación y verificación de acceso al perfil
router.use(authenticateToken);

router.get('/:profileId', verifyProfileAccess, gameStateController.getGameState);
router.put('/:profileId', verifyProfileAccess, gameStateController.updateGameState);
router.post('/:profileId/reset', verifyProfileAccess, gameStateController.resetGameState);

module.exports = router;
