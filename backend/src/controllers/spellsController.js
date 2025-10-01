const { pool } = require('../config/database');

// ===== SPELLS =====

/**
 * Obtener todos los hechizos de un perfil
 */
async function getSpells(req, res) {
  try {
    const { profileId } = req.params;

    const spellsResult = await pool.query(
      'SELECT * FROM spells WHERE user_profile_id = $1 ORDER BY created_at',
      [profileId]
    );

    res.json(spellsResult.rows);
  } catch (error) {
    console.error('Error obteniendo hechizos:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
}

/**
 * Crear un nuevo hechizo
 */
async function createSpell(req, res) {
  try {
    const { profileId } = req.params;
    const {
      spell_name, spell_base, spell_inter, spell_advanced, spell_arcane,
      spell_base_mantain, spell_inter_mantain, spell_advanced_mantain,
      spell_arcane_mantain, spell_via
    } = req.body;

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
}

/**
 * Eliminar un hechizo
 */
async function deleteSpell(req, res) {
  try {
    const { profileId, spellId } = req.params;

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
}

// ===== READY TO CAST =====

/**
 * Obtener todos los hechizos ready to cast de un perfil
 */
async function getReadyToCast(req, res) {
  try {
    const { profileId } = req.params;

    const readyToCastResult = await pool.query(
      'SELECT * FROM ready_to_cast WHERE user_profile_id = $1 ORDER BY created_at',
      [profileId]
    );

    res.json(readyToCastResult.rows);
  } catch (error) {
    console.error('Error obteniendo ready to cast:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
}

/**
 * Crear un nuevo hechizo ready to cast
 */
async function createReadyToCast(req, res) {
  try {
    const { profileId } = req.params;
    const { spell_id, spell_name, spell_zeon, spell_mantain, spell_mantain_turn, spell_index } = req.body;

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
}

/**
 * Eliminar un hechizo ready to cast
 */
async function deleteReadyToCast(req, res) {
  try {
    const { profileId, readyToCastId } = req.params;

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
}

/**
 * Eliminar todos los ready to cast de un perfil
 */
async function deleteAllReadyToCast(req, res) {
  try {
    const { profileId } = req.params;

    await pool.query(
      'DELETE FROM ready_to_cast WHERE user_profile_id = $1',
      [profileId]
    );

    res.json({ message: 'Todos los ready to cast eliminados exitosamente' });
  } catch (error) {
    console.error('Error eliminando todos los ready to cast:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
}

// ===== SPELL MANTAIN =====

/**
 * Obtener todos los hechizos en mantenimiento de un perfil
 */
async function getSpellMantain(req, res) {
  try {
    const { profileId } = req.params;

    const spellMantainResult = await pool.query(
      'SELECT * FROM spell_mantain_list WHERE user_profile_id = $1 ORDER BY created_at',
      [profileId]
    );

    res.json(spellMantainResult.rows);
  } catch (error) {
    console.error('Error obteniendo spell mantain:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
}

/**
 * Crear un nuevo hechizo en mantenimiento
 */
async function createSpellMantain(req, res) {
  try {
    const { profileId } = req.params;
    const { spell_id, spell_name, spell_mantain, spell_index } = req.body;

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
}

/**
 * Eliminar un hechizo en mantenimiento
 */
async function deleteSpellMantain(req, res) {
  try {
    const { profileId, spellMantainId } = req.params;

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
}

/**
 * Eliminar todos los spell mantain de un perfil
 */
async function deleteAllSpellMantain(req, res) {
  try {
    const { profileId } = req.params;

    await pool.query(
      'DELETE FROM spell_mantain_list WHERE user_profile_id = $1',
      [profileId]
    );

    res.json({ message: 'Todos los spell mantain eliminados exitosamente' });
  } catch (error) {
    console.error('Error eliminando todos los spell mantain:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
}

module.exports = {
  getSpells,
  createSpell,
  deleteSpell,
  getReadyToCast,
  createReadyToCast,
  deleteReadyToCast,
  deleteAllReadyToCast,
  getSpellMantain,
  createSpellMantain,
  deleteSpellMantain,
  deleteAllSpellMantain
};
