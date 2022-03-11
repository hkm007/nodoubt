const express = require('express')
const router = express.Router()

const {
    createPost,
    deletePost,
    updatePost,
    likePost,
    unlikePost
} = require('../controllers/post')

router.post("/post/new", createPost)
router.post("/post/update/:postId", updatePost)
router.post("/post/delete/:postId", deletePost)
router.post("/post/like/:postId", likePost)
router.post("/post/unlike/:postId", unlikePost)

module.exports = router