const jwt = require('jsonwebtoken');
const { Pool } = require('pg');

// Configuración de la base de datos (reutilizar la configuración del servidor)
const pool = new Pool({
  host: process.env.DB_HOST || 'postgres',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'anima_counter',
  user: process.env.DB_USER || 'anima_user',
  password: process.env.DB_PASSWORD || 'anima_password_2024',
});

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this-in-production';

// Middleware para verificar JWT
const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ error: 'Token de acceso requerido' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);

    // Verificar que el usuario sigue existiendo y activo
    const userResult = await pool.query(
      'SELECT id, username, email, display_name, is_active FROM users WHERE id = $1 AND is_active = true',
      [decoded.userId]
    );

    if (userResult.rows.length === 0) {
      return res.status(401).json({ error: 'Usuario no válido' });
    }

    req.user = userResult.rows[0];
    next();
  } catch (error) {
    console.error('Error en autenticación:', error);
    return res.status(403).json({ error: 'Token inválido' });
  }
};

// Middleware opcional para verificar JWT (no falla si no hay token)
const optionalAuth = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    req.user = null;
    return next();
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);

    const userResult = await pool.query(
      'SELECT id, username, email, display_name, is_active FROM users WHERE id = $1 AND is_active = true',
      [decoded.userId]
    );

    if (userResult.rows.length > 0) {
      req.user = userResult.rows[0];
    } else {
      req.user = null;
    }
  } catch (error) {
    req.user = null;
  }

  next();
};

// Generar JWT token
const generateToken = (userId) => {
  return jwt.sign(
    { userId },
    JWT_SECRET,
    { expiresIn: '7d' } // Token válido por 7 días
  );
};

// Verificar si el usuario tiene acceso a un perfil específico
const verifyProfileAccess = async (req, res, next) => {
  const { profileId } = req.params;
  const userId = req.user.id;

  try {
    const result = await pool.query(
      'SELECT 1 FROM user_profiles WHERE id = $1 AND user_id = $2',
      [profileId, userId]
    );

    if (result.rows.length === 0) {
      return res.status(403).json({ error: 'No tienes acceso a este perfil' });
    }

    next();
  } catch (error) {
    console.error('Error verificando acceso al perfil:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

module.exports = {
  authenticateToken,
  optionalAuth,
  generateToken,
  verifyProfileAccess,
  JWT_SECRET
};