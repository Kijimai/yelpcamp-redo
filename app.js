if (process.env.NODE_ENV !== "production") {
  require("dotenv").config()
}

const express = require("express")
const path = require("path")
const mongoose = require("mongoose")
const ejsMate = require("ejs-mate")
const methodOverride = require("method-override")
const morgan = require("morgan")
const session = require("express-session")
const flash = require("connect-flash")
const passport = require("passport")
const LocalStrategy = require("passport-local")
const User = require("./models/user")
const wrapAsync = require("./utils/wrapAsync")
//Custom Error middleware
const AppError = require("./utils/AppError")
//Campground Routes
const campgroundsRouter = require("./routes/campgrounds")
const reviewsRouter = require("./routes/reviews")
const usersRouter = require("./routes/users")
const mongoSanitize = require("express-mongo-sanitize")

mongoose.connect("mongodb://localhost:27017/yelp-camp", {
  useNewUrlParser: true,
  useCreateIndex: true,
  useUnifiedTopology: true,
  useFindAndModify: false,
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
// app.use(morgan(":method :url :status :res[content-length] - :response-time ms"))
app.use(express.static(path.join(__dirname, "public")))
app.use(mongoSanitize())

const sessionConfig = {
  //Temporary secret
  secret: "thisismysecret",
  resave: false,
  saveUninitialized: true,
  cookie: {
    //expires 1 week after generation
    expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
    maxAge: 1000 * 60 * 60 * 24 * 7,
    httpOnly: true,
  },
}

app.use(session(sessionConfig))
app.use(flash())

app.use(passport.initialize())

// Must be used for persistent login session and make sure app.session is used
// before passport.session()
app.use(passport.session())

// Passport will utilize the Local Strategy and authenticate the User model
// created inside the user model -- Each model should user Passport if they need authentication.
passport.use(new LocalStrategy(User.authenticate()))

//serialization: how to store a user in this session
passport.serializeUser(User.serializeUser())

//how to deserialize the user - for logging out
passport.deserializeUser(User.deserializeUser())

app.use((req, res, next) => {
  // console.log(req.method, req.path)
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

//place BEFORE all the route handlers
app.use((req, res, next) => {
  //store the flashed message to be accessible via the response's locals object
  // console.log(req.session)
  console.log(req.query)
  res.locals.currentUser = req.user
  res.locals.success = req.flash("success")
  res.locals.error = req.flash("error")
  next()
})

// important to be placed just after the body parser and above the root route
app.use("/campgrounds", campgroundsRouter)
app.use("/campgrounds/:id/reviews", reviewsRouter)
app.use("/", usersRouter)

// ===== THIS IS TEMPORARY =======
app.get(
  "/fakeUser",
  wrapAsync(async (req, res, next) => {
    const user = new User({ email: "Megaman@gmail.com", username: "Megaman" })
    //insert a user object, and then a password
    const newUser = await User.register(user, "123")
    res.send(newUser)
  })
)
// ================================

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
