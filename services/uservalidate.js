const Joi = require("joi");
const JoiObjectId = require('../utils/joi-objectid')(Joi)

exports.userRegisterSchema={
    body:Joi.object({
        fullname : Joi.string().min(3).max(30).required(),
        username : Joi.string().max(50).required(),
        email:Joi.string().email().min(5).max(50).required(),
        password:Joi.string().pattern(/^[a-zA-Z0-9._!@#%^&*]{6,30}$/),
        confirmpassword:Joi.ref("password"),
    })
}

exports.userLoginSchema={
    body:Joi.object({
        email:Joi.string().email().min(5).max(50).required(),
        password:Joi.string().pattern(/^[a-zA-Z0-9._!@#%^&*]{6,30}$/)
    })
}

exports.userUpdateSchema={
    params: Joi.object({
        id: JoiObjectId(),
    }),
    body: Joi.object({
        fullname : Joi.string().min(3).max(30).required(),
        username : Joi.string().max(50).required(),
        email:Joi.string().email().min(5).max(50).required(),
    }).required().not({})
}