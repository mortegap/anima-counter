const express = require('express');
const router = express.Router();
const spellsController = require('../controllers/spellsController');
const { authenticateToken, verifyProfileAccess } = require('../middleware/auth.middleware');

// Todas las rutas requieren autenticación y verificación de acceso al perfil
router.use(authenticateToken);

// Rutas de Spell Mantain
router.get('/:profileId', verifyProfileAccess, spellsController.getSpellMantain);
router.post('/:profileId', verifyProfileAccess, spellsController.createSpellMantain);
router.delete('/:profileId/:spellMantainId', verifyProfileAccess, spellsController.deleteSpellMantain);
router.delete('/:profileId', verifyProfileAccess, spellsController.deleteAllSpellMantain);

module.exports = router;
