const mongoose = require("mongoose");
mongoose.connect("mongodb://localhost:27017/userpostdemo",{
    useNewUrlParser:true,
    useUnifiedTopology:true
}).then(()=>{
    console.log("Db Connected");
}).catch((e)=>{
    console.log(e);
})