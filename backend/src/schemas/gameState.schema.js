const Joi = require('joi');

const updateGameStateSchema = Joi.object({
  turn_number: Joi.number()
    .integer()
    .min(0)
    .required(),
  zeon: Joi.number()
    .integer()
    .min(0)
    .required(),
  rzeon: Joi.number()
    .integer()
    .min(0)
    .required(),
  zeona: Joi.number()
    .integer()
    .min(0)
    .required(),
  act: Joi.number()
    .integer()
    .min(0)
    .required(),
  rzeoni: Joi.number()
    .integer()
    .min(0)
    .required(),
  zeonp: Joi.number()
    .integer()
    .min(0)
    .required(),
  acu: Joi.boolean()
    .required(),
  lock_state: Joi.number()
    .integer()
    .min(0)
    .required(),
  zeon_to_spend: Joi.number()
    .integer()
    .min(0)
    .optional()
    .default(0),
  mantain_zeon_to_spend: Joi.number()
    .integer()
    .min(0)
    .optional()
    .default(0)
});

module.exports = {
  updateGameStateSchema
};
