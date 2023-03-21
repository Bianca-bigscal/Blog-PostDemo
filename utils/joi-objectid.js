const assert = require('assert');

module.exports =  function JoiObjectId(Joi,message){
    assert(Joi && Joi.object,'pass joi as an argument')
    if(message === undefined)
        message = 'valid id'
    return function objectId(){
        return Joi.string().regex(/^[0-9a-fA-F]{24}$/,message)
    }
}