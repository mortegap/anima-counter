const { verifyToken } = require('../utils/jwt.utils');
const { pool } = require('../config/database');

/**
 * Middleware para autenticar el token JWT
 * Verifica el token en el header Authorization y añade el usuario a req.user
 */
async function authenticateToken(req, res, next) {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ error: 'Token de acceso requerido' });
    }

    const decoded = await verifyToken(token);
    req.user = decoded;
    next();
  } catch (error) {
    console.error('Error en autenticación:', error);
    return res.status(403).json({ error: 'Token inválido o expirado' });
  }
}

/**
 * Middleware para verificar que el perfil pertenece al usuario autenticado
 * Debe usarse después de authenticateToken
 */
async function verifyProfileAccess(req, res, next) {
  try {
    const { profileId } = req.params;

    if (!profileId) {
      return res.status(400).json({ error: 'ID de perfil requerido' });
    }

    const profileCheck = await pool.query(
      'SELECT id FROM user_profiles WHERE id = $1 AND user_id = $2',
      [profileId, req.user.id]
    );

    if (profileCheck.rows.length === 0) {
      return res.status(403).json({ error: 'Acceso denegado al perfil' });
    }

    next();
  } catch (error) {
    console.error('Error verificando acceso al perfil:', error);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
}

module.exports = {
  authenticateToken,
  verifyProfileAccess
};
