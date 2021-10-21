const express = require("express")
const router = express.Router({ mergeParams: true })

const wrapAsync = require("../utils/wrapAsync")
const AppError = require("../utils/AppError")

const Campground = require("../models/campground")
const Review = require("../models/review")

const { reviewSchema } = require("../schemaValidator.js")

const validateReview = (req, res, next) => {
  const { error } = reviewSchema.validate(req.body)
  if (error) {
    const errMsg = error.details.map((detail) => detail.message).join(",")
    throw new AppError(400, errMsg)
  } else {
    next()
  }
}

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
    res.redirect(`/campgrounds/${id}`)
  })
)

module.exports = router
