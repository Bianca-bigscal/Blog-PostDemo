const Roles = require("../models/rolemodel");
const Users = require("../models/usermodel");
const { userRoles } = require("../models/enumUser");


async function isAdmin(user) {
    try {

        const roles = await Roles.find({$or:[{rolename:userRoles.ADMIN}, {rolename:userRoles.SUPERADMIN}]})
        console.log("role",roles)
        if(!roles){
            throw new Error('not find role')
        }else{
            let flag= false;
            await roles.forEach((roles) => {
                if (String(user) == String(roles._id)) {
                    flag = true;
                }
            })
            return flag;
        }
    } catch (error) {
        console.log("e", error);
    }
}

module.exports = { isAdmin }