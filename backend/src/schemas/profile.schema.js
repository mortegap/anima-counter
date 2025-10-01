const Joi = require('joi');

const createProfileSchema = Joi.object({
  name: Joi.string()
    .min(1)
    .max(100)
    .required()
    .messages({
      'string.min': 'El nombre del perfil debe tener al menos 1 carácter',
      'string.max': 'El nombre del perfil no puede exceder 100 caracteres',
      'any.required': 'El nombre del perfil es requerido'
    })
});

const updateProfileSchema = Joi.object({
  name: Joi.string()
    .min(1)
    .max(100)
    .required()
    .messages({
      'string.min': 'El nombre del perfil debe tener al menos 1 carácter',
      'string.max': 'El nombre del perfil no puede exceder 100 caracteres',
      'any.required': 'El nombre del perfil es requerido'
    })
});

module.exports = {
  createProfileSchema,
  updateProfileSchema
};
