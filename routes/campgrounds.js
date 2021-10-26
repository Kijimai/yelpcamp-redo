const express = require("express")
const router = express.Router()
const wrapAsync = require("../utils/wrapAsync")
// const { campgroundSchema } = require("../schemaValidator.js") currently unused
const Campground = require("../models/campground")
const campgroundsController = require("../controllers/campgrounds")

const {
  isLoggedIn,
  validateCampground,
  isVerifiedAuthor,
} = require("../middleware")

router.get("/", wrapAsync(campgroundsController.index))

router.get("/new", isLoggedIn, campgroundsController.renderNewForm)

router.post(
  "/",
  isLoggedIn,
  validateCampground,
  wrapAsync(campgroundsController.createNewCampground)
)

router.get("/:id", wrapAsync(campgroundsController.showCampground))

router.get(
  "/:id/edit",
  isLoggedIn,
  isVerifiedAuthor,
  wrapAsync(campgroundsController.renderEditForm)
)

router.put(
  "/:id",
  isLoggedIn,
  isVerifiedAuthor,
  validateCampground,
  wrapAsync(campgroundsController.editCampground)
)

router.delete("/:id", isLoggedIn, isVerifiedAuthor, wrapAsync(campgroundsController.deleteCampground))

module.exports = router
