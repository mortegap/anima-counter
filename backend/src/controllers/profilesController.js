const { pool } = require('../config/database');

/**
 * Obtener todos los perfiles del usuario autenticado
 */
async function getProfiles(req, res) {
  try {
    const profilesResult = await pool.query(
      'SELECT id, name, user_id, created_at FROM user_profiles WHERE user_id = $1 ORDER BY created_at DESC',
      [req.user.id]
    );

    res.json(profilesResult.rows);
  } catch (error) {
    console.error('Error obteniendo perfiles:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
}

/**
 * Crear un nuevo perfil para el usuario autenticado
 */
async function createProfile(req, res) {
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
      INSERT INTO game_state (user_profile_id, turn_number, zeon, rzeon, act, rzeoni, zeona, zeonp, acu, lock_state, zeon_to_spend, mantain_zeon_to_spend)
      VALUES ($1, 0, 0, 0, 0, 0, 0, 0, false, 0, 0, 0)
    `, [result.rows[0].id]);

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creando perfil:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
}

/**
 * Actualizar un perfil existente
 */
async function updateProfile(req, res) {
  try {
    const { profileId } = req.params;
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'El nombre es requerido' });
    }

    const result = await pool.query(
      'UPDATE user_profiles SET name = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 AND user_id = $3 RETURNING *',
      [name, profileId, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Perfil no encontrado' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error actualizando perfil:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
}

/**
 * Eliminar un perfil
 */
async function deleteProfile(req, res) {
  try {
    const { profileId } = req.params;

    // Verificar que no sea el único perfil del usuario
    const countResult = await pool.query(
      'SELECT COUNT(*) FROM user_profiles WHERE user_id = $1',
      [req.user.id]
    );

    if (parseInt(countResult.rows[0].count) <= 1) {
      return res.status(400).json({ error: 'No puedes eliminar tu único perfil' });
    }

    const result = await pool.query(
      'DELETE FROM user_profiles WHERE id = $1 AND user_id = $2 RETURNING *',
      [profileId, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Perfil no encontrado' });
    }

    res.json({ message: 'Perfil eliminado exitosamente' });
  } catch (error) {
    console.error('Error eliminando perfil:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
}

/**
 * Obtener un perfil específico por ID
 */
async function getProfileById(req, res) {
  try {
    const { profileId } = req.params;

    const result = await pool.query(
      'SELECT id, name, user_id, created_at, updated_at FROM user_profiles WHERE id = $1 AND user_id = $2',
      [profileId, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Perfil no encontrado' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error obteniendo perfil:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
}

module.exports = {
  getProfiles,
  createProfile,
  updateProfile,
  deleteProfile,
  getProfileById
};
