const mongoose = require("mongoose");
const roleschema = new mongoose.Schema({
    rolename:{
        type:String,
    },
})

const rolemodel = new mongoose.model('tbrole',roleschema);
module.exports = rolemodel;