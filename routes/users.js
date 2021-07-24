const express = require('express');
const router = express.Router();
const User = require('../models/user');
const passport = require('passport');
const { findById } = require('../models/user');

const multer = require('multer');
const { response } = require('express');
const { storage } = require('../cloudinary');
const upload = multer({ storage })



router.get('/register', (req, res) => {
    res.render('users/register');
})

router.post('/register', async (req, res, next) => {
    try {
        const { email, username, password } = req.body;
        const user = new User({ email, username });
        const registeredUser = await User.register(user, password)
        req.login(registeredUser, err => {
            if (err) return next(err)
        })
        res.redirect('/posts');
    } catch (e) {
        req.flash('error', e.message);
        res.redirect('register');
    }
})

router.get('/login', (req, res) => {
    res.render('users/login');
})

router.get('/profile/:id', async (req, res) => {
    const user = await User.findById(req.params.id);
    res.render('users/profile', { user });
})
router.get('/profile/:id/edit', async (req, res) => {
    const user = await User.findById(req.params.id);
    res.render('users/edit', { user });
})

router.put('/profile/:id', upload.single('image'), async (req, res) => {
    const user = await User.findByIdAndUpdate(req.params.id, { ...req.body.post });
    user.profileImage.url = req.file.path;
    user.profileImage.filename = req.file.filename;
    await user.save();
    res.redirect(`/profile/${user.id}`)

})

router.post('/login', passport.authenticate('local', { failureFlash: true, failureRedirect: '/login' }), (req, res) => {
    req.flash('success', 'welcome back!');
    const redirectUrl = req.session.returnTo || '/posts';
    delete req.session.returnTo;
    res.redirect(redirectUrl);

})



router.get('/logout', (req, res) => {
    req.logout();
    req.flash('success', "Logged Out!");
    res.redirect('/posts');
})

module.exports = router;