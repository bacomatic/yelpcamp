var express = require("express")
var router = express.Router({mergeParams: true})

var Campground = require("../models/campground")
var Comment = require("../models/comment")

var middleware = require("../middleware")

// ===============================================================================

// NEW comment
router.get('/new', middleware.isLoggedIn, (req, res) => {
    Campground.findById(req.params.id, function(error, campground) {
        if (error) {
            req.flash("error", error.message)
            res.redirect('back')
        } else {
            res.render('comments/new', {campground: campground})
        }
    })
})

// CREATE comment
router.post('/', middleware.isLoggedIn, (req, res) => {
    Campground.findById(req.params.id, function(error, campground) {
        if (error) {
            req.flash("error", error.message)
            res.redirect('/campgrounds')
        } else {
            Comment.create(req.body.comment, function(error, comment) {
                if (error) {
                    req.flash("error", error.message)
                    res.redirect('/campgrounds')
                } else {
                    // Add username and id as author
                    comment.author.id = req.user._id
                    comment.author.username = req.user.username
                    comment.save()
                    
                    campground.comments.push(comment)
                    campground.save()
                    req.flash("success", "Comment added")
                    res.redirect('/campgrounds/'+campground._id)
                }
            })
        }
    })
})

router.get('/:commentId/edit', middleware.checkCommentOwnership, (req, res) => {
    Comment.findById(req.params.commentId, (error, comment) => {
        if (error) {
            req.flash("error", error.message)
            res.redirect("back")
        } else {
            res.render('comments/edit', {campgroundId: req.params.id, comment: comment})
        }
    })
})

router.put('/:commentId', middleware.checkCommentOwnership, (req, res) => {
    Comment.findByIdAndUpdate(req.params.commentId, req.body.comment, (error) => {
        if (error) {
            req.flash("error", error.message)
        } else {
            req.flash("success", "Comment updated")
        }
        res.redirect("/campgrounds/" + req.params.id)
    })
})

router.delete('/:commentId', middleware.checkCommentOwnership, (req, res) => {
    Comment.findByIdAndRemove(req.params.commentId, (error) => {
        if (error) {
            req.flash("error", error.message)
        } else {
            req.flash("success", "Comment removed")
        }
        res.redirect("/campgrounds/" + req.params.id)
    })
})

// ===============================================================================

module.exports = router
