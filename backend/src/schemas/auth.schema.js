const Joi = require('joi');

const registerSchema = Joi.object({
  username: Joi.string()
    .alphanum()
    .min(3)
    .max(30)
    .required()
    .messages({
      'string.alphanum': 'El nombre de usuario solo puede contener caracteres alfanuméricos',
      'string.min': 'El nombre de usuario debe tener al menos 3 caracteres',
      'string.max': 'El nombre de usuario no puede exceder 30 caracteres',
      'any.required': 'El nombre de usuario es requerido'
    }),
  password: Joi.string()
    .min(6)
    .required()
    .messages({
      'string.min': 'La contraseña debe tener al menos 6 caracteres',
      'any.required': 'La contraseña es requerida'
    }),
  email: Joi.string()
    .email()
    .optional()
    .messages({
      'string.email': 'El email debe ser válido'
    }),
  displayName: Joi.string()
    .max(100)
    .optional()
    .messages({
      'string.max': 'El nombre de visualización no puede exceder 100 caracteres'
    })
});

const loginSchema = Joi.object({
  username: Joi.string()
    .required()
    .messages({
      'any.required': 'El nombre de usuario es requerido'
    }),
  password: Joi.string()
    .required()
    .messages({
      'any.required': 'La contraseña es requerida'
    })
});

module.exports = {
  registerSchema,
  loginSchema
};
