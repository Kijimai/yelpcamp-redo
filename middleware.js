const { campgroundSchema, reviewSchema } = require("./schemaValidator")
const AppError = require("./utils/AppError")
const Campground = require("./models/campground")
const Review = require("./models/review")

module.exports.isLoggedIn = (req, res, next) => {
  console.log(req.user)
  if (!req.isAuthenticated()) {
    //store the requested route to be redirected back to it after logging in
    req.session.returnTo = req.originalUrl
    req.flash("error", "You must be signed in!")
    return res.redirect("/login")
  }
  next()
}
module.exports.validateCampground = (req, res, next) => {
  const { error } = campgroundSchema.validate(req.body)
  if (error) {
    const errMsg = error.details.map((detail) => detail.message).join(",")
    throw new AppError(400, errMsg)
  } else {
    next()
  }
}

module.exports.isVerifiedAuthor = async (req, res, next) => {
  const { id } = req.params
  const campground = await Campground.findById(id)
  if (!campground.author.equals(req.user._id)) {
    req.flash("error", "You do not have permission to edit this campground.")
    return res.redirect(`/campgrounds/${id}`)
  }
  next()
}

module.exports.validateReview = (req, res, next) => {
  const { error } = reviewSchema.validate(req.body)
  if (error) {
    const errMsg = error.details.map((detail) => detail.message).join(",")
    throw new AppError(400, errMsg)
  } else {
    next()
  }
}

module.exports.isReviewAuthor = async (req, res, next) => {
  const { id, reviewId } = req.params
  const review = await Review.findById(reviewId)
  if (!review.author.equals(req.user._id)) {
    req.flash("error", "You do not have permission to edit this review.")
    return res.redirect(`/campgrounds/${id}`)
  }
  next()
}
