var express = require("express")
var bodyParser = require("body-parser")
var mongoose = require("mongoose")
var passport = require("passport")
var LocalStrategy = require("passport-local")
var methodOverride = require("method-override")
var flash = require("connect-flash")

var Campground = require("./models/campground")
var Comment = require("./models/comment")
var User = require("./models/user")


var indexRoutes = require("./routes/index")
var commentRoutes = require("./routes/comments")
var campgroundRoutes = require("./routes/campgrounds")


// Seed the database (REMOVE FOR PRODUCTION!)
// var seedDB = require("./seeds")
// seedDB()


var app = express()

/*
    Mongoose connect command, avoid deprecation warning:
    mongoose.connect("mongodb://localhost/yelp_camp", {useMongoClient: true})
 */
mongoose.Promise = global.Promise
mongoose.connect(process.env.YELP_MDB, {useMongoClient: true})

app.use(express.static(__dirname + "/public"))
app.use(bodyParser.urlencoded({extended: true}))
app.set("view engine", "ejs")
app.use(methodOverride("_method"))
app.use(flash())

// ===============================================================================
// passport config
// ===============================================================================

app.use(require("express-session")({
    secret: "AtticusIsAVeryItchyDogRightNow",
    resave: false,
    saveUninitialized: false
}))

app.use(passport.initialize())
app.use(passport.session())
passport.use(new LocalStrategy(User.authenticate()))
passport.serializeUser(User.serializeUser())
passport.deserializeUser(User.deserializeUser())

app.use((req, res, next) => {
    res.locals.currentUser = req.user
    res.locals.errorMessage = req.flash("error")
    res.locals.successMessage = req.flash("success")
    next()
})

// ===============================================================================

app.use(indexRoutes)
app.use('/campgrounds/:id/comments', commentRoutes)
app.use('/campgrounds', campgroundRoutes)

// ===============================================================================

app.listen(process.env.PORT, process.env.IP, function() {
    console.log("Server starting on port " + process.env.PORT)
})
