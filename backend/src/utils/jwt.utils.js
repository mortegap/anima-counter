const jwt = require('jsonwebtoken');
const { JWT_SECRET, JWT_EXPIRES_IN } = require('../config/constants');

/**
 * Genera un token JWT para el usuario
 * @param {Object} user - Objeto de usuario con id y username
 * @returns {string} - Token JWT firmado
 */
function generateToken(user) {
  return jwt.sign(
    {
      id: user.id,
      username: user.username
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
}

/**
 * Verifica y decodifica un token JWT
 * @param {string} token - Token JWT a verificar
 * @returns {Promise<Object>} - Payload decodificado del token
 */
function verifyToken(token) {
  return new Promise((resolve, reject) => {
    jwt.verify(token, JWT_SECRET, (err, decoded) => {
      if (err) {
        reject(err);
      } else {
        resolve(decoded);
      }
    });
  });
}

module.exports = {
  generateToken,
  verifyToken
};
