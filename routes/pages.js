const express = require('express')
const router = express.Router()
const Post = require('../models/Post')
const { 
    getAllPosts,
    getPost,
} = require('../controllers/post')

router.get("/", getAllPosts)

router.get("/search", async (req, res) => {
    let regex = new RegExp(req.query.q, "i")
    
    let posts = await Post.find({ company: regex }).populate('author', ['username'])
    
    if(posts.length == 0) {
        let extras = await Post.find({ title: regex }).populate('author', ['username'])
        posts = posts.concat(extras)
    }

    res.render('search', { posts })
})

router.get("/post/:postId", getPost)

router.get("/post/update/:postId", async (req, res) => {
    if(req.session.user && req.cookies.user_sid) {
        let uPost = await Post.findById(req.params.postId).populate('author', ['username'])
        if(uPost.author.username == req.session.user.username) {
            res.render('updatePost', { uPost })
        } else {
            res.redirect('/')
        }
    } else {
        res.redirect('/login')
    }
})

router.get("/login", (req, res) => {
    if(req.session.user && req.cookies.user_sid) {
        res.redirect('/dashboard')
    } else {
        res.render('login')
    }
})

router.get("/register", (req, res) => {
    if(req.session.user && req.cookies.user_sid) {
        res.redirect('/dashboard')
    } else {
        res.render('register')
    }
})

router.get("/dashboard", (req, res) => {
    if(req.session.user && req.cookies.user_sid) {
        res.render('dashboard')
    } else {
        res.redirect('/login')
    }
})

module.exports = router