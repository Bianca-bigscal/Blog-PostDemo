const express = require("express");
const bodyParser = require("body-parser");
const user = require("../models/usermodel");
const Post = require("../models/postmodel");
const Roles = require("../models/rolemodel");
const { upload } = require('../services/multer');
const passport = require("passport");
const { initializePassport } = require("../db/passport");
const { authorize } = require('../services/roleverifying');
const { userRoles } = require("../models/enumUser");
const { validate } = require('express-validation');
const { userUpdateSchema} = require("../services/uservalidate");
const {postRegisterSchema} = require('../services/postvalidate');

const router = express.Router();
router.use(express.json());

router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: true }));
initializePassport(passport);

router.get("/display", async (req, res) => {
    try {

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
        //let data = await Post.find({ isDeleted: false }).populate("userIDFK").populate("userIDFK.roleIDFK")
        return res.render("displayadminpost.ejs", { data });
    } catch (error) {
        console.log("e", error);
    }

})

router.get("/addpost", async (req, res) => {
    res.render("insertadminpost.ejs");
})

router.post("/addpost", passport.authenticate('jwt', { session: false }), upload.single('file'), validate(postRegisterSchema),async (req, res) => {
    try {
        const P = new Post();
        P.title = req.body.title;
        P.content = req.body.description;
        P.image = req.file.filename;
        P.userIDFK = req.user._id
        await P.save()
        console.log(P);
        res.redirect("display");
    } catch (e) {
        console.log("error", e);
    }
})

router.get("/profile", passport.authenticate('jwt', { session: false }), authorize([userRoles.SUPERADMIN, userRoles.ADMIN]), async (req, res) => {
    try {
        let id = req.user._id;
        let data = await user.findOne({ _id: id });
        return res.render('adminprofile.ejs', { data })
    } catch (error) {
        console.log("e", error);
    }
})

router.post("/updateuser/:id", passport.authenticate('jwt', { session: false }), validate(userUpdateSchema),async (req, res) => {
    try {
        let id = req.user._id;
        if (!id) {
            throw new Error('400-not found user')
        } else {

            let { fullname, username, email } = req.body;
            let profileupdate = await user.updateOne({ _id: id }, {
                $set: {
                    fullName: fullname,
                    userName: username,
                    email: email,
                }
            });
            if (!profileupdate) {
                throw new Error('error while updating')
            } else {
                return res.redirect("/admin/display")
            }
        }
    } catch (error) {
        console.log(error);
    }
})

router.get("/mypost/:id", passport.authenticate('jwt', { session: false }), authorize(), async (req, res) => {
    try {

        let id = req.user._id;
        let data = await Post.find({ userIDFK: id, isDeleted: false }).populate("userIDFK")
        return res.render("mypost.ejs", { data });
    } catch (error) {
        console.log("e", error);
    }
})

router.get("/alluser", passport.authenticate('jwt', { session: false }), authorize([userRoles.ADMIN, userRoles.SUPERADMIN]), async (req, res) => {
    try {

        let data = await user.find({ isDeleted: false }).populate("roleIDFK");
        //res.json(data)
        res.render("alluser.ejs", { data })
    } catch (error) {
        console.log("e", error);
    }
})

router.get("/makeadmin/:id", passport.authenticate('jwt', { session: false }), authorize([userRoles.SUPERADMIN]), async (req, res) => {
    try {

        let id = req.params.id;

        let userfind = await user.findOne({ _id: id }).populate("roleIDFK")
        let roleIDFK = await Roles.findOne({ rolename: userRoles.ADMIN })

        if (!userfind) {
            throw new Error('user not found')
        } else {
            let update = await user.updateOne({ _id: id }, {
                $set: {
                    "roleIDFK": roleIDFK._id
                }
            })
            if (!update) {
                throw new Error("error while updating")
            }
            else {
                res.redirect("/admin/alluser");
            }
        }
    } catch (error) {
        console.log("e", error);
    }
})

router.get("/removeadmin/:id", passport.authenticate('jwt', { session: false }), authorize([userRoles.SUPERADMIN]), async (req, res) => {
    try {

        let id = req.params.id;

        let userfind = await user.findOne({ _id: id }).populate("roleIDFK")
        let roleIDFK = await Roles.findOne({ rolename:userRoles.USER })

        if (!userfind) {
            throw new Error('user not found')
        } else {
            let update = await user.updateOne({ _id: id }, {
                $set: {
                    roleIDFK: roleIDFK._id
                }
            })

            if (!update) {
                throw new Error("error while updating")
            } else {
                res.redirect("/admin/alluser");
            }
        }
    } catch (error) {
        console.log("e", error);
    }
})

router.get("/removeuser/:id", passport.authenticate('jwt', { session: false }), authorize([userRoles.SUPERADMIN]), async (req, res) => {
    try {

        let id = req.params.id;

        let userfind = await user.findOne({ _id: id, isDeleted: false }).populate("roleIDFK")

        if (!userfind) {
            throw new Error('user not found')
        } else {
            let deleted = await user.updateOne({ _id: id, isDeleted: false }, {
                $set: {
                    'isDeleted': true,
                    'deletedBy': req.user._id,
                    'deletedAt': Date.now()
                }
            })

            if (!deleted) {
                throw new Error("error while updating")
            } else {
                console.log("else");
                res.redirect("/admin/alluser")
            }
        }
    } catch (error) {
        console.log("e", error);
    }
})

module.exports = router