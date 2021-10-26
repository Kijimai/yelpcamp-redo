const express = require("express")
const router = express.Router()
const wrapAsync = require("../utils/wrapAsync")
// const { campgroundSchema } = require("../schemaValidator.js") currently unused
const campgroundsController = require("../controllers/campgrounds")

const {
  isLoggedIn,
  validateCampground,
  isVerifiedAuthor,
} = require("../middleware")

//using router.route to shorten paths and group together same routes
router
  .route("/")
  .get(wrapAsync(campgroundsController.index))
  .post(
    isLoggedIn,
    validateCampground,
    wrapAsync(campgroundsController.createNewCampground)
  )

router.get("/new", isLoggedIn, campgroundsController.renderNewForm)

router
  .route("/:id")
  .get(wrapAsync(campgroundsController.showCampground))
  .put(
    isLoggedIn,
    isVerifiedAuthor,
    validateCampground,
    wrapAsync(campgroundsController.editCampground)
  )
  .delete(
    isLoggedIn,
    isVerifiedAuthor,
    wrapAsync(campgroundsController.deleteCampground)
  )

router.get(
  "/:id/edit",
  isLoggedIn,
  isVerifiedAuthor,
  wrapAsync(campgroundsController.renderEditForm)
)

module.exports = router
