const Joi = require("joi");
const JoiObjectId = require('../utils/joi-objectid')(Joi)

exports.commentRegisterSchema = {
    params:Joi.object({
        id:JoiObjectId(),
    }),
    body: Joi.object({
        comment: Joi.string().min(3).max(30).required(),
    }).required().not({})
}

exports.commentdestroyschema = {
    params: Joi.object({
      id : JoiObjectId().required(),
    })
  };