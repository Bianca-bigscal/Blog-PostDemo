const mongoose = require("mongoose");

const commentschema = new mongoose.Schema({
    userIDFK:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'tbuser'
    },
    comment:{
        type:String
    },
    isDeleted:{
        type:Boolean,
        default:false
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

const postschema = new mongoose.Schema({
    title:{
        type:String
    },
    image:{
        type:String
    },
    content:{
        type:String
    },
    postcomment:[{
        type:commentschema,
        default:null
    }],
    userIDFK:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'tbuser'
    },
    isDeleted:{
        type:Boolean,
        default:false
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

const postmodel = new mongoose.model('tbpost',postschema);
module.exports = postmodel;