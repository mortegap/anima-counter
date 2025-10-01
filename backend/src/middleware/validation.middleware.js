/**
 * Middleware genérico para validar el cuerpo de las peticiones con Joi schemas
 * @param {Object} schema - Schema de Joi para validar
 * @returns {Function} Middleware de Express
 */
function validateBody(schema) {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false, // Retorna todos los errores, no solo el primero
      stripUnknown: true // Elimina campos no definidos en el schema
    });

    if (error) {
      const errorMessages = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }));

      return res.status(400).json({
        error: 'Error de validación',
        details: errorMessages
      });
    }

    // Reemplazar req.body con los valores validados y sanitizados
    req.body = value;
    next();
  };
}

/**
 * Middleware para validar parámetros de ruta con Joi schemas
 * @param {Object} schema - Schema de Joi para validar
 * @returns {Function} Middleware de Express
 */
function validateParams(schema) {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.params, {
      abortEarly: false,
      stripUnknown: true
    });

    if (error) {
      const errorMessages = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }));

      return res.status(400).json({
        error: 'Error de validación de parámetros',
        details: errorMessages
      });
    }

    req.params = value;
    next();
  };
}

/**
 * Middleware para validar query strings con Joi schemas
 * @param {Object} schema - Schema de Joi para validar
 * @returns {Function} Middleware de Express
 */
function validateQuery(schema) {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.query, {
      abortEarly: false,
      stripUnknown: true
    });

    if (error) {
      const errorMessages = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }));

      return res.status(400).json({
        error: 'Error de validación de query',
        details: errorMessages
      });
    }

    req.query = value;
    next();
  };
}

module.exports = {
  validateBody,
  validateParams,
  validateQuery
};
