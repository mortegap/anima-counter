const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const { Pool } = require('pg');
// const { authenticateToken, verifyProfileAccess } = require('./middleware/auth');
// const authRoutes = require('./routes/auth');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Trust proxy settings for nginx reverse proxy
app.set('trust proxy', 1);

// Configuración de la base de datos
const pool = new Pool({
  host: process.env.DB_HOST || 'postgres',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'anima_counter',
  user: process.env.DB_USER || 'anima_user',
  password: process.env.DB_PASSWORD || 'anima_password_2024',
});

// Middlewares de seguridad
app.use(helmet());
app.use(compression());
app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100 // máximo 100 requests por ventana
});
app.use(limiter);

// Parseo de JSON
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Middleware de logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Ruta de salud
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// ===== RUTAS DE AUTENTICACIÓN TEMPORALES =====
app.post('/api/auth/register', async (req, res) => {
  try {
    console.log('Registro recibido:', req.body);
    res.json({ success: true, message: 'Registro temporal funcionando', data: req.body });
  } catch (error) {
    console.error('Error en registro temporal:', error);
    res.status(500).json({ error: 'Error en registro temporal' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    console.log('Login recibido:', req.body);
    res.json({ success: true, message: 'Login temporal funcionando', data: req.body });
  } catch (error) {
    console.error('Error en login temporal:', error);
    res.status(500).json({ error: 'Error en login temporal' });
  }
});

/* ===== RUTAS COMENTADAS TEMPORALMENTE =====
// ===== RUTAS PARA USER PROFILES =====

// Obtener perfiles del usuario autenticado
app.get('/api/profiles', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM user_profiles WHERE user_id = $1 ORDER BY created_at DESC',
      [req.user.id]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error getting profiles:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Crear nuevo perfil para el usuario autenticado
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

// ===== RUTAS PARA GAME STATE =====

// Obtener estado del juego por perfil
app.get('/api/gamestate/:profileId', authenticateToken, verifyProfileAccess, async (req, res) => {
  try {
    const { profileId } = req.params;
    const result = await pool.query(
      'SELECT * FROM game_state WHERE user_profile_id = $1',
      [profileId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Estado del juego no encontrado' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error getting game state:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Actualizar estado del juego
app.put('/api/gamestate/:profileId', authenticateToken, verifyProfileAccess, async (req, res) => {
  try {
    const { profileId } = req.params;
    const {
      turn_number, zeon, rzeon, act, rzeoni, zeona, zeonp, acu, lock_state,
      zeon_to_spend, mantain_zeon_to_spend
    } = req.body;

    const result = await pool.query(`
      UPDATE game_state SET
        turn_number = $1, zeon = $2, rzeon = $3, act = $4, rzeoni = $5,
        zeona = $6, zeonp = $7, acu = $8, lock_state = $9,
        zeon_to_spend = $10, mantain_zeon_to_spend = $11, updated_at = CURRENT_TIMESTAMP
      WHERE user_profile_id = $12
      RETURNING *
    `, [
      turn_number, zeon, rzeon, act, rzeoni, zeona, zeonp, acu, lock_state,
      zeon_to_spend, mantain_zeon_to_spend, profileId
    ]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Estado del juego no encontrado' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating game state:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// ===== RUTAS PARA SPELLS =====

// Obtener hechizos por perfil
app.get('/api/spells/:profileId', authenticateToken, verifyProfileAccess, async (req, res) => {
  try {
    const { profileId } = req.params;
    const result = await pool.query(
      'SELECT * FROM spells WHERE user_profile_id = $1 ORDER BY created_at ASC',
      [profileId]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error getting spells:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Crear nuevo hechizo
app.post('/api/spells/:profileId', authenticateToken, verifyProfileAccess, async (req, res) => {
  try {
    const { profileId } = req.params;
    const {
      spell_name, spell_base, spell_inter, spell_advanced, spell_arcane,
      spell_via, spell_base_mantain, spell_inter_mantain,
      spell_advanced_mantain, spell_arcane_mantain
    } = req.body;

    if (!spell_name || !spell_base || !spell_inter || !spell_advanced || !spell_arcane) {
      return res.status(400).json({ error: 'Todos los campos de hechizo son requeridos' });
    }

    const result = await pool.query(`
      INSERT INTO spells (
        user_profile_id, spell_name, spell_base, spell_inter, spell_advanced, spell_arcane,
        spell_via, spell_base_mantain, spell_inter_mantain, spell_advanced_mantain, spell_arcane_mantain
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING *
    `, [
      profileId, spell_name, spell_base, spell_inter, spell_advanced, spell_arcane,
      spell_via, spell_base_mantain || 0, spell_inter_mantain || 0,
      spell_advanced_mantain || 0, spell_arcane_mantain || 0
    ]);

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating spell:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Eliminar hechizo
app.delete('/api/spells/:profileId/:spellId', authenticateToken, verifyProfileAccess, async (req, res) => {
  try {
    const { profileId, spellId } = req.params;

    const result = await pool.query(
      'DELETE FROM spells WHERE id = $1 AND user_profile_id = $2 RETURNING *',
      [spellId, profileId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Hechizo no encontrado' });
    }

    res.json({ message: 'Hechizo eliminado correctamente' });
  } catch (error) {
    console.error('Error deleting spell:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// ===== RUTAS PARA READY TO CAST =====

// Obtener hechizos listos para lanzar
app.get('/api/ready-to-cast/:profileId', authenticateToken, verifyProfileAccess, async (req, res) => {
  try {
    const { profileId } = req.params;
    const result = await pool.query(
      'SELECT * FROM ready_to_cast WHERE user_profile_id = $1 ORDER BY created_at ASC',
      [profileId]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error getting ready to cast spells:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Agregar hechizo a ready to cast
app.post('/api/ready-to-cast/:profileId', authenticateToken, verifyProfileAccess, async (req, res) => {
  try {
    const { profileId } = req.params;
    const { spell_id, spell_name, spell_zeon, spell_mantain, spell_index } = req.body;

    const result = await pool.query(`
      INSERT INTO ready_to_cast (
        user_profile_id, spell_id, spell_name, spell_zeon, spell_mantain, spell_index
      ) VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `, [profileId, spell_id, spell_name, spell_zeon, spell_mantain || 0, spell_index]);

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error adding spell to ready to cast:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Eliminar hechizo de ready to cast
app.delete('/api/ready-to-cast/:profileId/:readyToCastId', authenticateToken, verifyProfileAccess, async (req, res) => {
  try {
    const { profileId, readyToCastId } = req.params;

    const result = await pool.query(
      'DELETE FROM ready_to_cast WHERE id = $1 AND user_profile_id = $2 RETURNING *',
      [readyToCastId, profileId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Hechizo en ready to cast no encontrado' });
    }

    res.json({ message: 'Hechizo eliminado de ready to cast correctamente' });
  } catch (error) {
    console.error('Error removing spell from ready to cast:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Limpiar todos los hechizos ready to cast
app.delete('/api/ready-to-cast/:profileId', authenticateToken, verifyProfileAccess, async (req, res) => {
  try {
    const { profileId } = req.params;

    await pool.query(
      'DELETE FROM ready_to_cast WHERE user_profile_id = $1',
      [profileId]
    );

    res.json({ message: 'Todos los hechizos ready to cast eliminados' });
  } catch (error) {
    console.error('Error clearing ready to cast spells:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// ===== RUTAS PARA SPELL MANTAIN LIST =====

// Obtener hechizos en mantenimiento
app.get('/api/spell-mantain/:profileId', authenticateToken, verifyProfileAccess, async (req, res) => {
  try {
    const { profileId } = req.params;
    const result = await pool.query(
      'SELECT * FROM spell_mantain_list WHERE user_profile_id = $1 ORDER BY created_at ASC',
      [profileId]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error getting spell mantain list:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Agregar hechizo a mantenimiento
app.post('/api/spell-mantain/:profileId', authenticateToken, verifyProfileAccess, async (req, res) => {
  try {
    const { profileId } = req.params;
    const { spell_id, spell_name, spell_mantain, spell_index } = req.body;

    const result = await pool.query(`
      INSERT INTO spell_mantain_list (
        user_profile_id, spell_id, spell_name, spell_mantain, spell_index
      ) VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `, [profileId, spell_id, spell_name, spell_mantain, spell_index]);

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error adding spell to mantain list:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Eliminar hechizo de mantenimiento
app.delete('/api/spell-mantain/:profileId/:mantainId', authenticateToken, verifyProfileAccess, async (req, res) => {
  try {
    const { profileId, mantainId } = req.params;

    const result = await pool.query(
      'DELETE FROM spell_mantain_list WHERE id = $1 AND user_profile_id = $2 RETURNING *',
      [mantainId, profileId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Hechizo en mantenimiento no encontrado' });
    }

    res.json({ message: 'Hechizo eliminado del mantenimiento correctamente' });
  } catch (error) {
    console.error('Error removing spell from mantain list:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Limpiar todos los hechizos de mantenimiento
app.delete('/api/spell-mantain/:profileId', authenticateToken, verifyProfileAccess, async (req, res) => {
  try {
    const { profileId } = req.params;

    await pool.query(
      'DELETE FROM spell_mantain_list WHERE user_profile_id = $1',
      [profileId]
    );

    res.json({ message: 'Todos los hechizos de mantenimiento eliminados' });
  } catch (error) {
    console.error('Error clearing spell mantain list:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// ===== MANEJO DE ERRORES =====

// Middleware de manejo de errores
app.use((error, req, res, next) => {
  console.error('Error no manejado:', error);
  res.status(500).json({ error: 'Error interno del servidor' });
});

// Ruta 404
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Ruta no encontrada' });
});

// Iniciar servidor
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Servidor ejecutándose en puerto ${PORT}`);
  console.log(`Health check disponible en: http://localhost:${PORT}/health`);
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