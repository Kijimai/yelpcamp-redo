const express = require("express")
const router = express.Router()
const User = require("../models/user")
const wrapAsync = require("../utils/wrapAsync")
const passport = require("passport")
const usersController = require("../controllers/users")

router
  .route("/register")
  .get(usersController.renderRegister)
  .post(wrapAsync(usersController.registerUser))

router
  .route("/login")
  .get(usersController.renderLogin)
  .post(
    passport.authenticate("local", {
      failureFlash: true,
      failureRedirect: "/login",
    }),
    usersController.loginUser
  )

router.get("/logout", usersController.logoutUser)

module.exports = router
