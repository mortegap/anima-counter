const crypto = require('crypto');

/**
 * Genera un hash seguro de la contraseña usando PBKDF2
 * @param {string} password - Contraseña en texto plano
 * @returns {string} - Salt y hash combinados separados por ':'
 */
function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
  return `${salt}:${hash}`;
}

/**
 * Verifica una contraseña contra un hash almacenado
 * @param {string} password - Contraseña en texto plano a verificar
 * @param {string} storedHash - Hash almacenado en formato 'salt:hash'
 * @returns {boolean} - true si la contraseña coincide, false si no
 */
function verifyPassword(password, storedHash) {
  const [salt, hash] = storedHash.split(':');
  const verifyHash = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
  return hash === verifyHash;
}

module.exports = {
  hashPassword,
  verifyPassword
};
