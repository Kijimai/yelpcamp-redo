const express = require("express")
const router = express.Router()
const User = require("../models/user")
const wrapAsync = require("../utils/wrapAsync")
const passport = require("passport")
const usersController = require("../controllers/users")

router.get("/register", usersController.renderRegister)

router.post("/register", wrapAsync(usersController.registerUser))

router.get("/login", usersController.renderLogin)

router.post(
  "/login",
  passport.authenticate("local", {
    failureFlash: true,
    failureRedirect: "/login",
  }), usersController.loginUser
)

router.get("/logout", usersController.logoutUser)

module.exports = router
