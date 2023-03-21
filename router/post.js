const express = require("express");
const bodyParser = require("body-parser");
const Post = require("../models/postmodel");
const Comment = require("../models/commentmodel");
const { authorize } = require('../services/roleverifying');
const { userRoles } = require("../models/enumUser");
const { isAdmin } = require("../services/adminrole");
const { upload } = require('../services/multer');
const { initializePassport } = require("../db/passport");
const { validate } = require('express-validation');
const {postRegisterSchema,postupdateschema,postdeleteschema,postshowschema} = require('../services/postvalidate');
const {commentRegisterSchema} = require('../services/commentvalidate');
const passport = require("passport");


const router = express.Router();
router.use(express.json());

router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: true }));
initializePassport(passport)


router.get("/addpost", async (req, res) => {
    await res.render("insertpost.ejs");
})

router.post("/addpost", passport.authenticate('jwt', { session: false }),  upload.single('file'),validate(postRegisterSchema),async (req, res) => {
    try {
        const P = new Post();
        P.title = req.body.title;
        P.content = req.body.description;
        P.image = req.file.filename;
        P.userIDFK = req.user._id
        await P.save()
        res.json(P);
        //res.redirect("/");
    } catch (e) {
        console.log("error", e);
    }
})


router.get("/getsinglepost/:id", validate(postshowschema),async (req, res) => {
    const id = req.params.id;
    const p = await Post.findOne({ _id: id }).populate("userIDFK").populate('postcomment.userIDFK');
    //const commentfind = await Comment.find({ postIDFK: id }).populate("postIDFK").populate("userIDFK");
    res.render("singlepost.ejs", { data: p });
})



router.get("/update/:id", passport.authenticate('jwt', { session: false }), async (req, res) => {
    let id = req.params.id
    let data = await Post.findOne({ _id: id })
        res.render("mypostedit.ejs", { data })
})

router.post("/updatepost/:id", upload.single('file'), passport.authenticate('jwt', { session: false }), authorize(), validate(postupdateschema),async (req, res) => {
    try {
        let id = req.params.id; 
        let pid = await Post.findOne({ _id: id })
        if (!pid) {
            throw new Error("post-id not found")
        } else {
            var updatepost = {
                $set: {
                    title: req.body.title ?? pid.title,
                    content: req.body.description ?? pid.content,
                    image: req?.file?.filename ?? pid.image
                }
            }
            let p = await Post.updateOne({ _id: pid }, updatepost)
            console.log("update data",p);
            res.json(updatepost)
            // if (userRoles.USER) {
            //     return res.redirect("/");
            // } else {
            //     return res.redirect("/admin/display")
            // }
        }
    } catch (error) {
        console.log("error", error);
    }
})

router.get("/deletepost/:id", passport.authenticate('jwt', { session: false }), validate(postdeleteschema),async (req, res) => {
    let id = req.params.id;
    if (!id) {
        throw new Error("post-id not found")
    } else {
        let deleted = await Post.updateOne({ '_id': id }, {
            $set: {
                'isDeleted': true,
                'deletedBy': req.user._id,
                'deletedAt': Date.now()
            }
        })
        if (!deleted) {
            throw new Error("error while deleting")
        } else {
            if (userRoles.USER) {

                return res.redirect("/");
            } else {
                return res.redirect("/admin/display")
            }
        }
    }
})

//--------------------COMMENTMODEL---------------
// router.post("/addcomment/:id", passport.authenticate('jwt', { session: false }), async (req, res) => {
//     try {
//         const id = req.params.id;//For Postid
//         const C = new Comment();
//         C.userIDFK = req.user._id;
//         C.postIDFK = id;
//         C.comment = req.body.comment;
//         await C.save()
//         res.redirect(`/post/getsinglepost/${id}`)
//     } catch (error) {
//         console.log(error);
//     }
// })

//------------------POSTMODEL------------------
router.get("/addcomment", async (req, res) => {
    await res.render("singlepost.ejs")
})

router.post("/addcomment/:id", passport.authenticate('jwt', { session: false }), validate(commentRegisterSchema),async (req, res) => {
    try {
        const id = req.params.id;//For Postid
        const post = await Post.findOne({ _id: id })
        if (!post) {
            throw new Error("can't find post")
        } else {
            const commentData = {
                comment: req.body.comment,
                userIDFK: req.user._id,
                isDeleted: false
            }
            const updatePost = await Post.updateOne({ _id: id }, {
                $push: {
                    'postcomment': commentData
                }
            })
            res.json(updatePost)
            // if (!updatePost) {
            //     throw new Error('error while updating')
            // } else {
            //     res.redirect(`/post/getsinglepost/${id}`)
            // }
        }
    } catch (error) {
        console.log(error);
    }
})

// router.get("/delete/:id", passport.authenticate('jwt', { session: false }), async (req, res) => {
//     const id = req.params.id;
//     console.log(">>>>>", id);
//     let ddata = await Comment.findOne({ _id: id });
//     if (!ddata) {
//         throw new Error("not found")
//     } else {
//         let deleted = await Comment.deleteOne({ _id: id })
//         if (!deleted) {
//             throw new Error("error occured")
//         } else {
//             res.redirect(`/post/getsinglepost/${id}`)
//         }
//     }
// })

router.get("/delete/:id", passport.authenticate('jwt', { session: false }), async (req, res) => {
    const commentid = req.params.id;//Comment id
    console.log(commentid);
    const post = await Post.findOne({ 'postcomment._id': commentid })

    if (!post) {
        throw new Error('400-not found post');
    } else {
        const postComment = await Post.findOne({ _id: post, "postcomment._id": commentid, isDeleted: false }).populate('postcomment.userIDFK');
        if (!postComment) {
            throw new Error('400-not found comment')
        } else {
            let update = false;
            // console.log(postComment);
            if (String(req.user._id) == String(postComment.userIDFK)) {
                console.log("if");
                update = true;
            } else if (await isAdmin(req.user.roleIDFK)) {
                update = true
            } else {
                console.log("else");
                let data = postComment.postcomment.filter((item) => {
                    if (String(req.user._id) == String(item.userIDFK._id) && String(commentid) == String(item._id))
                        return item;
                })

                if (data.length) {
                    update = true;
                }
                else {
                    update = false
                }

            }
            if (update) {
                const postid = await Post.updateOne({ "_id": post, 'postcomment._id': commentid }, {
                    $set: {
                        'postcomment.$.isDeleted': true,
                        'postcomment.$.deletedBy': req.user._id,
                        'postcomment.$.deletedAt': Date.now()
                    }
                });
                console.log("postid", postid);
                res.json(update)
                //res.redirect(`/post/getsinglepost/${post._id}`)
            }
        }
    }
})

module.exports = router