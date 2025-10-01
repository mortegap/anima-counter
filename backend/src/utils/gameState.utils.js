const { pool } = require('../config/database');

/**
 * Resetea los valores de combate para todos los perfiles de un usuario
 * Mantiene los valores de características persistentes
 *
 * @param {string} userId - ID del usuario
 */
async function resetCombatStateForUser(userId) {
  try {
    // Obtener todos los perfiles del usuario
    const profilesResult = await pool.query(
      'SELECT id FROM user_profiles WHERE user_id = $1',
      [userId]
    );

    const profiles = profilesResult.rows;

    for (const profile of profiles) {
      // Resetear game_state (mantiene rzeon, zeon, rzeoni, act, lock_state)
      await pool.query(`
        UPDATE game_state
        SET
          turn_number = 0,
          zeona = 0,
          zeonp = 0,
          zeon_to_spend = 0,
          mantain_zeon_to_spend = 0,
          updated_at = CURRENT_TIMESTAMP
        WHERE user_profile_id = $1
      `, [profile.id]);

      // Limpiar hechizos listos para lanzar
      const readyToCastResult = await pool.query(
        'DELETE FROM ready_to_cast WHERE user_profile_id = $1',
        [profile.id]
      );

      // Limpiar hechizos en mantenimiento
      const spellMantainResult = await pool.query(
        'DELETE FROM spell_mantain_list WHERE user_profile_id = $1',
        [profile.id]
      );

      console.log(`  - Perfil ${profile.id}: ${readyToCastResult.rowCount} ready_to_cast, ${spellMantainResult.rowCount} spell_mantain eliminados`);
    }

    console.log(`✓ Estado de combate reseteado para usuario ${userId} (${profiles.length} perfiles)`);
    return true;
  } catch (error) {
    console.error('Error reseteando estado de combate:', error);
    throw error;
  }
}

/**
 * Resetea el estado de combate para un perfil específico
 *
 * @param {string} profileId - ID del perfil
 */
async function resetCombatStateForProfile(profileId) {
  try {
    // Resetear game_state (mantiene rzeon, zeon, rzeoni, act, lock_state)
    await pool.query(`
      UPDATE game_state
      SET
        turn_number = 0,
        zeona = 0,
        zeonp = 0,
        zeon_to_spend = 0,
        mantain_zeon_to_spend = 0,
        updated_at = CURRENT_TIMESTAMP
      WHERE user_profile_id = $1
    `, [profileId]);

    // Limpiar hechizos listos para lanzar
    const readyToCastResult = await pool.query(
      'DELETE FROM ready_to_cast WHERE user_profile_id = $1',
      [profileId]
    );

    // Limpiar hechizos en mantenimiento
    const spellMantainResult = await pool.query(
      'DELETE FROM spell_mantain_list WHERE user_profile_id = $1',
      [profileId]
    );

    console.log(`✓ Estado de combate reseteado para perfil ${profileId}: ${readyToCastResult.rowCount} ready_to_cast, ${spellMantainResult.rowCount} spell_mantain eliminados`);
    return true;
  } catch (error) {
    console.error('Error reseteando estado de combate del perfil:', error);
    throw error;
  }
}

module.exports = {
  resetCombatStateForUser,
  resetCombatStateForProfile
};
