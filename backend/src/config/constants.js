require('dotenv').config();

module.exports = {
  PORT: process.env.PORT || 3000,
  JWT_SECRET: process.env.JWT_SECRET || 'your-secret-key-change-this-in-production',
  JWT_EXPIRES_IN: '24h',
  FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost',

  // Configuraciones de seguridad
  RATE_LIMIT_WINDOW_MS: 15 * 60 * 1000, // 15 minutos
  RATE_LIMIT_MAX_REQUESTS: 100,

  // Configuraciones de parsing
  JSON_LIMIT: '10mb',
  URL_ENCODED_LIMIT: '10mb',
};
