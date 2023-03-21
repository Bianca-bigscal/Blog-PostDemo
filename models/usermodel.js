const mongoose = require("mongoose");
const userschema = new mongoose.Schema({
    fullName:{
        type:String,
    },
    userName:{
        type:String
    },
    email:{
        type:String
    },
    password:{
        type:String
    },
    roleIDFK:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"tbrole",
    },  
    isDeleted:{
        type:Boolean,
        default:0
    },
    deletedBy:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"tbuser"
    },
    deletedAt:{
        type:Date,
        default:null
    }
},{timestamps:true})

const usermodel = new mongoose.model('tbuser',userschema);
module.exports = usermodel;