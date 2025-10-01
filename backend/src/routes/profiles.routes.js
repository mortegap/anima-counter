const express = require('express');
const router = express.Router();
const profilesController = require('../controllers/profilesController');
const { authenticateToken } = require('../middleware/auth.middleware');

// Todas las rutas requieren autenticación
router.use(authenticateToken);

router.get('/', profilesController.getProfiles);
router.post('/', profilesController.createProfile);
router.put('/:profileId', profilesController.updateProfile);
router.delete('/:profileId', profilesController.deleteProfile);

module.exports = router;
