const express = require('express');
const router = express.Router({ mergeParams: true });
const catchAsync = require('../utils/catchAsync');
const Post = require('../models/post');
const ExpressError = require('../utils/ExpressError');
const Comment = require('../models/comment')
const { isLoggedIn, isAuthor } = require('../middleware');

router.post('/', catchAsync(async (req, res) => {
    const post = await Post.findById(req.params.id);
    const comment = new Comment(req.body.comment)
    comment.author = req.user._id;
    post.comments.push(comment);
    await comment.save();
    await post.save();
    res.redirect(`/posts/${post._id}`);
}))

router.delete('/:commentId', async (req, res) => {
    const { id, commentId } = req.params;
    await Post.findByIdAndUpdate(id, { $pull: { comments: commentId } });
    Comment.findByIdAndDelete(commentId);
    res.redirect(`/posts/${id}`);
})
module.exports = router;