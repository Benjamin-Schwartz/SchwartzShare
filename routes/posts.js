const express = require('express');
const router = express.Router();
const catchAsync = require('../utils/catchAsync');
const Post = require('../models/post');
const ExpressError = require('../utils/ExpressError');
const Comment = require('../models/comment')
const { isLoggedIn, isAuthor } = require('../middleware');

const multer = require('multer');
const { response } = require('express');
const { storage } = require('../cloudinary');
const upload = multer({ storage })



router.get('/newpost', isLoggedIn, (req, res) => {
    res.render('posts/new');
})

router.get('/', async (req, res) => {
    const posts = await Post.find({}).populate({
        path: 'comments',
        populate: {
            path: 'author',

        }
    }).populate('author');
    res.render('posts/index', { posts })
})


router.post('/', upload.array('image'), isLoggedIn, async (req, res) => {
    const post = new Post(req.body.post);
    post.images = req.files.map(f => ({ url: f.path, filename: f.filename }));
    post.author = req.user._id;
    await post.save();
    console.log(post);
    req.flash('success', 'successfully made a new post!');
    res.redirect(`/posts/${post._id}`);
})

router.get('/:id', isLoggedIn, catchAsync(async (req, res) => {
    const post = await Post.findById(req.params.id).populate({
        path: 'comments',
        populate: {
            path: 'author'
        }
    }).populate('author');
    res.render('posts/show', { post })
}))

router.get('/:id/edit', isLoggedIn, isAuthor, async (req, res) => {
    const post = await Post.findById(req.params.id)
    res.render('posts/edit', { post });
})


router.put('/:id', isLoggedIn, isAuthor, upload.array('image'), async (req, res) => {
    const { id } = req.params;
    const post = await Post.findByIdAndUpdate(id, { ...req.body.post })
    const imgs = req.files.map(f => ({ url: f.path, filename: f.filename }));
    post.images.push(...imgs);
    await post.save();
    req.flash('success', 'Succesfully updated new post!');
    res.redirect(`/posts/${post.id}`);
})

router.delete('/:id', isLoggedIn, isAuthor, async (req, res) => {
    const { id } = req.params;
    await Post.findByIdAndDelete(id);
    res.redirect('/posts')
})

module.exports = router;