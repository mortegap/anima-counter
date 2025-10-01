const { pool } = require('../config/database');
const { resetCombatStateForProfile } = require('../utils/gameState.utils');

/**
 * Obtener el estado del juego de un perfil
 */
async function getGameState(req, res) {
  try {
    const { profileId } = req.params;

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

      return res.json(newGameState.rows[0]);
    }

    res.json(gameStateResult.rows[0]);
  } catch (error) {
    console.error('Error obteniendo estado del juego:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
}

/**
 * Actualizar el estado del juego
 */
async function updateGameState(req, res) {
  try {
    const { profileId } = req.params;
    const {
      turn_number, zeon, rzeon, zeona, act, rzeoni, zeonp, acu, lock_state,
      zeon_to_spend, mantain_zeon_to_spend
    } = req.body;

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

      return res.json(newGameState.rows[0]);
    }

    res.json(updateResult.rows[0]);
  } catch (error) {
    console.error('Error actualizando estado del juego:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
}

/**
 * Resetear el estado de combate (mantiene características persistentes)
 * Resetea: turno, zeon actual, zeona, zeonp, hechizos listos y mantenidos
 * Mantiene: rzeon, act, rzeoni, lock_state, lista de hechizos
 */
async function resetGameState(req, res) {
  try {
    const { profileId } = req.params;

    // Usar la función helper que resetea solo valores de combate
    await resetCombatStateForProfile(profileId);

    // Obtener el estado actualizado
    const gameStateResult = await pool.query(
      'SELECT * FROM game_state WHERE user_profile_id = $1',
      [profileId]
    );

    if (gameStateResult.rows.length === 0) {
      return res.status(404).json({ error: 'Estado del juego no encontrado' });
    }

    res.json({
      message: 'Estado de combate reseteado exitosamente',
      gameState: gameStateResult.rows[0]
    });
  } catch (error) {
    console.error('Error reseteando estado del juego:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
}

module.exports = {
  getGameState,
  updateGameState,
  resetGameState
};
