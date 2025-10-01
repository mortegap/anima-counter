/**
 * Middleware para manejo centralizado de errores
 */
function errorHandler(error, req, res, next) {
  console.error('Error no manejado:', {
    message: error.message,
    stack: error.stack,
    url: req.originalUrl,
    method: req.method,
    timestamp: new Date().toISOString()
  });

  // Error de validación
  if (error.name === 'ValidationError') {
    return res.status(400).json({
      error: 'Error de validación',
      details: error.details
    });
  }

  // Error de base de datos
  if (error.code && error.code.startsWith('23')) { // Códigos de PostgreSQL
    return res.status(409).json({
      error: 'Error de integridad de datos',
      message: 'Conflicto con restricciones de base de datos'
    });
  }

  // Error genérico
  res.status(error.status || 500).json({
    error: error.message || 'Error interno del servidor'
  });
}

/**
 * Middleware para rutas no encontradas (404)
 */
function notFoundHandler(req, res) {
  res.status(404).json({
    error: 'Ruta no encontrada',
    path: req.originalUrl,
    method: req.method
  });
}

module.exports = {
  errorHandler,
  notFoundHandler
};
