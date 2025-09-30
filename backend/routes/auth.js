const express = require('express');
const crypto = require('crypto');
const { body, validationResult } = require('express-validator');
const { generateToken, authenticateToken } = require('../middleware/auth');
const { Pool } = require('pg');

const router = express.Router();

// Funciones de hash usando crypto nativo (más estable que bcrypt en Docker)
function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
  return `${salt}:${hash}`;
}

function verifyPassword(password, storedHash) {
  const [salt, hash] = storedHash.split(':');
  const verifyHash = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
  return hash === verifyHash;
}

// Configuración de la base de datos
const pool = new Pool({
  host: process.env.DB_HOST || 'postgres',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'anima_counter',
  user: process.env.DB_USER || 'anima_user',
  password: process.env.DB_PASSWORD || 'anima_password_2024',
});

// Validaciones
const registerValidation = [
  body('username')
    .isLength({ min: 3, max: 50 })
    .withMessage('El nombre de usuario debe tener entre 3 y 50 caracteres')
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('El nombre de usuario solo puede contener letras, números y guiones bajos'),
  body('email')
    .isEmail()
    .withMessage('Debe ser un email válido')
    .normalizeEmail(),
  body('password')
    .isLength({ min: 6 })
    .withMessage('La contraseña debe tener al menos 6 caracteres'),
  body('displayName')
    .optional()
    .isLength({ max: 100 })
    .withMessage('El nombre para mostrar no puede tener más de 100 caracteres')
];

const loginValidation = [
  body('username')
    .notEmpty()
    .withMessage('El nombre de usuario es requerido'),
  body('password')
    .notEmpty()
    .withMessage('La contraseña es requerida')
];

// GET /api/auth/verify - Verificar token
router.get('/verify', authenticateToken, async (req, res) => {
  try {
    res.json({ valid: true, user: req.user });
  } catch (error) {
    console.error('Error en verificación:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// GET /api/auth/test - Endpoint de prueba
router.get('/test', async (req, res) => {
  try {
    res.json({ message: 'Endpoint de autenticación funcionando', timestamp: new Date().toISOString() });
  } catch (error) {
    console.error('Error en test:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// POST /api/auth/register - Registro de usuario SIMPLE
router.post('/register', async (req, res) => {
  try {
    console.log('Registro solicitado:', req.body);
    res.json({ message: 'Registro recibido correctamente', data: req.body });
  } catch (error) {
    console.error('Error en registro:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// POST /api/auth/register-full - Registro de usuario COMPLETO
router.post('/register-full', registerValidation, async (req, res) => {
  try {
    // Verificar errores de validación
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Datos de entrada inválidos',
        details: errors.array()
      });
    }

    const { username, email, password, displayName } = req.body;

    // Verificar si el usuario ya existe
    const existingUser = await pool.query(
      'SELECT id FROM users WHERE username = $1 OR email = $2',
      [username, email]
    );

    if (existingUser.rows.length > 0) {
      return res.status(409).json({
        error: 'El usuario o email ya existe'
      });
    }

    // Hash de la contraseña
    const passwordHash = hashPassword(password);

    // Crear usuario
    const userResult = await pool.query(`
      INSERT INTO users (username, email, password_hash, display_name)
      VALUES ($1, $2, $3, $4)
      RETURNING id, username, email, display_name, created_at
    `, [username, email, passwordHash, displayName || username]);

    const user = userResult.rows[0];

    // Crear perfil por defecto para el usuario
    await pool.query(`
      INSERT INTO user_profiles (user_id, name)
      VALUES ($1, $2)
    `, [user.id, `Perfil de ${displayName || username}`]);

    // Crear estado inicial del juego para el nuevo perfil
    const profileResult = await pool.query(
      'SELECT id FROM user_profiles WHERE user_id = $1',
      [user.id]
    );

    if (profileResult.rows.length > 0) {
      await pool.query(`
        INSERT INTO game_state (user_profile_id, turn_number, zeon, rzeon, act, rzeoni, zeona, zeonp, acu, lock_state)
        VALUES ($1, 0, 0, 0, 0, 0, 0, 0, false, 0)
      `, [profileResult.rows[0].id]);
    }

    // Generar token
    const token = generateToken(user.id);

    res.status(201).json({
      message: 'Usuario registrado exitosamente',
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        displayName: user.display_name,
        createdAt: user.created_at
      },
      token
    });

  } catch (error) {
    console.error('Error en registro:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// POST /api/auth/login - Inicio de sesión
router.post('/login', loginValidation, async (req, res) => {
  try {
    // Verificar errores de validación
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Datos de entrada inválidos',
        details: errors.array()
      });
    }

    const { username, password } = req.body;

    // Buscar usuario
    const userResult = await pool.query(
      'SELECT id, username, email, password_hash, display_name, is_active FROM users WHERE username = $1',
      [username]
    );

    if (userResult.rows.length === 0) {
      return res.status(401).json({
        error: 'Credenciales inválidas'
      });
    }

    const user = userResult.rows[0];

    if (!user.is_active) {
      return res.status(401).json({
        error: 'Cuenta desactivada'
      });
    }

    // Verificar contraseña
    const passwordMatch = verifyPassword(password, user.password_hash);

    if (!passwordMatch) {
      return res.status(401).json({
        error: 'Credenciales inválidas'
      });
    }

    // Actualizar último login
    await pool.query(
      'UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = $1',
      [user.id]
    );

    // Generar token
    const token = generateToken(user.id);

    res.json({
      message: 'Inicio de sesión exitoso',
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        displayName: user.display_name
      },
      token
    });

  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// GET /api/auth/profile - Obtener perfil del usuario autenticado
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    res.json({
      user: req.user
    });
  } catch (error) {
    console.error('Error obteniendo perfil:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// PUT /api/auth/profile - Actualizar perfil del usuario
router.put('/profile', authenticateToken, [
  body('displayName')
    .optional()
    .isLength({ max: 100 })
    .withMessage('El nombre para mostrar no puede tener más de 100 caracteres'),
  body('email')
    .optional()
    .isEmail()
    .withMessage('Debe ser un email válido')
    .normalizeEmail()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Datos de entrada inválidos',
        details: errors.array()
      });
    }

    const { displayName, email } = req.body;
    const userId = req.user.id;

    // Verificar si el email ya existe (para otro usuario)
    if (email) {
      const existingEmail = await pool.query(
        'SELECT id FROM users WHERE email = $1 AND id != $2',
        [email, userId]
      );

      if (existingEmail.rows.length > 0) {
        return res.status(409).json({
          error: 'El email ya está en uso por otro usuario'
        });
      }
    }

    // Actualizar usuario
    const updateFields = [];
    const updateValues = [];
    let paramCount = 1;

    if (displayName !== undefined) {
      updateFields.push(`display_name = $${paramCount}`);
      updateValues.push(displayName);
      paramCount++;
    }

    if (email !== undefined) {
      updateFields.push(`email = $${paramCount}`);
      updateValues.push(email);
      paramCount++;
    }

    if (updateFields.length === 0) {
      return res.status(400).json({
        error: 'No se proporcionaron campos para actualizar'
      });
    }

    updateValues.push(userId);

    const result = await pool.query(`
      UPDATE users SET ${updateFields.join(', ')}, updated_at = CURRENT_TIMESTAMP
      WHERE id = $${paramCount}
      RETURNING id, username, email, display_name
    `, updateValues);

    res.json({
      message: 'Perfil actualizado exitosamente',
      user: result.rows[0]
    });

  } catch (error) {
    console.error('Error actualizando perfil:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// POST /api/auth/change-password - Cambiar contraseña
router.post('/change-password', authenticateToken, [
  body('currentPassword')
    .notEmpty()
    .withMessage('La contraseña actual es requerida'),
  body('newPassword')
    .isLength({ min: 6 })
    .withMessage('La nueva contraseña debe tener al menos 6 caracteres')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Datos de entrada inválidos',
        details: errors.array()
      });
    }

    const { currentPassword, newPassword } = req.body;
    const userId = req.user.id;

    // Obtener hash actual
    const userResult = await pool.query(
      'SELECT password_hash FROM users WHERE id = $1',
      [userId]
    );

    const user = userResult.rows[0];

    // Verificar contraseña actual
    const passwordMatch = verifyPassword(currentPassword, user.password_hash);

    if (!passwordMatch) {
      return res.status(401).json({
        error: 'Contraseña actual incorrecta'
      });
    }

    // Hash de la nueva contraseña
    const newPasswordHash = hashPassword(newPassword);

    // Actualizar contraseña
    await pool.query(
      'UPDATE users SET password_hash = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
      [newPasswordHash, userId]
    );

    res.json({
      message: 'Contraseña actualizada exitosamente'
    });

  } catch (error) {
    console.error('Error cambiando contraseña:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

module.exports = router;