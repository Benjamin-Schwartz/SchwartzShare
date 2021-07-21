if (process.env.NODE_ENV !== "production") {
    require('dotenv').config();
}


const express = require('express');
const session = require('express-session');
const path = require('path');
const mongoose = require('mongoose');
const Post = require('./models/post');
const ejsMate = require('ejs-mate')
const methodOverride = require('method-override');
const Comment = require('./models/comment')
const catchAsync = require('./utils/catchAsync');
const ExpressError = require('./utils/ExpressError');
const passport = require('passport');
const User = require('./models/user')
const LocalStrategy = require('passport-local');
const flash = require('connect-flash');

const mongoSanitize = require('express-mongo-sanitize');

//const session = require('express-session');
const MongoStore = require('connect-mongo')

const postRoutes = require('./routes/posts')
const commentRoutes = require('./routes/comments');
const userRoutes = require('./routes/users');
const dbUrl = process.env.DB_URL || 'mongodb://localhost:27017/schwartz-share';

//'mongodb://localhost:27017/schwartz-share'
mongoose.connect(dbUrl, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
    useFindAndModify: false

});


const secret = process.env.SECRET || 'thisisasecret';
console.log(secret);
const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected");
})


const sessionConfig = {

    name: 'session',
    secret,
    store: MongoStore.create({ mongoUrl: dbUrl }),
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true, //Helps with security
        secure: true,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,//one week from today.
        maxAge: Date.now() + 1000 * 60 * 60 * 24 * 7
    }

}


const app = express();

app.engine('ejs', ejsMate)
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'))

app.use(express.urlencoded({ extended: true }))//Parses req.body
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public')))//Tells express to use our static directory
app.use(session(sessionConfig))

app.use(mongoSanitize());
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
app.use(flash());
app.use((req, res, next) => {
    res.locals.currentUser = req.user;
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
})

app.use('/', userRoutes);
app.use('/posts', postRoutes);
app.use('/posts/:id/comment', commentRoutes);
app.get('/', (req, res) => {
    res.render('home');
})
const port = process.env.PORT || 3000;
//const port = process.env.PORT;

app.listen(port, () => {
    console.log(`Listening on port ${port}`)
})