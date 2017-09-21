var express = require("express")
var router = express.Router()

var Campground = require("../models/campground")
var Comment = require("../models/comment")

var middleware = require("../middleware")

// ===============================================================================

// INDEX
router.get('/', function(req, res) {
    // Get all campgrounds from db
    Campground.find({}, function(error, campgrounds) {
        if (error) {
            req.flash("error", error.message)
        } else {
            // Render all campgrounds
            res.render('campgrounds/index', {campgrounds: campgrounds})
        }
    })
})

// CREATE
router.post('/', middleware.isLoggedIn, function(req, res) {
    var newCampground = {
        name: req.body.name,
        image: req.body.image,
        description: req.body.description,
        price: req.body.price,
        author: {
            id: req.user.id,
            username: req.user.username
        }
    }
    
    Campground.create(newCampground, function(error, campground){
        if (error) {
            req.flash("error", error.message)
        } else {
            req.flash("Campground created!")
        }
        res.redirect("/campgrounds/" + campground._id)
    })
})

// NEW
router.get('/new', middleware.isLoggedIn, function(req, res) {
    res.render('campgrounds/new')
})

// SHOW
router.get('/:id', function(req, res) {
    // find campground with provided ID
    Campground.findById(req.params.id).populate("comments").exec(function(error, campground) {
        if (error) {
            req.flash("error", error.message)
            res.redirect('back')
        } else {
            res.render("campgrounds/show", {campground: campground})
        }
    })
})

// EDIT
router.get('/:id/edit', middleware.checkCampgroundOwnership, (req, res) => {
    Campground.findById(req.params.id, (error, campground) => {
        if (error) {
            req.flash("error", error.message)
            res.redirect('back')
        }
        res.render('campgrounds/edit', {campground: campground})
    })
})

// UPDATE
router.put('/:id', middleware.checkCampgroundOwnership, (req, res) => {
    Campground.findByIdAndUpdate(req.params.id, req.body.campground, (error, campground) => {
        if (error) {
            req.flash("error", error.message)
            res.redirect('back')
        } else {
            req.flash("success", "Campground updated")
            res.redirect('/campgrounds/' + campground._id)
        }
    })
})

// DESTROY
router.delete('/:id', middleware.checkCampgroundOwnership, (req, res) => {
    Campground.findByIdAndRemove(req.params.id, (error) => {
        if (error) {
            req.flash("error", error.message)
        } else {
            req.flash("success", "Campground deleted")
        }
        res.redirect('/campgrounds')
    })
})

// ===============================================================================

module.exports = router
