
var Comment = require("../models/comment")
var Campground = require("../models/campground")
var User = require("../models/user")

var middlewareObject = {}

middlewareObject.isLoggedIn = function(req, res, next) {
    if (req.isAuthenticated()) {
        return next()
    }
    req.flash("error", "You must be logged in to make changes")
    res.redirect('/login')
}

middlewareObject.checkCampgroundOwnership = function(req, res, next) {
    if (req.isAuthenticated()) {
        Campground.findById(req.params.id, (error, campground) => {
            if (error || !campground) {
                console.log(error)
                console.log("Campground id does not exist: " + req.params.id)
                req.flash("error", "Campground does not seem to exist")
                res.redirect('/campgrounds')
            } else if (campground.author && campground.author.id && campground.author.id.equals(req.user._id)) {
                return next()
            } else {
                req.flash("error", "The requested campground entry must belong to you to make changes")
                res.redirect("back")
            }
        })
    } else {
        req.flash("error", "You must be logged in to make changes")
        res.redirect("back")
    }
}

middlewareObject.checkCommentOwnership = function(req, res, next) {
    if (req.isAuthenticated()) {
        Comment.findById(req.params.commentId, (error, comment) => {
            if (comment.author.id && req.user && comment.author.id.equals(req.user._id)) {
                return next()
            } else {
                req.flash("error", "You may only edit your own comments")
                res.redirect("back")
            }
        })
    } else {
        req.flash("error", "You must be logged in to make changes")
        res.redirect("back")
    }
}

module.exports = middlewareObject
