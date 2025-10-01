const express = require('express');
const router = express.Router();
const spellsController = require('../controllers/spellsController');
const { authenticateToken, verifyProfileAccess } = require('../middleware/auth.middleware');

// Todas las rutas requieren autenticación y verificación de acceso al perfil
router.use(authenticateToken);

// Rutas de Spells
router.get('/:profileId', verifyProfileAccess, spellsController.getSpells);
router.post('/:profileId', verifyProfileAccess, spellsController.createSpell);
router.delete('/:profileId/:spellId', verifyProfileAccess, spellsController.deleteSpell);

module.exports = router;
