const express = require('express');
const router = express.Router();
const spellsController = require('../controllers/spellsController');
const { authenticateToken, verifyProfileAccess } = require('../middleware/auth.middleware');

// Todas las rutas requieren autenticación y verificación de acceso al perfil
router.use(authenticateToken);

// Rutas de Ready to Cast
router.get('/:profileId', verifyProfileAccess, spellsController.getReadyToCast);
router.post('/:profileId', verifyProfileAccess, spellsController.createReadyToCast);
router.delete('/:profileId/:readyToCastId', verifyProfileAccess, spellsController.deleteReadyToCast);
router.delete('/:profileId', verifyProfileAccess, spellsController.deleteAllReadyToCast);

module.exports = router;
