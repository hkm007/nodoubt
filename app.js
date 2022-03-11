const express = require('express')
const app = express()
const mongoose  = require('mongoose')
const { MONGOURI, SESSION_SECRET } = require('./config/keys')
const bodyParser = require('body-parser')
const cookie = require('cookie-parser')
const session = require('express-session')
const MongoStore = require('connect-mongo')
const cookieParser = require('cookie-parser')
const flash = require('connect-flash')
const PORT = process.env.PORT || 5000

// database connection
mongoose.connect(MONGOURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true
});

mongoose.connection.on('connected', () => {
    console.log("MongoDB connected...")
});

mongoose.connection.on('error', (err) => {
    console.log("MongoDB connection error...", err)
})

app.use(express.static('public'))
app.use(express.urlencoded({extended: false}))
app.use(express.json())

// parser
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

// cookies
app.use(cookieParser())

// sessions
app.use(
    session({
        key: 'user_sid',
        secret: SESSION_SECRET,
        resave: false,
        saveUninitialized: false,
        store: MongoStore.create({ mongoUrl: MONGOURI }),
        cookie: {
            expires: 60000*60*24*2  // 2 days
        }
    })
)

// flash
app.use(flash())

app.use(function(req, res, next) {
    // Make all error and success messages available
    res.locals.errors = req.flash("errors")
    res.locals.success = req.flash("success")

    // Make current user id available in req object
    if(req.session.user) {
        req.visitorId = req.session.user._id
    } else {
        req.visitorId = 0
    }

    // Make User Session Data 
    res.locals.user = req.session.user
    res.locals.post = null
    res.locals.uPost = null
    next()
})

// views
app.set('views', 'views')
app.set('view engine', 'ejs')

// routes
app.use(require('./routes/pages'))
app.use(require('./routes/auth'))
app.use(require('./routes/post'))

app.listen(PORT, () => console.log(`Server running on port ${PORT}...`))