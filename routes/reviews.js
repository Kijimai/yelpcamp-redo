const express = require("express")
const router = express.Router({ mergeParams: true })
const wrapAsync = require("../utils/wrapAsync")
const Campground = require("../models/campground")
const Review = require("../models/review")
const { validateReview, isLoggedIn, isReviewAuthor } = require("../middleware")
const reviewsController = require("../controllers/reviews")

router.post(
  "/",
  isLoggedIn,
  validateReview,
  wrapAsync(reviewsController.createNewReview)
)

router.delete(
  "/:reviewId",
  isLoggedIn,
  isReviewAuthor,
  wrapAsync(reviewsController.deleteReview)
)

module.exports = router
