const Review = require("../models/review")
const Campground = require("../models/campground")

module.exports.createNewReview = async (req, res) => {
  const { id } = req.params
  const campground = await Campground.findById(id)
  const review = new Review(req.body.review)
  review.author = req.user._id
  campground.reviews.push(review)
  await review.save()
  await campground.save()
  req.flash("success", "Review successfully posted!")
  res.redirect(`/campgrounds/${campground._id}`)
}

module.exports.deleteReview = async (req, res) => {
  const { id, reviewId } = req.params
  await Campground.findByIdAndUpdate(id, {
    $pull: { reviews: reviewId },
  })
  await Review.findByIdAndDelete(reviewId)
  req.flash("success", "The review has been removed successfully!")
  res.redirect(`/campgrounds/${id}`)
}
