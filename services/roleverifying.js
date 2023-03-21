const Roles = require("../models/rolemodel");
function authorize(roles=[]){
    if(!roles.length){
     return (req,res,next)=>{
        next()
     }
    }else{
        return async(req,res,next)=>{

            const rolename =  await Roles.findOne({_id:req.user.roleIDFK},{rolename:1})
            if(roles.includes(rolename.rolename)){
                next()
            }else{ 
                res.sendStatus(401);
            }
        }
    }
}
module.exports={authorize}