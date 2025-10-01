const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const { PORT, FRONTEND_URL, RATE_LIMIT_WINDOW_MS, RATE_LIMIT_MAX_REQUESTS, JSON_LIMIT, URL_ENCODED_LIMIT } = require('./config/constants');
const { pool, checkDatabaseHealth } = require('./config/database');
const { errorHandler, notFoundHandler } = require('./middleware/error.middleware');

// Importar rutas
const authRoutes = require('./routes/auth.routes');
const profilesRoutes = require('./routes/profiles.routes');
const gameStateRoutes = require('./routes/gameState.routes');
const spellsRoutes = require('./routes/spells.routes');
const readyToCastRoutes = require('./routes/readyToCast.routes');
const spellMantainRoutes = require('./routes/spellMantain.routes');

const app = express();

// Trust proxy settings for nginx reverse proxy
app.set('trust proxy', 1);

// Middlewares de seguridad
app.use(helmet());
app.use(compression());

// CORS
app.use(cors({
  origin: FRONTEND_URL,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: RATE_LIMIT_WINDOW_MS,
  max: RATE_LIMIT_MAX_REQUESTS
});
app.use(limiter);

// Middleware para parsing
app.use(express.json({ limit: JSON_LIMIT }));
app.use(express.urlencoded({ extended: true, limit: URL_ENCODED_LIMIT }));

// Logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Health check
app.get('/health', async (req, res) => {
  const dbHealthy = await checkDatabaseHealth();
  res.json({
    status: dbHealthy ? 'OK' : 'DEGRADED',
    database: dbHealthy ? 'connected' : 'disconnected',
    timestamp: new Date().toISOString()
  });
});

// Montar rutas
app.use('/api/auth', authRoutes);
app.use('/api/profiles', profilesRoutes);
app.use('/api/gamestate', gameStateRoutes);
app.use('/api/spells', spellsRoutes);
app.use('/api/ready-to-cast', readyToCastRoutes);
app.use('/api/spell-mantain', spellMantainRoutes);

// Manejo de rutas no encontradas (404)
app.use('*', notFoundHandler);

// Manejo de errores centralizado
app.use(errorHandler);

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
  console.log(`🚀 Servidor ejecutándose en puerto ${PORT}`);
  console.log(`📊 Health check disponible en: http://localhost:${PORT}/health`);
  console.log(`🔒 CORS habilitado para: ${FRONTEND_URL}`);
});
