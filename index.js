const express = require('express')
const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const app = express()
const User = require('./models/user')
const session = require('express-session')
const ejsMate = require('ejs-mate')
const passport = require('passport')
const LocalStrategy = require('passport-local')
const flash = require('connect-flash')

mongoose.connect('mongodb://localhost:27017/nodeWorks', {
    useNewUrlParser: true,
    useUnifiedTypology: true
})
    .then(() => {
    console.log('connected')
})
.catch(err => {
    console.log('Oh no not connected');
    console.log(err)
})
const sessionConfig = {
    secret: 'this and that',
    resave: false,
    saveUninitialized: true,
    cookie: {
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7,
        httpOnly: true
    }
}

app.set('view engine', 'ejs')
app.set('views', 'views')
app.set('views', __dirname + '/views');

app.use(express.urlencoded({ extended: true }));
app.use(session(sessionConfig))
app.use(express.static('public'))
app.use(passport.initialize())
app.use(passport.session())
app.use(flash())

passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser())
passport.deserializeUser(User.deserializeUser())


app.engine('ejs', ejsMate)

app.use((req, res, next) => {
    res.locals.currentUser = req.user;
    res.locals.success = req.flash('success')
    res.locals.error = req.flash('error')
    next();
})
     

app.get('/', (req, res) => {
    res.render('home')
})

app.get('/register', (req, res) => {
    res.render('register')
})

app.post('/register', async (req, res) => {
    try {
        const { email, username, password } = req.body;
        const user = new User({ email, username });
        const registeredUser = await User.register(user, password)
        req.flash('success', 'Successfully Registered')
        return res.redirect('/secret')
    } catch (e) {
        req.flash('error', e.message)
        res.redirect('/register')
    }
})

app.get('/login', (req, res) => {
    res.render('login')
})

app.post('/login', passport.authenticate('local',
    {
        failureFlash: false,
        failureRedirect: '/login'
    }), (req, res) => {
    req.flash('success', 'You Just successfully logged into your page')
    res.redirect('/secret')
}) 

app.get('/logout', (req, res) => {
    req.logout();
    req.flash('success', 'logged you out')
    res.redirect('/login')
})

app.get('/secret', (req, res) => {
    if (!req.isAuthenticated()) {
        req.flash('error', 'you must be logged in')
        return res.redirect('/login')
    }
    res.render('secret')
})


app.listen(3000, () => {
    console.log('connected to server')
})









