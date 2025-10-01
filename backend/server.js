const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const { Pool } = require('pg');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this-in-production';

// Configuración de la base de datos
const pool = new Pool({
  host: process.env.DB_HOST || 'postgres',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'anima_counter',
  user: process.env.DB_USER || 'anima_user',
  password: process.env.DB_PASSWORD || 'anima_password_2024',
});

// Funciones de hash usando crypto nativo
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

function generateToken(user) {
  return jwt.sign(
    {
      id: user.id,
      username: user.username
    },
    JWT_SECRET,
    { expiresIn: '24h' }
  );
}

// Trust proxy settings for nginx reverse proxy
app.set('trust proxy', 1);

// Middlewares de seguridad
app.use(helmet());
app.use(compression());

// CORS
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Middleware para parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// ===== RUTAS DE AUTENTICACIÓN =====
app.post('/api/auth/register', async (req, res) => {
  try {
    console.log('Registro recibido:', req.body);
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
});

app.post('/api/auth/login', async (req, res) => {
  try {
    console.log('Login recibido:', req.body);
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
});

// Middleware para verificar JWT
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Token de acceso requerido' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Token inválido' });
    }
    req.user = user;
    next();
  });
}

// ===== RUTAS DE PERFILES =====

// Obtener perfiles del usuario autenticado
app.get('/api/profiles', authenticateToken, async (req, res) => {
  try {
    const profilesResult = await pool.query(
      'SELECT id, name, user_id, created_at FROM user_profiles WHERE user_id = $1',
      [req.user.id]
    );

    res.json(profilesResult.rows);
  } catch (error) {
    console.error('Error obteniendo perfiles:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Crear nuevo perfil
app.post('/api/profiles', authenticateToken, async (req, res) => {
  try {
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'El nombre es requerido' });
    }

    const result = await pool.query(
      'INSERT INTO user_profiles (user_id, name) VALUES ($1, $2) RETURNING *',
      [req.user.id, name]
    );

    // Crear estado inicial del juego para el nuevo perfil
    await pool.query(`
      INSERT INTO game_state (user_profile_id, turn_number, zeon, rzeon, act, rzeoni, zeona, zeonp, acu, lock_state)
      VALUES ($1, 0, 0, 0, 0, 0, 0, 0, false, 0)
    `, [result.rows[0].id]);

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating profile:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// ===== RUTAS DE GAME STATE =====

// Obtener estado del juego del perfil
app.get('/api/gamestate/:profileId', authenticateToken, async (req, res) => {
  try {
    const { profileId } = req.params;

    // Verificar que el perfil pertenece al usuario autenticado
    const profileCheck = await pool.query(
      'SELECT id FROM user_profiles WHERE id = $1 AND user_id = $2',
      [profileId, req.user.id]
    );

    if (profileCheck.rows.length === 0) {
      return res.status(403).json({ error: 'Acceso denegado al perfil' });
    }

    const gameStateResult = await pool.query(
      'SELECT * FROM game_state WHERE user_profile_id = $1',
      [profileId]
    );

    if (gameStateResult.rows.length === 0) {
      // Crear estado inicial si no existe
      const newGameState = await pool.query(`
        INSERT INTO game_state (user_profile_id, turn_number, zeon, rzeon, zeona, act, rzeoni, zeonp, acu, lock_state, zeon_to_spend, mantain_zeon_to_spend)
        VALUES ($1, 1, 0, 0, 0, 0, 0, 0, false, 0, 0, 0)
        RETURNING *
      `, [profileId]);

      res.json(newGameState.rows[0]);
    } else {
      res.json(gameStateResult.rows[0]);
    }
  } catch (error) {
    console.error('Error obteniendo estado del juego:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Actualizar estado del juego
app.put('/api/gamestate/:profileId', authenticateToken, async (req, res) => {
  try {
    const { profileId } = req.params;
    const { turn_number, zeon, rzeon, zeona, act, rzeoni, zeonp, acu, lock_state, zeon_to_spend, mantain_zeon_to_spend } = req.body;

    // Verificar que el perfil pertenece al usuario autenticado
    const profileCheck = await pool.query(
      'SELECT id FROM user_profiles WHERE id = $1 AND user_id = $2',
      [profileId, req.user.id]
    );

    if (profileCheck.rows.length === 0) {
      return res.status(403).json({ error: 'Acceso denegado al perfil' });
    }

    const updateResult = await pool.query(`
      UPDATE game_state
      SET turn_number = $1, zeon = $2, rzeon = $3, zeona = $4, act = $5, rzeoni = $6, zeonp = $7, acu = $8, lock_state = $9, zeon_to_spend = $10, mantain_zeon_to_spend = $11, updated_at = CURRENT_TIMESTAMP
      WHERE user_profile_id = $12
      RETURNING *
    `, [turn_number, zeon, rzeon, zeona, act, rzeoni, zeonp, acu, lock_state, zeon_to_spend, mantain_zeon_to_spend, profileId]);

    if (updateResult.rows.length === 0) {
      // Crear si no existe
      const newGameState = await pool.query(`
        INSERT INTO game_state (user_profile_id, turn_number, zeon, rzeon, zeona, act, rzeoni, zeonp, acu, lock_state, zeon_to_spend, mantain_zeon_to_spend)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
        RETURNING *
      `, [profileId, turn_number, zeon, rzeon, zeona, act, rzeoni, zeonp, acu, lock_state, zeon_to_spend, mantain_zeon_to_spend]);

      res.json(newGameState.rows[0]);
    } else {
      res.json(updateResult.rows[0]);
    }
  } catch (error) {
    console.error('Error actualizando estado del juego:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// ===== RUTAS DE SPELLS =====

// Obtener hechizos del perfil
app.get('/api/spells/:profileId', authenticateToken, async (req, res) => {
  try {
    const { profileId } = req.params;

    // Verificar que el perfil pertenece al usuario autenticado
    const profileCheck = await pool.query(
      'SELECT id FROM user_profiles WHERE id = $1 AND user_id = $2',
      [profileId, req.user.id]
    );

    if (profileCheck.rows.length === 0) {
      return res.status(403).json({ error: 'Acceso denegado al perfil' });
    }

    const spellsResult = await pool.query(
      'SELECT * FROM spells WHERE user_profile_id = $1 ORDER BY created_at',
      [profileId]
    );

    res.json(spellsResult.rows);
  } catch (error) {
    console.error('Error obteniendo hechizos:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Crear nuevo hechizo
app.post('/api/spells/:profileId', authenticateToken, async (req, res) => {
  try {
    const { profileId } = req.params;
    const { spell_name, spell_base, spell_inter, spell_advanced, spell_arcane, spell_base_mantain, spell_inter_mantain, spell_advanced_mantain, spell_arcane_mantain, spell_via } = req.body;

    // Verificar que el perfil pertenece al usuario autenticado
    const profileCheck = await pool.query(
      'SELECT id FROM user_profiles WHERE id = $1 AND user_id = $2',
      [profileId, req.user.id]
    );

    if (profileCheck.rows.length === 0) {
      return res.status(403).json({ error: 'Acceso denegado al perfil' });
    }

    // Validación básica
    if (!spell_name || spell_base == null || spell_inter == null || spell_advanced == null || spell_arcane == null) {
      return res.status(400).json({ error: 'Todos los campos del hechizo son requeridos' });
    }

    const spellResult = await pool.query(`
      INSERT INTO spells (user_profile_id, spell_name, spell_base, spell_inter, spell_advanced, spell_arcane, spell_base_mantain, spell_inter_mantain, spell_advanced_mantain, spell_arcane_mantain, spell_via)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING *
    `, [profileId, spell_name, parseInt(spell_base), parseInt(spell_inter), parseInt(spell_advanced), parseInt(spell_arcane), parseInt(spell_base_mantain) || 0, parseInt(spell_inter_mantain) || 0, parseInt(spell_advanced_mantain) || 0, parseInt(spell_arcane_mantain) || 0, spell_via]);

    res.status(201).json(spellResult.rows[0]);
  } catch (error) {
    console.error('Error creando hechizo:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Eliminar hechizo
app.delete('/api/spells/:profileId/:spellId', authenticateToken, async (req, res) => {
  try {
    const { profileId, spellId } = req.params;

    // Verificar que el perfil pertenece al usuario autenticado
    const profileCheck = await pool.query(
      'SELECT id FROM user_profiles WHERE id = $1 AND user_id = $2',
      [profileId, req.user.id]
    );

    if (profileCheck.rows.length === 0) {
      return res.status(403).json({ error: 'Acceso denegado al perfil' });
    }

    const deleteResult = await pool.query(
      'DELETE FROM spells WHERE id = $1 AND user_profile_id = $2',
      [spellId, profileId]
    );

    if (deleteResult.rowCount === 0) {
      return res.status(404).json({ error: 'Hechizo no encontrado' });
    }

    res.json({ message: 'Hechizo eliminado exitosamente' });
  } catch (error) {
    console.error('Error eliminando hechizo:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// ===== RUTAS DE READY TO CAST =====

// Obtener hechizos ready to cast del perfil
app.get('/api/ready-to-cast/:profileId', authenticateToken, async (req, res) => {
  try {
    const { profileId } = req.params;

    // Verificar que el perfil pertenece al usuario autenticado
    const profileCheck = await pool.query(
      'SELECT id FROM user_profiles WHERE id = $1 AND user_id = $2',
      [profileId, req.user.id]
    );

    if (profileCheck.rows.length === 0) {
      return res.status(403).json({ error: 'Acceso denegado al perfil' });
    }

    const readyToCastResult = await pool.query(
      'SELECT * FROM ready_to_cast WHERE user_profile_id = $1 ORDER BY created_at',
      [profileId]
    );

    res.json(readyToCastResult.rows);
  } catch (error) {
    console.error('Error obteniendo ready to cast:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Crear nuevo hechizo ready to cast
app.post('/api/ready-to-cast/:profileId', authenticateToken, async (req, res) => {
  try {
    const { profileId } = req.params;
    const { spell_id, spell_name, spell_zeon, spell_mantain, spell_mantain_turn, spell_index } = req.body;

    // Verificar que el perfil pertenece al usuario autenticado
    const profileCheck = await pool.query(
      'SELECT id FROM user_profiles WHERE id = $1 AND user_id = $2',
      [profileId, req.user.id]
    );

    if (profileCheck.rows.length === 0) {
      return res.status(403).json({ error: 'Acceso denegado al perfil' });
    }

    // Validación básica
    if (!spell_name || spell_zeon == null) {
      return res.status(400).json({ error: 'Nombre del hechizo y zeon son requeridos' });
    }

    const readyToCastResult = await pool.query(`
      INSERT INTO ready_to_cast (user_profile_id, spell_id, spell_name, spell_zeon, spell_mantain, spell_mantain_turn, spell_index)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `, [profileId, spell_id, spell_name, parseInt(spell_zeon), parseInt(spell_mantain) || 0, spell_mantain_turn || false, spell_index]);

    res.status(201).json(readyToCastResult.rows[0]);
  } catch (error) {
    console.error('Error creando ready to cast:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Eliminar hechizo ready to cast
app.delete('/api/ready-to-cast/:profileId/:readyToCastId', authenticateToken, async (req, res) => {
  try {
    const { profileId, readyToCastId } = req.params;

    // Verificar que el perfil pertenece al usuario autenticado
    const profileCheck = await pool.query(
      'SELECT id FROM user_profiles WHERE id = $1 AND user_id = $2',
      [profileId, req.user.id]
    );

    if (profileCheck.rows.length === 0) {
      return res.status(403).json({ error: 'Acceso denegado al perfil' });
    }

    const deleteResult = await pool.query(
      'DELETE FROM ready_to_cast WHERE id = $1 AND user_profile_id = $2',
      [readyToCastId, profileId]
    );

    if (deleteResult.rowCount === 0) {
      return res.status(404).json({ error: 'Ready to cast no encontrado' });
    }

    res.json({ message: 'Ready to cast eliminado exitosamente' });
  } catch (error) {
    console.error('Error eliminando ready to cast:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Eliminar todos los ready to cast del perfil
app.delete('/api/ready-to-cast/:profileId', authenticateToken, async (req, res) => {
  try {
    const { profileId } = req.params;

    // Verificar que el perfil pertenece al usuario autenticado
    const profileCheck = await pool.query(
      'SELECT id FROM user_profiles WHERE id = $1 AND user_id = $2',
      [profileId, req.user.id]
    );

    if (profileCheck.rows.length === 0) {
      return res.status(403).json({ error: 'Acceso denegado al perfil' });
    }

    await pool.query(
      'DELETE FROM ready_to_cast WHERE user_profile_id = $1',
      [profileId]
    );

    res.json({ message: 'Todos los ready to cast eliminados exitosamente' });
  } catch (error) {
    console.error('Error eliminando todos los ready to cast:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// ===== RUTAS DE SPELL MANTAIN =====

// Obtener hechizos spell mantain del perfil
app.get('/api/spell-mantain/:profileId', authenticateToken, async (req, res) => {
  try {
    const { profileId } = req.params;

    // Verificar que el perfil pertenece al usuario autenticado
    const profileCheck = await pool.query(
      'SELECT id FROM user_profiles WHERE id = $1 AND user_id = $2',
      [profileId, req.user.id]
    );

    if (profileCheck.rows.length === 0) {
      return res.status(403).json({ error: 'Acceso denegado al perfil' });
    }

    const spellMantainResult = await pool.query(
      'SELECT * FROM spell_mantain_list WHERE user_profile_id = $1 ORDER BY created_at',
      [profileId]
    );

    res.json(spellMantainResult.rows);
  } catch (error) {
    console.error('Error obteniendo spell mantain:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Crear nuevo hechizo spell mantain
app.post('/api/spell-mantain/:profileId', authenticateToken, async (req, res) => {
  try {
    const { profileId } = req.params;
    const { spell_id, spell_name, spell_mantain, spell_index } = req.body;

    // Verificar que el perfil pertenece al usuario autenticado
    const profileCheck = await pool.query(
      'SELECT id FROM user_profiles WHERE id = $1 AND user_id = $2',
      [profileId, req.user.id]
    );

    if (profileCheck.rows.length === 0) {
      return res.status(403).json({ error: 'Acceso denegado al perfil' });
    }

    // Validación básica
    if (!spell_name || spell_mantain == null) {
      return res.status(400).json({ error: 'Nombre del hechizo y mantain son requeridos' });
    }

    const spellMantainResult = await pool.query(`
      INSERT INTO spell_mantain_list (user_profile_id, spell_id, spell_name, spell_mantain, spell_index)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `, [profileId, spell_id, spell_name, parseInt(spell_mantain), spell_index]);

    res.status(201).json(spellMantainResult.rows[0]);
  } catch (error) {
    console.error('Error creando spell mantain:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Eliminar hechizo spell mantain
app.delete('/api/spell-mantain/:profileId/:spellMantainId', authenticateToken, async (req, res) => {
  try {
    const { profileId, spellMantainId } = req.params;

    // Verificar que el perfil pertenece al usuario autenticado
    const profileCheck = await pool.query(
      'SELECT id FROM user_profiles WHERE id = $1 AND user_id = $2',
      [profileId, req.user.id]
    );

    if (profileCheck.rows.length === 0) {
      return res.status(403).json({ error: 'Acceso denegado al perfil' });
    }

    const deleteResult = await pool.query(
      'DELETE FROM spell_mantain_list WHERE id = $1 AND user_profile_id = $2',
      [spellMantainId, profileId]
    );

    if (deleteResult.rowCount === 0) {
      return res.status(404).json({ error: 'Spell mantain no encontrado' });
    }

    res.json({ message: 'Spell mantain eliminado exitosamente' });
  } catch (error) {
    console.error('Error eliminando spell mantain:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Eliminar todos los spell mantain del perfil
app.delete('/api/spell-mantain/:profileId', authenticateToken, async (req, res) => {
  try {
    const { profileId } = req.params;

    // Verificar que el perfil pertenece al usuario autenticado
    const profileCheck = await pool.query(
      'SELECT id FROM user_profiles WHERE id = $1 AND user_id = $2',
      [profileId, req.user.id]
    );

    if (profileCheck.rows.length === 0) {
      return res.status(403).json({ error: 'Acceso denegado al perfil' });
    }

    await pool.query(
      'DELETE FROM spell_mantain_list WHERE user_profile_id = $1',
      [profileId]
    );

    res.json({ message: 'Todos los spell mantain eliminados exitosamente' });
  } catch (error) {
    console.error('Error eliminando todos los spell mantain:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Manejo de rutas no encontradas
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Ruta no encontrada' });
});

// Manejo de errores
app.use((error, req, res, next) => {
  console.error('Error no manejado:', error);
  res.status(500).json({ error: 'Error interno del servidor' });
});

// Manejo de cierre graceful
process.on('SIGTERM', () => {
  console.log('Cerrando servidor...');
  pool.end();
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('Cerrando servidor...');
  pool.end();
  process.exit(0);
});

// Iniciar servidor
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Servidor ejecutándose en puerto ${PORT}`);
  console.log(`Health check disponible en: http://localhost:${PORT}/health`);
});
