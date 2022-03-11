const mongoose = require('mongoose')
const Post = require('../models/Post')

exports.getAllPosts = async (req, res) => {
    Post.find()
    .sort({publishedOn: -1})
    .populate('author', ['username'])
    .exec((err, data) => {
        if(!err) {
            res.render('home', {posts: data})
        } else {
            res.render('home', {posts: []})
        }
    })
}

exports.getPost = async (req, res) => {
    let postId = req.params.postId

    let post = await Post.findById(postId).populate('author', ['username'])

    if(post) {
        if(req.session.user && req.cookies.user_sid) {
            let isLiked = false
            post.likes.forEach(like => {
                if(like.user.toString() === req.session.user._id) {
                    isLiked = true
                }
            })

            post.isLiked = isLiked
        }

        res.render('post', { post })
    } else {
        req.flash("errors", "No such post exists!")
        res.redirect('/')
    }
}

exports.createPost = async (req, res) => {
    const { title, company, content, anonymous } = req.body

    if(content.length < 10) {
        let post = {
            title,
            company,
            content
        }
        
        return res.render('dashboard', {post, errors: ['Please add some content!']})
    }
    
    let isAnonymous = false
    if(anonymous == 'on') isAnonymous = true
    

    const post = new Post({
        title,
        company: company.toLowerCase(),
        content,
        author: req.session.user,
        isAnonymous
    });

    post.save()
    .then(savedPost => {
        req.flash('success', 'Posted successfully!')
        res.redirect(`/post/${savedPost._id}`)
    })
    .catch(err => {
        if(err.code && err.code === 11000) {
            res.render('dashboard', {post, errors: ['Post with same title already exists!']})
        } else {
            res.render('dashboard', {post, errors: ['Something went wrong!']})
        }
    })
}

exports.deletePost = (req, res) => {
    let postId = req.params.postId

    Post.deleteOne({ _id: postId })
    .then(post => {
        req.flash('success', 'Post deleted!')
        res.redirect('/')
    })
    .catch(err => {
        req.flash('errors', 'Something went wrong!')
        res.redirect('/')
    })
}

exports.updatePost = async (req, res) => {
    let postId = req.params.postId

    let uPostTemp = { 
        _id: postId,
        title: req.body.title,
        company: req.body.company,
        content: req.body.content
    }

    if(req.body.content.length < 10) {
        return res.render('updatePost', {uPost: uPostTemp, errors: ['Please add some content!']})
    }

    let uPost = await Post.findById(postId)
    uPost.title = req.body.title
    uPost.company = req.body.company
    uPost.content = req.body.content
    
    uPost.save()
    .then(updatedPost => {
        req.flash('success', 'Post updated!')
        res.redirect(`/post/${updatedPost._id}`)
    })
    .catch(err => {
        if(err.code && err.code === 11000) {
            res.render('updatePost', {uPost: uPostTemp, errors: ['Post with same title already exists!']})
        } else {
            res.render('updatePost', {uPost: uPostTemp, errors: ['Something went wrong!']})
        }
    })
}

exports.likePost = async (req, res) => {
    let post = await Post.findById(req.params.postId);
    
    // Check if the post has already been liked
    if(post.likes.some(like => like.user.toString() === req.session.user._id)) {
        return res.render('post')
    }

    post.likes.unshift({ user: req.session.user._id });

    await post.save();

    res.redirect(`/post/${post._id}`)
}

exports.unlikePost = async (req, res) => {
    let post = await Post.findById(req.params.postId);
    
    // Check if the post has not yet been liked
    if(!post.likes.some(like => like.user.toString() === req.session.user._id)) {
        return res.render('post')
    }

    // remove the like
    post.likes = post.likes.filter(
        ({ user }) => user.toString() !== req.session.user._id
    );

    await post.save();

    res.redirect(`/post/${post._id}`)
}