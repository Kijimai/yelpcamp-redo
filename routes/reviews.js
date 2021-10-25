const express = require("express")
const router = express.Router({ mergeParams: true })
const wrapAsync = require("../utils/wrapAsync")
const Campground = require("../models/campground")
const Review = require("../models/review")

const { validateReview } = require("../middleware")

router.post(
  "/",
  validateReview,
  wrapAsync(async (req, res) => {
    const { id } = req.params
    const campground = await Campground.findById(id)
    const review = new Review(req.body.review)
    campground.reviews.push(review)
    await review.save()
    await campground.save()
    req.flash("success", "Review successfully posted!")
    res.redirect(`/campgrounds/${campground._id}`)
  })
)

router.delete(
  "/:reviewId",
  wrapAsync(async (req, res) => {
    const { id, reviewId } = req.params
    await Campground.findByIdAndUpdate(id, {
      $pull: { reviews: reviewId },
    })
    await Review.findByIdAndDelete(reviewId)
    req.flash("success", "The review has been removed successfully!")
    res.redirect(`/campgrounds/${id}`)
  })
)

module.exports = router
