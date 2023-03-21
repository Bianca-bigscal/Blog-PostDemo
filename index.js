require("./db/conn");
require('dotenv').config()
const express = require("express");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const bcrypt = require('bcrypt');
const user = require("./models/usermodel");
const Post = require("./models/postmodel");
const Roles = require("./models/rolemodel");
const jwt = require('jsonwebtoken');
const passport = require("passport");
const postroute = require("./router/post");
const adminroute = require("./router/admin");
const { validate, ValidationError } = require('express-validation');
const { userRegisterSchema, userLoginSchema, userUpdateSchema } = require("./services/uservalidate");
const { userRoles } = require("./models/enumUser");
const { encrypt, decrypt } = require("./services/service");
const { initializePassport } = require("../userdemo/db/passport");
const { authorize } = require('./services/roleverifying');
const { status } = require("migrate-mongo");
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./swagger.json');

const app = express();
app.use(express.json());
app.set("view engine", "ejs");

app.set("static", "./views");
app.use(express.static("public"))

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser())

initializePassport(passport)

app.use(express.json())

app.use("/post", postroute)
app.use("/admin", adminroute)

var options={
    swaggerOptions:{
        validatorUrl:null
    }
}
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument,options));


app.get("/", async (req, res) => {
    let data = await Post.find({ isDeleted: false }).populate("userIDFK")
    //res.json(data)
    return res.render("displaypost.ejs", { data });
})

app.get("/insertadmin", async (req, res) => {
    let data = await Post.find({ isDeleted: false }).populate([
        {
            path: 'userIDFK',
            model: 'tbuser',
            populate: {
                path: 'roleIDFK',
                model: 'tbrole',
                select: 'rolename'
            }
        }
    ])

    // let data = await Post.find({ isDeleted: false }).populate("userIDFK").populate("userIDFK.roleIDFK")
    return res.render("displayadminpost.ejs", { data });
})

app.get("/insertuser", async (req, res) => {
    res.render("insertuser.ejs");
})
app.post("/insertuser", validate(userRegisterSchema), async (req, res) => {
    try {
        // const validate = await userRegisterSchema.validateAsync(req.body)
        let { fullname, username, email, password } = req.body
        const role = await Roles.findOne({ rolename: "user" })
        const U = new user();
        U.fullName = fullname;
        U.userName = username;
        U.email = email;
        U.roleIDFK = role._id;
        U.password = encrypt(password);//123456
        console.log(U);
        await U.save();
        res.redirect("/loginuser");
    } catch (e) {
        console.log("error", e);
    }
})

app.get("/loginuser", async (req, res) => {
    res.render("loginuser.ejs");
})

app.post("/loginuser", validate(userLoginSchema), async (req, res) => {
    try {
        // let validate =await userLoginSchema.validateAsync(req.body);
        // console.log(validate); validate.password
        let { email, password } = req.body
        const usercheck = await user.findOne({ email: email }).populate('roleIDFK');

        if (!usercheck) {
            throw new Error('400-user not found')
        } else {
            if (password != decrypt(usercheck.password)) {
                console.log('400- password not  match')
            } else {
                const payload = {
                    id: usercheck._id,
                    fullName: usercheck.fullName,
                    email: usercheck.email,
                    route: (usercheck.roleIDFK.rolename == 'user') ? '/' : '/insertadmin'
                }
                console.log(payload);
                const token = jwt.sign(payload, process.env.TOKEN_SECRET)
                res.cookie('isLoggedIn', true);
                res.cookie('token', token);
                //res.json(token)
                res.redirect(payload.route)
            }
        }
    } catch (error) {
        console.log("e", error);
    }
})

app.get("/profile", passport.authenticate('jwt', { session: false }), authorize([userRoles.USER]), async (req, res) => {
    let id = req.user._id;
    let data = await user.findOne({ _id: id });
    return res.render('profile.ejs', { data })
})

app.post("/updateuser/:id", passport.authenticate('jwt', { session: false }), validate(userUpdateSchema), async (req, res) => {
    try {
        let id = req.user._id;
        let { fullname, username, email } = req.body;
        let profileupdate = await user.updateOne({ _id: id }, {
            $set: {
                fullName: fullname,
                userName: username,
                email: email,
            }
        });
        res.json(profileupdate);
        // if (!profileupdate) {
        //     throw new Error('error while updating')
        // } else {
        //     return res.redirect("/")
        // }
    } catch (error) {
        console.log(error);
    }
})

app.get("/mypost/:id", passport.authenticate('jwt', { session: false }), authorize(), async (req, res) => {
    let id = req.user._id;
    let data = await Post.find({ userIDFK: id, isDeleted: false }).populate("userIDFK")
    //res.json(data)
    return res.render("mypost.ejs", { data });
})

app.get("/logout", passport.authenticate('jwt', { session: false }), logoutUser)
async function logoutUser(req, res) {
    res.clearCookie('token');
    res.clearCookie('isLoggedIn');
    res.redirect("/loginuser")
}

app.use((err, req, res, next) => {
    if (err instanceof ValidationError) {
        return res.status(err.statusCode).json(err.details.body);
    }
    return res.status(500).json(err)
})

app.listen(3000, () => {
    console.log("app running on port 3000");
})