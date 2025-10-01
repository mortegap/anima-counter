const { pool } = require('../config/database');
const { hashPassword, verifyPassword } = require('../utils/password.utils');
const { generateToken } = require('../utils/jwt.utils');
const { resetCombatStateForUser } = require('../utils/gameState.utils');

/**
 * Registrar un nuevo usuario
 */
async function register(req, res) {
  try {
    const { username, password, email, displayName } = req.body;

    // Validación básica
    if (!username || !password) {
      return res.status(400).json({ error: 'Usuario y contraseña son requeridos' });
    }

    // Generar email y displayName por defecto si no se proporcionan
    const userEmail = email || `${username}@anima-counter.local`;
    const userDisplayName = displayName || username;

    // Verificar si el usuario ya existe
    const existingUser = await pool.query(
      'SELECT id FROM users WHERE username = $1',
      [username]
    );

    if (existingUser.rows.length > 0) {
      return res.status(409).json({ error: 'El usuario ya existe' });
    }

    // Hash de la contraseña
    const passwordHash = hashPassword(password);

    // Crear usuario
    const userResult = await pool.query(`
      INSERT INTO users (username, email, password_hash, display_name)
      VALUES ($1, $2, $3, $4)
      RETURNING id, username, email, display_name, created_at
    `, [username, userEmail, passwordHash, userDisplayName]);

    const newUser = userResult.rows[0];

    // Crear perfil por defecto
    await pool.query(`
      INSERT INTO user_profiles (user_id, name)
      VALUES ($1, $2)
    `, [newUser.id, `Perfil de ${newUser.display_name || newUser.username}`]);

    // Generar token
    const token = generateToken(newUser);

    res.status(201).json({
      message: 'Usuario registrado exitosamente',
      token: token,
      user: {
        id: newUser.id,
        username: newUser.username,
        email: newUser.email,
        displayName: newUser.display_name
      }
    });

  } catch (error) {
    console.error('Error en registro:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
}

/**
 * Iniciar sesión
 */
async function login(req, res) {
  try {
    const { username, password } = req.body;

    // Validación básica
    if (!username || !password) {
      return res.status(400).json({ error: 'Usuario y contraseña son requeridos' });
    }

    // Buscar usuario
    const userResult = await pool.query(
      'SELECT * FROM users WHERE username = $1 AND is_active = true',
      [username]
    );

    if (userResult.rows.length === 0) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    const user = userResult.rows[0];

    // Verificar contraseña
    const passwordMatch = verifyPassword(password, user.password_hash);

    if (!passwordMatch) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    // Actualizar último login
    await pool.query(
      'UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = $1',
      [user.id]
    );

    // Resetear estado de combate (turno, zeon actual, hechizos activos, etc.)
    // Mantiene características persistentes (rzeon, act, rzeoni, lista de hechizos)
    await resetCombatStateForUser(user.id);

    // Generar token
    const token = generateToken(user);

    res.json({
      message: 'Login exitoso',
      token: token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        displayName: user.display_name
      }
    });

  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
}

/**
 * Verificar token actual
 */
async function verifyTokenEndpoint(req, res) {
  try {
    // El middleware authenticateToken ya verificó el token
    // req.user contiene los datos del usuario
    const userResult = await pool.query(
      'SELECT id, username, email, display_name FROM users WHERE id = $1 AND is_active = true',
      [req.user.id]
    );

    if (userResult.rows.length === 0) {
      return res.status(401).json({ error: 'Usuario no encontrado o inactivo' });
    }

    res.json({
      valid: true,
      user: userResult.rows[0]
    });
  } catch (error) {
    console.error('Error verificando token:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
}

module.exports = {
  register,
  login,
  verifyTokenEndpoint
};
