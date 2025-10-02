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
        VALUES ($1, 0, 0, 0, 0, 0, 0, 0, false, 0, 0, 0)
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

    // UPDATE parcial usando COALESCE para mantener valores existentes si no se envían
    const updateResult = await pool.query(`
      UPDATE game_state
      SET
        turn_number = COALESCE($1, turn_number),
        zeon = COALESCE($2, zeon),
        rzeon = COALESCE($3, rzeon),
        zeona = COALESCE($4, zeona),
        act = COALESCE($5, act),
        rzeoni = COALESCE($6, rzeoni),
        zeonp = COALESCE($7, zeonp),
        acu = COALESCE($8, acu),
        lock_state = COALESCE($9, lock_state),
        zeon_to_spend = COALESCE($10, zeon_to_spend),
        mantain_zeon_to_spend = COALESCE($11, mantain_zeon_to_spend),
        updated_at = CURRENT_TIMESTAMP
      WHERE user_profile_id = $12
      RETURNING *
    `, [turn_number, zeon, rzeon, zeona, act, rzeoni, zeonp, acu, lock_state, zeon_to_spend, mantain_zeon_to_spend, profileId]);

    if (updateResult.rows.length === 0) {
      // Crear si no existe con valores por defecto
      const newGameState = await pool.query(`
        INSERT INTO game_state (user_profile_id, turn_number, zeon, rzeon, zeona, act, rzeoni, zeonp, acu, lock_state, zeon_to_spend, mantain_zeon_to_spend)
        VALUES ($1, COALESCE($2, 0), COALESCE($3, 0), COALESCE($4, 0), COALESCE($5, 0), COALESCE($6, 0), COALESCE($7, 0), COALESCE($8, 0), COALESCE($9, false), COALESCE($10, 0), COALESCE($11, 0), COALESCE($12, 0))
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
