var passport = require("passport")
var express = require("express")
var router = express.Router()

var Campground = require("../models/campground")
var Comment = require("../models/comment")
var User = require("../models/user")

// ===============================================================================

router.get('/', function(req, res) {
    res.render("landing")
})

// ===============================================================================

router.get('/register', (req, res) => {
    res.render('register')
})

router.post('/register', (req, res) => {
    User.register(new User({username: req.body.username}),
        req.body.password, (error, user) => {
            if (error) {
                req.flash("error", error.message)
                return res.render('register')
            }
            passport.authenticate("local")(req, res, () => {
                req.flash("success", "Welcome " + user.username + "!")
                res.redirect('/campgrounds')
            })
        })
})

// ===============================================================================

router.get('/login', (req, res) => {
    res.render('login')
})

router.post('/login', passport.authenticate("local",
    {
        successRedirect: "/campgrounds",
        failureRedirect: "/login"
    }), (req, res) => {})

// ===============================================================================

router.get('/logout', (req, res) => {
    req.logout();
    req.flash("success", "You have been logged out.")
    res.redirect('/campgrounds')
})

// ===============================================================================

module.exports = router
