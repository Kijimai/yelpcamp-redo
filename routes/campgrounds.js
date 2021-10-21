const express = require("express")
const router = express.Router()
const wrapAsync = require("../utils/wrapAsync")
const { campgroundSchema } = require("../schemaValidator.js")
const Campground = require("../models/campground")
const AppError = require("../utils/AppError")

const validateCampground = (req, res, next) => {
  const { error } = campgroundSchema.validate(req.body)
  if (error) {
    const errMsg = error.details.map((detail) => detail.message).join(",")
    throw new AppError(400, errMsg)
  } else {
    next()
  }
}

router.get(
  "/",
  wrapAsync(async (req, res, next) => {
    const campgrounds = await Campground.find({})
    res.render("campgrounds/index", { campgrounds })
  })
)

router.get("/new", (req, res) => {
  res.render("campgrounds/new")
})

router.post(
  "/",
  validateCampground,
  wrapAsync(async (req, res, next) => {
    const campground = new Campground(req.body.campground)
    await campground.save()
    req.flash("success", "Successfully created a new campground!")
    res.redirect(`/campgrounds/${campground._id}`)
  })
)

router.get(
  "/:id",
  wrapAsync(async (req, res) => {
    const campground = await Campground.findById(req.params.id).populate(
      "reviews"
    )
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
  wrapAsync(async (req, res) => {
    const campground = await Campground.findById(req.params.id)
    if (!campground) {
      req.flash("error", `Could not find that campground!`)
      return res.redirect("/campgrounds")
    }
    res.render("campgrounds/edit", { campground })
  })
)

router.put(
  "/:id",
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
  wrapAsync(async (req, res) => {
    const { id } = req.params
    await Campground.findByIdAndDelete(id)
    req.flash("success", "The campground has been removed!")
    res.redirect("/campgrounds")
  })
)

module.exports = router
