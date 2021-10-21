const express = require("express")
const path = require("path")
const mongoose = require("mongoose")
const ejsMate = require("ejs-mate")
const methodOverride = require("method-override")
const morgan = require("morgan")
const AppError = require("./utils/AppError")
//Campground Routes
const campgroundsRouter = require("./routes/campgrounds")
const reviewsRouter = require("./routes/reviews")

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
// important to be placed just after the body parser and above the root route
app.use("/campgrounds", campgroundsRouter)
app.use("/campgrounds/:id/reviews", reviewsRouter)

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
