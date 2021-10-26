const express = require("express")
const router = express.Router()
const wrapAsync = require("../utils/wrapAsync")
const { campgroundSchema } = require("../schemaValidator.js")
const Campground = require("../models/campground")
const AppError = require("../utils/AppError")
const {
  isLoggedIn,
  validateCampground,
  isVerifiedAuthor,
} = require("../middleware")

router.get(
  "/",
  wrapAsync(async (req, res, next) => {
    const campgrounds = await Campground.find({})
    res.render("campgrounds/index", { campgrounds })
  })
)

router.get("/new", isLoggedIn, (req, res) => {
  res.render("campgrounds/new")
})

router.post(
  "/",
  isLoggedIn,
  validateCampground,
  wrapAsync(async (req, res, next) => {
    const campground = new Campground(req.body.campground)
    campground.author = req.user._id
    await campground.save()
    req.flash("success", "Successfully created a new campground!")
    res.redirect(`/campgrounds/${campground._id}`)
  })
)

router.get(
  "/:id",
  wrapAsync(async (req, res) => {
    const campground = await Campground.findById(req.params.id)
      .populate({
        path: "reviews",
        populate: {
          path: "author",
        },
      })
      .populate("author")
    console.log(campground)
    if (!campground) {
      req.flash("error", "Campground was not found!")
      return res.redirect("/campgrounds")
    }
    const reviews = campground.reviews
    res.render("campgrounds/show", { campground, reviews })
  })
)

router.get(
  "/:id/edit",
  isLoggedIn,
  isVerifiedAuthor,
  wrapAsync(async (req, res) => {
    const { id } = req.params
    const campground = await Campground.findById(id)
    if (!campground) {
      req.flash("error", `Could not find that campground!`)
      return res.redirect("/campgrounds")
    }
    res.render("campgrounds/edit", { campground })
  })
)

router.put(
  "/:id",
  isLoggedIn,
  isVerifiedAuthor,
  validateCampground,
  wrapAsync(async (req, res) => {
    const { id } = req.params
    const campground = await Campground.findByIdAndUpdate(id, {
      ...req.body.campground,
    })
    req.flash("success", "Update successful!")
    res.redirect(`/campgrounds/${campground._id}`)
  })
)

router.delete(
  "/:id",
  isLoggedIn,
  isVerifiedAuthor,
  wrapAsync(async (req, res) => {
    const { id } = req.params
    const campground = await Campground.findById(id)
    if (!campground.author.equals(req.user._id)) {
      req.flash("error", "You do not have permission to edit this campground.")
      return res.redirect(`/campgrounds/${id}`)
    }
    await Campground.findByIdAndDelete(id)
    req.flash("success", "The campground has been removed!")
    res.redirect("/campgrounds")
  })
)

module.exports = router
