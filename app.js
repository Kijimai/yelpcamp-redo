const express = require("express")
const path = require("path")
const mongoose = require("mongoose")
const ejsMate = require("ejs-mate")
const methodOverride = require("method-override")
const Joi = require("joi")
const { campgroundSchema, reviewSchema } = require("./schemaValidator.js")
const morgan = require("morgan")
const Campground = require("./models/campground")
const Review = require("./models/review")
const AppError = require("./utils/AppError")
const wrapAsync = require("./utils/wrapAsync")

mongoose.connect("mongodb://localhost:27017/yelp-camp", {
  useNewUrlParser: true,
  useCreateIndex: true,
  useUnifiedTopology: true,
})

const db = mongoose.connection
db.on("error", console.error.bind(console, "connection error:"))
db.once("open", () => {
  console.log("Database connected")
})

const app = express()

app.engine("ejs", ejsMate)
app.set("view engine", "ejs")
app.set("views", path.join(__dirname, "views"))

app.use(express.urlencoded({ extended: true }))
app.use(methodOverride("_method"))
app.use(morgan(":method :url :status :res[content-length] - :response-time ms"))

const validateCampground = (req, res, next) => {
  const { error } = campgroundSchema.validate(req.body)
  if (error) {
    const errMsg = error.details.map((detail) => detail.message).join(",")
    throw new AppError(400, errMsg)
  } else {
    next()
  }
}

const validateReview = (req, res, next) => {
  const { error } = reviewSchema.validate(req.body)
  if (error) {
    const errMsg = error.details.map((detail) => detail.message).join(",")
    throw new AppError(400, errMsg)
  } else {
    next()
  }
}

app.use((req, res, next) => {
  console.log(req.method, req.path)
  next()
})

const verifyPassword = (req, res, next) => {
  const { password } = req.query
  if (password === "yes") {
    next()
  }
  res.status(401)
  throw new AppError(401, "Password required!")
}

app.get("/", (req, res) => {
  res.render("home")
})

app.get("/secret", verifyPassword, (req, res) => {
  res.send("My secret is I am a superhero")
})

app.get("/error", (req, res) => {
  doodoo.peepee()
})
//App Error messages are sent to the custom error handler and sent back to the error handling middleware for display
app.get("/admin", (req, res) => {
  throw new AppError(403, "You are not an admin!")
})

app.get(
  "/campgrounds",
  wrapAsync(async (req, res, next) => {
    const campgrounds = await Campground.find({})
    res.render("campgrounds/index", { campgrounds })
  })
)

app.get("/campgrounds/new", (req, res) => {
  res.render("campgrounds/new")
})

app.post(
  "/campgrounds",
  validateCampground,
  wrapAsync(async (req, res, next) => {
    const campground = new Campground(req.body.campground)
    await campground.save()
    res.redirect(`/campgrounds/${campground._id}`)
  })
)

app.get(
  "/campgrounds/:id",
  wrapAsync(async (req, res, next) => {
    const campground = await Campground.findById(req.params.id).populate(
      "reviews"
    )
    const reviews = campground.reviews
    res.render("campgrounds/show", { campground, reviews })
  })
)

app.put(
  "/campgrounds/:id",
  validateCampground,
  wrapAsync(async (req, res) => {
    const { id } = req.params
    const campground = await Campground.findByIdAndUpdate(id, {
      ...req.body.campground,
    })
    res.redirect(`/campgrounds/${campground._id}`)
  })
)

app.get(
  "/campgrounds/:id/edit",
  wrapAsync(async (req, res) => {
    const campground = await Campground.findById(req.params.id)
    res.render("campgrounds/edit", { campground })
  })
)

app.delete(
  "/campgrounds/:id",
  wrapAsync(async (req, res) => {
    const { id } = req.params
    await Campground.findByIdAndDelete(id)
    res.redirect("/campgrounds")
  })
)

app.post(
  "/campgrounds/:id/reviews",
  validateReview,
  wrapAsync(async (req, res) => {
    const { id } = req.params
    const campground = await Campground.findById(id)
    const review = new Review(req.body.review)
    campground.reviews.push(review)
    await review.save()
    await campground.save()
    console.log(campground)
    res.redirect(`/campgrounds/${campground._id}`)
  })
)

app.delete(
  "/campgrounds/:id/reviews/:reviewId",
  wrapAsync(async (req, res) => {
    const { id, reviewId } = req.params
    await Campground.findByIdAndUpdate(id, {
      $pull: { reviews: reviewId },
    })
    const review = await Review.findByIdAndDelete(reviewId)
    res.redirect(`/campgrounds/${id}`)
  })
)

const handleValidationErr = (err) => {
  console.log(err)
  return new AppError(400, "Validation failed...")
}

//Error Handler
app.use((err, req, res, next) => {
  console.log(err.name)
  if (err.name === "ValidationError") err = handleValidationErr(err)
  next(err)
})

app.all("*", (req, res, next) => {
  next(new AppError(404, "Page Not Found!"))
})

//Catch-all error handler
app.use((err, req, res, next) => {
  const { statusCode = 500 } = err
  if (!err.message) err.message = "Something has gone terribly wrong! :("
  res.status(statusCode).render("error", { err })
})

app.listen(3000, () => {
  console.log("Serving on port 3000")
})
