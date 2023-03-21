const Joi = require("joi");
const JoiObjectId = require('../utils/joi-objectid')(Joi)

exports.postRegisterSchema = {
    body: Joi.object({
        title: Joi.string().min(3).max(30).required(),
        description: Joi.string().max(50).required(),
    }).required()
}

exports.postupdateschema = {
    params: Joi.object({
        id: JoiObjectId(),
    }),
    body: Joi.object({
        title: Joi.string().min(3).max(30),
        description: Joi.string().max(50),
    }).required().not({})
}

exports.postdeleteschema ={
    params:Joi.object({
        id:JoiObjectId().required()
    })
}

exports.postshowschema={
    params:Joi.object({
        id:JoiObjectId().required()
    })
}

// const postRegisterSchema = Joi.object({
//     title : Joi.string().min(3).max(30).required(),
//     description : Joi.string().max(50).required(),
// })
//module.exports = postRegisterSchema