const mongoose = require("mongoose");
const commentschema = new mongoose.Schema({
    postIDFK:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'tbpost'
    },
    userIDFK:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'tbuser'
    },
    comment:{
        type:String
    },
    isDeleted:{
        type:Boolean
    },
    deletedBy:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"tbuser"
    },
    deletedAt:{
        type:Date
    }
},{timestamps:true})

const commentmodel = new mongoose.model('tbcomment',commentschema);
module.exports = commentmodel;