const Joi = require('joi');

const createSpellSchema = Joi.object({
  spell_name: Joi.string()
    .min(1)
    .max(100)
    .required()
    .messages({
      'any.required': 'El nombre del hechizo es requerido'
    }),
  spell_base: Joi.number()
    .integer()
    .min(0)
    .required()
    .messages({
      'any.required': 'El valor base del hechizo es requerido'
    }),
  spell_inter: Joi.number()
    .integer()
    .min(0)
    .required()
    .messages({
      'any.required': 'El valor intermedio del hechizo es requerido'
    }),
  spell_advanced: Joi.number()
    .integer()
    .min(0)
    .required()
    .messages({
      'any.required': 'El valor avanzado del hechizo es requerido'
    }),
  spell_arcane: Joi.number()
    .integer()
    .min(0)
    .required()
    .messages({
      'any.required': 'El valor arcano del hechizo es requerido'
    }),
  spell_base_mantain: Joi.number()
    .integer()
    .min(0)
    .optional()
    .default(0),
  spell_inter_mantain: Joi.number()
    .integer()
    .min(0)
    .optional()
    .default(0),
  spell_advanced_mantain: Joi.number()
    .integer()
    .min(0)
    .optional()
    .default(0),
  spell_arcane_mantain: Joi.number()
    .integer()
    .min(0)
    .optional()
    .default(0),
  spell_via: Joi.string()
    .max(50)
    .optional()
    .allow('', null)
});

const createReadyToCastSchema = Joi.object({
  spell_id: Joi.number()
    .integer()
    .optional()
    .allow(null),
  spell_name: Joi.string()
    .min(1)
    .max(100)
    .required(),
  spell_zeon: Joi.number()
    .integer()
    .min(0)
    .required(),
  spell_mantain: Joi.number()
    .integer()
    .min(0)
    .optional()
    .default(0),
  spell_mantain_turn: Joi.boolean()
    .optional()
    .default(false),
  spell_index: Joi.number()
    .integer()
    .optional()
    .allow(null)
});

const createSpellMantainSchema = Joi.object({
  spell_id: Joi.number()
    .integer()
    .optional()
    .allow(null),
  spell_name: Joi.string()
    .min(1)
    .max(100)
    .required(),
  spell_mantain: Joi.number()
    .integer()
    .min(0)
    .required(),
  spell_index: Joi.number()
    .integer()
    .optional()
    .allow(null)
});

module.exports = {
  createSpellSchema,
  createReadyToCastSchema,
  createSpellMantainSchema
};
