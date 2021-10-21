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
    res.redirect(`/campgrounds/${campground._id}`)
  })
)

router.get(
  "/:id",
  wrapAsync(async (req, res, next) => {
    const campground = await Campground.findById(req.params.id).populate(
      "reviews"
    )
    const reviews = campground.reviews
    res.render("campgrounds/show", { campground, reviews })
  })
)

router.get(
  "/:id/edit",
  wrapAsync(async (req, res) => {
    const campground = await Campground.findById(req.params.id)
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
    res.redirect(`/campgrounds/${campground._id}`)
  })
)

router.delete(
  "/:id",
  wrapAsync(async (req, res) => {
    const { id } = req.params
    await Campground.findByIdAndDelete(id)
    res.redirect("/campgrounds")
  })
)

module.exports = router
