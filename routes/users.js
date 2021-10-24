const express = require("express")
const router = express.Router()
const User = require("../models/user")
const wrapAsync = require("../utils/wrapAsync")
const passport = require("passport")

router.get("/register", (req, res) => {
  res.render("users/register")
})

router.post(
  "/register",
  wrapAsync(async (req, res) => {
    try {
      const { username, email, password } = req.body
      const user = new User({ username, email })
      const registeredUser = await User.register(user, password)
      console.log(registeredUser)
      req.flash("success", "Welcome to Yelp Camp!")
      res.redirect("/campgrounds")
    } catch (err) {
      req.flash("error", err.message)
      res.redirect("/register")
    }
  })
)

router.get("/login", (req, res) => {
  res.render("users/login")
})

router.post(
  "/login",
  passport.authenticate("local", {
    failureFlash: true,
    failureRedirect: "/login",
  }),
  (req, res) => {
    req.flash("success", "Welcome back!")
    res.redirect("/campgrounds")
  }
)

router.get("/logout", (req, res) => {
  if (!req.isAuthenticated()) {
    req.flash("error", "You are already logged out.")
    return res.redirect("/campgrounds")
  }
  req.logout()
  req.flash("success", "You have successfully logged out.")
  res.redirect("/campgrounds")
})

module.exports = router
